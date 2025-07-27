export default 
{
    inkFriendly: false,
    boardSize: "regular",
    printSize: "singlePage",
    expansions: 
    {
        
    },

    convertParameters: { splitDims: "1x1" }, // @TODO: split system needs testing and work

    sheetData: null,

    generation:
    {
        mapWidth: 15,
        boardRatio: 1.44,

        squareSizeInPathPoints: 1, // after moving X points on the path, we start a new square

    },

    evaluator:
    {

    },

    display:
    {

        showSquares: true,
        
        paths:
        {
            smoothPath: true,
            thickenPath: true,

            smoothResolution: 10,
            thickness: 0.5, // relative to cell size / dist between two grid points
        }
    }
}
