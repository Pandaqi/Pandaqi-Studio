import Random from "js/pq_games/tools/random/main"

export default class InterfaceWordOptions {
    constructor(interfaceObject, node)
    {
        this.interface = interfaceObject;
        this.node = node;
        this.WORDS = this.interface.getConfig().WORDS;

        this.numWordsPerTurn = 4;
        this.curSelectedOption = null;

        this.createHTML();
        this.cacheWords();
    }

    createHTML()
    {
        this.globalContainer = document.createElement("div");
        this.node.appendChild(this.globalContainer);
        this.globalContainer.classList.add("word-container-container");

        this.wordContainer = document.createElement("div");
        this.globalContainer.appendChild(this.wordContainer);
        this.wordContainer.classList.add("word-container");
        this.wordContainer.innerHTML = '... words will appear here ...';
    }

    clear() { this.wordContainer.innerHTML = ''; }
    getHTMLContainer() { return this.globalContainer; }
    setVisible(val)
    {
        if(val) { this.globalContainer.style.display = "block"; }
        else { this.globalContainer.style.display = "none"; }
    }

    setWordEater(val) { this.wordEater = val; }

    selectAll(val)
    {
        for(const word of this.wordOptionNodes)
        {
            if(val) { word.classList.remove("word-option-unselected"); }
            else { word.classList.add("word-option-unselected"); }
        }
    }
    
    deselectOption(node)
    {
        if(!node) { return; }
        node.classList.remove("word-option-selected");
        this.curSelectedOption = null;
    }

    selectOption(node)
    {
        const toggleOff = this.curSelectedOption == node;
        this.deselectOption(this.curSelectedOption);
        this.selectAll(false);
        if(toggleOff) { this.selectAll(true); return; }
        this.curSelectedOption = node;
        node.classList.add("word-option-selected");
    }

    cacheWords()
    {
        const turnsToCache = 15;
        const totalNum = turnsToCache * this.numWordsPerTurn;
        this.wordsCached = this.WORDS.getWords(totalNum);
    }

    setWordsCache(list)
    {
        this.wordsCached = list;
    }

    getWordsCache()
    {
        return this.wordsCached;
    }

