import type { Article, Product, ProductCategory, ProductStatus } from '@/lib/types';

export interface SocialLink {
  label: string;
  href: string;
}

export interface ArchiveEntry {
  id: string;
  folder: 'fragments' | 'media' | 'logs' | 'links';
  title: string;
  type: string;
  status: 'AVAILABLE' | 'DEGRADED' | 'LOCKED' | 'MIRROR' | 'CORRUPTED';
  summary: string;
  href?: string;
  thumbnail: string;
  behavior?:
    | 'delayed'
    | 'permission'
    | 'broken-valid-link'
    | 'sub-index'
    | 'locked-teaser'
    | 'repairable';
}

export interface ManifestoBlock {
  label: string;
  body: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  src: string;
  alt: string;
  meta?: string;
}

export const CTA_LINKS: SocialLink[] = [
  {
    label: 'Whatsapp',
    href: 'https://wa.me/message/HOUXU27KJCWAA1',
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/__lapropagande/?hl=en',
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@lapropagande?_r=1&_t=ZN-91tdb97qPHa',
  },
  {
    label: 'Community',
    href: 'https://wa.me/message/HOUXU27KJCWAA1',
  },
  {
    label: 'Archive Insta',
    href: 'https://www.instagram.com/lapropagande.archive?igsh=OWdid2pucG9vNW5m&utm_source=qr',
  },
];

export const FOOTER_LINKS: SocialLink[] = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/__lapropagande?igsh=MTRkOWsydG0zcDEwaQ%3D%3D&utm_source=qr',
  },
  {
    label: 'WhatsApp',
    href: 'https://wa.me/message/HOUXU27KJCWAA1',
  },
];

export const ARCHIVE_FOLLOW_LINK: SocialLink = {
  label: 'FOLLOW THE ARCHIVE',
  href: 'https://www.instagram.com/lapropagande.archive?igsh=OWdid2pucG9vNW5m&utm_source=qr',
};

export const CONTACT_MANIFESTO: ManifestoBlock[] = [
  {
    label: 'Vision',
    body: 'Build a resistance movement where clothing works as a public signal. Every piece should carry identity, defiance, and the courage to speak clearly.',
  },
  {
    label: 'Mission',
    body: 'Design and produce high-quality garments between Beirut and Paris that combine streetwear, military references, and conscious production into wearable statements.',
  },
  {
    label: 'Purpose',
    body: 'Use every drop to challenge passive consumption and trigger conversation, action, and community through culture, design, and direct expression.',
  },
];

export const CUSTOM_JACKETS_GALLERY: GalleryItem[] = [
  {
    id: 'custom-001',
    title: 'Custom Run 001',
    src: '/images/placeholders/product-01.svg',
    alt: 'Custom jacket run 001 placeholder',
    meta: 'PATCHES + PRINTS / CURATED',
  },
  {
    id: 'custom-002',
    title: 'Custom Run 002',
    src: '/images/placeholders/product-02.svg',
    alt: 'Custom jacket run 002 placeholder',
    meta: 'DENIM SHELL / MIXED MEDIA',
  },
  {
    id: 'custom-003',
    title: 'Custom Run 003',
    src: '/images/placeholders/product-03.svg',
    alt: 'Custom jacket run 003 placeholder',
    meta: 'FIELD JACKET / REWORK',
  },
  {
    id: 'custom-004',
    title: 'Custom Run 004',
    src: '/images/placeholders/product-04.svg',
    alt: 'Custom jacket run 004 placeholder',
    meta: 'OVERSIZED FIT / SIGNAL PRINT',
  },
  {
    id: 'custom-005',
    title: 'Custom Run 005',
    src: '/images/placeholders/product-05.svg',
    alt: 'Custom jacket run 005 placeholder',
    meta: 'VINTAGE BASE / PATCH GRID',
  },
  {
    id: 'custom-006',
    title: 'Custom Run 006',
    src: '/images/placeholders/product-06.svg',
    alt: 'Custom jacket run 006 placeholder',
    meta: 'MIXED PATCH SET / MANUAL CONFIRM',
  },
];

