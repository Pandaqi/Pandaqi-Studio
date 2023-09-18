import InteractiveExample from "js/pq_rulebook/examples/interactiveExample"
import { PACKS, PACK_COLORS } from "../js_game/dict"
import shuffle from "js/pq_games/tools/random/shuffle"

const img = new Image();
img.src = "/kingseat/assets/kingseat_icon.webp"

const TOOLS = {
    fontSize: 14,
    fontFamily: "Brygada",
    swapProbability: 0.33,
    kingSeatImage: img
}

class Player
{
    name: string;
    card: string|null;

    constructor(name = "noname", card = null) 
    {
        this.name = name;
        this.card = card;
    }

    setCard(c) { this.card = c; }
    getCard() { return this.card; }
    discard() { this.setCard(null); }
    hasCard() { return this.card != null; }

    getName() { return this.name; }
    setName(n:string) { this.name = n; }

    getColorClass() { return PACKS[this.card].colorClass.toLowerCase(); }
    getColorData() { return PACK_COLORS[this.getColorClass()]; }
    getColor()
    {
        const data = this.getColorData();
        if(!data.bg) { return "#FFFFFF"; }
        return data.bg.color || "#FFFFFF";
    }

    getTextColor()
    {
        const data = this.getColorData();
        if(!data.action) { return "#000000"; }
        return data.action.color || "#000000";
    }

    draw(params:Record<string,any> = {})
    {
        const ctx = params.ctx;
        ctx.save();
        ctx.translate(params.pos.x, params.pos.y);

        const angle = params.angle - 0.5*Math.PI;
        ctx.rotate(angle);

        const xOffset = -0.5*params.size.x;
        const yOffset = -0.5*params.size.y;
        ctx.font = TOOLS.fontSize + "px " + TOOLS.fontFamily
        ctx.textAlign = "center";

        if(params.drawSeat)
        {
            const iconSize = 0.66*params.size.x;
            ctx.drawImage(TOOLS.kingSeatImage, -0.5*iconSize, 1.4*(yOffset - 0.5*iconSize), iconSize, iconSize);
        }

        if(this.hasCard()) {
            // card background
            ctx.fillStyle = this.getColor();
            ctx.fillRect(xOffset, yOffset, params.size.x, params.size.y);
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 3;
            ctx.strokeRect(xOffset, yOffset, params.size.x, params.size.y);

            // card type
            ctx.fillStyle = this.getTextColor();
            ctx.fillText(this.getCard(), 0, 0);
        }

        // player name
        if(!this.hasCard()) { ctx.fillStyle = "#000000"; } // otherwise we might get an unreadable color, with no bg rect to contrast it
        ctx.font = TOOLS.fontSize*2 + "px " + TOOLS.fontFamily;
        ctx.fillText(this.getName(), 0, -1*0.75*yOffset);

        ctx.restore();
    }
}

class Sequence
{
    type: string;
    length: number;
    distToSeat: number;

    constructor(type = "lionsyre", length = 0, distToSeat = 0)
    {
        this.type = type;
        this.length = length;
        this.distToSeat = distToSeat;
    }

    getType() { return this.type; }
    setType(t:string) { this.type = t; }

    getLength() { return this.length; }
    addLength(dl:number)
    {
        this.length += dl;
    }

    getDistToSeat() { return this.distToSeat; }
}

class GameState
{
    kingseat: number;
    types: string[];
    players: Player[];

    constructor()
    {
        this.kingseat = -1;
        this.types = [];
        this.players = [];
    }

    generate(numPlayers:number)
    {
        this.kingseat = Math.floor(Math.random() * numPlayers);

        const numTypes = numPlayers - 1;
        this.generateTypes(numTypes);
        this.generatePlayers(numPlayers);
    }

    generateTypes(numTypes:number)
    {
        const allTypes = Object.keys(PACKS);
        const validTypes : string[] = [];
        for(const type of allTypes)
        {
            const c = PACKS[type].colorClass;
            if(!c || c.toLowerCase() == "multicolor") { continue; }
            validTypes.push(type);
        }

        shuffle(validTypes)
        this.types = validTypes.slice(0, numTypes);
    }

    generatePlayers(numPlayers:number)
    {
        const arr : Player[] = [];
        const names = e.getNamesAlphabetical(numPlayers);
        for(let i = 0; i < numPlayers; i++)
        {
            arr.push(new Player(names[i], this.getRandomCard()));
        }
        this.players = arr;
    }

