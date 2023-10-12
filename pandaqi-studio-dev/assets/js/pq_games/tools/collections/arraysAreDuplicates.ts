export default (a:any[], b:any[]) =>
{
    if(a.length != b.length) { return false; }
    b = b.slice();
    for(const elem of a)
    {
        const idx = b.indexOf(elem);
        if(idx == -1) { return false; }
        b.splice(idx, 1);
    }
    return true;
}