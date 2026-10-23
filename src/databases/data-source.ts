import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { env } from '@common/config/env.js';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  synchronize: false,
  entities: [],
  migrations: [],
});
