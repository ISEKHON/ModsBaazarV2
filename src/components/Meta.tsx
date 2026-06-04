import Head from "next/head";

interface MetaProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
}

export default function Meta({ title, description, image, url, type = "website" }: MetaProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fsmodshub.com";
  const fullTitle = `${title} — FS Mods Hub`;
  const fullImage = image ? (image.startsWith("http") ? image : `${siteUrl}${image}`) : `${siteUrl}/og-image.png`;
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      {/* Open Graph */}
      <meta property="og:site_name" content="FS Mods Hub" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />

      {/* Additional SEO */}
      <link rel="canonical" href={fullUrl} />
    </Head>
  );
}
