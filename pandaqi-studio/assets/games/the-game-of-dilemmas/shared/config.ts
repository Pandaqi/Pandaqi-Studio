import TextConfig, { TextWeight } from "js/pq_games/layout/text/textConfig"
import Point from "js/pq_games/tools/geometry/point"
import { TokenType } from "./dict"
import { tokenPicker } from "../game/tokenPicker"
import { cardPicker } from "../game/cardPicker"

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

        packs:
        {
            type: SettingType.MULTI,
            values: ["base", "advanced", "expert", "extraordinary"],
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
        fileName: "The Game of Dilemmas",
    },

    packs: {},

    // assets
    assetsBase: "/the-game-of-dilemmas/assets/",
    assets:
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
            frames: new Point(4,1),
        },

        token_types:
        {
            path: "token_types.webp",
            frames: new Point(4,1)
        },

        template_tintable:
        {
            path: "template_tintable.webp"
        }
    },

    // how generation/balancing happens
    generation:
    {
        tokenTypes: [TokenType.YES, TokenType.NO],
        numPerType: 3,
        maxNumPlayers: 6,
        tokenTypesVariant: [TokenType.SUPERYES, TokenType.SUPERNO],
        numPerTypeVariant: 1
    },

    _material:
    {
        cards:
        {
            picker: cardPicker,
            mapper:
            {
                sizeElement: new Point(1, 1.4),
                size: 
                { 
                    small: new Point(5,5),
                    regular: new Point(4,4),
                    large: new Point(3,3)
                },
            },
        },

        tokens:
        {
            picker: tokenPicker,
            mapper:
            {
                sizeElement: new Point(1,1),
                size: 
                {
                    small: new Point(8,10),
                    regular: new Point(6,8),
                    large: new Point(4,5)
                }
            }
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
                iconSize: 0.15, // ~sizeUnit
                iconOffset: 0.125, // ~sizeUnit
                textYPos: 0.925, // ~sizeY
                textFontSize: 0.15, // ~sizeUnit
                textStrokeWidth: 0.1 // ~textFontSize
            },

            text:
            {
                fontSize: { large: 0.125, medium: 0.105, small: 0.09 }, // ~sizeUnit
                fontSizeCutoffs: { large: 65, medium: 105, small: 145 },
                yPos: 0.433, // ~sizeY
                size: new Point(0.91, 0.8), // ~size
                negativeCardPrefix: "... but "
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