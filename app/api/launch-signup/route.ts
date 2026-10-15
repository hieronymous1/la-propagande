import { handleLaunchSignup } from '@/lib/launch-signup';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  return handleLaunchSignup(request);
}
