import { SettingType, TextConfig, TextWeight, TextStyle, Vector2, Bounds, MapperPreset } from "lib/pq-games"
import { RendererPixi } from "lib/pq-games/renderers/pixi/rendererPixi"
import { boardPicker } from "../board/boardPicker"

export const CONFIG = 
{
    _settings:
    {
        includeRules:
        {
            type: SettingType.CHECK,
            value: true,
            remark: "Only disable if you've printed the rulebook or know them by heart."
        },

        boardSize:
        {
            type: SettingType.ENUM,
            values: ["small", "regular", "big", "huge"],
            value: "regular",
            remark: "Increases or decreases the number of icons on the board; not page size."
        },

        sets:
        {
            type: SettingType.GROUP,

            base:
            {
                type: SettingType.CHECK,
                value: true,
                label: "Base Set",
            },

            advanced:
            {
                type: SettingType.CHECK,
                label: "Advanced Set",
                value: false,
            },

            expert:
            {
                type: SettingType.CHECK,
                label: "Expert Set",
                value: false,
            },
        }
    },

    _game:
    {
        fileName: "Magnetmen",
        renderer: new RendererPixi()
    },
    
    allTypes: {},
    beginnerMode: true,

    // assets
    _resources:
    {    
        base: "/magnetmen/assets/",
        files:
        {
            vina:
            {
                path: "fonts/VinaSans-Regular.woff2",
                set: false
            },

            urbanist:
            {
                path: "fonts/Urbanist-Regular.woff2",
                set: false
            },

            urbanist_bold:
            {
                key: "urbanist",
                path: "fonts/Urbanist-Black.woff2",
                textConfig: new TextConfig({ weight: TextWeight.BOLD }),
                set: false
            },

            urbanist_italic:
            {
                key: "urbanist",
                path: "fonts/Urbanist-Italic.woff2",
                textConfig: new TextConfig({ style: TextStyle.ITALIC }),
                set: false
            },

            misc:
            {
                path: "misc.webp",
                frames: new Vector2(4,1),
                set: false
            },

            sidebar:
            {
                path: "sidebar.webp",
                frames: new Vector2(2,1),
                set: false
            },

            base:
            {
                path: "base.webp",
                frames: new Vector2(8,1),
                set: true
            },

            base_simplified:
            {
                path: "base_simplified.webp",
                frames: new Vector2(8,1),
                set: true
            },

            advanced:
            {
                path: "advanced.webp",
                frames: new Vector2(8,1),
                set: true
            },

            advanced_simplified:
            {
                path: "advanced_simplified.webp",
                frames: new Vector2(8,1),
                set: true
            },

            expert:
            {
                path: "expert.webp",
                frames: new Vector2(8,1),
                set: true
            },

            expert_simplified:
            {
                path: "expert_simplified.webp",
                frames: new Vector2(8,1),
                set: true
            },
        },
    },

    // how generation/balancing happens
    generation:
    {
        size: 
        {
            small: new Vector2(6,6),
            regular: new Vector2(8,8),
            big: new Vector2(10,9),
            huge: new Vector2(11,11)
        },

        beginnerDestroyType: "explorer",

        // two requirements for this
        // => it should FIT in the sidebar
        // => the number of slots (in player inventory) should be low enough to FORCE many types to be used twice or thrice during the game.
        numUniqueTypes: 
        { 
            beginner: new Bounds(5,6),
            other: new Bounds(6,7)
        }
    },

    _material:
    {
        board:
        {
            picker: () => boardPicker,
            mapper: MapperPreset.FULL_PAGE
        }
    },

    // how to draw stuff
    _drawing:
    {
        fonts:
        {
            heading: "vina",
            body: "urbanist"
        },

        edgeMargin: new Vector2(0.05), // ~pageSizeUnit
        bgColor: "#020823",
        
        sidebar:
        {
            width: 0.3, // ~innerPageSizeX
            extraMargin: 0.03, // ~pageSizeX; padding between board and sidebar
            tutImageRatio: 639.0/572.0,
            fontSize: 0.3, // ~entrySizeY
            maxFontSize: 42, // an absolute maximum, anything higher is too large and unnecessary
            lineHeight: 1.033,
            iconSimpleScale: 0.5, // ~iconSize (regular)
            iconPadding: 0.01, // ~entrySizeX (regular)
            iconYPadding: 0.1, // ~entrySizeY
            iconScale: 0.925, // ~iconSize (regular) => this just creates some breathing room between edge roundedRect and image
        },

        cells:
        {
            strokeWidth: 0.03, // ~cellSizeUnit
            iconSize: 0.75, // ~cellSizeUnit
            bgColorLightness: 97,
            bgColorDarken: 9
        },

        inventories:
        {
            height: 0.05, // ~boardSizeUnit
            strokeWidth: 0.03, // ~cellSizeUnit
            numSlots: {
                small: 9, 
                regular: 14,
                big: 18,
                huge: 20
            },
            extraMargin: 0.0175, // ~pageSizeUnit
        }
    }
}