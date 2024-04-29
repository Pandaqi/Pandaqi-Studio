import { PackData } from "./dictShared";

export default (node:HTMLElement, data:PackData) =>
{
    let h3, p

    // clarifications
    if(data.clarification != null)
    {
        const clar = document.createElement("div");
        node.appendChild(clar);
        clar.classList.add("prince-clarifications")
    
        h3 = document.createElement("h3");
        clar.appendChild(h3);
        h3.innerHTML = "Clarification(s)"
        p = document.createElement("p");
        clar.appendChild(p);
        p.innerHTML = data.clarification
    }

    // backstory
    const backstory = document.createElement("div");
    node.appendChild(backstory);
    backstory.classList.add("prince-backstory")

    h3 = document.createElement("h3");
    backstory.appendChild(h3);
    h3.innerHTML = "Backstory"
    p = document.createElement("p");
    backstory.appendChild(p);
    p.innerHTML = data.backstory

    // data
    const metadata = document.createElement("div");
    node.appendChild(metadata);
    metadata.classList.add("prince-metadata");

    h3 = document.createElement("h3");
    metadata.appendChild(h3);
    h3.innerHTML = "Information"

    const ul = document.createElement("ul");
    metadata.appendChild(ul);

    let li = document.createElement("li");
    ul.appendChild(li);
    li.innerHTML = "<strong>Slogan</strong>: &ldquo;" + data.slogan.text + "&rdquo;"
    
    li = document.createElement("li");
    ul.appendChild(li);
    li.innerHTML = "<strong>Animal</strong>: " + data.animal

    li = document.createElement("li");
    ul.appendChild(li);
    li.innerHTML = "<strong>Color</strong>: " + data.colorClass

    li = document.createElement("li");
    ul.appendChild(li);
    li.innerHTML = "<strong>Actions</strong>: "

    const darkActions = data.dark ?? [];
    if(darkActions.length <= 0) {
        li.innerHTML = "<strong>Action</strong>: &ldquo;" + data.action.text + "&rdquo;";
    } else {
        const ul2 = document.createElement("ul");
        li.appendChild(ul2);
    
        let li2 = document.createElement("li");
        ul2.appendChild(li2);
        li2.innerHTML = "<strong>Regular</strong>: &ldquo;" + data.action.text + "&rdquo;";
    
        for(let i = 0; i < darkActions.length; i++)
        {
            li2 = document.createElement("li");
            ul2.appendChild(li2);
            li2.innerHTML = "<strong>Dark " + (i+1) + "</strong>: &ldquo;" + data.dark[i] + "&rdquo;";
        }
    }
}