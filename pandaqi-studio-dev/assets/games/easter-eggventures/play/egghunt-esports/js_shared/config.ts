import CONFIG_SHARED from "games/easter-eggventures/js_shared/configShared";
import mergeObjects from "js/pq_games/tools/collections/mergeObjects";
import CVal from "js/pq_games/tools/generation/cval";
import Point from "js/pq_games/tools/geometry/point";

const CONFIG:Record<string,any> =
{
    debug:
    {
        omitFile: true, // @DEBUGGING (should be false)
        singleDrawPerType: true, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    configKey: "egghuntEsportsConfig",
    fileName: "[Material] Egghunt Esports",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",

    addTextOnObstacles: true,
    sets:
    {
        base: true,
        specialEggs: false,
        eggstraObstacles: false,
    },

    // assets
    assetsBase: "/easter-eggventures/play/egghunt-esports/assets/",
    assets:
    {
        special_eggs:
        {
            path: "special_eggs.webp",
            frames: new Point(8,2)
        },

        obstacles:
        {
            path: "obstacles.webp",
            frames: new Point(10,2)
        },
    },

    generation:
    {
        maxNumPlayers: 6,
        maxNumEggs: 6,
        defaultEggNumbering: [-8, -4, -2, 1, 2, 3, 4, 5],
        defaultFrequencies:
        {
            specialEgg: 2,
            obstacle: 3
        }
    },
    
    tiles:
    {
        eggNumber:
        {
            position: new CVal(new Point(0.5, 0.64), "size"),
            fontSize: new CVal(0.4, "sizeUnit"),
            fillColor: "#212121",
            strokeColor: "#EFEFEF",
            strokeWidth: new CVal(0.01, "sizeUnit"),
            alpha: 1.0,
            composite: "source-over"
        }
    }
}

mergeObjects(CONFIG, CONFIG_SHARED);
export default CONFIG;