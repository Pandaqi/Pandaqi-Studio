import drawEggToken from "games/easter-eggventures/shared/drawEggToken";
import drawPawnsEaster from "games/easter-eggventures/shared/drawPawnsEaster";
import MaterialEaster from "games/easter-eggventures/shared/materialEaster";
import { MATERIAL, MISC_UNIQUE, SPECIAL_SCORE_RULES, TILES, TYPE_DATA, TileCustomData, TileType } from "../shared/dict";
import { MaterialVisualizer, createContext, ResourceGroup, LayoutOperation, Vector2, TextConfig, TextWeight, ResourceText, Color, fillResourceGroup, ResourceShape, Line, rangeInteger, InvertEffect, colorRandomize } from "lib/pq-games";

export default class Tile extends MaterialEaster
{
    type: TileType;
    key: string;
    customData: TileCustomData

    constructor(t:TileType, k:string, cd:TileCustomData = {})
    {
        super();
        this.type = t;
        this.key = k;
        this.customData = cd;
    }

    getTypeData() { return TYPE_DATA[this.type]; }
    getData() { return MATERIAL[this.type][this.key]; }
    needsText() { return false; }

    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        const group = new ResourceGroup();

        if(this.type == TileType.PAWN) {
            if(this.key == "seeker") { this.drawPawnsSeeker(vis, group); }
            else { drawPawnsEaster(this, vis, group); }
        } else if(this.type == TileType.EGG) {
            if(this.key == "victory") { this.drawEggVictory(vis, group); }
            else { drawEggToken(this, vis, group); }
        } else if(this.type == TileType.MAP) {
            this.drawTile(vis, group);
        }

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawPawnsSeeker(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const res = vis.getResource("misc_unique");
        const op = new LayoutOperation({
            pos: Vector2.ZERO,
            pivot: Vector2.ZERO,
            size: vis.size,
            frame: MISC_UNIQUE.seeker_pawn.frame,
            effects: vis.inkFriendlyEffect
        });
        group.add(res, op)
    }

