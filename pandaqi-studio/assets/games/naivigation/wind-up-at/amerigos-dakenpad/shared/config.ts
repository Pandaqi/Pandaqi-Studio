import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig";
import CVal from "js/pq_games/tools/generation/cval";
import Point from "js/pq_games/tools/geometry/point";
import { cardPicker } from "../game/cardPicker";

export const CONFIG:any = 
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
                label: "Basisspel",
            },

            gladdeDaken:
            {
                type: SettingType.CHECK,
                value: false,
                label: "Uitbreiding: Gladde Daken",
            },

            paardenSprongen:
            {
                type: SettingType.CHECK,
                value: false,
                label: "Uitbreiding: Paardensprongen",
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
        fileName: "Amerigo's Dakenpad",
    },

    // assets
    assetsBase: "/naivigation/wind-up-at/amerigos-dakenpad/assets/",
    assets:
    {
        crimson:
        {
            path: "fonts/CrimsonText-Regular.woff2",
        },

        crimson_italic:
        {
            key: "crimson",
            path: "fonts/CrimsonText-Italic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC })
        },

        crimson_bold:
        {
            key: "crimson",
            path: "fonts/CrimsonText-Bold.woff2",
            textConfig: new TextConfig({ weight: TextWeight.BOLD })
        },

        crimson_bold_italic:
        {
            key: "crimson",
            path: "fonts/CrimsonText-BoldItalic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC, weight: TextWeight.BOLD })
        },

        freebie:
        {
            path: "fonts/FreebieRegular.woff2",
        },

        card_templates:
        {
            path: "card_templates.webp",
            frames: new Point(7,1)
        },

        gladde_daken:
        {
            path: "gladde_daken.webp",
            frames: new Point(4,2),
            loadIf: ["sets.gladdeDaken"]
        },

        paarden_sprongen:
        {
            path: "paarden_sprongen.webp",
            frames: new Point(4,2),
            loadIf: ["sets.paardenSprongen"]
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(4,4)
        },
    },

    generation:
    {
        base:
        {
            numRouteCards: 20,
            routeCardDist:
            {
                huis: 0.55,
                niks: 0.5
            },
            routeCardGiftDist:
            {
                1: 0.75, // "this percentage requires only 1 gift"
                2: 0.2,
                3: 0.05
            },

            numRegularCards: 26,
            percentageGiftCards: 0.433,

            vaarCardDist:
            {
                vooruit: 0.45,
                achteruit: 0.2,
                omdraaien: 0.25,
                sprong: 0.1
            }
        },

        paardenSprongen:
        {
            percentageWithoutNumber: 0.67,
            cardFrequencies:
            {
                vooruit_dubbel: 2,
                achteruit_dubbel: 2,
                touw: 3,
                niks: 3,
            },

            pakjeFrequency: 2
        },

        gladdeDaken:
        {
            defaultFrequency: 1
        }
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
            heading: "freebie",
            body: "crimson",
        },

        cards:
        {
            route:
            {
                homePos: new CVal(new Point(0.5, 0.66), "size"),
                homeSize: new CVal(new Point(0.75), "sizeUnit"),
                giftPos: new CVal(new Point(0.5, 0.15), "size"),
                giftSize: new CVal(new Point(0.2), "sizeUnit"),

                text:
                {
                    fontSize: new CVal(0.07, "sizeUnit"),
                    boxSize: new CVal(new Point(0.85, 0.25), "size")
                }
            },

            varen:
            {
                pos: new CVal(new Point(0.5, 0.275), "size"),
                size: new CVal(new Point(0.75), "sizeUnit"),
                text:
                {
                    pos: new CVal(new Point(0.5, 0.7225), "size"),
                    size: new CVal(new Point(0.85, 0.3), "size"),
                    fontSize: new CVal(0.1, "sizeUnit")
                },

                icons:
                {
                    anchor: new CVal(new Point(0.15, 0.915), "size"),
                    maxDist: new CVal(0.725, "sizeUnit"),
                    numRepeats: 4,
                    alpha: 0.75
                }
            },

            pakje:
            {
                pos: new CVal(new Point(0.5, 0.475), "size"),
                size: new CVal(new Point(0.775), "sizeUnit")
            },

            numbers:
            {
                offset: new CVal(new Point(0.134, 0.1215), "sizeUnit"),
                fontSize: new CVal(0.12, "sizeUnit"),

                dots:
                {
                    interval: 5,
                    offset: new CVal(new Point(0, 0.1), "sizeUnit"),
                    size: new CVal(new Point(0.0325), "sizeUnit"),
                    sizePadded: new CVal(new Point(0.036), "sizeUnit"),
                }
            },
        },
    }
}