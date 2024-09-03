import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig"
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

    configKey: "deceptidiceConfig",
    fileName: "[Material] Deceptidice",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",

    fonts:
    {
        heading: "brasspounder",
        body: "caslon"
    },

    sets:
    {
        base: true,
        wildCards: false,
        powerCards: false
    },

    // assets
    assetsBase: "/the-luck-legends/roll/deceptidice/assets/",
    assets:
    {
        caslon:
        {
            path: "fonts/CaslonAntique-Regular.woff2",
        },

        caslon_italic:
        {
            key: "caslon",
            path: "fonts/CaslonAntique-Italic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC })
        },

        caslon_bold:
        {
            key: "caslon",
            path: "fonts/CaslonAntique-Bold.woff2",
            textConfig: new TextConfig({ weight: TextWeight.BOLD })
        },

        brasspounder:
        {
            path: "fonts/Brasspounder.woff2", // @TODO: or use SC variant?
        },

        card_templates:
        {
            path: "card_templates.webp",
            frames: new Point(4,1)
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

    generation:
    {
        baseCardsPerSuit: new Bounds(1,9),
        wildCardsNum: 7,
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
    },
}

export default CONFIG