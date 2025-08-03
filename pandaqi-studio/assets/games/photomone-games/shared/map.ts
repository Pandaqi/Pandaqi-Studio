import WordsPhotomone from "./wordsPhotomone";
import Point from "./point";
import Line from "./line";
import getWeighted from "js/pq_games/tools/random/getWeighted";
import range from "js/pq_games/tools/random/range";
import rangeInteger from "js/pq_games/tools/random/rangeInteger";
import shuffle from "js/pq_games/tools/random/shuffle";

export default class Map 
{
    width: number;
    height: number;
    pointBounds: any;
    pointTypes: any;
    pointRadiusFactor: number;
    pointRadiusSpecialFactor: number;
    numSmoothSteps: number;
    addStartingLines: boolean;
    linesBounds: any;
    startingLineMaxDist: number;
    startingLinePointRadius: number;
    wordsToGuessForWinning: number;
    spaceReservedForWordsFactor: number;
    printWordsOnPaper: boolean;
    createRectangleDots: boolean;
    numberRounding: any;
    numWordColumns: number;
    numWordRows: number;
    WORDS: WordsPhotomone;
    edgeMargin: number;
    mapBounds: { min: Point; max: Point; };
    useEllipseOutline: boolean;
    ellipseCenter: Point;
    ellipseSize: Point;
    ellipseMaxRandomness: number;
    ellipseAngleBuckets: any[];
    typeBounds: any;
    minDistBetweenPointsFactor: number;
    minDistBetweenPoints: number;
    minDistSquaredBetweenPoints: number;
    inkFriendly: boolean;
    colors: any;
    words: any[];
    points: any[];
    lines: any[];

    constructor(params:Record<string,any> = {})
    {
        this.width = params.width ?? 512;
        this.height = params.height ?? 512;
        this.pointBounds = params.pointBounds ?? { min: 10, max: 100 };
        this.pointTypes = params.pointTypes;
        this.pointRadiusFactor = params.pointRadiusFactor ?? 0.0075;
        this.pointRadiusSpecialFactor = params.pointRadiusSpecialFactor ?? 0.02;
        this.numSmoothSteps = params.smoothSteps ?? 20;

        this.addStartingLines = params.addStartingLines ?? false;
        this.linesBounds = params.linesBounds ?? { min: 3, max: 12 };
        this.startingLineMaxDist = params.startingLineMaxDist ?? 50;
        this.startingLinePointRadius = params.startingLinePointRadius ?? 15;

        this.wordsToGuessForWinning = params.wordsToGuessForWinning ?? 7;

        this.spaceReservedForWordsFactor = params.spaceReservedForWordsFactor ?? 0.15;
        let spaceReservedForWords = this.getSpaceReservedForWords(this.spaceReservedForWordsFactor);
        this.printWordsOnPaper = params.printWordsOnPaper ?? false;
        this.createRectangleDots = this.printWordsOnPaper && !params.expansions.actionAnts;
        if(!this.printWordsOnPaper) { spaceReservedForWords = 0; }
        this.numberRounding = params.numberRounding ?? { lines: 4, points: 2, types: 2 };

        this.numWordColumns = params.numWordColumns ?? 4;
        this.numWordRows = params.numWordRows ?? 6;
        this.WORDS = params.WORDS ?? new WordsPhotomone();

        this.edgeMargin = params.edgeMargin ?? 20;
        this.mapBounds = {
            min: new Point({ x: this.edgeMargin, y: this.edgeMargin }),
            max: new Point({ x: this.width - this.edgeMargin - spaceReservedForWords, y: this.height - this.edgeMargin })
        }

        this.useEllipseOutline = params.useEllipseOutline ?? false;
        this.ellipseCenter = new Point({
            x: 0.5*(this.mapBounds.min.x + this.mapBounds.max.x),
            y: 0.5*(this.mapBounds.min.y + this.mapBounds.max.y)
        });
        this.ellipseSize = new Point({ 
            x: 0.5*(this.mapBounds.max.x - this.mapBounds.min.x), 
            y: 0.5*(this.mapBounds.max.y - this.mapBounds.min.y) 
        });

        const numEllipseBuckets = 64;
        this.ellipseMaxRandomness = 0.175;
        this.ellipseAngleBuckets = [];
        let curRandomness = Math.random();
        for(let i = 0; i < numEllipseBuckets; i++)
        {
            let offset = 0.05 + Math.random()*0.2;
            if(Math.random() <= 0.5 || curRandomness >= 0.99) { offset *= -1; }
            if(curRandomness <= 0.01 && offset < 0) { offset *= -1; }

            curRandomness = Math.max(Math.min(curRandomness + offset, 1), 0);
            this.ellipseAngleBuckets.push(curRandomness);
        }

        this.typeBounds = Object.assign({}, params.typeBounds) ?? { min: 0.15, max: 0.225 };

        const veryFewPointTypes = Object.keys(this.pointTypes).length <= 3;
        const somewhatFewPointTypes = Object.keys(this.pointTypes).length <= 6;
        if(veryFewPointTypes) { this.typeBounds.min *= 0.33; this.typeBounds.max *= 0.33; }
        else if(somewhatFewPointTypes) { this.typeBounds.min *= 0.66; this.typeBounds.max *= 0.66; }

        const defDist = 30;
        this.minDistBetweenPointsFactor = 0.045;
        this.minDistBetweenPoints = params.minDistBetweenPoints ?? defDist;
        this.minDistSquaredBetweenPoints = Math.pow(this.minDistBetweenPoints, 2);

        this.inkFriendly = params.inkFriendly ?? false;
        this.colors = params.colors ?? [];

        this.words = [];
        this.points = [];
        this.lines = [];
    }

