import TextConfig, { TextWeight } from "js/pq_games/layout/text/textConfig";
import CVal from "js/pq_games/tools/generation/cval";
import Point from "js/pq_games/tools/geometry/point";

export default
{
    debug:
    {
        omitFile: true, // @DEBUGGING (should be false)
        singleDrawPerType: true, // @DEBUGGING (should be false)
        onlyGenerate: true, // @DEBUGGING (should be false)
    },

    configKey: "bunnyBiddingConfig",
    fileName: "[Material] Bunny Bidding",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",

    sets:
    {
        base: true,
        special: false,
        powers: false
    },

    fonts:
    {
        heading: "gargle",
        body: "gargle"
    },

    // assets
    assetsBase: "/easter-eggventures/play/bunny-bidding/assets/",
    assets:
    {
        gargle:
        {
            key: "gargle",
            path: "/easter-eggventures/assets/fonts/GargleRg-Regular.woff2",
            useAbsolutePath: true
        },

        gargle_bold:
        {
            key: "gargle",
            path: "/easter-eggventures/assets/fonts/GargleRg-Bold.woff2",
            useAbsolutePath: true,
            textConfig: new TextConfig({ weight: TextWeight.BOLD })
        },
        
        eggs:
        {
            path: "eggs.webp",
            frames: new Point(8,1)
        },

        eggs_backgrounds:
        {
            path: "eggs_backgrounds.webp",
            frames: new Point(8,1)
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(8,1)
        },

        powers:
        {
            path: "powers.webp",
            frames: new Point(8,2)
        },

        actions:
        {
            path: "actions.webp",
            frames: new Point(8,3)
        }
    },

    generation:
    {
        specialEggInterval: 4, // on numbers 1-99, this means we get ~25 unique numbers for special eggs
        maxEggNumber: 99,
        numUniqueEggs: 6,
        defaultFrequencies:
        {
            regularEgg: 10,
            specialEgg: 1
        }
    },
    
    tiles:
    {
        drawerConfig:
        {
            autoStroke: true,
            dimsElement: new Point(1, 1),
            dims: 
            { 
                small: new Point(5,7),
                regular: new Point(3,5),
                large: new Point(2,3)
            },
        }, 

        text:
        {
            fontSize: new CVal(0.05, "sizeUnit"),
            translate: new CVal(new Point(0.5, 0.75), "size"),
            dims: new CVal(new Point(0.9, 0.25), "size"),
            bgDims: new CVal(new Point(0.95), "sizeUnit")
        },

        eggNumber:
        {
            fontSize: new CVal(0.1, "sizeUnit"),
            edgeOffset: new CVal(0.066, "sizeUnit"),
            spriteDims: new CVal(0.2, "sizeUnit"),
            spriteOffset: new CVal(new Point(), "size") // @TODO?
        },

        bg:
        {
            gradientAlpha: 0.5,
            lightraysAlpha: 0.2,
            lightraysComposite: "overlay"
        },

        illu:
        {
            glowRadius: new CVal(0.1, "sizeUnit"),
            glowColor: "#FFFFFF",
            offsetWhenTextPresent: new CVal(0.1, "sizeUnit")
        },

        typeText:
        {
            fontSize: new CVal(0.05, "sizeUnit"),
            edgeOffset: new CVal(new Point(0, 0.5), "sizeUnit"),
            alpha: 1.0,
            composite: "overlay"
        }
    }
}