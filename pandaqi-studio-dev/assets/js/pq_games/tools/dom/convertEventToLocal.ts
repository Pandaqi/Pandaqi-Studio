import Point from "../geometry/point";

export default (ev:any, node) =>
{
    const p = new Point();
    const offset = node.getBoundingClientRect();
    p.move(new Point({ x: -offset.left, y: -offset.top }));

    if(ev.type == 'touchstart' || ev.type == 'touchmove' || ev.type == 'touchend' || ev.type == 'touchcancel') {
        let evt = (typeof ev.originalEvent === 'undefined') ? ev : ev.originalEvent;
        let touch = evt.touches[0] || evt.changedTouches[0];
        p.move(new Point({ x: touch.clientX, y: touch.clientY }));
    } else if (ev.type == 'mousedown' || ev.type == 'mouseup' || ev.type == 'mousemove' || ev.type == 'mouseover'|| ev.type == 'mouseout' || ev.type == 'mouseenter' || ev.type=='mouseleave' ) {
        p.move(new Point({ x: ev.clientX, y: ev.clientY }));
    } 
    return p;
}