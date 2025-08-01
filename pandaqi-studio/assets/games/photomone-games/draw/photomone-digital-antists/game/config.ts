export const CONFIG =
{
    _settings:
    {
        enableTutorial:
        {
            type: SettingType.CHECK,
            default: true,
            label: "Tutorial?",
            remark: "Explains how to play while taking your first few turns."
        },

        wordComplexity:
        {
            type: SettingType.ENUM,
            values: ["core", "easy", "medium"],
            default: "core",
            label: "Word Complexity",
            remark: "How hard should the words be?"
        },

        timerLength:
        {
            type: SettingType.NUMBER,
            min: 30,
            max: 90,
            step: 15,
            label: "Timer Duration",
            remark: "How many seconds do you want to have per drawing?"
        },

        sneakySpots:
        {
            type: SettingType.CHECK,
            label: "Sneaky Spots",
            remark: "Adds dots with special powers."
        },

        categories:
        {
            type: SettingType.MULTI,
            values: ["anatomy", "animals", "clothes", "food", "items", "nature", "occupations", "places", "sports", "vehicles"],
            default: ["anatomy", "animals", "clothes", "food", "items", "nature", "occupations", "places", "sports", "vehicles"],
            
        }
    }
}