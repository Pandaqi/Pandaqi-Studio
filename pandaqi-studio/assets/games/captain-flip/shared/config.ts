import TextConfig, { TextWeight } from "js/pq_games/layout/text/textConfig"
import CVal from "js/pq_games/tools/generation/cval"
import Point from "js/pq_games/tools/geometry/point"
import { ActionType } from "./dict"
import { tilePicker } from "../game/tilePicker"

export const CONFIG:any = 
{
    _debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    _game:
    {
        fileName: "Captain Flip",
    },

    // assets
    assetsBase: "/captain-flip/assets/",
    assets:
    {
        underlapped:
        {
            path: "fonts/Underlapped.woff2",
        },

        sofia:
        {
            path: "fonts/SofiaSansCondensed-Regular.woff2",
        },

        sofia_bold:
        {
            key: "sofia",
            path: "fonts/SofiaSansCondensed-Black.woff2",
            textConfig: new TextConfig({ weight: TextWeight.BOLD })
        },

        tile_types:
        {
            path: "tile_types.webp",
            frames: new Point(8,2)
        },

        patterns:
        {
            path: "patterns.webp",
            frames: new Point(8,1)
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(8,1)
        },
    },

    _material:
    {
        tiles:
        {
            picker: tilePicker,
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

        }
    },

    _drawing:
    {
        fonts:
        {
            heading: "underlapped",
            body: "sofia"
        },

        tiles:
        {
            generation:
            {
                numDeckTotal: 54,
                percentageDoubleTiles: 0.25,
                percentageSingleTiles: 0.5,
            },

            shared:
            {
                shadowRadius: new CVal(0.01, "sizeUnit"),
                shadowColor: "#000000"
            },

            type:
            {
                size: new CVal(new Point(0.35), "sizeUnit"),
                fontSize: new CVal(0.275, "sizeUnit"),
                numberOffsetFromCenter: new CVal(0.295, "sizeUnit"),
                textColor: "#000000",
                textStrokeColor: "#FFFFFF",
                textStrokeWidth: new CVal(0.0125, "sizeUnit"),
            },

            action:
            {
                iconDims: new CVal(new Point(0.25), "sizeUnit"),
                iconScaleFactor: 0.8,
                fontSize: new CVal(0.075, "sizeUnit"),
                lineHeight: 1.075,
                edgeOffsetForColor: new CVal(0.0425, "sizeUnit"),
                textColor: "#000000"
            },

            bg:
            {
                colors:
                {
                    [ActionType.HEART]: "#F7FFE4",
                    [ActionType.SKULL]: "#FBE4FF",
                    [ActionType.STAR]: "#FFF8B2"
                }
            }

        },
    },
}