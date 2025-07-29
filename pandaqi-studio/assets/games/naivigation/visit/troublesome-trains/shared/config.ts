import CONFIG_NAIVIGATION_SHARED from "games/naivigation/shared/configShared";
import { NetworkType, TerrainType, TileType } from "games/naivigation/shared/dictShared";
import mergeObjects from "js/pq_games/tools/collections/mergeObjects";
import CVal from "js/pq_games/tools/generation/cval";
import Point from "js/pq_games/tools/geometry/point";
import { MATERIAL } from "./dict";

const CONFIG:any = 
{
    _settings:
    {
        addTextOnTiles:
        {
            type: SettingType.CHECK,
            remark: "Map tiles explain themselves with text on them.",
            label: "Add text on tiles"
        },

        vehiclesAsPawns:
        {
            type: SettingType.CHECK,
            default: true,
            label: "Create vehicles as pawns",
            remark: "If enabled, you can fold the vehicle to place it on the board standing up." 
        },

        sets:
        {
            type: SettingType.GROUP,

            vehicleTiles:
            {
                type: SettingType.CHECK,
                default: true,
                label: "Vehicle Pawns",
            },

            mapTiles:
            {
                type: SettingType.CHECK,
                default: true,
                label: "Map Tiles",
            },

            vehicleCards:
            {
                type: SettingType.CHECK,
                default: true,
                label: "Vehicle Cards",
            },

            specialCards:
            {
                type: SettingType.CHECK,
                default: true,
                label: "Special Cards",
                remark: "Refers to the (unique) health, time, GPS, or action cards for this game."
            },
        },
        
        expansions:
        {
            leadersFollowers:
            {
                type: SettingType.CHECK,
                label: "Leaders & Followers",
            },

            animalsCrossings:
            {
                type: SettingType.CHECK,
                label: "Animals & Crossings",
            },

            railsFails:
            {
                type: SettingType.CHECK,
                label: "Rails & Fails",
            },

            directionDelay:
            {
                type: SettingType.CHECK,
                label: "Direction & Delay",
            },
        }
    },

    debug:
    {
        filterAssets: [], // @DEBUGGING (should be empty)
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    configKey: "naivigationTroublesomeTrainsConfig",
    fileName: "Naivigation: Troublesome Trains",

    addTextOnTiles: false,
    sets:
    {
        vehicleTiles: true,
        vehicleCards: true,
        specialCards: true,
        mapTiles: true,
        leadersFollowers: false,
        animalsCrossings: false,
        railsFails: false,
        traintwistRailsteal: false,
        directionDelay: false,
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
            frames: new Point(8,1)
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
            frames: new Point(5,1),
            loadIf: ["sets.vehicleCards", "sets.specialCards"]
        },

        networks:
        {
            path: "networks.webp",
            frames: new Point(5,4),
            loadIf: ["sets.mapTiles", "sets.animalsCrossings"]
        },

        terrains:
        {
            loadIf: ["sets.mapTiles", "sets.animalsCrossings"]
        }
    },

    generation:
    {
        terrainDist:
        {
            [TerrainType.GRASS]: { perc: 0.6 },
            [TerrainType.FOREST]: { perc: 0.1 },
            [TerrainType.CITY]: { perc: 0.3 },
        },

        networks:
        {
            typeDistribution:
            {
                [NetworkType.CORNER]: { perc: 0.075, filterCollectibles: "exclude" },
                [NetworkType.STRAIGHT]: { perc: 0.075, filterCollectibles: "exclude" },
                [NetworkType.THREEWAY]: { perc: 0.15, filterCollectibles: "exclude" },
                [NetworkType.ALL]: { perc: 0.7 }
            },

            keyDistribution:
            {
                regular: { perc: 0.7 },
                speedy_one_way: { perc: 0.1, filterCollectibles: "exclude" },
                safety_double: { perc: 0.1, filterCollectibles: "exclude" },
                colored: { perc: 0.1, filterCollectibles: "exclude" }
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
            iconSize: 0.145, // ~tiles.general.illustration.mainDims
            iconPlacementBounds: 0.175, // ~mainDims
            iconPositions:
            {
                1: [new Point(0)],
                2: [new Point(-0.66), new Point(0.66)],
                3: [new Point(-1), new Point(0), new Point(1)],
                4: [new Point(-1), new Point(-1, 1), new Point(1, -1), new Point(1)],
                5: [new Point(-1), new Point(-1, 1), new Point(0), new Point(1, -1), new Point(1)]
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
            trainIconSize: new CVal(new Point(0.385), "sizeUnit")
        }   
    },
}

mergeObjects(CONFIG, CONFIG_NAIVIGATION_SHARED, false);

export default CONFIG