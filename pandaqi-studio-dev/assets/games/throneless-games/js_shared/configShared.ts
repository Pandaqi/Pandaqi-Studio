import CVal from "js/pq_games/tools/generation/cval";
import Point from "js/pq_games/tools/geometry/point";

const CONFIG_SHARED =
{
    inkFriendly: false,
    itemSize: "regular",
    pageSize: "a4",
    set: "", // (used to be called premadePacks on Kingseat v1)
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
            url: "/throneless-games/assets/fonts/UnifrakturCook-Bold.woff2",
            useAbsolutePath: true
        },

        modernefraktur: 
        {
            url: "/throneless-games/assets/fonts/ModerneFraktur.woff2",
            useAbsolutePath: true
        },

        gothic: 
        {
            url: "/throneless-games/assets/fonts/GothicUltraOT.woff2",
            useAbsolutePath: true
        },

        brygada: 
        {
            url: "/throneless-games/assets/fonts/Brygada1918-Regular.woff2",
            useAbsolutePath: true
        },

        gradient_overlay: 
        {
            path: "/throneless-games/assets/gradient_overlay.webp",
            frames: Point.ONE,
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
        numRegularCardsPerPack: 12,
        numDarkCardsPerOption: 1,
    },

    cards: 
    {
        addShadowToSigil: true, // @DEBUGGING; should be TRUE (but is very slow, hence turned off normally)
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
                textLegible: new CVal(0.057, "sizeUnit")
            }
        }
    }
}

export default CONFIG_SHARED;