    // extraction for use elsewhere
    getPointsAsList()
    {
        return this.points;
    }

    getLinesAsList()
    {
        return this.lines;
    }

    getWordsAsList()
    {
        return this.words;
    }

    resizeTo(width, height)
    {
        const scaleX = (width / this.width);
        const scaleY = (height / this.height);

        this.width = width;
        this.height = height;

        for(const point of this.points)
        {
            point.scaleX(scaleX);
            point.scaleY(scaleY);
        }

        // @TODO: find neater way to recalculate this? or always calculate it dynamically?
        this.mapBounds.max.scaleX(scaleX);
        this.mapBounds.max.scaleY(scaleY);

        this.mapBounds.min.scaleX(scaleX);
        this.mapBounds.min.scaleY(scaleY);

        this.ellipseCenter.scaleX(scaleX);
        this.ellipseCenter.scaleY(scaleY);

        this.ellipseSize.scaleX(scaleX);
        this.ellipseSize.scaleY(scaleY);
    }

    // lines between points
    generateStartingLines()
    {
        const numStartingLines = rangeInteger(this.linesBounds.min, this.linesBounds.max);
        const params = { pointRadius: this.startingLinePointRadius };
        const rangeSquared = Math.pow(this.startingLineMaxDist, 2);
        for(let i = 0; i < numStartingLines; i++)
        {
            const p = this.getRandomPoint();
            const nbs = this.getNeighborsInRange(p, rangeSquared);
            if(nbs.length <= 0) { i--; continue; }

            let newLine = null;
            for(const nb of nbs)
            {
                const l = new Line(p, nb);
                if(!this.lineIsValid(l, params)) { continue; }
                newLine = l;
                break;
            }

            if(!newLine) { i--; continue; }
            this.addLine(newLine);
        }
    }

    addLine(l)
    {
        this.lines.push(l);

        l.getStart().addConnection(l.getEnd());
        l.getEnd().addConnection(l.getStart());
    }

    removeLine(l)
    {
        const idx = this.lines.indexOf(l);
        if(idx < 0) { return; }
        this.lines.splice(idx, 1);
    }

    clearLines()
    {
        for(const l of this.lines)
        {
            l.getStart().removeConnection(l.getEnd());
            l.getEnd().removeConnection(l.getStart());
        }

        this.lines = [];
    }

    // rectangles (used when words printed on paper, for extra difficulty)
    markRectangles()
    {
        const numRectangles = Math.round(0.33 * this.words.length);
        const points = this.points.slice();
        shuffle(points);
        for(let i = 0; i < numRectangles; i++)
        {
            const p = points.pop();
            if(p.getType()) { i--; continue; }
            p.setRectangle(true);
        }
    }

    // words (I attach these to the map so all data is in one place; they aren't otherwise related to the points)
    generateWords()
    {
        const numWords = this.numWordColumns * this.numWordRows;
        this.words = this.WORDS.getWords(numWords);
    }

    getPrintedWordsAnchor()
    {
        return new Point({ 
            x: this.mapBounds.max.x,
            y: this.mapBounds.max.y
        });
    }

    getSpaceReservedForWords(factor = 0.2)
    {
        return factor * this.width;
    }

    getObjectiveScore()
    {
        return this.WORDS.getObjectiveScore(this.words, this.wordsToGuessForWinning);
    }

    addPoint(p)
    {
        this.points.push(p);
    }

    removePoint(p)
    {
        const idx = this.points.indexOf(p);
        if(idx < 0) { return; }

        const lines = p.getConnections();
        for(const line of lines)
        {
            this.removeLine(line);
        }
        this.points.splice(idx, 1);
    }

