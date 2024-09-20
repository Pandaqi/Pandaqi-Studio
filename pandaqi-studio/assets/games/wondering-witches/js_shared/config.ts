import Point from "js/pq_games/tools/geometry/point";

const CONFIG =
{
    configKey: "wonderingWitchesConfig",
    assetsBase: "/wondering-witches/assets/",
    assets:
    {
        mali:
        {
            path: "fonts/Mali-Regular.woff2"
        },

        ingredient_spritesheet:
        {
            path: "ingredient_spritesheet.webp",
            frames: new Point(10,1)
        },

        special_cell_spritesheet:
        {
            path: "special_cell_spritesheet.webp",
            frames: new Point(8,1)
        }
    }
}

export default CONFIG;