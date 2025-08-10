export async function getSignedViewUrl(bucket: 'content' | 'avatars', filePath: string, expiresIn = 600): Promise<string | null> {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase.functions.invoke('get-signed-view-url', {
      body: { bucket, file_path: filePath, expires_in: expiresIn },
    });
    if (error) throw error as any;
    return (data as any)?.url ?? null;
  } catch (e) {
    console.error('getSignedViewUrl error:', e);
    return null;
  }
}
