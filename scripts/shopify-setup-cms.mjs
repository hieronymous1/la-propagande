/**
 * Idempotent Shopify CMS setup.
 * Creates about_section + location_entry metaobject definitions + seeds entries.
 * Creates lp.* product metafield definitions.
 * Safe to re-run: checks existence before creating.
 */

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const accessToken =
  process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN ?? process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const apiVersion = process.env.SHOPIFY_ADMIN_API_VERSION ?? '2024-01';

if (!domain) throw new Error('SHOPIFY_STORE_DOMAIN is required');
if (!accessToken) throw new Error('SHOPIFY_ADMIN_API_ACCESS_TOKEN is required');

const endpoint = `https://${domain}/admin/api/${apiVersion}/graphql.json`;

async function adminFetch(query, variables = {}) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': accessToken },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Admin API ${res.status} ${res.statusText}`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join(', '));
  return json.data;
}

// ── Metaobject helpers ────────────────────────────────────────────────────────

async function getMetaobjectDefinition(type) {
  const data = await adminFetch(`
    query GetDef($type: String!) {
      metaobjectDefinitionByType(type: $type) { id type }
    }`, { type });
  return data.metaobjectDefinitionByType ?? null;
}

async function createMetaobjectDefinition(name, type, fields) {
  const data = await adminFetch(`
    mutation CreateDef($def: MetaobjectDefinitionCreateInput!) {
      metaobjectDefinitionCreate(definition: $def) {
        metaobjectDefinition { id type }
        userErrors { field message }
      }
    }`, {
    def: {
      name,
      type,
      fieldDefinitions: fields,
    },
  });
  const errs = data.metaobjectDefinitionCreate.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e) => e.message).join(', '));
  return data.metaobjectDefinitionCreate.metaobjectDefinition;
}

async function listMetaobjects(type) {
  const data = await adminFetch(`
    query List($type: String!) {
      metaobjects(first: 100, type: $type) {
        edges { node { id fields { key value } } }
      }
    }`, { type });
  return data.metaobjects.edges.map((e) => e.node);
}

async function createMetaobject(type, fields) {
  const data = await adminFetch(`
    mutation Create($obj: MetaobjectCreateInput!) {
      metaobjectCreate(metaobject: $obj) {
        metaobject { id }
        userErrors { field message }
      }
    }`, {
    obj: {
      type,
      fields: Object.entries(fields).map(([key, value]) => ({ key, value: String(value) })),
    },
  });
  const errs = data.metaobjectCreate.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e) => e.message).join(', '));
  return data.metaobjectCreate.metaobject;
}

// ── Metafield definition helpers ──────────────────────────────────────────────

async function listMetafieldDefinitions(ownerType, namespace) {
  const data = await adminFetch(`
    query ListDefs($ownerType: MetafieldOwnerType!, $namespace: String!) {
      metafieldDefinitions(first: 100, ownerType: $ownerType, namespace: $namespace) {
        edges { node { id key namespace type { name } } }
      }
    }`, { ownerType, namespace });
  return data.metafieldDefinitions.edges.map((e) => e.node);
}

async function createMetafieldDefinition(ownerType, namespace, key, type, name, description = '') {
  const data = await adminFetch(`
    mutation CreateMfd($def: MetafieldDefinitionInput!) {
      metafieldDefinitionCreate(definition: $def) {
        createdDefinition { id key }
        userErrors { field message }
      }
    }`, {
    def: { ownerType, namespace, key, type, name, description },
  });
  const errs = data.metafieldDefinitionCreate.userErrors ?? [];
  if (errs.length && !errs.some((e) => e.message?.includes('taken'))) {
    throw new Error(errs.map((e) => e.message).join(', '));
  }
  return data.metafieldDefinitionCreate.createdDefinition;
}

// ── Seed data ─────────────────────────────────────────────────────────────────

const ABOUT_SECTIONS = [
  { label: 'Vision', body: 'Build a resistance movement where clothing works as a public signal. Every piece should carry identity, defiance, and the courage to speak clearly.', sort_order: '1' },
  { label: 'Mission', body: 'Design and produce high-quality garments between Beirut and Paris that combine streetwear, military references, and conscious production into wearable statements.', sort_order: '2' },
  { label: 'Purpose', body: 'Use every drop to challenge passive consumption and trigger conversation, action, and community through culture, design, and direct expression.', sort_order: '3' },
];

const LOCATION_ENTRIES = [
  { title: 'Showroom Badaro', kind: 'showroom', address: 'Badaro, Benoit Barakat street, George Calil Building, 1st floor', note: 'By appointment only', sort_order: '1' },
  { title: 'Showroom Ashrafieh', kind: 'showroom', address: 'Palais de justice street قصر العدل, Factory 4376 building, block C, 9th floor', note: 'By appointment only', sort_order: '2' },
  { title: 'Afkart popup', kind: 'selling_point', address: 'ABC Ashrafieh, Mall Square concept store. Level 0 in front of Bar Tartine', date_range: 'Until the end of June 2026', sort_order: '3' },
  { title: 'Mzaar summer festival Expo', kind: 'selling_point', address: 'Stand 18, Kfardebian, Faraya', date_range: '30 July to 23 August 2026', hours: '12 to 9 PM', sort_order: '4' },
];

