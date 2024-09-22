import Point from "js/pq_games/tools/geometry/point"

export default class Cell
{
    x: number;
    y: number;
    type: string;
    rot: number;
    tutorial: string;
    team: number;
    value: number;
    edge: boolean;
    spies: number[];
    score: number;

    constructor(x = 0, y = 0, type = null, rot = 0)
    {
        this.x = x;
        this.y = y;
        this.type = type;
        this.rot = rot;
        this.tutorial = null;
        this.team = null;
        this.value = null;
        this.edge = false;
        this.spies = [];
        this.score = null;
    }

    clone()
    {
        const c = new Cell();
        Object.assign(c, this);
        return c;
    }

    getPos() { return new Point({ x: this.x, y: this.y }); }

    setEdge(e) { this.edge = e; }
    isEdge() { return this.edge; }

    setType(t) { this.type = t; }
    getType() { return this.type; }
    hasType() { return this.type != null; }
    isEmpty() { return !this.hasType(); }

    setTutorial(t) { this.tutorial = t; }
    getTutorial() { return this.tutorial; }
    hasTutorial() { return this.tutorial != null; }

    setRotation(r) { this.rot = r; }
    getRotation() { return this.rot; }

    hasTeam() { return this.team != null; }
    setTeam(t) { this.team = t; }
    getTeam() { return this.team; }

    setValue(v) { this.value = v; }
    getValue() { return this.value; }
    hasValue() { return this.value != null; }

    setScore(s) { this.score = s; }
    setValidScore(s)
    {
        if(s == null || isNaN(s)) { return; }
        this.score = s;
    }
    getScore() { return this.score; }

    addSpy(team) { this.spies.push(team); }
    removeSpy(team) { 
        const idx = this.spies.indexOf(team);
        if(idx < 0) { return; }
        this.spies.splice(idx, 1);
    }
    setTeamToSpies()
    {
        if(this.spies.length != 1) { return; }
        this.setTeam(this.spies[0]);
    }
}