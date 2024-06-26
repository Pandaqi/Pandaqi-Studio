import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig"
import CVal from "js/pq_games/tools/generation/cval"
import Point from "js/pq_games/tools/geometry/point"
import Bounds from "js/pq_games/tools/numbers/bounds"

const CONFIG:any = 
{
    debug:
    {
        omitFile: true, // @DEBUGGING (should be false)
        singleDrawPerType: true, // @DEBUGGING (should be false)
        onlyGenerate: true, // @DEBUGGING (should be false)
    },

    configKey: "librariansConfig",
    fileName: "[Material] Librarians",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",
    addHelpNumbers: true,
    addActionExplanation: true,

    fonts:
    {
        heading: "grenze",
        body: "grenze",
        special: "fleur"
    },

    packs:
    {
        shelves: true,
        red: "horror",
        green: "romance",
        blue: "thriller",
        purple: "fantasy",
        yellow: "biography",
        black: "mystery",
        actions: false,
    },

    // assets
    assetsBase: "/librarians/assets/",
    assets:
    {
        grenze:
        {
            path: "fonts/Grenze-Regular.woff2",
        },

        grenze_bold:
        {
            key: "grenze",
            path: "fonts/Grenze-Black.woff2",
            textConfig: new TextConfig({ weight: TextWeight.BOLD })
        },

        grenze_italic:
        {
            key: "grenze",
            path: "fonts/Grenze-Italic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC })
        },

        fleur:
        {
            path: "fonts/FleurCornerCaps.woff2",
        },

        genres:
        {
            path: "genres.webp",
            frames: new Point(8,3)
        },

        actions:
        {
            path: "genres.webp",
            frames: new Point(8,3)
        },

        covers:
        {
            path: "covers.webp",
            frames: new Point(8,4)
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(8,1)
        },
    },

    rulebook:
    {

    },

    cards:
    {
        drawerConfig:
        {
            dimsElement: new Point(1, 1.4),
            dims: { 
                small: new Point(4,4),
                regular: new Point(3,3),
                large: new Point(2,2)
            },  
        },

        generation:
        {
            numCardsPerColor: 11,
            numBookShelfCards: 12,
            minFrequencyForSeries: 3,
            defAuthorActionCards: "Anonymous",
        },

        shared:
        {
            rectBlur: new CVal(0.05, "sizeUnit")
        },

        dropCap:
        {
            fontSize: new CVal(0.2, "sizeUnit"),
            offsetY: 0.2,
        },

        title:
        {
            fontSize: new CVal(0.075, "sizeUnit"),
            offsetY: 0.35,
            dims: new CVal(new Point(0.75, 0.25), "size"),
            helpNumbersAlpha: 0.75,
            helpNumbersColor: "#000000"
        },

        background:
        {
            dims: new CVal(new Point(0.875), "size"),
            dimsOverlayRelative: new Point(0.9, 0.9), // "usable" size of book relative to calculated dims
            spineWidthRelative: 0.2, // width of the book spine relative to calculated dims.x

            cover:
            {
                frameBounds: new Bounds(3,31), // the range of frames in the "covers" image that contain random covers
                alpha: 0.15,
            },
            overlay:
            {
                frame: 2,
                composite: "multiply",
                alpha: 1.0
            }
        },

        genre:
        {
            compositeRect: "overlay",
            dimsIcon: new CVal(new Point(0.05), "sizeUnit"),
            dimsRect: new CVal(new Point(0.1), "sizeUnit"),
            textColor: "#000000",
            textComposite: "overlay",
            fontSize: new CVal(new Point(0.125), "sizeUnit"),
            textOffsetY: new CVal(new Point(0.1), "sizeUnit")
        },

        bookShelf:
        {
            arrow:
            {
                pos: new CVal(new Point(0.5, 0.33), "size"),
                dims: new CVal(new Point(0.4), "sizeUnit"),
                dimsVertical: new CVal(new Point(0.15), "sizeUnit"),
                dimsRect: new CVal(new Point(0.75, 0.4), "size"),
            },

            text:
            {
                pos: new CVal(new Point(0.5, 0.66), "size"),
                dims: new CVal(new Point(0.75, 0.4), "size"),
                color: "#000000",
                fontSize: new CVal(0.075, "sizeUnit")
            }
        },

        metadata:
        {
            textColor: "#FFFFFF",
            alpha: 0.75,
            fontSize: new CVal(0.066, "sizeUnit"),
            edgeMargin: new CVal(0.075, "sizeUnit")
        },

        action:
        {
            offsetY: 0.6,
            dimsY: 0.35,
            fontSize: new CVal(0.066, "sizeUnit"),
            dimsIcon: new CVal(new Point(0.1), "sizeUnit"),
        }

    },
}

export default CONFIG