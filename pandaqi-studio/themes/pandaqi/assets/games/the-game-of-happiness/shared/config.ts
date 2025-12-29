
import { SettingType, TextConfig, TextWeight, Vector2 } from "lib/pq-games"
import { cardPicker } from "../game/cardPicker"
import { tokenPicker } from "../game/tokenPicker"

export const CONFIG = 
{
    _settings:
    {
        includeCards:
        {
            type: SettingType.CHECK,
            label: "Include Cards",
            value: true
        },

        includeTokens:
        {
            type: SettingType.CHECK,
            label: "Include Tokens",
            value: true,
            remark: "If you already have these, or plan on using something else, you can disable this."
        },

        loadDigitalGame:
        {
            type: SettingType.CHECK,
            value: false,
            label: "Load Digital Game",
            remark: "Loads the digital interface to play this game on a single smartphone instead. (Doesn't generate material.)"
        },

        packs:
        {
            type: SettingType.MULTI,
            values: ["base", "advanced", "expert", "silly", "superpowers", "past", "jobs", "personal", "habits", "items"],
            value: ["base"],
            label: "Packs"
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
        fileName: "The Game of Happiness",
    },

    packs: {},

    // assets
    _resources:
    {    
        base: "/the-game-of-happiness/assets/",
        files:
        {
            sunny:
            {
                path: "fonts/SunnySpells-Regular.woff2"
            },

            minya:
            {
                path: "fonts/MinyaNouvelle-Regular.woff2"
            },

            minya_bold:
            {
                key: "minya",
                path: "fonts/MinyaNouvelle-Bold.woff2",
                textConfig: new TextConfig({ weight: TextWeight.BOLD })
            },

            categories:
            {
                path: "categories.webp",
                frames: new Vector2(10,1),
            },

            tintable_templates:
            {
                path: "tintable_templates.webp",
                frames: new Vector2(2,1)
            }
        },
    },

    digital:
    {
        numCards: 5,
        totalRounds: 10,
        pickOneCardPerCategory: true
    },

    _material:
    {
        cards:
        {
            picker: cardPicker,
            mapper:
            {
                sizeElement: new Vector2(1, 1.4),
                size: 
                { 
                    small: new Vector2(5,5),
                    regular: new Vector2(4,4),
                    large: new Vector2(3,3)
                },
            }, 
        },

        tokens:
        {
            picker: tokenPicker,
            mapper:
            {
                sizeElement: new Vector2(1,1),
                size: 
                {
                    small: new Vector2(8,8),
                    regular: new Vector2(6,6),
                    large: new Vector2(4,4)
                }
            }, 
        }
    },

    _drawing:
    {
        fonts:
        {
            heading: "sunny",
            body: "minya"
        },

        cards:
        {
            shared:
            {
            
            },

            category:
            {
                iconSize: 0.12, // ~sizeUnit
                iconSizeBig: 0.3, // ~sizeUnit
                bigIconYPos: 0.225, // ~sizeY
                iconOffset: new Vector2(0.075, 0.18), // ~sizeUnit
            },

            text:
            {
                fontSize: { large: 0.125, medium: 0.105, small: 0.085 }, // ~sizeUnit
                fontSizeCutoffs: { large: 50, medium: 90, small: 130 },
                size: new Vector2(0.9, 0.75), // ~size
            },

            textMeta:
            {
                fontSize: 0.04, // ~sizeUnit
                yPos: 0.0285, // ~sizeUnit
                textBlockWidth: 0.866, // ~sizeX
            },

            token:
            {
                iconSize: 0.75, // ~sizeUnit
                fontSize: 0.75, // ~sizeUnit
            },

            outline:
            {
                size: 0.025, // relative to sizeUnit
                color: "#000000"
            },
        }
    }
}
