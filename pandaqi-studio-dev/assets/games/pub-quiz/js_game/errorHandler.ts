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
const showMessage = (text:any, id:string, type = ErrorType.FAIL) =>
{
    const ev = new CustomEvent("error-message", { detail: { text: text, type: type, id: id } });
    document.body.dispatchEvent(ev);
}

export { ErrorHandler, ErrorType, showMessage }
export default class ErrorHandler
{
    node: HTMLElement;
    id: string;

    constructor(params:QuizParams = {})
    {
        this.id = params.id;
        this.listenForSignals();
        if(!params.showErrors) { return; }
        this.createContainer();
    }

    listenForSignals()
    {
        document.body.addEventListener("error-message", (ev:CustomEvent) => {
            if(ev.detail.id != this.id) { return; }
            this.show(ev.detail.text, ev.detail.type);
        });
    }

    createContainer()
    {
        const cont = document.createElement("div");
        cont.classList.add("error-handler");
        this.node = cont;
        document.body.appendChild(cont);
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

        let prefix = "<strong>Error (from id '" + this.id + "'): </strong>";

        div.innerHTML = prefix + str;
        this.node.appendChild(div);

        div.addEventListener("click", (ev) => {
            div.remove();
            ev.stopPropagation();
            ev.preventDefault();
            return false;
        });
    }
}