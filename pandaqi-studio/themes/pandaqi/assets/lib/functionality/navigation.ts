/* Basic navigation (go to bottom, go to top, random) */
export const loadNavigation = () =>
{
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
}