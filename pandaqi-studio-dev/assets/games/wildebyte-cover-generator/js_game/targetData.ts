import Point from "js/pq_games/tools/geometry/point";

// These values are in INCHES; converted to pixels at the end by multiplying by 300
// It's the only way I could get very close to the numbers from their systems
const PAGE_SIZE = new Point(5.5, 8.5);
const TARGETS =
{
    d2d:
    {
        bleed: 0.125,
        pageThickness: 0.00214174972,
        colorModifiers:
        {
            saturate: 10,
        }
    },

    amazon:
    {
        bleed: 0.125,
        pageThickness: 0.00225118124,
        colorModifiers:
        {
            lighten: 15
        }
    }
}

export
{
    PAGE_SIZE,
    TARGETS
}