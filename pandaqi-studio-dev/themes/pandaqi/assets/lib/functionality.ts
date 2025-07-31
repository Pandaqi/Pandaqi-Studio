// we want to apply this class immediately to prevent a (long) flash of unstyled content if slow network
// as otherwise these styles only get applied after darkModeBtn exists and DOMContentLoaded
const localStorageKey = "pandaqi-games-display-mode";
let displayMode = localStorage.getItem(localStorageKey) ?? "light";
document.body.classList.add(`display-mode-${displayMode}`);

window.addEventListener("DOMContentLoaded", () => 
{
    /* Handle dark/light mode */
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

    /* Media Galleries */
    const galleries = Array.from(document.getElementsByClassName("media-gallery")) as HTMLElement[];
    const youtubeEmbedsToLoad = [];
    const youtubePlayers = [];
    for(const gallery of galleries)
    {
        // initialize all elements inside
        let currentItem = 0;
        let counter = 0;
        const children = Array.from(gallery.children) as HTMLElement[];
        const interactiveMedia:(HTMLVideoElement|HTMLAudioElement)[] = [];
        for(const child of children)
        {
            child.dataset.itemId = counter.toString();
            if(child instanceof HTMLVideoElement || child instanceof HTMLAudioElement) { interactiveMedia.push(child); }
            counter++;
        }

        // transform youtube embeds into the actual thing
        const youtubeEmbedIDs = [];
        const videos = Array.from(gallery.getElementsByClassName("youtube-video")) as HTMLElement[];
        for(const video of videos)
        {
            youtubeEmbedIDs.push(youtubeEmbedsToLoad.length);
            youtubeEmbedsToLoad.push({
                id: video.id,
                width: 610,
                height: 360,
                videoId: video.dataset.src,
                playerVars: { playsinline: 1 },
                events: { onStateChange: () => { registerInteraction(); } }
            });
        }

        // interaction causes automatic switching to stop
        gallery.dataset.interacted = "false";
        let autoScroller:number = -1;
        const registerInteraction = () =>
        {
            if(autoScroller < 0) { return; }
            gallery.dataset.interacted = "true";
            clearInterval(autoScroller);
            autoScroller = -1;
        }

        // basic function for changing
        const changeGalleryItem = (idx:number, input = false) =>
        {
            if(input) { registerInteraction(); }

            // stop all running videos/interactive elements
            for(const youtubeEmbedID of youtubeEmbedIDs)
            {
                const playerConnected = youtubePlayers[youtubeEmbedID];
                if(playerConnected) { playerConnected.stopVideo(); }
            }

            for(const media of interactiveMedia)
            {
                media.pause();
            }

            // move the needle
            idx = (idx + children.length) % children.length;
            currentItem = idx;
            gallery.dataset.currentItem = idx.toString();

            // update what should show and what should not
            for(const child of children)
            {
                if(parseInt(child.dataset.itemId) != idx) { child.style.display = "none"; continue; }
                child.style.display = "block";
            }
        }

        // navigation
        const ui = document.createElement("div");
        ui.classList.add("flex", "margin-top-xs", "flex-space-between", "bg-color-light", "border-radius-m", "padding-s");
        gallery.parentElement.appendChild(ui);

        const buttonPrevious = document.createElement("button");
        ui.appendChild(buttonPrevious);
        buttonPrevious.classList.add("button")
        buttonPrevious.innerHTML = "<< Previous";
        buttonPrevious.addEventListener("click", () => { changeGalleryItem(currentItem - 1, true); });

        const buttonNext = document.createElement("button");
        ui.appendChild(buttonNext);
        buttonNext.classList.add("button");
        buttonNext.innerHTML = "Next >>";
        buttonNext.addEventListener("click", () => { changeGalleryItem(currentItem + 1, true); });

        // init (including automatic changing)
        changeGalleryItem(0);
        autoScroller = setInterval(() => { changeGalleryItem(currentItem + 1) }, 4000);
    }

    // @SOURCE: https://developers.google.com/youtube/iframe_api_reference
    // @ts-ignore
    window.onYouTubeIframeAPIReady = () => 
    {
        for(const data of youtubeEmbedsToLoad)
        {
            // @ts-ignore
            youtubePlayers.push(new YT.Player(data.id, data));
        }
    }

    const shouldLoadYoutubeAPI = youtubeEmbedsToLoad.length > 0;
    if(shouldLoadYoutubeAPI)
    {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
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