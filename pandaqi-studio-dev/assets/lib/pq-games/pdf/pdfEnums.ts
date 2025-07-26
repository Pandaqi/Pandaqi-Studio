enum PageOrientation 
{
    PORTRAIT,
    LANDSCAPE
}

// It's crucial these strings are lowercase like this
// Because they are hardcoded in the dropdowns for game settings (setting-pageSize)
enum PageFormat
{
    A4 = "a4",
    A5 = "a5",
    LETTER = "Letter"
}

export { PageFormat, PageOrientation }