import { InteractiveExampleSimulator, loadRulebook } from "lib/pq-rulebook";
import { getMaterialDataForRulebook, Vector2 } from "lib/pq-games";

const DATA =
{
    apple: { frame: 0, desc: "This is a description." },
    banana: { frame: 1, desc: "This is a description." },
    citrus: { frame: 2, desc: "This is a description." },
    donut: { frame: 3, desc: "This is a description." },
    eagle: { frame: 4, desc: "This is a description." },
    fruit: { frame: 5, desc: "This is a description." }
}

const CONFIG =
{
    _resources:
    {
        base: "/test/assets/",
        files:
        {
            types:
            {
                path: "cell_types.webp",
                frames: new Vector2(8,4)
            }
        }
    },

    _material:
    {
        card:
        {
            picker: () => { return [1,2,3,4,5]; }
        }
    }
}

const CALLBACK_EXAMPLE = async (sim:InteractiveExampleSimulator) =>
{
    await sim.loadMaterialCustom(getMaterialDataForRulebook(CONFIG));

    console.log("Example thingy", sim);

    const o = sim.getOutputBuilder();
    o.addParagraph("What is this? A paragraph!?");
    o.addParagraphList(["Item 1", "Item 2", "Item 3"]);

    const res = sim.getVisualizer().getResource("types");
    console.log(res);
    o.addNode(res.getImage());

    console.log(sim.getPicker("card")());
}

const CONFIG_RULEBOOK =
{
    examples:
    {
        turn:
        {
            buttonText: "Custom button text wiehoo!",
            callback: CALLBACK_EXAMPLE
        }
    },

    tables:
    {
        test:
        {
            data: DATA,
            icons:
            {
                config:
                {
                    sheetURL: "cell_types.webp",
                    sheetWidth: 8,
                    base: "/test/assets/"
                }
            }
        }
    },

    icons:
    {
        sheet1:
        {
            config:
            {
                sheetURL: "cell_types.webp",
                sheetWidth: 8,
                base: "/test/assets/"
            },
            icons: DATA
        }

    }
}

loadRulebook(CONFIG_RULEBOOK);