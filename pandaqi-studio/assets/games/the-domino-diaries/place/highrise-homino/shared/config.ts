import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig"
import Point from "js/pq_games/tools/geometry/point"
import { FloorType } from "./dict"
import CVal from "js/pq_games/tools/generation/cval"
import { GridSizePreset } from "js/pq_games/tools/generation/materialGenerator"

const CONFIG:any = 
{
    _settings:
    {
        addText:
        {
            type: SettingType.CHECK,
            label: "Add Text",
            default: true,
            remark: "Adds text that explains what a tile does on the tile itself."
        },

        sets:
        {
            type: SettingType.GROUP,

            base:
            {
                type: SettingType.CHECK,
                default: true,
                label: "Base Game"
            },

            roomService:
            {
                type: SettingType.CHECK,
                label: "Room Service"
            },

            walletWatchers:
            {
                type: SettingType.CHECK,
                label: "Wallet Watchers",
            },

            usefulUtilities:
            {
                type: SettingType.CHECK,
                label: "Useful Utilities",
            },

            happyHousing:
            {
                type: SettingType.CHECK,
                label: "Happy Housing",
            },

            livingTogether:
            {
                type: SettingType.CHECK,
                label: "Living Together",
                remark: "Extra material that makes the game more fun and engaging when played purely cooperatively"
            },
        }
    },

    debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    configKey: "highriseHominoConfig",
    fileName: "Highrise Homino",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",
    addText: true,

    fonts:
    {
        heading: "grolear",
        body: "kanit",
    },

    sets:
    {
        base: true,
        roomService: false,
        walletWatchers: false,
        usefulUtilities: false,
        happyHousing: false,
        livingTogether: false,
    },

    // assets
    assetsBase: "/the-domino-diaries/place/highrise-homino/assets/",
    assets:
    {
        kanit:
        {
            path: "fonts/Kanit-Regular.woff2",
        },

        kanit_bold:
        {
            key: "kanit",
            path: "fonts/Kanit-Black.woff2",
            textConfig: new TextConfig({ weight: TextWeight.BOLD })
        },

        kanit_italic:
        {
            key: "kanit",
            path: "fonts/Kanit-Italic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC })
        },

        kanit_bold_italic:
        {
            key: "kanit",
            path: "fonts/Kanit-BlackItalic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC, weight: TextWeight.BOLD })
        },

        grolear:
        {
            path: "fonts/groLEAR.woff2",
        },

        wishes:
        {
            path: "wishes.webp",
            frames: new Point(4,4),
        },

        mission_tiles:
        {
            path: "mission_tiles.webp",
            frames: new Point(2,1),
        },

        objects:
        {
            path: "objects.webp",
            frames: new Point(4,5),
            loadInSequence: true
        },

        tenants:
        {
            path: "tenants.webp",
            frames: new Point(4,4),
            loadInSequence: true
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(4,4),
        },
    },

    rulebook:
    {

    },

    generation:
    {
        numDominoes:
        {
            base: 48,
            roomService: 26,
            walletWatchers: 26,
            usefulUtilities: 26,
            happyHousing: 26,
            livingTogether: 0,
        },

        numTenants:
        {
            base: 24,
            roomService: 14,
            walletWatchers: 14,
            usefulUtilities: 14,
            happyHousing: 14,
            livingTogether: 0,
        },

        emptyTileProb: 10.0,

        doorPercentage: 0.25,
        windowPercentage: 0.125,
        wallDist:
        {
            0: 0.05,
            1: 0.3,
            2: 0.35,
            3: 0.3,
        },
        
        floorDist:
        {
            [FloorType.WOOD]: 0.45,
            [FloorType.CONCRETE]: 0.325,
            [FloorType.CARPET]: 0.225
        },

        wishPercentageInverted: 0.33,
        maxWishNumber: 9,
        wishNumDist:
        {
            1: 0.25,
            2: 0.4,
            3: 0.35,
        },

        score:
        {
            wishMultiplier: 2.5,
            wishInverseMultiplier: 0.33,
            propertyValue:
            {
                construction: 1.0,
                wallet: 2.0
            }
        },
    },

    dominoes:
    {
        drawerConfig:
        {
            preset: GridSizePreset.DOMINO
        },

        setText:
        {
            size: new CVal(0.0575, "sizeUnit"),
            color: "#111111",
            strokeColor: "#EEEEEE",
            strokeWidth: new CVal(0.2, "dominoes.setText.size"),
            alpha: 0.85
        },

        walls:
        {
            size: new CVal(new Point(1.0), "sizeUnit")
        },

        text:
        {
            fontSize: new CVal(0.05825, "sizeUnit")
        },

        object:
        {
            main:
            {
                size: new CVal(new Point(0.7), "sizeUnit")
            }
        },

        tenant:
        {
            main:
            {
                size: new CVal(new Point(0.625), "sizeUnit")
            },

            score:
            {
                size: new CVal(new Point(0.4), "sizeUnit"),
                fontSize: new CVal(0.16, "sizeUnit"),
                textColor: "#111111"
            },

            detailsYHeight: new CVal(0.3, "sizeUnit"), // remember this is all relative to origin (0,0) in center of domino side

            props:
            {
                size: new CVal(new Point(0.3), "sizeUnit"),
                xPositions:
                {
                    1: [0.175],
                    2: [0.175, 0.825],
                }
            },

            wishes:
            {
                size: new CVal(new Point(0.3), "sizeUnit"),
                number:
                {
                    fontSize: new CVal(0.165, "sizeUnit"),
                    pos: new CVal(new Point(0, -0.4), "dominoes.tenant.wishes.size"),
                    textColor: "#FFFFFF",
                    strokeColor: "#111111",
                    strokeWidth: new CVal(0.1, "dominoes.tenant.wishes.number.fontSize")
                }
            },
        }
    },

    missions:
    {
        fontSize: new CVal(0.0775, "sizeUnit"),
        textBoxDims: new CVal(new Point(0.85, 0.3), "size"),
        taskTextPos: new CVal(new Point(0.0725, 0.3), "size"),
        rewardTextPos: new CVal(new Point(0.0725, 0.685), "size"),
        fontSizeSet: new CVal(0.0585, "sizeUnit"),
        setTextPos: new CVal(new Point(0.5, 0.95), "size"),
        setTextAlpha: 0.5,
    }
}


export default CONFIG