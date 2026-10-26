import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import sharp from "sharp";

const root = resolve(import.meta.dirname, "..");
const sourceDir = resolve(root, "src/assets/images/appliance");
const outputDir = resolve(root, "public/images/articles");

const images = {
  "air-fryer-size-guide.webp": "air-fryer.jpg",
  "air-fryer-vs-convection-oven.webp": "air-fryer-ninja.jpg",
  "clean-air-fryer.webp": "air-fryer-interior.jpg",
  "washing-machine-capacity-guide.webp": "washer-panasonic.jpg",
  "front-load-vs-top-load-washers.webp": "laundry-pair.jpg",
  "washing-machine-maintenance-routine.webp": "washer-panasonic.jpg",
  "robot-vacuum-pet-guide.webp": "robot-vacuum.jpg",
  "robot-vacuum-navigation-reviewed.webp": "robot-vacuum.jpg",
  "robot-vacuum-maintenance-routine.webp": "robot-vacuum.jpg",
  "humidifier-bedroom-guide.webp": "humidifier.jpg",
  "humidifier-vs-air-purifier.webp": "air-purifier.jpg",
  "clean-a-humidifier.webp": "humidifier.jpg",
  "smart-doorbell-buying-guide.webp": "smart-doorbell.jpg",
  "smart-lock-vs-keypad-lock.webp": "smart-lock.jpg",
  "smart-home-privacy-setup.webp": "smart-hub.jpg",
  "placeholder-home-appliance.webp": "air-fryer.jpg",
};

await mkdir(outputDir, { recursive: true });

for (const [outputName, sourceName] of Object.entries(images)) {
  const sourcePath = resolve(sourceDir, sourceName);
  const outputPath = resolve(outputDir, outputName);
  await mkdir(dirname(outputPath), { recursive: true });
  await sharp(sourcePath)
    .rotate()
    .resize(1600, 1000, {
      fit: "cover",
      position: "centre",
      withoutEnlargement: false,
    })
    .webp({ quality: 76, effort: 5 })
    .toFile(outputPath);
  console.log(`optimized ${outputName}`);
}
