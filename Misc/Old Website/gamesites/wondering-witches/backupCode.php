backupCode: function() {
						// 2) Fit sections into A4 => once we have a result, draw them
						// TO DO
						var numPlayers = 4;
						var numCauldrons = 4, numGardens = 4;
						

						// Step 1) Turn board into set of rectangles
						var board = [];
						for(var x = 0; x < xLines; x++) {
							board[x] = [];
							for(var y = 0; y < yLines; y++) {
								board[x][y] = new Phaser.Geom.Rectangle(x*this.rectWidth, y*this.rectHeight, this.rectWidth, this.rectHeight);
							}
						}

						// Step 2) Draw the cauldrons
						// IDEA/TO-DO: Perhaps create a "cauldron budget": keep creating them until we've precisely exhausted the budget
						var cauldrons = [];
						var cauldronBudget = 16;
						var emptySpaces = 32;
						while(cauldronBudget > 0) {
							// determine random size
							var sizeX, sizeY;

							// if the cauldron goes over our budget, bring it down
							var diff;
							do {
								sizeX = Math.floor(Math.random()*3)+1;
								sizeY = Math.floor(Math.random()*3)+1;

								// if we get a cauldron that is too small, bump it to minimum size
								if(sizeX*sizeY <= 1) {
									sizeX = 2;
									sizeY = 1;
								}

								diff = (cauldronBudget - sizeX*sizeY);
							} while(diff < 0);

							

							// first one is the money cauldron: the one that will need FOUR ingredients
							if(cauldrons.length == 0) {
								sizeX = 2;
								sizeY = 2;	
							}

							// subtract size from the budget
							// if budget is 1 now, shift it to zero (as no cauldron with size 1 can exist) 
							//  => make cauldron larger, but only by MINIMAL amount
							cauldronBudget -= (sizeX*sizeY);
							if(cauldronBudget == 1) {
								cauldronBudget = 0;
								if((sizeX+1)*sizeY < sizeX*(sizeY+1)) {
									sizeY++;
								} else {
									sizeX++;
								}
							}

							// keep checking random (x,y) coordinates
							// as long as we overlap an existing rectangle
							var x,y;
							var rectA, rectB;
							var overlapsRect = false;
							do {
								x = Math.floor(Math.random()*(xLines-sizeX+1));
								y = Math.floor(Math.random()*(yLines-sizeY+1));
								rectA = new Phaser.Geom.Rectangle(x*rectWidth, y*rectHeight, rectWidth*sizeX, rectHeight*sizeY);
								
								overlapsRect = false;
								for(var c = 0; c < cauldrons.length; c++) {
									var rectB = cauldrons[c];
									if(Phaser.Geom.Rectangle.Overlaps(rectA, rectB)) {
										overlapsRect = true;
										break;
									}
								}
							} while(overlapsRect);

							// remove rectangles from the board
							// also, bookkeeping of empty spaces (so we know when we're done filling the thing)
							for(var x0 = x; x0 < (x+sizeX); x0++) {
								for(var y0 = y; y0 < (y+sizeY); y0++) {
									board[x0][y0] = null;
									emptySpaces--;
								}
							}

							// found a suitable spot? Add the rectangle to the list of cauldrons!
							cauldrons.push(rectA);
						}

						// Step 3) Randomly fill the remaining space with gardens (use the MergeRect or Union from Phaser default stuff)
						// TO DO
						// Better algorithm: first, do a pass through the grid to find all remaining cells
						//                   then, simply take one of the cells, add all its neighbours to the list
						//                   keep iterating over the list
						//                   (for debugging, check)

						//
						// BIG PROBLEM: Rectangle.Union creates a new RECTANGLE, but I want a POLYGON that is the union of both rectangles
						// TO DO: Collect rectangles in gardens. Write algorithm that loops over rectangles, and checks if each side should have an edge. If it does, add it to line. Then draw that line.
						console.log(emptySpaces);
						while(emptySpaces > 0) {
							// find a random place (that still exists)
							do {
								x = Math.floor(Math.random()*xLines);
								y = Math.floor(Math.random()*yLines);
							} while(board[x][y] == null);

							console.log(emptySpaces);
							var rectA = board[x][y], rectB;

							// turn this thing into a garden, if it isn't already
							if(!rectA.isVisited) {
								emptySpaces--;
								rectA.isVisited = true;
							}

							// check the neighbours, but in a random order
							var dirs = [[1,0], [0,1], [-1,0], [0,-1]];
							dirs = shuffle(dirs);
							for(var d = 0; d < 4; d++) {
								var tempX = x + dirs[d][0], tempY = y + dirs[d][1];

								// if out of bounds, ignore
								if(tempX < 0 || tempX >= xLines || tempY < 0 || tempY >= yLines) {
									continue;
								}

								// if non-existent, ignore
								rectB = board[tempX][tempY]
								if(rectB == null) {
									continue;
								}

								// if it's not been visited yet, it means we can remove this empty space
								if(!rectB.isVisited) {
									emptySpaces--;
								}

								// now expand into this rectangle!
								// also, because this creates a new rectangle, set the isVisited flag again
								console.log(rectA, rectB);
								var newRect = Phaser.Geom.Rectangle.Union(rectA, rectB);
								console.log(newRect);
								newRect.isVisited = true;
								board[x][y] = newRect;
								
								// remove the original
								board[tempX][tempY] = null;
								break;
							}
						}

						// Step 5) Assign spaces to players
						// TO DO

						// 3) Draw ingredients in some cells
						// TO DO
				    },