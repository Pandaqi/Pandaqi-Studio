import Point from "../geometry/point";

export default (ev:MouseEvent|TouchEvent, node:HTMLElement) =>
{
    const p = new Point();
    const offset = node.getBoundingClientRect();
    p.move(new Point({ x: -offset.left, y: -offset.top }));

    if(ev instanceof TouchEvent) 
    {
        let touch = ev.touches[0] || ev.changedTouches[0];
        p.move(new Point({ x: touch.clientX, y: touch.clientY }));
    }
    
    if(ev instanceof MouseEvent) 
    {
        p.move(new Point({ x: ev.clientX, y: ev.clientY }));
    } 

    return p;
}

/*
if(ev.type == 'touchstart' || ev.type == 'touchmove' || ev.type == 'touchend' || ev.type == 'touchcancel') {
        let touch = ev.touches[0] || ev.changedTouches[0];
        p.move(new Point({ x: touch.clientX, y: touch.clientY }));
    } else if (ev.type == 'mousedown' || ev.type == 'mouseup' || ev.type == 'mousemove' || ev.type == 'mouseover'|| ev.type == 'mouseout' || ev.type == 'mouseenter' || ev.type=='mouseleave' ) {
        p.move(new Point({ x: ev.clientX, y: ev.clientY }));
    } 
*/