const PLACEHOLDER_PRODUCT_SPECS: Array<{
  title: string;
  handle: string;
  itemCode: string;
  status: ProductStatus;
  category: 'tops' | 'bottoms' | 'accessories';
  subcategory: string;
  collection: string;
  shortDescription: string;
  featured?: boolean;
  origin: string;
  price: string;
  summary: string;
  description: string;
  productType: string;
  images: string[];
}> = [
  {
    title: 'Signal Uniform Tee',
    handle: 'signal-uniform-tee',
    itemCode: 'LP-26-001',
    status: 'AVAILABLE',
    category: 'tops',
    subcategory: 'tees',
    collection: 'Drop 001: Wake Up',
    shortDescription: 'Daily field tee with route print.',
    origin: 'BEIRUT',
    price: '65.00',
    summary: 'Primary field layer for day transmission work.',
    description:
      '<p>Signal Uniform Tee is the base layer for routine broadcast operations. Constructed as a lightweight shell for hot-node movement and city-to-node transitions.</p><p>Fit is direct. Print language keeps references visible without flattening the garment into a simple logo tee.</p><p>FILE NOTES: Batch 01, dye variance expected due to degradation wash.</p>',
    productType: 'T-SHIRT',
    images: ['/images/placeholders/product-01.svg', '/images/placeholders/product-02.svg', '/images/placeholders/product-03.svg'],
  },
  {
    title: 'Broadcast Mesh Top',
    handle: 'broadcast-mesh-top',
    itemCode: 'LP-26-002',
    status: 'LIMITED',
    category: 'tops',
    subcategory: 'jerseys',
    collection: 'Drop 002: Signal Loss',
    shortDescription: 'Layered mesh for transmission nights.',
    origin: 'PARIS',
    price: '78.00',
    summary: 'Layered mesh intended for event transmissions.',
    description:
      '<p>Broadcast Mesh Top was developed for stage proximity and late-hour activations. The panel print indexes transmission coordinates across front and sleeve zones.</p><p>Limited run tied to Spring Broadcast sessions.</p><p>FILE NOTES: Visibility reacts to under-layer contrast.</p>',
    productType: 'TOP',
    images: ['/images/placeholders/product-02.svg', '/images/placeholders/product-04.svg', '/images/placeholders/product-05.svg'],
  },
  {
    title: 'Utility Cargo Module',
    handle: 'utility-cargo-module',
    itemCode: 'LP-26-003',
    status: 'AVAILABLE',
    category: 'bottoms',
    subcategory: 'pants',
    collection: 'Signal Pieces',
    shortDescription: 'Utility cargo pants for field runs.',
    featured: true,
    origin: 'HYBRID NODE',
    price: '120.00',
    summary: 'Utility cargo unit for field retrieval runs.',
    description:
      '<p>Utility Cargo Module applies tactical storage logic to daily uniform wear. Side pockets are mapped to media, docs, and small-node tools.</p><p>Designed for field movement between warehouse, market, and event points.</p><p>FILE NOTES: Reinforced seams on stress points.</p>',
    productType: 'CARGO',
    images: ['/images/placeholders/product-03.svg', '/images/placeholders/product-06.svg', '/images/placeholders/product-01.svg'],
  },
  {
    title: 'Node Cap 01',
    handle: 'node-cap-01',
    itemCode: 'LP-26-004',
    status: 'SOLD_OUT',
    category: 'accessories',
    subcategory: 'hats',
    collection: 'Drop 002: Signal Loss',
    shortDescription: 'Sold out cap from partner release.',
    origin: 'PARIS',
    price: '42.00',
    summary: 'Restricted drop cap released through node partners.',
    description:
      '<p>Node Cap 01 is a lock-state accessory opened only during announced transmission windows.</p><p>The outer embroidery references LP_PAR-BEY routing and includes internal file tagging on the sweatband.</p><p>FILE NOTES: Access state rotates per release cycle.</p>',
    productType: 'ACCESSORY',
    images: ['/images/placeholders/product-04.svg', '/images/placeholders/product-05.svg'],
  },
  {
    title: 'Transmission Hoodie',
    handle: 'transmission-hoodie',
    itemCode: 'LP-26-005',
    status: 'LIMITED',
    category: 'tops',
    subcategory: 'hoodies',
    collection: 'Drop 002: Signal Loss',
    shortDescription: 'Heavy hoodie built for night sessions.',
    featured: true,
    origin: 'BEIRUT',
    price: '145.00',
    summary: 'Heavyweight hooded shell for night operations.',
    description:
      '<p>Transmission Hoodie is built as outer shell for low-temperature node activity. Sleeve annotations log coordinates and signal status markers.</p><p>Interior lining uses contrast thread maps tied to recovered signal fragments.</p><p>FILE NOTES: Pre-shrunk with structured drape.</p>',
    productType: 'HOODIE',
    images: ['/images/placeholders/product-05.svg', '/images/placeholders/product-02.svg', '/images/placeholders/product-06.svg'],
  },
  {
    title: 'Fragment Tank',
    handle: 'fragment-tank',
    itemCode: 'LP-26-006',
    status: 'AVAILABLE',
    category: 'tops',
    subcategory: 'tees',
    collection: 'Drop 001: Wake Up',
    shortDescription: 'Lightweight tank from fragment series.',
    origin: 'HYBRID NODE',
    price: '55.00',
    summary: 'Sleeveless under-layer from fragment series.',
    description:
      '<p>Fragment Tank is cut for high mobility and layered combinations. Graphic treatment references degraded index snapshots recovered from LP logs.</p><p>Designed for warm-weather city wear and dance-floor deployments.</p><p>FILE NOTES: Wash softens print crack texture over time.</p>',
    productType: 'TANK',
    images: ['/images/placeholders/product-06.svg', '/images/placeholders/product-01.svg'],
  },
  {
    title: 'Operator Long Sleeve',
    handle: 'operator-long-sleeve',
    itemCode: 'LP-26-007',
    status: 'AVAILABLE',
    category: 'tops',
    subcategory: 'long-sleeves',
    collection: 'Drop 001: Wake Up',
    shortDescription: 'Long sleeve with control-route graphics.',
    origin: 'PARIS',
    price: '92.00',
    summary: 'Long sleeve control layer with route stamps.',
    description:
      '<p>Operator Long Sleeve carries command language across sleeve and torso panels. It is designed as a transitional layer between uniform tee and outerwear modules.</p><p>Machine-cut pattern keeps silhouette straight and utilitarian.</p><p>FILE NOTES: Responsive print remains legible under strobe lighting.</p>',
    productType: 'LONG SLEEVE',
    images: ['/images/placeholders/product-01.svg', '/images/placeholders/product-03.svg', '/images/placeholders/product-04.svg'],
  },
  {
    title: 'Index Tote',
    handle: 'index-tote',
    itemCode: 'LP-26-008',
    status: 'LIMITED',
    category: 'accessories',
    subcategory: 'bags',
    collection: 'Signal Pieces',
    shortDescription: 'Carry bag for flyers and records.',
    origin: 'BEIRUT',
    price: '48.00',
    summary: 'Carry unit for zines, flyers, and recovered media.',
    description:
      '<p>Index Tote was developed for events and field runs. External panel hosts transmission ID blocks while inner liner stores document sleeves.</p><p>Works as a daily carry for movement between stations.</p><p>FILE NOTES: Limited batch tied to bulletin cycle 03.</p>',
    productType: 'ACCESSORY',
    images: ['/images/placeholders/product-02.svg', '/images/placeholders/product-05.svg'],
  },
];

