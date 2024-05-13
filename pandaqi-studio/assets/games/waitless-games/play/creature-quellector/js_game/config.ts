import TextConfig, { TextStyle } from "js/pq_games/layout/text/textConfig"
import Point from "js/pq_games/tools/geometry/point"
import Bounds from "js/pq_games/tools/numbers/bounds"

export default 
{
    debugWithoutPDF: false, // @DEBUGGING (should be false)
    debugSingleCard: false, // @DEBUGGING (should be false)
    debugRandomizeTypes: false, // @DEBUGGING (should be false)
    
    fileName: "[Creature Quellector] Material",
    configKey: "creatureQuellectorConfig",
    progressBar: null,
    resLoader: null,
    gridMapper: null,
    pdfBuilder: null,
    itemSize: "regular",
    pageSize: "a4",
    inkFriendly: false,

    multiType: false,
    multiTypeImageResource: null,

    enableOldCounterRules: false, // @DEBUGGING? the old rules included counter icons/cycle on the card; not anymore

    elements: {}, // the elements included by user setting on game page
    elementsReverse: {},

    alwaysAddMainTypeOnce: false,

    fonts:
    {
        heading: "comica",
        body: "cabin"
    },

    assetsBase: "/waitless-games/play/creature-quellector/assets/",
    assets: 
    {
        creatures_1: 
        {
            path: "quellector_creatures_1.webp",
            frames: new Point(8,2)
        },

        creatures_2: 
        {
            path: "quellector_creatures_2.webp",
            frames: new Point(8,2)
        },

        creatures_3: 
        {
            path: "quellector_creatures_3.webp",
            frames: new Point(8,2)
        },

        backgrounds_1: 
        {
            path: "quellector_backgrounds_1.webp",
            frames: new Point(8,2)
        },

        backgrounds_2: 
        {
            path: "quellector_backgrounds_2.webp",
            frames: new Point(8,2)
        },

        backgrounds_3: 
        {
            path: "quellector_backgrounds_3.webp",
            frames: new Point(8,2)
        },

        icons: 
        {
            path: "quellector_types.webp",
            frames: new Point(8,2)
        },

        icons_actions: 
        {
            path: "quellector_actions.webp",
            frames: new Point(8,2)
        },

        counter_icon: 
        {
            path: "counter_icon.webp",
        },

        comica: 
        {
            path: "fonts/ComicaBoomRegular.woff2",
            size: 0.1285
        },

        cabin_italic: 
        {
            key: "cabin",
            path: "fonts/Cabin-Italic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC }),
            size: 0.0533
        }

        /*
        fontText: {
            key: "Beautiful Humility",
            path: "fonts/BeautifulHumilityRegular.woff2",
            size: 0.063
        },
        */ 
    },

    gameplay: 
    {
        // purple defeats green, defeats blue, defeats red, defeats purple
        elementCycle: ["purple", "green", "blue", "red"],
        elementCycleSubtype: [],
        actionProbability: 0.275,
        actionPickThreshold: 5, // we'll only consider adding actions once this number of regular icons have been placed
        actionPercentage: new Bounds(0.175, 0.3), // what percentage of icons (in total) should be an action?
        actionPercentagePerType: new Bounds(0.075, 0.5), // what percentage of icons (within one type) may be an action?
    
        multiTypeProbability: 0.175,
    },

    cards: 
    {
        dims: 
        { 
            small: new Point(4, 4),
            regular: new Point(3, 3),
            huge: new Point(2, 2)
        },
        dimsElement: new Point(1, 1.55),
        numPerElement: 12,
        iconsPerCard: 4,
        //backgroundColor: "#FFE4B3",
        backgroundColors: 
        {
            red: "#FFD2D2",
            blue: "#D6FEFA",
            green: "#E8FFDF",
            purple: "#F2E3FF"
        },

        textSize: 0.08, // relative to card size
        textSizeFineprint: 0.02, // relative to card size

        icon: 
        {
            backgroundInkFriendly: "#777777",
            backgroundDarkInkFriendly: "#333333"
        },

        actionIconPatternStrokeWidth: 0.075, // relative to icon size (during bake-stuff-into-type-icons phase)
        actionIconPatternAlpha: 0.4,
        dropShadowOffset: 0.08, // relative to (corner) icon size
        
        backgroundScale: 2.0,
        backgroundAlpha: 0.125,
        generator: 
        {
            maxDifferenceBetweenTypes: 5,
            subTypeExtraProb: 0.2,
        },
        size: new Point(),
        stroke: 
        {
            color: "#614100",
            colorInkFriendly: "#999999",
            width: 0.01
        },
        outline: 
        {
            color: "#332211",
            colorInkFriendly: "#333333",
            width: 0.02,
        },
        genericNames: ["mon", "snout", "leg", "fur", "paw", "tail", "speed", "critter", "creat", "monster", "god", "child", "baby", "beak", "wing", "dweller", "kid", "roam", "breath", "blast", "jump", "leap"],

    }
}
