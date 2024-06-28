import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig"
import CVal from "js/pq_games/tools/generation/cval"
import Point from "js/pq_games/tools/geometry/point"

const CONFIG:any = 
{
    debug:
    {
        omitFile: true, // @DEBUGGING (should be false)
        singleDrawPerType: true, // @DEBUGGING (should be false)
        onlyGenerate: true, // @DEBUGGING (should be false)
    },

    configKey: "zooParqueConfig",
    fileName: "[Material] Zoo Parque",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",
    addText: true,

    fonts:
    {
        heading: "ceviche",
        body: "noticia",
    },

    sets:
    {
        pawns: true,
        base: true,
        detail: true,
        strong: false,
        wildlife: false,
        utilities: false,
    },

    // assets
    assetsBase: "/the-domino-diaries/place/zoo-parque/assets/",
    assets:
    {
        noticia:
        {
            path: "fonts/NoticiaText-Regular.woff2",
        },

        noticia_bold:
        {
            key: "besley",
            path: "fonts/NoticiaText-Bold.woff2",
            textConfig: new TextConfig({ weight: TextWeight.BOLD })
        },

        noticia_italic:
        {
            key: "besley",
            path: "fonts/NoticiaText-Italic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC })
        },

        ceviche:
        {
            path: "fonts/CevicheOne-Regular.woff2",
        },

        pawns:
        {
            path: "pawns.webp",
            frames: new Point(6,1),
            loadIf: ["sets.pawns"],
            disableCaching: true
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(4,1),
            disableCaching: true
        },
    },

    rulebook:
    {

    },

    generation:
    {
        numUniquePawns: 5,
        numPawnsPerPlayer: 4,
        numDominoes:
        {
            base: 50,
        },

        percAllWithoutTerrain: 0.3,
        percHalfWithoutTerrain: 0.2,
        percAllWithTerrain: 0.5,

        fenceNumDistribution:
        {
            0: 0.15,
            1: 0.3,
            2: 0.3,
            3: 0.2,
            4: 0.05
        },

        fenceTypeDistribution:
        {
            fence_weak: 0.6,
            fence_strong: 0.4
        }
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

        main:
        {
            dims: new CVal(new Point(0.75), "sizeUnit")
        },

        text:
        {
            fontSize: new CVal(0.065, "sizeUnit")
        }
    },

    tiles:
    {
        drawerConfig:
        {
            dimsElement: new Point(2, 1),
            dims: { 
                small: new Point(3,5),
                regular: new Point(2,3),
                large: new Point(1,2)
            },  
            autoStroke: true
        },
    },
}

export default CONFIG