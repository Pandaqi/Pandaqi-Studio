import RandomNaivigationSetupGenerator from "./randomNaivigationSetupGenerator";
import MaterialNaivigation from "./materialNaivigation";
import { CardType } from "./dictShared";
import GeneralPickerNaivigation from "./generalPickerNaivigation";
import { MaterialVisualizer, rangeInteger, shuffle, createContext, fillCanvas, convertCanvasToImage } from "lib/pq-games";
import { InteractiveExample } from "lib/pq-rulebook";

interface NaivigationTurnParams
{
    setup?: RandomNaivigationSetupGenerator
    cardPicker?: GeneralPickerNaivigation,
    movementCallback?: MovementCallbackFunction
    roundCallback?: RoundCallbackFunction,
    setupCallback?: RoundCallbackFunction,
    visualizer?: MaterialVisualizer
}

interface MovementResult
{
    feedback?: string[]
}

const DEF_MOVEMENT_CALLBACK = (card, setup, turn) => { return {}; }
const DEF_ROUND_CALLBACK = (setup, turn) => { return; }

type MovementCallbackFunction = (card:MaterialNaivigation, setup:RandomNaivigationSetupGenerator, turn:RandomNaivigationTurnGenerator) => MovementResult
type RoundCallbackFunction = (setup:RandomNaivigationSetupGenerator, turn:RandomNaivigationTurnGenerator) => void
type SetupCallbackFunction = (setup:RandomNaivigationSetupGenerator, turn:RandomNaivigationTurnGenerator) => void

export default class RandomNaivigationTurnGenerator
{
    setup: RandomNaivigationSetupGenerator
    cardPicker: GeneralPickerNaivigation
    cards: MaterialNaivigation[] // all possible cards to use
    cardsPlayed: MaterialNaivigation[] // cards played during this specific turn example
    setupCallback: SetupCallbackFunction // called once when the example is being set up
    movementCallback: MovementCallbackFunction // given this card, how does the vehicle move/change?
    roundCallback: RoundCallbackFunction // given the events this round, what should happen to end the round?
    example: InteractiveExample
    gameData: Record<string,any>
    generationData: Record<string,any> // for tracking special data while generating the random turn
    visualizer: MaterialVisualizer

    constructor(params:NaivigationTurnParams = {})
    {
        this.setup = params.setup;
        this.visualizer = params.visualizer;
        this.cardPicker = params.cardPicker;
        this.cards = [];
        this.setupCallback = params.setupCallback ?? DEF_ROUND_CALLBACK;
        this.movementCallback = params.movementCallback ?? DEF_MOVEMENT_CALLBACK;
        this.roundCallback = params.roundCallback ?? DEF_ROUND_CALLBACK;
        this.attachToRules();
    }

    generateAndSanitizeCards()
    {
        if(this.cards.length > 0) { return; }

        const allCards = this.cardPicker.generate();
        const validCards = [];
        for(const card of allCards)
        {
            if(card.type != CardType.VEHICLE) { continue; }
            validCards.push(card);
        }
        this.cards = validCards;
    }

    attachToRules()
    {
        const e = new InteractiveExample({ id: "naivigation-turn" });
        e.setButtonText("Give me an example turn!");
        e.setGenerationCallback(this.generate.bind(this));
        this.example = e;
    }

    getCardIndex(c:MaterialNaivigation)
    {
        return this.cardsPlayed.indexOf(c) ?? 0;
    }

    async generate()
    {
        const o = this.example.getOutputBuilder();
        o.addParagraph("The map currently looks like this:");
        await this.setup.onSetupRequested(o);

        this.gameData = {};
        this.setupCallback(this.setup, this); // necessary to get game data into some initial values

        o.addParagraph("Each player plays a facedown card to the instructions, without communication. Once done, they are revealed and handled one at a time, left to right.");

        this.generateAndSanitizeCards();

        const DEF_NUM_INSTRUCTIONS = 5;
        const numPlayers = rangeInteger(3,5);
        const cardsPlayed = shuffle(this.cards.slice()).slice(0, DEF_NUM_INSTRUCTIONS);
        this.cardsPlayed = cardsPlayed;

        const cardsVisualized = [];

        const ctx = createContext({ size: this.visualizer.size });
        fillCanvas(ctx, "#FFFFFF");
        const facedownCardImage = await convertCanvasToImage(ctx.canvas);

        this.generationData = {}; // for tracking special data as we go

        for(let i = 0; i < cardsPlayed.length; i++)
        {
            o.addNode(document.createElement("hr"));

            const card = cardsPlayed[i];
            cardsVisualized.push( await this.visualizeCard(card) );

            // fill the rest of the row with facedown/empty cards
            // @NOTE: we must cloneNode() everything, otherwise it just _moves_ the same HTML Image node!
            const copyFilledFacedown = [];
            for(let j = 0; j < cardsPlayed.length; j++)
            {
                if(j <= i) { copyFilledFacedown.push(cardsVisualized[j].cloneNode()); }
                else { copyFilledFacedown.push(facedownCardImage.cloneNode()); }
            }

            o.addParagraph("Reveal the next card, so the instruction row looks like this.");
            o.addFlexList(copyFilledFacedown);

            const moveResult = this.movementCallback(card, this.setup, this) ?? {}; // this actually executes the move
            if(Object.keys(moveResult).length > 0)
            {
                const fb = moveResult.feedback ?? [];
                if(fb.length > 0)
                {
                    o.addParagraph("<em>What happened?</em>");
                    o.addParagraphList(moveResult.feedback);    
                }
            }

            o.addParagraph("After executing that card, the map now looks like this.");
            await this.setup.visualizeToOutput(o);
        }

        o.addNode(document.createElement("hr"));

        this.roundCallback(this.setup, this); // this is very optional
    }

    async visualizeCard(card:MaterialNaivigation, facedown = false) : Promise<HTMLImageElement>
    {
        await this.visualizer.resLoader.loadPlannedResources();
        return await convertCanvasToImage(await card.drawForRules(this.visualizer));
    }
}