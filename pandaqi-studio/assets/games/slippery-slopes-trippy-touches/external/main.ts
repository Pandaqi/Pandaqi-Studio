import Widget from "./widget";

const widgetNodes = Array.from(document.getElementsByClassName("slippery-slopes-interactive-widget")) as HTMLElement[];
const widgets = [];
for(const widgetNode of widgetNodes)
{
    const widget = new Widget(widgetNode);
    widgets.push(widget);
}