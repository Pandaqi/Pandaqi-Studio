enum Category
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

enum Pack
{
    BASE = "base",
    ADVANCED = "advanced",
    SILLY = "silly"
}

// @NOTE: I assign these pretty much based on what I feel in the moment; this obviously is subjective
enum Feeling
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
}

const CATEGORIES:Record<Category, CategoryMetaData> = 
{
    [Category.EVENT]: { frame: 0, colorBG: "@TODO", colorText: "@TODO" },
    [Category.ITEM]: { frame: 1, colorBG: "@TODO", colorText: "@TODO" },
    [Category.ACTION]: { frame: 2, colorBG: "@TODO", colorText: "@TODO" },
    [Category.GOAL]: { frame: 3, colorBG: "@TODO", colorText: "@TODO" },
    [Category.CHANGE]: { frame: 4, colorBG: "@TODO", colorText: "@TODO" },
    [Category.HABIT]: { frame: 5, colorBG: "@TODO", colorText: "@TODO" },
    [Category.PERSONAL]: { frame: 6, colorBG: "@TODO", colorText: "@TODO" },
    [Category.JOB]: { frame: 7, colorBG: "@TODO", colorText: "@TODO" },
    [Category.HEALTH]: { frame: 8, colorBG: "@TODO", colorText: "@TODO" }
}


interface CategoryData
{
    desc: string,
    feeling?: Feeling, // if not provided, assumes HAPPY
    pack?: Pack, // if not provided, assumes BASE
}
type CategoryDataList = CategoryData[];

//
// @NOTE: This is where all the actual content on cards is saved
//

