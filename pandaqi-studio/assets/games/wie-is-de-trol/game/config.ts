export default {
    _settings:
    {
        playerCount:
        {
            type: SettingType.NUMBER,
            min: 3,
            max: 10,
            label: "Hoeveel spelers?"
        },

        firstGame:
        {
            type: SettingType.CHECK,
            label: "Eerste Potje(s)?",
            remark: "De computer kiest alleen de makkelijkste opdrachten die helpen om het spel beter te begrijpen en simpel uit te leggen."
        },

        numRounds:
        {
            type: SettingType.ENUM,
            values: ["Automatisch", 2, 3, 4, 5, 6, 7, 8],
            label: "Hoeveel rondes?"
        },

        numQuestions:
        {
            type: SettingType.ENUM,
            values: [4, 7, 10],
            label: "Hoeveel vragen per test?",
            remark: "Verlaag het aantal rondes/vragen voor een korter spel. Eén ronde is doorgaans een half uur."
        },

        expansions:
        {
            type: SettingType.GROUP,
            label: "Uitbreidingen",

            addertjes:
            {
                type: SettingType.CHECK,
                label: "Addertjes (onder het gras)?"
            },

            eigenschappen:
            {
                type: SettingType.CHECK,
                label: "Eigenschappen?"
            },

            bondjes:
            {
                type: SettingType.CHECK,
                label: "Bondjes?"
            },

            specialeKrachten:
            {
                type: SettingType.CHECK,
                label: "Speciale Krachten?"
            },

            /*fysiekeOpdrachten:
            {
                type: SettingType.CHECK,
                label: "Fysieke Opdrachten?",
                remark: "(Deze uitbreiding is wat anders dan de rest en dus nog niet af.)"
            },*/
            
        }
    }
}