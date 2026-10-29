import sanitizeHtml from 'sanitize-html';

export const DEFAULT_SITE_ORIGIN = 'https://www.lapropagande.net';

const ALLOWED_TAGS = new Set([
  'a',
  'blockquote',
  'br',
  'em',
  'h2',
  'h3',
  'h4',
  'img',
  'li',
  'ol',
  'p',
  'strong',
  'ul',
]);

export function getSiteOrigin(env = process.env) {
  return (env.SITE_ORIGIN || env.SHOPIFY_SITE_ORIGIN || DEFAULT_SITE_ORIGIN).replace(/\/$/, '');
}

export function shouldUseShopifyFallbacks(env = process.env) {
  const value = env.ENABLE_SHOPIFY_FALLBACKS;
  return value === '1' || value === 'true';
}

/*
 * Rich HTML from Shopify (product descriptions, blog articles) is rendered with
 * dangerouslySetInnerHTML, so it goes through a real HTML parser (htmlparser2 via
 * sanitize-html) and an allowlist. Anything not listed here is dropped: every
 * on* handler, style, class, id, script, iframe, svg, math, form controls, etc.
 */
const SANITIZE_OPTIONS = {
  allowedTags: [...ALLOWED_TAGS],
  allowedAttributes: {
    '*': ['alt', 'title'],
    a: ['href', 'alt', 'title'],
    img: ['src', 'alt', 'title'],
  },
  // Applies to href and src. Relative URLs (e.g. /products/x) remain allowed.
  allowedSchemes: ['https', 'http', 'mailto', 'tel'],
  allowedSchemesByTag: {},
  allowedSchemesAppliedToAttributes: ['href', 'src'],
  allowProtocolRelative: true,
  allowedIframeHostnames: [],
  allowVulnerableTags: false,
  disallowedTagsMode: 'discard',
  // Drop these elements together with their contents rather than keeping their text.
  nonTextTags: ['script', 'style', 'textarea', 'option', 'noscript', 'iframe', 'svg', 'math', 'template', 'object', 'embed', 'title', 'xmp', 'noembed', 'noframes', 'select'],
  parser: { lowerCaseTags: true, lowerCaseAttributeNames: true },
};

export function sanitizeRichHtml(html) {
  if (!html) return '';
  return sanitizeHtml(String(html), SANITIZE_OPTIONS);
}
