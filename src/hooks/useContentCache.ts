import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getSignedViewUrl } from '@/utils/media';

interface ContentItem {
  id: string;
  url: string;
  type: 'image' | 'video' | 'gif';
  scheduled_time: string;
  duration_seconds?: number;
  cached_blob?: Blob;
  cached_url?: string;
}

interface ContentSchedule {
  screen_id: string;
  schedule: ContentItem[];
  last_updated: string;
}

export const useContentCache = (screenId?: string) => {
  const [schedule, setSchedule] = useState<ContentSchedule | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});
  const [cachedContent, setCachedContent] = useState<Record<string, string>>({});

  // Fetch content schedule for a screen
  const fetchSchedule = useCallback(async (screenId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('content-sync', {
        body: { screen_id: screenId }
      });
      
      if (error) throw error;
      
      const contentSchedule: ContentSchedule = {
        screen_id: screenId,
        schedule: data.schedule || [],
        last_updated: new Date().toISOString()
      };
      
      setSchedule(contentSchedule);
      return contentSchedule;
    } catch (error) {
      console.error('Error fetching schedule:', error);
      return null;
    }
  }, []);

  // Download and cache content locally
  const downloadContent = useCallback(async (contentItem: ContentItem) => {
    if (cachedContent[contentItem.id]) {
      return cachedContent[contentItem.id];
    }

    try {
      setDownloadProgress(prev => ({ ...prev, [contentItem.id]: 0 }));
      
      // Get signed URL for content
      const signedUrl = await getSignedViewUrl('content', contentItem.url.split('/').pop() || '', 3600);
      if (!signedUrl) throw new Error('Failed to get signed URL');

      // Download content
      const response = await fetch(signedUrl);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      
      setCachedContent(prev => ({ ...prev, [contentItem.id]: objectUrl }));
      setDownloadProgress(prev => ({ ...prev, [contentItem.id]: 100 }));
      
      return objectUrl;
    } catch (error) {
      console.error('Error downloading content:', error);
      setDownloadProgress(prev => ({ ...prev, [contentItem.id]: -1 }));
      return null;
    }
  }, [cachedContent]);

  // Download all content in schedule
  const cacheAllContent = useCallback(async () => {
    if (!schedule) return;
    
    setIsDownloading(true);
    
    for (const item of schedule.schedule) {
      await downloadContent(item);
    }
    
    setIsDownloading(false);
  }, [schedule, downloadContent]);

  // Get next content to play
  const getNextContent = useCallback((): ContentItem | null => {
    if (!schedule) return null;
    
    const now = new Date();
    const upcoming = schedule.schedule.filter(item => 
      new Date(item.scheduled_time) > now
    );
    
    return upcoming.sort((a, b) => 
      new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime()
    )[0] || null;
  }, [schedule]);

  // Get current content that should be playing
  const getCurrentContent = useCallback((): ContentItem | null => {
    if (!schedule) return null;
    
    const now = new Date();
    return schedule.schedule.find(item => {
      const startTime = new Date(item.scheduled_time);
      const endTime = new Date(startTime.getTime() + (item.duration_seconds || 10) * 1000);
      return now >= startTime && now <= endTime;
    }) || null;
  }, [schedule]);

  useEffect(() => {
    if (screenId) {
      fetchSchedule(screenId);
    }
  }, [screenId, fetchSchedule]);

  return {
    schedule,
    isDownloading,
    downloadProgress,
    cachedContent,
    fetchSchedule,
    downloadContent,
    cacheAllContent,
    getNextContent,
    getCurrentContent
  };
};