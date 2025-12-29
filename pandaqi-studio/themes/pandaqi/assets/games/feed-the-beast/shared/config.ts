import { SettingType, TextConfig, TextWeight, TextStyle, Vector2, Bounds, CVal } from "lib/pq-games"
import { cardPicker } from "../game/cardPicker"
import { tilePicker } from "../game/tilePicker"
import { tokenPicker } from "../game/tokenPicker"

export const CONFIG = 
{
    _settings:
    {
        allowMultiFoodRecipes:
        {
            label: "Add multi food menus",
            type: SettingType.CHECK,
            value: true,
            remark: "Makes the game slightly harder but also faster and more strategic (usually)."
        },

        sets:
        {
            type: SettingType.GROUP,

            foodTokens:
            {
                type: SettingType.CHECK,
                label: "Food Tokens",
                value: true
            },

            recipeCards:
            {
                type: SettingType.CHECK,
                label: "Recipe Cards",
                value: true
            },

            baseBeasts:
            {
                type: SettingType.CHECK,
                label: "Beasts (Base)",
                value: true
            },

            advancedBeasts:
            {
                type: SettingType.CHECK,
                label: "Beasts (Advanced)",
                value: false
            },

            saveThePrincess:
            {
                type: SettingType.CHECK,
                label: "Save The Princess",
                value: false
            }
        }
    },
        
    _debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    _game:
    {
        fileName: "Feed the Beast",
    },

    // assets
    _resources:
    {    
        base: "/feed-the-beast/assets/",
        files:
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
                frames: new Vector2(4,6),
                loadIf: ["sets.baseBeasts", "sets.advancedBeasts"],
            },

            food:
            {
                path: "food.webp",
                frames: new Vector2(5,2),
            },

            victims:
            {
                path: "victims.webp",
                frames: new Vector2(8,2),
                loadIf: ["sets.saveThePrincess"],
            },

            card_templates:
            {
                path: "card_templates.webp",
                frames: new Vector2(2,1),
                loadIf: ["sets.recipeCards", "sets.saveThePrincess"]
            },

            misc:
            {
                path: "misc.webp",
                frames: new Vector2(6,2)
            },
        },
    },

    rulebook:
    {
        numPlayers: new Bounds(3,5),
        numStartingTokens: 10,
        maxStartingTokenTier: 0,
        pickGoodFoodProb: 1.0,
        wrongFoodSkipTurnProb: 0.5,
        defaultBeastMaxStorage: 10,
        menuMarketSize: 4,
        pickRewardOverUpgradeProb: 0.5
    },

    generation:
    {
        numRecipeCards: 18,
        maxRecipesPerCard: 3, // can exceed this, but that's a rare random event and not the rule
        maxRecipeValue: 3,
        foodRewardProb: 0.175, // the probability the reward for a recipe is just BETTER food tokens
        foodRewardErrorBounds: new Bounds(0.0, 1.5), // heavily lean towards much more valuable/upgraded food in return
        multiFoodRecipeLengthThreeProb: 0.15, // multi-food recipes are only 2 or 3 tokens; 3 is less likely
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
            1: 0.5,
            2: 0.25
        },
        maxActionValueError: 0.75,
        defaultFoodFrequenciesPerTier:
        {
            0: 15, // 5 * 15 = 75
            1: 12, // 3 * 12 = 36
            2: 8 // 2 * 8 = 16
        },
        defaultVictimFrequency: 1,
    },

    _material:
    {
        tokens:
        {
            picker: tokenPicker,
            mapper:
            {
                sizeElement: new Vector2(1, 1),
                size: { 
                    small: new Vector2(10,15),
                    regular: new Vector2(8,12),
                    large: new Vector2(6,9)
                },  
            },
        },

        beasts:
        {
            picker: tilePicker,
            mapper:
            {
                autoStroke: true,
                sizeElement: new Vector2(1, 1),
                size: { 
                    small: new Vector2(2,3),
                    regular: new Vector2(1,2),
                    large: new Vector2(1,1)
                },  
            },
        },

        cards:
        {
            picker: cardPicker,
            mapper: {
                autoStroke: true,
                sizeElement: new Vector2(1, 1.4),
                size: { 
                    small: new Vector2(4,4),
                    regular: new Vector2(3,3),
                    large: new Vector2(2,2)
                },  
            },
        }
    },

    _drawing:
    {
        fonts:
        {
            heading: "getronde",
            body: "ibmplex",
            special: "trollhunter"
        },

        foodTokens:
        {
            iconDims: new CVal(new Vector2(0.975), "sizeUnit"),
            //circleRadius: new CVal(new Vector2(0.45), "sizeUnit"),
            //tierDotRadius: new CVal(new Vector2(0.05), "sizeUnit")
        },

        beasts:
        {
            name:
            {
                sizePlaque: new CVal(new Vector2(0.35), "sizeUnit"),
                posPlaque: new CVal(new Vector2(0.5, 0.1), "size"),
                fontSize: new CVal(0.08, "sizeUnit"),
                fontSizeLevel: new CVal(0.03, "sizeUnit"),
                pos: new CVal(new Vector2(0.5, 0.065), "size"),
                posLevel: new CVal(new Vector2(0.5, 0.12), "size"),
                strokeWidth: new CVal(0.0066, "sizeUnit"),
                strokeWidthLevel: new CVal(0.004, "sizeUnit")
            },
            
            modal:
            {
                fontSize: new CVal(0.0175, "sizeUnit"),
                size: new CVal(new Vector2(0.35), "sizeUnit"),
                sizeForPositioning: new CVal(new Vector2(0.33), "sizeUnit"),
                textBoxDims: new CVal(new Vector2(0.225, 0.33), "sizeUnit"),
                textPosOffset: 0.075,
                stateTextOffsetFromCenter: 0.265, // Y-direction
                stateTextAlpha: 1.0,
                stateTextStrokeWidth: new CVal(0.0025, "sizeUnit"),
                anchorPos: new CVal(new Vector2(0.5, 0.805), "size"),
                textColor: "#FFFFFF",
                menuIconOffsetY: 0.066,
                menuTextOffsetY: 0.133,
                menuIconDims: new CVal(new Vector2(0.06), "sizeUnit")
            },

            modalOptional:
            {
                size: new CVal(new Vector2(0.29, 0.11), "size"),
                blurRadius: new CVal(0.015, "sizeUnit"),
                offsetFromEdge: new CVal(new Vector2(0.175, 0.075), "size"),
                highlightColor: "#FF7777"
            }
        },

        cards:
        {
            victims:
            {
                illuPos: new CVal(new Vector2(0.5, 0.35), "size"),
                illuDims: new CVal(new Vector2(0.775), "sizeUnit"),

                fontSizeName: new CVal(0.133, "sizeUnit"),
                posName: new CVal(new Vector2(0.5, 0.635), "size"),
                strokeWidthName: new CVal(0.0075, "sizeUnit"),
                
                fontSize: new CVal(0.0675, "sizeUnit"),
                pos: new CVal(new Vector2(0.5, 0.866), "size"),
                textBoxDims: new CVal(new Vector2(0.9, 0.4), "size"),
            },

            menu:
            {
                recipeListTop: new CVal(new Vector2(0.5, 0.175), "size"),
                recipeListBottom: new CVal(new Vector2(0.5, 0.975), "size"),
                spaceXPerRecipe: 0.95,
                spaceYPerRecipe: 0.725, // percentages of total space that may be filled in with icons/text
                fontSize: new CVal(0.0545, "sizeUnit")
            }
        },
    }
}