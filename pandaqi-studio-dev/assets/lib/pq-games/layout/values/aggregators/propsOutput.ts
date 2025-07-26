import OutputGroup from "./outputGroup";

export default class PropsOutput extends OutputGroup
{
    fill: string
    alpha: number

    clone()
    {
        const b = new PropsOutput();
        return super.cloneInto(b);
    }
}