import Point from "js/pq_games/tools/geometry/point"
import Bounds from "js/pq_games/tools/numbers/bounds"
import { MESSAGES } from "./dict"
import { cardPicker } from "../game/cardPicker"
import { drawingPicker } from "../game/drawingPicker"
import { tokenPicker } from "../game/tokenPicker"

export const CONFIG = 
{
    _settings:
    {
        sets:
        {
            type: SettingType.GROUP,

            includeCards:
            {
                type: SettingType.CHECK,
                value: true,
                label: "Include Word Cards",
            },

            includeDrawings:
            {
                type: SettingType.CHECK,
                label: "Include Cave Drawings",
                value: true
            },

            includeTokens:
            {
                type: SettingType.CHECK,
                label: "Include Choice Tokens",
                value: true,
                remark: "If you already have these, or plan on using something else, you can disable this."
            },
        },

        wordPreferences:
        {
            type: SettingType.GROUP,

            includeGeography:
            {
                type: SettingType.CHECK,
                value: false
            },

            includeNames:
            {
                type: SettingType.CHECK,
                remark: "Includes names of popular people, brands, etcetera",
                value: false,
            },

            includeDifficultWords:
            {
                type: SettingType.CHECK,
                remark: "Raises the max difficulty of words that can appear.",
                value: false,
            },
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
        fileName: "Mammoth Messages",
    },

    packs: {},

    // assets
    assetsBase: "/mammoth-messages/assets/",
    assets:
    {
        boblox:
        {
            path: "fonts/BobloxClassic.woff2"
        },

        caveman:
        {
            path: "fonts/Caveman.woff2"
        },

        word_card_template:
        {
            path: "word_card_template.webp"
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(4,1)
        },

        colors:
        {
            path: "colors.webp",
            frames: new Point(10,1),
        },

        cave_drawings:
        {
            path: "cave_drawings.webp",
            frames: new Point(8,14)
        }
    },

    _material:
    {
        cards:
        {
            picker: cardPicker,
            mapper:
            {
                autoStroke: true, // automatically adds thick outline around cards, which is customary and useful for imprecise cutters
                sizeElement: new Point(1, 1.5),
                size: 
                { 
                    small: new Point(4,4),
                    regular: new Point(3,3),
                    large: new Point(2,2)
                },
            }, 
        },

        drawings:
        {
            picker: drawingPicker,
            mapper:
            {
                autoStroke: true,
                sizeElement: new Point(1,1),
                size: 
                {
                    small: new Point(8,10),
                    regular: new Point(6,8),
                    large: new Point(4,5)
                }
            },
        },

        tokens:
        {
            picker: tokenPicker,
            mapper:
            {
                autoStroke: true,
                sizeElement: new Point(1,1),
                size: 
                {
                    small: new Point(8,10),
                    regular: new Point(6,8),
                    large: new Point(4,5)
                }
            },

        }
    },

    _drawing:
    {
        fonts:
        {
            heading: "boblox",
            body: "caveman"
        },

        // word cards
        cards:
        {
            generation:
            {
                num: 45,
                wordsPerCard: 10,
                
                pqWordsParams: 
                {
                    method: "json",
                    maxWordLength: 12, // longer simply doesn't fit in reasonable font size
                    types: ["nouns"],
                    levels: ["core", "easy"],
                    useAllCategories: true,
                    wordExceptions: [],
                }
            },

            secretMessages:
            {
                num: new Bounds(0,2),
                options: MESSAGES,
                fontSize: 0.078, // ~sizeUnit
                alpha: 0.65,
                textColor: "#FF5E00"
            },

            words:
            {
                yPos: 0.17, // ~sizeY
                fontSize: 0.066, // ~sizeUnit
                fontSizeNumber: 0.066, // ~sizeUnit; should be close to fontSize above

                iconDims: 0.125, // ~sizeUnit
                iconSymbolDims: 0.9, // ~iconDims
                gapIconToText: 0.1, // ~sizeUnit; should be close to iconDims above

                edgeMargin: 0.1, // ~sizeUnit; should be higher than iconDims to have space
                strokeWidth: 0.125, // ~fontSize
                dividerDims: 0.9, // ~sizeUnit; should be near 1.0 in any case
                dividerAlpha: 0.875,
                dividerAlphaInkFriendly: 0.33,
            }
        },

        // cave drawings
        // (same sizes as tokens for now, not sure if that will stay that way)
        drawings:
        {
            iconSize: 0.9, // ~sizeUnit
        },

        // choice tokens
        tokens:
        {
            generation:
            {
                numberSkip: 2, // it only adds every X number per category
                hardCap: 48
            },

            fontSize: 0.55, // ~sizeUnit
            textColor: "#FFFFFF",
            strokeColor: "#000000",
            iconDims: 0.9,
            strokeWidth: 0.025, // ~sizeUnit
        }
    }
}