    removeSequence(seq:Sequence)
    {
        for(let i = 0; i < seq.getLength(); i++)
        {
            const idx = (this.kingseat + seq.getDistToSeat() + i) % this.players.length;
            this.players[idx].discard();
        }
    }

    getRandomCard()
    {
        return shuffle(this.types)[0];
    }

    getKingseat() { return this.kingseat; }
    getKingseatPlayer() { return this.players[this.kingseat]; }
    getIndexOf(player:Player) { return this.players.indexOf(player); }
    getRandomPlayer(exclude : Player[] = [])
    {
        const arr : Player[] = [];
        for(const p of this.players)
        {
            if(exclude.includes(p)) { continue; }
            arr.push(p);
        }
        return shuffle(arr)[0];
    }

    swapPlayers(p1, p2)
    {
        const tempIndexP2 = this.getIndexOf(p2);
        this.players[this.getIndexOf(p1)] = p2;
        this.players[tempIndexP2] = p1;
    }

    getWinner()
    {
        // determine every sequence (and its metadata)
        const sequences : Sequence[] = [];
        for(const type of this.types)
        {
            let curSequence : Sequence|null = null;
            for(let i = 0; i < this.players.length; i++)
            {
                const idx = (this.kingseat + i) % this.players.length;
                const cardPlayed = this.players[idx].getCard();
                if(cardPlayed == type)
                {
                    if(!curSequence) { curSequence = new Sequence(type, 0, i); }
                    curSequence.addLength(1);
                }

                if(cardPlayed != type && curSequence)
                {
                    sequences.push(curSequence);
                    curSequence = null;
                }
            }

            if(curSequence) { sequences.push(curSequence); }
        }

        console.log(sequences);

        // now sort, first on length (LONGER = BETTER)
        // then break ties on distToSeat (SMALLER = BETTER, so reversed)
        sequences.sort(function(s1, s2) {
            if(s1.getLength() < s2.getLength()) { return 1; }
            if(s1.getLength() > s2.getLength()) { return -1; }
            
            if(s1.getDistToSeat() < s2.getDistToSeat()) { return -1; }
            if(s1.getDistToSeat() > s2.getDistToSeat()) { return 1; }
            return 0;
        });

        console.log(sequences);

        const winningSequence = sequences[0];
        return winningSequence;
    }

    getUnhandledPlayers(startingIndex = this.kingseat)
    {
        const arr : Player[] = [];
        for(let i = 0; i < this.players.length; i++)
        {
            const idx = (startingIndex + i) % this.players.length; 
            if(!this.players[idx].hasCard()) { continue; }
            arr.push(this.players[idx])
        }
        return arr;
    }

    getNextUnhandledPlayer(startingIndex : number = this.kingseat)
    {
        return this.getUnhandledPlayers(startingIndex)[0];
    }

    isPlayerKingseat(p:Player)
    {
        return this.getIndexOf(p) == this.kingseat;
    }

    draw()
    {
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 512;
        
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

        const circleCenter = { x: 0.5*canvas.width, y: 0.5*canvas.height }
        const circleRadius = 0.33*Math.min(canvas.width, canvas.height);
        const angleOffset = 2 * Math.PI / this.players.length;

        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let angle = 1.5 * Math.PI
        for(const p of this.players)
        {
            const x = Math.cos(angle)*circleRadius + circleCenter.x;
            const y = Math.sin(angle)*circleRadius + circleCenter.y;
            const params = {
                ctx: ctx,
                pos: { x: x, y: y },
                size: { x: 80, y: 125 },
                angle: angle,
                drawSeat: this.isPlayerKingseat(p)
            }

            p.draw(params);
            angle += angleOffset
        }

        const container = document.createElement("div");
        container.style.textAlign = "center";
        container.appendChild(canvas);
        return container;
    }
}

