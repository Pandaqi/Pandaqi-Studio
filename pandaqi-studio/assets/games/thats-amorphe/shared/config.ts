// @TODO: Currently unused as this whole generator is still not plugged into the general system ... at all ...
export default
{
    _settings:
    {
        wordComplexity:
        {
            type: SettingType.ENUM,
            values: ["core", "easy", "medium", "hard", "hardcore"],
            default: "easy",
            remark: "How hard should the words be?"
        },

        addActions:
        {
            type: SettingType.CHECK,
            default: true,
            label: "Add Actions",
            remark: "Allows the cards to be used with the Actions expansion."
        },

        varyWordCount:
        {
            type: SettingType.CHECK,
            label: "Vary Number Of Words",
            remark: "Will make the game harder, as cards have fewer options."
        },

        includeGeography:
        {
            type: SettingType.CHECK,
            label: "Include Geography",
            remark: "Adds cities, countries and continents."
        },

        includeNames:
        {
            type: SettingType.CHECK,
            label: "Include Names",
            remark: "Adds proper names of famous people, brands, events, etcetera."
        },

        useAllCategories:
        {
            type: SettingType.CHECK,
            label: "Use All Categories",
            remark: "Overwrite the options below to include EVERYTHING."
        },

        categories:
        {
            type: SettingType.MULTI,
            label: "Categories",
            values: ["anatomy", "animals", "business", "clothes", "colors", "digital", "food", "general", "holidays", "items", "military", "music", "nature","occupations", "people", "places", "science", "shapes", "sports", "time", "travel", "vehicles"],
            default: ["animals", "food", "items", "places", "vehicles"]
        }
    }
}