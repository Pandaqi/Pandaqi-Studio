import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig"
import CVal from "js/pq_games/tools/generation/cval"
import Point from "js/pq_games/tools/geometry/point"

const CONFIG_NAIVIGATION_SHARED = 
{
    // All Naivigation games use the same two "main fonts"
    // Each one can also, however, have one "special" font (defined in its own config),
    // that is more thematic and used only in THAT game
    fonts:
    {
        heading: "ambery",
        body: "k2d"
    },

    // assets
    // these links are absolute, so we can keep using relative links all throughout the specific games
    // but this shit will still load fine for all
    assets:
    {
        ambery:
        {
            path: "/naivigation/assets/fonts/AmberyGarden-Regular.woff2",
            useAbsolutePath: true
        },

        k2d:
        {
            path: "/naivigation/assets/fonts/K2D-Regular.woff2",
            useAbsolutePath: true
        },

        k2d_bold:
        {
            key: "k2d",
            path: "/naivigation/assets/fonts/K2D-ExtraBold.woff2",
            useAbsolutePath: true,
            textConfig: new TextConfig({ weight: TextWeight.BOLD })
        },

        k2d_italic:
        {
            key: "k2d",
            path: "/naivigation/assets/fonts/K2D-Italic.woff2",
            useAbsolutePath: true,
            textConfig: new TextConfig({ style: TextStyle.ITALIC })
        },

        card_templates:
        {
            path: "/naivigation/assets/card_templates.webp",
            frames: new Point(6, 2),
            useAbsolutePath: true,
        },

        bg_blobs:
        {
            path: "/naivigation/assets/bg_blobs.webp",
            frames: new Point(4, 2),
            useAbsolutePath: true
        }
    },

    cards:
    {
        drawerConfig:
        {
            autoStroke: true,
            dimsElement: new Point(1, 1.4),
            dims: 
            { 
                small: new Point(4,4),
                regular: new Point(3,3),
                large: new Point(2,2)
            },
        }, 

        background:
        {
            dims: new CVal(1.2, "sizeUnit"),
            blobAlpha: 0.25,
            patternAlpha: 0.25
        },

        general:
        {
            numBackgroundBlobs: 4,
            
            fontSize: new CVal(0.1, "sizeUnit"),
            fontSizeMeta: new CVal(0.05, "sizeUnit"),
            fontSizeContent: new CVal(0.07, "sizeUnit"),
            textPosY: new CVal(0.75, "size.y"),
            strokeWidth: new CVal(0.04, "sizeUnit"),
            alphaMeta: 0.5,
            contentTextBox: new CVal(new Point(0.8, 0.4), "size"),

            extraNumber:
            {
                fontSize: new CVal(0.1, "sizeUnit"),
                strokeWidth: new CVal(0.05, "sizeUnit"),
                offset: new CVal(0.4, "sizeUnit"),
            },

            illustration:
            {
                mainPos: new CVal(0.5, "size"),
                mainDims: new CVal(0.8, "sizeUnit"),
                smallDims: new CVal(0.15, "sizeUnit"),
            },

            gameIcon:
            {
                dims: new CVal(0.1, "sizeUnit"),
                posDefault: new CVal(new Point(0.5, 0.55), "size")
            }
        }
    },

    tiles:
    {
        drawerConfig:
        {
            autoStroke: true,
            dimsElement: new Point(1, 1),
            dims: 
            { 
                small: new Point(7,10),
                regular: new Point(5,7),
                large: new Point(3,5)
            },
        }, 

        generation:
        {
            numUniqueVehicles: 2
        },

        vehicle:
        {
            dims: new CVal(new Point(0.4), "sizeUnit")
        }
    }
}

export default CONFIG_NAIVIGATION_SHARED