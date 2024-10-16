import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig"
import { GridSizePreset } from "js/pq_games/tools/generation/materialGenerator";
import Point from "js/pq_games/tools/geometry/point"
import autoLoadFontCSS from "js/pq_games/website/autoLoadFontCSS";
import { CardDisplayType, ColorType } from "./dict";
import CVal from "js/pq_games/tools/generation/cval";
import Bounds from "js/pq_games/tools/numbers/bounds";

const CONFIG:any = 
{
    debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    configKey: "racesmackConfig",
    fileName: "[Material] Racesmack",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",
    pageSize: "a4",

    fonts:
    {
        heading: "amsterdam",
        body: "whackadoo",
    },

    sets:
    {
        base: true,
        shiftingGears: false,
    },

    // assets
    assetsBase: "/swiftsmash-saga/tap/racesmack/assets/",
    assets:
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
            frames: new Point(2,1)
        },

        finish_icons:
        {
            path: "finish_icons.webp",
            frames: new Point(4,2)
        },

        rule_icons:
        {
            path: "rule_icons.webp",
            frames: new Point(4,2)
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(4,4)
        },

    },

    rulebook:
    {
        numPlayerBounds: new Bounds(2,6),
        numCardsPerPlayer: 4,
        itemSize: new Point(375, 575),
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
            1: 0.1, // "this percentage of cards has 1 symbol"
            2: 0.2,
            3: 0.3,
            4: 0.2,
            5: 0.1,
            6: 0.1
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

    cards:
    {
        drawerConfig:
        {
            preset: GridSizePreset.CARD
        },

        shapes:
        {
            topLeft: new CVal(new Point(0.175, 0.225), "size"),
            boxSize: new CVal(new Point(0.65, 0.55), "size"),
            size: new CVal(new Point(0.275), "sizeUnit"),

            custom:
            {
                posLeft: new CVal(new Point(0.3, 0.3), "size"),
                posRight: new CVal(new Point(0.7, 0.3), "size"),
                fontSizeNumber: new CVal(0.3, "sizeUnit"),
                fontSizeRoman: new CVal(0.3, "sizeUnit"),
                size: new CVal(new Point(0.33), "sizeUnit")
            }
        },

        rules:
        {
            fontSize: new CVal(0.07, "sizeUnit"),
            textBoxSize: new CVal(new Point(0.63, 0.35), "size"),
            iconSize: new CVal(new Point(0.166), "sizeUnit"),

            id:
            {
                pos: new CVal(new Point(0.59, 0.06), "size"),
                fontSize: new CVal(0.115, "sizeUnit")
            },

            rule:
            {
                pos: new CVal(new Point(0.35, 0.25), "size"),
                posIcon: new CVal(new Point(0.817, 0.247), "size")
            },

            finish:
            {
                pos: new CVal(new Point(0.35, 0.75), "size"),
                posIcon: new CVal(new Point(0.817, 0.747), "size")
            }

        }
    },
}

autoLoadFontCSS(CONFIG);

export default CONFIG