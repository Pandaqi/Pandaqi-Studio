
const CONFIG =
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

    debugWithoutPDF: false, // @DEBUGGING (should be false)
    resLoader: null,
    gridMapper: null,
    pdfBuilder: null,
    assetsBase: "/keebble-games/spell/keebble-domino/assets/"
}

export default CONFIG;