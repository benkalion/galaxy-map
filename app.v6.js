/* v6 — modular build (versioned file names), robust JSON fallback */
const FALLBACK_PLANETS = {"planets": [{"name": "Coruscant", "region": "Core", "sector": "Corusca", "grid": "L-9", "offset": [-10, 0], "famous": "Palpatine; Padm\u00e9 Amidala; Mas Amedda", "routes": ["Perlemian Trade Route", "Hydian Way"], "featured": true, "quote": "The entire planet is one big city.", "quoteBy": "Ric Oli\u00e9", "notes": "An ecumenopolis spanning the globe, serving as the political capital across eras. Its lowest levels are centuries old and home to the underworld."}, {"name": "Alderaan", "region": "Core", "sector": "Alderaan", "grid": "M-10", "offset": [-15, 10], "famous": "Leia Organa; Bail Organa", "routes": [], "featured": true, "quote": "Alderaan is peaceful. We have no weapons.", "quoteBy": "Princess Leia Organa", "notes": "A pacifist, mountainous world renowned for art and diplomacy. Destroyed by the first Death Star in 0 BBY."}, {"name": "Corellia", "region": "Core", "sector": "Corellian", "grid": "M-11", "offset": [-2, -12], "famous": "Han Solo; Wedge Antilles", "routes": ["Corellian Run"], "featured": true, "quote": "Chewie, get us outta here!", "quoteBy": "Han Solo", "notes": "Shipbuilding powerhouse\u2014home of Corellian Engineering Corporation. Corellians are famed for fast ships and independent streaks."}, {"name": "Chandrila", "region": "Core", "sector": "Bormea", "grid": "L-9", "offset": [12, -20], "famous": "Mon Mothma", "routes": [], "quote": "The Republic needs a strong, steady hand.", "quoteBy": "Mon Mothma", "notes": "An agrarian core world known for civic freedoms. Became the first capital of the New Republic after the Battle of Endor."}, {"name": "Brentaal", "region": "Core", "sector": "Bormea", "grid": "L-9", "offset": [-32, 6], "famous": "Trade guilds", "routes": ["Perlemian Trade Route"], "featured": true, "quote": "Commerce flows where lanes meet.", "quoteBy": "Local adage", "notes": "A chokepoint on the Perlemian with guild-dominated politics. Control of Brentaal means leverage over Core\u2013Rim shipping."}, {"name": "Cato Neimoidia", "region": "Colonies", "sector": "Quellor", "grid": "N-11", "offset": [-18, 6], "famous": "Trade Federation barons", "routes": [], "quote": "Everything of value is secured on purse worlds.", "quoteBy": "Neimoidian saying", "notes": "Bridge-cities cling to natural arches above the valleys. One of several worlds used to store Neimoidian fortunes."}, {"name": "Kuat", "region": "Colonies", "sector": "Kuat", "grid": "L-9", "offset": [46, 8], "famous": "Kuat Drive Yards", "routes": [], "quote": "From this ring, empires are forged.", "quoteBy": "Shipwright proverb", "notes": "A ring-shaped megastructure encircles the planet, building capital ships from the Clone Wars through the Imperial era."}, {"name": "Duro", "region": "Colonies", "sector": "Duro", "grid": "M-11", "offset": [28, 18], "famous": "Duros spacers", "routes": [], "quote": "We were among the first to chart the stars.", "quoteBy": "Duros navigator", "notes": "Its surface was polluted into ruin; most citizens live in vast orbital habitats and shipyards."}, {"name": "Commenor", "region": "Colonies", "sector": "Churnis", "grid": "N-10", "offset": [-10, 10], "famous": "Independent merchants", "routes": [], "quote": "Trade is our lifeblood.", "quoteBy": "Commenori premier", "notes": "Prosperous port world on busy lanes; its neutrality drew both Imperial and New Republic attention."}, {"name": "Bothawui", "region": "Mid Rim", "sector": "Bothan", "grid": "R-14", "offset": [-60, 0], "famous": "Bothan Spynet", "routes": [], "quote": "Many Bothans died to bring us this information.", "quoteBy": "Mon Mothma", "notes": "The Bothans operate influential intelligence networks from this world, shaping events far beyond the Mid Rim."}, {"name": "Ord Mantell", "region": "Mid Rim", "sector": "Bright Jewel", "grid": "L-7", "offset": [-10, -10], "famous": "Smuggler captains", "routes": [], "quote": "Lots of strange stuff rolling through Ord Mantell.", "quoteBy": "Han Solo", "notes": "Junkyards and mercenary outfits sprawl near the starports; a magnet for fringe work and salvagers."}, {"name": "Mon Cala", "region": "Mid Rim", "sector": "Calamari", "grid": "U-6", "offset": [-40, 10], "famous": "Admiral Ackbar", "routes": [], "quote": "It\u2019s a trap!", "quoteBy": "Admiral Ackbar", "notes": "Oceanic world of the Mon Calamari and Quarren. Their star cruisers helped tip the war to the Rebel Alliance."}, {"name": "Takodana", "region": "Mid Rim", "sector": "\u2014", "grid": "I-16", "offset": [30, -50], "famous": "Maz Kanata", "routes": [], "quote": "I have seen the same eyes in different people.", "quoteBy": "Maz Kanata", "notes": "Ancient neutral ground where smugglers, rogues, and wanderers converge at Maz\u2019s lakeside castle."}, {"name": "Cantonica", "region": "Mid Rim", "sector": "Corporate Sector", "grid": "S-4", "offset": [-60, -10], "famous": "Canto Bight clientele", "routes": [], "quote": "The stables are for fathiers, not financiers.", "quoteBy": "Stable hand", "notes": "Glittering casinos hide arms dealing and exploitation; Resistance agents sought help and found lessons instead."}, {"name": "Onderon", "region": "Inner Rim", "sector": "Japrael", "grid": "O-17", "offset": [-40, -34], "famous": "Saw Gerrera", "routes": [], "quote": "Freedom is won, not given.", "quoteBy": "Saw Gerrera", "notes": "A jungle world with a fierce independent streak. Its moon Dxun shares an atmosphere with the planet."}, {"name": "Balmorra", "region": "Colonies", "sector": "\u2014", "grid": "M-10", "offset": [-4, 30], "famous": "Weapons manufacturers", "routes": [], "quote": "If it moves, we can arm it.", "quoteBy": "Balmorran foreman", "notes": "Industrial world turning out arms and walkers for successive galactic governments."}, {"name": "Geonosis", "region": "Outer Rim", "sector": "Trel", "grid": "R-16", "offset": [-10, -10], "famous": "Poggle the Lesser", "routes": ["Corellian Run"], "featured": true, "quote": "The first battle of the Clone Wars began here.", "quoteBy": "Historical holorecord", "notes": "Petrified spires house hive cities and droid foundries. The Death Star\u2019s early work began in Geonosian hands."}, {"name": "Tatooine", "region": "Outer Rim", "sector": "Arkanis", "grid": "R-16", "offset": [-60, -16], "famous": "Anakin & Luke Skywalker", "routes": ["Corellian Run"], "featured": true, "quote": "You will never find a more wretched hive of scum and villainy.", "quoteBy": "Obi\u2011Wan Kenobi", "notes": "Twin-sunned desert world of moisture farms and Hutt influence. Spaceports like Mos Eisley attract smugglers and bounty hunters."}, {"name": "Ryloth", "region": "Outer Rim", "sector": "Ryloth", "grid": "R-6", "offset": [-20, 10], "famous": "Cham & Hera Syndulla", "routes": ["Corellian Run"], "quote": "Ryloth endures.", "quoteBy": "Cham Syndulla", "notes": "Tidally locked, with habitable twilight bands between a scorching day side and frozen night side."}, {"name": "Mustafar", "region": "Outer Rim", "sector": "Atravis", "grid": "L-19", "offset": [70, -38], "famous": "Darth Vader", "routes": [], "featured": true, "quote": "I have the high ground!", "quoteBy": "Obi\u2011Wan Kenobi", "notes": "Volcanic world of fire rivers and mining colonies. Site of Skywalker and Kenobi\u2019s fateful duel; later home to Vader\u2019s fortress."}, {"name": "Utapau", "region": "Outer Rim", "sector": "Tarabba", "grid": "M-19", "offset": [35, 10], "famous": "Tion Medon; General Grievous (battle)", "routes": [], "quote": "He is here\u2014General Kenobi!", "quoteBy": "Tion Medon", "notes": "Vast sinkholes shelter cities connected by wind\u2011scarred bridges; critical Clone Wars engagement."}, {"name": "Felucia", "region": "Outer Rim", "sector": "Thanium", "grid": "R-6", "offset": [-14, 74], "famous": "Aayla Secura", "routes": [], "quote": "The wilderness glows after sundown.", "quoteBy": "Clone trooper journal", "notes": "A lush, bioluminescent jungle world; Jedi Master Secura fell here during Order 66."}, {"name": "Saleucami", "region": "Outer Rim", "sector": "Thanium", "grid": "R-6", "offset": [10, 54], "famous": "Clones vs droids", "routes": [], "quote": "Sieges wore the planet thin.", "quoteBy": "Republic report", "notes": "Patchwork terrain of deserts and oases; major fortifications during the Outer Rim Sieges."}, {"name": "Bespin", "region": "Outer Rim", "sector": "Anoat", "grid": "K-18", "offset": [20, 60], "famous": "Lando Calrissian", "routes": ["Rimma Trade Route"], "featured": true, "quote": "This deal is getting worse all the time.", "quoteBy": "Lando Calrissian", "notes": "Gas giant rich in tibanna gas. Cloud City\u2019s platforms float in the upper atmosphere."}, {"name": "Hoth", "region": "Outer Rim", "sector": "Anoat", "grid": "K-18", "offset": [-60, 20], "famous": "Echo Base crew", "routes": ["Rimma Trade Route"], "featured": true, "quote": "The shield will be down in moments. You may start your landing.", "quoteBy": "Imperial officer", "notes": "Glacial world where the Rebel Alliance briefly headquartered before an Imperial assault forced evacuation."}, {"name": "Endor", "region": "Outer Rim", "sector": "Moddell", "grid": "H-16", "offset": [0, 40], "famous": "Ewoks; Han & Leia (mission)", "routes": [], "quote": "Yub nub!", "quoteBy": "Ewok celebrants", "notes": "Forest moon whose shield generator protected the second Death Star; victory here toppled the Empire."}, {"name": "Dagobah", "region": "Outer Rim", "sector": "Sluis", "grid": "M-19", "offset": [-20, 30], "famous": "Yoda", "routes": [], "quote": "Do or do not. There is no try.", "quoteBy": "Yoda", "notes": "Remote swamp planet teeming with life, masked in the Force by its natural vergence\u2014ideal for hiding."}, {"name": "Yavin IV", "region": "Outer Rim", "sector": "Gordian", "grid": "Q-6", "offset": [-50, 10], "famous": "Rebel Alliance", "routes": [], "quote": "Red Leader, this is Gold Leader. We\u2019re starting our attack run.", "quoteBy": "Gold Leader", "notes": "Jungle moon with ancient Massassi temples used as a Rebel base to strike the first Death Star."}, {"name": "Lothal", "region": "Outer Rim", "sector": "\u2014", "grid": "U-7", "offset": [-30, 30], "famous": "Ezra Bridger; Sabine Wren", "routes": [], "quote": "Lothal belongs to its people.", "quoteBy": "Ezra Bridger", "notes": "Agrarian world forced into Imperial industrialization. Liberation sparked a broader rebellion in the sector."}, {"name": "Scarif", "region": "Outer Rim", "sector": "\u2014", "grid": "N-18", "offset": [-30, 90], "famous": "Rogue One team", "routes": [], "quote": "Make ten men feel like a hundred.", "quoteBy": "Cassian Andor", "notes": "Tropical Imperial archive where the Death Star plans were stolen at great cost."}, {"name": "Dantooine", "region": "Outer Rim", "sector": "Raioballo", "grid": "L-4", "offset": [50, 30], "famous": "Rebel sympathizers", "routes": ["Perlemian Trade Route"], "quote": "There\u2019s an old Rebel base on Dantooine.", "quoteBy": "Leia Organa", "notes": "Pastoral world used early by the Alliance. Later reports of the base misled the Empire at a critical moment."}, {"name": "Kessel", "region": "Outer Rim", "sector": "Kessel", "grid": "T-10", "offset": [-10, 0], "famous": "Smugglers & Pykes", "routes": [], "quote": "Tighten those navcalculations\u2014we\u2019re skimming the Maw.", "quoteBy": "Seasoned smuggler", "notes": "Harsh prison\u2011mines of spice. The Kessel Run skirts black holes and the Akkadese Maelstrom."}, {"name": "Eriadu", "region": "Outer Rim", "sector": "Seswenna", "grid": "M-18", "offset": [-30, 0], "famous": "Wilhuff Tarkin", "routes": ["Hydian Way"], "quote": "Eriadu rewards strength.", "quoteBy": "Tarkin", "notes": "Industrial powerhouse and political base of Grand Moff Tarkin, anchoring the Hydian Way."}, {"name": "Kamino", "region": "Outer Rim", "sector": "Timora", "grid": "Q-16", "offset": [50, 95], "famous": "Lama Su; Jango Fett (template)", "routes": [], "quote": "The first production runs are on schedule.", "quoteBy": "Lama Su", "notes": "Ocean world of cloners who created the Grand Army for the Republic using Jango Fett\u2019s template."}, {"name": "Rishi", "region": "Outer Rim", "sector": "Tion", "grid": "T-7", "offset": [-40, 68], "famous": "Rishi outpost troopers", "routes": [], "quote": "Rishi Station\u2026 we\u2019ve got droids!", "quoteBy": "Clone trooper", "notes": "Strategic listening post guarding approaches to Kamino along the sea\u2011lanes."}, {"name": "Sullust", "region": "Outer Rim", "sector": "\u2014", "grid": "M-18", "offset": [20, 10], "famous": "SoroSuub executives; Rebel commanders", "routes": [], "quote": "The fleet is assembling at Sullust.", "quoteBy": "Mon Mothma", "notes": "Volcanic caverns host industry and starfighter production. The Rebel fleet staged here before Endor."}, {"name": "Mandalore", "region": "Outer Rim", "sector": "Mandalore", "grid": "O-7", "offset": [40, -10], "famous": "Bo-Katan Kryze; Pre Vizsla", "routes": [], "featured": true, "quote": "This is the Way.", "quoteBy": "The Armorer", "notes": "A beskar-rich world with a warrior culture fractured by civil strife and Imperial purges."}, {"name": "Concordia", "region": "Outer Rim", "sector": "Mandalore", "grid": "O-7", "offset": [66, -10], "famous": "Death Watch", "routes": [], "quote": "The mines are not as abandoned as they seem.", "quoteBy": "Bo-Katan Kryze", "notes": "A quiet Mandalorian moon used as a hidden base and mining site."}, {"name": "Nevarro", "region": "Outer Rim", "sector": "\u2014", "grid": "K-18", "offset": [-80, -10], "famous": "Greef Karga; Din Djarin (visits)", "routes": [], "quote": "I can bring you in warm, or I can bring you in cold.", "quoteBy": "Din Djarin", "notes": "Guild-controlled frontier world that shifted from scum hub to fledgling trade port."}, {"name": "Ilum", "region": "Unknown Regions", "sector": "\u2014", "grid": "F-13", "offset": [-24, 20], "famous": "Jedi Order", "routes": [], "featured": true, "quote": "The crystal chooses the Jedi\u2026 or the Sith.", "quoteBy": "Jedi lore", "notes": "Source of kyber for generations of lightsabers. Later hollowed out by the First Order into Starkiller Base."}, {"name": "Ahch-To", "region": "Unknown Regions", "sector": "\u2014", "grid": "F-13", "offset": [-20, -80], "famous": "Luke Skywalker", "routes": [], "quote": "It\u2019s time for the Jedi to end.", "quoteBy": "Luke Skywalker", "notes": "Remote ocean world of rocky islets and ancient temples\u2014the site of the first Jedi Temple."}, {"name": "Exegol", "region": "Unknown Regions", "sector": "\u2014", "grid": "G-6", "offset": [-40, -120], "famous": "Sith Eternal", "routes": [], "quote": "The dark side is a pathway to many abilities\u2026", "quoteBy": "Darth Sidious", "notes": "Hidden storm-wracked world whose shipyards built the Final Order fleet in secret."}, {"name": "Jakku", "region": "Unknown Regions", "sector": "\u2014", "grid": "G-15", "offset": [-10, -40], "famous": "Rey; Lor San Tekka (village)", "routes": [], "quote": "Some junk is not just junk.", "quoteBy": "Rey", "notes": "Desert planet littered with starship hulks from the battle that ended the Galactic Civil War."}, {"name": "Naboo", "region": "Mid Rim", "sector": "Chommell", "grid": "O-17", "offset": [30, 6], "famous": "Padm\u00e9 Amidala; Sheev Palpatine", "routes": [], "featured": true, "quote": "I will not condone a course of action that will lead us to war.", "quoteBy": "Padm\u00e9 Amidala", "notes": "Idyllic lakes and Gungan swamps surround the city of Theed. Both a Queen and an Emperor hail from here."}, {"name": "Rodia", "region": "Outer Rim", "sector": "Tynna", "grid": "O-14", "offset": [70, 10], "famous": "Greedo", "routes": [], "quote": "Going somewhere, Solo?", "quoteBy": "Greedo", "notes": "Humid wetlands and dense jungles; Rodian culture prizes the hunt and clan prestige."}, {"name": "Batuu", "region": "Outer Rim", "sector": "Trilon", "grid": "G-15", "offset": [30, -10], "famous": "Black Spire Outpost", "routes": [], "quote": "Bright suns!", "quoteBy": "Batuuan greeting", "notes": "Edge-of-wild-space refueling post beneath ancient petrified trees, crossroads of old sub-hyperspace routes."}, {"name": "Crait", "region": "Outer Rim", "sector": "Bon'nyuw-Luq", "grid": "N-17", "offset": [-20, -60], "famous": "General Organa & Resistance", "routes": [], "quote": "The spark that will light the fire.", "quoteBy": "Poe Dameron", "notes": "Salt flats over crimson minerals set the stage for the Resistance\u2019s daring escape."}, {"name": "D'Qar", "region": "Outer Rim", "sector": "Sanbra", "grid": "O-17", "offset": [-10, -30], "famous": "Poe Dameron; Leia\u2019s Resistance", "routes": [], "quote": "Clear the ion cannon for launch!", "quoteBy": "Resistance officer", "notes": "Jungle world whose hidden base served the Resistance until a heavy First Order strike."}, {"name": "Polis Massa", "region": "Outer Rim", "sector": "Anoat", "grid": "K-18", "offset": [-30, 40], "famous": "Medical droids; Kenobi & Yoda (visit)", "routes": [], "quote": "We can still save the children.", "quoteBy": "Medical droid", "notes": "An asteroid research facility that became the secret birthplace of Luke and Leia."}, {"name": "Eadu", "region": "Outer Rim", "sector": "\u2014", "grid": "N-18", "offset": [-10, 70], "famous": "Galen Erso", "routes": [], "quote": "The work has to stop.", "quoteBy": "Galen Erso", "notes": "Storm-lashed laboratories refined kyber for the Death Star before Rebel strikes disrupted the project."}, {"name": "Serenno", "region": "Outer Rim", "sector": "\u2014", "grid": "M-19", "offset": [70, 0], "famous": "Count Dooku", "routes": [], "quote": "I serve a higher cause than the Republic.", "quoteBy": "Count Dooku", "notes": "Aristocratic world with old money and Separatist leadership; its estates funded galactic intrigue."}, {"name": "Mygeeto", "region": "Outer Rim", "sector": "\u2014", "grid": "R-6", "offset": [30, 40], "famous": "Ki-Adi-Mundi", "routes": [], "quote": "Hold the line!", "quoteBy": "Ki\u2011Adi\u2011Mundi", "notes": "Icy banking world and battlefield of Order 66 where Master Mundi fell."}]};
const FALLBACK_PLANETS = {"planets": [{"name": "Coruscant", "region": "Core", "sector": "Corusca", "grid": "L-9", "offset": [-10, 0], "famous": "Palpatine; Padm\u00e9 Amidala; Mas Amedda", "routes": ["Perlemian Trade Route", "Hydian Way"], "featured": true, "quote": "The entire planet is one big city.", "quoteBy": "Ric Oli\u00e9", "notes": "An ecumenopolis spanning the globe, serving as the political capital across eras. Its lowest levels are centuries old and home to the underworld."}, {"name": "Alderaan", "region": "Core", "sector": "Alderaan", "grid": "M-10", "offset": [-15, 10], "famous": "Leia Organa; Bail Organa", "routes": [], "featured": true, "quote": "Alderaan is peaceful. We have no weapons.", "quoteBy": "Princess Leia Organa", "notes": "A pacifist, mountainous world renowned for art and diplomacy. Destroyed by the first Death Star in 0 BBY."}, {"name": "Corellia", "region": "Core", "sector": "Corellian", "grid": "M-11", "offset": [-2, -12], "famous": "Han Solo; Wedge Antilles", "routes": ["Corellian Run"], "featured": true, "quote": "Chewie, get us outta here!", "quoteBy": "Han Solo", "notes": "Shipbuilding powerhouse\u2014home of Corellian Engineering Corporation. Corellians are famed for fast ships and independent streaks."}, {"name": "Chandrila", "region": "Core", "sector": "Bormea", "grid": "L-9", "offset": [12, -20], "famous": "Mon Mothma", "routes": [], "quote": "The Republic needs a strong, steady hand.", "quoteBy": "Mon Mothma", "notes": "An agrarian core world known for civic freedoms. Became the first capital of the New Republic after the Battle of Endor."}, {"name": "Brentaal", "region": "Core", "sector": "Bormea", "grid": "L-9", "offset": [-32, 6], "famous": "Trade guilds", "routes": ["Perlemian Trade Route"], "featured": true, "quote": "Commerce flows where lanes meet.", "quoteBy": "Local adage", "notes": "A chokepoint on the Perlemian with guild-dominated politics. Control of Brentaal means leverage over Core\u2013Rim shipping."}, {"name": "Cato Neimoidia", "region": "Colonies", "sector": "Quellor", "grid": "N-11", "offset": [-18, 6], "famous": "Trade Federation barons", "routes": [], "quote": "Everything of value is secured on purse worlds.", "quoteBy": "Neimoidian saying", "notes": "Bridge-cities cling to natural arches above the valleys. One of several worlds used to store Neimoidian fortunes."}, {"name": "Kuat", "region": "Colonies", "sector": "Kuat", "grid": "L-9", "offset": [46, 8], "famous": "Kuat Drive Yards", "routes": [], "quote": "From this ring, empires are forged.", "quoteBy": "Shipwright proverb", "notes": "A ring-shaped megastructure encircles the planet, building capital ships from the Clone Wars through the Imperial era."}, {"name": "Duro", "region": "Colonies", "sector": "Duro", "grid": "M-11", "offset": [28, 18], "famous": "Duros spacers", "routes": [], "quote": "We were among the first to chart the stars.", "quoteBy": "Duros navigator", "notes": "Its surface was polluted into ruin; most citizens live in vast orbital habitats and shipyards."}, {"name": "Commenor", "region": "Colonies", "sector": "Churnis", "grid": "N-10", "offset": [-10, 10], "famous": "Independent merchants", "routes": [], "quote": "Trade is our lifeblood.", "quoteBy": "Commenori premier", "notes": "Prosperous port world on busy lanes; its neutrality drew both Imperial and New Republic attention."}, {"name": "Bothawui", "region": "Mid Rim", "sector": "Bothan", "grid": "R-14", "offset": [-60, 0], "famous": "Bothan Spynet", "routes": [], "quote": "Many Bothans died to bring us this information.", "quoteBy": "Mon Mothma", "notes": "The Bothans operate influential intelligence networks from this world, shaping events far beyond the Mid Rim."}, {"name": "Ord Mantell", "region": "Mid Rim", "sector": "Bright Jewel", "grid": "L-7", "offset": [-10, -10], "famous": "Smuggler captains", "routes": [], "quote": "Lots of strange stuff rolling through Ord Mantell.", "quoteBy": "Han Solo", "notes": "Junkyards and mercenary outfits sprawl near the starports; a magnet for fringe work and salvagers."}, {"name": "Mon Cala", "region": "Mid Rim", "sector": "Calamari", "grid": "U-6", "offset": [-40, 10], "famous": "Admiral Ackbar", "routes": [], "quote": "It\u2019s a trap!", "quoteBy": "Admiral Ackbar", "notes": "Oceanic world of the Mon Calamari and Quarren. Their star cruisers helped tip the war to the Rebel Alliance."}, {"name": "Takodana", "region": "Mid Rim", "sector": "\u2014", "grid": "I-16", "offset": [30, -50], "famous": "Maz Kanata", "routes": [], "quote": "I have seen the same eyes in different people.", "quoteBy": "Maz Kanata", "notes": "Ancient neutral ground where smugglers, rogues, and wanderers converge at Maz\u2019s lakeside castle."}, {"name": "Cantonica", "region": "Mid Rim", "sector": "Corporate Sector", "grid": "S-4", "offset": [-60, -10], "famous": "Canto Bight clientele", "routes": [], "quote": "The stables are for fathiers, not financiers.", "quoteBy": "Stable hand", "notes": "Glittering casinos hide arms dealing and exploitation; Resistance agents sought help and found lessons instead."}, {"name": "Onderon", "region": "Inner Rim", "sector": "Japrael", "grid": "O-17", "offset": [-40, -34], "famous": "Saw Gerrera", "routes": [], "quote": "Freedom is won, not given.", "quoteBy": "Saw Gerrera", "notes": "A jungle world with a fierce independent streak. Its moon Dxun shares an atmosphere with the planet."}, {"name": "Balmorra", "region": "Colonies", "sector": "\u2014", "grid": "M-10", "offset": [-4, 30], "famous": "Weapons manufacturers", "routes": [], "quote": "If it moves, we can arm it.", "quoteBy": "Balmorran foreman", "notes": "Industrial world turning out arms and walkers for successive galactic governments."}, {"name": "Geonosis", "region": "Outer Rim", "sector": "Trel", "grid": "R-16", "offset": [-10, -10], "famous": "Poggle the Lesser", "routes": ["Corellian Run"], "featured": true, "quote": "The first battle of the Clone Wars began here.", "quoteBy": "Historical holorecord", "notes": "Petrified spires house hive cities and droid foundries. The Death Star\u2019s early work began in Geonosian hands."}, {"name": "Tatooine", "region": "Outer Rim", "sector": "Arkanis", "grid": "R-16", "offset": [-60, -16], "famous": "Anakin & Luke Skywalker", "routes": ["Corellian Run"], "featured": true, "quote": "You will never find a more wretched hive of scum and villainy.", "quoteBy": "Obi\u2011Wan Kenobi", "notes": "Twin-sunned desert world of moisture farms and Hutt influence. Spaceports like Mos Eisley attract smugglers and bounty hunters."}, {"name": "Ryloth", "region": "Outer Rim", "sector": "Ryloth", "grid": "R-6", "offset": [-20, 10], "famous": "Cham & Hera Syndulla", "routes": ["Corellian Run"], "quote": "Ryloth endures.", "quoteBy": "Cham Syndulla", "notes": "Tidally locked, with habitable twilight bands between a scorching day side and frozen night side."}, {"name": "Mustafar", "region": "Outer Rim", "sector": "Atravis", "grid": "L-19", "offset": [70, -38], "famous": "Darth Vader", "routes": [], "featured": true, "quote": "I have the high ground!", "quoteBy": "Obi\u2011Wan Kenobi", "notes": "Volcanic world of fire rivers and mining colonies. Site of Skywalker and Kenobi\u2019s fateful duel; later home to Vader\u2019s fortress."}, {"name": "Utapau", "region": "Outer Rim", "sector": "Tarabba", "grid": "M-19", "offset": [35, 10], "famous": "Tion Medon; General Grievous (battle)", "routes": [], "quote": "He is here\u2014General Kenobi!", "quoteBy": "Tion Medon", "notes": "Vast sinkholes shelter cities connected by wind\u2011scarred bridges; critical Clone Wars engagement."}, {"name": "Felucia", "region": "Outer Rim", "sector": "Thanium", "grid": "R-6", "offset": [-14, 74], "famous": "Aayla Secura", "routes": [], "quote": "The wilderness glows after sundown.", "quoteBy": "Clone trooper journal", "notes": "A lush, bioluminescent jungle world; Jedi Master Secura fell here during Order 66."}, {"name": "Saleucami", "region": "Outer Rim", "sector": "Thanium", "grid": "R-6", "offset": [10, 54], "famous": "Clones vs droids", "routes": [], "quote": "Sieges wore the planet thin.", "quoteBy": "Republic report", "notes": "Patchwork terrain of deserts and oases; major fortifications during the Outer Rim Sieges."}, {"name": "Bespin", "region": "Outer Rim", "sector": "Anoat", "grid": "K-18", "offset": [20, 60], "famous": "Lando Calrissian", "routes": ["Rimma Trade Route"], "featured": true, "quote": "This deal is getting worse all the time.", "quoteBy": "Lando Calrissian", "notes": "Gas giant rich in tibanna gas. Cloud City\u2019s platforms float in the upper atmosphere."}, {"name": "Hoth", "region": "Outer Rim", "sector": "Anoat", "grid": "K-18", "offset": [-60, 20], "famous": "Echo Base crew", "routes": ["Rimma Trade Route"], "featured": true, "quote": "The shield will be down in moments. You may start your landing.", "quoteBy": "Imperial officer", "notes": "Glacial world where the Rebel Alliance briefly headquartered before an Imperial assault forced evacuation."}, {"name": "Endor", "region": "Outer Rim", "sector": "Moddell", "grid": "H-16", "offset": [0, 40], "famous": "Ewoks; Han & Leia (mission)", "routes": [], "quote": "Yub nub!", "quoteBy": "Ewok celebrants", "notes": "Forest moon whose shield generator protected the second Death Star; victory here toppled the Empire."}, {"name": "Dagobah", "region": "Outer Rim", "sector": "Sluis", "grid": "M-19", "offset": [-20, 30], "famous": "Yoda", "routes": [], "quote": "Do or do not. There is no try.", "quoteBy": "Yoda", "notes": "Remote swamp planet teeming with life, masked in the Force by its natural vergence\u2014ideal for hiding."}, {"name": "Yavin IV", "region": "Outer Rim", "sector": "Gordian", "grid": "Q-6", "offset": [-50, 10], "famous": "Rebel Alliance", "routes": [], "quote": "Red Leader, this is Gold Leader. We\u2019re starting our attack run.", "quoteBy": "Gold Leader", "notes": "Jungle moon with ancient Massassi temples used as a Rebel base to strike the first Death Star."}, {"name": "Lothal", "region": "Outer Rim", "sector": "\u2014", "grid": "U-7", "offset": [-30, 30], "famous": "Ezra Bridger; Sabine Wren", "routes": [], "quote": "Lothal belongs to its people.", "quoteBy": "Ezra Bridger", "notes": "Agrarian world forced into Imperial industrialization. Liberation sparked a broader rebellion in the sector."}, {"name": "Scarif", "region": "Outer Rim", "sector": "\u2014", "grid": "N-18", "offset": [-30, 90], "famous": "Rogue One team", "routes": [], "quote": "Make ten men feel like a hundred.", "quoteBy": "Cassian Andor", "notes": "Tropical Imperial archive where the Death Star plans were stolen at great cost."}, {"name": "Dantooine", "region": "Outer Rim", "sector": "Raioballo", "grid": "L-4", "offset": [50, 30], "famous": "Rebel sympathizers", "routes": ["Perlemian Trade Route"], "quote": "There\u2019s an old Rebel base on Dantooine.", "quoteBy": "Leia Organa", "notes": "Pastoral world used early by the Alliance. Later reports of the base misled the Empire at a critical moment."}, {"name": "Kessel", "region": "Outer Rim", "sector": "Kessel", "grid": "T-10", "offset": [-10, 0], "famous": "Smugglers & Pykes", "routes": [], "quote": "Tighten those navcalculations\u2014we\u2019re skimming the Maw.", "quoteBy": "Seasoned smuggler", "notes": "Harsh prison\u2011mines of spice. The Kessel Run skirts black holes and the Akkadese Maelstrom."}, {"name": "Eriadu", "region": "Outer Rim", "sector": "Seswenna", "grid": "M-18", "offset": [-30, 0], "famous": "Wilhuff Tarkin", "routes": ["Hydian Way"], "quote": "Eriadu rewards strength.", "quoteBy": "Tarkin", "notes": "Industrial powerhouse and political base of Grand Moff Tarkin, anchoring the Hydian Way."}, {"name": "Kamino", "region": "Outer Rim", "sector": "Timora", "grid": "Q-16", "offset": [50, 95], "famous": "Lama Su; Jango Fett (template)", "routes": [], "quote": "The first production runs are on schedule.", "quoteBy": "Lama Su", "notes": "Ocean world of cloners who created the Grand Army for the Republic using Jango Fett\u2019s template."}, {"name": "Rishi", "region": "Outer Rim", "sector": "Tion", "grid": "T-7", "offset": [-40, 68], "famous": "Rishi outpost troopers", "routes": [], "quote": "Rishi Station\u2026 we\u2019ve got droids!", "quoteBy": "Clone trooper", "notes": "Strategic listening post guarding approaches to Kamino along the sea\u2011lanes."}, {"name": "Sullust", "region": "Outer Rim", "sector": "\u2014", "grid": "M-18", "offset": [20, 10], "famous": "SoroSuub executives; Rebel commanders", "routes": [], "quote": "The fleet is assembling at Sullust.", "quoteBy": "Mon Mothma", "notes": "Volcanic caverns host industry and starfighter production. The Rebel fleet staged here before Endor."}, {"name": "Mandalore", "region": "Outer Rim", "sector": "Mandalore", "grid": "O-7", "offset": [40, -10], "famous": "Bo-Katan Kryze; Pre Vizsla", "routes": [], "featured": true, "quote": "This is the Way.", "quoteBy": "The Armorer", "notes": "A beskar-rich world with a warrior culture fractured by civil strife and Imperial purges."}, {"name": "Concordia", "region": "Outer Rim", "sector": "Mandalore", "grid": "O-7", "offset": [66, -10], "famous": "Death Watch", "routes": [], "quote": "The mines are not as abandoned as they seem.", "quoteBy": "Bo-Katan Kryze", "notes": "A quiet Mandalorian moon used as a hidden base and mining site."}, {"name": "Nevarro", "region": "Outer Rim", "sector": "\u2014", "grid": "K-18", "offset": [-80, -10], "famous": "Greef Karga; Din Djarin (visits)", "routes": [], "quote": "I can bring you in warm, or I can bring you in cold.", "quoteBy": "Din Djarin", "notes": "Guild-controlled frontier world that shifted from scum hub to fledgling trade port."}, {"name": "Ilum", "region": "Unknown Regions", "sector": "\u2014", "grid": "F-13", "offset": [-24, 20], "famous": "Jedi Order", "routes": [], "featured": true, "quote": "The crystal chooses the Jedi\u2026 or the Sith.", "quoteBy": "Jedi lore", "notes": "Source of kyber for generations of lightsabers. Later hollowed out by the First Order into Starkiller Base."}, {"name": "Ahch-To", "region": "Unknown Regions", "sector": "\u2014", "grid": "F-13", "offset": [-20, -80], "famous": "Luke Skywalker", "routes": [], "quote": "It\u2019s time for the Jedi to end.", "quoteBy": "Luke Skywalker", "notes": "Remote ocean world of rocky islets and ancient temples\u2014the site of the first Jedi Temple."}, {"name": "Exegol", "region": "Unknown Regions", "sector": "\u2014", "grid": "G-6", "offset": [-40, -120], "famous": "Sith Eternal", "routes": [], "quote": "The dark side is a pathway to many abilities\u2026", "quoteBy": "Darth Sidious", "notes": "Hidden storm-wracked world whose shipyards built the Final Order fleet in secret."}, {"name": "Jakku", "region": "Unknown Regions", "sector": "\u2014", "grid": "G-15", "offset": [-10, -40], "famous": "Rey; Lor San Tekka (village)", "routes": [], "quote": "Some junk is not just junk.", "quoteBy": "Rey", "notes": "Desert planet littered with starship hulks from the battle that ended the Galactic Civil War."}, {"name": "Naboo", "region": "Mid Rim", "sector": "Chommell", "grid": "O-17", "offset": [30, 6], "famous": "Padm\u00e9 Amidala; Sheev Palpatine", "routes": [], "featured": true, "quote": "I will not condone a course of action that will lead us to war.", "quoteBy": "Padm\u00e9 Amidala", "notes": "Idyllic lakes and Gungan swamps surround the city of Theed. Both a Queen and an Emperor hail from here."}, {"name": "Rodia", "region": "Outer Rim", "sector": "Tynna", "grid": "O-14", "offset": [70, 10], "famous": "Greedo", "routes": [], "quote": "Going somewhere, Solo?", "quoteBy": "Greedo", "notes": "Humid wetlands and dense jungles; Rodian culture prizes the hunt and clan prestige."}, {"name": "Batuu", "region": "Outer Rim", "sector": "Trilon", "grid": "G-15", "offset": [30, -10], "famous": "Black Spire Outpost", "routes": [], "quote": "Bright suns!", "quoteBy": "Batuuan greeting", "notes": "Edge-of-wild-space refueling post beneath ancient petrified trees, crossroads of old sub-hyperspace routes."}, {"name": "Crait", "region": "Outer Rim", "sector": "Bon'nyuw-Luq", "grid": "N-17", "offset": [-20, -60], "famous": "General Organa & Resistance", "routes": [], "quote": "The spark that will light the fire.", "quoteBy": "Poe Dameron", "notes": "Salt flats over crimson minerals set the stage for the Resistance\u2019s daring escape."}, {"name": "D'Qar", "region": "Outer Rim", "sector": "Sanbra", "grid": "O-17", "offset": [-10, -30], "famous": "Poe Dameron; Leia\u2019s Resistance", "routes": [], "quote": "Clear the ion cannon for launch!", "quoteBy": "Resistance officer", "notes": "Jungle world whose hidden base served the Resistance until a heavy First Order strike."}, {"name": "Polis Massa", "region": "Outer Rim", "sector": "Anoat", "grid": "K-18", "offset": [-30, 40], "famous": "Medical droids; Kenobi & Yoda (visit)", "routes": [], "quote": "We can still save the children.", "quoteBy": "Medical droid", "notes": "An asteroid research facility that became the secret birthplace of Luke and Leia."}, {"name": "Eadu", "region": "Outer Rim", "sector": "\u2014", "grid": "N-18", "offset": [-10, 70], "famous": "Galen Erso", "routes": [], "quote": "The work has to stop.", "quoteBy": "Galen Erso", "notes": "Storm-lashed laboratories refined kyber for the Death Star before Rebel strikes disrupted the project."}, {"name": "Serenno", "region": "Outer Rim", "sector": "\u2014", "grid": "M-19", "offset": [70, 0], "famous": "Count Dooku", "routes": [], "quote": "I serve a higher cause than the Republic.", "quoteBy": "Count Dooku", "notes": "Aristocratic world with old money and Separatist leadership; its estates funded galactic intrigue."}, {"name": "Mygeeto", "region": "Outer Rim", "sector": "\u2014", "grid": "R-6", "offset": [30, 40], "famous": "Ki-Adi-Mundi", "routes": [], "quote": "Hold the line!", "quoteBy": "Ki\u2011Adi\u2011Mundi", "notes": "Icy banking world and battlefield of Order 66 where Master Mundi fell."}]};
const canvas = document.getElementById('map');
const ctx = canvas.getContext('2d', {alpha:false});
let DPR = Math.max(1, window.devicePixelRatio||1); let W=0,H=0;
const overlay = document.getElementById('overlay'); const ovText=document.getElementById('ovText');

