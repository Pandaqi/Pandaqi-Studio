import Button from "./button";

export default class Buttons {
    constructor(int)
    {
        this.interface = int;
        this.node = this.setupHTML();
        this.setupButtons();
    }

    setupHTML()
    {
        const cont = document.createElement("div");
        cont.classList.add("button-container");
        this.interface.getContainer().appendChild(cont);
        return cont;
    }

    setupButtons()
    {
        const vehicleTypes = [
            "jeep", "canoe", "trolly", "plane", 
            'tourbus', 'kayak', 'draisine', 'crane'
        ];
        const maxButtons = this.interface.getConfig().planesAndTrainsDisabled ? 2 : 4;

        this.buttons = [];
        for(let i = 0; i < maxButtons; i++)
        {
            const buttonParams = { 
                node: this.node, 
                type: vehicleTypes[i], 
                upgradesTo: vehicleTypes[i + 4] 
            }
            const b = new Button(this.interface, buttonParams);
            this.buttons.push(b);
        }
    }
}