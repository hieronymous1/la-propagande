const MAX_CART_LINE_QUANTITY = 20;
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
  if (!Array.isArray(lines)) return [];
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
  if (!Array.isArray(values)) return [];
  return values.map(normalizeShopifyGid).filter(Boolean);
}

function isAllowedRequestOrigin(origin, siteOrigin) {
  if (!origin) return true;
  try {
    return new URL(origin).origin === new URL(siteOrigin).origin;
  } catch {
    return false;
  }
}

exports.MAX_CART_LINE_QUANTITY = MAX_CART_LINE_QUANTITY;
exports.isAllowedRequestOrigin = isAllowedRequestOrigin;
exports.normalizeCartId = normalizeCartId;
exports.normalizeCartLines = normalizeCartLines;
exports.normalizeLineIds = normalizeLineIds;
