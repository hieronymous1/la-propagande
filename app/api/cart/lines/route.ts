import { NextResponse } from 'next/server';
import {
  addToCart,
  removeFromCart,
  updateCartLines,
} from '@/lib/queries/cart';

export const dynamic = 'force-dynamic';

type CartLinesAction = 'add' | 'update' | 'remove';

interface CartLinesPayload {
  action?: CartLinesAction;
  cartId?: string;
  lines?: { merchandiseId?: string; id?: string; quantity?: number }[];
  lineIds?: string[];
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) > 0;
}

export async function POST(request: Request) {
  let payload: CartLinesPayload;

  try {
    payload = (await request.json()) as CartLinesPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!payload.cartId) {
    return NextResponse.json({ error: 'Cart id is required' }, { status: 400 });
  }

  try {
    if (payload.action === 'add') {
      const lines = (payload.lines ?? [])
        .filter((line) => line.merchandiseId && isPositiveInteger(line.quantity))
        .map((line) => ({
          merchandiseId: line.merchandiseId!,
          quantity: line.quantity!,
        }));

      if (lines.length === 0) {
        return NextResponse.json({ error: 'At least one valid line is required' }, { status: 400 });
      }

      const cart = await addToCart(payload.cartId, lines);
      return NextResponse.json({ cart });
    }

    if (payload.action === 'update') {
      const lines = (payload.lines ?? [])
        .filter((line) => line.id && Number.isInteger(line.quantity) && Number(line.quantity) >= 0)
        .map((line) => ({
          id: line.id!,
          quantity: line.quantity!,
        }));

      if (lines.length === 0) {
        return NextResponse.json({ error: 'At least one valid line is required' }, { status: 400 });
      }

      const cart = await updateCartLines(payload.cartId, lines);
      return NextResponse.json({ cart });
    }

    if (payload.action === 'remove') {
      const lineIds = (payload.lineIds ?? []).filter(Boolean);

      if (lineIds.length === 0) {
        return NextResponse.json({ error: 'At least one line id is required' }, { status: 400 });
      }

      const cart = await removeFromCart(payload.cartId, lineIds);
      return NextResponse.json({ cart });
    }

    return NextResponse.json({ error: 'Unsupported cart line action' }, { status: 400 });
  } catch (error) {
    console.error('[Cart API] line mutation failed:', error);
    return NextResponse.json({ error: 'Unable to update cart' }, { status: 502 });
  }
}
