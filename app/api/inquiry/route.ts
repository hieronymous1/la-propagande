import { handleInquiry } from '@/lib/inquiry';

export const dynamic = 'force-dynamic';
export async function POST(request: Request) { return handleInquiry(request); }
