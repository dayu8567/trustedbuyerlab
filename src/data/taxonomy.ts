export const CATEGORIES = {
  "kitchen-appliances": {
    label: "Kitchen Appliances",
    shortLabel: "Kitchen",
    eyebrow: "Kitchen and cooking",
    href: "/kitchen-appliances/",
    description:
      "Practical guidance for air fryers, coffee makers, dishwashers, microwaves, and refrigerators.",
    image: "/images/articles/air-fryer-size-guide.webp",
    imageAlt: "Air fryer on a kitchen counter",
  },
  laundry: {
    label: "Laundry",
    shortLabel: "Laundry",
    eyebrow: "Wash, dry, and care",
    href: "/laundry/",
    description:
      "Washing machine, dryer, and garment-care advice for cleaner clothes and simpler routines.",
    image: "/images/articles/washing-machine-capacity-guide.webp",
    imageAlt: "Front-load washing machine in a laundry room",
  },
  cleaning: {
    label: "Cleaning",
    shortLabel: "Cleaning",
    eyebrow: "Floors and surfaces",
    href: "/cleaning/",
    description:
      "Robot vacuums, cordless cleaners, carpet tools, and maintenance advice for everyday messes.",
    image: "/images/articles/robot-vacuum-pet-guide.webp",
    imageAlt: "Robotic vacuum navigating a living-room floor",
  },
  "air-climate": {
    label: "Air & Climate",
    shortLabel: "Air & Climate",
    eyebrow: "Comfort at home",
    href: "/air-climate/",
    description:
      "Humidifiers, dehumidifiers, purifiers, fans, and heaters explained without the spec-sheet fog.",
    image: "/images/articles/humidifier-bedroom-guide.webp",
    imageAlt: "Humidifier adding moisture to a bedroom",
  },
  "smart-home": {
    label: "Smart Home",
    shortLabel: "Smart Home",
    eyebrow: "Connected devices",
    href: "/smart-home/",
    description:
      "Security cameras, video doorbells, smart locks, and hubs that fit a practical home setup.",
    image: "/images/articles/smart-doorbell-buying-guide.webp",
    imageAlt: "Smart doorbell mounted beside a front door",
  },
} as const;

export type CategoryKey = keyof typeof CATEGORIES;

