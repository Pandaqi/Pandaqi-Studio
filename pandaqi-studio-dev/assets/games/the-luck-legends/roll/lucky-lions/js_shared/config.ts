import Point from "js/pq_games/tools/geometry/point"
import { AnimalType } from "./dict"
import CVal from "js/pq_games/tools/generation/cval"

const CONFIG:any = 
{
    debug:
    {
        omitFile: true, // @DEBUGGING (should be false)
        singleDrawPerType: true, // @DEBUGGING (should be false)
        onlyGenerate: true, // @DEBUGGING (should be false)
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

        zooCardsNumBase: 20,
        zooCycleNumFreqsBase:
        {
            2: 0.05,
            3: 0.25,
            4: 0.45,
            5: 0.25,
        },

        zooCardsNumBusy: 10,
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
            dimsElement: new Point(1, 1.4),
            dims: 
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
            dims: new CVal(new Point(0.5), "sizeUnit"),
            animalRadius: new CVal(0.4, "sizeUnit"), // should be slightly smaller than dims
            iconDims: new CVal(new Point(0.2), "sizeUnit"),
            peopleIconDims: new CVal(new Point(0.2), "sizeUnit")
        },

        score:
        {
            fontSize: new CVal(0.15, "sizeUnit"),
            textBoxPos: new CVal(new Point(0.75, 0.2), "size"),
            textColor: "#023d00"
        },

        power:
        {
            textBoxPos: new CVal(new Point(0.5, 0.75), "size"),
            textBoxDims: new CVal(new Point(0.75, 0.2), "size"),
            textDims: new CVal(new Point(0.65, 0.15), "size"), // should be slightly smaller than textBoxDims
            fontSize: new CVal(0.1, "sizeUnit"),
            textColor: "#FFFFFF"
        },

        animal:
        {
            iconPos: new CVal(new Point(0.5), "size"),
            iconDims: new CVal(new Point(0.5), "size")
        }
    },
}

export default CONFIG