async function generate()
{
    const numPlayers = e.getNumPlayers(3,6);
    const board = new GameState();
    board.generate(numPlayers);

    // setup
    o.addParagraph("All players picked a secret card. Once revealed, the game looks as follows.");
    o.addNode(board.draw());

    // winning votes => tell
    const winningSequence = board.getWinner();
    o.addParagraph("The first type with the most (subsequent) votes is <strong>" + winningSequence.getType() + "</strong> (<em>" + PACKS[winningSequence.getType()].colorClass + "</em>).");
    o.addParagraph("All cards from that sequence (" + winningSequence.getLength() + ") go into the Tell.");
    board.removeSequence(winningSequence);
    o.addNode(board.draw());

    // other players
    let idx = board.getKingseat() - 1; // see "+1" explanation below
    let somebodySwappedPlaces = false;
    const feedbackList : string[] = [];

    const allCardsWon = board.getUnhandledPlayers().length == 0

    o.addParagraph("Now we handle all remaining cards.");
    while(board.getUnhandledPlayers().length > 0)
    {
        // "+1" because we want to start looking from the NEXT index, instead of the one we just did
        const p : Player = board.getNextUnhandledPlayer(idx + 1);
        console.log("Player", p);
        idx = board.getIndexOf(p);
        console.log("Index", idx);

        const swapPlaces = Math.random() <= TOOLS.swapProbability;
        if(swapPlaces) {
            const p2 = board.getRandomPlayer([p]);
            feedbackList.push("<strong>" + p.getName() + "</strong> swaps places with <strong>" + p2.getName() + "</strong>");
            board.swapPlayers(p, p2);
            somebodySwappedPlaces = true;
        } else {
            feedbackList.push("<strong>" + p.getName() + "</strong> decides to execute the action on their card.");
        }
        p.discard();
    }

    if(allCardsWon || feedbackList.length <= 0) {
        o.addParagraph("But here are none! All cards went into the Tell.");
    } else {
        o.addParagraphList(feedbackList);
    }

    // final state
    o.addParagraph("The round is over! <strong>" + board.getKingseatPlayer().getName() + "</strong> currently sits in the kingseat (and is king).");
    if(somebodySwappedPlaces)
    {
        o.addParagraph("The game now looks as follows.");
        o.addNode(board.draw());
    }
}

const e = new InteractiveExample({ id: "turn" });
e.setButtonText("Give me an example turn!");
e.setGenerationCallback(generate);

const o = e.getOutputBuilder();




function addPrinceDataToNode(node, data)
{
    let h3, p

    // clarifications
    if(data.clarification != null)
    {
        const clar = document.createElement("div");
        node.appendChild(clar);
        clar.classList.add("prince-clarifications")
    
        h3 = document.createElement("h3");
        clar.appendChild(h3);
        h3.innerHTML = "Clarification(s)"
        p = document.createElement("p");
        clar.appendChild(p);
        p.innerHTML = data.clarification
    }

    // backstory
    const backstory = document.createElement("div");
    node.appendChild(backstory);
    backstory.classList.add("prince-backstory")

    h3 = document.createElement("h3");
    backstory.appendChild(h3);
    h3.innerHTML = "Backstory"
    p = document.createElement("p");
    backstory.appendChild(p);
    p.innerHTML = data.backstory

    // data
    const metadata = document.createElement("div");
    node.appendChild(metadata);
    metadata.classList.add("prince-metadata");

    h3 = document.createElement("h3");
    metadata.appendChild(h3);
    h3.innerHTML = "Information"

    const ul = document.createElement("ul");
    metadata.appendChild(ul);

    let li = document.createElement("li");
    ul.appendChild(li);
    li.innerHTML = "<strong>Slogan</strong>: &ldquo;" + data.slogan.text + "&rdquo;"
    
    li = document.createElement("li");
    ul.appendChild(li);
    li.innerHTML = "<strong>Animal</strong>: " + data.animal

    li = document.createElement("li");
    ul.appendChild(li);
    li.innerHTML = "<strong>Color</strong>: " + data.colorClass

    li = document.createElement("li");
    ul.appendChild(li);
    li.innerHTML = "<strong>Actions</strong>: "

    const ul2 = document.createElement("ul");
    li.appendChild(ul2);

    let li2 = document.createElement("li");
    ul2.appendChild(li2);
    li2.innerHTML = "<strong>Regular</strong>: " + data.action.text

    for(let i = 0; i < data.dark.length; i++)
    {
        li2 = document.createElement("li");
        ul2.appendChild(li2);
        li2.innerHTML = "<strong>Dark " + (i+1) + "</strong>: " + data.dark[i]
    }
}

const princeInfos = Array.from(document.getElementsByClassName("prince-info")) as HTMLElement[];
for(const infoNode of princeInfos)
{
    const princeName = infoNode.dataset.prince || "lionsyre"
    const data = PACKS[princeName]
    addPrinceDataToNode(infoNode, data)
}