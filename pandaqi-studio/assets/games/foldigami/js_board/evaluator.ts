import Board from "./board";
import BoardState from "./boardState";
import CONFIG from "./config"

export default class Evaluator
{
    game: any;
    scores: number[];
    state: BoardState;

    constructor(game) 
    {
        this.game = game;
        this.scores = null;
    }

    evaluate(board)
    {
        if(!board.generationSuccess) { return false; }

        let isValid = true;
        const state = this.cloneAndPrepareGrid(board);
        this.state = state;

        //
        // Step 1) check for specific exceptions
        //
        // CROWN1 can't share line (row, column) with other crown or neighbor empty spaces.
        const crownCellsType1 = state.getCellsOfType("crown1");
        for(const cell of crownCellsType1)
        {
            const nbs = state.getNeighbors(cell);
            let hasEmptyNeighbour = false;
            for(const nb of nbs) 
            {
                if(!nb.getType()) { hasEmptyNeighbour = true; break; }
            }

            const sameLine = state.getCellsSameRow(cell).concat(state.getCellsSameColumn(cell));
            let sharesLineWithCrown = false;
            for(const cell of sameLine)
            {
                if(cell.getType() == "crown1") { sharesLineWithCrown = true; break; }
            }

            if(hasEmptyNeighbour || sharesLineWithCrown) { isValid = false; break; }
        }

        // CROWN2 is too powerful to allow an imbalance
        const crownCellsType2 = state.getCellsOfType("crown2");
        const numCrownsPerTeam = [0,0];
        for(const cell of crownCellsType2) {
            numCrownsPerTeam[cell.getTeam()] += 1;
        }

        if(numCrownsPerTeam[0] != numCrownsPerTeam[1]) { isValid = false; }

        // SHIELDS have no score influence, and thus ignored by evaluator scores
        // That's why we check if they're equal this way
        const shieldCells = state.getCellsOfType("shield1").concat(state.getCellsOfType("shield2"));
        const numShieldsPerTeam = [0,0];
        for(const cell of shieldCells) {
            numShieldsPerTeam[cell.getTeam()] += 1;
        }

        if(numShieldsPerTeam[0] != numShieldsPerTeam[1]) { console.error("Failed because of imbalanced shields!"); isValid = false; }

        if(!isValid) { return isValid; }

        //
        // Step 2) calculate raw scores
        //
        const scores = [];
        for(let i = 0; i < CONFIG.teams.num; i++)
        {
            const score = this.calculateScoreForTeam(state, i);
            scores.push(score);
        }

        let maxDiffBetweenScores = 0;
        for(const score1 of scores)
        {
            for(const score2 of scores)
            {
                maxDiffBetweenScores = Math.max(maxDiffBetweenScores, Math.abs(score1-score2));
            }
        }

        let hasNegativeScore;
        for(const score of scores)
        {
            if(score >= 0) { continue; }
            hasNegativeScore = true;
            break;
        }  

        this.scores = scores;

        isValid = maxDiffBetweenScores <= CONFIG.teams.maxStartingScoreDifference;
        if(CONFIG.evaluator.forbidNegativeScores && hasNegativeScore) { isValid = false; }

        return isValid;
    }

    cloneAndPrepareGrid(board)
    {        
        const state = board.cloneState();

        // because we cache ALL bombs beforehand, this neatly allows us to disable everything except bombs
        const bombCells = state.getCellsOfType("bomb");
        for(const bombCell of bombCells)
        {
            const nbs = state.getNeighbors(bombCell);
            for(const nb of nbs)
            {
                nb.setType(null);
            }
        }

        // tortoises are simple: belong to closest player, or nobody if tied
        const tortoiseCells = state.getCellsOfType("tortoise");
        for(const tortoiseCell of tortoiseCells)
        {
            const closestTeam = state.getClosestPlayer(tortoiseCell);
            if(closestTeam == -1) { continue; }
            tortoiseCell.setTeam(closestTeam);
        }

        // the cells below belong to the player to whom they point (can be no player if points to the side)
        let pointingCells = state.getCellsOfType("bird");
        pointingCells = pointingCells.concat(state.getCellsOfType("arrow2"));

        for(const cell of pointingCells)
        {
            const pointedTeam = state.getPlayerPointedAtBy(cell);
            if(pointedTeam == -1) { continue; }
            cell.setTeam(pointedTeam);
        }


        // spies must come LAST
        // first we consider all spy influences for all cells
        const spyCells = state.getCellsOfType("spy");
        for(const spyCell of spyCells)
        {
            const nbs = state.getNeighbors(spyCell);
            for(const nb of nbs)
            {
                nb.addSpy(spyCell.getTeam());
            }
        }

        // then we set them to the correct team based on that
        const cells = state.getGridFlat();
        for(const cell of cells)
        {
            if(cell.getType() == "spy") { continue; }
            cell.setTeamToSpies();
        }

        return state;
    }

