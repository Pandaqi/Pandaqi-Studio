import elem from "./elem";

export default (data:any[]) =>
{
    const table = elem("table");
    for(const elem of data)
    {
        const tr = elem("tr");
        for(const val of elem)
        {
            const td = elem("td", undefined, val);
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    return table;
}