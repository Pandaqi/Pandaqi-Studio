import { generateRulebookExample } from "../rules/main";
import { CELLS } from "./dict";
import { dominoPicker } from "./dominoPicker";

export const CONFIG =
{
    assetsBase: "/keebble-games/spell/keebble-domino/assets/",

    _settings:
    {
        showLetters:
        {
            type: SettingType.CHECK,
            value: true,
            remark: "Adds a hint on the symbols about what letter they are from each direction."
        },

        expansions:
        {
            type: SettingType.GROUP,

            specialCells:
            {
                type: SettingType.CHECK,
                label: "Supercells",
                value: false
            },

            wereWalls:
            {
                type: SettingType.CHECK,
                label: "Werewalls",
                value: false
            },

            toughLetters:
            {
                type: SettingType.CHECK,
                label: "Tough Letters",
                remark: "Adds symbols that are harder to read. Allows more unique letter combinations.",
                value: false
            },
        }
    },

    _material:
    {
        dominoes:
        {
            picker: dominoPicker,
            mapper: MapperPreset.DOMINO
        }
    },

    _rulebook:
    {
        examples:
        {
            turn:
            {
                buttonText: "Give me an example turn!",
                callback: generateRulebookExample
            }
        },

        tables:
        {
            supercells:
            {
                icons:
                {
                    config:
                    {
                        base: "/keebble-games/spell/keebble-domino/assets/",
                        sheetURL: "special_cells.webp",
                        sheetWidth: 8,
                    }
                },
                data: CELLS
            },
        }
    },
}