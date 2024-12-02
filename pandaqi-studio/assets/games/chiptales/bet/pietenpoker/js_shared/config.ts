import TextConfig, { TextWeight } from "js/pq_games/layout/text/textConfig";
import { GridSizePreset } from "js/pq_games/tools/generation/materialGenerator";
import Point from "js/pq_games/tools/geometry/point";
import Bounds from "js/pq_games/tools/numbers/bounds";
import autoLoadFontCSS from "js/pq_games/website/autoLoadFontCSS";
import { ColorType } from "./dict";
import CVal from "js/pq_games/tools/generation/cval";

const CONFIG:any = 
{
    debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    configKey: "pietenpokerConfig",
    fileName: "[Materiaal] Pietenpoker",

    fonts:
    {
        heading: "howdylemon",
        body: "kiwimaru",
    },

    sets:
    {
        base: true,
        pietjePrecies: false,
        actiepiet: false
    },

    // assets
    assetsBase: "/chiptales/bet/pietenpoker/assets/",
    assets:
    {
        kiwimaru:
        {
            path: "fonts/KiwiMaru-Light.woff2",
            loadIf: ["sets.pietjePrecies", "sets.actiepiet"] 
            // @NOTE: base game only uses heading font for something, nothing else
            // yes, this is important, because Kiwi Maru is a really heavy font for some reason
        },

        kiwimaru_bold:
        {
            key: "kiwimaru",
            path: "fonts/KiwiMaru-Medium.woff2",
            textConfig: new TextConfig({ weight: TextWeight.BOLD }),
            loadIf: ["sets.pietjePrecies", "sets.actiepiet"]
        },

        howdylemon:
        {
            path: "fonts/HowdyLemon.woff2",
        },

        card_templates:
        {
            path: "card_templates.webp",
            frames: new Point(2,1)
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(4,2),
        },

        action_icons:
        {
            path: "action_icons.webp",
            frames: new Point(4,5),
            loadIf: ["sets.pietjePrecies", "sets.actiepiet"]
        }
    },

    rulebook:
    {
        numPlayerBounds: new Bounds(3,5),
        numCardsPerPlayer: 6,
        numCardsRevealed: 3,
        itemSize: new Point(375, 575),
        stopProbability: 0.25,
        raiseProbability: 0.75,

        rules:
        {
            sintChange: "winner", // first-stop, winner, clockwise
            sintUsesScoredCards: true, // if true, sint first grabs cards from previously won, then fills with deck until 6
            numbersAlwaysBeatColors: true, // if true, numeric combinations always beat color ones, even if there are higher numbers in the colors
            allInStopsRound: false, // if true, if somebody goes all in, the round simply immediately ends (to prevent others having to go higher)
        }
    },

    generation:
    {
        base:
        {
            numCards: 50, // 46,
            generateExactNumber: true,
            numberDistribution: 
            {
                1: 0.25,
                2: 0.25,
                3: 0.2,
                4: 0.15,
                5: 0.1,
                6: 0.05
            }
        },

        pietjePrecies:
        {
            numCards: 10
        },

        actiepiet:
        {
            cardNumbers: new Bounds(1,3),
            cardColors: Object.values(ColorType),
            defaultFrequency: 1   
        },

        icons:
        {
            surprisePercentage: 0.2,
            bidPercentage: 0.25
        }
    },

    cards:
    {
        drawerConfig:
        {
            preset: GridSizePreset.CARD,
        },

        corners:
        {
            numberOffset: new CVal(new Point(0.125, 0.125), "sizeUnit"),
            iconSize: new CVal(new Point(0.15), "sizeUnit"),
            fontSize: new CVal(0.1875, "sizeUnit")
        },

        text:
        {
            rotAbove: -0.22689, // radians = ~13 degrees
            rotBelow: 2.906, // radisn = ~-166,5 degrees

            colorLabel:
            {
                offset: new CVal(new Point(0.2, 0.108), "size"),
                fontSize: new CVal(0.065, "sizeUnit")
            },

            sintLabel:
            {
                offset: new CVal(new Point(0.5, 0.09), "size")
            }
        },

        icons:
        {
            sintSize: new CVal(new Point(0.8), "sizeUnit"),

            rowDisplay:
            {
                offset: new CVal(new Point(0.18, 0.04), "size"),
                size: new CVal(new Point(0.08), "sizeUnit")
            },

            templateScaleFactor: new CVal(new Point(0.28, 0.33), "size"),  
            size: new CVal(new Point(0.22), "sizeUnit"),

            special:
            {
                randomVariation: new CVal(new Point(0, 0.35), "size"),
                surprise: new CVal(new Point(0.08, 0.5), "size"),
                bid: new CVal(new Point(0.92, 0.5), "size"),
                circleRadius: new CVal(0.06, "sizeUnit"),
                size: new CVal(new Point(0.08), "sizeUnit")
            }
        },

        action:
        {
            label:
            {
                pos: new CVal(new Point(0.5, 0.525), "size"),
                rot: -0.2007, // radians = ~11,5 degrees
                fontSize: new CVal(0.1, "sizeUnit"),
                strokeWidth: new CVal(0.01, "sizeUnit")
            },

            illu:
            {
                pos: new CVal(new Point(0.5, 0.313), "size"),
                rot: -0.2007,
                size: new CVal(new Point(0.425), "sizeUnit")
            },

            desc:
            {
                pos: new CVal(new Point(0.525, 0.71), "size"),
                rot: -0.22689,
                fontSize: new CVal(0.07, "sizeUnit"),
                textBoxSize: new CVal(new Point(0.7, 0.33), "size")
            }
        }
    },
}

autoLoadFontCSS(CONFIG);

export default CONFIG