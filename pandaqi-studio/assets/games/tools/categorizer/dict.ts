/*

@SOURCES from BGG:
* SubDomain => https://boardgamegeek.com/browse/boardgamesubdomain
* Categories => https://boardgamegeek.com/browse/boardgamecategory
* Game Mechanics => https://boardgamegeek.com/browse/boardgamemechanic

*/

enum GameType
{
    VIDEO = "video",
    BOARD = "board"
}

interface ListData
{
    desc: string,
    type?: GameType // defaults to both video games and board games; only set if it just applies to one of them
}

type List = Record<string,ListData>;

const DIFFICULTY:List =
{
    no_brainer: { desc: "You can explain, setup and play the game within 1 minute. Usually also very low on text or ideas to grasp." },
    kids_can_play: { desc: "You can explain, setup and play the game within 2 or 3 minutes. Aims to be colorful, textless, and carrying a theme kids or families would usually grasp instantly." },
    simple: { desc: "You can explain, setup and play the game within at most 5 minutes. One or two rules might take some people a few turns to fully grasp." },
    regular: { desc: "You can explain, setup and play the game within at most 10 minutes. Contains a few elements that require a full game before one understands them fully, which means experienced players have a slight advantage." },
    challenge: { desc: "You can explain, setup and play the game within at most 15 minutes. Theme, mechanics and general flow will require some investment and getting used to. The reward is a deeper game that rewards skill and effort with longer enjoyment." }
}

const GENRES:List =
{
    action: { desc: "Emphasizes physical challenges most like the real world. Such as precise aim, quick reaction time, hand-eye coordination, smooth movement. Outside of video games, this mostly applies to party or dexterity games." },
    adventure: { desc: "Emphasizes the journey of a hero character through gradual exploration and problem solving in a new environment." },
    action_adventure: { desc: "Provides a mix of Action and Adventure elements, by either alternating physical challenges with exploring, or weaving them together into balanced new mechanics. Given its own genre because of how effective and popular this hybrid has turned out to be." },
    puzzle: { desc: "Emphasizes raw problem solving, usually involving logic, pattern recognition, sequence solving and word completion." },
    fighting: { desc: "Emphasizes combat between two or more entities. This usually involves a range of offensive and defensive moves, including bonuses for combos or timing." },
    platformer: { desc: "Emphasizes moving a character between core points of a physical environment, usually by jumping around dangers and dynamic obstacles. The usual objective is to cross the environment alive, not speed or cleverness." }, 
    racing: { desc: "Simulates a race in the broadest sense. Multiple entities must follow a predefined course of some kind and try to be the first to finish it." },
    role_playing: { desc: "Players control the actions of one specific character, immersed in a well-defined world. It's more about filling in the role as creatively as possible than reaching a streamlined objective." },
    simulation: { desc: "Emphasizes mimicking the workings and experiences from real life activities." },
    strategy: { desc: "Emphasizes (deep) thinking and planning over direct instant action, creating a more high-level than low-level experience. Usually involves logistics or resource management." },
    sports: { desc: "Simulates the practice of a sport, either existing or invented." },
    shooter: { desc: "Emphasizes defeating (usually killing) the enemies through use of weapons and other destructive tools given to the player." },
    MMO: { desc: "An online game with a huge number of players on the same server. This allows a huge, persistent world where players can cooperate, compete, build communities, and more over longer time frames.", type: GameType.VIDEO },
    horror: { desc: "Emphasizes scaring the player and providing adrenaline over trying to reach an objective or grow in skill." },
    sandbox: { desc: "Emphasizes freedom and creativity over any predetermined objective. If there are goals or constraints, players usually set or choose those themselves." },
    idle: { desc: "Emphasizes mechanics that automatically happen and progress, with bare minimum interaction from the players, even playing itself at times. Sometimes called an Incremental Game." },
    casino: { desc: "Almost entirely based on luck, with no true mechanics or depth, biased to make you lose on average. Usually involves real money and elements to make the player addicted." },
    party: { desc: "Extremely simple games with loose rulesets and objectives. Their primary objective is to enable interaction for (large) groups." },
    abstract: { desc: "Games with no clear theme or genre, mostly about number-crunching and strategic puzzling." },
    kids_game: { desc: "Extremely simple and colorful games without text, with rules or goals aimed at training kids in one basic skill (such as motor skills)." },
    family: { desc: "Emphasizes group play and allowing mixed ages or abilities to play together. Usually founded on simple rules and some intuitive, well-known theme." },
    thematic: { desc: "Emphasizes picking a strong theme and letting it drive the entire experience, over picking a specific genre or mechanics. Usually allows more direct conflict and unique gameplay." },
}

