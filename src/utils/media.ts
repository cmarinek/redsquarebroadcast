import { SUPABASE_PROJECT_REF, supabase } from '@/integrations/supabase/client';

export async function getSignedViewUrl(bucket: 'content' | 'avatars', filePath: string, expiresIn = 600): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke('get-signed-view-url', {
      body: { bucket, file_path: filePath, expires_in: expiresIn },
    });
    if (error) throw error as any;
    // Prefer CDN URL when available, fall back to origin, keep legacy 'url' compatibility
    const d = data as any;
    return d?.cdn_url || d?.origin_url || d?.url || null;
  } catch (e) {
    console.error('getSignedViewUrl error:', e);
    return null;
  }
}

export function optimizeImageUrl(url: string | null | undefined, opts: { w?: number; h?: number; q?: number; format?: 'webp' | 'png' } = {}) {
  if (!url) return undefined as unknown as string;
  try {
    // Match Supabase public object URL: /storage/v1/object/public/{bucket}/{path}
    const u = new URL(url);
    const m = u.pathname.match(/\/storage\/v1\/object\/public\/(.+?)\/(.+)$/);
    if (!m) return url; // not a Supabase public URL
    const bucket = m[1];
    const path = m[2];
    const params = new URLSearchParams();
    if (opts.w) params.set('width', String(opts.w));
    if (opts.h) params.set('height', String(opts.h));
    if (opts.q) params.set('quality', String(opts.q));
    params.set('resize', 'cover');
    const base = `https://${SUPABASE_PROJECT_REF}.supabase.co/storage/v1/render/image/public/${bucket}/${path}`;
    return params.toString() ? `${base}?${params.toString()}` : base;
  } catch {
    return url;
  }
}

