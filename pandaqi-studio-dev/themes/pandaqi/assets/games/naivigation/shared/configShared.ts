import { TextConfig, TextWeight, TextStyle, Vector2, CVal, MapperPreset } from "lib/pq-games"

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

    addTextOnTiles: false,
    vehiclesAsPawns: false, // @NOTE: easiest way for now to make sure the interactive examples use the token version => @TODO: find a CLEANER WAY to have the generators turn this off; maybe tweak config before putting into visualizer?

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
            frames: new Vector2(8,2),
            useAbsolutePath: true
        },

        card_templates:
        {
            path: "/naivigation/assets/card_templates.webp",
            frames: new Vector2(8,1),
            useAbsolutePath: true,
        },

        bg_blobs:
        {
            path: "/naivigation/assets/bg_blobs.webp",
            frames: new Vector2(4,2),
            useAbsolutePath: true
        },

        terrains:
        {
            path: "/naivigation/assets/terrains.webp",
            frames: new Vector2(8,1),
            useAbsolutePath: true,
            loadIf: ["sets.willneverhappen"]
        },

        persons:
        {
            path: "/naivigation/assets/persons.webp",
            frames: new Vector2(8,1),
            useAbsolutePath: true,
            loadIf: ["sets.willneverhappen"]
        },
    },

    cards:
    {
        drawerConfig:
        {
            preset: MapperPreset.CARD,
        }, 

        generation:
        {
            numInstructionTokens: 8
        },

        background:
        {
            size: new CVal(new Vector2(1.2), "sizeUnit"),
            blobAlpha: 0.15,
            patternAlpha: 0.25
        },

        general:
        {
            numBackgroundBlobs: 4,
            
            fontSize: new CVal(0.125, "sizeUnit"),
            fontSizeMeta: new CVal(0.05, "sizeUnit"),
            fontSizeContent: new CVal(0.0575, "sizeUnit"),
            textPos: new CVal(new Vector2(0.5, 0.7), "size"),
            strokeWidth: new CVal(0.01, "sizeUnit"),
            alphaMeta: 0.5,
            contentTextBox: new CVal(new Vector2(0.9, 0.3), "size"),

            extraNumber:
            {
                fontSize: new CVal(0.0775, "sizeUnit"),
                strokeWidth: new CVal(0.005, "sizeUnit"),
            },

            illustration:
            {
                mainPos: new CVal(new Vector2(0.5, 0.3), "size"),
                mainDims: new CVal(new Vector2(0.7), "sizeUnit"),
                shadowBlur: new CVal(0.05 * 0.7, "sizeUnit"),
                smallDims: new CVal(new Vector2(0.15), "sizeUnit"),
                smallShadowBlur: new CVal(0.05 * 0.15, "sizeUnit")
            },

            gameIcon:
            {
                size: new CVal(new Vector2(0.12), "sizeUnit"),
                posDefault: new CVal(new Vector2(0.5, 0.6), "size"),
                edgeOffsetFactor: 0.66,
                glowBlur: new CVal(0.1 * 0.12, "sizeUnit")
            },

            gps:
            {
                strokeColor: "#000000",
                strokeWidth: new CVal(0.0075, "sizeUnit"),
                gridDims: new CVal(new Vector2(0.65), "sizeUnit"),
                gridIconSizeFactor: 0.65,
                gridIconAlpha: 0.75, 
                alpha: 0.75,

                cellColors:
                {
                    neutral: "#FFFFFF",
                    reward: "#CBFF9C",
                    penalty: "#FF9894",
                    arrow: "#FFFFFF"
                },

                fontColor: "#000000",
                fontSize: new CVal(0.055, "sizeUnit"),
                textBoxDims: new CVal(new Vector2(0.785, 0.2), "size"),
                textBoxIconDims: new CVal(new Vector2(0.14), "sizeUnit"),
                iconOffset: new CVal(0.1, "sizeUnit"),
                posReward: new CVal(new Vector2(0.572, 0.765), "size"),
                posPenalty: new CVal(new Vector2(0.572, 0.933), "size")
            }
        }
    },

    tiles:
    {
        drawerConfig:
        {
            preset: MapperPreset.TILE,
        }, 

        general:
        {
            illustration:
            {
                mainDims: new CVal(new Vector2(0.8), "sizeUnit")
            },

            elevation:
            {
                triangleSideLength: new CVal(0.125, "sizeUnit"),
                triangleEdgeOffset: new CVal(new Vector2(0.024), "sizeUnit"),
                fill: "#000000",
                stroke: "#FFFFFF",
                strokeWidth: new CVal(0.02, "sizeUnit"),
                composite: "overlay", // source-over
            },

            collectibleIcon:
            {
                size: new CVal(0.185, "sizeUnit")
            },

            vehicle:
            {
                size: new CVal(new Vector2(0.4), "sizeUnit"),
                sizeGuides: new CVal(new Vector2(0.6), "sizeUnit")
            }, 

            text:
            {
                fontSize: new CVal(0.0625, "sizeUnit"),
                textColor: "#FFFFFF",
                bgColor: "#000000",

                pos: new CVal(new Vector2(0.5, 0.82), "sizeUnit"),

                boxDims: new CVal(new Vector2(0.933, 0.3), "sizeUnit"),
                boxBlur: new CVal(0.02, "sizeUnit"),
                boxAlpha: 0.85
            }
        },

        generation:
        {
            numUniqueVehicles: 3
        },
    },

    pawns:
    {
        general:
        {
            outline:
            {
                color: "#000000",
                width: new CVal(0.01, "sizeUnit"),
            },

            cuttingLine:
            {
                color: "#BBBBBB",
                width: new CVal(0.005, "sizeUnit")
            }
        }
    }
}

export default CONFIG_NAIVIGATION_SHARED