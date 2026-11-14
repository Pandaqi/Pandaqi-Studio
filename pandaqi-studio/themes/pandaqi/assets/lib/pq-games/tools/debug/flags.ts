// `_debug` is a flat bag of booleans, read in a dozen places with a dozen different spellings
// (`config._debug.text`, `(config._debug ?? {}).text`, `config._debug?.text`). One accessor keeps the
// defaults in one place and lets tooling (the audit harness) ask the same question the library asks.
export const debugEnabled = (config:{ _debug?: Record<string, any> }, key:string) : boolean =>
{
    return config?._debug?.[key] === true;
}
