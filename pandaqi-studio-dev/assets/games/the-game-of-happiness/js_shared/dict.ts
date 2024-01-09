enum Category
{
    EVENT = "event",
    ITEM = "item",
    ACTION = "action",
    GOAL = "goal",
    CHANGE = "change",
    HABIT = "habit", // lifestyle perhaps a better word, but feels too long compared to others
    PERSONAL = "personal",
}

enum Pack
{
    BASE = "base",
    ADVANCED = "advanced",
    SILLY = "silly"
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
    [Category.PERSONAL]: { frame: 6, colorBG: "@TODO", colorText: "@TODO" }
}


interface CategoryData
{
    desc: string,
    pack?: Pack, // if not provided, assumes base
}
type CategoryDataList = CategoryData[];

//
// @NOTE: This is where all the actual content on cards is saved
//
const EVENT_CARDS:CategoryDataList = [];
const ITEM_CARDS:CategoryDataList = [];
const ACTION_CARDS:CategoryDataList = [];
const GOAL_CARDS:CategoryDataList = [];
const CHANGE_CARDS:CategoryDataList = [];
const HABIT_CARDS:CategoryDataList = [];
const PERSONAL_CARDS:CategoryDataList = [];

const CARDS:Record<Category, CategoryDataList> = 
{
    [Category.EVENT]: EVENT_CARDS,
    [Category.ITEM]: ITEM_CARDS,
    [Category.ACTION]: ACTION_CARDS,
    [Category.GOAL]: GOAL_CARDS,
    [Category.CHANGE]: CHANGE_CARDS,
    [Category.HABIT]: HABIT_CARDS,
    [Category.PERSONAL]: PERSONAL_CARDS
}

export 
{
    Pack,
    Category,
    CategoryData,
    CARDS,
    CATEGORIES
}
