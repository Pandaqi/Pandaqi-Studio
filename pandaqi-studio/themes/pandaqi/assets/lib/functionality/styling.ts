/* Handle dark/light mode */

// we want to apply this class immediately to prevent a (long) flash of unstyled content if slow network
// as otherwise these styles only get applied after darkModeBtn exists and DOMContentLoaded
const localStorageKey = "pandaqi-games-display-mode";
let displayMode = "light";

export const loadStylingPrefetch = () =>
{
    displayMode = localStorage.getItem(localStorageKey) ?? "light";
    document.body.classList.add(`display-mode-${displayMode}`);
}

export const loadStyling = () =>
{
    const darkModeBtn = document.getElementById("darkModeBtn");
    if(!darkModeBtn) { return; }

    const applyDisplayMode = (newMode:string) =>
    {
        document.body.classList.remove(`display-mode-${displayMode}`);
        displayMode = newMode;
        localStorage.setItem(localStorageKey, newMode);
        document.body.classList.add(`display-mode-${newMode}`);
        darkModeBtn.innerHTML = (displayMode == "light") ? "Dark Mode?" : "Light Mode?";
    }

    darkModeBtn.addEventListener("click", (ev) => {
        const newMode = displayMode == "light" ? "dark" : "light";
        applyDisplayMode(newMode);
    });

    applyDisplayMode(displayMode);
}