import CONFIG_NAIVIGATION_SHARED from "games/naivigation/js_shared/configShared";
import { TerrainType } from "games/naivigation/js_shared/dictShared";
import { Bounds } from "js/pq_games/pixi/pixi.mjs";
import mergeObjects from "js/pq_games/tools/collections/mergeObjects";
import CVal from "js/pq_games/tools/generation/cval";
import Point from "js/pq_games/tools/geometry/point";
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

    configKey: "naivigationSingingSailsConfig",
    fileName: "[Material] Naivigation: Singing Sails",

    addTextOnTiles: false,
    sets:
    {
        vehicleTiles: true,
        vehicleCards: true,
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

        terrains:
        {
            loadIf: ["sets.mapTiles", "sets.supertilesSlipstreams", "sets.islandsTreasures", "sets.piratesCannons"]
        }
    },

    generation:
    {
        percentageEnemyIcon: 0.1,
        percentageWaterCurrent: 0.33,

        terrainDist:
        {
            [TerrainType.NONE]: { perc: 0, filterCollectibles: "include" },
            [TerrainType.SEA]: { perc: 0.66, filterCollectibles: "exclude" },
            [TerrainType.GRASS]: { perc: 0.33, filterCollectibles: "exclude", filterInclude: ["pirate_haven"] }, // this basically forces all special types to be on water tiles
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
            pos: new CVal(new Point(0.15), "sizeUnit"),
            size: new CVal(new Point(0.1), "sizeUnit")
        },

        waterCurrent:
        {
            posText: new CVal(new Point(0.5), "size"),
            fontColor: "#000000",
            fontSize: new CVal(0.4, "sizeUnit")
        },

        treasure:
        {
            fontSize: new CVal(0.07, "sizeUnit"),
            textBoxDims: new CVal(new Point(0.925, 0.33), "size"),
            conditionPos: new CVal(new Point(0.5, 0.6), "size"),
            bonusPos: new CVal(new Point(0.5, 0.8), "size"),
            iconOffset: new CVal(new Point(0.1, 0.1), "size"),
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
autoLoadFontCSS(CONFIG);

export default CONFIG