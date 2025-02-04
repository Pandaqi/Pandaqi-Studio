import CONFIG_NAIVIGATION_SHARED from "games/naivigation/js_shared/configShared"
import mergeObjects from "js/pq_games/tools/collections/mergeObjects";
import CVal from "js/pq_games/tools/generation/cval";
import Point from "js/pq_games/tools/geometry/point";
import Bounds from "js/pq_games/tools/numbers/bounds";
import autoLoadFontCSS from "js/pq_games/website/autoLoadFontCSS";

const CONFIG:any = 
{
    debug:
    {
        filterAssets: [], // @DEBUGGING (should be empty)
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    configKey: "naivigationSwervingSpaceshipsConfig",
    fileName: "[Material] Naivigation: Swerving Spaceships",

    addTextOnTiles: false,
    sets:
    {
        vehicleTiles: true,
        vehicleCards: true,
        specialCards: true,
        mapTiles: true,
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
            frames: new Point(6,1)
        },

        map_tiles:
        {
            path: "map_tiles.webp",
            frames: new Point(8,2)
        },

        vehicle_cards:
        {
            path: "vehicle_cards.webp",
            frames: new Point(7,1)
        },
    },

    cards:
    {
        generation:
        {
            numSteerCards: 14
        },

        steer:
        {
            circleRadius: 0.45, // ~tiles.general.illustration.mainDims
            strokeWidthCircle: 0.085, // ~mainDims
            strokeColorCircle: "#FFFFFF",
            strokeWidthSpoke: 0.04, // ~mainDims
            strokeColorSpoke: "#CCCCCC",
            rangeColor: "#AAFFAA",
            rangeAlpha: 0.75,
            vehicleDims: 0.45, // ~mainDims
        },

        planetProperties:
        {
            stroke: "#000000",
            strokeWidth: new CVal(0.015, "sizeUnit"), // @NOTE: remember that true height is smaller than sizeUnit because multiple properties are placed on one card
            fontSize: new CVal(0.075, "sizeUnit"),
            iconDims: new CVal(0.4, "sizeUnit")
        }
    },

    tiles:
    {
        map: 
        {
            maxPosRand: new CVal(0.1, "sizeUnit"),
            iconDims: new CVal(new Point(0.8), "sizeUnit"),
            glowRadius: new CVal(0.033, "sizeUnit"),

            // this is for their icon on the PLANETS
            vehicleIcon:
            {
                dims: new CVal(new Point(0.5), "sizeUnit"),
                dimsSmall: new CVal(new Point(0.185), "sizeUnit"),
                alpha: 1.0,
                composite: "luminosity",
                shadowBlur: new CVal(0.05 * 0.5, "sizeUnit"),
            },

            stars:
            {
                numBounds: new Bounds(1,10),
                baseDims: new CVal(new Point(0.066), "sizeUnit"),
                sizeRand: new Bounds(0.65, 1.45),
                alphaBounds: new Bounds(0.15, 0.4),
            },

            resources:
            {
                position: new CVal(new Point(0.75, 0.25), "sizeUnit"),
                size: new CVal(new Point(0.2), "sizeUnit"),
            }
        }
    }
}

mergeObjects(CONFIG, CONFIG_NAIVIGATION_SHARED, false);
autoLoadFontCSS(CONFIG);

export default CONFIG