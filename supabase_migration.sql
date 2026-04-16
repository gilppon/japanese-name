-- ============================================
-- KanjiGen AI: purchases 테이블 생성 마이그레이션
-- 
-- 실행 방법:
-- 1. https://supabase.com/dashboard/project/zcmezffefmfkzfgcbdtq/sql/new 접속
-- 2. 아래 SQL 전체를 복사하여 붙여넣기
-- 3. "Run" 버튼 클릭
-- ============================================

-- 1. 테이블 생성
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  paypal_order_id TEXT UNIQUE NOT NULL,
  original_name TEXT NOT NULL,
  kanji TEXT NOT NULL,
  hiragana TEXT NOT NULL,
  meaning TEXT,
  deep_meaning TEXT,
  lore_text TEXT,
  hanko_url TEXT,
  kamon_url TEXT,
  kamon_explanation TEXT,
  product_type TEXT NOT NULL DEFAULT 'heritage',
  amount_paid DECIMAL(5,2) NOT NULL,
  locale TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_purchases_email ON purchases(email);
CREATE INDEX IF NOT EXISTS idx_purchases_paypal ON purchases(paypal_order_id);

-- 3. RLS 활성화
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- 4. Service Role 전용 접근 정책
CREATE POLICY "service_role_full_access" ON purchases
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
