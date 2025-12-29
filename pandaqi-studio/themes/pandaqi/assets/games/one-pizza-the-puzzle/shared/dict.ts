import { Vector2 } from "lib/pq-games"

export const TRAFFIC_SIGNS =
{
	'Line Gate':
	{
		prob: 3,
		iconFrame: 0,
		gate: true,
	},

	'Ingredient Gate':
	{
		prob: 2,
		iconFrame: 1,
		gate: true,
	},

	'Smuggler Gate':
	{
		prob: 2,
		iconFrame: 2,
		gate: true,
	},

	'Backpack Gate':
	{
		prob: 2,
		iconFrame: 3,
		gate: true,
	},

	'Road Construction':
	{
		prob: 1,
		iconFrame: 4
	},

	'Fast Lane':
	{
		prob: 2,
		iconFrame: 5
	},

	'Stop Sign':
	{
		prob: 2,
		iconFrame: 6
	},

	'Traffic Light':
	{
		prob: 3,
		iconFrame: 7
	},
}

export const SPECIAL_INGREDIENTS =
{
	'Paprika':
	{
		prob: 1,
		iconFrame: 7
	},

	'Olives':
	{
		prob: 1,
		iconFrame: 8
	},

	'Garlic':
	{
		prob: 1,
		iconFrame: 9
	},

	'Pineapple':
	{
		prob: 1,
		iconFrame: 10
	},

	'Kale':
	{
		prob: 1,
		iconFrame: 11
	},

	'Dessert':
	{
		prob: 1,
		iconFrame: 12
	},

	'Smoothie':
	{
		prob: 1,
		iconFrame: 13,
		requiredSideDish: true,
		iconOffset: new Vector2(0.35, -0.1)

	},
}

export const SPECIAL_BUILDINGS =
{
	'Market':
	{
		prob: 3,
		iconFrame: 0,
		color: "#FFC0AD",
	},

	'Subway':
	{
		prob: 1,
		iconFrame: 1,
		color: "#FFDF92",
	},

	'Party':
	{
		prob: 1,
		iconFrame: 2,
		color: "#FFB4BD"
	},

	'Heating Station':
	{
		prob: 0.5,
		iconFrame: 3,
		color: "#CDEAF6",
	},

	'Weather Station':
	{
		prob: 1,
		iconFrame: 4,
		color: "#D8CDF6"
	},

	'Plaza':
	{
		prob: 2,
		iconFrame: 5,
		color: "#EDEDED"
	}
}