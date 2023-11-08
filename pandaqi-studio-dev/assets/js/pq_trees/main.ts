import Point from "js/pq_games/tools/geometry/point";
import DecisionNode from "./decisionNode";
import DecisionNodeTree from "./decisionNodeTree";
import { loadFile } from "./loader";
import { parseNodesIntoTree, parseString } from "./parser";
import convertCanvasToImage from "js/pq_games/layout/canvas/convertCanvasToImage";

export default class DecisionTree
{
    container: HTMLElement;
    nodes: DecisionNode[];
    tree: DecisionNodeTree;

    constructor(cont:HTMLElement)
    {
        this.container = cont;
    }

    async load()
    {
        await this.parse();
        await this.draw();
    }

    // @TODO: any global properties of the tree can be set through dataset, 
    // or through some sort of "frontmatter" system in the parser?
    async parse()
    {
        let data = this.container.dataset.nodes ?? this.container.innerHTML;
        const fromFile = this.container.dataset.file;
        if(fromFile) { data = await loadFile(fromFile); }

        this.nodes = parseString(data);
        this.tree = parseNodesIntoTree(this.nodes);
        console.log(this.nodes);
        console.log(this.tree);
    }

    async draw()
    {
        this.container.innerHTML = "";
        const params = { 
            offset: new Point(),
            width: 280, 
            widthShrink: 0.9, 
            heightMargin: 24,
            fontSize: 32,
            keepSymmetrical: true,
            marginBetweenLayers: 240
        }
        this.tree.calculatePositions(params);

        const dims = this.tree.getMaxDistanceToMe();
        const edgeMargin = new Point(50, 50);

        const canv = document.createElement("canvas");
        canv.width = 2 * dims.x + 2*edgeMargin.x;
        canv.height = dims.y + 2*edgeMargin.y;

        const ctx = canv.getContext("2d");
        ctx.lineCap = "round";

        const offset = new Point(0.5 * canv.width, edgeMargin.y);
        params.offset = offset;

        await this.tree.draw(ctx, params);

        const img = await convertCanvasToImage(canv);
        img.style.width = "100%";
        img.style.height = "auto";
        this.container.appendChild(img);
    }
}