import CONFIG_NAIVIGATION_SHARED from "games/naivigation/js_shared/configShared";
import { NetworkType, PASSENGERS, TerrainType } from "games/naivigation/js_shared/dictShared";
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

    configKey: "naivigationCrashingCarsConfig",
    fileName: "[Material] Naivigation: Crashing Cars",

    addTextOnTiles: false,
    sets:
    {
        vehicleTiles: true,
        vehicleCards: true,
        mapTiles: true,
        trafficPolice: false,
        fuelFear: false,
        taxisCargo: false,
        terrainTripplanning: false,
    },

    fonts:
    {
        special: "whatever"
    },

    // assets
    assetsBase: "/naivigation/visit/crashing-cars/assets/",
    assets:
    {
        misc:
        {
            path: "misc.webp",
            frames: new Point(3,1)
        },

        vehicle_cards:
        {
            path: "vehicle_cards.webp",
            frames: new Point(5,2)
        },

        map_tiles:
        {
            path: "map_tiles.webp",
            frames: new Point(8,3)
        },

        icons:
        {
            path: "icons.webp",
            frames: new Point(5,1)
        },

        networks:
        {
            path: "networks.webp",
            frames: new Point(5,4)
        },

        terrains:
        {
            loadIf: ["sets.mapTiles", "sets.trafficPolice", "sets.fuelFear", "sets.terrainTripplanning"]
        }
    },

    generation:
    {
        terrainDist:
        {
            [TerrainType.GRASS]: { perc: 0.3 },
            [TerrainType.FOREST]: { perc: 0.3 },
            [TerrainType.CITY]: { perc: 0.3 },
            [TerrainType.MOUNTAIN]: { perc: 0.1 },
        },

        networks:
        {
            typeDistribution:
            {
                [NetworkType.DEADEND]: { perc: 0.05 },
                [NetworkType.CORNER]: { perc: 0.2 },
                [NetworkType.STRAIGHT]: { perc: 0.2 },
                [NetworkType.THREEWAY]: { perc: 0.1 },
                [NetworkType.ALL]: { perc: 0.45 }
            },

            keyDistribution:
            {
                regular: { perc: 0.7 },
                dirt_road: { perc: 0.1 },
                asphalt: { perc: 0.1 },
                cobblestones: { perc: 0.1 }
            }
        },
    },

    cards:
    {
        numFuelCards: 10,
        
        passengers:
        {
            numCards: 12,
            options: Object.keys(PASSENGERS),
            fontSize: new CVal(0.07, "sizeUnit"),
            textBoxDims: new CVal(new Point(0.925, 0.33), "size"),
            bonusPos: new CVal(new Point(0.5, 0.6), "size"),
            cursePos: new CVal(new Point(0.5, 0.8), "size"),
            iconOffset: new CVal(new Point(0.1, 0.5), "size"),
            shopIconSize: new CVal(new Point(0.1), "sizeUnit")
        }
    },

    tiles:
    {
        custom:
        {
            fontSize: new CVal(0.3, "sizeUnit"),
            strokeWidth: new CVal(0.08, "tiles.custom.fontSize"),
            gearBounds: new Bounds(-2,4),
        },

        parkingLot:
        {
            vehicleIcon:
            {
                dims: new CVal(new Point(0.5), "sizeUnit"),
                dimsSmall: new CVal(new Point(0.185), "sizeUnit"),
                alpha: 1.0,
                composite: "luminosity",
                shadowBlur: new CVal(0.05 * 0.5, "sizeUnit"),
            }
        },

        shop:
        {
            fontSize: new CVal(0.175, "sizeUnit"),
            strokeWidth: new CVal(0.08, "tiles.shop.fontSize"),
        }
    }
}

mergeObjects(CONFIG, CONFIG_NAIVIGATION_SHARED, false);
autoLoadFontCSS(CONFIG);

export default CONFIG