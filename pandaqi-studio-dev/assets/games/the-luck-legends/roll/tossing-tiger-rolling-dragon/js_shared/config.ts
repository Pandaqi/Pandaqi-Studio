import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig"
import Point from "js/pq_games/tools/geometry/point"

const CONFIG:any = 
{
    debug:
    {
        omitFile: true, // @DEBUGGING (should be false)
        singleDrawPerType: true, // @DEBUGGING (should be false)
        onlyGenerate: true, // @DEBUGGING (should be false)
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
            frames: new Point(4,1)
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(8,1)
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
    },
}

export default CONFIG