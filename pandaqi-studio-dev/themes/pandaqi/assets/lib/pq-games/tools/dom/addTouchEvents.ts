interface AddTouchEventParams
{
    node?:HTMLElement,
    all?:EventListenerOrEventListenerObject,
    start?:EventListenerOrEventListenerObject,
    move?:EventListenerOrEventListenerObject,
    end?:EventListenerOrEventListenerObject,
    cancel?:EventListenerOrEventListenerObject
}

const nothingFunc = (ev) => {}

export default (params:AddTouchEventParams) =>
{
    const n = params.node;
    const start = (params.start ?? params.all) ?? nothingFunc;
    const move = (params.move ?? params.all) ?? nothingFunc;
    const end = (params.end ?? params.all) ?? nothingFunc;
    const cancel = (params.cancel ?? params.all) ?? nothingFunc;

    n.addEventListener("touchstart", start);
    n.addEventListener("mousedown", start);

    n.addEventListener("touchmove", move);
    n.addEventListener("mousemove", move);

    n.addEventListener("touchend", end);
    n.addEventListener("mouseup", end);

    n.addEventListener("touchcancel", cancel);
    n.addEventListener("mouseleave", cancel);

    // @REMARK: mouseleave/mouseup also triggers if some other (inner) element gets underneath the mouse cursor
    // So make sure that doesn't happen, or set pointer-events:none on those, otherwise things get wonky
}