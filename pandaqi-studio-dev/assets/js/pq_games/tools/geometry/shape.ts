import CanvasOperation from "js/pq_games/canvas/canvasOperation";
import Point from "./point";

export default class Shape
{
    toPath() : Point[] { return []; }
    toSVG() : HTMLElement { return null; }
    drawTo(canv:HTMLCanvasElement|CanvasRenderingContext2D, op:CanvasOperation) { return; }
}