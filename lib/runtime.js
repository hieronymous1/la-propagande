const DEFAULT_SITE_ORIGIN = 'https://www.lapropagande.net';

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

const ALLOWED_ATTRS = new Set(['alt', 'href', 'src', 'title']);

function getSiteOrigin(env = process.env) {
  return (env.SITE_ORIGIN || env.SHOPIFY_SITE_ORIGIN || DEFAULT_SITE_ORIGIN).replace(/\/$/, '');
}

function shouldUseShopifyFallbacks(env = process.env) {
  const value = env.ENABLE_SHOPIFY_FALLBACKS;
  return value === '1' || value === 'true';
}

function isSafeUrl(value) {
  if (!value) return false;
  try {
    const url = new URL(value, DEFAULT_SITE_ORIGIN);
    return url.protocol === 'https:' || url.protocol === 'http:' || url.protocol === 'mailto:';
  } catch {
    return false;
  }
}

function sanitizeAttributes(tagName, attrs) {
  return attrs.replace(/\s+([^\s=/>]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g, (_match, rawName, _rawValue, doubleValue, singleValue, bareValue) => {
    const name = String(rawName).toLowerCase();
    const value = doubleValue ?? singleValue ?? bareValue ?? '';

    if (name.startsWith('on') || !ALLOWED_ATTRS.has(name)) return '';
    if ((name === 'href' || name === 'src') && !isSafeUrl(value)) return '';
    if (tagName !== 'a' && name === 'href') return '';
    if (tagName !== 'img' && name === 'src') return '';

    return ` ${name}="${String(value).replace(/"/g, '&quot;')}"`;
  });
}

function sanitizeRichHtml(html) {
  if (!html) return '';

  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\/?([a-z0-9-]+)([^>]*)>/gi, (match, rawTagName, attrs) => {
      const tagName = String(rawTagName).toLowerCase();
      if (!ALLOWED_TAGS.has(tagName)) return '';
      if (match.startsWith('</')) return `</${tagName}>`;
      const suffix = match.endsWith('/>') ? ' /' : '';
      return `<${tagName}${sanitizeAttributes(tagName, attrs)}${suffix}>`;
    });
}

exports.DEFAULT_SITE_ORIGIN = DEFAULT_SITE_ORIGIN;
exports.getSiteOrigin = getSiteOrigin;
exports.sanitizeRichHtml = sanitizeRichHtml;
exports.shouldUseShopifyFallbacks = shouldUseShopifyFallbacks;
