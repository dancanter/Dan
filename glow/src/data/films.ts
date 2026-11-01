// Widely acclaimed films that keep turning up in Letterboxd top lists and
// critics’ polls. Titles, years and directors are facts. Ratings change, so
// each film links to Letterboxd for its current score instead of storing one.

export type Mood = 'uplifting' | 'thrilling' | 'mind' | 'epic' | 'romantic' | 'stylish' | 'dark' | 'funny' | 'animated' | 'world' | 'classic' | 'sport';

export const MOOD_LABEL: Record<Mood, string> = {
  uplifting: 'Uplifting', thrilling: 'Edge of your seat', mind: 'Mind-bending', epic: 'Epic', romantic: 'Romantic', stylish: 'Effortlessly stylish',
  dark: 'Dark & heavy', funny: 'Funny', animated: 'Animated', world: 'World cinema', classic: 'Classic', sport: 'Sport & drive',
};

export interface Film { id: string; title: string; year: number; director: string; moods: Mood[] }

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
`;

export const FILMS: Film[] = RAW.trim().split('\n').map((line) => {
  const [title, year, director, moods] = line.split('|');
  return { id: `${title}-${year}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'), title, year: Number(year), director, moods: moods.split(' ') as Mood[] };
});

export const letterboxdUrl = (f: Film) => `https://letterboxd.com/search/films/${encodeURIComponent(`${f.title} ${f.year}`)}/`;
