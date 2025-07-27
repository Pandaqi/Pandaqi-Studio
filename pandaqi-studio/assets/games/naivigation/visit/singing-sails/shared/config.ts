import CONFIG_NAIVIGATION_SHARED from "games/naivigation/shared/configShared";
import { TerrainType } from "games/naivigation/shared/dictShared";
import mergeObjects from "js/pq_games/tools/collections/mergeObjects";
import CVal from "js/pq_games/tools/generation/cval";
import Point from "js/pq_games/tools/geometry/point";
import Bounds from "js/pq_games/tools/numbers/bounds";
;

const CONFIG:any = 
{
    debug:
    {
        filterAssets: [], // @DEBUGGING (should be empty)
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    configKey: "naivigationSingingSailsConfig",
    fileName: "[Material] Naivigation: Singing Sails",

    addTextOnTiles: false,
    sets:
    {
        vehicleTiles: true,
        vehicleCards: true,
        specialCards: true,
        mapTiles: true,
        supertilesSlipstreams: false,
        windstormsWeather: false,
        islandsTreasures: false,
        piratesCannons: false
    },

    fonts:
    {
        special: "whatever"
    },

    // assets
    assetsBase: "/naivigation/visit/singing-sails/assets/",
    assets:
    {
        misc:
        {
            path: "misc.webp",
            frames: new Point(5,2)
        },

        vehicle_cards:
        {
            path: "vehicle_cards.webp",
            frames: new Point(5,2)
        },

        map_tiles:
        {
            path: "map_tiles.webp",
            frames: new Point(8,2)
        },

        weather_cards:
        {
            path: "weather_cards.webp",
            frames: new Point(7,1)
        },

        terrains:
        {
            loadIf: ["sets.mapTiles", "sets.supertilesSlipstreams", "sets.islandsTreasures", "sets.piratesCannons"]
        }
    },

    generation:
    {
        percentageEnemyIcon: 0.125,
        percentageWaterCurrent: 0.35,
        numCardsPerWeatherType: 2,
        
        terrainDist:
        {
            [TerrainType.NONE]: { perc: 0, filterCollectibles: "include" },
            [TerrainType.SEA]: { perc: 0.55, filterCollectibles: "exclude" },
            [TerrainType.GRASS]: { perc: 0.45, filterCollectibles: "exclude", filterInclude: ["empty"] }, // this basically forces all special types to be on water tiles
        }
    },

    cards:
    {
        weather:
        {
            fontSize: new CVal(0.25, "sizeUnit")
        }
    },

    tiles:
    {
        enemyIcon:
        {
            pos: new CVal(new Point(0.1), "sizeUnit"),
            size: new CVal(new Point(0.175), "sizeUnit")
        },

        waterCurrent:
        {
            size: new CVal(new Point(1.0), "size"),
            textPos: new CVal(new Point(0.5), "size"),
            fontColor: "#000000",
            fontSize: new CVal(0.4, "sizeUnit")
        },

        treasure:
        {
            fontSize: new CVal(0.053, "sizeUnit"),
            textBoxDims: new CVal(new Point(0.7, 0.33), "size"),
            conditionPos: new CVal(new Point(0.5, 0.41), "size"),
            bonusPos: new CVal(new Point(0.5, 0.72), "size"),
            iconOffset: new CVal(new Point(0.125, 0.135), "size"),
            harborIconSize: new CVal(new Point(0.1), "sizeUnit")
        },

        custom:
        {
            // @TODO: make this shared too??
            fontSize: new CVal(0.3, "sizeUnit"),
            strokeWidth: new CVal(0.08, "tiles.custom.fontSize"),

            windBounds: new Bounds(0,4),
            numTreasures: 10,
        }
    }
}

mergeObjects(CONFIG, CONFIG_NAIVIGATION_SHARED, false);

export default CONFIG