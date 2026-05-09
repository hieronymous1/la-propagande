import { Suspense } from 'react';
import ArchivePageClient from '@/components/archive/ArchivePageClient';
import { getArchiveEntries } from '@/lib/queries/archive';

export const dynamic = 'force-dynamic';

export default async function ArchivePage() {
  const entries = await getArchiveEntries();

  return (
    <Suspense fallback={null}>
      <ArchivePageClient initialEntries={entries} />
    </Suspense>
  );
}
