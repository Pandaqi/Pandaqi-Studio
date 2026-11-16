import { boardPicker } from "../board/boardPicker";
import { SettingType, MapperPreset, Vector2 } from "lib/pq-games";
import type { GameConfig, GameConfigGame } from "lib/pq-games";

// The board page swaps in a different settings block at load, so `_settings` is typed as a settings bag
// (and the rest of the config keeps its custom fields through the index signature).
interface WonderingWitchesConfig
{
    _settings: GameConfig["_settings"],
    _game: GameConfigGame,
    [key: string]: any,
}

export const CONFIG : WonderingWitchesConfig =
{
    // typed so the page entry can attach the renderer it builds
    _game:
    {
        fileName: "Wondering Witches",
    } as GameConfigGame,

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
            picker: () => boardPicker,
            mapper: MapperPreset.FULL_PAGE
        }
    },

    _resources:
    {    
        base: "/wondering-witches/assets/",
        files:
        {
            mali:
            {
                path: "fonts/Mali-Regular.woff2"
            },

            ingredient_spritesheet:
            {
                path: "ingredient_spritesheet.webp",
                frames: new Vector2(10,1)
            },

            special_cell_spritesheet:
            {
                path: "special_cell_spritesheet.webp",
                frames: new Vector2(8,1)
            }
        }
    }
}