import type { ImageMetadata } from "astro";

export interface AffiliateLink {
  href: string;
  label: string;
  network: "amazon" | "partnerboost";
  productName: string;
  productRank: number;
  category: string;
  pageType: "review" | "comparison";
}

export interface ProductPick {
  id: string;
  rankLabel: string;
  name: string;
  shortName: string;
  bestFor: string;
  summary: string;
  image: ImageMetadata;
  imageAlt: string;
  specs: string[];
  cta: AffiliateLink;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ComparisonRow {
  label: string;
  values: string[];
}
