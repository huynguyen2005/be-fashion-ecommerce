import { app } from './app.js';
import { env } from '@common/config/env.js';
import { logger } from '@common/config/logger.js';

const server = app.listen(env.PORT, env.HOST, () => {
  logger.info(`Server listening on http://${env.HOST}:${env.PORT} (${env.NODE_ENV})`);
});

const shutdown = (signal: string) => {
  logger.info(`${signal} received, shutting down`);
  server.close((err) => process.exit(err ? 1 : 0));
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
