import Point from "../tools/geometry/point";
import { PageFormat } from "./pdfEnums";

const PDF_DPI = 300.0;
const MM_PER_INCH = 25.4;

// Defined in MILLIMETERS as that's the most common way to do so
const PAGE_FORMATS = {
    [PageFormat.A4]: new Point(297, 210),
    [PageFormat.A5]: new Point(210, 148),
    [PageFormat.LETTER]: new Point(297, 216) 
}


const convertPixelsToInches = (p:Point) =>
{
    return p.clone().div(PDF_DPI);
}

const convertInchesToPixels = (p:Point) =>
{
    return p.clone().mult(PDF_DPI);
}

const convertMillimetersToInches = (p:Point) =>
{
    return p.clone().div(MM_PER_INCH);
}

const convertInchesToMillimeters = (p:Point) =>
{
    return p.clone().mult(MM_PER_INCH);
}

const convertMillimetersToPixels = (p:Point) =>
{
    return convertInchesToPixels(convertMillimetersToInches(p));
}

const convertPixelsToMillimeters = (p:Point) =>
{
    return convertInchesToMillimeters(convertPixelsToInches(p));
}

export
{
    PDF_DPI,
    MM_PER_INCH,
    PAGE_FORMATS,
    convertPixelsToInches,
    convertInchesToPixels,
    convertMillimetersToInches,
    convertInchesToMillimeters,
    convertMillimetersToPixels,
    convertPixelsToMillimeters,
}