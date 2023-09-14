enum GenerationMethod
{
    DELAUNAY,
    ROPE
}

const CONFIG = {
    boardDisplay: null,

    sheetData: null,

    generation:
    {
        method: GenerationMethod.DELAUNAY,
        numBlocksFullWidth: 12, // for knowing the scale at which to display everything
        pageRatio: 1.41,
        minConnectionsPerPoint: 2,
        numBlockTypes: 5,

        cityRadius: 0.15,

        trackSizeBounds: { min: 0.1, max: 0.15 },
        startWithGrid: true,
        numRelaxIterations: 20,
        influenceDamping: 0.2,
        numCityBounds: { min: 16, max: 20 },

        maxBlocksPerRoute: 5,
        connRemovePercentage: 0.15
    }
}

export { CONFIG, GenerationMethod }
export default CONFIG
