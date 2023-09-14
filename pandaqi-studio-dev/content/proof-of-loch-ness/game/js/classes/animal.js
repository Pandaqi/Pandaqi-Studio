class Animal extends Entity {
	constructor(id, type) {
		super(type);

		this.entityType = "animal";

		this.id = id;
		this.pos = { x: -1, y: -1 }
		this.sprite = null;

		this.wounded = false;
		this.dead = false;

		this.creator = null; // refers to who CREATED the track, when animal is attacked for example

		// copy all properties from animal configuration/dictionary
		// directly onto the object
		var props = ANIMAL_DICT[type];

		this.move = props.move.bind(this);

		for(key in props) {
			this[key] = props[key];
		}
	}

	receiveAttack(creator, kill = false) {
		this.creator = creator;

		// if we're already wounded, or the attack is insta-kill, we're dead
		if(this.wounded || kill) { 
			this.dead = true; 
			this.sprite.setFrame(parseInt(this.sprite.frame.name)+1)
			return; 
		}

		// otherwise, only wound us
		// @TODO: some sort of fleeing behaviour? Or is this becoming too complex?
		// @TODO: What does this mean? Just a "second life"? Or do we spill blood?
		this.wounded = true;
	}

	isAlive() {
		return !this.dead;
	}

	setPos(pos, params = {}) {
		if(this.dead) { return; } // dead animals can't walk, duh
		if(this.wounded && Math.random() > 0.5) { return; } // wounded animals walk slower

		super.setPos(pos, params);
	}
}