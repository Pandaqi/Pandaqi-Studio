export enum Category
{
    EVENT = "event",
    ITEM = "item",
    ACTION = "action",
    GOAL = "goal",
    CHANGE = "change",
    HABIT = "habit", // lifestyle perhaps a better word, but feels too long compared to others
    PERSONAL = "personal",
    JOB = "job",
    HEALTH = "health"
}

export enum Pack
{
    BASE = "base",
    ADVANCED = "advanced",
    EXPERT = "expert",
    SILLY = "silly",
    SUPER = "superpowers",
    PAST = "past",
    JOBS = "jobs",
    PERSONAL = "personal",
    HABITS = "habits",
    ITEMS = "items"
}

// @NOTE: I assign these pretty much based on what I feel in the moment; this obviously is subjective
export enum Feeling
{
    HAPPY = "happy",
    UNHAPPY = "unhappy",
    AWKWARD = "awkward"
}


interface CategoryMetaData
{
    frame: number,
    colorBG: string,
    colorText: string,
    colorMid: string,
}

export const CATEGORIES:Record<Category, CategoryMetaData> = 
{
    [Category.EVENT]: { frame: 0, colorBG: "#FFFFA5", colorMid: "#797900", colorText: "#353500" },
    [Category.ITEM]: { frame: 1, colorBG: "#FFDDAA", colorMid: "#864400", colorText: "#362100" },
    [Category.ACTION]: { frame: 2, colorBG: "#FFBBBB", colorMid: "#B60707", colorText: "#330000" },
    [Category.GOAL]: { frame: 3, colorBG: "#AAFFEB", colorMid: "#09A064", colorText: "#002F23" },
    [Category.CHANGE]: { frame: 4, colorBG: "#AAD4FF", colorMid: "#0C54B0", colorText: "#001A34" },
    [Category.HABIT]: { frame: 5, colorBG: "#B4AAFF", colorMid: "#200ABA", colorText: "#160F47" },
    [Category.PERSONAL]: { frame: 6, colorBG: "#E9AAFF", colorMid: "#8820A0", colorText: "#260731" },
    [Category.JOB]: { frame: 7, colorBG: "#E1E1E1", colorMid: "#676767", colorText: "#202020" },
    [Category.HEALTH]: { frame: 8, colorBG: "#BDFFAA", colorMid: "#207405", colorText: "#0C2705" }
}

/* THESE colorMid values are much LIGHTER
const CATEGORIES:Record<Category, CategoryMetaData> = 
{
    [Category.EVENT]: { frame: 0, colorBG: "#FFFFA5", colorMid: "#ACAC12", colorText: "#353500" },
    [Category.ITEM]: { frame: 1, colorBG: "#FFDDAA", colorMid: "#B97713", colorText: "#362100" },
    [Category.ACTION]: { frame: 2, colorBG: "#FFBBBB", colorMid: "#E93A3A", colorText: "#330000" },
    [Category.GOAL]: { frame: 3, colorBG: "#AAFFEB", colorMid: "#1CD2A7", colorText: "#002F23" },
    [Category.CHANGE]: { frame: 4, colorBG: "#AAD4FF", colorMid: "#2F87E1", colorText: "#001A34" },
    [Category.HABIT]: { frame: 5, colorBG: "#B4AAFF", colorMid: "#523DED", colorText: "#160F47" },
    [Category.PERSONAL]: { frame: 6, colorBG: "#E9AAFF", colorMid: "#BB51E0", colorText: "#260731" },
    [Category.JOB]: { frame: 7, colorBG: "#E1E1E1", colorMid: "#9A9A9A", colorText: "#202020" },
    [Category.HEALTH]: { frame: 8, colorBG: "#BDFFAA", colorMid: "#51A738", colorText: "#0C2705" }
}
*/


export interface CategoryData
{
    desc: string,
    category?: Category,
    feeling?: Feeling, // if not provided, assumes HAPPY
    pack?: Pack, // if not provided, assumes BASE
}
type CategoryDataList = CategoryData[];

//
// @NOTE: This is where all the actual content on cards is saved
//

