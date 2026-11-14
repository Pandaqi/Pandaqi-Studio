// A game config declares `_material`, whose pickers live in the game code — but that game code
// imports the config, so the config cannot import the pickers back: one side of a cycle ends up
// undefined and the bundle dies before it mounts anything.
//
// The pickers therefore register themselves here at construction, and the material config reads the
// registry when generation actually starts.
export const PICKER_REGISTRY: Record<string, () => any> = {};

export const registerPicker = <T>(key:string, picker:T) : T =>
{
    PICKER_REGISTRY[key] = () => (picker as any).generate();
    return picker;
}
