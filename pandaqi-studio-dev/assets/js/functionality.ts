import Settings from "js/pq_games/website/settings"

/* Attach event to game settings interfaces */
// @TODO: should probably be moved to cleaner system? Somewhere else?
Settings.initGame();

/* Basic navigation (go to bottom, go to top, random) */
const bottomBtn = document.getElementById('gotoBottomBtn') as HTMLButtonElement

if(bottomBtn) {
    bottomBtn.addEventListener('click', function(ev) {
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

if(topBtn) {
    topBtn.addEventListener('click', function(ev) {
        ev.preventDefault();
        ev.stopPropagation();

    	window.scrollTo({top: 0, behavior: 'smooth'});
        return false;
    })
}

const randBtn = document.getElementById('randProjBtn') as HTMLButtonElement

if(randBtn) {
    randBtn.addEventListener('click', function(ev) {
        ev.preventDefault();
        ev.stopPropagation();

        // @ts-ignore
        var randURL = window.RAND_PROJECT_LIST[Math.floor(Math.random() * window.RAND_PROJECT_LIST.length)];
        window.location.href = randURL;
        return false;
    })
}

/* Fold / Unfold functionality for rules explanations oN MAIN page ( = NOT rulebook) */
const unfoldBtn = document.getElementById('unfold-explanation-btn');
const unfoldElem = document.getElementById('unfold-explanation');
if(unfoldBtn && unfoldElem)
{
    unfoldBtn.addEventListener('click', function(ev) {
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