    drawEggVictory(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // the actual egg in background
        const res = vis.getResource("misc_unique");
        const op = new LayoutOperation({
            pos: Vector2.ZERO,
            pivot: Vector2.ZERO,
            size: vis.size,
            frame: MISC_UNIQUE.victory_egg.frame,
            effects: vis.inkFriendlyEffect
        });
        group.add(res, op)

        // its specific value positioned on top
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("eggs.victory.fontSize"),
            weight: TextWeight.BOLD
        }).alignCenter();
        
        const text = this.customData.num + "";
        const textRes = new ResourceText({ text: text, textConfig: textConfig });
        const textColor = vis.inkFriendly ? "#000000" : vis.get("eggs.victory.textColor");
        const textOp = new LayoutOperation({
            pos: vis.get("eggs.victory.textPos"),
            size: new Vector2(3*textConfig.size),
            pivot: Vector2.CENTER,
            fill: textColor
        })

        group.add(textRes, textOp);
    }

    drawTile(vis:MaterialVisualizer, group:ResourceGroup)
    {
        this.drawTileBackground(vis, group);
        this.drawTileGrid(vis, group);
        this.drawTileText(vis, group);
    }

    drawTileBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // solid background color
        let bgColor = new Color(vis.get("tiles.background.color"));
        bgColor = colorRandomize(bgColor, { min: -8, max: 8 });

        const finalColor = vis.inkFriendly ? "#FFFFFF" : bgColor.toHEX();
        fillResourceGroup(vis.size, group, finalColor);

        // random main background
        const key = "bg_" + vis.get("tiles.background.randomFrameBounds").randomInteger();
        const res = vis.getResource("misc_unique");
        const op = new LayoutOperation({
            pos: Vector2.ZERO,
            pivot: Vector2.ZERO,
            size: vis.size,
            frame: MISC_UNIQUE[key].frame,
            alpha: vis.get("tiles.background.alpha"),
            effects: vis.inkFriendlyEffect
        });

        group.add(res, op);

        // random faint pattern
        if(!vis.inkFriendly)
        {
            const resPattern = vis.getResource("misc");
            const opPattern = new LayoutOperation({
                pos: Vector2.ZERO,
                pivot: Vector2.ZERO,
                size: vis.size,
                frame: vis.get("tiles.background.randomPatternFrameBounds").randomInteger(),
                alpha: vis.get("tiles.background.alphaPattern")
            })
            group.add(resPattern, opPattern);
        }

        // if a starter tile, just place tutorial reminder and we're done
        if(this.key == "starter")
        {
            const res = vis.getResource("misc_unique");
            const key = "starter_tutorial_" + this.customData.num;
            const op = new LayoutOperation({
                pos: vis.center,
                size: vis.get("tiles.starter.tutorialSize"),
                frame: MISC_UNIQUE[key].frame,
                pivot: Vector2.CENTER,
                effects: vis.inkFriendlyEffect
            });

            group.add(res, op);
        }
    }

    // draw the actual grid of elements we generated earlier
    drawTileGrid(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const grid = this.customData.grid;
        if(!grid) { return; }

        const size = new Vector2(grid.length, grid[0].length);
        const cellSize = new Vector2(vis.size.x / size.x, vis.size.y / size.y);

        // draw the grid lines
        const gridLineColor = vis.inkFriendly ? "#000000" : vis.get("tiles.grid.gridLines.fillColor");
        const gridOp = new LayoutOperation({
            stroke: gridLineColor,
            strokeWidth: vis.get("tiles.grid.gridLines.width"),
            alpha: vis.get("tiles.grid.gridLines.alpha"),
            composite: vis.get("tiles.grid.gridLines.composite")
        })

        for(let x = 0; x < size.x; x++)
        {
            const realX = x * cellSize.x;
            const res = new ResourceShape(new Line(new Vector2(realX, 0), new Vector2(realX, vis.size.y)));
            group.add(res, gridOp);
        }

        for(let y = 0; y < size.y; y++)
        {
            const realY = y * cellSize.y;
            const res = new ResourceShape(new Line(new Vector2(0, realY), new Vector2(vis.size.x, realY)));
            group.add(res, gridOp);
        }

        // draw any background squares/modals (needed behind requirements and added score text)
        // (these are known at generation time, so already saved/computed then to make this easier here)
        const edgeMargin = 0.05 * cellSize.x;
        const strokeWidth = 0.05 * cellSize.x;
        const reqRect = this.customData.slotReqRect;
        if(reqRect)
        {
            const strokeColor = vis.inkFriendly ? "#CCCCCC" : "#82533C";
            const rCopy = new ResourceShape( reqRect.clone(true).scaleCenter(cellSize).scale(cellSize).shrink(edgeMargin) );
            const rectOp = new LayoutOperation({
                fill: "#FFFFFF",
                stroke: strokeColor,
                strokeWidth: strokeWidth,
            })
            group.add(rCopy, rectOp);
        }

        const scoreRect = this.customData.scoringRuleRect;
        if(scoreRect)
        {
            const fillColor = vis.inkFriendly ? "#FFFFFF" : "#CCFB86";
            const strokeColor = vis.inkFriendly ? "#CCCCCC" : "#447002";
            const rCopy = new ResourceShape( scoreRect.clone(true).scaleCenter(cellSize).scale(cellSize).shrink(edgeMargin) );
            const rectOp = new LayoutOperation({
                fill: fillColor,
                stroke: strokeColor,
                strokeWidth: strokeWidth,
            })
            group.add(rCopy, rectOp);
        }

        // draw the contents of the grid
        const spriteDims = cellSize.clone().scale(vis.get("tiles.grid.spriteDimsScaleFactor"));
        const spriteDimsReq = spriteDims.clone().scale(vis.get("tiles.grid.spriteDimsScaleFactor"));
        for(let x = 0; x < size.x; x++)
        {
            for(let y = 0; y < size.y; y++)
            {
                const data = grid[x][y];
                const realPos = new Vector2(x + 0.5, y + 0.5).scale(cellSize);

                // a requirement can be anything, so all necessary information is saved inside slotReq data
                if(data.type == "req") {
                
                    const spriteData = this.customData.slotReq[data.index];
                    const res = vis.getResource(spriteData.texture);
                    const op = new LayoutOperation({
                        pos: realPos,
                        size: spriteDimsReq,
                        frame: spriteData.frame,
                        pivot: Vector2.CENTER,
                        effects: vis.inkFriendlyEffect
                    })

                    group.add(res, op);

                    if(spriteData.arrow != null)
                    {
                        const resArr = vis.getResource("misc_unique");
                        const opArr = new LayoutOperation({
                            pos: realPos,
                            size: spriteDims,
                            frame: MISC_UNIQUE.slot_arrows.frame,
                            pivot: Vector2.CENTER,
                            rot: spriteData.arrow * 0.5 * Math.PI,
                            effects: vis.inkFriendlyEffect
                        })
                        group.add(resArr, opArr);
                    }
                
                // a slot simply loads the right sprite from misc spritesheet (always the same)
                } else if(data.type == "slot") {
                
                    const res = vis.getResource("misc_unique");
                    const op = new LayoutOperation({
                        pos: realPos,
                        size: spriteDims,
                        frame: MISC_UNIQUE.egg_slot.frame,
                        pivot: Vector2.CENTER,
                        effects: vis.inkFriendlyEffect
                    })

                    group.add(res, op);
                
                // a decoration loads from TILES, but resizes itself if it's supposed to be large.
                } else if(data.type == "dec") {
                
                    const decData = TILES[data.key];
                    const isLarge = decData.size == "large"

                    const pos = isLarge ? realPos.clone().add(cellSize.clone().scale(0.5)) : realPos;
                    const size = isLarge ? spriteDims.clone().scale(2) : spriteDims; 

                    const res = vis.getResource("tiles");
                    const op = new LayoutOperation({
                        pos: pos,
                        size: size,
                        frame: decData.frame,
                        pivot: Vector2.CENTER,
                        flipX: Math.random() <= 0.5,
                        effects: vis.inkFriendlyEffect
                    })

                    group.add(res, op);
                
                }

            }
        }

    }

    drawTileText(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const scoringRule = this.customData.scoringRule;
        if(!scoringRule) { return; }

        console.log("Should draw score rule");

        // @IMPROV: make this a bit nicer, indicate it's an Added Score, etcetera

        const grid = this.customData.grid;
        const size = new Vector2(grid.length, grid[0].length);
        const cellSize = new Vector2(vis.size.x / size.x, vis.size.y / size.y);

        const scoreRect = this.customData.scoringRuleRect.clone(true).scaleCenter(cellSize).scale(cellSize);
        const textBoxDims = scoreRect.getSize().scale(0.9);

        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("tiles.scoreText.fontSize"),
            resLoader: vis.resLoader
        }).alignCenter();

        // this is just a hint/reminder text that this is the added score
        const textHint = "<b>Added Score</b>";
        const textResHint = new ResourceText({ text: textHint, textConfig: textConfig });
        const textColor = vis.inkFriendly ? "#000000" : vis.get("tiles.scoreText.color");
        const textOpHint = new LayoutOperation({
            pos: new Vector2(scoreRect.getCenter().x, scoreRect.getTopLeft().y + 0.85 * textConfig.size),
            size: textBoxDims,
            pivot: Vector2.CENTER,
            fill: textColor,
            alpha: 0.75
        })

        group.add(textResHint, textOpHint);

        // if it talks about a neighbor, actually point to one at random
        const neighborRelated = scoringRule.includes("nbs_");
        if(neighborRelated)
        {
            const res = vis.getResource("misc_unique");
            const spriteDims = new Vector2(1.45 * textConfig.size);
            const sideOffsetFactor = 0.66;
            const op = new LayoutOperation({
                pos: new Vector2(scoreRect.getTopLeft().x + sideOffsetFactor*spriteDims.x, textOpHint.pos.y),
                size: spriteDims,
                frame: MISC_UNIQUE.slot_arrows.frame,
                rot: rangeInteger(0,3) * 0.5 * Math.PI,
                pivot: Vector2.CENTER,
                effects: [new InvertEffect(), vis.inkFriendlyEffect].flat()
            });
            group.add(res, op);

            const opMirror = op.clone();
            const mirrorTrans = op.pos.clone();
            mirrorTrans.x = scoreRect.getTopRight().x - sideOffsetFactor*spriteDims.x;
            opMirror.pos = mirrorTrans;
            group.add(res, opMirror);
        }
        
        // this is the main power/bonus text
        const text = SPECIAL_SCORE_RULES[scoringRule].desc;
        const textRes = new ResourceText({ text: text, textConfig: textConfig });
        const textOp = new LayoutOperation({
            pos: scoreRect.getCenter(),
            size: textBoxDims,
            pivot: Vector2.CENTER,
            fill: textColor
        })

        group.add(textRes, textOp);
    }
}