class PriorityItem {
    constructor(priority, elem)
    {
        this.priority = priority;
        this.elem = elem;
    }

    getItem() { return this.elem; }
    getPriority() { return this.priority; }
}

export default class PriorityQueue {
	constructor() { this.elements = []; }
	isEmpty() { return this.elements.length <= 0; }

    // remove first element from elements, return it
    get() { return this.elements.shift().getItem(); }

    // find correct place in list, then add
	put(item, priority) {
		let insertIndex = 0;
        for(const elem of this.elements)
        {
            if(elem.getPriority() >= priority) { break; }
            insertIndex++;
        }

        const priorityItem = new PriorityItem(priority, item);
		this.elements.splice(insertIndex, 0, priorityItem);
	}    
}