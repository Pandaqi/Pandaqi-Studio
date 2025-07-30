// mapping planet to order/difficulty
const PLANET_MAP = 
{
	learnth: 0,
	uronus: 1,
	marsh: 2,
	yumpiter: 3, 
	meercury: 4, 
	intervenus: 5, 
	pluto: 6,
	naptune: 7
}

// combos/sets of planets that work well together, following a similar theme
const PLANET_SETS = {
	nature: ["marsh", "pluto"],
	leadership: ["uronus", "intervenus"],
	resources: ["yumpiter", "meercury"],
	entertainment: ["yumpiter", "pluto", "naptune"],
	chaotic: ["uronus", "marsh", "yumpiter", "meercury", "intervenus", "pluto", "naptune"],
}

// all component types (plus their probability of appearing and first planet)
const COMPONENTS = 
{
	path: { prob: 5.5 },
	buildings: { prob: 8 },
	effects: { prob: 3 },
	people: { prob: 3 },
	resource: { prob: 6.5, planet: "meercury", planetLocked: true },
}

// all people types
const PEOPLE =
{
	people: { prob: 0.5 },
	criminal: { prob: 1, planet: "intervenus", planetLocked: true },
	sick: { prob: 1, planet: "intervenus", planetLocked: true },
	educated: { prob: 0.25, planet: "intervenus", planetLocked: true },
	animal: { prob: 2, planet: "pluto", planetLocked: true }
}

// all resource types; only those that can have their resource grid extended have a probability > 0
const RESOURCES = 
{
	water: { prob: 5, planet: "marsh" },
	electricity: { prob: 5, planet: "meercury" },
	oxygen: { prob: 5, planet: "meercury" },
	gold: { prob: 0, planet: "meercury" },
	meercury: { prob: 0, planet: "meercury" },
}

// list of numbers - why? because different numbers have different probabilities of appearing
const NUMBERS = 
{
	1: { prob: 3 },
	2: { prob: 3 },
	3: { prob: 4 },
	4: { prob: 5 },
	5: { prob: 6 },
	6: { prob: 7 },
	7: { prob: 8 },
	8: { prob: 9 },
	9: { prob: 8 }, 
	10: { prob: 7 }, 
	11: { prob: 6 }, 
	12: { prob: 5 },
	13: { prob: 4 },
	14: { prob: 3 },
	15: { prob: 3 }
};

