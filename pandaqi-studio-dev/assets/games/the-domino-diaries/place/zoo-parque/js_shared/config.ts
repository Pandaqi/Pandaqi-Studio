import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig"
import CVal from "js/pq_games/tools/generation/cval"
import Point from "js/pq_games/tools/geometry/point"

const CONFIG:any = 
{
    debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
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
        passports: true,
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
            key: "noticia",
            path: "fonts/NoticiaText-Bold.woff2",
            textConfig: new TextConfig({ weight: TextWeight.BOLD })
        },

        noticia_italic:
        {
            key: "noticia",
            path: "fonts/NoticiaText-Italic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC })
        },

        noticia_bold_italic:
        {
            key: "noticia",
            path: "fonts/NoticiaText-BoldItalic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC, weight: TextWeight.BOLD })
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

        animals:
        {
            path: "animals.webp",
            frames: new Point(4,4),
            disableCaching: true
        },

        terrains:
        {
            path: "terrains.webp",
            frames: new Point(6,1),
            disableCaching: true
        },

        objects:
        {
            path: "objects.webp",
            frames: new Point(4,2),
            disableCaching: true
        },

        stalls:
        {
            path: "stalls.webp",
            frames: new Point(4,2),
            disableCaching: true
        },

        animal_passport:
        {
            path: "animal_passport.webp",
            disableCaching: true,
            loadIf: ["sets.passports"]
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(6,1),
            disableCaching: true
        },
    },

    rulebook:
    {

    },

    generation:
    {
        numUniquePawns: 6,
        numPawnsPerPlayer: 4,
        numDominoes:
        {
            base: 56,
            strong: 36,
            wildlife: 36,
            utilities: 36
        },

        percAllWithoutTerrain: 0.225,
        percHalfWithoutTerrain: 0.225,
        percAllWithTerrain: 0.55,

        fenceNumDistribution:
        {
            0: 0.1,
            1: 0.35,
            2: 0.325,
            3: 0.175,
            4: 0.0
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
                small: new Point(7,5),
                regular: new Point(5,3),
                large: new Point(4,2)
            },  
            autoStroke: true
        },

        bg:
        {
            color: "#FFEFCF",
            dimsTerrain: new CVal(new Point(0.9), "sizeUnit"),
            terrainShadowSize: new CVal(0.01, "sizeUnit"),
        },

        main:
        {
            dims: new CVal(new Point(0.66), "sizeUnit"),
            shadowSize: new CVal(0.02, "sizeUnit"),
        },

        fences:
        {
            dims: new CVal(new Point(0.75), "sizeUnit")
        },

        entrance:
        {
            dims: new CVal(new Point(0.8), "sizeUnit")
        },

        text:
        {
            fontSize: new CVal(0.05825, "sizeUnit")
        },

        setText:
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
                small: new Point(2,5),
                regular: new Point(1,4),
                large: new Point(1,2)
            },  
            autoStroke: true
        },

        animal:
        {
            pos: new CVal(new Point(0.22, 0.5), "size"),
            dims: new CVal(new Point(0.435), "sizeUnit")
        },

        extinct:
        {
            pos: new CVal(new Point(0.275, 0.325), "size"),
            dims: new CVal(new Point(0.2), "sizeUnit")
        },

        funFact:
        {
            pos: new CVal(new Point(0.225, 0.815), "size"),
            dims: new CVal(new Point(0.225, 0.45), "size"),
            fontSize: new CVal(0.033, "sizeUnit")
        },

        terrains:
        {
            posAnchor: new CVal(new Point(0.615, 0.38), "size"),
            dims: new CVal(new Point(0.1225), "sizeUnit"),
            shadowBlur: new CVal(0.005, "sizeUnit")
        },

        food:
        {
            pos: new CVal(new Point(0.815, 0.2875), "size"),
            dims: new CVal(new Point(0.4, 0.2), "sizeUnit"),
            fontSize: new CVal(0.0475, "sizeUnit")
        },

        power:
        {
            pos: new CVal(new Point(0.51, 0.735), "size"),
            dims: new CVal(new Point(0.285, 0.3), "size"),
            fontSize: new CVal(0.033, "sizeUnit")
        },

        // these are all the specific positions of the checkmarks, hardcoded for speed and simplicity
        checkmarks:
        {
            dims: new CVal(new Point(0.075), "sizeUnit"),
            strong: new CVal(new Point(0.4415, 0.2875 - 0.025), "size"),
            herbivore: new CVal(new Point(0.4415, 0.51), "size"),
            carnivore: new CVal(new Point(0.65, 0.51), "size"),
            social: new CVal(new Point(0.4415, 0.615), "size"),
            solitary: new CVal(new Point(0.65, 0.615), "size"),
        }
    },
}

export default CONFIG