function placeholderProduct(spec: (typeof PLACEHOLDER_PRODUCT_SPECS)[number], index: number): Product {
  return {
    id: `placeholder-product-${index + 1}`,
    title: spec.title,
    handle: spec.handle,
    description: spec.summary,
    descriptionHtml: spec.description,
    productType: spec.productType,
    lpMeta: {
      itemCode: spec.itemCode,
      status: spec.status,
      origin: spec.origin,
      summary: spec.summary,
      category: spec.category,
      subcategory: spec.subcategory,
      collection: spec.collection,
      shortDescription: spec.shortDescription,
      featured: spec.featured,
      transmission: `TX-${String(index + 1).padStart(3, '0')}`,
      drop: `DROP-${String(index + 1).padStart(2, '0')}`,
      fileNotes: `Placeholder record ${index + 1}`,
    },
    priceRange: {
      minVariantPrice: {
        amount: spec.price,
        currencyCode: 'USD',
      },
      maxVariantPrice: {
        amount: spec.price,
        currencyCode: 'USD',
      },
    },
    images: {
      edges: spec.images.map((url, imageIndex) => ({
        node: {
          url,
          altText: `${spec.title} placeholder ${imageIndex + 1}`,
          width: 1080,
          height: 1350,
        },
      })),
    },
    variants: {
      edges: [
        {
          node: {
            id: `placeholder-variant-${index + 1}-s`,
            title: 'SIZE S',
            availableForSale: spec.status === 'AVAILABLE' || spec.status === 'LIMITED',
            price: {
              amount: spec.price,
              currencyCode: 'USD',
            },
            selectedOptions: [
              {
                name: 'Size',
                value: 'S',
              },
            ],
          },
        },
        {
          node: {
            id: `placeholder-variant-${index + 1}-m`,
            title: 'SIZE M',
            availableForSale: spec.status === 'AVAILABLE' || spec.status === 'LIMITED',
            price: {
              amount: spec.price,
              currencyCode: 'USD',
            },
            selectedOptions: [
              {
                name: 'Size',
                value: 'M',
              },
            ],
          },
        },
        {
          node: {
            id: `placeholder-variant-${index + 1}-l`,
            title: 'SIZE L',
            availableForSale: spec.status === 'AVAILABLE',
            price: {
              amount: spec.price,
              currencyCode: 'USD',
            },
            selectedOptions: [
              {
                name: 'Size',
                value: 'L',
              },
            ],
          },
        },
      ],
    },
  };
}

export const PLACEHOLDER_PRODUCTS: Product[] = PLACEHOLDER_PRODUCT_SPECS.map((spec, index) => placeholderProduct(spec, index));

type EventSeedStatus = 'LIVE' | 'COMPLETE' | 'UPCOMING';
type EventSeedCategory = 'EVENT' | 'POPUP' | 'COLLABORATION' | 'FIELD_NOTE';

interface EventSeedPost {
  id: string;
  title: string;
  handle: string;
  publishedAt: string;
  status: EventSeedStatus;
  category: EventSeedCategory;
  summary: string;
  body: string[];
  coverImage: string;
  gallery?: string[];
  location: string;
  source: string;
  transmissionId: string;
  author: string;
}

function mapSeedImage(url: string, altText: string) {
  return {
    url,
    altText,
    width: 1200,
    height: 1600,
  };
}

function mapSeedPost(post: EventSeedPost): Article {
  const cover = mapSeedImage(post.coverImage, `${post.title} cover`);
  const galleryUrls = post.gallery && post.gallery.length > 0 ? post.gallery : [post.coverImage];

  return {
    id: post.id,
    title: post.title,
    handle: post.handle,
    excerpt: post.summary,
    publishedAt: post.publishedAt,
    tags: [post.category],
    lpMeta: {
      transmissionId: post.transmissionId,
      channel: post.category,
      status: post.status,
      location: post.location,
      source: post.source,
    },
    image: cover,
    lpGallery: galleryUrls.map((url, index) => mapSeedImage(url, `${post.title} gallery ${index + 1}`)),
    author: { name: post.author },
    contentHtml: post.body.map((paragraph) => `<p>${paragraph}</p>`).join(''),
  };
}

