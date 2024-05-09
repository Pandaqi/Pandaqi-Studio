import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import BlurEffect from "js/pq_games/layout/effects/blurEffect";
import TintEffect from "js/pq_games/layout/effects/tintEffect";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig, { TextAlign, TextStyle } from "js/pq_games/layout/text/textConfig";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import Circle from "js/pq_games/tools/geometry/circle";
import getPositionsCenteredAround from "js/pq_games/tools/geometry/paths/getPositionsCenteredAround";
import Point from "js/pq_games/tools/geometry/point";
import Rectangle from "js/pq_games/tools/geometry/rectangle";
import { ACTIONS, BEASTS, CARD_TEMPLATES, FOOD, MISC, MaterialType, Recipe, RecipeList, RecipeReward, RecipeRewardType, VICTIMS } from "../js_shared/dict";
import drawBlurryRectangle from "js/pq_games/layout/tools/drawBlurryRectangle";
import toTextDrawerImageStrings from "js/pq_games/tools/text/toTextDrawerImageStrings";
import fromArray from "js/pq_games/tools/random/fromArray";
import StrokeAlign from "js/pq_games/layout/values/strokeAlign";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";

export default class Card
{
    type: MaterialType
    key: string
    recipes: Recipe[] = []
    dynamicDetails: Record<string,any>

    constructor(type:MaterialType, key:string = "")
    {
        this.type = type;
        this.key = key;
    }

    getRecipes() { return this.recipes.slice(); }
    countRecipes() { return this.recipes.length; }
    addRecipe(cost:RecipeList, action:RecipeReward = null)
    {
        this.recipes.push({ cost: cost, reward: action });
    }

    async drawForRules(vis:MaterialVisualizer)
    {
        return this.draw(vis);
    }

    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        fillCanvas(ctx, "#FFFFFF");
        const group = new ResourceGroup();

        if(!vis.custom)
        {
            vis.custom = { glowEffect: [new DropShadowEffect({ color: "#FFFFFF", blur: 0.01*vis.sizeUnit })] }
        }

        if(this.type == MaterialType.FOOD) {
            this.drawFoodToken(vis, group);
        } else if(this.type == MaterialType.BEAST) {
            this.drawBeast(vis, group);
        } else {
            this.drawBackground(vis, group);
            
            if(this.type == MaterialType.RECIPE) {
                this.drawMenuCard(vis, group);
            } else if(this.type == MaterialType.VICTIM) {
                this.drawVictimCard(vis, group);
            }
        }

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawFoodToken(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const foodData = FOOD[this.key];

        // draw the food illustration, clipped to be inside circle
        const circle = new Circle({ center: vis.center, radius: 0.475 * vis.sizeUnit });
        const opIllu = new LayoutOperation({
            translate: vis.center,
            dims: vis.get("foodTokens.iconDims"),
            clip: circle,
            pivot: Point.CENTER
        });
        const resIllu = vis.getResource("food");
        group.add(resIllu, opIllu);

        // draw the tinted border on top
        const resMisc = vis.getResource("misc");
        const opBorder = new LayoutOperation({
            translate: vis.center,
            dims: vis.size,
            frame: MISC.food_circle.frame,
            pivot: Point.CENTER,
            effects: [new TintEffect(foodData.col)]
        });
        group.add(resMisc, opBorder);

        // place dots around the edges to signal food tier
        const dotRadius = vis.get("foodTokens.tierDotRadius");
        const circleRadius = vis.get("foodTokens.circleRadius");
        const dotTier = new ResourceShape( new Circle({ center: new Point(), radius: dotRadius }) );
        for(let i = 0; i < 4; i++)
        {
            const ang = i * 0.5 * Math.PI;
            const numDots = (foodData.tier ?? 0) + 1;
            const positions = getPositionsCenteredAround({
                pos: new Point(),
                num: numDots,
                dims: new Point(dotRadius*2),
                dir: Point.DOWN
            })
            
            // assemble into group first (centered around (0,0), downward, for right angle)
            const groupDots = new ResourceGroup();
            for(const pos of positions)
            {
                const opTier = new LayoutOperation({
                    translate: pos,
                    fill: "#000000",
                    composite: "overlay"
                });
                groupDots.add(dotTier, opTier);
            }

            // then place that entire group at the right position, right rotation
            const groupDotsOp = new LayoutOperation({
                translate: vis.center.clone().add(new Point(Math.cos(ang), Math.sin(ang)).scale(circleRadius)),
                rotation: ang,
                pivot: Point.CENTER
            })

            group.add(groupDots, groupDotsOp);
        }
    }

