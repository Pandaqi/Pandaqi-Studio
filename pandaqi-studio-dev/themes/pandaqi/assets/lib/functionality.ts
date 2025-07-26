window.addEventListener("DOMContentLoaded", () => {

    /* Handle dark/light mode */
    const localStorageKey = "pandaqi-games-display-mode";
    let displayMode = localStorage.getItem(localStorageKey) ?? "light";
    const darkModeBtn = document.getElementById("darkModeBtn");

    const applyDisplayMode = (newMode:string) =>
    {
        document.body.classList.remove(`display-mode-${displayMode}`);
        displayMode = newMode;
        localStorage.setItem(localStorageKey, newMode);
        document.body.classList.add(`display-mode-${newMode}`);
        darkModeBtn.innerHTML = (displayMode == "light") ? "Dark Mode?" : "Light Mode?";
    }

    if(darkModeBtn)
    {
        darkModeBtn.addEventListener("click", (ev) => {
            const newMode = displayMode == "light" ? "dark" : "light";
            applyDisplayMode(newMode);
        });

        applyDisplayMode(displayMode);
    }

    /* Basic navigation (go to bottom, go to top, random) */
    const bottomBtn = document.getElementById('gotoBottomBtn') as HTMLButtonElement
    if(bottomBtn) 
    {
        bottomBtn.addEventListener('click', (ev) => {
            ev.preventDefault();
            ev.stopPropagation();

            const footer = document.getElementsByTagName('footer')[0]
            footer.scrollIntoView({ 'behavior': 'smooth' });
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
});