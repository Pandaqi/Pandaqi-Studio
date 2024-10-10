import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig"
import CVal from "js/pq_games/tools/generation/cval"
import { GridSizePreset } from "js/pq_games/tools/generation/materialGenerator"
import Point from "js/pq_games/tools/geometry/point"
import Bounds from "js/pq_games/tools/numbers/bounds"
import autoLoadFontCSS from "js/pq_games/website/autoLoadFontCSS"

const CONFIG:any = 
{
    debug:
    {
        omitFile: true, // @DEBUGGING (should be false)
        singleDrawPerType: true, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    configKey: "librariansConfig",
    fileName: "[Material] Librarians",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",

    addHelpNumbers: true,
    addActionExplanation: true,
    addGenreIcons: true,
    addActionIcon: true,

    generateGenreCards: true,

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
            path: "actions.webp",
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
            preset: GridSizePreset.CARD
        },

        generation:
        {
            numCardsPerColor: 11,
            numBookShelfCards: 12,
            minFrequencyForSeries: 3,
            defAuthorActionCards: "Anonymous",
            defFrequencyActionCards: 1,
        },

        shared:
        {
            rectBlur: new CVal(0.03, "sizeUnit")
        },

        dropCap:
        {
            fontSize: new CVal(0.425, "sizeUnit"),
            offsetY: 0.21,
        },

        title:
        {
            fontSize: new CVal(0.1, "sizeUnit"), // @NOTE: also helpNumbers fontSize!
            offsetY: 0.485,
            size: new CVal(new Point(0.7, 0.2), "size"),
            helpNumbersAlpha: 0.45,
            helpNumbersColor: "#000000"
        },

        background:
        {
            size: new CVal(new Point(0.95), "size"),
            sizeOverlayRelative: new Point(0.88, 0.85), // "usable" size of book relative to calculated size
            spineWidthRelative: 0.18, // width of the book spine relative to calculated size.x

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
            cornerOffset: new CVal(new Point(0.05), "sizeUnit"),
            sizeIcon: new CVal(new Point(0.1), "sizeUnit"),
            sizeRect: new CVal(new Point(0.33), "sizeUnit"),
            textColor: "#000000",
            textComposite: "overlay",
            fontSize: new CVal(0.075, "sizeUnit"),
            textOffsetY: new CVal(new Point(0.05), "sizeUnit")
        },

        bookShelf:
        {
            arrow:
            {
                pos: new CVal(new Point(0.5, 0.33), "size"),
                size: new CVal(new Point(0.4), "sizeUnit"),
                sizeVertical: new CVal(new Point(0.175), "sizeUnit"),
                sizeRect: new CVal(new Point(0.65, 0.3), "size"),
            },

            text:
            {
                pos: new CVal(new Point(0.5, 0.66), "size"),
                size: new CVal(new Point(0.75, 0.35), "size"),
                color: "#000000",
                fontSize: new CVal(0.075, "sizeUnit")
            }
        },

        metadata:
        {
            textColor: "#FFFFFF",
            strokeColor: "#00000066",
            textAlpha: 1.0,
            fontSize: new CVal(0.066, "sizeUnit"),
            edgeMargin: new CVal(0.1, "sizeUnit"),
            sizeIcon: new CVal(new Point(0.09), "sizeUnit"),
            compositeIcon: "luminosity",
        },

        action:
        {
            offsetY: 0.75,
            sizeY: 0.3,
            fontSize: new CVal(0.066, "sizeUnit"),
            sizeIcon: new CVal(new Point(0.15), "sizeUnit"),
        }

    },
}

autoLoadFontCSS(CONFIG);

export default CONFIG