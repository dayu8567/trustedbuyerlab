export const SITE = {
  name: "Trusted Buyer Lab",
  url: "https://trustedbuyerlab.com",
  title: "Trusted Buyer Lab",
  description:
    "Independent, research-led buying guides for pool robots and home equipment.",
  updated: "October 25, 2026",
  gtmId: import.meta.env.PUBLIC_GTM_ID ?? "",
  navigation: [
    { href: "/", label: "Pool robot guide" },
    {
      href: "/best-cordless-robotic-pool-cleaners/",
      label: "2026 comparison",
    },
  ],
  legalLinks: [
    { href: "/privacy-policy/", label: "Privacy policy" },
    { href: "/terms/", label: "Terms" },
    { href: "/affiliate-disclosure/", label: "Affiliate disclosure" },
  ],
} as const;

export const disclosure =
  "As an Amazon Associate and affiliate partner, we may earn a commission from qualifying purchases at no extra cost to you.";
