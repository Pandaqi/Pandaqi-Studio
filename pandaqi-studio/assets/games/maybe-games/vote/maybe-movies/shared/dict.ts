import toTextDrawerImageStrings from "js/pq_games/tools/text/toTextDrawerImageStrings"

export enum CardType
{
    MOVIE = "movie",
    VOTE = "vote"
}

export enum MovieType
{
    MOVIE = "movie"
}

export enum VoteType
{
    YES = "yes",
    NO = "no",
    CHANGE = "change"
}

export type CardSubType = VoteType | MovieType

export interface VoteDetails
{
    icon: string,
    num: number
}

export interface MovieDetails
{
    costIcons?: string[],
    profit?: number,
    costText?: string,
    profitText?: string
}

export interface IconData
{
    frame: number,
    set?: string
}

export const CARD_TEMPLATES:Record<string, IconData> =
{
    movie: { frame: 0 },
    vote_yes: { frame: 1 },
    vote_no: { frame: 2 },
    vote_change: { frame: 3 },
    movie_flat: { frame: 4 }, // the movie clapper is flat on both sides, allows more space for special text
}

// @NOTE: things that were hard to visualize: editing (scissors cutting film strip), visual effects, "marketing"
// @NOTE: with 6 icons, the chance of a succesful movie is about ~50%
// (if you removed the Wildcard rule, this only happens at 3 icons! And that was just too few!)
export const ICONS:Record<string, IconData> =
{
    money: { frame: 1, set: "base" },
    actors: { frame: 2, set: "base" },
    script: { frame: 3, set: "base" },
    setting: { frame: 4, set: "base" },
    camera: { frame: 5, set: "base" },
    microphone: { frame: 6, set: "base" },
    lights: { frame: 7, set: "??" },
    costume: { frame: 8, set: "??" }, 
    awards: { frame: 9, set: "??" },
    popcorn: { frame: 10, set: "??" }  
}

export enum TextType
{
    GENRE = "genre",
    SETTING = "setting",
    CHARACTERS = "characters",
    THEME = "theme",
    TIMEPERIOD = "timeperiod"
}

export interface TextData
{
    desc: string,
    list: string[],
    prob?: number
}

export interface TextDetails
{
    main: string,
    option: string
}

export const GENRES = ["Comedy", "Action", "Adventure", "Romance", "Animation", "Crime", "Documentary", "Thriller", "Drama", "Fantasy", "Science-Fiction", "Horror", "Mystery", "Historical", "Musical", "Western", "War", "Superhero"];
export const SETTINGS = ["City", "Village", "Forest", "Jungle", "Desert", "Mountains", "Countryside", "Beach", "Island", "Space", "Underwater", "Prison", "Hospital", "School", "University", "Office", "Theme Park", "Circus", "Stadium", "Sports Arena", "Military Base", "Haunted House", "Castle", "Subway", "Train Station", "Airport", "Ship", "Parallel Universe", "Fantasy Realm"];
export const CHARACTERS = ["Humans", "Aliens", "Dinosaurs", "Animals", "Robots", "Heroes", "Villains", "Babies", "Children", "Adults", "Elderly", "Teachers", "Lovers", "Underdogs", "Femme Fatales", "Geniuses", "Inventors", "Farmers", "Writers", "Outlaws", "Detectives", "Uninspired", "Reluctant Heroes", "Objects", "Toys", "Vehicles", "Cars", "Computers", "Engineers", "Students", "Bosses", "Artists", "Athletes", "Pets", "Celebrities", "Accountants", "Spies", "Dragon Riders", "Wizards", "Witches", "Superheroes", "Dancers", "Musicians", "Scientists", "Lumberjacks", "Buildings", "Plants", "Trees", "Clouds", "Painters", "Entrepeneurs", "Dumb", "Fighters", "Cooks", "Volunteers", "Programmers", "Doctors", "Nurses", "Retail Workers", "Janitors", "Waiters", "Receptionists", "Police", "Firemen", "Strangers", "Pilots", "Bakers", "Insane", "Astronauts", "Soldiers", "Merchants", "Kings", "Queens", "Princes", "Princesses", "Traitors", "Peasants", "Slaves", "Disabled", "Insomniacs", "Clairvoyant", "Coaches", "Corrupt", "Politicians", "Critics", "Zookeepers", "Serial Killers"];
export const TIMEPERIOD = ["Post-Apocalypse", "Medieval", "Ancient Rome", "Prehistoric", "Ancient Greece", "Modern", "Past", "Future", "Unclear", "19th century", "18th century", "Renaissance", "Victorian Era", "Wild West", "World War I", "World War II", "Great Depression", "Roaring Twenties", "Post-War", "Near Future", "Alternate Past", "Industrial Age", "Information Age", "Bronze Age", "Stone Age", "Iron Age", "Persian Empire", "Byzantine Empire", "French Revolution"];
export const THEMES = ["Handicap", "Betrayal", "Relationship", "Friendship", "Growing Up", "Loss", "Money", "Politics", "Power", "Free Will", "Love", "Redemption", "Personal Identity", "Courage", "Family", "Corruption", "Good / Evil", "Justice", "Revenge", "Hope", "Escape", "Freedom", "Entertainment", "Society", "Nature", "Science", "Education", "Humanity", "Empathy", "Transformation", "Isolation", "Sacrifice", "Legacy", "Forgiveness", "Ethical Dilemmas", "Cultural Identity", "Technology", "Mindfulness", "Inequality", "Dreams", "Reality", "Aging", "Mortality", "War", "Faith", "Ghost Stories", "Expression", "Mythology", "Truth", "Resistance", "Rebellion", "Community", "Exploration", "Discovery", "Philosophy", "Disasters", "Uncertainty", "Talking Animals", "Fairy Tales", "Climate Change", "Zombies", "Trust", "Trauma", "Quest", "Journey", "Incompetence", "Intelligence", "Stealing", "Succession", "Magic", "Deadly Sins", "Illness", "Injury", "Dragons", "Human Nature", "True Events", "Tragedy", "Getting Rich", "Finding Someone", "Learning Skills", "Defeating Villains", "History", "Finding Clues", "Marketing", "Nothing", "Me", "Religion", "Promises", "Hate", "Greed", "Gluttony", "Memory Loss", "Time Travel", "Dignity", "Honor", "Clothing", "Architecture", "Terrorism", "Discrimination", "Gifts", "Revolution", "Food", "Games", "Dating", "Social Media", "Music", "Sports", "Art", "Time"];

