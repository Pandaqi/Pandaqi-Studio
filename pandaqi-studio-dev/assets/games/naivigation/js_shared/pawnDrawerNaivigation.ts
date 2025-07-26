import ResourceGroup from "lib/pq-games/layout/resources/resourceGroup";
import MaterialVisualizer from "lib/pq-games/tools/generation/materialVisualizer";
import MaterialNaivigation from "./materialNaivigation";
import Point from "lib/pq-games/tools/geometry/point";
import LayoutOperation from "lib/pq-games/layout/layoutOperation";
import { MISC } from "./dict";
import ResourceShape from "lib/pq-games/layout/resources/resourceShape";
import Rectangle from "lib/pq-games/tools/geometry/rectangle";
import Line from "lib/pq-games/tools/geometry/line";

interface PawnDrawParams
{
    addGuides?: boolean,
    resourceKey?: string,
    customData?: any,
}

export default (vis:MaterialVisualizer, group:ResourceGroup, tile:MaterialNaivigation, params:PawnDrawParams = {}) =>
{
    // prepare a single group that holds one pawn
    const subGroup = new ResourceGroup();
    const positions = [
        new Point(0, -0.25*vis.size.y),
        new Point(0, 0.25*vis.size.y)
    ];
    const iconSize = new Point(0.5*vis.size.y);

    const typeData = params.customData ?? tile.getData();
    const resGuides = vis.getResource("misc_shared");
    const textureKey = params.resourceKey ?? typeData.textureKey ?? "map_tiles";
    const res = vis.getResource(textureKey);
    const frame = typeData.frame;
    const addGuides = params.addGuides ?? false;

    // the actual icons + helpers
    for(let i = 0; i < 2; i++)
    {
        // a guiding sprite behind it to clearly show what's the front and stuff
        const opGuides = new LayoutOperation({
            pos: positions[i],
            frame: MISC.vehicle_guides.frame,
            size: iconSize.clone().scale(1.1),
            flipY: (i == 0),
            pivot: Point.CENTER
        })
        if(addGuides) { subGroup.add(resGuides, opGuides); }

        // actual vehicle icon
        const op = new LayoutOperation({
            pos: positions[i],
            size: iconSize.clone().scale(0.9),
            frame: frame,
            flipY: (i == 0),
            pivot: Point.CENTER
        });
        subGroup.add(res, op);
    }

    // simple rectangle around + line to indicate folding
    const resOuterRect = new ResourceShape(new Rectangle({ center: new Point(), extents: new Point(0.5*vis.size.x, vis.size.y) }));
    const opOuterRect = new LayoutOperation({ 
        stroke: vis.get("pawns.general.outline.color"),
        strokeWidth: vis.get("pawns.general.outline.width")
    });
    subGroup.add(resOuterRect, opOuterRect);

    const resCutLine = new ResourceShape(new Line(new Point(-0.25*vis.size.x, 0), new Point(0.25*vis.size.x, 0)));
    const opCutLine = new LayoutOperation({
        stroke: vis.get("pawns.general.cuttingLine.color"),
        strokeWidth: vis.get("pawns.general.cuttingLine.width")
    }) 
    subGroup.add(resCutLine, opCutLine);

    // then place two of them side by side on a single tile
    const opLeft = new LayoutOperation({ pos: new Point(0.25*vis.size.x, 0.5*vis.size.y )});
    group.add(subGroup, opLeft);
    const opRight = new LayoutOperation({ pos: new Point(0.75*vis.size.x, 0.5*vis.size.y )});
    group.add(subGroup, opRight);
}