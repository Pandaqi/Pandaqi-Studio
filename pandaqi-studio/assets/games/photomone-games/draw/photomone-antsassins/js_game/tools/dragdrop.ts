import DragDrop from "js/pq_games/tools/dragdrop/dragdrop"

export default class DragDropDebugger
{
    dragdrop: DragDrop;
    images: any;
    node: HTMLDivElement;
    
    constructor(config, images)
    {
        this.dragdrop = new DragDrop();
        this.images = images;
        this.setupEvents();
        this.node = this.createHTML(config);
    }

    setupEvents()
    {
        window.addEventListener("keyup", this.onKeyPress.bind(this));
    }

    onKeyPress(ev)
    {
        const key = ev.key
        if(key == "q") { this.rotateCurrentElement(-1); }
        else if(key == "e") { this.rotateCurrentElement(+1); }
        else if(key == "d") { this.swapCurrentElementWithNew(); }
        else if(key == "r") { this.rotateWholeBoard(-1); }
        else if(key == "y") { this.rotateWholeBoard(+1); }
    }

    // @TODO: when you take elements out of it, for dragging, this rot is obviously forgotten
    // => The cleaner way is to ACTUALLY rearrange and individually rotate all tiles
    rotateWholeBoard(dr)
    {
        const cont = this.node;
        const rot = parseInt(cont.dataset.rot) || 0;
        const newRotation = rot + dr;
        cont.dataset.rot = newRotation;
        cont.style.transform = "rotate(" + Math.round(newRotation*90) + "deg)"
    }

    rotateCurrentElement(dr)
    {
        const elem = this.dragdrop.getCurrentDragElement();
        if(!elem) { return; }

        const rot = parseInt(elem.dataset.rot) || 0;
        const newRotation = rot + dr;
        elem.dataset.rot = newRotation;

        const img = elem.getElementsByTagName("img")[0];
        img.style.transform = "rotate(" + Math.round(newRotation * 90) + "deg)"
    }

    swapCurrentElementWithNew()
    {
        const elem = this.dragdrop.getCurrentDragElement();
        if(!elem) { return; }

        const noNewImages = this.images.length <= 0;
        if(noNewImages) { return; }

        const img = this.images.pop();
        elem.innerHTML = '';
        elem.appendChild(img);
        this.dragdrop.onElementChanged(elem);
    }

    createHTML(config)
    {
        const cont = document.createElement("div");
        document.body.appendChild(cont); // @TODO: insertBefore?
        cont.classList.add("drop-zones-container");

        let styleString = ""
        let gridSize = config.cards.grid;

        // @DEBUGGING
        gridSize = { x: 6, y: 6 }

        for(let x = 0; x < gridSize.x; x++)
        {
            styleString += "auto ";
            for(let y = 0; y < gridSize.y; y++)
            {
                const drop = document.createElement("div");
                cont.appendChild(drop);

                const imgCont = document.createElement("div");
                drop.appendChild(imgCont);
                imgCont.classList.add("drag-image-container");
                const img = this.images.pop();
                imgCont.appendChild(img);

                this.dragdrop.addElement("drop", drop);
                this.dragdrop.addElement("drag", imgCont);
            }
        }
        cont.style.gridTemplateColumns = styleString;
        return cont;
    }
}