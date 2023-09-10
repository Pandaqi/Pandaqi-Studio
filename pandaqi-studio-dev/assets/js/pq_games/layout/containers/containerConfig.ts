export default class ContainerConfig
{
    useFullSizeCanvas = true
    debugDimensions = false
    renderEngine = "html2canvas" // html2canvas or pandaqi

    constructor(params:Record<string,any>)
    {
        this.useFullSizeCanvas = params.useFullSizeCanvas ?? true;
        this.debugDimensions = params.debugDimensions ?? false;
        this.renderEngine = params.renderEngine ?? "html2canvas";
    }
}