// EVENT: Something that happens to you.
const EVENT_CARDS:CategoryDataList = [
    // BASE
    { desc: "Celebrating someone else's birthday.", pack: Pack.BASE },
    { desc: "Seeing family members get a baby.", pack: Pack.BASE },
    { desc: "Enjoying a beautiful sunset or sunrise.", pack: Pack.BASE },
    { desc: "Organizing a game night with friends or family.", pack: Pack.BASE },
    { desc: "Hearing good news.", pack: Pack.BASE },
    { desc: "Hearing bad news.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },
    { desc: "Facing discrimination or prejudice.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },
    { desc: "Losing all your money.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },
    { desc: "Receiving heavy criticism about something.", pack: Pack.BASE },
    { desc: "Facing criminal charges.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },

    // ADVANCED
    { desc: "Participating in a cultural or community event.", pack: Pack.ADVANCED },
    { desc: "Celebrating a major holiday.", pack: Pack.ADVANCED },
    { desc: "A random act of kindness by a stranger.", pack: Pack.ADVANCED },
    { desc: "Learning something new.", pack: Pack.ADVANCED },
    { desc: "Being reunited with a family member or friend you haven't seen in a long time.", pack: Pack.ADVANCED },
    { desc: "Celebrating a relationship anniversary.", pack: Pack.ADVANCED },
    { desc: "Living close to a war zone.", feeling: Feeling.UNHAPPY, pack: Pack.ADVANCED },
    { desc: "Being accused of something that's not illegal.", feeling: Feeling.UNHAPPY, pack: Pack.ADVANCED },
    { desc: "Being accused of something that's illegal.", feeling: Feeling.UNHAPPY, pack: Pack.ADVANCED },
    { desc: "Losing your social status (thrown out of groups and communities).", feeling: Feeling.UNHAPPY, pack: Pack.ADVANCED },

    // EXPERT
    { desc: "Learning something that goes against your current beliefs.", feeling: Feeling.AWKWARD, pack: Pack.EXPERT },
    { desc: "Working an unfulfilling or unsatisfying job.", feeling: Feeling.UNHAPPY, pack: Pack.EXPERT },
    { desc: "Being held back a year in school (or career).", feeling: Feeling.UNHAPPY, pack: Pack.EXPERT },
    { desc: "Living in a poorly maintained and dangerous home.", feeling: Feeling.UNHAPPY, pack: Pack.EXPERT },
    { desc: "Living next to a busy and noisy road.", feeling: Feeling.UNHAPPY, pack: Pack.EXPERT },
    { desc: "Living in an incredibly quiet neighborhood.", pack: Pack.EXPERT },
    { desc: "Living close to city center.", pack: Pack.EXPERT },
    { desc: "Living in a rural area.", pack: Pack.EXPERT },
    { desc: "Living in an area with polluted air.", feeling: Feeling.UNHAPPY, pack: Pack.EXPERT },
    { desc: "Going through a legal process.", feeling: Feeling.UNHAPPY, pack: Pack.EXPERT },
    { desc: "Experiencing a natural disaster in your area.", feeling: Feeling.UNHAPPY, pack: Pack.EXPERT },
    { desc: "Being part of an accident.", feeling: Feeling.UNHAPPY, pack: Pack.EXPERT },

    // SILLY
    { desc: "Awkward silences in a group setting.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Discovering a clothing stain in a public place.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Forgetting lines during a presentation or speech.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Pocket-dialing or butt-dialing someone.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Loud stomach growls or unexpected bodily sounds.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Phone ringing loudly during a meeting or presentation.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Being interrupted during an important conversation.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Going for a handshake when the other person goes for a hug.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "A surprise visit from a friend or family member.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Receiving an unexpected gift.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
];

// ITEM: Both owning an item (or using it in general), or what you DO with a specific item
const ITEM_CARDS:CategoryDataList = [
    // BASE
    { desc: "Owning a smartphone.", pack: Pack.BASE },
    { desc: "Owning comfortable furniture.", pack: Pack.BASE },
    { desc: "Owning valuable artwork.", pack: Pack.BASE },
    { desc: "Owning quality headphones or earbuds.", pack: Pack.BASE },
    { desc: "Owning workout equipment.", pack: Pack.BASE },
    { desc: "Owning designer clothing or accessories.", pack: Pack.BASE },
    { desc: "Owning a large book collection.", pack: Pack.BASE },
    { desc: "Owning kitchen gadgets.", pack: Pack.BASE },
    { desc: "Owning a gaming console.", pack: Pack.BASE },
    { desc: "Owning a good quality mattress and pillows.", pack: Pack.BASE },
    { desc: "Breaking your smartphone screen.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },
    { desc: "Having an empty refrigerator.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },
    { desc: "Not owning a washing machine.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },
    { desc: "Not owning a stove or microwave.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },
    { desc: "Not owning heating or airconditioning.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },

    // ADVANCED
    { desc: "Owning a computer.", pack: Pack.ADVANCED },
    { desc: "Owning a high-end camera.", pack: Pack.ADVANCED },
    { desc: "Owning outdoor gear for camping or hiking.", pack: Pack.ADVANCED },
    { desc: "Owning smart home devices or appliances.", pack: Pack.ADVANCED },
    { desc: "Owning an impressive car or motorcycle.", pack: Pack.ADVANCED },
    { desc: "Owning an electric bike or scooter.", pack: Pack.ADVANCED },
    { desc: "Owning a huge garden.", pack: Pack.ADVANCED },
    { desc: "Being hacked on your personal computer.", feeling: Feeling.UNHAPPY, pack: Pack.ADVANCED },
    { desc: "Having a slow or malfunctioning computer.", feeling: Feeling.UNHAPPY, pack: Pack.ADVANCED },
    { desc: "Receiving bills or negative financial statements.", feeling: Feeling.UNHAPPY, pack: Pack.ADVANCED },
    { desc: "Wearing clothing that's too tight or too loose.", feeling: Feeling.UNHAPPY, pack: Pack.ADVANCED },
    { desc: "Not owning any gloves or shoes.", feeling: Feeling.UNHAPPY, pack: Pack.ADVANCED },
    { desc: "Owning furniture that creaks and wobbles.", feeling: Feeling.UNHAPPY, pack: Pack.ADVANCED },


    // EXPERT
    { desc: "Owning luxury skincare or beauty products.", pack: Pack.EXPERT },
    { desc: "Owning a high-definition (TV) screen.", pack: Pack.EXPERT },
    { desc: "Owning exclusively green or eco-friendly items.", pack: Pack.EXPERT },
    { desc: "Owning a subscription for cheap public transportation.", pack: Pack.EXPERT },
    { desc: "Owning all musical instruments in the world.", pack: Pack.EXPERT },
    { desc: "Owning a bike.", pack: Pack.EXPERT },
    { desc: "Having holes or stains in your clothing.", feeling: Feeling.UNHAPPY, pack: Pack.EXPERT },
    { desc: "Wearing clothing that's from a different era.", feeling: Feeling.UNHAPPY, pack: Pack.EXPERT },
    { desc: "Receiving presents that don't align with your personal values.", feeling: Feeling.UNHAPPY, pack: Pack.EXPERT },
    { desc: "Receiving an inheritance full of worthless junk.", feeling: Feeling.UNHAPPY, pack: Pack.EXPERT },
    { desc: "Having an unpleasant smell in your home you can't get rid of.", feeling: Feeling.UNHAPPY, pack: Pack.EXPERT },
    { desc: "Having an overcrowded room.", feeling: Feeling.UNHAPPY, pack: Pack.EXPERT },
    

    // INTERESTING ITEMS
    { desc: "Owning a home.", pack: Pack.ITEMS },
    { desc: "Owning premium yoga mats.", pack: Pack.ITEMS },
    { desc: "Owning a massage chair.", pack: Pack.ITEMS },
    { desc: "Owning a smart watch.", pack: Pack.ITEMS },
    { desc: "Owning a stylish handbag.", pack: Pack.ITEMS },
    { desc: "Owning trendy sunglasses.", pack: Pack.ITEMS },
    { desc: "Owning limited editions of something.", pack: Pack.ITEMS },
    { desc: "Owning antique items.", pack: Pack.ITEMS },
    { desc: "Owning collector's items or memorabilia.", pack: Pack.ITEMS },
    { desc: "Owning a stylish suitcase or travel gear.", pack: Pack.ITEMS },
    { desc: "Owning high-quality cookware or knives.", pack: Pack.ITEMS },
    { desc: "Owning a gourmet set.", pack: Pack.ITEMS },
    { desc: "Having a subscription to a food delivery service.", pack: Pack.ITEMS },
    { desc: "Having a subscription to a magazine.", pack: Pack.ITEMS },
    { desc: "Having a subscription to a newspaper.", pack: Pack.ITEMS },
    { desc: "Owning high-end perfumes or colognes.", pack: Pack.ITEMS },
    { desc: "Owning a VR (Virtual Reality) headset.", pack: Pack.ITEMS },
    { desc: "Owning a dedicated workshop for your hobbies.", pack: Pack.ITEMS },
    { desc: "Owning premium tools for creative pursuits.", pack: Pack.ITEMS },
    { desc: "Having a subscription to quality education or workshops.", pack: Pack.ITEMS },
    { desc: "Having large savings in your bank account.", pack: Pack.ITEMS },
    { desc: "Owning a fitness tracker.", pack: Pack.ITEMS },
    { desc: "Owning a lot of educational or self-improvement books.", pack: Pack.ITEMS },
    { desc: "Having a subscription that allows easy and cheap travel anywhere.", pack: Pack.ITEMS },
    { desc: "Owning a vacuum cleaner.", pack: Pack.ITEMS },
    { desc: "Owning lots of jewelry.", pack: Pack.ITEMS },
    { desc: "Owning many stylish hats.", pack: Pack.ITEMS },
    { desc: "Receiving lots of gifts on a daily basis.", pack: Pack.ITEMS },
    { desc: "Owning a surround sound system.", pack: Pack.ITEMS },
    { desc: "Owning ergonomic furniture.", pack: Pack.ITEMS },
    { desc: "Owning all office supplies you'd ever need for work.", pack: Pack.ITEMS },
    { desc: "Owning beautiful shoes for all situations.", pack: Pack.ITEMS },
    { desc: "Owning a first aid kit.", pack: Pack.ITEMS },
    { desc: "Securing your home with a smart alert system.", pack: Pack.ITEMS },
    { desc: "Accidentally spoiling your favorite food.", feeling: Feeling.UNHAPPY, pack: Pack.ITEMS },
    { desc: "Owning furniture in wildly different styles.", feeling: Feeling.UNHAPPY, pack: Pack.ITEMS },
    { desc: "Having many pieces of artwork in your home that you find ugly.", feeling: Feeling.UNHAPPY, pack: Pack.ITEMS },
    { desc: "Wanting to exercise but not having the (right) fitness equipment.", feeling: Feeling.UNHAPPY, pack: Pack.ITEMS },
    { desc: "Not owning a car.", feeling: Feeling.UNHAPPY, pack: Pack.ITEMS },

    // SILLY
    { desc: "Receiving food as a birthday present from your best friend, but it's disgusting.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Owning a bike that usually has a flat tire.", feeling: Feeling.AWKWARD, pack: Pack.SILLY  },
    { desc: "Owning a car that constantly breaks down.", feeling: Feeling.AWKWARD, pack: Pack.SILLY  },
    { desc: "Owning clothing with embarrassing slogans or graphics.", feeling: Feeling.AWKWARD, pack: Pack.SILLY  },
    { desc: "Accidentally wearing clothes inside out or backward.", feeling: Feeling.AWKWARD, pack: Pack.SILLY  },
    { desc: "Carrying or dropping embarrassing products in a public place.", feeling: Feeling.AWKWARD, pack: Pack.SILLY  },
    { desc: "Owning an outdated phone while working at a modern tech company.", feeling: Feeling.AWKWARD, pack: Pack.SILLY  },
    { desc: "Carrying a heavy and bulky laptop around everywhere you go.", feeling: Feeling.AWKWARD, pack: Pack.SILLY  },
    { desc: "Accidentally losing embarrassing personal items in a shared space.", feeling: Feeling.AWKWARD, pack: Pack.SILLY  },
    { desc: "Losing or misplacing valuable items.", feeling: Feeling.AWKWARD, pack: Pack.SILLY  },
    { desc: "Wearing shoes that are too tight or too large.", feeling: Feeling.AWKWARD, pack: Pack.SILLY  },
    { desc: "Unintentional exposure of body parts due to clothing gaps or tears.", feeling: Feeling.AWKWARD, pack: Pack.SILLY  },
    { desc: "Exclusively owning accessories that are cool but make lots of loud noises.", feeling: Feeling.AWKWARD, pack: Pack.SILLY  },
    { desc: "Owning many smart devices that accidentally activate or respond to your voice all the time.", feeling: Feeling.AWKWARD, pack: Pack.SILLY  },
    { desc: "Accidentally revealing your medications in public.", feeling: Feeling.AWKWARD, pack: Pack.SILLY  },
    { desc: "Carrying boxes or products with embarrassing labels in public.", feeling: Feeling.AWKWARD, pack: Pack.SILLY  },
    { desc: "Learning your favorite and most valuable object was actually stolen.", feeling: Feeling.AWKWARD, pack: Pack.SILLY  },
    { desc: "Owning a recumbent (horizontal bike).", feeling: Feeling.AWKWARD, pack: Pack.SILLY  },
    { desc: "Being confronted with photos of you as a naked baby, all over the internet.", feeling: Feeling.AWKWARD, pack: Pack.SILLY  },
    { desc: "Bringing your computer to tech support in a rage, where they explain that you forgot to plug it in.", feeling: Feeling.AWKWARD, pack: Pack.SILLY  },

];

// ACTION: Something you do, purposely, yourself.
const ACTION_CARDS:CategoryDataList = [
    // BASE
    { desc: "Exercising.", pack: Pack.BASE },
    { desc: "Attending a music festival.", pack: Pack.BASE },
    { desc: "Going to the cinema.", pack: Pack.BASE },
    { desc: "Hiking in nature.", pack: Pack.BASE },
    { desc: "Visiting a shopping mall.", pack: Pack.BASE },
    { desc: "Cleaning up your room.", pack: Pack.BASE },
    { desc: "Going on a vacation.", pack: Pack.BASE },
    { desc: "Celebrating your birthday.", pack: Pack.BASE },
    { desc: "Giving a public speech.", pack: Pack.BASE },
    { desc: "Being a workaholic.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },
    { desc: "Causing an accident.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },
    { desc: "Lying to somebody to make your own life easier.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },

    // ADVANCED
    { desc: "Meditating.", pack: Pack.ADVANCED },
    { desc: "Going to the theatre.", pack: Pack.ADVANCED },
    { desc: "Visiting a theme park.", pack: Pack.ADVANCED },
    { desc: "Giving a donation to a charity.", pack: Pack.ADVANCED },
    { desc: "Going to a party or going out at night.", pack: Pack.ADVANCED },
    { desc: "Visiting the beach.", pack: Pack.ADVANCED },
    { desc: "Engaging in outdoor activities.", pack: Pack.ADVANCED },
    { desc: "Hang out with friends or family.", pack: Pack.ADVANCED },
    { desc: "Achieving success by being reckless or unsafe.", feeling: Feeling.UNHAPPY, pack: Pack.ADVANCED },
    { desc: "Watching a film alone.", pack: Pack.ADVANCED },
    { desc: "Watching a film with a loved one.", pack: Pack.ADVANCED },
    { desc: "Trying a new activity.", pack: Pack.ADVANCED },
    { desc: "Achieving success in a field that's opposite your parent's expectations.", pack: Pack.ADVANCED },

    // EXPERT
    { desc: "Taking a road trip.", pack: Pack.EXPERT },
    { desc: "Helping a struggling student with extra free lessons.", pack: Pack.EXPERT },
    { desc: "Organizing a big social event.", pack: Pack.EXPERT },
    { desc: "Visiting a new place on earth.", pack: Pack.EXPERT },
    { desc: "Immersing yourself in a new culture.", pack: Pack.EXPERT },
    { desc: "Volunteering.", pack: Pack.EXPERT },
    { desc: "Participating in a sports competition.", pack: Pack.EXPERT },
    { desc: "Visiting the zoo.", pack: Pack.EXPERT },
    { desc: "Exhibiting artistic work.", pack: Pack.EXPERT },
    { desc: "Performing on stage or in public.", pack: Pack.EXPERT },
    { desc: "Leading community projects or initiatives.", pack: Pack.EXPERT },
    { desc: "Helping kids develop their talents.", pack: Pack.EXPERT },

    // SILLY
    { desc: "Stumbling or falling while in public.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Mistaking someone's identity.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Accidentally exposing clothing in an embarrassing way.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Sending a text or email to the wrong person.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Misunderstanding a joke or comment and responding inappropriately.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Accidentally saying something inappropriate in a formal setting.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Sneezing or coughing loudly in a quiet environment.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Accidentally sending a message to the wrong person.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Using the wrong fork or utensil at a formal dinner.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Spilling food or drink on oneself or others.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Accidentally liking or commenting on an old post while stalking someone's profile.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Posting a message or photo to the wrong social media account.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Forgetting someone's name immediately after introduction.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Getting famous for a role because of how badly you played it.", feeling: Feeling.UNHAPPY, pack: Pack.SILLY },
    
    { desc: "Winning a public speaking contest, then freezing during the thank-you speech.", feeling: Feeling.UNHAPPY, pack: Pack.SILLY },
    { desc: "Going viral for a post or video that was intended to be private.", feeling: Feeling.UNHAPPY, pack: Pack.SILLY },
    { desc: "Becoming (social media) famous for an embarrassing moment.", feeling: Feeling.UNHAPPY, pack: Pack.SILLY },
    { desc: "Winning a competition because everyone else was disqualified.", feeling: Feeling.UNHAPPY, pack: Pack.SILLY },
    { desc: "Becoming famous for having the largest collection of some weird item.", feeling: Feeling.UNHAPPY, pack: Pack.SILLY },
    { desc: "Getting famous because of an unconventional hobby you really wanted to keep a secret.", pack: Pack.SILLY },


];

// GOAL: something that can be achieved or done at a single point in time
const GOAL_CARDS:CategoryDataList = [
    // BASE
    { desc: "Accomplishing an item from your bucket list.", pack: Pack.BASE },
    { desc: "Getting married.", pack: Pack.BASE },
    { desc: "Getting a baby.", pack: Pack.BASE },
    { desc: "Graduating from high school or university.", pack: Pack.BASE },
    { desc: "Gaining a new friend.", pack: Pack.BASE },
    { desc: "Ending a bad relationship.", pack: Pack.BASE },
    { desc: "Completing a personal project.", pack: Pack.BASE },
    { desc: "Getting a boyfriend or girlfriend.", pack: Pack.BASE },
    { desc: "Achieving your fitness goals.", pack: Pack.BASE },
    { desc: "Failing to meet a deadline.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },
    { desc: "Getting rich.", pack: Pack.BASE },
    { desc: "Getting famous.", pack: Pack.BASE },
    { desc: "Winning awards (for your work).", pack: Pack.BASE },

    // ADVANCED
    { desc: "Composing a song.", pack: Pack.ADVANCED },
    { desc: "Finishing a drawing or painting.", pack: Pack.ADVANCED },
    { desc: "Finishing a novel.", pack: Pack.ADVANCED },
    { desc: "Learning a new language.", pack: Pack.ADVANCED },
    { desc: "Being the leader of a business or organization.", pack: Pack.ADVANCED },
    { desc: "Winning a sports competition.", pack: Pack.ADVANCED },
    { desc: "Getting a pet.", pack: Pack.ADVANCED },
    { desc: "Failing to finish a personal project or goal.", feeling: Feeling.UNHAPPY, pack: Pack.ADVANCED },
    { desc: "Failing to stick to (New Year's) resolutions.", pack: Pack.ADVANCED },
    { desc: "Paying off debts or loans.", pack: Pack.ADVANCED },

    // EXPERT
    { desc: "Getting engaged.", pack: Pack.EXPERT },
    { desc: "Losing a debate.", feeling: Feeling.UNHAPPY, pack: Pack.EXPERT },
    { desc: "Winning a debate.", pack: Pack.EXPERT },
    { desc: "Achieving professional success, but at the cost of your personal life.", feeling: Feeling.UNHAPPY, pack: Pack.EXPERT },
    { desc: "Acquiring a high-paying job that doesn't interest you at all.", feeling: Feeling.UNHAPPY, pack: Pack.EXPERT },
    { desc: "Having lots of likes and comments on your social media.", feeling: Feeling.UNHAPPY, pack: Pack.EXPERT },
    { desc: "Successfully fundraising for or starting a charitable initiative.", pack: Pack.EXPERT },
    { desc: "Completing a certification or achieving academic honors.", pack: Pack.EXPERT },
    { desc: "Achieving academic honors or awards.", pack: Pack.EXPERT },
    { desc: "Being successful in whatever field you want.", feeling: Feeling.HAPPY, pack: Pack.EXPERT },
    { desc: "Achieving savings or investment goals.", pack: Pack.EXPERT },
    { desc: "Reaching the income you think will give financial stability.", pack: Pack.EXPERT },
    { desc: "Receiving recognition for community service.", pack: Pack.EXPERT },

    // SILLY
    { desc: "Tripping on stage when moving to receive an award.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Participating in a talent show with an embarrassing talent.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Wearing clothes that don't match at all.", pack: Pack.SILLY },
    { desc: "Accidentally being naked in public.", pack: Pack.SILLY },
    { desc: "Singing out loud when you thought nobody could here you, but they could.", pack: Pack.SILLY },


];

// CHANGE: A hypothetical change to the future world.
const CHANGE_CARDS:CategoryDataList = [

    // BASE
    { desc: "Future: it's forbidden to look at a screen for more than 4 hours a day.", pack: Pack.BASE },
    { desc: "Future: everyone receives a livable wage for free, as AI makes jobs go extinct.", pack: Pack.BASE },
    { desc: "Future: school disappears as everyone learns on the job.", pack: Pack.BASE },
    { desc: "Future: everyone works from home.", pack: Pack.BASE },
    { desc: "Future: all vehicles are autonomous; driving your car yourself is even illegal.", pack: Pack.BASE },
    { desc: "Future: the government surveills everything you do, lowering crime rates tremendously.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },
    { desc: "Future: everyone is genetically modified to have the same skin tone.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },
    { desc: "Future: everyone is genetically modified to be the same gender.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },
    { desc: "Future: genetic modification allows parents to design their perfect baby.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },
    { desc: "Future: everything happens in virtual reality.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },

    // ADVANCED
    { desc: "Future: every part of life turns into a competition.", pack: Pack.ADVANCED },
    { desc: "Future: every part of life can only be done through collaboration.", pack: Pack.ADVANCED },
    { desc: "Future: genetic modification gets rid of almost all disease.", pack: Pack.ADVANCED },
    { desc: "Future: lying becomes illegal.", pack: Pack.ADVANCED },
    { desc: "Future: genetic experiments caused people with superpowers to actually exist.", pack: Pack.ADVANCED },
    { desc: "Future: all human doctors are replaced by AI.", pack: Pack.ADVANCED },
    { desc: "Future: the age of adulthood lowers from 18 to 12.", pack: Pack.ADVANCED },
    { desc: "Future: the age of adulthood rises from 18 to 26.", pack: Pack.ADVANCED },
    { desc: "Future: all languages merge into one global language everyone speaks.", pack: Pack.ADVANCED },
    { desc: "Future: all countries merge into one country per continent.", feeling: Feeling.UNHAPPY, pack: Pack.ADVANCED },

    // ExPERT
    { desc: "Future: an algorithm decides how much money and rights you earn based on your behavior.", feeling: Feeling.UNHAPPY, pack: Pack.EXPERT },
    { desc: "Future: privacy and secrets turned from a right into a crime.", feeling: Feeling.UNHAPPY, pack: Pack.EXPERT },
    { desc: "Future: all buildings are skyscrapers, to get enough housing for all.", pack: Pack.EXPERT },
    { desc: "Future: you can only use as much electricity as your personal solar panels provide.", pack: Pack.EXPERT },
    { desc: "Future: everyone gets a chip inside their brain to become hyperintelligent.", feeling: Feeling.UNHAPPY, pack: Pack.EXPERT },
    { desc: "Future: marriage becomes illegal.", pack: Pack.EXPERT },
    { desc: "Future: religion becomes illegal.", pack: Pack.EXPERT },
    { desc: "Future: science becomes illegal.", feeling: Feeling.UNHAPPY, pack: Pack.EXPERT },
    { desc: "Future: humans live on planets across the whole solar system.", pack: Pack.EXPERT },
    { desc: "Future: climate change is allowed to happen and we merely adapt.", feeling: Feeling.UNHAPPY, pack: Pack.EXPERT },
    { desc: "Future: humans become immortal, but bearing any more children is now illegal.", feeling: Feeling.UNHAPPY, pack: Pack.EXPERT },
    { desc: "Future: all countries on earth follow the exact same constitution full of compromises.", pack: Pack.EXPERT },
    { desc: "Future: all physical money is gone; all currency is just numbers on a computer now.", pack: Pack.EXPERT },
    { desc: "Future: all drugs are legalized.", pack: Pack.EXPERT },
    { desc: "Future: humans go back to living in tiny self-sustained villages.", pack: Pack.EXPERT },
    
    // SILLY
    { desc: "Future: the weekend is 3 days.", pack: Pack.SILLY },
    { desc: "Future: every time you procrastinate, 5 dollar leaves your bank account.", pack: Pack.SILLY },
    { desc: "Future: prisons are abandoned; nobody knows where criminals go.", pack: Pack.SILLY },
    { desc: "Future: you kiss as a greeting instead of shaking hands.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Future: you high-five as a greeting instead of shaking hands.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Future: everything you search online is public information", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Future: it becomes illegal to have a city with more than 5,000 inhabitants.", pack: Pack.SILLY },
    { desc: "Future: every part of life turns into a game.", pack: Pack.SILLY },
    { desc: "Future: to get more housing, everyone from the same family must live in the same building.", feeling: Feeling.UNHAPPY, pack: Pack.SILLY },
    { desc: "Future: you must leave your parent's home at age 14.", pack: Pack.SILLY },

    // PAST
    { desc: "Past: all bad memories are erased.", pack: Pack.PAST },
    { desc: "Past: you can redo one crucial decision.", pack: Pack.PAST },
    { desc: "Past: you can pick one year and undo all that happened then.", pack: Pack.PAST },
    { desc: "Past: the online search history of your entire life becomes public", feeling: Feeling.AWKWARD, pack: Pack.PAST },
    { desc: "Past: you can move your date of birth by at most 20 years.", pack: Pack.PAST },
    { desc: "Past: a magic book recorded everything you ever said, and is now readable by all.", feeling: Feeling.AWKWARD, pack: Pack.PAST },
    { desc: "Past: you get the chance to go back and study more while at school.", feeling: Feeling.UNHAPPY, pack: Pack.PAST },
    { desc: "Past: once you realized you love someone, the feeling never goes away for the rest of your life.", pack: Pack.PAST },
    { desc: "Past: every time you ate unhealthy food shortens your life by 1 hour.", feeling: Feeling.UNHAPPY, pack: Pack.PAST },
    { desc: "Past: every time you lied shortens your life by 1 hour.", pack: Pack.PAST },
    { desc: "Past: every book you've read suddenly becomes true.", feeling: Feeling.AWKWARD, pack: Pack.PAST },
    { desc: "Past: you discover that every time you drank water, you've depleted the amount of water that will ever be available on Earth.", feeling: Feeling.UNHAPPY, pack: Pack.PAST },
    { desc: "Past: all your handwritten notes of past year suddenly become public knowledge.", pack: Pack.PAST },
    { desc: "Past: if you were ever friends with a criminal, you also go to jail.", feeling: Feeling.UNHAPPY, pack: Pack.PAST },
    { desc: "Past: when you die, it's mandatory to list statistics about your life, such as how much money you spent or how many days you were unemployed.", pack: Pack.PAST },
    { desc: "Past: every time you cheated in school shortens your life by 1 day.", pack: Pack.PAST },
    { desc: "Past: in your will, you can ask a special agency to erase your life entirely (from people's minds or physical evidence) when you die.", pack: Pack.PAST },
    { desc: "Past: you can go back in time and kiss one person you didn't kiss.", pack: Pack.PAST },
    { desc: "Past: you can go back in time and undo one bad habit before it starts.", pack: Pack.PAST },
    { desc: "Past: you can go back in time and repeat a good habit ten times as often.", pack: Pack.PAST },
    { desc: "Past: you learn that you were adopted and your whole life was an act.", feeling: Feeling.AWKWARD, pack: Pack.PAST },
    { desc: "Past: you discover all conspiracy theories are actually true.", feeling: Feeling.UNHAPPY, pack: Pack.PAST },
    { desc: "Past: you can change the place where you were born.", pack: Pack.PAST },
    { desc: "Past: you discover your entire childhood was filmed and televised.", feeling: Feeling.AWKWARD, pack: Pack.PAST },
    { desc: "Past: you can pick one thing you know that you want to unlearn (forever).", pack: Pack.PAST },
    { desc: "Past: you can change your gender when you were born.", pack: Pack.PAST },
    { desc: "Past: you can pick one skill to give yourself as an immense talent since you were a baby.", pack: Pack.PAST },
    { desc: "Past: you were a child actor.", pack: Pack.PAST },
    { desc: "Past: you can undo one friendship or relationship as if it never existed.", pack: Pack.PAST },

];

// HABIT: A potential habit you could have every day / week / month / year
const HABIT_CARDS:CategoryDataList = [
    // BASE
    { desc: "Every day, you call your best friend and chat for an hour.", pack: Pack.BASE },
    { desc: "You adopt the minimalist lifestyle.", pack: Pack.BASE },
    { desc: "Every night, you write into your journal.", pack: Pack.BASE },
    { desc: "Each day, you prioritize success over all else.", pack: Pack.BASE },
    { desc: "You only buy items that look like or remind you of nature.", pack: Pack.BASE },
    { desc: "Each day, you have a limit of 10 digital messages or emails at most.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },
    { desc: "Each week, you check how many likes you have against the profiles of your friends.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },
    { desc: "Every night, you watch the same movie to help you fall asleep.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },
    { desc: "You can't help but complain immediately whenever you have a negative feeling.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },
    { desc: "Any time you have money, you immediately spend it on the first thing you see.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },
    { desc: "Procrastinating and always finishing things just before or after the deadline.", pack: Pack.BASE },
    { desc: "Taking on more responsibilities than you can handle.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },
    { desc: "You never do what you say, or say what you do.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },

    // ADVANCED
    { desc: "Each day, you prioritize monetary gain over all else.", pack: Pack.ADVANCED },
    { desc: "While eating, you are always silent and practice mindfulness.", pack: Pack.ADVANCED },
    { desc: "Every weekend, you spend the entire weekend visiting new forests.", pack: Pack.ADVANCED },
    { desc: "Each day, you tend to your personal (kitchen) garden.", pack: Pack.ADVANCED },
    { desc: "You spend a lot of time every day to separate waste and recycle as much as possible.", pack: Pack.ADVANCED },
    { desc: "You start each day by scrolling on your phone for an hour.", feeling: Feeling.UNHAPPY, pack: Pack.ADVANCED },
    { desc: "Each year, you completely swap your friends for new friends.", feeling: Feeling.UNHAPPY, pack: Pack.ADVANCED },
    { desc: "Each day must contain one hour without using electricity for anything.", pack: Pack.ADVANCED },
    { desc: "Every weekend, you isolate yourself to focus on artistic pursuits.", pack: Pack.ADVANCED },
    { desc: "You cannot multitask in any way.", pack: Pack.ADVANCED },
    { desc: "You can't be productive while other people are present.", pack: Pack.ADVANCED },
    { desc: "Each day, you may only sit for at most an hour.", pack: Pack.ADVANCED },

    // EXPERT
    { desc: "Each day, you prioritize comfort and coziness over all else.", pack: Pack.EXPERT },
    { desc: "Each day, you try to experience one new thing.", pack: Pack.EXPERT },
    { desc: "Every weekend, you fast (no eating, only drinking).", pack: Pack.EXPERT },
    { desc: "If you haven't used something in a year, you give it away for free.", pack: Pack.EXPERT },
    { desc: "Every month, you plant a new tree.", pack: Pack.EXPERT },
    { desc: "You adopt Stoicism (focus on what you can control and ignore all else).", pack: Pack.EXPERT },
    { desc: "Each day, you practice a religion with others.", feeling: Feeling.UNHAPPY, pack: Pack.EXPERT },
    { desc: "Each month, you make a detailed plan for the next month.", pack: Pack.EXPERT },
    { desc: "You never make to-do lists or know what will happen tomorrow.", pack: Pack.EXPERT },

    // HORRIBLE HABITS
    { desc: "Every week, you Google your name to see if there's any news about you.", feeling: Feeling.UNHAPPY, pack: Pack.HABITS },
    { desc: "Every month, you look back on what you did the past month and seek ways to perfect your accomplishments.", pack: Pack.HABITS },
    { desc: "Any time you hear something, you always assume the worst.", feeling: Feeling.UNHAPPY, pack: Pack.HABITS },
    { desc: "Any time you see a stranger, you immediately make hundreds of assumptions about them.", pack: Pack.HABITS },
    { desc: "You say no to everything that sounds even a little hard.", pack: Pack.HABITS },
    { desc: "You say yes to everything despite how hard or challenging it might be.", pack: Pack.HABITS },
    { desc: "You can't help honestly listing all your flaws to any new person you meet.", pack: Pack.HABITS },
    { desc: "You either start a relationship after the first date, or never go on a second date.", pack: Pack.HABITS },
    { desc: "You can't talk to somebody while looking them in the eye.", feeling: Feeling.UNHAPPY, pack: Pack.HABITS },
    { desc: "Your dreams are always about past mistakes and failures.", feeling: Feeling.UNHAPPY, pack: Pack.HABITS },
    { desc: "When you're stressed, you start speaking literal nonsense.", pack: Pack.HABITS },
    { desc: "Whenever you're tired, you become furious at everything.", feeling: Feeling.UNHAPPY, pack: Pack.HABITS },
    { desc: "When you're afraid, you become a racist.", feeling: Feeling.UNHAPPY, pack: Pack.HABITS },
    { desc: "You maintain great hygiene habits at all costs.", pack: Pack.HABITS },
    { desc: "You maintain great fitness habits at all costs.", pack: Pack.HABITS },
    { desc: "You must sleep 12 hours a day to feel rested.", pack: Pack.HABITS },
    { desc: "You can feel rested and healthy on only 4 hours of sleep each day.", pack: Pack.HABITS },
    { desc: "You refuse to read anything, requiring all information to come in audio or video format.", feeling: Feeling.UNHAPPY, pack: Pack.HABITS },
    { desc: "You can't set personal boundaries.", pack: Pack.HABITS },
    { desc: "Every time somebody indicates a personal boundary, you immediately cross it.", feeling: Feeling.UNHAPPY, pack: Pack.HABITS },
    { desc: "Every hour, you must take a 5 minute break in which you do absolutely nothing.", pack: Pack.HABITS },
    { desc: "Each day starts with a cold shower.", pack: Pack.HABITS },
    { desc: "You only allow yourself to eat after exercising for 15 minutes.", pack: Pack.HABITS },
    { desc: "You never stay in a relationship for longer than a year.", feeling: Feeling.UNHAPPY, pack: Pack.HABITS },
    { desc: "Each day, you practice your own made-up religion.", feeling: Feeling.UNHAPPY, pack: Pack.HABITS },

    // SILLY
    { desc: "You talk to objects as if they were people and can't turn that off.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "You end each day with a conversation with your imaginary friend.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Any time you meet a friend, you do an elaborate improvised handshake.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "You can't speak more than one sentence without inserting a bad pun or joke.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Each day, half your steps must be taken backward to keep your body on its toes.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "You burst into laughter for no reason at specific timestamps.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Each day, you speak with a different exaggerated accent.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Anytime you're bored, you perform an air guitar solo.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "You think by engaging in conversations with yourself using sock poppets.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Each day, you must pop at least a hundred bubble wraps to relieve stress.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Whistling or humming whenever you feel it's too silent in a room.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Each day, you pick a new favorite song, and sing it at random moments.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Whenever you do something, you add a sound effect for fun.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "You always wear sunglasses indoor, and no sunglasses outdoor.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Every child of yours gets their own pet to care for.", pack: Pack.SILLY },
    { desc: "You can only multitask.", pack: Pack.SILLY },
    { desc: "You are obsessed with brushing teeth and do it all day.", pack: Pack.SILLY },
    { desc: "Every time you cook a meal, you dance while doing it.", pack: Pack.SILLY },

];

// PERSONAL: Anything that relates to your specific personality and the people around you (partner, friends, family, neighbors)
const PERSONAL_CARDS:CategoryDataList = [
    // BASE
    { desc: "Living far away from friends and family.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },
    { desc: "Having no friends.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },
    { desc: "Having loads and loads of friends.", pack: Pack.BASE },
    { desc: "Having to accuse a loved one of something illegal.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },
    { desc: "Being forced to heavily criticize a person close to you.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },
    { desc: "Feeling unfilfilled in your love life.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },
    { desc: "Death of a loved one.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },
    { desc: "Lying to a loved one for their sake.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },
    { desc: "Family members lying to you.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },
    { desc: "Leaving a legacy.", pack: Pack.BASE },
    { desc: "Being excluded from a social gathering or event.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },
    { desc: "Getting the chance to be a kid again for a single year.", feeling: Feeling.HAPPY, pack: Pack.BASE },
    { desc: "Getting the chance to be a wise elderly person for a single year.", feeling: Feeling.HAPPY, pack: Pack.BASE },

    // ADVANCED
    { desc: "Having only a few social connections.", pack: Pack.ADVANCED },
    { desc: "Death of someone you barely knew.", feeling: Feeling.UNHAPPY, pack: Pack.ADVANCED },
    { desc: "Losing your pet.", feeling: Feeling.UNHAPPY, pack: Pack.ADVANCED },
    { desc: "Friends lying to you.", feeling: Feeling.UNHAPPY, pack: Pack.ADVANCED },
    { desc: "Perfectly matching others' opinions of you.", feeling: Feeling.HAPPY, pack: Pack.ADVANCED },
    { desc: "Everybody approves of you and your actions.", feeling: Feeling.HAPPY, pack: Pack.ADVANCED },
    { desc: "Being authentic.", feeling: Feeling.HAPPY, pack: Pack.ADVANCED },
    { desc: "Being perfectionist.", feeling: Feeling.HAPPY, pack: Pack.ADVANCED },
    { desc: "Having low self-esteem or self-worth.", feeling: Feeling.UNHAPPY, pack: Pack.ADVANCED },
    { desc: "Feeling like you're weird or abnormal.", feeling: Feeling.UNHAPPY, pack: Pack.ADVANCED },
    { desc: "Not meeting the expectations of your friends or parents", feeling: Feeling.UNHAPPY, pack: Pack.ADVANCED },
    { desc: "Realizing your biggest dream or aspiration is literally unachievable.", feeling: Feeling.UNHAPPY, pack: Pack.ADVANCED },
    { desc: "Feeling content with yourself, whatever happens.", feeling: Feeling.HAPPY, pack: Pack.ADVANCED },

    // EXPERT
    { desc: "Getting divorced.", pack: Pack.EXPERT },
    { desc: "Separation with a loved one.", feeling: Feeling.UNHAPPY, pack: Pack.EXPERT },
    { desc: "Feeling unfulfilled or unchallenged mentally.", feeling: Feeling.UNHAPPY, pack: Pack.EXPERT },
    { desc: "Feeling unfulfilled with your achievements.", feeling: Feeling.UNHAPPY, pack: Pack.EXPERT },
    { desc: "Being loose and easy-going.", feeling: Feeling.HAPPY, pack: Pack.EXPERT },
    { desc: "Feeling comfortable with silence.", feeling: Feeling.HAPPY, pack: Pack.EXPERT },
    { desc: "Creating lasting change in the world.", pack: Pack.EXPERT },
    { desc: "Developing a consistent self-care routine.", pack: Pack.EXPERT },
    { desc: "Enjoying life ignoring all repurcussions.", pack: Pack.EXPERT },
    { desc: "Attending personal development workshops.", pack: Pack.EXPERT },

    // PERSONAL
    // @NOTE: the references to players are styled differently (lighter color, brackets around) to clarify this
    { desc: "Playing a game against the <col hex=\"#444444\">[player on your left]</col>.", pack: Pack.PERSONAL },
    { desc: "Going a night out with the <col hex=\"#444444\">[player on your right]</col>.", pack: Pack.PERSONAL },
    { desc: "Watching a movie with the <col hex=\"#444444\">[player on your left]</col>.", pack: Pack.PERSONAL },
    { desc: "Going to the theatre with the <col hex=\"#444444\">[player on your right]</col>.", pack: Pack.PERSONAL },
    { desc: "Sharing a bedroom with the <col hex=\"#444444\">[player on your left]</col>.", pack: Pack.PERSONAL },
    { desc: "Going on a long road trip with <col hex=\"#444444\">[player on your right]</col>.", pack: Pack.PERSONAL },
    { desc: "Having a large dinner with <col hex=\"#444444\">[all the current players]</col>.", pack: Pack.PERSONAL },
    { desc: "Forming a band with <col hex=\"#444444\">[all the current players]</col>.", pack: Pack.PERSONAL },
    { desc: "Starting a business with <col hex=\"#444444\">[all the current players]</col>.", pack: Pack.PERSONAL },
    { desc: "Starting a business with the <col hex=\"#444444\">[player on your left]</col>.", pack: Pack.PERSONAL },
    { desc: "Tutoring the <col hex=\"#444444\">[player on your right]</col> on a subject or skill.", pack: Pack.PERSONAL },
    { desc: "Sharing a prison cell with the <col hex=\"#444444\">[player on your left]</col>.", pack: Pack.PERSONAL },
    { desc: "Exercising or sporting together with the <col hex=\"#444444\">[player on your right]</col>.", pack: Pack.PERSONAL },
    { desc: "Showing your work for critique to the <col hex=\"#444444\">[player on your left]</col>.", pack: Pack.PERSONAL },
    { desc: "Discussing money struggles with the <col hex=\"#444444\">[player on your right]</col>.", pack: Pack.PERSONAL },
    { desc: "Asking the <col hex=\"#444444\">[player on your left]</col> for advice in relationships.", pack: Pack.PERSONAL },
    { desc: "Asking the <col hex=\"#444444\">[player on your right]</col> for advice in school or career.", pack: Pack.PERSONAL },
    { desc: "Attending a music festival with the <col hex=\"#444444\">[player on your left]</col>.", pack: Pack.PERSONAL },
    { desc: "Hiking or taking a long walk with the <col hex=\"#444444\">[player on your right]</col>.", pack: Pack.PERSONAL },
    { desc: "Visiting some historic or impressive landmark with <col hex=\"#444444\">[all the current players]</col>.", pack: Pack.PERSONAL },
    { desc: "Being the tour guide for the <col hex=\"#444444\">[player on your left]</col>.", pack: Pack.PERSONAL },
    { desc: "Going on a date with the <col hex=\"#444444\">[player on your right]</col>.", pack: Pack.PERSONAL },
    { desc: "Sharing your smartphone or computer with the <col hex=\"#444444\">[player on your left]</col>.", pack: Pack.PERSONAL },
    { desc: "Stepping into the shower right after the <col hex=\"#444444\">[player on your right]</col> used it.", pack: Pack.PERSONAL },
    { desc: "The <col hex=\"#444444\">[player on your left]</col> becoming the leader of your country.", pack: Pack.PERSONAL },
    { desc: "The <col hex=\"#444444\">[player on your right]</col> becoming your personal doctor.", pack: Pack.PERSONAL },
    { desc: "Using the <col hex=\"#444444\">[player on your left]</col> as your model for photography.", pack: Pack.PERSONAL },
    { desc: "Using the <col hex=\"#444444\">[player on your right]</col> as a role model for younger kids.", pack: Pack.PERSONAL },
    { desc: "Asking the <col hex=\"#444444\">[player on your left]</col> for permission every time you want to change jobs.", pack: Pack.PERSONAL },
    { desc: "Asking the <col hex=\"#444444\">[player on your right]</col> for permission every time you want to leave the house.", pack: Pack.PERSONAL },
    { desc: "Reading a book the <col hex=\"#444444\">[player on your left]</col> wrote.", pack: Pack.PERSONAL },
    { desc: "Using a product the <col hex=\"#444444\">[player on your right]</col> designed and produced.", pack: Pack.PERSONAL },
];

// JOB: Either a generic thing about work, or "Being a <specific job>"
const JOB_CARDS:CategoryDataList = [
    // BASE
    { desc: "Landing a new job or promotion.", pack: Pack.BASE },
    { desc: "Losing your current job.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },
    { desc: "Establishing a healthy work-life balance.", pack: Pack.BASE },
    { desc: "Starting a successful business.", pack: Pack.BASE },
    { desc: "Working for an oil company.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },
    { desc: "Working for the government.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },
    { desc: "Being a telemarketer.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },
    { desc: "Working at a bank.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },
    { desc: "Being a truck driver.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },
    { desc: "Working at a call center.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },
    { desc: "Being a musician.", pack: Pack.BASE },
    { desc: "Being in the army.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },
    { desc: "Being a chef or cook.", pack: Pack.BASE },
    { desc: "Being a doctor.", pack: Pack.BASE },
    { desc: "Being the leader of your country.", pack: Pack.BASE },

    // ADVANCED
    { desc: "Receiving recognition or awards at work.", pack: Pack.ADVANCED },
    { desc: "Being a gardener.", pack: Pack.ADVANCED },
    { desc: "Being an educator.", pack: Pack.ADVANCED },
    { desc: "Being a writer.", pack: Pack.ADVANCED },
    { desc: "Being an engineer.", pack: Pack.ADVANCED },
    { desc: "Being a scientist.", pack: Pack.ADVANCED },
    { desc: "Working in wildlife conservation.", pack: Pack.ADVANCED },
    { desc: "Your job pays well, but the work environment is hostile.", pack: Pack.ADVANCED },
    { desc: "Not meeting the expectations of your colleagues.", feeling: Feeling.UNHAPPY, pack: Pack.ADVANCED },
    { desc: "Working as humanitarian aid in conflict zones.", pack: Pack.ADVANCED },
    { desc: "Being a (social media) content moderator.", feeling: Feeling.UNHAPPY, pack: Pack.ADVANCED },
    { desc: "Being an animal testing researcher.", feeling: Feeling.UNHAPPY, pack: Pack.ADVANCED },
    { desc: "Working in customer support.", feeling: Feeling.UNHAPPY, pack: Pack.ADVANCED },
    { desc: "Being a (retail) salesperson.", feeling: Feeling.UNHAPPY, pack: Pack.ADVANCED },
    { desc: "Being a factory worker.", feeling: Feeling.UNHAPPY, pack: Pack.ADVANCED },

    // EXPERT
    { desc: "Being a celebrity.", pack: Pack.EXPERT },
    { desc: "Being a police officer.", pack: Pack.EXPERT },
    { desc: "Being a programmer.", pack: Pack.EXPERT },
    { desc: "Being an architect.", pack: Pack.EXPERT },
    { desc: "Being a veterinarian.", pack: Pack.EXPERT },
    { desc: "Being a game developer.", pack: Pack.EXPERT },
    { desc: "Being a professional athlete.", pack: Pack.EXPERT },
    { desc: "Being a foreclosure officer.", feeling: Feeling.UNHAPPY, pack: Pack.EXPERT },
    { desc: "Being a corrections officer in prison.", feeling: Feeling.UNHAPPY, pack: Pack.EXPERT },
    { desc: "Working at a nuclear power plant.", feeling: Feeling.UNHAPPY, pack: Pack.EXPERT },
    { desc: "Working in HR (Human Resources).", feeling: Feeling.UNHAPPY, pack: Pack.EXPERT },
    { desc: "Being a conflict zone journalist.", feeling: Feeling.UNHAPPY, pack: Pack.EXPERT },
    { desc: "Being a scammer.", feeling: Feeling.UNHAPPY, pack: Pack.EXPERT },
    { desc: "Being a debt collector.", feeling: Feeling.UNHAPPY, pack: Pack.EXPERT },

    // JOVIAL JOBS
    { desc: "Being a stunt actor.", pack: Pack.JOBS },
    { desc: "Working in unkempt nature.", pack: Pack.JOBS },
    { desc: "Being a surfing instructor.", pack: Pack.JOBS },
    { desc: "Being a chocolatier.", pack: Pack.JOBS },
    { desc: "Being a photographer.", pack: Pack.JOBS },
    { desc: "Being a life coach.", pack: Pack.JOBS },
    { desc: "Being a tour guide.", pack: Pack.JOBS },
    { desc: "Being a consultant.", pack: Pack.JOBS },
    { desc: "Being a museum curator.", pack: Pack.JOBS },
    { desc: "Being an archeologist.", pack: Pack.JOBS },
    { desc: "Being a traveler or explorer.", pack: Pack.JOBS },
    { desc: "Being an accountant.", pack: Pack.JOBS },
    { desc: "Being a web developer.", pack: Pack.JOBS },
    { desc: "Being a graphics designer.", pack: Pack.JOBS },
    { desc: "Being an illustrator.", pack: Pack.JOBS },
    { desc: "Being a painter.", pack: Pack.JOBS },
    { desc: "Being a fashion designer.", pack: Pack.JOBS },
    { desc: "Being a safety inspector.", pack: Pack.JOBS },
    { desc: "Being a firefighter.", pack: Pack.JOBS },
    { desc: "Being a farmer.", pack: Pack.JOBS },
    { desc: "Being a dancer.", pack: Pack.JOBS },
    { desc: "Being a spy.", pack: Pack.JOBS },
    { desc: "Being a baby.", pack: Pack.JOBS },
    { desc: "Being an astronaut.", pack: Pack.JOBS },
    { desc: "Being a baker.", pack: Pack.JOBS },
    { desc: "Being a judge.", pack: Pack.JOBS },
    { desc: "Working in mail or package delivery.", pack: Pack.JOBS },
    { desc: "Being a hairdresser.", pack: Pack.JOBS },
    { desc: "Being a lifeguard.", pack: Pack.JOBS },
    { desc: "Being an actress.", pack: Pack.JOBS },
    { desc: "Being a singer.", pack: Pack.JOBS },
    { desc: "Being a taxi driver.", pack: Pack.JOBS },
    { desc: "Being a pilot.", pack: Pack.JOBS },
    { desc: "Being an interior designer.", pack: Pack.JOBS },
    { desc: "Being a social worker.", pack: Pack.JOBS },
    { desc: "Being an event planner.", pack: Pack.JOBS },
    { desc: "Being a personal trainer.", pack: Pack.JOBS },
    { desc: "Being a travel blogger.", pack: Pack.JOBS },
    { desc: "Being an emotional support clown for kids.", feeling: Feeling.AWKWARD, pack: Pack.JOBS },
    { desc: "Working in a coal mine.", feeling: Feeling.UNHAPPY, pack: Pack.JOBS },
    { desc: "Working in insurance.", feeling: Feeling.UNHAPPY, pack: Pack.JOBS },
    { desc: "Working in fast food.", feeling: Feeling.UNHAPPY, pack: Pack.JOBS },
    { desc: "Being a garbage collector.", feeling: Feeling.UNHAPPY, pack: Pack.JOBS },
    { desc: "Being a janitor.", feeling: Feeling.UNHAPPY, pack: Pack.JOBS },

    // SILLY
    { desc: "Being a personal shopper for intimate items.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Being a human statue street performer.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Being the mascot of a theme park.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Being a speaking coach while having a speech impediment.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Being a romance novel cover model.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Being a human billboard advertiser.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Being a consultant for dating profiles.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Being a professional apology writer for celebrities.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Being an actor who specializes in crying scenes.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Being a test subject for social experiments.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Being a professional mourner at funerals.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Being a karaoke artist.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Being an uncredited lyrics writer for famous musicians.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Being a hand model.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Being a dance instructor for unconventional dance styles.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Being a balloon animal artist at an adult event.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Being a wedding crasher.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Being a smell tester (for fragrance companies).", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Being an emotional support clown for adults.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Being the coordinator for live audience responses during sitcom tapings.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Being a mime.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
];


// HEALTH: Anything related to physical or mental health.
const HEALTH_CARDS:CategoryDataList = [
    // BASE
    { desc: "Being depressed.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },
    { desc: "Being autistic.", pack: Pack.BASE },
    { desc: "Having a chronic illness", feeling: Feeling.UNHAPPY, pack: Pack.BASE },
    { desc: "Being deaf.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },
    { desc: "Being blind.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },
    { desc: "Having a minor disability.", pack: Pack.BASE },
    { desc: "Recovering after a long illness.", pack: Pack.BASE },
    { desc: "Being sick.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },
    { desc: "Having a six-pack (abs)", pack: Pack.BASE },
    { desc: "Getting injured.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },
    { desc: "Feeling too fat or too skinny.", feeling: Feeling.UNHAPPY, pack: Pack.BASE },

    // ADVANCED
    { desc: "Adopting a healthy lifestyle and sustaining it.", pack: Pack.ADVANCED },
    { desc: "Completing a fitness challenge (such as running a marathon).", pack: Pack.ADVANCED },
    { desc: "Suffering burn-out.", feeling: Feeling.UNHAPPY, pack: Pack.ADVANCED },
    { desc: "Witnessing someone being physically attacked.", feeling: Feeling.UNHAPPY, pack: Pack.ADVANCED },
    { desc: "Being physically attacked.", feeling: Feeling.UNHAPPY, pack: Pack.ADVANCED },
    { desc: "Being able to recover from every illness twice as quickly.", pack: Pack.ADVANCED },
    { desc: "Struggling with motivation for anything.", feeling: Feeling.UNHAPPY, pack: Pack.ADVANCED },
    { desc: "Struggling with mental health.", feeling: Feeling.UNHAPPY, pack: Pack.ADVANCED },
    { desc: "Being hyperactive.", pack: Pack.ADVANCED },

    // EXPERT
    { desc: "Being mute.", feeling: Feeling.UNHAPPY, pack: Pack.EXPERT },
    { desc: "You have a treatable illness, but it requires many years of fighting and money.", pack: Pack.EXPERT },
    { desc: "Achieving your perfect body through expensive medical operations.", feeling: Feeling.UNHAPPY, pack: Pack.EXPERT },
    { desc: "Getting extremely fit and good-looking at the cost of your personal life.", feeling: Feeling.UNHAPPY, pack: Pack.EXPERT },

    // SUPERPOWERS
    { desc: "Superpower: you stay true your personal values, whatever happens.", feeling: Feeling.HAPPY, pack: Pack.SUPER },
    { desc: "Superpower: you can never compare yourself to others.", feeling: Feeling.HAPPY, pack: Pack.SUPER },
    { desc: "Superpower: you don't understand the concept of lying.", feeling: Feeling.HAPPY, pack: Pack.SUPER },
    { desc: "Superpower: you speak all languages in the world.", feeling: Feeling.HAPPY, pack: Pack.SUPER },
    { desc: "Superpower: you don't need money, because your charm gets you everything.", feeling: Feeling.HAPPY, pack: Pack.SUPER },
    { desc: "Superpower: you can always get what you want, but only by overstepping personal boundaries.", feeling: Feeling.UNHAPPY, pack: Pack.SUPER },
    { desc: "Superpower: you can make anyone fall in love with you, but only if you find them unattractive.", feeling: Feeling.UNHAPPY, pack: Pack.SUPER },
    { desc: "Superpower: you celebrate even the tiniest milestones, like brushing your teeth or walking correctly.", feeling: Feeling.HAPPY, pack: Pack.SUPER },
    { desc: "Superpower: You can't walk or run, only skip really efficiently.", feeling: Feeling.AWKWARD, pack: Pack.SUPER },    
    { desc: "Superpower: You can teleport, but each time you forget why or where you landed.", pack: Pack.SUPER },
    { desc: "Superpower: You can read minds, but constantly hearing everyone's thoughts overwhelms you to no end.", pack: Pack.SUPER },
    { desc: "Superpower: You can time travel, but each time you do, you grow older twice as quickly.", pack: Pack.SUPER },
    { desc: "Superpower: You can become invisible, but you're also blind yourself when you do.", pack: Pack.SUPER },
    { desc: "Superpower: You have incredible strength, but actually using it always leads to some serious injury.", pack: Pack.SUPER },
    { desc: "Superpower: You can fly, but you also have vertigo.", feeling: Feeling.AWKWARD, pack: Pack.SUPER },
    { desc: "Superpower: You can heal any wound, but the pain from the wound transfers to you (physical or emotional).", pack: Pack.SUPER },
    { desc: "Superpower: You can shapeshift, but each time you lose a little more identity and memories of your true self.", pack: Pack.SUPER },
    { desc: "Superpower: You have telekinesis (moving objects with the mind), but you're completely paralyzed yourself.", feeling: Feeling.UNHAPPY, pack: Pack.SUPER },
    { desc: "Superpower: You control the weather, but the weather 100% influences your own emotions (e.g. thunder = angry).", feeling: Feeling.UNHAPPY, pack: Pack.SUPER },
    { desc: "Superpower: You are hyperintelligent, but each time you use it for something, you get closer to dementia.", feeling: Feeling.UNHAPPY, pack: Pack.SUPER },
    { desc: "Superpower: You can communicate with animals, but slowly turn into an animal yourself over time.", pack: Pack.SUPER },
    { desc: "Superpower: You can create fire at will, but doing so lowers your body temperature more and more.", pack: Pack.SUPER },
    { desc: "Superpower: You can alter memories, but only at the cost of randomly altering a memory of your own.", pack: Pack.SUPER },
    { desc: "Superpower: You can enter another person's body, but only by killing yourself.", feeling: Feeling.UNHAPPY, pack: Pack.SUPER },
    
]

export const CARDS:Record<Category, CategoryDataList> = 
{
    [Category.EVENT]: EVENT_CARDS,
    [Category.ITEM]: ITEM_CARDS,
    [Category.ACTION]: ACTION_CARDS,
    [Category.GOAL]: GOAL_CARDS,
    [Category.CHANGE]: CHANGE_CARDS,
    [Category.HABIT]: HABIT_CARDS,
    [Category.PERSONAL]: PERSONAL_CARDS,
    [Category.JOB]: JOB_CARDS,
    [Category.HEALTH]: HEALTH_CARDS
}