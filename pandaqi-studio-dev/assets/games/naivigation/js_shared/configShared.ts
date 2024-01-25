import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig"
import Point from "js/pq_games/tools/geometry/point"

const CONFIG_NAIVIGATION_SHARED = 
{
    // All Naivigation games use the same two "main fonts"
    // Each one can also, however, have one "special" font (defined in its own config),
    // that is more thematic and used only in THAT game
    fonts:
    {
        heading: "ambery",
        body: "k2d"
    },

    // assets
    // these links are absolute, so we can keep using relative links all throughout the specific games
    // but this shit will still load fine for all
    assets:
    {
        ambery:
        {
            path: "/naivigation/assets/fonts/AmberyGarden-Regular.woff2",
            useAbsolutePath: true
        },

        k2d:
        {
            path: "/naivigation/assets/fonts/K2D-Regular.woff2",
            useAbsolutePath: true
        },

        k2d_bold:
        {
            key: "k2d",
            path: "/naivigation/assets/fonts/K2D-ExtraBold.woff2",
            useAbsolutePath: true,
            textConfig: new TextConfig({ weight: TextWeight.BOLD })
        },

        k2d_italic:
        {
            key: "k2d",
            path: "/naivigation/assets/fonts/K2D-Italic.woff2",
            useAbsolutePath: true,
            textConfig: new TextConfig({ style: TextStyle.ITALIC })
        }
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

    tiles:
    {
        drawerConfig:
        {
            autoStroke: true,
            dimsElement: new Point(1, 1),
            dims: 
            { 
                small: new Point(7,10),
                regular: new Point(5,7),
                large: new Point(3,5)
            },
        }, 

        generation:
        {
            numUniqueVehicles: 2
        }
    }
}

export default CONFIG_NAIVIGATION_SHARED