const PRODUCT_METAFIELDS = [
  { key: 'item_code', type: 'single_line_text_field', name: 'Item Code' },
  { key: 'status', type: 'single_line_text_field', name: 'Status' },
  { key: 'origin', type: 'single_line_text_field', name: 'Origin' },
  { key: 'summary', type: 'multi_line_text_field', name: 'Summary' },
  { key: 'category', type: 'single_line_text_field', name: 'Category' },
  { key: 'subcategory', type: 'single_line_text_field', name: 'Subcategory' },
  { key: 'collection', type: 'single_line_text_field', name: 'Collection' },
  { key: 'short_description', type: 'multi_line_text_field', name: 'Short Description' },
  { key: 'featured', type: 'boolean', name: 'Featured' },
  { key: 'transmission', type: 'single_line_text_field', name: 'Transmission' },
  { key: 'drop', type: 'single_line_text_field', name: 'Drop' },
  { key: 'file_notes', type: 'multi_line_text_field', name: 'File Notes' },
];

// ── Steps ─────────────────────────────────────────────────────────────────────

async function setupAboutMetaobject() {
  console.log('\n── about_section metaobject ──');

  let def = await getMetaobjectDefinition('about_section');
  if (def) {
    console.log('  definition already exists:', def.id);
  } else {
    def = await createMetaobjectDefinition('About Section', 'about_section', [
      { key: 'label', type: 'single_line_text_field', name: 'Label', required: true },
      { key: 'body', type: 'multi_line_text_field', name: 'Body', required: true },
      { key: 'sort_order', type: 'number_integer', name: 'Sort Order' },
    ]);
    console.log('  created definition:', def.id);
  }

  const existing = await listMetaobjects('about_section');
  const existingLabels = new Set(
    existing.map((o) => o.fields.find((f) => f.key === 'label')?.value).filter(Boolean)
  );
  console.log(`  existing entries: ${existing.length}`);

  let created = 0;
  for (const section of ABOUT_SECTIONS) {
    if (existingLabels.has(section.label)) {
      console.log(`  skip existing: ${section.label}`);
      continue;
    }
    await createMetaobject('about_section', section);
    console.log(`  seeded: ${section.label}`);
    created++;
  }
  if (created === 0 && existing.length > 0) console.log('  all entries already present');
}

async function setupLocationMetaobject() {
  console.log('\n── location_entry metaobject ──');

  let def = await getMetaobjectDefinition('location_entry');
  if (def) {
    console.log('  definition already exists:', def.id);
  } else {
    def = await createMetaobjectDefinition('Location Entry', 'location_entry', [
      { key: 'title', type: 'single_line_text_field', name: 'Title', required: true },
      { key: 'kind', type: 'single_line_text_field', name: 'Kind', required: true },
      { key: 'address', type: 'multi_line_text_field', name: 'Address', required: true },
      { key: 'note', type: 'multi_line_text_field', name: 'Note' },
      { key: 'date_range', type: 'single_line_text_field', name: 'Date Range' },
      { key: 'hours', type: 'single_line_text_field', name: 'Hours' },
      { key: 'sort_order', type: 'number_integer', name: 'Sort Order' },
    ]);
    console.log('  created definition:', def.id);
  }

  const existing = await listMetaobjects('location_entry');
  const existingTitles = new Set(
    existing.map((o) => o.fields.find((f) => f.key === 'title')?.value).filter(Boolean)
  );
  console.log(`  existing entries: ${existing.length}`);

  let created = 0;
  for (const entry of LOCATION_ENTRIES) {
    if (existingTitles.has(entry.title)) {
      console.log(`  skip existing: ${entry.title}`);
      continue;
    }
    const fields = { title: entry.title, kind: entry.kind, address: entry.address, sort_order: entry.sort_order };
    if (entry.note) fields.note = entry.note;
    if (entry.date_range) fields.date_range = entry.date_range;
    if (entry.hours) fields.hours = entry.hours;
    await createMetaobject('location_entry', fields);
    console.log(`  seeded: ${entry.title}`);
    created++;
  }
  if (created === 0 && existing.length > 0) console.log('  all entries already present');
}

async function setupProductMetafields() {
  console.log('\n── product metafield definitions (namespace: lap) ──');

  const existing = await listMetafieldDefinitions('PRODUCT', 'lap');
  const existingKeys = new Set(existing.map((d) => d.key));
  console.log(`  existing definitions: ${existing.length}`);

  let created = 0;
  for (const field of PRODUCT_METAFIELDS) {
    if (existingKeys.has(field.key)) {
      console.log(`  skip existing: lap.${field.key}`);
      continue;
    }
    const result = await createMetafieldDefinition('PRODUCT', 'lap', field.key, field.type, field.name);
    if (result) {
      console.log(`  created: lap.${field.key}`);
      created++;
    } else {
      console.log(`  already existed (key taken): lap.${field.key}`);
    }
  }
  if (created === 0) console.log('  all definitions already present');
}

async function main() {
  console.log(`Shopify CMS setup → ${domain}`);
  await setupAboutMetaobject();
  await setupLocationMetaobject();
  await setupProductMetafields();
  console.log('\n✓ Done.');
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