    calculateScoreForTeam(state, team)
    {
        console.log("[DEBUG] Evaluator State");
        console.log(state.getGridFlat().slice());

        const cells = state.getGridFlat();
        let sum = 0;
        for(const cell of cells)
        {
            const cellScore = this.calculateScoreForCell(state, cell, team);
            if(cellScore == null) { continue; }
            cell.setScore(cellScore);
            sum += cellScore;
        }
        return sum;
    }

    calculateScoreForCell(state, cell, team)
    {
        if(cell.isEmpty()) { return null; }

        const notOurTeam = !cell.hasTeam() || (cell.getTeam() != team);
        if(notOurTeam) { return null; }

        const t = cell.getType();
        const needsNoCalculation = CONFIG.typeDict[t].skipEval;
        if(needsNoCalculation) { return null; }

        let score = 0;
        if(t == "dragon" || t == "tortoise" || t == "bird" || t == "joker2") {
            score += cell.getValue();
        
        } else if(t == "arrow1") {
            const cells = state.getCellsInDirection(cell, { removeSelf: true });
            for(const cell of cells)
            {
                if(cell.isEmpty()) { score += 1; }
                else { score -= 1; }
            }

        } else if(t == "arrow2") {
            const cells = state.getCellsInDirection(cell, { removeSelf: true });
            for(const cell of cells)
            {
                if(!cell.isEmpty()) { continue; }
                score += 2;
            }

        } else if(t == "twins1") {
            score += 0.5*CONFIG.typeDict[t].score;
        
        } else if(t == "twins2") {
            const allTwins = state.getCellsOfType("twins2");
            let numTwinsMyTeam = 0;
            for(const twin of allTwins)
            {
                if(twin.getTeam() != team) { continue; }
                numTwinsMyTeam++;
            }

            const isEven = numTwinsMyTeam % 2 == 0;
            if(isEven) { score += CONFIG.typeDict[t].score; }

        } else if(t == "sword") {
            const cells = state.getCellsInDirection(cell, { bidirectional: true, removeSelf: true });
            for(const cell of cells)
            {
                if(!cell.isEmpty()) { continue; }
                score += 1;
            }

        } else if(t == "tiger1") {
            score += state.getGroupOfType(cell, t).length;
        
        } else if(t == "tiger2") {
            const nbs = state.getNeighbors(cell);
            for(const nb of nbs)
            {
                if(!nb.isEmpty()) { continue; }
                score += CONFIG.typeDict[t].score;
            }
        
        } else if(t == "crown3") {
            const nbs = state.getNeighbors(cell);
            let numEmptyNeighbors = 0;
            for(const nb of nbs)
            {
                if(!nb.isEmpty()) { continue; }
                numEmptyNeighbors++;
            }

            const allNeighborsEmpty = (numEmptyNeighbors >= nbs.length);
            if(allNeighborsEmpty) { score += CONFIG.typeDict[t].score; }

        } else if(t == "bear1") {
            const scrollCells = state.getCellsOfType("scroll");
            for(const scrollCell of scrollCells)
            {
                const closestTeam = state.getClosestPlayer(scrollCell);
                if(closestTeam != team) { continue; }
                score += 1;
            }
        } else if(t == "bear2") {
            const blankCells = state.getBlankCells();
            for(const cell of blankCells)
            {
                const closestTeam = state.getClosestPlayer(cell);
                if(closestTeam != team) { continue; }
                score += 1;
            }
        }

        return score;
    }

    draw(board:Board)
    {
        const textCfg = {
            fontFamily: "Jockey One",
            fontSize: "64px",
            color: "#330000",
            strokeColor: "#ffffff",
            strokeThickness: 12,
            align: "left"
        }

        const cells = this.state.getGridFlat();
        if(CONFIG.evaluator.debug)
        {
            console.log("[DEBUG] Scores");
            console.log(this.scores);

            for(const c of cells)
            {
                const score = c.getScore();
                if(score == null) { continue; }
    
                const rect = board.getRectForCell(c);
                const scoreText = this.game.add.text(rect.x, rect.y, score.toString(), textCfg);
                const teamText = this.game.add.text(rect.x + 70, rect.y, c.getTeam(), textCfg);
            }
        }

        const fontCfg = CONFIG.evaluator.font;
        const cs = board.cellSizeSquare;
        textCfg.fontSize = fontCfg.size * cs + "px"
        textCfg.color = fontCfg.color;
        textCfg.strokeColor = fontCfg.strokeColor;
        textCfg.strokeThickness = fontCfg.strokeThickness;
        textCfg.align = "right";

        const txt = "Start dragons: " + this.scores.join(", ");
        const margin = fontCfg.margin * cs;
        const textX = this.game.canvas.width - margin;
        const textY = this.game.canvas.height - margin;
        const scoreText = this.game.add.text(textX, textY, txt, textCfg);
        scoreText.setOrigin(1.0, 1.0);
    }
}