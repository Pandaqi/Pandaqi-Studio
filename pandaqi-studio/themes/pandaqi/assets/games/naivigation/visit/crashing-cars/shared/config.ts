import { CONFIG_NAIVIGATION_SHARED } from "games/naivigation/shared/configShared";
import { NetworkType, PASSENGERS, TerrainType } from "games/naivigation/shared/dictShared";
import { cardPicker, tilePicker } from "../game/generators";
import { SettingType, Vector2, CVal, Bounds, mergeObjects } from "lib/pq-games";

export const CONFIG = 
{
    _settings:
    {
        addTextOnTiles:
        {
            type: SettingType.CHECK,
            remark: "Map tiles explain themselves with text on them.",
            value: false,
            label: "Add text on tiles"
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
            trafficPolice:
            {
                type: SettingType.CHECK,
                label: "Traffic & Police",
                value: false,
            },

            fuelFear:
            {
                type: SettingType.CHECK,
                label: "Fuel & Fear",
                value: false,
            },

            taxisCargo:
            {
                type: SettingType.CHECK,
                label: "Taxis & Cargo",
                value: false,
            },

            terrainTripplanning:
            {
                type: SettingType.CHECK,
                label: "Terrain & Tripplanning",
                value: false,
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
        fileName: "Naivigation: Crashing Cars",
    },

    // assets
    _resources:
    {    
        base: "/naivigation/visit/crashing-cars/assets/",
        files:
        {
            misc:
            {
                path: "misc.webp",
                frames: new Vector2(3,1)
            },

            vehicle_cards:
            {
                path: "vehicle_cards.webp",
                frames: new Vector2(5,2)
            },

            map_tiles:
            {
                path: "map_tiles.webp",
                frames: new Vector2(8,3)
            },

            icons:
            {
                path: "icons.webp",
                frames: new Vector2(5,1),
                loadIf: ["sets.vehicleCards", "sets.specialCards", "sets.fuelFear"]
            },

            networks:
            {
                path: "networks.webp",
                frames: new Vector2(5,4)
            },

            terrains:
            {
                loadIf: ["sets.mapTiles", "sets.trafficPolice", "sets.fuelFear", "sets.terrainTripplanning"]
            },

            persons:
            {
                loadIf: ["sets.taxisCargo"]
            }
        },
    },

    generation:
    {
        terrainDist:
        {
            [TerrainType.GRASS]: { perc: 0.5 },
            [TerrainType.FOREST]: { perc: 0.5 },
        },

        networks:
        {
            typeDistribution:
            {
                [NetworkType.DEADEND]: { perc: 0.05, filterCollectibles: "exclude" },
                [NetworkType.CORNER]: { perc: 0.1, filterCollectibles: "exclude" },
                [NetworkType.STRAIGHT]: { perc: 0.1, filterCollectibles: "exclude" },
                [NetworkType.THREEWAY]: { perc: 0.1, filterCollectibles: "exclude" },
                [NetworkType.ALL]: { perc: 0.65 }
            },

            keyDistribution:
            {
                regular: { perc: 0.725 },
                dirt_road: { perc: 0.1 },
                asphalt: { perc: 0.075, filterCollectibles: "exclude" },
                cobblestones: { perc: 0.1 }
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
            numFuelCards: 10,
            
            passengers:
            {
                numCards: 12,
                options: Object.keys(PASSENGERS),
                fontSize: new CVal(0.07, "sizeUnit"),
                textBoxDims: new CVal(new Vector2(0.925, 0.33), "size"),
                bonusPos: new CVal(new Vector2(0.5, 0.625), "size"),
                cursePos: new CVal(new Vector2(0.5, 0.875), "size"),
                iconOffset: new CVal(new Vector2(0.1, 0.4), "size"),
                shopIconSize: new CVal(new Vector2(0.12), "sizeUnit")
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
                    dims: new CVal(new Vector2(0.5), "sizeUnit"),
                    dimsSmall: new CVal(new Vector2(0.15), "sizeUnit"),
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
}

mergeObjects(CONFIG, CONFIG_NAIVIGATION_SHARED, false);