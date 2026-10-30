import { redirect } from 'next/navigation';

interface EventsDetailRedirectProps {
  params: Promise<{
    handle: string;
  }>;
}

export default async function EventsDetailRedirectPage({ params }: EventsDetailRedirectProps) {
  const { handle } = await params;
  redirect(`/blog/${handle}`);
}
