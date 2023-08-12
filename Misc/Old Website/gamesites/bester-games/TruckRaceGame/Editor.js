var curE = [[]];
var counter = 0;
//0 = normal, 1 = startPos, 2 = eraser
var drawType = 0;
//0 = freeform, 1 = line, 2 = circle
var drawStyle = 0;
var saveStart = [0,0];
var saveCows = [];
var startVisual = null;
var originalDimensions = [];


Scene.Editor = function(game) {
	this.game = game;
	this.justReleased = false;
	this.firstClick = false;
	this.anchorPoint = [0,0];
	this.currentCow = null;
};

Scene.Editor.prototype = {
	create:function() {
		document.getElementById('menuOverlay').style.display = 'block';
	    bmd = game.add.graphics(0,0);
	    bmd.lineJoin = bmd.lineCap = "round";
	    bmd.fixedToCamera = true;

	    startVisual = game.add.sprite(0,0,'wheel');
	    startVisual.width = startVisual.height = 10;
	    startVisual.anchor.setTo(0.5,0.5);

	    originalDimensions = [game.width,game.height];

		//game.world.setBounds(0,0,10000,10000);
	},

	update: function() {
		if(game.input.activePointer.isDown) {
			var newSpot = [game.input.x,game.input.y];
			switch(drawType) {
				//Cow Placer
				case 3:
					if(!this.firstClick) {
						this.currentCow = game.add.sprite(0,0,"cow");
						this.currentCow.anchor.setTo(0.5,0.5);
						this.currentCow.width = this.currentCow.height = 50;
						saveCows.push(0);
						saveCows.push(0);
						this.firstClick = true;
					} else {
						this.currentCow.position.setTo(newSpot[0],newSpot[1]);
						saveCows[saveCows.length-2] = newSpot[0];
						saveCows[saveCows.length-1] = newSpot[1];
					}
					this.justReleased = true;
				break;
				//Eraser
				case 2:
					for(var j=0;j<curE.length;j++) {
						var a = curE[j];
						for(var k=0;k<a.length;k+=2) {
							if(this.dist([a[k],a[k+1]],newSpot) < 50) {
								a.splice(k,2);
							}
						}
						if(curE[j].length < 1 && j < (curE.length-1)) {
							counter -= 1;
							curE.splice(j,1);
						}
					}
				break;
				//Start position setter
				case 1:
					saveStart = newSpot;
					startVisual.position.setTo(newSpot[0],newSpot[1]);
				break;
				//Regular Pencil
				case 0:
					switch(drawStyle) {
						case 0:
							if(this.dist(lastInput,newSpot) > 1) {
								curE[counter].push(newSpot[0]);
								curE[counter].push(newSpot[1]);
								lastInput = newSpot;
								this.justReleased = true;
							}
						break;

						case 1:
							if(!this.firstClick) {
								this.firstClick = true;
								curE[counter][0] = newSpot[0];
								curE[counter][1] = newSpot[1];
							} else {
								curE[counter][2] = newSpot[0];
								curE[counter][3] = newSpot[1];
							}
							this.justReleased = true;
						break;

						case 2:
							if(!this.firstClick) {
								this.firstClick = true;
								this.anchorPoint = [newSpot[0],newSpot[1]];
							} else {
								var radius = this.dist(newSpot,this.anchorPoint);
								for(var i=0;i<25;i++) {
									curE[counter][i*2] = this.anchorPoint[0]+Math.cos(i/12*Math.PI)*radius;
									curE[counter][i*2+1] = this.anchorPoint[1]+Math.sin(i/12*Math.PI)*radius;
								}
							}
							this.justReleased = true;
						break;
					}
				break;
			}				
		} else if(this.justReleased) {
			this.justReleased = false;
			this.firstClick = false;
			if(drawType == 0) {
				counter++;
				curE[counter] = [];
			}
		}
		this.drawLines();
	},

	dist: function(a,b) {
		return Math.sqrt(Math.pow(a[0]-b[0],2)+Math.pow(a[1]-b[1],2));
	},

	drawLines: function() {
		bmd.clear();
		bmd.lineStyle(4,0xff0000);
		for(var j=0;j<curE.length;j++) {
			bmd.moveTo(curE[j][0],curE[j][1]);
			for(var i=2;i<curE[j].length;i+=2) {
				/*var midPointX = (curE[j][i]+curE[j][i-2])*0.5-(curE[j][i+1]-curE[j][i-1]);
				var midPointY = (curE[j][i+1]+curE[j][i-1])*0.5+(curE[j][i]-curE[j][i-2]);
				bmd.quadraticCurveTo(midPointX,midPointY,curE[j][i], curE[j][i+1]);*/
				bmd.lineTo(curE[j][i],curE[j][i+1]);
			}
		}
	},

};
