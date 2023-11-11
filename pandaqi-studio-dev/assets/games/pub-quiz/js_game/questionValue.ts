enum QValType
{
    ALL,
    QUESTION,
    ANSWER
}

export { QVal, QValType }
export default class QVal
{
    value: string
    type: QValType

    constructor(val:string, type = QValType.ALL)
    {
        this.value = val
        this.type = type;
    }

    set(v:string) { this.value = v; }
    get() { return this.value; }
    isValid() : boolean { return this.value && this.value.length >= 1; }
}