import Card from "../js_game/card";

enum ValidReason
{
    REMOVE,
    ROTATE
}

export { ValidMove, ValidReason }
export default class ValidMove
{
    card: Card;
    reason: ValidReason;
    
    constructor(card:Card, reason:ValidReason)
    {
        this.card = card;
        this.reason = reason;
    }
}