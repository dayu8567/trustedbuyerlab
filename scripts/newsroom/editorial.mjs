const DAY_MS = 86_400_000;

const epaHumidifiers = {
  label: "EPA: Use and care of home humidifiers",
  url: "https://www.epa.gov/indoor-air-quality-iaq/use-and-care-home-humidifiers",
  publisher: "U.S. Environmental Protection Agency",
};

const epaAirCleaners = {
  label: "EPA: Guide to air cleaners in the home",
  url: "https://www.epa.gov/indoor-air-quality-iaq/guide-air-cleaners-home",
  publisher: "U.S. Environmental Protection Agency",
};

const cpscHeating = {
  label: "CPSC: Heating fire safety",
  url: "https://www.cpsc.gov/Safety-Education/Safety-Education-Centers/Heating-Fire",
  publisher: "U.S. Consumer Product Safety Commission",
};

const doeLaundry = {
  label: "DOE: Laundry and appliance energy use",
  url: "https://www.energy.gov/energysaver/laundry",
  publisher: "U.S. Department of Energy",
};

const energyStarDishwashers = {
  label: "ENERGY STAR: Dishwashers",
  url: "https://www.energystar.gov/products/dishwashers",
  publisher: "ENERGY STAR",
};

const fdaFoodStorage = {
  label: "FDA: Are you storing food safely?",
  url: "https://www.fda.gov/consumers/consumer-updates/are-you-storing-food-safely",
  publisher: "U.S. Food and Drug Administration",
};

const cpscGourmiaRecall = {
  label:
    "CPSC: Gourmia recalls 9-slice digital air fryer ovens due to burn hazard",
  url: "https://www.cpsc.gov/Recalls/2027/Gourmia-Recalls-9-Slice-Digital-Air-Fryer-Ovens-Due-to-Burn-Hazard",
  publisher: "U.S. Consumer Product Safety Commission",
};

const epaIndoorAir = {
  label: "EPA: Introduction to indoor air quality",
  url: "https://www.epa.gov/indoor-air-quality-iaq/introduction-indoor-air-quality",
  publisher: "U.S. Environmental Protection Agency",
};

