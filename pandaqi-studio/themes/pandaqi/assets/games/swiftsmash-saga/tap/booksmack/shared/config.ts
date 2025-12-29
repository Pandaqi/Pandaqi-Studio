
import { SettingType, TextConfig, TextStyle, TextWeight, Vector2, Bounds, MapperPreset, CVal } from "lib/pq-games";
import { cardPicker } from "../game/cardPicker";

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

            powerPunctuation:
            {
                type: SettingType.CHECK,
                label: "Power Punctuation",
                value: false,
            },

            niftyNumbers:
            {
                type: SettingType.CHECK,
                label: "Nifty Numbers",
                value: false,
            },

            gigglingGlyphs:
            {
                type: SettingType.CHECK,
                label: "Giggling Glyphs",
                value: false,
            },

            cursedCritics:
            {
                type: SettingType.CHECK,
                label: "Cursed Critics",
                value: false,
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
        fileName: "Booksmack",
    },

    // assets
    _resources:
    {    
        base: "/swiftsmash-saga/tap/booksmack/assets/",
        files:
        {
            andika:
            {
                path: "fonts/Andika.woff2",
            },

            andika_italic:
            {
                key: "whackadoo",
                path: "fonts/Andika-Italic.woff2",
                textConfig: new TextConfig({ style: TextStyle.ITALIC })
            },

            andika_bold:
            {
                key: "whackadoo",
                path: "fonts/Andika-Bold.woff2",
                textConfig: new TextConfig({ weight: TextWeight.BOLD })
            },

            andika_bold_italic:
            {
                key: "whackadoo",
                path: "fonts/Andika-BoldItalic.woff2",
                textConfig: new TextConfig({ style: TextStyle.ITALIC, weight: TextWeight.BOLD })
            },

            abril:
            {
                path: "fonts/AbrilFatface-Regular.woff2",
            },

            card_templates:
            {
                path: "card_templates.webp",
                frames: new Vector2(2,1)
            },
        }
    },

    rulebook:
    {
        numPlayerBounds: new Bounds(3,6),
        numCardsPerPlayer: 4,
        itemSize: new Vector2(375, 575)
    },

    generation:
    {
        symbolsPerSet:
        {
            base: "ACDEILNOPRSTUabcdefghijklmnopqrstuvwxyz", // the rarest letters don't get an uppercase; all of them = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
            powerPunctuation: "?!.",
            niftyNumbers: [2, 5, 8, 10, 12, 15, 18, 20, 25], // don't want to overcrowd the deck with numbers + "weird" numbers are just really hard to calculate while playing
            gigglingGlyphs: "+- &*@~#",
            cursedCritics: "áàâåéèêíîïôøöüúùñçč"
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
            heading: "abril",
            body: "andika",
        },

        cards:
        {
            corners:
            {
                offset: new CVal(new Vector2(0.15, 0.125), "sizeUnit"),
                fontSize: new CVal(0.125, "sizeUnit"),
            },

            main:
            {
                pos: new CVal(new Vector2(0.5), "size"),
                posWithAction: new CVal(new Vector2(0.5, 0.35), "size"),
                fontSize: new CVal(0.735, "sizeUnit"),
                shadowBlur: new CVal(0.05, "cards.main.fontSize")
            },

            action:
            {
                textColor: "#221500",
                title:
                {
                    pos: new CVal(new Vector2(0.5, 0.635), "size"),
                    fontSize: new CVal(0.0475, "sizeUnit"),
                },
                text:
                {
                    pos: new CVal(new Vector2(0.5, 0.8), "size"),
                    fontSize: new CVal(0.06, "sizeUnit"),
                    boxSize: new CVal(new Vector2(0.7, 0.25), "size")
                }
            }
        },
    }
}