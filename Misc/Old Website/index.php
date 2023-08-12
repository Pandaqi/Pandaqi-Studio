<?php

require 'header.php';

?>
		<main>

		<!-- TEMPORARY MESSAGE ABOUT MOVED DOMAIN -->
		<div class="warningMessage">Looking for my tutorials website? Don't worry, it has been moved to: <a href="http://pandaqi.com/tutorials.com">Pandaqi Tutorials</a></div>

		<?php

		$result = $conn->query("SELECT * FROM `games` ORDER BY priority DESC LIMIT 5");

		// loop through all games
		while($row = $result->fetch_assoc()) {
			displayHorizontalContainer($row);
		}

		// display container for full games list
		displayHorizontalNonGame('#', 'Looking for all my games?', "<p>Well, look no further! Click the button below to visit the complete game list.</p><a href='games' class='buttonLink'>All the games!</a><div class='gameObject' data-type='panda' data-id='0' data-top='10px'></div>");

		// display another container for the game explanation
		displayHorizontalNonGame('about/quests', 'Dear visitor,', "<p>This isn't just a regular website ... it's also a game!</p><p>This website will automatically give you fun <strong>quests</strong> ( = goals/objectives) to complete.</p><p>(Click <span style='text-decoration: underline;'>here</span> to enable this functionality, get more explanation, or see how many points you've collected.)</p>");

		// display another container for subscribing (and contact/social platforms?)
		displayHorizontalNonGame('about/subscribe', 'Hungry for updates?', "<p>Click the button below to subscribe to my mail newsletter, where I announce any updates, new projects or other interesting developments.</p><div class='buttonLink'>Subscribe!</div>");

		?>

		</main>

<?php

require 'footer.php';

?>

		