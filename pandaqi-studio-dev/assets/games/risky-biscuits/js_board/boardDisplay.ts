import BoardState from "./boardState";
import CONFIG from "./config";
import Point from "lib/pq-games/tools/geometry/point";
import equidistantColors from "lib/pq-games/layout/color/equidistantColors";
import Region from "./region";
import Area from "./area";
import Path from "lib/pq-games/tools/geometry/paths/path";
import Rectangle from "lib/pq-games/tools/geometry/rectangle";
import { circleToPhaser, pathToPhaser, rectToPhaser } from "lib/pq-games/phaser/shapeToPhaser";
import LayoutOperation from "lib/pq-games/layout/layoutOperation";
import Circle from "lib/pq-games/tools/geometry/circle";
import Color from "lib/pq-games/layout/color/color";
import ResourceText from "lib/pq-games/layout/resources/resourceText";
import TextConfig, { TextAlign } from "lib/pq-games/layout/text/textConfig";
import textToPhaser from "lib/pq-games/phaser/textToPhaser";


export default class BoardDisplay
{
    game:any;
    graphics:any;
    blockSize: Point;
    outerMargin: Point;
    boardSize: Point;
    colorsContinents: any;

    constructor(game:any)
    {
        this.game = game;
    }

    convertToRealPositions(points:Point[])
    {
        const arr = [];
        for(const point of points)
        {
            arr.push(this.convertToRealPosition(point));
        }
        return arr;
    }

    convertToRealPosition(p:Point)
    {
        const mapWidth = CONFIG.generation.mapWidth;
        const scaleFactor = this.game.canvas.width / mapWidth;
        return p.clone().scale(scaleFactor);
    }

    draw(board:BoardState)
    {
        const canvSize = new Point(this.game.canvas.width, this.game.canvas.height);
        const canvUnit = Math.min(canvSize.x, canvSize.y);
        
        this.graphics = this.game.add.graphics();

        const rect = new Rectangle().fromTopLeft(new Point(), canvSize);
        const op = new LayoutOperation({ fill: "#000000" });
        rectToPhaser(rect, op, this.graphics);

        //this.drawGrid(board);
        this.prepareContinents(board);
        this.prepareAreas(board);
        this.drawAreas(board);
        this.drawAreaOutlines(board);
        this.drawContinents(board);
        this.drawContinentScores(board);


        // @DEBUGGING
        /*
        for(let i = 0; i < 10; i++)
        {
            this.drawAreaAndOutline(board.areas[i]);
        }
        */

        // @DEBUGGING
        /*
        for(let i = 0; i < 5; i++)
        {
            this.drawRegionAndNeighbors(board.regions[i]);
        }
        */
    }
    
    prepareContinents(board:BoardState)
    {
        this.colorsContinents = equidistantColors(board.continents.count(), 75, 75);
    }

    prepareAreas(board:BoardState)
    {
        for(const area of board.areas)
        {
            area.clearOutlines();
        }

        for(const area of board.areas)
        {
            area.calculateOutlines();
        }
    }

    drawGrid(board:BoardState)
    {
        const points = board.getPoints();
        const op = new LayoutOperation({ fill: "#FF0000 "});

        this.graphics.fillStyle(0xFF0000, 1.0);
        for(const point of points)
        {
            const pos = this.convertToRealPosition(point);
            const circ = new Circle({ center: pos, radius: 10});
            circleToPhaser(circ, op, this.graphics);
        }
    }

    getColorForHeight(h:number)
    {
        if(h < 0.5) { return 0x0000FF; }
        return 0x00FF00;
    }

    drawRegions(list:Region[], col:string)
    {
        for(const region of list)
        {
            this.drawRegion(region, col);   
        }
    }

    drawRegion(region:Region, col:string = "#FF00000")
    {
        const alpha = region.getType() == "land" ? 1.0 : 0.4;

        const poly = new Path({ points: this.convertToRealPositions(region.getPointsDisplay()) });
        const op = new LayoutOperation({ fill: col, stroke: "#000000", strokeWidth: 1 });
        pathToPhaser(poly, op, this.graphics);
    }

    getAreaColor(area:Area)
    {
        if(!area.hasContinent()) { return "#0000FF"; }

        const numAreasInContinent = area.continent.count();
        const index = area.continent.indexOf(area);

        const rawColor = this.colorsContinents[area.continent.id];
        const maxColorChange = CONFIG.generation.continents.maxColorChange;
        const changeFactor = (index / numAreasInContinent) * maxColorChange;
        const color = rawColor.clone().lighten(-changeFactor);

        return color;
    }

    drawAreas(board:BoardState)
    {
        const areas = board.areas;

        const numAreas = areas.length
        for(let i = 0; i < numAreas; i++)
        {
            this.drawArea(areas[i]);

        }
    }

    drawAreaOutlines(board:BoardState)
    {
        const areas = board.areas;
        for(const area of areas)
        {
            this.drawAreaOutline(area);
        }
    }

    drawOutline(paths:Path[], op:LayoutOperation)
    {
        for(const path of paths)
        {
            const pathReal = this.convertToRealPositions(path.toPath());
            const pathObj = new Path({ points: pathReal });
            pathToPhaser(pathObj, op, this.graphics);
        }
    }

    drawArea(area:Area)
    {
        const color = this.getAreaColor(area)
        this.drawRegions(area.regions, color);
    }

    drawAreaOutline(area:Area)
    {
        const alpha = area.getType() == "sea" ? 0.2 : 1.0;
        const col = new Color("#000000");
        col.a = alpha;

        const op = new LayoutOperation({
            strokeWidth: 8,
            stroke: col
        })

        this.drawOutline(area.getOutlines(), op);
    }

    drawAreaAndOutline(area:Area)
    {
        this.drawArea(area);
        this.drawAreaOutline(area);
    }

    drawRegionAndNeighbors(r:Region)
    {
        this.drawRegion(r);
        for(const nb of r.getNeighbors())
        {
            this.drawRegion(nb, "#00FF00")
        }
    }

    drawCentroid(p:Point)
    {
        const c = this.convertToRealPosition(p);
        const op = new LayoutOperation({
            fill: "#FF0000",
            stroke: "#000000",
            strokeWidth: 3  
        })
        const circ = new Circle({ center: c, radius: 15 });
        circleToPhaser(circ, op, this.graphics);
    }

    drawContinents(board:BoardState)
    {
        for(const continent of board.continents.get())
        {
            //this.drawCentroid(continent.centroid);

            for(const area of continent.areas)
            {
                this.drawCentroid(area.centroid);

                for(const region of area.regions)
                {
                    //this.drawCentroid(region.centroid);
                }
            }

        }
    }

    drawContinentScores(b:BoardState)
    {
        const radius = 40;
        const margin = 10;

        const pos = new Point(radius+margin);
        const textConfig = new TextConfig({
            font: "Arial",
            size: radius,
            alignVertical: TextAlign.MIDDLE
        })

        for(const continent of b.continents.get())
        {
            const color = this.colorsContinents[continent.id];
            const op = new LayoutOperation({ fill: color, })
            const circ = new Circle({ center: pos, radius: radius });
            circleToPhaser(circ, op, this.graphics);

            const scoreText = continent.calculateScore().toString();
            const textPos = new Point(pos.x + 2*radius, pos.y);

            const res = new ResourceText({ text: scoreText, textConfig: textConfig });
            const textOp = new LayoutOperation({
                fill: Color.WHITE,
                pos: textPos
            })
            textToPhaser(res, textOp, this.game);

            pos.y += 2 * (radius + margin);
        }
    }

}