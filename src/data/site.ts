export const SITE = {
  name: "Trusted Buyer Lab",
  url: "https://trustedbuyerlab.com",
  title: "Trusted Buyer Lab",
  description:
    "Independent buying guides, practical explainers, and time-stamped price briefs for household appliances.",
  updated: "October 26, 2026",
  gtmId: import.meta.env.PUBLIC_GTM_ID ?? "",
  navigation: [
    { href: "/", label: "Home" },
    { href: "/deals/", label: "Deals" },
    { href: "/reviews/", label: "Reviews" },
    { href: "/buying-guides/", label: "Buying Guides" },
    { href: "/how-to/", label: "How To" },
    { href: "/categories/", label: "Categories" },
    { href: "/about/", label: "About" },
  ],
  legalLinks: [
    { href: "/privacy-policy/", label: "Privacy policy" },
    { href: "/terms/", label: "Terms" },
    { href: "/affiliate-disclosure/", label: "Affiliate disclosure" },
  ],
} as const;

export const disclosure =
  "As an Amazon Associate and affiliate partner, we may earn a commission from qualifying purchases at no extra cost to you.";
