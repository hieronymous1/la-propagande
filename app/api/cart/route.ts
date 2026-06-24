import { NextResponse } from 'next/server';
import { createCart, getCart } from '@/lib/queries/cart';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const cart = await createCart();
    return NextResponse.json({ cart });
  } catch (error) {
    console.error('[Cart API] create failed:', error);
    return NextResponse.json({ error: 'Unable to create cart' }, { status: 502 });
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Cart id is required' }, { status: 400 });
  }

  try {
    const cart = await getCart(id);
    return NextResponse.json({ cart });
  } catch (error) {
    console.error('[Cart API] load failed:', error);
    return NextResponse.json({ error: 'Unable to load cart' }, { status: 502 });
  }
}
