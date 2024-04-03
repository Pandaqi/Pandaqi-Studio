import Point from "js/pq_games/tools/geometry/point";

const CONFIG =
{
    assetsBase: "/unstable-universe/assets/",
    assets:
    {
        fault_line:
        {
            path: "fault_line.png"
        },

        node_outlines:
        {
            path: "node_outlines.png",
            frames: new Point(10,1)
        },

        mission_nodes:
        {
            path: "mission_nodes.png",
            frames: new Point(10,1)
        },

        regular_nodes:
        {
            path: "regular_nodes.png",
            frames: new Point(10,4)
        },

        expedition_nodes:
        {
            path: "expedition_nodes.png",
            frames: new Point(8,1)
        },

        tiny_nodes:
        {
            path: "tiny_nodes.png",
            frames: new Point(5,1)
        },

        natural_resources:
        {
            path: "natural_resources.png",
            frames: new Point(5,1)
        },

        landmarks:
        {
            path: "landmarks.png",
            frames: new Point(5,1)
        },

        daynight_icons:
        {
            path: "daynight_icons.png",
            frames: new Point(2,1)
        }
    }

    /*
    this.load.image('fault_line', base + 'fault_line.png')

		this.load.spritesheet('node_outlines', base + 'node_outlines.png?c=1', spritesheetSlice);
		this.load.spritesheet('mission_nodes', base + 'mission_nodes.png?c=1', spritesheetSlice);
		this.load.spritesheet('regular_nodes', base + 'regular_nodes.png?c=3', spritesheetSlice);

		this.load.spritesheet('expedition_nodes', base + 'expedition_nodes.png?c=1', spritesheetSlice)

		this.load.spritesheet('tiny_nodes', base + 'tiny_nodes.png', spritesheetSlice)
		this.load.spritesheet('natural_resources', base + 'natural_resources.png', spritesheetSlice);
		this.load.spritesheet('landmarks', base + 'landmarks.png', spritesheetSlice)

		this.load.spritesheet('daynight_icons', base + 'daynight_icons.png', spritesheetSlice)
        */
}

export default CONFIG;