import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig";
import CVal from "js/pq_games/tools/generation/cval";
import Point from "js/pq_games/tools/geometry/point";
import Bounds from "js/pq_games/tools/numbers/bounds";

const CONFIG_SHARED =
{
    fonts:
    {
        body: "dejavu"
    },

    assets:
    {
        dejavu:
        {
            key: "dejavu",
            path: "/maybe-games/assets/fonts/DejaVuSansCondensed.woff2",
            useAbsolutePath: true
        },

        dejavu_bold:
        {
            key: "dejavu",
            path: "/maybe-games/assets/fonts/DejaVuSansCondensed-Bold.woff2",
            useAbsolutePath: true,
            textConfig: new TextConfig({ weight: TextWeight.BOLD })
        },

        dejavu_italic:
        {
            key: "dejavu",
            path: "/maybe-games/assets/fonts/DejaVuSansCondensed-Oblique.woff2",
            useAbsolutePath: true,
            textConfig: new TextConfig({ style: TextStyle.ITALIC })
        },

        dejavu_bold_italic:
        {
            key: "dejavu",
            path: "/maybe-games/assets/fonts/DejaVuSansCondensed-BoldOblique.woff2",
            useAbsolutePath: true,
            textConfig: new TextConfig({ weight: TextWeight.BOLD, style: TextStyle.ITALIC })
        },
    },

    rulebook:
    {
        cardSize: new Point(375, 525),
        numPlayerBounds: new Bounds(3,5)
    },

    cards:
    {
        drawerConfig:
        {
            autoStroke: true,
            sizeElement: new Point(1, 1.4),
            size: { 
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
            autoStroke: true,
            sizeElement: new Point(1, 1.4),
            size: { 
                small: new Point(6,6),
                regular: new Point(5,5),
                large: new Point(4,4)
            },  
        },
    },
}

export default CONFIG_SHARED