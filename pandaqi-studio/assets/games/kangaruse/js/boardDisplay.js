import { Geom, Display } from "js/pq_games/phaser.esm"
import Point from "js/pq_games/tools/geometry/point"
import smoothPath from "js/pq_games/tools/geometry/smoothPath"
import { MAIN_TYPES } from "./dictionary"

export default class BoardDisplay
{
	constructor(game)
	{
		this.game = game;
        this.cfg = this.game.cfg;
        this.cfgBoard = this.cfg.board;
        this.resolutionPerCell = this.cfgBoard.resolutionPerCell;

        this.paperDimensions = { x: this.game.canvas.width, y: this.game.canvas.height };

        const outerMarginFactor = this.cfgBoard.outerMarginFactor;
        this.outerMargin = { x: this.paperDimensions.x * outerMarginFactor.x, y: this.paperDimensions.y * outerMarginFactor.y };
        this.boardDimensions = { x: this.paperDimensions.x - 2*this.outerMargin.x, y: this.paperDimensions.y - 2*this.outerMargin.y };
	}

    draw(board)
    {        
        this.board = board;
        this.dims = board.getDimensions();
        this.cellSize = { 
            x: this.boardDimensions.x / this.dims.x, 
            y: this.boardDimensions.y / this.dims.y 
        };
        this.cellSizeUnit = Math.min(this.cellSize.x, this.cellSize.y);

        // @TODO
    }

}