import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig"
import CVal from "js/pq_games/tools/generation/cval"
import Point from "js/pq_games/tools/geometry/point"
import Bounds from "js/pq_games/tools/numbers/bounds"

const CONFIG:any = 
{
    debug:
    {
        omitFile: true, // @DEBUGGING (should be false)
        singleDrawPerType: true, // @DEBUGGING (should be false)
        onlyGenerate: true, // @DEBUGGING (should be false)
    },

    configKey: "pyrramedsConfig",
    fileName: "[Material] Pyrrameds",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",
    pageSize: "a4",

    sets:
    {
        base: true,
        whatever1: false,
        whatever2: false
    },

    fonts:
    {
        heading: "grenze",
        body: "grenze",
    },

    // assets
    assetsBase: "/pyrrameds/assets/",
    assets:
    {
        grenze:
        {
            path: "fonts/Grenze-Regular.woff2",
        },

        medicine:
        {
            path: "medicine.webp",
            frames: new Point(8,1)
        },

        patients:
        {
            path: "patients.webp",
            frames: new Point(8,1)
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(8,1)
        },
    },

    rulebook:
    {
        boardCanvasSize: new Point(720, 720),
        itemSize: new Point(750, 1050),
        itemSizeDisplayed: new Point(375, 525),

        forbidSuperfluousTypesOnPaths: true,
        forbidBackwardMovesOnPaths: true,
        ifSingleNeighborMustBeHigher: true,
    },

    generation:
    {
        medicineNumberBounds: new Bounds(1,15),
        defaultMedicineFrequency: 5,
        numPatientCards: 18,
        patientNumNeedsDistribution:
        {
            1: 0.05,
            2: 0.25,
            3: 0.3,
            4: 0.3,
            5: 0.1
        }
    },

    cards:
    {
        drawerConfig:
        {
            dimsElement: new Point(1, 1.4),
            dims: { 
                small: new Point(4,4),
                regular: new Point(3,3),
                large: new Point(2,2)
            },  
        },
    },
}

export default CONFIG