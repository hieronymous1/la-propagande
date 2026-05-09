import { shopifyFetch } from '../shopify';
import type { Cart } from '../types';

const CART_FIELDS = `
  id
  checkoutUrl
  totalQuantity
  cost {
    totalAmount {
      amount
      currencyCode
    }
    subtotalAmount {
      amount
      currencyCode
    }
  }
  lines(first: 100) {
    edges {
      node {
        id
        quantity
        merchandise {
          ... on ProductVariant {
            id
            title
            price {
              amount
              currencyCode
            }
            product {
              title
              handle
              images(first: 1) {
                edges {
                  node {
                    url
                    altText
                    width
                    height
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

interface CartCreateData {
  cartCreate: {
    cart: Cart;
  };
}

interface CartQueryData {
  cart: Cart | null;
}

interface CartLinesAddData {
  cartLinesAdd: {
    cart: Cart;
  };
}

interface CartLinesUpdateData {
  cartLinesUpdate: {
    cart: Cart;
  };
}

interface CartLinesRemoveData {
  cartLinesRemove: {
    cart: Cart;
  };
}

export async function createCart(): Promise<Cart> {
  const query = `
    mutation CartCreate {
      cartCreate {
        cart {
          ${CART_FIELDS}
        }
      }
    }
  `;

  const data = await shopifyFetch<CartCreateData>({ query });
  return data.cartCreate.cart;
}

export async function getCart(cartId: string): Promise<Cart | null> {
  const query = `
    query GetCart($cartId: ID!) {
      cart(id: $cartId) {
        ${CART_FIELDS}
      }
    }
  `;

  const data = await shopifyFetch<CartQueryData, { cartId: string }>({
    query,
    variables: { cartId },
  });

  return data.cart;
}

export async function addToCart(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[]
): Promise<Cart> {
  const query = `
    mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          ${CART_FIELDS}
        }
      }
    }
  `;

  const data = await shopifyFetch<
    CartLinesAddData,
    { cartId: string; lines: { merchandiseId: string; quantity: number }[] }
  >({
    query,
    variables: { cartId, lines },
  });

  return data.cartLinesAdd.cart;
}

export async function updateCartLines(
  cartId: string,
  lines: { id: string; quantity: number }[]
): Promise<Cart> {
  const query = `
    mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          ${CART_FIELDS}
        }
      }
    }
  `;

  const data = await shopifyFetch<
    CartLinesUpdateData,
    { cartId: string; lines: { id: string; quantity: number }[] }
  >({
    query,
    variables: { cartId, lines },
  });

  return data.cartLinesUpdate.cart;
}

export async function removeFromCart(cartId: string, lineIds: string[]): Promise<Cart> {
  const query = `
    mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          ${CART_FIELDS}
        }
      }
    }
  `;

  const data = await shopifyFetch<
    CartLinesRemoveData,
    { cartId: string; lineIds: string[] }
  >({
    query,
    variables: { cartId, lineIds },
  });

  return data.cartLinesRemove.cart;
}