const seasonalEditorials = [
  {
    slug: "gourmia-air-fryer-recall-safety-check",
    requiresTrend: true,
    trendTerms: [
      "air fryer recall",
      "air fryer oven recall",
      "Gourmia",
      "burn hazard",
      "burn injuries",
    ],
    title: "Gourmia air fryer oven recall: safety checks for owners",
    description:
      "How to identify the recalled Gourmia 9-slice digital air fryer oven, stop using an affected unit, and find the official recall instructions.",
    category: "kitchen-appliances",
    subcategory: "air-fryers",
    format: "how-to",
    readingTime: "4 min read",
    image: "/images/articles/air-fryer-size-guide.webp",
    imageAlt: "Countertop air fryer oven in a kitchen",
    imageCredit: "Photo: I am R. / Wikimedia Commons, CC BY 2.0",
    seasons: ["spring", "summer", "autumn", "winter"],
    sources: [cpscGourmiaRecall],
    context:
      "Recent national coverage has focused on a Gourmia air fryer oven recall tied to a burn hazard. The official CPSC notice identifies a specific model and UPC, so owners should check the label instead of assuming every air fryer is affected.",
    bodyMarkdown: `## Check the model and UPC

The CPSC recall covers Gourmia 9-Slice Digital Air Fryer Ovens with model number GTF7530 and UPC 810002862779. The stainless-steel oven has two spring-loaded glass French doors with metal handles. The model and UPC appear on the packaging, and the model number and date codes can be checked on the label on the back of the unit.

## Stop using an affected unit

If the model and identifying codes match the official notice, stop using the appliance and follow the CPSC remedy instructions. Unplug it before moving or inspecting it, and do not continue cooking with a unit that has a door, hinge, or latch problem. Keep the official recall page available when contacting the manufacturer or retailer.

## Check the exact configuration

Appliance families can share a name while using different model numbers or production codes. Do not rely on the product category, retailer, or a social-media post alone. Compare the complete model number and UPC with the CPSC notice, and contact Gourmia through the recall instructions if the label is difficult to read.

## Report a related incident

Owners who experienced a burn, unexpected door movement, or another safety problem should follow the reporting instructions on the CPSC notice. Keep the appliance out of use while the case is reviewed. A recall does not mean every air fryer has the same defect; the model and code check determines whether the notice applies.`,
  },
  {
    slug: "humidifier-heating-season-check",
    trendTerms: ["humidifier", "indoor humidity", "dry indoor air"],
    title: "How to get a humidifier ready for heating season",
    description:
      "A practical autumn checklist for cleaning, inspecting, and placing a home humidifier before indoor heating starts running more often.",
    category: "air-climate",
    subcategory: "humidifiers",
    format: "how-to",
    readingTime: "5 min read",
    image: "/images/articles/humidifier-bedroom-guide.webp",
    imageAlt: "Humidifier running in a bedroom during heating season",
    imageCredit: "Photo: Wikimedia Commons / public domain",
    seasons: ["autumn", "winter"],
    sources: [epaHumidifiers, epaIndoorAir],
    context:
      "Heating season often makes indoor air feel drier and keeps windows closed for longer periods. A humidifier can be useful, but it needs a clean start and careful placement.",
    bodyMarkdown: `## Start with the manual

Before filling a humidifier for the first time this season, check the manufacturer's instructions for the water type, cleaning schedule, and replacement parts. Models differ on filter care, tank cleaning, and the use of additives. Follow the current manual rather than an old routine from a different appliance.

## Clean the parts that touch water

Empty the tank, inspect the base and seals, and remove mineral buildup according to the manufacturer's directions. Let removable parts dry completely before reassembly. Do not mix cleaning chemicals unless the manual specifically allows it.

## Place it where air can circulate

Keep the humidifier on a stable surface, away from walls and fabric that could become damp. Do not aim mist directly at furniture, bedding, or electronics. A room with good air circulation is easier to manage than a tight corner.

## Watch the room, not just the tank

Use the appliance's controls as directed and stop using it if it leaks, smells unusual, or produces inconsistent mist. Clean and store it according to the manual when it is not needed. Indoor moisture should be managed deliberately rather than by running the device continuously without checking the room.`,
  },
  {
    slug: "air-purifier-filter-closed-window-check",
    trendTerms: ["air purifier", "indoor air quality", "air filtration"],
    title: "Air purifier filter checks for closed-window season",
    description:
      "What to inspect on an air purifier before autumn and winter keep windows closed, including filters, airflow, placement, and maintenance records.",
    category: "air-climate",
    subcategory: "air-purifiers",
    format: "how-to",
    readingTime: "5 min read",
    image: "/images/articles/humidifier-vs-air-purifier.webp",
    imageAlt: "Air purifier in a living room during closed-window season",
    imageCredit:
      "Photo: Home Air Quality Guides / Wikimedia Commons, CC BY-SA 2.0",
    seasons: ["autumn", "winter"],
    sources: [epaAirCleaners, epaIndoorAir],
    context:
      "Colder weather often means less ventilation through open windows. That makes filter condition, airflow, and room placement more important for households that rely on an air purifier.",
    bodyMarkdown: `## Check the filter before heavy use

Inspect the pre-filter and main filter according to the manufacturer's instructions. Dust, pet hair, and visible buildup can restrict airflow. Replace or clean only the parts the manual identifies as serviceable.

## Confirm airflow from every side

Move the purifier away from curtains, furniture, and walls that block its intake or exhaust. A high setting cannot compensate for a blocked airflow path. Keep the unit on a stable surface and route the cord where it will not be pinched.

## Match the unit to the room

Use the room-size guidance in the current manual rather than assuming a larger fan speed solves every layout problem. Doors, furniture, and open floor plans can change how air moves through a home. A purifier is one part of indoor-air management, not a substitute for fixing moisture, smoke, or other source problems.

## Record the next service date

Write down the filter install date and the manufacturer's recommended inspection interval. Check for unusual noise, vibration, or a persistent odor. If the unit is damaged or the filter housing does not seal correctly, stop using it and follow the manufacturer's service guidance.`,
  },
  {
    slug: "space-heater-safety-cold-rooms",
    trendTerms: [
      "space heater",
      "heater safety",
      "heating safety",
      "heater recall",
    ],
    title: "Space heater safety checks before colder nights",
    description:
      "A room-by-room safety routine for space heaters, covering cords, clearance, placement, timers, and the signs that a unit should be replaced.",
    category: "air-climate",
    subcategory: "fans-heaters",
    format: "how-to",
    readingTime: "5 min read",
    image: "/images/articles/seasonal-space-heater-safety.webp",
    imageAlt: "Portable heater in a cleared indoor space",
    imageCredit:
      "Photo: Christos Vittoratos / Wikimedia Commons, CC BY 3.0",
    seasons: ["autumn", "winter"],
    sources: [cpscHeating],
    context:
      "As overnight temperatures fall, portable heaters move into bedrooms, offices, and basements. Clearance and cord safety matter more than a high heat setting.",
    bodyMarkdown: `## Read the current safety instructions

Use the heater only as described in its manual. Check the cord, plug, housing, and controls before the first use of the season. A cracked plug, damaged cord, or loose connection is a reason to stop using the unit.

## Keep the clearance zone clear

Place the heater on a hard, stable surface and keep paper, bedding, curtains, and furniture outside the manufacturer's clearance zone. Never place a portable heater where a child, pet, or walking path can knock it over.

## Treat cords as part of the appliance

Plug the heater directly into a compatible wall outlet as instructed. Do not run the cord under rugs, through doorways, or behind furniture where damage can go unnoticed. Do not use an extension cord unless the heater manual explicitly permits the setup.

## Use controls as intended

Keep vents unobstructed, use the timer or thermostat only as designed, and turn the unit off before moving it or leaving the room when the manual says to do so. If the heater trips a breaker, sparks, smells burned, or repeatedly shuts down, stop using it and seek qualified service or replacement.`,
  },
  {
    slug: "coffee-maker-holiday-hosting-prep",
    trendTerms: ["coffee maker", "espresso machine", "coffee recall"],
    title: "Coffee maker care before holiday hosting",
    description:
      "A simple pre-hosting routine for checking a coffee maker, cleaning removable parts, testing the brew cycle, and avoiding surprises with a full house.",
    category: "kitchen-appliances",
    subcategory: "coffee-makers",
    format: "how-to",
    readingTime: "4 min read",
    image: "/images/articles/seasonal-coffee-maker-hosting.webp",
    imageAlt: "Coffee maker prepared for a gathering",
    imageCredit: "Photo: Shixart1985 / Wikimedia Commons, CC BY 2.0",
    seasons: ["autumn", "winter"],
    sources: [],
    context:
      "Cooler weather and holiday hosting often mean brewing more coffee than usual. A basic check before guests arrive is easier than troubleshooting a full machine during breakfast.",
    bodyMarkdown: `## Inspect the parts you remove

Wash the carafe, basket, pod holder, and other removable parts according to the manufacturer's instructions. Check for cracks, missing seals, or residue in areas that are difficult to see during a quick rinse.

## Run a normal cycle first

Before serving guests, run a normal water-only cycle when the manual allows it and confirm that water flows at the expected rate. Watch for leaks around the base and listen for unusual noises. If the machine has a descaling indicator, follow the manufacturer's current procedure rather than mixing your own cleaning solution.

## Check the setup, not only the machine

Confirm that the outlet, cord, outlet filter, and water container are secure. Clear enough counter space for cups and the carafe. If the machine uses a reusable filter, verify that it seats correctly and is not torn.

## Have a backup plan

For a large gathering, test the brew cycle a day ahead and know how long a full batch takes. Keep a kettle or a second brewing method available if the machine is older or has shown inconsistent performance. Stop using the appliance if it leaks from the housing, trips a breaker, or produces a burning smell.`,
  },
  {
    slug: "dishwasher-holiday-loading-prep",
    trendTerms: ["dishwasher", "dishwasher recall", "holiday dishes"],
    title: "Dishwasher prep for holiday cooking and cleanup",
    description:
      "A pre-holiday dishwasher check covering filters, spray arms, loading habits, cycles, and the items that should stay out of the machine.",
    category: "kitchen-appliances",
    subcategory: "dishwashers",
    format: "how-to",
    readingTime: "5 min read",
    image: "/images/articles/seasonal-dishwasher-holiday-prep.webp",
    imageAlt: "Dishwasher ready for a large meal cleanup",
    imageCredit: "Photo: Shixart1985 / Wikimedia Commons, CC BY 2.0",
    seasons: ["autumn", "winter"],
    sources: [energyStarDishwashers],
    context:
      "Holiday cooking creates more dishes, serving pieces, and cookware than a normal weekday. A short check now can prevent a preventable backup during the busiest cleanup of the season.",
    bodyMarkdown: `## Clear the filter and spray arms

Remove and rinse the filter according to the manufacturer's instructions, then check that spray arms can rotate freely. Food debris and a blocked arm can turn a full load into a rewash.

## Confirm what can go inside

Check the dishwasher manual before loading holiday platters, insulated cups, wooden boards, cast iron, or specialty cookware. Heat and water exposure can damage some items even when they look sturdy.

## Load for water access

Face dirty surfaces toward the spray pattern, avoid nesting bowls tightly, and keep utensils from blocking the detergent door. Do not overload the racks just because the kitchen is busy. A slightly smaller load that gets clean is more efficient than repeating a cycle.

## Run the cycle you actually need

Select a cycle that matches the load and the manual's guidance. Use detergent and rinse aid as directed, and avoid adding a second cleaning product unless the machine specifies it. If the dishwasher leaks, will not drain, or leaves standing water, stop and arrange service before the next large meal.`,
  },
  {
    slug: "refrigerator-holiday-food-storage",
    trendTerms: [
      "refrigerator",
      "food safety",
      "holiday food storage",
      "Thanksgiving food",
    ],
    title: "Refrigerator prep for holiday food storage",
    description:
      "A practical pre-holiday refrigerator check covering temperature, airflow, raw-food separation, leftovers, and the signs that cold storage needs attention.",
    category: "kitchen-appliances",
    subcategory: "refrigerators",
    format: "how-to",
    readingTime: "5 min read",
    image: "/images/articles/seasonal-refrigerator-holiday-food-storage.webp",
    imageAlt: "Open refrigerator stocked with food before a holiday gathering",
    imageCredit: "Photo: W.carter / Wikimedia Commons, CC BY-SA 4.0",
    seasons: ["autumn", "winter"],
    sources: [fdaFoodStorage],
    context:
      "Holiday cooking can fill the refrigerator faster than a normal week. Checking temperature, airflow, and how raw food is stored before the shopping trip is more useful than trying to reorganize an overloaded fridge at the last minute.",
    bodyMarkdown: `## Start with the temperature

Check the refrigerator temperature with an appliance thermometer if your model does not display one. The FDA recommends keeping the refrigerator at 40°F or below and the freezer at 0°F or below. Follow the appliance manual for setting and adjusting the controls.

## Leave a path for cold air

Clear old food, wipe up spills, and avoid packing shelves so tightly that air cannot move around the compartments. A refrigerator that is too crowded can make it harder to find food and manage temperatures consistently. Keep the door seals clean and close the door deliberately when the kitchen is busy.

## Separate raw food from ready-to-eat food

Place raw meat, poultry, seafood, and their juices away from produce and prepared foods. Use containers or a tray that can catch drips, and keep raw items below ready-to-eat food when the layout allows. Follow the refrigerator manual for any storage drawers or compartments with specific controls.

## Manage leftovers deliberately

Label containers with the food and date, cool hot food promptly using shallow containers when appropriate, and reheat or discard it according to current food-safety guidance. Do not keep adding new containers to a forgotten back shelf. Check for condensation, unusual warmth, ice buildup, or a door that no longer closes cleanly, and arrange service if the refrigerator cannot hold a safe temperature.`,
  },
  {
    slug: "winter-dryer-laundry-check",
    trendTerms: ["clothes dryer", "dryer safety", "lint fire", "laundry"],
    title: "Winter laundry checks that keep the dryer running",
    description:
      "A cold-weather laundry routine for checking the dryer, clearing lint, protecting airflow, and avoiding overloaded cycles when clothes take longer to dry.",
    category: "laundry",
    subcategory: "dryers",
    format: "how-to",
    readingTime: "5 min read",
    image: "/images/articles/washing-machine-maintenance-routine.webp",
    imageAlt: "Laundry appliances in a utility room during winter",
    imageCredit: "Photo: Wikimedia Commons / CC0",
    seasons: ["autumn", "winter"],
    sources: [doeLaundry],
    context:
      "Cold weather can make indoor drying less practical and increase dryer use. Lint, overloaded drums, and blocked airflow make every winter load take longer.",
    bodyMarkdown: `## Clean the lint path

Clean the lint screen before or after every load according to the manufacturer's instructions. Inspect the screen for tears and check the surrounding area for lint buildup. Do not operate the dryer without the filtering components installed as designed.

## Keep the drum from being packed

Clothes need room to move and air needs a path through the load. Separate heavy items such as blankets and towels from light synthetic fabrics when the manual recommends it. A crowded dryer can leave clothes damp and increase cycle time.

## Check the vent and installation

Confirm that the dryer vent path is not crushed behind the appliance. Follow the manual for vent type and cleaning interval. If drying takes much longer than usual, the drum is hot but clothes stay wet, or the outside vent flap does not move, stop using the dryer and investigate the airflow problem.

## Match the cycle to the fabric

Use the moisture sensor or timed setting that fits the load, and remove items promptly when the cycle ends. Do not add wet clothes to an already warm dryer without checking the manual. Regular maintenance and correct loading are more useful than running every load on the longest setting.`,
  },
  {
    slug: "robot-vacuum-autumn-indoor-routine",
    trendTerms: ["robot vacuum", "vacuum recall", "indoor cleaning"],
    title: "Robot vacuum upkeep for closed-window season",
    description:
      "A seasonal robot vacuum maintenance routine for brushes, filters, wheels, docks, and floor clutter before homes spend more time closed up.",
    category: "cleaning",
    subcategory: "robot-vacuums",
    format: "how-to",
    readingTime: "4 min read",
    image: "/images/articles/robot-vacuum-maintenance-routine.webp",
    imageAlt: "Robot vacuum being maintained before indoor cleaning season",
    imageCredit: "Photo: Auledas / Wikimedia Commons, CC BY-SA 4.0",
    seasons: ["autumn", "winter"],
    sources: [epaIndoorAir],
    context:
      "More time indoors and closed windows can make everyday dust, pet hair, and tracked-in debris more noticeable. A robot vacuum needs clean brushes and stable docking to keep its routine reliable.",
    bodyMarkdown: `## Clear the brushes and wheels

Turn the robot off before maintenance. Remove hair from the main brush, side brushes, and wheels according to the manual. Check that moving parts can spin freely and that the brush guard is seated correctly.

## Service the dustbin and filter

Empty the dustbin, inspect the filter, and clean only what the manufacturer allows. A clogged filter or full bin can reduce pickup and make the robot run longer. Let washable parts dry completely before reinstalling them.

## Check the dock and floor path

Keep the charging contacts clean and the dock on a stable surface with the required clearance. Move loose cables, socks, and small objects out of the usual route. A clear floor is safer and produces more consistent coverage than repeatedly increasing suction.

## Watch the reports

Review repeat errors, stuck alerts, and shortened run times. Clean the sensors and check the wheels for debris. If the robot consistently stops in the same area, inspect the floor transition rather than assuming the battery is failing.`,
  },
];