const EVENT_SEED_POSTS: EventSeedPost[] = [
  {
    id: 'la-propagande-x-maddina-market',
    title: 'La Propagande x Maddina Market',
    handle: 'la-propagande-x-maddina-market',
    publishedAt: '2025-11-15T18:00:00.000Z',
    status: 'LIVE',
    category: 'COLLABORATION',
    summary: 'A live market activation merging clothing, atmosphere, and local energy into a street-level La Propagande transmission.',
    body: [
      'La Propagande entered Maddina Market as a live node rather than a standard brand booth.',
      'The event mixed garments, direct contact, and cultural signal into a temporary physical broadcast.',
      'Use this entry as a model for future popup and market event pages.',
    ],
    coverImage: '/images/events/maddina_market_01.webp',
    gallery: ['/images/events/maddina_market_01.webp'],
    location: 'BEIRUT',
    source: 'FIELD_NODE_MADDINA',
    transmissionId: 'TX-9101',
    author: 'La Propagande Node',
  },
  {
    id: 'colonel-reef-popup',
    title: 'Colonel Reef Popup',
    handle: 'colonel-reef-popup',
    publishedAt: '2025-09-06T19:30:00.000Z',
    status: 'LIVE',
    category: 'POPUP',
    summary: 'A popup format event staged as a temporary signal point for the brand.',
    body: [
      'Colonel Reef Popup was staged as a short-duration field activation with direct garment access and live contact.',
      'This transmission keeps recap copy compact while preserving timestamp, location, and visual evidence for future CMS entries.',
      'The recovered flyer is pinned as the cover and can be replaced with event galleries once publishing tools are configured.',
    ],
    coverImage: '/images/events/colonel_reef_01.webp',
    gallery: ['/images/events/colonel_reef_01.webp'],
    location: 'PARIS',
    source: 'POPUP_RELAY',
    transmissionId: 'TX-9102',
    author: 'Field Team',
  },
  {
    id: 'la-propagande-x-beatretreat',
    title: 'La Propagande x Beatretreat',
    handle: 'la-propagande-x-beatretreat',
    publishedAt: '2025-07-19T22:10:00.000Z',
    status: 'LIVE',
    category: 'COLLABORATION',
    summary: 'A collaboration event framed as a field transmission rather than a polished campaign report.',
    body: [
      'Beatretreat activation leaned into atmosphere, movement, and a dense night-cycle crowd.',
      'Coverage format stays operational: one recap block, one hero flyer, and optional gallery expansion later.',
      'This post is seeded as a reference-ready collaboration template for upcoming event records.',
    ],
    coverImage: '/images/events/beatretreat_01.webp',
    gallery: ['/images/events/beatretreat_01.webp'],
    location: 'PARIS',
    source: 'BEATRELAY_CHANNEL',
    transmissionId: 'TX-9103',
    author: 'Night Operations',
  },
  {
    id: 'drop-001-launch-signal',
    title: 'Drop 001 Launch Signal',
    handle: 'drop-001-launch-signal',
    publishedAt: '2025-05-30T17:20:00.000Z',
    status: 'COMPLETE',
    category: 'EVENT',
    summary: 'Launch-day bulletin for Drop 001 with confirmed route handoffs and opening queue logs.',
    body: [
      'Drop 001 opened with staggered release windows and live command prompts across on-site terminals.',
      'Queue behavior remained stable and the first cycle sold through core sizes before midnight.',
    ],
    coverImage: '/images/placeholders/post-01.svg',
    gallery: ['/images/placeholders/post-01.svg', '/images/placeholders/post-02.svg'],
    location: 'PARIS',
    source: 'DROP_COMMAND',
    transmissionId: 'TX-9104',
    author: 'System Operator',
  },
  {
    id: 'beirut-night-transmission',
    title: 'Beirut Night Transmission',
    handle: 'beirut-night-transmission',
    publishedAt: '2025-04-22T23:40:00.000Z',
    status: 'COMPLETE',
    category: 'FIELD_NOTE',
    summary: 'Street-level field note from Beirut with route density, response timing, and recap signals.',
    body: [
      'Field operators logged high response in the first hour, especially around mixed music and apparel nodes.',
      'Signal quality stayed strong through late hours, confirming active route memory across neighborhoods.',
    ],
    coverImage: '/images/placeholders/post-02.svg',
    gallery: ['/images/placeholders/post-02.svg'],
    location: 'BEIRUT',
    source: 'FIELD_NOTE_BEY',
    transmissionId: 'TX-9105',
    author: 'Operations Desk',
  },
  {
    id: 'paris-field-notes',
    title: 'Paris Field Notes',
    handle: 'paris-field-notes',
    publishedAt: '2025-03-09T14:10:00.000Z',
    status: 'COMPLETE',
    category: 'FIELD_NOTE',
    summary: 'Compact field notes from Paris on movement patterns, crowd pacing, and flyer response.',
    body: [
      'The team focused on short route loops between partner points to avoid overlap and keep distribution clean.',
      'Flyer scans and in-person pull-through stayed aligned with expected baseline for this cycle.',
    ],
    coverImage: '/images/placeholders/post-03.svg',
    gallery: ['/images/placeholders/post-03.svg', '/images/placeholders/post-04.svg'],
    location: 'PARIS',
    source: 'FIELD_NOTE_PAR',
    transmissionId: 'TX-9106',
    author: 'Field Team',
  },
  {
    id: 'recovery-session',
    title: 'Recovery Session',
    handle: 'recovery-session',
    publishedAt: '2025-02-01T10:00:00.000Z',
    status: 'UPCOMING',
    category: 'EVENT',
    summary: 'Upcoming recovery-focused session for media restoration, flyer indexing, and open record review.',
    body: [
      'Recovery Session is staged as an open maintenance window with structured walkthroughs of recovered records.',
      'The session entry is intentionally concise so CMS editors can later replace timing, location, and call-to-action blocks.',
    ],
    coverImage: '/images/placeholders/post-05.svg',
    gallery: ['/images/placeholders/post-05.svg'],
    location: 'MIRROR NODE',
    source: 'RECOVERY_NODE',
    transmissionId: 'TX-9107',
    author: 'Archive Operator',
  },
];