// Grid & world
const GRID = { cols:18, rows:21, letters:'CDEFGHIJKLMNOPQRSTU'.split('') };
const BOUNDS = { minX:-360, maxX:360, minY:-320, maxY:320 };

// dynamic camera min scale so whole galaxy fits but not too small
let MIN_SCALE = 0.45; // updated in resize()
const state = { cx:-20, cy:-8, scale:4.6, hover:null, sel:null, planets:[], routes:[], sectorShapes:[], selectedRoute:null, ready:false };

// palettes
const SECTOR = {
  'Deep Core':'rgba(255,255,255,.55)',
  'Core':'rgba(255,230,120,.48)',
  'Colonies':'rgba(255,160,80,.38)',
  'Inner Rim':'rgba(255,150,230,.34)',
  'Expansion Region':'rgba(160,255,220,.28)',
  'Mid Rim':'rgba(130,210,255,.24)',
  'Outer Rim':'rgba(120,180,255,.20)',
  'Unknown Regions':'rgba(226,160,255,.28)'
};
const LABEL = {
  'Deep Core':'#ffffff','Core':'#ffe4a6','Colonies':'#ffbf96','Inner Rim':'#ffc8eb','Expansion Region':'#d8ffea',
  'Mid Rim':'#c8eaff','Outer Rim':'#f6dcc6','Unknown Regions':'#ecd0ff', default:'#eaf3ff'
};

