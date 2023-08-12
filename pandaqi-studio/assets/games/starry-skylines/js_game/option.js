import Component from "./component"

export default class Option
{
    constructor(game, params)
    {
        this.game = game;
        this.components = [];
        this.node = this.setupHTML(params);
    }

    setupHTML(params)
    {
        const parent = params.node || this.game.getContainer();
        const ai = params.ai || false;
        const maxDuplicateComponents = this.game.getConfig().maxDuplicateComponents || 2;

        const container = document.createElement('div');
        parent.appendChild(container);
        container.classList.add("option-container");

        const numComponents = this.getRandomNumComponents()
        const allComponents = [];
        this.components = allComponents;

        for(var c = 0; c < numComponents; c++) {
            let randomComponentName, componentCount

            // if something has already been used too often, never use it again
            do {
                randomComponentName = this.game.getRandom('components');
                componentCount = allComponents.filter(x => x.getType() == randomComponentName).length;
            } while(componentCount >= maxDuplicateComponents)

            // AI doesn't execute effects
            if(ai && randomComponentName == 'effects') { randomComponentName = 'buildings' }

            const c = new Component(this.game);
            allComponents.push(c);

            const params = {
                type: randomComponentName, 
                compList: this.getComponentValues(allComponents), 
                numComponents: numComponents
            }
            c.makeType(params);
            if(ai) { c.makeAI(); }
        }

        // sort components (effects bubble to front), then add to container
        allComponents.sort((a, b) => (a.getType() == 'effects' && b.getType() != 'effects') ? -1 : 1)
        for(const compObject of allComponents) {
            container.appendChild(compObject.getNode());
        }

        return container;
    }

    getComponents() { return this.components; }
    getComponentTypes(list)
    {
        const arr = [];
        for(const comp of list)
        {
            arr.push(comp.getType());
        }
        return arr;
    }

    getComponentValues(list)
    {
        const arr = [];
        for(const comp of list)
        {
            arr.push(comp.getValue());
        }
        return arr;
    }

    // use a simple distribution for #components: 50% chance of getting 2, 25% of getting 1 or 3
    getRandomNumComponents() {
        const rand = Math.random()
        if(rand <= 0.25) { return 1 }
        else if (rand <= 0.75) { return 2 }
        else { return 3 }
    }
}