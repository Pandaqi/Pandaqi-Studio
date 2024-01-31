import rangeInteger from "js/pq_games/tools/random/rangeInteger";
import shuffle from "js/pq_games/tools/random/shuffle";
import InteractiveExample from "js/pq_rulebook/examples/interactiveExample";
import RandomNaivigationSetupGenerator from "./randomNaivigationSetupGenerator";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import convertCanvasToImage from "js/pq_games/layout/canvas/convertCanvasToImage";

interface NaivigationTurnParams
{
    setup?: RandomNaivigationSetupGenerator
    cards?: any[]
    movementCallback?: Function
    roundCallback?: Function,
    visualizer?: MaterialVisualizer
}

const DEF_MOVEMENT_CALLBACK = (card, setup, example) => { return; }
const DEF_ROUND_CALLBACK = (example) => { return; }

export default class RandomNaivigationTurnGenerator
{
    setup: RandomNaivigationSetupGenerator
    cards: any[]
    movementCallback: Function // given this card, how does the vehicle move/change?
    roundCallback: Function // given the events this round, what should happen to end the round?
    example: InteractiveExample
    generationData: Record<string,any> // for tracking special data while generating the random turn
    visualizer: MaterialVisualizer

    constructor(params:NaivigationTurnParams = {})
    {
        this.setup = params.setup;
        this.visualizer = params.visualizer;
        this.cards = params.cards ?? [];
        this.movementCallback = params.movementCallback ?? DEF_MOVEMENT_CALLBACK;
        this.roundCallback = params.roundCallback ?? DEF_ROUND_CALLBACK;
        this.attachToRules();
    }

    attachToRules()
    {
        const e = new InteractiveExample({ id: "naivigation-turn" });
        e.setButtonText("Give me an example turn!");
        e.setGenerationCallback(this.generate.bind(this));
        this.example = e;
    }

    async generate()
    {
        this.setup.generate();

        const o = this.example.getOutputBuilder();
        o.addParagraph("The map currently looks like this:");
        o.addNode(await this.setup.visualize());

        o.addParagraph("Each player plays a facedown card to the instructions, without communication. Once done, they are revealed and handled one at a time, left to right.");

        const numPlayers = rangeInteger(3,5);
        const cardsPlayed = shuffle(this.cards.slice()).slice(0, numPlayers);
        const cardsVisualized = [];
        for(const card of cardsPlayed)
        {
            cardsVisualized.push(await this.visualizeCard(card, true));
        }

        this.generationData = {}; // for tracking special data as we go

        for(let i = 0; i < cardsPlayed.length; i++)
        {
            o.addNode(document.createElement("hr"));

            const card = cardsPlayed[i];
            cardsVisualized[i] = await this.visualizeCard(card);
            o.addFlexList(cardsVisualized);

            this.movementCallback(card, this.setup, this); // this actually executes the move

            o.addParagraph("Now the map looks like this:");
            o.addNode(await this.setup.visualize());
        }

        o.addNode(document.createElement("hr"));

        this.roundCallback(this); // this is very optional
    }

    async visualizeCard(card:any, facedown = false) : Promise<HTMLImageElement>
    {
        await this.visualizer.resLoader.loadPlannedResources();

        let canv
        if(facedown) {
            const ctx = createContext({ size: this.visualizer.size });
            fillCanvas(ctx, "#FFFFFF");
            canv = ctx.canvas;
        } else {
            if(typeof card.drawForRules === "function") {
                canv = await card.drawForRules(this.visualizer);
            } else {
                canv = await card.draw(this.visualizer);
            }
        }

        return await convertCanvasToImage(canv);
    }
}