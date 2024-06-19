import elem from "./elem";

export default <T>(data:T[][]) =>
{
    const table = elem("table");
    for(const element of data)
    {
        const tr = elem("tr");
        for(const val of element)
        {
            const td = elem("td", undefined, val.toString());
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    return table;
}