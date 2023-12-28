import Point from "js/pq_games/tools/geometry/point";
import Bounds from "js/pq_games/tools/numbers/bounds";

const CONFIG = 
{
    playerSize: 40,
    itemSize: 20,
    playerTradeRange: 100,
    itemGrabRange: 25,
    numItems: new Bounds(5, 10),

    phaser:
    {
        enabled: true,
        size: new Point(1920, 1080),

        userNameTextConfig:
        {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 12,
            align: 'center'
        }
    },

    assets:
    {
        // @TODO: assets to preload in phaser
    }
}

export default CONFIG;