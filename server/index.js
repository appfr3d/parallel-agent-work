import express from 'express';
import { JSONFilePreset } from 'lowdb/node';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const app = express();
const port = Number(process.env.PORT || 3001);
const root = path.dirname(fileURLToPath(import.meta.url));
const db = await JSONFilePreset(path.join(root, 'data', 'news.json'), { articles: [] });

app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/api/articles', (_req, res) => {
  const articles = [...db.data.articles].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  res.json(articles);
});
app.get('/api/articles/:slug', (req, res) => {
  const article = db.data.articles.find((item) => item.slug === req.params.slug);
  if (!article) return res.status(404).json({ message: 'Fant ikke saken.' });
  res.json(article);
});

app.listen(port, () => console.log(`BG API is ready at http://localhost:${port}`));
