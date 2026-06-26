import { NextResponse } from 'next/server';
import {
  isAllowedRequestOrigin,
  normalizeCartId,
  normalizeCartLines,
  normalizeLineIds,
} from '@/lib/cart-validation';
import {
  addToCart,
  removeFromCart,
  updateCartLines,
} from '@/lib/queries/cart';
import { getSiteOrigin } from '@/lib/runtime';

export const dynamic = 'force-dynamic';

type CartLinesAction = 'add' | 'update' | 'remove';

interface CartLinesPayload {
  action?: CartLinesAction;
  cartId?: string;
  lines?: { merchandiseId?: string; id?: string; quantity?: number }[];
  lineIds?: string[];
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (!isAllowedRequestOrigin(origin, getSiteOrigin())) {
    return NextResponse.json({ error: 'Request origin is not allowed' }, { status: 403 });
  }

  let payload: CartLinesPayload;

  try {
    payload = (await request.json()) as CartLinesPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const cartId = normalizeCartId(payload.cartId);

  if (!cartId) {
    return NextResponse.json({ error: 'A valid cart id is required' }, { status: 400 });
  }

  try {
    if (payload.action === 'add') {
      const lines = normalizeCartLines(payload.lines) as { merchandiseId: string; quantity: number }[];

      if (lines.length === 0) {
        return NextResponse.json({ error: 'At least one valid line is required' }, { status: 400 });
      }

      const cart = await addToCart(cartId, lines);
      return NextResponse.json({ cart });
    }

    if (payload.action === 'update') {
      const lines = normalizeCartLines(payload.lines, { idKey: 'id', allowZero: true }) as { id: string; quantity: number }[];

      if (lines.length === 0) {
        return NextResponse.json({ error: 'At least one valid line is required' }, { status: 400 });
      }

      const cart = await updateCartLines(cartId, lines);
      return NextResponse.json({ cart });
    }

    if (payload.action === 'remove') {
      const lineIds = normalizeLineIds(payload.lineIds) as string[];

      if (lineIds.length === 0) {
        return NextResponse.json({ error: 'At least one line id is required' }, { status: 400 });
      }

      const cart = await removeFromCart(cartId, lineIds);
      return NextResponse.json({ cart });
    }

    return NextResponse.json({ error: 'Unsupported cart line action' }, { status: 400 });
  } catch (error) {
    console.error('[Cart API] line mutation failed:', error);
    return NextResponse.json({ error: 'Unable to update cart' }, { status: 502 });
  }
}
