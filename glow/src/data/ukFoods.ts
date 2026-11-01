// UK staples the USDA database doesn't cover: British fish, cuts, bakery,
// cheeses, spreads, condiments, takeaway and drinks. Values are typical
// UK figures (McCance & Widdowson conventions and common supermarket
// labels), per 100 g as weighed (raw for fish and meat, as sold otherwise).
// They are estimates: brands and recipes vary. "?" means the value isn't
// reliably known and is shown as "not recorded", never as zero.
//
// Same row format as foods.ts, with an optional 10th field of search words:
// id ; name ; category ; NOVA ; portion g ; portion label ;
// kcal protein carbs fibre sugar fat satFat omega3 | vitA vitC vitD vitE vitK B2 folate B12 choline |
// iron zinc copper selenium magnesium potassium calcium iodine sodium ; tags ; note ; aliases

export const UK_RAW = `
# Fish and shellfish
uk-hake;Hake (wild, raw);fish;1;150;1 fillet (150 g);92 18.3 0 0 0 2.2 0.4 0.25 | 10 0 ? 0.5 ? 0.06 ? 1 ? | 0.3 0.4 ? 30 26 330 20 ? 100;haem creat;Lean, mild white fish landed in Cornwall and Spain. Around 18 g protein for under 100 kcal per 100 g: an excellent cutting protein. White fish isn’t oily fish, so pair it with salmon, mackerel or sardines across the week.;wild hake merluza cornish hake
uk-coley;Coley / saithe (raw);fish;1;150;1 fillet;82 18.3 0 0 0 1 0.1 0.3 | ? 0 ? ? ? ? ? 3 ? | 0.3 0.4 ? 35 25 330 15 ? 70;haem creat;A cheaper relative of cod with very similar nutrition.;saithe pollock coley
uk-pollock;Pollock (raw);fish;1;150;1 fillet;80 18 0 0 0 0.8 0.1 0.4 | 10 0 1 0.2 ? 0.07 ? 3 ? | 0.3 0.5 ? 36 60 360 50 ? 80;haem creat;The fish in many UK fish fingers.;alaska pollock
uk-plaice;Plaice (raw);fish;1;150;1 fillet;79 16.7 0 0 0 1.4 0.2 0.25 | ? 0 ? ? ? ? ? 1 ? | 0.3 0.5 ? 37 22 280 50 ? 120;haem creat;;flatfish
uk-lemon-sole;Lemon sole (raw);fish;1;150;1 fillet;83 17.4 0 0 0 1.5 0.2 0.25 | ? 0 ? ? ? ? ? 1 ? | 0.3 0.5 ? 35 20 290 30 ? 100;haem creat;;sole flatfish
uk-dover-sole;Dover sole (raw);fish;1;150;1 fillet;89 18.1 0 0 0 1.8 0.3 0.3 | ? 0 ? ? ? ? ? 1 ? | 0.4 0.5 ? 35 25 300 30 ? 100;haem creat;;sole
uk-bream;Sea bream (raw);fish;1;150;1 fillet;96 17.5 0 0 0 2.9 0.6 0.5 | ? 0 ? ? ? ? ? 2 ? | 0.4 0.5 ? 35 30 330 30 ? 80;haem creat;;gilt-head bream dorade
uk-gurnard;Gurnard (raw);fish;1;150;1 fillet;85 18 0 0 0 1.3 0.3 0.3 | ? 0 ? ? ? ? ? ? ? | 0.4 0.5 ? ? 25 300 30 ? 80;haem creat;A sustainable, cheap UK white fish. Values approximate.;red gurnard
uk-megrim;Megrim / Cornish sole (raw);fish;1;150;1 fillet;80 17 0 0 0 1.2 0.2 0.25 | ? 0 ? ? ? ? ? ? ? | 0.3 0.4 ? ? 22 290 30 ? 100;haem creat;Values approximate.;cornish sole megrim
uk-smoked-mackerel;Smoked mackerel;fish;3;100;1 fillet;354 18.9 0 0 0 30.9 6.3 4.5 | 40 0 8 1.5 ? 0.3 ? 9 ? | 1.2 0.8 ? 40 30 300 20 ? 1000;haem creat coq;One of the richest omega-3 foods in the supermarket. It’s salty, so watch it if you’re puffy-prone.;peppered mackerel
uk-kippers;Kippers (smoked herring);fish;3;130;1 kipper fillet;255 20.1 0 0 0 19.4 3.2 2.8 | 40 0 15 1 ? 0.3 ? 12 ? | 1.2 1 ? 40 35 360 65 ? 900;haem creat coq;A traditional British breakfast that’s high in omega-3 and vitamin D.;kipper herring smoked
uk-smoked-salmon;Smoked salmon;fish;3;60;3 slices;142 22.8 0 0 0 5.6 1 1.2 | 20 0 9 1 ? 0.15 ? 3 ? | 0.5 0.4 ? 30 30 400 10 ? 1500;astax creat;Lots of salt: about 1.5 g sodium per 100 g.;lox scottish smoked salmon
uk-fish-fingers;Fish fingers (cod, breaded);fish;4;84;3 fingers;233 13 21 1 1.5 10 1 0.2 | ? ? ? ? ? ? ? ? ? | 0.6 0.3 ? 15 20 250 30 ? 400;upf gluten fried;Breaded, so not safe for coeliacs unless the pack says gluten-free.;fish fingers birds eye
uk-battered-cod;Battered cod (chippy);fish;3;200;regular portion;247 15.4 15 0.6 0.3 15 1.4 0.3 | ? ? ? ? ? ? ? ? ? | 0.5 0.4 ? 20 25 300 40 ? 300;gluten fried;Batter is made with wheat flour, and chip-shop fryers are shared. Ask for a gluten-free fryer night.;fish and chips battered fish chippy
uk-langoustine;Langoustine / scampi (raw);shellfish;1;120;120 g;90 18 1 0 0 1.4 0.3 0.3 | ? ? ? ? ? ? ? ? ? | 0.6 1.5 ? 40 40 300 70 ? 250;astax;;scampi dublin bay prawns
uk-brown-crab;Brown crab meat (white & brown);shellfish;1;100;1 dressed crab;128 18 0 0 0 5.5 0.8 0.9 | ? ? ? ? ? ? ? 9 ? | 1.3 5.5 1 35 45 270 100 ? 400;astax;The brown meat is the richer, fattier part, with more omega-3.;crab meat cromer crab dressed crab
uk-cockles;Cockles (boiled);shellfish;1;80;small tub;53 12 0 0 0 0.6 0.2 0.2 | ? ? ? ? ? ? ? 40 ? | ? 2 ? ? ? ? ? ? 3500;;Often very salty. Values approximate.;cockles
uk-mackerel-tomato;Mackerel in tomato sauce (tinned);fish;3;125;1 tin;206 14.3 1.4 0 1.4 15.5 3 2 | ? ? 5 ? ? ? ? 6 ? | 1 0.5 ? 30 25 280 20 ? 400;creat coq;;tinned mackerel john west
uk-sardines-tomato;Sardines in tomato sauce (tinned);fish;3;120;1 tin;162 17 1.4 0 1.4 9.9 2.6 1.4 | ? ? 4 ? ? ? ? 8 ? | 2.5 2 ? 45 35 350 350 ? 400;creat coq;Mash in the bones for the calcium.;tinned sardines
uk-tuna-oil;Tuna in olive oil (drained);fish;3;110;1 tin drained;189 27 0 0 0 9 1.5 0.3 | ? 0 2 ? ? ? ? 2.5 ? | 1.2 0.8 ? 70 30 250 10 ? 300;merc;;tinned tuna in oil
# Meat, game and offal
uk-steak-mince;Beef steak mince, 10% fat;meat;1;150;150 g;175 20.5 0 0 0 10 4.3 0.03 | 0 0 0.1 0.3 1 0.17 7 2.2 65 | 2.2 5 0.07 17 20 320 8 2 65;haem creat;;steak mince 10% mince
uk-beef-shin;Beef shin (raw);meat;1;150;150 g;125 21.5 0 0 0 4.3 1.8 0.03 | ? 0 ? ? ? ? ? 2.5 ? | 2.3 6 ? 20 22 340 8 ? 60;haem creat coll;Slow-cooked shin turns its connective tissue into gelatine, the same glycine-rich protein as bone broth.;shin of beef stewing steak
uk-brisket;Beef brisket (raw);meat;1;150;150 g;220 19 0 0 0 16 6.5 0.03 | ? 0 ? ? ? ? ? 2 ? | 1.9 4.5 ? 18 18 300 8 ? 70;haem creat;;brisket
uk-ox-cheek;Ox cheek (raw);meat;1;150;150 g;150 20 0 0 0 7.5 3 0.03 | ? 0 ? ? ? ? ? 3 ? | 2.4 5 ? ? 20 300 10 ? 70;haem creat coll;Values approximate.;beef cheek
uk-oxtail;Oxtail (raw, with bone);meat;1;250;2 pieces;237 18 0 0 0 18 7 0.03 | ? 0 ? ? ? ? ? 2 ? | 2 5 ? ? 15 250 10 ? 70;haem creat coll;;oxtail
uk-mutton;Mutton (raw);meat;1;150;150 g;194 20 0 0 0 12 5.5 0.05 | ? 0 ? ? ? ? ? 2.5 ? | 2 4 ? 20 22 300 10 ? 70;haem creat;;hogget mutton
uk-pigeon;Wood pigeon breast (raw);meat;1;100;2 breasts;142 23 0 0 0 5.5 1.5 0 | ? 0 ? ? ? ? ? ? ? | 4.5 2.5 ? ? 25 300 10 ? 60;haem creat coq;Wild game, very rich in iron. Values approximate.;pigeon squab
uk-partridge;Partridge (raw);meat;1;150;1 bird portion;140 25 0 0 0 4.5 1.3 0 | ? 0 ? ? ? ? ? ? ? | 3 2 ? ? 25 300 15 ? 60;haem creat;Values approximate.;partridge game bird
uk-lamb-kidney;Lamb’s kidney (raw);offal;1;100;2 kidneys;97 17 0 0 0 3 1 0.05 | 100 10 ? ? ? 2.2 30 52 ? | 6 2.4 0.4 130 17 280 10 ? 180;haem coq;Rich in B12 and selenium, without liver’s vitamin A load.;lambs kidneys
uk-chicken-hearts;Chicken hearts (raw);offal;1;100;100 g;153 15.6 0.7 0 0 9.3 2.7 0.05 | 9 3 ? 0.7 ? 0.73 72 7.3 ? | 6 6.6 0.35 16 15 176 12 ? 74;haem coq creat;Cheap, rich in iron, zinc, B12 and CoQ10.;chicken heart
uk-black-pudding;Black pudding;meat;3;60;2 slices;297 10.3 16 0.5 1 21 8 0 | ? 0 ? ? ? ? ? 1 ? | 20 1.5 ? ? 15 150 30 ? 1100;procmeat gluten oats;Very high in iron from blood, but processed and salty. Most contain oatmeal or barley, so it’s only safe with a gluten-free label.;blood sausage stornoway
uk-haggis;Haggis;meat;3;100;100 g;310 10.7 19.2 1 0.5 21.7 8 0 | ? 0 ? ? ? ? ? ? ? | 4.8 1.9 ? ? 20 170 30 ? 700;oats gluten;Lamb offal with oatmeal. Usually not gluten-free (oats are cross-contaminated), though gluten-free versions exist.;haggis
uk-back-bacon;Back bacon (UK, raw);meat;3;50;2 rashers;215 16.5 0 0 0 16.5 6 0 | ? 0 0.5 ? ? 0.15 ? 1 ? | 0.6 1.6 ? 18 18 280 6 ? 1100;procmeat;Cured with nitrites, so it’s processed meat (WHO Group 1 carcinogen). Keep it occasional.;bacon rashers smoked bacon streaky
uk-gammon;Gammon steak (raw);meat;3;150;1 steak;132 19 0 0 0 6.2 2.1 0 | ? 0 ? ? ? ? ? 0.6 ? | 0.8 1.8 ? 20 20 300 7 ? 1300;procmeat;;ham steak gammon
uk-scotch-egg;Scotch egg;meat;4;113;1 egg;241 12 13 1 1 16 4 0 | ? ? ? ? ? ? ? ? ? | 1.5 1.2 ? ? 15 150 40 ? 600;procmeat gluten upf fried;;scotch egg
uk-pork-pie;Pork pie;meat;4;140;1 pie;380 10 24 1 1 27 10 0 | ? ? ? ? ? ? ? ? ? | 1.2 1.2 ? ? 15 150 40 ? 700;procmeat gluten upf;;pork pie melton mowbray
uk-sausage-roll;Sausage roll;treats;4;100;1 large roll;380 9 26 1 1.5 26 12 0 | ? ? ? ? ? ? ? ? ? | 1 0.8 ? ? 15 120 30 ? 700;procmeat gluten upf;;sausage roll greggs
uk-pasty;Cornish pasty;treats;4;220;1 pasty;267 7 25 1.5 1 15 7 0 | ? ? ? ? ? ? ? ? ? | 1.2 1 ? ? 15 200 30 ? 400;gluten upf;;pasty cornish
uk-turkey-mince;Turkey breast mince, 2% fat;meat;1;150;150 g;105 23 0 0 0 1.5 0.5 0.02 | 0 0 0.1 0.1 0 0.12 6 0.5 65 | 0.7 1.4 0.05 25 28 300 8 3 60;creat;;turkey mince
uk-quorn-mince;Quorn mince;legumes;4;100;100 g;105 14.5 3 5.5 0.6 2 0.5 0 | ? ? ? ? ? ? ? ? ? | 0.5 6 ? ? ? ? 40 ? 100;upf;Mycoprotein (a fungus): high protein and fibre, but technically ultra-processed and made with egg. Some Quorn products contain gluten, so check the pack.;quorn mycoprotein meat free
uk-quorn-pieces;Quorn pieces;legumes;4;100;100 g;95 14 3.5 5 0.5 2.5 0.6 0 | ? ? ? ? ? ? ? ? ? | 0.5 6 ? ? ? ? 40 ? 150;upf;Check the pack for gluten.;quorn chicken pieces
# Dairy
uk-stilton;Stilton;dairy;3;30;30 g;410 23.7 0.1 0 0.1 35 22 0 | 380 0 0.3 0.6 ? 0.4 ? 1 ? | 0.3 3.5 ? 10 20 130 330 30 1000;ferm sperm retinol;;blue cheese stilton
uk-red-leicester;Red Leicester / Double Gloucester;dairy;3;30;30 g;400 24 0.1 0 0.1 33.7 21 0 | 360 0 0.3 0.6 ? 0.4 ? 1.1 ? | 0.3 3.8 ? 12 25 90 700 30 650;ferm sperm retinol;;red leicester double gloucester
uk-wensleydale;Wensleydale / Lancashire / Caerphilly;dairy;3;30;30 g;380 23 0.1 0 0.1 32 20 0 | 330 0 0.3 0.6 ? 0.4 ? 1 ? | 0.3 3 ? 11 20 90 560 30 600;ferm retinol;;wensleydale lancashire caerphilly crumbly
uk-halloumi;Halloumi;dairy;3;60;3 slices;316 21.5 1.6 0 1.6 25 17 0 | 230 0 ? ? ? ? ? 1 ? | 0.3 2.5 ? ? 25 90 700 ? 1100;retinol;Very salty: about 1.1 g sodium per 100 g.;halloumi
uk-goats-cheese;Goat’s cheese, soft;dairy;3;30;30 g;320 21 0.6 0 0.6 26 18 0 | 300 0 0.4 0.4 ? 0.6 ? 0.2 ? | 0.4 0.8 ? 3 16 150 140 ? 500;ferm retinol;;goats cheese chevre
uk-burrata;Burrata;dairy;3;60;half a burrata;330 15 1 0 1 29 19 0 | ? 0 ? ? ? ? ? ? ? | 0.2 2 ? ? ? ? 300 ? 300;retinol;;burrata
uk-clotted-cream;Clotted cream;dairy;2;30;1 heaped tbsp;586 1.6 2.3 0 2.3 63.5 40 0 | 650 0 0.3 1.5 ? 0.1 ? 0.2 ? | 0.1 0.2 ? ? 5 70 50 ? 20;retinol;;cornish clotted cream
uk-creme-fraiche;Crème fraîche;dairy;3;30;2 tbsp;293 2.4 2.6 0 2.6 30 20 0 | 350 0 0.2 0.7 ? 0.15 ? 0.3 ? | 0.1 0.3 ? ? 9 100 80 ? 40;ferm retinol;;creme fraiche sour cream
uk-quark;Quark;dairy;1;150;150 g;66 12 4 0 4 0.2 0.1 0 | ? 0 ? ? ? ? ? 0.5 ? | 0.1 0.6 ? ? 10 150 100 ? 40;ferm;Almost pure protein for its calories, like skyr.;quark
uk-single-cream;Single cream;dairy;2;30;2 tbsp;193 3.3 4.2 0 4.2 19 12 0 | 180 0 ? ? ? 0.17 ? 0.3 ? | 0.1 0.3 ? ? 10 120 90 ? 40;retinol;;single cream
uk-milk-unhomog-whole;Whole milk, unhomogenised (cream on top);dairy;1;250;1 glass;66 3.3 4.7 0 4.7 3.8 2.4 0.01 | 50 1 0.1 0.09 0.3 0.18 5 0.45 14 | 0.03 0.4 0.01 3.7 10 150 120 35 43;retinol;Nutritionally the same as ordinary whole milk: the cream simply rises instead of being broken up. Claims that homogenisation harms health aren’t supported by evidence. Pasture-fed herds (as the premium London dairies use) give slightly more omega-3 and beta-carotene, which is where the yellow cream line comes from. Shake before pouring, or your first glass gets all the cream and vitamin A.;estate dairy unhomogenised unhomogenized cream top whole milk organic grass fed milk
uk-milk-unhomog-semi;Semi-skimmed milk, unhomogenised;dairy;1;250;1 glass;47 3.4 4.8 0 4.8 1.8 1.1 0 | 25 1 0.05 0.04 0.1 0.18 5 0.45 14 | 0.03 0.4 0.01 3.7 11 156 124 35 44;retinol;Same protein, calcium, iodine and B12 as whole, with about half the fat and fat-soluble vitamins. Either fits your diet: semi saves about 45 kcal a glass on a cut.;estate dairy unhomogenised unhomogenized semi skimmed semi-skimmed milk
uk-milk-gold-top;Gold top milk (Jersey/Guernsey);dairy;1;250;1 glass;78 3.7 4.7 0 4.7 5.1 3.3 0.01 | 65 1 0.1 0.12 0.4 0.19 5 0.5 15 | 0.03 0.45 0.01 4 12 150 130 35 45;retinol;Channel Island breeds give richer milk with more beta-carotene (hence the golden colour) and slightly more protein and calcium.;gold top jersey guernsey channel island milk
uk-milk-a2;A2 milk, semi-skimmed;dairy;1;250;1 glass;47 3.4 4.8 0 4.8 1.8 1.1 0 | 25 1 0.05 0.04 0.1 0.18 5 0.45 14 | 0.03 0.4 0.01 3.7 11 156 124 35 44;retinol;From cows that only make the A2 type of beta-casein. Some people report less gut discomfort, but trials are small and partly industry-funded.;a2 milk
uk-oat-milk;Oat milk, fortified (per 100 ml);drinks;4;250;1 glass;46 0.4 6.6 0.8 3.4 1.5 0.2 0 | ? 0 1.1 ? ? 0.2 ? 0.38 ? | 0.1 ? ? ? ? 100 120 22 40;oats;Only certified gluten-free oat milks are safe for coeliacs (Oatly UK isn’t certified GF). Much less protein than dairy milk.;oatly oat drink
uk-almond-milk;Almond milk, unsweetened, fortified (per 100 ml);drinks;4;250;1 glass;13 0.4 0.1 0.4 0.1 1.1 0.1 0 | ? 0 0.75 1.5 ? 0.2 ? 0.38 ? | ? ? ? ? ? 30 120 ? 40;;Almost no protein. Fine in coffee, not a milk replacement for nutrients unless fortified.;almond drink alpro
uk-soya-milk;Soya milk, unsweetened, fortified (per 100 ml);drinks;3;250;1 glass;39 3.3 0.6 0.5 0.2 2.1 0.3 0 | ? 0 0.75 ? ? 0.2 ? 0.38 ? | 0.4 ? ? ? 15 120 120 22 30;;The plant milk closest to dairy for protein.;soy milk alpro soya
# Bakery, cereals and grains
uk-crumpet;Crumpet;grains;4;55;1 crumpet;194 6 39 2 2 0.7 0.2 0 | ? ? ? ? ? ? ? ? ? | 1 0.4 ? ? 15 100 80 ? 700;gluten upf;;crumpets warburtons
uk-yorkshire;Yorkshire pudding;grains;3;35;1 medium;208 6.6 25 1 2 9.9 2 0 | ? ? ? ? ? ? ? ? ? | 1 0.5 ? ? 15 150 80 ? 300;gluten;Gluten-free versions are easy to make with a GF flour blend.;yorkshire puddings
uk-scone;Scone, plain;treats;3;60;1 scone;362 7 52 2 12 14 6 0 | ? ? ? ? ? ? ? ? ? | 1.5 0.5 ? ? 15 150 150 ? 600;gluten addsug;;scone cream tea
uk-hot-cross-bun;Hot cross bun;treats;4;70;1 bun;274 7.4 50 2.4 16 5 1.7 0 | ? ? ? ? ? ? ? ? ? | 1.6 0.6 ? ? 20 180 100 ? 250;gluten addsug upf;;hot cross buns
uk-teacake;Teacake;treats;4;60;1 teacake;290 8 52 2.5 18 5 1.3 0 | ? ? ? ? ? ? ? ? ? | 1.5 0.6 ? ? 20 180 100 ? 300;gluten addsug upf;;teacakes
uk-naan;Naan bread;grains;3;130;1 naan;290 8.7 50 2 3 6.5 1.5 0 | ? ? ? ? ? ? ? ? ? | 1.6 0.7 ? ? 20 150 100 ? 450;gluten;;naan nan
uk-chapati;Chapati / roti;grains;3;45;1 chapati;300 8 50 4 1 7 1.5 0 | ? ? ? ? ? ? ? ? ? | 2.5 1 ? ? 30 150 60 ? 300;gluten phy;;chapati roti
uk-pitta;Pitta bread, white;grains;3;60;1 pitta;255 9 51 2.4 2 1.2 0.2 0 | ? ? ? ? ? ? ? ? ? | 1.6 0.7 ? ? 20 110 90 ? 450;gluten;;pitta pita
uk-bagel;Bagel, plain;grains;4;85;1 bagel;270 10 52 2.5 5 1.5 0.3 0 | ? ? ? ? ? ? ? ? ? | 2 0.8 ? ? 20 100 60 ? 450;gluten upf;;bagels
uk-english-muffin;English muffin;grains;4;65;1 muffin;230 9 43 2.5 3 2 0.4 0 | ? ? ? ? ? ? ? ? ? | 2 0.7 ? ? 20 120 100 ? 400;gluten upf;;english muffins
uk-brioche;Brioche;treats;4;35;1 bun;360 8 50 2 13 13 7 0 | ? ? ? ? ? ? ? ? ? | 1 0.5 ? ? 15 120 60 ? 400;gluten addsug upf;;brioche buns
uk-wholemeal;Wholemeal bread;grains;3;80;2 slices;217 9.4 37 7 3 2.5 0.5 0 | 0 0 0 0.3 ? 0.06 40 0 ? | 2.4 1.8 0.3 30 75 250 100 ? 400;gluten phy;;brown bread hovis
uk-gf-wrap;Gluten-free wrap;grains;4;60;1 wrap;300 3 50 5 2 8 1 0 | ? ? ? ? ? ? ? ? ? | 0.8 ? ? ? ? ? 50 ? 500;upf;;gf wrap gluten free tortilla
uk-oatcakes-gf;Oatcakes, gluten-free;grains;3;30;3 oatcakes;450 10 55 9 1.5 19 3 0 | ? ? ? ? ? ? ? ? ? | 3.5 2.2 ? ? 100 300 50 ? 500;oats phy;Made with certified gluten-free oats. A good GF cracker.;nairns gluten free oatcakes
uk-oatcakes;Oatcakes (standard);grains;3;30;3 oatcakes;440 10 57 8 1.5 18 6 0 | ? ? ? ? ? ? ? ? ? | 3.5 2.2 ? ? 100 300 50 ? 600;oats phy;Ordinary oats are cross-contaminated with wheat. Choose the certified gluten-free versions.;oatcakes nairns
uk-flapjack;Flapjack;treats;4;60;1 bar;460 5 60 3 30 22 10 0 | ? ? ? ? ? ? ? ? ? | 1.8 1 ? ? 50 180 30 ? 200;oats addsug upf;;flapjack
uk-jaffa;Jaffa cakes;treats;4;24;2 cakes;375 4.5 69 2 51 8 4.6 0 | ? ? ? ? ? ? ? ? ? | 1.5 ? ? ? ? ? 40 ? 150;gluten addsug upf;;jaffa cakes mcvities
uk-victoria-sponge;Victoria sponge;treats;4;70;1 slice;390 4.5 52 1 35 18 6 0 | ? ? ? ? ? ? ? ? ? | 1 0.4 ? ? 10 100 60 ? 300;gluten addsug upf;;cake sponge
uk-shortbread;Shortbread;treats;4;30;2 fingers;520 5.5 64 2 21 27 17 0 | ? ? ? ? ? ? ? ? ? | 1.2 0.5 ? ? 12 100 80 ? 300;gluten addsug upf;;shortbread walkers
uk-mince-pie;Mince pie;treats;4;60;1 pie;410 4 59 2 30 18 8 0 | ? ? ? ? ? ? ? ? ? | 1.2 0.4 ? ? 15 150 50 ? 150;gluten addsug upf;;mince pies
uk-rich-tea;Rich Tea biscuits;treats;4;16;2 biscuits;450 7 72 2.5 22 14.5 7 0 | ? ? ? ? ? ? ? ? ? | 2 0.5 ? ? 15 120 100 ? 400;gluten addsug upf;;rich tea
uk-custard-creams;Custard creams / bourbons;treats;4;25;2 biscuits;490 5.5 68 1.6 32 22 11 0 | ? ? ? ? ? ? ? ? ? | 1.5 ? ? ? ? ? 60 ? 300;gluten addsug upf;;custard creams bourbon
uk-hobnobs;Hobnobs;treats;4;30;2 biscuits;480 7 62 4 25 22 10 0 | ? ? ? ? ? ? ? ? ? | 2 0.9 ? ? 50 200 40 ? 400;oats gluten addsug upf;;hobnob
uk-weetabix;Weetabix;grains;3;38;2 biscuits;362 12 69 10 4.4 2 0.6 0 | ? ? ? ? ? 1.4 200 ? ? | 12 2.5 ? ? 110 350 35 ? 280;gluten phy;Fortified with iron, B vitamins and folic acid. Made from wheat, so not for coeliacs.;weetabix
uk-shredded-wheat;Shredded Wheat;grains;3;45;2 biscuits;354 12 68 12 0.7 2.2 0.4 0 | ? ? ? ? ? ? ? ? ? | 3 2.5 ? ? 120 350 35 ? 5;gluten phy;;shredded wheat
uk-cornflakes;Cornflakes (UK);grains;4;30;30 g bowl;378 7 84 3 8 0.9 0.2 0 | ? ? 4.2 ? ? 1.2 166 2.1 ? | 8 ? ? ? 15 100 5 ? 450;gluten upf highgi;Contains barley malt flavouring, so it’s not gluten-free unless labelled.;corn flakes kelloggs
uk-rice-krispies;Rice Krispies (UK);grains;4;30;30 g bowl;387 6 87 1 10 1 0.2 0 | ? ? 4.2 ? ? 1.2 166 2.1 ? | 8 ? ? ? 25 120 10 ? 400;gluten upf highgi addsug;Contains barley malt, so it’s not gluten-free.;rice krispies
uk-muesli;Muesli, no added sugar;grains;3;50;50 g;365 10 58 8 18 8 1.4 0 | ? ? ? ? ? ? ? ? ? | 2.5 2 ? ? 90 400 50 ? 20;gluten oats phy;Most muesli contains wheat flakes. Gluten-free mueslis exist.;muesli dorset alpen
uk-porridge;Porridge made with semi-skimmed milk;grains;1;250;1 bowl;87 4 12 1 4 2.7 1 0 | 20 0 ? ? ? 0.15 ? 0.3 ? | 0.5 0.6 ? ? 25 170 110 15 50;oats;Use certified gluten-free oats.;porridge oatmeal
uk-wild-rice;Wild rice (dry);grains;1;60;60 g dry;357 14.7 68 6.2 2.5 1.1 0.2 0 | 1 0 0 0.8 1.9 0.26 95 0 ? | 2 6 0.5 2.8 177 427 21 ? 7;phy lowgi;Naturally gluten-free, with more protein and zinc than ordinary rice.;wild rice
uk-rice-noodles;Rice noodles (dry);grains;1;60;1 nest;364 6 81 1.6 0 0.6 0.2 0 | 0 0 0 ? ? 0.02 3 0 ? | 0.7 0.7 ? 15 12 30 18 ? 180;;Naturally gluten-free.;rice noodles vermicelli
uk-roast-potatoes;Roast potatoes (in oil, as cooked);grains;3;180;5 roasties;149 2.9 25.9 2.2 0.6 4.5 0.6 0 | 0 8 0 1 ? 0.03 18 0 ? | 0.7 0.4 0.1 0.4 25 450 8 ? 10;;Roasted in olive oil is the better choice. Rapeseed oil is fine too.;roasties sunday roast
uk-oven-chips;Oven chips (frozen);grains;4;150;1 portion;162 3.2 25 2.2 0.4 5 0.6 0 | 0 8 0 ? ? 0.03 ? 0 ? | 0.7 0.4 ? ? 25 450 10 ? 50;upf;;oven chips mccain
uk-mash;Mashed potato with butter and milk;grains;3;180;1 serving;104 1.8 16 1.3 1 4.3 2.6 0 | 40 6 0 ? ? 0.04 10 0.1 ? | 0.3 0.3 ? ? 17 300 20 ? 40;;;mash mashed potatoes
uk-jersey-royals;New potatoes / Jersey Royals;grains;1;200;7 small potatoes;75 1.7 16 1.2 1 0.3 0 0 | 0 16 0 ? ? 0.03 18 0 ? | 0.5 0.3 0.1 0.3 20 370 6 ? 10;preb;Eat them cold in a salad for more resistant starch.;new potatoes jersey royals baby potatoes
# Vegetables and fruit
uk-psb;Purple sprouting broccoli;veg;1;80;80 g;34 3.9 2.6 3.5 1.5 0.6 0.1 0 | 50 79 0 1.3 ? 0.1 ? 0 ? | 1.9 0.4 ? ? 20 330 50 ? 12;sulf poly;;tenderstem purple sprouting broccoli
uk-spring-greens;Spring greens;veg;1;80;80 g;33 3 3 3.4 2.2 1 0.1 0 | 400 180 0 ? 400 0.2 ? 0 ? | 1.4 0.5 ? ? 20 240 210 ? 20;sulf lut carot;Low in oxalate, so the calcium absorbs well.;spring greens
uk-cavolo-nero;Cavolo nero (black kale);veg;1;80;80 g;49 4.3 5 2 2.3 0.9 0.1 0 | 241 93 0 1.5 390 0.13 141 0 0.4 | 1.5 0.4 0.29 0.9 47 491 150 2 38;sulf lut carot;;black kale tuscan kale cavolo nero
uk-samphire;Samphire;veg;1;50;1 handful;20 1.3 2.8 1.1 ? 0.2 0 0 | ? ? 0 ? ? ? ? 0 ? | ? ? ? ? ? ? ? ? 1200;;Naturally salty. Values approximate.;marsh samphire sea asparagus
uk-runner-beans;Runner beans;veg;1;80;80 g;22 1.6 3.2 2 2.8 0.4 0.1 0 | 30 18 0 ? ? 0.07 ? 0 ? | 1.2 0.2 ? ? 20 220 30 ? 1;;;runner beans
uk-bramley;Bramley apple (cooking apple);fruit;1;150;1 apple;35 0.3 8.9 1.6 8.9 0.1 0 0 | 2 14 0 ? ? ? ? 0 ? | 0.1 ? ? ? 3 90 4 ? 2;poly preb;;cooking apple bramley
uk-damsons;Damsons / plums;fruit;1;80;4 plums;38 0.5 9.6 1.8 9.6 0 0 0 | 17 4 0 0.3 6 0.03 5 0 ? | 0.2 0.1 ? ? 7 170 6 ? 2;poly;;damson victoria plums greengages
uk-blackcurrants;Blackcurrants;fruit;1;80;1 handful;63 1.4 15.4 ? ? 0.4 0 0 | 12 181 0 1 ? 0.05 ? 0 ? | 1.5 0.3 0.1 ? 24 322 55 ? 2;poly2;One of the richest vitamin C foods in the UK: a handful covers your day twice over.;blackcurrant
# Spreads, sauces and condiments
uk-marmite;Marmite;herbs;3;4;1 tsp (4 g);260 39.7 23 3.5 1.4 0.1 0 0 | 0 0 0 0 0 8.6 2500 15 ? | 3.6 2 ? ? 150 2600 50 ? 4300;gluten;Yeast extract, fortified with B12, folic acid and B vitamins. UK labels list barley, wheat, oats and rye as allergens, so treat it as not gluten-free.;marmite yeast extract vegemite
uk-baked-beans;Baked beans in tomato sauce;legumes;3;200;half a tin;78 4.7 10.2 3.8 4.6 0.2 0 0 | 10 0 0 0.5 ? 0.05 30 0 ? | 1.4 0.6 0.2 2 30 300 40 ? 240;preb phy;Most UK baked beans (including Heinz) are gluten-free, but always check. Reduced-sugar versions are worth it.;beans on toast heinz beanz
uk-mushy-peas;Mushy peas;legumes;3;100;100 g;85 6 11 4.5 2 0.6 0.1 0 | ? ? 0 ? ? ? ? 0 ? | 1.5 0.8 ? ? 25 200 20 ? 300;preb;;mushy peas
uk-ketchup;Tomato ketchup;herbs;4;15;1 tbsp;112 1.2 24 0.8 23 0.1 0 0 | 30 2 0 ? ? ? ? 0 ? | 0.4 0.2 ? ? 15 300 15 ? 700;addsug upf carot;About 3.5 g sugar per tablespoon.;ketchup heinz
uk-brown-sauce;Brown sauce;herbs;4;15;1 tbsp;103 0.9 23 1 20 0.1 0 0 | ? ? 0 ? ? ? ? 0 ? | 1 ? ? ? ? ? 20 ? 900;addsug upf gluten;Some brown sauces contain wheat or rye flour, so check the label.;hp sauce brown sauce daddies
uk-mayonnaise;Mayonnaise;fats;4;15;1 tbsp;690 1 1 0 1 75 6 0 | 50 0 0.5 8 ? ? ? 0.2 ? | 0.2 0.1 ? ? 1 20 8 ? 600;upf;;mayo hellmanns
uk-salad-cream;Salad cream;fats;4;15;1 tbsp;330 1.5 17 0.3 15 27 2 0 | ? ? ? ? ? ? ? ? ? | 0.4 ? ? ? ? ? 20 ? 1000;addsug upf;;salad cream
uk-mint-sauce;Mint sauce;herbs;3;10;2 tsp;100 1 23 1 22 0 0 0 | ? ? 0 ? ? ? ? 0 ? | 1 ? ? ? ? ? 30 ? 400;addsug;;mint sauce
uk-horseradish;Horseradish sauce;herbs;3;15;1 tbsp;175 2 18 2 12 10 1 0 | ? ? 0 ? ? ? ? 0 ? | 0.5 ? ? ? ? ? 30 ? 800;sulf;;horseradish
uk-gravy;Gravy granules (dry);herbs;4;5;1 tsp (makes 70 ml);450 3 60 1 5 22 10 0 | ? ? 0 ? ? ? ? 0 ? | 1 ? ? ? ? ? 30 ? 7000;gluten upf;Standard gravy granules contain wheat. Gluten-free versions exist.;bisto gravy
uk-stock-cube;Stock cube;herbs;4;10;1 cube;250 10 25 1 5 12 6 0 | ? ? 0 ? ? ? ? 0 ? | ? ? ? ? ? ? ? ? 20000;gluten upf;Many contain wheat, though some are gluten-free (check the label). About 2 g sodium each.;oxo knorr stock cube bouillon
uk-lemon-curd;Lemon curd;treats;3;15;1 tbsp;310 1 63 0 52 6 3 0 | ? ? ? ? ? ? ? ? ? | 0.3 ? ? ? ? ? 10 ? 100;addsug;;lemon curd
uk-jam;Strawberry jam;treats;2;15;1 tbsp;250 0.4 61 1 60 0 0 0 | 0 5 0 ? ? ? ? 0 ? | 0.3 0.1 ? ? 5 50 10 ? 20;addsug;;jam conserve
uk-marmalade;Marmalade;treats;2;15;1 tbsp;260 0.1 64 0.6 60 0 0 0 | 3 5 0 ? ? ? ? 0 ? | 0.1 ? ? ? 3 40 30 ? 20;addsug;;marmalade
uk-choc-spread;Chocolate hazelnut spread;treats;4;15;1 tbsp;541 6 57 3.4 56 31 10 0 | ? ? ? ? ? ? ? ? ? | 4 ? ? ? ? 400 110 ? 40;addsug upf;Over half sugar.;nutella chocolate spread
uk-branston;Pickle (Branston-style);herbs;4;15;1 tbsp;109 0.8 26 1.2 22 0.2 0 0 | ? ? 0 ? ? ? ? 0 ? | 0.5 ? ? ? ? ? 20 ? 1100;addsug upf;Made with barley malt vinegar, which Coeliac UK considers safe. Check for other gluten.;branston pickle chutney
uk-tzatziki;Tzatziki;dairy;3;50;2 tbsp;100 4 4 0.5 3 7 3.5 0 | ? ? ? ? ? ? ? ? ? | 0.2 ? ? ? ? 150 120 ? 300;ferm;;tzatziki
uk-guacamole;Guacamole;veg;3;50;2 tbsp;150 2 4 6 1 14 2 0 | ? 8 0 2 ? ? 60 0 ? | 0.5 0.5 ? ? 25 400 15 ? 300;mufa lut;;guacamole guac
uk-pesto;Green pesto;herbs;3;15;1 tbsp;450 5 4 2 3 45 7 0 | ? ? ? 5 ? ? ? ? ? | 1 ? ? ? ? ? 150 ? 1000;mufa;;pesto
# Meals and takeaway (per 100 g as eaten)
uk-tikka-masala;Chicken tikka masala (as eaten);treats;3;350;1 takeaway portion;140 11 6 1 3 8 3 0 | ? ? ? ? ? ? ? ? ? | 0.8 0.8 ? ? 20 250 40 ? 400;;Often thickened with cream and butter. Usually gluten-free, but ask.;tikka masala curry takeaway
uk-korma;Chicken korma (as eaten);treats;3;350;1 takeaway portion;160 12 6 1 4 10 4.5 0 | ? ? ? ? ? ? ? ? ? | 0.8 0.8 ? ? 20 250 40 ? 350;;;korma curry
uk-doner;Doner kebab meat;treats;4;150;regular portion;280 15 5 0.5 1 22 10 0 | ? ? ? ? ? ? ? ? ? | 1.8 2.5 ? ? 20 200 30 ? 900;procmeat upf gluten;Often bulked with breadcrumbs, so not safe for coeliacs.;doner kebab takeaway
uk-sweet-sour;Sweet and sour chicken (battered);treats;4;300;1 takeaway portion;180 9 23 1 15 6 1 0 | ? ? ? ? ? ? ? ? ? | 0.6 0.5 ? ? 15 150 20 ? 400;fried gluten addsug upf;;chinese takeaway sweet and sour
uk-egg-fried-rice;Egg fried rice;grains;3;250;1 portion;186 5 26 0.6 0.5 7 1 0 | ? ? ? ? ? ? ? ? ? | 0.6 0.6 ? ? 15 80 15 ? 350;fried gluten;Usually made with wheat soy sauce, so not gluten-free.;fried rice chinese
uk-chilli;Chilli con carne (as eaten);treats;3;350;1 portion;105 9 6 2.5 3 5 2 0 | ? ? ? ? ? ? ? ? ? | 1.6 1.8 ? ? 25 350 30 ? 300;preb;;chilli con carne
uk-bolognese;Bolognese sauce (meat);treats;3;250;1 portion;105 8 4 1 3 6 2.5 0 | ? ? ? ? ? ? ? ? ? | 1.2 1.6 ? ? 18 330 20 ? 300;carot;;spag bol ragu bolognese
uk-shepherds-pie;Shepherd’s / cottage pie;treats;3;350;1 portion;112 6 9 1 1.2 5.5 2.5 0 | ? ? ? ? ? ? ? ? ? | 0.8 1.2 ? ? 15 300 20 ? 300;;Check that the gravy is gluten-free.;shepherds pie cottage pie
uk-sandwich;Meal-deal sandwich (chicken & bacon);treats;4;190;1 sandwich;240 13 22 2 2 11 2.5 0 | ? ? ? ? ? ? ? ? ? | 1 ? ? ? ? ? 80 ? 500;procmeat upf gluten;;meal deal sandwich tesco boots
# Drinks (per 100 ml)
uk-lucozade;Lucozade Energy (per 100 ml);drinks;4;380;1 bottle;70 0 17 0 17 0 0 0 | 0 0 0 0 0 0 0 0 0 | 0 0 0 0 0 0 0 0 30;upf addsug caff;;lucozade
uk-ribena;Ribena (per 100 ml, ready to drink);drinks;4;250;1 glass;41 0 10 0 10 0 0 0 | 0 20 0 0 0 0 0 0 0 | 0 0 0 0 0 30 0 0 5;upf addsug;;ribena
uk-squash;Squash, no added sugar (diluted, per 100 ml);drinks;4;250;1 glass;2 0 0.2 0 0.2 0 0 0 | 0 0 0 0 0 0 0 0 0 | 0 0 0 0 0 5 0 0 5;upf;Fine for hydration. Sweetened with sweeteners.;squash robinsons cordial
uk-guinness;Stout / Guinness (per 100 ml);drinks;3;568;1 pint;35 0.3 3 0 0 0 0 0 | 0 0 0 0 0 0.02 4 0 ? | 0 0 0 0 5 30 4 ? 4;alc gluten;Made from barley, so not gluten-free.;guinness stout porter
uk-ale;Ale / bitter (per 100 ml);drinks;3;568;1 pint;34 0.3 2.2 0 0 0 0 0 | 0 0 0 0 0 0.02 6 0 ? | 0 0 0 0 7 32 8 ? 6;alc gluten;;bitter ale ipa pint
uk-cider;Cider (per 100 ml);drinks;3;568;1 pint;40 0 3 0 3 0 0 0 | 0 0 0 0 0 0 0 0 0 | 0.4 0 0 0 3 70 8 0 7;alc;Naturally gluten-free.;cider strongbow
uk-prosecco;Prosecco / sparkling wine (per 100 ml);drinks;3;125;1 glass;70 0 1.5 0 1.5 0 0 0 | 0 0 0 0 0 0 0 0 0 | 0.3 0 0 0 9 80 8 0 5;alc;;prosecco champagne cava fizz
uk-gin-tonic;Gin and tonic (per 100 ml);drinks;3;250;1 glass;65 0 6 0 6 0 0 0 | 0 0 0 0 0 0 0 0 0 | 0 0 0 0 0 0 0 0 5;alc addsug;;g&t gin and tonic
uk-tea-milk;Tea with milk (per 100 ml);drinks;1;250;1 mug;13 0.5 0.8 0 0.8 0.5 0.3 0 | 5 0 0 0 0 0.04 1 0.04 ? | 0 0 0 0 2 30 18 3 3;poly caff;Tannins reduce iron absorption, so drink it between meals.;cuppa builders tea english breakfast
uk-latte;Latte, semi-skimmed (per 100 ml);drinks;1;350;1 regular;40 2.8 4 0 4 1.5 1 0 | 15 0 0 0 0 0.15 4 0.35 ? | 0 0.3 0 2 12 140 100 10 40;caff;;latte cappuccino flat white coffee shop
uk-coconut-water;Coconut water (per 100 ml);drinks;1;330;1 carton;19 0.7 3.7 1.1 2.6 0.2 0.2 0 | 0 2.4 0 0 0 0.06 3 0 ? | 0.3 0.1 0.04 1 25 250 24 ? 105;;Natural electrolytes, mainly potassium.;coconut water vita coco
`;
