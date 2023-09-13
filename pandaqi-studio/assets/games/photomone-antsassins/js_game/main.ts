import Tiles from "./tiles/tiles"
import CodeCards from "./cards"
import Tokens from "./tokens"
import PdfBuilder, { PageOrientation } from "js/pq_games/pdf/pdfBuilder"
import DragDropDebugger from "./tools/dragdrop"
import CONFIG from "./config"
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader"
import Point from "js/pq_games/tools/geometry/point"

export default class Generator {
    constructor() {}

    async start()
    {
        const resLoader = new ResourceLoader();
        resLoader.planLoad("geldotica", { key: "GelDoticaLowercase", path: CONFIG.fontURL });
        resLoader.planLoad("tokens", { path: "assets/tokens_new.webp", frames: new Point(8,1) });
        resLoader.planLoad("almostActions", { path: "assets/almost_actions.webp", frames: new Point(8,1) });
        await resLoader.loadPlannedResources();

        const pdfBuilderCONFIG = { orientation: PageOrientation.PORTRAIT };
        const pdfBuilder = new PdfBuilder(pdfBuilderCONFIG);
        
        CONFIG.pdfBuilder = pdfBuilder;
        CONFIG.resLoader = resLoader;
        Object.assign(CONFIG, JSON.parse(window.localStorage.photomoneAntsassinsCONFIG || "{}"));

        // @ts-ignore
        CONFIG.numTeamsOnCodeCard = parseInt(CONFIG.numTeamsOnCodeCard);
        // @ts-ignore
        CONFIG.numSecretTilesPerTeam = parseInt(CONFIG.numSecretTilesPerTeam);

        // last minute change: the simple version only supports rectangles and a 3+1 = 4 point tile
        if(CONFIG.tileType == "simple") { 
            CONFIG.tileShape = "rectangle"; 
            CONFIG.tiles.gridResolution = 3;
            CONFIG.tiles.dimsPerShape.rectangle = new Point(7, 8);
            CONFIG.tiles.dimsPerShapeReduced.rectangle = new Point(10, 12);
            CONFIG.cards.gridPerShapeReduced.rectangle = new Point(8, 8);
        }

        console.log(CONFIG);

        // some repetitive code, both here and inside the classes, but it's fine
        // it's a minor "issue", but it helps readability of the code
        const tiles = new Tiles();
        console.log("[Photomone] Created Tiles");
        const cards = new CodeCards();
        console.log("[Photomone] Created Code Cards");
        const tokens = new Tokens();
        console.log("[Photomone] Created Tokens");

        await tiles.convertToImages();
        await cards.convertToImages();
        await tokens.convertToImages();

        const images = [tiles.getImages(), cards.getImages(), tokens.getImages()].flat();
        console.log("[Photomone] Created Images");

        if(CONFIG.debugWithDragDrop) { new DragDropDebugger(CONFIG, tiles.getIndividualImages()); }
        if(CONFIG.debugWithoutPDF)
        {    
            for(const img of images)
            {
                img.style.maxWidth = "100%";
                document.body.appendChild(img);
            }
            return;
        }

        pdfBuilder.addImages(images);
        const pdfCONFIG = { customFileName: "[Photomone; Antsassins] Material" }
        pdfBuilder.downloadPDF(pdfCONFIG);
    }
}

new Generator().start();