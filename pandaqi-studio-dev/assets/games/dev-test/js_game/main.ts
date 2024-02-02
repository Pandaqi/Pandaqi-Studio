import createCanvas from "js/pq_games/layout/canvas/createCanvas";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import TintEffect from "js/pq_games/layout/effects/tintEffect";
import GridMapper from "js/pq_games/layout/gridMapper";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import ResourceImage from "js/pq_games/layout/resources/resourceImage";
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import PdfBuilder, { PageOrientation } from "js/pq_games/pdf/pdfBuilder";
import Circle from "js/pq_games/tools/geometry/circle";
import Point from "js/pq_games/tools/geometry/point";

const TEST_ASSETS = {
    creatures_1: {
        path: "/dev-test/assets/quellector_creatures_1.webp",
        frames: { x: 8, y: 2 }
    },
    font: {
        key: "Comica Boom",
        path: "/dev-test/assets/fonts/Comica Boom.otf",
        size: 0.1285
    },

    misc: {
        path: "/naivigation/assets/misc.webp",
        //frames: new Point(2,1)
    }
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

const testSingleImage = async (canv, resLoader) =>
{
    const res = resLoader.getResource("creatures_1") as ResourceImage;
    const spriteParams = {
        translate: new Point(256, 256),
        dims: new Point(150),
        rotation: 0.25*Math.PI,
        pivot: Point.CENTER,
        frame: 9,
    }
    const canvOp = new LayoutOperation(spriteParams);
    canvOp.addEffect(
        new TintEffect({ color: "#FF0000" })
    )
    canvOp.addEffect(
        new DropShadowEffect({ blur: 10, color: "#000000", offset: new Point(5,5) })
    )

    await res.toCanvas(canv, canvOp);

    console.log("== Single Image Placed ==");
    console.log(res);
    console.log(canvOp);
}

const testGroups = async (canv, resLoader) =>
{
    const res = resLoader.getResource("creatures_1") as ResourceImage;
    const resOp = new LayoutOperation({
        dims: new Point(150),
        pivot: Point.CENTER,
        frame: 9,
    });

    const resCenter = new ResourceShape(new Circle({ radius: 20 }));
    const resCenterOp = new LayoutOperation({
        fill: "#FF0000",
    })

    const group = new ResourceGroup();
    group.add(res, resOp);
    group.add(resCenter, resCenterOp);

    const groupOp = new LayoutOperation({
        translate: new Point(128, 128),
        rotation: -0.25 * Math.PI
    })
    console.log(groupOp);
    console.log("Drawing Group with subgroups");
    await group.toCanvas(canv, groupOp);
}

/*
const testSubGroups = async (canv, resLoader) =>
{
    const group = new ResourceGroup();
    group.add(res, resOp);
}
*/

const testCompositeOperation = async (canv, resLoader) =>
{
    fillCanvas(canv, "#F9C98C");

    const res = resLoader.getResource("misc") as ResourceImage;
    const spriteParams = {
        dims: new Point(512,256),
        composite: "overlay"
    }
    const canvOp = new LayoutOperation(spriteParams);

    const group = new ResourceGroup();
    group.add(res, canvOp);
    group.toCanvas(canv);
}

const runTests = async () =>
{
    const resLoader = await testAssetLoading();
    //const pdfBuilder = testPDFBuilder();
    //const gridMapper = testGridMapper(pdfBuilder);
    
    //const size = gridMapper.getMaxElementSize();
    //const canv = createCanvas({ size: size })

    const canv = createCanvas({ size: new Point(512, 512) });
    //await testSingleImage(canv, resLoader);
    //await testGroups(canv, resLoader);

    testCompositeOperation(canv, resLoader);

    canv.style.outline = "5px solid red";

    document.body.appendChild(canv);
}

runTests();

