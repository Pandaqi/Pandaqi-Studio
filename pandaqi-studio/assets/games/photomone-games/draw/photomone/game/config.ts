import { CONFIG_SHARED } from "games/photomone-games/shared/config";
import { cardPicker } from "./cardPicker";

export const CONFIG =
{
    _game:
    {
        fileName: "Photomone"
    },

    _material:
    {
        cards:
        {
            picker: cardPicker,
            mapper: MapperPreset.TILE
        }
    },

    wordsPerCard: 4,
    wordColors: ["#FFD23F", "#37FF8B", "#EE4266", "#CB9CF2"],

    _resources:
    {
        base: "/photomone-game/assets/",
        files:
        {
            geldotica:
            {
                path: "fonts/GelDoticaLowerCaseThick.woff2"
            },

            proza:
            {
                path: "fonts/ProzaLibre-Medium.woff2"
            },

            icon_points:
            {
                path: "icon_points.webp"
            },

            icon_lines:
            {
                path: "icon_lines.webp"
            },

            grayscale_ant:
            {
                path: "grayscale_ant.webp"
            }
        }

    },

    _settings:
    {
        wordComplexity:
        {
            type: SettingType.ENUM,
            values: ["core", "easy", "medium", "hard"],
            value: "core",
            remark: "How hard should the words be?",
            label: "Word Complexity"
        },

        wordCategories:
        {
            type: SettingType.MULTI,
            values: ["anatomy", "animals", "clothes", "food", "items", "nature", "occupations", "places", "sports", "vehicles"],
            value: ["anatomy", "animals", "clothes", "food", "items", "nature", "occupations", "places", "sports", "vehicles"],
            label: "Word Categories"
        }
    }
}

mergeObjects(CONFIG, CONFIG_SHARED);