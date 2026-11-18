import type { Vector2 } from "./geometry/vector2";
import { splitCanvas } from "./layout/canvas/splitters";
import { GridMapper, createGridMapperFromConfig } from "./layout/gridMapper";
import { ResourceLoader } from "./layout/resources/resourceLoader";
import { MaterialVisualizer } from "./renderers/materialVisualizer";
import { RendererPandaqi } from "./renderers/pandaqi/rendererPandaqi";
import type { Renderer } from "./renderers/renderer";
import { addConfigFromLocalStorage, ensureConfigProperties, getSettingDefault, type GameConfig, type MaterialConfig } from "./settings/configuration";
import { sendProgressInfoSignal, sendProgressPhaseSignal } from "./tools/dom/feedbackNode";
import { PdfBuilder, PdfCompression, PdfPageConfig } from "./tools/pdf/pdfBuilder";
import { getSplitDimsAsPoint, makeSizeSplittable } from "./tools/pdf/tools";
import { setSeed } from "./tools/random/rng";
import { getRandomSeedString } from "./tools/random/values";
import { setStrictWarnings } from "./tools/debug/warnings";
import { debugEnabled } from "./tools/debug/flags";

const DEFAULT_BATCH_SIZE = 10;
const DEFAULT_SLEEP_DURATION = 33 // ms

export interface MaterialDrawCall
{
    item: any,
    mapper: GridMapper,
    visualizer: MaterialVisualizer,
    splitDims: Vector2,
    frontDefault: HTMLCanvasElement,
    backDefault: HTMLCanvasElement
}

const sleep = (timeout:number) => new Promise(r => setTimeout(r, timeout))
const letDomUpdate = async () => { return sleep(DEFAULT_SLEEP_DURATION); }

// A game can generate more than one document (cards + tiles, for example). Saving all of them under the
// game's own name collided in the browser's download folder, so each material gets a readable suffix.
const formatMaterialName = (key:string) =>
{
    const spaced = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[-_]+/g, " ").trim();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

const loadResources = async (config:GameConfig, feedbackNode:HTMLElement, renderer: Renderer) =>
{
    sendProgressPhaseSignal(feedbackNode, "Loading Resources");
    await letDomUpdate();

    const resourceFilter = config._resources.filter ?? ((dict) => { return dict; });
    const resourcesToLoad = resourceFilter(config._resources.files ?? {});
    const resLoader = new ResourceLoader({ base: config._resources.base, renderer: renderer });
    resLoader.onResourceLoaded = (txt:string) => { sendProgressInfoSignal(feedbackNode, txt); };
    resLoader.onResourceFailed = (txt:string) => { 
        console.error(`[Resources] ${txt}`);
        sendProgressInfoSignal(feedbackNode, txt); 
    };
    resLoader.setCustomResources((config._settings.defaults.resources ?? {}).value)

    if(!config._debug.onlyGenerate) { resLoader.planLoadMultiple(resourcesToLoad, config); }
    await resLoader.loadPlannedResources();

    config._game.resLoader = resLoader;
    
    return resLoader;
}

const generateItems = async (config:GameConfig, feedbackNode:HTMLElement, generators:Record<string,any>) =>
{
    sendProgressPhaseSignal(feedbackNode, "Creating Material");
    await letDomUpdate();

    const items = {};
    for(const [id,generator] of Object.entries(generators))
    {
        let value = [];
        if(typeof generator == "function") { 
            value = await generator(config)
        } else {
            await generator.generate()
            value = generator.get();
        }
	    if(!Array.isArray(value)) { value = [value]; }
        items[id] = value;
    }

    if(config._debug.picker) { console.log(`[Debug] Pickers`, items); }
    return items;
}

