import type { ComparisonRow, FaqItem, ProductPick } from "./types";
import sora30 from "../assets/images/beatbot-sora-30.jpg";
import wybotC1 from "../assets/images/wybot-c1.jpg";
import wybotC2 from "../assets/images/wybot-c2.jpg";

const category = "Cordless robotic pool cleaners";
const pageType = "review" as const;

export const cordlessPicks: ProductPick[] = [
  {
    id: "beatbot-sora-30",
    rankLabel: "Best overall",
    name: "Beatbot Sora 30 Pool Vacuum",
    shortName: "Beatbot Sora 30",
    bestFor: "Larger above-ground or in-ground pools.",
    summary:
      "The strongest published mix of runtime, coverage, suction, capacity, and multi-zone cleaning in this comparison.",
    image: sora30,
    imageAlt: "Beatbot Sora 30 cordless robotic pool vacuum",
    specs: [
      "300-minute listed runtime",
      "6,800 GPH listed suction",
      "5L basket, up to 3,229 sq. ft.",
    ],
    cta: {
      href: "https://pboost.me/g2a3Bwe2",
      label: "Check Sora 30 price",
      network: "partnerboost",
      productName: "Beatbot Sora 30 Pool Vacuum",
      productRank: 1,
      category,
      pageType,
    },
  },
  {
    id: "wybot-c1",
    rankLabel: "Best value",
    name: "WYBOT C1 Power Cordless Robotic Pool Vacuum",
    shortName: "WYBOT C1",
    bestFor: "Wall and waterline cleaning without overbuying.",
    summary:
      "A balanced cordless option with smart navigation, app support, and published coverage that fits many residential pools.",
    image: wybotC1,
    imageAlt: "WYBOT C1 cordless robotic pool vacuum",
    specs: [
      "Up to 1,618 sq. ft. listed coverage",
      "160-minute listed runtime",
      "Wall, waterline, and floor cleaning",
    ],
    cta: {
      href: "https://pboost.me/J2a3g3vgv",
      label: "Check WYBOT C1 price",
      network: "partnerboost",
      productName: "WYBOT C1 Power Cordless Robotic Pool Vacuum",
      productRank: 2,
      category,
      pageType,
    },
  },
  {
    id: "wybot-c2",
    rankLabel: "Best for scheduling",
    name: "WYBOT C2 Cordless Robotic Pool Cleaner",
    shortName: "WYBOT C2",
    bestFor: "App scheduling and dual filtration.",
    summary:
      "The convenience-led choice for in-ground pools when recurring schedules and flexible filtration matter more than raw coverage.",
    image: wybotC2,
    imageAlt: "WYBOT C2 cordless robotic pool cleaner",
    specs: [
      "Dual filtration",
      "App scheduling",
      "Floor, wall, and waterline cleaning",
    ],
    cta: {
      href: "https://pboost.me/R2a3c45ga",
      label: "Check WYBOT C2 price",
      network: "partnerboost",
      productName: "WYBOT C2 Cordless Robotic Pool Cleaner",
      productRank: 3,
      category,
      pageType,
    },
  },
];

export const cordlessComparisonHeaders = [
  "Model",
  "Best for",
  "Price level",
  "Core performance",
  "Main advantage",
  "Main drawback",
];

export const cordlessComparisonRows: ComparisonRow[] = [
  {
    label: "Beatbot Sora 30",
    values: [
      "Large pools",
      "Higher",
      "Long runtime, broad coverage, high listed flow",
      "Most complete spec profile",
      "May exceed the needs of a compact pool",
    ],
  },
  {
    label: "WYBOT C1",
    values: [
      "Value-focused wall and waterline cleaning",
      "Mid",
      "160-minute runtime and smart navigation",
      "Balanced feature set",
      "Lower listed coverage than Sora 30",
    ],
  },
  {
    label: "WYBOT C2",
    values: [
      "Scheduling and mixed debris",
      "Mid to higher",
      "Multi-zone cleaning with dual filtration",
      "Best convenience angle",
      "Verify current runtime and coverage before buying",
    ],
  },
];

export const cordlessFaqs: FaqItem[] = [
  {
    question: "Do I need wall and waterline cleaning?",
    answer:
      "If your pool shows buildup beyond the floor, wall and waterline coverage can reduce manual brushing. Floor-only cleaning may be enough for a simple flat-bottom pool.",
  },
  {
    question: "Is Beatbot Sora 30 worth it over WYBOT C1?",
    answer:
      "It can be worth it for a larger pool or for the strongest listed runtime and coverage. WYBOT C1 is the more focused value choice for smaller pools.",
  },
  {
    question: "Why choose WYBOT C2 instead of WYBOT C1?",
    answer:
      "Choose C2 when app scheduling and dual filtration are important to your routine. Choose C1 when a balanced value position is the priority.",
  },
  {
    question: "Can these cleaners handle leaves?",
    answer:
      "They are designed for pool debris, but leaf performance depends on leaf size, basket capacity, filter design, and run frequency. Heavy leaf loads still benefit from regular skimming.",
  },
  {
    question: "Should I rely only on runtime?",
    answer:
      "No. Coverage, basket design, retrieval, scheduling, and your pool shape can matter as much as the published runtime.",
  },
];
