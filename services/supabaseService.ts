import { createClient } from '@supabase/supabase-js';
import type { PurchaseRecord } from '../types';

export function getCFSupabaseEnv(cEnv?: any) {
  const url = cEnv?.SUPABASE_URL || (typeof process !== 'undefined' ? process.env.SUPABASE_URL : '');
  const key = cEnv?.SUPABASE_SERVICE_ROLE_KEY || (typeof process !== 'undefined' ? process.env.SUPABASE_SERVICE_ROLE_KEY : '');
  return { url, key };
}

export function getSupabase(cEnv?: any) {
  const { url, key } = getCFSupabaseEnv(cEnv);
  if (!url || !key) throw new Error("Supabase credentials missing");
  return createClient(url, key);
}

/**
 * 주문 저장 (결제 완료 후)
 */
export async function saveOrder(order: Omit<PurchaseRecord, 'id' | 'created_at' | 'updated_at'>, cEnv?: any): Promise<PurchaseRecord> {
  const supabase = getSupabase(cEnv);
  const { data, error } = await supabase
    .from('purchases')
    .insert(order)
    .select()
    .single();

  if (error) {
    console.error('[Supabase] Save order failed:', error);
    throw new Error(`DB save failed: ${error.message}`);
  }

  return data as PurchaseRecord;
}

/**
 * 주문 ID로 단건 조회 (영구 링크용)
 */
export async function getOrderById(orderId: string, cEnv?: any): Promise<PurchaseRecord | null> {
  const supabase = getSupabase(cEnv);
  const { data, error } = await supabase
    .from('purchases')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    console.error('[Supabase] Get order failed:', error);
    throw new Error(`DB query failed: ${error.message}`);
  }

  return data as PurchaseRecord;
}

/**
 * 이메일로 주문 목록 조회 (내 이름 다시 찾기)
 */
export async function getOrdersByEmail(email: string, cEnv?: any): Promise<PurchaseRecord[]> {
  const supabase = getSupabase(cEnv);
  const { data, error } = await supabase
    .from('purchases')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Supabase] Get orders by email failed:', error);
    throw new Error(`DB query failed: ${error.message}`);
  }

  return (data || []) as PurchaseRecord[];
}

/**
 * 기존 주문에 Kamon 데이터 추가 (Kamon 추가 결제 시)
 */
export async function updateOrderWithKamon(
  paypalOrderId: string,
  email: string,
  kamonUrl: string,
  kamonExplanation: string,
  additionalAmount: number,
  cEnv?: any
): Promise<PurchaseRecord | null> {
  const supabase = getSupabase(cEnv);
  // 기존 heritage 주문 찾기
  const { data: existing } = await supabase
    .from('purchases')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .eq('product_type', 'heritage')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (existing) {
    // 기존 주문에 Kamon 데이터 추가
    const { data, error } = await supabase
      .from('purchases')
      .update({
        kamon_url: kamonUrl,
        kamon_explanation: kamonExplanation,
        amount_paid: existing.amount_paid + additionalAmount,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw new Error(`DB update failed: ${error.message}`);
    return data as PurchaseRecord;
  }

  // 기존 주문 없으면 독립 주문으로 저장
  const { data, error } = await supabase
    .from('purchases')
    .insert({
      email: email.toLowerCase().trim(),
      paypal_order_id: paypalOrderId,
      original_name: 'N/A',
      kanji: 'N/A',
      hiragana: 'N/A',
      kamon_url: kamonUrl,
      kamon_explanation: kamonExplanation,
      product_type: 'kamon',
      amount_paid: additionalAmount
    })
    .select()
    .single();

  if (error) throw new Error(`DB insert failed: ${error.message}`);
  return data as PurchaseRecord;
}
