import Point from "js/pq_games/tools/geometry/point";

interface TargetData
{
    bleed: Point, // bleed around edges
    pageThickness: number, // the thickness of each individual page
    pageThicknessConstant?: number, // a base thickness for spine, mostly relevant for thick hardcover wrap
    colorModifiers?: Record<string,number> // any effects to apply
    spineExpansion?: number, // offset covers further away from spine, needed for hardcover
    createPDF?: boolean,
}

// These values are in INCHES; converted to pixels at the end by multiplying by 300
// It's the only way I could get very close to the numbers from their systems
const PAGE_SIZE = new Point(5.5, 8.5);
const TARGETS:Record<string,TargetData> =
{
    d2d:
    {
        createPDF: false,
        bleed: new Point(0.125),
        pageThickness: 0.00214174972,
        colorModifiers:
        {
            saturate: 10,
        }
    },

    amazon:
    {
        createPDF: true,
        bleed: new Point(0.125),
        pageThickness: 0.00225118124,
        colorModifiers:
        {
            lighten: 15
        }
    },

    amazon_hardcover:
    {
        createPDF: true,
        bleed: new Point(0.7875, 0.7085), // hardcover "shrinks" the real cover (5.5x8.5) a little bit, so I just calculate this by taking the TOTAL size and subtracting; these values are really close to bleed+wrap, but more exact now
        pageThickness: 0.00225,
        pageThicknessConstant: 0.189,
        spineExpansion: 0.394
    }
}

export
{
    PAGE_SIZE,
    TARGETS
}


// 76 pages = 0.36
// 100 pages = 0.414
// 150 pages = 0.527
// 200 pages = 0.639
// 300 pages = 0.865

