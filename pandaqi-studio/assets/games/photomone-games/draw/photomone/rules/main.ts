import { POINT_TYPES } from "../../../shared/gameDictionary";

const CONFIG =
{
    _rulebook:
    {
        tables:
        {
            "sneaky-spots":
            {
                icons:
                {
                    config:
                    {
                        sheetURL: "point_types.webp",
                        sheetWidth: 8,
                        base: "/photomone-games/draw/photomone/assets/"
                    }

                },

                data: 
                {
                    numLines: POINT_TYPES.numLines,
                    distance: POINT_TYPES.distance,
                    points: POINT_TYPES.points,
                    fixed: POINT_TYPES.fixed,
                    curve: POINT_TYPES.curve,
                    repel: POINT_TYPES.repel,
                }
            },

            "precise-painters":
            {
                icons:
                {
                    config:
                    {
                        sheetURL: "point_types.webp",
                        sheetWidth: 8,
                        base: "/photomone-games/draw/photomone/assets/"
                    }
                },

                data: 
                {
                    add: POINT_TYPES.add,
                    remove: POINT_TYPES.remove,
                    solid: POINT_TYPES.solid,
                    eyes: POINT_TYPES.eyes,
                    unfinished: POINT_TYPES.unfinished,
                    eraser: POINT_TYPES.eraser,
                }
            },

            "action-ants":
            {
                icons:
                {
                    config:
                    {
                        sheetURL: "point_types.webp",
                        sheetWidth: 8,
                        base: "/photomone-games/draw/photomone/assets/"
                    }
                },

                data: 
                {
                    trap: POINT_TYPES.trap,
                    wings: POINT_TYPES.wings,
                    teleport: POINT_TYPES.teleport,
                    poisonTrail: POINT_TYPES.poisonTrail,
                }
            },

            "coop-colony":
            {
                icons:
                {
                    config:
                    {
                        sheetURL: "point_types.webp",
                        sheetWidth: 8,
                        base: "/photomone-games/draw/photomone/assets/"
                    }
                },

                data: 
                {
                    leader: POINT_TYPES.leader,
                    dreamdrawing: POINT_TYPES.dreamdrawing,
                }
            },

            "antertainment-break":
            {
                config:
                {
                    icons:
                    {
                        sheetURL: "point_types.webp",
                        sheetWidth: 8,
                        icons: POINT_TYPES,
                        base: "/photomone-games/draw/photomone/assets/"
                    }
                },
                data: 
                {
                    break: POINT_TYPES.break,
                    pantsOnFire: POINT_TYPES.pants,
                }
            },
        }
    }
}

loadRulebook(CONFIG._rulebook);