import http from 'http';
import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import { initSockets } from './sockets/queue.socket';

const start = async (): Promise<void> => {
  await connectDB();
  const server = http.createServer(app);
  initSockets(server);
  server.listen(env.PORT, () => console.log(`API running on http://localhost:${env.PORT}`));
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
