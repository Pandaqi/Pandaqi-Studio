import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig"
import { GridSizePreset } from "js/pq_games/tools/generation/materialGenerator";
import Point from "js/pq_games/tools/geometry/point"
import { CardType, ColorType } from "./dict";
import CVal from "js/pq_games/tools/generation/cval";
import Bounds from "js/pq_games/tools/numbers/bounds";
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
                label: "Base Game"
            },

            pointAPolice:
            {
                type: SettingType.CHECK,
                label: "Point-a-Police",
                value: false,
            },

            completeAMission:
            {
                type: SettingType.CHECK,
                label: "Complete-a-Mission",
                value: false,
            },

            dontATouchme:
            {
                type: SettingType.CHECK,
                label: "Dont-a-Touchme",
                value: false,
            },

            waitAMinute:
            {
                type: SettingType.CHECK,
                label: "Wait-a-Minute",
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
        fileName: "Point-a-Pile",
    },

    // assets
    assetsBase: "/swiftsmash-saga/tap/point-a-pile/assets/",
    assets:
    {
        amaranth:
        {
            path: "fonts/Amaranth-Regular.woff2",
        },

        amaranth_italic:
        {
            key: "amaranth",
            path: "fonts/Amaranth-Italic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC })
        },

        amaranth_bold:
        {
            key: "amaranth",
            path: "fonts/Amaranth-Bold.woff2",
            textConfig: new TextConfig({ weight: TextWeight.BOLD })
        },

        amaranth_italic_bold:
        {
            key: "amaranth",
            path: "fonts/Amaranth-BoldItalic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC, weight: TextWeight.BOLD })
        },

        auntbertha:
        {
            path: "fonts/AuntBertha.woff2",
        },

        card_templates:
        {
            path: "card_templates.webp",
            frames: new Point(5,1)
        },

        types:
        {
            path: "types.webp",
            frames: new Point(5,1)
        },

        regular_cards:
        {
            path: "regular_cards.webp",
            frames: new Point(6,2)
        },

        rule_cards:
        {
            path: "rule_cards.webp",
            frames: new Point(4,2)
        },

        shy_cards:
        {
            path: "shy_cards.webp",
            frames: new Point(4,2)
        },

        action_cards:
        {
            path: "action_cards.webp",
            frames: new Point(4,4)
        },

    },

    rulebook:
    {
        numPlayerBounds: new Bounds(2,5),
        itemSize: new Point(375, 575)
    },

    generation:
    {
        setNameForCardType:
        {
            [CardType.REGULAR]: "base",
            [CardType.RULE]: "pointAPolice",
            [CardType.MISSION]: "completeAMission",
            [CardType.ACTION]: "waitAMinute",
            [CardType.SHY]: "dontATouchme",
        },

        numCardsPerSet:
        {
            base: 54,
            pointAPolice: 15,
            completeAMission: 12,
            waitAMinute: 20,
            dontATouchme: 15
        },

        colorDist:
        {
            [ColorType.RED]: 0.3,
            [ColorType.GREEN]: 0.3,
            [ColorType.BLUE]: 0.2,
            [ColorType.PURPLE]: 0.2
        }
    },

    _material:
    {
        cards:
        {
            itemSize: new Point(375, 575),
            picker: cardPicker,
            mapper: MapperPreset.CARD
        }
    },

    _drawing:
    {
        fonts:
        {
            heading: "auntbertha",
            body: "amaranth",
        },

        cards:
        {
            title:
            {
                pos: new CVal(new Point(0.5, 0.55), "size"),
                textBoxSize: new CVal(new Point(0.9, 0.2), "size"),
                fontSize: new CVal(0.12, "sizeUnit"),
                strokeWidth: new CVal(0.15, "cards.title.fontSize")
            },

            corners:
            {
                rectSize: new CVal(new Point(0.15), "sizeUnit"),
                rectRadius: new CVal(0.025, "sizeUnit"),
                strokeWidth: new CVal(0.015, "sizeUnit"),
                iconSize: new CVal(new Point(0.1), "sizeUnit"),
                offset: new CVal(new Point(0.12), "sizeUnit"),
                fontSize: new CVal(0.14, "sizeUnit"),

                type:
                {
                    fontSize: new CVal(0.055, "sizeUnit"),
                    offset: new CVal(new Point(0.06, 0.225), "sizeUnit"),
                    alpha: 0.66
                }
            },

            icon:
            {
                pos: new CVal(new Point(0.5, 0.275), "size"),
                size: new CVal(new Point(0.5), "sizeUnit"),
            },

            action:
            {
                fontSize: new CVal(0.08, "sizeUnit"),
                pos: new CVal(new Point(0.5, 0.765), "size"),
                textBoxSize: new CVal(new Point(0.7, 0.4), "size"),
            }
        },
    }
}