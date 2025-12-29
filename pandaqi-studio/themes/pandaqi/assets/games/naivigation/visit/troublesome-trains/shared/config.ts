import { CONFIG_NAIVIGATION_SHARED } from "games/naivigation/shared/configShared";
import { NetworkType, TerrainType, TileType } from "games/naivigation/shared/dictShared";
import { MATERIAL } from "./dict";
import { cardPicker, tilePicker } from "../game/generators";
import { SettingType, Vector2, CVal, mergeObjects } from "lib/pq-games";

export const CONFIG = 
{
    _settings:
    {
        addTextOnTiles:
        {
            type: SettingType.CHECK,
            remark: "Map tiles explain themselves with text on them.",
            label: "Add text on tiles",
            value: false,
        },

        vehiclesAsPawns:
        {
            type: SettingType.CHECK,
            value: true,
            label: "Create vehicles as pawns",
            remark: "If enabled, you can fold the vehicle to place it on the board standing up." 
        },

        sets:
        {
            type: SettingType.GROUP,

            vehicleTiles:
            {
                type: SettingType.CHECK,
                value: true,
                label: "Vehicle Pawns",
            },

            mapTiles:
            {
                type: SettingType.CHECK,
                value: true,
                label: "Map Tiles",
            },

            vehicleCards:
            {
                type: SettingType.CHECK,
                value: true,
                label: "Vehicle Cards",
            },

            specialCards:
            {
                type: SettingType.CHECK,
                value: true,
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
                value: false
            },

            animalsCrossings:
            {
                type: SettingType.CHECK,
                label: "Animals & Crossings",
                value: false
            },

            railsFails:
            {
                type: SettingType.CHECK,
                label: "Rails & Fails",
                value: false
            },

            directionDelay:
            {
                type: SettingType.CHECK,
                label: "Direction & Delay",
                value: false
            },
        }
    },

    _debug:
    {
        filterAssets: [], // @DEBUGGING (should be empty)
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    _game:
    {
        fileName: "Naivigation: Troublesome Trains",
    },

    // assets
    _resources:
    {    
        base: "/naivigation/visit/troublesome-trains/assets/",
        files:
        {
            misc:
            {
                path: "misc.webp",
                frames: new Vector2(8,1)
            },

            vehicle_cards:
            {
                path: "vehicle_cards.webp",
                frames: new Vector2(8,1)
            },

            map_tiles:
            {
                path: "map_tiles.webp",
                frames: new Vector2(8,2)
            },

            icons:
            {
                path: "icons.webp",
                frames: new Vector2(5,1),
                loadIf: ["sets.vehicleCards", "sets.specialCards"]
            },

            networks:
            {
                path: "networks.webp",
                frames: new Vector2(5,4),
                loadIf: ["sets.mapTiles", "sets.animalsCrossings"]
            },

            terrains:
            {
                loadIf: ["sets.mapTiles", "sets.animalsCrossings"]
            }
        },
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

    _material:
    {
        cards:
        {
            picker: cardPicker.asFunction()
        },

        tiles: 
        {
            picker: tilePicker.asFunction()
        }
    },

    _drawing:
    {
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
                    1: [new Vector2(0)],
                    2: [new Vector2(-0.66), new Vector2(0.66)],
                    3: [new Vector2(-1), new Vector2(0), new Vector2(1)],
                    4: [new Vector2(-1), new Vector2(-1, 1), new Vector2(1, -1), new Vector2(1)],
                    5: [new Vector2(-1), new Vector2(-1, 1), new Vector2(0), new Vector2(1, -1), new Vector2(1)]
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
                trainIconSize: new CVal(new Vector2(0.385), "sizeUnit")
            }   
        },
    }
}

mergeObjects(CONFIG, CONFIG_NAIVIGATION_SHARED, false);