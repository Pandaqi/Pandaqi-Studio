import Pack from "./pack"
import { PACKS, PACK_DEFAULT, PACK_COLORS } from "./dictionary"
import ResourceLoader from "js/pq_games/canvas/resourceLoader"
import GridMapper from "js/pq_games/canvas/gridMapper"
import PdfBuilder from "js/pq_games/pdf/pdfBuilder"
import Canvas from "js/pq_games/canvas/main"
import Point from "js/pq_games/tools/geometry/point"
import ProgressBar from "js/pq_games/canvas/progressBar"

const config = {
    debugWithoutPDF: false, // @DEBUGGING (should be false)
    fileName: "[Kingseat] Material",
    configKey: "kingseatConfig",
    fonts: {
        heading: {
            key: "UniFraktur",
            url: "assets/fonts/UnifrakturCook-Bold.woff2",
            size: 0.1285
        },

        text: {
            key: "ModerneFraktur",
            url: "assets/fonts/ModerneFraktur.woff2",
            size: 0.063
        },

        slogan: {
            key: "Gothic",
            url: "assets/fonts/GothicUltraOT.woff2",
            size: 0.0533
        }
    },
    assets: {
        crests_full: {
            path: "assets/crests_full.webp",
            frames: { x: 12, y: 1 }
        },
        crests_simple: {
            path: "assets/crests_simplified.webp",
            frames: { x: 12, y: 1 }
        },
        gradient_overlay: {
            path: "assets/gradient_overlay.webp",
            frames: { x: 1, y: 1 }
        },
        multicolor_bg: {
            path: "assets/multicolor_bg.webp",
            frames: { x: 1, y: 1 }
        },
        decoration_icons: {
            path: "assets/decoration_icons.webp",
            frames: { x: 2, y: 1 }
        }
    },
    cards: {
        addShadowToSigil: true, // @DEBUGGING; should be TRUE (but is very slow, hence turned off normally)
        maxDarkCardsPerPack: 2,
        percentageWithAction: 1.0,
        dims: { 
            small: { x: 4, y: 4 },
            regular: { x: 3, y: 3 },
            huge: { x: 2, y: 2 }
        },
        numPerPack: 12,
        dimsElement: { x: 1, y: 1.55 },
        size: { x: 0, y: 0 },
        outline: {
            color: "#111111",
            width: 0.05,
        }
    }
}

export default class Generator {
    constructor()
    {
        const userConfig = JSON.parse(window.localStorage[config.configKey] || "{}");

        const packs = [];
        for(const [type,include] of Object.entries(userConfig.packs))
        {
            if(!include) { continue; }
            packs.push(type);
        }
        userConfig.packs = packs;

        Object.assign(config, userConfig);

        const progressBar = new ProgressBar();
        config.progressBar = progressBar;
        progressBar.setPhases(["Loading Assets", "Creating Packs", "Preparing PDF", "Done!"]);
    }

    async start()
    {
        console.log("[Kingseat] Generation started.")
        await this.loadAssets();
        this.cacheDefaults();
        this.createPacks();
        await this.downloadPDF();
        console.log("[Kingseat] Done.");
        config.progressBar.gotoNextPhase();
    }

    async loadAssets()
    {
        config.progressBar.gotoNextPhase();

        const promises = [];
        for(const [key,data] of Object.entries(config.fonts))
        {
            const fontFile = new FontFace(data.key, "url(" + data.url + ")");
            document.fonts.add(fontFile);
            promises.push(fontFile.load());
        }

        await Promise.all(promises);

        const resLoader = new ResourceLoader();
        for(const [key,data] of Object.entries(config.assets))
        {
            resLoader.planLoad(key, { path: data.path, frames: data.frames });
        }
        await resLoader.loadPlannedResources();

        const pdfBuilderConfig = { orientation: "portrait" };
        const pdfBuilder = new PdfBuilder(pdfBuilderConfig);

        const dims = config.cards.dims[config.cardSize || "regular"];

        const gridConfig = { pdfBuilder: pdfBuilder, dims: dims, dimsElement: config.cards.dimsElement };
        const gridMapper = new GridMapper(gridConfig);

        const cardSize = gridMapper.getMaxElementSize();
        config.cards.size = { x: cardSize.width, y: cardSize.height };

        config.resLoader = resLoader;
        config.pdfBuilder = pdfBuilder;
        config.gridMapper = gridMapper;     
    }

    cacheDefaults()
    {
        // first, add all default colors directly onto the pack object
        for(const [type, data] of Object.entries(PACKS))
        {
            const colorClass = data.colorClass.toLowerCase();
            const colorData = PACK_COLORS[colorClass];
            if(!colorData) { 
                console.error("Pack " + type + " has no valid colorClass");
                continue; 
            }
            this.cacheDefault(data, colorData);
        }

        // then add any missing defaults
        for(const [type, data] of Object.entries(PACKS))
        {
            this.cacheDefault(data, PACK_DEFAULT);
        }

        console.log("PACKS ARE");
        console.log(PACKS);
    }

    cacheDefault(obj, def)
    {
        for(const [key,data] of Object.entries(def))
        {
            if(typeof data === "object" && !(data instanceof Point))
            {
                if(!obj[key]) { obj[key] = {}; }
                this.cacheDefault(obj[key], data);
                continue;
            }

            const alreadyHasValue = obj[key] != undefined && obj[key] != null;
            if(alreadyHasValue) { continue; }

            obj[key] = data;
        }
    }

    createPacks()
    {
        config.progressBar.gotoNextPhase();

        const packs = [];    
        let counter = 0;
        const numPacks = config.packs.length;    
        for(const type of config.packs)
        {
            config.progressBar.setInfo("Creating Prince " + counter + "/" + numPacks);
            const p = new Pack(type, config);
            packs.push(p);
            counter++;
        }
        this.packs = packs;
    }

    async downloadPDF()
    {
        config.progressBar.gotoNextPhase();

        const images = await Canvas.convertCanvasesToImage(config.gridMapper.getCanvases());
        if(config.debugWithoutPDF)
        {
            for(const img of images) { 
                img.style.maxWidth = "100%";
                document.body.appendChild(img);
            }
            return;
        }

        config.pdfBuilder.addImages(images);
        const pdfConfig = { customFileName: config.fileName }
        config.pdfBuilder.downloadPDF(pdfConfig);
    }
}