import createContext from "js/pq_games/layout/canvas/createContext";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { CARD_TEMPLATES, CardSubType, CardType, ICONS, MAIN_TEXTS, MovieDetails, TextDetails, VoteDetails, VoteType } from "../shared/dict";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import Point from "js/pq_games/tools/geometry/point";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import getPositionsCenteredAround from "js/pq_games/tools/geometry/paths/getPositionsCenteredAround";

export default class Card
{
    type: CardType;
    subType: CardSubType;
    voteDetails: VoteDetails;
    movieDetails: MovieDetails;
    textDetails: TextDetails;

    constructor(t:CardType, s:CardSubType)
    {
        this.type = t;
        this.subType = s;
    }

    setVoteDetails(d:VoteDetails) { this.voteDetails = d; }
    isVote() { return this.type == CardType.VOTE; }

    setMovieDetails(m:MovieDetails) { this.movieDetails = m; }
    hasMovieTextDetails() { return this.movieDetails.costText || this.movieDetails.profitText; }
    isMovie() { return this.type == CardType.MOVIE; }

    setTextDetails(t:TextDetails) { this.textDetails = t; }

    getIconsAsList()
    {
        let icons = [];
        if(this.isVote()) {
            const num = this.voteDetails.num;
            for(let i = 0; i < num; i++)
            {
                icons.push(this.voteDetails.icon);
            }
        } else {
            icons = this.movieDetails.costIcons ?? [];
        }
        return icons;
    }

    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        const group = new ResourceGroup();

        this.drawBackground(vis, group);
        this.drawSides(vis, group);
        this.drawVoteDetails(vis, group);
        this.drawCenterText(vis, group);

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const res = vis.getResource("card_templates");
        let key = "";
        if(this.type == CardType.MOVIE) 
        { 
            key = "movie"; 
            if(this.hasMovieTextDetails()) { key = "movie_flat"; }
        }
        else if(this.type == CardType.VOTE)
        {
            if(this.subType == VoteType.YES) { key = "vote_yes"; }
            else if(this.subType == VoteType.NO) { key = "vote_no"; }
            else if(this.subType == VoteType.CHANGE) { key = "vote_change"; }
        }

