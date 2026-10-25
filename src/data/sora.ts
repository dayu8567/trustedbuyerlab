import type { ComparisonRow, FaqItem, ProductPick } from "./types";
import sora10 from "../assets/images/beatbot-sora-10.jpg";
import sora30 from "../assets/images/beatbot-sora-30.jpg";
import sora70 from "../assets/images/beatbot-sora-70.jpg";

const category = "Beatbot Sora robotic pool cleaners";
const pageType = "comparison" as const;

export const soraPicks: ProductPick[] = [
  {
    id: "sora-70",
    rankLabel: "Best overall",
    name: "Beatbot Sora 70",
    shortName: "Sora 70",
    bestFor: "Large pools and floating surface debris.",
    summary:
      "The most complete Sora model in this comparison, with surface, floor, wall, waterline, and shallow-zone coverage.",
    image: sora70,
    imageAlt: "Beatbot Sora 70 cordless robotic pool cleaner",
    specs: [
      "Up to 3,200 sq. ft. listed coverage",
      "6L debris capacity",
      "Up to 5 hours in floor mode",
    ],
    cta: {
      href: "https://www.amazon.com/dp/B0H2PHSGPL?th=1",
      label: "Check Sora 70 price",
      network: "amazon",
      productName: "Beatbot Sora 70 Pool Cleaner",
      productRank: 1,
      category,
      pageType,
    },
  },
  {
    id: "sora-30",
    rankLabel: "Best value",
    name: "Beatbot Sora 30",
    shortName: "Sora 30",
    bestFor: "Most family pools, with a balanced feature set.",
    summary:
      "A strong middle pick with published wall, waterline, floor, and platform coverage plus smart surface parking.",
    image: sora30,
    imageAlt: "Beatbot Sora 30 cordless robotic pool cleaner",
    specs: [
      "Up to 3,229 sq. ft. listed coverage",
      "Up to 300 minutes runtime",
      "5L debris capacity",
    ],
    cta: {
      href: "https://www.amazon.com/dp/B0GS65PVHY",
      label: "Check Sora 30 price",
      network: "amazon",
      productName: "Beatbot Sora 30 Pool Cleaner",
      productRank: 2,
      category,
      pageType,
    },
  },
  {
    id: "sora-10",
    rankLabel: "Best entry pick",
    name: "Beatbot Sora 10",
    shortName: "Sora 10",
    bestFor: "Smaller budgets and straightforward routine cleaning.",
    summary:
      "A simpler cordless model for everyday floor, wall, waterline, and shallow-area maintenance.",
    image: sora10,
    imageAlt: "Beatbot Sora 10 cordless robotic pool cleaner",
    specs: [
      "Floor, wall, and waterline coverage",
      "Up to 300 minutes runtime",
      "5L debris capacity",
    ],
    cta: {
      href: "https://www.amazon.com/dp/B0GS1XBMFR",
      label: "Check Sora 10 price",
      network: "amazon",
      productName: "Beatbot Sora 10 Pool Cleaner",
      productRank: 3,
      category,
      pageType,
    },
  },
];

export const soraComparisonHeaders = ["Feature", "Sora 70", "Sora 30", "Sora 10"];

export const soraComparisonRows: ComparisonRow[] = [
  {
    label: "Best for",
    values: ["Large or debris-heavy pools", "Most family pools", "Entry-level cleaning"],
  },
  {
    label: "Cleaning zones",
    values: [
      "Surface, floor, wall, waterline, shallow zones",
      "Floor, wall, waterline, platform",
      "Floor, wall, waterline, shallow area",
    ],
  },
  {
    label: "Debris capacity",
    values: ["6L", "5L", "5L"],
  },
  {
    label: "Listed runtime",
    values: ["Up to 5 hours in floor mode", "Up to 300 minutes", "Up to 300 minutes"],
  },
  {
    label: "Budget level",
    values: ["Premium", "Mid-range value", "Entry-level"],
  },
  {
    label: "Primary advantage",
    values: ["Most complete coverage", "Best balance", "Lowest entry point"],
  },
];

export const soraFaqs: FaqItem[] = [
  {
    question: "Which Sora model is best for leaves?",
    answer:
      "Sora 70 is the strongest fit for floating leaves because it combines surface cleaning with the largest debris basket in this lineup. Heavy leaf loads still benefit from regular skimming.",
  },
  {
    question: "Do I need surface cleaning, or is floor and wall cleaning enough?",
    answer:
      "Surface cleaning is useful when your pool collects floating leaves, pollen, or insects. If most debris sinks, Sora 30 or Sora 10 may cover the routine work for less.",
  },
  {
    question: "Is Sora 70 worth it over Sora 30?",
    answer:
      "Choose Sora 70 when surface debris pickup and the most complete coverage matter. Sora 30 is the more balanced value choice for floor, wall, and waterline cleaning.",
  },
  {
    question: "Which Sora model should I choose for a large pool?",
    answer:
      "Start with Sora 70 for larger or debris-heavy pools. Compare the current retailer specifications for your pool shape and water depth before buying.",
  },
];

export const soraScores = [
  { label: "Cleaning", value: "9.5" },
  { label: "Ease of use", value: "9.4" },
  { label: "Value", value: "9.1" },
  { label: "Coverage", value: "9.6" },
];