// EVENT: Something that happens to you.
const EVENT_CARDS:CategoryDataList = [
    { desc: "Celebrating someone else's birthday." },
    { desc: "Celebrating a relationship anniversary." },
    { desc: "Seeing family members get a baby." },
    { desc: "A surprise visit from a friend or family member.", feeling: Feeling.AWKWARD },
    { desc: "Enjoying a beautiful sunset or sunrise." },
    { desc: "Receiving an unexpected gift.", feeling: Feeling.AWKWARD },
    { desc: "Celebrating a major holiday." },
    { desc: "A random act of kindness by a stranger." },
    { desc: "Learning something new." },
    { desc: "Learning something that goes against your current beliefs.", feeling: Feeling.AWKWARD },
    { desc: "Being reunited with a family member or friend you haven't seen in a long time." },
    { desc: "Organizing a game night with friends." },
    { desc: "Organizing a game night with family." },
    { desc: "Hearing good news." },
    { desc: "Hearing bad news.", feeling: Feeling.UNHAPPY },
    { desc: "Participating in a cultural or community event." },
    { desc: "Working an unfulfilling or unsatisfying job.", feeling: Feeling.UNHAPPY },
    { desc: "Suffering burn-out.", feeling: Feeling.UNHAPPY },
    { desc: "Witnessing someone being physically attacked.", feeling: Feeling.UNHAPPY },
    { desc: "Being physically attacked.", feeling: Feeling.UNHAPPY },
    { desc: "Losing all your money." },
    { desc: "Losing your social status (thrown out of groups and communities)." },
    { desc: "Being held back a year in school (or career).", feeling: Feeling.UNHAPPY },
    { desc: "Living in a poorly maintained and dangerous home.", feeling: Feeling.UNHAPPY },
    { desc: "Living next to a busy and noisy road.", feeling: Feeling.UNHAPPY },
    { desc: "Living in an incredibly quiet neighborhood." },
    { desc: "Living close to city center." },
    { desc: "Living in a rural area." },
    { desc: "Living in an area with polluted air.", feeling: Feeling.UNHAPPY },
    { desc: "Living close to a war zone.", feeling: Feeling.UNHAPPY },
    { desc: "Receiving heavy criticism about something." },
    { desc: "Being accused of something that's not illegal.", feeling: Feeling.UNHAPPY },
    { desc: "Being accused of something that's illegal.", feeling: Feeling.UNHAPPY },
    { desc: "Facing criminal charges.", feeling: Feeling.UNHAPPY },
    { desc: "Going through a legal process.", feeling: Feeling.UNHAPPY },
    { desc: "Facing discrimination or prejudice.", feeling: Feeling.UNHAPPY },
    { desc: "Experiencing a natural disaster in your area.", feeling: Feeling.UNHAPPY },
    { desc: "Being part of an accident.", feeling: Feeling.UNHAPPY },

    { desc: "Awkward silences in a group setting.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Discovering a clothing stain in a public place.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Forgetting lines during a presentation or speech.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Pocket-dialing or butt-dialing someone.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Loud stomach growls or unexpected bodily sounds.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Phone ringing loudly during a meeting or presentation.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Being interrupted during an important conversation.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
    { desc: "Going for a handshake when the other person goes for a hug.", feeling: Feeling.AWKWARD, pack: Pack.SILLY },
];

// ITEM: Both owning an item (or using it in general), or what you DO with a specific item
const ITEM_CARDS:CategoryDataList = [

];

// ACTION: Something you do, purposely, yourself.
const ACTION_CARDS:CategoryDataList = [
    { desc: "Celebrating your birthday." },
    { desc: "Visiting the zoo." },
    { desc: "Visiting a theme park." },
    { desc: "Visiting a shopping mall." },
    { desc: "Going on a vacation." },
    { desc: "Taking a road trip." },
    { desc: "Hiking in nature." },
    { desc: "Attending a music festival." },
    { desc: "Going to the cinema." },
    { desc: "Going to the theatre." },
    { desc: "Exercising." },
    { desc: "Meditating." },
    { desc: "Giving a donation to a charity." },
    { desc: "Helping a struggling student with extra free lessons." },
    { desc: "Going to a party." },
    { desc: "Organizing a big social event." },
    { desc: "Watching a film alone." },
    { desc: "Watching a film with a loved one." },
    { desc: "Volunteering for any cause that needs you." },
    { desc: "Volunteering for a cause you believe in." },
    { desc: "Participating in a sports competition." },
    { desc: "Going out at night." },
    { desc: "Hang out with friends." },
    { desc: "Hang out with family." },
    { desc: "Visiting a new place on earth." },
    { desc: "Immersing yourself in a new culture." },
    { desc: "Engaging in outdoor activities." },
    { desc: "Being a workaholic.", feeling: Feeling.UNHAPPY },
    { desc: "Causing an accident.", feeling: Feeling.UNHAPPY },
    { desc: "Giving a public speech." },
    { desc: "Cleaning up your room." },
    { desc: "Lying to somebody to make your own life easier.", feeling: Feeling.UNHAPPY },

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
];

// GOAL: something that can be achieved or done at a single point in time
const GOAL_CARDS:CategoryDataList = [
    { desc: "Getting married." },
    { desc: "Getting engaged." },
    { desc: "Getting a baby." },
    { desc: "Graduating from high school or university." },
    { desc: "Gaining a new friend." },
    { desc: "Ending a bad relationship." },
    { desc: "Completing a personal project." },
    { desc: "Getting a boyfriend or girlfriend." },
    { desc: "Achieving your fitness goals." },
    { desc: "Composing a song." },
    { desc: "Finishing a drawing or painting." },
    { desc: "Finishing a novel." },
    { desc: "Losing a debate.", feeling: Feeling.UNHAPPY },
    { desc: "Winning a debate." },
    { desc: "Receiving recognition or praise (for your work)." },
    { desc: "Winning awards (for your work)." },
    { desc: "Getting rich." },
    { desc: "Getting famous." },
    { desc: "Being the leader of a business or organization." },
    { desc: "Winning a sports competition." },
    { desc: "Getting a pet." },
    { desc: "Failing to meet a deadline.", feeling: Feeling.UNHAPPY },
    { desc: "Failing to finish a personal project or goal.", feeling: Feeling.UNHAPPY },
    { desc: "Failing to stick to (New Year's) resolutions." },
    { desc: "Being successful in whatever field you want.", feeling: Feeling.HAPPY },
    { desc: "Achieving professional success, but at the cost of your personal life.", feeling: Feeling.UNHAPPY },
    { desc: "Acquiring a high-paying job that doesn't interest you at all.", feeling: Feeling.UNHAPPY },
    { desc: "Having lots of likes and comments on your social media.", feeling: Feeling.UNHAPPY },

];

// CHANGE: A hypothetical change to the future world.
const CHANGE_CARDS:CategoryDataList = [
    { desc: "Future: the weekend is 3 days." },
    { desc: "Future: every time you procrastinate, 5 dollar leaves your bank account." },
    { desc: "Future: it's forbidden to look at a screen for more than 4 hours a day." },
    { desc: "Future: every part of life turns into a competition." },
    { desc: "Future: every part of life can only be done through collaboration." },
    { desc: "Future: every part of life turns into a game." },
    { desc: "Past: all bad memories are erased." },
    { desc: "Past: you can redo one crucial decision." },
    { desc: "Past: you can pick one year and undo all that happened then." },
];

// HABIT: A potential habit you could have every day / week / month / year
const HABIT_CARDS:CategoryDataList = [
    { desc: "Every day, you call your best friend and chat for an hour." },
];

// PERSONAL: Anything that relates to your specific personality and the people around you (partner, friends, family, neighbors)
const PERSONAL_CARDS:CategoryDataList = [
    { desc: "Living far away from friends and family.", feeling: Feeling.UNHAPPY },
    { desc: "Having no friends.", feeling: Feeling.UNHAPPY },
    { desc: "Having only a few social connections." },
    { desc: "Having loads and loads of friends." },
    { desc: "Having to accuse a loved one of something illegal.", feeling: Feeling.UNHAPPY },
    { desc: "Being forced to heavily criticize a person close to you.", feeling: Feeling.UNHAPPY },
    { desc: "Feeling unfilfilled in your love life.", feeling: Feeling.UNHAPPY },
    { desc: "Death of a loved one.", feeling: Feeling.UNHAPPY },
    { desc: "Death of someone you barely knew.", feeling: Feeling.UNHAPPY },
    { desc: "Separation with a loved one.", feeling: Feeling.UNHAPPY },
    { desc: "Losing your pet.", feeling: Feeling.UNHAPPY },
    { desc: "Lying to a loved one for their sake.", feeling: Feeling.UNHAPPY },
    { desc: "Family members lying to you.", feeling: Feeling.UNHAPPY },
    { desc: "Getting divorced." },
    { desc: "Having low self-esteem or self-worth.", feeling: Feeling.UNHAPPY },
    { desc: "Feeling unfulfilled or unchallenged mentally.", feeling: Feeling.UNHAPPY },
    { desc: "Feeling unfulfilled with your achievements.", feeling: Feeling.UNHAPPY },
    { desc: "Feeling like you're weird or abnormal.", feeling: Feeling.UNHAPPY },
    { desc: "Not meeting the expectations of your friends or parents", feeling: Feeling.UNHAPPY },
    { desc: "Realizing your biggest dream or aspiration is literally unachievable.", feeling: Feeling.UNHAPPY },
    { desc: "Friends lying to you.", feeling: Feeling.UNHAPPY },
    { desc: "Being excluded from a social gathering or event.", feeling: Feeling.UNHAPPY },

    { desc: "Feeling content with yourself, whatever happens.", feeling: Feeling.HAPPY },
    { desc: "Getting the chance to be a kid again for a single year.", feeling: Feeling.HAPPY },
    { desc: "Getting the chance to be a wise elderly person for a single year.", feeling: Feeling.HAPPY },
    { desc: "Perfectly matching others' opinions of you.", feeling: Feeling.HAPPY },
    { desc: "Everybody approves of you and your actions.", feeling: Feeling.HAPPY },
    { desc: "Being authentic.", feeling: Feeling.HAPPY },
    { desc: "Being perfectionist.", feeling: Feeling.HAPPY },
    { desc: "Being loose and easy-going.", feeling: Feeling.HAPPY },
    { desc: "Feeling comfortable with silence.", feeling: Feeling.HAPPY }
];



// JOB: Either a generic thing about work, or "Being a <specific job>"
const JOB_CARDS:CategoryDataList = [
    { desc: "Landing a new job or promotion." },
    { desc: "Losing your current job.", feeling: Feeling.UNHAPPY },
    { desc: "Your job pays well, but the work environment is hostile." },
    { desc: "Not meeting the expectations of your colleagues.", feeling: Feeling.UNHAPPY },

];

// HEALTH: Anything related to physical or mental health.
const HEALTH_CARDS:CategoryDataList = [
    { desc: "Being depressed.", feeling: Feeling.UNHAPPY },
    { desc: "Being hyperactive." },
    { desc: "Being autistic." },
    { desc: "Struggling with motivation.", feeling: Feeling.UNHAPPY },
    { desc: "Struggling with mental health.", feeling: Feeling.UNHAPPY },
    { desc: "Having a chronic illness", feeling: Feeling.UNHAPPY },
    { desc: "Being deaf.", feeling: Feeling.UNHAPPY },
    { desc: "Being blind.", feeling: Feeling.UNHAPPY },
    { desc: "Being mute.", feeling: Feeling.UNHAPPY },
    { desc: "Having a minor disability." },
    { desc: "You have a treatable illness, but it requires many years of fighting and money." },
    { desc: "Recovering after a long illness." },
    { desc: "Being sick.", feeling: Feeling.UNHAPPY },
    { desc: "Having a six-pack (abs)" },
    { desc: "Getting injured.", feeling: Feeling.UNHAPPY },
    { desc: "Feeling too fat or too skinny.", feeling: Feeling.UNHAPPY },
    { desc: "Achieving your perfect body through expensive medical operations.", feeling: Feeling.UNHAPPY },
    { desc: "Getting extremely fit and good-looking at the cost of your personal life.", feeling: Feeling.UNHAPPY },

    { desc: "Superpower: you stay true your personal values, whatever happens.", feeling: Feeling.HAPPY },
    { desc: "Superpower: you can never compare yourself to others.", feeling: Feeling.HAPPY },
    { desc: "Superpower: you don't understand the concept of lying.", feeling: Feeling.HAPPY },
    { desc: "Superpower: you speak all languages in the world.", feeling: Feeling.HAPPY },
    { desc: "Superpower: you don't need money, because your charm gets you everything.", feeling: Feeling.HAPPY }
]

const CARDS:Record<Category, CategoryDataList> = 
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

export 
{
    Pack,
    Category,
    CategoryData,
    Feeling,
    CARDS,
    CATEGORIES
}