        const frame = CARD_TEMPLATES[key].frame;
        const op = new LayoutOperation({
            pos: new Point(),
            size: vis.size,
            frame: frame,
            effects: vis.inkFriendlyEffect
        });
        group.add(res, op);
    }

    drawVoteDetails(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!this.isVote()) { return; }

        const dropShadowEffect = new DropShadowEffect({ blurRadius: vis.get("cards.shared.dropShadowRadius")});
        const effects = [dropShadowEffect, vis.inkFriendlyEffect].flat();

        // draw number slightly to the left
        const singleElement = !this.voteDetails.num || !this.voteDetails.icon;
        if(this.voteDetails.num)
        {
            const fontSize = vis.get("votes.details.fontSize");
            const textConfig = new TextConfig({
                font: vis.get("fonts.heading"),
                size: fontSize
            }).alignCenter();
    
            const str = this.voteDetails.num.toString();
            const resText = new ResourceText({ text: str, textConfig: textConfig });
            const pos = singleElement ? vis.center.clone() : vis.get("votes.details.textPos");
    
            const textColor = vis.inkFriendly ? "#000000" : vis.get("votes.details.textColors." + this.subType);
            const opText = new LayoutOperation({
                pos: pos,
                size: new Point(2*fontSize),
                fill: textColor,
                pivot: Point.CENTER
            })
            group.add(resText, opText);
        }

        // draw icon slightly to the right
        if(this.voteDetails.icon)
        {
            const pos = singleElement ? vis.center.clone() : vis.get("votes.details.iconPos");
            const resIcon = vis.getResource("misc");
            const opIcon = new LayoutOperation({
                pos: pos,
                size: vis.get("votes.details.iconDims"),
                frame: ICONS[this.voteDetails.icon].frame,
                pivot: Point.CENTER,
                effects: effects
            });
            group.add(resIcon, opIcon);
        }

    }

    drawSides(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!this.isMovie()) { return; }

        const dropShadowEffect = new DropShadowEffect({ blurRadius: vis.get("cards.shared.dropShadowRadius")});
        const effects = [dropShadowEffect, vis.inkFriendlyEffect].flat();

        const topSideIcons = (this.movieDetails.costIcons != undefined);
        const topSideText = !topSideIcons;

        const resMisc = vis.getResource("misc");
        const offsetRaw = vis.get("cards.movie.cost.iconOffset").clone();
        const iconDims = vis.get("cards.movie.cost.iconDims");
        const offsetBetweenIcons = new Point(iconDims.x*1.05, 0);
        offsetRaw.add(iconDims.clone().scale(0.5));

        const offset = new Point(vis.center.x, offsetRaw.y);
        const textBoxDims = vis.get("cards.movie.cost.textBoxDims");
        const textColorTop = vis.inkFriendly ? "#000000" : vis.get("cards.movie.cost.textColor");

        const dropShadowEffectSubtle = new DropShadowEffect({ blurRadius: vis.get("cards.shared.dropShadowRadius") * 0.4 });
        const defImgOp = new LayoutOperation({ effects: [dropShadowEffectSubtle] }); 

        const textConfigBody = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("cards.movie.cost.fontSize"),
            resLoader: vis.resLoader,
            defaultImageOperation: defImgOp
        }).alignCenter();

        // on top side, just display icons from left to right
        if(topSideIcons)
        {
            const numIcons = this.movieDetails.costIcons.length;
            const positions = getPositionsCenteredAround({ pos: offset, num: numIcons, size: new Point(offsetBetweenIcons) });
            for(let i = 0; i < numIcons; i++)
            {
                const icon = this.movieDetails.costIcons[i];
                const position = positions[i];
                const op = new LayoutOperation({
                    pos: position, // offset.clone()
                    size: iconDims,
                    frame: ICONS[icon].frame,
                    pivot: Point.CENTER,
                    effects: effects
                });
                group.add(resMisc, op);
            }

            // @NOTE: ALTERNATIVE; for display LEFT to RIGHT, do
            // - const offset = offsetRaw.clone();
            // - translate = offset.clone();
            // - offset.add(offsetBetweenIcons); at end of every loop
        }

        // if it's text instead, just display it centered within that rectangle
        if(topSideText)
        {
            const resText = new ResourceText({ text: this.movieDetails.costText, textConfig: textConfigBody });
            const opText = new LayoutOperation({
                pos: offset,
                size: textBoxDims,
                fill: textColorTop,
                pivot: Point.CENTER
            });
            group.add(resText, opText);
        }

        const bottomSideIcons = (this.movieDetails.profit != undefined);
        const bottomSideText = !bottomSideIcons;
        const textColorBottom = vis.inkFriendly ? "#000000" : vis.get("cards.movie.profit.textColor");
        const offsetBottom = vis.size.clone().sub(offsetRaw);

        // on bottom side, just display pile of coins with number before it
        // (this inconsistency is on purpose, to intuitively remind players about the different purpose/usage)
        if(bottomSideIcons)
        {
            const opIconPile = new LayoutOperation({
                pos: offsetBottom.clone(),
                size: iconDims,
                frame: 0,
                pivot: Point.CENTER,
                effects: effects
            })
            group.add(resMisc, opIconPile);

            offsetBottom.sub(offsetBetweenIcons);

            const fontSize = vis.get("cards.movie.profit.fontSize");
            const textConfig = new TextConfig({
                font: vis.get("fonts.heading"),
                size: fontSize
            }).alignCenter();

            const str = this.movieDetails.profit.toString();
            const resText = new ResourceText({ text: str, textConfig: textConfig });

            const opText = new LayoutOperation({
                pos: offsetBottom.clone(),
                size: new Point(2*fontSize),
                fill: textColorBottom,
                pivot: Point.CENTER
            })
            group.add(resText, opText);
        }

        // if it's text instead, just display it centered within that rectangle
        if(bottomSideText)
        {
            const offsetBottomCentered = new Point(vis.center.x, offsetBottom.y);
            const resText = new ResourceText({ text: this.movieDetails.profitText, textConfig: textConfigBody });
            const opText = new LayoutOperation({
                pos: offsetBottomCentered,
                size: textBoxDims,
                fill: textColorTop,
                pivot: Point.CENTER
            });
            group.add(resText, opText);
        }
        
    }

    drawCenterText(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!this.isMovie()) { return; }

        // a small introductory text at the top
        const textColor = "#FFFFFF";
        const fontSizeSub = vis.get("cards.movie.text.fontSizeSub");
        const textConfigSub = new TextConfig({
            font: vis.get("fonts.body"),
            size: fontSizeSub,
            style: TextStyle.ITALIC
        }).alignCenter();

        const strSub = MAIN_TEXTS[this.textDetails.main].desc;
        const resTextSub = new ResourceText({ text: strSub, textConfig: textConfigSub });
        const opTextSub = new LayoutOperation({
            pos: vis.get("cards.movie.text.textPosSub"),
            size: new Point(vis.size.x, 2*fontSizeSub),
            fill: textColor,
            pivot: Point.CENTER
        });
        group.add(resTextSub, opTextSub);

        // the main card text in the middle
        const fontSize = vis.get("cards.movie.text.fontSize");
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: fontSize,
            weight: TextWeight.BOLD
        }).alignCenter();

        const str = this.textDetails.option.toUpperCase();
        const resText = new ResourceText({ text: str, textConfig: textConfig });
        const opText = new LayoutOperation({
            pos: vis.get("cards.movie.text.textPos"),
            size: new Point(vis.size.x, 2*fontSize),
            fill: textColor,
            pivot: Point.CENTER
        });
        group.add(resText, opText);
    }
}