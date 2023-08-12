var level1 = {"startPos":[260,604],"normal":[[250,615,262,615,277,615,312,615,332,615,352,615,369,617,394,619,412,624,439,632,449,634,469,639,487,644,497,647,524,657,539,662,557,667,569,672,584,679,594,684,604,689,619,699,629,704,649,714,674,727,692,737,709,749,732,762,769,779,782,784,832,799,844,802,867,807,884,812,909,814,919,817,929,819,967,824,989,827,1002,829,1019,829,1034,832,1049,832,1062,832,1082,827,1099,822,1129,815,1142,812,1177,800,1197,792,1217,782,1237,770,1257,760,1287,740,1312,722,1324,707,1332,700,1354,677,1369,660,1379,647,1389,637,1397,627],[1435,475,1437,465,1452,457,1479,450,1499,450,1539,450,1559,450,1589,459,1607,462,1617,467,1637,474,1652,479,1667,484,1699,499,1709,504,1724,517,1739,537,1747,544,1757,559,1774,582,1784,597,1794,609,1804,624,1817,649,1822,667,1827,682,1829,697,1829,709,1829,732,1825,744,1820,757,1815,767,1807,782,1800,792,1787,807,1772,827,1762,839,1747,857,1740,867,1727,874,1717,882,1700,889,1687,894,1670,902,1657,904,1642,907,1622,907,1607,907,1595,907,1575,907,1560,907,1540,902,1527,900,1510,897,1497,895,1487,892,1472,890,1462,887,1437,885,1427,882,1415,882,1402,882,1392,880,1377,875,1367,870,1355,862,1342,855,1332,847,1322,840,1312,835,1302,830,1292,822,1282,815,1275,807,1267,797,1257,787,1250,777],[]],"cows":[5,5,500,500,700,700,312,615]};

var lev;
var cows;

var groundVertices = [];
var groundBody;
var lastInput = [0,0];
var justReleased = false;
var needsUpdate = 0;

var truckBody;
var driveJoints = [];
var wheelBodies = [];
var bmd;
var visuals;
var wheels;
var curDir = 1;
var theTruck;

var levelBodies = [];
var upOrDown = 0;
var hittingSomething = 0;

Scene.Main = function(game) {
	this.game = game;
};

