import React from "react";
import { optimizeImageUrl } from "@/utils/media";
import clsx from "clsx";

export type OptimizedImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  width?: number;
  height?: number;
  quality?: number;
};

// OptimizedImage
// - Uses Supabase image renderer when the URL is a public storage URL
// - Adds lazy loading by default for non-critical images
// - Supports standard <img> props
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  quality = 70,
  loading = "lazy",
  className,
  ...rest
}: OptimizedImageProps) {
  const s = typeof src === "string" ? src : undefined;
  const isSupabasePublic = !!s && /\/storage\/v1\/object\/public\//.test(s);
  const optimized = isSupabasePublic ? optimizeImageUrl(s, { w: width, h: height, q: quality, format: "webp" }) : s;

  return (
    <img
      src={optimized}
      alt={alt || ""}
      loading={loading}
      decoding="async"
      width={width}
      height={height}
      className={clsx(className)}
      {...rest}
    />
  );
}

export default OptimizedImage;
