export default class DominoPart {
    constructor(type, value)
    {
        this.type = type;
        this.value = value;
    }

    getType() { return this.type; }
    getValue() { return this.value; }
}