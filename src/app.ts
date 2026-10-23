import express from 'express';
import { router } from '@modules/index.js';

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use(router);
