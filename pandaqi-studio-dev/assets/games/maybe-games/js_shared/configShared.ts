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
    },

    cards:
    {
        drawerConfig:
        {
            dimsElement: new Point(1, 1.4),
            dims: { 
                small: new Point(4,4),
                regular: new Point(3,3),
                large: new Point(2,2)
            },  
        },
    },

    votes:
    {
        drawerConfig:
        {
            dimsElement: new Point(1, 1.4),
            dims: { 
                small: new Point(6,6),
                regular: new Point(5,5),
                large: new Point(4,4)
            },  
        },
    },
}

export default CONFIG_SHARED