const LEGACY_FALLBACK_ARTICLES: Article[] = [
  {
    id: 'channel-open-spring-broadcast',
    title: 'Channel Open: Spring Broadcast',
    handle: 'channel-open-spring-broadcast',
    excerpt: 'Seasonal node activation across Paris and Beirut.',
    publishedAt: '2026-03-18T20:30:00.000Z',
    tags: ['EVENT', 'LIVE'],
    lpMeta: {
      transmissionId: 'TX-8801',
      channel: 'EVENT',
      status: 'ACTIVE',
      location: 'PARIS',
      source: 'LP_PAR_BROADCAST',
    },
    image: {
      url: '/images/placeholders/post-01.svg',
      altText: 'Spring broadcast flyer',
      width: 1200,
      height: 1600,
    },
    lpGallery: [
      { url: '/images/placeholders/post-01.svg', altText: 'Flyer', width: 1200, height: 1600 },
      { url: '/images/placeholders/post-02.svg', altText: 'Crowd capture', width: 1200, height: 1600 },
    ],
    author: { name: 'La Propagande Node' },
    contentHtml:
      '<p>Spring Broadcast opened with a hard reset of channel protocols and a visible return to direct public transmission formats.</p><h3>Node Activation</h3><p>Street-level flyers were deployed first, followed by controlled release of event coordinates through private channels.</p><h3>Response Window</h3><p>Attendance crossed expected volume within 40 minutes, confirming healthy route memory between communities.</p><blockquote>"No passive audience. Every body in the room is part of the signal path."</blockquote><h3>Next Packet</h3><p>A follow-up drop will be announced through bulletin rail only.</p>',
  },
  {
    id: 'node-update-beirut',
    title: 'Node Update from Beirut',
    handle: 'node-update-beirut',
    excerpt: 'Infrastructure patch and production sync update.',
    publishedAt: '2026-03-07T16:00:00.000Z',
    tags: ['UPDATE'],
    lpMeta: {
      transmissionId: 'TX-8802',
      channel: 'UPDATE',
      status: 'STABLE',
      location: 'BEIRUT',
      source: 'LP_BEY_OPERATIONS',
    },
    image: {
      url: '/images/placeholders/post-02.svg',
      altText: 'Beirut node update poster',
      width: 1200,
      height: 1600,
    },
    lpGallery: [{ url: '/images/placeholders/post-02.svg', altText: 'Beirut update', width: 1200, height: 1600 }],
    author: { name: 'Operations Desk' },
    contentHtml:
      '<p>Beirut node reports stable supply chain and completed maintenance on local production tooling.</p><h3>Repair Notes</h3><p>Two older print units were retired and replaced, reducing output variance during high-volume runs.</p><h3>Material Access</h3><p>New textile lots cleared inbound controls and entered active use this week.</p><blockquote>"Function before optics. Reliability is style."</blockquote><h3>Coordination</h3><p>Paris and Beirut schedules are now synchronized for drop windows.</p>',
  },
  {
    id: 'flyer-drop-paris-night-transmission',
    title: 'Flyer Drop: Paris Night Transmission',
    handle: 'flyer-drop-paris-night-transmission',
    excerpt: 'Night-cycle flyer deployment log and route map.',
    publishedAt: '2026-02-26T23:15:00.000Z',
    tags: ['DROP'],
    lpMeta: {
      transmissionId: 'TX-8803',
      channel: 'DROP',
      status: 'COMPLETE',
      location: 'PARIS',
      source: 'FIELD_TEAM_ALPHA',
    },
    image: {
      url: '/images/placeholders/post-03.svg',
      altText: 'Night transmission flyer',
      width: 1200,
      height: 1600,
    },
    lpGallery: [
      { url: '/images/placeholders/post-03.svg', altText: 'Night flyer', width: 1200, height: 1600 },
      { url: '/images/placeholders/post-04.svg', altText: 'Street placement', width: 1200, height: 1600 },
    ],
    author: { name: 'Field Team' },
    contentHtml:
      '<p>Night Transmission campaign covered dense urban routes with high-contrast flyer assets optimized for low-light readability.</p><h3>Distribution Pattern</h3><p>Teams worked in mirrored loops to avoid overlap and preserve time efficiency.</p><h3>Scan Metrics</h3><p>QR endpoints showed strong early uptake in the first 10 hours.</p><blockquote>"Paper still carries weight when the message is sharp."</blockquote><h3>Aftermath</h3><p>Secondary assets now route users into restricted preview routes.</p>',
  },
  {
    id: 'recovery-log-01',
    title: 'Recovery Log 01',
    handle: 'recovery-log-01',
    excerpt: 'Initial recovery report from degraded vault segments.',
    publishedAt: '2026-02-20T14:45:00.000Z',
    tags: ['BULLETIN'],
    lpMeta: {
      transmissionId: 'TX-8804',
      channel: 'BULLETIN',
      status: 'DEGRADED',
      location: 'MIRROR NODE',
      source: 'RECOVERY_MAINTENANCE',
    },
    image: {
      url: '/images/placeholders/post-04.svg',
      altText: 'Recovery log cover',
      width: 1200,
      height: 1600,
    },
    lpGallery: [{ url: '/images/placeholders/post-04.svg', altText: 'Recovery preview', width: 1200, height: 1600 }],
    author: { name: 'Recovery Operator' },
    contentHtml:
      '<p>Recovery Log 01 confirms partial restoration of the fragments branch and a limited return of cross-linked media references.</p><h3>Integrity Status</h3><p>Current restoration stands at 24 percent. Corruption remains concentrated in legacy index records.</p><h3>Locked Files</h3><p>Several entries are now visible but remain permission-gated.</p><blockquote>"Corruption is not deletion. It is a challenge layer."</blockquote><h3>Next Action</h3><p>Operators will continue checksum rebuilds through the weekend window.</p>',
  },
  {
    id: 'public-terminal-bulletin',
    title: 'Public Terminal Bulletin',
    handle: 'public-terminal-bulletin',
    excerpt: 'Open access bulletin for public routing commands.',
    publishedAt: '2026-02-11T11:00:00.000Z',
    tags: ['BROADCAST'],
    lpMeta: {
      transmissionId: 'TX-8805',
      channel: 'BROADCAST',
      status: 'ACTIVE',
      location: 'PUBLIC TERMINAL',
      source: 'ROOT://LP',
    },
    image: {
      url: '/images/placeholders/post-05.svg',
      altText: 'Terminal bulletin card',
      width: 1200,
      height: 1600,
    },
    lpGallery: [{ url: '/images/placeholders/post-05.svg', altText: 'Terminal bulletin', width: 1200, height: 1600 }],
    author: { name: 'System Operator' },
    contentHtml:
      '<p>Public Terminal Bulletin formalizes the command pathways available for first-time visitors to the LP interface.</p><h3>Primary Commands</h3><p>Store, Events, About, and Contact remain visible on every route to preserve orientation.</p><h3>Deep Index Discovery</h3><p>The deep index remains hidden in primary navigation and can only be reached through command responses.</p><blockquote>"Hidden is not broken. Hidden is deliberate."</blockquote><h3>Visitor Guidance</h3><p>New session prompts now announce restoration and access status without disclosing full index paths.</p>',
  },
  {
    id: 'system-notice-restricted-access-window',
    title: 'System Notice: Restricted Access Window',
    handle: 'system-notice-restricted-access-window',
    excerpt: 'Access controls rotating for recovery containment.',
    publishedAt: '2026-02-03T09:20:00.000Z',
    tags: ['UPDATE'],
    lpMeta: {
      transmissionId: 'TX-8806',
      channel: 'UPDATE',
      status: 'RESTRICTED',
      location: 'RECOVERY GATEWAY',
      source: 'SECURITY NODE',
    },
    image: {
      url: '/images/placeholders/post-06.svg',
      altText: 'Restricted access notice',
      width: 1200,
      height: 1600,
    },
    lpGallery: [
      { url: '/images/placeholders/post-06.svg', altText: 'Access notice', width: 1200, height: 1600 },
      { url: '/images/placeholders/post-03.svg', altText: 'Warning sheet', width: 1200, height: 1600 },
    ],
    author: { name: 'Security Relay' },
    contentHtml:
      '<p>Restricted Access Window has been enabled while integrity checks run across mirrored recovery blocks.</p><h3>Scope</h3><p>Locks impact select logs and link mirrors. Fragments and public media remain partially visible.</p><h3>Why It Matters</h3><p>Containment prevents stale mirrors from propagating damaged references.</p><blockquote>"A short lock now prevents a long outage later."</blockquote><h3>Resolution Path</h3><p>Status labels will update in real time as checks complete.</p>',
  },
];

