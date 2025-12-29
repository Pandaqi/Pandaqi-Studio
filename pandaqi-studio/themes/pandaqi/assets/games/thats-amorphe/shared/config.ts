
import { SettingType, Vector2, MapperPreset, Color } from "lib/pq-games";
import { cardPicker } from "../game/cardPicker";

export const CONFIG =
{
    expansion: "", // set to `pictures` for Amorphe Pictures to mark changes needed

    _settings:
    {
        material:
        {
            type: SettingType.GROUP,

            wordCards:
            {
                type: SettingType.CHECK,
                value: true,
                label: "Word Cards"
            },

            morphCards:
            {
                type: SettingType.CHECK,
                value: true,
                label: "Morph Cards"
            },

            voteCards:
            {
                type: SettingType.CHECK,
                value: false,
                label: "Vote Cards"
            },

            specialCards:
            {
                type: SettingType.CHECK,
                value: false,
                label: "Special Morph Cards"
            },
        },

        addActions:
        {
            type: SettingType.CHECK,
            value: true,
            label: "Add Actions",
            remark: "Allows the cards to be used with the Actions expansion."
        },

        varyWordCount:
        {
            type: SettingType.CHECK,
            value: false,
            label: "Vary Number Of Words",
            remark: "Will make the game harder, as cards have fewer options."
        },

        wordPreferences:
        {
            type: SettingType.GROUP,

            wordComplexity:
            {
                type: SettingType.ENUM,
                values: ["core", "easy", "medium", "hard", "hardcore"],
                value: "easy",
                remark: "How hard should the words be?"
            },

            includeGeography:
            {
                type: SettingType.CHECK,
                value: false,
                label: "Include Geography",
                remark: "Adds cities, countries and continents."
            },

            includeNames:
            {
                type: SettingType.CHECK,
                label: "Include Names",
                value: false,
                remark: "Adds proper names of famous people, brands, events, etcetera."
            },

            useAllCategories:
            {
                type: SettingType.CHECK,
                label: "Use All Categories",
                value: false,
                remark: "Overwrite the options below to include EVERYTHING."
            },

            categories:
            {
                type: SettingType.MULTI,
                label: "Categories",
                values: ["anatomy", "animals", "business", "clothes", "colors", "digital", "food", "general", "holidays", "items", "military", "music", "nature","occupations", "people", "places", "science", "shapes", "sports", "time", "travel", "vehicles"],
                value: ["animals", "food", "items", "places", "vehicles"]
            }
        }
    },

    _resources:
    {
        base: "/thats-amorphe/assets/",
        files:
        {
            icons_special:
            {
                path: "icons_special.webp",
                frames: new Vector2(8,1)
            },

            icons_special_inkfriendly:
            {
                path: "icons_special_inkfriendly.webp",
                frames: new Vector2(8,1)
            },

            bubbly_cloud:
            {
                path: "bubbly_cloud.webp"
            },

            guess_sign:
            {
                path: "guess_sign.webp"
            },

            bg:
            {
                path: "background_word_card.webp"
            },

            bg_inkfriendly:
            {
                path: "background_word_card_inkfriendly.webp"
            },

            icons:
            {
                path: "icons.webp",
                frames: new Vector2(10,1)
            },

            icons_pictures:
            {
                path: "icons_pictures.webp",
                frames: new Vector2(10,1)
            }
        }
    },

    _material:
    {
        cards:
        {
            picker: () => cardPicker,
            mapper: MapperPreset.TILE
        }
    },

    _drawing:
    {
        fonts:
        {
            body: "ribeye",
            heading: "ribeye"
        },

		addCircleBehindNumber: true,
		voteNumberScale: 1.66,
		addVoteSymbolsAtEdges: true,
		voteSymbolScale: 0.066, // percentage of card width
        morphCardColors: [
            new Color(0, 0, 17), new Color(83, 100, 17), new Color(126, 100, 17),
            new Color(166, 100, 17), new Color(201, 100, 17), new Color(228, 100, 17),
            new Color(268, 100, 17), new Color(293, 100, 17), new Color(329, 100, 17),
            new Color(8, 100, 17), new Color(0, 0, 67)
        ],
        numberFontSize: 80,
        borderColor: "#000000",
        borderWidth: 20,

        textColors: ["#283500", "#002B2F", "#130031", "#3C0000"],
        teamColors: [new Color(0,100,35), new Color(121, 100, 23), new Color(217,100,33)],

    }
}