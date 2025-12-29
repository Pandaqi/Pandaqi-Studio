export const CONFIG =
{
    _resources:
    {    
        base: "/starry-skylines/assets/",
    },
    
    _settings:
    {
        playerCount:
        {
            type: SettingType.NUMBER,
            min: 1,
            max: 8,
            default: 3
        },

        planet:
        {
            type: SettingType.ENUM,
            values: ["learnth", "uronus", "marsh", "yumpiter", "meercury", "intervenus", "pluto", "naptune"]
        },

        manualCombo:
        {
            values: ["", "nature", "leadership", "resources", "entertainment", "chaotic"],
            label: "Play Handpicked Combination?",
            remark: "Choose a handpicked combination of planets if you want to follow a particular theme. Only use this if you've read the rules for all planets before."
        }
    }
}