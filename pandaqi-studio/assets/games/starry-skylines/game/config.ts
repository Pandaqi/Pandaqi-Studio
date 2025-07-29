export default 
{
    assetsBase: "/starry-skylines/assets/",
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
            values: ["Learnth", "Uronus", "Marsh", "Yumpiter", "Meercury", "Intervenus", "Pluto", "Naptune"]
        },

        manualCombo:
        {
            values: ["", "Nature", "Leadership", "Resources", "Entertainment", "Chaotic"],
            label: "Play Handpicked Combination?",
            remark: "Choose a handpicked combination of planets if you want to follow a particular theme. Only use this if you've read the rules for all planets before."
        }
    }
}