export default (ev:Event) =>
{
    if(!ev) { return false; }
    ev.stopPropagation(); 
    ev.preventDefault();
    return false;
}