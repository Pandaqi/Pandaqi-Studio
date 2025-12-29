import { SettingType, TextConfig, TextStyle, TextWeight, Vector2, Bounds, MapperPreset, CVal } from "lib/pq-games";
import { cardPicker } from "../game/cardPicker";
import { ColorType, CardDisplayType } from "./dict";

export const CONFIG = 
{
    _settings:
    {
        useBiggerFont:
        {
            type: SettingType.CHECK,
            value: true,
            remark: "Uses the thicker/bigger font on Rule Cards for readability.",
            label: "Use Bold Font"
        },

        sets:
        {
            type: SettingType.GROUP,

            base:
            {
                type: SettingType.CHECK,
                value: true,
                label: "Base Game"
            },

            shiftingGears:
            {
                type: SettingType.CHECK,
                value: false,
                label: "Shifting Gears"
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
        fileName: "Racesmack",
    },

    // assets
    _resources:
    {    
        base: "/swiftsmash-saga/tap/racesmack/assets/",
        files:
        {
            whackadoo:
            {
                path: "fonts/Whackadoo.woff2",
            },

            whackadoo_italic:
            {
                key: "whackadoo",
                path: "fonts/WhackadooUpper-Italic.woff2",
                textConfig: new TextConfig({ style: TextStyle.ITALIC })
            },

            whackadoo_bold:
            {
                key: "whackadoo",
                path: "fonts/WhackadooUpper.woff2",
                textConfig: new TextConfig({ style: TextStyle.ITALIC, weight: TextWeight.BOLD })
            },
            
            amsterdam:
            {
                path: "fonts/NewAmsterdam-Regular.woff2",
            },
            
            card_templates:
            {
                path: "card_templates.webp",
                frames: new Vector2(2,1)
            },

            finish_icons:
            {
                path: "finish_icons.webp",
                frames: new Vector2(4,2)
            },

            rule_icons:
            {
                path: "rule_icons.webp",
                frames: new Vector2(4,2)
            },

            misc:
            {
                path: "misc.webp",
                frames: new Vector2(4,4)
            },
        }
    },

    rulebook:
    {
        numPlayerBounds: new Bounds(2,6),
        numCardsPerPlayer: 4,
        itemSize: new Vector2(375, 575),
        ruleCardHandling: "highest", // ignore, one, highest
        rules:
        {
            loseCardIfWrong: true,
            onePlayerDoesntSmack: true,
        }
    },

    generation:
    {
        numSymbolsDist:
        {
            1: 0.2, // "this percentage of cards has 1 symbol"
            2: 0.35,
            3: 0.3,
            4: 0.15,
        },

        numCardsPerSet:
        {
            base: 36,
            shiftingGears: 18,
        },

        numRulesCardsPerSet:
        {
            base: 18,
            shiftingGears: 0
        },

        colorDist:
        {
            [ColorType.RED]: 0.25,
            [ColorType.GREEN]: 0.25,
            [ColorType.BLUE]: 0.25,
            [ColorType.PURPLE]: 0.25
        },

        displayTypesPerSet:
        {
            base: [CardDisplayType.SYMBOLS],
            shiftingGears: [CardDisplayType.DICE, CardDisplayType.HAND, CardDisplayType.ROMAN, CardDisplayType.NUMBER]
        }
    },

    _material:
    {
        cards:
        {
            itemSize: new Vector2(375, 575),
            picker: cardPicker,
            mapper: MapperPreset.CARD
        }
    },

    _drawing:
    { 
        fonts:
        {
            heading: "amsterdam",
            body: "whackadoo",
        },

        cards:
        {
            shapes:
            {
                topLeft: new CVal(new Vector2(0.175, 0.225), "size"),
                boxSize: new CVal(new Vector2(0.65, 0.55), "size"),
                size: new CVal(new Vector2(0.275), "sizeUnit"),

                custom:
                {
                    posLeft: new CVal(new Vector2(0.3, 0.3), "size"),
                    posRight: new CVal(new Vector2(0.7, 0.3), "size"),
                    fontSizeNumber: new CVal(0.3, "sizeUnit"),
                    fontSizeRoman: new CVal(0.3, "sizeUnit"),
                    size: new CVal(new Vector2(0.33), "sizeUnit")
                }
            },

            rules:
            {
                fontSize: new CVal(0.07, "sizeUnit"),
                textBoxSize: new CVal(new Vector2(0.605, 0.35), "size"),
                iconSize: new CVal(new Vector2(0.166), "sizeUnit"),

                id:
                {
                    pos: new CVal(new Vector2(0.59, 0.06), "size"),
                    fontSize: new CVal(0.115, "sizeUnit")
                },

                rule:
                {
                    pos: new CVal(new Vector2(0.34, 0.25), "size"),
                    posIcon: new CVal(new Vector2(0.817, 0.247), "size")
                },

                finish:
                {
                    pos: new CVal(new Vector2(0.34, 0.75), "size"),
                    posIcon: new CVal(new Vector2(0.817, 0.747), "size")
                }

            }
        },
    }
}