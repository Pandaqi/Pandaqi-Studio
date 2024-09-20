import Settings from "js/pq_games/website/settings"
import LocalStorage from "./pq_games/website/localStorage";

/* Attach events/references to game settings interfaces */
Settings.init();

// Handle dark/light mode and simple mode
const data = new LocalStorage();
const darkModeBtn = document.getElementById("darkModeBtn");
const isDarkNow = data.get("darkMode") ?? false;
if(isDarkNow) { document.body.classList.add("darkMode"); }

if(darkModeBtn)
{
    darkModeBtn.innerHTML = isDarkNow ? "Light Mode?" : "Dark Mode?";
    darkModeBtn.addEventListener("click", (ev) => {
        data.write("darkMode", !isDarkNow);
        window.location.reload();
    });
}

const simpleModeBtn = document.getElementById("simpleModeBtn");
const isSimpleNow = data.get("simpleMode") ?? false;
if(isSimpleNow) 
{ 
    const clippedSections = Array.from(document.getElementsByClassName("clipped")) as HTMLElement[];
    for(const elem of clippedSections)
    {
        elem.classList.remove("clipped");
    }

    const maskedLinks = Array.from(document.getElementsByClassName("masked-link")) as HTMLElement[];
    for(const elem of maskedLinks)
    {
        elem.style.setProperty("--rotation", "0deg");
    }

    document.body.classList.add("simpleMode"); 
}

if(simpleModeBtn)
{
    simpleModeBtn.innerHTML = isSimpleNow ? "Detailed Mode?" : "Simple Mode?";
    simpleModeBtn.addEventListener("click", (ev) => {
        data.write("simpleMode", !isSimpleNow);
        window.location.reload();
    });
}

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

