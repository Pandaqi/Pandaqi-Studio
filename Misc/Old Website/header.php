<?php include 'default_headers.php'; ?>

	<?php
	// determine page title based on current URL
	$pageTitle = 'Home';
	$requestedPage = $_SERVER["REQUEST_URI"];

	if(strpos($requestedPage, 'games') !== false) {
		$pageTitle = 'Games Overview';
	} else if(strpos($requestedPage, 'about') !== false) {
		$page_type = $_GET['pagetype'];
		$pageTitle = 'About';

		if($page_type == 'me') {
			$pageTitle = 'About Me';
		} else if($page_type == 'contact') {
			$pageTitle = 'Contact';
		} else if($page_type == 'quests') {
			$pageTitle = 'Quest System';
		} else if($page_type == 'subscribe') {
			$pageTitle = 'Subscribe to mailing list';
		}
	}

	// always add standards stuff after the URL
	$pageTitle .= '&mdash;Pandaqi&mdash;Indie Game Studio';
	?>

	<title><?php echo $pageTitle; ?></title>

	</head>

	<body>
		<header>
			<div class="headerFlexbox">
				<div class="headerLogo">
					<a href="" style="text-decoration: none;">
						<img src="files/pandaqi_logo.png" />
						<span style="font-size:32px; color: white;">Pandaqi</span>
					</a>
				</div>
				<div class="headerButtons">
					<a href="about/me" class="buttonLink red">About</a>
					<a href="games" class="buttonLink green">Games</a>
					<a href="about/contact" class="buttonLink blue">Contact</a>
					<div class="gameObject" data-type="panda" data-id="2" data-right="-10px" data-top="10px"></div>
					<span id="headerSlogan">
						<?php
						$slogans = ['Couch co-op for everyone (who has a couch)', 
									'Creating local multiplayer games until someone tells me to stop',
									'No, the game will not have online multiplayer',
									'Helping gamers and non-gamers connect',
									'Play together, laugh together, live together',
									'Creator of friendships, destroyer of friendships',
									'Games so accessible even your neighbor\'s dog could join the fun'];
							
						$pickSlogan = $slogans[ array_rand($slogans) ];

						echo '&ldquo;' . $pickSlogan . '&rdquo;'

						?>
					</span>
				</div>
			</div>
		</header>