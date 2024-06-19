import Settings from "js/pq_games/website/settings"

/* Attach event to game settings interfaces */
// @TODO: should probably be moved to cleaner system? Somewhere else?
Settings.initGame();

/* Basic navigation (go to bottom, go to top, random) */
const bottomBtn = document.getElementById('gotoBottomBtn') as HTMLButtonElement

if(bottomBtn) 
{
    bottomBtn.addEventListener('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();

        const footer = document.getElementsByTagName('footer')[0]
        const metadataBlock = document.getElementById('metadata-block');
        if(metadataBlock) {
            metadataBlock.scrollIntoView({ 'behavior': 'smooth' });
        } else {
            footer.scrollIntoView({ 'behavior': 'smooth' });
        }

        return false;
    })
}

const topBtn = document.getElementById('gotoTopBtn') as HTMLButtonElement

if(topBtn) 
{
    topBtn.addEventListener('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();

    	window.scrollTo({top: 0, behavior: 'smooth'});
        return false;
    })
}

const randBtn = document.getElementById('randProjBtn') as HTMLButtonElement

if(randBtn) 
{
    randBtn.addEventListener('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();

        const metadataNode = document.getElementById("hidden-hugo-metadata");
        if(!metadataNode) { console.error("Can't find hidden Hugo metadata node on page!", metadataNode); }
        
        const listString = metadataNode.dataset.pages;
        if(!listString) { console.log("Can't find list of random pages (from Hugo metadata node)", listString); }
        
        const listArray = listString.split(",");
        const randURL = listArray[Math.floor(Math.random() * listArray.length)];
        window.location.href = randURL;
        return false;
    })
}

/* Fold / Unfold functionality for rules explanations on MAIN page ( = NOT rulebook) */
const unfoldBtn = document.getElementById('unfold-explanation-btn');
const unfoldElem = document.getElementById('unfold-explanation');
if(unfoldBtn && unfoldElem)
{
    unfoldBtn.addEventListener('click', (ev) => {
        if(!unfoldElem) { return; }
        ev.preventDefault();
    
        var curState = unfoldElem.style.display;
        var newState = (curState == 'none') ? 'block' : 'none';
        unfoldElem.style.display = newState;
    
        if(newState == 'block') {
            unfoldElem.scrollIntoView({ block: "start", behavior: "smooth" });
        }
        return false;
    });
}

// Fold/Unfold for setting sections => at some point, functionality like this should receive its own .ts file!!!
const initSettingSections = () =>
{
    const nodes = Array.from(document.getElementsByClassName("game-settings-section")) as HTMLElement[];

    const fold = (node, content, instruction, forced = false) =>
    {
        if(!forced) { node.dataset.folded = "true"; }
        content.style.display = "none";
        instruction.innerHTML = "(Click to unfold.)";
    }

    const unfold = (node, content, instruction, forced = false) =>
    {
        if(!forced) { node.dataset.folded = "false"; }
        content.style.display = "grid";
        instruction.innerHTML = "(Click to fold.)";
    }

    for(const node of nodes)
    {
        const header = node.getElementsByClassName("section-header")[0] as HTMLElement;
        const instruction = header.getElementsByClassName("section-instruction")[0] as HTMLElement;
        const content = node.getElementsByClassName("section-content")[0] as HTMLElement;

        // simple fold/unfold system through clicks on the header
        header.addEventListener("click", (ev) => 
        {
            if(node.dataset.folded == "true") {
                unfold(node, content, instruction);
            } else {
                fold(node, content, instruction);
            }
        });

        // if we start folded, do a fake click to easily achieve that state
        const startFolded = node.dataset.folded == "true";
        if(startFolded) 
        {
            fold(node, content, instruction, true);
        }

    }
}
initSettingSections();
