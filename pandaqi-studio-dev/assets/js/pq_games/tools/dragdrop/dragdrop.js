import Pointer from "./pointer"

export default class DragDrop
{
    constructor() 
    { 
        this.callbacks = { 
            drop: this.onDrop.bind(this),
            drag: this.onDrag.bind(this)
        }
        this.elements = {
            drop: [],
            drag: []
        }

        this.dragging = false;
        this.curDragElem = null;
        this.curDropElem = null;
        this.oldElemData = {};

        this.setupListeners();
    }

    setupListeners()
    {
        this.pointer = new Pointer();
        this.pointer.progressCallback = this.onProgress.bind(this);
        this.pointer.endCallback = this.onEnd.bind(this);
    }

    prepareElemRecursively(node) 
    {
        node.setAttribute("draggable", false);
        node.style.maxWidth = "100%";

        for (const child of node.childNodes) {
            this.prepareElemRecursively(child);
        }
    }

    getCurrentDragElement() { return this.curDragElem; }
    getCurrentDropElement() { return this.curDropElem; }

    // type = drop or drag, elem = any HTML node
    isElement(type, elem) { return this.elements[type].includes(elem); }
    addElement(type, elem)
    {
        if(this.isElement(type, elem)) { return; }
        this.elements[type].push(elem);
        this.prepareElemRecursively(elem);

        if(type == "drag")
        {
            elem.addEventListener("mousedown", this.callbacks.drag);
            elem.addEventListener("touchstart", this.callbacks.drag);
        }
    }
    removeElement(type, elem)
    {
        if(!this.isElement(type, elem)) { return; }
        this.elements[type].splice(this.elements[type].indexOf(elem), 1);

        if(type == "drag")
        {
            elem.removeEventListener("mousedown", this.callbacks.drag);
            elem.removeEventListener("touchstart", this.callbacks.drag);
        }
    }

    // @TODO: might not be the cleanest implementation
    // I need to manually call this, and it doesn't even update everything (such as event listeners)
    onElementChanged(elem)
    {
        this.prepareElemRecursively(elem);
    }

    getPlaceholderItem(node)
    {
        const clone = node.cloneNode(true);
        clone.style.opacity = 0.2;
        return clone;
    }

    isDragging() { return this.dragging && this.curDragElem; }
    onDrag(ev)
    {
        if(this.isDragging()) { return; }

        console.log("DRAGGING SOMETHING");

        this.dragging = true;
        const elem = ev.currentTarget;
        this.oldElemData = { 
            position: elem.style.position,
            width: elem.offsetWidth,
            height: elem.offsetHeight,
            parent: elem.parentNode
        }

        this.curDragElem = elem;
        const placeHolder = this.getPlaceholderItem(elem);
        const pos = this.pointer.getGlobalPosFromEvent(ev);
        this.updateDragElem(pos)

        this.curDragElem.remove();
        this.oldElemData.parent.appendChild(placeHolder);
        document.body.appendChild(this.curDragElem);

        console.log(this.curDragElem);
    }

    onProgress(pointerEvent)
    {
        if(!this.isDragging()) { return; }

        const pos = pointerEvent.getPosGlobal();
        this.updateDragElem(pos);
        this.checkDropZones(pos);
    }

    onEnd(pointerEvent)
    {
        if(!this.isDragging()) { return; }

        const pos = pointerEvent.getPosGlobal();
        this.resetDragElem();
        this.oldElemData.parent.innerHTML = "";

        this.checkDropZones(pos);

        const validDrop = this.curDropElem && (this.curDropElem != this.oldElemData.parent);
        if(validDrop) {
            const currentContent = Array.from(this.curDropElem.childNodes)[0];
            currentContent.remove(0);
            this.curDropElem.appendChild(this.curDragElem);
            this.oldElemData.parent.appendChild(currentContent);
        } else {
            this.oldElemData.parent.appendChild(this.curDragElem);
        }

        this.dragging = false;
        this.curDragElem = null;
        this.oldElemData = {};
        this.removeDropHighlight(this.curDropElem);
    }

    onDrop(ev)
    {

    }

    updateDragElem(pos)
    {
        const elem = this.curDragElem;
        elem.style.position = "fixed";
        elem.style.width = this.oldElemData.width + "px";
        elem.style.height = this.oldElemData.height + "px";
        elem.style.left = (pos.x - 0.5*this.oldElemData.width) + "px";
        elem.style.top = (pos.y - 0.5*this.oldElemData.height) + "px";
        elem.style.zIndex = 10000;
        elem.style.filter = "drop-shadow(0 0 5px black)";
    }

    resetDragElem()
    {
        const elem = this.curDragElem;
        elem.style.position = this.oldElemData.position;
        elem.style.width = "auto";
        elem.style.height = "auto";
        elem.style.zIndex = "initial";
        elem.style.filter = "none";
    }

    isInsideRect(pos, elem)
    {
        const rect = elem.getBoundingClientRect();
        return pos.x >= rect.left && pos.x <= rect.right && pos.y >= rect.top && pos.y <= rect.bottom;
    }

    addDropHighlight(elem)
    {
        if(!elem) { return; }
        elem.style.transform = "scale(1.05)";
    }

    removeDropHighlight(elem)
    {
        if(!elem) { return; }
        elem.style.transform = "none";
    }

    checkDropZones(pos)
    {
        let dropElem = null;
        for(const elem of this.elements.drop)
        {
            if(!this.isInsideRect(pos, elem)) { continue; }
            dropElem = elem;
            break;
        }

        const oldDropElem = this.curDropElem;
        if(oldDropElem == dropElem) { return; }
        this.curDropElem = dropElem;

        this.removeDropHighlight(oldDropElem);
        this.addDropHighlight(dropElem);
    }

}