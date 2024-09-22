// This is just a suite of test functions to profile the performance of my rendering/layout system

import LayoutOperation from "js/pq_games/layout/layoutOperation";
import RendererPandaqi from "js/pq_games/layout/renderers/rendererPandaqi";
import ResourceImage from "js/pq_games/layout/resources/resourceImage";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig from "js/pq_games/layout/text/textConfig";
import Point from "js/pq_games/tools/geometry/point";

const profile = (label:string, repeat:number = 1, func:Function) =>
{
    const startTime = Date.now()
    for(let i = 0; i < repeat; i++)
    {
        func()
    }
    const endTime = Date.now()
    console.log("[Profiler] " + label + " (" + repeat + " times) took " + (endTime - startTime) + " ms");
}

export default async () =>
{
    const num = 100;
    profile("Default RendererPandaqi Creation", num, () => {
        const rend = new RendererPandaqi();
    })
    
    profile("Empty LayoutOperation Creation", num, () => {
        const op = new LayoutOperation();
    })
    
    profile("Empty ResourceImage Creation", num, () => {
        const res = new ResourceImage();
    })
    
    profile("Empty ResourceText Creation", num, () => {
        const res = new ResourceText();
    })
    
    profile("Empty ResourceShape Creation", num, () => {
        const res = new ResourceShape();
    })

    profile("Complex LayoutOperation Creation", num, () => {
        const op = new LayoutOperation({
            pos: new Point(50,50),
            rot: Math.PI,
            size: new Point(100,100),
            pivot: Point.CENTER
        });
    })

    profile("Complex ResourceImage Creation", num, () => {
        const img = new Image();
        img.src = "/dev-test/assets/quellector_creatures_1.webp";
        const params = { frames: new Point(8,2) }
        const res = new ResourceImage(img, params);
    })

    profile("Complex ResourceText Creation", num, () => {
        const textConfig = new TextConfig({
            font: "Arial",
            size: 64
        }).alignCenter();

        const resText = new ResourceText("Lala <b>vlavla</b> lalala.", textConfig);
    })

    const canv = document.createElement("canvas");
    canv.width = 512;
    canv.height = 512;

    const img = new Image();
    img.src = "/dev-test/assets/quellector_creatures_1.webp";
    await img.decode();

    const params = { frames: new Point(8,2) }
    const res = new ResourceImage(img, params);

    profile("Simple ResourceImage Drawing", num, () => {
        res.toCanvas(canv);
    })
}