function resize(){
  const r = canvas.getBoundingClientRect();
  canvas.width = Math.floor(r.width*DPR); canvas.height = Math.floor(r.height*DPR);
  ctx.setTransform(DPR,0,0,DPR,0,0); W=r.width; H=r.height;
  // compute min scale to fit bounds snugly
  const sx = W / (BOUNDS.maxX-BOUNDS.minX);
  const sy = H / (BOUNDS.maxY-BOUNDS.minY);
  MIN_SCALE = Math.min(sx, sy)*0.92;
  if(state.ready) render();
}
window.addEventListener('resize', resize);

// world/screen helpers
function w2s(x,y){ return [(x-state.cx)*state.scale + W/2, (y-state.cy)*state.scale + H/2]; }
function s2w(x,y){ return [(x - W/2)/state.scale + state.cx, (y - H/2)/state.scale + state.cy]; }
function clamp(v,a,b){ return Math.max(a, Math.min(b,v)); }

function safeRender(stepFn){
  try{ stepFn(); } catch(err){ console.error(err); overlay.classList.add('error'); ovText.textContent = 'Render error — check console'; }
}

function render(){
  overlay.classList.remove('error'); ovText.textContent = '';
  // draw order
  safeRender(drawBackground);
  safeRender(drawSectorsWorld);
  safeRender(drawSpiralArms);
  safeRender(drawRoutes);
  safeRender(drawPlanets);
  safeRender(drawLabels);
  safeRender(drawGridScreen);
}

