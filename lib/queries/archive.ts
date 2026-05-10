import { ARCHIVE_ENTRIES } from '../site';
import { shopifyFetch } from '../shopify';
import type { ArchiveEntry } from '../site';

interface MetaobjectField {
  key: string;
  value: string | null;
  reference?: MediaReferenceNode | null;
}

interface MetaobjectNode {
  id: string;
  handle: string;
  fields: MetaobjectField[];
}

interface MediaImageReference {
  __typename: 'MediaImage';
  image: {
    url: string;
    altText: string | null;
    width: number | null;
    height: number | null;
  } | null;
}

interface GenericFileReference {
  __typename: 'GenericFile';
  url: string;
}

type MediaReferenceNode = MediaImageReference | GenericFileReference;

interface ArchiveQueryData {
  metaobjects: {
    edges: Array<{ node: MetaobjectNode }>;
  };
}

interface ArchiveEntryWithOrder extends ArchiveEntry {
  sortOrder?: number;
}

const ARCHIVE_METAOBJECT_TYPE = process.env.SHOPIFY_ARCHIVE_METAOBJECT_TYPE || 'archive_entry';

function getField(fields: MetaobjectField[], key: string): string | undefined {
  const raw = fields.find((field) => field.key === key)?.value;
  return raw?.trim() || undefined;
}

function getMediaField(fields: MetaobjectField[], key: string): string | undefined {
  const field = fields.find((entry) => entry.key === key);
  if (!field) return undefined;

  if (field.reference?.__typename === 'MediaImage') {
    return field.reference.image?.url ?? undefined;
  }

  if (field.reference?.__typename === 'GenericFile') {
    return field.reference.url;
  }

  return field.value?.trim() || undefined;
}

function parseFolder(value?: string): ArchiveEntry['folder'] | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'fragments' || normalized === 'media' || normalized === 'logs' || normalized === 'links') return normalized;
  return undefined;
}

function parseStatus(value?: string): ArchiveEntry['status'] {
  if (!value) return 'AVAILABLE';
  const normalized = value.trim().toUpperCase().replace(/[\s-]+/g, '_');
  if (
    normalized === 'AVAILABLE' ||
    normalized === 'DEGRADED' ||
    normalized === 'LOCKED' ||
    normalized === 'MIRROR' ||
    normalized === 'CORRUPTED'
  ) {
    return normalized;
  }
  return 'AVAILABLE';
}

function parseBehavior(value?: string): ArchiveEntry['behavior'] | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase().replace(/[\s_]+/g, '-');
  if (
    normalized === 'delayed' ||
    normalized === 'permission' ||
    normalized === 'broken-valid-link' ||
    normalized === 'sub-index' ||
    normalized === 'locked-teaser' ||
    normalized === 'repairable'
  ) {
    return normalized;
  }
  return undefined;
}

function parseSortOrder(value?: string): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function mapMetaobjectToArchiveEntry(node: MetaobjectNode): ArchiveEntryWithOrder | null {
  const folder = parseFolder(getField(node.fields, 'folder'));
  if (!folder) return null;

  const title = getField(node.fields, 'title');
  const type = getField(node.fields, 'type');
  const summary = getField(node.fields, 'summary');
  if (!title || !type || !summary) return null;

  const thumbnail = getMediaField(node.fields, 'thumbnail') ?? '/images/placeholders/archive-01.svg';
  const href = getField(node.fields, 'href');

  return {
    id: node.id,
    folder,
    title,
    type,
    status: parseStatus(getField(node.fields, 'status')),
    summary,
    thumbnail,
    href,
    behavior: parseBehavior(getField(node.fields, 'behavior')),
    sortOrder: parseSortOrder(getField(node.fields, 'sort_order')),
  };
}

export async function getArchiveEntries(): Promise<ArchiveEntry[]> {
  const query = `
    query GetArchiveEntries($type: String!) {
      metaobjects(first: 100, type: $type) {
        edges {
          node {
            id
            handle
            fields {
              key
              value
              reference {
                __typename
                ... on MediaImage {
                  image {
                    url
                    altText
                    width
                    height
                  }
                }
                ... on GenericFile {
                  url
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const data = await shopifyFetch<ArchiveQueryData, { type: string }>({
      query,
      variables: { type: ARCHIVE_METAOBJECT_TYPE },
    });

    const mapped = data.metaobjects.edges
      .map((edge) => edge.node)
      .map(mapMetaobjectToArchiveEntry)
      .filter((entry): entry is ArchiveEntryWithOrder => Boolean(entry))
      .sort((a, b) => {
        if (a.sortOrder !== undefined && b.sortOrder !== undefined) return a.sortOrder - b.sortOrder;
        if (a.sortOrder !== undefined) return -1;
        if (b.sortOrder !== undefined) return 1;
        return a.title.localeCompare(b.title);
      })
      .map((entry): ArchiveEntry => ({
        id: entry.id,
        folder: entry.folder,
        title: entry.title,
        type: entry.type,
        status: entry.status,
        summary: entry.summary,
        thumbnail: entry.thumbnail,
        href: entry.href,
        behavior: entry.behavior,
      }));

    if (mapped.length === 0) return ARCHIVE_ENTRIES;
    return mapped.slice(0, 10);
  } catch {
    return ARCHIVE_ENTRIES;
  }
}
