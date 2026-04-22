import { Resend } from 'resend';
import type { PurchaseRecord } from '../types';

export function getCFResendEnv(cEnv?: any) {
  const key = cEnv?.RESEND_API_KEY || (typeof process !== 'undefined' ? process.env.RESEND_API_KEY : '');
  const url = cEnv?.APP_URL || (typeof process !== 'undefined' ? process.env.APP_URL : 'http://localhost:3000');
  return { key, url };
}

export function getResendClient(cEnv?: any) {
  const { key } = getCFResendEnv(cEnv);
  return new Resend(key || 'dummy_key');
}

// 재발송 스팸 방지: 5분 내 동일 이메일 차단
const recentSends = new Map<string, number>();
const COOLDOWN_MS = 5 * 60 * 1000; // 5분

function checkCooldown(email: string): boolean {
  const lastSent = recentSends.get(email);
  if (lastSent && Date.now() - lastSent < COOLDOWN_MS) {
    return false;
  }
  recentSends.set(email, Date.now());
  return true;
}

/**
 * 주문 완료 이메일 발송
 */
export async function sendOrderConfirmation(order: PurchaseRecord, cEnv?: any): Promise<boolean> {
  const { url: appUrl } = getCFResendEnv(cEnv);
  const resend = getResendClient(cEnv);
  const viewUrl = `${appUrl}/#/view/${order.id}`;

  // 가몬(Kamon) 포함 여부에 따라 제목 변경
  const isKamonUpgrade = order.product_type === 'kamon' || (order.kamon_url && order.amount_paid > 5);
  const subject = isKamonUpgrade 
    ? `🏮 Your Family Crest (Kamon) is Unlocked — Heritage Updated`
    : `✨ Your Japanese Name "${order.kanji}" is Ready — Permanent Heritage Link`;

  try {
    const { error } = await resend.emails.send({
      from: 'KanjiGen AI <no-reply@kanji.next-haru.com>',
      to: order.email,
      subject: subject,
      html: generateOrderEmail(order, viewUrl)
    });

    if (error) {
      console.error('[Resend] Email send failed:', error);
      return false;
    }

    console.log(`[Resend] Order confirmation sent to ${order.email}`);
    return true;
  } catch (err) {
    console.error('[Resend] Email send error:', err);
    return false;
  }
}

/**
 * 주문 재발송 (내 이름 다시 찾기)
 */