// list of events ( + description + probability + first planet to appear)
const EVENTS = 
{
	//
	// learnth
	//
	'Fierce Discussions':
		{
			desc: "The humans have only been here for a few days, and already they're arguing over who should be the boss! After careful consideration, it was decided that the person with the <em>longest hair</em> was obviously the boss. For this round only, they may pick one option, and ALL players must use it.",
			prob: 2
		},

	'Elections':
		{
			desc: "After a few weeks on our new home, people are already calling for elections. Apparantly, height is very important to the masses, because the <em>tallest player</em> becomes the boss. For this round only, they may pick one option, and ALL players must use it.",
			prob: 1.5,
		},

	'Accidental Portals':
		{
			desc: "After reckless experimentation with gamma particles, researchers have accidentally opened portals all over the planet. Unsuspecting citizens are stepping into the traps and falling to the other side of the galaxy!<br/><br/>Each player may travel to another planet for free. If there is only one planet in the game, each player loses one person in all buildings with more than two people.",
			prob: 2,
		},

	'Breath of Fresh Air':
		{
			desc: "The citizens have decided that they've had enough of the bare landscape and grey, smokey atmosphere. They want beautiful nature and fresh air! The player with the longest street may place a <em>garden</em> and <em>river</em>, anywhere they want, for free.",
			prob: 1.5,
		},

	'Outsourcing':
		{
			desc: "To help carry the load of building a city on a new planet, we've decided to outsource some of the work to alien workforces. Each player must execute ONE component (of the option they chose) on a planet they are NOT currently on.<br/><br/>(If you're only playing a single planet, each player must allow the player on their LEFT to decide how to exactly execute that one component.)",
			prob: 1,
		},

	'Carnival':
		{
			desc: "Today, like every galactic year, we celebrate carnival! Every player may, just for this round, assume any other player power.",
			prob: 2
		},

	'Too Much Luggage':
		{
			desc: "When leaving our home planet to explore the galaxy, we accidentally packed way too much stone into our luggage. All players may build a house for free.",
			prob: 1,
		},

	'A Wild Theory':
		{
			desc: "Some people have proposed that we can save more space if we just ... not build streets. We think it will lead to traffic chaos, but hey, we must give everything a shot. You may <em>not</em> place a path this round.",
			prob: 1
		},

	//
	// uronus
	//
	'Alien Attack':
		{
			desc: "Aliens attack our new planet! Each player must destroy one of their properties, <em>unless</em> you have a Laser Beam to protect yourself. (Cross it out; that space can never be used again.)",
			prob: 1,
			planet: "uronus"
		},

	'Aggressive Aliens':
		{
			desc: "Our ground detectors picked up a weird signal just outside the capital. It seems like some weird alien spaceship has tried to land here without being detected ... <br/><br/>All players must remove <em>one</em> person from each unique building, <em>unless</em> you have a Laser Beam to protect yourself.",
			prob: 2,
			planet: "uronus"
		},

	"Friendly Communications":
		{
			desc: "We've received an invitation from some aliens far far away! To support their claims of friendliness, they've sent us a gift basket: this round, each player may choose to write <em>any number</em> (instead of the given one) or <em>build a house</em> for free.",
			prob: 3, 
			planet: "uronus"
		},

	"Travel Interference":
		{
			desc: "Somebody is sending annoying signals that interfere with our spaceships. As such, no tourists will arrive this round.",
			prob: 2,
			planet: "uronus"
		},

	"Spaceship Innovation":
		{
			desc: "Our scientists just discovered a way to make our spaceships even faster! This round only, you may travel to another planet without requiring a fast travel station.",
			prob: 1,
			planet: "uronus"
		},

	//
	// marsh
	//
	'Death of a Star': 
		{
			desc: "A star from a far away galaxy has died in a fiery explosion! The sudden burst of heat kills one person in every building NOT connected to water!",
			prob: 1,
			planet: "marsh"
		},

	'Solar Flares':
		{
			desc: "Our sun has been throwing tantrums lately. Unexpected, prolonged heat waves are creating forest fires! Every park, garden and forest that is NOT connected to water is immediately destroyed!",
			prob: 2, 
			planet: "marsh"
		},

	'Perfect Summer':
		{
			desc: "The weather has been perfect for growing beautiful forests and flowers. As a result, every <em>Environment</em> building currently on the paper that is not water-related, gets +1 point. (Remember this by writing +1 in the cell.)",
			prob: 2,
			planet: "marsh"
		},

	'Tsunami':
		{
			desc: "Oh no, water levels have risen to unexpected extreme heights! Every player must choose one building of theirs that is connected to water. This building is destroyed.<br/><br/><em>However</em>, all residents got away safely and must now move to another building. (If there's no space to move someone, they are gone.)",
			prob: 2,
			planet: "marsh"
		},

	'Joyful Winter':
		{
			desc: "A harsh winter has caused all water to freeze over. But there's always an upside! Everyone has gathered around to start ice-skating! All entertainment buildings connected to water get +1 person, even if they are already at maximum capacity.",
			prob: 2,
			planet: "marsh"
		},

	'Quicksand':
		{
			desc: "During a recent exploration mission, a team of 5 researchers all ended up in a dangerous patch of quicksand! The only player who can rescue them, is the one who has the most <em>Environment</em> in their control. This person may now add all 5 researchers as people to their own buildings.",
			prob: 2,
			planet: "marsh"
		},

	'Groundhog Day':
		{
			desc: "Oh no, the world is stuck in a weird time loop! When this round ends, you must immediately repeat it. Moreover, everyone MUST execute the option that the player on their left chose in the previous round.",
			prob: 4,
			planet: "marsh"
		},

	//
	// yumpiter
	//
	'Fruit Feast!':
		{
			desc: "Our annual fruit feast has begun! Each orchard immediately becomes worth 1 more point. (Write +1 in the cell to remember this.)",
			prob: 2,
			planet: "yumpiter"
		},

	'Ice Cream Madness':
		{
			desc: "Due to an extremely hot summer, everybody is consuming ice cream by the bucket. Unfortunately, the ice cream was imported from an alien planet, which means our stomach is not equipped to handle it.<br/><br/>All food-buildings (Cafeteria, Restaurant, Alien Supermarket) immediately lose one person.",
			prob: 1,
			planet: "yumpiter"
		},

	'Plague':
		{
			desc: "Oh no, a plague of insects has descended upon our valuable crops! Each player must choose one Wheat or Paddy Field to become infected. They are disabled and do not count. To restore them, a new field must be built on top of it.<br/><br/>(To keep things clean, just write a small X-mark in the corner, which you erase once a new field has been built on top of it.)",
			prob: 1,
			planet: "yumpiter"
		},

	'Fertile Soil':
		{
			desc: "Researchers have discovered a new &mdash; and much better &mdash; way to grow food! Each player must choose one Wheat or Paddy field to enhance (by drawing a big fat plus sign). They now count as <em>two</em> fields.",
			prob: 1,
			planet: "yumpiter"
		},

	'Meat Craze':
		{
			desc: "Due to the influence of some opinionated famous figures, eating meat is suddenly all the craze! Nobody wants our bread and fruit anymore.<br/><br/>Close one Orchard or Bakery you own. To reopen it, you must skip a turn later in the game. (Simply write CLOSED in the corner of the cell, and cross it out once reopened.)",
			prob: 2,
			planet: "yumpiter"
		},

	'Sugar Addiction':
		{
			desc: "We have a problem. All Alien tourists coming to our planet, discover our substance <em>sugar</em> for the first time and become addicted to it! They are out of control!<br/><br/>If you own Alien Supermarkets, choose one, destroy another property of yours, and add 4 people to the chosen supermarket. If you do not own such a building, you may not add any people (for whatever reason) this round.",
			prob: 2,
			planet: "yumpiter"
		},

	'Charity':
		{
			desc: "Times are hard. People are losing jobs, losing money, and losing the possibility to eat a meal every day. Fortunately, we have some heroes in our midst: Food Banks!<br/><br/>The player(s) with the most food banks may immediately place 4 people. (If nobody has food banks, go stand in a corner and feel guilty.)",
			prob: 2,
			planet: "yumpiter"
		},

	//
	// meercury
	//

	'Pipeline Leak':
		{
			desc: "Each player chooses one edge in the resource grid. This edge has sprung a leak! All buildings adjacent to this edge now have their value reduced by 2. (Write -2 in the corner.)",
			prob: 2,
			planet: "meercury"
		},

	'Short Circuit':
		{
			desc: "Due to short circuiting, part of the electricity grid has caught on fire! Each player must choose one building of theirs next to an edge in the electricity grid. This building is now destroyed, permanently.",
			prob: 1,
			planet: "meercury"
		},

	'Discount Pipes':
		{
			desc: "A spaceship from a trader planet far away has brought us a bunch of resource lines at discounted price! How nice! Each player may extend any part of the resource grid (for one edge), any way they like, for free.",
			prob: 2,
			planet: "meercury"
		},

	'Cave Discovery':
		{
			desc: "The player with the most resource buildings, has funded an expedition and discovered a cave! They may now place a meercury cave anywhere they want. In case of a tie, use the regular challenging rules to determine who may place this cave.",
			prob: 1, 
			planet: "meercury"
		},

	'Gold Rush':
		{
			desc: "Suddenly, everyone thinks that gold will make them a billionaire! Which is ... kinda true, but still, I call it a gold rush! Each player may place a Gold Mine, but must pay for that by removing 2 people of their own.",
			prob: 1, 
			planet: "meercury"
		},

	'Eclipse':
		{
			desc: "A solar eclipse throws your planet into darkness, removing all our solar energy! This round, you may not do anything with electricity and electrically-powered buildings do not function.",
			prob: 2,
			planet: "meercury"
		},

	'The Energy Act':
		{
			desc: "The player who contributes LEAST to energy generation ( = count your buildings that generate electricity), gets a penalty. Write -5 points in one of your buildings. (In case of a tie, all those players suffer this penalty.)",
			prob: 2, 
			planet: "meercury"
		},

	'The Oxygen Act':
		{
			desc: "The player who contributes LEAST to oxygen generation ( = count buildings that generate oxygen), gets a penalty. Write -5 points in one of your buildings. (In case of a tie, all those players suffer this penalty.)",
			prob: 2,
			planet: "meercury"
		},

	'Spice of Life':
		{
			desc: "Recent research has confirmed, again and again, that water is the spice of life. As such, the government wants to reward everyone doing their part to keep the fluid flowing.<br/><br/>The player who has the MOST buildings connected to the water grid (either directly or through resource lines), may write +1 point in each of those buildings. In case of a tie, all those players get this reward.",
			prob: 1,
			planet: "meercury"
		},

	//
	// intervenus
	//

	// This planet relies a lot on events (to add/remove certain people from the board)
	// these make people sick
	'Fastfood Chain': 
		{
			desc: "An alien fastfood chain has recently settled on this planet, and now everyone has developed very bad food habits! Make one person sick in every building you own.",
			prob: 1,
			planet: "intervenus"
		},

	'Bad Air':
		{
			desc: "Researchers have just discovered that fresh air is better for your health than, well, any other type of air.<br/><br/>Make one person sick in each building adjacent to a Burned Building, Factory, Dumping Ground, Sewers, or Contaminated Water.",
			prob: 1,
			planet: "intervenus"
		},

	'Annoying Alarms':
		{
			desc: "An annoying alarm has been blaring non-stop for days now. Nobody knows where the sound comes from, but everybody is going insane and losing sleep.<br/><br/>The player with the most hospitals, gets no penalty. All other players must make three people sick.",
			prob: 2,
			planet: "intervenus"
		},

	'No Sports Protocol':
		{
			desc: "In a weird twist of events, our mad leader has made going outside and exercising illegal. While we're looking for a way to dispose of him, everyone is getting sicker everyday.<br/><br/>Find your building with the most healthy people in it; make all of those sick.",
			prob: 1,
			planet: "intervenus"
		},

	'Health Fund':
		{
			desc: "The government has, after years of painstaking research, finally concluded that health is quite important! The person with the most government buildings may place a Hospital, for free. (If tied, use the 'start player' rules.)",
			prob: 1,
			planet: "intervenus"
		},

	'A Black Sky':
		{
			desc: "All people in a building <em>adjacent</em> to a burning building, become sick.",
			prob: 3,
			planet: "intervenus"
		},

	// these start fires
	'Careless Youth':
		{
			desc: "A group of youngsters were spotted smoking in the forest, carelessly throwing their cigarettes on the ground, and setting the whole thing on fire. Each building next to an <em>Environment</em> cell is now on fire.",
			prob: 1,
			planet: "intervenus"
		},

	'Dry Summer':
		{
			desc: "Due to climate change, we're having an unusually hot and dry summer. Each player picks a building owned by the player on their <em>left</em>: it spontaneously catches fire!",
			prob: 2,
			planet: "intervenus"
		},

	'Problematic Party':
		{
			desc: "A party last night went out of control! Somebody accidentally bumped over the barbecue, burning their garden, and then burning the whole street.<br/><br/>The player with the most Fire Stations chooses one <em>street</em> and sets the whole thing on fire. (If tied, use the 'start player' rules.)",
			prob: 1,
			planet: "intervenus"
		},

	// these add criminals
	//
	'Grudge Gang':
		{
			desc: "As it turns out, some people are still mad about the government placing streets right in their backyard. They've decided to let out their anger in the wrong way.<br/><br/>Make one person a criminal in each building adjacent to a street you do NOT own yourself!",
			prob: 2,
			planet: "intervenus"
		},

	'Police Mole':
		{
			desc: "Oh no, the police has been compromised! A mole has been stealing information all this time! Add one criminal onto each police station.",
			prob: 1,
			planet: "intervenus"
		},

	'Poverty Plan':
		{
			desc: "Some people have had enough. The government keeps promising money, but poverty still controls their lives. Each building that is not connected to a bank or Gold Mine via a street, gets two criminals.",
			prob: 1,
			planet: "intervenus"
		},

	'Mysterious Mafia':
		{
			desc: "People have reported sightings of strange, unidentifiable alien mafia groups. They seem to have advanced technology that allows them to remain unspotted by police. <br/><br/>The player with the most police stations may place two criminals in a building of every other player, ignoring the safety of police stations. (If tied, use the 'start player' rules.)",
			prob: 2,
			planet: "intervenus"
		},

	'Lost Possessions':
		{
			desc: "All people in a house that's currently on fire, lose everything they own, and see no other path forward than to become criminals.",
			prob: 3,
			planet: "intervenus"
		},

	// these add educated people
	'Insightful Immigrants':
		{
			desc: "A group of highly educated aliens have arrived in our beautiful city, coming from the famous planet of Wisdombo, which lies next to the planet Common Sensor, eager to improve our quality of life.<br/><br/>The player with the most educated people may add 3 more.",
			prob: 1,
			planet: "intervenus"
		},

	"Final Exam":
		{
			desc: "The government has decided it's time for some real testing, instead of those easy exams at school! Each player that has fewer than 10 educated people, must either remove all of them, or add equally many criminals.",
			prob: 2,
			planet: "intervenus"
		},

	'Brain Drain':
		{
			desc: "While we were busy building our city and thinking we were so smart, other planets were actually building way more advanced technology. They are luring away all our smart people!<br/><br/>Each player must remove three educated people, except for the player who has the most Schools/Universities. (If tied, use the 'start player rules.)",
			prob: 2,
			planet: "intervenus"
		},

	//
	// pluto
	//
	'Loose Animals':
		{
			desc: "Oh no, due to the \"mad pig disease\", all animals have gone wild and are running loose! For every path adjacent to a building (that has animals), you lose one animal.",
			prob: 2,
			planet: "pluto"
		},

	'Creature Discovery':
		{
			desc: "A team of researchers has traveled all the way to the other side of the galaxy and discovered a new creature! More so, they discovered it was an endangered species, with only two left!<br/><br/>The player with the most animals may add two more. However, if these are ever lost (for whatever reason), they become -5 points each. (Write a note somewhere to remember this.)",
			prob: 1,
			planet: "pluto"
		},

	'Zoo Activists':
		{
			desc: "Protesters have gathered outside your zoos to protest the practice of locking up animals. You told them to do research on why zoos were created, but they do not listen.<br/><br/>Instead, you <em>lose</em> one person in each house connected to a zoo.",
			prob: 1,
			planet: "pluto"
		},

	'Animal Fences':
		{
			desc: "Finally, our researches cracked the code on how to build fences. (What took them so long, we do not know.)<br/><br/>Each player may build fences around one building. No animals can get in anymore, but also none can get out, whatever happens.",
			prob: 1,
			planet: "pluto"
		},

	'Rabbit Riots':
		{
			desc: "In what is already being described as the <em>rabbit riots</em>, people have stolen five thousand rabbits from unwilling pet shops. The need for pets seems to be at an all time high, ever since a paper was published saying pets help relieve stress and loneliness.<br/><br/>Anyway, all players may choose one building in which to place a pet.",
			prob: 1,
			planet: "pluto"
		},

	'Bird Plague':
		{
			desc: "Some people decided they needed to have some exotic birds in their zoo. They did not realize these birds could shoot lasers out of their eyes. All buildings next to a building with animals are now <em>on fire</em>",
			prob: 1,
			planet: "pluto"
		},

	'Talking Tigers':
		{
			desc: "In a recent exploratory mission, our astronauts discovered an unknown fact: tigers can actually talk and are highly intelligent. Unsure what to do with this news, the Government did what it always does in a panic: the player with the most Zoos or Animal Shelters gets a -2 penalty on each of the buildings.",
			prob: 1,
			planet: "pluto"
		},

	'Dinosaurs':
		{
			desc: "As it turns out, dinosaurs only went extinct on <em>our</em> planet. In fact, some aliens seem to have steered that meteorite directly towards us with their advanced technology, to defend themselves. Ah well, can't stay mad about that.<br/><br/>All players may place 1 dinosaur on Jungle, Zoo or Animal Shelter, provided it is completely empty. Dinosaurs are worth +6 points.",
			prob: 1,
			planet: "pluto"
		},

	//
	// naptune
	//

	'Midsummer Festival':
		{
			desc: "Aliens from all over the universe are coming to our planet for the famous midsummer festival! The player with the most entertainment buildings, may draw 4 aliens in any of their buildings.",
			prob: 1,
			planet: "naptune"
		},

	'Dance Party':
		{
			desc: "A groovy beat sounds through the city, everybody is tapping their feet, it's a dance party! Everybody is mingling with everybody else.<br/><br/>Either <em>remove a criminal from</em> or <em>add an animal to</em> the building of another player.",
			prob: 1,
			planet: "naptune"
		},

	'Rock Festival':
		{
			desc: "Everybody is stomping their feet to the greatest rock festival of the century! However, this planet wasn't really prepared for so much stomping ... so a minor earthquake is happening. All players pick one entertainment building and destroy it.",
			prob: 1, 
			planet: "naptune"
		},

	'Emotional Play':
		{
			desc: "After seeing an incredible play at the theatre, our mayor has decided to promote theaters all over the city! All theaters immediately get +1 person.",
			prob: 1,
			planet: "naptune"
		},

	'Alien Art':
		{
			desc: "An incredible art piece from a legendary intergalactic painter, has suddenly landed in our lap. The thing is worth millions of credits! Naturally, we want as many people to see it as possible.<br/><br/>The player with the most people (of any kind) gets the painting. Draw it in any empty cell &mdash; it does nothing in-game, but it is worth +6 points at the end.",
			prob: 1,
			planet: "naptune"
		},

	'Strong Lullabies':
		{
			desc: "Some upcoming artist invented a lullaby that is so soft and sweet, everybody fell asleep for <em>weeks</em>. As a result, aggressive aliens easily conquered our whole planet. Weirdly enough, they can only be persuaded to retreat via an interpretative dance.<br/><br/>All players must make up a dance move on the spot. The start player becomes the judge. The player with the most awesome move is the <em>only</em> one allowed to do something next turn.",
			prob: 1,
			planet: "naptune"
		},

}

