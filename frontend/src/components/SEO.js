import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

/**
 * Reusable SEO Component for strong Search Engine Optimization
 */
const SEO = ({ title, description, name='Habibah', type='website', image, jsonLd, keywords }) => {
  const location = useLocation();
  // Constante du nom de domaine (à changer selon l'environnement)
  const siteUrl = "https://zrirhabibah.com";
  const currentUrl = `${siteUrl}${location.pathname}`;
  
  // Image par défaut si aucune image n'est fournie (le favicon ou un logo large)
  const defaultImage = `${siteUrl}/HabibahLOGO.png`;
  const seoImage = image ? (image.startsWith('http') ? image : `${siteUrl}${image}`) : defaultImage;

  return (
    <Helmet>
      {/* Balises standards */}
      <title>{title ? `${title} | ${name}` : name}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={currentUrl} />

      {/* Balises Open Graph / Facebook / WhatsApp */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title ? `${title} | ${name}` : name} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:site_name" content={name} />

      {/* Balises Twitter */}
      <meta name="twitter:creator" content={name} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title ? `${title} | ${name}` : name} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={seoImage} />

      {/* Structured Data JSON-LD pour Google Rich Snippets */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
