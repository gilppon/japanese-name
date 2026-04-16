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
  const url = `${siteUrl}${path !== '/' ? path : ''}${locale !== 'en' ? `?lang=${locale}` : ''}`;
  
  const defaultTitle = t('title') || 'KanjiGen AI — Japanese Kanji Name Generator | Your Identity in Kanji';
  const defaultDescription = t('subtitle') || 'Discover your Japanese Kanji name with AI. Get a personalized Hanko seal, Sengoku-era family lore, and a unique Kamon crest.';
  
  const finalTitle = title ? `${title} | KanjiGen AI` : defaultTitle;
  const finalDescription = description || defaultDescription;

  // JSON-LD schema markup
  const schemaOrgJSONLD = {
    '@context': 'http://schema.org',
    '@type': 'WebSite',
    url: siteUrl,
    name: 'KanjiGen AI',
    description: finalDescription,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };

  const productSchemaJSONLD = type === 'product' ? {
    '@context': 'http://schema.org',
    '@type': 'Product',
    name: finalTitle,
    image: `${siteUrl}${image}`,
    description: finalDescription,
    brand: {
      '@type': 'Brand',
      name: 'KanjiGen AI'
    },
    offers: {
      '@type': 'Offer',
      url: url,
      priceCurrency: 'USD',
      price: '4.99',
      availability: 'http://schema.org/InStock'
    }
  } : null;

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={`${siteUrl}${image}`} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={`${siteUrl}${image}`} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(schemaOrgJSONLD)}
      </script>
      {productSchemaJSONLD && (
        <script type="application/ld+json">
          {JSON.stringify(productSchemaJSONLD)}
        </script>
      )}
    </Helmet>
  );
};
