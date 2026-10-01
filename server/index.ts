import { createApiApp } from './app';

const port = Number(process.env.PORT || 3001);
const app = await createApiApp();

app.listen(port, () => console.log(`BG API is ready at http://localhost:${port}`));
