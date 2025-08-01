import { generateRulebookExample } from "../rules/main";
import { CELLS } from "./dict";

export const CONFIG =
{
    _settings:
    {
        showLetters:
        {
            type: SettingType.CHECK,
            default: true,
            remark: "Adds a hint on the symbols about what letter they are from each direction."
        },

        expansions:
        {
            type: SettingType.GROUP,

            specialCells:
            {
                type: SettingType.CHECK,
                label: "Supercells",
            },

            wereWalls:
            {
                type: SettingType.CHECK,
                label: "Werewalls",
            },

            toughLetters:
            {
                type: SettingType.CHECK,
                label: "Tough Letters",
                remark: "Adds symbols that are harder to read. Allows more unique letter combinations.
            },
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
                config:
                {
                    icons:
                    {
                        base: "/keebble-games/spell/keebble-domino/assets/",
                        sheetURL: "special_cells.webp",
                        sheetWidth: 8,
                        icons: CELLS
                    }
                },

                data: CELLS
            },
        }
    },

    debugWithoutPDF: false, // @DEBUGGING (should be false)
    resLoader: null,
    gridMapper: null,
    pdfBuilder: null,
    assetsBase: "/keebble-games/spell/keebble-domino/assets/"
}