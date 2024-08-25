import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { CardMovement, CardType, FishType, TileAction } from "../js_shared/dict";

export default class Card
{
    type: CardType;
    typeMovement: CardMovement;
    specialAction: string;
    pawnIndex: number;

    fishes: FishType[];
    tileAction: TileAction;
    tileActionNum: number;

    constructor(type:CardType)
    {
        this.type = type;
    }

    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        fillCanvas(ctx, "#FFFFFF");
        const group = new ResourceGroup();

        if(this.type == CardType.PAWN) {
            this.drawPawn(vis, group);
        } else if(this.type == CardType.MOVEMENT) {
            this.drawMovementCard(vis, group);
        } else if(this.type == CardType.MAP) {
            this.drawMapTile(vis, group);
        }

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawPawn(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // @TODO: simply place that frame from the misc spritesheet
    }

    drawMovementCard(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // @TODO: draw background, something to mark what is top/bottom
        // @TODO: draw main icon
        // @TODO: add small basic explanation (from MOVEMENT_CARDS)
        // @TODO: add special action text/explanation if needed (from MOVEMENT_SPECIAL)
        // @TODO: add a random extra icon for MATCH movements, which allow you to move to closest tile MATCHING that icon
    }

    drawMapTile(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // @TODO: draw watery background
        // @TODO: randomly draw the selected fishes/special icons
        // @TODO: Add the TILEACTION as a symbol + optionally a number on top
            // => this number must be displayed +1
        // @TODO: add special text if needed
            // @TODO: replace any %num% in special text with numbers between -3 and 3
    }
}