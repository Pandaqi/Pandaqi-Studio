export default class DominoPart {
    type: string;
    value: string;

    constructor(type: string, value: string)
    {
        this.type = type;
        this.value = value;
    }

    getType() { return this.type; }
    getValue() { return this.value; }
}