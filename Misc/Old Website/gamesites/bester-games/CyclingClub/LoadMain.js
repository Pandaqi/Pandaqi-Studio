var boundPoints = [];
var scaleF;
var minimapOffset;
var predefinedSpecialSpots = [];
var endOfStage;
var estimates = [0,0];

Scene.LoadMain = function(game) {
	this.game = game;
};

Scene.LoadMain.prototype = {

	preload: function() {
	},

	create:function() {
		//{x,y} start point, {x,y} maximum width/height
		var bounds = [0,0,10,10];
		
		var startDir = (1/2) * Math.PI;
		var curDir = startDir;
		var lastPiece = [game.width/2,50];
		var boxS = 500;
		var length = TOUR[CURSTAGE[0]].length*partLength;
		endOfStage = length;
		for(var i=0;i<length+partLength;i++) {
			//Go straight
			var prevDir = curDir;
			if(Math.random() < 0.5 || i >= length) {
				boundPoints[i] = [lastPiece[0],lastPiece[1],0,curDir];
				lastPiece = [lastPiece[0]+Math.cos(curDir)*boxS,lastPiece[1]+Math.sin(curDir)*boxS];
				estimates[0]++;
			//Curve
			} else {
				boundPoints[i] = [lastPiece[0],lastPiece[1],1,curDir];
				//newPiece.rotation = curDir;
				if(Math.random() < 0.5 && Math.abs(curDir) <= Math.PI) {
					//Rotate right
					lastPiece = [lastPiece[0]+Math.cos(curDir)*boxS*0.5,lastPiece[1]+Math.sin(curDir)*boxS*0.5];
					curDir += 0.125 * Math.PI;
					estimates[1]++;
				} else if(Math.abs(curDir-Math.PI) <= Math.PI) {
					lastPiece = [lastPiece[0]+Math.cos(curDir)*boxS*0.5,lastPiece[1]+Math.sin(curDir)*boxS*0.5];
					//Rotate left	
					curDir -= 0.125 * Math.PI;
					estimates[1]++;
				} else {
					boundPoints[i] = [lastPiece[0],lastPiece[1],0,curDir];
					lastPiece = [lastPiece[0]+Math.cos(curDir)*boxS,lastPiece[1]+Math.sin(curDir)*boxS];
					estimates[0]++;
				}
			}
			if(i%partLength == 0) {
				if(i == length) {
					predefinedSpecialSpots.push([lastPiece[0],lastPiece[1],(curDir+Math.PI*0.5),'finish',i]);
				} else if(i < length-partLength){
					var what = TOUR[CURSTAGE[0]][i/partLength][3];
					if(what == 'sprint') {
						predefinedSpecialSpots.push([lastPiece[0],lastPiece[1],(curDir+Math.PI*0.5),'sprint',i]);
					} else if(what == 'hill') {
						predefinedSpecialSpots.push([lastPiece[0],lastPiece[1],(curDir+Math.PI*0.5),'hill',i]);					
					}
				}
			}

			if(boundPoints[i][0] > bounds[2]) {
				bounds[2] = boundPoints[i][0];
			} else if(boundPoints[i][0] < bounds[0]) {
				bounds[0] = boundPoints[i][0];
			}

			if(boundPoints[i][1] > bounds[3]) {
				bounds[3] = boundPoints[i][1];
			} else if(boundPoints[i][1] < bounds[1]) {
				bounds[1] = boundPoints[i][1];
			}
		}
		game.world.setBounds(-game.width,-game.height,game.width*3,game.height*2);
		scaleF = Math.min(200/(bounds[2]-bounds[0]),400/(bounds[3]-bounds[1]));
		minimapOffset = (-bounds[0])*scaleF;
		var d = "M" + Math.round(boundPoints[0][0]-bounds[0])*scaleF + " " + Math.round(boundPoints[0][1]-bounds[1])*scaleF;
		for(var i=1;i<boundPoints.length-partLength;i++) {
			this.addSpecialEventLine(i,bounds);
			//Skipping straight parts reduces CPU load and complexity
			if(!(i < (boundPoints.length-1) && boundPoints[i+1][2] == 0 && boundPoints[i][2] == 0)) {
				d += "L" + Math.round(boundPoints[i][0]-bounds[0])*scaleF + " " + Math.round(boundPoints[i][1]-bounds[1])*scaleF;
			}
		}
		document.getElementById("wholePath").setAttribute('d',d);
		document.getElementById("theSVG").style.width = game.width;
		document.getElementById("theSVG").style.height = game.height;
	},	

	addSpecialEventLine: function(i,bounds) {
		if(i%partLength == 0) {
			var type = TOUR[CURSTAGE[0]][i/partLength][3];
			if(type == 'hill' || type == 'sprint') {
				var aPath = document.createElementNS('http://www.w3.org/2000/svg', 'line');
				aPath.setAttribute('x1',0);
				aPath.setAttribute('x2',200);
				aPath.setAttribute('y1',Math.round(boundPoints[i][1]-bounds[1])*scaleF);
				aPath.setAttribute('y2',Math.round(boundPoints[i][1]-bounds[1])*scaleF);
				aPath.setAttribute('stroke-width',"1px");
				if(type == 'hill') {
					aPath.setAttribute('stroke',"red");				
				} else if(type == 'sprint') {
					aPath.setAttribute('stroke',"green");
				}
				$("#miniMap").append(aPath);
			}
		}
	},

	update: function() {
		if(SPECIALTIES[CURSTAGE[0]] == 'Time Trial') {
			$("#menuOverlay").html("");
			$("#menuOverlay").css('background-color','#333');
			$("#topInfoOverlay").css('display','block');
			document.getElementById("miniMapContainer").style.display = 'block';
			$("#extraInfoOverlay").css('display','block');
			game.state.start('MainGameTrial');
		} else {
			document.getElementById("miniMapContainer").style.display = 'block';

			$("#menuOverlay").html("");
			$("#menuOverlay").css('min-width','0px');
			$("#menuOverlay").css('width','500px');
			$("#extraInfoOverlay").css('display','block');
			$("#topInfoOverlay").css('display','block');
			game.state.start('MainGame');			
		}
	}

};