export async function resendOrderLinks(email: string, orders: PurchaseRecord[], cEnv?: any): Promise<boolean> {
  if (!checkCooldown(email)) {
    console.warn(`[Resend] Cooldown active for ${email}`);
    return false;
  }

  if (orders.length === 0) return false;

  const { url: appUrl } = getCFResendEnv(cEnv);
  const resend = getResendClient(cEnv);

  const orderLinks = orders.map(o => {
    const viewUrl = `${appUrl}/#/view/${o.id}`;
    return `
      <tr>
        <td style="padding: 16px 20px; border-bottom: 1px solid #1a2f3f;">
          <div style="font-size: 28px; color: #ffffff; font-weight: 900; letter-spacing: 8px;">${o.kanji}</div>
          <div style="font-size: 12px; color: #d4af37; margin-top: 4px; letter-spacing: 2px;">${o.hiragana}</div>
          <div style="font-size: 12px; color: #f5e6be; margin-top: 4px; opacity: 0.8;">${o.meaning || ''}</div>
          <a href="${viewUrl}" style="display: inline-block; margin-top: 12px; padding: 8px 24px; background: linear-gradient(135deg, #d4af37, #f5d179); color: #0a1f2c; text-decoration: none; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; border-radius: 20px;">View Heritage →</a>
        </td>
      </tr>
    `;
  }).join('');

  try {
    const { error } = await resend.emails.send({
      from: 'KanjiGen AI <no-reply@kanji.next-haru.com>',
      to: email,
      subject: `🏯 Your Japanese Name Heritage — ${orders.length} Name(s) Found`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin: 0; padding: 0; background-color: #04151f; font-family: 'Inter', Arial, sans-serif;">
          <div style="max-width: 480px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="font-size: 10px; color: #d4af37; text-transform: uppercase; letter-spacing: 6px; font-weight: 900;">KanjiGen AI</div>
              <h1 style="color: #ffffff; font-size: 22px; margin: 16px 0 8px; font-weight: 900;">Your Heritage Collection</h1>
              <p style="color: #f5e6be; font-size: 13px; opacity: 0.7;">Here are your Japanese name(s) and permanent viewing links.</p>
            </div>
            <table style="width: 100%; background: #0a1f2c; border-radius: 16px; border: 1px solid rgba(212,175,55,0.2); overflow: hidden;">
              ${orderLinks}
            </table>
            <p style="text-align: center; margin-top: 30px; font-size: 10px; color: #d4af37; opacity: 0.4; text-transform: uppercase; letter-spacing: 4px;">永遠에 保存 · Preserved Forever</p>
          </div>
        </body>
        </html>
      `
    });

    if (error) {
      console.error('[Resend] Resend links failed:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[Resend] Resend links error:', err);
    return false;
  }
}

/**
 * 주문 확인 이메일 HTML 템플릿
 */
function generateOrderEmail(order: PurchaseRecord, viewUrl: string): string {
  const showKamon = !!order.kamon_url;
  
  // 가몬 섹션 HTML
  const kamonSection = showKamon ? `
    <!-- Kamon Section -->
    <div style="background: #0a1f2c; border: 1px solid rgba(212,175,55,0.3); border-radius: 24px; padding: 40px 24px; text-align: center; margin-bottom: 24px;">
      <p style="font-size: 10px; color: #d4af37; text-transform: uppercase; letter-spacing: 4px; font-weight: 900; margin: 0 0 16px;">Family Crest · 家紋</p>
      
      <div style="margin: 20px auto; width: 140px; height: 140px; background: rgba(212,175,55,0.05); border-radius: 50%; padding: 20px; border: 1px solid rgba(212,175,55,0.1);">
        <img src="${order.kamon_url}" alt="Your Kamon" style="width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 0 10px rgba(212,175,55,0.3));" />
      </div>

      <h2 style="font-size: 18px; color: #ffffff; margin: 24px 0 12px; font-weight: 900;">Symbolic Interpretation</h2>
      <div style="font-size: 13px; color: #f5e6be; line-height: 1.6; opacity: 0.9; text-align: left; padding: 0 10px;">
        ${order.kamon_explanation?.replace(/\n/g, '<br/>') || 'Your family crest represents your unique lineage and philosophical foundation.'}
      </div>
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 0; background-color: #04151f; font-family: 'Inter', Arial, sans-serif;">
      <div style="max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="font-size: 10px; color: #d4af37; text-transform: uppercase; letter-spacing: 6px; font-weight: 900;">KanjiGen AI</div>
          <div style="width: 60px; height: 1px; background: linear-gradient(90deg, transparent, #d4af37, transparent); margin: 12px auto;"></div>
        </div>

        ${order.kanji !== 'N/A' ? `
        <!-- Hero Card (Name) -->
        <div style="background: #0a1f2c; border: 1px solid rgba(212,175,55,0.3); border-radius: 24px; padding: 40px 24px; text-align: center; margin-bottom: 24px;">
          <p style="font-size: 10px; color: #d4af37; text-transform: uppercase; letter-spacing: 4px; font-weight: 900; margin: 0 0 8px;">Your Japanese Name</p>
          
          <div style="font-size: 12px; color: #d4af37; letter-spacing: 8px; font-weight: 900; margin-bottom: 8px;">${order.hiragana}</div>
          <h1 style="font-size: 64px; color: #ffffff; margin: 0; line-height: 1; text-shadow: 0 4px 20px rgba(0,0,0,0.5);">${order.kanji}</h1>
          
          <p style="font-size: 14px; color: #f5e6be; margin: 16px 0 0; font-style: italic; opacity: 0.9;">"${order.meaning || ''}"</p>
        </div>
        ` : ''}

        ${kamonSection}

        <!-- CTA Button -->
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${viewUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #d4af37, #f5d179); color: #0a1f2c; text-decoration: none; font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 3px; border-radius: 30px; box-shadow: 0 4px 20px rgba(212,175,55,0.3);">
            View Your Heritage Vault →
          </a>
        </div>

        <!-- Info -->
        <div style="background: rgba(212,175,55,0.05); border: 1px solid rgba(212,175,55,0.1); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
          <p style="font-size: 11px; color: #f5e6be; margin: 0; line-height: 1.8; opacity: 0.8;">
            🏯 This link is your <strong style="color: #d4af37;">permanent heritage vault</strong>. Save this email — you can access your name, Hanko seal, Kamon, family lore, and all artifacts anytime from any device.
          </p>
        </div>

        <!-- Details -->
        <table style="width: 100%; background: #0a1f2c; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); font-size: 11px; color: #f5e6be; opacity: 0.6;">
          ${order.kanji !== 'N/A' ? `
          <tr>
            <td style="padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.05);">Original Name</td>
            <td style="padding: 10px 16px; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.05);">${order.original_name}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.05);">Status</td>
            <td style="padding: 10px 16px; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.05);">${showKamon ? 'Premium Heritage' : 'Standard Heritage'}</td>
          </tr>
          <tr>
            <td style="padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.05);">Total Paid</td>
            <td style="padding: 10px 16px; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.05);">$${order.amount_paid} USD</td>
          </tr>
          <tr>
            <td style="padding: 10px 16px;">Order ID</td>
            <td style="padding: 10px 16px; text-align: right; font-size: 9px;">${order.id}</td>
          </tr>
        </table>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 40px;">
          <div style="width: 40px; height: 1px; background: linear-gradient(90deg, transparent, #d4af37, transparent); margin: 0 auto 12px;"></div>
          <p style="font-size: 10px; color: #d4af37; opacity: 0.3; text-transform: uppercase; letter-spacing: 4px; margin: 0;">永遠에 保存 · Preserved Forever</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
