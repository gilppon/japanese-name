import { handle } from 'hono/cloudflare-pages';
import app from '../../api_engine';

// Cloudflare Pages Functions entry point
export const onRequest = handle(app);