const CATEGORIES:List = 
{
    game: { desc: "A digital game. Created through code, requires a digital device to play it, typically solitaire.", type: GameType.VIDEO },
    boardgame: { desc: "A physical game. Uses physical materials only, rules must be executed by the players, typically needs multiple players.", type: GameType.BOARD },
    hybrid_game: { desc: "A game that has both a digital and a physical component. The game is typically a board game which uses a smartphone for easy unbiased randomization." },

    one_paper_game: { desc: "A game that only requires one paper and a pen to play. Typically requires printing a paper and writing on it, but some only use an empty paper or interact in some other way.", type: GameType.BOARD },
    one_week_game: { desc: "A game completely invented and created in one week. A challenge I set myself to make sure I stay at pace and don't doubt myself, while experimenting with some new skill." },
    game_jam: { desc: "A game made for one of the many game jams. Usually fun for a few minutes and nothing more. Developers promise to work on it afterwards; they never do.", type: GameType.VIDEO },
    waitless_game: { desc: "A game that doesn't require a table or chairs, allowing it to be played in waiting rooms or queues.", type: GameType.BOARD },
    standard: { desc: "A traditional, regular game that doesn't belong to any of the other more specialized categories." },

    single_player: { desc: "A game designed to be played on your own." },
    local_multiplayer: { desc: "A game designed to be played with multiple people in the same room; around the same table or behind the same screen." },
    online_multiplayer: { desc: "A game designed to be played with multiple people in separate locations, connected over the internet.", type: GameType.VIDEO },

    desktop: { desc: "A game playable on desktop devices, supporting keyboard and mouse inputs.", type: GameType.VIDEO },
    mobile: { desc: "A game playable on mobile devices, using touchscreen and nothing else.", type: GameType.VIDEO },
    console: { desc: "A game playable on the major gaming consoles, using gamepads.", type: GameType.VIDEO },

    card_game: { desc: "A game is mostly played using cards. Typically means holding a hand of cards to play and draw each turn.", type: GameType.BOARD },
    tile_game: { desc: "A game is mostly played using tiles. Typically means a tile placement or collection game.", type: GameType.BOARD },
    pawn_game: { desc: "A game is mostly played by placing pawns or other pieces on a board.", type: GameType.BOARD },

    family_friendly: { desc: "A game that does not involve excessive anything, mostly avoiding violent or sexual content. Its themes will usually be light and mainstream, its content can have some depth but nothing that makes parents worry about the meaning of life in front of their kids." },
    not_family_friendly: { desc: "A game that is clearly NOT family friendly." },
    
    spin_off: { desc: "A game that is inspired by another game, keeping the same core but providing a variation or new spin on it. I usually do this to provide a digital version of a board game or reskin a successful game, giving it a new look/theme/mechanic but barely any different core rules." },
    early_access: { desc: "A game that isn't done yet, but released early so it can already gather feedback and find an audience." },
    smartphone_controlled: { desc: "The game isn't played using regular input methods, but by connecting your smartphone to a shared device. This technology is used by e.g. the Jackbox games and my own Peerful Project.", type: GameType.VIDEO },

    casual: { desc: "The game is meant as quick entertainment when you sit on the toilet for a minute. Hypercasual games are even quicker and lighter. Any game that has any depth and requires some more time or investment will fall outside of this category.", type: GameType.VIDEO }
}

