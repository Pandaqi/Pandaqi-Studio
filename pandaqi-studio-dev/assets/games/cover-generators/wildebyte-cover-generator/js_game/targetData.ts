import BookCoverTargetData from "lib/pq-games/tools/generation/bookCovers/bookCoverTargetData";
import Point from "lib/pq-games/tools/geometry/point";

// These values are in INCHES; converted to pixels at the end by multiplying by 300
// It's the only way I could get very close to the numbers from their systems
const TARGETS:Record<string,BookCoverTargetData> =
{
    d2d:
    {
        key: "d2d",
        noPDF: true,
        bleed: new Point(0.125),
        pageThickness: 0.00214174972,
        colorModifiers:
        {
            saturate: 10,
        }
    },

    amazon:
    {
        key: "Amazon Paperback",
        bleed: new Point(0.125),
        pageThickness: 0.00225118124,
        colorModifiers:
        {
            lighten: 15
        }
    },

    amazon_hardcover:
    {
        key: "Amazon Hardcover",
        bleed: new Point(0.7875, 0.7085), // hardcover "shrinks" the real cover (5.5x8.5) a little bit, so I just calculate this by taking the TOTAL size and subtracting; these values are really close to bleed+wrap, but more exact now
        pageThickness: 0.00225,
        pageThicknessConstant: 0.189,
        spineExpansion: 0.394
    }
}

export default TARGETS