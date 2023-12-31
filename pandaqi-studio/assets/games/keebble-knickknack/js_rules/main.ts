import InteractiveExample from "js/pq_rulebook/examples/interactiveExample"

const KEEBBLE_LETTER_VALUES = {
    A: 1,
    B: 3,
    C: 3,
    D: 2,
    E: 1,
    F: 4,
    G: 2,
    H: 4,
    I: 1,
    J: 8,
    K: 5,
    L: 1,
    M: 3,
    N: 1,
    O: 1,
    P: 3,
    Q: 10,
    R: 1,
    S: 1,
    T: 1,
    U: 1,
    V: 4,
    W: 4,
    X: 8,
    Y: 4,
    Z: 10
}

const tools = {
    getWordScoreText(word)
    {
        let scores : number[] = [];
        let sum = 0;
        for(let i = 0; i < word.length; i++)
        {
            const score = KEEBBLE_LETTER_VALUES[word.at(i)];
            scores.push(score);
            sum += score;
        }

        return scores.join(" + ") + " = " + sum;
    }
}

interface OptionData
{
    type: string,
    num: number,
    letters: string[]
}

async function generate() {
    const numPlayers = e.getNumPlayers(2,4)
    const names = e.getNames(numPlayers);
    const allOptions = ["Start Player", "Letter", "Wall", "Points"];
    const wordOptions = ["CAT", "DOG", "PHONE", "CHAIR", "EAT", "ALE", "TABLE", "HUT", "APPLE", "RANGE", "CAR", "DANCE", "OPEN", "OKAY", "INN", "MINT", "HAT", "ACE", "PEAR", "HAND", "DUST", "SIN", "SAP", "SUPER", "OLD"];
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    // select a random array of options
    const numOptions = 1 + (1 + Math.floor(Math.random() * numPlayers));
    const options : OptionData[] = [];
    for(let i = 0; i < numOptions; i++)
    {
        const randIdx = Math.floor(Math.random() * allOptions.length);
        const randOption = allOptions[randIdx];
        const obj : OptionData = { 
            type: randOption,
            num: 1,
            letters: []
        }

        if(randOption == "Letter")
        {
            obj.num = Math.floor(Math.random() * 3) + 1;
            obj.letters = e.getRandomFromList(alphabet.split(""), obj.num);
        }

        if(randOption == "Wall")
        {
            obj.num = Math.floor(Math.random() * 3) + 2;
        }

        if(randOption == "Points")
        {
            obj.num = Math.floor(Math.random() * 5) + 2;
        }

        const singleUseOption = (randOption == "Start Player" || randOption == "Points")
        if(singleUseOption) { allOptions.splice(randIdx, 1); }

        options.push(obj);
    }

    // display what's available
    o.addParagraph("These options are available:");
    const list : string[] = [];
    for(const option of options)
    {
        let extraInfo = "";

        if(option.type == "Letter")
        {
            extraInfo = option.letters.join(", ");
        }

        if(option.type == "Wall" || option.type == "Points") 
        {
            extraInfo = "x" + option.num;
        }

        let concatenator = ": ";
        if(!extraInfo) { concatenator = ""; }

        list.push("<strong>" + option.type + concatenator + "</strong>" + extraInfo);
    }
    o.addParagraphListNumbered(list);
    
    // pick something
    const randOptionIdx = Math.floor(Math.random() * options.length);
    o.addParagraph("You pick option " + (randOptionIdx + 1) + ".");

    // handle it => basic info
    const optionPicked = options.splice(randOptionIdx, 1)[0];
    const placedLetters = optionPicked.type == "Letter";
    if(placedLetters)
    {
        if(optionPicked.num == 1) { o.addParagraph("You place this letter on the board."); }
        else { o.addParagraph("You place these letters on the board."); }
    }

    if(optionPicked.type == "Start Player")
    {
        o.addParagraph("You will start the next round. (And thus get the first pick from the new options.)")
    }

    if(optionPicked.type == "Wall")
    {
        o.addParagraph("You may draw " + optionPicked.num + " walls on empty edges on the board!");
    }

    if(optionPicked.type == "Points")
    {
        o.addParagraph("You get " + optionPicked.num + " points! Tap your name that many times in the score interface.");
    }

    // handle letter placement + scoring (only if that option picked, of course)
    //@TODO: randomly decide that you form words or not, then hand out points based on that
    if(placedLetters)
    {
        const randLetter = optionPicked.letters[Math.floor(Math.random() * optionPicked.letters.length)];
        let wordPlaced : string = "";
        for(const word of wordOptions)
        {
            if(!word.includes(randLetter)) { continue; }
            wordPlaced = word;
            break;
        }

        if(wordPlaced.length > 0) {
            o.addParagraph("You were able to form a new word: " + wordPlaced + ".");
            o.addParagraph("You score " + tools.getWordScoreText(wordPlaced) + " points. (Tap your name in the interface to add points.)");

            const numOthers = Math.floor(Math.random() * (wordPlaced.length - 1));
            if(numOthers == 0) { o.addParagraph("All letters used were yours, so no other players get points."); }
            else if(numOthers == 1) {
                o.addParagraph("Of those letters, 1 was from another player, so they also score points for that.");
            } else {
                o.addParagraph("Of those letters, " + numOthers + " were from other players, so they also get points for that.");
            }

        } else {
            o.addParagraph("You did not create a new word, so don't score any points.");
        }
    }

    // handle end of turn
    if(options.length > 1) {
        o.addParagraph("End of turn! Next player may pick their option.");
    } else {
        o.addParagraph("One option left, so the round ends! The interface automatically continues and gives new options.");
    }
}

const e = new InteractiveExample({ id: "turn" });
e.setButtonText("Give me an example turn!");
e.setGenerationCallback(generate);

const o = e.getOutputBuilder();