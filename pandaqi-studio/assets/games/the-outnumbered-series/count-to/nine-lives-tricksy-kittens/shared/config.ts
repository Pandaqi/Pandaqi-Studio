import Point from "js/pq_games/tools/geometry/point"

export const CONFIG = 
{
    _settings:
    {
        includePowers:
        {
            type: SettingType.CHECK,
            label: "Include Powers",
            default: true,
            remark: "Remove them if you're sure you never want to play with them."
        },

        suits:
        {
            type: SettingType.MULTI,
            values: ["hearts", "spades", "diamonds", "clubs", "hourglasses", "cups", "stars", "cats", "crowns"],
            default: ["hearts", "spades", "diamonds", "clubs"],
            label: "Suits",
        },
    },

    debugWithoutFile: false, // @DEBUGGING (should be false)
    debugSingleCard: false, // @DEBUGGING (should be false)
    debugOnlyGenerate: false, // @DEBUGGING (should be false)

    configKey: "nineLivesTricksyKittensConfig",
    fileName: "Nine Lives: Tricksy Kittens",

    // set through user config on page
    inkFriendly: false,
    includePowers: true,
    itemSize: "regular",
    pageSize: "a4",
    suits: {},
    
    fonts:
    {
        heading: "puss",
        body: "catcafe"
    },

    // assets
    assetsBase: "/the-outnumbered-series/count-to/nine-lives-tricksy-kittens/assets/",
    assets:
    {
        puss:
        {
            path: "/the-outnumbered-series/count-to/nine-lives/assets/fonts/puss.woff2",
            useAbsolutePath: true
        },

        catcafe:
        {
            path: "/the-outnumbered-series/count-to/nine-lives/assets/fonts/catcafe.woff2",
            useAbsolutePath: true
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(4,1)
        },

        suits:
        {
            path: "suits.webp",
            frames: new Point(9,1)
        },

        cats:
        {
            path: "cats.webp",
            frames: new Point(9,1),
        },
    },

    // how generation/balancing happens
    generation:
    {
        numbers: [1,2,3,4,5,6,7,8,9],
        cardsPerNumber: 1,
        numbersWithoutPower: [9]
    },

    // how to draw/layout cards (mostly visually)
    cards:
    {
        size: { 
            small: new Point(4,4),
            regular: new Point(3,3),
            large: new Point(2,2)
        },
        sizeElement: new Point(1, 1.4),
        sizeResult: new Point(),
        
        shared:
        {
            defaultBGColor: "#FEFEFE",
            shadowColor: "#00000099",
            shadowOffset: 0.01, // ~sizeUnit
            colorLighten: 62.5,
            colorDarken: 10,
        },

        corners:
        {
            fontSize: 0.21, // ~sizeUnit
            offsetText: 1.2, // ~0.5 fontSize
            strokeWidth: 0.075, // ~fontSize

            iconSize: 0.575, // ~fontSize
            offsetIcon: 1.0, //~default distance => (0.5 fontSize + 0.5 iconSize)

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

        illustration:
        {
            offset: 0.7, // ~rectSizeUnit (from powers, see below)
            size: 0.5, // ~sizeUnit (note that this is placed twice, top and bottom (rotated), so higher than 0.5 will surely clip it on Y-axis)
        },

        powers:
        {
            rectSize: new Point(0.8, 0.25), // ~sizeUnit
            rectBevel: 0.1, // ~rectSizeUnit
            rectStrokeWidth: 0.01, // ~sizeUnit
            fontSize: 0.065, // ~sizeUnit
            textPadding: new Point(0.05, 0.05) // ~rectSizeUnit
        },

        outline:
        {
            size: 0.025, // relative to sizeUnit
            color: "#000000"
        }
    }
}