    applyRandomChanges()
    {
        const maxOffsetFactor = 0.066;
        const maxOffsetX = maxOffsetFactor * this.width;
        const maxOffsetY = maxOffsetFactor * this.height;

        // we do NOT teleport points, as that would make the original lines completely unpredictable
        // instead, we only move them slightly
        for(const p of this.getPointsAsList())
        {
            const randOffsetX = (Math.random()-0.5)*2*maxOffsetX;
            const randOffsetY = (Math.random()-0.5)*2*maxOffsetY;
            const vec = new Point({ x: randOffsetX, y: randOffsetY });
            p.move(vec);
            p.clamp(this.mapBounds.min, this.mapBounds.max);
        }

        // re-assign types + ensure no overlaps/smooth distribution again
        this.assignTypes();
        this.smoothPoints();
    }

    // main generation loop
    generate()
    {
        this.createPoints();
        this.assignTypes();
        this.smoothPoints();
        this.generateWords(); // @NOTE: we still generate words, even if not printed, to calculate the target score
        if(this.addStartingLines) { this.generateStartingLines(); }
        if(this.createRectangleDots) { this.markRectangles(); }
    }

    createPoints()
    {
        const min = this.pointBounds.min;
        const max = this.pointBounds.max;
        const numPoints = rangeInteger(min, max);

        const arr = [];
        for(let i = 0; i < numPoints; i++)
        {
            const pos = this.getRandomPosition();
            const p = new Point(pos);
            arr.push(p);
        }

        this.points = arr;
    }

    smoothPoints()
    {
        for(let i = 0; i < this.numSmoothSteps; i++)
        {
            this.calculateSmoothVectors(i);
            this.smoothPointStep();
        }
    }

    assignTypes()
    {
        const types = this.determineSpecialTypes();
        this.assignTypesToPoints(types);
        this.randomlyColorPoints();
    }
    
    // helper functions
    getRandomPoint()
    {
        return this.points[Math.floor(Math.random() * this.points.length)];
    }

    // @TODO: some way to ensure a type isn't added too often?
    determineSpecialTypes()
    {
        const numPoints = this.points.length;
        const min = this.typeBounds.min * numPoints;
        const max = this.typeBounds.max * numPoints;
        let numTypes = rangeInteger(min, max);

        // add each type at least once
        const arr = [];
        const allTypes = this.getAllTypes();
        for(const type of allTypes)
        {
            arr.push(type);
            numTypes--;
        }

        // then just continue randomly
        for(let i = 0; i < numTypes; i++)
        {
            arr.push(this.getRandomType());
        }
        return arr;
    }

    randomlyColorPoints()
    {
        if(this.inkFriendly) { return; }
        for(const point of this.points)
        {
            const randIndex = Math.floor(Math.random() * this.colors.length);
            point.setColor( this.colors[randIndex] );
        }
    }

    assignTypesToPoints(list)
    {
        const points = this.points.slice();
        shuffle(points); 
        shuffle(list);
        
        while(list.length > 0)
        {
            const p = points.pop();
            const type = list.pop();
            p.setType(type);
            if(type) { p.setNumFromBounds(this.pointTypes[type].num, this.numberRounding.types); }
        }
    }

    getAllTypes()
    {
        return Object.keys(this.pointTypes);
    }

    getRandomType()
    {
        if(this.getAllTypes().length <= 0) { return null; }
        return getWeighted(this.pointTypes, "prob");
    }

    getRandomPosition()
    {
        const x = range(this.mapBounds.min.x, this.mapBounds.max.x);
        const y = range(this.mapBounds.min.y, this.mapBounds.max.y);
        return new Point({ x: x, y: y });
    }

    getNeighborsInRange(p1:Point, rangeSquared = null)
    {
        const arr = [];
        for(const p2 of this.points)
        {
            const itsUs = p1 == p2;
            if(itsUs) { continue; }

            const dist = p1.distSquaredTo(p2);
            if(!rangeSquared) { rangeSquared = this.calculateMinRangeBetweenPointsSquared(p1, p2); }

            if(dist > rangeSquared) { continue; }
            arr.push(p2);
        }
        return arr;
    }

    calculateMinRangeBetweenPointsSquared(a:Point,b:Point)
    {
        const minSize = Math.min(this.width, this.height);
        const radiusA = a.getType() ? this.pointRadiusSpecialFactor : this.pointRadiusFactor;
        const radiusB = b.getType() ? this.pointRadiusSpecialFactor : this.pointRadiusFactor;
        const fac = this.minDistBetweenPointsFactor;
        return Math.pow( (radiusA + radiusB + fac)*minSize, 2);
    }

