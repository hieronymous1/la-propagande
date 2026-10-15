import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { recordVisit } from '@/lib/audience';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (origin !== request.nextUrl.origin) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  const cookie = request.cookies.get('lp_visitor')?.value;
  const visitor = cookie && /^[a-f0-9-]{36}$/.test(cookie) ? cookie : randomUUID();
  try {
    const count = await recordVisit(visitor);
    const response = NextResponse.json({ count }, { headers: { 'Cache-Control': 'no-store' } });
    if (count !== null && visitor !== cookie) {
      response.cookies.set('lp_visitor', visitor, { httpOnly: true, secure: request.nextUrl.protocol === 'https:', sameSite: 'strict', maxAge: 31_536_000, path: '/' });
    }
    return response;
  } catch {
    return NextResponse.json({ count: null }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
