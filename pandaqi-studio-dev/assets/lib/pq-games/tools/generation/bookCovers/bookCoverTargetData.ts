import Point from "../../geometry/point";

interface BookCoverTargetData
{
    key: string, // unique ID for referencing target
    bleed: Point, // bleed around edges
    pageThickness: number, // the thickness of each individual page
    pageThicknessConstant?: number, // a base thickness for spine, mostly relevant for thick hardcover wrap
    colorModifiers?: Record<string,number> // any effects to apply
    spineExpansion?: number, // offset covers further away from spine, needed for hardcover
    noPDF?: boolean,
    noImage?: boolean
}

export default BookCoverTargetData