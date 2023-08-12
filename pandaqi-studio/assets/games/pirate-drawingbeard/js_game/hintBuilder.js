import Config from "./config"
import Map from "./map"
import { DISCRETE_LISTS } from "./dictionary"

export default {
	build(params)
	{
		// preparation
		var values = Array(params.hint.params.length);
		if ("values" in params.hint) { values = params.hint.values; } 

		var text = params.hint.text;

		var calculate = (params.target == "calculate");
		var check = (params.target == "check");

		// actually build the hint
		switch(params.hint.id)
		{
			/* TYPE */
			case 'type_self':
				values[0] = (params.cell.type == values[1]);
				break;

			case 'type_self_duo':
				values[0] = (params.cell.type == values[1] || params.cell.type == values[2]);
				break;

			case 'type_adjacent':
				values[0] = Map.adjacentToMatch({
					"cell": params.cell,
					"property": "type",
					"value": values[1]
				})
				break;

			case 'type_row':
				var list = Map.getTilesInRow(params.cell.y);
				values[0] = Map.tileListHasType(list, values[1]);
				break;

			case 'type_column':
				var list = Map.getTilesInColumn(params.cell.x);
				values[0] = Map.tileListHasType(list, values[1]);
				break;

			case 'type_distance':
				values[1] = Map.isWithinRadius({ 
					"cell": params.cell, 
					"radius": 2, 
					"property": "type",
					"value": values[0]
				});

				break;

			case 'type_surrounded':
				var bool = true;
				for(let i = 0; i < params.cell.nbs.length; i++)
				{
					if(params.cell.nbs[i].type != 'empty tile') { continue; }
					bool = false;
					break;
				}

				values[0] = bool;
				break;

			case 'type_between':
				var obj = {
					'cell': params.cell,
					'property': 'type',
					'options': [values[1], values[2]]
				}

				values[0] = this.isBetweenTiles(obj);
				break;

			case 'type_sum':
				var sum = Map.countMatchingNeighbors({
					"cell": params.cell,
					"property": "type",
					"value": values[2]
				});

				values[0] = (sum >= values[1]);
				break;

			/* ARROWS */
			case 'arrow_points':
				values[0] = (Map.getArrowsPointingAtUs(params.cell, true).length > 0);
				break;

			case 'arrow_duo':
				values[0] = (Map.getArrowsPointingAtUs(params.cell).length == 2);
				break;

			/* ROTATION */
			case 'rotation_self':
				values[0] = (params.cell.rotation == values[1]);
				break;

			case 'rotation_adjacent':
				values[0] = Map.adjacentToMatch({
					"cell": params.cell,
					"property": "rotation",
					"value": values[1]
				})
				break;

			case 'rotation_neighbor_point':
				var bool = true;
				for(let i = 0; i < params.cell.nbs.length; i++)
				{
					var nb = params.cell.nbs[i];
					var rotationTowardsUs = Map.getRotationTowardsCell(params.cell, nb);
					if(nb.rotation != rotationTowardsUs) { continue; }
					bool = true;
					break;
				}

				values[0] = bool;
				break;

			case 'rotation_neighbor_match':
				values[0] = Map.adjacentToMatch({
					"cell": params.cell,
					"property": "rotation",
					"value": params.cell.rotation
				})
				break;

			case 'rotation_neighbor_arrow_match':
				var bool = true;
				for(let i = 0; i < params.cell.nbs.length; i++)
				{
					var nb = params.cell.nbs[i];
					var rotationTowardsThem = Map.getRotationTowardsCell(nb, params.cell);
					if(rotationTowardsThem != params.cell.rotation) { continue; }

					var rotationTowardsUs = Map.getRotationTowardsCell(params.cell, nb);
					if(nb.rotation != rotationTowardsUs) { continue; }

					bool = true;
					break;
				}

				values[0] = bool;
				break;

			case 'rotation_neighbor_similarity_count':
				var sameRot = Map.countMatchingNeighbors({
					"cell": params.cell,
					"property": "type",
					"value": params.cell.rotation
				});

				var diffRot = (params.cell.nbs.length - sameRot);
				values[0] = (sameRot > diffRot);
				break;

			/* GENERAL */
			case 'general_vertical':
				values[0] = (params.cell.y < 0.5*Config.height);
				break;

			case 'general_horizontal':
				values[0] = (params.cell.x < 0.5*Config.width);
				break;

			case 'general_quadrant':
				values[0] = (params.cell.quadrantString == values[1]);
				break;

			case 'general_row':
				values[0] = (params.cell.row == values[1]);
				break;

			case 'general_column':
				values[0] = (params.cell.column == values[1]);
				break;

			/* SPECIAL */
			case 'special_compass':
				var rot = Map.compassTile.rotation;
				var requestedBearing = DISCRETE_LISTS.bearings.indexOf(values[1]);
				var index = (rot + requestedBearing + 4) % 4;

				values[0] = Map.compassBlocks[index].includes(params.cell);
				break;

			case 'special_map':
				values[0] = Map.markedMapTiles.includes(params.cell);
				break;

			/* SYMBOLS */
			case 'symbol_self':
				values[0] = (params.cell.symbols.includes(values[1]));
				break;

			case 'symbol_duo':
				values[0] = (params.cell.symbols.includes(values[1]) || params.cell.symbols.includes(values[2]));
				break;

			case 'symbol_neighbor':
				values[0] = Map.adjacentToMatch({
					"cell": params.cell,
					"property": "symbols",
					"value": values[1]
				})
				break;

			case 'symbol_match_any':
				values[0] = Map.adjacentToMatchList({
					"cell": params.cell,
					"property": "symbols",
					"exclude": [null]
				});
				break;

			// @TODO: can we clean up this function into a few more generalized ones on the Map object?
			case 'symbol_match_edge':
				var bool = false;

				for(let n = 0; n < params.cell.nbs.length; n++)
				{
					var nb = params.cell.nbs[n];
					var rotTowardsUs = Map.getRotationTowardsCell(params.cell, nb);
					if(rotTowardsUs == 0) { continue; }

					var finalRot = (rotTowardsUs + nb.rotation) % 4;
					finalRot = (finalRot - 1 + 4) % 4; // again, offset in rotation because first symbol always skipped => @TODO: maybe change this? generalize?
					var theirSymbol = nb.symbols[finalRot - 1]; 
					if(theirSymbol == null) { continue; }

					// the rot towards them is obviously just the same rotation but flipped 180 degrees
					var ourFinalRot = (rotTowardsUs + 2 + params.cell.rotation) % 4;
					ourFinalRot = (ourFinalRot - 1 + 4) % 4;
					var ourSymbol = params.cell.nbs[ourFinalRot];

					if(theirSymbol != ourSymbol) { continue; }

					bool = true;
					break;
				}

				values[0] = bool;
				break;

			case 'symbol_count':
				values[0] = Map.countNonEmptyEntries(params.cell.symbols) > 1;
				break;

			case 'symbol_match_count':
				var list = Map.getListPerType(params.cell.symbols);
				var bool = false;
				for(key in list)
				{
					if(list[key] >= 2) { bool = true; break; }
				}
				values[0] = bool;
				break;

			case 'symbol_diversity':
				var obj = {
					"cell": params.cell,
					"property": "symbols",
					"value": values[1]
				}

				var countA = Map.countMatchingNeighbors(obj);

				obj.value = values[2];
				var countB = Map.countMatchingNeighbors(obj);

				values[0] = (countA > countB);
				break;

			/* NETWORK */
			case 'network_connected':
				values[0] = Map.isNetworkTile(params.cell);
				break;

			case 'network_connected_type':
				values[0] = Map.matchNetworkConnection({
					"cell": params.cell,
					"property": "type",
					"value": values[1]
				})
				break;

			case 'network_connected_rotation':
				values[0] = Map.matchNetworkConnection({
					"cell": params.cell,
					"property": "rotation",
					"value": values[1]
				})
				break;

			case 'network_connected_symbol':
				values[0] = Map.matchNetworkConnection({
					"cell": params.cell,
					"property": "symbols",
					"value": values[1]
				})
				break;

			case 'network_connected_type_max':
				var maximum = this.getMaximumValuesFromDictionary(params.cell.networkTypeCount);
				values[0] = maximum.includes(values[1]);
				break;

			case 'network_connected_symbol_max':
				var maximum = this.getMaximumValuesFromDictionary(params.cell.networkSymbolCount);
				values[0] = maximum.includes(values[1]);
				break;

			case 'network_connected_count':
				var sum = 0;
				for(let i = 0; i < params.cell.allConnectedTiles.length; i++)
				{
					var type = params.cell.allConnectedTiles[i].type;
					if(type == 'empty tile') { continue; }
					sum += 1
				}

				values[0] = (sum >= values[1]);
				break;

			case 'network_connection_count':
				values[0] = (params.cell.connNbs.length >= values[1]);
				break;

		}

		// convert the necessary boolean values (true/false) to a not string
		for(let i = 0; i < values.length; i++)
		{
			if(params.hint.params[i].type != "notstring") { continue; }
			var bool = values[i];
			values[i] = this.createNotString(bool);
			params.hint.negated = !bool; // used by visualizer to determine if we need a big red cross or not
		}

		// finishing (fill in the text; which is only used for debugging)
		// Note: "shuffling" doesn't work, because there's an extra NOT in there, fix it or just leave shuffling to visuals?
		for(let i = 0; i < values.length; i++) {
			text = text.replace("<" + i + ">", values[i]);
		}

		params.hint.text = text;
	},

	createNotString(val)
	{
		if(val) { return ''; }
		return 'NOT ';
	},

	// @TODO: A bit expensive to calculate currently ... and might want to split between row/column
	isBetweenTiles(params)
	{
		var obj = { 
			"cell": params.cell,
			"dir": { "x": -1, "y": 0 },
			"values": params.options,
			"property": params.property,
			"value": ''
		}

		obj.value = obj.values[0]
		var leftA = Map.hasInDir(obj)
		obj.value = obj.values[1]
		var leftB = Map.hasInDir(obj);

		obj.dir = { "x": 1, "y": 0 }
		var rightB = Map.hasInDir(obj);
		obj.value = obj.values[0];
		var rightA = Map.hasInDir(obj)

		if(leftA && rightB || leftB && rightA) { return true; }

		obj.dir = { "x": 0, "y": -1 }
		obj.value = obj.values[0]
		var topA = Map.hasInDir(obj)
		obj.value = obj.values[1]
		var topB = Map.hasInDir(obj);

		obj.dir = { "x": 0, "y": 1 }
		var bottomB = Map.hasInDir(obj);
		obj.value = obj.values[0];
		var bottomA = Map.hasInDir(obj)

		if(topA && bottomB || topB && bottomA) { return true; }

		return false;
	},

	getMaximumValuesFromDictionary(dict)
	{
		var maxElems = [];
		var maxNum = -1;

		for(key in dict)
		{	
			let val = dict[key];
			if(val == 0) { continue; }
			if(val < maxNum) { continue; }
			if(val == maxNum) {
				maxElems.push(key);
				continue;
			}

			maxElems = [key];
			maxNum = val;
		}

		return maxElems;
	}
}