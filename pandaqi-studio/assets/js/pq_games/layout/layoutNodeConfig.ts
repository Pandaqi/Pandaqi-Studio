interface LayoutNodeConfigParams
{
    useFullSizeCanvas?:boolean
    debugDimensions?:boolean
}

export default class LayoutNodeConfig
{
    useFullSizeCanvas:boolean
    debugDimensions:boolean

    constructor(params:LayoutNodeConfigParams = {})
    {
        this.useFullSizeCanvas = params.useFullSizeCanvas ?? true;
        this.debugDimensions = params.debugDimensions ?? false;
    }
}