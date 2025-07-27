export default class Events
{
    game: any;
    node: HTMLDivElement;
   
    constructor(game:any)
    {
        this.game = game;
        this.node = this.setupHTML();
    }

    setupHTML()
    {
        const cont = document.createElement('div');
        this.game.getContainer().appendChild(cont);
        cont.classList.add("event-container");
        return cont;
    }
    
    toggle(val)
    {
        if(val) { this.node.style.display = "block"; }
        else { this.node.style.display = "none"; }
    }

    loadNew()
    {
        const randEventName = this.game.getRandom('events')
        const randEvent = this.game.getConfig().lists.events[randEventName];
        this.node.innerHTML = '<div><h2>' + randEventName + '</h2><p>' + randEvent.desc + '</p></div>'
    }
}