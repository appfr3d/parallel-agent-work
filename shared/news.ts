export const articleCategories = [
  'UTVIKLING',
  'DESIGN',
  'STRATEGI',
  'ARBEIDSLIV',
] as const;

export type ArticleCategory = (typeof articleCategories)[number];

/** The persisted record shape for an article in server/data/news.json. */
export interface Article {
  id: number;
  slug: string;
  category: ArticleCategory;
  title: string;
  subtitle: string;
  author: string;
  role: string;
  publishedAt: string;
  readTime: string;
  image: string;
  imageAlt: string;
  featured: boolean;
  body: string[];
}

/** The top-level LowDB document shape persisted to disk. */
export interface NewsDatabase {
  articles: Article[];
}
