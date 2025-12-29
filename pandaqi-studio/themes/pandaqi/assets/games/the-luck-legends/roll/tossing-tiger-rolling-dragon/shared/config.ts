
import { SettingType, TextConfig, TextStyle, TextWeight, Vector2, MapperPreset, CVal } from "lib/pq-games"
import { cardPicker } from "../game/cardPicker"

export const CONFIG = 
{
    _settings:
    {
        sets:
        {
            type: SettingType.GROUP,

            base:
            {
                type: SettingType.CHECK,
                value: true,
                label: "Base Game"
            },

            zooOfMoves:
            {
                type: SettingType.CHECK,
                label: "Zoo of Moves",
                value: false,
                remark: "A big expansion adding more animals."
            },

            fightTogether:
            {
                type: SettingType.CHECK,
                label: "Fight Together",
                value: false,
                remark: "A tiny expansion that allows playing in teams with simultaneous wars."
            },

            dawnDojo:
            {
                type: SettingType.CHECK,
                label: "Dawndojo",
                value: false,
                remark: "An expansion with risky Rooster cards that can upset an entire war before it even started."
            },
        }
    },

    _debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    _game:
    {
        fileName: "Tossing Tiger, Rolling Dragon",
    },

    // assets
    _resources:
    {    
        base: "/the-luck-legends/roll/tossing-tiger-rolling-dragon/assets/",
        files:
        {
            koho:
            {
                path: "fonts/KoHo-Regular.woff2",
            },

            koho_italic:
            {
                key: "koho",
                path: "fonts/KoHo-Italic.woff2",
                textConfig: new TextConfig({ style: TextStyle.ITALIC })
            },

            koho_bold:
            {
                key: "koho",
                path: "fonts/KoHo-Bold.woff2",
                textConfig: new TextConfig({ weight: TextWeight.BOLD })
            },

            chineserocks:
            {
                path: "fonts/ChineseRocksRg-Regular.woff2",
            },

            card_templates:
            {
                path: "card_templates.webp",
                frames: new Vector2(6,1)
            },

            animals:
            {
                path: "animals.webp",
                frames: new Vector2(4,5)
            },

            animals_simplified:
            {
                path: "animals_simplified.webp",
                frames: new Vector2(4,5)
            },

            misc:
            {
                path: "misc.webp",
                frames: new Vector2(4,2)
            },
        },
    },

    generation:
    {
        numCardsDefault: 30,
        numCardsPerSet:
        {
            base: 48,
            zoo: 36,
        },

        strengthDistDefault:
        {
            3: 0.5,
            4: 0.5
        },

        strengthDistPerSet:
        {
            base:
            {
                1: 0.15,
                2: 0.15,
                3: 0.25,
                4: 0.35,
                5: 0.1
            },

            zoo:
            {
                1: 0.1,
                2: 0.2,
                3: 0.3,
                4: 0.3,
                5: 0.1,
            }
        },

        numCommunicationCards: 9,
    },

    _material:
    {
        cards:
        {
            picker: cardPicker,
            mapper: MapperPreset.CARD
        }
    },

    _drawing:
    {
        fonts:
        {
            heading: "chineserocks",
            body: "koho"
        },

        cards:
        {
            bg:
            {
                bambooAlpha: 0.5,
                patternsAlpha: 1.0,
                textureAlpha: 0.5,
                outlineAlpha: 1.0,
                spiralAlpha: 0.14,
                blossomAlpha: 0.1
            },

            main:
            {
                useSimplified: false,
                pos: new CVal(new Vector2(0.5, 0.285), "size"),
                size: new CVal(new Vector2(0.65), "sizeUnit"),
                shadowBlur: new CVal(0.01, "sizeUnit"),
            },

            strengths:
            {
                useSimplified: true,
                iconDims: new CVal(new Vector2(0.17), "sizeUnit"),
                iconAnimalDims: new CVal(new Vector2(0.08), "sizeUnit"),
                anchorPos: new CVal(new Vector2(0.5, 0.1), "size"),
                placeAtBottom: true,
                shadowBlur: new CVal(0.0075, "sizeUnit"),

                fontSize: new CVal(0.038, "sizeUnit"),
                textPos: new CVal(new Vector2(0.5, 0.02), "size")
            },

            action:
            {
                heading:
                {
                    fontSize: new CVal(0.08, "sizeUnit"),
                    pos: new CVal(new Vector2(0.5, 0.6), "size"),
                    size: new CVal(new Vector2(0.85), "sizeUnit"),
                    posRooster: new CVal(new Vector2(0.5, 0.92), "size"),
                },

                fontSize: new CVal(0.0615, "sizeUnit"),
                fontSizeRooster: new CVal(0.05, "sizeUnit"),
                pos: new CVal(new Vector2(0.5, 0.73), "size"),
                posText: new CVal(new Vector2(0.5, 0.75), "size"),
                posRooster: new CVal(new Vector2(0.5, 0.52), "size"), // for the EXTRA box on rooster cards
                textPosRooster: new CVal(new Vector2(0.5, 0.532), "size"),
                size: new CVal(new Vector2(0.9), "sizeUnit"),
                textDims: new CVal(new Vector2(0.775), "sizeUnit")
            }
        },
    }
}