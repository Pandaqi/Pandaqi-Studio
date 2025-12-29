import { CONFIG_NAIVIGATION_SHARED } from "games/naivigation/shared/configShared"
import { cardPicker, tilePicker } from "../game/generators";
import { planetPropertiesPicker } from "../game/planetPropertiesPicker";
import { SettingType, Vector2, MapperPreset, CVal, Bounds, mergeObjects } from "lib/pq-games";

export const CONFIG = 
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
            shields:
            {
                type: SettingType.CHECK,
                label: "Shields & Asteroids",
                value: false
            },

            weapons:
            {
                type: SettingType.CHECK,
                label: "Weapons & Aliens",
                value: false
            },

            trade:
            {
                type: SettingType.CHECK,
                label: "Trade & Technology",
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
        fileName: "Naivigation: Swerving Spaceships",
    },

    // assets
    _resources:
    {    
        base: "/naivigation/visit/swerving-spaceships/assets/",
        files:
        {
            misc:
            {
                path: "misc.webp",
                frames: new Vector2(6,1)
            },

            map_tiles:
            {
                path: "map_tiles.webp",
                frames: new Vector2(8,2)
            },

            vehicle_cards:
            {
                path: "vehicle_cards.webp",
                frames: new Vector2(7,1)
            },
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
        },

        planetProperties:
        {
            picker: planetPropertiesPicker,
            mapper: MapperPreset.CARD
        }
    },

    _drawing:
    {
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
                iconDims: new CVal(new Vector2(0.8), "sizeUnit"),
                glowRadius: new CVal(0.033, "sizeUnit"),

                // this is for their icon on the PLANETS
                vehicleIcon:
                {
                    dims: new CVal(new Vector2(0.5), "sizeUnit"),
                    dimsSmall: new CVal(new Vector2(0.185), "sizeUnit"),
                    alpha: 1.0,
                    composite: "luminosity",
                    shadowBlur: new CVal(0.05 * 0.5, "sizeUnit"),
                },

                stars:
                {
                    numBounds: new Bounds(1,10),
                    baseDims: new CVal(new Vector2(0.066), "sizeUnit"),
                    sizeRand: new Bounds(0.65, 1.45),
                    alphaBounds: new Bounds(0.15, 0.4),
                },

                resources:
                {
                    position: new CVal(new Vector2(0.75, 0.25), "sizeUnit"),
                    size: new CVal(new Vector2(0.2), "sizeUnit"),
                }
            }
        }
    }
}

mergeObjects(CONFIG, CONFIG_NAIVIGATION_SHARED, false);