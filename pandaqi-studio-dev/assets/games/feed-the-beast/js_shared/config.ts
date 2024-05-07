import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig"
import Point from "js/pq_games/tools/geometry/point"
import Bounds from "js/pq_games/tools/numbers/bounds"

const CONFIG:any = 
{
    debug:
    {
        omitFile: true, // @DEBUGGING (should be false)
        singleDrawPerType: true, // @DEBUGGING (should be false)
        onlyGenerate: true, // @DEBUGGING (should be false)
    },

    configKey: "feedTheBeastConfig",
    fileName: "[Material] Feed the Beast",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",
    pageSize: "a4",

    fonts:
    {
        heading: "getronde",
        body: "ibmplex",
        special: "trollhunter" // @TODO: not sure if I want/need to load this one in the end
    },

    allowMultiFoodRecipes: true,

    sets:
    {
        foodTokens: true,
        recipeCards: true,
        baseBeasts: true,
        saveThePrincess: false,
    },

    // assets
    assetsBase: "/feed-the-beast/assets/",
    assets:
    {
        ibmplex:
        {
            path: "fonts/IBMPlexSerif-Regular.woff2",
        },

        ibmplex_bold:
        {
            key: "ibmplex",
            path: "fonts/IBMPlexSerif-Bold.woff2",
            textConfig: new TextConfig({ weight: TextWeight.BOLD })
        },

        ibmplex_italic:
        {
            key: "ibmplex",
            path: "fonts/IBMPlexSerif-Italic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC })
        },

        // @TODO: add BoldItalic too?

        trollhunter:
        {
            path: "fonts/Trollhunters.woff2",
        },

        getronde:
        {
            path: "fonts/GETRONDE.woff2",
        },

        beasts:
        {
            path: "beasts.webp",
            frames: new Point(4,4)
        },

        food:
        {
            path: "food.webp",
            frames: new Point(5,2)
        },

        victims:
        {
            path: "victims.webp",
            frames: new Point(8,2)
        },

        card_templates:
        {
            path: "card_templates.webp",
            frames: new Point(2,1)
        },
        /*
        misc:
        {
            path: "misc.webp",
            frames: new Point(12,1)
        },
        */
    },

    rulebook:
    {
        
    },

    generation:
    {
        numRecipeCards: 32,
        maxRecipesPerCard: 3, // can exceed this, but that's a rare random event and not the rule
        maxRecipeValue: 3,
        multiFoodRecipeBounds: new Bounds(2,3),
        multiFoodMaxPercentage: 0.25,
        multiFoodRecipeProbPerTier:
        {
            0: 0.25,
            1: 0.125,
            2: 0
        },
        foodTierDistribution:
        {
            0: 1.0,
            1: 0.4,
            2: 0.175
        },
        maxActionValueError: 0.75,
        defaultFoodFrequenciesPerTier:
        {
            0: 10,
            1: 5,
            2: 3
        }
    },

    foodTokens:
    {
        drawerConfig:
        {
            dimsElement: new Point(1, 1),
            dims: { 
                small: new Point(10,15),
                regular: new Point(8,12),
                large: new Point(6,9)
            },  
        },
    },

    beasts:
    {
        drawerConfig:
        {
            dimsElement: new Point(1, 1),
            dims: { 
                small: new Point(2,3),
                regular: new Point(1,2),
                large: new Point(1,1)
            },  
        },
    },

    cards:
    {
        drawerConfig:
        {
            autoStroke: true,
            dimsElement: new Point(1, 1.4),
            dims: { 
                small: new Point(4,4),
                regular: new Point(3,3),
                large: new Point(2,2)
            },  
        },
    },
}

export default CONFIG