import { shopifyFetch } from '../shopify';
import { EVENT_FALLBACK_POSTS, getFallbackArticle, normalizeArticleForTransmission } from '../site';
import type { Article } from '../types';

const CONTENT_NAMESPACE = process.env.SHOPIFY_CONTENT_NAMESPACE || 'lap';

const ARTICLE_FIELDS = `
  id
  title
  handle
  excerpt
  contentHtml
  publishedAt
  tags
  author {
    name
  }
  image {
    url
    altText
    width
    height
  }
  transmissionId: metafield(namespace: "${CONTENT_NAMESPACE}", key: "transmission_id") {
    value
  }
  channelMeta: metafield(namespace: "${CONTENT_NAMESPACE}", key: "channel") {
    value
  }
  statusMeta: metafield(namespace: "${CONTENT_NAMESPACE}", key: "status") {
    value
  }
  locationMeta: metafield(namespace: "${CONTENT_NAMESPACE}", key: "location") {
    value
  }
  sourceMeta: metafield(namespace: "${CONTENT_NAMESPACE}", key: "source") {
    value
  }
`;

interface MetafieldValue {
  value: string | null;
}

type RawArticle = Article & {
  transmissionId?: MetafieldValue | null;
  channelMeta?: MetafieldValue | null;
  statusMeta?: MetafieldValue | null;
  locationMeta?: MetafieldValue | null;
  sourceMeta?: MetafieldValue | null;
};

interface GetBlogPostsData {
  blog: {
    articles: {
      edges: { node: RawArticle }[];
    };
  } | null;
}

interface GetBlogPostByHandleData {
  blog: {
    articleByHandle: RawArticle | null;
  } | null;
}

function fieldValue(field?: MetafieldValue | null): string | undefined {
  return field?.value?.trim() || undefined;
}

function withLpMeta(article: RawArticle): Article {
  const channel = fieldValue(article.channelMeta);
  const status = fieldValue(article.statusMeta);
  const location = fieldValue(article.locationMeta);
  const source = fieldValue(article.sourceMeta);
  const transmissionId = fieldValue(article.transmissionId);

  return {
    ...article,
    lpMeta: {
      transmissionId: transmissionId ?? article.lpMeta?.transmissionId ?? article.id.toUpperCase(),
      channel: channel ?? article.lpMeta?.channel ?? article.tags[0] ?? 'BULLETIN',
      status: status ?? article.lpMeta?.status ?? 'ACTIVE',
      location: location ?? article.lpMeta?.location ?? 'PARIS',
      source: source ?? article.lpMeta?.source ?? article.author.name,
    },
  };
}

export async function getBlogPosts(blogHandle: string): Promise<Article[]> {
  const query = `
    query GetBlogPosts($handle: String!) {
      blog(handle: $handle) {
        articles(first: 20) {
          edges {
            node {
              ${ARTICLE_FIELDS}
            }
          }
        }
      }
    }
  `;

  try {
    const data = await shopifyFetch<GetBlogPostsData, { handle: string }>({
      query,
      variables: { handle: blogHandle },
    });

    if (!data.blog) return EVENT_FALLBACK_POSTS;
    const shopifyPosts = data.blog.articles.edges.map((edge) => withLpMeta(edge.node));
    if (shopifyPosts.length === 0) return EVENT_FALLBACK_POSTS;
    return shopifyPosts.slice(0, 3);
  } catch {
    return EVENT_FALLBACK_POSTS;
  }
}

export async function getBlogPostByHandle(blogHandle: string, articleHandle: string): Promise<Article | null> {
  const query = `
    query GetBlogPostByHandle($blogHandle: String!, $articleHandle: String!) {
      blog(handle: $blogHandle) {
        articleByHandle(handle: $articleHandle) {
          ${ARTICLE_FIELDS}
        }
      }
    }
  `;

  try {
    const data = await shopifyFetch<GetBlogPostByHandleData, { blogHandle: string; articleHandle: string }>({
      query,
      variables: { blogHandle, articleHandle },
    });

    if (!data.blog) {
      const fallback = getFallbackArticle(articleHandle);
      return fallback ? normalizeArticleForTransmission(fallback) : null;
    }
    const article = data.blog.articleByHandle ? withLpMeta(data.blog.articleByHandle) : getFallbackArticle(articleHandle);
    return article ? normalizeArticleForTransmission(article) : null;
  } catch {
    const fallback = getFallbackArticle(articleHandle);
    return fallback ? normalizeArticleForTransmission(fallback) : null;
  }
}
