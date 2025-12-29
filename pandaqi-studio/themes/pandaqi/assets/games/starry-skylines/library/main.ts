import { BUILDINGS, EFFECTS } from "../shared/dict"

const createRow = (name:string, bld) =>
{
    const row = document.createElement("tr");

    // first show name
    var cell = document.createElement("td");
    cell.innerHTML = `${name} <span class="buildingTypeSpan type${bld.type}">(${bld.type})</span><span class="buildingTypeSpan buildingProbability">(probability ${bld.prob})</span>`;
    row.appendChild(cell)

    // then show all properties (I defined in keys above)
    for(var i = 0; i < keys.length; i++) {
        const key = keys[i]

        cell = document.createElement("td");
        cell.innerHTML = bld[key] || "";
        row.appendChild(cell)

        if(key == 'type' || key == 'prob') 
        {
            cell.classList.add('buildingTypeCell');

            if(key == 'type') {
                cell.classList.add('type' + bld.type);
            }
        }
    }

    return row;
}

const tbl = document.getElementById('bigTable');
const keys = ['type', 'desc', 'prob']

//
// populate table header
//
const header = document.createElement("thead");
const headerRow = document.createElement("tr");

var cell = document.createElement("td");
cell.innerHTML = 'name';
headerRow.appendChild(cell);

for(var i = 0; i < keys.length; i++) 
{
    cell = document.createElement("td");
    cell.innerHTML = keys[i];
    headerRow.appendChild(cell)

    if(keys[i] == 'type' || keys[i] == 'prob') 
    {
        cell.classList.add('buildingTypeCell');
    }
}

header.appendChild(headerRow);
tbl.appendChild(header);

//
// populate actual content
//
var previousPlanet = "";
var row;
const effectList = EFFECTS
const buildingList = BUILDINGS;
for(const name of Object.keys(buildingList)) 
{
    const bld = buildingList[name];

    // if we enter a new planet, create one cell in the next row and show the name clearly!
    var planet = bld.planet ?? "Learnth";
    if(planet != previousPlanet) 
    {
        // big name!
        row = document.createElement("tr");
        cell = document.createElement("td");
        cell.setAttribute("colspan", (keys.length + 1).toString());
        cell.innerHTML = planet;

        cell.classList.add("planetIntroduceRow");

        row.appendChild(cell);
        tbl.appendChild(row);

        previousPlanet = planet;

        // introduce all effects for this planet here!
        for(const effectName of Object.keys(effectList)) 
        {
            var effectPlanet = effectList[effectName].planet ?? "Learnth";

            if(effectPlanet == planet) {
                tbl.appendChild(createRow(effectName, effectList[effectName]));
            }
        }
    }

    // finally, add row to the table
    tbl.appendChild(createRow(name, bld))
}