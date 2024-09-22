import Point from "js/pq_games/tools/geometry/point"
import { AnimalType } from "./dict"
import CVal from "js/pq_games/tools/generation/cval"
import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig"
import Bounds from "js/pq_games/tools/numbers/bounds"
import autoLoadFontCSS from "js/pq_games/website/autoLoadFontCSS"

const CONFIG:any = 
{
    debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    configKey: "luckyLionsConfig",
    fileName: "[Material] Lucky Lions",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",

    fonts:
    {
        heading: "bamboo",
        body: "berylium"
    },

    sets:
    {
        base: true,
        busyZoo: false,
        wildAnimals: false,
    },

    // assets
    assetsBase: "/the-luck-legends/roll/lucky-lions/assets/",
    assets:
    {
        berylium:
        {
            path: "fonts/Berylium-Regular.woff2",
            loadIf: ["sets.busyZoo", "sets.wildAnimals"]
        },

        berylium_italic:
        {
            key: "berylium",
            path: "fonts/Berylium-Italic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC }),
            loadIf: ["sets.busyZoo", "sets.wildAnimals"]

        },

        berylium_bold:
        {
            key: "berylium",
            path: "fonts/Berylium-Bold.woff2",
            textConfig: new TextConfig({ weight: TextWeight.BOLD }),
            loadIf: ["sets.busyZoo", "sets.wildAnimals"]
        },

        bamboo:
        {
            path: "fonts/BambooGothic-Book.woff2",
            loadIf: ["sets.expansion"]
        },

        card_templates:
        {
            path: "card_templates.webp",
            frames: new Point(3,1)
        },

        animals:
        {
            path: "animals.webp",
            frames: new Point(5,1)
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(4,2)
        },
    },

    rulebook:
    {
        numPlayerBounds: new Bounds(2,5),
        numCardsPerPlayer: 6,
        itemSize: new Point(375, 525),
        zooMarketSize: 3,
        numPointsToWin: 10,
    },

    generation:
    {
        animalFreqDefaultBase: 6,
        animalFreqsBase:
        {
            [AnimalType.LION]: 9
        },
        animalFreqDefaultWild: 2,
        animalFreqsWild:
        {

        },

        peopleIconPercentage: 0.25,

        zooCardsNumBase: 26,
        zooCycleNumFreqsBase:
        {
            2: 0.05,
            3: 0.25,
            4: 0.45,
            5: 0.25,
        },

        zooCardsNumBusy: 13,
        zooCycleNumFreqsBusy:
        {
            3: 0.15,
            4: 0.35,
            5: 0.5
        },

        zooCardScoreFreqs:
        {
            1: 0.4,
            2: 0.4,
            3: 0.2
        }
    },

    cards:
    {
        drawerConfig:
        {
            autoStroke: true,
            sizeElement: new Point(1, 1.4),
            size: 
            { 
                small: new Point(4,4),
                regular: new Point(3,3),
                large: new Point(2,2)
            }, 
        },

        zooBackgroundColor: "#197714",
        animalBackgroundColor: "#cc7020",
        backgroundTextureAlpha: 0.5,

        cycle:
        {
            startingAngle: 0,
            pos: new CVal(new Point(0.5), "size"),
            size: new CVal(new Point(0.75), "sizeUnit"),
            animalRadius: new CVal(0.3, "sizeUnit"), // should be slightly smaller than 0.5*size
            iconDims: new CVal(new Point(0.175), "sizeUnit"),
            peopleIconDims: new CVal(new Point(0.2), "sizeUnit"),
            rotateAnimals: false,
        },

        score:
        {
            fontSize: new CVal(0.13, "sizeUnit"),
            textBoxPos: new CVal(new Point(0.795, 0.1375), "size"),
            textColor: "#023d00"
        },

        power:
        {
            textBoxPos: new CVal(new Point(0.5, 0.85), "size"),
            textBoxDims: new CVal(new Point(0.85), "sizeUnit"),
            textDims: new CVal(new Point(0.75, 0.25), "size"), // should be slightly smaller than textBoxDims
            fontSize: new CVal(0.05, "sizeUnit"),
            textColor: "#FFFFFF"
        },

        animal:
        {
            iconPos: new CVal(new Point(0.5), "size"),
            iconDims: new CVal(new Point(0.5), "sizeUnit")
        }
    },
}

autoLoadFontCSS(CONFIG);

export default CONFIG