import { TextConfig, TextStyle, Vector2, CVal } from "lib/pq-games";
import { cardPicker } from "../game/cardPicker";

export const CONFIG = 
{
    _debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    _game:
    {
        fileName: "Death by Digits",
    },

    // assets
    _resources:
    {    
        base: "/death-by-digits/assets/",
        files:
        {
            ancient:
            {
                path: "fonts/JSL-Ancient.woff2",
            },

            ancient_italic:
            {
                key: "ancient",
                path: "fonts/JSL-AncientItalic.woff2",
                textConfig: new TextConfig({ style: TextStyle.ITALIC }),
            },

            requiem:
            {
                path: "fonts/Requiem.woff2",
            },

            card_templates:
            {
                path: "card_templates.webp",
                frames: new Vector2(3,1)
            },

            expansion_icons:
            {
                path: "expansion_icons.webp",
                frames: new Vector2(6,1)
            },

            number_icons:
            {
                path: "number_icons.webp",
                frames: new Vector2(6,4)
            },
        },
    },

    generation:
    {
        minNumber: 1,
        maxNumber: 18,
        numCardsPerNumber: 3
    },

    _material:
    {
        cards:
        {
            picker: cardPicker,
            mapper:
            {
                autoStroke: true,
                sizeElement: new Vector2(1, 1.4),
                size: 
                { 
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
            heading: "requiem",
            body: "ancient",
        },

        cards:
        {
            colors:
            {
                darkenFactor: 50,
            },

            numbers:
            {
                offset: new CVal(new Vector2(0.133, 0.133), "sizeUnit"),
                fontSize: new CVal(0.165, "sizeUnit"),
                minusSignScaleFactor: 0.775,
            },

            numberCenter:
            {
                textPos: new CVal(new Vector2(0.5), "size"),
                textPosSpecial: new CVal(new Vector2(0.5, 0.375), "size"),
                fontSize: new CVal(0.4, "sizeUnit"),
                fontSizeSpecial: new CVal(0.275, "sizeUnit")
            },

            icons:
            {
                offsetFromNumber: new CVal(new Vector2(-0.0115, 0.2), "sizeUnit"),
                size: new CVal(new Vector2(0.125), "sizeUnit"),
            },

            special:
            {
                iconOffset: new CVal(new Vector2(0.275), "sizeUnit"),
                iconDims: new CVal(new Vector2(0.2), "sizeUnit"),
                textPos: new CVal(new Vector2(0.5, 0.6), "size"),
                textDims: new CVal(new Vector2(0.55, 0.35), "size"),
                fontSize: new CVal(0.06, "sizeUnit"),
            }
        },
    }
}