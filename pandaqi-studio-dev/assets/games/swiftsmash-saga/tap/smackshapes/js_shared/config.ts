import CVal from "js/pq_games/tools/generation/cval";
import { GridSizePreset } from "js/pq_games/tools/generation/materialGenerator";
import Point from "js/pq_games/tools/geometry/point";
import Bounds from "js/pq_games/tools/numbers/bounds";
import autoLoadFontCSS from "js/pq_games/website/autoLoadFontCSS";

const CONFIG:any = 
{
    debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    configKey: "smackshapesConfig",
    fileName: "[Material] Smackshapes",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",
    pageSize: "a4",

    fonts:
    {
        heading: "mousememoirs",
        body: "manuscript",
    },

    sets:
    {
        base: true,
        colorCracks: false,
    },

    // assets
    assetsBase: "/swiftsmash-saga/tap/smackshapes/assets/",
    assets:
    {
        manuscript:
        {
            path: "fonts/MANUSCRIPTRegular.woff2",
        },

        mousememoirs:
        {
            path: "fonts/MouseMemoirs-Regular.woff2",
        },

        card_templates:
        {
            path: "card_templates.webp",
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(6,1)
        },

    },

    rulebook:
    {
        
    },

    generation:
    {
        numberBounds: new Bounds(1,9),
        numberSpecial: [5,7,9]
    },

    cards:
    {
        drawerConfig:
        {
            preset: GridSizePreset.CARD
        },

        ranking:
        {
            rectPos: new CVal(new Point(0.5, 0.0875), "size"),
            rectSize: new CVal(new Point(0.775, 0.08), "size"),
            iconSize: new CVal(new Point(0.1), "sizeUnit"),
            bgColorNormal: "#ffd98f",
            bgColorAction: "#c6d0ff"
        },

        shapes:
        {
            iconSize: new CVal(new Point(0.175), "sizeUnit"),
            topLeft: new CVal(new Point(0.2, 0.225), "size"),
            boxSize: new CVal(new Point(0.6, 0.675), "size")
        },

        action:
        {
            positionCutoffIndex: 11,
            icon:
            {
                pos: new CVal(new Point(0.165, 0.812), "size"),
                size: new CVal(new Point(0.33), "sizeUnit")
            },

            text:
            {
                fontSize: new CVal(0.08, "sizeUnit"),
                pos: new CVal(new Point(0.575, 0.812), "size"),
                boxSize: new CVal(new Point(0.65, 0.33), "size")
            }
        }
    },
}

autoLoadFontCSS(CONFIG);

export default CONFIG