import PandaqiPhaser from "js/pq_games/website/phaser"
import { Scene, Display } from "js/pq_games/phaser.esm"

const sceneKey = "boardGeneration"
class BoardGeneration extends Scene
{
	constructor()
	{
		super({ key: sceneKey });
	}

    preload() {
        this.load.crossOrigin = 'Anonymous';
        this.canvas = this.sys.game.canvas;

        const base = 'assets/';
        this.load.spritesheet('point_types', base + 'point_types.webp', { frameWidth: 256, frameHeight: 256 });
        this.load.image('icon_points', base + 'icon_points.webp');
        this.load.image('icon_lines', base + 'icon_lines.webp');
    }

    async create(userConfig) {
        this.setup(userConfig)
        await this.generate();
        this.visualize();
        if(this.cfg.createImage) { PandaqiPhaser.convertCanvasToImage(this); }
    }

    smoothPoints()
    {
        this.map.smoothPoints();
        this.visualize();
    }

    preparePointTypes(cfg)
    {
        const dict = cfg.pointTypesDictionary;
        const newDict = {};
        for(const [key, value] of Object.entries(dict))
        {
            if(value.expansion && !cfg.expansions[value.expansion]) { continue; }
            newDict[key] = value;
        }
        return newDict;
    }

    setup(userConfig)
    {
        this.cfg = Object.assign({}, PHOTOMONE_BASE_PARAMS);
        Object.assign(this.cfg, userConfig);

        this.cfg.pointTypesDictionary = this.cfg.pointTypesDictionaries.photomone;
        this.cfg.pointTypes = this.preparePointTypes(this.cfg);
        this.cfg.width = this.canvas.width;
        this.cfg.height = this.canvas.height;

        this.cfg.debugSmoothing = false; // @DEBUGGING (should be false)
        if(this.cfg.debugSmoothing) { this.cfg.smoothSteps = 1; }

        const minSize = Math.min(this.cfg.width, this.cfg.height);
        this.cfg.edgeMargin = 0.05*minSize;
        this.cfg.minDistBetweenPoints = 0.08*minSize;
        this.cfg.pointBounds = { min: minSize*0.15, max: minSize*0.175 };
        this.cfg.startingLineMaxDist = 2.5*this.cfg.minDistBetweenPoints;
        this.cfg.startingLinePointRadius = (this.cfg.pointRadiusFactor + 0.025)*minSize; // a small margin because it looks better

        this.cfg.createImage = !this.cfg.debugSmoothing;

        console.log(this.cfg);
    }

    async generate()
    {
        const WORDS = new PHOTOMONE.WordsPhotomone();
        await WORDS.prepare(this.cfg);
        this.cfg.WORDS = WORDS;
        this.map = new PHOTOMONE.Map(this.cfg);
        console.log(this.cfg);
        this.map.generate();
    }

    clearVisualization()
    {
        if(!this.objects || !this.objects.length) { return; }
        for(const object of this.objects)
        {
            object.destroy();
        }
    }

    visualize()
    {
        this.clearVisualization();

        const visualizerObject = new PHOTOMONE.MapVisualizer(this.map);
        const vis = visualizerObject.getVisualization(this.cfg);
        const objects = [];

        for(const rect of vis.rects)
        {
            const color = Display.Color.ValueToColor(rect.color.toHex()).color;
            const r = this.add.rectangle(rect.p.x, rect.p.y, rect.size.x, rect.size.y, color, rect.alpha);
            r.setOrigin(0,0);
            objects.push(r);
        }

        for(const line of vis.lines)
        {
            const color = Display.Color.ValueToColor(line.color.toHex()).color;
            const lw = line.width;
            const l = this.add.line(0, 0, line.p1.x, line.p1.y, line.p2.x, line.p2.y, color, line.alpha);
            l.setOrigin(0,0);
            l.setLineWidth(lw, lw);
            objects.push(l);
        }

        for(const circ of vis.circles)
        {
            const colorObject = Display.Color.ValueToColor(circ.color.toHex());
            const color = colorObject.color;
            const c = this.add.circle(circ.p.x, circ.p.y, circ.radius, color);
            objects.push(c);
        }

        for(const sprite of vis.sprites)
        {
            const s = this.add.sprite(sprite.p.x, sprite.p.y, sprite.textureKey);
            s.setRotation(sprite.rotation || 0);
            s.setFrame(sprite.frame || 0);
            s.setOrigin(0.5, 0.5);
            s.displayWidth = s.displayHeight = sprite.size;
            objects.push(s);
        }

        for(const text of vis.text)
        {
            const textConfig = {
                fontFamily: text.fontFamily,
                fontSize: text.fontSize || "12px",
                color: Display.Color.ValueToColor(text.color) || 0x000000,
                stroke: text.stroke || "#FFFFFF",
                strokeThickness: text.strokeWidth || 0,
            }

            const t = this.add.text(text.p.x, text.p.y, text.text, textConfig);

            let originX = 0;
            let originY = 0;
            if(text.textAlign == "center") { originX = 0.5; }
            if(text.textBaseline == "middle") { originY = 0.5; }

            t.setOrigin(originX, originY);
            t.setRotation(text.rotation || 0);
            //t.setShadow(randOffset.x, randOffset.y, 'rgba(0,0,0,0.5)', 5);
            objects.push(t);
        }

        // draw target food on top of everything
        // @NOTE: There is _no_ check whether there's a point underneath this
        // We can still do this: get the bounding box, check if any points intersect, just delete those---but nah
        const minSize = Math.floor(this.canvas.width, this.canvas.height);
        const spriteSize = 0.033*minSize;
        const fontSize = 0.5*spriteSize;
        const edgeMargin = 0.33*spriteSize;
        const yHeightFactor = 0.66
        const xOffset = edgeMargin + spriteSize, yOffset = edgeMargin + (1.0 - 0.5*yHeightFactor) * spriteSize

        const r = this.add.rectangle(
            (xOffset + 1.5*xOffset)*0.5, yOffset, 
            spriteSize*3, (1 + yHeightFactor)*spriteSize, 
            0xEEEEEE, 1
        );

        const s = this.add.sprite(xOffset, yOffset, "icon_points");
        s.displayWidth = s.displayHeight = spriteSize;
        s.setOrigin(0.5, 0.5);

        const textConfig = {
            fontFamily: "GelDoticaLowerCaseThick",
            fontSize: fontSize + "px",
            color: "#000000"
        }
        const textString = this.map.getObjectiveScore();
        const t = this.add.text(1.5*xOffset, yOffset, textString, textConfig);
        t.setOrigin(0, 0.5);

        this.objects = objects;
    }
}

export default () => { PandaqiPhaser.linkTo(BoardGeneration, sceneKey); }
