export default class Event 
{
    // (team 0 = medics, team 1 = virus)
    team:number
    header:string
    text:string
    action:string

    constructor(t:number, h:string, txt:string, a:string)
    {
        this.team = t;
        this.header = h;
        this.text = txt;
        this.action = a;
    }
	
}
