class Player {
	constructor(ind, role) {
		this.index = ind;
		this.pos = { x: -1, y: -1 }
		this.passed = false;
		this.disabled = false;
		this.role = role;
	}

	isIndex(ind) {
		return (this.index == ind);
	}

	getRoleIndex() {
		if(this.role == "default") { return 0; }
		return PLAYER_ROLES.indexOf(this.role);
	}

	/* DISABLING */
	isDisabled() {
		return this.disabled;
	}

	setDisabled(val) {
		this.disabled = val;
	}

	/* PASSING (/TURN RESET) */
	reset() {
		this.passed = false;
	}

	pass() {
		this.passed = true;
	}

	hasPassed() {
		return this.passed;
	}

	/* POSITIONING AND RECT CHECK */
	setPos(pos) {
		// if we're currently at a valid location, remove ourselves there first
		var oldPos = this.pos
		if(oldPos.x >= 0 && oldPos.y >= 0) {
			MAP.getCell(oldPos).removePlayer(this.index);
		}

		// then finalize our movement into new cell
		MAP.getCell(pos).addPlayer(this.index);
		this.pos = pos;

		// then move our sprite (oldPos to newPos)
		GAME.scene.keys.mainGame.movePlayerSprite(this.index, oldPos, pos)
	}

	getPos() {
		return this.pos;
	}

	isAtPos(pos) {
		return (this.pos.x == pos.x && this.pos.y == pos.y);
	}

	isInRect(rect) {
		return (this.pos.x >= rect.x && this.pos.x < (rect.x+rect.width)) &&
				(this.pos.y >= rect.y && this.pos.y < (rect.y+rect.height))
	}
}