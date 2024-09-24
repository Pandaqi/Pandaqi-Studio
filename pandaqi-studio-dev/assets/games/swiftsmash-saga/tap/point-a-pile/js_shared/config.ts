import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig"
import { GridSizePreset } from "js/pq_games/tools/generation/materialGenerator";
import Point from "js/pq_games/tools/geometry/point"
import autoLoadFontCSS from "js/pq_games/website/autoLoadFontCSS";
import { CardType, ColorType } from "./dict";

const CONFIG:any = 
{
    debug:
    {
        omitFile: true, // @DEBUGGING (should be false)
        singleDrawPerType: true, // @DEBUGGING (should be false)
        onlyGenerate: true, // @DEBUGGING (should be false)
    },

    configKey: "pointAPileConfig",
    fileName: "[Material] Point-a-Pile",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",
    pageSize: "a4",

    fonts:
    {
        heading: "auntbertha",
        body: "amaranth",
    },

    sets:
    {
        base: true,
        pointAPolice: false,
        completeAMission: false,
        dontATouchme: false,
        waitAMinute: false
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

        misc:
        {
            path: "misc.webp",
            frames: new Point(4,4)
        },

    },

    rulebook:
    {
        
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
            base: 35,
            pointAPolice: 15,
            completeAMission: 10,
            waitAMinute: 15,
            dontATouchme: 10
        },

        colorDist:
        {
            [ColorType.RED]: 0.3,
            [ColorType.GREEN]: 0.3,
            [ColorType.BLUE]: 0.2,
            [ColorType.PURPLE]: 0.2
        }
    },

    cards:
    {
        drawerConfig:
        {
            preset: GridSizePreset.CARD
        },
    },
}

autoLoadFontCSS(CONFIG);

export default CONFIG