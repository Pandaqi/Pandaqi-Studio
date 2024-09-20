import Point from "js/pq_games/tools/geometry/point"

const CONFIG = 
{
    configKey: "timelyTransportsConfig",
    assetsBase: "/timely-transports/assets/",
    assets:
    {
        rowdies:
        {
            path: "fonts/Rowdies-Regular.woff2"
        },

        inbetween_space:
        {
            path: "inbetween_space.png"
        },

        rules_overview:
        {
            path: "rules_overview.webp"
        },

        city:
        {
            path: "city.png"
        },

        cities:
        {
            path: "cities.webp",
            frames: new Point(8,1)
        },

        airport:
        {
            path: "airport.png"
        },

        airplane_tile_sprite:
        {
            path: "airplane_tile_sprite.png"
        },

        seaprintfriendly:
        {
            path: "seaprintfriendly.png"
        },

        forest:
        {
            path: "forest.webp",
            frames: new Point(4,1)
        },

        forest_printfriendly:
        {
            path: "forest_printfriendly.webp",
            frames: new Point(4,1)
        },

        goods:
        {
            path: "goods.webp",
            frames: new Point(8,1)
        },

        searoutes:
        {
            path: "searoutes.png",
            frames: new Point(4,1)
        },

        searoutes_printfriendly:
        {
            path: "searoutes_printfriendly.png",
            frames: new Point(4,1)
        },

        landroutes:
        {
            path: "landroutes.png",
            frames: new Point(4,1)
        },

        railroutes:
        {
            path: "railroutes.png",
            frames: new Point(4,1)
        }
    }
}

export default CONFIG