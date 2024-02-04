import CONFIG_NAIVIGATION_SHARED from "games/naivigation/js_shared/configShared"
import mergeObjects from "js/pq_games/tools/collections/mergeObjects";
import CVal from "js/pq_games/tools/generation/cval";
import Point from "js/pq_games/tools/geometry/point";
import Bounds from "js/pq_games/tools/numbers/bounds";

const CONFIG:any = 
{
    debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
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
        misc:
        {
            path: "misc.webp",
            frames: new Point(2,1)
        },

        map_tiles:
        {
            path: "map_tiles.webp",
            frames: new Point(8,2)
        },

        icons:
        {
            path: "icons.webp",
            frames: new Point(4,1)
        },
    },

    cards:
    {
        generation:
        {
            numSteerCards: 20
        },

        steer:
        {
            circleRadius: new CVal(0.4, "sizeUnit"),
            strokeWidthCircle: new CVal(0.075, "sizeUnit"),
            strokeColorCircle: "#FFFFFF",
            strokeWidthSpoke: new CVal(0.03, "sizeUnit"),
            strokeColorSpoke: "#CCCCCC",
            rangeColor: "#AAFFAA",
            rangeAlpha: 0.75,
            vehicleDims: new CVal(new Point(0.4), "sizeUnit")
        }
    },

    tiles:
    {
        map: 
        {
            maxPosRand: new CVal(0.1, "sizeUnit"),
            iconDims: new CVal(new Point(0.8), "sizeUnit"),
            glowRadius: new CVal(0.033, "sizeUnit"),

            vehicleIconDims: new CVal(new Point(0.5), "sizeUnit"),
            vehicleIconDimsSmall: new CVal(new Point(0.185), "sizeUnit"),
            vehicleIconAlpha: 1.0,
            vehicleComposite: "luminosity",
            vehicleShadowBlur: new CVal(0.05 * 0.5, "sizeUnit"),

            stars:
            {
                numBounds: new Bounds(1,10),
                baseDims: new CVal(new Point(0.066), "sizeUnit"),
                dimsRand: new Bounds(0.65, 1.45),
                alphaBounds: new Bounds(0.15, 0.4),
            }
        }
    }
}

mergeObjects(CONFIG, CONFIG_NAIVIGATION_SHARED);

export default CONFIG