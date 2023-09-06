export default class ProgressBar
{

    node : HTMLElement
    phases : string[]
    curPhase : number
    headerNode : HTMLElement
    infoNode : HTMLElement

    constructor(container:HTMLElement)
    {
        this.node = this.setupHTML(container)
        this.phases = [];
        this.curPhase = -1;
    }

    setPhases(p:string[])
    {
        this.phases = p;
    }

    setupHTML(container:HTMLElement = null)
    {
        if(!container) { container = document.body; }

        const div = document.createElement("div");
        container.appendChild(div);
        div.classList.add("progress-bar-container");

        const subdiv = document.createElement("div");
        div.appendChild(subdiv);
        subdiv.classList.add("progress-bar");

        const header = document.createElement("h1");
        subdiv.appendChild(header);
        header.classList.add("progress-bar-header");
        this.headerNode = header;

        const extraInfo = document.createElement("p");
        subdiv.appendChild(extraInfo);
        extraInfo.classList.add("progress-bar-info");
        this.infoNode = extraInfo;

        return div;
    }

    gotoNextPhase() 
    { 
        this.curPhase = Math.min((this.curPhase + 1), this.phases.length);
        this.update();
    }

    gotoPhase(p)
    {
        this.curPhase = this.phases.indexOf(p);
        this.update();
    }

    getCurPhaseName() { return this.phases[this.curPhase]; }

    update()
    {
        this.headerNode.innerHTML = this.getCurPhaseName();
        this.infoNode.innerHTML = "";
    }

    setInfo(i:string)
    {
        this.infoNode.innerHTML = i;
    }


}