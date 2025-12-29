import { displayImageFullscreen } from "./fullscreen";
import { addSwipeListener, SwipeDirection } from "./gestures";

const youtubeEmbedsToLoad = [];
const youtubePlayers = [];

const AUTO_SCROLL_INTERVAL = 4000; // ms

export const getYoutubePlayer = (id:string) =>
{
    return youtubePlayers[id] ?? null;
}

export const isInteractiveMedia = (node:HTMLElement) =>
{
    return (node instanceof HTMLVideoElement) || (node instanceof HTMLAudioElement)
}

export const loadMediaGallery = (gallery:HTMLElement) =>
{
    // initialize all elements inside
    let currentItemIndex = 0;
    let counter = 0;
    const children = Array.from(gallery.children) as HTMLElement[];
    const interactiveMedia:(HTMLVideoElement|HTMLAudioElement)[] = [];
    for(const child of children)
    {
        child.dataset.itemId = counter.toString();
        if(isInteractiveMedia(child)) { interactiveMedia.push(child); }
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
        youtubeEmbedIDs.forEach((id) => getYoutubePlayer(id) ? getYoutubePlayer(id).stopVideo() : false);
        interactiveMedia.forEach((x) => x.pause());

        // hide all current children
        children.forEach((x) => x.style.display = "none");

        // move the needle
        idx = (idx + children.length) % children.length;
        currentItemIndex = idx;
        gallery.dataset.currentItemIndex = idx.toString();

        // show the proper new item
        const newItem = children.find((x) => parseInt(x.dataset.itemId) == idx);
        newItem.style.display = "block";
        if(isInteractiveMedia(newItem)) { newItem.play(); }
    }

    // navigation (prev/next element)
    const enoughItemsForNavigation = children.length > 1;
    const ui = document.createElement("div");
    ui.classList.add("flex", "margin-top-xs", "flex-space-between", "font-size-s");
    if(enoughItemsForNavigation) { gallery.parentElement.appendChild(ui); }

    const buttonPrevious = document.createElement("button");
    ui.appendChild(buttonPrevious);
    buttonPrevious.classList.add("button")
    buttonPrevious.innerHTML = "<< Previous";
    buttonPrevious.addEventListener("click", () => { changeGalleryItem(currentItemIndex - 1, true); });

    const buttonNext = document.createElement("button");
    ui.appendChild(buttonNext);
    buttonNext.classList.add("button");
    buttonNext.innerHTML = "Next >>";
    buttonNext.addEventListener("click", () => { changeGalleryItem(currentItemIndex + 1, true); });

    // also allow navigation through swipes
    for(const child of children)
    {
        const callbackClick = () => { (child instanceof HTMLImageElement) ? displayImageFullscreen(child) : console.log("Media item clicked; nothing happens."); }
        const callbackSwipe = (dir:SwipeDirection) => changeGalleryItem(currentItemIndex + (dir == SwipeDirection.LEFT ? +1 : -1), true);
        addSwipeListener(child, callbackSwipe, callbackClick);
    }

    // init (including automatic changing)
    changeGalleryItem(0);
    autoScroller = setInterval(() => { changeGalleryItem(currentItemIndex + 1) }, AUTO_SCROLL_INTERVAL);
}

export const loadMediaGalleries = () =>
{
    const galleries = Array.from(document.getElementsByClassName("media-gallery")) as HTMLElement[];
    for(const gallery of galleries)
    {
        loadMediaGallery(gallery);
    }
}

export const loadYoutubeIFrames = () =>
{
    const shouldLoadYoutubeAPI = youtubeEmbedsToLoad.length > 0;
    if(!shouldLoadYoutubeAPI) { return; }

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

    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}