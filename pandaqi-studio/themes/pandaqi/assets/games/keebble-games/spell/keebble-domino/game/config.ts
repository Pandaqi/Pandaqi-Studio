import { MapperPreset, SettingType, Vector2 } from "lib/pq-games";
import { dominoPicker } from "./dominoPicker";

export const CONFIG =
{
    _resources:
    {    
        base: "/keebble-games/spell/keebble-domino/assets/",

        files:
        {
            arbutus:
            {
                path: "/keebble-games/assets/fonts/ArbutusSlab-Regular.woff2",
                useAbsolutePath: true,
            },

            decorations:
            {
                path: "domino_decorations.webp",
                frames: new Vector2(8,1)
            },

            cell:
            {
                path: "special_cells.webp",
                frames: new Vector2(8,2)
            },

            letter:
            {
                path: "ambigram_letters.webp",
                frames: new Vector2(8,6)
            },
        }
    },

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
            picker: () => dominoPicker,
            mapper: MapperPreset.DOMINO
        }
    },
}