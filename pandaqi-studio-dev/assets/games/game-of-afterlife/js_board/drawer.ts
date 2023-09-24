// @ts-ignore
import { Geom, Display } from "js/pq_games/phaser.esm"
import Board from "./board";
import CONFIG from "./config";
import Point from "js/pq_games/tools/geometry/point";
import thickenPath from "js/pq_games/tools/geometry/paths/thickenPath";
import smoothPath from "js/pq_games/tools/geometry/paths/smoothPath";
import { FloodFillerTreeNode } from "js/pq_games/tools/generation/floodFillerTree";
import fromArray from "js/pq_games/tools/random/fromArray";
import equidistantColors from "js/pq_games/layout/color/equidistantColors";
import Color from "js/pq_games/layout/color/color";

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
        const rect = new Geom.Rectangle(0, 0, this.canvSize.x, this.canvSize.y);
        this.graphics.fillStyle(0xFFFFFF);
        this.graphics.fillRectShape(rect);
    }

    drawGrid(board:Board)
    {
        const points = board.getPoints();
        this.graphics.fillStyle(0xFF0000, 1.0);
        for(const point of points)
        {
            const pos = this.convertToRealPosition(point);
            const circ = new Geom.Circle(pos.x, pos.y, 10);
            this.graphics.fillCircleShape(circ);
        }
    }

    drawSections(board:Board)
    {
        this.sectionColors = equidistantColors(board.sections.count(), 50, 50);
        this.drawSectionNode(board.sections.get());
    }

    drawSectionNode(n:FloodFillerTreeNode)
    {
        this.graphics.fillStyle(this.sectionColors.pop().toHEXNumber());

        for(const point of n.floodFiller.get())
        {
            const realPoint = this.convertToRealPosition(point);
            const rect = new Geom.Rectangle(realPoint.x, realPoint.y, this.cellSize, this.cellSize);
            this.graphics.fillRectShape(rect);
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

            const poly = new Geom.Polygon(points);
            this.graphics.lineStyle(10, 0x000000);
            this.graphics.strokePoints(poly.points);
        }
    }

    drawPathSquare(num:number, path:Point[], type: string, offset:number)
    {
        const left = path.slice(num * offset, (num+1)*offset + 1);
        const right = path.slice(path.length - (num+1)*offset - 1, path.length - (num * offset));
        const points = [left, right].flat();

        const poly = new Geom.Polygon(points);
        this.graphics.fillStyle(this.debugSquareColors[num].toHEXNumber());
        this.graphics.fillPoints(poly.points);
    }
}