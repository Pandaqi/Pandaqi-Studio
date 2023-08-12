export default {
    squared(x) { return x * x },
    distSquared(v, w) { return this.squared(v.x - w.x) + this.squared(v.y - w.y) },
    distToSegmentSquared(p, v, w) {
        var l2 = this.distSquared(v, w);
        if (l2 == 0) return this.distSquared(p, v);
        var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
        t = Math.max(0, Math.min(1, t));
        return this.distSquared(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) });
    },
    distToSegment(p, v, w) { return Math.sqrt(this.distToSegmentSquared(p, v, w)); },
    distToSetOfLines(p, arr, closeLines = true)
    {
        let smallestDist = Infinity;
        let numPoints = arr.length;
        if(!closeLines) { numPoints--; }

        for(let i = 0; i < numPoints; i++)
        {
            const p1 = arr[i];
            const p2 = arr[(i + 1) % arr.length];
            smallestDist = Math.min(smallestDist, this.distToSegment(p, p1, p2));
        }
        return smallestDist;
    },

    registerNeighbours(arr, maxDist, epsilon = 0.05)
    {
        const maxDistSquared = this.squared(maxDist + epsilon);
        for(const p1 of arr)
        {
            const nbs = [];
            for(const p2 of arr)
            {
                if(p1 == p2) { continue; }
                const dist = this.distSquared(p1, p2);

                if(dist > maxDistSquared) { continue; }
                nbs.push(p2);
            }
            p1.setNeighbours(nbs);
        }
    }
}