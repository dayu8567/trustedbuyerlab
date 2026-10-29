const SEASON_BY_MONTH = [
  "winter",
  "winter",
  "spring",
  "spring",
  "spring",
  "summer",
  "summer",
  "summer",
  "autumn",
  "autumn",
  "autumn",
  "winter",
];

const seasonContext = {
  spring: "It is spring in the US, when allergy season, cleaning routines, and changing indoor humidity affect appliance choices.",
  summer: "It is summer in the US, when cooling, humidity control, and heavy household use shape appliance decisions.",
  autumn: "It is autumn in the US, when colder weather, more indoor time, dry heated air, and holiday preparation change how homes use appliances.",
  winter: "It is winter in the US, when heating, dry indoor air, closed windows, and holiday hosting shape appliance decisions.",
};

const topicContext = {
  fan: "air circulation and cooling",
  heater: "heating and cold-weather comfort",
  humidifier: "managing dry indoor air during heating season",
  dehumidifier: "keeping indoor humidity in a comfortable range",
  "air-purifiers": "indoor air quality while windows stay closed",
  "air-fryers": "holiday cooking and efficient weeknight meals",
  "coffee-makers": "warm drinks and holiday hosting",
  dishwashers: "holiday cooking cleanup and everyday water use",
  microwaves: "quick meals and holiday reheating",
  refrigerators: "food storage during holiday preparation",
  "washing-machines": "cold-weather laundry routines",
  dryers: "drying laundry when outdoor drying is less practical",
  "garment-care": "keeping cold-weather clothing and guest outfits ready",
  "robot-vacuums": "maintaining floors with more time spent indoors",
  "cordless-vacuums": "quick indoor cleaning and seasonal touch-ups",
  "carpet-cleaners": "guest-ready cleaning and autumn allergen control",
  "steam-mops": "deep cleaning hard floors before more indoor time",
  "security-cameras": "home awareness during darker evenings and travel periods",
  "video-doorbells": "monitoring deliveries and visitors during the holiday season",
  "smart-locks": "entry control and guest access during the holiday season",
  "smart-home-hubs": "coordinating lighting, security, and heating routines",
};

const seasonalRules = {
  fan: { peak: [5, 6, 7], active: [4, 8], off: [9, 10, 11, 0, 1, 2, 3] },
  heater: { peak: [9, 10, 11, 0, 1], active: [2, 3, 8], off: [4, 5, 6, 7] },
  humidifier: { peak: [9, 10, 11, 0, 1, 2], active: [3, 8] },
  dehumidifier: { peak: [5, 6, 7, 8], active: [3, 4, 9], off: [10, 11, 0, 1, 2] },
  "air-purifiers": { peak: [8, 9, 10, 11, 0, 1], active: [2, 3, 4, 5, 6, 7] },
  "coffee-makers": { peak: [9, 10, 11, 0, 1], active: [2, 3, 4, 5, 6, 7, 8] },
  "air-fryers": { peak: [10, 11, 0], active: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
  "carpet-cleaners": { peak: [8, 9, 10, 11], active: [0, 1, 2, 3, 4, 5, 6, 7] },
  dryers: { peak: [9, 10, 11, 0, 1, 2], active: [3, 4, 5, 6, 7, 8] },
  "garment-care": { peak: [9, 10, 11, 0, 1, 2], active: [3, 4, 5, 6, 7, 8] },
};

const topicForOffer = (offer) => {
  if (offer.subcategory !== "fans-heaters") return offer.subcategory;
  const title = offer.title.toLowerCase();
  if (
    /(?:ceiling|floor|tower|pedestal|box|desk|oscillating|misting|window|exhaust)\s+fan|fandelier/.test(
      title,
    ) &&
    !/\bheater\b/.test(title)
  ) {
    return "fan";
  }
  if (/heater|heating|radiator|fireplace/.test(title)) return "heater";
  return "fans-heaters";
};

export function seasonalProfile(offer, now = new Date()) {
  const month = new Date(now).getUTCMonth();
  const topic = topicForOffer(offer);
  const rule = seasonalRules[topic] ?? {};
  const offSeason = rule.off?.includes(month) ?? false;
  const peak = rule.peak?.includes(month) ?? false;
  const active = rule.active?.includes(month) ?? true;

  return {
    topic,
    inSeason: !offSeason,
    score: offSeason ? -1_000 : peak ? 30 : active ? 15 : 5,
    context: `${seasonContext[SEASON_BY_MONTH[month]]} This appliance fits ${topicContext[topic] ?? "practical household use"}. Frame the article around current ownership and buying considerations; do not claim search-trend data.`,
  };
}
