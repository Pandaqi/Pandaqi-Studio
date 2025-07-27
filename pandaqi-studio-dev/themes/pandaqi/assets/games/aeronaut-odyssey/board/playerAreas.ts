import Point from "lib/pq-games/tools/geometry/point";
import Rectangle from "lib/pq-games/tools/geometry/rectangle";
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
        if(CONFIG.useRealMaterial) { return; }

        const size = this.boardState.size;
        const off = CONFIG.display.playerAreas.edgeOffset;
        const areaSizeRaw = CONFIG.display.playerAreas.sizeRaw;
        const areas = [
            { anchor: new Point(off.x, 1.0-off.y-areaSizeRaw.y/size.y), rot: 0, size: null },
            { anchor: new Point(0.5+off.x, 1.0-off.y-areaSizeRaw.y/size.y), rot: 0 },
            { anchor: new Point(1.0-off.x, 1.0-off.y-areaSizeRaw.y/size.y), rot: 3 },
            { anchor: new Point(1.0-off.x, off.y), rot: 2 },
            { anchor: new Point(0.5-off.x, off.y), rot: 2 },
            { anchor: new Point(off.x, off.y), rot: 1 }
        ]
        const areaSize = areaSizeRaw.clone().scale(new Point(size.x, 1));

        CONFIG.generation.calculatedTrajectoryRectOffset = new Point(
            off.x + 2*areaSizeRaw.y, 
            off.y + 2*areaSizeRaw.y
        );

        for(const areaData of areas)
        {
            areaData.size = areaSize;
            areaData.anchor.scale(size);
            const playerArea = new PlayerArea(areaData);
            this.areas.push(playerArea);
            this.boardState.forbiddenAreas.add(playerArea.getRectangle());
        }

        
    }
}