import React from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'CivicNest';
const DEFAULT_IMAGE = 'https://civicnest.org/og-default.png'; // Fallback image 1200x630px

export default function SEO({
  title,
  description,
  keywords,
  image = DEFAULT_IMAGE,
  type = 'website',
  url = typeof window !== 'undefined' ? window.location.href : '',
  canonical,
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Community Cleanliness Portal`;
  const metaDescription = description || 'Report civic issues, find lost items, rescue animals, and organize cleanup drives in your community with CivicNest.';
  const metaKeywords = keywords || 'community, cleanliness, civic issues, volunteer, ngo, leaderboard';
  const canonicalUrl = canonical || url;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />

      {/* Open Graph tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={image} />

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
    </Helmet>
  );
}
