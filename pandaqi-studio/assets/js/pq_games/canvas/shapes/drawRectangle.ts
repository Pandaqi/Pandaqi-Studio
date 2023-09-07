import drawPolygon from "./drawPolygon"
import Point from "js/pq_games/tools/geometry/point"

export default (ctx:CanvasRenderingContext2D, params:Record<string,any>) =>
{
    params.pos = params.pos || { x: 0, y: 0 };
    params.extents = params.extents || { x: 10, y: 10 };

    const center = new Point(params.pos);
    const points = [
        center.clone().add( new Point().fromXY(-1,-1).scale(params.extents).scaleFactor(0.5) ),
        center.clone().add( new Point().fromXY(1,-1).scale(params.extents).scaleFactor(0.5) ),
        center.clone().add( new Point().fromXY(1,1).scale(params.extents).scaleFactor(0.5) ),
        center.clone().add( new Point().fromXY(-1,1).scale(params.extents).scaleFactor(0.5) )
    ]

    params.points = points;
    drawPolygon(ctx, params);
}

