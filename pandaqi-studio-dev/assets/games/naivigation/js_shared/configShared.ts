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

        // @NOTE: this is also simply "misc" for shared material, but it's loaded doubly (only for shared material) just for convenient code
        misc_shared:
        {
            path: "/naivigation/assets/misc.webp",
            frames: new Point(5, 1),
            useAbsolutePath: true
        },

        card_templates:
        {
            path: "/naivigation/assets/card_templates.webp",
            frames: new Point(6,1),
            useAbsolutePath: true,
        },

        bg_blobs:
        {
            path: "/naivigation/assets/bg_blobs.webp",
            frames: new Point(4,2),
            useAbsolutePath: true
        },

        terrains:
        {
            path: "/naivigation/assets/terrains.webp",
            frames: new Point(8,1),
            useAbsolutePath: true
        },

        icons_shared:
        {
            path: "/naivigation/assets/icons.webp",
            frames: new Point(8,5),
            useAbsolutePath: true
        },
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

        generation:
        {
            numInstructionTokens: 8
        },

        background:
        {
            dims: new CVal(new Point(1.2), "sizeUnit"),
            blobAlpha: 0.15,
            patternAlpha: 0.25
        },

        general:
        {
            numBackgroundBlobs: 4,
            
            fontSize: new CVal(0.125, "sizeUnit"),
            fontSizeMeta: new CVal(0.05, "sizeUnit"),
            fontSizeContent: new CVal(0.0575, "sizeUnit"),
            textPos: new CVal(new Point(0.5, 0.7), "size"),
            strokeWidth: new CVal(0.01, "sizeUnit"),
            alphaMeta: 0.5,
            contentTextBox: new CVal(new Point(0.9, 0.3), "size"),

            extraNumber:
            {
                fontSize: new CVal(0.0775, "sizeUnit"),
                strokeWidth: new CVal(0.005, "sizeUnit"),
            },

            illustration:
            {
                mainPos: new CVal(new Point(0.5, 0.3), "size"),
                mainDims: new CVal(new Point(0.7), "sizeUnit"),
                shadowBlur: new CVal(0.05 * 0.7, "sizeUnit"),
                smallDims: new CVal(new Point(0.15), "sizeUnit"),
                smallShadowBlur: new CVal(0.05 * 0.15, "sizeUnit")
            },

            gameIcon:
            {
                dims: new CVal(new Point(0.12), "sizeUnit"),
                posDefault: new CVal(new Point(0.5, 0.6), "size"),
                edgeOffsetFactor: 0.66,
                glowBlur: new CVal(0.1 * 0.12, "sizeUnit")
            },

            gps:
            {
                strokeColor: "#000000",
                strokeWidth: new CVal(0.05, "sizeUnit"),
                gridDims: new CVal(new Point(0.7), "sizeUnit"),
                alpha: 0.85,

                cellColors:
                {
                    neutral: "#FFFFFF",
                    reward: "#CBFF9C",
                    penalty: "#FF9894",
                    arrow: "#FFFFFF"
                },

                fontColor: "#000000",
                fontSize: new CVal(0.03, "sizeUnit"),
                textBoxDims: new CVal(new Point(0.2, 0.8), "size"),
                textBoxIconDims: new CVal(new Point(0.2), "sizeUnit"),
                iconOffset: new CVal(0.05, "sizeUnit"),
                posReward: new CVal(new Point(0.5, 0.7), "size"),
                posPenalty: new CVal(new Point(0.5, 0.85), "size")
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
                small: new Point(5,7),
                regular: new Point(3,5),
                large: new Point(2,3)
            },
        }, 

        general:
        {
            illustration:
            {
                mainDims: new CVal(new Point(0.8), "sizeUnit")
            },

            elevation:
            {
                triangleSideLength: new CVal(0.05, "sizeUnit"),
                triangleEdgeOffset: new CVal(0.025, "sizeUnit"),
                fill: "#FFFFFF",
                stroke: "#000000",
                strokeWidth: new CVal(0.01, "sizeUnit"),
            },

            vehicle:
            {
                dims: new CVal(new Point(0.4), "sizeUnit"),
                dimsGuides: new CVal(new Point(0.6), "sizeUnit")
            }
        },

        generation:
        {
            numUniqueVehicles: 3
        },

       
    }
}

export default CONFIG_NAIVIGATION_SHARED