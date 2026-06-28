/**
 * Idempotent Shopify CMS setup.
 * Creates about_section + location_entry + archive_entry metaobject definitions.
 * Seeds about + location entries.
 * Creates product + article metafield definitions.
 * Safe to re-run: checks existence before creating.
 */

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = resolve(dirname, '..');

function loadEnvFile(path = resolve(projectRoot, '.env.local')) {
  if (!existsSync(path)) return;

  const content = readFileSync(path, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    if (process.env[key]) continue;

    process.env[key] = rawValue.trim().replace(/^['"]|['"]$/g, '');
  }
}

loadEnvFile();

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const clientId = process.env.SHOPIFY_APP_CLIENT_ID ?? process.env.SHOPIFY_CLIENT_ID;
const clientSecret = process.env.SHOPIFY_APP_CLIENT_SECRET ?? process.env.SHOPIFY_CLIENT_SECRET;
let accessToken =
  clientId && clientSecret
    ? null
    : process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN ?? process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const apiVersion = process.env.SHOPIFY_ADMIN_API_VERSION ?? '2024-01';
const contentNamespace = process.env.SHOPIFY_CONTENT_NAMESPACE ?? 'lap';
const aboutType = process.env.SHOPIFY_ABOUT_METAOBJECT_TYPE ?? 'about_section';
const locationType = process.env.SHOPIFY_LOCATION_METAOBJECT_TYPE ?? 'location_entry';
const archiveType = process.env.SHOPIFY_ARCHIVE_METAOBJECT_TYPE ?? 'archive_entry';

if (!domain) throw new Error('SHOPIFY_STORE_DOMAIN is required');
if (!accessToken && (!clientId || !clientSecret)) {
  throw new Error('SHOPIFY_ADMIN_API_ACCESS_TOKEN or SHOPIFY_APP_CLIENT_ID/SHOPIFY_APP_CLIENT_SECRET is required');
}

const endpoint = `https://${domain}/admin/api/${apiVersion}/graphql.json`;
const accessScopesEndpoint = `https://${domain}/admin/oauth/access_scopes.json`;

const REQUIRED_ADMIN_SCOPES = [
  'read_metaobject_definitions',
  'write_metaobject_definitions',
  'read_metaobjects',
  'write_metaobjects',
  'read_products',
  'write_products',
  'read_content',
  'write_content',
];

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

async function getClientCredentialsAccessToken() {
  if (!clientId || !clientSecret) return null;

  const res = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Unable to get Admin access token from client credentials: ${res.status} ${res.statusText} ${body}`);
  }

  const json = await res.json();
  if (!json.access_token) throw new Error('Client credentials response did not include an access_token');
  return json.access_token;
}

async function getAccessScopes() {
  const res = await fetch(accessScopesEndpoint, {
    headers: {
      'X-Shopify-Access-Token': accessToken,
    },
  });

  if (!res.ok) {
    throw new Error(`Unable to read Admin token scopes: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  return (json.access_scopes ?? []).map((scope) => scope.handle);
}

async function assertRequiredScopes() {
  const scopes = await getAccessScopes();
  const missing = REQUIRED_ADMIN_SCOPES.filter((scope) => !scopes.includes(scope));

  if (missing.length > 0) {
    throw new Error(
      [
        'SHOPIFY_ADMIN_API_ACCESS_TOKEN is missing required scopes:',
        ...missing.map((scope) => `- ${scope}`),
        '',
        'Update the Shopify custom app Admin API scopes, reinstall/save the app, then replace SHOPIFY_ADMIN_API_ACCESS_TOKEN with the new Admin API access token.',
      ].join('\n')
    );
  }
}

// ── Metaobject helpers ────────────────────────────────────────────────────────

async function getMetaobjectDefinition(type) {
  const data = await adminFetch(`
    query GetDef($type: String!) {
      metaobjectDefinitionByType(type: $type) { id type access { storefront } }
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
      access: {
        storefront: 'PUBLIC_READ',
      },
      fieldDefinitions: fields,
    },
  });
  const errs = data.metaobjectDefinitionCreate.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e) => e.message).join(', '));
  return data.metaobjectDefinitionCreate.metaobjectDefinition;
}

async function updateMetaobjectStorefrontAccess(definition) {
  if (definition.access?.storefront === 'PUBLIC_READ') return false;

  const data = await adminFetch(`
    mutation UpdateDef($id: ID!, $def: MetaobjectDefinitionUpdateInput!) {
      metaobjectDefinitionUpdate(id: $id, definition: $def) {
        metaobjectDefinition { id type access { storefront } }
        userErrors { field message }
      }
    }`, {
    id: definition.id,
    def: {
      access: {
        storefront: 'PUBLIC_READ',
      },
    },
  });
  const errs = data.metaobjectDefinitionUpdate.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e) => e.message).join(', '));
  return true;
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
        edges { node { id key namespace type { name } access { storefront } } }
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
    def: {
      ownerType,
      namespace,
      key,
      type,
      name,
      description,
      access: {
        storefront: 'PUBLIC_READ',
      },
    },
  });
  const errs = data.metafieldDefinitionCreate.userErrors ?? [];
  if (errs.length && !errs.some((e) => e.message?.includes('taken'))) {
    throw new Error(errs.map((e) => e.message).join(', '));
  }
  return data.metafieldDefinitionCreate.createdDefinition;
}

async function updateMetafieldStorefrontAccess(definition) {
  if (definition.access?.storefront === 'PUBLIC_READ') return false;

  const data = await adminFetch(`
    mutation UpdateMfd($id: ID!, $def: MetafieldDefinitionUpdateInput!) {
      metafieldDefinitionUpdate(id: $id, definition: $def) {
        updatedDefinition { id key namespace access { storefront } }
        userErrors { field message }
      }
    }`, {
    id: definition.id,
    def: {
      access: {
        storefront: 'PUBLIC_READ',
      },
    },
  });
  const errs = data.metafieldDefinitionUpdate.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e) => e.message).join(', '));
  return true;
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
  { key: 'summary', type: 'multi_line_text_field', name: 'Summary', description: 'Product page summary bullets. Enter one bullet point per line.' },
  { key: 'category', type: 'single_line_text_field', name: 'Category' },
  { key: 'subcategory', type: 'single_line_text_field', name: 'Subcategory' },
  { key: 'collection', type: 'single_line_text_field', name: 'Collection' },
  { key: 'short_description', type: 'multi_line_text_field', name: 'Short Description' },
  { key: 'featured', type: 'boolean', name: 'Featured' },
  { key: 'transmission', type: 'single_line_text_field', name: 'Transmission' },
  { key: 'drop', type: 'single_line_text_field', name: 'Drop' },
  { key: 'file_notes', type: 'multi_line_text_field', name: 'File Notes', description: 'Optional file or graphic notes. Leave blank to hide this panel.' },
];

const ARTICLE_METAFIELDS = [
  { key: 'transmission_id', type: 'single_line_text_field', name: 'Transmission ID' },
  { key: 'channel', type: 'single_line_text_field', name: 'Channel' },
  { key: 'status', type: 'single_line_text_field', name: 'Status' },
  { key: 'location', type: 'single_line_text_field', name: 'Location' },
  { key: 'source', type: 'single_line_text_field', name: 'Source' },
  { key: 'gallery', type: 'list.file_reference', name: 'Gallery' },
];

// ── Steps ─────────────────────────────────────────────────────────────────────

async function setupAboutMetaobject() {
  console.log(`\n── ${aboutType} metaobject ──`);

  let def = await getMetaobjectDefinition(aboutType);
  if (def) {
    console.log('  definition already exists:', def.id);
    if (await updateMetaobjectStorefrontAccess(def)) {
      console.log('  storefront access set to PUBLIC_READ');
    }
  } else {
    def = await createMetaobjectDefinition('About Section', aboutType, [
      { key: 'label', type: 'single_line_text_field', name: 'Label', required: true },
      { key: 'body', type: 'multi_line_text_field', name: 'Body', required: true },
      { key: 'sort_order', type: 'number_integer', name: 'Sort Order' },
    ]);
    console.log('  created definition:', def.id);
  }

  const existing = await listMetaobjects(aboutType);
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
    await createMetaobject(aboutType, section);
    console.log(`  seeded: ${section.label}`);
    created++;
  }
  if (created === 0 && existing.length > 0) console.log('  all entries already present');
}

async function setupLocationMetaobject() {
  console.log(`\n── ${locationType} metaobject ──`);

  let def = await getMetaobjectDefinition(locationType);
  if (def) {
    console.log('  definition already exists:', def.id);
    if (await updateMetaobjectStorefrontAccess(def)) {
      console.log('  storefront access set to PUBLIC_READ');
    }
  } else {
    def = await createMetaobjectDefinition('Location Entry', locationType, [
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

  const existing = await listMetaobjects(locationType);
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
    await createMetaobject(locationType, fields);
    console.log(`  seeded: ${entry.title}`);
    created++;
  }
  if (created === 0 && existing.length > 0) console.log('  all entries already present');
}

async function setupProductMetafields() {
  console.log(`\n── product metafield definitions (namespace: ${contentNamespace}) ──`);

  const existing = await listMetafieldDefinitions('PRODUCT', contentNamespace);
  const existingByKey = new Map(existing.map((d) => [d.key, d]));
  console.log(`  existing definitions: ${existing.length}`);

  let created = 0;
  let updated = 0;
  for (const field of PRODUCT_METAFIELDS) {
    const existingDefinition = existingByKey.get(field.key);
    if (existingDefinition) {
      if (await updateMetafieldStorefrontAccess(existingDefinition)) {
        console.log(`  storefront access set: ${contentNamespace}.${field.key}`);
        updated++;
      } else {
        console.log(`  skip existing: ${contentNamespace}.${field.key}`);
      }
      continue;
    }
    const result = await createMetafieldDefinition('PRODUCT', contentNamespace, field.key, field.type, field.name);
    if (result) {
      console.log(`  created: ${contentNamespace}.${field.key}`);
      created++;
    } else {
      console.log(`  already existed (key taken): ${contentNamespace}.${field.key}`);
    }
  }
  if (created === 0 && updated === 0) console.log('  all definitions already present');
}

async function setupArticleMetafields() {
  console.log(`\n── article metafield definitions (namespace: ${contentNamespace}) ──`);

  const existing = await listMetafieldDefinitions('ARTICLE', contentNamespace);
  const existingByKey = new Map(existing.map((d) => [d.key, d]));
  console.log(`  existing definitions: ${existing.length}`);

  let created = 0;
  let updated = 0;
  for (const field of ARTICLE_METAFIELDS) {
    const existingDefinition = existingByKey.get(field.key);
    if (existingDefinition) {
      if (await updateMetafieldStorefrontAccess(existingDefinition)) {
        console.log(`  storefront access set: ${contentNamespace}.${field.key}`);
        updated++;
      } else {
        console.log(`  skip existing: ${contentNamespace}.${field.key}`);
      }
      continue;
    }
    const result = await createMetafieldDefinition('ARTICLE', contentNamespace, field.key, field.type, field.name);
    if (result) {
      console.log(`  created: ${contentNamespace}.${field.key}`);
      created++;
    } else {
      console.log(`  already existed (key taken): ${contentNamespace}.${field.key}`);
    }
  }
  if (created === 0 && updated === 0) console.log('  all definitions already present');
}

async function setupArchiveMetaobject() {
  console.log(`\n── ${archiveType} metaobject ──`);

  let def = await getMetaobjectDefinition(archiveType);
  if (def) {
    console.log('  definition already exists:', def.id);
    if (await updateMetaobjectStorefrontAccess(def)) {
      console.log('  storefront access set to PUBLIC_READ');
    }
    return;
  }

  def = await createMetaobjectDefinition('Archive Entry', archiveType, [
    { key: 'title', type: 'single_line_text_field', name: 'Title', required: true },
    { key: 'folder', type: 'single_line_text_field', name: 'Folder', required: true },
    { key: 'type', type: 'single_line_text_field', name: 'Type', required: true },
    { key: 'status', type: 'single_line_text_field', name: 'Status' },
    { key: 'summary', type: 'multi_line_text_field', name: 'Summary', required: true },
    { key: 'thumbnail', type: 'file_reference', name: 'Thumbnail' },
    { key: 'href', type: 'single_line_text_field', name: 'Href' },
    { key: 'behavior', type: 'single_line_text_field', name: 'Behavior' },
    { key: 'sort_order', type: 'number_integer', name: 'Sort Order' },
  ]);
  console.log('  created definition:', def.id);
}

async function main() {
  console.log(`Shopify CMS setup → ${domain}`);
  const generatedToken = await getClientCredentialsAccessToken();
  if (generatedToken) {
    accessToken = generatedToken;
    console.log('Using Admin access token generated from Shopify app client credentials.');
  }
  await assertRequiredScopes();
  await setupAboutMetaobject();
  await setupLocationMetaobject();
  await setupArchiveMetaobject();
  await setupProductMetafields();
  await setupArticleMetafields();
  console.log('\n✓ Done.');
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
