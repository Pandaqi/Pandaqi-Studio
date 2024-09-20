import ResourceLoader from "js/pq_games/layout/resources/resourceLoader"
import PdfBuilder from "js/pq_games/pdf/pdfBuilder";
import { PageOrientation } from "js/pq_games/pdf/pdfEnums";
import Point from "js/pq_games/tools/geometry/point"
import ProgressBar from "js/pq_games/website/progressBar"
import CodeCards from "./cards"
import CONFIG from "./config"
import Tiles from "./tiles/tiles"
import Tokens from "./tokens"

export default class Generator {
    constructor() {}

    async start()
    {
        const progressBar = new ProgressBar();
        progressBar.setPhases(
            ["Loading Assets",
            "Generating tiles", "Generating code cards", "Generating tokens", 
            "Converting to Images", "Creating a PDF"]
        );
        progressBar.gotoNextPhase();

        const resLoader = new ResourceLoader({ base: CONFIG.assetsBase });
        resLoader.planLoad("tokens", { path: "tokens_new.webp", frames: new Point(8,1) });
        resLoader.planLoad("almostActions", { path: "almost_actions.webp", frames: new Point(8,1) });
        await resLoader.loadPlannedResources();

        const pdfBuilderCONFIG = { orientation: PageOrientation.PORTRAIT };
        const pdfBuilder = new PdfBuilder(pdfBuilderCONFIG);
        
        CONFIG.pdfBuilder = pdfBuilder;
        CONFIG.resLoader = resLoader;
        Object.assign(CONFIG, JSON.parse(window.localStorage.photomoneAntsassinsConfig || "{}"));

        CONFIG.numTeamsOnCodeCard = parseInt(CONFIG.numTeamsOnCodeCard + "");
        CONFIG.numSecretTilesPerTeam = parseInt(CONFIG.numSecretTilesPerTeam + "");

        // last minute change: the simple version only supports rectangles and a 3+1 = 4 point tile
        if(CONFIG.tileType == "simple") { 
            CONFIG.tileShape = "rectangle"; 
            CONFIG.tiles.gridResolution = 3;
            CONFIG.tiles.dimsPerShape.rectangle = new Point(7, 8);
            CONFIG.tiles.dimsPerShapeReduced.rectangle = new Point(10, 12);
            CONFIG.cards.gridPerShapeReduced.rectangle = new Point(8, 8);
        }


        progressBar.gotoNextPhase();

        // some repetitive code, both here and inside the classes, but it's fine
        // it's a minor "issue", but it helps readability of the code
        const tiles = new Tiles();
        console.log("[Photomone] Created Tiles");
        progressBar.gotoNextPhase();

        const cards = new CodeCards();
        console.log("[Photomone] Created Code Cards");
        progressBar.gotoNextPhase();

        const tokens = new Tokens();
        console.log("[Photomone] Created Tokens");
        progressBar.gotoNextPhase();

        // asynchronously draw all of that (which also converts it into images)
        const promises = [tiles.draw(), cards.draw(), tokens.draw()];
        await Promise.all(promises);

        console.log("[Photomone] Created Images");
        progressBar.gotoNextPhase();

        //if(CONFIG.debugWithDragDrop) { new DragDropDebugger(CONFIG, tiles.getIndividualImages()); }
        const images = [tiles.getImages(), cards.getImages(), tokens.getImages()].flat();
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