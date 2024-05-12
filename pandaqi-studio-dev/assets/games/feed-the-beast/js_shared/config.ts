import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig"
import CVal from "js/pq_games/tools/generation/cval"
import Point from "js/pq_games/tools/geometry/point"
import Bounds from "js/pq_games/tools/numbers/bounds"

const CONFIG:any = 
{
    debug:
    {
        omitFile: true, // @DEBUGGING (should be false)
        singleDrawPerType: true, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
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
        special: "trollhunter"
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
            path: "fonts/IBMPlexSerif.woff2",
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

        ibmplex_bold_italic:
        {
            key: "ibmplex",
            path: "fonts/IBMPlexSerif-BoldItalic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC, weight: TextWeight.BOLD })
        },

        trollhunter:
        {
            path: "fonts/Trollhunters.woff2",
            loadIf: ["sets.baseBeasts", "sets.advancedBeasts"]
        },

        getronde:
        {
            path: "fonts/GETRONDE.woff2",
        },

        beasts:
        {
            path: "beasts.webp",
            frames: new Point(4,6),
            loadIf: ["sets.baseBeasts", "sets.advancedBeasts"],
            disableCaching: true
        },

        food:
        {
            path: "food.webp",
            frames: new Point(5,2),
        },

        victims:
        {
            path: "victims.webp",
            frames: new Point(8,2),
            loadIf: ["sets.saveThePrincess"],
            disableCaching: true
        },

        card_templates:
        {
            path: "card_templates.webp",
            frames: new Point(2,1),
            loadIf: ["sets.recipeCards", "sets.saveThePrincess"]
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(6,2)
        },
    },

    rulebook:
    {
        
    },

    generation:
    {
        numRecipeCards: 32,
        maxRecipesPerCard: 3, // can exceed this, but that's a rare random event and not the rule
        maxRecipeValue: 3,
        foodRewardProb: 0.175, // the probability the reward for a recipe is just BETTER food tokens
        foodRewardErrorBounds: new Bounds(0.0, 1.5),
        multiFoodRecipeLengthThreeProb: 0.275, // multi-food recipes are only 2 or 3 tokens; 3 is less likely
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
            0: 13, // 5 * 13 = 65
            1: 6, // 3 * 6 = 18
            2: 4 // 2 * 4 = 8
        },
        defaultVictimFrequency: 1,
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

        iconDims: new CVal(new Point(0.975), "sizeUnit"),
        //circleRadius: new CVal(new Point(0.45), "sizeUnit"),
        //tierDotRadius: new CVal(new Point(0.05), "sizeUnit")
    },

    beasts:
    {
        drawerConfig:
        {
            autoStroke: true,
            dimsElement: new Point(1, 1),
            dims: { 
                small: new Point(2,3),
                regular: new Point(1,2),
                large: new Point(1,1)
            },  
        },

        name:
        {
            dimsPlaque: new CVal(new Point(0.35), "sizeUnit"),
            posPlaque: new CVal(new Point(0.5, 0.1), "size"),
            fontSize: new CVal(0.08, "sizeUnit"),
            fontSizeLevel: new CVal(0.03, "sizeUnit"),
            pos: new CVal(new Point(0.5, 0.065), "size"),
            posLevel: new CVal(new Point(0.5, 0.12), "size"),
            strokeWidth: new CVal(0.0066, "sizeUnit"),
            strokeWidthLevel: new CVal(0.004, "sizeUnit")
        },
        
        modal:
        {
            fontSize: new CVal(0.0175, "sizeUnit"),
            dims: new CVal(new Point(0.35), "sizeUnit"),
            dimsForPositioning: new CVal(new Point(0.33), "sizeUnit"),
            textBoxDims: new CVal(new Point(0.225, 0.33), "sizeUnit"),
            textPosOffset: 0.075,
            stateTextOffsetFromCenter: 0.265, // Y-direction
            stateTextAlpha: 1.0,
            stateTextStrokeWidth: new CVal(0.0025, "sizeUnit"),
            anchorPos: new CVal(new Point(0.5, 0.805), "size"),
            textColor: "#FFFFFF",
            menuIconOffsetY: 0.066,
            menuTextOffsetY: 0.133,
            menuIconDims: new CVal(new Point(0.06), "sizeUnit")
        },

        modalOptional:
        {
            dims: new CVal(new Point(0.29, 0.11), "size"),
            blurRadius: new CVal(0.015, "sizeUnit"),
            offsetFromEdge: new CVal(new Point(0.175, 0.075), "size"),
            highlightColor: "#FF7777"
        }
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

        victims:
        {
            illuPos: new CVal(new Point(0.5, 0.35), "size"),
            illuDims: new CVal(new Point(0.775), "sizeUnit"),

            fontSizeName: new CVal(0.133, "sizeUnit"),
            posName: new CVal(new Point(0.5, 0.635), "size"),
            strokeWidthName: new CVal(0.0075, "sizeUnit"), // @TODO: not sure if this needs stroke actually

            fontSize: new CVal(0.0675, "sizeUnit"),
            pos: new CVal(new Point(0.5, 0.866), "size"),
            textBoxDims: new CVal(new Point(0.9, 0.4), "size"),
        },

        menu:
        {
            recipeListTop: new CVal(new Point(0.5, 0.175), "size"),
            recipeListBottom: new CVal(new Point(0.5, 0.975), "size"),
            spaceXPerRecipe: 0.95,
            spaceYPerRecipe: 0.725, // percentages of total space that may be filled in with icons/text
            fontSize: new CVal(0.0545, "sizeUnit")
        }
    },
}

export default CONFIG