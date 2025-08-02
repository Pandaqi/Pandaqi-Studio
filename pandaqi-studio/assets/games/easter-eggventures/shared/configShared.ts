import TextConfig, { TextWeight } from "js/pq_games/layout/text/textConfig";
import CVal from "js/pq_games/tools/generation/cval";
import Point from "js/pq_games/tools/geometry/point";

export const CONFIG_SHARED =
{
    _resources:
    {
        files:
        {
            gargle:
            {
                key: "gargle",
                path: "/easter-eggventures/assets/fonts/GargleRg-Regular.woff2",
                useAbsolutePath: true
            },

            gargle_bold:
            {
                key: "gargle",
                path: "/easter-eggventures/assets/fonts/GargleRg-Bold.woff2",
                useAbsolutePath: true,
                textConfig: new TextConfig({ weight: TextWeight.BOLD })
            },
            
            eggs:
            {
                path: "/easter-eggventures/assets/images/eggs.webp",
                useAbsolutePath: true,
                frames: new Point(8,1),
            },

            eggs_backgrounds:
            {
                path: "/easter-eggventures/assets/images/eggs_backgrounds.webp",
                useAbsolutePath: true,
                frames: new Point(8,1),
            },

            misc:
            {
                path: "/easter-eggventures/assets/images/misc.webp",
                useAbsolutePath: true,
                frames: new Point(8,1)
            },

            pawns:
            {
                path: "/easter-eggventures/assets/images/pawns.webp",
                useAbsolutePath: true,
                frames: new Point(8,1),
            },
        }
    },

    _material:
    {
        tiles:
        {
            mapper:
            {
                autoStroke: true,
                sizeElement: new Point(1, 1),
                size: 
                { 
                    small: new Point(5,7),
                    regular: new Point(3,5),
                    large: new Point(2,3)
                },
            }, 
        },

        // for games that have tiny egg tokens; note how no PICKER is set so other games don't actually generate anything for this
        eggs:
        {
            mapper:
            {
                autoStroke: true,
                sizeElement: new Point(1, 1),
                size: 
                { 
                    small: new Point(20,24),
                    regular: new Point(12,17),
                    large: new Point(8,12)
                },
            },   
        }
    },

    _drawing:
    {
        fonts:
        {
            heading: "gargle",
            body: "gargle"
        },

        tiles:
        {
            text:
            {
                fontSize: new CVal(0.07, "sizeUnit"),
                pos: new CVal(new Point(0.5, 0.775), "size"),
                size: new CVal(new Point(0.875, 0.33), "size"),
                bgDims: new CVal(new Point(0.975), "sizeUnit")
            },

            
            bg:
            {
                gradientAlpha: 0.5,
                lightraysAlpha: 0.2,
                randomPatternAlpha: 0.175,
                lightraysComposite: "overlay"
            },

            illu:
            {
                size: new CVal(new Point(0.8), "sizeUnit"),
                sizeWithText: new CVal(new Point(0.635), "sizeUnit"),
                offsetWhenTextPresent: new CVal(0.166, "sizeUnit"),
                glowRadius: new CVal(0.066, "sizeUnit"),
                glowColor: "#FFFFFF",
                shadowColor: "#000000"
                
            },

            typeText:
            {
                fontSize: new CVal(0.05, "sizeUnit"),
                edgeOffsetY: new CVal(0.05, "sizeUnit"),
                alpha: 1.0,
                composite: "overlay"
            }
        },
    }
}