const THEMES:List =
{
    "2D": { desc: "A game that uses flat 2D images in a flat 2D world.", type: GameType.VIDEO },
    "2.5D": { desc: "A game that blends 3D models and space with 2D images and effects.", type: GameType.VIDEO },
    "3D": { desc: "A game that uses 3D models and 3D space.", type: GameType.VIDEO },
    retro: { desc: "Style that aims to look old-school or vintage, through the use of elements that used to be popular or necessary before but not in modern times." },
    pixel_art: { desc: "Style in which graphics are built from pixels: square rectangles of a single color. Common implementations nowadays are 8-bit or 16-bit games that intentionally restrict the number of pixels and colors they're allowed to use." },
    low_poly: { desc: "Style that uses 3D models with extremely low resolution, in which elements are textured with single colors from a controlled palette." },
    isometric: { desc: "Style in which you view everything from an isometric perspective, typically sideways and skewed." },
    nature: { desc: "The game has a strong nature theme, showing plants and animals and maybe using their real life properties as mechanics." },
    fantasy: { desc: "The game has a fantastical theme, usually involving magic and invented races." },
    humor: { desc: "The game does not take itself seriously and is filled with silly and unexpected elements." },
    medieval: { desc: "The game is set in the medieval time period." },
    science_fiction: { desc: "The game has futuristic or non-existing scientific elements." },
    prehistoric: { desc: "The game is set in prehistoric times." },
    mythology: { desc: "The game is inspired by or simulates the mythology of some culture." },
    wargame: { desc: "The game simulates a war, often based on real wars or even specific real battles." },
    pirate: { desc: "The game involves pirates." },
    monsters: { desc: "The game contains monsters, usually as persistant obstacles to overcome." },
    food: { desc: "The game is themed around food." },
    dystopian: { desc: "The game has a theme of a desolate, post-apocalyptic world in which you try to survive." },
    holiday: { desc: "The game is themed around a Holiday or made specifically to play at that time." },
    space: { desc: "The game is themed around space." },
    colorful: { desc: "The game looks colorful and visually rich, instead of toned down or restrained." },
    top_down: { desc: "The perspective of the game is from above, or bird's eye view." },
    relaxing: { desc: "The game is meant for relaxation and destressing, not challenge or skillful play. Also related to Atmospheric or Cute/Cozy games." },
    mosaic: { desc: "The game looks like a mosaic or something related (stained glass, patchwork, etcetera)." }
}

