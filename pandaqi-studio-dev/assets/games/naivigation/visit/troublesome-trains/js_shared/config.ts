import CONFIG_NAIVIGATION_SHARED from "games/naivigation/js_shared/configShared";
import { NetworkType, TerrainType, TileType } from "games/naivigation/js_shared/dictShared";
import mergeObjects from "js/pq_games/tools/collections/mergeObjects";
import CVal from "js/pq_games/tools/generation/cval";
import Point from "js/pq_games/tools/geometry/point";
import autoLoadFontCSS from "js/pq_games/website/autoLoadFontCSS";
import { MATERIAL } from "./dict";

const CONFIG:any = 
{
    debug:
    {
        filterAssets: [], // @DEBUGGING (should be empty)
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    configKey: "naivigationTroublesomeTrainsConfig",
    fileName: "[Material] Naivigation: Troublesome Trains",

    addTextOnTiles: false,
    sets:
    {
        vehicleTiles: true,
        vehicleCards: true,
        mapTiles: true,
        leadersFollowers: false,
        animalsCrossings: false,
        railsFails: false,
        traintwistRailsteal: false,
    },

    fonts:
    {
        special: "whatever"
    },

    // assets
    assetsBase: "/naivigation/visit/troublesome-trains/assets/",
    assets:
    {
        misc:
        {
            path: "misc.webp",
            frames: new Point(4,1)
        },

        vehicle_cards:
        {
            path: "vehicle_cards.webp",
            frames: new Point(8,1)
        },

        map_tiles:
        {
            path: "map_tiles.webp",
            frames: new Point(8,2)
        },

        icons:
        {
            path: "icons.webp",
            frames: new Point(8,1)
        },

        terrains:
        {
            loadIf: ["sets.mapTiles", "@TODO"]
        }
    },

    generation:
    {
        terrainDist:
        {
            [TerrainType.GRASS]: { perc: 0.4 },
            [TerrainType.FOREST]: { perc: 0.4 },
            [TerrainType.CITY]: { perc: 0.2 },
        },

        networks:
        {
            typeDistribution:
            {
                [NetworkType.CORNER]: { perc: 0.1 },
                [NetworkType.STRAIGHT]: { perc: 0.1 },
                [NetworkType.THREEWAY]: { perc: 0.3 },
                [NetworkType.ALL]: { perc: 0.5 }
            },

            keyDistribution:
            {
                regular: { perc: 0.6 },
                speedy: { perc: 0.1 },
                one_way: { perc: 0.05 },
                safety: { perc: 0.1 },
                double: { perc: 0.1 },
                colored: { perc: 0.05 }
            }
        },
    },

    cards:
    {
        trainVehicle:
        {
            distribution:
            {
                1: 0.1,
                2: 0.25,
                3: 0.35,
                4: 0.2,
                5: 0.1
            },

            options: Object.keys(MATERIAL[TileType.VEHICLE]),
            iconSize: new CVal(new Point(0.1), "sizeUnit"),
            iconPositions:
            {
                1: [new CVal(new Point(0.5), "sizeUnit")],
                2: [new CVal(new Point(0.33), "sizeUnit"), new CVal(new Point(0.66), "sizeUnit")],
                3: [new CVal(new Point(0.25), "sizeUnit"), new CVal(new Point(0.5), "sizeUnit"), new CVal(new Point(0.75), "sizeUnit")],
                4: [new CVal(new Point(0.25), "sizeUnit"), new CVal(new Point(0.25, 0.75), "sizeUnit"), new CVal(new Point(0.75, 0.25), "sizeUnit"), new CVal(new Point(0.75), "sizeUnit")],
                5: [new CVal(new Point(0.25), "sizeUnit"), new CVal(new Point(0.25, 0.75), "sizeUnit"), new CVal(new Point(0.5), "sizeUnit"), new CVal(new Point(0.75, 0.25), "sizeUnit"), new CVal(new Point(0.75), "sizeUnit")]
            }
        }
    },

    tiles:
    {
        custom:
        {
            fontSize: new CVal(0.3, "sizeUnit"),
            strokeWidth: new CVal(0.08, "tiles.custom.fontSize"),
            numSwitchTemplates: 5,
            trainIconSize: new CVal(new Point(0.5), "sizeUnit")
        }   
    },
}

mergeObjects(CONFIG, CONFIG_NAIVIGATION_SHARED, false);
autoLoadFontCSS(CONFIG);

export default CONFIG