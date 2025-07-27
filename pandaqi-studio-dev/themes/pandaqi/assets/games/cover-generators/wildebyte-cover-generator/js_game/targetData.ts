import { Vector2 } from "lib/pq-games";
import BookCoverTargetData from "lib/pq-games/tools/bookCovers/bookCoverTargetData";

// These values are in INCHES; converted to pixels at the end by multiplying by 300
// It's the only way I could get very close to the numbers from their systems
const TARGETS:Record<string,BookCoverTargetData> =
{
    d2d:
    {
        key: "d2d",
        noPDF: true,
        bleed: new Vector2(0.125),
        pageThickness: 0.00214174972,
        colorModifiers:
        {
            saturate: 10,
        }
    },

    amazon:
    {
        key: "Amazon Paperback",
        bleed: new Vector2(0.125),
        pageThickness: 0.00225118124,
        colorModifiers:
        {
            lighten: 15
        }
    },

    amazon_hardcover:
    {
        key: "Amazon Hardcover",
        bleed: new Vector2(0.7875, 0.7085), // hardcover "shrinks" the real cover (5.5x8.5) a little bit, so I just calculate this by taking the TOTAL size and subtracting; these values are really close to bleed+wrap, but more exact now
        pageThickness: 0.00225,
        pageThicknessConstant: 0.189,
        spineExpansion: 0.394
    }
}

export default TARGETS