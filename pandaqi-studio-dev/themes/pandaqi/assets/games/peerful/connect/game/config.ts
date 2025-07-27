import { Bounds, Vector2 } from "lib/pq-games";

export default 
{
    playerSize: 40,
    itemSize: 20,
    maxBackpackSize: 5,
    playerTradeRange: 100,
    itemGrabRange: 25,
    defaultItemDuration: 30, // seconds
    numItems: new Bounds(5, 10),

    phaser:
    {
        enabled: true,
        size: new Vector2(1920, 1080),

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
        // @TODO: fonts to preload as well; then reuse in phaser configs above
    }
}