const TAGS:List =
{
    area_control: { desc: "Players are rewarded for controlling more or better areas of the map. Sometimes called Territory when you're also responsible for building and expanding those areas." },
    dexterity: { desc: "Physical dexterity and motor skills are important.", type: GameType.BOARD },
    drafting: { desc: "Cards (or tiles, resource, etc) are picked from a shared pool, which means you have an informed choice and your decision will deny that choice to opponents." },
    hand_management: { desc: "Players are rewarded for playing cards in certain sequences or groups. It's about gaining the most value out of available cards under the circumstances." },
    limited_communication: { desc: "Players are restricted in how or what they may communicate about the game. Usually for cooperative games." },
    programming: { desc: "Players must prepare the multiple steps of their turn beforehand, then execute it following fixed rules without being able to change it anymore." },
    push_your_luck: { desc: "Players must constantly decide if they want even bigger rewards at the risk of losing it all when your luck runs out." },
    set_collection: { desc: "Players are rewarded for forming or collecting sets that adhere to some pattern." },
    tower_defense: { desc: "Players have a general home base that is attacked from all sides which they need to defend for as long as possible. (A more specific implementation means you place multiple towers along a path to defend this final destination.)" },
    worker_placement: { desc: "Players trigger actions by attaching multiple tokens (Workers) to corresponding spots. These are usually shared spots with a limited capacity, leading to indirect competition." },
    tile_placement: { desc: "The core of the game revolves around placing tiles in a grid, usually trying to match adjacent pieces or optimize that tile's score." },
    trick_taking: { desc: "The game involves playing and winning tricks. A trick is formed by each player in turn playing one card and then one wins per the rules of the game. Traditionally, one must follow the suit of the leading card and highest in that suit wins." },
    resource_management: { desc: "Players must buy, sell, trade, or otherwise manage one or more resources (e.g. money or wood)." },
    storytelling: { desc: "The game has a large narrative component or is designed to build or invent a narrative as you go." },
    dice: { desc: "The game involves rolling or reading dice." },
    educational: { desc: "A game designed to teach or involve subjects traditionally attached to school or education. (Every game teaches; good games teach the best.)" },
    detective: { desc: "Players must give/gather clues to unravel a mystery. Commonly, someone has died and the others must find how and why (in some convoluted way)." },
    numbers: { desc: "A game that heavily relies on numbers or math, either in simple ways (e.g. play in ascending order) or more challenging ways (e.g. your income for the round depends on a formula with five inputs)." }, // could be named MATH, but that might scare people unnecessarily
    memory: { desc: "Players are rewarded for gathering hidden information and then remembering it correctly. Typically uses a grid of facedown tiles or cards." },
    negotiation: { desc: "A part of the game allows or requires negotiation. These can be loose verbal arrangements or trades between players (as common in party games), or negotiations using very strict rules and material." },
    alliances: { desc: "You are rewarded for forming alliances (formal or informal), creating temporary team-based play to benefit all members of the team." },
    political: { desc: "The game emphasizes political elements such as voting, power, alliances, manipulation and backstabbing. Usually involves running your own political party or playing king in some invented world." },
    traitor: { desc: "All players are on equal footing or the same team, except for one traitor. This can be secret or public information. Sometimes called One Against Many." },
    deduction: { desc: "Players must figure out the truth or the solution through the rules and tools given to them by the game. Can be social deduction (interrogate others, watch for lies, ...) or logic deduction (logical steps, logical connections, ...)." },
    trivia: { desc: "A game that involves testing or using common knowledge of any number of subjects you should've gathered outside of the game." },
    typing: { desc: "Players must type quickly and correctly to finish words, which is the primary way to reach the objective.", type: GameType.VIDEO },
    auto_battler: { desc: "Players decide the circumstances and squads beforehand, but once the battle starts it happens automatically through predetermined rules." },
    real_time: { desc: "Gameplay happens continually, immediately, in real time." },
    turn_based: { desc: "Gameplay happens in discrete turns, one after another." },
    simultaneous_turns: { desc: "Gameplay happens in discrete turns or rounds, but the multiple players do their actions simultaneously within that space." },
    skill_based: { desc: "The game is tough to master, offering near endless opportunities to become better and more skillful. Usually means a harsh first experience that requires some investment and discipline, with great rewards in return if you stick around." },

    open_world: { desc: "The game contains a world or universe, and you're free to explore it instead of being forced down a predetermined path." },
    rhythm: { desc: "The game rewards players for syncing actions to the beat or progression of music, which is the most important element." },
    civilization: { desc: "The game involves building and maintaining a civilization, folk or culture of some kind. Often paired with tearing down the civilization of others." },
    life_simulation: { desc: "A group of mechanics that closely mimicks some part of real life or daily activities. Usually, it only keeps what people like and neatly tucks away the annoying parts." },
    vehicle_simulation: { desc: "A group of mechanics that closely mimicks driving and maintaining a vehicle. Usually, it only keeps what people like and neatly tucks away the annoying parts." },
    high_score: { desc: "The objective is to reach the highest numerical score. Usually means the entire game rewards you directly with more points." },
    experimental: { desc: "The game subverts genre expectations or experiments with obscure mechanics, taking the great risk of absolute failure ... to potentially reach something more fresh and exciting." },
    action_points: { desc: "Players receive a set amount of general action tokens per turn, which they may spend any way they like on specific actions." },
    modular: { desc: "The game is built from small components that can be combined in any way to play a particular game. Usually means a modular game board that's always different, or combining different expansion packs for a unique deck." },
    single_loser: { desc: "Instead of having a single winner, the game has a single loser (and everyone else wins)." },
    map: { desc: "The game has a map or board of some kind." },
    shared_map: { desc: "Most of the game happens on a shared map or using shared resource, leading to constant high rates of interaction and competition." },
    physics_based: { desc: "The game relies on physics interactions, such as gravity, bouncing, hitting, or chains.This inherently favors action games, sports games or silly party games." },

    endless: { desc: "The game could go on forever, as long as you didn't die. Usually used for action-platformer games that use simple tricks to keep generating more terrain as you go.", type: GameType.VIDEO }, // though I'd be interested to explore if you COULD, in some way, make an endless board game ...
    procedural_generation: { desc: "Elements of the game are randomly generated, using simple rules to ensure it's playable and fun. Commonly applies to the map or world, but can be anything (e.g. initial market state in an economic game)." },
    virtual_reality: { desc: "The game supports virtual reality. Using tools such as a headset, you are actually inside the game and physical movements translate to it.", type: GameType.VIDEO },
    bidding: { desc: "Players must bid personal resources to win bigger rewards, at risk of losing great value instead if they misjudged. Similar to Auction or Betting." },
    bluffing: { desc: "Players are rewarded for successfully bluffing about what they did, have, or can do." },
    bias: { desc: "The game automatically pushes you in a certain direction. Example: a wind blows you away from the capital each turn. Players must usually fight that or use it to their advantage." },
    bribery: { desc: "Players can or must bribe other players, or game systems, for the biggest rewards." },
    trading: { desc: "Players can or must trade resources." },
    battle: { desc: "The game involves direct conflicts between players or player-and-game, which must ultimately have one strongest winner. Or the entire game is one such conflict." },
    take_that: { desc: "Mechanics that allow directly targeting an opponent's progress towards victory." },
    escape_game: { desc: "The objective is to escape out of the current, negative, restricting circumstance. Usually involves gaining more freedom and tools as you go, offset by tougher locks." },
    farming: { desc: "Simulates farming." },
    cooking: { desc: "Simulates cooking." },
    survival: { desc: "The objective is to survive a tough and minimal situation. Either as long as the game dictates, or just longer than the others." },
    campaign: { desc: "The game is gradually taught and experienced through a campaign of level after level." },
    legacy: { desc: "The state of the game is permanent, usually achieved with writing on the board or stickers. This enables you to play the game multiple times with the same group of people as if it were one huge story. Once done, though, you can usually never play it again", type: GameType.BOARD },
    industry: { desc: "Encourages players to build, manage or operate tools and machinery in order to manufacture raw materials into goods and products." },
    transportation: { desc: "Involves traveling and transportation, or building the systems to do so." },
    settlement: { desc: "Involves building a city of some kind or settling as best you can on your randomly assigned plot of land." },
    media: { desc: "It uses or is based on some pieces of popular media, such as books, movies, music or television." },

    asymmetric: { desc: "The setup (tools, powers, location) between players is purposely unequal. This is tough to balance, but more varied and interesting than perfectly symmetric starts." },
    player_powers: { desc: "Players start with or gain special abilities. These are usually unique, creating an asymmetric game and varying challenges, but limited in how often or when they can be used." },
    variable_setup: { desc: "The setup of the game is randomized or can be adjusted, making every game diverse and unique from the start." },
    point_salad: { desc: "You score points for a number of completely different things in completely different ways. Your final score is the sum of that." },
    deck_building: { desc: "Players play cards out of individual decks, with the purpose of acquiring better cards for those decks and shedding the worst ones. To win, you need a balance between improving your deck and actually using its power. (Also Bag Building, Pool Building, etcetera.)" },
    engine_building: { desc: "Players execute their engine each turn to create a better engine for next turn. To win, you need a balance between improving your engine and actually gaining score from it. Deck Building is a specific implementation of this, just like most Farming games would be." },
    chance: { desc: "The game heavily relies on randomness and luck." },
    language: { desc: "The game involves letters, spelling, words, and other creative use of language." },
    drawing: { desc: "The game involves drawing or otherwise visually communicating ideas." }, // would be INTERESTING though if you could make a drawing game that's really strategical, with freeform drawings used for pre-planned actions or tactics
    player_elimination: { desc: "Players can be eliminated from the game. They can be kicked out entirely (Hard) or have their role in further proceedings reduced to a skeleton role (Soft)." },
    player_judge: { desc: "A player judges the value or correctness of turns and actions, not the rules of the game or fixed numbers." },
    networks: { desc: "The game involves building networks or routes, connecting various locations on a map or parts of a pipeline." },
    team_based: { desc: "Players are put into teams and compete between those teams." },
    grid: { desc: "The map of the game is an orderly grid of separate components. These are usually square tiles, but can be cards, hexagons, etcetera." },
    events: { desc: "Random events are triggered during the game. These are usually optional or an expansion, and provide small tweaks to spice up each round." },
    i_cut_you_choose: { desc: "One player decides which options exist, but other players may pick their preferred option first." },
    market: { desc: "The game has a shared market where players sell or purchase goods. This usually includes rules about market value, changing prices, and promotes indirect competition." },
    domino: { desc: "The game uses domino tiles. (These are great for allowing much freedom but just enough restriction that it becomes a challenge to place things optimally.)" },
    textless: { desc: "The game has no text on the material or screen. (No reading comprehension needed to play.)" },
    crafting: { desc: "Players can combine resources and abilities to craft new items, which are usually more powerful and unlock more options for further crafting." },


    orientation: { desc: "The orientation or facing of items matters and changes what they mean or do." },
    guessing: { desc: "Players win by guessing something correctly (or close enough). A staple in party games." },
    stealth: { desc: "The biggest challenge of the game is not how to reach your goals, but how to do so in secret---without being noticed, found out, or triggering the alarm." },
    hidden_object: { desc: "Objects have been hidden and players must find them." },
    chaining: { desc: "Players place stationary pieces to create connected chains. Usually, longer chains or zoning off a section of the map is rewarded. See also Enclosure." },
    enclosure: { desc: "Players place stationary pieces in an attempt to completely close off an area. Usually, this captures all enemies inside or scores them points." },
    end_game_bonuses: { desc: "Players get extra bonuses at the end for completing highly specific objectives. These are usually randomized per game, and can be secret or public." },
    delayed_actions: { desc: "There's a gap between when a player chooses or prepares to do something (e.g. purchase an item) and when the action actually triggers (e.g. they get the item for use)." },
    follow: { desc: "One player makes a crucial decision, others must then follow. For example, see Trick Taking." },
    catch_the_leader: { desc: "The game systems purposely advantage players who are further behind and disadvantage players in front, keeping the game tight. Jokingly called Socialism." },
    contracts: { desc: "The game offers 'contracts' that give rewards for achieving something specific. Once taken, you are usually bound to it and might even be penalized for not completing it in time." },
    hidden_movement: { desc: "One or more entities move around in secret. It's usually the player's job to track them and catch them red-handed at the right time." },
    hidden_roles: { desc: "Players receive secret roles, which can have unique abilities or restrictions. It's usually the objective to figure out the roles of others without giving away your own." },
    hidden_score: { desc: "The state of players is kept hidden until the game ends. Often, though, this information is knowable if you make the effort to track it yourself." },
    roles: { desc: "Players receive roles. These may grant special abilities or asymmetric powers, and the game typically encourages leaning into the persona for maximum story. See also Hidden Roles." },
    hot_potato: { desc: "A single item is bad for players to have, so players strive to avoid it or pass it around before it 'explodes'." },
    

    income: { desc: "Players gain resources at defined times. Usually Money." },
    kill_steal: { desc: "Players contribute to the same tasks, but only the one to complete it (or do it best) steals all rewards." },
    king_of_the_hill: { desc: "Players are rewarded for occupying certain positions, be it a physical position on the map or a role." },
    ladder_climbing: { desc: "Turns must go bigger and better until somebody goes bust. Usually with numbered cards that must go higher." },
    matching: { desc: "Players must make their next play by matching some feature of the previous play." },
    move_through_all: { desc: "The objective is to move through an entire set (e.g. a deck of cards) as quickly as possible." },
    multi_use_material: { desc: "Elements in the game can be used for multiple things. For example, a card you can play for its action OR score for its numeric value." },
    ownership: { desc: "Players are rewarded for owning entities or systems in the game." },
    stacking: { desc: "Involves stacking, piling up or overlapping elements." },
    sorting: { desc: "Involves rewards for sorting elements according to some (temporary) rule. Common in cooperative games. Related to Ranking." },
    cutting: { desc: "Involves cutting into material. Used in my One Paper Games." },
    folding: { desc: "Involves folding the material. Used in my One Paper Games." },
    mining: { desc: "Players dig into an area to reach deeper and deeper spots, where rewards are usually unknown but bigger if you venture further. Usually related to Treasure and Underground." },

    creative: { desc: "The game allows and possibly rewards a high degree of personal creativity." },
    social: { desc: "The game requires a lot of social interaction, or requires social skill to further your goals and win." },
    logic: { desc: "The game requires sound logic and long-term plans to overcome deep, brainteasing challenges." },
    emotional: { desc: "The game is designed to elicit an emotional reaction, or more interested in the emotions behind the play." },
    fast_paced: { desc: "The game is designed to have rapid turns and decisions, preferring speed of play and 'do something' over strategy or depth." },
    improv: { desc: "The game requires improvization, usually connected to Party, Social and Creative games." },
    patterns: { desc: "Players are rewarded for combining game elements into sophisticated patterns." },
    pick_up_and_deliver: { desc: "Players are rewarded for picking up items in one way or one location, then traveling or processing them, to deliver them to a new location or system." },
    determine_and_do: { desc: "A core mechanic involving two steps: one randomization, one action. For example, roll-and-write: roll a dice then write the number down on your scoresheet. Other examples are Flip-and-Write, Roll-and-Move, Spin-and-Move." },
    score_and_reset: { desc: "Players play until some condition is met, then score, then reset the entire game and go again." },
    sudden_death: { desc: "The game contains special conditions to instantly end the game before the regular ending conditions. Often means something close to 'Golden Goal': the game is tied, so whoever scores points first now wins instantly." },
    tech_tree: { desc: "The game contains a large tree or track of progressive technology. Players can unlock more parts for better abilities, at the cost of resources and permanently shutting down paths they didn't pick." },
    tug_of_war: { desc: "Some game element can be pushed in two directions, away from neutral position, until one pushes so far they win." },
    turn_order: { desc: "The game plays with a dynamic turn order and who starts rounds, and this is crucial." },
    fixed_order: { desc: "Order of important elements is randomly established and must then stay the same. It's usually about hand cards staying in the same order and being forced to play the right-most card." },

    artillery_game: { desc: "Players attack each other's bases from a distance, judging the right weapon, angle and speed for the perfect shot." },
    side_scroller: { desc: "The game is played in side view and automatically scrolls left/right as you move. True for a multitude of platformers and mobile casual games." },
    monster_tamer: { desc: "Players must track, collect, train and then use their designed squad of entities." },
    battle_royale: { desc: "A large number of players is thrown into the same location, but only the last one standing wins. Related to MOBAs." },
    arcade: { desc: "A game that emphasizes short experiences, quick loss, extremely simple rules, and eschewing realism for plain fun. Named after the old arcade cabinets that were coin-operated and had to be designed this way for maximum profit." },
    visual_novel: { desc: "More an interactive movie or book than a typical game." },
    "4X Game": { desc: "Deep strategic games all about Explore, Expand, Exploit and Exterminate. Ironically, has 4 related game genres: Real-Time Strategy (RTS), Real-Time Tactics, Turn-Based Strategy or Turn-Based Tactics." },
    spiritually_inspired: { desc: "An adaptation of an already existing, usually popular game. I use this to indicate the game is completely my own work, but also completely started its life by imitating Monopoly or something." },
    chaos: { desc: "The game is meant to be silly, chaotic and frantic. Usually reserved for local multiplayer party games." },
    dungeon_crawler: { desc: "Players explore a mysterious area filled with hostile entities. They gather strength, weapons and knowledge as they go further and defeat more of them." },
    economic: { desc: "Encourages players to manage a system of producing and selling goods, usually involving shared markets or other global economic systems." },
    train: { desc: "A game about creating railroad networks and managing a train business. A huge subgenre of board games mostly focused on the steam era." },
    miniatures: { desc: "Focuses on a large set of unique miniatures, which are placed and moved around as the core gameplay.", type: GameType.BOARD },
    metroidvania: { desc: "A blend of Action, Adventure and Platformer. Feature large interconnected maps with areas locked behind skill or progression, and focus on careful minimalist level design and tight controls.", type: GameType.VIDEO },
    beat_em_up: { desc: "The game is an endless cycle of defeating enemies and being rewarded for doing so rapidly and efficiently." },
    construction: { desc: "Players construct towns, buildings, business, empires, whatever. Related to Management, because just building something without managing it won't do much good." },
}

interface ListContainer
{
    list: List,
    desc: string,
    sort?: boolean
}

const LISTS:Record<string,ListContainer> =
{
    difficulty: { list: DIFFICULTY, desc: "The difficulty of a game. This doesn't necessarily relate to skill or how much of a gamer you are, but more the amount of information and ideas you must grasp to play." },
    genres: { list: GENRES, sort: true, desc: "The genre of the game. This uses the major genres listed everywhere and genres usually reported in best-selling lists." },
    categories: { list: CATEGORIES, sort: true, desc: "Major properties that usually cut games into two or three distinct groups, such as 'single player' versus 'multiplayer'." },
    tags: { list: TAGS, sort: true, desc: "The specific game mechanics or unique properties (that decide game mechanics) of the game." },
    themes: { list: THEMES, sort: true, desc: "The (visual) style or theme of a game, broadly speaking." }
}

export
{
    DIFFICULTY,
    GENRES,
    CATEGORIES,
    TAGS,
    THEMES,
    LISTS,
    GameType
}