function drawBackground(){
  ctx.clearRect(0,0,W,H);
  const g = ctx.createRadialGradient(W*.6,H*.35,10,W*.5,H*.5,Math.max(W,H)*.95);
  g.addColorStop(0,'rgba(22,48,120,.72)'); g.addColorStop(1,'rgba(0,0,0,.95)');
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  // starfield
  const rng = mulberry32(2025);
  for(let i=0;i<620;i++){
    const x=rng()*W, y=rng()*H, r=Math.max(.3,rng()*1.6);
    ctx.globalAlpha=.35+rng()*.6; ctx.fillStyle='#eaf3ff'; ctx.beginPath(); ctx.arc(x,y,r,0,6.283); ctx.fill();
    if (rng()>.9){ ctx.globalAlpha=.28; ctx.beginPath(); ctx.moveTo(x-5,y); ctx.lineTo(x+5,y); ctx.strokeStyle='rgba(190,220,255,.35)'; ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(x,y-5); ctx.lineTo(x,y+5); ctx.stroke(); }
  }
  ctx.globalAlpha=1;
  // scanlines
  ctx.globalAlpha=.05; ctx.fillStyle='#000'; for(let y=0;y<H;y+=3){ ctx.fillRect(0,y,W,1); } ctx.globalAlpha=1;
}

