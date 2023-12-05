import Point from "js/pq_games/tools/geometry/point"
import Bounds from "js/pq_games/tools/numbers/bounds"
import { MISC, ReqType, Type } from "./dict"

const CONFIG = 
{
    debugWithoutFile: false, // @DEBUGGING (should be false)
    debugSingleCard: false, // @DEBUGGING (should be false)
    debugOnlyGenerate: false, // @DEBUGGING (should be false)

    configKey: "pumpkinPatrolConfig",
    fileName: "[Material] Pumpkin Patrol",
    resLoader: null,
    seed: "test",

    // set through user config on page
    inkFriendly: false,
    includePeopleCards: true,
    includeHandCards: true,
    cardSize: "regular",
    
    setPeople: "starter",
    setDecorations: "starter",
    setTreats: "starter",

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
            frames: new Point(9,1)
        },

        people_starter:
        {
            path: "people_starter.webp",
            frames: new Point(8,1),
            cardSet: true
        },

        people_beginner:
        {
            path: "people_beginner.webp",
            frames: new Point(8,1),
            cardSet: true
        },

        people_advanced:
        {
            path: "people_advanced.webp",
            frames: new Point(8,1),
            cardSet: true
        },

        people_expert:
        {
            path: "people_expert.webp",
            frames: new Point(8,1),
            cardSet: true
        },

        decorations_starter:
        {
            path: "decorations_starter.webp",
            frames: new Point(4,1),
            cardSet: true
        },

        decorations_beginner:
        {
            path: "decorations_beginner.webp",
            frames: new Point(4,1),
            cardSet: true
        },

        treats_starter:
        {
            path: "treats_starter.webp",
            frames: new Point(4,1),
            cardSet: true
        },

        treats_beginner:
        {
            path: "treats_beginner.webp",
            frames: new Point(4,1),
            cardSet: true
        },
    },

    // how generation/balancing happens
    generation:
    {
        wildcardKey: "wildcard",
        wildcardData: { textureKey: "misc", frame: MISC.wildcard.frame, color: "gray" },
        randomSetSizes:
        {
            [Type.PERSON]: 8,
            [Type.DECORATION]: 4,
            [Type.TREAT]: 4
        }, 
        defaultPeopleFrequency: 2, // each person included twice by default
        numHandCards: 46, // 47 + 16 = exactly 7 pages of 9 cards per page
        scoreMultiplier: 0.75,
        scoreRandomness: new Bounds(0.9, 1.1), // a slight randomness multiplier to scores
        scoreBounds: new Bounds(2,14),
        iconsPerScore: new Bounds(2,8), // how many icons (deco + treat) a person will have, based on their score
        maxIconsPerTypeOnPerson: 5, // one side (deco or treat) can have MAX this #icons
        forceDifferentSidesProb: 0.2,
        percentageDoublesPerType:
        {
            [Type.DECORATION]: new Bounds(0.1, 0.15),
            [Type.TREAT]: new Bounds(0.1, 0.15)
        },
        percentageWildcardsPerType:
        {
            [Type.DECORATION]: new Bounds(0.1, 0.15),
            [Type.TREAT]: new Bounds(0.1, 0.15)
        },

        maxDecosForFlip: 3, // only people with this # decorations (or less) are allowed to flip to "at most"
        maxFlipsPerSet: 2, // only this # people are allowed to flip in its entirety
        decoFlipProb: 0.8, // nearly 100%, but just some variety for fun

        maxPerSpecialType:
        {
            [ReqType.CARD]: 2,
            [ReqType.SET]: 2
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

        patterns: 
        {

        },

        illustrationPerson:
        {
            size: 0.6, // relative to that top block in which it resides
            offsetY: -0.025, // relative to that top block in which it resides
        },

        score:
        {
            offset: 0.1, // offset from top, relative to card height
            dims: 0.25, // size of star, relative to sizeUnit
            shadowSize: 0.1, // relative to starDims
            textSize: 0.15, // relative to sizeUnit; should be ~2x as large as namePerson.size
            doubleDigitShrinkFactor: 0.875,
            textColor: "#241E00",
        },

        details:
        {
            powerRectFraction: 0.45, // how much of the space the bottom rectangle (for power) takes up
            rectShadowSize: 0.0275,
            iconOffset: 0.1, // relative to sizeUnit, applied to X-axis
            wonkyRectElongation: 0.015, // relative to sizeUnit
            iconHeight: 0.725, // relative to wonky rect height
            iconShadowSize: 0.04, // relative to icon height
            rectTextFontSize: 0.75, // relative to icon height!
            rectTextColor: "#000000",
            bgs:
            {
                power: "#CCBDE4", // overall light-purple background, only comes through on power at bottom
                treats: "#FA600C",
                decorations: "#3BFF70"
            },

            bgsInkfriendly:
            {
                power: "#B0B0B0",
                treats: "#D0D0D0",
                decorations: "F0F0F0"
            },

            power:
            {
                fontSize: 0.0475,
                fontSizeNoPower: 0.04,
                alphaNoPower: 0.66,
                textColor: "#000000",
                textMaxWidth: 0.7, // relative to full width of card
            },

        },

        handSide:
        {
            iconScale: 0.8, // relative to this side's height
            shadowSize: 0.05, // relative to icon size
        },

        bgHand:
        {
            color: "#FEFEFE",
            patternAlpha: 0.175,
            patternAlphaInkFriendly: 0.075,
            patternNumIcons: 10,
            patternIconSize: 0.9, // relative to max available space based on num icons distributed in pattern
            rectElongationFactor: 0.045, // relative to this side's height
            patternExtraMargin: 1.2,

            fontSize: 0.053, // relative to sizeUnit
            textColor: "#FEFEFE",
            textShadow: 0.1, // relative to fontSize
            textOffsetFromLine: 1.0, // relative to fontSize

            slantedLineWidth: 0.018, // relative to sizeUnit
            slantedLineColor: "#FEFEFE"
        },

        bgPerson:
        {
            color: "#2B1D41", // dark purple
            size: 0.66, // scale factor on Y-axis of the person illustration block (at the top)
            beamScale: 0.92, // relative to full block scale
            beamOffsetY: 0.36, // fraction of score offset
        },

        namePerson:
        {
            color: "#FFFFFF",
            alpha: 0.9,
            size: 0.068, // relative to sizeUnit; should be ~3x as large as setID.size
        },

        setID:
        {
            color: "#FFFFFF",
            alpha: 0.35,
            size: 0.03, // relative to sizeUnit
            offset: new Point(0.066, 0.04), // relative to sizeUnit, from top-left corner
        },

        outline:
        {
            size: 0.036, // relative to sizeUnit
            color: "#000000"
        }
    }
}

export default CONFIG