import Point from "js/pq_games/tools/geometry/point"

const CONFIG:any = 
{
    debug:
    {
        omitFile: true, // @DEBUGGING (should be false)
        singleDrawPerType: true, // @DEBUGGING (should be false)
        onlyGenerate: true, // @DEBUGGING (should be false)
    },

    configKey: "chaosContractConfig",
    fileName: "[Material] Chaos Contract",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",

    fonts:
    {
        heading: "celexa",
        body: "quixotte"
    },

    sets:
    {
        base: true,
        lostSouls: false,
        devilishNumbers: false,
    },

    // assets
    assetsBase: "/the-luck-legends/roll/chaos-contract/assets/",
    assets:
    {
        quixotte:
        {
            path: "fonts/Quixotte.woff2",
        },

        celexa:
        {
            path: "fonts/Celexa.woff2",
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