/** Replaces the unpaid-publish scrub without touching the publish flow. */
export interface HtmlSanitizerPort {
  sanitizeUnpaidSiteHtml(html: string): string;
}

export const HTML_SANITIZER = Symbol('HTML_SANITIZER');
