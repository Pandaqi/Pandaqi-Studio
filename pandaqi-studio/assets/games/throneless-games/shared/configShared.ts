import { Vector2, TextConfig, TextStyle, TextWeight, Bounds, CVal } from "lib/pq-games";

export const CONFIG_SHARED =
{
    _resources:
    {
        // every project merges its own `_resources.base` on top of this
        files:
        {
            crests_full: 
            {
                path: "crests_full.webp",
                frames: new Vector2(6, 2), // @NOTE: used to be (12,1) on Kingseat
            },

            crests_simple: 
            {
                path: "crests_simplified.webp",
                frames: new Vector2(6, 2)
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
                frames: Vector2.ONE,
                useAbsolutePath: true
            },

            decoration_icons: 
            {
                path: "/throneless-games/assets/decoration_icons.webp",
                frames: new Vector2(2,1),
                useAbsolutePath: true
            }
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
        itemSize: new Vector2(375, 525),
        swapProbability: 0.4,

        roundWinRule: "mostVotes", // "mostVotes" or "longestSequence"
        roundWinTieBreaker: "distToKingseat",
    },

    _material:
    {
        cards:
        {
            itemSize: new Vector2(375, 525),
            mapper: 
            { 
                autoStroke: true,
                sizeElement: new Vector2(1, 1.55),
                size:
                {
                    small: new Vector2(4,4),
                    regular: new Vector2(3,3),
                    large: new Vector2(2,2)
                }
            },
        }
    },

    _drawing:
    {
        fonts: 
        {
            heading: "unifraktur",
            text: "modernefraktur",
            textLegible: "brygada",
            slogan: "gothic"
        },

        cards: 
        {
            addShadowToSigil: true, // @DEBUGGING; should be TRUE (but is very slow, hence turned off if I want to be fast with updates)

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
    },
}
