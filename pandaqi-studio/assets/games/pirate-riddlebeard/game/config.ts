import Point from "js/pq_games/tools/geometry/point";

const CONFIG =
{
    configKey: "pirateRiddlebeardConfig",
    size: new Point(297*3.8, 210*3.8),
    assetsBase: '/pirate-riddlebeard/assets/',
    assets:
    {
        elements:
        {
            path: "elements.png",
            frames: new Point(8,8),
        },
    
        icons:
        {
            path: "icons.png",
            frames: new Point(8,4),
        },

        hint_icons:
        {
            path: "hint_icons.png",
            frames: new Point(15,1),
        },
    
        hint_card:
        {
            path: "hint_card.png"
        }
    }
}

export default CONFIG;