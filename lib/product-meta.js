const PRODUCT_STATUS_ALIASES = new Map([
  ['AVAILABLE', 'AVAILABLE'],
  ['IN_STOCK', 'AVAILABLE'],
  ['LIMITED', 'LIMITED'],
  ['SOLD_OUT', 'SOLD_OUT'],
  ['OUT_OF_STOCK', 'SOLD_OUT'],
  ['COMING_SOON', 'COMING_SOON'],
  ['MADE_TO_ORDER', 'COMING_SOON'],
  ['ARCHIVE', 'ARCHIVE'],
]);

const PRODUCT_CATEGORY_ALIASES = new Map([
  ['TOP', 'tops'],
  ['TOPS', 'tops'],
  ['BOTTOM', 'bottoms'],
  ['BOTTOMS', 'bottoms'],
  ['ACCESSORY', 'accessories'],
  ['ACCESSORIES', 'accessories'],
  ['CUSTOM_JACKET', 'custom-jackets'],
  ['CUSTOM_JACKETS', 'custom-jackets'],
]);

function normalizeEditorValue(value) {
  return String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/&/g, 'AND')
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function parseProductStatus(value) {
  const normalized = normalizeEditorValue(value);
  return PRODUCT_STATUS_ALIASES.get(normalized);
}

function parseProductCategory(value) {
  const normalized = normalizeEditorValue(value);
  return PRODUCT_CATEGORY_ALIASES.get(normalized);
}

function parseFeatured(value) {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (normalized === 'true' || normalized === '1' || normalized === 'yes') return true;
  if (normalized === 'false' || normalized === '0' || normalized === 'no') return false;
  return undefined;
}

const FALLBACK_FIELD_ALIASES = new Map([
  ['item_code', 'itemCode'],
  ['itemcode', 'itemCode'],
  ['status', 'status'],
  ['origin', 'origin'],
  ['summary', 'summary'],
  ['category', 'category'],
  ['subcategory', 'subcategory'],
  ['collection', 'collection'],
  ['short_description', 'shortDescription'],
  ['shortdescription', 'shortDescription'],
  ['featured', 'featured'],
  ['transmission', 'transmission'],
  ['drop', 'drop'],
  ['file_notes', 'fileNotes'],
  ['filenotes', 'fileNotes'],
]);

function decodeHtmlEntities(value) {
  return String(value)
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function normalizeFallbackKey(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/^lp[_\s.-]*/, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function assignFallbackField(meta, rawKey, rawValue) {
  const key = FALLBACK_FIELD_ALIASES.get(normalizeFallbackKey(rawKey));
  const value = decodeHtmlEntities(rawValue).trim();
  if (!key || !value) return;
  meta[key] = value;
}

function parseFallbackTags(tags = []) {
  const meta = {};
  for (const tag of tags) {
    const match = String(tag).match(/^lp[_\s.-]?([^:=]+)\s*[:=]\s*(.+)$/i);
    if (!match) continue;
    assignFallbackField(meta, match[1], match[2]);
  }
  return meta;
}

function parseFallbackBlock(blockHtml) {
  const meta = {};
  const text = decodeHtmlEntities(
    String(blockHtml)
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>\s*<p[^>]*>/gi, '\n')
      .replace(/<[^>]*>/g, '')
  );

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || /^LP DATA:?$/i.test(trimmed) || /^END LP DATA$/i.test(trimmed)) continue;
    const match = trimmed.match(/^([^:=]+)\s*[:=]\s*(.+)$/);
    if (!match) continue;
    assignFallbackField(meta, match[1], match[2]);
  }
  return meta;
}

function descriptionLines(descriptionHtml) {
  const text = decodeHtmlEntities(
    String(descriptionHtml)
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>\s*<p[^>]*>/gi, '\n')
      .replace(/<[^>]*>/g, '')
  );

  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function deriveDescriptionMeta(descriptionHtml) {
  const meta = {};
  const lines = descriptionLines(descriptionHtml);
  const contentLines = lines.filter((line) => !/^LP DATA:?$/i.test(line) && !/^END LP DATA$/i.test(line));
  if (contentLines.length < 2) return meta;

  const labelLine = contentLines.find((line) => /^\/.+\/$/.test(line));
  const summaryLine = contentLines.find((line) => {
    if (/^\/.+\/$/.test(line)) return false;
    if (/^made in\s+/i.test(line)) return false;
    return /[a-z0-9]/i.test(line);
  });
  const originLine = contentLines.find((line) => /^made in\s+/i.test(line));

  if (summaryLine) meta.summary = summaryLine;
  if (labelLine) meta.shortDescription = labelLine.replace(/^\/+|\/+$/g, '').trim();
  if (originLine) meta.origin = originLine.replace(/^made in\s+/i, '').trim();

  return meta;
}

function extractProductFallbackMeta({ descriptionHtml = '', tags = [] } = {}) {
  let cleanedDescriptionHtml = String(descriptionHtml ?? '');
  const blockPattern = /<p[^>]*>\s*LP DATA:?\s*(?:<br\s*\/?>)?[\s\S]*?END LP DATA\s*<\/p>/i;
  const blockMatch = cleanedDescriptionHtml.match(blockPattern);
  const blockMeta = blockMatch ? parseFallbackBlock(blockMatch[0]) : {};

  if (blockMatch) {
    cleanedDescriptionHtml = cleanedDescriptionHtml.replace(blockPattern, '').trim();
  }

  return {
    descriptionHtml: cleanedDescriptionHtml,
    meta: {
      ...deriveDescriptionMeta(cleanedDescriptionHtml),
      ...parseFallbackTags(tags),
      ...blockMeta,
    },
  };
}

exports.parseProductCategory = parseProductCategory;
exports.parseProductStatus = parseProductStatus;
exports.parseFeatured = parseFeatured;
exports.extractProductFallbackMeta = extractProductFallbackMeta;
