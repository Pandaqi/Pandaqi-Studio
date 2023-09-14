class Monster extends Entity {
	constructor(type) {
		super(type);

		this.id = -1;
		this.entityType = "monster";

		// get this monster's (general) properties from the dictionary
		// add them directly onto the object
		var props = MONSTERS[type];
		for(key in props) {
			this[key] = props[key]
		}
		this.showMyself = false;

		// used for checking if we've met certain objectives
		this.matchedPhotograph = false;
		this.foundHideout = false;

		// copy all custom properties directly onto the object
		for(key in props.customProps) {
			this[key] = props.customProps[key];
		}

		// copy setup function
		// (with the right "this" value, namely the object created by this class)
		this.setup = props.setup.bind(this);

		// copy move function
		this.move = props.move.bind(this);
	}

	setPos(pos, params = {}) {
		super.setPos(pos, params)
	}

	show() {
		this.showMyself = true;
	}

	hide() {
		this.showMyself = false;
	}

	// receives an area (x,y,width,height) in grid coordinates of the picture being made
	isVisibleInPicture(a) {
		if(cfg.debugging) { return true; }

		if(a.width <= this.pictureVisibility.w && a.height <= this.pictureVisibility.h) { 
			return true; 
		}

		var checkSpecialPicture = this.showMyself || (MAP.getCell(STATE.getCurPlayer().pos).terrain == this.specialPictureVisibility.terrain)
		if(this.showMyself) {
			if(a.width <= this.specialPictureVisibility.w && a.height <= this.specialPictureVisibility.h) {
				return true;
			}
		}

		return false;
	}
}