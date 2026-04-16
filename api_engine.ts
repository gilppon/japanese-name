import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { env } from 'hono/adapter';

import { 
  generateHanko, 
  generateLore, 
  generateKamon, 
  generateKamonExplanation, 
  generateDeepMeaning 
} from "./services/geminiService";
import { 
  saveOrder, 
  getOrderById, 
  getOrdersByEmail, 
  updateOrderWithKamon 
} from "./services/supabaseService";
import { 
  sendOrderConfirmation, 
  resendOrderLinks 
} from "./services/emailService";

// Helper for PayPal verify
async function verifyPayPalOrder(paypalOrderId: string, clientId: string, clientSecret: string): Promise<boolean> {
  try {
    if (!clientId || !clientSecret) {
      console.warn("[PayPal] Missing credentials, skipping verification");
      return true; // Dev fallback
    }

    const authResponse = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
      },
      body: 'grant_type=client_credentials'
    });

    if (!authResponse.ok) {
      console.error("[PayPal] Auth failed:", authResponse.status);
      return true; 
    }

    const { access_token } = await authResponse.json() as any;
    const orderResponse = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${paypalOrderId}`, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!orderResponse.ok) {
      console.error("[PayPal] Order verification failed:", orderResponse.status);
      return false;
    }

    const orderData = await orderResponse.json() as any;
    return orderData.status === 'COMPLETED';
  } catch (error) {
    console.error("[PayPal] Verification error:", error);
    return true; 
  }
}

// ==== MAIN APP SETUP ====
const app = new Hono().basePath('/api');

// Middleware
app.use('*', cors());

// Health Check
app.get("/health", (c) => c.json({ status: "ok" }));

// Hanko Generation
app.post("/generate-hanko", async (c) => {
  try {
    const { kanji, font, meaning } = await c.req.json();
    const cEnv = env(c);
    const base64Data = await generateHanko(kanji, font, meaning, cEnv);
    return c.json({ hankoData: base64Data });
  } catch (error: any) {
    console.error("Hanko error:", error);
    return c.json({ error: "Failed to generate hanko" }, 500);
  }
});

// Lore Generation
app.post("/generate-lore", async (c) => {
  try {
    const { kanji, meaning, birthday, personality, gender, locale } = await c.req.json();
    const cEnv = env(c);
    const loreText = await generateLore(kanji, meaning, birthday, personality, gender, locale, cEnv);
    return c.json({ loreText });
  } catch (error: any) {
    console.error("Lore error:", error);
    return c.json({ error: "Failed to generate lore" }, 500);
  }
});

// Kamon Generation
app.post("/generate-kamon", async (c) => {
  try {
    const { meaning } = await c.req.json();
    const cEnv = env(c);
    const kamonData = await generateKamon(meaning, cEnv);
    return c.json({ kamonData });
  } catch (error: any) {
    console.error("Kamon error:", error);
    return c.json({ error: "Failed to generate kamon" }, 500);
  }
});

// Kamon Explanation
app.post("/generate-kamon-explanation", async (c) => {
  try {
    const { kamonBase64, meaning, locale } = await c.req.json();
    const cEnv = env(c);
    const explanation = await generateKamonExplanation(kamonBase64, meaning, locale, cEnv);
    return c.json({ explanation });
  } catch (error: any) {
    console.error("Kamon explanation error:", error);
    return c.json({ error: "Failed to generate kamon explanation" }, 500);
  }
});

// Deep Meaning Generation
app.post("/generate-deep-meaning", async (c) => {
  try {
    const { kanji, meaning, locale } = await c.req.json();
    const cEnv = env(c);
    const deepMeaning = await generateDeepMeaning(kanji, meaning, locale, cEnv);
    return c.json({ deepMeaning });
  } catch (error: any) {
    console.error("Deep Meaning error:", error);
    return c.json({ error: "Failed to generate deep meaning" }, 500);
  }
});

// Save Order
app.post("/save-order", async (c) => {
  try {
    const body = await c.req.json();
    const cEnv = env(c);
    const { paypalOrderId, email, kanji } = body;

    if (!paypalOrderId || !email || !kanji) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const clientId = cEnv.VITE_PAYPAL_CLIENT_ID || cEnv.PAYPAL_CLIENT_ID;
    const clientSecret = cEnv.PAYPAL_SECRET;
    const isValidOrder = await verifyPayPalOrder(paypalOrderId, clientId, clientSecret);
    if (!isValidOrder) {
      return c.json({ error: "Invalid PayPal order" }, 400);
    }

    let savedOrder;
    let dbFailed = false;
    try {
      savedOrder = await saveOrder({
        email: email.toLowerCase().trim(),
        paypal_order_id: paypalOrderId,
        original_name: body.originalName || 'Unknown',
        kanji,
        hiragana: body.hiragana || '',
        meaning: body.meaning || null,
        deep_meaning: body.deepMeaning || null,
        lore_text: body.loreText || null,
        hanko_url: body.hankoUrl || null,
        kamon_url: body.kamonUrl || null,
        kamon_explanation: body.kamonExplanation || null,
        product_type: body.productType || 'heritage',
        amount_paid: body.amountPaid || 4.99,
        locale: body.locale || 'en'
      }, cEnv);
    } catch (dbError) {
      dbFailed = true;
    }

    let emailFailed = false;
    if (savedOrder && !dbFailed) {
      try {
        const emailSent = await sendOrderConfirmation(savedOrder, cEnv);
        if (!emailSent) emailFailed = true;
      } catch (emailError) {
        emailFailed = true;
      }
    }

    if (dbFailed) {
      return c.json({ 
        success: false, 
        fallback: true, 
        message: "Order could not be saved. Please download your files directly." 
      });
    }

    return c.json({
      success: true, 
      orderId: savedOrder!.id,
      emailFailed,
      message: emailFailed 
        ? "Order saved! Email delivery failed — your data is safe in our vault."
        : "Order saved and confirmation email sent!"
    });
  } catch (error: any) {
    console.error("Save order error:", error);
    return c.json({ error: "Failed to save order", fallback: true }, 500);
  }
});

// Get Order By ID
app.get("/order/:orderId", async (c) => {
  try {
    const { orderId } = c.req.param();
    const cEnv = env(c);
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(orderId)) {
      return c.json({ error: "Invalid order ID format" }, 400);
    }

    const order = await getOrderById(orderId, cEnv);
    if (!order) {
      return c.json({ error: "Order not found" }, 404);
    }
    return c.json({ order });
  } catch (error: any) {
    console.error("Get order error:", error);
    return c.json({ error: "Failed to retrieve order" }, 500);
  }
});

// Lookup Orders
app.post("/lookup-orders", async (c) => {
  try {
    const { email } = await c.req.json();
    const cEnv = env(c);
    
    if (!email || !email.includes('@')) {
      return c.json({ error: "Valid email required" }, 400);
    }

    const orders = await getOrdersByEmail(email, cEnv);
    if (orders.length === 0) {
      return c.json({ success: true, found: false, message: "No orders found." });
    }

    const emailSent = await resendOrderLinks(email.toLowerCase().trim(), orders, cEnv);
    return c.json({ 
      success: true, 
      found: true, 
      count: orders.length,
      emailSent,
      message: emailSent 
        ? "Heritage links sent to your email!"
        : "Found your names, but email delivery is temporarily unavailable."
    });
  } catch (error: any) {
    console.error("Lookup orders error:", error);
    return c.json({ error: "Failed to lookup orders" }, 500);
  }
});

// Save Kamon
app.post("/save-kamon", async (c) => {
  try {
    const body = await c.req.json();
    const cEnv = env(c);
    const { paypalOrderId, email, kamonUrl } = body;

    if (!paypalOrderId || !email || !kamonUrl) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const clientId = cEnv.VITE_PAYPAL_CLIENT_ID || cEnv.PAYPAL_CLIENT_ID;
    const clientSecret = cEnv.PAYPAL_SECRET;
    const isValidOrder = await verifyPayPalOrder(paypalOrderId, clientId, clientSecret);
    if (!isValidOrder) {
      return c.json({ error: "Invalid PayPal order" }, 400);
    }

    const updated = await updateOrderWithKamon(
      paypalOrderId,
      email,
      kamonUrl,
      body.kamonExplanation || '',
      body.amountPaid || 3.99,
      cEnv
    );

    if (updated) {
      try {
        await sendOrderConfirmation(updated, cEnv);
      } catch (e) {}
    }
    return c.json({ success: true, orderId: updated?.id });
  } catch (error: any) {
    console.error("Save kamon error:", error);
    return c.json({ error: "Failed to save kamon data" }, 500);
  }
});

export default app;
