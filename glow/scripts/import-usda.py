"""Builds src/data/usda.json from USDA SR28 (National Nutrient Database for
Standard Reference, Release 28, public domain).

Usage:  python3 -I scripts/import-usda.py <dir containing ABBREV.txt and FOOD_DES.txt> src/data/usda.json

What it does:
- keeps whole and everyday foods; drops baby foods, restaurant and
  fast-food chains, branded products, Native American foods and meals;
- keeps meat and fish as RAW weights only (Glow logs raw weights);
- converts carbohydrate to UK convention (fibre excluded);
- renames US terms to UK ones (ground beef -> beef mince, shrimp -> prawns);
- infers Glow's tags (haem iron, phytate, gluten, ultra-processed, ...) from
  the food group, name and the carotenoid columns;
- leaves values USDA doesn't record (iodine everywhere, EPA+DHA in SR28's
  abbreviated file) as null = unknown, never zero. For fish, EPA+DHA is
  estimated as 60% of polyunsaturated fat and the note says so.
"""
import json
import re
import sys

src, out = sys.argv[1], sys.argv[2]


def rows(path):
    with open(path, encoding='latin-1') as f:
        for line in f:
            yield [c.strip('~') for c in line.rstrip('\r\n').split('^')]


A_COLS = ['NDB', 'Shrt', 'Water', 'Kcal', 'Protein', 'Fat', 'Ash', 'Carb', 'Fibre', 'Sugar', 'Ca', 'Fe', 'Mg', 'P', 'K', 'Na',
          'Zn', 'Cu', 'Mn', 'Se', 'VitC', 'Thiamin', 'B2', 'Niacin', 'Panto', 'B6', 'FolTot', 'FolicAcid', 'FoodFol', 'FolDFE',
          'Choline', 'B12', 'VitAIU', 'VitARAE', 'Retinol', 'AlphaCar', 'BetaCar', 'BetaCrypt', 'Lycopene', 'LutZea', 'VitE',
          'VitDmcg', 'VitDIU', 'VitK', 'Sat', 'Mono', 'Poly', 'Chol', 'Gm1', 'GmDesc1', 'Gm2', 'GmDesc2', 'Refuse']

abbrev = {}
for r in rows(f'{src}/ABBREV.txt'):
    d = dict(zip(A_COLS, r))
    abbrev[d['NDB']] = d
des = {}
for r in rows(f'{src}/FOOD_DES.txt'):
    des[r[0]] = {'grp': r[1], 'long': r[2], 'manuf': r[5]}


