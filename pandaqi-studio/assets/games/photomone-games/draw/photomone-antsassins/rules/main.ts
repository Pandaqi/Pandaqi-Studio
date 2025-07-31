import { ALMOST_ACTIONS } from "../game/dict"

const CONFIG =
{
    _rulebook:
    {
        tables:
        {
            "almost-actions":
            {
                config:
                {
                    icons:
                    {
                        sheetURL: "almost_actions.webp",
                        sheetWidth: 8,
                        icons: ALMOST_ACTIONS,
                        base: "/photomone-games/draw/photomone-antsassins/assets/"
                    }
                },
                data: ALMOST_ACTIONS
            },
        }
    }
}

loadRulebook(CONFIG._rulebook);
