import PdfBuilder from "./pdfBuilder"
// @ts-ignore
import { jsPDF } from "./jspdf";

class PdfClass
{
	scaleFactor = 3.7795 // standard conversion for PX to MM (270x210 for A4)
	extraDPIFactor = 1.66 // this seems a good compromise between sharp resolution and fast drawing/PDF download
	button: HTMLButtonElement
    PdfBuilder = PdfBuilder
    jsPDF = jsPDF

    getPDFBuilder(config:Record<any,any>) : PdfBuilder
    {
        config.jsPDF = this.jsPDF;
        return new this.PdfBuilder(config);
    }

	getDPIScalar() : number
	{
		return this.scaleFactor * window.devicePixelRatio * this.extraDPIFactor;
	}

	getCreatePDFButton() : HTMLButtonElement
	{
		return document.getElementById('btn-create-pdf') as HTMLButtonElement;
	}
}

export default new PdfClass();