const generateDrawCalls = (config:GameConfig, allItems:Record<string,any>, mappers:Record<string,any>) : MaterialDrawCall[] =>
{
    if(config._debug.onlyGenerate) { return []; }

    const itemsOfType = {};

    // collect all items (and the visualizer for them), but don't draw them yet
    // so far, mappers are always just GridMappers, though that might generalize in the future
    const drawCalls:MaterialDrawCall[] = [];
    // no fallback here: a material's own splitDims must still win when the global setting is unset
    const splitDimsGlobal = getSettingDefault("splitDims", config);
    for(const [id,mapper] of Object.entries(mappers))
    {
        const materialConfig = config._material[id];
        const items = allItems[id];

        // if we intend to split the image later, we need to draw it enlarged to keep it high resolution
        const splitDims = getSplitDimsAsPoint(splitDimsGlobal ?? materialConfig.splitDims);
        const itemSize = makeSizeSplittable(mapper.getMaxElementSize(), splitDims);

        const visualizerClass = (materialConfig.visualizer ?? config._generation.visualizer) ?? MaterialVisualizer;
        const visualizer = new visualizerClass(config, itemSize);
        if(config._debug.visualizer) { visualizer.debug = true; }

        const frontDefault = materialConfig.frontDefault ? materialConfig.frontDefault.draw(visualizer) : null;
        const backDefault = materialConfig.backDefault ? materialConfig.backDefault.draw(visualizer) : null;

        for(const item of items)
        {
            const type = item.type ?? "default";
            if(!itemsOfType[type]) { itemsOfType[type] = []; }
            itemsOfType[type].push(item);
            if(config._debug.singleDrawPerType && itemsOfType[type].length > 1) { continue; }

            drawCalls.push({ 
                item: item, 
                mapper: mapper, 
                visualizer: visualizer, 
                splitDims: splitDims, 
                frontDefault: frontDefault,
                backDefault : backDefault
            });
        }
    }

    return drawCalls
}

const drawItems = async (config: GameConfig, feedbackNode:HTMLElement, drawCalls:MaterialDrawCall[], renderer:Renderer) =>
{
    sendProgressPhaseSignal(feedbackNode, "Drawing Material");

    if(drawCalls.length <= 0) { return; }
    await letDomUpdate();

    // The audit only ever looks at a couple of pages. Drawing the rest of the deck anyway meant every sweep
    // paid full price (and full memory) for cards it then threw away at PDF time, so cap the work here, where
    // it is actually spent. Production never sets this.
    const pageLimit = (((window as any).__auditPdf ?? {}) as { maxPages?:number }).maxPages ?? 0;
    if(pageLimit > 0)
    {
        const kept:MaterialDrawCall[] = [];
        const drawnPerMapper = new Map<GridMapper, number>();
        for(const call of drawCalls)
        {
            const perPage = Math.max(1, call.mapper.getElementsPerPage());
            const drawn = drawnPerMapper.get(call.mapper) ?? 0;
            if(drawn >= pageLimit * perPage) { continue; }
            drawnPerMapper.set(call.mapper, drawn + 1);
            kept.push(call);
        }
        drawCalls = kept;
    }

    let batchSize = (renderer.customBatchSize ?? config._generation.batchSize) ?? DEFAULT_BATCH_SIZE;

    // because we draw them in small batches to prevent overloading the browser
    // (and give intermittent feedback to user)
    if(batchSize <= 0 || config._generation.noBatching) { batchSize = drawCalls.length; }
    const numBatches = Math.ceil(drawCalls.length / batchSize);

    for(let i = 0; i < numBatches; i++)
    {
        const infoText = "Drawing batch " + (i+1) + " / " + numBatches;
        console.log(infoText);
        sendProgressInfoSignal(feedbackNode, infoText);
        await letDomUpdate();

        const promisesFront = [];
        const promisesBack = [];
        const drawCallsInBatch = drawCalls.splice(0, batchSize);
        for(const drawCall of drawCallsInBatch)
        {
            // cards handle drawing themselves (override by default if set)
            if(!("draw" in drawCall.item)) { console.error(`Item in DrawCall has no draw function`, drawCall); continue; }
            
            // the array stuff allows the draw call to return _multiple_ things -> not recommended almost ever, but at least handles it now
            let resultsFront = drawCall.frontDefault ?? drawCall.item.draw(drawCall.visualizer);
            if(!Array.isArray(resultsFront)) { resultsFront = [resultsFront]; }

            let resultsBack = drawCall.backDefault ?? (("drawBack" in drawCall.item) ? drawCall.item.drawBack(drawCall.visualizer) : null);
            if(!Array.isArray(resultsBack)) { resultsBack = [resultsBack]; }
            for(let i = 0; i < (resultsFront.length - resultsBack.length); i++) { resultsBack.push(null); } // pad to ensure equal length

            promisesFront.push(...resultsFront);
            promisesBack.push(...resultsBack);
        }

        const canvasesFront = await Promise.all(promisesFront);
        const canvasesBack = await Promise.all(promisesBack);
        const numCanvases = canvasesFront.length;
        for(let i = 0; i < numCanvases; i++)
        {
            const drawCall = drawCallsInBatch[i];
            
            // almost all cases will just have splitDims = 1x1, which means this just returns [originalCanvas]
            const canvasesFrontFinal = splitCanvas(canvasesFront[i], drawCall.splitDims);
            const canvasesBackFinal = canvasesBack[i] ? splitCanvas(canvasesBack[i], drawCall.splitDims) : new Array(canvasesFrontFinal.length).fill(null);
            for(let c = 0; c < canvasesFrontFinal.length; c++)
            {
                drawCall.mapper.addElement(canvasesFrontFinal[c], canvasesBackFinal[c]);
            }
        }
    }
}