    sumPushAwayVectors(anchor:Point, nbs:Point[], iteration:number)
    {
        const change = new Point({ x: 0, y: 0});
        if(nbs.length <= 0) { return change; }

        for(const nb of nbs)
        {
            const dist = anchor.distTo(nb);
            const vec = anchor.vecTo(nb);
            vec.normalize();
            vec.negate();

            const maxDist = Math.sqrt(this.calculateMinRangeBetweenPointsSquared(anchor, nb));

            // the _further_ away, the _lower_ this should be, so we invert
            // however, it's still proportional to distance
            // and because it's applied to both points, halve it
            const distanceScalar = 0.5 * (1.0 - dist / maxDist) * maxDist;
            vec.scale(distanceScalar);

            change.move(vec);
        }

        const averagingFactor = 1.0 / nbs.length;
        const iterationFactor = Math.pow( 1.0 / (iteration + 1) , 0.25);
        change.scale(averagingFactor * iterationFactor);
        return change;
    }

    calculateSmoothVectors(iteration:number)
    {
        for(const point of this.points)
        {
            const neighbors = this.getNeighborsInRange(point);
            const vector = this.sumPushAwayVectors(point, neighbors, iteration);
            point.setChange(vector);
        }
    }

    smoothPointStep()
    {
        for(const point of this.points)
        {
            if(!point.getChange()) { continue; }
            point.move(point.getChange());
            this.clampToEllipseEdge(point);
            point.clamp(this.mapBounds.min, this.mapBounds.max);
            point.setChange(null);
        }
    }

    getEllipseRandomness(angle)
    {
        const anglePositive = (angle + 2*Math.PI) % (2*Math.PI)
        const angleIndex = Math.floor(anglePositive / (2*Math.PI) * this.ellipseAngleBuckets.length);
        return this.ellipseAngleBuckets[angleIndex];
    }

    getEllipsePointAtAngle(angle)
    {
        const rand = this.getEllipseRandomness(angle);
        const randX = 1.0 + this.ellipseMaxRandomness*rand;
        const randY = 1.0 + this.ellipseMaxRandomness*rand;

        const ellipseX = this.ellipseSize.x * randX * Math.cos(angle);
        const ellipseY = this.ellipseSize.y * randY * Math.sin(angle);
        return new Point({ x: ellipseX, y: ellipseY });
    }

    clampToEllipseEdge(point)
    {
        if(!this.useEllipseOutline) { return; }        

        const centerOffset = this.ellipseCenter.clone().negate();
        const pointLocalToCenter = point.clone().move(centerOffset);

        const angle = pointLocalToCenter.angle();
        const p = this.getEllipsePointAtAngle(angle);

        const ourLength = pointLocalToCenter.length();
        const desiredLength = p.length();
        if(ourLength <= desiredLength) { return; }
        
        pointLocalToCenter.scale(desiredLength / ourLength);
        pointLocalToCenter.move(centerOffset.negate()); // move it back to global space
        point.copy(pointLocalToCenter);
    }

    clearPoints()
    {
        this.clearLines();
        this.points = [];
    }

    /* Helper functions */
    lineIsValid(l, params)
    {
        // line must have two different points
        if(l.getStart() == l.getEnd()) { return false; }

        // line can't already exist
        if(l.getStart().isConnectedTo(l.getEnd())) { return false; }

        // line must not cross another point on the way
        // (so we chop the line into discrete points and test each individually)
        const stepSize = 1;
        const vec = l.getVector();
        vec.normalize();
        vec.scale(stepSize)

        let distToEnd = l.getLength();
        let curPoint = l.getStart().clone();
        
        while(distToEnd > stepSize)
        {
            curPoint.move(vec);
            distToEnd -= stepSize;

            const pointHit = this.isPointInsideMapPoints(curPoint, [l.getStart(), l.getEnd()], params);
            if(pointHit) { return false; }
        }

        return true;
    }

    isPointInsideMapPoints(p:Point, exclude = [], params:Record<string,any> = {})
    {
        const points = this.getPointsAsList();
        for(const point of points)
        {
            const dist = p.distSquaredTo(point);
            const radius = (p.getType()) ? params.pointRadiusSpecial : params.pointRadius;
            if(dist > radius*radius) { continue; }

            if(exclude.includes(point)) { continue; }
            return true;
        }
        return false;
    }

    snapToClosestPoint(pos:Point, repel = false)
    {
        const points = this.getPointsAsList();
        let closestDist = Infinity;
        let closestPoint = null;
        for(const point of points)
        {
            if(repel && point.isPartOfLine()) { continue; }
            
            const dist = pos.distSquaredTo(point);
            if(dist >= closestDist) { continue; }

            closestDist = Math.min(dist, closestDist);
            closestPoint = point;
        }

        return closestPoint;
    }

    getBiggestDistanceToExisting(anchorPoint:Point, linesToConsider:Line[])
    {
        const points = this.getPointsAsList();
        let biggestDist = 0;
        for(const line of linesToConsider)
        {
            const dist1 = anchorPoint.distTo(line.getStart());
            const dist2 = anchorPoint.distTo(line.getEnd());
            biggestDist = Math.max(biggestDist, dist1, dist2);
        }
        return biggestDist;
    }
}