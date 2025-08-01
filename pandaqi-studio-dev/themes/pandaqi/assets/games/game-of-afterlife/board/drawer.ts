import { Vector2, Color, Rectangle, LayoutOperation, Circle, equidistantColors, FloodFillerTreeNode, smoothPath, thickenPath, Path } from "lib/pq-games";
import Board from "./board";
import { CONFIG } from "./config";

export default class Drawer
{
    game:any;
    graphics:any;
    canvSize:Vector2;
    canvUnit:number;
    cellSize: number;
    sectionColors: Color[];
    debugSquareColors: Color[];

    constructor(game:any)
    {
        this.game = game;
    }

    convertToRealPositions(points:Vector2[], offset:Vector2 = new Vector2())
    {
        const arr = [];
        for(const point of points)
        {
            arr.push(this.convertToRealPosition(point, offset));
        }
        return arr;
    }

    convertToRealPosition(p:Vector2, offset:Vector2 = new Vector2())
    {
        return p.clone().add(offset).scale(this.cellSize);
    }

    draw(board:Board)
    {
        this.canvSize = new Vector2(this.game.canvas.width, this.game.canvas.height);
        this.canvUnit = Math.min(this.canvSize.x, this.canvSize.y);
        this.cellSize = this.game.canvas.width / CONFIG.generation.mapWidth;        
        this.graphics = this.game.add.graphics();

        this.drawBackground();
        this.drawGrid(board);
        this.drawSections(board);
        this.drawPaths(board);
    }

    drawBackground()
    {
        const rect = new Rectangle().fromTopLeft(new Vector2(), this.canvSize);
        const op = new LayoutOperation({ fill: "#FFFFFF" });
        rectToPhaser(rect, op, this.graphics);
    }

    drawGrid(board:Board)
    {
        const points = board.getVector2s();
        const op = new LayoutOperation({ fill: "#FF0000" });
        for(const point of points)
        {
            const pos = this.convertToRealPosition(point);
            const circ = new Circle({ center: pos, radius: 10 });
            circleToPhaser(circ, op, this.graphics);
        }
    }

    drawSections(board:Board)
    {
        this.sectionColors = equidistantColors(board.sections.count(), 50, 50);
        this.drawSectionNode(board.sections.get());
    }

    drawSectionNode(n:FloodFillerTreeNode)
    {
        const op = new LayoutOperation({ fill: this.sectionColors.pop() });
        for(const point of n.floodFiller.get())
        {
            const realVector2 = this.convertToRealPosition(point);
            const rect = new Rectangle().fromTopLeft(realVector2, new Vector2(this.cellSize));
            rectToPhaser(rect, op, this.graphics);
        }

        for(const child of n.children)
        {
            this.drawSectionNode(child);
        }
    }

    drawPaths(board:Board)
    {
        const smoothResolution = CONFIG.display.paths.smoothResolution;
        const squareSize = CONFIG.generation.squareSizeInPathVector2s;
        const thickness = CONFIG.display.paths.thickness * this.cellSize;
        const squareSizeReal = squareSize * smoothResolution;

        const op = new LayoutOperation({ stroke: "#000000", strokeWidth: 10 });

        for(const path of board.paths)
        {
            let points = this.convertToRealPositions(path.toPath(), new Vector2(0.5));
            if(CONFIG.display.paths.smoothPath) { points = smoothPath({ path: points, resolution: smoothResolution }); }
            if(CONFIG.display.paths.thickenPath) { points = thickenPath({ path: points, thickness: thickness }); }

            this.debugSquareColors = equidistantColors(path.squares.length, 100, 75);

            if(CONFIG.display.showSquares)
            {
                for(let i = 0; i < path.squares.length; i++)
                {
                    const squareType = path.squares[i];
                    this.drawPathSquare(i, points, squareType, squareSizeReal);
                }
            }

            const pathObject = new Path({ points: points });
            pathToPhaser(pathObject, op, this.graphics);
        }
    }

    drawPathSquare(num:number, path:Vector2[], type: string, offset:number)
    {
        const left = path.slice(num * offset, (num+1)*offset + 1);
        const right = path.slice(path.length - (num+1)*offset - 1, path.length - (num * offset));
        const points = [left, right].flat();

        const pathObject = new Path({ points: points });
        const op = new LayoutOperation({ fill: this.debugSquareColors[num] });
        pathToPhaser(pathObject, op, this.graphics);
    }
}