var ANIMAL_DICT = {
	"Fish": {
		frame: 0,
		locationRequirements: { "water": true },
		moving: {},
		move: function() {
			var nbs = MAP.getValidNeighbours(this.pos, { 'forcedWater': true });
			if(nbs.length <= 0) { return; }

			var newPos = nbs[Math.floor(Math.random() * nbs.length)];

			this.setPos(newPos);
		}
	},

	"Ibex": {
		frame: 2,
		locationRequirements: {},
		jumpTimer: 0,
		jumpInterval: 2,
		move: function() {
			if(this.jumpTimer < this.jumpInterval) {
				this.jumpTimer++;
				return;
			}

			var nbs = MAP.getValidNeighbours(this.pos, { distance: 2, alwaysReturn: true }, {});
			var newPos = nbs[Math.floor(Math.random() * nbs.length)];

			this.setPos(newPos);

			this.jumpTimer = 0;
		}
	},
}