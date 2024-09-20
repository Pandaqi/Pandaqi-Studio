import Point from "js/pq_games/tools/geometry/point";

const CONFIG = 
{
    configKey: "starrySkylinesConfig",
    assetsBase: "/starry-skylines/assets/",
    assets: 
    {
        subrayada:
        {
            path: "fonts/MontserratSubrayada-Bold.woff2"
        },

        // the nine major planets for this game
        starry_planets:
        {
            path: "starry_planets.webp",
            frames: new Point(9,1),
        },

        // icon for starting position
        StartingPositionIcon:
        {
            path: "StartingPositionIcon.png",
            frames: new Point(3,1),
        },

        // all people icons (+ animal)
        PeopleIcon:
        {
            path: "PeopleIcon.png"
        },

        CriminalIcon:
        {
            path: "CriminalIcon.png"
        },

        EducatedIcon:
        {
            path: "EducatedIcon.png"
        },

        SickIcon:
        {
            path: "SickIcon.png"
        },

        AnimalIcon:
        {
            path: "AnimalIcon.png"
        },

        // all resource lines
        OxygenIcon:
        {
            path: "OxygenIcon.png"
        },

        WaterIcon:
        {
            path: "WaterIcon.png"
        },

        ElectricityIcon:
        {
            path: "ElectricityIcon.png"
        },

        // all terrain types
        RockIcon:
        {
            path: "RockIcon.png"
        },

        RiverIcon:
        {
            path: "RiverIcon.png"
        },

        GardenIcon:
        {
            path: "GardenIcon.png"
        },

        flower_icon:
        {
            path: "flower_icon.webp"
        },
    }
}

export default CONFIG;