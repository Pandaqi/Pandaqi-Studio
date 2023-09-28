import Point from "../geometry/point";

enum GridNeighborType
{
    HORIZONTAL,
    VERTICAL,
    ORTHOGONAL,
    DIAGONAL,
    ALL
}

const NB_OFFSETS = new Map();
NB_OFFSETS.set(GridNeighborType.HORIZONTAL, [Point.LEFT, Point.RIGHT]);
NB_OFFSETS.set(GridNeighborType.VERTICAL, [Point.UP, Point.DOWN]);
NB_OFFSETS.set(GridNeighborType.ORTHOGONAL, [Point.LEFT, Point.DOWN, Point.RIGHT, Point.UP]);
NB_OFFSETS.set(GridNeighborType.DIAGONAL, [Point.TOP_LEFT, Point.TOP_RIGHT, Point.BOTTOM_LEFT, Point.BOTTOM_RIGHT]);
NB_OFFSETS.set(GridNeighborType.ALL, [Point.TOP_LEFT, Point.UP, Point.TOP_RIGHT, Point.RIGHT, Point.BOTTOM_RIGHT, Point.DOWN, Point.BOTTOM_LEFT, Point.LEFT])

const outOfBounds = (pos:Point, dims:Point) =>
{
    return pos.x < 0 || pos.y < 0 || pos.x >= dims.x || pos.y >= dims.y;
}

type PointLike = { x: number, y: number, setNeighbors:Function }
interface GridNeighborParams
{
    grid: PointLike[][],
    type?: GridNeighborType,
    filter?: Function
}

export default (params:GridNeighborParams) =>
{
    const grid = params.grid;
    const type = params.type ?? GridNeighborType.ORTHOGONAL;

    const defaultFilter = (a,b) => { return true; };
    const filter = params.filter ?? defaultFilter;

    const dims = new Point(grid.length, grid[0].length);
    const cells = grid.flat();
    for(const cell of cells)
    {
        const OFFSETS = NB_OFFSETS.get(type);
        const neighbors = [];
        for(const offset of OFFSETS)
        {
            const nbPos = new Point(cell.x + offset.x, cell.y + offset.y);
            if(outOfBounds(nbPos, dims)) { continue; }
            neighbors.push(grid[nbPos.x][nbPos.y]);
        }
        cell.setNeighbors(neighbors);
    }
}