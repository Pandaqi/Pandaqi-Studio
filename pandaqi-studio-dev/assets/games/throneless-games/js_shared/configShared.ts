import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig";
import CVal from "js/pq_games/tools/generation/cval";
import Point from "js/pq_games/tools/geometry/point";
import Bounds from "js/pq_games/tools/numbers/bounds";

const CONFIG_SHARED =
{
    inkFriendly: false,
    itemSize: "regular",
    pageSize: "a4",
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
        numRegularCardsPerPack: 8,
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
            dimsElement: new Point(1, 1.55),
            dims:
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

export default CONFIG_SHARED;