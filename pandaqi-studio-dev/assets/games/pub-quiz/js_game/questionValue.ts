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
    keepAsIs: boolean

    constructor(val:string, type = QValType.ALL, asIs = false)
    {
        this.value = val
        this.type = type;
        this.keepAsIs = asIs;
    }

    set(v:string) { this.value = v; }
    get() { return this.value; }
    isValid() : boolean { return this.value && this.value.length >= 1; }
}