
import { SettingType, TextConfig, TextStyle, Vector2 } from "lib/pq-games"
import { cardPicker } from "../game/cardPicker"

export const CONFIG = 
{
    _settings:
    {
        sets:
        {
            type: SettingType.GROUP,

            base:
            {
                type: SettingType.CHECK,
                default: true,
                value: true,
                label: "Base Game"
            },

            appetite:
            {
                type: SettingType.CHECK,
                value: false,
                label: "Appetite for All"
            },

            coins:
            {
                type: SettingType.CHECK,
                value: false,
                label: "Coins for Combos"
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
        fileName: "Split The Foody",
    },

    // assets
    _resources:
    {    
        base: "/split-the-foody/assets/",
        files:
        {
            primitive:
            {
                path: "fonts/Primitive.woff2"
            },

            rosarivo:
            {
                path: "fonts/Rosarivo-Regular.woff2"
            },

            rosarivo_italic:
            {
                key: "rosarivo",
                path: "fonts/Rosarivo-Italic.woff2",
                textConfig: new TextConfig({ style: TextStyle.ITALIC })
            },

            base:
            {
                path: "base.webp",
                frames: new Vector2(8,2),
                cardSet: true
            },

            appetite:
            {
                path: "appetite.webp",
                frames: new Vector2(8,2),
                cardSet: true
            },

            coins:
            {
                path: "coins.webp",
                frames: new Vector2(10,1),
                cardSet: true
            },

            misc:
            {
                path: "misc.webp",
                frames: new Vector2(4,1)
            },

            bgs:
            {
                path: "bgs.webp",
                frames: new Vector2(4,1)
            },
        },
    },

    _material:
    {
        cards:
        {
            picker: cardPicker,
            mapper:
            {
                size: { 
                    small: new Vector2(4,4),
                    regular: new Vector2(3,3),
                    large: new Vector2(2,2)
                },
                sizeElement: new Vector2(1, 1.4),
            }
        }
    },

    _drawing:
    {
         fonts:
        {
            heading: "primitive",
            body: "rosarivo",
        },

        cards:
        {            
            shared:
            {
                shadowRadius: 0.033, // ~sizeUnit
                shadowColor: "#00000099", // semi-transparent black
            },

            heading:
            {
                yPos: 0.925,
                fontSize: 0.075, // ~sizeUnit
                fillColor: "#FFFFFF",
                strokeColor: "#240C00",
                strokeWidth: 0.1, // ~fontSize
                shadowOffset: 0.1, // ~fontSize
            },

            corners:
            {
                edgeOffsetBig: new Vector2(0.15, 0.15), // ~sizeUnit
                coinScaleBig: 0.235, // ~sizeUnit
                coinScoreScale: 0.5, // ~coinDims
                fontSizeBig: 0.15, // ~sizeUnit

                edgeOffsetSmall: new Vector2(0.1, 0.1), // ~sizeUnit
                coinScaleSmall: 0.15, // ~sizeUnit
                fontSizeSmall: 0.075, // ~sizeUnit

                fillColor: "#FFFFFF",
                strokeColor: "#240C00",
                strokeWidth: 0.1, // ~fontSize
            },

            illustration:
            {
                yPos: 0.33, // ~sizeY
                scale: 0.66 // ~sizeUnit
            },

            power:
            {
                yPos: 0.725, // ~sizeY
                scrollScale: new Vector2(0.95, 0.95/2.13), // ~size => the image is about 2.13:1
                textBoxWidth: 0.844, // ~scrollWidth
                fontSize: 0.066, // ~sizeUnit
                shadowOffset: 0.033, // ~fontSize
            },
            
            outline:
            {
                size: 0.025, // ~sizeUnit
                color: "#000000"
            }
        }
    }
}