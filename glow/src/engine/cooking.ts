import type { Food } from '@/data/foods';

// Glow stores everything as RAW (or dry) weight, because that's what the
// food values are for. If you weigh after cooking, this converts back using
// typical cooking yields (cooked weight ÷ raw weight). Meat and fish lose
// water and fat; rice, pasta and lentils absorb water. Yields vary with
// cut, method and time, so a converted weight is an estimate (±10–15%).

const has = (f: Food, re: RegExp) => re.test(`${f.name} ${f.alias ?? ''} ${f.id}`.toLowerCase());

/** Cooked weight as a multiple of raw weight, or undefined when cooking doesn't change how you'd weigh it. */
export function cookingYield(f: Food): number | undefined {
  const tinned = has(f, /tinned|canned|drained|smoked|cured|kipper|cooked|boiled|roast|baked|as eaten|ready|fried rice/);
  if (tinned) return undefined;
  switch (f.category) {
    case 'meat':
      if (has(f, /chicken|turkey|duck|poultry|pheasant|partridge|pigeon|goose|quail/)) return 0.75;
      if (has(f, /mince|ground/)) return 0.75;
      if (has(f, /bacon|sausage|gammon|ham|salami|pudding|haggis|pie|roll|pasty|egg/)) return undefined;
      return 0.72;
    case 'offal':
      return has(f, /broth|marrow|collagen|tallow/) ? undefined : 0.75;
    case 'fish':
      return has(f, /fingers|battered|sushi/) ? undefined : 0.8;
    case 'shellfish':
      return has(f, /roe|caviar/) ? undefined : 0.75;
    case 'eggs':
      return undefined;
    case 'grains':
      if (has(f, /\brice\b|basmati/) && !has(f, /cake|krispies|noodle|flour|bran/)) return has(f, /brown|wild/) ? 2.6 : 2.8;
      if (has(f, /pasta|spaghetti|macaroni|penne|noodle/) && !has(f, /instant/)) return 2.4;
      if (has(f, /quinoa/)) return 2.75;
      if (has(f, /buckwheat|couscous|bulgur|barley|millet/)) return 2.5;
      if (has(f, /potato|yam|plantain/) && !has(f, /chips|crisps|mash|roast|fries/)) return 0.9;
      return undefined;
    case 'legumes':
      if (has(f, /lentil|beans?, (black|kidney|pinto|navy|white|great northern|cannellini)|chickpeas?|split peas|mature seeds, raw/) && !has(f, /tinned|canned|baked beans/)) return 2.5;
      return undefined;
    case 'veg':
      if (has(f, /spinach|kale|chard|cavolo|greens|collard|watercress|rocket/)) return 0.6;
      if (has(f, /mushroom/)) return 0.6;
      if (has(f, /onion|pepper|courgette|aubergine|squash|carrot|broccoli|cauliflower|sprout|beans|asparagus|leek|cabbage|parsnip|beetroot|sweet potato/)) return 0.85;
      return undefined;
    default:
      return undefined;
  }
}

export function cookedToRaw(f: Food, cookedGrams: number): number {
  const y = cookingYield(f);
  return y ? Math.round(cookedGrams / y) : cookedGrams;
}

export function yieldNote(f: Food): string | undefined {
  const y = cookingYield(f);
  if (!y) return undefined;
  return y > 1
    ? `Absorbs water: cooked weight is about ${y}× the dry weight.`
    : `Loses water and fat: cooked weight is about ${Math.round(y * 100)}% of the raw weight.`;
}