const downloadPDF = async (config:GameConfig, feedbackNode: HTMLElement, mappers:Record<string,any>) =>
{
    if(config._debug.onlyGenerate) { return; }

    sendProgressPhaseSignal(feedbackNode, "Preparing PDF(s)");

    // One PDF per material, deliberately. This used to keep a Map keyed by the mapper's page-size *object*,
    // which promised "one builder per size" but never delivered it: every mapper owns its own Vector2, so the
    // lookup always missed and every material got its own builder anyway—only the comment was wrong. A
    // material owns its fileName and its split, so separate documents are the behaviour to keep.
    // The audit harness tests that the pipeline runs, not what the material looks like: two pages and an
    // uncompressed PDF are the same code path without paying for hundreds of PNG encodes. Production code
    // never sets this, so nothing here changes for a user.
    const auditPdf = ((window as any).__auditPdf ?? {}) as { maxPages?:number, compression?:PdfCompression };

    const pdfBuilders:PdfBuilder[] = [];
    const materialKeys = Object.keys(mappers);
    const multipleMaterials = materialKeys.length > 1;
    const baseFileName = config._game.fileName ?? config._game.name ?? "Generated Game";
    let lastProgressUpdate = 0;
    for(const [key,mapper] of Object.entries(mappers))
    {
        // an explicitly named material keeps its name; the rest only need a suffix when there is more than
        // one document, because "Mapped Out.pdf" twice is exactly the collision this avoids
        const materialFileName = config._material[key].fileName;
        const fileName = materialFileName ?? (multipleMaterials ? `${baseFileName} - ${formatMaterialName(key)}` : baseFileName);
        const pageParams:PdfPageConfig = {
            size: mapper.getPageSize(), 
            debugWithoutFile: config._debug.omitFile, 
            lossless: config._generation.losslessPdf,
            compression: auditPdf.compression,
            maxPages: auditPdf.maxPages,
            fileName: fileName,
        };
        // jsPDF is fetched on demand: this is the only moment a generation needs it
        const pdfBuilder = await PdfBuilder.create(pageParams);
        pdfBuilders.push(pdfBuilder);

        // draw everything into that new PDF
        const canvases = mapper.getCanvases();
        const numPages = canvases.length;

        // audit-only: keep a few downscaled previews of this PDF's pages as marketing/QA renders.
        // The hook is absent outside the audit, and it captures before the loop releases the canvases.
        const auditCapturePages = (window as any).__auditCapturePdfPages;
        if(auditCapturePages) { auditCapturePages(fileName, canvases); }
        for(let i = 0; i < numPages; i++)
        {
            // stop converting once the builder is full: toDataURL + decode of a 300 DPI page is the single
            // most expensive step here, so a capped run must skip it, not just skip the addImage
            if(pdfBuilder.isFull) { break; }

            // a DOM update + console line per page is real work (layout, plus a console message the audit
            // serialises); nobody reads every one of them
            const now = performance.now();
            if(now - lastProgressUpdate > 250 || i === numPages - 1)
            {
                lastProgressUpdate = now;
                sendProgressInfoSignal(feedbackNode, "Adding page " + (i+1) + " / " + numPages + " to PDF");
                await letDomUpdate();
            }

            // jsPDF takes a canvas directly (it encodes it itself, see the CANVAS branch in jspdf's
            // addImage_image), so handing over the canvas skips an entire toDataURL → <img> → decode
            // round-trip and never holds a decoded 300 DPI bitmap in memory
            pdfBuilder.addImage(canvases[i]);

            // release the page bitmap immediately: one 300 DPI A4 page is ~34 MB of RGBA, and holding a whole
            // deck of them alive is what turned long generations into an out-of-memory crash
            canvases[i].width = 0;
            canvases[i].height = 0;
        }
    }

    const numPdfs = pdfBuilders.length;
    sendProgressInfoSignal(feedbackNode, `Compressing PDFs (${numPdfs}) (final step).`);
    await letDomUpdate();

    // download all PDFs created
    for(const builder of pdfBuilders)
    {
        builder.downloadPDF();
    }
    
}

