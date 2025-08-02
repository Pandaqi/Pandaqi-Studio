import Point from "js/pq_games/tools/geometry/point";

export const CONFIG =
{
    _game:
    {
        fileName: "Wondering Witches"
    },

    numPlayers: 4,
    recipeLength: 4,

    // @NOTE: this is for the GAME interface (the board generator overrides this with its own settings when loading that)
    _settings:
    {
        competitive:
        {
            type: SettingType.CHECK,
            label: "Competitive",
            value: false,
        },

        events:
        {
            type: SettingType.CHECK,
            value: true,
            label: "Events"
        },

        freeClue:
        {
            type: SettingType.CHECK,
            value: true,
            label: "Free Clue",
            remark: "Start the game with a free (cryptic) hint. Recommended."
        },

        effects:
        {
            type: SettingType.CHECK,
            label: "Effects",
            value: false,
        },

        dramaDecoys:
        {
            type: SettingType.CHECK,
            label: "Drama Decoys",
            remark: "Decoy ingredients can now be one of three different types.",
            value: false,
        },

        recipeLength:
        {
            type: SettingType.NUMBER,
            min: 4,
            max: 10,
            value: 4,
            label: "Number of Ingredients",
            remark: "The secret recipe is always length 4. But other ingredients make it harder to find those 4."
        }
    },

    _material:
    {
        board:
        {
            picker: boardPicker,
            mapper: MapperPreset.FULL_PAGE
        }
    },

    assetsBase: "/wondering-witches/assets/",
    assets:
    {
        mali:
        {
            path: "fonts/Mali-Regular.woff2"
        },

        ingredient_spritesheet:
        {
            path: "ingredient_spritesheet.webp",
            frames: new Point(10,1)
        },

        special_cell_spritesheet:
        {
            path: "special_cell_spritesheet.webp",
            frames: new Point(8,1)
        }
    }
}