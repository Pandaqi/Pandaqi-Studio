export default (arr:any[]) : any =>
{
    const l = arr.length;
    if(l <= 0) { console.error("Can't draw from empty array"); return null; }
    return arr[Math.floor(Math.random() * l)];
}