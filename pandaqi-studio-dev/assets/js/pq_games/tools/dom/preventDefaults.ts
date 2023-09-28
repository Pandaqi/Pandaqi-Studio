export default (ev:any) =>
{
    if(!ev) { return false; }
    ev.stopPropagation(); 
    ev.preventDefault();
    return false;
}