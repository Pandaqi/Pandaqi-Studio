
//
// FOr distributing POWER DOTS (or "visibility points")
//

// TO DO: This can be simplified; I'm repeating myself here a lot
var visPointList = [];
if(p.nodeType == 'Mission') {
	// Add mission node markers (which also function as visibility points at corners)
	var corners = [[0,0], [1,0], [1,1], [0,1]]
	for(var vp = 0; vp < 4; vp++) {
		visPointList.push([obj.x + corners[vp][0]*halfSize*2, obj.y + corners[vp][1]*halfSize*2])
	}
} else if(p.nodeType == 'Regular' && p.type != 'Center') {
	var numPoints = 2;
	if(p.edgePoint) {
		numPoints = 4;
	}

	// Add "visibility points" to the node (but make sure they are spaced somewhat apart)
	// Edge points get 4 visPoints around them, aligned randomly within their quadrant (to ensure we see 2 of them on the paper eventually)
	var angle = RNG2()*2*Math.PI, minAngle = 0.25, maxAngle = 1.25 
	for(var vp = 0; vp < numPoints; vp++) {
		if(p.edgePoint) {
			angle = (RNG2()*0.7 + 0.15 + vp)*0.5*Math.PI
		}

		visPointList.push([obj.x + Math.cos(angle)*radius*cs, obj.y + Math.sin(angle)*radius*cs]);

		angle += (RNG2()*(maxAngle - minAngle) + minAngle)*Math.PI;
	}
}

visibilityGraphics.fillStyle(0xCCCCCC, 1.0);
for(var vp = 0; vp < visPointList.length; vp++) {
	var visPoint = visPointList[vp];
	var circ = new Phaser.Geom.Circle(visPoint[0], visPoint[1], visPointRadius)

	visibilityGraphics.fillCircleShape(circ);
}

//
// For distributing POWER DOTS (AGAIN ...  v2)
//

 // TO DO: It's probably WAY faster to just check if the difference between two subsequent angles is larger than X,
//		  and if so, nudge our power dot in between those two,
//		  (but only if that is still within the angle range; maybe try it in steps?)
checkIfAngleOccupied: function(p, ang) {
	const angleMarginThreshold = 0.125 * Math.PI;

	// CONNECTIONS are thin, so we only need to take into account the size of our own dot
	for(var i = 0; i < p.edgeAngles.length; i++) {
		var a = p.edgeAngles[i];

		// angles go from 0 to 2*PI, so at the boundary we need to subtract 2PI to get a good comparison
		if(Math.abs(a - ang) <= angleMarginThreshold || Math.abs(a - 2*Math.PI - ang) <= angleMarginThreshold) {
			return true;
		}
	}

	// POWER DOTS are thick, so we need to take into account DOUBLE THE SIZE
	for(var i = 0; i < p.powerDots.length; i++) {
		var a = p.powerDots[i];

		if(Math.abs(a - ang) <= angleMarginThreshold*2 || Math.abs(a - 2*Math.PI - ang) <= angleMarginThreshold*2) {
			return true;
		}
	}

	return false;
},

