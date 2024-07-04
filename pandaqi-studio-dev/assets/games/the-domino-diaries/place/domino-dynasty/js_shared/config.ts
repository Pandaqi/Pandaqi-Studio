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

    configKey: "dominoDynastyConfig",
    fileName: "[Material] Domino Dynasty",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",
    addText: true,

    fonts:
    {
        heading: "dumbledor",
        body: "caslon",
    },

    sets:
    {
        roles: true,
        base: true,
        proximity: false,
        direction: false,
        machine: false,
        goblin: false
    },

    // assets
    assetsBase: "/the-domino-diaries/place/domino-dynasty/assets/",
    assets:
    {
        caslon:
        {
            path: "fonts/LibreCaslonText-Regular.woff2",
        },

        caslon_bold:
        {
            key: "besley",
            path: "fonts/LibreCaslonText-Bold.woff2",
            textConfig: new TextConfig({ weight: TextWeight.BOLD })
        },

        caslon_italic:
        {
            key: "besley",
            path: "fonts/LibreCaslonText-Italic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC })
        },

        dumbledor:
        {
            path: "fonts/Dumbledor1.woff2",
        },

        // contains both background terrains and all path variations (normal + directed)
        terrains:
        {
            path: "terrains.webp",
            frames: new Point(5,3)
        },

        icons:
        {
            path: "icons.webp",
            frames: new Point(6,4),
            disableCaching: true
        },

        // contains the backgrounds for ROLE + MISSION cards
        templates:
        {
            path: "templates.webp",
            frames: new Point(6,1),
            disableCaching: true
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(4,4),
            disableCaching: true
        },
    },

    rulebook:
    {

    },

    generation:
    {
        numStartingDominoesPerPlayer: 2,
        numDominoes:
        {
            base: 44,
            proximity: 22,
            direction: 16,
            machine: 22,
            goblin: 16,
        },

        numMissions:
        {
            base: 26,
            proximity: 14,
            direction: 10,
            machine: 14,
            goblin: 14
        },

        percMissionRewards: 0.33,
        percMissionPenalties: 0.33,
        percMissionShush: 0.33,

        targetMissionValue: 3,
        targetMissionMaxError: 1,

        numMissionReqsDist:
        {
            1: 0.25,
            2: 0.5,
            3: 0.25
        },

        pathPercentageDirected: 0.33,
        pathDist:
        {
            deadend: 0.15,
            straight: 0.25,
            corner: 0.25,
            tsplit: 0.2,
            all: 0.15
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

        missionTemplateFrame: 5, // 0-4 are for the 5 player roles
        eventTemplateFrame: 6,
    },
}

export default CONFIG