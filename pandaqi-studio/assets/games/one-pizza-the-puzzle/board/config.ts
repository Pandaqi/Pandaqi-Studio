import Point from "js/pq_games/tools/geometry/point";

export const CONFIG =
{
    _settings:
    {
        playerCount:
        {
            type: SettingType.NUMBER,
            min: 2,
            max: 8,
            default: 4
        },

        boardVariation:
        {
            type: SettingType.ENUM,
            values: ["none", "small", "medium", "large", "extreme"],
            default: "medium",
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
            },

            treacherousTraffic:
            {
                type: SettingType.CHECK,
                label: "Treacherous Traffic",
            },

            ingeniousIngredients:
            {
                type: SettingType.CHECK,
                label: "Ingenious Ingredients",
            },

            preposterousPlaces:
            {
                type: SettingType.CHECK,
                label: "Preposterous Places",
            },
        }
    },

    configKey: "onePizzaThePuzzleConfig",
    assetsBase: "/one-pizza-the-puzzle/assets/",
    assets:
    {
        leckerli:
        {
            path: "fonts/LeckerliOne-Regular.woff2"
        },

        // the different marks to signal the direction/division of roads (like on asphalt usually)
        roadmarks:
        {
            path: "roadmarks.webp",
            frames: new Point(5,1)
        },

        // big ingredient icons, used on buildings/entrances
        ingredients:
        {
            path: "ingredients.webp",
            frames: new Point(7,2)
        },

        // pizza crust + smaller icons used when combining pizza
        crust:
        {
            path: "crust.webp",
            frames: new Point(8,1)
        },

        // the icons for any special buildings or elements on the map
        general_icons:
        {
            path: "general_icons.webp",
            frames: new Point(6,1)
        },

        // natural decorations (such as fountain, roundabout, hedge, ...)
        decorations:
        {
            path: "decorations.webp",
            frames: new Point(6,1)
        },

        // traffic signs (from the Expansion)
        traffic_signs:
        {
            path: "traffic_signs.webp",
            frames: new Point(8,1)
        },

        // movement shapes to pick from (when moving a Pizza Courier)
        shapes:
        {
            path: "shapes.webp",
            frames: new Point(9,2)
        },

        // special building icons (used when Preposterous Places is enabled)
        special_buildings:
        {
            path: "special_buildings.webp",
            frames: new Point(6,1)
        },

        // a hint to remind players about picking unique shapes for each courier
        unique_shapes_hint:
        {
            path: "unique_shapes_hint.webp"
        }
    }
}