// ===== Sector shapes in world coordinates, irregular =====
function buildSectors(){
  const cx=-20, cy=0;
  const bScale = (t)=> (1 + 0.06*Math.sin(t*2) - 0.03*Math.cos(t*3));
  const mk = (base, bumps)=> (t)=>{
    let r=base;
    for(const b of bumps){
      const dt = Math.atan2(Math.sin(t-b.a), Math.cos(t-b.a));
      r += b.h * Math.exp(-(dt*dt)/(2*b.w*b.w));
    }
    return r * bScale(t);
  };
  const deep = mk(60,  [{a:0.5,h:6,w:.9},{a:3.6,h:4,w:.7}]);
  const core = mk(102, [{a:0.2,h:18,w:.8},{a:2.7,h:10,w:.9},{a:4.7,h:8,w:.7}]);
  const colonies = mk(142,[{a:.1,h:24,w:.9},{a:2.4,h:16,w:1.0},{a:5.0,h:10,w:.8}]);
  const inner = mk(178, [{a:0.0,h:28,w:.9},{a:2.2,h:22,w:1.1},{a:5.1,h:12,w:.8}]);
  const exp = mk(216,   [{a:-.2,h:30,w:1.0},{a:2.1,h:24,w:1.1},{a:4.9,h:14,w:.9}]);
  const mid = mk(258,   [{a:-.4,h:36,w:1.0},{a:1.9,h:28,w:1.2},{a:4.7,h:18,w:1.0}]);
  const outer = mk(322, [{a:-.6,h:44,w:1.2},{a:1.8,h:36,w:1.2},{a:4.6,h:26,w:1.2}]);

  const blob=(fn,sx,sy,steps=200)=>{
    const pts=[];
    for(let i=0;i<=steps;i++){
      const t=i/steps*Math.PI*2;
      const r = fn(t);
      const x=cx+Math.cos(t)*r*sx, y=cy+Math.sin(t)*r*.88*sy;
      pts.push([x,y]);
    }
    return pts;
  };

  state.sectorShapes = [
    {name:'Deep Core', fill:SECTOR['Deep Core'], pts:blob(deep,.86,.78)},
    {name:'Core', fill:SECTOR['Core'], pts:blob(core,.94,.88)},
    {name:'Colonies', fill:SECTOR['Colonies'], pts:blob(colonies,1.01,.96)},
    {name:'Inner Rim', fill:SECTOR['Inner Rim'], pts:blob(inner,1.05,1.00)},
    {name:'Expansion Region', fill:SECTOR['Expansion Region'], pts:blob(exp,1.09,1.05)},
    {name:'Mid Rim', fill:SECTOR['Mid Rim'], pts:blob(mid,1.14,1.08)},
    {name:'Outer Rim', fill:SECTOR['Outer Rim'], pts:blob(outer,1.22,1.13)}
  ];

  // Unknown Regions
  const UR=[]; const steps=140;
  for(let i=0;i<=steps;i++){
    const t = -Math.PI*0.86 + (i/steps)*Math.PI*1.42; // left arc
    const r = outer(t)*1.04;
    const x=cx+Math.cos(t)*r*1.02, y=cy+Math.sin(t)*r*.90;
    UR.push([x,y]);
  }
  UR.push([BOUNDS.minX, BOUNDS.maxY]);
  UR.push([BOUNDS.minX, BOUNDS.minY]);
  state.sectorShapes.push({name:'Unknown Regions', fill:SECTOR['Unknown Regions'], pts:UR});
}

