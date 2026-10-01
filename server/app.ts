import express from 'express';
import { JSONFilePreset } from 'lowdb/node';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import type { NewsDatabase } from '../shared/news';

export async function createApiApp() {
  const app = express();
  const root = path.dirname(fileURLToPath(import.meta.url));
  const db = await JSONFilePreset<NewsDatabase>(path.join(root, 'data', 'news.json'), { articles: [] });

  app.use(express.json());

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.get('/api/articles', (_req, res) => {
    const articles = [...db.data.articles].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    res.json(articles);
  });
  app.get('/api/articles/:slug', (req, res) => {
    const article = db.data.articles.find((item) => item.slug === req.params.slug);
    if (!article) {
      res.status(404).json({ message: 'Fant ikke saken.' });
      return;
    }
    res.json(article);
  });
  app.use('/api', (_req, res) => res.status(404).json({ message: 'Fant ikke endepunktet.' }));

  return app;
}
