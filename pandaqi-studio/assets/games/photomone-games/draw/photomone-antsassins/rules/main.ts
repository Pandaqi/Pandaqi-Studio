import { ALMOST_ACTIONS } from "../shared/dict"

const CONFIG =
{
    _rulebook:
    {
        tables:
        {
            "almost-actions":
            {
                icons:
                {
                    config:
                    {
                        sheetURL: "almost_actions.webp",
                        sheetWidth: 8,
                        base: "/photomone-games/draw/photomone-antsassins/assets/"
                    }
                },

                data: ALMOST_ACTIONS
            },
        }
    }
}

loadRulebook(CONFIG._rulebook);
