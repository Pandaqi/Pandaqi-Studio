import BoardState from "./boardState";
// @ts-ignore
import { Geom, Display } from "js/pq_games/phaser/phaser.esm"
import CONFIG from "./config";
import PointGraph from "js/pq_games/tools/geometry/pointGraph";
import Point from "js/pq_games/tools/geometry/point";
import shuffle from "js/pq_games/tools/random/shuffle";
import equidistantColors from "js/pq_games/layout/color/equidistantColors";
import Region from "./region";
import Line from "js/pq_games/tools/geometry/line";
import Area from "./area";
import Path from "js/pq_games/tools/geometry/paths/path";


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

        const rect = new Geom.Rectangle(0, 0, canvSize.x, canvSize.y);
        this.graphics.fillStyle(0x000000);
        this.graphics.fillRectShape(rect);


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
        this.graphics.fillStyle(0xFF0000, 1.0);
        for(const point of points)
        {
            const pos = this.convertToRealPosition(point);
            const circ = new Geom.Circle(pos.x, pos.y, 10);
            this.graphics.fillCircleShape(circ);
        }
    }

    getColorForHeight(h:number)
    {
        if(h < 0.5) { return 0x0000FF; }
        return 0x00FF00;
    }

    drawRegions(list:Region[], col:number)
    {
        this.graphics.lineStyle(1, 0x000000, 1.0);
        for(const region of list)
        {
            this.drawRegion(region, col);   
        }
    }

    drawRegion(region:Region, col:number = 0xFF0000)
    {
        const alpha = region.getType() == "land" ? 1.0 : 0.4;
        const poly = new Geom.Polygon(this.convertToRealPositions(region.getPointsDisplay()));
        this.graphics.fillStyle(col, alpha);
        this.graphics.fillPoints(poly.points);

        this.graphics.strokePoints(poly.points);
    }

    getAreaColor(area:Area)
    {
        if(!area.hasContinent()) { return 0x0000FF; }
        const numAreasInContinent = area.continent.count();
        const index = area.continent.indexOf(area);

        const rawColor = this.colorsContinents[area.continent.id];
        const maxColorChange = CONFIG.generation.continents.maxColorChange;
        const changeFactor = (index / numAreasInContinent) * maxColorChange;
        const color = rawColor.clone().lighten(-changeFactor);

        return color.toHEXNumber();
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

    drawOutline(paths:Path[])
    {
        for(const path of paths)
        {
            const pathReal = this.convertToRealPositions(path.toPath());
            const l = new Geom.Polygon(pathReal);
            this.graphics.strokePoints(l.points);
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
        this.graphics.lineStyle(8, 0x000000, alpha);
        this.drawOutline(area.getOutlines());
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
            this.drawRegion(nb, 0x00FF00)
        }
    }

    drawCentroid(p:Point)
    {
        const c = this.convertToRealPosition(p);
        const circ = new Geom.Circle(c.x, c.y, 15);
        this.graphics.fillStyle(0xFF0000);
        this.graphics.fillCircleShape(circ);
        this.graphics.lineStyle(3, 0x000000);
        this.graphics.strokeCircleShape(circ);
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
        const textCfg = {
            fontFamily: "Arial",
            fontSize: radius + "px",
            color: "#FFFFFF"
        }

        for(const continent of b.continents.get())
        {
            const circle = new Geom.Circle(pos.x, pos.y, radius);
            const color = this.colorsContinents[continent.id].toHEXNumber();
            this.graphics.fillStyle(color);
            this.graphics.fillCircleShape(circle);

            const score = continent.calculateScore();
            const text = this.game.add.text(pos.x + 2*radius, pos.y, score.toString(), textCfg);
            text.setOrigin(0, 0.5);
            pos.y += 2 * (radius + margin);
        }
    }

}