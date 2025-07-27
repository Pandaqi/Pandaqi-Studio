import InteractiveExampleSimulator from "js/pq_rulebook/examples/interactiveExampleSimulator";

const callbackInitStats = () =>
{
    return {
        numSwaps: 0,
        numActionsTaken: 0,
        numRounds: 0,
        numVotesCast: 0,
        tellerHandSizeEnd: 0,
        leaderHandSizeEnd: 0,
        leaderPartOfWinningSequence: 0,
        numRoundsDecidedByMajority: 0,
        numRoundsRequiringSequenceCheck: 0,
        numRoundsWithTiedMajorities: 0,
        numRoundsWithTiedSequences: 0,
        numSwapsWithLeader: 0,
        couldNotObeyVoteRestrictions: 0,
        couldObeyVoteRestrictions: 0,
        disobeyedVoteRestrictions: 0, // when done on purpose, even if you could obey
        numWinningCardsDist: 
        {
            0: 0,
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
            6: 0,
            7: 0,
            8: 0
        }
    }
}

const callbackFinishStats = (sim:InteractiveExampleSimulator) =>
{
    const numRounds = sim.stats.numRounds;
    const iters = sim.getIterations();

    sim.stats.numSwapsPerRound = sim.stats.numSwaps / numRounds;
    sim.stats.numActionsTakenperRound = sim.stats.numActionsTaken / numRounds;
    sim.stats.leaderPartOfWinningSequenceAvg = sim.stats.leaderPartOfWinningSequence / numRounds;
    sim.stats.numSwapsWithLeaderPerRound = sim.stats.numSwapsWithLeader / numRounds;
    sim.stats.numSwapsWithLeaderPerGame = sim.stats.numSwapsWithLeader / iters;

    sim.stats.numRoundsDecidedByMajorityAvg = sim.stats.numRoundsDecidedByMajority / numRounds;
    sim.stats.numRoundsRequiringSequenceCheckAvg = sim.stats.numRoundsRequiringSequenceCheck / numRounds;
    sim.stats.numRoundsWithTiedSequencesAvg = sim.stats.numRoundsWithTiedSequences / numRounds;
    sim.stats.numRoundsWithTiedMajoritiesAvg = sim.stats.numRoundsWithTiedMajorities / numRounds;

    sim.stats.tellerHandSizeEndAvg = sim.stats.tellerHandSizeEnd / iters;
    sim.stats.leaderHandSizeEndAvg = sim.stats.leaderHandSizeEnd / iters;
    sim.stats.couldNotObeyVoteRestrictionsChance = sim.stats.couldNotObeyVoteRestrictions / sim.stats.numVotesCast;
    sim.stats.couldObeyVoteRestrictionsChance = sim.stats.couldObeyVoteRestrictions / sim.stats.numVotesCast;
    sim.stats.disobeyedVoteRestrictionsChance = sim.stats.disobeyedVoteRestrictions / sim.stats.numVotesCast;
}

export 
{
    callbackInitStats,
    callbackFinishStats
}