const monthSeason = (month) => {
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "autumn";
  return "winter";
};

export function seasonalEditorialCandidates(now = new Date()) {
  const date = new Date(now);
  const season = monthSeason(date.getUTCMonth());
  return seasonalEditorials.filter((topic) =>
    topic.seasons.includes(season),
  );
}

export function seasonalEditorialFor(
  now = new Date(),
  publishedPosts = [],
  trendSnapshot = null,
) {
  const date = new Date(now);
  const seasonalCandidates = seasonalEditorialCandidates(date);
  const trendMatchedCandidates = seasonalCandidates.filter(
    (topic) =>
      !topic.requiresTrend ||
      (trendSnapshot?.topicScores?.[topic.slug]?.score ?? 0) > 0,
  );
  const candidates =
    trendMatchedCandidates.length > 0
      ? trendMatchedCandidates
      : seasonalCandidates.filter((topic) => !topic.requiresTrend);
  const recentCutoff =
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) -
    30 * DAY_MS;
  const lastUsed = new Map();

  for (const post of publishedPosts) {
    if (post?.selectionBasis !== "seasonal-editorial") continue;
    const topic = candidates.find((candidate) =>
      post.slug?.startsWith(`seasonal-${candidate.slug}-`),
    );
    if (!topic) continue;
    const publishedTime = new Date(`${post.publishedAt}T00:00:00Z`).getTime();
    if (Number.isFinite(publishedTime)) {
      lastUsed.set(topic.slug, Math.max(lastUsed.get(topic.slug) ?? 0, publishedTime));
    }
  }

  const dayIndex = Math.floor(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) /
      DAY_MS,
  );
  const ranked = candidates
    .map((topic, index) => ({
      topic,
      usedAt: lastUsed.get(topic.slug) ?? 0,
      trendScore: trendSnapshot?.topicScores?.[topic.slug]?.score ?? 0,
      rotation: (index - dayIndex + candidates.length * 2) % candidates.length,
    }))
    .sort(
      (a, b) =>
        Number(a.usedAt > recentCutoff) - Number(b.usedAt > recentCutoff) ||
        b.trendScore - a.trendScore ||
        a.usedAt - b.usedAt ||
        a.rotation - b.rotation,
    );

  const selected = ranked[0];
  const signal = trendSnapshot?.topicScores?.[selected.topic.slug] ?? null;
  return {
    ...selected.topic,
    trendSignal: signal
      ? {
          ...signal,
          scannedAt: trendSnapshot.scannedAt,
          providers: trendSnapshot.providers,
        }
      : null,
  };
}
