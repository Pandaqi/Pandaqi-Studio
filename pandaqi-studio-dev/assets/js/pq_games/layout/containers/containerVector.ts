import Container from "./container"

export default class ContainerVector extends Container
{
    // @TODO: some extra params or niceties for SVG stuff, such as viewBox, or automatically becoming as large as the root container
    // @TODO: safeguarding against children that are NOT svg elements, and thus not allowed?
    constructor(params:any = {})
    {
        params.element = "svg";
        super(params);
    }
}