function drawSectorsWorld(){
  if(!state.sectorShapes.length) buildSectors();
  for(const s of state.sectorShapes){
    ctx.save(); ctx.fillStyle=s.fill; ctx.beginPath();
    s.pts.forEach((p,i)=>{ const [x,y]=w2s(p[0],p[1]); if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); });
    ctx.closePath(); ctx.fill(); ctx.restore();
  }
  // labels
  const labels=[
    ['DEEP CORE', -20, -8], ['CORE', -10, 10], ['COLONIES', 10, 36], ['INNER RIM', 30, 70],
    ['EXPANSION', 58, 108], ['MID RIM', 92, 142], ['OUTER RIM', 142, 182]
  ];
  for(const L of labels){ const [sx,sy]=w2s(L[1],L[2]); textGlow(L[0], sx, sy, 14); }
  textGlow('UNKNOWN REGIONS', 30, H*.45, 18);
}
// =============================================

function drawSpiralArms(){
  ctx.save(); ctx.globalCompositeOperation='lighter';
  const arms=[{cx:W*.44,cy:H*.66,a:-.7,r:W*.58},{cx:W*.72,cy:H*.36,a:2.3,r:W*.66}];
  for(const arm of arms){
    const segs=900; ctx.beginPath();
    for(let i=0;i<segs;i++){ const t=i/segs*6.283, r=arm.r*(.22+.62*i/segs);
      const x=arm.cx + Math.cos(t+arm.a)*r*0.02*i/segs; const y=arm.cy + Math.sin(t+arm.a)*r*0.02*i/segs;
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); }
    ctx.strokeStyle='rgba(120,180,255,.06)'; ctx.lineWidth=42; ctx.stroke();
  }
  ctx.restore();
}

// --- ROUTES ---
function drawRoutes(){
  const bar=document.getElementById('routesBar');
  if(bar.dataset.count !== String(state.routes.length)){
    bar.dataset.count = String(state.routes.length);
    bar.innerHTML='';
    state.routes.forEach((r,i)=>{
      const btn=document.createElement('button'); btn.className='routeTag'; btn.textContent=r.name; btn.style.color=r.color;
      btn.addEventListener('click',()=>{ state.selectedRoute = (state.selectedRoute===i?null:i); render(); });
      bar.appendChild(btn);
    });
  }
  const btns=[...document.querySelectorAll('#routesBar .routeTag')];
  btns.forEach((b,i)=> b.classList.toggle('active', state.selectedRoute===i));

  ctx.save(); ctx.lineCap='round'; ctx.globalCompositeOperation='lighter';
  state.routes.forEach((r,idx)=>{
    if(!r.points || r.points.length<4) return;
    const isSel = state.selectedRoute===idx;
    ctx.shadowBlur=isSel?18:10; ctx.shadowColor=r.color; ctx.strokeStyle=r.color; ctx.lineWidth=isSel?5:3;
    ctx.beginPath();
    const pts = r.points.map(p=>w2s(p[0],p[1]));
    ctx.moveTo(pts[0][0],pts[0][1]);
    for(let i=1;i<pts.length;i+=3){
      const a=pts[i], b=pts[i+1], c=pts[i+2]; if(!c) break;
      ctx.bezierCurveTo(a[0],a[1],b[0],b[1],c[0],c[1]);
    }
    ctx.stroke();

    // Label: sample along the path to get a midpoint in view
    const mid = approxMidpoint(pts);
    if(mid) textGlow(r.name, mid[0]+6, mid[1]-6, 12);
  });
  ctx.restore();
}
function approxMidpoint(pts){
  if(!pts||pts.length<2) return null;
  const m = Math.floor(pts.length/2);
  return pts[m];
}