// list of effects, plus their description and probability
const EFFECTS =
{
	//
	// learnth
	//
	'Landgrab':
		{
			desc: "Pick any empty, non-claimed cell. Write your symbol in a corner to signal it's yours! Nobody else can use the square, but you can place a building or path there at some point later in the game.",
			prob: 6,
			type: "effect"
		},

	'Painter': 
		{ 
			desc: "If your current option shows a number, raise or lower it by at most 2.", 
			prob: 2,
			type: "effect" 
		},

	'Double Sight': 
		{ 
			desc: "This turn only, you may write duplicate numbers in streets.", 
			prob: 1,
			type: "effect" 
		},

	'Happy Day':
		{
			desc: "This turn only, you <strong>don't</strong> have the <em>disadvantage</em> of your player power.",
			prob: 3,
			type: "effect"
		},

	'Sad Day':
		{
			desc: "This turn only, you <strong>can't</strong> use the <em>advantage</em> of your player power.",
			prob: 1,
			type: "effect"
		},

	'Teleport':
		{
			desc: "Teleport to another planet <em>when this round ends</em>.<br/><br/>You can only take turns on a single planet at once.<br/><br/>To remember this, sit close together if you're on the same planet, and write the number of your current planet on your starting square.",
			prob: 1,
			type: "effect"
		},

	//
	// uronus
	//
	'Rude Aliens':
		{
			desc: "Those darn hooligans are keeping away your customers! Remove one person (from any of your own properties).",
			prob: 3,
			type: "effect",
			planet: "uronus"
		},

	'Tourists':
		{
			desc: "Count how many space stations you own. Distribute that number of people over your entertainment buildings.",
			prob: 2,
			type: "effect", 
			planet: "uronus"
		},

	'Time Machine':
		{
			desc: "If an older planet exists which still has empty cells, take your action (for this round) there. You will NOT score points for this action, but it might help you later ...",
			prob: 1,
			type: "effect",
			planet: "uronus"
		},

	//
	// marsh
	//
	'Bulldozer':
		{
			desc: "Destroy one of your <em>Environment</em> cells.",
			prob: 1,
			type: "effect",
			planet: "marsh"
		},

	'Contaminated Water':
		{
			desc: "Contaminate a water cell <em>that you own</em>: draw a poison icon on it. At the end of each round, spread the contamination to a single adjacent cell. Each building connected to contaminated water gets a -1 point penalty.",
			prob: 1,
			type: "effect",
			planet: "marsh"
		},

	'Forest Gump':
		{
			desc: "When this round ends, pick one person that you placed <em>this round</em>. This person becomes <em>important</em> and is worth +4 points at the end of the game. (Draw something nice to remember this.)",
			prob: 2,
			type: "effect",
			planet: "marsh"
		},

	//
	// yumpiter
	//
	'Regulations':
		{
			desc: "The government has decided to heavily regulate your food. Add a -1 penalty to all your food-related buildings.",
			prob: 1,
			type: "effect",
			planet: "yumpiter"
		},

	'Food Shortage':
		{
			desc: "You <strong>can't</strong> add people (for whatever reason) this round.",
			prob: 2,
			type: "effect",
			planet: "yumpiter"
		},

	'Repetition':
		{
			desc: "Execute the component directly after this one <em>twice</em>.",
			prob: 2,
			type: "effect",
			minComponents: 2,
			planet: "yumpiter"
		},

	//
	// meercury
	//
	'Overhyped':
		{
			desc: "You think resources are overhyped. This round, you <strong>can't</strong> place any building that generates resources OR extend a resource grid.",
			prob: 2,
			type: "effect",
			planet: "meercury"
		},

	'Robbers':
		{
			desc: "Give a penalty to one of your buildings, equal to the number of Banks you own. If you don't own any, count your Gold Mines instead.",
			prob: 2,
			type: "effect",
			planet: "meercury"
		},

	'Resource Switch':
		{
			desc: "If your chosen option has a resource component, wap it for any other resource component (water, oxygen or electricity).",
			prob: 3,
			type: "effect",
			planet: "meercury"
		},

	//
	// intervenus
	//

	'Sugar':
		{
			desc: "Add a +2 bonus to any of your food-related buildings. However, also make two people sick.",
			prob: 2,
			type: "effect",
			planet: "intervenus"
		},

	'People Switch':
		{
			desc: "If your chosen option has a people component, swap it for any other person (regular, criminal, sick, educated).",
			prob: 2,
			type: "effect",
			planet: "intervenus"
		},

	'Water Hose':
		{
			desc: "Put out the fire in one burning building. (Once a burning has been on fire once, it can't be on fire again.)",
			prob: 2,
			type: "effect",
			planet: "intervenus"
		},

	'Special Agents':
		{
			desc: "Remove one criminal within range of a police station (cross them out). Then add a criminal to any other building.",
			prob: 2,
			type: "effect",
			planet: "intervenus"
		},

	'Moody Medicine':
		{
			desc: "You own an ODD number of hospitals? Add a healthy person on each. Otherwise, make someone sick in a building you own.",
			prob: 2,
			type: "effect",
			planet: "intervenus"
		},

	'Useless Subjects':
		{
			desc: "Someone started teaching useless subjects in your schools! Remove one educated person. Also, you <strong>can't</strong> add any educated people this round.",
			prob: 1.5, 
			type: "effect",
			planet: "intervenus"
		},

	'Magic Cure':
		{
			desc: "A scientist named B. Ogus proposes a magic cure, involving sacrificing three goats. It works for some people, but not others.<br><br/>If this option has 2 components, cure two sick people. Otherwise, all other players on your planet may sicken on of your healthy people (each).",
			prob: 1,
			type: "effect",
			planet: "intervenus"
		},

	//
	// pluto
	//

	'Paperwork':
		{
			desc: "A company offers you good money to cut your trees and turn them into paper. Destroy one of your forests or jungles. Write a +5 bonus somewhere else.",
			prob: 1,
			type: "effect",
			planet: "pluto"
		},

	'Animal Baby':
		{
			desc: "Two of your animals have secretly dated for months. They produced the cutest little animal you've ever seen! Add an animal on any space with 2+ animals.",
			prob: 1,
			type: "effect",
			planet: "pluto"
		},

	'Overcrowding':
		{
			desc: "Surprisingly, animals need free space to roam around and feel happy. Any building at maximum capacity (with respect to animals), loses half its inhabitants.",
			prob: 1,
			type: "effect",
			planet: "pluto"
		},

	'Fountain':
		{
			desc: "Draw a nice little fountain on any space to make all animals on that space immediately happy.",
			prob: 1,
			type: "effect",
			planet: "pluto",
		},

	'Creature Criminals':
		{
			desc: "Find a criminal sharing a space, or adjacent to, animals. They steal one animal (cross it out).",
			prob: 1,
			type: "effect",
			planet: "pluto"
		},

	'Waste Dump':
		{
			desc: "Your animals produce loads of poop, but where should it go?<br><br/>Find an existing path. Draw on it as many poop-shaped dots as you have animals. All buildings adjacent to this path are now devalued: they get a penalty of -(dots/2) points at the end of the game.",
			prob: 1,
			type: "effect",
			planet: "pluto"
		},

	'Pet':
		{
			desc: "You've decided to take a pet ... but it's wreaking havoc! Pick one house with a pet. (NOT a building with regular animals, like a Jungle.) This house is now on fire.",
			prob: 1,
			type: "effect",
			planet: "pluto"
		},

	//
	// naptune
	//
	'Sing':
		{
			desc: "You sing a song of peace and prosperity, and miraculously, everyone listens. Immediately execute all remaining components of your option (before the next player takes their turn).",
			prob: 1,
			type: "effect",
			planet: "naptune"
		},

	'Dance':
		{
			desc: "You invent a new dance move: the reverse shuffle. Go around the table in the reverse direction (from now on). Everyone executes their components bottom to top.",
			prob: 1,
			type: "effect",
			planet: "naptune"
		},

	'Act':
		{
			desc: "You pretend to be some important king from a far away planet, who is allowed to do powerful things, and everyone believes you.<br/><br/>Pick one component from another option and execute it immediately.",
			prob: 1,
			type: "effect",
			planet: "naptune"
		},

	'Sleep':
		{
			desc: "You've slept so long, you almost miss this whole round! You may only execute the <em>last</em> part of your option, at the end of the round, and nothing else.",
			prob: 1,
			type: "effect",
			planet: "naptune"
		},

	'Drunk':
		{
			desc: "Drunk, or simply confused, you ask another player to take all your actions for you (this round).",
			prob: 1,
			type: "effect",
			planet: "naptune"
		},

	'Beststeller':
		{
			desc: "You've written the first bestseller in the history of this new space colony! People are beginning to see you as their role model.<br/><br/>Whatever action you do next, all players repeat it after you (before continuing normally with the round).",
			prob: 1,
			type: "effect",
			planet: "naptune"
		},

	"Writer's Block":
		{
			desc: "You've tried to create amazing art for weeks now, but nothing came. Remove one person for each entertainment building you have.",
			prob: 1,
			type: "effect",
			planet: "naptune"
		},

	'Hostile Takeover':
		{
			desc: "Pick any building owned by another player. Draw your symbol on it: it's now yours. The player with the most police stations, however, is immune to takeover!",
			prob: 0.5,
			type: "effect",
			planet: "naptune"
		},
}

