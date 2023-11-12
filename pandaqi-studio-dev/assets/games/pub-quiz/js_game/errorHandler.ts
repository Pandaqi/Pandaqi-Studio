import { QuizParams } from "./quiz";

enum ErrorType
{
    FAIL = "fail",
    WARNING = "warning",
    FEEDBACK = "feedback",
    SUCCESS = "success"
}

// @TODO: this disallows multiple quiz instances on the same page, but would anyone ever want that?
// (they'd all send signals through the same function / node = body)
const showMessage = (text:any, type = ErrorType.FAIL) =>
{
    const ev = new CustomEvent("error-message", { detail: { text: text, type: type } });
    document.body.dispatchEvent(ev);
}

export { ErrorHandler, ErrorType, showMessage }
export default class ErrorHandler
{
    node: HTMLElement;

    constructor(params:QuizParams = {})
    {
        if(!params.showErrors) { return; }
        this.listenForSignals();
        this.createContainer();
    }

    listenForSignals()
    {
        document.body.addEventListener("error-message", (ev:CustomEvent) => {
            this.show(ev.detail.text, ev.detail.type);
        });
    }

    createContainer()
    {
        const cont = document.createElement("div");
        cont.classList.add("error-handler");
        this.node = cont;
    }

    show(val:any, type = ErrorType.FAIL)
    {
        console.error(...val);

        if(!this.node) { return; }

        const div = document.createElement("div");
        div.classList.add("error-message", "error-type-" + type);

        let str = "<p>" + val.toString() + "</p>";
        if(Array.isArray(val))
        {
            str = "";
            for(const elem of val)
            {
                str += "<p>" + elem.toString() + "</p>"
            }
        }

        div.innerHTML = str;
        this.node.appendChild(div);
    }
}