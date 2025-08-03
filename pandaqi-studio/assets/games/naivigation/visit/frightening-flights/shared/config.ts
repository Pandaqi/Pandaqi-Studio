import { CONFIG_NAIVIGATION_SHARED } from "games/naivigation/shared/configShared";
import { PASSENGERS, TerrainType } from "games/naivigation/shared/dictShared";
import mergeObjects from "js/pq_games/tools/collections/mergeObjects";
import CVal from "js/pq_games/tools/generation/cval";
import Point from "js/pq_games/tools/geometry/point";
import Bounds from "js/pq_games/tools/numbers/bounds";
import { cardPicker, tilePicker } from "../game/generators";

export const CONFIG:any = 
{
    _settings:
    {
        addTextOnTiles:
        {
            type: SettingType.CHECK,
            remark: "Map tiles explain themselves with text on them.",
            label: "Add text on tiles",
            value: false
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
            fuelFalling:
            {
                type: SettingType.CHECK,
                label: "Fuel & Falling",
                value: false,
            },

            repairsRacing:
            {
                type: SettingType.CHECK,
                label: "Repairs & Racing",
                value: false,
            },

            timezonesTomorrow:
            {
                type: SettingType.CHECK,
                label: "Timezones & Tomorrow",
                value: false,
            },

            birdsBumps:
            {
                type: SettingType.CHECK,
                label: "Birds & Bumps",
                value: false,
            },

            passengersPlanes:
            {
                type: SettingType.CHECK,
                label: "Passengers & Planes",
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
        fileName: "Naivigation: Frightening Flights",
    },

    // assets
    assetsBase: "/naivigation/visit/frightening-flights/assets/",
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
            frames: new Point(8,1),
            loadIf: ["sets.vehicleCards", "sets.specialCards", "sets.fuelFalling"]
        },

        terrains:
        {
            loadIf: ["sets.mapTiles", "sets.repairsRacing"]
        },

        persons:
        {
            loadIf: ["sets.passengersPlanes"]
        }
    },

    generation:
    {
        terrainDist:
        {
            [TerrainType.SEA]: { perc: 0.1, filterCollectibles: "exclude" },
            [TerrainType.GRASS]: { perc: 0.3 },
            [TerrainType.FOREST]: { perc: 0.3 },
            [TerrainType.CITY]: { perc: 0.2 },
            [TerrainType.MOUNTAIN]: { perc: 0.1 },
        }
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
                numCards: 10,
                options: Object.keys(PASSENGERS),
                fontSize: new CVal(0.07, "sizeUnit"),
                textBoxDims: new CVal(new Point(0.925, 0.33), "size"),
                bonusPos: new CVal(new Point(0.5, 0.625), "size"),
                cursePos: new CVal(new Point(0.5, 0.875), "size"),
                iconOffset: new CVal(new Point(0.1, 0.4), "size"),
                airportIconSize: new CVal(new Point(0.12), "sizeUnit")
            }

        },

        tiles:
        {
            custom:
            {
                fontSize: new CVal(0.3, "sizeUnit"),
                strokeWidth: new CVal(0.08, "tiles.custom.fontSize"),

                elevationBounds: new Bounds(1,5),
                clockBounds: new Bounds(0,7),
                clockCardsPerValue: 2,
            }   
        }
    }
}

mergeObjects(CONFIG, CONFIG_NAIVIGATION_SHARED, false);