// list of buildings, plus their description and probability of appearing
const BUILDINGS = 
{
	//
	// learnth
	//
	'House': 
		{ 
			desc: "If connected to a path you own, you immediately get one person in the house.", 
			prob: 8,
			type: "building" 
		},

	'Hedge': 
		{ 
			desc: "Draw a solid line between any two spaces. These spaces are now disconnected: they are not considered \"adjacent\" anymore by the rules.", 
			prob: 4,
			type: "environment" 
		},

	'Roundabout': 
		{ 
			desc: "<em>Any</em> street may connect to the roundabout, no matter the number or other rules.", 
			prob: 2,
			type: "street"
		},

	"Oxygen Supply":
		{
			desc: "<em>All</em> buildings on the same row or column immediately receive +1 person.",
			prob: 7.5,
			type: "building"
		},

	'Garden':
		{
			desc: "Adds +1 point to adjacent buildings.",
			prob: 2,
			type: "environment"
		},

	'Cinema':
		{
			desc: "A cinema is worth +4 points <em>divided by</em> the number of cinemas in the same row and column, including itself.",
			prob: 2.5,
			type: "entertainment"
		},

	'Factory':
		{
			desc: "You <strong>can't</strong> place paths adjacent to a factory. (Nobody wants to live near the smelly factory!)",
			prob: 1.5,
			type: "government"
		},

	//
	// uronus
	//
	'Space Station':
		{
			desc: "After each round, move 1 tourist ( = a person of yours) from an old planet to the one you're currently playing. Cross out the old one, write the new person on this building.",
			prob: 4,
			type: "entertainment",
			planet: "uronus"
		},

	'Radio Station':
		{
			desc: "Radio stations allow you to communicate with previously played planets. At game end, choose ONE unique building from an older planet and add its points to your score.",
			prob: 2,
			type: "building",
			planet: "uronus"
		},

	'Fast Travel':
		{
			desc: "Convert a building of yours into a fast travel station. Any people on it are lost.<br/><br/>After each round, you <em>may</em> travel to another paper, to start building there instead.<br/><br/>(Number the planets so you can easily mark where you currently are.)",
			prob: 5,
			type: "building",
			planet: "uronus"
		},

	'Warehouse':
		{
			desc: "For each <em>planet</em> on which you've built a warehouse, your warehouses are worth +3 points. Only have warehouses on a single planet? They're all worth 0 points.",
			prob: 5,
			type: "building",
			planet: "uronus"
		},

	'Alien Hotel': 
		{ 
			desc: "Needs TWO adjacent squares. Draw as many aliens on the hotel as <em>Entertainment</em> buildings (no matter the owner) within a distance of three tiles.", 
			prob: 4,
			type: "entertainment",
			planet: "uronus"
		},

	'Runway':
		{
			desc: "Draw an arrow on this building pointing in any direction (north, east, south, west). The first two squares in that direction <strong>can't</strong> be used for buildings!",
			prob: 2,
			type: "building",
			planet: "uronus"
		},

	'Laser Beam':
		{
			desc: "The only way to protect yourself against certain (hostile) Alien events.",
			prob: 2,
			type: "government",
			planet: "uronus"
		},

	'Overtime': 
		{ 
			desc: "Place a path anywhere, with <em>any</em? number. Already placed a path this round? This new path must be adjacent to it.", 
			prob: 2,
			type: "street",
			planet: "uronus"
		},

	'Pool': 
		{ 
			desc: "Adds +X points to all adjacent buildings, where X is the total number of pools adjacent to that building.", 
			prob: 3,
			type: "environment",
			planet: "uronus"
		},

	'Trading Post': 
		{
			desc: "Worth as many points as there are other trading posts (no matter the owner) connected to it with a path. You must <em>own</em> that path completely.",
			prob: 3,
			type: "government",
			planet: "uronus"
		},

	//
	// marsh
	//
	'Villa':
		{
			desc: "Worth 2 points. While it has <strong>NO</strong> oxygen supply, however, it's worth -1 point and cannot contain people.",
			prob: 3,
			type: "building",
			planet: "marsh"
		},

	'Mansion':
		{
			desc: "Worth 5 points and can contain 10 people. If it's <strong>not</strong> connected to a pool and a garden, however, it's worth -2 points.",
			prob: 3,
			type: "building",
			planet: "marsh"
		},

	'Dock':
		{
			desc: "Must be build <em>on</em> water (a lake/river). Worth one point for every dock connected to it via water: any connected set of lakes/rivers.",
			prob: 2,
			type: "building",
			planet: "marsh"
		},

	'Lighthouse':
		{
			desc: "Adds +1 point to every <em>Entertainment</em> building connected to it over water.",
			prob: 2,
			type: "building",
			planet: "marsh"
		},

	'Lake':
		{
			desc: "Pick 1&ndash;3 adjacent squares, in any shape, and turn these into a lake. Only ONE player may choose this option per round!",
			prob: 2,
			type: "environment",
			planet: "marsh"
		},

	"River":
		{
			desc: "Rivers must be adjacent to existing rivers (if they exist). Adds +2 points to any adjacent <em>House</em>.",
			prob: 8,
			type: "environment",
			planet: "marsh"
		},

	'Park':
		{
			desc: "Draw a tree. Immediately add +1 person to any house connected with the park (via any path).",
			prob: 3,
			type: "environment",
			planet: "marsh"
		},

	'Rock': 
		{
			desc: "Does nothing. Just takes up space.",
			prob: 2,
			type: "environment",
			planet: "marsh"
		},

	'Swamp':
		{
			desc: "After each round, draw a dot on the swamp. Once you have three dots, the space can now be used for something else. But only by you!",
			prob: 2,
			type: "environment",
			planet: "marsh"
		},

	'Camping':
		{
			desc: "Add a person here&mdash;by drawing a tent&mdash;any time you place a new <em>Environment</em> cell. A camping can hold an unlimited number of people.",
			prob: 3,
			type: "entertainment",
			planet: "marsh"
		},

	'Nature Reserve':
		{
			desc: "Worth +1 point for every path connected to it that is NOT your own.",
			prob: 2,
			type: "entertainment",
			planet: "marsh"
		},

	"Tunnel":
		{
			desc: "Draw two ends of a tunnel, anywhere on the map. This connects two streets, ignoring all the other rules. (The street \"starts again\" at the other side of the tunnel.)",
			prob: 1,
			type: "street",
			planet: "marsh"
		},

	'Nature Lab': 
		{
			desc: "Worth +1 for each <em>Environment</em> cell around it. Worth -1 point for each <em>path</em> around it (horizontally, vertically and diagonally).",
			prob: 3,
			type: "government",
			planet: "marsh"
		},

	//
	// yumpiter
	//
	'Orchard':
		{
			desc: "Add +1 person to each building within a 2-tile radius. Additionally, their maximum capacity is raised by 2.",
			prob: 2,
			type: "environment",
			planet: "yumpiter"
		},

	'Wheat Field':
		{
			desc: "Must be used to make a <em>Farm</em> or <em>Bakery</em> more valuable.",
			prob: 6,
			type: "environment",
			planet: "yumpiter"
		},

	"Farm":
		{
			desc: "Worth +1 point for each <em>Wheat</em> or <em>Paddy Field</em> around it (horizontally, vertically or diagonally).",
			prob: 5,
			type: "building",
			planet: "yumpiter"
		},

	"Bakery":
		{
			desc: "Worth +1 point for each <em>Wheat</em> or <em>Paddy Field</em> in the same row or column.",
			prob: 4,
			type: "building",
			planet: "yumpiter"
		},

	'Restaurant':
		{
			desc: "Draw this an <em>existing</em> House with at most 3 people. All people are lost. For each person, however, build another house or extend a street with any number.",
			prob: 1,
			type: "entertainment",
			planet: "yumpiter"
		},

	"Cafetaria":
		{
			desc: "Worth +1 point for each person living in a 3-tile radius. But only if its connected with them through a path you exclusively own.",
			prob: 2,
			type: "entertainment",
			planet: "yumpiter"
		},

	'Paddy Field':
		{
			desc: "Can only be built on top of water.",
			prob: 5, 
			type: "building",
			planet: "yumpiter"
		},

	"Alien Supermarket":
		{
			desc: "Requires a <em>Farm</em> or <em>Bakery</em> (that you own) adjacent to it. After each round, place a person on this building! Its maximum capacity is 5 people <em>per</em> adjacent Farm/Bakery.",
			prob: 1, 
			type: "building",
			planet: "yumpiter"
		},

	"Food Bank":
		{
			desc: "Worth +2 points. Additionally, find the building furthest away from any food source, and add three people. (Tied? Pick a building from another player.)",
			prob: 2, 
			type: "government",
			planet: "yumpiter"
		},

	"Dustroads":
		{
			desc: "Place a path with number 1 <em>or</em> 15. Draw some trees on it. This cell is now <em>both</em> a path and an <em>Environment</em> cell!",
			prob: 3, 
			type: "street",
			planet: "yumpiter"
		},

	//
	// meercury
	//

	'Town Hall': 
		{ 
			desc: "Requires <strong>4</strong> spaces in a perfect square and must be connected to all resources (water, electricity and oxygen). May only be chosen ONCE per round.", 
			prob: 1,
			type: "government",
			planet: "meercury"
		},

	'Water Park':
		{
			desc: "Worth +4 points. Must be connected with the water and oxygen grid.",
			prob: 2,
			type: "entertainment",
			planet: "meercury"
		},

	'Greenhouse':
		{
			desc: "Must be connected with the water and oxygen grid. It counts as both an <em>Orchard</em> and a <em>Wheat Field</em>.",
			prob: 2,
			type: "environment",
			planet: "meercury"
		},

	'Nuclear Reactor':
		{
			desc: "Generates electricity. Worth 0 points, and no paths or buildings can be adjacent to it!",
			prob: 2,
			type: "building",
			planet: "meercury"
		},

	"Research Lab":
		{
			desc: "Must be connected with the electricity grid and placed on top of a meercury cave.<br/><br/>From now one, every round, swap one component from your option with the component of another option.",
			prob: 2,
			type: "building",
			planet: "meercury"
		},

	"Water Pump":
		{
			desc: "Generates electricity. Must be placed on water or connected to the water grid.",
			prob: 5,
			type: "building",
			planet: "meercury"
		},

	"Windmill":
		{
			desc: "Generates electricity.",
			prob: 5,
			type: "building",
			planet: "meercury"
		},

	"Gold Mine":
		{
			desc: "Needed for other buildings.",
			prob: 5,
			type: "environment",
			planet: "meercury"
		},

	'Bank':
		{
			desc: "Must be on top of a gold mine. Pick any House (you own) and write +3 points in the cell.",
			prob: 2,
			type: "government",
			planet: "meercury"
		},

	"Skyscraper": 
		{
			desc: "Worth +6 points. Requires <strong>3</strong> adjacent squares. Must be connected to the electricity grid, and one of its squares must be a gold mine.",
			prob: 1,
			type: "building",
			planet: "meercury"
		},

	"meercury Cave":
		{
			desc: "Provides the magical substance meercury. You're allowed to build on top of this building <em>once</em>. Buildings on a meercury cave are worth +4 points.",
			prob: 3,
			type: "building",
			planet: "meercury"
		},

	"Superstreet":
		{
			desc: "Place a path anywhere. Write a <em>range of numbers</em> (A&ndash;B) on it. This cell is all these numbers at once.",
			prob: 2,
			type: "street",
			planet: "meercury"
		},

	//
	// intervenus
	//

	'Police Station': 
		{
			desc: "No criminals may appear within a 2-tile radius (including diagonally).",
			prob: 4,
			type: "government",
			planet: "intervenus"
		},

	'Fire Station':
		{
			desc: "No houses may catch fire within a 2-tile radius (including diagonally).",
			prob: 4,
			type: "government",
			planet: "intervenus"
		},

	'Hospital':
		{
			desc: "Sacrifice two educated people. No people may get sick within a 2-tile radius (including diagonally).",
			prob: 4,
			type: "government",
			planet: "intervenus"
		},

	'School':
		{
			desc: "Requires at least 5 people in adjacent buildings. Once placed, add three educated people on the school.",
			prob: 3,
			type: "government",
			planet: "intervenus"
		},

	'University':
		{
			desc: "Worth +7 points. Requires at least 5 educated people and a school (in your possession).",
			prob: 2,
			type: "government",
			planet: "intervenus"
		},

	'Sewers':
		{
			desc: "Must be connected to the water grid. Adds +2 points to all buildings (of yours) connected to sewers by water.<br/><br/>You can also choose to NOT claim this building. In that case, <em>all</em> connected buildings are +1 point, but <em>you</em> get a +10 point bonus immediately.",
			prob: 2,
			type: "building",
			planet: "intervenus",
			requiredPlanets: ["meercury"]
		},

	'Dumping Ground':
		{
			desc: "Adds +2 points to any <em>destroyed</em> property (of yours) connected to it via streets..<br/><br/>You can also choose to NOT claim this building. In that case, <em>all</em> destroyed properties connected are still worth 1 point, but <em>you</em> get a +10 point bonus immediately.",
			prob: 2,
			type: "building",
			planet: "intervenus"
		},

	'Soccer Field':
		{
			desc: "Must be build on top of a <em>School</em> or <em>Hospital</em>. Add two educated people (if school), or heal two sick people (if hospital).",
			prob: 2,
			type: "environment",
			planet: "intervenus"
		},

	'Film Set':
		{
			desc: "All those hospital and detective shows are filmed here. Immediately add as many people as you have service buildings (Police, Fire, Hospital). Its maximum capacity is 10.",
			prob: 1,
			type: "entertainment",
			planet: "intervenus"
		},

	'Service Lane':
		{
			desc: "Build this street next to a service building and give it the number <strong>0</strong>. Only service buildings (Police, Fire, Hospital) may be adjacent to this street!",
			prob: 2,
			type: "street",
			planet: "intervenus"
		},

	//
	// pluto
	//

	'Forest':
		{
			desc: "All animals on adjacent spaces become happy.",
			prob: 4,
			type: "environment",
			planet: "pluto"
		},

	'Jungle':
		{
			desc: "Provides space for 4 animals. After each round, a new animal appears here! All animals on this space and adjacent spaces become happy.",
			prob: 5,
			type: "environment",
			planet: "pluto"
		},

	'Animal Shelter':
		{
			desc: "Provides space for 4 animals. It can, however, only receive those animals directly from a component (in your chosen option).",
			prob: 3,
			type: "building",
			planet: "pluto"
		},

	'Zoo':
		{
			desc: "Provides space for 6 animals. However, it needs to be connected to the water and oxygen grid",
			prob: 2,
			type: "entertainment",
			planet: "pluto",
			requiredPlanets: ["meercury"]
		},

	'Slaughterhouse':
		{
			desc: "All animals on adjacent spaces become unhappy. (This overrides any effects that would make them happy.)",
			prob: 2,
			type: "government",
			planet: "pluto"
		},

	'Green Crossing':
		{
			desc: "Draw a street with any number and two hedges on any side. This crossing extends biomes: animals connected to a <em>Forest</em> or <em>Jungle</em> via green crossings, also become happy.",
			prob: 2,
			type: "street",
			planet: "pluto"
		},

	'Pet Shop':
		{
			desc: "Immediately add one animal to all buildings you own in a 2-tile radius. <strong>Or</strong>, add 4 animals on this building (which is also its limit).",
			prob: 2,
			type: "building",
			planet: "pluto"
		},

	//
	// naptune
	//
	'Theatre': 
		{ 
			desc: "Must be adjacent to a path you own. All your buildings within a distance of two tiles (including diagonally) immediately get +1 person.", 
			prob: 3,
			type: "entertainment",
			planet: "naptune" 
		},

	"Shop":
		{
			desc: "Gives +1 point for each person in the shop. Must be adjacent to <strong>2</strong> paths you own. ",
			prob: 2,
			type: "entertainment",
			planet: "naptune"
		},

	'Theme Park':
		{
			desc: "Worth as many points as your total number of <em>Entertainment</em> buildings. Must be connected to electricity, oxygen and water.",
			prob: 1,
			type: "entertainment",
			planet: "naptune"
		},

	'Concert Hall':
		{
			desc: "Worth +4 points <em>minus</em> the number of (other) <em>Concert Halls</em> around it (horizontally, vertically or diagonally). ",
			prob: 1,
			type: "building",
			planet: "naptune"
		},

	'State Museum':
		{
			desc: "Worth as many points as your total number of <em>Government</em> buildings. Can only be adjacent to paths with numbers less than 7.",
			prob: 2,
			type: "government",
			planet: "naptune"
		},

	'Fourway Crossing':
		{
			desc: "This is a <em>path</em>. Draw a cross to divide a cell into four parts. Each part may contain a unique path number, and only <em>you</em> may write them there.",
			prob: 1,
			type: "street",
			planet: "naptune"
		},

	'Waterfall':
		{
			desc: "If next to a <em>Theme Park</em>, worth +3 points. Can only be adjacent to paths with numbers higher than 7. Is a <strong>water</strong> cell: it can connect with lakes/rivers. ",
			prob: 2,
			type: "environment",
			planet: "naptune"
		},
};

export {
	PLANET_MAP,
	PLANET_SETS,
	COMPONENTS,
	PEOPLE,
	RESOURCES,
	NUMBERS,
	EVENTS,
	EFFECTS,
	BUILDINGS
}