    drawBeast(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const beastData = BEASTS[this.key];
        const resMisc = vis.getResource("misc");

        // the actual full beast illustration
        const resBeasts = vis.getResource("beasts");
        const opBeast = new LayoutOperation({
            dims: vis.size,
            frame: beastData.frame
        })
        group.add(resBeasts, opBeast);

        // the white-line borders on top of everything
        // (slightly scaled down because of black autoStroke on edges)
        const opBorders = new LayoutOperation({
            translate: vis.center,
            dims: vis.size.clone().scale(0.99),
            frame: MISC.beast_frame.frame,
            alpha: 0.75,
            pivot: Point.CENTER,
            composite: "overlay",
        })

        group.add(resMisc, opBorders);
        group.add(resMisc, opBorders);

        // the beast name + level (on top of plaque)
        const plaqueDims = vis.get("beasts.name.dimsPlaque");
        const opPlaque = new LayoutOperation({
            translate: vis.get("beasts.name.posPlaque"),
            frame: MISC.name_plaque.frame,
            dims: plaqueDims,
            pivot: Point.CENTER,
            effects: vis.custom.glowEffect
        })
        group.add(resMisc, opPlaque);

        const textConfigName = new TextConfig({
            font: vis.get("fonts.special"),
            size: vis.get("beasts.name.fontSize")
        }).alignCenter();
        const opName = new LayoutOperation({
            translate: vis.get("beasts.name.pos"),
            dims: plaqueDims,
            fill: "#FFFFFF",
            stroke: "#000000",
            strokeWidth: vis.get("beasts.name.strokeWidth"),
            strokeAlign: StrokeAlign.OUTSIDE,
            pivot: Point.CENTER
        });
        const resTextName = new ResourceText({ text: beastData.label, textConfig: textConfigName });
        group.add(resTextName, opName);

        const textConfigDetails = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("beasts.name.fontSizeLevel")
        }).alignCenter();
        const resTextDetails = new ResourceText({ text: "Level " + ((beastData.tier ?? 0) + 1), textConfig: textConfigDetails });
        const opTextDetails = new LayoutOperation({
            translate: vis.get("beasts.name.posLevel"),
            dims: plaqueDims,
            fill: "#FFFFFF",
            stroke: "#000000",
            strokeWidth: vis.get("beasts.name.strokeWidthLevel"),
            strokeAlign: StrokeAlign.OUTSIDE,
            pivot: Point.CENTER
        });
        group.add(resTextDetails, opTextDetails);

        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("beasts.modal.fontSize"),
            alignHorizontal: TextAlign.START,
            alignVertical: TextAlign.MIDDLE
            //style: TextStyle.ITALIC
        })

        // add special data if available
        if(beastData.fury || beastData.fail)
        {
            const rectDims = vis.get("beasts.modalOptional.dims");
            const blurRadius = vis.get("beasts.modalOptional.blurRadius");
            const highlightColor = vis.get("beasts.modalOptional.highlightColor");

            const offset = vis.get("beasts.modalOptional.offsetFromEdge");
            const positions = [
                offset.clone(),
                new Point(vis.size.x - offset.x, offset.y)
            ];

            const dataKeys = ["fury", "fail"];
            for(let i = 0; i < dataKeys.length; i++)
            {
                const dataKey = dataKeys[i];
                if(!beastData[dataKey]) { continue; }

                // black rect behind it
                const pos = positions[i];
                drawBlurryRectangle({ pos: pos, color: "#000000", blur: blurRadius, dims: rectDims }, group);

                // actual text
                const str = "<b><col hex=\"" + highlightColor + "\">" + dataKey.toUpperCase() + ":</col></b>" + beastData[dataKey];
                const resText = new ResourceText({ text: str, textConfig });
                const opText = new LayoutOperation({
                    translate: pos,
                    dims: rectDims,
                    fill: "#FFFFFF",
                    pivot: Point.CENTER
                });
                group.add(resText, opText);
            }
        }

        // print the major frames/modals with the beast data
        const modalDims = vis.get("beasts.modal.dims");
        const modalDimsPositioning = vis.get("beasts.modal.dimsForPositioning");
        const modalPos = vis.get("beasts.modal.anchorPos");
        const textBoxDims = vis.get("beasts.modal.textBoxDims");
        const positions = getPositionsCenteredAround({
            pos: modalPos,
            num: 3,
            dims: modalDimsPositioning
        })

        const dataKeys = ["rule", "state", "menu"];
        for(let i = 0; i < positions.length; i++)
        {
            const pos = positions[i];
            const textPos = pos.clone();
            textPos.add(new Point(0, vis.get("beasts.modal.textPosOffset")*modalDims.y));

            const dataKey = dataKeys[i];
            const data = beastData[dataKey];

            // the frame around/behind it
            const opModal = new LayoutOperation({
                translate: pos,
                frame: MISC["modal_" + dataKey].frame,
                dims: modalDims,
                pivot: Point.CENTER,
                effects: vis.custom.glowEffect
            });
            group.add(resMisc, opModal);

            // grab the right text to display
            // (some elements have other properties within same object, need to be taken out and displayed otherwise)
            let str = data;
            if(dataKey == "state") { str = str.desc; }
            else if(dataKey == "menu") { str = str.reward.desc; }

            // state also displays the names of the ON/OFF version
            if(dataKey == "state")
            {
                const str = data.labels.on + "/" + data.labels.off; 
                const resTextDetails = new ResourceText({ text: str, textConfig: textConfigDetails });
                const opTextDetails = new LayoutOperation({
                    translate: pos.clone().sub(new Point(0, vis.get("beasts.modal.stateTextOffsetFromCenter")*modalDims.y)),
                    dims: modalDims,
                    pivot: Point.CENTER,
                    fill: "#000000",
                    stroke: "#FFFFFF",
                    strokeWidth: vis.get("beasts.modal.stateTextStrokeWidth"),
                    strokeAlign: StrokeAlign.OUTSIDE,
                    alpha: vis.get("beasts.modal.stateTextAlpha")
                });
                group.add(resTextDetails, opTextDetails);
            }

            const menuYOffset = vis.get("beasts.modal.menuIconOffsetY")*modalDims.y
            if(dataKey == "menu")
            {
                const subGroup = this.visualizeRecipe(vis, data.cost, vis.get("beasts.modal.menuIconDims"), textBoxDims.x);
                const op = new LayoutOperation({
                    translate: pos.clone().sub(new Point(0, menuYOffset)),
                });
                group.add(subGroup, op);

                textPos.add(new Point(0, menuYOffset)); // move text downward as well to make space
            }

            const isIconModal = (dataKey == "menu") && data.reward.type == RecipeRewardType.FOOD;
            const isTextModal = !isIconModal;
            if(isIconModal)
            {
                const subGroup = this.visualizeRecipe(vis, data.reward.food, vis.get("beasts.modal.menuIconDims"), textBoxDims.x);
                const op = new LayoutOperation({
                    translate: textPos,
                });
                group.add(subGroup, op);
            }

            if(isTextModal)
            {
                // the text on top
                const resText = new ResourceText({ text: str, textConfig });
                const opText = new LayoutOperation({
                    translate: textPos,
                    dims: textBoxDims,
                    pivot: Point.CENTER,
                    fill: vis.get("beasts.modal.textColor"),
                    dimsAuto: true,
                })
                group.add(resText, opText);
            }

        }
    }

    visualizeRecipe(vis:MaterialVisualizer, iconList:RecipeList, iconDims:Point, maxWidth:number = -1) : ResourceGroup
    {
        const overlap = 0.3;
        let totalSizeX = 0;
        for(const option of iconList)
        {
            totalSizeX += (1.0-overlap)*option.length*iconDims.x;
        }

        const scaleFactor = maxWidth <= 0 ? 1.0 : Math.min(maxWidth / totalSizeX, 1.0);
        iconDims = iconDims.clone();
        iconDims.scale(scaleFactor);

        let groupSizes = [];
        console.log(iconList);
        for(const option of iconList)
        {
            groupSizes.push(new Point((1.0 - overlap)*option.length*iconDims.x, iconDims.y));
        }

        const groupGlobal = new ResourceGroup();
        const positionsGlobal = getPositionsCenteredAround({
            pos: new Point(),
            num: iconList.length,
            dims: groupSizes // these are of dynamic lengths, but should still be centered nicely by this function
        });

        const resFood = vis.getResource("food");
        const resMisc = vis.getResource("misc");

        for(let i = 0; i < iconList.length; i++)
        {
            const option = iconList[i];
            const group = new ResourceGroup();
            const num = option.length;

            const iconDimsWithOverlap = new Point((1.0 - overlap)*iconDims.x, iconDims.y);
            const positions = getPositionsCenteredAround({
                pos: new Point(),
                num: num,
                dims: iconDimsWithOverlap
            })
    
            // @TODO: some shadow on overlap between sprites, for nice separation?
            for(let a = 0; a < positions.length; a++)
            {
                const op = new LayoutOperation({
                    translate: positions[a],
                    dims: iconDims,
                    frame: FOOD[ option[a] ].frame,
                    pivot: Point.CENTER
                })
                group.add(resFood, op);
            }

            // add this to the overall group
            const opGroup = new LayoutOperation({
                translate: positionsGlobal[i]
            })
            groupGlobal.add(group, opGroup);

            // if not last one, add "/" or between the sections
            const isLastOne = i >= (iconList.length - 1)
            if(!isLastOne)
            {
                const posBetween = positionsGlobal[i].clone().add(positionsGlobal[i+1].clone()).scale(0.5);
                const opDivider = new LayoutOperation({
                    translate: posBetween,
                    dims: iconDims,
                    frame: MISC.recipe_or_divider.frame,
                    pivot: Point.CENTER
                })
                groupGlobal.add(resMisc, opDivider)
            }
        }

        return groupGlobal;
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {

        // the victim goes BEHIND the card template, as it's someone "behind bars"
        if(this.type == MaterialType.VICTIM)
        {
            const resVictim = vis.getResource("victims");
            const opVictim = new LayoutOperation({
                translate: vis.get("cards.victims.illuPos"),
                dims: vis.get("cards.victims.illuDims"),
                frame: VICTIMS[this.key].frame,
                pivot: Point.CENTER
            });
            group.add(resVictim, opVictim);
        }

        // fixed template for card (which does most of the work)
        const templateData = CARD_TEMPLATES[this.type];
        if(!templateData) { return; }

        const resTemplate = vis.getResource("card_templates");
        const opTemplate = new LayoutOperation({
            dims: vis.size,
            frame: templateData.frame
        });
        group.add(resTemplate, opTemplate);
    }

    drawVictimCard(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const victimData = VICTIMS[this.key];

        // add the name on top of the plaque (just below halfway, fixed pos in template)
        const textConfigName = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("cards.victims.fontSizeName"),
        }).alignCenter();

        const resTextDetails = new ResourceText({ text: victimData.label, textConfig: textConfigName });
        const opTextDetails = new LayoutOperation({
            translate: vis.get("cards.victims.posName"),
            dims: new Point(vis.size.x, 2*textConfigName.size),
            fill: "#000000",
            stroke: "#FFFFFF",
            strokeWidth: vis.get("cards.victims.strokeWidthName"),
            strokeAlign: StrokeAlign.OUTSIDE,
            pivot: Point.CENTER
        });
        group.add(resTextDetails, opTextDetails);

        // add the actual action explanation
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("cards.victims.fontSize"),
            style: TextStyle.ITALIC,
            resLoader: vis.resLoader
        }).alignCenter();

        const str = this.fillInDynamicDetails(victimData.desc);
        const resText = new ResourceText({ text: str, textConfig });
        const opText = new LayoutOperation({
            translate: vis.get("cards.victims.pos"),
            dims: vis.get("cards.victims.textBoxDims"),
            fill: "#FFFFFF",
            pivot: Point.CENTER
        });
        group.add(resText, opText);
    }

    drawMenuCard(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const listTop = vis.get("cards.menu.recipeListTop")
        const listBottom = vis.get("cards.menu.recipeListBottom")

        const numRecipes = this.countRecipes();
        const totalSpaceY = listBottom.y - listTop.y;
        const spaceYPerRecipe = totalSpaceY / numRecipes;
        const spaceXPerRecipe = vis.get("cards.menu.spaceXPerRecipe")*vis.size.x;

        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("cards.menu.fontSize"),
            style: TextStyle.ITALIC
        }).alignCenter();

        const resMisc = vis.getResource("misc");

        for(let i = 0; i < numRecipes; i++)
        {
            const r = this.recipes[i];
            const maxIconDims = new Point(vis.get("cards.menu.spaceYPerRecipe")* spaceYPerRecipe);
            const subGroup = new ResourceGroup();

            // some FRAMING around/behind each option
            const opFrame = new LayoutOperation({
                translate: new Point(),
                dims: new Point(spaceXPerRecipe), // this image is 1x1 square, so need to "squarify" it
                frame: MISC.recipe_frame.frame,
                pivot: Point.CENTER
            })
            subGroup.add(resMisc, opFrame);

            const costGroupDims = new Point(numRecipes*maxIconDims.x, maxIconDims.y);
            const costGroupPos = new Point(-1.0*spaceXPerRecipe + 0.5*costGroupDims.x + 0.75*maxIconDims.x, 0); // this aligns it to left with some margin from edge

            // visualize some CONNECTING ELEMENT (behind the cost + reward)
            // (this slightly sticks out to the right, but is also slightly behind the icons, hence the fiddling with the numbers here)
            const opConnector = new LayoutOperation({
                translate: costGroupPos.clone().add(new Point(0.5*costGroupDims.x - 1.2*maxIconDims.x, 0)),
                dims: new Point(0.6*maxIconDims.x),
                pivot: Point.CENTER,
                frame: MISC.arrow.frame
            })
            subGroup.add(resMisc, opConnector);

            // visualize the COST ( = food token icons)
            const costGroup = this.visualizeRecipe(vis, r.cost, maxIconDims);
            const costOp = new LayoutOperation({
                translate: costGroupPos
            })
            subGroup.add(costGroup, costOp);

            // visualize the REWARD
            const textBoxDims = new Point(0.5*spaceXPerRecipe, maxIconDims.y);
            const textBoxPos = new Point(0.475*spaceXPerRecipe - 0.5*textBoxDims.x, 0);

            const isTextReward = r.reward.type == RecipeRewardType.TEXT;
            const isIconReward = r.reward.type == RecipeRewardType.FOOD;
            if(isTextReward)
            {
                const actionKey = r.reward.desc as string;
                const str = ACTIONS[actionKey].desc;

                const resText = new ResourceText({ text: str as string, textConfig });
                const opText = new LayoutOperation({
                    translate: textBoxPos,
                    dims: textBoxDims,
                    fill: "#000000",
                    pivot: Point.CENTER
                });
                subGroup.add(resText, opText);
            }

            if(isIconReward)
            {
                const groupRewardIcons = this.visualizeRecipe(vis, r.reward.food, maxIconDims);
                const opReward = new LayoutOperation({
                    translate: textBoxPos,
                });
                subGroup.add(groupRewardIcons, opReward);
            }

            // add the whole thing to the overall list
            const opRecipe = new LayoutOperation({
                translate: new Point(vis.center.x, listTop.y + spaceYPerRecipe * (i + 0.5))
            });
            group.add(subGroup, opRecipe);
        }
    }

    decideDynamicDetails()
    {
        if(this.type != MaterialType.VICTIM) { return; }
        const data = VICTIMS[this.key];
        if(!data.dynamic) { return; }

        const tier1Food = {};
        for(const [key,data] of Object.entries(FOOD))
        {
            if(data.tier != 0) { continue; }
            tier1Food[key] = data;
        }
        const foodImageStrings = toTextDrawerImageStrings(tier1Food, "food", "frame");
        
        let str = data.desc;
        const dynDetails = {};
        if(str.includes("%food%"))
        {
            dynDetails["%food%"] = fromArray(foodImageStrings);
        }

        const rewards = ["change State", "upgrade a token", "discard 1 token", "change Menu", "reset the Beast"];
        if(str.includes("%reward%"))
        {
            dynDetails["%reward%"] = fromArray(rewards);
        }
        this.dynamicDetails = dynDetails;
    }

    fillInDynamicDetails(str:string)
    {
        if(str.includes("%food%"))
        {
            str = str.replace("%food%", this.dynamicDetails["%food%"]);
        }

        if(str.includes("%reward%"))
        {
            str = str.replace("%reward%", this.dynamicDetails["%reward%"]);
        }

        return str;
    }
}