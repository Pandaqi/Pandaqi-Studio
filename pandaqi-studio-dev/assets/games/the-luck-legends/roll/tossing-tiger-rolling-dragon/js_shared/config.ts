import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig"
import CVal from "js/pq_games/tools/generation/cval"
import Point from "js/pq_games/tools/geometry/point"

const CONFIG:any = 
{
    debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    configKey: "tossingTigerRollingDragonConfig",
    fileName: "[Material] Tossing Tiger, Rolling Dragon",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",

    fonts:
    {
        heading: "chineserocks",
        body: "koho"
    },

    sets:
    {
        base: true,
        zooOfMoves: false,
        fightTogether: false,
        dawnDojo: false,
    },

    // assets
    assetsBase: "/the-luck-legends/roll/tossing-tiger-rolling-dragon/assets/",
    assets:
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
            frames: new Point(6,1)
        },

        animals:
        {
            path: "animals.webp",
            frames: new Point(4,5)
        },

        animals_simplified:
        {
            path: "animals_simplified.webp",
            frames: new Point(4,5)
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(4,2)
        },
    },

    rulebook:
    {

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

    cards:
    {
        drawerConfig:
        {
            autoStroke: true,
            dimsElement: new Point(1, 1.4),
            dims: 
            { 
                small: new Point(4,4),
                regular: new Point(3,3),
                large: new Point(2,2)
            }, 
        },

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
            pos: new CVal(new Point(0.5, 0.285), "size"),
            dims: new CVal(new Point(0.65), "sizeUnit"),
            shadowBlur: new CVal(0.01, "sizeUnit"),
        },

        strengths:
        {
            useSimplified: true,
            iconDims: new CVal(new Point(0.17), "sizeUnit"),
            iconAnimalDims: new CVal(new Point(0.08), "sizeUnit"),
            anchorPos: new CVal(new Point(0.5, 0.1), "size"),
            placeAtBottom: true,
            shadowBlur: new CVal(0.0075, "sizeUnit"),

            fontSize: new CVal(0.038, "sizeUnit"),
            textPos: new CVal(new Point(0.5, 0.02), "size")
        },

        action:
        {
            heading:
            {
                fontSize: new CVal(0.08, "sizeUnit"),
                pos: new CVal(new Point(0.5, 0.6), "size"),
                dims: new CVal(new Point(0.85), "sizeUnit"),
                posRooster: new CVal(new Point(0.5, 0.92), "size"),
            },

            fontSize: new CVal(0.0615, "sizeUnit"),
            fontSizeRooster: new CVal(0.05, "sizeUnit"),
            pos: new CVal(new Point(0.5, 0.73), "size"),
            posText: new CVal(new Point(0.5, 0.75), "size"),
            posRooster: new CVal(new Point(0.5, 0.52), "size"), // for the EXTRA box on rooster cards
            textPosRooster: new CVal(new Point(0.5, 0.532), "size"),
            dims: new CVal(new Point(0.9), "sizeUnit"),
            textDims: new CVal(new Point(0.775), "sizeUnit")
        }
    },
}

export default CONFIG