export const FALLBACK_ARTICLES: Article[] = [...EVENT_SEED_POSTS.map(mapSeedPost), ...LEGACY_FALLBACK_ARTICLES];
export const EVENT_FALLBACK_POSTS: Article[] = EVENT_SEED_POSTS.slice(0, 3).map(mapSeedPost);

export const ARCHIVE_ENTRIES: ArchiveEntry[] = [
  {
    id: 'arc-001',
    folder: 'fragments',
    title: 'MK Ultra',
    type: 'REPORT',
    status: 'LOCKED',
    summary: 'Summary of CIA experiments on mind control.',
    thumbnail: '/images/placeholders/archive-01.svg',
  },
  {
    id: 'arc-002',
    folder: 'fragments',
    title: 'Death of Che Guevara',
    type: 'REPORT',
    status: 'AVAILABLE',
    summary: 'CIA report on the death of Che Guevara.',
    thumbnail: '/images/placeholders/archive-02.svg',
  },
  {
    id: 'arc-003',
    folder: 'fragments',
    title: 'Operation Northwoods',
    type: 'DOSSIER',
    status: 'LOCKED',
    summary: 'Proposed false flag operation to spark war in Cuba.',
    thumbnail: '/images/placeholders/archive-03.svg',
  },
  {
    id: 'arc-004',
    folder: 'media',
    title: 'MK Ultra Select Committee of Intelligence',
    type: 'PDF',
    status: 'AVAILABLE',
    summary: 'Summary of CIA experimentation on mind control techniques presented to the Select Committee of Intelligence.',
    href: 'https://www.intelligence.senate.gov/wp-content/uploads/2024/08/sites-default-files-hearings-95mkultra.pdf',
    thumbnail: '/images/placeholders/archive-04.svg',
  },
  {
    id: 'arc-005',
    folder: 'media',
    title: 'The Californian Ideology',
    type: 'PDF',
    status: 'AVAILABLE',
    summary: 'Essay critic of "dotcom neoliberalism".',
    href: 'https://monoskop.org/images/d/dc/Barbrook_Richard_Cameron_Andy_1996_The_Californian_Ideology.pdf',
    thumbnail: '/images/placeholders/archive-05.svg',
  },
  {
    id: 'arc-006',
    folder: 'media',
    title: 'As We May Think',
    type: 'PDF',
    status: 'AVAILABLE',
    summary: 'Artificial Intelligence predictions from 1945.',
    href: 'https://worrydream.com/refs/Bush%20-%20As%20We%20May%20Think%20(Life%20Magazine%209-10-1945).pdf',
    thumbnail: '/images/placeholders/archive-06.svg',
  },
  {
    id: 'arc-007',
    folder: 'logs',
    title: 'The Cyborg Manifesto',
    type: 'PDF',
    status: 'AVAILABLE',
    summary: 'Socialist-Feminist essay on the internet era.',
    href: 'https://warwick.ac.uk/fac/arts/english/currentstudents/undergraduates/modules/fictionnownarrativemediaandtheoryinthe21stcentury/manifestly_haraway_----_a_cyborg_manifesto_science_technology_and_socialist-feminism_in_the_....pdf',
    thumbnail: '/images/placeholders/archive-07.svg',
  },
  {
    id: 'arc-008',
    folder: 'logs',
    title: 'The Cypherpunk Manifesto',
    type: 'ESSAY',
    status: 'AVAILABLE',
    summary: 'Privacy and security in the modern age. Foundational document for the cypherpunk movement.',
    href: 'https://www.activism.net/cypherpunk/manifesto.html',
    thumbnail: '/images/placeholders/archive-08.svg',
  },
  {
    id: 'arc-009',
    folder: 'logs',
    title: 'Torrenting Guide',
    type: 'GUIDE',
    status: 'AVAILABLE',
    summary: 'Sail the seas.',
    href: 'https://easyussr.neocities.org/torrenting',
    thumbnail: '/images/placeholders/archive-09.svg',
  },
  {
    id: 'arc-010',
    folder: 'links',
    title: 'OSINT Framework',
    type: 'INDEX',
    status: 'AVAILABLE',
    summary: 'Open Source Intelligence basics guide.',
    href: 'https://osintframework.com',
    thumbnail: '/images/placeholders/archive-10.svg',
  },
];

