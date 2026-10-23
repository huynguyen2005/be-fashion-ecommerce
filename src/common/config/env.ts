import 'dotenv/config';

const NODE_ENVS = ['development', 'production', 'test'] as const;
type NodeEnv = (typeof NODE_ENVS)[number];

const nodeEnv = process.env.NODE_ENV ?? 'development';
if (!NODE_ENVS.includes(nodeEnv as NodeEnv)) {
  throw new Error(`Invalid NODE_ENV: ${nodeEnv}`);
}

const port = Number(process.env.PORT ?? 3001);
if (!Number.isInteger(port) || port < 0 || port > 65535) {
  throw new Error(`Invalid PORT: ${process.env.PORT}`);
}

export const env = {
  NODE_ENV: nodeEnv as NodeEnv,
  HOST: process.env.HOST ?? '0.0.0.0',
  PORT: port,
  DB_HOST: process.env.DB_HOST ?? 'localhost',
  DB_PORT: Number(process.env.DB_PORT ?? 5432),
  DB_NAME: process.env.DB_NAME ?? 'fashion_ecommerce',
  DB_USER: process.env.DB_USER ?? 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD ?? 'postgres',
};