const setupRenderer = (config:GameConfig) =>
{
    const renderer = config._game.renderer ?? new RendererPandaqi();
    config._game.renderer = renderer;
    renderer.debugLayoutOperation = debugEnabled(config, "layoutOperation");
    renderer.debugText = debugEnabled(config, "text");
    setStrictWarnings(debugEnabled(config, "strict"));
    return renderer; 
}

export const generateMaterial = async (config:GameConfig) =>
{
    const startTime = Date.now();
    const feedbackNode = config._settings.meta.feedbackNode;
    sendProgressPhaseSignal(feedbackNode, "Starting");

    // prepare config
    addConfigFromLocalStorage(config);
    ensureConfigProperties(config);

    // seeding: the same settings + seed must yield the same material (an empty seed means "new random one")
    const seedSetting = config._settings.defaults.seed;
    if(!seedSetting.value) { seedSetting.value = getRandomSeedString(); }
    setSeed(String(seedSetting.value));

    if(config._debug.profile) { console.log(`[Debug] Generation config`, config); }

    // register elements needed
    const generators = {};
    const mappers = {};
    const material:Record<string,MaterialConfig> = config._material ?? {};
    for(const [key,value] of Object.entries(material))
    {
        // Shared configs declare a material (and its page mapper) for every game that might need it,
        // without a picker; a game that actually uses it adds one. No picker means "this game does not
        // generate this material", not an error.
        if(typeof value.picker != "function") { continue; }

        generators[key] = value.picker();
        mappers[key] = createGridMapperFromConfig(config, value.mapper);
    }

    // create, draw, finalize
    const renderer = setupRenderer(config);
    const resLoader = await loadResources(config, feedbackNode, renderer);
    const items = await generateItems(config, feedbackNode, generators);
    const drawCalls = generateDrawCalls(config, items, mappers);
    await drawItems(config, feedbackNode, drawCalls, renderer);
    await downloadPDF(config, feedbackNode, mappers);

    // finishing touches
    sendProgressPhaseSignal(feedbackNode, "Done!");
    sendProgressInfoSignal(feedbackNode, "PDF Downloaded!");
    const endTime = Date.now();
    const profilePerformance = config._debug.profile ?? false;
    if(profilePerformance) { console.log("Generation Time = ", endTime - startTime); }
}