Scene.Main.prototype = {
	create:function() {
		/*bmd = game.add.bitmapData(game.width,game.height);
	    bmd.ctx.lineWidth = "4";
	    bmd.ctx.strokeStyle = "white";
	    visuals = game.add.sprite(0,0,bmd);
	    visuals.width = game.width;
	    visuals.height = game.height;
	    visuals.fixedToCamera = true;*/
		if(localStorage.getItem("saveGame") != undefined) {
			level1 = JSON.parse(localStorage.getItem("saveGame"));
		}
		lev = level1.normal;
		cows = level1.cows;

	    bmd = game.add.graphics(0,0);
	    bmd.fixedToCamera = true;
	    if(level1.dim == undefined) {
	    	level1.dim = [game.width,game.height];
	    }
	    var scaleVal = Math.min(5000/level1.dim[0], 5000/level1.dim[1]);

		game.world.setBounds(0,0,5000,5000);

		game.physics.startSystem(Phaser.Physics.BOX2D);
	    game.physics.box2d.setBoundsToWorld();
		game.physics.box2d.gravity.y = 500;
		game.physics.box2d.restitution = 0.15;

		groundBody = new Phaser.Physics.Box2D.Body(this.game, null, 0, 0, 0);

		level1.startPos[0] *= scaleVal;
		level1.startPos[1] *= scaleVal;

		var PTM = 50;
		var wheelPos = 0.95*PTM;
		
		game.physics.box2d.density = 1;
		game.physics.box2d.friction = 0.5;
		// Make the truck body
		truckBody = new Phaser.Physics.Box2D.Body(this.game, null, level1.startPos[0]+400, level1.startPos[1]-150);
		truckBody.setRectangle(80,PTM*0.4);
		truckBody.angularDamping = 100;

		var belowSensor = truckBody.addRectangle(80,30,0,30);
		belowSensor.SetSensor(true);
		var aboveSensor = truckBody.addRectangle(80,30,0,-30);
		aboveSensor.SetSensor(true);
	    truckBody.setFixtureContactCallback(aboveSensor, this.aboveCallback, this);
	    truckBody.setFixtureContactCallback(belowSensor, this.belowCallback, this);
		game.physics.box2d.friction = 5;

		// Make the wheel bodies
		wheelBodies[0] = new Phaser.Physics.Box2D.Body(this.game, null, level1.startPos[0]-wheelPos+400, level1.startPos[1]-150);
		wheelBodies[1] = new Phaser.Physics.Box2D.Body(this.game, null, level1.startPos[0]+wheelPos+400, level1.startPos[1]-150);
		wheelBodies[0].setCircle(0.8*PTM);
		wheelBodies[1].setCircle(0.8*PTM);
		/*wheelBodies[0].bodyDef.__proto__.allowSleep = false;
		wheelBodies[1].bodyDef.__proto__.allowSleep = false;*/

		wheels = [game.add.sprite(0,0,'wheel'), game.add.sprite(0,0,'wheel')];
		for(var i=0;i<2;i++) {
			wheels[i].anchor.setTo(0.5,0.5);
			wheels[i].width = wheels[i].height = 2*0.8*PTM;
		}
		theTruck = game.add.sprite(0,0,'truck');
		theTruck.scale.setTo(0.5,0.5);
		theTruck.anchor.setTo(0.5,0.5);
		
		var frequency = 3.5;
		var damping = 1;	
		var motorTorque = 30;
		
		// Make wheel joints
		// bodyA, bodyB, ax, ay, bx, by, axisX, axisY, frequency, damping, motorSpeed, motorTorque, motorEnabled	
		driveJoints[0] = game.physics.box2d.wheelJoint(truckBody, wheelBodies[0], -wheelPos,0, 0,0, 0,1, frequency, damping, 75, motorTorque, true ); // rear
		driveJoints[1] = game.physics.box2d.wheelJoint(truckBody, wheelBodies[1], wheelPos,0, 0,0, 0,1, frequency, damping, 75, motorTorque, true ); // front
		
		game.camera.follow(truckBody);

		wheelBodies[0].setBodyContactCallback(groundBody,this.hitIt,this);
		wheelBodies[1].setBodyContactCallback(groundBody,this.hitIt,this);

		for(var i=0;i<lev.length;i++) {
			for(var j=0;j<lev[i].length;j+=2) {
				lev[i][j] *= scaleVal;
				lev[i][j+1] *= scaleVal;
			}
			levelBodies[i] = new Phaser.Physics.Box2D.Body(this.game, null, 0,0, 0);
			levelBodies[i].setChain(lev[i]);
		}

		for(var i=0;i<cows.length;i+=2) {
			var newC = game.add.sprite(cows[i]*scaleVal,cows[i+1]*scaleVal,'cow');
			newC.anchor.setTo(0.5,0.5);
			newC.width = newC.height = 75;
		}
	},

	aboveCallback: function(body1, body2, fixture1, fixture2, begin) {
		upOrDown = 1;
		if(begin) {
			hittingSomething += 1;			
		} else {
			hittingSomething -= 1;
		}
	},

	belowCallback: function(body1, body2, fixture1, fixture2, begin) {
		upOrDown = 0;
		if(begin) {
			hittingSomething += 1;			
		} else {
			hittingSomething -= 1;
		}
	},

	hitIt: function(body1, body2, fixture1, fixture2, begin) {
		curDir = body2.myDir;
	},

	clamp: function(a,b,c) {
		if(a <= b) {
			return b;
		} else if(a >= c) {
			return c;
		} else {
			return a;
		}
	},

	update: function() {
		if(curDir == 1) {
			wheelBodies[(1+upOrDown)%2].data.m_force.x = Math.sin(truckBody.rotation+upOrDown*Math.PI)*40;
			wheelBodies[(1+upOrDown)%2].data.m_force.y = Math.cos(truckBody.rotation+upOrDown*Math.PI)*-40;
		} else if(curDir == -1) {
			wheelBodies[0+upOrDown].data.m_force.x = Math.sin(truckBody.rotation+upOrDown*Math.PI)*40;
			wheelBodies[0+upOrDown].data.m_force.y = Math.cos(truckBody.rotation+upOrDown*Math.PI)*-40;
		}
		for(var i=0;i<2;i++) {
			wheels[i].x = wheelBodies[i].x;
			wheels[i].y = wheelBodies[i].y;
			wheels[i].rotation = 0.5*wheelBodies[i].rotation;
			driveJoints[i].SetMotorSpeed(1000*curDir);								
		}
		if(hittingSomething > 0) {
			truckBody.gravityScale = 0;
			truckBody.data.m_force.x = Math.sin(truckBody.rotation+upOrDown*Math.PI)*100;
			truckBody.data.m_force.y = Math.cos(truckBody.rotation+upOrDown*Math.PI)*-100;
		} else {
			truckBody.gravityScale = 1;
		}
		theTruck.position.setTo(truckBody.x,truckBody.y);
		theTruck.rotation = truckBody.rotation;
		if(game.input.activePointer.isDown) {
			if(!justReleased) {
				groundVertices = [];
				justReleased = true;				
			}
			var newSpot = [game.input.x+game.camera.x,game.input.y+game.camera.y];
			if(this.dist(lastInput,newSpot) > 20) {
				groundVertices.push(newSpot[0]);
				groundVertices.push(newSpot[1]);
				if(groundVertices.length <= 8) {
					if(newSpot[0] > lastInput[0]) {
						groundBody.myDir = 1;
					} else {
						groundBody.myDir = -1;
					}
				}
				groundBody.setChain(groundVertices);
				lastInput = newSpot;
			}
		} else if(justReleased) {
			console.log("Circle? " + checkCircle());
			justReleased = false;
			groundBody.setChain([]);
		}
		this.drawLines();
	},

	dist: function(a,b) {
		return Math.sqrt(Math.pow(a[0]-b[0],2)+Math.pow(a[1]-b[1],2));
	},

	drawLines: function() {
		bmd.clear();
		if(groundVertices.length > 2) {
			bmd.lineStyle(4,0xffffff);
			//bmd.ctx.strokeStyle = "white";
			//bmd.beginPath();
			bmd.moveTo(groundVertices[0]-game.camera.x,groundVertices[1]-game.camera.y);
			for(var i=2;i<groundVertices.length;i+=2) {
				bmd.lineTo(groundVertices[i]-game.camera.x, groundVertices[i+1]-game.camera.y);
			}
			//bmd.ctx.stroke();
			//bmd.ctx.closePath();
		}
		//bmd.ctx.strokeStyle = "red";
		bmd.lineStyle(4,0xff0000);
		//bmd.beginPath();
		for(var j=0;j<lev.length;j++) {
			bmd.moveTo(lev[j][0]-game.camera.x,lev[j][1]-game.camera.y);
			for(var i=2;i<lev[j].length;i+=2) {
				bmd.lineTo(lev[j][i]-game.camera.x, lev[j][i+1]-game.camera.y);
			}
		}
		/*bmd.ctx.stroke();
		bmd.ctx.closePath();
		bmd.render();*/
	},

	render: function() {
		//game.debug.text("Do we? " + hittingSomething, 10,10);
		//game.debug.box2dWorld();
	},

};
