import { ABOUT_FALLBACK_SECTIONS, LOCATION_FALLBACK_ENTRIES } from '../site';
import { shopifyFetch } from '../shopify';
import { shouldUseShopifyFallbacks } from '../runtime';
import type { AboutSection, LocationEntry } from '../types';

interface MetaobjectField {
  key: string;
  value: string | null;
}

interface MetaobjectNode {
  id: string;
  fields: MetaobjectField[];
}

interface MetaobjectsQueryData {
  metaobjects: {
    edges: Array<{ node: MetaobjectNode }>;
  };
}

interface AboutSectionWithOrder extends AboutSection {
  sortOrder: number;
}

interface LocationEntryWithOrder extends LocationEntry {
  sortOrder: number;
  note: string | undefined;
  dateRange: string | undefined;
  hours: string | undefined;
}

const ABOUT_METAOBJECT_TYPE = process.env.SHOPIFY_ABOUT_METAOBJECT_TYPE || 'about_section';
const LOCATION_METAOBJECT_TYPE = process.env.SHOPIFY_LOCATION_METAOBJECT_TYPE || 'location_entry';

function getField(fields: MetaobjectField[], key: string): string | undefined {
  const value = fields.find((field) => field.key === key)?.value;
  return value?.trim() || undefined;
}

function parseSortOrder(value?: string): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isNaN(parsed) ? Number.MAX_SAFE_INTEGER : parsed;
}

function parseLocationKind(value?: string): LocationEntry['kind'] | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'showroom' || normalized === 'selling_point') return normalized;
  return undefined;
}

async function getMetaobjects(type: string): Promise<MetaobjectNode[]> {
  const query = `
    query GetMetaobjects($type: String!) {
      metaobjects(first: 100, type: $type) {
        edges {
          node {
            id
            fields {
              key
              value
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch<MetaobjectsQueryData, { type: string }>({
    query,
    variables: { type },
    operationName: `GetMetaobjects:${type}`,
  });

  return data.metaobjects.edges.map((edge) => edge.node);
}

export async function getAboutSections(): Promise<AboutSection[]> {
  try {
    const sections = (await getMetaobjects(ABOUT_METAOBJECT_TYPE))
      .map((node) => {
        const label = getField(node.fields, 'label');
        const body = getField(node.fields, 'body');
        if (!label || !body) return null;

        return {
          id: node.id,
          label,
          body,
          sortOrder: parseSortOrder(getField(node.fields, 'sort_order')),
        };
      })
      .filter((section): section is AboutSectionWithOrder => Boolean(section))
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((section) => ({
        id: section.id,
        label: section.label,
        body: section.body,
      }));

    return sections.length > 0 ? sections : shouldUseShopifyFallbacks() ? ABOUT_FALLBACK_SECTIONS : [];
  } catch (error) {
    if (shouldUseShopifyFallbacks()) return ABOUT_FALLBACK_SECTIONS;
    throw error;
  }
}

export async function getLocationEntries(): Promise<LocationEntry[]> {
  try {
    const entries = (await getMetaobjects(LOCATION_METAOBJECT_TYPE))
      .map((node) => {
        const title = getField(node.fields, 'title');
        const kind = parseLocationKind(getField(node.fields, 'kind'));
        const address = getField(node.fields, 'address');
        if (!title || !kind || !address) return null;

        return {
          id: node.id,
          title,
          kind,
          address,
          note: getField(node.fields, 'note'),
          dateRange: getField(node.fields, 'date_range'),
          hours: getField(node.fields, 'hours'),
          sortOrder: parseSortOrder(getField(node.fields, 'sort_order')),
        };
      })
      .filter((entry): entry is LocationEntryWithOrder => Boolean(entry))
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((entry) => ({
        id: entry.id,
        title: entry.title,
        kind: entry.kind,
        address: entry.address,
        note: entry.note,
        dateRange: entry.dateRange,
        hours: entry.hours,
      }));

    // Retain live showroom addresses while keeping obsolete pop-ups out of the
    // site until Shopify's selling points have been reviewed for this revision.
    const showrooms = entries.filter((entry) => entry.kind === 'showroom');
    const sellingPoints = process.env.SHOPIFY_SELLING_POINTS_SOURCE === 'cms'
      ? entries.filter((entry) => entry.kind === 'selling_point')
      : LOCATION_FALLBACK_ENTRIES.filter((entry) => entry.kind === 'selling_point');
    return [
      ...(showrooms.length ? showrooms : LOCATION_FALLBACK_ENTRIES.filter((entry) => entry.kind === 'showroom')),
      ...sellingPoints,
    ];
  } catch (error) {
    if (shouldUseShopifyFallbacks()) return LOCATION_FALLBACK_ENTRIES;
    throw error;
  }
}

/** Optional Intro / Intro heading entries let Marc edit the About hero too. */
export function splitAboutContent(sections: AboutSection[]) {
  return {
    intro: sections.find((section) => section.label.toLowerCase() === 'intro')?.body,
    heading: sections.find((section) => section.label.toLowerCase() === 'intro heading')?.body,
    sections: sections.filter((section) => !['intro', 'intro heading'].includes(section.label.toLowerCase())),
  };
}
