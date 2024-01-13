import TextConfig, { TextWeight } from "js/pq_games/layout/text/textConfig"
import Point from "js/pq_games/tools/geometry/point"

const CONFIG = 
{
    debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    configKey: "theGameOfHappinessConfig",
    fileName: "[Material] The Game of Happiness",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",
    packs: {},

    includeCards: true,
    includeTokens: true,
    digitalGame: false,

    fonts:
    {
        heading: "sunny",
        body: "minya"
    },

    // assets
    assetsBase: "/the-game-of-happiness/assets/",
    assets:
    {
        sunny:
        {
            path: "fonts/SunnySpells-Regular.woff2"
        },

        minya:
        {
            path: "fonts/MinyaNouvelle-Regular.woff2"
        },

        minya_bold:
        {
            key: "minya",
            path: "fonts/MinyaNouvelle-Bold.woff2",
            textConfig: new TextConfig({ weight: TextWeight.BOLD })
        },

        categories:
        {
            path: "categories.webp",
            frames: new Point(10,1),
        },

        tintable_templates:
        {
            path: "tintable_templates.webp",
            frames: new Point(2,1)
        }
    },

    // how generation/balancing happens
    generation:
    {

    },

    digital:
    {
        numCards: 5,
        totalRounds: 10,
        pickOneCardPerCategory: true
    },

    // how to draw/layout cards (mostly visually)
    cards:
    {
        drawerConfig:
        {
            dimsElement: new Point(1, 1.4),
            dims: 
            { 
                small: new Point(5,5),
                regular: new Point(4,4),
                large: new Point(3,3)
            },
        }, 

        tokenConfig:
        {
            dimsElement: new Point(1,1),
            dims: 
            {
                small: new Point(8,8),
                regular: new Point(6,6),
                large: new Point(4,4)
            }
        },
        
        shared:
        {
           
        },

        category:
        {
            iconSize: 0.12, // ~sizeUnit
            iconSizeBig: 0.3, // ~sizeUnit
            bigIconYPos: 0.225, // ~sizeY
            iconOffset: new Point(0.075, 0.18), // ~sizeUnit
        },

        text:
        {
            fontSize: { large: 0.125, medium: 0.105, small: 0.85 }, // ~sizeUnit
            fontSizeCutoffs: { large: 50, medium: 90, small: 130 },
            dims: new Point(0.9, 0.75), // ~size
        },

        textMeta:
        {
            fontSize: 0.04, // ~sizeUnit
            yPos: 0.0285, // ~sizeUnit
            textBlockWidth: 0.866, // ~sizeX
        },

        token:
        {
            iconSize: 0.75, // ~sizeUnit
            fontSize: 0.75, // ~sizeUnit
        },

        outline:
        {
            size: 0.025, // relative to sizeUnit
            color: "#000000"
        },
    }
}

export default CONFIG