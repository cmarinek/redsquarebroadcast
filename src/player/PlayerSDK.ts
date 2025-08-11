import Hls from 'hls.js';
import dashjs from 'dashjs';
import { supabase } from '@/integrations/supabase/client';

export type PlayerMetrics = {
  bitrate_kbps?: number;
  bandwidth_kbps?: number;
  buffer_seconds?: number;
  dropped_frames?: number;
  rebuffer_count?: number;
  playback_state?: string;
  error_code?: string;
};

export type PlayerSDKOptions = {
  onMetrics?: (m: PlayerMetrics) => void;
};

export class PlayerSDK {
  private video: HTMLVideoElement;
  private hls: Hls | null = null;
  private dash: dashjs.MediaPlayerClass | null = null;
  private lastMetricsSentAt = 0;
  private rebufferCount = 0;
  private opts?: PlayerSDKOptions;

  constructor(video: HTMLVideoElement, opts?: PlayerSDKOptions) {
    this.video = video;
    this.opts = opts;
    this.bindEvents();
  }

  async load(url: string) {
    this.destroyEngines();

    if (url.endsWith('.m3u8')) {
      if (Hls.isSupported()) {
        this.hls = new Hls({
          enableWorker: true,
          backBufferLength: 90,
        });
        this.hls.on(Hls.Events.ERROR, (_, data) => {
          if (data?.fatal) this.sendMetrics({ error_code: data.type });
        });
        this.hls.on(Hls.Events.FRAG_BUFFERED, () => this.collectMetrics());
        this.hls.loadSource(url);
        this.hls.attachMedia(this.video);
      } else if (this.video.canPlayType('application/vnd.apple.mpegurl')) {
        this.video.src = url;
      }
    } else if (url.endsWith('.mpd')) {
      this.dash = dashjs.MediaPlayer().create();
      this.dash.initialize(this.video, url, true);
      (this.dash as any).updateSettings({
        streaming: { /* keep defaults, allow ABR */ }
      });
      this.dash.on(dashjs.MediaPlayer.events.ERROR, (e: any) => {
        this.sendMetrics({ error_code: e?.error?.toString?.() || 'dash_error' });
      });
      this.dash.on(dashjs.MediaPlayer.events.QUALITY_CHANGE_RENDERED, () => this.collectMetrics());
    } else {
      this.video.src = url;
      this.video.load();
    }
  }

  play() { this.video.play().catch(() => {}); }
  pause() { this.video.pause(); }

  destroy() {
    this.destroyEngines();
    this.unbindEvents();
  }

  private destroyEngines() {
    if (this.hls) { this.hls.destroy(); this.hls = null; }
    if (this.dash) { this.dash.reset(); this.dash = null; }
  }

  private bindEvents() {
    this.video.addEventListener('waiting', this.onRebuffer);
    this.video.addEventListener('timeupdate', this.onTime);
  }

  private unbindEvents() {
    this.video.removeEventListener('waiting', this.onRebuffer);
    this.video.removeEventListener('timeupdate', this.onTime);
  }

  private onRebuffer = () => {
    this.rebufferCount += 1;
    this.collectMetrics(true);
  }

  private onTime = () => {
    this.collectMetrics();
  }

  private collectMetrics(force = false) {
    const now = Date.now();
    if (!force && now - this.lastMetricsSentAt < 10000) return; // throttle 10s

    let bitrate_kbps: number | undefined;
    let bandwidth_kbps: number | undefined;
    let buffer_seconds: number | undefined;

    if (this.hls) {
      const l = this.hls.levels?.[this.hls.currentLevel];
      bitrate_kbps = l?.bitrate ? Math.round(l.bitrate / 1000) : undefined;
      const bw = (this.hls as any).bandwidthEstimate || (this.hls as any).abrController?.bwEstimator?.getEstimate?.();
      bandwidth_kbps = bw ? Math.round(bw / 1000) : undefined;
      buffer_seconds = this.video.buffered.length ? this.video.buffered.end(0) - this.video.currentTime : 0;
    } else if (this.dash) {
      const quality = (this.dash as any).getQualityFor?.('video') ?? 0;
      const bitrates = (this.dash as any).getBitrateInfoListFor?.('video') || [];
      const rep = bitrates[quality];
      bitrate_kbps = rep?.bitrate ? Math.round(rep.bitrate / 1000) : undefined;
      const metrics = (this.dash as any).getDashMetrics?.();
      const buf = metrics?.getCurrentBufferLevel?.('video');
      buffer_seconds = typeof buf === 'number' ? buf : undefined;
      bandwidth_kbps = undefined;
    } else {
      buffer_seconds = this.video.buffered.length ? this.video.buffered.end(0) - this.video.currentTime : 0;
    }

    const m: PlayerMetrics = {
      bitrate_kbps,
      bandwidth_kbps,
      buffer_seconds,
      dropped_frames: (this.video.getVideoPlaybackQuality as any)?.()?.droppedVideoFrames ?? undefined,
      rebuffer_count: this.rebufferCount,
      playback_state: this.video.paused ? 'paused' : 'playing'
    };

    this.sendMetrics(m);
    this.lastMetricsSentAt = now;
  }

  private sendMetrics(m: PlayerMetrics) {
    try { this.opts?.onMetrics?.(m); } catch { /* noop */ }
    try {
      const path = typeof window !== 'undefined' ? (window.location.pathname + window.location.search) : null;
      const events: any[] = [];
      if (typeof m.rebuffer_count === 'number') events.push({ metric_name: 'REBUF_COUNT', value: m.rebuffer_count, id_value: 'player' });
      if (typeof m.buffer_seconds === 'number') events.push({ metric_name: 'BUFFER_S', value: m.buffer_seconds, id_value: 'player' });
      if (typeof m.bitrate_kbps === 'number') events.push({ metric_name: 'BITRATE_Kbps', value: m.bitrate_kbps, id_value: 'player' });
      if (events.length) {
        supabase.functions.invoke('frontend-telemetry', { body: { events, path } }).catch(() => {});
      }
    } catch { /* noop */ }
  }
}
