import { SettingType, TextConfig, TextWeight, TextStyle, Vector2, Bounds, CVal } from "lib/pq-games"
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

            expansion:
            {
                type: SettingType.CHECK,
                label: "Expansion",
                value: false
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
        fileName: "Fiddlefoo",
    },

    // assets
    _resources:
    {    
        base: "/fiddlefoo/assets/",
        files:
        {
            andada:
            {
                path: "fonts/Andada-Regular.woff2",
            },

            andada_bold:
            {
                key: "andada",
                path: "fonts/Andada-Bold.woff2",
                textConfig: new TextConfig({ weight: TextWeight.BOLD }),
            },

            andada_italic:
            {
                key: "andada",
                path: "fonts/Andada-Italic.woff2",
                textConfig: new TextConfig({ style: TextStyle.ITALIC }),
            },

            casanova:
            {
                path: "fonts/Casanova.woff2",
            },

            templates:
            {
                path: "templates.webp",
                frames: new Vector2(4,1)
            },

            special_cards:
            {
                path: "special_cards.webp",
                frames: new Vector2(6,4)
            },

            misc:
            {
                path: "misc.webp",
                frames: new Vector2(6,1)
            },
        },
    },

    rulebook:
    {
        numPlayerBounds: new Bounds(2,4),
        numCardsPerPlayer: 8,
        maxBoardSize: new Vector2(8,8),
        preMoveNumBounds: new Bounds(5,12),
        boardCanvasSize: new Vector2(1024, 1024),
        throwCardProb: 0.9,
        throwCardMaxNum: 5,
    },

    generation:
    {
        defaultMaxNumOnCard: 16,
        noteBounds: new Bounds(1,4),
        numCardsPerColor:
        {
            yellow: 16,
            red: 16,
            blue: 16,
            purple: 6
        }
    },

    _material:
    {
        cards:
        {
            itemSize: new Vector2(375, 525),
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
            heading: "casanova",
            body: "andada",
        },

        cards:
        {
            numbers:
            {
                offset: new CVal(new Vector2(0.125, 0.125), "sizeUnit"),
                textColor: "#030303",
                fontSize: new CVal(0.185, "sizeUnit")
            },

            numberCenter:
            {
                textPos: new CVal(new Vector2(0.5), "size"),
                fontSize: new CVal(0.5, "sizeUnit"),
                strokeColor: "#FDFDFD",
                strokeWidth: new CVal(0.02, "sizeUnit"),
            },

            typeWritten:
            {
                offset: new CVal(new Vector2(0, 0.1), "size"),
                fontSize: new CVal(0.055, "sizeUnit"),
            },

            special:
            {
                iconPos: new CVal(new Vector2(0.5, 0.225), "size"),
                iconDims: new CVal(new Vector2(0.43), "sizeUnit"),
                iconBGDims: new CVal(new Vector2(0.485), "sizeUnit"),

                fontSize: new CVal(0.05, "sizeUnit"),
                textPos: new CVal(new Vector2(0.5, 0.765), "size"),
                textDims: new CVal(new Vector2(0.645, 0.4), "sizeUnit"),
                textColor: "#030303"
            },

            notes:
            {
                noteSize: new CVal(new Vector2(0.1), "sizeUnit"),
                lineOffset: new CVal(0.025, "sizeUnit"),
                offsetGroup: new CVal(new Vector2(0.16, 0), "size"),
            }
        },
    }
}