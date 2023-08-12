<!DOCTYPE html>
<html>
	<head>
		<title>Timely Transports &mdash; The Game</title>
		<link rel="icon" type="image/png" href="favicon.png" />

		<!-- Header font: Rowdies -->
		<link href="https://fonts.googleapis.com/css2?family=Rowdies:wght@300;400;700&display=swap" rel="stylesheet"> 

		<!-- Body Font: Yanone Kaffeesatz -->
		<link href="https://fonts.googleapis.com/css2?family=Yanone+Kaffeesatz:wght@300;400;700&display=swap" rel="stylesheet"> 

		<style type="text/css">
			body {
				margin: 0;
				padding: 0;
			}

			#phaserGameContainer {
				margin: 0;
				padding: 0;
			}

			#fontPreloadHead {
				font-family: "Rowdies";
			}

			#fontPreloadBody {
				font-family: "Yanone Kaffeesatz";
			}
		</style>
	</head>

	<body>
		<span id="fontPreloadHead">.<em>.</em><strong>.</strong></span>
		<span id="fontPreloadBody">.<em>.</em><strong>.</strong></span>

		<!-- Load Phaser 3.52.0 via CDN -->
		<script src="https://cdn.jsdelivr.net/npm/phaser@3.52.0/dist/phaser.min.js"></script>

		<!-- Load game dictionary (with lists/data/info that I need in both board generation and game interface) -->
		<script src="gameDictionary.js?cc=7"></script>

		<div id="phaserGameContainer">
		</div>

		<!-- Load actual game interface -->
		<script src="gameInterface.js?v=21"></script>
	</body>
</html>