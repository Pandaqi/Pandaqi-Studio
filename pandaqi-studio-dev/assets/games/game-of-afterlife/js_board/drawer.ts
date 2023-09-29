import Board from "./board";
import CONFIG from "./config";
import Point from "js/pq_games/tools/geometry/point";
import thickenPath from "js/pq_games/tools/geometry/paths/thickenPath";
import smoothPath from "js/pq_games/tools/geometry/paths/smoothPath";
import { FloodFillerTreeNode } from "js/pq_games/tools/generation/floodFillerTree";
import equidistantColors from "js/pq_games/layout/color/equidistantColors";
import Color from "js/pq_games/layout/color/color";
import Rectangle from "js/pq_games/tools/geometry/rectangle";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import { circleToPhaser, pathToPhaser, rectToPhaser } from "js/pq_games/phaser/shapeToPhaser";
import Circle from "js/pq_games/tools/geometry/circle";
import Path from "js/pq_games/tools/geometry/paths/path";

export default class Drawer
{
    game:any;
    graphics:any;
    canvSize:Point;
    canvUnit:number;
    cellSize: number;
    sectionColors: Color[];
    debugSquareColors: Color[];

    constructor(game:any)
    {
        this.game = game;
    }

    convertToRealPositions(points:Point[], offset:Point = new Point())
    {
        const arr = [];
        for(const point of points)
        {
            arr.push(this.convertToRealPosition(point, offset));
        }
        return arr;
    }

    convertToRealPosition(p:Point, offset:Point = new Point())
    {
        return p.clone().add(offset).scale(this.cellSize);
    }

    draw(board:Board)
    {
        this.canvSize = new Point(this.game.canvas.width, this.game.canvas.height);
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
        const rect = new Rectangle().fromTopLeft(new Point(), this.canvSize);
        const op = new LayoutOperation({ fill: "#FFFFFF" });
        rectToPhaser(rect, op, this.graphics);
    }

    drawGrid(board:Board)
    {
        const points = board.getPoints();
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
            const realPoint = this.convertToRealPosition(point);
            const rect = new Rectangle().fromTopLeft(realPoint, new Point(this.cellSize));
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
        const squareSize = CONFIG.generation.squareSizeInPathPoints;
        const thickness = CONFIG.display.paths.thickness * this.cellSize;
        const squareSizeReal = squareSize * smoothResolution;

        const op = new LayoutOperation({ stroke: "#000000", strokeWidth: 10 });

        for(const path of board.paths)
        {
            let points = this.convertToRealPositions(path.toPath(), new Point(0.5));
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

    drawPathSquare(num:number, path:Point[], type: string, offset:number)
    {
        const left = path.slice(num * offset, (num+1)*offset + 1);
        const right = path.slice(path.length - (num+1)*offset - 1, path.length - (num * offset));
        const points = [left, right].flat();

        const pathObject = new Path({ points: points });
        const op = new LayoutOperation({ fill: this.debugSquareColors[num] });
        pathToPhaser(pathObject, op, this.graphics);
    }
}