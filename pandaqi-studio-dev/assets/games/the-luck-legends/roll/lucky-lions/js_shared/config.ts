import Point from "js/pq_games/tools/geometry/point"
import { AnimalType } from "./dict"

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

        misc:
        {
            path: "misc.webp",
            frames: new Point(6,1)
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
    },
}

export default CONFIG