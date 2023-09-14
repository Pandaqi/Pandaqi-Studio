class Edge {
	constuctor(dir, pos, type = '') {
		this.dir = dir; // 'h' for horizontal, 'v' for vertical
		this.pos = pos;
		this.type = type;

		this.interactedWith = false;
		this.sprite = null;
	}

	hasContent() {
		return EDGES.hasOwnProperty(this.type);
	}

	setType(tp) {
		this.type = tp;
	}

	isType(tp) {
		return (this.type === tp);
	}

	createTrack() {
		if(this.interactedWith || !this.sprite) { return; }
		this.sprite.setFrame(parseInt(this.sprite.frame.name)+1);
		this.interactedWith = true;
	}

	removeTrack() {
		if(!this.interactedWith || !this.sprite) { return; }
		this.sprite.setFrame(parseInt(this.sprite.frame.name)-1);
		this.interactedWith = false;
	}
}