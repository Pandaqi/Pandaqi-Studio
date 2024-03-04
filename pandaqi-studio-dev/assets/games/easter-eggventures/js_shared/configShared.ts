import TextConfig, { TextWeight } from "js/pq_games/layout/text/textConfig";
import CVal from "js/pq_games/tools/generation/cval";
import Point from "js/pq_games/tools/geometry/point";

const CONFIG_SHARED =
{
    fonts:
    {
        heading: "gargle",
        body: "gargle"
    },

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
            path: "/easter-eggventures/assets/images/eggs.webp",
            useAbsolutePath: true,
            frames: new Point(8,1)
        },

        eggs_backgrounds:
        {
            path: "/easter-eggventures/assets/images/eggs_backgrounds.webp",
            useAbsolutePath: true,
            frames: new Point(8,1)
        },

        misc:
        {
            path: "/easter-eggventures/assets/images/misc.webp",
            useAbsolutePath: true,
            frames: new Point(8,1)
        },

        pawns:
        {
            path: "/easter-eggventures/assets/images/pawns.webp",
            useAbsolutePath: true,
            frames: new Point(8,1)
        },
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
            fontSize: new CVal(0.07, "sizeUnit"),
            translate: new CVal(new Point(0.5, 0.775), "size"),
            dims: new CVal(new Point(0.875, 0.33), "size"),
            bgDims: new CVal(new Point(0.975), "sizeUnit")
        },

        
        bg:
        {
            gradientAlpha: 0.5,
            lightraysAlpha: 0.2,
            randomPatternAlpha: 0.175,
            lightraysComposite: "overlay"
        },

        illu:
        {
            dims: new CVal(new Point(0.8), "sizeUnit"),
            dimsWithText: new CVal(new Point(0.65), "sizeUnit"),
            offsetWhenTextPresent: new CVal(0.166, "sizeUnit"),
            glowRadius: new CVal(0.066, "sizeUnit"),
            glowColor: "#FFFFFF",
            
        },

        typeText:
        {
            fontSize: new CVal(0.05, "sizeUnit"),
            edgeOffsetY: new CVal(0.05, "sizeUnit"),
            alpha: 1.0,
            composite: "overlay"
        }
    }
}

export default CONFIG_SHARED