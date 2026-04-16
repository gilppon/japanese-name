import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import { 
  generateHanko, 
  generateLore, 
  generateKamon, 
  generateKamonExplanation, 
  generateDeepMeaning 
} from '../../src/services/geminiService'; // src 폴더 경로 맞춤

// Supabase, Email 서비스 등은 Hono context(c.env)를 넘겨주도록 수정해야 하지만, 
// 우선 Gemini API들의 라우터만 연동 예시 작성합니다.

const app = new Hono().basePath('/api');

app.get('/health', (c) => c.json({ status: 'ok', edge: true }));

app.post('/generate-hanko', async (c) => {
  try {
    const { kanji, font, meaning } = await c.req.json();
    const base64Data = await generateHanko(kanji, font, meaning, c.env);
    return c.json({ hankoData: base64Data });
  } catch (error: any) {
    console.error("Hanko error:", error);
    return c.json({ error: "Failed to generate hanko" }, 500);
  }
});

app.post('/generate-lore', async (c) => {
  try {
    const { kanji, meaning, birthday, personality, gender, locale } = await c.req.json();
    const loreText = await generateLore(kanji, meaning, birthday, personality, gender, locale, c.env);
    return c.json({ loreText });
  } catch (error: any) {
    console.error("Lore error:", error);
    return c.json({ error: "Failed to generate lore" }, 500);
  }
});

app.post('/generate-kamon', async (c) => {
  try {
    const { meaning } = await c.req.json();
    const kamonData = await generateKamon(meaning, c.env);
    return c.json({ kamonData });
  } catch (error: any) {
    console.error("Kamon error:", error);
    return c.json({ error: "Failed to generate kamon" }, 500);
  }
});

app.post('/generate-kamon-explanation', async (c) => {
  try {
    const { kamonBase64, meaning, locale } = await c.req.json();
    const explanation = await generateKamonExplanation(kamonBase64, meaning, locale, c.env);
    return c.json({ explanation });
  } catch (error: any) {
    return c.json({ error: "Failed to explain kamon" }, 500);
  }
});

app.post('/generate-deep-meaning', async (c) => {
  try {
    const { kanji, meaning, locale } = await c.req.json();
    const deepMeaning = await generateDeepMeaning(kanji, meaning, locale, c.env);
    return c.json({ deepMeaning });
  } catch (error: any) {
    return c.json({ error: "Failed to generate deep meaning" }, 500);
  }
});

import { saveOrder, getOrderById, getOrdersByEmail, updateOrderWithKamon } from '../../src/services/supabaseService';
import { sendOrderConfirmation, resendOrderLinks } from '../../src/services/emailService';

app.post('/save-order', async (c) => {
  try {
    const orderData = await c.req.json();
    const savedOrder = await saveOrder(orderData, c.env);
    await sendOrderConfirmation(savedOrder, c.env);
    return c.json({ orderId: savedOrder.id });
  } catch (error: any) {
    return c.json({ error: "Failed to save order" }, 500);
  }
});

app.get('/order/:orderId', async (c) => {
  try {
    const { orderId } = c.req.param();
    const order = await getOrderById(orderId, c.env);
    if (!order) return c.json({ error: "Order not found" }, 404);
    return c.json(order);
  } catch (error: any) {
    return c.json({ error: "Failed to fetch order" }, 500);
  }
});

app.post('/lookup-orders', async (c) => {
  try {
    const { email } = await c.req.json();
    const orders = await getOrdersByEmail(email, c.env);
    if (orders.length > 0) {
      await resendOrderLinks(email, orders, c.env);
    }
    return c.json({ found: orders.length });
  } catch (error: any) {
    return c.json({ error: "Lookup failed" }, 500);
  }
});

app.post('/save-kamon', async (c) => {
  try {
    const { paypalOrderId, email, kamonUrl, kamonExplanation, additionalAmount } = await c.req.json();
    const updatedOrder = await updateOrderWithKamon(paypalOrderId, email, kamonUrl, kamonExplanation, additionalAmount, c.env);
    return c.json({ orderId: updatedOrder?.id });
  } catch (error: any) {
    return c.json({ error: "Failed to save kamon data" }, 500);
  }
});

// 이 핸들러를 내보내면 Cloudflare Pages가 이 파일을 라우팅합니다.
export const onRequest = handle(app);
