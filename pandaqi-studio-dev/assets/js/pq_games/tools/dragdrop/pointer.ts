import Point from "js/pq_games/tools/geometry/point"

class PointerEvent
{
    originalEvent:PointerEvent
    posGlobal:Point
    posLocal:Point

    constructor(ev:PointerEvent, posGlobal:Point, posLocal:Point)
    {
        this.originalEvent = ev;
        this.posGlobal = posGlobal;
        this.posLocal = posLocal;
    }

    getEvent() { return this.originalEvent; }
    getPosGlobal() { return this.posGlobal; }
    getPosLocal() { return this.posLocal; }
}

export { PointerEvent, Pointer }
export default class Pointer
{
    node: HTMLElement
    startCallback:Function
    progressCallback:Function
    endCallback:Function

    constructor(params:Record<string,any> = {})
    {
        this.node = params.node || window;
        this.startCallback = (ev) => {};
        this.progressCallback = (ev) => {};
        this.endCallback = (ev) => {};
        this.setupEvents();
    }

    setupEvents()
    {
        const node = this.node
        node.addEventListener('mousedown', this.onStart.bind(this), true);
        node.addEventListener('touchstart', this.onStart.bind(this), true);
        node.addEventListener('mousemove', this.onProgress.bind(this), true);
        node.addEventListener('touchmove', this.onProgress.bind(this), true);
        node.addEventListener('mouseup', this.onEnd.bind(this), true);
        node.addEventListener('touchend', this.onEnd.bind(this), true);
        node.addEventListener('mouseleave', this.onCancel.bind(this), true);
        node.addEventListener('touchcancel', this.onCancel.bind(this), true);
    }

    preventDefaults(ev:any)
    {
        return true; // @DEBUGGING, probably should do this if we're on WINDOW

        if(!ev) { return false; }
        ev.stopPropagation(); 
        ev.preventDefault();
        return false;
    }

    getGlobalPosFromEvent(ev:any)
    {
        const p = new Point();
        if(ev.type == 'touchstart' || ev.type == 'touchmove' || ev.type == 'touchend' || ev.type == 'touchcancel') {
            var evt = (typeof ev.originalEvent === 'undefined') ? ev : ev.originalEvent;
            var touch = evt.touches[0] || evt.changedTouches[0];
            p.move(new Point({ x: touch.clientX, y: touch.clientY }));
        } else if (ev.type == 'mousedown' || ev.type == 'mouseup' || ev.type == 'mousemove' || ev.type == 'mouseover'|| ev.type == 'mouseout' || ev.type == 'mouseenter' || ev.type=='mouseleave' ) {
            p.move(new Point({ x: ev.clientX, y: ev.clientY }));
        } 
        return p;
    }

    getLocalPos(pos:Point)
    {
        let offset = { left: 0, top: 0 };
        if(typeof this.node.getBoundingClientRect == "function") {
            offset = this.node.getBoundingClientRect();
        }
        return pos.clone().move(new Point({ x: -offset.left, y: -offset.top }));
    }

    onStart(ev:any)
    {
        const pos = this.getGlobalPosFromEvent(ev);
        const event = new PointerEvent(ev, pos, this.getLocalPos(pos));
        this.startCallback(event)
        return this.preventDefaults(ev);
    }

    onProgress(ev:any)
    {
        const pos = this.getGlobalPosFromEvent(ev);
        const event = new PointerEvent(ev, pos, this.getLocalPos(pos));
        this.progressCallback(event);
        return this.preventDefaults(ev);
    }

    onEnd(ev:any)
    {
        const pos = this.getGlobalPosFromEvent(ev);
        const event = new PointerEvent(ev, pos, this.getLocalPos(pos));
        this.endCallback(event)
        return this.preventDefaults(ev);
    }

    onCancel() { this.onEnd(null); }
}