'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import type { Cart } from '@/lib/types';
import {
  createCart as shopifyCreateCart,
  getCart as shopifyGetCart,
  addToCart as shopifyAddToCart,
  updateCartLines as shopifyUpdateCartLines,
  removeFromCart as shopifyRemoveFromCart,
} from '@/lib/queries/cart';

interface CartContextType {
  cart: Cart | null;
  cartCount: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (merchandiseId: string, quantity: number) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeFromCart: (lineId: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartId, setCartId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Hydrate or create cart on mount
  useEffect(() => {
    let isMounted = true;
    async function initCart() {
      try {
        const storedId = localStorage.getItem('lp_cart_id');
        if (storedId) {
          const existing = await shopifyGetCart(storedId);
          if (existing) {
            if (isMounted) {
              setCart(existing);
              setCartId(existing.id);
            }
            return;
          }
        }
        // No stored cart or cart not found — create a new one
        const newCart = await shopifyCreateCart();
        localStorage.setItem('lp_cart_id', newCart.id);
        if (isMounted) {
          setCart(newCart);
          setCartId(newCart.id);
        }
      } catch (err) {
        console.error('[Cart] Failed to initialise cart:', err);
        localStorage.removeItem('lp_cart_id');
      }
    }
    initCart();
    return () => { isMounted = false; };
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addToCart = useCallback(
    async (merchandiseId: string, quantity: number) => {
      if (!cartId) return;
      try {
        const updated = await shopifyAddToCart(cartId, [{ merchandiseId, quantity }]);
        setCart(updated);
      } catch (err) {
        console.error('[Cart] mutation failed:', err);
      }
    },
    [cartId]
  );

  const updateQuantity = useCallback(
    async (lineId: string, quantity: number) => {
      if (!cartId) return;
      try {
        if (quantity === 0) {
          const updated = await shopifyRemoveFromCart(cartId, [lineId]);
          setCart(updated);
        } else {
          const updated = await shopifyUpdateCartLines(cartId, [{ id: lineId, quantity }]);
          setCart(updated);
        }
      } catch (err) {
        console.error('[Cart] mutation failed:', err);
      }
    },
    [cartId]
  );

  const removeFromCart = useCallback(
    async (lineId: string) => {
      if (!cartId) return;
      try {
        const updated = await shopifyRemoveFromCart(cartId, [lineId]);
        setCart(updated);
      } catch (err) {
        console.error('[Cart] mutation failed:', err);
      }
    },
    [cartId]
  );

  const cartCount = cart?.totalQuantity ?? 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        isOpen,
        openCart,
        closeCart,
        addToCart,
        updateQuantity,
        removeFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
