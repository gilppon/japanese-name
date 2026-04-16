import { handle } from 'hono/cloudflare-pages';
import app from '../../app';

// Cloudflare Pages Functions entry point
export const onRequest = handle(app);
