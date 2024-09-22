import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig"
import CVal from "js/pq_games/tools/generation/cval"
import Point from "js/pq_games/tools/geometry/point"
import Bounds from "js/pq_games/tools/numbers/bounds"

const CONFIG:any = 
{
    debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
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
        operations: false,
        intensiveCare: false
    },

    fonts:
    {
        heading: "library",
        body: "bellota",
    },

    // assets
    assetsBase: "/pyrrameds/assets/",
    assets:
    {
        bellota:
        {
            path: "fonts/Bellota-Regular.woff2",
        },

        bellota_bold:
        {
            key: "bellota",
            path: "fonts/Bellota-Bold.woff2",
            textConfig: new TextConfig({ weight: TextWeight.BOLD })
        },

        bellota_italic:
        {
            key: "bellota",
            path: "fonts/Bellota-Italic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC })
        },

        library:
        {
            path: "fonts/LIBRARY3AMsoft.woff2",
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

        card_templates:
        {
            path: "card_templates.webp",
            frames: new Point(6,1)
        },
    },

    rulebook:
    {
        numPlayerBounds: new Bounds(3,5),
        startingRowSize: 6,
        numCardsInDeck: 36,

        boardCanvasSize: new Point(720, 720),
        itemSize: new Point(750, 1050),
        itemSizeDisplayed: new Point(375, 525),

        forbidSuperfluousTypesOnPaths: true,
        forbidBackwardMovesOnPaths: true,
        ifSingleNeighborMustBeHigher: false,

        preSimulateTurnsBounds: new Bounds(6,12),
        reqsOnCardFunctionAsItsNumber: false,
    },

    generation:
    {
        medicineNumberBounds: new Bounds(1,9), // the card design made double digits ugly/impossible to fit
        maxDistBetweenRequirementTypes: 2,
        penaltyForBaseTypesInExpansion: 4,
        percentageWildcardNumbers: 0.2,
        defaultMedicineFrequency: 
        {
            base: 5,
            intensiveCare: 4,
        },
        numPatientCards: 
        {
            base: 18,
            intensiveCare: 12,
        },
        patientNumNeedsDistribution:
        {
            1: 0.05,
            2: 0.25,
            3: 0.3,
            4: 0.3,
            5: 0.1,
            6: 0
        }
    },

    cards:
    {
        drawerConfig:
        {
            autoStroke: true,
            sizeElement: new Point(1, 1.4),
            size: { 
                small: new Point(4,4),
                regular: new Point(3,3),
                large: new Point(2,2)
            },  
        },

        shared:
        {
            shadowColor: "#000000BB",
            shadowBlur: new CVal(0.01, "sizeUnit"),
            shadowOffset: new CVal(new Point(0, 0.0275), "sizeUnit"),
        },

        number:
        {
            defColor: "#000000",
            fontSize: new CVal(0.585, "sizeUnit"),
            pos: new CVal(new Point(0.5, 0.37), "size"),
        },

        medicine:
        {
            pos: new CVal(new Point(0.5, 0.715), "size"),
            iconDims: new CVal(new Point(0.4), "sizeUnit"),
        },

        patient:
        {
            iconDims: new CVal(new Point(0.25), "sizeUnit"),
            posAnchor: new CVal(new Point(0.5, 0.75), "size"), // should be close to medicine.pos, but lower
            illustration:
            {
                pos: new CVal(new Point(0.17, 0.37), "size"), // should match number.pos on Y-axis
                sizeCircle: new CVal(new Point(0.275), "sizeUnit"),
                sizeIcon: new CVal(new Point(0.21), "sizeUnit")
            }
        },

        special:
        {
            fontSize: new CVal(0.0725, "sizeUnit"),
            textBoxPos: new CVal(new Point(0.5, 0.73), "size"),
            textBoxDims: new CVal(new Point(0.75, 0.66), "size"),
            textColor: "#000000"
        }
    },
}

export default CONFIG