export enum SwipeDirection
{
    LEFT = "left",
    RIGHT = "right",
    UP = "up",
    DOWN = "down"
}

export enum SwipeInputType
{
    MOUSE = "mouse",
    TOUCH = "touch"
}

const DISABLE_VERTICAL_SWIPE = true; // otherwise very annoying when scrolling on mobile
const DISABLE_HORIZONTAL_SWIPE = false;

export const getFirstPointer = (ev:TouchEvent|MouseEvent) =>
{
    // ugh browser support is stupid here, and supporting touch + mouse is stupid too,
    // so just keep checking possible properties until we find the right one
    let touches:TouchList|MouseEvent[] = (ev as TouchEvent).targetTouches; // TARGET TOUCHES = on this specific element (so empty on touchend)
    let type = SwipeInputType.TOUCH;
    if(!touches || touches.length <= 0) { touches = (ev as TouchEvent).changedTouches; } // CHANGED TOUCHES = self-explanatory
    if(!touches || touches.length <= 0) { touches = (ev as TouchEvent).touches; } // TOUCHES = all currently in touch (so empty on touchend)
    if(!touches || touches.length <= 0) { touches = [(ev as MouseEvent)]; type = SwipeInputType.MOUSE; } // If a mouse touch, just, well, use that mouse touch

    if(touches.length <= 0) { console.error("Event has no valid touches", ev); return null; }

    const firstTouch = touches[0];
    if(!firstTouch.clientX || !firstTouch.clientY) { console.error("Touch has no valid coordinates", firstTouch); return null; }

    return { touch: firstTouch, type: type };
}

export const addSwipeListener = (node:HTMLElement, callbackSwipe:Function, callbackClick:Function) =>
{
    let xDown = -1;
    let yDown = -1;

    const handleTouchStart = (ev:TouchEvent|MouseEvent) =>
    {
        const { touch, type } = getFirstPointer(ev);
        xDown = touch.clientX;
        yDown = touch.clientY;

        // mouse clicks automatically start dragging images
        // so we want to disable that shit
        if(type == SwipeInputType.MOUSE) 
        {
            ev.preventDefault();
            return false;
        }

        return true;
    }

    const handleTouchEnd = (ev: TouchEvent | MouseEvent) => 
    {
        const neverStarted = xDown < 0 || yDown < 0;
        if(neverStarted) { return true; }

        const { touch, type } = getFirstPointer(ev);
        const xUp = touch.clientX;
        const yUp = touch.clientY;

        const xDiff = xUp - xDown;
        const yDiff = yUp - yDown;

        xDown = -1;
        yDown = -1;

        const distMoved = Math.abs(xDiff) + Math.abs(yDiff);
        const MIN_DIST_NEEDED_FOR_SWIPE = 12
        if(distMoved < MIN_DIST_NEEDED_FOR_SWIPE)
        { 
            callbackClick();
            return false; 
        }
        
        const dominantDirectionIsX = Math.abs(xDiff) > Math.abs(yDiff);
        const dominantDirectionIsY = !dominantDirectionIsX;
        if(dominantDirectionIsX) 
        {
            if(DISABLE_HORIZONTAL_SWIPE) { return true; }
            
            ev.preventDefault();
            ev.stopPropagation();
            callbackSwipe(xDiff > 0 ? SwipeDirection.RIGHT : SwipeDirection.LEFT);
            return false;
        }

        if(dominantDirectionIsY)
        {
            if(DISABLE_VERTICAL_SWIPE) { return true; }

            ev.preventDefault();
            ev.stopPropagation();
            callbackSwipe(yDiff > 0 ? SwipeDirection.DOWN : SwipeDirection.UP);
            return false; 
        }

        return true;
    }

    node.addEventListener('touchstart', handleTouchStart, false);
    node.addEventListener('touchend', handleTouchEnd, false);
    node.addEventListener('mousedown', handleTouchStart, false);
    node.addEventListener('mouseup', handleTouchEnd, false);
}
