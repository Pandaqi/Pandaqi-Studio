import Point from "js/pq_games/tools/geometry/point";
import Rectangle from "js/pq_games/tools/geometry/rectangle";
import CONFIG from "./config";
import PlayerArea from "./playerArea";

export default class PlayerAreas
{
    boardState
    areas: PlayerArea[]
    trajectoryBoardOffset: Point

    constructor(boardState)
    {
        this.boardState = boardState;
        this.areas = [];
    }

    get() { return this.areas; }
    generatePre()
    {
        if(!CONFIG.display.playerAreas.include) { return; }

        const dims = this.boardState.dims;
        const off = CONFIG.display.playerAreas.edgeOffset;
        const areaSizeRaw = CONFIG.display.playerAreas.sizeRaw;
        const areas = [
            { anchor: new Point(off.x, 1.0-off.y-areaSizeRaw.y/dims.y), rotation: 0, size: null },
            { anchor: new Point(0.5+off.x, 1.0-off.y-areaSizeRaw.y/dims.y), rotation: 0 },
            { anchor: new Point(1.0-off.x, 1.0-off.y-areaSizeRaw.y/dims.y), rotation: 3 },
            { anchor: new Point(1.0-off.x, off.y), rotation: 2 },
            { anchor: new Point(0.5-off.x, off.y), rotation: 2 },
            { anchor: new Point(off.x, off.y), rotation: 1 }
        ]
        const areaSize = areaSizeRaw.clone().scale(new Point(dims.x, 1));

        CONFIG.generation.calculatedTrajectoryRectOffset = new Point(
            off.x + 2*areaSizeRaw.y, 
            off.y + 2*areaSizeRaw.y
        );

        for(const areaData of areas)
        {
            areaData.size = areaSize;
            areaData.anchor.scale(dims);
            const playerArea = new PlayerArea(areaData);
            this.areas.push(playerArea);
            this.boardState.forbiddenAreas.add(playerArea.getRectangle());
        }

        
    }
}