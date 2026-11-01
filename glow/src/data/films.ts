// Widely acclaimed films that keep turning up in Letterboxd top lists and
// critics’ polls. Titles, years and directors are facts. Ratings change, so
// each film links to Letterboxd for its current score instead of storing one.

export type Mood = 'uplifting' | 'thrilling' | 'mind' | 'epic' | 'romantic' | 'stylish' | 'dark' | 'funny' | 'animated' | 'world' | 'classic' | 'sport';

export const MOOD_LABEL: Record<Mood, string> = {
  uplifting: 'Uplifting', thrilling: 'Edge of your seat', mind: 'Mind-bending', epic: 'Epic', romantic: 'Romantic', stylish: 'Effortlessly stylish',
  dark: 'Dark & heavy', funny: 'Funny', animated: 'Animated', world: 'World cinema', classic: 'Classic', sport: 'Sport & drive',
};

export type Season = 'winter' | 'spring' | 'summer' | 'autumn';
export const SEASON_LABEL: Record<Season, string> = { winter: 'Winter', spring: 'Spring', summer: 'Summer', autumn: 'Autumn' };

export interface Film { id: string; title: string; year: number; director: string; moods: Mood[]; seasons: Season[] }

const RAW = `
The Godfather|1972|Francis Ford Coppola|epic dark classic
The Godfather Part II|1974|Francis Ford Coppola|epic dark classic
12 Angry Men|1957|Sidney Lumet|thrilling classic
Seven Samurai|1954|Akira Kurosawa|epic world classic
Parasite|2019|Bong Joon-ho|thrilling dark world
Spirited Away|2001|Hayao Miyazaki|animated uplifting world
Harakiri|1962|Masaki Kobayashi|dark world classic
High and Low|1963|Akira Kurosawa|thrilling world classic
Come and See|1985|Elem Klimov|dark world
In the Mood for Love|2000|Wong Kar-wai|romantic stylish world
Portrait of a Lady on Fire|2019|Céline Sciamma|romantic world
Whiplash|2014|Damien Chazelle|thrilling sport
Interstellar|2014|Christopher Nolan|mind epic
Inception|2010|Christopher Nolan|mind thrilling
The Dark Knight|2008|Christopher Nolan|thrilling dark
The Prestige|2006|Christopher Nolan|mind thrilling
Memento|2000|Christopher Nolan|mind thrilling
Oppenheimer|2023|Christopher Nolan|epic
Pulp Fiction|1994|Quentin Tarantino|stylish funny
GoodFellas|1990|Martin Scorsese|dark stylish
Taxi Driver|1976|Martin Scorsese|dark classic
Fight Club|1999|David Fincher|mind dark
Se7en|1995|David Fincher|thrilling dark
Zodiac|2007|David Fincher|thrilling
The Social Network|2010|David Fincher|thrilling
There Will Be Blood|2007|Paul Thomas Anderson|epic dark
No Country for Old Men|2007|Joel Coen & Ethan Coen|thrilling dark
Fargo|1996|Joel Coen & Ethan Coen|funny dark
The Big Lebowski|1998|Joel Coen & Ethan Coen|funny
Spider-Man: Into the Spider-Verse|2018|Bob Persichetti, Peter Ramsey & Rodney Rothman|animated uplifting
Spider-Man: Across the Spider-Verse|2023|Joaquim Dos Santos, Kemp Powers & Justin K. Thompson|animated uplifting
Everything Everywhere All at Once|2022|Daniel Kwan & Daniel Scheinert|mind funny uplifting
Dune: Part Two|2024|Denis Villeneuve|epic
Blade Runner 2049|2017|Denis Villeneuve|mind stylish
Arrival|2016|Denis Villeneuve|mind
Sicario|2015|Denis Villeneuve|thrilling dark
Prisoners|2013|Denis Villeneuve|thrilling dark
2001: A Space Odyssey|1968|Stanley Kubrick|mind epic classic
The Shining|1980|Stanley Kubrick|dark classic
Barry Lyndon|1975|Stanley Kubrick|stylish epic classic
Paths of Glory|1957|Stanley Kubrick|dark classic
Apocalypse Now|1979|Francis Ford Coppola|epic dark classic
Lawrence of Arabia|1962|David Lean|epic classic
Casablanca|1942|Michael Curtiz|romantic classic
Rear Window|1954|Alfred Hitchcock|thrilling classic
Vertigo|1958|Alfred Hitchcock|mind stylish classic
Psycho|1960|Alfred Hitchcock|thrilling classic
North by Northwest|1959|Alfred Hitchcock|thrilling stylish classic
To Catch a Thief|1955|Alfred Hitchcock|romantic stylish classic
Sunset Boulevard|1950|Billy Wilder|dark classic
Some Like It Hot|1959|Billy Wilder|funny classic
The Apartment|1960|Billy Wilder|romantic funny classic
Singin' in the Rain|1952|Stanley Donen & Gene Kelly|uplifting classic
It's a Wonderful Life|1946|Frank Capra|uplifting classic
The Good, the Bad and the Ugly|1966|Sergio Leone|epic classic
Once Upon a Time in the West|1968|Sergio Leone|epic stylish classic
Le Samouraï|1967|Jean-Pierre Melville|stylish world classic
Le Cercle Rouge|1970|Jean-Pierre Melville|thrilling stylish world classic
Purple Noon|1960|René Clément|stylish thrilling world classic
La Piscine|1969|Jacques Deray|stylish romantic world
Contempt|1963|Jean-Luc Godard|stylish world classic
The Leopard|1963|Luchino Visconti|epic stylish world classic
La Dolce Vita|1960|Federico Fellini|stylish world classic
8½|1963|Federico Fellini|mind world classic
The Talented Mr. Ripley|1999|Anthony Minghella|thrilling stylish
Call Me by Your Name|2017|Luca Guadagnino|romantic stylish
A Bigger Splash|2015|Luca Guadagnino|stylish thrilling
Another Round|2020|Thomas Vinterberg|funny world
The Hunt|2012|Thomas Vinterberg|dark world
Casino Royale|2006|Martin Campbell|thrilling stylish
Skyfall|2012|Sam Mendes|thrilling stylish
Goldfinger|1964|Guy Hamilton|thrilling stylish classic
From Russia with Love|1963|Terence Young|thrilling stylish classic
Amélie|2001|Jean-Pierre Jeunet|uplifting romantic world
The Intouchables|2011|Olivier Nakache & Éric Toledano|uplifting funny world
Oldboy|2003|Park Chan-wook|dark thrilling world
The Handmaiden|2016|Park Chan-wook|thrilling stylish world
Decision to Leave|2022|Park Chan-wook|romantic mind world
Memories of Murder|2003|Bong Joon-ho|thrilling dark world
Your Name|2016|Makoto Shinkai|animated romantic world
Princess Mononoke|1997|Hayao Miyazaki|animated epic world
My Neighbor Totoro|1988|Hayao Miyazaki|animated uplifting world
Grave of the Fireflies|1988|Isao Takahata|animated dark world
Perfect Blue|1997|Satoshi Kon|animated mind world
Ratatouille|2007|Brad Bird|animated uplifting
WALL·E|2008|Andrew Stanton|animated uplifting
Up|2009|Pete Docter|animated uplifting
The Grand Budapest Hotel|2014|Wes Anderson|funny stylish
Fantastic Mr. Fox|2009|Wes Anderson|animated funny
Past Lives|2023|Celine Song|romantic
Aftersun|2022|Charlotte Wells|dark
Before Sunrise|1995|Richard Linklater|romantic
Before Sunset|2004|Richard Linklater|romantic
Eternal Sunshine of the Spotless Mind|2004|Michel Gondry|romantic mind
Good Will Hunting|1997|Gus Van Sant|uplifting
The Shawshank Redemption|1994|Frank Darabont|uplifting classic
Mad Max: Fury Road|2015|George Miller|thrilling epic
Heat|1995|Michael Mann|thrilling stylish
Collateral|2004|Michael Mann|thrilling stylish
Drive|2011|Nicolas Winding Refn|stylish thrilling
Anatomy of a Fall|2023|Justine Triet|thrilling world
The Zone of Interest|2023|Jonathan Glazer|dark
Perfect Days|2023|Wim Wenders|uplifting world
Paris, Texas|1984|Wim Wenders|romantic world
Chungking Express|1994|Wong Kar-wai|romantic stylish world
Yi Yi|2000|Edward Yang|world
Tokyo Story|1953|Yasujirō Ozu|world classic
Stalker|1979|Andrei Tarkovsky|mind world classic
Persona|1966|Ingmar Bergman|mind world classic
The Seventh Seal|1957|Ingmar Bergman|mind world classic
Rashomon|1950|Akira Kurosawa|mind world classic
Ikiru|1952|Akira Kurosawa|uplifting world classic
City of God|2002|Fernando Meirelles & Kátia Lund|thrilling world
Pan's Labyrinth|2006|Guillermo del Toro|dark world
The Lives of Others|2006|Florian Henckel von Donnersmarck|thrilling world
Cinema Paradiso|1988|Giuseppe Tornatore|uplifting world
Life Is Beautiful|1997|Roberto Benigni|uplifting world
Rocky|1976|John G. Avildsen|uplifting sport classic
Chariots of Fire|1981|Hugh Hudson|uplifting sport
Ford v Ferrari|2019|James Mangold|thrilling sport
Rush|2013|Ron Howard|thrilling sport
Top Gun: Maverick|2022|Joseph Kosinski|thrilling uplifting
The Truman Show|1998|Peter Weir|mind uplifting
Back to the Future|1985|Robert Zemeckis|funny uplifting
Jaws|1975|Steven Spielberg|thrilling classic
Raiders of the Lost Ark|1981|Steven Spielberg|thrilling uplifting
Schindler's List|1993|Steven Spielberg|dark epic
Saving Private Ryan|1998|Steven Spielberg|epic dark
The Silence of the Lambs|1991|Jonathan Demme|thrilling dark
Alien|1979|Ridley Scott|thrilling dark
Blade Runner|1982|Ridley Scott|mind stylish
Gladiator|2000|Ridley Scott|epic
The Lord of the Rings: The Return of the King|2003|Peter Jackson|epic
Amadeus|1984|Miloš Forman|epic
One Flew Over the Cuckoo's Nest|1975|Miloš Forman|dark classic
Mulholland Drive|2001|David Lynch|mind dark
Get Out|2017|Jordan Peele|thrilling
The Matrix|1999|Lana Wachowski & Lilly Wachowski|mind thrilling
Home Alone|1990|Chris Columbus|funny uplifting|winter
Elf|2003|Jon Favreau|funny uplifting|winter
Love Actually|2003|Richard Curtis|romantic funny|winter
The Holiday|2006|Nancy Meyers|romantic|winter
Die Hard|1988|John McTiernan|thrilling|winter
Little Women|2019|Greta Gerwig|uplifting romantic|winter
Carol|2015|Todd Haynes|romantic stylish|winter
Groundhog Day|1993|Harold Ramis|funny uplifting|winter
Edward Scissorhands|1990|Tim Burton|romantic|winter
Klaus|2019|Sergio Pablos|animated uplifting|winter
Paddington|2014|Paul King|uplifting funny|winter
Paddington 2|2017|Paul King|uplifting funny|winter
Knives Out|2019|Rian Johnson|thrilling funny|winter
The Revenant|2015|Alejandro G. Iñárritu|epic|winter
The Thing|1982|John Carpenter|thrilling dark|winter
Doctor Zhivago|1965|David Lean|epic romantic classic|winter
Eyes Wide Shut|1999|Stanley Kubrick|mind|winter
Tinker Tailor Soldier Spy|2011|Tomas Alfredson|thrilling stylish|winter
Let the Right One In|2008|Tomas Alfredson|dark world|winter
Snowpiercer|2013|Bong Joon-ho|thrilling|winter
The Holdovers|2023|Alexander Payne|funny uplifting|winter
Brooklyn|2015|John Crowley|romantic|winter
The Lord of the Rings: The Fellowship of the Ring|2001|Peter Jackson|epic|winter
The Lord of the Rings: The Two Towers|2002|Peter Jackson|epic|winter
Harry Potter and the Prisoner of Azkaban|2004|Alfonso Cuarón|uplifting|winter
Children of Men|2006|Alfonso Cuarón|thrilling dark|winter
Fanny and Alexander|1982|Ingmar Bergman|world epic|winter
The Muppet Christmas Carol|1992|Brian Henson|funny uplifting|winter
Miracle on 34th Street|1947|George Seaton|uplifting classic|winter
Brief Encounter|1945|David Lean|romantic classic|winter
The Third Man|1949|Carol Reed|thrilling classic|winter
Charade|1963|Stanley Donen|thrilling romantic stylish classic|winter
The Umbrellas of Cherbourg|1964|Jacques Demy|romantic world classic|winter
Au Revoir les Enfants|1987|Louis Malle|world|winter
On Her Majesty's Secret Service|1969|Peter R. Hunt|thrilling romantic classic|winter
Catch Me If You Can|2002|Steven Spielberg|stylish uplifting|winter
The Empire Strikes Back|1980|Irvin Kershner|epic|winter
Phantom Thread|2017|Paul Thomas Anderson|romantic stylish|winter
Django Unchained|2012|Quentin Tarantino|thrilling|winter
The Hateful Eight|2015|Quentin Tarantino|thrilling|winter
Inside Llewyn Davis|2013|Joel Coen & Ethan Coen|world|winter
True Grit|2010|Joel Coen & Ethan Coen|epic|winter
Black Swan|2010|Darren Aronofsky|dark mind|winter
Creed|2015|Ryan Coogler|sport uplifting|winter
Million Dollar Baby|2004|Clint Eastwood|sport dark|winter
Spotlight|2015|Tom McCarthy|thrilling|winter
The French Connection|1971|William Friedkin|thrilling classic|winter
Wings of Desire|1987|Wim Wenders|romantic world|winter
Downfall|2004|Oliver Hirschbiegel|dark world|winter
All Quiet on the Western Front|2022|Edward Berger|dark world|winter
Festen|1998|Thomas Vinterberg|dark world|winter
Riders of Justice|2020|Anders Thomas Jensen|funny thrilling world|winter
Force Majeure|2014|Ruben Östlund|funny world|winter
Drive My Car|2021|Ryusuke Hamaguchi|world|winter
Birdman|2014|Alejandro G. Iñárritu|mind funny|winter
Ronin|1998|John Frankenheimer|thrilling stylish|winter
Logan|2017|James Mangold|dark|winter
The Breakfast Club|1985|John Hughes|funny|winter
Planes, Trains and Automobiles|1987|John Hughes|funny|winter
Road to Perdition|2002|Sam Mendes|dark|winter
Manchester by the Sea|2016|Kenneth Lonergan|dark|winter
Anora|2024|Sean Baker|funny romantic|winter
The Favourite|2018|Yorgos Lanthimos|funny|winter
Uncut Gems|2019|Josh Safdie & Benny Safdie|thrilling|winter
Wind River|2017|Taylor Sheridan|thrilling|winter
In Bruges|2008|Martin McDonagh|funny dark|winter
Scott Pilgrim vs. the World|2010|Edgar Wright|funny|winter
The King's Speech|2010|Tom Hooper|uplifting|winter
Dead Poets Society|1989|Peter Weir|uplifting|autumn
When Harry Met Sally...|1989|Rob Reiner|romantic funny|autumn
You've Got Mail|1998|Nora Ephron|romantic|autumn
Gone Girl|2014|David Fincher|thrilling dark|autumn
The Departed|2006|Martin Scorsese|thrilling|autumn
Shutter Island|2010|Martin Scorsese|mind thrilling|autumn
Killers of the Flower Moon|2023|Martin Scorsese|epic dark|autumn
Mystic River|2003|Clint Eastwood|dark|autumn
Unforgiven|1992|Clint Eastwood|epic|autumn
The Town|2010|Ben Affleck|thrilling|autumn
The Batman|2022|Matt Reeves|thrilling dark|autumn
The Witch|2015|Robert Eggers|dark|autumn
The Lighthouse|2019|Robert Eggers|dark mind|autumn
Sleepy Hollow|1999|Tim Burton|dark|autumn
Coraline|2009|Henry Selick|animated|autumn
The Nightmare Before Christmas|1993|Henry Selick|animated|autumn
Halloween|1978|John Carpenter|thrilling|autumn
Scream|1996|Wes Craven|thrilling|autumn
The Exorcist|1973|William Friedkin|dark classic|autumn
Rosemary's Baby|1968|Roman Polanski|dark classic|autumn
Nosferatu|1922|F. W. Murnau|dark world classic|autumn
Coco|2017|Lee Unkrich|animated uplifting|autumn
The Iron Giant|1999|Brad Bird|animated uplifting|autumn
Wallace & Gromit: The Curse of the Were-Rabbit|2005|Nick Park & Steve Box|animated funny|autumn
The Royal Tenenbaums|2001|Wes Anderson|funny|autumn
Rushmore|1998|Wes Anderson|funny|autumn
Lady Bird|2017|Greta Gerwig|funny uplifting|autumn
Withnail and I|1987|Bruce Robinson|funny|autumn
Moneyball|2011|Bennett Miller|sport uplifting|autumn
Remember the Titans|2000|Boaz Yakin|sport uplifting|autumn
The Sixth Sense|1999|M. Night Shyamalan|mind|autumn
E.T. the Extra-Terrestrial|1982|Steven Spielberg|uplifting|autumn
Ghostbusters|1984|Ivan Reitman|funny|autumn
The Last of the Mohicans|1992|Michael Mann|epic romantic|autumn
The Deer Hunter|1978|Michael Cimino|epic dark|autumn
Days of Heaven|1978|Terrence Malick|romantic world|autumn
Burning|2018|Lee Chang-dong|mind world|autumn
Mother|2009|Bong Joon-ho|thrilling world|autumn
Notting Hill|1999|Roger Michell|romantic funny|spring
Pride & Prejudice|2005|Joe Wright|romantic|spring
Sense and Sensibility|1995|Ang Lee|romantic|spring
Kiki's Delivery Service|1989|Hayao Miyazaki|animated uplifting|spring
Howl's Moving Castle|2004|Hayao Miyazaki|animated romantic|spring
Whisper of the Heart|1995|Yoshifumi Kondō|animated romantic|spring
The Tale of the Princess Kaguya|2013|Isao Takahata|animated|spring
A Silent Voice|2016|Naoko Yamada|animated|spring
La La Land|2016|Damien Chazelle|romantic uplifting|spring
Ferris Bueller's Day Off|1986|John Hughes|funny uplifting|spring
Roman Holiday|1953|William Wyler|romantic classic|spring
The Sound of Music|1965|Robert Wise|uplifting classic|spring
Late Spring|1949|Yasujirō Ozu|world classic|spring
Atonement|2007|Joe Wright|romantic|summer
Brokeback Mountain|2005|Ang Lee|romantic|summer
Porco Rosso|1992|Hayao Miyazaki|animated stylish|summer
Ponyo|2008|Hayao Miyazaki|animated uplifting|summer
Finding Nemo|2003|Andrew Stanton|animated uplifting|summer
Moonrise Kingdom|2012|Wes Anderson|funny romantic|summer
Moonlight|2016|Barry Jenkins|romantic|summer
Boyhood|2014|Richard Linklater|uplifting|summer
Before Midnight|2013|Richard Linklater|romantic|summer
Dazed and Confused|1993|Richard Linklater|funny|summer
Little Miss Sunshine|2006|Jonathan Dayton & Valerie Faris|funny uplifting|summer
Baby Driver|2017|Edgar Wright|thrilling stylish|summer
28 Days Later|2002|Danny Boyle|thrilling|summer
This Is England|2006|Shane Meadows|dark|summer
Four Weddings and a Funeral|1994|Mike Newell|romantic funny|summer
Wild Strawberries|1957|Ingmar Bergman|world classic|summer
Y Tu Mamá También|2001|Alfonso Cuarón|world romantic|summer
Midsommar|2019|Ari Aster|dark|summer
Chinatown|1974|Roman Polanski|thrilling stylish classic|summer
Strangers on a Train|1951|Alfred Hitchcock|thrilling classic|summer
L'Avventura|1960|Michelangelo Antonioni|stylish world classic|summer
Il Postino|1994|Michael Radford|romantic world|summer
The Great Beauty|2013|Paolo Sorrentino|stylish world|summer
Pierrot le Fou|1965|Jean-Luc Godard|stylish world classic|summer
Jules and Jim|1962|François Truffaut|romantic world classic|summer
Cléo from 5 to 7|1962|Agnès Varda|world classic|summer
Monsieur Hulot's Holiday|1953|Jacques Tati|funny world classic|summer
La Haine|1995|Mathieu Kassovitz|world dark|summer
Jean de Florette|1986|Claude Berri|world|summer
Manon des Sources|1986|Claude Berri|world|summer
And God Created Woman|1956|Roger Vadim|romantic stylish world classic|summer
Swimming Pool|2003|François Ozon|thrilling stylish world|summer
Le Mans|1971|Lee H. Katzin|sport stylish|summer
Grand Prix|1966|John Frankenheimer|sport stylish|summer
The Day of the Jackal|1973|Fred Zinnemann|thrilling stylish classic|summer
The Italian Job|1969|Peter Collinson|funny thrilling stylish|summer
Jurassic Park|1993|Steven Spielberg|thrilling|summer
Indiana Jones and the Last Crusade|1989|Steven Spielberg|thrilling funny|summer
Once Upon a Time in Hollywood|2019|Quentin Tarantino|funny stylish|summer
O Brother, Where Art Thou?|2000|Joel Coen & Ethan Coen|funny|summer
Dog Day Afternoon|1975|Sidney Lumet|thrilling classic|summer
Midnight in Paris|2011|Woody Allen|romantic uplifting|summer
The Graduate|1967|Mike Nichols|romantic funny classic|summer
Bonnie and Clyde|1967|Arthur Penn|stylish classic|summer
Cool Hand Luke|1967|Stuart Rosenberg|classic|summer
West Side Story|1961|Robert Wise & Jerome Robbins|romantic classic|summer
To Kill a Mockingbird|1962|Robert Mulligan|classic|summer
The Tree of Life|2011|Terrence Malick|mind|summer
Run Lola Run|1998|Tom Tykwer|thrilling world|summer
The Worst Person in the World|2021|Joachim Trier|romantic world|summer
Oslo, August 31st|2011|Joachim Trier|world|summer
Triangle of Sadness|2022|Ruben Östlund|funny|summer
Still Walking|2008|Hirokazu Kore-eda|world|summer
Pather Panchali|1955|Satyajit Ray|world classic|summer
Lagaan|2001|Ashutosh Gowariker|sport epic world|summer
The Motorcycle Diaries|2004|Walter Salles|world uplifting|summer
Pain and Glory|2019|Pedro Almodóvar|world|summer
Mediterraneo|1991|Gabriele Salvatores|funny world|summer
I Am Love|2009|Luca Guadagnino|romantic stylish world|summer
Challengers|2024|Luca Guadagnino|sport stylish|summer
Dr. No|1962|Terence Young|thrilling stylish classic|summer
Thunderball|1965|Terence Young|thrilling stylish classic|summer
The Spy Who Loved Me|1977|Lewis Gilbert|thrilling stylish|summer
Stand by Me|1986|Rob Reiner|uplifting|summer
Top Gun|1986|Tony Scott|thrilling|summer
Point Break|1991|Kathryn Bigelow|thrilling|summer
The Hurt Locker|2008|Kathryn Bigelow|thrilling|summer
Thelma & Louise|1991|Ridley Scott|thrilling|summer
The Florida Project|2017|Sean Baker|world|summer
Licorice Pizza|2021|Paul Thomas Anderson|funny romantic|summer
The Nice Guys|2016|Shane Black|funny thrilling|summer
Hell or High Water|2016|David Mackenzie|thrilling|summer
Without Limits|1998|Robert Towne|sport|summer
Gravity|2013|Alfonso Cuarón|thrilling|any
Roma|2018|Alfonso Cuarón|world|any
Three Colours: Blue|1993|Krzysztof Kieślowski|world romantic|any
Three Colours: Red|1994|Krzysztof Kieślowski|world|any
The Double Life of Véronique|1991|Krzysztof Kieślowski|world mind|any
The Wolf of Wall Street|2013|Martin Scorsese|funny|any
Raging Bull|1980|Martin Scorsese|sport dark classic|any
Casino|1995|Martin Scorsese|stylish|any
Nightcrawler|2014|Dan Gilroy|thrilling dark|any
Batman Begins|2005|Christopher Nolan|thrilling|any
Tenet|2020|Christopher Nolan|mind thrilling|any
Dunkirk|2017|Christopher Nolan|thrilling epic|any
The Pianist|2002|Roman Polanski|dark|any
Crouching Tiger, Hidden Dragon|2000|Ang Lee|epic world|any
Life of Pi|2012|Ang Lee|epic|any
Nausicaä of the Valley of the Wind|1984|Hayao Miyazaki|animated epic|any
Castle in the Sky|1986|Hayao Miyazaki|animated uplifting|any
The Wind Rises|2013|Hayao Miyazaki|animated|any
The Boy and the Heron|2023|Hayao Miyazaki|animated|any
Akira|1988|Katsuhiro Otomo|animated thrilling|any
Ghost in the Shell|1995|Mamoru Oshii|animated mind|any
Paprika|2006|Satoshi Kon|animated mind|any
Millennium Actress|2001|Satoshi Kon|animated romantic|any
Inside Out|2015|Pete Docter|animated uplifting|any
Soul|2020|Pete Docter|animated uplifting|any
Toy Story 3|2010|Lee Unkrich|animated uplifting|any
Monsters, Inc.|2001|Pete Docter|animated funny|any
The Incredibles|2004|Brad Bird|animated thrilling|any
Shrek|2001|Andrew Adamson & Vicky Jenson|animated funny|any
How to Train Your Dragon|2010|Dean DeBlois & Chris Sanders|animated uplifting|any
The Lion King|1994|Roger Allers & Rob Minkoff|animated epic|any
Isle of Dogs|2018|Wes Anderson|animated funny|any
Lost in Translation|2003|Sofia Coppola|romantic|any
Her|2013|Spike Jonze|romantic mind|any
Being John Malkovich|1999|Spike Jonze|mind funny|any
Adaptation.|2002|Spike Jonze|mind funny|any
Synecdoche, New York|2008|Charlie Kaufman|mind|any
Frances Ha|2012|Noah Baumbach|funny|any
Marriage Story|2019|Noah Baumbach|dark|any
Superbad|2007|Greg Mottola|funny|any
Hot Fuzz|2007|Edgar Wright|funny thrilling|any
Shaun of the Dead|2004|Edgar Wright|funny|any
The Banshees of Inisherin|2022|Martin McDonagh|funny dark|any
Three Billboards Outside Ebbing, Missouri|2017|Martin McDonagh|dark funny|any
Snatch|2000|Guy Ritchie|funny thrilling|any
Lock, Stock and Two Smoking Barrels|1998|Guy Ritchie|funny thrilling|any
Trainspotting|1996|Danny Boyle|dark funny|any
Slumdog Millionaire|2008|Danny Boyle|uplifting|any
Kes|1969|Ken Loach|world classic|any
Billy Elliot|2000|Stephen Daldry|uplifting|any
The Full Monty|1997|Peter Cattaneo|funny uplifting|any
About Time|2013|Richard Curtis|romantic uplifting|any
A Matter of Life and Death|1946|Michael Powell & Emeric Pressburger|romantic classic|any
The Red Shoes|1948|Michael Powell & Emeric Pressburger|stylish classic|any
Black Narcissus|1947|Michael Powell & Emeric Pressburger|stylish classic|any
Kind Hearts and Coronets|1949|Robert Hamer|funny classic|any
The Bridge on the River Kwai|1957|David Lean|epic classic|any
Citizen Kane|1941|Orson Welles|classic|any
Touch of Evil|1958|Orson Welles|thrilling classic|any
Double Indemnity|1944|Billy Wilder|thrilling stylish classic|any
The Maltese Falcon|1941|John Huston|thrilling classic|any
The Big Sleep|1946|Howard Hawks|thrilling classic|any
Notorious|1946|Alfred Hitchcock|thrilling romantic classic|any
The Birds|1963|Alfred Hitchcock|thrilling classic|any
Breakfast at Tiffany's|1961|Blake Edwards|romantic stylish classic|any
The Philadelphia Story|1940|George Cukor|romantic funny classic|any
His Girl Friday|1940|Howard Hawks|funny classic|any
Modern Times|1936|Charlie Chaplin|funny classic|any
City Lights|1931|Charlie Chaplin|romantic funny classic|any
Sherlock Jr.|1924|Buster Keaton|funny classic|any
Metropolis|1927|Fritz Lang|mind world classic|any
M|1931|Fritz Lang|thrilling world classic|any
The Passion of Joan of Arc|1928|Carl Theodor Dreyer|world classic|any
Bicycle Thieves|1948|Vittorio De Sica|world classic|any
Blow-Up|1966|Michelangelo Antonioni|stylish mind classic|any
La Strada|1954|Federico Fellini|world classic|any
Nights of Cabiria|1957|Federico Fellini|world classic|any
The Conformist|1970|Bernardo Bertolucci|stylish world classic|any
The Battle of Algiers|1966|Gillo Pontecorvo|world classic|any
Breathless|1960|Jean-Luc Godard|stylish world classic|any
The 400 Blows|1959|François Truffaut|world classic|any
Playtime|1967|Jacques Tati|funny world classic|any
A Prophet|2009|Jacques Audiard|world thrilling|any
Bullitt|1968|Peter Yates|thrilling stylish classic|any
The Thomas Crown Affair|1968|Norman Jewison|stylish thrilling classic|any
Ocean's Eleven|2001|Steven Soderbergh|stylish funny thrilling|any
Close Encounters of the Third Kind|1977|Steven Spielberg|mind|any
Munich|2005|Steven Spielberg|thrilling|any
Star Wars|1977|George Lucas|epic uplifting|any
Terminator 2: Judgment Day|1991|James Cameron|thrilling|any
The Terminator|1984|James Cameron|thrilling|any
Aliens|1986|James Cameron|thrilling|any
Titanic|1997|James Cameron|romantic epic|any
The Usual Suspects|1995|Bryan Singer|thrilling mind|any
L.A. Confidential|1997|Curtis Hanson|thrilling stylish|any
Magnolia|1999|Paul Thomas Anderson|dark|any
Punch-Drunk Love|2002|Paul Thomas Anderson|romantic|any
The Master|2012|Paul Thomas Anderson|mind|any
Kill Bill: Vol. 1|2003|Quentin Tarantino|thrilling stylish|any
Inglourious Basterds|2009|Quentin Tarantino|thrilling|any
Reservoir Dogs|1992|Quentin Tarantino|thrilling|any
Requiem for a Dream|2000|Darren Aronofsky|dark|any
The Wrestler|2008|Darren Aronofsky|sport dark|any
The Fighter|2010|David O. Russell|sport|any
Warrior|2011|Gavin O'Connor|sport|any
Senna|2010|Asif Kapadia|sport world|any
Free Solo|2018|Elizabeth Chai Vasarhelyi & Jimmy Chin|sport thrilling|any
The Big Short|2015|Adam McKay|funny|any
All the President's Men|1976|Alan J. Pakula|thrilling classic|any
Network|1976|Sidney Lumet|dark classic|any
The Conversation|1974|Francis Ford Coppola|mind classic|any
Annie Hall|1977|Woody Allen|romantic funny classic|any
Manhattan|1979|Woody Allen|romantic classic|any
Butch Cassidy and the Sundance Kid|1969|George Roy Hill|funny classic|any
The Sting|1973|George Roy Hill|funny stylish classic|any
The Great Escape|1963|John Sturges|thrilling classic|any
Ben-Hur|1959|William Wyler|epic classic|any
Dr. Strangelove|1964|Stanley Kubrick|funny classic|any
A Clockwork Orange|1971|Stanley Kubrick|dark|any
Full Metal Jacket|1987|Stanley Kubrick|dark|any
Platoon|1986|Oliver Stone|dark|any
The Thin Red Line|1998|Terrence Malick|epic|any
Aguirre, the Wrath of God|1972|Werner Herzog|epic world|any
Good Bye, Lenin!|2003|Wolfgang Becker|funny world|any
Das Boot|1981|Wolfgang Petersen|thrilling world|any
Victoria|2015|Sebastian Schipper|thrilling world|any
Amour|2012|Michael Haneke|world dark|any
Caché|2005|Michael Haneke|thrilling world|any
A Separation|2011|Asghar Farhadi|world|any
Close-Up|1990|Abbas Kiarostami|world|any
Happy Together|1997|Wong Kar-wai|romantic world|any
Fallen Angels|1995|Wong Kar-wai|stylish world|any
2046|2004|Wong Kar-wai|romantic stylish world|any
Infernal Affairs|2002|Andrew Lau & Alan Mak|thrilling world|any
Hero|2002|Zhang Yimou|epic stylish world|any
Raise the Red Lantern|1991|Zhang Yimou|world|any
Farewell My Concubine|1993|Chen Kaige|epic world|any
Train to Busan|2016|Yeon Sang-ho|thrilling world|any
Shoplifters|2018|Hirokazu Kore-eda|world|any
Departures|2008|Yōjirō Takita|world uplifting|any
Ran|1985|Akira Kurosawa|epic world|any
Yojimbo|1961|Akira Kurosawa|stylish world classic|any
Throne of Blood|1957|Akira Kurosawa|dark world classic|any
Sansho the Bailiff|1954|Kenji Mizoguchi|world classic|any
Ugetsu|1953|Kenji Mizoguchi|world classic|any
3 Idiots|2009|Rajkumar Hirani|funny uplifting world|any
RRR|2022|S. S. Rajamouli|epic thrilling world|any
Central Station|1998|Walter Salles|world uplifting|any
Amores Perros|2000|Alejandro G. Iñárritu|thrilling world|any
The Secret in Their Eyes|2009|Juan José Campanella|thrilling world|any
Wild Tales|2014|Damián Szifron|funny dark world|any
All About My Mother|1999|Pedro Almodóvar|world|any
Volver|2006|Pedro Almodóvar|world|any
John Wick|2014|Chad Stahelski|thrilling stylish|any
Mission: Impossible – Fallout|2018|Christopher McQuarrie|thrilling|any
Edge of Tomorrow|2014|Doug Liman|thrilling|any
The Bourne Ultimatum|2007|Paul Greengrass|thrilling|any
No Time to Die|2021|Cary Joji Fukunaga|thrilling stylish|any
GoldenEye|1995|Martin Campbell|thrilling stylish|any
Ex Machina|2014|Alex Garland|mind|any
Annihilation|2018|Alex Garland|mind|any
Moon|2009|Duncan Jones|mind|any
District 9|2009|Neill Blomkamp|thrilling|any
The Princess Bride|1987|Rob Reiner|funny romantic|any
Thief|1981|Michael Mann|thrilling stylish|any
The Insider|1999|Michael Mann|thrilling|any
Forrest Gump|1994|Robert Zemeckis|uplifting|any
Cast Away|2000|Robert Zemeckis|uplifting|any
Contact|1997|Robert Zemeckis|mind|any
Big Fish|2003|Tim Burton|uplifting|any
Gattaca|1997|Andrew Niccol|mind|any
The Martian|2015|Ridley Scott|uplifting|any
1917|2019|Sam Mendes|thrilling epic|any
Room|2015|Lenny Abrahamson|uplifting|any
Nomadland|2020|Chloé Zhao|world|any
Poor Things|2023|Yorgos Lanthimos|funny mind|any
The Lobster|2015|Yorgos Lanthimos|funny mind|any
Tár|2022|Todd Field|mind|any
Jojo Rabbit|2019|Taika Waititi|funny uplifting|any
Hunt for the Wilderpeople|2016|Taika Waititi|funny uplifting|any
What We Do in the Shadows|2014|Jemaine Clement & Taika Waititi|funny|any
The Green Mile|1999|Frank Darabont|uplifting|any
Blue Velvet|1986|David Lynch|dark mind|any
The Elephant Man|1980|David Lynch|classic|any
`;

