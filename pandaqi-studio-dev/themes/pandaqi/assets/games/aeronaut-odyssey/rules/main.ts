import InteractiveExample from "lib/pq-rulebook/examples/interactiveExample"

async function generate()
{

}

const e = new InteractiveExample({ id: "turn" });
e.setButtonText("Give me an example turn!");
e.setGenerationCallback(generate);

const o = e.getOutputBuilder();