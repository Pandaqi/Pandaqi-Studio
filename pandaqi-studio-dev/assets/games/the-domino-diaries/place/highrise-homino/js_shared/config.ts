import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig"
import Point from "js/pq_games/tools/geometry/point"
import { FloorType } from "./dict"
import CVal from "js/pq_games/tools/generation/cval"

const CONFIG:any = 
{
    debug:
    {
        omitFile: true, // @DEBUGGING (should be false)
        singleDrawPerType: true, // @DEBUGGING (should be false)
        onlyGenerate: true, // @DEBUGGING (should be false)
    },

    configKey: "highriseHominoConfig",
    fileName: "[Material] Highrise Homino",

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
            textConfig: new TextConfig({ style: TextStyle.ITALIC })
        },

        grolear:
        {
            path: "fonts/groLEAR.woff2",
        },

        wishes:
        {
            path: "wishes.webp",
            frames: new Point(4,2),
            disableCaching: true
        },

        objects:
        {
            path: "objects.webp",
            frames: new Point(4,4),
            disableCaching: true
        },

        tenants:
        {
            path: "tenants.webp",
            frames: new Point(4,4),
            disableCaching: true
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(4,2),
            disableCaching: true
        },
    },

    rulebook:
    {

    },

    generation:
    {
        numDominoes:
        {
            base: 40,
            roomService: 20,
            walletWatchers: 20,
            usefulUtilities: 20,
            happyHousing: 20,
        },

        numTenants:
        {
            base: 20,
            roomService: 10,
            walletWatchers: 10,
            usefulUtilities: 10,
            happyHousing: 10
        },

        emptyTileProb: 7.5,

        doorPercentage: 0.25,
        wallDist:
        {
            0: 0.1,
            1: 0.25,
            2: 0.35,
            3: 0.25,
            4: 0.05
        },
        
        floorDist:
        {
            [FloorType.WOOD]: 0.6,
            [FloorType.CONCRETE]: 0.25,
            [FloorType.CARPET]: 0.15
        },

        wishPercentageInverted: 0.2,
        wishNumDist:
        {
            1: 0.25,
            2: 0.35,
            3: 0.25,
            4: 0.15
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
            dimsElement: new Point(1, 2),
            dims: { 
                small: new Point(8,6),
                regular: new Point(6,4),
                large: new Point(5,3)
            },  
            autoStroke: true
        },

        setText:
        {
            size: new CVal(0.03, "sizeUnit"),
            color: "#111111",
            alpha: 0.5
        },

        walls:
        {
            dims: new CVal(new Point(1.0), "sizeUnit")
        },

        object:
        {
            main:
            {
                dims: new CVal(new Point(0.75), "sizeUnit")
            }
        },

        tenant:
        {
            main:
            {
                dims: new CVal(new Point(0.5), "sizeUnit")
            },

            score:
            {
                dims: new CVal(new Point(0.2), "sizeUnit"),
                fontSize: new CVal(0.08, "sizeUnit"),
                textColor: "#111111"
            },

            detailsYHeight: new CVal(0.3, "sizeUnit"), // remember this is all relative to origin (0,0) in center of domino side

            props:
            {
                dims: new CVal(new Point(0.15), "sizeUnit"),
                xPositions:
                {
                    1: [0.25],
                    2: [0.25, 0.75],
                    3: [0.15, 0.325, 0.75],
                    4: [0.15, 0.325, 0.675, 0.85]
                }
            },

            wishes:
            {
                dims: new CVal(new Point(0.15), "sizeUnit"),
                number:
                {
                    fontSize: new CVal(0.025, "sizeUnit"),
                    pos: new CVal(new Point(-0.2, -0.2), "sizeUnit"),
                    textColor: "#FFFFFF",
                    strokeColor: "#111111",
                    strokeWidth: new CVal(0.1, "dominoes.wishes.number.fontSize")
                }
            },
        }
    },
}

export default CONFIG