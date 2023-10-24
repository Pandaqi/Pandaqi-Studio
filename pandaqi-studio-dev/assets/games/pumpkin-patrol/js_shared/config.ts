import Point from "js/pq_games/tools/geometry/point"
import Bounds from "js/pq_games/tools/numbers/bounds"
import { Type } from "./dict"

const CONFIG = 
{
    debugWithoutFile: false, // @DEBUGGING (should be false)
    debugSingleCard: false, // @DEBUGGING (should be false)
    debugOnlyGenerate: true, // @DEBUGGING (should be false)

    configKey: "pumpkinPatrolConfig",
    fileName: "[Material] Pumpkin Patrol",
    resLoader: null,

    // set through user config on page
    inkFriendly: false,
    cardSize: "regular",
    cardSet: "starter",

    allCards: {}, // automatically filled with allowed cards during generation

    fonts:
    {
        heading: "carousel",
        body: "dubellay"
    },

    // assets
    assetsBase: "/pumpkin-patrol/assets/",
    assets:
    {
        carousel:
        {
            path: "fonts/Carousel.woff2"
        },

        dubellay:
        {
            path: "fonts/DuBellayItalic.woff2"
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(5,1)
        },

        starter:
        {
            path: "starter.webp",
            frames: new Point(8,2),
            cardSet: true
        },
    },

    // how generation/balancing happens
    generation:
    {
        wildcardKey: "wildcard",
        randomSetSizes:
        {
            [Type.PERSON]: 8,
            [Type.DECORATION]: 4,
            [Type.TREAT]: 4
        }, 
        defaultPeopleFrequency: 2, // each person included twice by default
        numHandCards: 40,
        scoreMultiplier: 0.75,
        scoreRandomness: new Bounds(0.9, 1.1), // a slight randomness multiplier to scores
        scoreBounds: new Bounds(2,14),
        iconsPerScore: new Bounds(2,8), // how many icons (deco + treat) a person will have, based on their score
        maxIconsPerTypeOnPerson: 5, // one side (deco or treat) can have MAX this #icons
        percentageDoublesPerType:
        {
            [Type.DECORATION]: new Bounds(0.1, 0.15),
            [Type.TREAT]: new Bounds(0.1, 0.15)
        },
        percentageWildcardsPerType:
        {
            [Type.DECORATION]: new Bounds(0.1, 0.15),
            [Type.TREAT]: new Bounds(0.1, 0.15)
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

        illustration:
        {
            
        },

        metadata:
        {
           
        },

        bg:
        {
            color: "#FEFEFE"
        },

        outline:
        {
            size: 0.036, // relative to sizeUnit
            color: "#000000"
        }
    }
}

export default CONFIG