import TextConfig, { TextWeight } from "js/pq_games/layout/text/textConfig"
import Point from "js/pq_games/tools/geometry/point"

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

    fonts:
    {
        heading: "grenze",
        body: "grenze",
        special: "fleur"
    },

    packs:
    {
        red: "todo1",
        green: "todo1",
        blue: "todo1",
        purple: "todo1",
        yellow: "todo1",
        black: "todo1",
        actions: false
    },

    // assets
    assetsBase: "/librarians/assets/",
    assets:
    {
        grenze:
        {
            path: "fonts/Grenze-Regular.woff2",
        },

        // @TODO: might pick italic variant instead for this particular game, fits better
        grenze_bold:
        {
            key: "grenze",
            path: "fonts/Grenze-Black.woff2",
            textConfig: new TextConfig({ weight: TextWeight.BOLD })
        },

        fleur:
        {
            path: "fonts/FleurCornerCaps.woff2",
        },

        types:
        {
            path: "tile_types.webp",
            frames: new Point(8,3)
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
            numCardsPerColor: 11
        },

    },
}

export default CONFIG