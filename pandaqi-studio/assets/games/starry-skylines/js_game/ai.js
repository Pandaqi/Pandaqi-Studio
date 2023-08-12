// in solo mode, this keeps track of what the AI knows
// @IMPROV: Expand with more metrics, like where paths are and what their numbers are (to know where we can place them)        

export default class AI {
    constructor(game)
    {
        this.game = game;
        this.disabledSpaces = [];
        this.fullBuildings = [];
        this.buildingLocations = [];
        this.horizontalMarks = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        // values for the overall component categories
        this.componentPointValues = {
            'buildings': 2,
            'people': 1,
            'path': 1.75,
            'resource': 1.25
        }
    
        // values for specific components that are good/bad
        // (most are not included of course, can be extended at will)
        this.specificPointValues = {
            'people': 0,
            'criminal': -0.5,
            'sick': -0.25,
            'educated': 1,
            'animal': 2,
        }
    }

    // LOCATION (on board to place component)
    getLocationNode(comp)
    {
        const loc = this.getRandomValidLocation(comp);
        const locContainer = document.createElement('span');
        locContainer.innerHTML = this.convertLocationToString(loc);
        comp.setLocation(loc);
        return locContainer;
    }

    // FAILURE BUTTON (to click when this component cannot be placed)
    getFailureNode(comp)
    {
        const failureButton = document.createElement('button');
        failureButton.innerHTML = 'X';
        failureButton.classList.add('failure-ai-button');
        failureButton.addEventListener('click', (ev) => {
            this.registerAIFail(comp);
            failureButton.disabled = true;
            failureButton.style.opacity = 0.33;
        });
        return failureButton;
    }
  
    executeBestOption(list) {
        // find the one with the best score
        let bestScore = 0, bestOption = null;
        for(const option of list)
        {
            var score = this.calculateOptionScore(option);
            if(score <= bestScore) { continue; } 
            
            bestScore = score;
            bestOption = option;
        }

        for(const option of list)
        {
            const chosen = (option == bestOption);
            if(!chosen)
            {
                option.node.style.pointerEvents = "none";
                option.node.style.opacity = 0.1;
                continue;
            }

            for(const component of option.getComponents())
            {
                const nothingToPlace = component.getType() == "people"
                if(nothingToPlace) { continue; }
                this.buildingLocations.push(component.getLocation());
                this.disabledSpaces.push(component.getLocation());
            }
        }
    }

    spaceIsDisabled(pos) {
        for(const space of this.disabledSpaces) {
            if(!this.spacesMatch(pos, space)) { continue; }
            return true;
        }    
        return false;
    }

    spacesMatch(pos1, pos2)
    {
        return pos1.x == pos2.x && pos1.y == pos2.y;
    }
    
    removeBuildingAt(pos) {
        for(const location of this.buildingLocations) {
            if(!this.spacesMatch(pos, location)) { continue; }
            this.buildingLocations.splice(this.buildingLocations.indexOf(location), 1);
            break;
        }
    }
    
    getRandomValidLocation(component) 
    {
        const type = component.getType();
        const locs = this.buildingLocations
        const weNeedBuildings = type == 'people';
        const weHaveBuildings = (locs.length > 0);
        if(weNeedBuildings && weHaveBuildings) {
            const randIdx = Math.floor(Math.random() * locs.length);
            return locs[randIdx];							
        }
    
        let pos
        let iterations = 0, maxIterations = 100;
        do {
            pos = this.getRandomLocation();
            iterations++;
        } while ( this.spaceIsDisabled(pos) && iterations <= maxIterations);

        return pos;
    }

    getRandomLocation()
    {
        const cfg = this.game.getConfig();
        const xPos = Math.floor(Math.random() * cfg.width);
        const yPos = Math.floor(Math.random() * cfg.height);
        return { x: xPos, y: yPos };
    }
    
    convertLocationToString(pos) 
    {
        return this.horizontalMarks.at(pos.x) + "" + (pos.y + 1)
    }
    
    registerAIFail(comp) 
    { 
        this.removeBuildingAt(comp.getLocation());
    }
    
    calculateOptionScore(option) 
    {
        let score = 0;
        for(const component of option.getComponents()) {
            score += this.componentPointValues[ component.getType() ] || 0;
            score += this.specificPointValues[ component.getValue() ] || 0;
        }
        return score;
    }
  
}