// --- PLANETS ---
function drawPlanets(){
  for(const p of state.planets){
    const [sx,sy]=w2s(p.x,p.y);
    if (sx<-80||sy<-80||sx>W+80||sy>H+80) continue;
    const r=5;
    ctx.beginPath(); const col=LABEL[p.region]||LABEL.default; ctx.fillStyle=col; ctx.shadowColor=col; ctx.shadowBlur=8;
    ctx.arc(sx,sy,r,0,6.283); ctx.fill(); ctx.shadowBlur=0;
    if (state.sel===p.id){ ctx.beginPath(); ctx.strokeStyle='#ffd76a'; ctx.lineWidth=2; ctx.arc(sx,sy,r+6,0,6.283); ctx.stroke(); }
    else if (state.hover===p.id){ ctx.beginPath(); ctx.strokeStyle='#67c8ff'; ctx.lineWidth=1; ctx.arc(sx,sy,r+4,0,6.283); ctx.stroke(); }
  }
}

function drawLabels(){
  ctx.save(); ctx.font='12px system-ui, -apple-system, Segoe UI, Roboto, Arial'; ctx.textBaseline='top';
  for(const p of state.planets){
    const [sx,sy]=w2s(p.x,p.y);
    if (sx<-80||sy<-80||sx>W+80||sy>H+80) continue;
    if (state.scale < 1.2 && !p.featured) continue;
    const dx=8, dy=-2; const txt=p.name;
    ctx.lineWidth=4; ctx.strokeStyle='rgba(8,16,36,.96)'; ctx.strokeText(txt,sx+dx,sy+dy);
    ctx.fillStyle = LABEL[p.region]||LABEL.default; ctx.fillText(txt,sx+dx,sy+dy);
  }
  ctx.restore();
}

// Grid overlay with dynamic labels
function drawGridScreen(){
  const overlay = document.getElementById('gridOverlay');
  const [wminx,wminy]=s2w(0,0); const [wmaxx,wmaxy]=s2w(W,H);
  const colStart = Math.max(0, Math.floor((wminx-BOUNDS.minX)/(BOUNDS.maxX-BOUNDS.minX)*GRID.cols));
  const colEnd   = Math.min(GRID.cols-1, Math.floor((wmaxx-BOUNDS.minX)/(BOUNDS.maxX-BOUNDS.minX)*GRID.cols));
  const rowStart = Math.max(0, Math.floor((wminy-BOUNDS.minY)/(BOUNDS.maxY-BOUNDS.minY)*GRID.rows));
  const rowEnd   = Math.min(GRID.rows-1, Math.floor((wmaxy-BOUNDS.minY)/(BOUNDS.maxY-BOUNDS.minY)*GRID.rows));
  const letters = GRID.letters.slice(colStart, colEnd+1);
  const nums = Array.from({length: rowEnd-rowStart+1}, (_,i)=>i+rowStart+1);
  overlay.innerHTML = `
    <div class="top labels">${letters.map(l=>`<span>${l}</span>`).join('')}</div>
    <div class="bottom labels">${letters.map(l=>`<span>${l}</span>`).join('')}</div>
    <div class="left numbers">${nums.map(n=>`<span>${n}</span>`).join('')}</div>
    <div class="right numbers">${nums.map(n=>`<span>${n}</span>`).join('')}</div>
  `;
  overlay.style.setProperty('--cols', letters.length);
  overlay.style.setProperty('--rows', nums.length);
}
const overlayCSS = document.createElement('style');
overlayCSS.textContent = `
#gridOverlay{position:absolute;inset:0;pointer-events:none;--cols:18;--rows:21}
#gridOverlay .labels{position:absolute;left:0;right:0;display:grid;grid-template-columns:repeat(var(--cols),1fr);gap:0;color:#dceaff;font-size:12px;padding:6px}
#gridOverlay .top{top:0} #gridOverlay .bottom{bottom:0}
#gridOverlay .numbers{position:absolute;top:0;bottom:0;display:grid;grid-template-rows:repeat(var(--rows),1fr);gap:0;color:#dceaff;font-size:12px;align-content:space-between;justify-items:center;padding:6px}
#gridOverlay .left{left:0} #gridOverlay .right{right:0}
`;
document.head.appendChild(overlayCSS);

// Text glow helper
function textGlow(txt, x, y, size){
  ctx.save();
  ctx.font = `700 ${size}px system-ui, -apple-system, Segoe UI, Roboto, Arial`;
  ctx.textBaseline='middle';
  ctx.shadowColor='rgba(170,210,255,.45)'; ctx.shadowBlur=12;
  ctx.fillStyle='rgba(200,230,255,.35)';
  ctx.fillText(txt,x,y);
  ctx.shadowBlur=0;
  ctx.restore();
}

// Interaction
let dragging=false,lx=0,ly=0;
canvas.addEventListener('mousedown',e=>{ dragging=true; lx=e.clientX; ly=e.clientY; });
window.addEventListener('mouseup',()=>dragging=false);
window.addEventListener('mousemove',e=>{
  if(dragging){ const dx=e.clientX-lx, dy=e.clientY-ly; lx=e.clientX; ly=e.clientY; state.cx-=dx/state.scale; state.cy-=dy/state.scale; render(); }
  else { const rect=canvas.getBoundingClientRect(); const id=pick(e.clientX-rect.left,e.clientY-rect.top); if(id!==state.hover){ state.hover=id; render(); } }
});
canvas.addEventListener('wheel',e=>{
  e.preventDefault();
  const rect=canvas.getBoundingClientRect(); const f = Math.pow(1.05, -Math.sign(e.deltaY)); // fine steps
  zoomAt(e.clientX-rect.left, e.clientY-rect.top, f);
},{passive:false});
canvas.addEventListener('click',e=>{
  const rect=canvas.getBoundingClientRect();
  const mx=e.clientX-rect.left, my=e.clientY-rect.top;
  const id=pick(mx,my); if(id!=null) selectPlanet(id);
});

// touch
let touch=null;
canvas.addEventListener('touchstart',e=>{
  if(e.touches.length===1){ const t=e.touches[0]; touch={mode:'pan',x=t.clientX,y=t.clientY,t:Date.now()}; }
  else if(e.touches.length===2){ const [a,b]=e.touches; touch={mode:'pinch',d:dist(a,b),anchor:mid(a,b)}; }
},{passive:true});
canvas.addEventListener('touchmove',e=>{
  if(!touch) return;
  if(touch.mode==='pan' && e.touches.length===1){ const t=e.touches[0]; state.cx-=(t.clientX-touch.x)/state.scale; state.cy-=(t.clientY-touch.y)/state.scale; touch.x=t.clientX; touch.y=t.clientY; render(); }
  else if(touch.mode==='pinch' && e.touches.length===2){ const [a,b]=e.touches; const d=dist(a,b); const f=d/(touch.d||d); const rect=canvas.getBoundingClientRect(); const anc=touch.anchor||mid(a,b); zoomAt(anc.x-rect.left, anc.y-rect.top, f); touch.d=d; }
},{passive:true});
canvas.addEventListener('touchend',e=>{ if(e.touches.length===0) touch=null; },{passive:true});

function zoomAt(mx,my,f){
  const [wx,wy]=s2w(mx,my);
  state.scale*=f; state.scale = clamp(state.scale, MIN_SCALE, 5.6);
  const [wx2,wy2]=s2w(mx,my); state.cx += (wx-wx2); state.cy += (wy-wy2);
  render();
}

function pick(mx,my){
  let id=null,best=14;
  for(const p of state.planets){ const [sx,sy]=w2s(p.x,p.y); const d=Math.hypot(mx-sx,my-sy); if(d<best){best=d; id=p.id;} }
  return id;
}

function selectPlanet(id){
  state.sel=id;
  const p = state.planets.find(q=>q.id===id); if(!p) return;
  const dlg=document.getElementById('details');
  document.getElementById('dName').textContent=p.name;
  document.getElementById('dRegionTag').textContent=p.region||'REGION';
  document.getElementById('dRegionTag').style.borderColor = LABEL[p.region]||'#88a';
  document.getElementById('dRegionTag').style.color = LABEL[p.region]||'#cde';
  document.getElementById('dGrid').textContent=p.grid||'—';
  document.getElementById('dFamous').textContent = p.famous || '';
  document.getElementById('dQuote').textContent = p.quoteBy ? `“${p.quote}” — ${p.quoteBy}` : (p.quote?`“${p.quote}”`:'');
  document.getElementById('dNotes').textContent = p.notes||'';
  const ul=document.getElementById('dRoutes'); ul.innerHTML=''; (p.routes||[]).forEach(r=>{
    const li=document.createElement('li');
    const a=document.createElement('a'); a.href="#"; a.textContent=r; a.addEventListener('click',(ev)=>{ev.preventDefault(); focusRouteByName(r);});
    li.appendChild(a); ul.appendChild(li);
  });
  if (typeof dlg.showModal==='function') dlg.showModal();
  render();
}

