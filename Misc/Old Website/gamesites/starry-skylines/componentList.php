<!DOCTYPE html>
<html>
	<head>
		<title>Starry Skylines &mdash; Big Component List</title>
		<link rel="icon" type="image/png" href="gamesites/starry-skylines/favicon.png" />

		<!-- Titillium Web; body font -->
		<link href="https://fonts.googleapis.com/css2?family=Titillium+Web:ital,wght@0,200;0,300;0,400;0,600;0,700;0,900;1,200;1,300;1,400;1,600;1,700&display=swap" rel="stylesheet"> 

		<!-- Montserrat Subrayada: header font -->
		<link href="https://fonts.googleapis.com/css2?family=Montserrat+Subrayada:wght@400;700&display=swap" rel="stylesheet"> 

		<style type="text/css">
			body {
				font-family: "Titillium Web", sans-serif;

				color: #FCFFFC;
				background-color: #040F0F;
			}

			h1 {
				font-family: "Montserrat Subrayaday", sans-serif;
			}

			#bigTable {
				width: 100%;
				max-width: 1280px;
				margin: auto;
				font-size: 16pt;
			}

			td {
				padding: 5px;
				box-sizing: border-box;
			}

			td:first-child {
				font-weight: bold;
			}

			td.planetIntroduceRow {
				text-align: center;
				font-family: "Montserrat Subrayada", sans-serif;
				font-size: 36pt;
				padding-top: 40px;
			}

			tr:nth-child(even) {
				background: transparent;
			}

			tr:nth-child(odd) {
				background: rgba(0, 30, 30, 0.8);
			}

			.buildingTypeSpan {
				display: none;
			}

			.buildingProbability {
				color: #666;
				font-weight: lighter;
			}

			/* all styles for the different effect categories */
			.typeEnvironment {
				color: #2BA84A;
			}

			.typeGovernment {
				color: gray;
			}

			.typeEntertainment {
				color: #FB3640;
			}

			.typeBuilding {
				color: brown;
			}

			.typeEffect {
				color: #EA638C;
			}

			.typeStreet {
				color: #FA7921;
			}

			/* on narrow screens, make the whole type column disappear and instead display type underneath name */
			@media all and (max-width: 600px) {
				.buildingTypeCell {
					display: none;
				}

				.buildingTypeSpan {
					display: block;
				}
			}

			@media all and (orientation: portrait) {
				.buildingTypeCell {
					display: none;
				}

				.buildingTypeSpan {
					display: block;
				}
			}
		</style>
	</head>

	<body>
		<main>
			<script src="componentLibrary.js?random=<?php echo uniqid(); ?>"></script>

			<table id="bigTable">
			</table>

			<script>
				function createRow(name, bld) {
					const row = document.createElement("tr");

					// first show name
					var cell = document.createElement("td");
					cell.innerHTML = name + '<span class="buildingTypeSpan type' + bld.type + '">(' + bld.type + ')</span>' + '<span class="buildingTypeSpan buildingProbability">(probability ' + bld.prob + ')</span>';
					row.appendChild(cell)

					// then show all properties (I defined in keys above)
					for(var i = 0; i < keys.length; i++) {
						const key = keys[i]

						cell = document.createElement("td");
						cell.innerHTML = bld[key] || "";
						row.appendChild(cell)

						if(key == 'type' || key == 'prob') {
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

				for(var i = 0; i < keys.length; i++) {
					cell = document.createElement("td");
					cell.innerHTML = keys[i];
					headerRow.appendChild(cell)

					if(keys[i] == 'type' || keys[i] == 'prob') {
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
				for(name in buildings) {
					const bld = buildings[name];

					// if we enter a new planet, create one cell in the next row and show the name clearly!
					var planet = bld.planet || "Learnth";
					if(planet != previousPlanet) {
						// big name!
						row = document.createElement("tr");
						cell = document.createElement("td");
						cell.setAttribute("colspan", keys.length + 1);
						cell.innerHTML = planet;

						cell.classList.add("planetIntroduceRow");

						row.appendChild(cell);
						tbl.appendChild(row);

						previousPlanet = planet;

						// introduce all effects for this planet here!
						for(effectName in effects) {
							var effectPlanet = effects[effectName].planet || "Learnth";

							if(effectPlanet == planet) {
								tbl.appendChild(createRow(effectName, effects[effectName]));
							}
						}
					}

					// finally, add row to the table
					tbl.appendChild(createRow(name, bld))
				}
			</script>
		</main>
	</body>
</html>

		