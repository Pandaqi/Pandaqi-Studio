
import { CVal, SettingType, MapperPreset, Vector2 } from "lib/pq-games";
import { RendererPixi } from "lib/pq-games";
import { boardPicker } from "../board/boardPicker";

export const CONFIG =
{
    _game:
    {
        fileName: "One Pizza The Puzzle",
        renderer: new RendererPixi()
    },

    _settings:
    {
        playerCount:
        {
            type: SettingType.NUMBER,
            min: 2,
            max: 8,
            value: 4
        },

        boardVariation:
        {
            type: SettingType.ENUM,
            values: ["none", "small", "medium", "large", "extreme"],
            value: "medium",
            label: "Variation",
            remark: "Higher means more curving streets, irregular building shapes, and distinct areas. Choose whatever you prefer."
        },

        expansions:
        {
            type: SettingType.GROUP,

            pizzaPolice:
            {
                type: SettingType.CHECK,
                label: "Pizza Police",
                value: false,
            },

            treacherousTraffic:
            {
                type: SettingType.CHECK,
                label: "Treacherous Traffic",
                value: false,
            },

            ingeniousIngredients:
            {
                type: SettingType.CHECK,
                label: "Ingenious Ingredients",
                value: false,
            },

            preposterousPlaces:
            {
                type: SettingType.CHECK,
                label: "Preposterous Places",
                value: false,
            },
        }
    },

    _material:
    {
        board:
        {
            picker: () => boardPicker,
            mapper: MapperPreset.FULL_PAGE
        }
    },

    // how generation/balancing happens
    generation:
    {
        ingredientBuildingProbability: 0.6, // 60% of the map are ingredient buildings, rest is reserved or order
        buildingMinSize: 2,
        buildingMaxSize: 5,
        buildingGrowthChance: 0.6,
        maxEntrancesPerBuildingBase: 1, // + 20% of the player count, rounded

        minDistancePoliceIcons: 6,
        minDistanceTrafficSigns: 2,
        trafficSignsPerPlayer: 5,

        roundaboutProbability: 0.25,
        roundaboutProbabilityPreposterous: 0.75,

        // the rectangle of squares reserved for the movement shapes, picked at random per board
        shapeConfigurations: [
            new Vector2(4,1), new Vector2(3,1), new Vector2(2,2),
            new Vector2(3,1), new Vector2(1,4)
        ]
    },

    // how to draw stuff
    _drawing:
    {
        fonts:
        {
            heading: "leckerli"
        },

        board:
        {
            borderWidth: 0.075, // ratio of a cell's size
            ingredientSpriteScale: 0.8, // ratio of a cell's size

            seedFontSize: new CVal(16/1160, "sizeX"),
            labelFontSize: new CVal(20/1160, "sizeX"),

            buildingColors: [
                "#FFAAAA", "#FFFF50", "#FFECCF", "#FFECB2", "#CEFFAB", "#FFC1DC", "#FFD8D0", // regular ingredients
                "#FFDAD4", "#F0ECCB", "#FFEEE7", "#FFD4B9", "#DEFDC7", "#FFECF4", "#E0EDDB" // special ingredients
            ]
        }
    },

    _resources:
    {    
        base: "/one-pizza-the-puzzle/assets/",
        files:
        {
            leckerli:
            {
                path: "fonts/LeckerliOne-Regular.woff2"
            },

            // the different marks to signal the direction/division of roads (like on asphalt usually)
            roadmarks:
            {
                path: "roadmarks.webp",
                frames: new Vector2(5,1)
            },

            // big ingredient icons, used on buildings/entrances
            ingredients:
            {
                path: "ingredients.webp",
                frames: new Vector2(7,2)
            },

            // pizza crust + smaller icons used when combining pizza
            crust:
            {
                path: "crust.webp",
                frames: new Vector2(8,1)
            },

            // the icons for any special buildings or elements on the map
            general_icons:
            {
                path: "general_icons.webp",
                frames: new Vector2(6,1)
            },

            // natural decorations (such as fountain, roundabout, hedge, ...)
            decorations:
            {
                path: "decorations.webp",
                frames: new Vector2(6,1)
            },

            // traffic signs (from the Expansion)
            traffic_signs:
            {
                path: "traffic_signs.webp",
                frames: new Vector2(8,1)
            },

            // movement shapes to pick from (when moving a Pizza Courier)
            shapes:
            {
                path: "shapes.webp",
                frames: new Vector2(9,2)
            },

            // special building icons (used when Preposterous Places is enabled)
            special_buildings:
            {
                path: "special_buildings.webp",
                frames: new Vector2(6,1)
            },

            // a hint to remind players about picking unique shapes for each courier
            unique_shapes_hint:
            {
                path: "unique_shapes_hint.webp"
            }
        }
    }
}