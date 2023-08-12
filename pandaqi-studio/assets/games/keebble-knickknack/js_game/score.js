export default class Score {
    constructor(game)
    {
        this.game = game;
        this.scores = {};
        this.scoreNodes = {};
        for(const playerName of this.game.players.getPlayerNames())
        {
            this.scores[playerName] = 0;
            this.scoreNodes[playerName] = null;
        }

        this.createButtonHTML();
        this.node = this.createWindowHTML(); 
    }

    createButtonHTML()
    {
        const cont = document.createElement("div");
        cont.classList.add("scores-button-container");
        this.game.header.getContainer().appendChild(cont);

        const btn = document.createElement("button");
        cont.appendChild(btn);
        btn.classList.add("scores-button", "button-look");
        btn.innerHTML = "<span class='suboption-sprite suboption-sprite-points_standalone suboption-sprite-small'></span>";
        btn.addEventListener("click", (ev) => {
            this.toggleWindow();
        });
    }

    createWindowHTML()
    {
        const cont = document.createElement("div");
        cont.classList.add("scores-window");
        cont.style.display = 'none';
        document.body.appendChild(cont);

        for(const [name,score] of Object.entries(this.scores))
        {
            const div = document.createElement("div");
            div.classList.add("player-score-container", "disable-select");
            cont.appendChild(div);
            div.addEventListener("click", (ev) => {
                this.update(name, 1);
            })

            const nameNode = document.createElement("div");
            div.appendChild(nameNode);
            nameNode.innerHTML = name;

            const scoreNode = document.createElement("div");
            div.appendChild(scoreNode);
            scoreNode.innerHTML = score;
            this.scoreNodes[name] = scoreNode;
        }

        return cont;
    }

    destroyHTML()
    {
        this.node.remove();
    }
    
    toggleWindow()
    {
        if(this.node.style.display == 'none') {
            this.node.style.display = 'block';
            this.removeChangedClass();
        } else {
            this.node.style.display = 'none';
        }
    }

    removeChangedClass()
    {
        setTimeout(() => {
            for(const node of Object.values(this.scoreNodes))
            {
                node.classList.remove("popUp");
            }
        }, 30);
    }

    update(name, ds)
    {
        if(!(name in this.scores)) { return; }
        this.scores[name] += ds;
        this.scoreNodes[name].innerHTML = this.scores[name];

        this.game.playPopup(this.scoreNodes[name]);
    }

    getScores()
    {
        return this.scores;
    }

    getScoresAsList()
    {
        const list = [];
        for(const [name, score] of Object.entries(this.scores))
        {
            list.push({ name: name, score: score});
        }
        return list;
    }

    setRandom()
    {
        for(const name of Object.keys(this.scores))
        {
            this.scores[name] = Math.floor(Math.random()*20) + 1;
        }
    }
}