import react from '@vitejs/plugin-react';
import { createServer as createHttpServer } from 'node:http';
import { createServer as createViteServer } from 'vite';
import { createApiApp } from './app';

const port = Number(process.env.PORT || 3001);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error(`Invalid PORT value: ${process.env.PORT}`);
}

const app = await createApiApp();
const httpServer = createHttpServer(app);
const vite = await createViteServer({
  configFile: false,
  plugins: [react()],
  appType: 'spa',
  server: {
    middlewareMode: true,
    hmr: { server: httpServer },
    allowedHosts: ['.localhost']
  }
});

app.use(vite.middlewares);

httpServer.on('close', () => void vite.close());
httpServer.listen(port, '127.0.0.1', () => {
  console.log(`BG app is ready on port ${port}; Portless provides the named URL.`);
});