export interface ProductCatalogMeta {
  category: ProductCategory;
  subcategory?: string;
  collection?: string;
  shortDescription: string;
  status: ProductStatus;
  featured: boolean;
}

function inferProductCategory(product: Product): ProductCategory {
  if (product.lpMeta?.category) return product.lpMeta.category;

  const haystack = `${product.productType} ${product.title}`.toLowerCase();
  if (/(custom|jacket)/.test(haystack)) return 'custom-jackets';
  if (/(accessory|hat|cap|bag|patch|goods)/.test(haystack)) return 'accessories';
  if (/(pants|shorts|denim|cargo|bottom)/.test(haystack)) return 'bottoms';
  return 'tops';
}

function inferProductSubcategory(product: Product, category: ProductCategory): string | undefined {
  if (product.lpMeta?.subcategory) return product.lpMeta.subcategory;

  const haystack = `${product.productType} ${product.title}`.toLowerCase();
  if (category === 'tops') {
    if (/(long sleeve)/.test(haystack)) return 'long-sleeves';
    if (/(hoodie)/.test(haystack)) return 'hoodies';
    if (/(jersey|mesh)/.test(haystack)) return 'jerseys';
    if (/(jacket|outerwear)/.test(haystack)) return 'outerwear';
    return 'tees';
  }
  if (category === 'bottoms') {
    if (/(shorts)/.test(haystack)) return 'shorts';
    if (/(denim|jean)/.test(haystack)) return 'denim';
    return 'pants';
  }
  if (category === 'accessories') {
    if (/(hat|cap)/.test(haystack)) return 'hats';
    if (/(bag|tote)/.test(haystack)) return 'bags';
    if (/(patch)/.test(haystack)) return 'patches';
    return 'small-goods';
  }
  return undefined;
}

