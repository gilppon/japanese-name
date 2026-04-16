import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from '../i18n';

interface SEOHeadProps {
  title?: string;
  description?: string;
  path?: string;
  type?: 'website' | 'article' | 'product';
  image?: string;
}

export const SEOHead: React.FC<SEOHeadProps> = ({ 
  title, 
  description, 
  path = '', 
  type = 'website',
  image = '/assets/hero.png'
}) => {
  const { locale, t } = useTranslation();
  
  const siteUrl = 'https://kanji.next-haru.com';
  // Standardized URL for canonical and alternate links
  const url = `${siteUrl}${path}`;
  
  const defaultTitle = t('seo.title') || 'KanjiGen AI — Japanese Kanji Name Generator | Your Identity in Kanji';
  const defaultDescription = t('seo.description') || 'Discover your Japanese Kanji name with AI. Get a personalized Hanko seal, Sengoku-era family lore, and a unique Kamon crest — all crafted by advanced AI.';
  
  const finalTitle = title ? `${title} | KanjiGen AI` : defaultTitle;
  const finalDescription = description || defaultDescription;

  // JSON-LD schema markup for GEO (Generative Engine Optimization)
  const schemaOrgJSONLD = {
    '@context': 'http://schema.org',
    '@type': 'WebSite',
    url: siteUrl,
    name: 'KanjiGen AI',
    alternateName: ['Japan Name Generator', 'Kanji Generator'],
    description: finalDescription,
    inLanguage: locale,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };

  const productSchemaJSONLD = {
    '@context': 'http://schema.org',
    '@type': 'Product',
    name: 'KanjiGen AI Heritage Package',
    image: `${siteUrl}${image}`,
    description: finalDescription,
    brand: {
      '@type': 'Brand',
      name: 'KanjiGen AI'
    },
    offers: {
      '@type': 'Offer',
      url: siteUrl,
      priceCurrency: 'USD',
      price: '4.99',
      availability: 'http://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Next-Haru Inc.'
      }
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '1250'
    }
  };

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <link rel="canonical" href={url} />
      
      {/* i18n hreflang for multi-language support */}
      <link rel="alternate" hrefLang="en" href={`${siteUrl}${path}`} />
      <link rel="alternate" hrefLang="ko" href={`${siteUrl}${path}?lang=ko`} />
      <link rel="alternate" hrefLang="ja" href={`${siteUrl}${path}?lang=ja`} />
      <link rel="alternate" hrefLang="x-default" href={`${siteUrl}${path}`} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={`${siteUrl}${image}`} />
      <meta property="og:locale" content={locale === 'ko' ? 'ko_KR' : locale === 'ja' ? 'ja_JP' : 'en_US'} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={`${siteUrl}${image}`} />

      {/* Structured Data (JSON-LD) */}
      <script type="application/ld+json">
        {JSON.stringify(schemaOrgJSONLD)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(productSchemaJSONLD)}
      </script>
    </Helmet>
  );
};
