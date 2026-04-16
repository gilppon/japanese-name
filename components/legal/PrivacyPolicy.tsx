import React from 'react';
import { LegalLayout } from './LegalLayout';
import { useTranslation } from '../../i18n';

export const PrivacyPolicy: React.FC = () => {
  const { locale, t } = useTranslation();

  const renderContent = () => {
    if (locale === 'ko') {
      return (
        <>
          <section>
            <h2 className="text-xl font-bold text-white mb-3 text-gold">1. 수집하는 정보</h2>
            <p className="mb-2">저희는 KanjiGen AI 서비스 제공에 필요한 최소한의 정보만 수집합니다:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>입력 데이터:</strong> 양식을 통해 제출된 이름, 생년월일, 선호 특성.</li>
              <li><strong>결제 정보:</strong> PayPal을 통해 안전하게 처리되며, 신용카드 정보를 직접 저장하지 않습니다.</li>
              <li><strong>기술 데이터:</strong> 보안을 위한 기본 서버 로그, 브라우저 유형, IP 주소.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-3 text-gold">2. 정보 이용 목적</h2>
            <p>입력된 데이터(이름, 생일, 특성)는 귀하만의 맞춤형 한자 이름과 텍스트를 생성하기 위한 목적으로만 AI 파트너(예: Google Gemini)로 전송됩니다. 해당 데이터는 마케팅에 이용되거나 제3자에게 판매되지 않습니다.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-3 text-gold">3. 데이터 보관</h2>
            <p>생성된 결과물(주문 내역, 이미지)은 귀하가 주문 ID로 다시 조회할 수 있도록 데이터베이스(Supabase)에 안전하게 보관됩니다. 고객 지원을 통해 기록 삭제를 요청하실 수 있습니다.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-3 text-gold">4. 제3자 서비스</h2>
            <p>본 서비스는 Cloudflare(호스팅), Supabase(데이터베이스), PayPal(결제), Resend(이메일) 등의 외부 서비스를 이용합니다. 이들 서비스는 각자의 개인정보 처리방침을 따릅니다.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-3 text-gold">5. 문의하기</h2>
            <p>개인정보 처리와 관련된 문의는 <a href="mailto:support@next-haru.com" className="text-gold hover:underline">support@next-haru.com</a> 으로 연락해 주십시오.</p>
          </section>
        </>
      );
    }
    if (locale === 'ja') {
      return (
        <>
          <section>
            <h2 className="text-xl font-bold text-white mb-3 text-gold">1. 収集する情報</h2>
            <p className="mb-2">当サービスは、KanjiGen AIを提供するために必要な最小限の情報のみを収集します：</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>入力データ:</strong> フォームを通じて送信された名前、生年月日、希望する特性。</li>
              <li><strong>支払い情報:</strong> PayPalを通じて安全に処理されます。クレジットカード情報は保存しません。</li>
              <li><strong>技術データ:</strong> セキュリティ目的の標準的なサーバーログ、ブラウザの種類、IPアドレス。</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-3 text-gold">2. 情報の利用目的</h2>
            <p>入力されたデータ（名前、誕生日、特性）は、カスタマイズされた漢字名やテキストを生成する目的にのみAIパートナー（例：Google Gemini）に送信されます。マーケティングに利用されたり、第三者に販売されたりすることはありません。</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-3 text-gold">3. データの保持</h2>
            <p>生成された結果（注文履歴、画像）は、注文IDで後から検索できるようにデータベース（Supabase）に安全に保存されます。サポートに連絡することで、記録の削除をリクエストできます。</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-3 text-gold">4. サードパーティサービス</h2>
            <p>当サービスは、Cloudflare（ホスティング）、Supabase（データベース）、PayPal（支払い）、Resend（メール）などの外部サービスを利用しています。これらのサービスはそれぞれのプライバシーポリシーに従って運営されています。</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-3 text-gold">5. お問い合わせ</h2>
            <p>個人情報に関するお問い合わせは、<a href="mailto:support@next-haru.com" className="text-gold hover:underline">support@next-haru.com</a> までご連絡ください。</p>
          </section>
        </>
      );
    }
    
    // Default English
    return (
      <>
        <section>
          <h2 className="text-xl font-bold text-white mb-3 text-gold">1. Information We Collect</h2>
          <p className="mb-2">We collect the following minimal information necessary to provide the KanjiGen AI service:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Input Data:</strong> Names, dates of birth, and preferred traits submitted through our forms.</li>
            <li><strong>Payment Information:</strong> Processed securely via PayPal. We do NOT store full credit card details.</li>
            <li><strong>Technical Data:</strong> Standard server logs, browser type, and IP address for security purposes.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-3 text-gold">2. How We Use Your Information</h2>
          <p>The input data (name, birthday, traits) is sent strictly to our AI partners (e.g., Google Gemini) solely for the purpose of generating your personalized Kanji name and lore. It is not used for ongoing marketing or sold to third-party data brokers.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-3 text-gold">3. Data Retention</h2>
          <p>Your generated outputs (orders, images) are securely stored in our database (Supabase) so that you may retrieve them using your Order ID. You may request the deletion of your records by contacting support.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-3 text-gold">4. Third-Party Services</h2>
          <p>We use third-party services including Cloudflare (Hosting), Supabase (Database), PayPal (Payments), and Resend (Email). These services operate under their respective privacy policies.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-3 text-gold">5. Contact</h2>
          <p>For any privacy-related inquiries, contact <a href="mailto:support@next-haru.com" className="text-gold hover:underline">support@next-haru.com</a>.</p>
        </section>
      </>
    );
  };

  return (
    <LegalLayout title={t('footer.privacy')}>
      <p className="text-gold/60 text-sm mb-8">{locale === 'ko' ? '최종 수정일: ' : locale === 'ja' ? '最終更新日: ' : 'Last Updated: '}{new Date().toLocaleDateString()}</p>
      {renderContent()}
    </LegalLayout>
  );
};
