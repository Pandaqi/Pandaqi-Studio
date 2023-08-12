var TRAFFIC_SIGNS = 
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

	var SPECIAL_INGREDIENTS = 
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
				iconOffset: [0.35, -0.1]

			},
	}

	var SPECIAL_BUILDINGS =
	{
		'Market':
			{
				prob: 3,
				iconFrame: 0,
				color: 0xFFC0AD,
			},

		'Subway':
			{
				prob: 1,
				iconFrame: 1,
				color: 0xFFDF92,
			},

		'Party':
			{
				prob: 1,
				iconFrame: 2,
				color: 0xFFB4BD
			},

		'Heating Station':
			{
				prob: 0.5,
				iconFrame: 3,
				color: 0xCDEAF6,
			},

		'Weather Station':
			{
				prob: 1,
				iconFrame: 4,
				color: 0xD8CDF6
			},

		'Plaza':
			{
				prob: 2,
				iconFrame: 5,
				color: 0xEDEDED
			}
	}