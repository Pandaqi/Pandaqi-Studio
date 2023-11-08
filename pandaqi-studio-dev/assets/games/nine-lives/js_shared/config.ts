import Point from "js/pq_games/tools/geometry/point"

const CONFIG = 
{
    debugWithoutFile: true, // @DEBUGGING (should be false)
    debugSingleCard: true, // @DEBUGGING (should be false)
    debugOnlyGenerate: true, // @DEBUGGING (should be false)

    configKey: "nineLivesConfig",
    fileName: "[Material] Nine Lives",
    resLoader: null,

    // set through user config on page
    inkFriendly: false,
    includeLifeCards: true,
    includeCatCards: true,
    cardSize: "regular",
    
    fonts:
    {
        heading: "puss",
        body: "catcafe"
    },

    // assets
    assetsBase: "/nine-lives/assets/",
    assets:
    {
        puss:
        {
            path: "fonts/puss.woff2"
        },

        catcafe:
        {
            path: "fonts/catcafe.woff2"
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(9,1)
        },

        cats:
        {
            path: "cats.webp",
            frames: new Point(8,1),
        },

        powers:
        {
            path: "powers.webp",
            frames: new Point(16,1),
        },
    },

    // how generation/balancing happens
    generation:
    {
        numberCards:
        {

        },

        lifeCards:
        {
            num: 6 * 9, // max 6 players, 9 per player
        }
    },

    // how to draw/layout cards (mostly visually)
    cards:
    {
        dims: { 
            small: new Point(4,4),
            regular: new Point(3,3),
            huge: new Point(2,2)
        },
        dimsElement: new Point(1, 1.4),
        size: new Point(),
        
        shared:
        {

        },

        bgCats:
        {
            patternExtraMargin: 0.2, // relative to card Y, extra margin at edge to make sure no empty space when rotated   
            patternNumIcons: 12, // again, Y-axis
            patternIconSize: 0.8, // relative to full space reserved for icon (1.0)

            patternAlpha: 0.2,
            patternRotation: -0.166*Math.PI, // = 30 degrees tilt
            patternAlphaInkFriendly: 0.1
        },

        bgHearts:
        {
            patternRotation: -0.166*Math.PI
        },

        cats:
        {
            positionOffset: 0.5,
            positions:
            [
                [], // 0 icons
                [Point.ZERO], // 1 icon
                [new Point(-1, -1), new Point(1, 1)], // 2 icons
                [new Point(-1, -1), Point.ZERO, new Point(1, 1)], // 3 icons
                [new Point(-1, -1), new Point(1, -1), new Point(-1, 1), new Point(1, 1)], // 4 icons
                [new Point(-1, -1), new Point(1, -1), Point.ZERO, new Point(-1, 1), new Point(1, 1)], // 5 icons
                [new Point(-1, -1), new Point(1, -1), new Point(-1, 0), new Point(1, 0), new Point(-1, 1), new Point(1, 1)], // 6 icons
                [new Point(-1, -1), new Point(1, -1), new Point(-1, 0), Point.ZERO, new Point(1, 0), new Point(-1, 1), new Point(1, 1)], // 7 icons
                [new Point(-1, -1), new Point(0, -1), new Point(1, -1), new Point(-1, 0), new Point(1, 0), new Point(-1, 1), new Point(0, 1), new Point(1, 1)],
                [new Point(-1, -1), new Point(0, -1), new Point(1, -1), new Point(-1, 0), Point.ZERO, new Point(1, 0), new Point(-1, 1), new Point(0, 1), new Point(1, 1)]
            ],
            iconSize: 0.2, // ~sizeUnit
            simplifiedIconSize: 0.1, // ~sizeUnit
            simplifiedIconOffset: new Point(0.05, 0.05), // ~sizeUnit
        },

        life:
        {
            bgColor: "#7C0600", // @TODO
            heartPosY: 0.66, // ~sizeY
            heartSize: 1.2, // ~sizeUnit, should be above 1.0 by a good amount
            heartCornerSize: 0.1, // ~sizeUnit
            heartCornerOffset: 1.2, // ~half size of corner heart

            cardRectY: 0.15, // ~sizeY
            cardRectSize: new Point(0.3, 0.15), // ~sizeUnit
            cardRectBevel: 0.15, // ~rectSizeUnit
            cardRectStrokeWidth: 0.025, // ~sizeUnit
            cardRectIconSize: 0.9, // ~rectY
            cardRectIconXSpacing: 0.65, // ~rectIconX (cards are portrait, so their actual width is smaller than the square frame, compensate for that)

            fontSize: 0.075, // ~sizeUnit
            textOffsetFromCenter: 0.25, // ~sizeY
            textStrokeWidth: 0.05, // ~sizeUnit
            lifeCardTextAlpha: 0.5,
        },

        powers:
        {
            iconSize: 0.25, // ~sizeUnit
        },

        outline:
        {
            size: 0.025, // relative to sizeUnit
            color: "#000000"
        }
    }
}

export default CONFIG