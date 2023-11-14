import Point from "js/pq_games/tools/geometry/point"

const CONFIG = 
{
    debugWithoutFile: false, // @DEBUGGING (should be false)
    debugSingleCard: false, // @DEBUGGING (should be false)
    debugOnlyGenerate: false, // @DEBUGGING (should be false)

    configKey: "nineLivesConfig",
    fileName: "[Material] Nine Lives",

    // set through user config on page
    inkFriendly: false,
    includeLifeCards: true,
    includeCatCards: true,
    cardSize: "regular",
    limitedPowers: true,
    
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
            frames: new Point(10,1)
        },

        cats:
        {
            path: "cats.webp",
            frames: new Point(8,1),
        },

        powers:
        {
            path: "powers.webp",
            frames: new Point(8,3),
        },
    },

    // how generation/balancing happens
    generation:
    {
        numberCards:
        {
            num: 45, // a hard threshold for the number deck which we try to reach exactly
            includeAllCombosUntil: 3,
            maxCatsOnComboCard: 6,
            maxCatsOnRegularCard: 9,
            highComboFalloff: 2.5, // how quickly we reduce the number of cards for higher and higher numbers
        },

        lifeCards:
        {
            num: 5 * 9, // max 5 players, 9 per player
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
            shadowOffset: new Point(0.0175, 0.0175),
            shadowColor: "#00000099"
        },

        bgCats:
        {
            patternExtraMargin: 0.2, // relative to card Y, extra margin at edge to make sure no empty space when rotated   
            patternNumIcons: 12, // again, Y-axis
            patternIconSize: 0.8, // relative to full space reserved for icon (1.0)

            patternAlpha: 0.125,
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
            iconSize: 0.25, // ~sizeUnit
            simplifiedIconSize: 0.08, // ~sizeUnit
            simplifiedIconOffset: new Point(0.05, 0.05), // ~sizeUnit
        },

        life:
        {
            bgColor: "#7C0600",
            heartPosY: 0.533, // ~sizeY
            heartSize: 1.4, // ~sizeUnit, should be above 1.0 by a good amount
            heartCornerSize: 0.175, // ~sizeUnit
            heartCornerOffset: 1.4, // ~half size of corner heart

            cardRectY: 0.08, // ~sizeY
            cardRectSize: new Point(0.315, 0.135), // ~sizeUnit
            cardRectBevel: 0.15, // ~rectSizeUnit
            cardRectStrokeWidth: 0.0075, // ~sizeUnit
            cardRectIconSize: 0.9, // ~rectY
            cardRectIconXSpacing: 0.675, // ~rectIconX (cards are portrait, so their actual width is smaller than the square frame, compensate for that)

            fontSize: 0.075, // ~sizeUnit
            textOffsetFromCenter: 0.175, // ~sizeY
            textStrokeWidth: 0.005, // ~sizeUnit
            lifeCardTextAlpha: 0.5,
            lifeCardFontSizeFactor: 0.85,
        },

        powers:
        {
            iconSize: 0.33, // ~sizeUnit
            textStrokeWidth: 0.01, // ~sizeUnit, only used for ONE power right now (that shows a NUMBER)
            glowAroundIcons:
            {
                blur: 0.05, //~iconSize
                color: "#FFFFFF"
            },
            shapeshift:
            {
                iconSize: 0.775, // ~iconSize normal
            },
            numbershift:
            {
                iconSize: 0.775, // ~iconSize normal
            }
        },

        outline:
        {
            size: 0.025, // relative to sizeUnit
            color: "#000000"
        }
    }
}

export default CONFIG