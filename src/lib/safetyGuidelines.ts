import type { FoodCategory } from '@/types';

export interface FoodSafetySpec {
  category: FoodCategory;
  categoryName: string;
  storageTemp: string;
  maxSafeHours: number; // Suhu ruang
  maxRefrigeratedHours: number; // Suhu dingin
  reheatingInstructions: string;
  dos: string[];
  donts: string[];
  spoilageSigns: string[];
}

export const SAFETY_GUIDELINES: Record<FoodCategory, FoodSafetySpec> = {
  nasi: {
    category: 'nasi',
    categoryName: 'Rice & Carbohydrates',
    storageTemp: 'Refrigerated (< 4°C) or above 60°C (Rice Cooker / Warm)',
    maxSafeHours: 4,
    maxRefrigeratedHours: 24,
    reheatingInstructions: 'Steam for 10-15 minutes or microwave 2-3 minutes until thoroughly steaming (min 70°C). Sprinkle light water droplets for fluffy texture.',
    dos: [
      'Consume promptly or refrigerate within 2 hours after pickup',
      'Reheat evenly until steaming hot throughout before eating',
      'Store in clean, airtight containers in the refrigerator',
    ],
    donts: [
      'Do not leave at room temperature for more than 4 hours',
      'Do not reheat more than once',
      'Do not consume if texture turns slimy, watery, or smells sour',
    ],
    spoilageSigns: ['Sour or musty odor', 'Slimy or abnormally sticky texture', 'Unusual yellowing discoloration'],
  },

  lauk: {
    category: 'lauk',
    categoryName: 'Cooked Meats, Poultry & Eggs',
    storageTemp: 'Refrigerated (< 4°C)',
    maxSafeHours: 3,
    maxRefrigeratedHours: 24,
    reheatingInstructions: 'Pan-fry, stir-fry, or microwave until internal temperature reaches 75°C. For curries and stews, bring to a rolling boil.',
    dos: [
      'Separate sauced/wet items from dry items when storing',
      'Ensure reheating penetrates the thickest center parts',
      'Finish within a single sitting once reheated',
    ],
    donts: [
      'Do not leave uncovered at ambient room temperature',
      'Do not mix older cooked portions with fresh raw ingredients',
      'Avoid consuming coconut-based curries if discoloration or foaming occurs',
    ],
    spoilageSigns: ['Slimy residue on surface', 'Sour or pungent ammonia-like odor', 'Foaming or curdled coconut sauce'],
  },

  sayur: {
    category: 'sayur',
    categoryName: 'Vegetables & Salads',
    storageTemp: 'Refrigerated (4-8°C)',
    maxSafeHours: 3,
    maxRefrigeratedHours: 12,
    reheatingInstructions: 'For cooked greens and soups: Bring to a quick simmer on the stove. For fresh salads: Do not reheat; enjoy chilled after washing.',
    dos: [
      'Keep refrigerated in a sealed container if not consumed right away',
      'Wash hands before handling or transferring greens',
      'Consume leafy green broths within 12 hours',
    ],
    donts: [
      'Avoid repeated reheating of green leafy vegetables (such as spinach/mustard)',
      'Do not consume raw salads if heavily condensed and wilted/rotting',
      'Never leave exposed to direct sunlight',
    ],
    spoilageSigns: ['Blackened, mushy leaves', 'Sour fermented smell', 'Cloudy or frothy vegetable broth'],
  },

  roti: {
    category: 'roti',
    categoryName: 'Bread & Pastries',
    storageTemp: 'Dry Room Temperature (20-25°C) in Airtight Container',
    maxSafeHours: 12,
    maxRefrigeratedHours: 48,
    reheatingInstructions: 'Bake in an oven or toaster at 160°C for 3-5 minutes to restore crispness and warm flaky texture.',
    dos: [
      'Store in a cool, dry pantry away from moisture',
      'Warm slightly before serving for optimal texture and aroma',
      'Inspect fruit jams and dairy cream fillings for freshness',
    ],
    donts: [
      'Do not store bread in damp environments prone to mold spores',
      'Do not consume if any visible white, green, or black mold spots appear',
      'Avoid stacking heavy objects on soft cream pastries',
    ],
    spoilageSigns: ['White, green, or dark mold spots', 'Hard, rancid texture', 'Sour, curdled cream filling'],
  },

  kue: {
    category: 'kue',
    categoryName: 'Cakes & Fresh Desserts',
    storageTemp: 'Refrigerated (< 4°C)',
    maxSafeHours: 4,
    maxRefrigeratedHours: 24,
    reheatingInstructions: 'For steamed cakes: Re-steam for 5 minutes. For refrigerated cream cakes and tarts: Enjoy chilled directly.',
    dos: [
      'Refrigerate dairy cream or coconut desserts immediately upon arrival',
      'Use a clean knife or spatula when slicing',
      'Keep containers tightly closed to prevent absorbing refrigerator odors',
    ],
    donts: [
      'Do not leave coconut milk cakes at ambient temperature for > 3 hours',
      'Do not consume if surface exhibits a rancid or oily film',
      'Avoid shaking puddings or delicate dessert packaging',
    ],
    spoilageSigns: ['Separated, sour cream layer', 'Surface mold specks', 'Bitter taste or slimy coating'],
  },

  buah: {
    category: 'buah',
    categoryName: 'Fresh & Sliced Fruits',
    storageTemp: 'Refrigerated (4-8°C)',
    maxSafeHours: 4,
    maxRefrigeratedHours: 24,
    reheatingInstructions: 'No reheating needed. Enjoy chilled and refreshing straight from the refrigerator.',
    dos: [
      'Use clean utensils when consuming cut fruit slices',
      'Keep stored in food-safe airtight containers in the fridge',
      'Consume freshly cut fruit promptly for maximum nutrient retention',
    ],
    donts: [
      'Do not eat cut fruit left out at room temperature all day',
      'Do not consume if fermenting into an alcoholic or fizzy taste',
      'Avoid letting fresh fruits contact raw meat packaging',
    ],
    spoilageSigns: ['Mushy, browned, watery texture', 'Sour fermented alcoholic odor', 'Bubbling or frothy fruit juice'],
  },

  minuman: {
    category: 'minuman',
    categoryName: 'Beverages & Fresh Juices',
    storageTemp: 'Refrigerated (< 4°C) / Over Ice',
    maxSafeHours: 4,
    maxRefrigeratedHours: 24,
    reheatingInstructions: 'For hot beverages: Warm gently on a stove or microwave. For iced juices and milk tea: Serve chilled over fresh ice.',
    dos: [
      'Shake gently before drinking if natural sediment settles',
      'Keep bottles sealed tightly when stored in the fridge',
      'Finish promptly after breaking the bottle seal',
    ],
    donts: [
      'Do not drink directly from the container if you plan to store it again',
      'Do not consume if the bottle or cap is bulging with gas pressure',
      'Avoid freezing beverages in glass bottles',
    ],
    spoilageSigns: ['Bloated, gas-pressurized bottle', 'Curdled, separated milky sediment', 'Sharp, sour uncharacteristic taste'],
  },

  lainnya: {
    category: 'lainnya',
    categoryName: 'Other Surplus Foods',
    storageTemp: 'Refrigerated (< 4°C)',
    maxSafeHours: 4,
    maxRefrigeratedHours: 24,
    reheatingInstructions: 'Reheat thoroughly until steaming hot or boiling before eating.',
    dos: [
      'Inspect physical packaging and container seals upon arrival',
      'Store in a clean, sheltered, hygienic environment',
      'Consume as early as possible after receiving',
    ],
    donts: [
      'Do not consume if foul odor or unusual texture develops',
      'Do not leave exposed at room temperature for over 4 hours',
    ],
    spoilageSigns: ['Sour or rancid odor', 'Slimy surface coating', 'Pungent unpalatable flavor'],
  },
};

export function getSafetyGuideline(category: FoodCategory): FoodSafetySpec {
  return SAFETY_GUIDELINES[category] || SAFETY_GUIDELINES.lainnya;
}
