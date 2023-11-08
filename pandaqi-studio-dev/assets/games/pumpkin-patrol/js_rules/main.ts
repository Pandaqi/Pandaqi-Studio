import InteractiveExample from "js/pq_rulebook/examples/interactiveExample"
import DecisionTree from "js/pq_trees/main";

const CONFIG =
{
    
}

async function generate()
{
    // @TODO
}

const e = new InteractiveExample({ id: "turn" });
e.setButtonText("Give me an example turn!");
e.setGenerationCallback(generate);

const o = e.getOutputBuilder();



// @DEBUGGING DecisionTree system
const trees = Array.from(document.getElementsByClassName("decision-tree")) as HTMLElement[];
for(const treeNode of trees)
{
    const t = new DecisionTree(treeNode);
    t.load();
}