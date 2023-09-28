import Path from "./path";

export default (pathList:Path[]) =>
{
    const arr = [];
    let prevPath = null;
    for(const path of pathList)
    {
        let newPath = path.toPath();
        if(prevPath && prevPath.getLast() == path.getFirst()) { newPath.shift(); } // no duplicates
        arr.push(newPath);
        prevPath = path;
    }
    return new Path({ points: arr.flat() });
}