// UI
document.getElementById('reset').addEventListener('click',()=>{ state.cx=-20; state.cy=-8; state.scale=4.6; state.selectedRoute=null; render(); });
document.getElementById('togglePanel').addEventListener('click',()=>{ document.getElementById('panel').hidden=!document.getElementById('panel').hidden; });
document.getElementById('closePanel').addEventListener('click',()=>{ document.getElementById('panel').hidden=true; });
document.getElementById('regionFilter').addEventListener('change', (e)=>{
  const v=e.target.value; if(!v){ state.selectedRoute=null; render(); return; }
  focusSector(v);
});
const searchEl=document.getElementById('search'); searchEl.addEventListener('input', refreshList);

function refreshList(){
  const q=(searchEl.value||'').toLowerCase(); const list=document.getElementById('list'); list.innerHTML='';
  state.planets.filter(p=>(!q||p.name.toLowerCase().includes(q))).sort((a,b)=>a.name.localeCompare(b.name)).forEach(p=>{
    const li=document.createElement('li'); li.innerHTML=`<span>${p.name}</span><small>${p.region||''}</small>`;
    li.addEventListener('click',()=>{ flyTo(p.x,p.y,3.0); selectPlanet(p.id); }); list.appendChild(li);
  });
}

// flyTo helper
function flyTo(x,y,s){
  const steps=22; const start={cx:state.cx,cy:state.cy,scale:state.scale}; const end={cx:x,cy:y,scale:Math.max(MIN_SCALE, Math.min(5.4, s||state.scale))};
  let t=0; const step=()=>{ t++; const k=1-Math.pow(1-t/steps,3); state.cx=start.cx+(end.cx-start.cx)*k; state.cy=start.cy+(end.cy-start.cy)*k; state.scale=start.scale+(end.scale-start.scale)*k; render(); if(t<steps) requestAnimationFrame(step); }; step();
}

// Sector focus by name
function focusSector(name){
  const s = state.sectorShapes.find(s=>s.name===name); if(!s) return;
  let minx=Infinity,miny=Infinity,maxx=-Infinity,maxy=-Infinity;
  s.pts.forEach(([x,y])=>{ if(x<minx)minx=x; if(y<miny)miny=y; if(x>maxx)maxx=x; if(y>maxy)maxy=y; });
  const cx=(minx+maxx)/2, cy=(miny+maxy)/2;
  const sx = (W*0.6)/(maxx-minx), sy = (H*0.6)/(maxy-miny);
  const sc = Math.min(5.4, Math.max(MIN_SCALE, Math.min(sx,sy)));
  flyTo(cx,cy,sc);
}

// Route helpers
function findXY(planets, name){ const p=planets.find(q=>q.name===name); return p?[p.x,p.y]:[0,0]; }
function buildRoutes(planets){
  const routes=[];
  const C=findXY(planets,'Corellia'), T=findXY(planets,'Tatooine'), G=findXY(planets,'Geonosis'), R=findXY(planets,'Ryloth');
  routes.push({ name:'Corellian Run', color:'rgba(255,200,120,.75)',
    points:[ C,[C[0]+60,C[1]-40],[T[0]-40,T[1]-10],T, [T[0]+40,T[1]+10],[G[0]+60,G[1]],G, [G[0]+40,G[1]+20],[R[0]+40,R[1]+10],R ] });
  const E=findXY(planets,'Eriadu'), Cor=findXY(planets,'Coruscant');
  routes.push({ name:'Hydian Way', color:'rgba(160,220,255,.8)', points:[ E,[E[0]+40,E[1]-40],[Cor[0]-60,Cor[1]+10],Cor ] });
  const B=findXY(planets,'Brentaal'), D=findXY(planets,'Dantooine');
  routes.push({ name:'Perlemian Trade Route', color:'rgba(255,140,210,.8)',
    points:[ B,[B[0]-40,B[1]+10],[Cor[0]+20,Cor[1]-20],Cor, [Cor[0]+80,Cor[1]-20],[D[0]+40,D[1]-10],D ] });
  const Bes=findXY(planets,'Bespin'), Ho=findXY(planets,'Hoth');
  routes.push({ name:'Rimma Trade Route', color:'rgba(120,255,200,.8)',
    points:[ E,[E[0]+20,E[1]+40],[Bes[0]-10,Bes[1]-10],Bes, [Bes[0]-10,Bes[1]-10],[Ho[0]+20,Ho[1]],Ho ] });
  return routes;
}
function focusRouteByName(name){
  const idx = state.routes.findIndex(r=>r.name===name); if(idx<0) return;
  state.selectedRoute = idx;
  const r=state.routes[idx];
  let minx=Infinity,miny=Infinity,maxx=-Infinity,maxy=-Infinity;
  r.points.forEach(([x,y])=>{ if(x<minx)minx=x; if(y<miny)miny=y; if(x>maxx)maxx=x; if(y>maxy)maxy=y; });
  const cx=(minx+maxx)/2, cy=(miny+maxy)/2;
  const sx = (W*0.7)/(maxx-minx), sy=(H*0.7)/(maxy-miny);
  flyTo(cx,cy,Math.min(5.2,Math.max(MIN_SCALE,Math.min(sx,sy))));
  render();
}

// utils
function dist(a,b){ const dx=a.clientX-b.clientX, dy=a.clientY-b.clientY; return Math.hypot(dx,dy); }
function mid(a,b){ return {x:(a.clientX+b.clientX)/2, y:(a.clientY+b.clientY)/2}; }
function mulberry32(a){ return function(){ let t=a+=0x6D2B79F5; t=Math.imul(t^t>>>15,t|1); t^=t+Math.imul(t^t>>>7,t|61); return ((t^t>>>14)>>>0)/4294967296; } }

function gridToWorld(grid){
  if(!grid) return [0,0];
  const [letter,rowStr] = grid.split('-'); const row=parseInt(rowStr,10);
  const col = GRID.letters.indexOf(letter.toUpperCase()); if(col<0||!row) return [0,0];
  const x = BOUNDS.minX + (col+0.5)/GRID.cols*(BOUNDS.maxX-BOUNDS.minX);
  const y = BOUNDS.minY + (row-0.5)/GRID.rows*(BOUNDS.maxY-BOUNDS.minY);
  return [x,y];
}


// --- immediate visual: build sectors and render a base scene so zoom/pan always work ---
buildSectors();
resize();
state.ready = true; // allow render (planets may be empty until data loads)
render();
ovText.textContent = 'Loading planets…';

// ---- INIT & LOADING ----
function initAfterData(){
  let id=1;
  for(const p of state.planets){
    const [gx,gy]=gridToWorld(p.grid||'M-11');
    const ox=(p.offset&&p.offset[0])||0, oy=(p.offset&&p.offset[1])||0;
    p.x=gx+ox; p.y=gy+oy; p.id=id++;
  }
  state.routes=buildRoutes(state.planets);
  buildSectors();
  resize();
  refreshList();
  state.ready=true;
  render();
}


// Resolve planets.json path robustly
const guessPaths = (()=>{
  const paths = [];
  const base = location.origin + location.pathname.replace(/[^\/]*$/, ''); // folder of index.html
  paths.push(base + 'planets.json');        // same folder
  paths.push('planets.json');               // relative
  // If hosted at GitHub Pages subpath, ensure there's a slash after repo name
  return paths;
})();


(async function loadPlanets(){
  let data=null, lastErr=null;
  const url = 'planets.v6.json?v=6';
  try{
    const res = await fetch(url, {cache:'no-cache'});
    if(res.ok){ data = await res.json(); }
    else { lastErr = new Error('HTTP '+res.status); }
  }catch(e){ lastErr = e; }
  if(!data){
    console.warn('Falling back to embedded planet data due to load error:', lastErr);
    data = FALLBACK_PLANETS;
  }
  state.planets = data.planets || [];
  initAfterData();
  overlay.style.display='none';
})();



// live coords readout
canvas.onmousemove = (e)=>{
  if(!state.ready) return;
  const rect = canvas.getBoundingClientRect(); const [wx,wy]=s2w(e.clientX-rect.left, e.clientY-rect.top);
  const col = Math.min(GRID.cols-1, Math.max(0, Math.floor((wx-BOUNDS.minX)/(BOUNDS.maxX-BOUNDS.minX)*GRID.cols)));
  const row = Math.min(GRID.rows-1, Math.max(0, Math.floor((wy-BOUNDS.minY)/(BOUNDS.maxY-BOUNDS.minY)*GRID.rows)));
  document.getElementById('coords').textContent = `${GRID.letters[col]}-${row+1}`;
};
