import CONFIG_NAIVIGATION_SHARED from "games/naivigation/js_shared/configShared"
import mergeObjects from "js/pq_games/tools/collections/mergeObjects";
import CVal from "js/pq_games/tools/generation/cval";
import Bounds from "js/pq_games/tools/numbers/bounds";

const CONFIG:any = 
{
    debug:
    {
        omitFile: true, // @DEBUGGING (should be false)
        singleDrawPerType: true, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    configKey: "naivigationSwervingSpaceshipsConfig",
    fileName: "[Material] Naivigation: Swerving Spaceships",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",

    includeVehicleCards: true,
    includeMapTiles: true,
    includeVehicleTiles: true,

    expansions:
    {
        shields: false,
        weapons: false,
        trade: false,
    },

    fonts:
    {
        special: "whatever"
    },

    // assets
    assetsBase: "/naivigation/visit/swerving-spaceships/assets/",
    assets:
    {
        /*
        misc:
        {
            path: "misc.webp",
            frames: new Point(4,1)
        },
        */
    },

    cards:
    {
        generation:
        {
            numSteerCards: 20
        }
    },

    tiles:
    {
        map: 
        {
            maxPosRand: new CVal(0.1, "sizeUnit"),
            iconDims: new CVal(0.8, "sizeUnit"),

            stars:
            {
                numBounds: new Bounds(0,4),
                baseDims: new CVal(0.1, "sizeUnit"),
                dimsRand: new Bounds(0.85, 1.15),
                alphaBounds: new Bounds(0.3, 0.9),
            }
        }
    }
}

mergeObjects(CONFIG, CONFIG_NAIVIGATION_SHARED);

export default CONFIG