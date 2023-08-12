import { OPTIONS } from "./gameDictionary"

export default class Powerups {
    constructor(game)
    {
        this.game = game;
        this.node = this.createHTML();
        this.powerupTypes = [];
        this.powerupObjects = [];
        this.powerupNodes = [];
    }

    createHTML()
    {
        const powerupsEnabled = this.game.getConfig().expansions.poignantPowerups;
        if(!powerupsEnabled) { return; } 

        const cont = document.createElement("div");
        cont.classList.add("powerups-container");
        document.body.appendChild(cont);
        return cont;
    }

    destroyHTML()
    {
        if(!this.node) { return; }
        this.node.remove();
    }

    add(optionObject)
    {
        const type = optionObject.getType();
        if(type == "po_clear")
        {
            this.clear();
            return;
        }

        const typeAlreadyExists = this.powerupTypes.includes(type);
        const allowsMultipleOfSameType = OPTIONS[type].multi;
        if(typeAlreadyExists && !allowsMultipleOfSameType)
        {
            this.removeByName(type);
        }

        if(this.isFull()) { this.removeByIndex(0); }

        this.powerupTypes.push(type);
        this.powerupObjects.push(optionObject);
        const node = optionObject.createHTML(true);
        this.powerupNodes.push(node);
        this.node.appendChild(node);
    }

    removeByName(name)
    {
        const idx = this.powerupTypes.indexOf(name);
        if(idx < 0) { console.error("Can't remove non-existing powerup"); return; }
        this.removeByIndex(idx);
    }

    removeByIndex(idx)
    {
        this.powerupTypes.splice(idx, 1);
        this.powerupObjects.splice(idx, 1);
        const node = this.powerupNodes.splice(idx, 1)[0];
        node.remove();
    }

    clear()
    {
        for(let i = this.powerupNodes.length-1; i >= 0; i--)
        {
            this.removeByIndex(i);
        }
    }

    count()
    {
        return this.powerupNodes.length;
    }

    isFull()
    {
        return this.count() >= this.game.getConfig().maxPowerups
    }

    getLettersUsedInPowerups()
    {
        const arr = [];
        for(const obj of this.powerupObjects)
        {
            if(obj.getType() != "po_letter") { continue; }
            arr.push(obj.letter);
        }
        return arr;
    }
}