/** Seasons for the original list (rows without a 5th field). */
const SEASON_OF: Record<string, Season[]> = {
  "It's a Wonderful Life": ['winter'], 'The Shining': ['winter'], 'Fargo': ['winter'], 'The Apartment': ['winter'], 'Eternal Sunshine of the Spotless Mind': ['winter'],
  'The Grand Budapest Hotel': ['winter'], 'The Lord of the Rings: The Return of the King': ['winter'], 'Paths of Glory': ['winter'], 'Come and See': ['winter'],
  'The Hunt': ['winter'], 'Rocky': ['winter'], 'Barry Lyndon': ['winter'], 'Le Cercle Rouge': ['winter'], 'Casablanca': ['winter'], 'Godfather': ['autumn'],
  'Before Sunrise': ['summer'], 'Before Sunset': ['summer'], 'Call Me by Your Name': ['summer'], 'La Piscine': ['summer'], 'Purple Noon': ['summer'],
  'The Talented Mr. Ripley': ['summer'], 'A Bigger Splash': ['summer'], 'To Catch a Thief': ['summer'], 'Contempt': ['summer'], 'Jaws': ['summer'],
  'Sicario': ['summer'], 'Paris, Texas': ['summer'], 'Tokyo Story': ['summer'], 'Aftersun': ['summer'], 'Chariots of Fire': ['summer'], 'Cinema Paradiso': ['summer'],
  'The Leopard': ['summer'], 'La Dolce Vita': ['summer'], 'Mad Max: Fury Road': ['summer'], 'Do the Right Thing': ['summer'], 'Ford v Ferrari': ['summer'], 'Rush': ['summer'],
  'Amélie': ['spring'], 'My Neighbor Totoro': ['spring'], 'Perfect Days': ['spring'], 'Your Name': ['spring'], 'Singin\' in the Rain': ['spring'],
  'Princess Mononoke': ['autumn'], 'Zodiac': ['autumn'], 'Se7en': ['autumn'], 'Prisoners': ['autumn'], 'Fantastic Mr. Fox': ['autumn'], 'Good Will Hunting': ['autumn'],
  'Le Samouraï': ['autumn'], 'The Godfather': ['autumn'], 'Memories of Murder': ['autumn'], 'The Silence of the Lambs': ['autumn'], 'Vertigo': ['autumn'],
};

export const FILMS: Film[] = RAW.trim().split('\n').map((line) => {
  const [title, year, director, moods, seasons] = line.split('|');
  const ss = seasons ? (seasons.trim() === 'any' ? [] : seasons.trim().split(' ')) : SEASON_OF[title] ?? [];
  return { id: `${title}-${year}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'), title, year: Number(year), director, moods: moods.split(' ') as Mood[], seasons: ss as Season[] };
});

export function seasonOf(date: string): Season {
  const m = Number(date.slice(5, 7));
  return m === 12 || m <= 2 ? 'winter' : m <= 5 ? 'spring' : m <= 8 ? 'summer' : 'autumn';
}

export const letterboxdUrl = (f: Film) => `https://letterboxd.com/search/films/${encodeURIComponent(`${f.title} ${f.year}`)}/`;
