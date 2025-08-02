import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig";
import CVal from "js/pq_games/tools/generation/cval";
import Point from "js/pq_games/tools/geometry/point";
import Bounds from "js/pq_games/tools/numbers/bounds";

export const CONFIG_SHARED =
{
    _rulebook:
    {
        examples:
        {
            "turn-smallseat":
            {
                buttonText: "Give me an example round!",
                simulator:
                {
                    callbackInitStats,
                    callbackFinishStats,
                }
            },

            "turn-kingseat":
            {
                buttonText: "Give me an example round!",
                simulator:
                {
                    callbackInitStats,
                    callbackFinishStats,
                }
            },

            "turn-queenseat":
            {
                buttonText: "Give me an example round!",
                simulator:
                {
                    callbackInitStats,
                    callbackFinishStats,
                }
            },

            "turn-kaizerseat":
            {
                buttonText: "Give me an example round!",
                simulator:
                {
                    callbackInitStats,
                    callbackFinishStats,
                }
            }
        },

        icons:
        {
            smallseat:
            {
                config:
                {
                    sheetURL: "crests_full.webp",
                    sheetWidth: 6,
                    base: "/throneless-games/conquer/smallseat/assets/",
                },
                icons:
                {
                    "karate-chicks": { frame: 0 },
                    pricklypettes: { frame: 1 },
                    sleepersippies: { frame: 2 },
                    "chewy-carrots": { frame: 3 },
                    "tree-of-hainut": { frame: 4 },
                    curlysnouts: { frame: 5 },
                    tinybears: { frame: 6 },
                    purplepaws: { frame: 7 },
                    ottermother: { frame: 8 },
                    sealalater: { frame: 9 },
                    snufflesniff: { frame: 10 },
                    poinytailors: { frame: 11 }
                }
            },

            kingseat:
            {
                config:
                {
                    sheetURL: "crests_full.webp",
                    sheetWidth: 6,
                    base: "/throneless-games/conquer/kingseat/assets/",
                },
                icons:
                {
                    lionsyre: { frame: 0 },
                    slydefox: { frame: 1 },
                    woolfhall: { frame: 2 },
                    hornseeker: { frame: 3 },
                    brownbeards: { frame: 4 },
                    monarchrys: { frame: 5 },
                    crassclamps: { frame: 6 },
                    gulliballistas: { frame: 7 },
                    "hardshell-hero": { frame: 8 },
                    squlofish: { frame: 9 },
                    smugwing: { frame: 10 },
                    "salsa-salamanda": { frame: 11 }
                }
            },

            queenseat:
            {
                config:
                {
                    sheetURL: "crests_full.webp",
                    sheetWidth: 6,
                    base: "/throneless-games/conquer/queenseat/assets/",
                },
                icons:
                {
                    "stingers-hive": { frame: 0 },
                    "galloping-sun": { frame: 1 },
                    trunktrumpets: { frame: 2 },
                    featherdancer: { frame: 3 },
                    "whistley-wine": { frame: 4 },
                    "edibus-eggsnatcher": { frame: 5 },
                    "feared-flame": { frame: 6 },
                    "eyrie-feyle": { frame: 7 },
                    "chattered-fins": { frame: 8 },
                    galaksea: { frame: 9 },
                    venomfruit: { frame: 10 },
                    colorcoats: { frame: 11 }
                }
            },

            kaizerseat:
            {
                config:
                {
                    sheetURL: "crests_full.webp",
                    sheetWidth: 6,
                    base: "/throneless-games/conquer/kaizerseat/assets/",
                },
                icons:
                {
                    solongnecks: { frame: 0 },
                    "boardom-thieves": { frame: 1 },
                    "longsword-fins": { frame: 2 },
                    atheneyes: { frame: 3 },
                    gallopeers: { frame: 4 },
                    candlesticks: { frame: 5 },
                    taredtula: { frame: 6 },
                    "sonar-and-sons": { frame: 7 },
                    "sirens-of-seatongue": { frame: 8 },
                    cracktapus: { frame: 9 },
                    ravenletters: { frame: 10 },
                    twistertoots: { frame: 11 }
                }
            },
        }
    },

    
    
    
    set: "starter", // (used to be called premadePacks on Kingseat v1)
    packs: [],
    highLegibility: true,

    fonts: 
    {
        heading: "unifraktur",
        text: "modernefraktur",
        textLegible: "brygada",
        slogan: "gothic"
    },

    assets: 
    {
        crests_full: 
        {
            path: "crests_full.webp",
            frames: new Point(6, 2), // @NOTE: used to be (12,1) on Kingseat
        },

        crests_simple: 
        {
            path: "crests_simplified.webp",
            frames: new Point(6, 2)
        },

        unifraktur: 
        {
            path: "/throneless-games/assets/fonts/UnifrakturCook-Bold.woff2",
            useAbsolutePath: true
        },

        modernefraktur: 
        {
            path: "/throneless-games/assets/fonts/ModerneFraktur.woff2",
            useAbsolutePath: true
        },

        gothic: 
        {
            path: "/throneless-games/assets/fonts/GothicUltraOT.woff2",
            useAbsolutePath: true
        },

        brygada: 
        {
            path: "/throneless-games/assets/fonts/Brygada1918-Regular.woff2",
            useAbsolutePath: true
        },

        brygada_italic: 
        {
            key: "brygada",
            path: "/throneless-games/assets/fonts/Brygada1918-Italic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC }),
            useAbsolutePath: true
        },

        brygada_bold: 
        {
            key: "brygada",
            path: "/throneless-games/assets/fonts/Brygada1918-Bold.woff2",
            textConfig: new TextConfig({ weight: TextWeight.BOLD }),
            useAbsolutePath: true
        },

        gradient_overlay: 
        {
            path: "/throneless-games/assets/gradient_overlay.webp",
            useAbsolutePath: true
        },

        kingseat_icon: 
        {
            path: "/throneless-games/assets/kingseat_icon.webp",
            useAbsolutePath: true
        },

        multicolor_bg: 
        {
            path: "/throneless-games/assets/multicolor_bg.webp",
            frames: Point.ONE,
            useAbsolutePath: true
        },

        decoration_icons: 
        {
            path: "/throneless-games/assets/decoration_icons.webp",
            frames: new Point(2,1),
            useAbsolutePath: true
        }
    },

    generation:
    {
        numRegularCardsPerPack: 9,
        numDarkCardsPerOption: 1,
    },

    rulebook:
    {
        numPlayerBounds: new Bounds(4,6),
        itemSize: new Point(375, 525),
        swapProbability: 0.4,

        roundWinRule: "mostVotes", // "mostVotes" or "longestSequence"
        roundWinTieBreaker: "distToKingseat",
    },

    cards: 
    {
        addShadowToSigil: true, // @DEBUGGING; should be TRUE (but is very slow, hence turned off if I want to be fast with updates)
        drawerConfig: 
        { 
            autoStroke: true,
            sizeElement: new Point(1, 1.55),
            size:
            {
                small: new Point(4,4),
                regular: new Point(3,3),
                large: new Point(2,2)
            }
        },

        name:
        {
            fontSize: new CVal(0.1285, "sizeUnit"),
        },

        slogan:
        {
            fontSize: new CVal(0.0533, "sizeUnit")
        },

        actionText:
        {
            fontSize:
            {
                text: new CVal(0.063, "sizeUnit"),
                textLegible: new CVal(0.063, "sizeUnit")
            }
        }
    }
}