export const SUBCATEGORIES = {
  "air-fryers": {
    label: "Air Fryers",
    href: "/kitchen-appliances/air-fryers/",
    category: "kitchen-appliances",
    description:
      "Size, power, basket design, cleaning, and the features that change daily use.",
  },
  "coffee-makers": {
    label: "Coffee Makers",
    href: "/kitchen-appliances/coffee-makers/",
    category: "kitchen-appliances",
    description:
      "Drip, pod, and specialty coffee machines compared by routine and counter space.",
  },
  dishwashers: {
    label: "Dishwashers",
    href: "/kitchen-appliances/dishwashers/",
    category: "kitchen-appliances",
    description:
      "Capacity, racks, noise ratings, drying, and installation questions before buying.",
  },
  microwaves: {
    label: "Microwaves",
    href: "/kitchen-appliances/microwaves/",
    category: "kitchen-appliances",
    description:
      "Countertop, over-range, and convection models matched to how you cook.",
  },
  refrigerators: {
    label: "Refrigerators",
    href: "/kitchen-appliances/refrigerators/",
    category: "kitchen-appliances",
    description:
      "Layout, capacity, cooling systems, and the measurements that prevent a costly mistake.",
  },
  "washing-machines": {
    label: "Washing Machines",
    href: "/laundry/washing-machines/",
    category: "laundry",
    description:
      "Front-load and top-load washers compared by capacity, cycles, and maintenance.",
  },
  dryers: {
    label: "Dryers",
    href: "/laundry/dryers/",
    category: "laundry",
    description:
      "Vented and heat-pump dryers, cycle choices, venting, and installation constraints.",
  },
  "garment-care": {
    label: "Garment Care",
    href: "/laundry/garment-care/",
    category: "laundry",
    description:
      "Steamers, irons, drying racks, and habits that help clothes last longer.",
  },
  "robot-vacuums": {
    label: "Robot Vacuums",
    href: "/cleaning/robot-vacuums/",
    category: "cleaning",
    description:
      "Navigation, mapping, docks, brushes, and the maintenance that affects real coverage.",
  },
  "cordless-vacuums": {
    label: "Cordless Vacuums",
    href: "/cleaning/cordless-vacuums/",
    category: "cleaning",
    description:
      "Runtime, airflow, bin size, attachments, and battery decisions for quick cleaning.",
  },
  "carpet-cleaners": {
    label: "Carpet Cleaners",
    href: "/cleaning/carpet-cleaners/",
    category: "cleaning",
    description:
      "Extraction, shampooing, drying time, and the surfaces each machine can handle.",
  },
  "steam-mops": {
    label: "Steam Mops",
    href: "/cleaning/steam-mops/",
    category: "cleaning",
    description:
      "Floor compatibility, heat-up time, pads, and what a steam mop should not clean.",
  },
  humidifiers: {
    label: "Humidifiers",
    href: "/air-climate/humidifiers/",
    category: "air-climate",
    description:
      "Cool-mist, warm-mist, evaporative models, room sizing, and cleaning routines.",
  },
  dehumidifiers: {
    label: "Dehumidifiers",
    href: "/air-climate/dehumidifiers/",
    category: "air-climate",
    description:
      "Pint ratings, drainage options, operating temperatures, and basement sizing.",
  },
  "air-purifiers": {
    label: "Air Purifiers",
    href: "/air-climate/air-purifiers/",
    category: "air-climate",
    description:
      "CADR, filters, room coverage, noise, and filter replacement costs.",
  },
  "fans-heaters": {
    label: "Fans & Heaters",
    href: "/air-climate/fans-heaters/",
    category: "air-climate",
    description:
      "Spot comfort, safety features, energy use, and placement for seasonal use.",
  },
  "security-cameras": {
    label: "Security Cameras",
    href: "/smart-home/security-cameras/",
    category: "smart-home",
    description:
      "Local versus cloud recording, power, privacy controls, and practical coverage.",
  },
  "video-doorbells": {
    label: "Video Doorbells",
    href: "/smart-home/video-doorbells/",
    category: "smart-home",
    description:
      "Wiring, battery life, subscriptions, notifications, and porch coverage.",
  },
  "smart-locks": {
    label: "Smart Locks",
    href: "/smart-home/smart-locks/",
    category: "smart-home",
    description:
      "Deadbolt compatibility, access options, backups, and rental-friendly choices.",
  },
  "smart-home-hubs": {
    label: "Smart Home Hubs",
    href: "/smart-home/smart-home-hubs/",
    category: "smart-home",
    description:
      "Protocol support, local automation, voice control, and keeping devices interoperable.",
  },
} as const;

export type SubcategoryKey = keyof typeof SUBCATEGORIES;

export const FORMATS = {
  deals: {
    label: "Deals",
    href: "/deals/",
    eyebrow: "Price watch",
    description:
      "Time-stamped price briefs based on product-feed data, with the core facts separated from the analysis.",
  },
  reviews: {
    label: "Reviews",
    href: "/reviews/",
    eyebrow: "Research review",
    description:
      "Specification-led reviews and category analysis, with no hands-on testing claims unless testing took place.",
  },
  "buying-guides": {
    label: "Buying Guides",
    href: "/buying-guides/",
    eyebrow: "Shop smarter",
    description:
      "Decision frameworks for capacity, features, running costs, installation, and maintenance.",
  },
  "how-to": {
    label: "How To",
    href: "/how-to/",
    eyebrow: "Use it better",
    description:
      "Setup, cleaning, and maintenance routines that make household equipment last.",
  },
  comparisons: {
    label: "Comparisons",
    href: "/comparisons/",
    eyebrow: "Choose between",
    description:
      "Side-by-side explanations of adjacent product types and the tradeoffs that matter.",
  },
} as const;

export type FormatKey = keyof typeof FORMATS;

export const LEGACY_CATEGORY_LABELS = {
  "pool-robots": "Pool Robots",
  "pool-care": "Pool Care",
  "buying-guides": "Buying Guides",
} as const;

export type LegacyCategoryKey = keyof typeof LEGACY_CATEGORY_LABELS;

export function isCategory(value: string): value is CategoryKey {
  return value in CATEGORIES;
}

export function isFormat(value: string): value is FormatKey {
  return value in FORMATS;
}

export function isSubcategory(value: string): value is SubcategoryKey {
  return value in SUBCATEGORIES;
}

export function subcategoriesFor(category: CategoryKey) {
  return Object.entries(SUBCATEGORIES)
    .filter(([, subcategory]) => subcategory.category === category)
    .map(([key, subcategory]) => ({ key: key as SubcategoryKey, ...subcategory }));
}
