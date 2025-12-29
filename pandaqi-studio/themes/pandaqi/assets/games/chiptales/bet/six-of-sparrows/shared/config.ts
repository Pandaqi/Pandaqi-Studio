import { SettingType, TextConfig, TextStyle, Vector2, Bounds, CVal } from "lib/pq-games"
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
                label: "Base Game",
                value: true
            },

            biddingCards:
            {
                type: SettingType.CHECK,
                label: "Bidding Cards",
                value: false
            },

            expansion:
            {
                type: SettingType.CHECK,
                label: "Expansion",
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
        fileName: "Six of Sparrows",
    },

    // assets
    _resources:
    {    
        base: "/chiptales/bet/six-of-sparrows/assets/",
        files:
        {
            sedan:
            {
                path: "fonts/Sedan-Regular.woff2",
            },

            sedan_italic:
            {
                key: "sedan",
                path: "fonts/Sedan-Italic.woff2",
                textConfig: new TextConfig({ style: TextStyle.ITALIC })
            },

            sancreek:
            {
                path: "fonts/Sancreek-Regular.woff2",
            },

            card_templates:
            {
                path: "card_templates.webp",
                frames: new Vector2(4,1)
            },

            misc:
            {
                path: "misc.webp",
                frames: new Vector2(8,1)
            },

            bid_icons:
            {
                path: "bid_icons.webp",
                frames: new Vector2(8,4),
            },
        },
    },

    rulebook:
    {
        numPlayerBounds: new Bounds(2,4),
        numCardsPerPlayer: 6,
        bidProb: 0.45,
    },

    generation:
    {
        numberBounds: new Bounds(1,10),
        maxNumHandCards: 6,
        numBidTokensExpansion: 6
    },

    _material:
    {
        cards:
        {
            itemSize: new Vector2(375, 525),
            picker: () => cardPicker,
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
            heading: "sancreek",
            body: "sedan",
        },

        cards:
        {
            regular:
            {
                numberOffset: new CVal(new Vector2(0.085, 0.125), "sizeUnit"),
                fontSize: new CVal(0.185, "sizeUnit"),
                suitIconArrangeScalar: new CVal(new Vector2(0.21, 0.35), "size"),
                suitIconDims: new CVal(new Vector2(0.2), "sizeUnit"),
                doubleDigitsScaleDown: 0.775
            },

            overlay:
            {
                alpha: 0.5
            },

            bid:
            {
                icon:
                {
                    pos: new CVal(new Vector2(0.5, 0.415), "size"),
                    size: new CVal(new Vector2(0.69), "sizeUnit")
                },

                score: 
                {
                    fontSize: new CVal(0.08, "sizeUnit"),
                    pos: new CVal(new Vector2(0.81, 0.115), "size")
                },

                bonus:
                {
                    pos: new CVal(new Vector2(0.22, 0.115), "size"),
                    size: new CVal(new Vector2(0.2), "sizeUnit")
                },

                textBox:
                {
                    pos: new CVal(new Vector2(0.5, 0.8), "size"),
                    size: new CVal(new Vector2(0.875, 0.25), "size"),
                    fontSize: new CVal(0.069, "sizeUnit")
                }
            },

            token:
            {
                pos: new CVal(new Vector2(0.5), "size"),
                fontSize: new CVal(0.6, "sizeUnit"),
                fontColor: "#890e63",

                small:
                {
                    anchor: new CVal(new Vector2(0.5, 0.115), "size"),
                    offset: new CVal(new Vector2(0.35, 0), "sizeUnit"),
                    fontSize: new CVal(0.08, "sizeUnit")
                }
            }

        },
    }
}