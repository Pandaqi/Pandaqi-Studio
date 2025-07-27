import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig"
import CVal from "js/pq_games/tools/generation/cval"
import { GridSizePreset } from "js/pq_games/tools/generation/materialGenerator"
import Point from "js/pq_games/tools/geometry/point"


const CONFIG:any = 
{
    debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
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
        },

        // contains the backgrounds for ROLE + MISSION + EVENT tiles
        templates:
        {
            path: "templates.webp",
            frames: new Point(7,1),
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(4,1),
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
            proximity: 10,
            direction: 10,
            machine: 10,
            goblin: 10
        },

        percMissionRewards: 0.33,
        percMissionPenalties: 0.33,
        percMissionShush: 0.33,

        targetMissionValue: 2.5,
        targetMissionMaxError: 1,

        numMissionReqsDist:
        {
            1: 0.25,
            2: 0.5,
            3: 0.25
        },

        pathPercentageDirected: 1.0,
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
            preset: GridSizePreset.DOMINO
        },

        missionTemplateFrame: 5, // 0-4 are for the 5 player roles
        eventTemplateFrame: 6,

        main:
        {
            size: new CVal(new Point(0.65), "sizeUnit"),
            sizeCapital: new CVal(new Point(0.975), "sizeUnit")
        },

        mission:
        {
            fontSize: new CVal(0.062, "sizeUnit"),
            posFlavorText: new CVal(new Point(0.075, 0.175), "size"),
            sizeFlavorText: new CVal(new Point(0.835, 0.5), "size"),

            requirements:
            {
                pos: new CVal(new Point(0.5, 0.48), "size"),
                size: new CVal(new Point(0.195), "sizeUnit"), // this is PER icon/requirement

                posIcon: new CVal(new Point(-0.38, 0), "size"), // this is RELATIVE to (0,0) in center of requirement row
                posText: new CVal(new Point(0.45, 0), "size"),
                fontSize: new CVal(0.07, "sizeUnit")
            },

            consequence:
            {
                posHeader: new CVal(new Point(0.5, 0.8), "size"),
                posText: new CVal(new Point(0.5, 0.885), "size"),
                sizeText: new CVal(new Point(0.835, 0.185), "size"),
                sizeHeader: new CVal(new Point(0.35), "sizeUnit"),
            },

            shushIcon:
            {
                pos: new CVal(new Point(0.9, 0.14), "size"),
                size: new CVal(new Point(0.175), "sizeUnit")
            }
        },

        events:
        {
            fontSizeHeader: new CVal(0.135, "sizeUnit"),
            posHeader: new CVal(new Point(0.5, 0.33), "size"),
            fontSizeBody: new CVal(0.075, "sizeUnit"),
            posBody: new CVal(new Point(0.5, 0.6), "size")
        },

        setText:
        {
            size: new CVal(0.075, "sizeUnit"),
            color: "#121212",
            alpha: 0.75
        },

        powerText:
        {
            fontSize: new CVal(0.0645, "sizeUnit"),
            color: "#FEFEFE",
            rectColor: "#121212",
            rectAlpha: 0.7   
        }

    },
}


export default CONFIG