const MAX_CART_LINE_QUANTITY = 20;
const MAX_CART_LINES = 50;
const MAX_CART_BODY_BYTES = 8192;
const SHOPIFY_GID_PATTERN = /^gid:\/\/shopify\/[A-Za-z]+\/[A-Za-z0-9?=&._:-]+$/;

function normalizeCartId(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return SHOPIFY_GID_PATTERN.test(trimmed) && trimmed.includes('/Cart/') ? trimmed : null;
}

function normalizeShopifyGid(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return SHOPIFY_GID_PATTERN.test(trimmed) ? trimmed : null;
}

function normalizeCartLines(lines, options = {}) {
  if (!Array.isArray(lines) || lines.length > MAX_CART_LINES) return [];
  const idKey = options.idKey || 'merchandiseId';
  const allowZero = Boolean(options.allowZero);

  return lines
    .map((line) => {
      const id = normalizeShopifyGid(line?.[idKey]);
      const quantity = line?.quantity;
      const quantityValid = Number.isInteger(quantity) && quantity <= MAX_CART_LINE_QUANTITY && (allowZero ? quantity >= 0 : quantity > 0);
      if (!id || !quantityValid) return null;
      return { [idKey]: id, quantity };
    })
    .filter(Boolean);
}

function normalizeLineIds(values) {
  if (!Array.isArray(values) || values.length > MAX_CART_LINES) return [];
  return values.map(normalizeShopifyGid).filter(Boolean);
}

/**
 * Reads a JSON request body without buffering more than `maxBytes`.
 * Resolves to { ok: true, data } or { ok: false, status: 400 | 413 }.
 */
async function readJsonBody(request, maxBytes = MAX_CART_BODY_BYTES) {
  const declared = request.headers.get('content-length');
  if (declared !== null && Number(declared) > maxBytes) return { ok: false, status: 413 };
  const reader = request.body?.getReader();
  if (!reader) return { ok: false, status: 400 };
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel().catch(() => {});
        return { ok: false, status: 413 };
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const data = JSON.parse(new TextDecoder().decode(bytes));
    if (data === null || typeof data !== 'object' || Array.isArray(data)) return { ok: false, status: 400 };
    return { ok: true, data };
  } catch {
    return { ok: false, status: 400 };
  }
}

function isAllowedRequestOrigin(origin, siteOrigin) {
  if (!origin) return true;
  try {
    return new URL(origin).origin === new URL(siteOrigin).origin;
  } catch {
    return false;
  }
}

exports.MAX_CART_BODY_BYTES = MAX_CART_BODY_BYTES;
exports.MAX_CART_LINES = MAX_CART_LINES;
exports.MAX_CART_LINE_QUANTITY = MAX_CART_LINE_QUANTITY;
exports.isAllowedRequestOrigin = isAllowedRequestOrigin;
exports.normalizeCartId = normalizeCartId;
exports.normalizeCartLines = normalizeCartLines;
exports.normalizeLineIds = normalizeLineIds;
exports.readJsonBody = readJsonBody;
