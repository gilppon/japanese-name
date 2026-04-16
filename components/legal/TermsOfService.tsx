import React from 'react';
import { LegalLayout } from './LegalLayout';
import { useTranslation } from '../../i18n';

export const TermsOfService: React.FC = () => {
  const { locale, t } = useTranslation();

  const renderContent = () => {
    if (locale === 'ko') {
      return (
        <>
          <section>
            <h2 className="text-xl font-bold text-white mb-3 text-gold">1. 이용 약관 동의</h2>
            <p>KanjiGen AI("서비스")에 접속하거나 사용함으로써, 귀하는 본 이용약관에 동의하게 됩니다. 동의하지 않으실 경우 서비스 이용이 제한됩니다.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-3 text-gold">2. 서비스 안내</h2>
            <p>본 서비스는 AI로 생성된 한자 이름, 디지털 인장(도장), 가문의 전설, 그리고 디지털 가문 문장(Kamon)을 디지털 자산으로 제공합니다.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-3 text-gold">3. 지적 재산권</h2>
            <p>생성된 결과물(이름, 전설, 가문, 인장)에 대해 귀하는 개인적 및 상업적 목적으로 영구히 사용할 수 있는 비독점적 라이선스를 부여받습니다. 단, 사이트의 고유 알고리즘, UI 및 브랜드 자산은 Next-Haru Inc.의 소유입니다.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-3 text-gold">4. 결제 및 환불</h2>
            <p>모든 결제는 PayPal을 통해 안전하게 처리됩니다. 본 상품은 즉시 전송되는 디지털 AI 생성물인 관계로, 법률로 정한 경우를 제외하고는 모든 판매가 최종적이며 환불이 불가능합니다.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-3 text-gold">5. 책임 규정 (제한된 보증)</h2>
            <p>불쾌감을 주거나, 불법적이거나, 차별적인 결과물을 고의로 생성하기 위한 오남용을 금지합니다. 비정상적인 접근이 감지될 경우 서비스 이용이 사전 통보 없이 차단될 수 있습니다.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-3 text-gold">6. 고객 지원</h2>
            <p>이용 중에 궁금하신 점이 있다면 언제든지 <a href="mailto:support@next-haru.com" className="text-gold hover:underline">support@next-haru.com</a> 로 문의해주세요.</p>
          </section>
        </>
      );
    }
    if (locale === 'ja') {
      return (
        <>
          <section>
            <h2 className="text-xl font-bold text-white mb-3 text-gold">1. 利用規約への同意</h2>
            <p>KanjiGen AI（以下「本サービス」）にアクセスまたは使用することにより、利用者は本利用規約に同意したものとみなされます。同意しない場合は、本サービスをご利用いただけません。</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-3 text-gold">2. サービスの内容</h2>
            <p>本サービスは、AIによって生成された漢字の名前、デジタル判子、家系の伝承、および家紋をデジタルデータとして提供します。</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-3 text-gold">3. 知的財産権</h2>
            <p>利用者は、生成されたコンテンツ（名前、伝承、家紋、判子）を個人的および商業的目的にて永久に使用する非独占的なライセンスを付与されます。ただし、本サービスのアルゴリズム、UI、およびブランドの権利はNext-Haru Inc.に帰属します。</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-3 text-gold">4. 支払いおよび返金</h2>
            <p>すべての支払いはPayPalを通じて安全に処理されます。商品は即時提供されるデジタルAI生成物であるため、法律で義務付けられている場合を除き、いかなる場合も返金はできません。</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-3 text-gold">5. 禁止事項</h2>
            <p>本サービスを使用して、攻撃的、違法、または差別的なコンテンツを意図的に生成することは禁止されています。不正利用が発覚した場合、アカウントへのアクセスがブロックされることがあります。</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-3 text-gold">6. お問い合わせ</h2>
            <p>サポートに関するお問い合わせは、<a href="mailto:support@next-haru.com" className="text-gold hover:underline">support@next-haru.com</a> までお願いいたします。</p>
          </section>
        </>
      );
    }
    
    // Default English
    return (
      <>
        <section>
          <h2 className="text-xl font-bold text-white mb-3 text-gold">1. Acceptance of Terms</h2>
          <p>By accessing or using KanjiGen AI ("Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-3 text-gold">2. Description of Service</h2>
          <p>The Service provides AI-generated Japanese Kanji names, digital Hanko seals, family lore narratives, and visual Kamon crests as digital goods.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-3 text-gold">3. Intellectual Property</h2>
          <p>You are granted a non-exclusive, perpetual license to use the generated output (names, lore, kamon, seals) for personal and commercial purposes. However, the core algorithmic systems, UI, and branding of KanjiGen AI remain the property of Next-Haru Inc.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-3 text-gold">4. Payments & Refunds</h2>
          <p>All purchases are processed securely via PayPal. Because the products are instantly delivered digital AI generations, all sales are final and non-refundable, except where required by law.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-3 text-gold">5. Acceptable Use</h2>
          <p>You agree not to use the Service to generate offensive, illegal, or discriminatory content. We reserve the right to block access for abusive behavior.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-3 text-gold">6. Contact</h2>
          <p>For questions or support: <a href="mailto:support@next-haru.com" className="text-gold hover:underline">support@next-haru.com</a></p>
        </section>
      </>
    );
  };

  return (
    <LegalLayout title={t('footer.terms')}>
      <p className="text-gold/60 text-sm mb-8">{locale === 'ko' ? '최종 수정일: ' : locale === 'ja' ? '最終更新日: ' : 'Last Updated: '}{new Date().toLocaleDateString()}</p>
      {renderContent()}
    </LegalLayout>
  );
};
