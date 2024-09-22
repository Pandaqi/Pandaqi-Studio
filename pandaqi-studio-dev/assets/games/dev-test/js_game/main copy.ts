import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import TintEffect from "js/pq_games/layout/effects/tintEffect";
import GridMapper from "js/pq_games/layout/gridMapper";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import RendererPixi from "js/pq_games/layout/renderers/rendererPixi";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import ResourceImage from "js/pq_games/layout/resources/resourceImage";
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig from "js/pq_games/layout/text/textConfig";
import PdfBuilder from "js/pq_games/pdf/pdfBuilder";
import { PageOrientation } from "js/pq_games/pdf/pdfEnums";
import Circle from "js/pq_games/tools/geometry/circle";
import Point from "js/pq_games/tools/geometry/point";
import Rectangle from "js/pq_games/tools/geometry/rectangle";

const TEST_ASSETS = {
    creatures_1: {
        path: "/dev-test/assets/quellector_creatures_1.webp",
        frames: new Point(8,2)
    },
    font: {
        key: "Comica Boom",
        path: "/dev-test/assets/fonts/Comica Boom.otf",
        size: 0.1285
    },

    misc: {
        path: "/naivigation/assets/misc.webp",
        frames: new Point(5,1)
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
    const size = new Point(3,3);

    const gridConfig = { pdfBuilder: pdfBuilder, size: size };
    const gridMapper = new GridMapper(gridConfig);
    console.log("== Grid Mapper Created");
    console.log(gridMapper);
    return gridMapper;
}

const testSingleImage = async (canv, resLoader) =>
{
    const res = resLoader.getResource("creatures_1") as ResourceImage;
    const spriteParams = {
        pos: new Point(256, 256),
        size: new Point(150),
        rot: 0.25*Math.PI,
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
        size: new Point(150),
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
        pos: new Point(128, 128),
        rot: -0.25 * Math.PI
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
    const canvOp = new LayoutOperation({
        size: new Point(512,256),
        composite: "overlay"
    });

    const group = new ResourceGroup();
    group.add(res, canvOp);
    group.toCanvas(canv);
}

const testPixiImages = async () =>
{
    // create PIXI app/renderer
    const renderer = new RendererPixi({
        bgColor: "#AAAAFF"
    });
    renderer.prepareDraw();

    // load all assets
    const resLoader = new ResourceLoader({ renderer: renderer });
    for(const [key,data] of Object.entries(TEST_ASSETS))
    {
        resLoader.planLoad(key, data);
    }
    await resLoader.loadPlannedResources();

    // place test image
    const res = resLoader.getResource("misc");
    const op = new LayoutOperation({
        pos: new Point(80,80),
        rot: 0.2*Math.PI,
        size: new Point(200,200),
        pivot: Point.CENTER
    });

    // place test graphics
    const resRect = new ResourceShape(new Rectangle().fromTopLeft(new Point(), new Point(500,50)));
    const opRect = new LayoutOperation({
        fill: "#FF0000",
        //effects: [ new DropShadowEffect({ color: "#333333", blur: 2 }) ],
        composite: "multiply"
    })

    // place test text
    const textConfig = new TextConfig({
        font: TEST_ASSETS.font.key,
        size: 32
    });
    const resText = new ResourceText({ text: "Ik ben <b>Tiamo Pastoor</b>. Wie <i>ben jij</i>?", textConfig: textConfig });
    const opText = new LayoutOperation({
        pos: new Point(300,300),
        size: new Point(300, 300),
        fill: "#000000",
    })
    
    const group = new ResourceGroup();
    group.add(res, op);
    group.add(resRect, opRect);
    group.add(resText, opText);

    const canv = await renderer.finishDraw({ size: new Point(1280,720), group: group });
    document.body.appendChild(canv);
}

const runTests = async () =>
{
    //const resLoader = await testAssetLoading();
    //const pdfBuilder = testPDFBuilder();
    //const gridMapper = testGridMapper(pdfBuilder);
    
    //const size = gridMapper.getMaxElementSize();
    //const canv = createCanvas({ size: size })

    //const canv = createCanvas({ size: new Point(512, 512) });
    //await testSingleImage(canv, resLoader);
    //await testGroups(canv, resLoader);
    //document.body.appendChild(canv);

    testPixiImages();
}

runTests();

