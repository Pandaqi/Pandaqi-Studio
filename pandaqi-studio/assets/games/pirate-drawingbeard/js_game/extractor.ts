import PdfBuilder from "js/pq_games/pdf/pdfBuilder";
import { PageOrientation } from "js/pq_games/pdf/pdfEnums";
import HintVisualizer from "./hintVisualizer";
import Hints from "./hints";
import JSZip from "./jszip.min.js";
import BoardVisualizer from "js/pq_games/tools/generation/boardVisualizer";

/* EXTRACT ALL hints AS ZIP (for me, for rulebook editing) */
const onZipImagesReady = () =>
{
	// @ts-ignore
	const zip = new JSZip();
	const images = HintVisualizer.images;
	
	for(let i = 0; i < images.length; i++)
	{
		const img = images[i];
		let imgData = img.src;
		imgData = imgData.substr(22);
		imgData = atob(imgData);
		zip.file(img.getAttribute('outputName'), imgData, { binary: true });
	}

	zip.generateAsync({type:"blob"}).then((content) =>
	{
		// @ts-ignore
		saveAs(content, "Drawingbeard Images.zip");
	});
}

const downloadHintsZip = async (vis:BoardVisualizer) =>
{
	HintVisualizer.download = true;
	await HintVisualizer.visualizeAll(Hints.createFullListForDownload(), vis);
	onZipImagesReady();
}

const createPremadeGame = (images:HTMLImageElement[]) =>
{
	const pdfBuilder = new PdfBuilder({ orientation: PageOrientation.LANDSCAPE });
	for(const img of images)
	{
		pdfBuilder.addImage(img);
	}

	const pdfParams = { customFileName: "[Pirate Drawingbeard] Premade Game" };
	pdfBuilder.downloadPDF(pdfParams);
}

export { downloadHintsZip, createPremadeGame }
