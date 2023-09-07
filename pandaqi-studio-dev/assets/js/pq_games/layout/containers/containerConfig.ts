export default class ContainerConfig
{
    useFullSizeCanvas = true
    debugDimensions = false

    constructor(params:Record<string,any>)
    {
        this.useFullSizeCanvas = params.useFullSizeCanvas ?? true;
        this.debugDimensions = params.debugDimensions ?? false;
    }
}