function inferCollection(product: Product, category: ProductCategory): string | undefined {
  if (product.lpMeta?.collection) return product.lpMeta.collection;
  if (category === 'custom-jackets') return 'Custom Jackets';
  return product.lpMeta?.drop ?? undefined;
}

function inferStatus(product: Product): ProductStatus {
  if (product.lpMeta?.status) return product.lpMeta.status;
  const hasStock = product.variants.edges.some((edge) => edge.node.availableForSale);
  return hasStock ? 'AVAILABLE' : 'SOLD_OUT';
}

export function getProductCatalogMeta(product: Product): ProductCatalogMeta {
  const category = inferProductCategory(product);
  const shortDescription =
    product.lpMeta?.shortDescription ??
    product.lpMeta?.summary ??
    product.description?.trim() ??
    'No summary available.';

  return {
    category,
    subcategory: inferProductSubcategory(product, category),
    collection: inferCollection(product, category),
    shortDescription,
    status: inferStatus(product),
    featured: Boolean(product.lpMeta?.featured),
  };
}

export function getFallbackArticle(handle: string): Article | null {
  return FALLBACK_ARTICLES.find((article) => article.handle === handle) ?? null;
}

export function getFallbackProduct(handle: string): Product | null {
  return PLACEHOLDER_PRODUCTS.find((product) => product.handle === handle) ?? null;
}

function normalizeProduct(product: Product): Product {
  const meta = getProductCatalogMeta(product);
  return {
    ...product,
    lpMeta: {
      itemCode: product.lpMeta?.itemCode ?? `LP-${product.handle.slice(0, 8).toUpperCase()}`,
      origin: product.lpMeta?.origin ?? 'HYBRID NODE',
      summary: product.lpMeta?.summary ?? product.description ?? meta.shortDescription,
      transmission: product.lpMeta?.transmission,
      drop: product.lpMeta?.drop,
      fileNotes: product.lpMeta?.fileNotes,
      status: meta.status,
      category: meta.category,
      subcategory: meta.subcategory,
      collection: meta.collection,
      shortDescription: meta.shortDescription,
      featured: meta.featured,
    },
  };
}

export function ensurePlaceholderProducts(products: Product[]): Product[] {
  const normalized = products.map(normalizeProduct);
  if (normalized.length >= PLACEHOLDER_PRODUCTS.length) return normalized;
  const existingHandles = new Set(normalized.map((product) => product.handle));
  const missing = PLACEHOLDER_PRODUCTS.filter((product) => !existingHandles.has(product.handle));
  return [...normalized, ...missing];
}

function normalizeArticle(post: Article, index: number): Article {
  const fallback = getFallbackArticle(post.handle) ?? FALLBACK_ARTICLES[index % FALLBACK_ARTICLES.length];
  const normalizedImage = post.image ?? fallback.image;
  const normalizedTags = post.tags.length > 0 ? post.tags : fallback.tags;
  const metaSeed = {
    transmissionId: fallback.lpMeta?.transmissionId ?? `TX-FALLBACK-${String(index + 1).padStart(2, '0')}`,
    channel: fallback.lpMeta?.channel ?? normalizedTags[0] ?? 'BULLETIN',
    status: fallback.lpMeta?.status ?? 'ACTIVE',
    location: fallback.lpMeta?.location ?? 'PARIS',
    source: fallback.lpMeta?.source ?? fallback.author.name ?? 'SYSTEM NODE',
  };

  return {
    ...post,
    excerpt: post.excerpt || fallback.excerpt,
    contentHtml: post.contentHtml.trim() ? post.contentHtml : fallback.contentHtml,
    publishedAt: post.publishedAt || fallback.publishedAt,
    tags: normalizedTags,
    author: post.author?.name ? post.author : fallback.author,
    image: normalizedImage,
    lpGallery: post.lpGallery?.length ? post.lpGallery : normalizedImage ? [normalizedImage, ...(fallback.lpGallery?.slice(1) ?? [])] : fallback.lpGallery,
    lpMeta: {
      ...metaSeed,
      ...(post.lpMeta ?? {}),
      channel: post.lpMeta?.channel ?? normalizedTags[0] ?? metaSeed.channel,
      source: post.lpMeta?.source ?? post.author?.name ?? metaSeed.source,
    },
  };
}

export function normalizeArticleForTransmission(post: Article): Article {
  return normalizeArticle(post, 0);
}

export function ensurePlaceholderPosts(posts: Article[]): Article[] {
  const normalized = posts.map((post, index) => normalizeArticle(post, index));
  if (normalized.length >= FALLBACK_ARTICLES.length) {
    return normalized.sort((a, b) => Number(new Date(b.publishedAt)) - Number(new Date(a.publishedAt)));
  }

  const existingHandles = new Set(normalized.map((post) => post.handle));
  const missing = FALLBACK_ARTICLES.filter((post) => !existingHandles.has(post.handle));
  return [...normalized, ...missing].sort((a, b) => Number(new Date(b.publishedAt)) - Number(new Date(a.publishedAt)));
}
