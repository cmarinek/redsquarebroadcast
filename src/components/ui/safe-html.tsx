import { useMemo } from 'react';
import DOMPurify, { Config } from 'dompurify';

interface SafeHtmlProps {
  html: string;
  className?: string;
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
}

/**
 * SafeHtml component that sanitizes HTML content to prevent XSS attacks
 */
export const SafeHtml = ({ 
  html, 
  className = '', 
  allowedTags,
  allowedAttributes 
}: SafeHtmlProps) => {
  const sanitizedHtml = useMemo(() => {
    // Configure DOMPurify with secure defaults
    const config: Config = {
      // Allow common safe HTML tags
      ALLOWED_TAGS: allowedTags || [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'div', 'span',
        'strong', 'em', 'b', 'i', 'u',
        'ul', 'ol', 'li',
        'blockquote', 'code', 'pre'
      ],
      // Allow safe attributes
      ALLOWED_ATTR: allowedAttributes ? Object.keys(allowedAttributes) : [
        'class', 'id'
      ],
      // Remove script tags and event handlers
      FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'style'],
      // Keep content clean
      KEEP_CONTENT: true,
      // Return a clean DOM
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
    };

    return DOMPurify.sanitize(html, config);
  }, [html, allowedTags, allowedAttributes]);

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};

/**
 * Markdown-like renderer that safely converts simple markdown to HTML
 */
interface SafeMarkdownProps {
  content: string;
  className?: string;
}

export const SafeMarkdown = ({ content, className = '' }: SafeMarkdownProps) => {
  const processedContent = useMemo(() => {
    return content
      .replace(/\n/g, '<br />')
      .replace(/#{1}\s(.+)/g, '<h1 class="text-2xl font-bold mt-6 mb-3">$1</h1>')
      .replace(/#{2}\s(.+)/g, '<h2 class="text-xl font-semibold mt-5 mb-2">$1</h2>')
      .replace(/#{3}\s(.+)/g, '<h3 class="text-lg font-medium mt-4 mb-2">$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/❌\s(.+?)$/gm, '<div class="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950 rounded-lg mb-2"><span class="text-red-500">❌</span><span class="text-red-800 dark:text-red-200">$1</span></div>')
      .replace(/✅\s(.+?)$/gm, '<div class="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg mb-2"><span class="text-green-500">✅</span><span class="text-green-800 dark:text-green-200">$1</span></div>');
  }, [content]);

  return (
    <SafeHtml 
      html={processedContent}
      className={`prose prose-sm max-w-none dark:prose-invert ${className}`}
    />
  );
};
