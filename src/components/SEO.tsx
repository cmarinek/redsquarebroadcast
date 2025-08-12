import { useEffect } from "react";

interface SEOProps {
  title: string;
  description?: string;
  path?: string; // canonical path starting with /
}

const SEO = ({ title, description, path }: SEOProps) => {
  useEffect(() => {
    // Title
    document.title = title;

    // Meta description
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    if (description) meta.setAttribute('content', description);

    // Canonical
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    const canonicalUrl = window.location.origin + (path || window.location.pathname);
    link.setAttribute('href', canonicalUrl);
  }, [title, description, path]);

  return null;
};

export default SEO;
