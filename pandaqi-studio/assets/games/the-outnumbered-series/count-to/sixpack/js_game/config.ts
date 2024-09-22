import Point from "js/pq_games/tools/geometry/point";

const CONFIG = {
    debugWithoutPDF: false, // @DEBUGGING (should be false)
    
    itemSize: "regular",
    pageSize: "a4",
    inkFriendly: false,

    resLoader: null,
    gridMapper: null,
    pdfBuilder: null,
    progressBar: null,

    packs: {} as Record<string,number>,
    handsPerNumber: {} as Record<number,number>,

    numbers: { min: 1, max: 6 },
    numberList: [1,2,3,4,5,6],
    fileName: "[Sixpack] Material",
    numHandsPerPack: 2,

    assetsBase: "/the-outnumbered-series/count-to/sixpack/assets/",
    font: 
    {
        key: "londrina",
        url: "fonts/LondrinaSolid-Black.woff2",
        size: 0.795,
        smallSize: 0.1
    },

    cards: 
    {
        size: 
        { 
            small: new Point(5, 5),
            regular: new Point(4, 4),
            large: new Point(3, 3)
        },
        sizeElement: new Point(1, 1.55),
        sizeResult: new Point(),
        
        bgScale: 0.975,
        mainNumber: 
        {
            bgOffset: 0.032,
            color: "#111111",
            offsetColor: "#88847E",
            strokeColor: "#FEFEFE",
            strokeWidth: 0.01
        },

        edgeNumber: 
        {
            pos: new Point(0.1, 0.1),
            bgOffset: 0.015,
            strokeWidth: 0.005,
            offsetColor: ""
        },

        hand: 
        {
            composite: "luminosity",
            pos: new Point(0.5, 0.135),
            size: 0.4
        },

        type: 
        {
            composite: "luminosity",
            pos: new Point(0.5, 0.835),
            size: 0.33
        },
        
        outlineColor: "#111111",
        outlineWidth: 0.05,

    }
}
export default CONFIG;