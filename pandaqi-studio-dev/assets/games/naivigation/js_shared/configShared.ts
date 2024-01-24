import Point from "js/pq_games/tools/geometry/point"

const CONFIG_NAIVIGATION_SHARED = 
{
    fonts:
    {
        heading: "boblox",
        body: "caveman"
    },

    // assets
    assetsBase: "/naivigation/assets/",
    assets:
    {
        /*boblox:
        {
            path: "fonts/BobloxClassic.woff2"
        },

        caveman:
        {
            path: "fonts/Caveman.woff2"
        },
        */
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