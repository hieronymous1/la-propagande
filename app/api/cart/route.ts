import { NextResponse } from 'next/server';
import { isAllowedRequestOrigin, normalizeCartId } from '@/lib/cart-validation';
import { createCart, getCart } from '@/lib/queries/cart';
import { getSiteOrigin } from '@/lib/runtime';

export const dynamic = 'force-dynamic';

function rejectCrossSite(request: Request): NextResponse | null {
  const origin = request.headers.get('origin');
  if (isAllowedRequestOrigin(origin, getSiteOrigin())) return null;
  return NextResponse.json({ error: 'Request origin is not allowed' }, { status: 403 });
}

export async function POST(request: Request) {
  const originError = rejectCrossSite(request);
  if (originError) return originError;

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
  const id = normalizeCartId(url.searchParams.get('id'));

  if (!id) {
    return NextResponse.json({ error: 'A valid cart id is required' }, { status: 400 });
  }

  try {
    const cart = await getCart(id);
    return NextResponse.json({ cart });
  } catch (error) {
    console.error('[Cart API] load failed:', error);
    return NextResponse.json({ error: 'Unable to load cart' }, { status: 502 });
  }
}