def num(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


DROP_GROUPS = {'0300', '2100', '2200', '3500', '3600'}  # baby, fast food, meals, Native American, restaurant
RAW_ONLY = {'0500', '1000', '1300', '1700', '1500'}       # poultry, pork, beef, lamb/veal/game, fish
BRANDS = re.compile(r"\b(KELLOGG|KRAFT|GENERAL MILLS|POST|QUAKER|NABISCO|PILLSBURY|KEEBLER|HERSHEY|MARS|NESTLE|"
                    r"OSCAR MAYER|HORMEL|LOUIS RICH|CAMPBELL|BANQUET|STOUFFER|LEAN CUISINE|HEALTHY CHOICE|"
                    r"MCDONALD|BURGER KING|WENDY|KFC|TACO BELL|SUBWAY|DOMINO|PIZZA HUT|PAPA JOHN|APPLEBEE|"
                    r"DENNY|OLIVE GARDEN|ARBY|DIGIORNO|SLIMFAST|ENSURE|ABBOTT|UNILEVER|GERBER|MEAD JOHNSON|"
                    r"SIMILAC|ENFAMIL|ARCHWAY|MOTHER'S|SNACKWELL|PEPPERIDGE|LITTLE DEBBIE|HOSTESS|TWINKIES|"
                    r"REESE|M&M|SNICKERS|KIT KAT|MILKY WAY|3 MUSKETEERS|TWIZZLERS|NESTEA|LIPTON|SNAPPLE|"
                    r"GATORADE|POWERADE|COCA-COLA|PEPSI|DR\. PEPPER|MOUNTAIN DEW|RED BULL|SILK|SO DELICIOUS|"
                    r"WORTHINGTON|MORNINGSTAR|BOCA|GARDENBURGER|LUNCHABLES|CHEF BOYARDEE|HUNGRY MAN|"
                    r"MARIE CALLENDER|SWANSON|TYSON|JIMMY DEAN|EGGO|AUNT JEMIMA|HEINZ|OCEAN SPRAY|MINUTE MAID|"
                    r"TROPICANA|WELCH|CAPRI SUN|HAWAIIAN PUNCH|KOOL-AID|CRYSTAL LIGHT|PROPEL|GOYA|LA CHOY|"
                    r"PACE|OLD EL PASO|ORTEGA|BETTY CROCKER|DUNCAN HINES|JELL-O|COOL WHIP|PHILADELPHIA|"
                    r"VELVEETA|KEEBLER|RITZ|TRISCUIT|WHEAT THINS|CHEEZ|GOLDFISH|PRINGLES|LAY'S|DORITOS|"
                    r"FRITOS|CHEETOS|TOSTITOS|SUNCHIPS|ROLD GOLD|SMARTFOOD|POP-TARTS|NUTRI-GRAIN|SPECIAL K|"
                    r"FIBER ONE|CHEERIOS|WHEATIES|TOTAL|LIFE|CAP'N CRUNCH|FROOT LOOPS|RICE KRISPIES)\b", re.I)

UK_NAMES = [
    (r'^Game meat, deer', 'Venison (deer)'), (r'^Game meat, rabbit', 'Rabbit'), (r'^Game meat, ', 'Game: '),
    (r'^Beef, ground', 'Beef mince'), (r'^Pork, fresh, ground', 'Pork mince'), (r'^Pork, ground', 'Pork mince'),
    (r'^Lamb, ground', 'Lamb mince'), (r'^Turkey, ground', 'Turkey mince'), (r'^Chicken, ground', 'Chicken mince'),
    (r'^Chicken, broilers or fryers', 'Chicken'), (r'^Chicken, broiler', 'Chicken'), (r'^Lamb, domestic', 'Lamb'),
    (r'^Lamb, New Zealand, imported, frozen', 'Lamb (NZ)'), (r'^Lamb, Australian, imported, fresh', 'Lamb (Australian)'),
    (r'^Veal', 'Veal'), (r'^Pork, fresh', 'Pork'), (r'^Pork, cured', 'Pork, cured'),
    (r'^Crustaceans, shrimp', 'Prawns (shrimp)'), (r'^Crustaceans, ', 'Shellfish: '), (r'^Mollusks, ', 'Shellfish: '),
    (r'^Fish, ', 'Fish: '),
    (r'^Cereals ready-to-eat, ', 'Breakfast cereal: '), (r'^Cereals, ', 'Cereal: '),
    (r'^Cookies, ', 'Biscuits: '), (r'^Crackers, ', 'Crackers: '), (r'^Candies, ', 'Sweets: '),
    (r'^Snacks, potato chips', 'Crisps'), (r'^Snacks, ', 'Snacks: '), (r'^Potatoes, french fried', 'Chips (fries)'),
    (r'^Beverages, ', 'Drink: '), (r'^Alcoholic beverage, ', 'Alcohol: '), (r'^Spices, ', 'Spice: '),
    (r'^Nuts, ', 'Nuts: '), (r'^Seeds, ', 'Seeds: '), (r'^Oil, ', 'Oil: '), (r'^Sauce, ', 'Sauce: '),
    (r'^Soup, ', 'Soup: '), (r'^Babyfood', 'Baby food'),
]
WORDS = [
    (r'\bzucchini\b', 'courgette'), (r'\beggplant\b', 'aubergine'), (r'\barugula\b', 'rocket'), (r'\bcilantro\b', 'coriander'),
    (r'\bgarbanzo\b', 'chickpea'), (r'\bscallions\b', 'spring onions'), (r'\brutabagas?\b', 'swede'), (r'\bbeets\b', 'beetroot'),
    (r'\bsnap beans\b', 'green beans'), (r'\bcantaloupe\b', 'cantaloupe melon'), (r'\bcookies?\b', 'biscuits'),
    (r'\bcandies\b', 'sweets'), (r'\bcatsup\b', 'ketchup'), (r'\bjelly\b', 'jelly (jam)'), (r'\bsquash, summer\b', 'summer squash'),
    (r'\bground\b', 'mince'), (r'\bbroiled\b', 'grilled'), (r'\bbroiler\b', 'chicken'), (r'\bpopsicle\b', 'ice lolly'),
    (r'\bcornstarch\b', 'cornflour'), (r'\bconfectioners\b', 'icing'), (r'\bpowdered sugar\b', 'icing sugar'),
    (r'\bromaine\b', 'cos (romaine)'), (r'\bcanola\b', 'rapeseed (canola)'), (r'\bpeppers, sweet\b', 'peppers'),
    (r'\bcollards\b', 'collard greens'), (r'\bchard, swiss\b', 'Swiss chard'), (r'\bcrackers\b', 'crackers'),
]


def uk_name(s):
    name = s
    for pat, rep in UK_NAMES:
        if re.search(pat, name):
            name = re.sub(pat, rep, name, count=1)
            break
    for pat, rep in WORDS:
        name = re.sub(pat, rep, name, flags=re.I)
    name = name[0].upper() + name[1:]
    return name


def has(name, *words):
    return any(re.search(r'\b' + w, name) for w in words)


def category(grp, n):
    if has(n, 'liver', 'kidney', 'heart', 'tongue', 'brain', 'sweetbread', 'tripe', 'giblet', 'gizzard', 'spleen', 'lung', 'pancreas', 'thymus') and grp in {'0500', '1000', '1300', '1700', '0700'}:
        return 'offal'
    if grp == '0100':
        return 'eggs' if has(n, 'egg') and not has(n, 'eggnog') else 'dairy'
    if grp == '1500':
        return 'shellfish' if has(n, 'crustacean', 'mollusk', 'shrimp', 'crab', 'lobster', 'oyster', 'mussel', 'clam', 'scallop', 'squid', 'octopus', 'cuttlefish', 'whelk', 'snail', 'crayfish', 'abalone', 'roe', 'caviar') else 'fish'
    if grp in {'0500', '0700', '1000', '1300', '1700'}:
        return 'meat'
    if grp == '1100':
        return 'grains' if has(n, 'potato', 'yam', 'cassava', 'taro', 'plantain') and not has(n, 'sweet potato leaves') else 'veg'
    return {'0200': 'herbs', '0400': 'fats', '0600': 'treats', '0800': 'grains', '0900': 'fruit', '1200': 'nuts', '1400': 'drinks',
            '1600': 'legumes', '1800': 'grains', '1900': 'treats', '2000': 'grains', '2500': 'treats'}.get(grp, 'treats')


GLUTEN = ('wheat', 'barley', 'rye', 'spelt', 'semolina', 'couscous', 'bulgur', 'bread', 'pasta', 'macaroni', 'spaghetti', 'noodles',
          'cracker', 'cookie', 'biscuit', 'cake', 'pastry', 'pastries', 'pie', 'pizza', 'croissant', 'bagel', 'muffin', 'pancake',
          'waffle', 'beer', 'malt', 'seitan', 'breaded', 'batter', 'stuffing', 'crouton', 'doughnut', 'pretzel', 'brownie',
          'danish', 'strudel', 'eclair', 'dumpling', 'tortilla, flour', 'flour tortilla', 'wonton', 'graham', 'triticale', 'farina',
          'soy sauce', 'teriyaki', 'roll', 'bun', 'scone', 'crumpet', 'breadcrumb', 'gravy')
GF_SAFE = ('rice noodles', 'rice flour', 'corn flour', 'cornmeal', 'potato flour', 'soy flour', 'buckwheat', 'tapioca', 'gluten-free',
           'rice cake', 'arrowroot', 'chickpea flour', 'almond flour', 'coconut flour', 'sorghum', 'millet', 'amaranth', 'teff',
           'quinoa', 'meat pie', 'malted milk')


def tags_for(grp, n, d):
    t = set()
    low = n.lower()
    animal = grp in {'0100', '0500', '0700', '1000', '1300', '1500', '1700'}
    meatfish = grp in {'0500', '0700', '1000', '1300', '1500', '1700'}
    if meatfish and not has(low, 'egg'):
        t.add('haem')
        t.add('creat')
    if animal:
        t.add('retinol')
    if grp in {'1600', '1200'} or (grp in {'2000', '0800', '1800'} and has(low, 'whole', 'bran', 'oat', 'brown', 'wheat germ', 'rye', 'barley', 'buckwheat', 'quinoa', 'millet')):
        t.add('phy')
    if has(low, 'spinach', 'chard', 'beet greens', 'rhubarb', 'purslane'):
        t.add('oxa')
    if any(g in low for g in GLUTEN) and not any(s in low for s in GF_SAFE):
        t.add('gluten')
    if grp == '0800' and not has(low, 'oat', 'rice', 'corn') :
        t.add('gluten')
    if has(low, 'oat'):
        t.add('oats')
    # Processing and harms
    if grp == '0700' or has(low, 'bacon', 'ham\\b', 'salami', 'frankfurter', 'hot dog', 'bologna', 'pepperoni', 'chorizo', 'jerky', 'corned', 'pastrami', 'sausage', 'luncheon', 'liverwurst', 'bratwurst', 'kielbasa', 'prosciutto'):
        if not has(low, 'turkey breast, sliced, oven roasted'):
            t.add('procmeat')
    if has(low, 'fried', 'french fr', 'potato chips', 'tortilla chips', 'doughnut', 'fritter', 'tempura', 'chicharron', 'pork skins'):
        t.add('fried')
    if grp == '1400' and has(low, 'alcoholic', 'beer', 'wine', 'liqueur', 'distilled', 'spirits', 'vodka', 'rum', 'whiskey', 'gin\\b', 'brandy', 'sake', 'cider, hard') or has(low, 'alcoholic beverage'):
        t.add('alc')
    if has(low, 'coffee', 'espresso', 'cola', 'energy drink', 'tea, black', 'tea, green', 'tea, brewed', 'tea, instant', 'matcha') and not has(low, 'herb'):
        t.add('caff')
    sugar = num(d['Sugar']) or 0
    upf = (grp in {'1900', '2500'} and not has(low, 'popcorn, air-popped', 'nuts', 'seeds', 'trail mix'))
    upf |= grp == '0800' and not has(low, 'oat', 'muesli, plain', 'shredded wheat', 'wheat bran, unprocessed')
    upf |= grp == '1800' and has(low, 'commercially prepared', 'cookie', 'cake', 'cracker', 'pastry', 'pastries', 'doughnut', 'snack', 'toaster', 'frozen', 'refrigerated', 'mix,', 'sweet rolls', 'danish', 'brownie', 'pie,', 'croissant', 'muffin')
    upf |= grp == '1400' and has(low, 'carbonated', 'energy drink', 'sports drink', 'cola', 'fruit punch', 'fruit-flavored', 'drink mix', 'powder', 'nutritional', 'protein powder', 'soft drink', 'lemonade', 'tonic', 'ginger ale', 'root beer', 'cream soda')
    upf |= grp == '0700' and has(low, 'frankfurter', 'hot dog', 'bologna', 'luncheon', 'loaf', 'spread', 'pepperoni', 'salami', 'sausage', 'nugget', 'patties, breaded')
    upf |= has(low, 'nuggets', 'breaded', 'margarine-like', 'imitation', 'artificial', 'frozen dinner', 'microwave', 'instant', 'pudding, ', 'whipped topping', 'non-dairy', 'cheese food', 'cheese spread', 'process cheese', 'processed cheese', 'spread, ')
    if upf:
        t.add('upf')
    if (grp in {'1900', '0800', '1800', '2500'} or (grp == '1400' and not has(low, 'milk', 'juice', 'water'))) and sugar >= 8:
        t.add('addsug')
    if has(low, 'syrup', 'honey', 'sugars,', 'sugar,', 'jams', 'jelly', 'marmalade', 'preserves', 'frosting', 'icing') and sugar >= 30:
        t.add('addsug')
    if has(low, 'juice', 'nectar', 'smoothie') and grp in {'0900', '1400', '1100'}:
        t.add('juice')
    if has(low, 'canned', 'syrup') and has(low, 'heavy syrup', 'light syrup', 'extra heavy'):
        t.add('addsug')
    # Protective compounds
    beta = (num(d['BetaCar']) or 0) + (num(d['Lycopene']) or 0) + (num(d['AlphaCar']) or 0)
    if beta >= 1500:
        t.add('carot')
    if (num(d['LutZea']) or 0) >= 1000:
        t.add('lut')
    if grp in {'1100', '0200'} and has(low, 'broccoli', 'kale', 'cabbage', 'brussels', 'cauliflower', 'rocket', 'arugula', 'watercress', 'bok choy', 'pak-choi', 'collard', 'mustard', 'turnip', 'radish', 'horseradish', 'kohlrabi', 'swede', 'rutabaga', 'wasabi', 'garden cress', 'cress'):
        t.add('sulf')
    if has(low, 'blueberr', 'blackberr', 'elderberr', 'cranberries, raw', 'aronia', 'chokeberr', 'black currant', 'currants, european black', 'cocoa', 'cloves', 'baking chocolate', 'chocolate, dark'):
        t.add('poly2')
    elif grp == '0200' or has(low, 'berr', 'cherr', 'grape', 'plum', 'apple', 'pomegranate', 'olive', 'onions, red', 'tea, ', 'coffee', 'pecan', 'walnut', 'hazelnut', 'beans, black', 'kidney beans', 'artichoke', 'chocolate', 'currant', 'cabbage, red', 'red cabbage'):
        t.add('poly')
    if grp in {'1100'} and has(low, 'beet', 'rocket', 'arugula', 'spinach', 'lettuce', 'celery', 'chard', 'radish', 'watercress'):
        t.add('nitr')
    if has(low, 'onion', 'garlic', 'leek', 'asparagus', 'artichoke', 'chicory', 'jerusalem', 'oat', 'barley') or grp == '1600':
        t.add('preb')
    if has(low, 'yogurt', 'kefir', 'sauerkraut', 'kimchi', 'miso', 'tempeh', 'natto', 'buttermilk, cultured', 'kombucha') or (grp == '0100' and has(low, 'cheese, (cheddar|parmesan|gouda|swiss|feta|blue|roquefort|gruyere|edam|brie|camembert|romano|provolone|emmental)')):
        t.add('ferm')
    if has(low, 'cheese, (cheddar|parmesan|gouda|swiss|gruyere|blue|romano)', 'mushroom', 'natto', 'wheat germ', 'soybeans, mature'):
        t.add('sperm')
    if has(low, 'heart', 'liver', 'kidney', 'herring', 'mackerel', 'sardine', 'trout'):
        t.add('coq')
    if has(low, 'salmon', 'trout', 'shrimp', 'prawn', 'crab', 'lobster', 'krill', 'roe', 'caviar', 'crayfish', 'char'):
        t.add('astax')
    fat = num(d['Fat']) or 0
    mono = num(d['Mono']) or 0
    if not animal and fat >= 5 and mono / max(fat, 0.01) >= 0.55:
        t.add('mufa')
    if has(low, 'walnut', 'flaxseed', 'chia', 'hemp', 'canola', 'rapeseed'):
        t.add('ala')
    if has(low, 'swordfish', 'shark', 'king mackerel', 'tilefish', 'marlin', 'orange roughy'):
        t.add('merc2')
    elif has(low, 'tuna', 'halibut', 'pike', 'bass, striped', 'grouper', 'snapper'):
        t.add('merc')
    if has(low, 'brazilnut', 'brazil'):
        t.add('seHigh')
    if has(low, 'gelatin', 'broth', 'bone', 'skin only', 'pork skins'):
        t.add('coll')
    if has(low, 'rice, white', 'rice cake', 'cornflakes', 'corn flakes', 'puffed', 'white bread', 'bread, white', 'baguette'):
        t.add('highgi')
    return sorted(t)


def nova_for(grp, low, tags):
    if 'upf' in tags:
        return 4
    if grp == '0400' or has(low, 'sugars,', 'honey', 'syrup', 'salt, table', 'lard', 'butter', 'vinegar', 'starch'):
        return 2
    if has(low, 'canned', 'cheese', 'smoked', 'cured', 'pickled', 'bread', 'salted', 'jerky', 'dried', 'sauce', 'beer', 'wine', 'tofu') or grp in {'0700', '1800'}:
        return 3
    return 1


DEFAULT_PORTION = {'meat': (150, '150 g'), 'offal': (100, '100 g'), 'fish': (150, '1 fillet (150 g)'), 'shellfish': (120, '120 g'),
                   'eggs': (120, '2 eggs'), 'dairy': (150, '150 g'), 'grains': (75, '75 g'), 'legumes': (80, '80 g'),
                   'veg': (80, '80 g'), 'fruit': (100, '100 g'), 'nuts': (30, '30 g'), 'fats': (10, '1 tbsp'), 'herbs': (2, '1 tsp'),
                   'drinks': (250, '250 ml'), 'treats': (50, '50 g')}
US_UNITS = re.compile(r'cup|fl oz|lb|quart|pint|stick|package|container|bottle|can\b|serving|NLEA|bar \(', re.I)

keep = []
seen = set()
for ndb, d in des.items():
    grp, long_desc = d['grp'], d['long']
    if grp in DROP_GROUPS or d['manuf'] or BRANDS.search(long_desc):
        continue
    low = long_desc.lower()
    if re.search(r'\b(babyfood|infant|toddler|formula|usda commodity|school lunch|restaurant|fast food|archway|denny|navajo|hopi|alaska native|shoshone|apache|inupiat|yupik|ojibwe|cheyenne|stewed, dodo|whale|seal|walrus|caribou|moose|bear|beaver|muskrat|squirrel|opossum|raccoon|armadillo)\b', low):
        continue
    if grp in RAW_ONLY and not re.search(r'\braw\b|canned|smoked|dried|kippered|pickled|cured', low):
        continue
    if grp == '1100' and re.search(r'\b(cooked|boiled|baked|microwaved|stir-fried|roasted|steamed)\b', low) and not re.search(r'french fr|chips', low):
        continue
    if grp in {'1600', '2000'} and re.search(r'\b(cooked|boiled)\b', low) and not re.search(r'canned|pasta, cooked|rice, white, long-grain, regular, cooked', low):
        continue
    a = abbrev.get(ndb)
    if not a or num(a['Kcal']) is None:
        continue
    name = uk_name(long_desc)
    key = name.lower()
    if key in seen:
        continue
    seen.add(key)
    cat = category(grp, low)
    tags = tags_for(grp, low, a)
    g = lambda k: num(a[k])
    carb, fib = g('Carb'), g('Fibre')
    avail = None if carb is None else max(0.0, round(carb - (fib or 0), 2))
    poly = g('Poly')
    omega3 = round(poly * 0.6, 2) if (grp == '1500' and poly is not None) else None
    note = 'EPA+DHA estimated as about 60% of the polyunsaturated fat (USDA’s file doesn’t list it).' if omega3 is not None else None
    vals = [g('Kcal'), g('Protein'), avail, fib, g('Sugar'), g('Fat'), g('Sat'), omega3,
            g('VitARAE'), g('VitC'), g('VitDmcg'), g('VitE'), g('VitK'), g('B2'), g('FolTot'), g('B12'), g('Choline'),
            g('Fe'), g('Zn'), g('Cu'), g('Se'), g('Mg'), g('K'), g('Ca'), None, g('Na')]
    vals = [None if v is None else round(v, 3) for v in vals]
    pg, pl = DEFAULT_PORTION[cat]
    gm, gd = g('Gm1'), a['GmDesc1']
    if gm and gd and not US_UNITS.search(gd) and 2 <= gm <= 400:
        pg, pl = round(gm), gd
    keep.append([f'usda-{ndb}', name, long_desc if name != long_desc else '', cat, nova_for(grp, low, tags), pg, pl, vals, ' '.join(tags), note or ''])

keep.sort(key=lambda r: r[1].lower())
with open(out, 'w', encoding='utf-8') as f:
    json.dump({'source': 'USDA SR28 (2015), public domain', 'foods': keep}, f, ensure_ascii=False, separators=(',', ':'))
print(len(keep), 'foods written to', out)