    loadNewWords()
    {
        this.clear();

        const numNewWords = this.wordEater ? 2 : this.numWordsPerTurn;
        let newWords = [];
        const canReadFromCache = this.wordsCached.length >= numNewWords;
        if(canReadFromCache) { newWords = this.wordsCached.splice(0, numNewWords); }
        else { newWords = this.WORDS.getWords(numNewWords); }

        const cfg = this.interface.getConfig();
        const sneakySpotsEnabled = cfg.expansions.sneakySpots ?? false;
        const listenToExpansions = cfg.wordInterface.listenToExpansions;

        const colors = [0,1,2,3];
        Random.shuffle(colors);

        this.wordOptionNodes = [];
        this.wordOptions = newWords;
        let counter = -1;
        for(const wordObject of newWords)
        {
            const cont = document.createElement("div");
            this.wordContainer.appendChild(cont);
            cont.classList.add("word-option");
            cont.classList.add("word-color-" + colors.pop());

            counter++;
            cont.dataset.wordindex = counter;

            this.wordOptionNodes.push(cont);

            cont.addEventListener("click", (ev) => {
                if(!this.interface.allowSelecting) { return; }
                this.selectOption(cont);
            }, false)

            // actual word
            const wordNode = document.createElement("div");
            cont.appendChild(wordNode);
            wordNode.classList.add("word-option-word");

            const metadataNode = document.createElement("div");
            cont.appendChild(metadataNode);
            metadataNode.classList.add("word-option-metadata");

            // # Lines
            const linesCont = document.createElement("div");
            metadataNode.appendChild(linesCont);
            linesCont.classList.add("word-option-lines-data");

            const linesSprite = document.createElement("img");
            linesCont.appendChild(linesSprite);
            linesSprite.src = "/photomone/assets/icon_lines.webp";

            const linesNode = document.createElement("div");
            linesCont.appendChild(linesNode);
            linesNode.classList.add("word-option-lines");

            if(sneakySpotsEnabled && listenToExpansions)
            {
                const linePlusBtn = document.createElement("button");
                linesCont.appendChild(linePlusBtn);
                linePlusBtn.addEventListener("click", (ev) => {
                    wordObject.updateLines(+1); 
                    linesNode.innerHTML = wordObject.getLines();
                    cont.dataset.numlines = wordObject.getLines();
                    ev.stopPropagation();
                }, true)
                linePlusBtn.innerHTML = "+";
    
                const lineMinBtn = document.createElement("button");
                linesCont.appendChild(lineMinBtn);
                lineMinBtn.addEventListener("click", (ev) => { 
                    wordObject.updateLines(-1); 
                    linesNode.innerHTML = wordObject.getLines();
                    cont.dataset.numlines = wordObject.getLines();
                    ev.stopPropagation();
                }, true)
                lineMinBtn.innerHTML = "-";
            }
            
            // Points ( = amount of food)
            const pointsCont = document.createElement("div");
            metadataNode.appendChild(pointsCont);
            pointsCont.classList.add("word-option-points-data");

            const pointsSprite = document.createElement("img");
            pointsCont.appendChild(pointsSprite);
            pointsSprite.src = "/photomone/assets/icon_points.webp";

            const pointsNode = document.createElement("div");
            pointsCont.appendChild(pointsNode);
            pointsNode.classList.add("word-option-points");

            if(sneakySpotsEnabled && listenToExpansions)
            {
                const pointsPlusBtn = document.createElement("button");
                pointsCont.appendChild(pointsPlusBtn);
                pointsPlusBtn.addEventListener("click", (ev) => { 
                    wordObject.updatePoints(+1); 
                    pointsNode.innerHTML = wordObject.getPoints();
                    cont.dataset.score = wordObject.getPoints();
                    ev.stopPropagation();
                }, true)
                pointsPlusBtn.innerHTML = "+";
    
                const pointsMinBtn = document.createElement("button");
                pointsCont.appendChild(pointsMinBtn);
                pointsMinBtn.addEventListener("click", (ev) => { 
                    wordObject.updatePoints(-1); 
                    pointsNode.innerHTML = wordObject.getPoints();
                    cont.dataset.score = wordObject.getPoints();
                    ev.stopPropagation();
                }, true)
                pointsMinBtn.innerHTML = "-";
            }
        }

        window.scrollTo(0,0);
        this.selectOption(this.wordOptionNodes[0]);
        this.setWordEater(false);
        this.visualize();
    }

    visualize()
    {
        for(let i = 0; i < this.wordOptions.length; i++)
        {
            const node = this.wordOptionNodes[i];
            const word = this.wordOptions[i];

            const wordNode = node.getElementsByClassName("word-option-word")[0];
            wordNode.innerHTML = word.getWord();

            const linesNode = node.getElementsByClassName("word-option-lines")[0];
            linesNode.innerHTML = word.getLines();
            node.dataset.numlines = word.getLines();

            const pointsNode = node.getElementsByClassName("word-option-points")[0];
            pointsNode.innerHTML = word.getPoints();
            node.dataset.score = word.getPoints();
        }
    }

    isSelected()
    {
        return this.curSelectedOption != null;
    }

    getOptionsAsList()
    {
        return this.wordOptions.slice();
    }

    getSelectedWord()
    {
        const idx = parseInt(this.curSelectedOption.dataset.wordindex);
        return this.wordOptions[idx];
    }

    getSelectedWordScore(deselect = false)
    { 
        if(!this.curSelectedOption) { return 0; }
        const score = parseInt(this.curSelectedOption.dataset.score); 
        if(deselect) { this.deselectOption(this.curSelectedOption); } 
        return score;
    }
}