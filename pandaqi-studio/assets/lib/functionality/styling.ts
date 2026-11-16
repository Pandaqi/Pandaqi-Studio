/* Handle dark/light mode */

// we want to apply this class immediately to prevent a (long) flash of unstyled content if slow network
// as otherwise these styles only get applied after darkModeBtn exists and DOMContentLoaded
const localStorageKey = "pandaqi-games-display-mode";
let displayMode = "light";

// Follow the operating system until the visitor has explicitly picked a mode (which we store)
const getSystemDisplayMode = () =>
{
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
}

export const loadStylingPrefetch = () =>
{
    displayMode = localStorage.getItem(localStorageKey) ?? getSystemDisplayMode();
    document.body.classList.add(`display-mode-${displayMode}`);
}

export const loadStyling = () =>
{
    const darkModeBtn = document.getElementById("darkModeBtn");
    if(!darkModeBtn) { return; }

    const applyDisplayMode = (newMode:string, persist:boolean) =>
    {
        document.body.classList.remove(`display-mode-${displayMode}`);
        displayMode = newMode;
        if(persist) { localStorage.setItem(localStorageKey, newMode); }
        document.body.classList.add(`display-mode-${newMode}`);
        darkModeBtn.innerHTML = (displayMode == "light") ? "Dark Mode?" : "Light Mode?";
    }

    darkModeBtn.addEventListener("click", (ev) => {
        const newMode = displayMode == "light" ? "dark" : "light";
        applyDisplayMode(newMode, true);
    });

    applyDisplayMode(displayMode, false);
}
