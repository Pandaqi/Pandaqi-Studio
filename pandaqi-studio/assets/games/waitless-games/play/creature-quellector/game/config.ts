import TextConfig, { TextStyle } from "js/pq_games/layout/text/textConfig"
import Point from "js/pq_games/tools/geometry/point"
import Bounds from "js/pq_games/tools/numbers/bounds"
import { ELEMENTS } from "../shared/dict"
import { generateForRulebook } from "../rules/main";

export const CONFIG =
{
    _settings:
    {
        multiType: 
        {
            type: SettingType.CHECK,
            label: "An expansion: some icons will become two types at once."
        },

        elements:
        {
            type: SettingType.GROUP,

            red:
            {
                type: SettingType.ENUM,
                values: ["fire", "electric", "star", "dragon"],
                default: ["fire"]
            },

            blue:
            {
                type: SettingType.ENUM,
                values: ["water", "ice", "poison", "weather"],
                default: ["water"]
            },

            green:
            {
                type: SettingType.ENUM,
                values: ["earth", "grass", "rock", "bug"],
                default: ["earth"]
            },

            purple:
            {
                type: SettingType.ENUM,
                values: ["air", "magic", "ghost", "dark"],
                default: ["air"]
            },
        }
    },

    _rulebook:
    {
        examples:
        {
            turn:
            {
                buttonText: "Generate a random turn!",
                callback: generateForRulebook,
            }
        },

        tables:
        {
            red:
            {
                config:
                {
                    icons:
                    {
                        sheetURL: "quellector_actions_with_bg.webp",
                        sheetWidth: 8,
                        icons: ELEMENTS,
                        base: "/waitless-games/play/creature-quellector/assets/"
                    }
                },
                data: 
                {
                    fire: ELEMENTS.fire,
                    electric: ELEMENTS.electric,
                    star: ELEMENTS.star,
                    dragon: ELEMENTS.dragon
                }
            },

            blue:
            {
                config:
                {
                    icons:
                    {
                        sheetURL: "quellector_actions_with_bg.webp",
                        sheetWidth: 8,
                        icons: ELEMENTS,
                        base: "/waitless-games/play/creature-quellector/assets/"
                    }
                },
                data: 
                {
                    water: ELEMENTS.water,
                    ice: ELEMENTS.ice,
                    poison: ELEMENTS.poison,
                    weather: ELEMENTS.weather
                }
            },

            green:
            {
                config:
                {
                    icons:
                    {
                        sheetURL: "quellector_actions_with_bg.webp",
                        sheetWidth: 8,
                        icons: ELEMENTS,
                        base: "/waitless-games/play/creature-quellector/assets/"
                    }
                },
                data: 
                {
                    earth: ELEMENTS.earth,
                    grass: ELEMENTS.grass,
                    rock: ELEMENTS.rock,
                    bug: ELEMENTS.bug
                }
            },

            purple:
            {
                config:
                {
                    icons:
                    {
                        sheetURL: "quellector_actions_with_bg.webp",
                        sheetWidth: 8,
                        icons: ELEMENTS,
                        base: "/waitless-games/play/creature-quellector/assets/"
                    }
                },
                data: 
                {
                    air: ELEMENTS.air,
                    magic: ELEMENTS.magic,
                    ghost: ELEMENTS.ghost,
                    dark: ELEMENTS.dark
                }
            }
        }
    },

    debugWithoutPDF: false, // @DEBUGGING (should be false)
    debugSingleCard: false, // @DEBUGGING (should be false)
    debugRandomizeTypes: false, // @DEBUGGING (should be false)
    
    fileName: "[Creature Quellector] Material",
    configKey: "creatureQuellectorConfig",

    multiType: false,
    multiTypeImageResource: null,

    enableOldCounterRules: false, // @DEBUGGING? the old rules included counter icons/cycle on the card; not anymore

    elements: {}, // the elements included by user setting on game page
    elementsReverse: {},

    alwaysAddMainTypeOnce: false,

    fonts:
    {
        heading: "comica",
        body: "cabin"
    },

    assetsBase: "/waitless-games/play/creature-quellector/assets/",
    assets: 
    {
        creatures_1: 
        {
            path: "quellector_creatures_1.webp",
            frames: new Point(8,2),
            enableCaching: true,
        },

        creatures_2: 
        {
            path: "quellector_creatures_2.webp",
            frames: new Point(8,2),
            enableCaching: true,
        },

        creatures_3: 
        {
            path: "quellector_creatures_3.webp",
            frames: new Point(8,2),
            enableCaching: true,
        },

        backgrounds_1: 
        {
            path: "quellector_backgrounds_1.webp",
            frames: new Point(8,2),
            enableCaching: true,
        },

        backgrounds_2: 
        {
            path: "quellector_backgrounds_2.webp",
            frames: new Point(8,2),
            enableCaching: true,
        },

        backgrounds_3: 
        {
            path: "quellector_backgrounds_3.webp",
            frames: new Point(8,2),
            enableCaching: true,
        },

        icons: 
        {
            path: "quellector_types.webp",
            frames: new Point(8,2)
        },

        icons_actions: 
        {
            path: "quellector_actions.webp",
            frames: new Point(8,2)
        },

        counter_icon: 
        {
            path: "counter_icon.webp",
        },

        comica: 
        {
            path: "fonts/ComicaBoomRegular.woff2",
            size: 0.1285
        },

        cabin_italic: 
        {
            key: "cabin",
            path: "fonts/Cabin-Italic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC }),
            size: 0.0533
        }

        /*
        fontText: {
            key: "Beautiful Humility",
            path: "fonts/BeautifulHumilityRegular.woff2",
            size: 0.063
        },
        */ 
    },

    gameplay: 
    {
        // purple defeats green, defeats blue, defeats red, defeats purple
        elementCycle: ["purple", "green", "blue", "red"],
        elementCycleSubtype: [],
        actionProbability: 0.275,
        actionPickThreshold: 5, // we'll only consider adding actions once this number of regular icons have been placed
        actionPercentage: new Bounds(0.175, 0.3), // what percentage of icons (in total) should be an action?
        actionPercentagePerType: new Bounds(0.075, 0.5), // what percentage of icons (within one type) may be an action?
    
        multiTypeProbability: 0.175,
    },

    cards: 
    {
        size: 
        { 
            small: new Point(4, 4),
            regular: new Point(3, 3),
            huge: new Point(2, 2)
        },
        sizeElement: new Point(1, 1.55),
        sizeResult: new Point(),
        
        numPerElement: 12,
        iconsPerCard: 4,
        //backgroundColor: "#FFE4B3",
        backgroundColors: 
        {
            red: "#FFD2D2",
            blue: "#D6FEFA",
            green: "#E8FFDF",
            purple: "#F2E3FF"
        },

        textSize: 0.08, // relative to card size
        textSizeFineprint: 0.02, // relative to card size

        icon: 
        {
            backgroundInkFriendly: "#777777",
            backgroundDarkInkFriendly: "#333333"
        },

        actionIconPatternStrokeWidth: 0.075, // relative to icon size (during bake-stuff-into-type-icons phase)
        actionIconPatternAlpha: 0.4,
        dropShadowOffset: 0.08, // relative to (corner) icon size
        
        backgroundScale: 2.0,
        backgroundAlpha: 0.125,
        generator: 
        {
            maxDifferenceBetweenTypes: 5,
            subTypeExtraProb: 0.2,
        },
        stroke: 
        {
            color: "#614100",
            colorInkFriendly: "#999999",
            width: 0.01
        },
        outline: 
        {
            color: "#332211",
            colorInkFriendly: "#333333",
            width: 0.02,
        },
        genericNames: ["mon", "snout", "leg", "fur", "paw", "tail", "speed", "critter", "creat", "monster", "god", "child", "baby", "beak", "wing", "dweller", "kid", "roam", "breath", "blast", "jump", "leap"],
    },

    types: ["red", "blue", "green", "purple"],
    canvasSize: new Point(960, 540),
    itemSize: new Point(150, 200),
    paddingBetweenCards: 30,
    mainTypeSize: 0.25, // relative to card size
    typeSize: 0.185, // relative to card size
    paddingBetweenTypes: 0.1, // relative to type size
    includeActions: true,
    actionProb: 0.15,
}
