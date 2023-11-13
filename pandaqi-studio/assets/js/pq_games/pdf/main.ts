import PdfBuilder from "./pdfBuilder"
// @ts-ignore
import { jsPDF } from "./jspdf";

const scaleFactor = 3.7795 // standard conversion for PX to MM (270x210 for A4)
const extraDPIFactor = 1.66 // this seems a good compromise between sharp resolution and fast drawing/PDF download

// BETTER APPROACH: this is one millimeter at 300 DPI
const oneMMToPixel = 11.811023622047244;

const getDPIScalar = () : number => { return oneMMToPixel; }

export { getDPIScalar }
