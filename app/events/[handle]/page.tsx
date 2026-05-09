import { redirect } from 'next/navigation';

interface EventsDetailRedirectProps {
  params: {
    handle: string;
  };
}

export default function EventsDetailRedirectPage({ params }: EventsDetailRedirectProps) {
  redirect(`/blog/${params.handle}`);
}