export const MAIN_TEXTS:Record<TextType, TextData> = 
{
    [TextType.GENRE]: { desc: "The genre is ...", list: GENRES, prob: 0.75 },
    [TextType.SETTING]: { desc: "The setting is (a) ...", list: SETTINGS },
    [TextType.CHARACTERS]: { desc: "Where the characters are ...", list: CHARACTERS, prob: 2 },
    [TextType.TIMEPERIOD]: { desc: "The time period is ...", list: TIMEPERIOD },
    [TextType.THEME]: { desc: "It's about (a) ...", list: THEMES, prob: 2.5 },
}

/*
For example,
* Cost = highest/lowest neighbor.
* Cost = number of YES-votes / number of NO-votes
* Profit = 0 if the pitch has <3 cards, otherwise 3.
* Profit = equal to number of cards in the pitch
* Profit = equal to the number of times this pitch was CHANGED.
*/

export const BLOCKBUSTERS =
{
    cost:
    {
        copycat_most_neighbor: { desc: "Copies the cost of the neighbor with the <b>most icons</b>." },
        copycat_least_neighbor: { desc: "Copies the cost of the neighbor with the <b>least icons</b>." },
        num_yes_votes: { desc: "Costs as many %resource% as the <b>number of YES votes</b>." },
        num_no_votes: { desc: "Costs as many %resource% as the <b>number of NO votes</b>." },
        pitch_size: { desc: "Costs as many %resource% as the <b>number of cards</b> in the pitch." },
        pitch_size_conditional: { desc: "Costs 2 %resource%, unless the pitch contains more than 3 cards." },
        match_cost: { desc: "Costs 3 %resource% only if it matches a Movie Made." },
        match_no_cost: { desc: "Costs 2 %resource% only if it <b>doesn't</b> match a Movie Made." },
        wildcard_cost: { desc: "Costs %numlow% of any icon." },
        wildcard_cost_conditional: { desc: "Costs %numlow% of any icon, unless the pitch contains <b>every possible icon</b>." },
        unanimous_vote: { desc: "Costs 4 %resource%, unless everyone votes the <b>same</b>." },
        copycat_most_icon: { desc: "Costs 2 of the icon that occurs the <b>most</b> in this pitch." },
        copycat_least_icon: { desc: "Costs 2 of the icon that occurs the <b>least</b> in this pitch." },
        num_changes: { desc: "Costs the <b>number of times</b> the pitch <b>CHANGED</b>." },
    },

    profit:
    {
        copycat_most_neighbor: { desc: "Copies the profit of the neighbor with the <b>highest profit</b>." },
        copycat_least_neighbor: { desc: "Copies the profit of the neighbor with the <b>smallest profit</b>." },
        num_yes_votes: { desc: "Yields the <b>number of YES votes</b>." },
        num_no_votes: { desc: "Yields the <b>number of NO votes</b>." },
        pitch_size: { desc: "Yields the <b>number of cards</b> in the pitch." },
        pitch_size_conditional: { desc: "Yields <b>3 Votes</b>, unless the pitch contains fewer than 3 cards." },
        match_reward: { desc: "Yields <b>4 Votes</b> only if it matches a Movie Made." },
        match_no_reward: { desc: "Yields <b>3 Votes</b> only if it <b>doesn't</b> match a Movie Made." },
        wildcard_profit: { desc: "Yields 1, 2 or 3 Votes. Active player decides." },
        wildcard_profit_conditional: { desc: "Yields 5 votes if the pitch contains <b>every possible icon</b>, 1 otherwise." },
        unanimous_profit: { desc: "Yields 5 votes, but only if everyone votes the <b>same</b>." },
        copycat_most: { desc: "Copies the profit of the <b>most expensive</b> card in this pitch." },
        copycat_least: { desc: "Copies the profit of the <b>least expensive</b> card in this pitch." },
        num_changes: { desc: "Yields the <b>number of times</b> the pitch <b>CHANGED</b>." }, 
    }
}

export const DYNAMIC_OPTIONS =
{
    "%resource%": null, // is set dynamically based on config
    "%vote%": ["YES", "NO"], // @NOTE: CHANGE vote is from expansion, so not included by default here
    "%numlow%": [1,2,3],
}