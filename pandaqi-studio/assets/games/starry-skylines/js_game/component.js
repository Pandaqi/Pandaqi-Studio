export default class Component
{
    constructor(game)
    {
        this.game = game;
        this.type = "path";
        this.node = this.setupHTML();
        this.value = null;
        this.location = null;
    }

    getNode() { return this.node; }
    getType() { return this.type; }
    getNode() { return this.node; }
    getValue() { return this.value; }
    setValue(v) { this.value = v; }
    setLocation(pos) { this.location = pos; }
    getLocation() { return this.location; }

    setupHTML()
    {
        const cont = document.createElement("span");
        cont.classList.add("component-container");
        return cont;
    }

    makeAI()
    {
        // @NOTE: this also SETS the location; not clean, but it works
        this.node.appendChild(this.game.ai.getLocationNode(this));
        this.node.appendChild(this.game.ai.getFailureNode(this));  
        this.node.classList.add("option-ai");    
    }

    pickRandomValid(params, key)
    {
        let val;
        let invalid = false;
        do {
            val = this.game.getRandom(key);

            const alreadyExists = params.compList.includes(val);
            const data = this.game.getDictionaryData(key, val);
            let wrongNumComponents = false;
            if(data.minComponents && params.numComponents < data.minComponents) { wrongNumComponents = true; }
            if(data.maxComponents && params.numComponents > data.maxComponents) { wrongNumComponents = true; }
            invalid = alreadyExists || wrongNumComponents;
        } while(invalid);
        return val;
    }

    makeType(params = {})
    {
        params.type = params.type || "path";
        params.compList = params.compList || [];
        params.numComponents = params.numComponents || 1;
        
        const type = params.type;
        this.type = type;

        if(type == "path") { this.makePath(params); }
        else if(type == "people") { this.makePeople(params); }
        else if(type == "buildings") { this.makeBuilding(params); }
        else if(type == "effects") { this.makeEffect(params); }
        else if(type == "resource") { this.makeResource(params); }
    }

    makePath(params)
    {
        const val = this.pickRandomValid(params, "numbers");
        this.setValue(val);
        
        const cont = document.createElement('div');
        cont.classList.add('number-text', "component");
        cont.innerHTML = val;
        this.node.appendChild(cont);
    }

    makePeople()
    {
        const randPerson = this.game.getRandom('people');
        this.setValue(randPerson);

        const cont = document.createElement('div');
        cont.classList.add('people-icon', "component");

        const imageKey = randPerson.charAt(0).toUpperCase() + randPerson.slice(1) + "Icon.png";
        cont.innerHTML = '<img src="assets/' + imageKey + '" />';
        this.node.appendChild(cont);
    }

    makeBuilding(params)
    {
        const val = this.pickRandomValid(params, "buildings")
        this.setValue(val);

        const cont = this.createClickableName('buildings', val);
        this.node.appendChild(cont);
    }

    makeEffect(params)
    {
        const val = this.pickRandomValid(params, "effects")
        this.setValue(val);

        const cont = this.createClickableName('effects', val);
        this.node.appendChild(cont);
    }

    makeResource()
    {
        const randResource = this.game.getRandom('resources');
        this.setValue(randResource);

        const cont = document.createElement('div');
        cont.classList.add('resource-line-icon', "component");
        
        const imageKey = randResource.charAt(0).toUpperCase() + randResource.slice(1) + "Icon.png";
        cont.innerHTML = '<img src="assets/' + imageKey + '" />';
        this.node.appendChild(cont);
    }

    createClickableName(type, name) {    
        const effectIcon = document.createElement('div');
        effectIcon.classList.add('effect-icon', "component", 'button-type-' + type);
        effectIcon.innerHTML = name;
    
        effectIcon.addEventListener('click', (ev) => {
            this.showExplanation(type, name)
        });
        return effectIcon;
    }

    showExplanation(type, name)
    {
        const cfg = this.game.getConfig();
        const list = cfg.lists[type];
        const componentsList = cfg.lists["components"]
        const componentsProb = cfg.totalProbabilities["components"];

        const eff = list[name]
        const probElement = (eff.prob / cfg.totalProbabilities[type])
        const probComponent = (componentsList[type].prob / componentsProb)

        const prob = Math.ceil(probElement * probComponent * 100) // * numComponentsPerRound;
        const typeClass = "type-" + eff.type.split(" ")[0].toLowerCase();

        let txt = "<strong>" + name + " <span class='effect-type-text " + typeClass + "'>(" + eff.type + ")</span>:</strong> " 
        txt += "<span>" + eff.desc + "</span>" 
        txt += " <span class='probability-text'>(" + prob + "% probability of appearing)</span>";

        this.game.setTutorial(txt);
    }
}