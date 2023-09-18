import createCanvas from "js/pq_games/layout/canvas/createCanvas";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import TintEffect from "js/pq_games/layout/effects/tintEffect";
import GridMapper from "js/pq_games/layout/gridMapper";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceImage from "js/pq_games/layout/resources/resourceImage";
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader";
import PdfBuilder, { PageOrientation } from "js/pq_games/pdf/pdfBuilder";
import Point from "js/pq_games/tools/geometry/point";

const TEST_ASSETS = {
    creatures_1: {
        path: "assets/quellector_creatures_1.webp",
        frames: { x: 8, y: 2 }
    },
    font: {
        key: "Comica Boom",
        path: "assets/fonts/Comica Boom.otf",
        size: 0.1285
    },
}

const testAssetLoading = async () =>
{
    const resLoader = new ResourceLoader();
    for(const [key,data] of Object.entries(TEST_ASSETS))
    {
        resLoader.planLoad(key, data);
    }
    await resLoader.loadPlannedResources();

    console.log("== Resources Loaded ==");
    console.log(resLoader.resourcesLoaded);

    return resLoader;
}

const testPDFBuilder = () =>
{
    const pdfBuilderConfig = { orientation: PageOrientation.PORTRAIT };
    const pdfBuilder = new PdfBuilder(pdfBuilderConfig);
    console.log("== PDF Builder Created ==");
    console.log(pdfBuilder);
    return pdfBuilder;
}

const testGridMapper = (pdfBuilder) =>
{
    const dims = new Point(3,3);

    const gridConfig = { pdfBuilder: pdfBuilder, dims: dims };
    const gridMapper = new GridMapper(gridConfig);
    console.log("== Grid Mapper Created");
    console.log(gridMapper);
    return gridMapper;
}

const testSingleImage = (canv, resLoader) =>
{
    const res = resLoader.getResource("creatures_1") as ResourceImage;
    const spriteParams = {
        translate: new Point(0, 0),
        dims: new Point(150),
        rotation: Math.PI,
        pivot: new Point(0.5),
        frame: 9,
    }
    const canvOp = new LayoutOperation(spriteParams);
    canvOp.addEffect(
        new TintEffect({ color: "#FF0000" })
    )
    canvOp.addEffect(
        new DropShadowEffect({ blur: 10, color: "#000000", offset: new Point(35, 35) })
    )

    res.toCanvas(canv, canvOp);

    console.log("== Single Image Placed ==");
    console.log(res);
    console.log(canvOp);
}

const runTests = async () =>
{
    const resLoader = await testAssetLoading();
    const pdfBuilder = testPDFBuilder();
    const gridMapper = testGridMapper(pdfBuilder);
    
    const size = gridMapper.getMaxElementSize();
    const canv = createCanvas({ size: size })

    testSingleImage(canv, resLoader);

    document.body.appendChild(canv);
}

runTests();

