<?php

require 'header.php';

?>
		<main>

		<?php

		$page_type = $_GET['pagetype'];

		if($page_type == '') {
			$page_type = 'me';
		}

		if($page_type == 'me') {
			displayHorizontalContainer(['img' => 'files/about_buenos_dias.png', 'gif' => '','static_wide' => 1, 'title' => 'Buenos Dias!', 'short_desc' => "<p>My name is Pandaqi. (Or <em>Tiamo Pastoor</em> in the real world, where I happen to live as well.)</p><p>I've been creating games for over 10 years, specializing in local multiplayer games</p><p>Check out my blog for in-depth devlogs and articles about (board)games: <a href='https://pandaqi.com/blog/'>Pandaqi Blog</a></p><p>I also work as a freelance artist in the Netherlands: <a href='http://rodepanda.com'>Rode Panda</a></p>", 'slur' => '#']);

			//displayHorizontalNonGame('#', 'Buenos Dias!', "<p>My name is Pandaqi. (Or <em>Tiamo Pastoor</em> in the real world, where I happen to live as well.)</p><p>I've been creating games for over 10 years, specializing in local multiplayer games, and recently decided I was good enough to start my own indie game studio. (Whether I was right remains to be seen.)</p>");

			displayHorizontalNonGame("#", "Local multiplayer?", "<p>A few years ago I realized I barely played games. Me, an actual game developer, never played games.</p><p>Why? Well, all my time was spent playing <em>board games</em>! Slowly I discovered that I played games because of the social experience. I don't want to play a game alone. Looking back at my earliest game projects, it seems obvious: all of them featured local multiplayer.</p><div class='gameObject' data-type='panda' data-id='5' data-bottom='30px' data-left='0px'></div>");

			displayHorizontalContainer(['img' => 'https://i.imgur.com/ZMcZb3K.png', 'gif' => '','static_wide' => 1, 'title' => 'My mission', 'short_desc' => "<p>I decided to completely focus my game studio on local multiplayer games.</p><p>I think there's not enough games in that genre, while they actually hold tremendous value: I've seen people become friends or revive lost relationships because of these games. People around me still remind me of shared moments in a game, many years after we already finished it.</p>", 'slur' => '#']);

			
			//displayHorizontalNonGame("#", "My mission", "<p>I decided to completely focus my game studio on local multiplayer games.</p><p>I think there's not enough games in that genre, while they actually hold tremendous value: I've seen people become friends or revive lost relationships because of these games. People around me still remind me of shared moments in a game, many years after we already finished it.</p>");

			displayHorizontalNonGame("about/contact", "Follow the mission!", "<p>If you share my view, or would simply like to stay up to date, make sure to follow me.</p><p> I believe there is value in using as few social platforms as possible&mdash;to respond quickly and spend my time efficiently&mdash;so I decided to use three main platforms: email, YouTube, and itch.io.</p><div class='buttonLink'>Contact</div>");

			displayHorizontalContainer(['img' => 'files/about_platforms.png', 'gif' => '','static_wide' => 1, 'title' => 'What games can I expect?', 'short_desc' => "<p>I develop both <strong>Desktop</strong> (Windows/Mac/Linux) and <strong>Mobile</strong> (Android/iOS) games. I'm currently looking into consoles (PlayStation, Xbox, Switch).</p><p>Any game I develop will, at its core, be local multiplayer. It's usually <strong>cooperative</strong> and as <strong>accessible</strong> as possible, to get even non-gamers playing. I also tend to implement different modes (a single player mode, extra challenging, etc.)</p>", 'slur' => '#']);

			//displayHorizontalNonGame("#", "What games can I expect?", "<p>I develop both <strong>Desktop</strong> (Windows/Mac/Linux) and <strong>Mobile</strong> (Android/iOS) games. I'm currently looking into consoles (PlayStation, Xbox, Switch).</p><p>Any game I develop will, at its core, be local multiplayer. It's usually <strong>cooperative</strong> and as <strong>accessible</strong> as possible, to get even non-gamers playing. I also tend to implement different modes (a single player mode, extra challenging, etc.)</p>");

			displayHorizontalContainer(['img' => 'files/about_tools.png', 'gif' => '','static_wide' => 1, 'title' => 'Tools I use', 'short_desc' => "<p>I like challenging myself and experimenting. This means I don't have a fixed set of tools&mdash;I just use the best tool for the job.</p><p><strong>Game Engines</strong>: Godot, Unity, Phaser, LÖVE</p><p><strong>Graphics</strong>: Blender (3D), Affinity Designer (2D Vector), ClipStudio Paint (2D Drawing)</p><p><strong>Audio</strong>: Studio One (I also have a small studio with mics, guitars, etc.)</p><p>I use lots more software (usually open source), but these are the main ones.</p><div class='gameObject' data-type='panda' data-id='4' data-top='0px'></div>", 'slur' => '#']);

			//displayHorizontalNonGame("#", "Tools I use", "<p>I like challenging myself and experimenting. This means I don't have a fixed set of tools&mdash;I just use the best tool for the job.</p><p><strong>Game Engines</strong>: Godot, Unity, Phaser, LÖVE, Corona Labs</p><p><strong>Graphics</strong>: Blender (3D), Affinity Designer (2D Vector), ClipStudio Paint (2D Drawing)</p><p><strong>Audio</strong>: Studio One (I also have a small studio with mics, guitars, etc.)</p><p><strong>Misc</strong>: I use lots more software (usually open source), but only for minor (parts of) projects.</p>");
		
		} elseif($page_type == 'contact') {
			displayHorizontalNonGame("#", "Play together, create together", "<p>Because I create multiplayer games, getting feedback and working together with the community is even more important. Follow my main channels for updates and never hesitate to send me a message!</p>");

			$gameContainerIncrementer = 0;

			displayHorizontalContainer(['img' => 'files/contact_email_wide.png', 'gif' => '','static_wide' => 1, 'title' => 'Email newsletter', 'short_desc' => "<p>Click below to subscribe to my newsletter, which means you'll receive emails from time to time with updates, special deals, or any other game-dev-related news I think might interest you.</p><a class='buttonLink transparent' href='about/subscribe'>Subscribe</a><div class='gameObject' data-type='panda' data-id='6' data-right='0px' data-bottom='-10px'></div>", 'slur' => '#']);

			displayHorizontalContainer(['img' => 'files/contact_youtube_wide.png', 'gif' => '','static_wide' => 1, 'title' => 'YouTube Channel', 'short_desc' => "<p>I regularly post videos about my work: devlogs, tutorials, projects and experiments, trailers, etc.</p><a href='https://www.youtube.com/channel/UCUegxnNkcycM67gvyeD4CEQ' class='buttonLink transparent'>Pandaqi - A channel about indie game dev</a>", 'slur' => '#']);

			displayHorizontalContainer(['img' => 'files/contact_itch_wide.png', 'gif' => '','static_wide' => 1, 'title' => 'itch.io', 'short_desc' => "<p>itch.io is the online game marketplace where all my projects are actually downloadable!</p><p>I also regularly post devlogs, give feedback to others, and participate in game jams.</p><a href='http://pandaqi.itch.io' class='buttonLink transparent'>Pandaqi on itch</a><div class='gameObject mobileGameObject' data-type='panda' data-id='7' data-right='-100%'></div>", 'slur' => '#']);

			//displayHorizontalNonGame("#", "Email Newsletter", "<p>Subscribe to the email newsletter => TO DO</p>");
			//displayHorizontalNonGame("#", "YouTube channel", "<p>Subscribe on youtube => TO DO</p>");
			//displayHorizontalNonGame("#", "itch.io", "<p>Follow me/my games/my devlogs on itch.io => TO DO</p>");

			displayHorizontalNonGame("#", "Other", "<p>I am also a freelance artist in the Netherlands: <a href='http://rodepanda.com'>Rode Panda - Portfolio</a></p><p>And finally, I have accounts on GameJolt, Kongregate, and Discord ... but I rarely check or update them, because they are not my main platforms. I believe in having three strong core platforms, instead of just creating accounts all over the place and not using them.</p>");
		
		} elseif($page_type == 'quests') {
			displayHorizontalNonGame("#", "The Quest Game!", "<p>As you probably noticed, this website is also a game. Quests automatically appear in the bottom (right) corner, which entice you to complete challenging, funny or simply heartwarming objectives.</p>");

			displayHorizontalNonGame("#", "Your highscore", "<p>This is how many points you've acquired so far:</p><p id='highscoreContainer'>... loading your score ...</p>");

			displayHorizontalNonGame("#", "Is it safe?", "<p>All game data is stored locally in your browser, which means I never get to see any of it, and no data is ever sent over the internet.</p><p>This also means that quests/progress isn't saved if you switch browsers or intentionally clear your browser memory.</p><p>If you want to compare highscores, you'll have to do so in real life :p</p>");

			displayHorizontalNonGame("#", "I don't like it", "<p>If you don't want to play the game, just click <em>Disappear</em> and you'll never see it again.</p><p>If you disabled it but want to play again, just click here:</p><div class='buttonLink' onclick='enableQuests()'>Let's get questing again!</div>");

			?>

			<script>
			getHighscore();
			</script>

			<?php

		} elseif($page_type == 'subscribe') {
			displayHorizontalNonGame("#", "Wanna get updates?", "<p>Subscribe to my monthly-or-just-when-I-have-updates newsletter!</p><p>Ironically, social media platforms are terrible at showing you updates from people you follow. Old-school emails are, in my experience, by far the best way to stay updated.</p><p>Please subscribe using the form below!</p>");

			$formString = <<<EOD
<div id="revue-embed">
	  <form action="https://www.getrevue.co/profile/pandaqi/add_subscriber" method="post" id="revue-form" name="revue-form"  target="_blank">
	  <div class="revue-form-group" style="margin-bottom: 10px;">
	    <label for="member_email">Email address</label>
	    <input class="revue-form-field" placeholder="Your email address..." type="email" name="member[email]" id="member_email" style="padding-top:10px;padding-bottom:10px;font-family: 'Raleway';">
	  </div>
	  <div class="revue-form-group" style="margin-bottom: 10px;">
	    <label for="member_first_name">First name <span class="optional">(Optional)</span></label>
	    <input class="revue-form-field" placeholder="First name... (Optional)" type="text" name="member[first_name]" id="member_first_name" style="padding-top:10px;padding-bottom:10px;font-family: 'Raleway';">
	  </div>
	  <div class="revue-form-group" style="margin-bottom: 10px;">
	    <label for="member_last_name">Last name <span class="optional">(Optional)</span></label>
	    <input class="revue-form-field" placeholder="Last name... (Optional)" type="text" name="member[last_name]" id="member_last_name" style="padding-top:10px;padding-bottom:10px;font-family: 'Raleway';">
	  </div>
	  <div class="revue-form-actions" style="margin-bottom: 10px;">
	    <input type="submit" value="Subscribe" name="member[subscribe]" id="member_submit" class="buttonLink">
	  </div>
	  <div class="revue-form-footer" style="font-size:10px;">By subscribing, you agree with Revue’s <a target="_blank" href="https://www.getrevue.co/terms" style="color: rgba(0,0,0,0.5);">Terms</a> and <a target="_blank" href="https://www.getrevue.co/privacy" style="color: rgba(0,0,0,0.5);">Privacy Policy</a>.</div>
	  </form>
</div>
EOD;

			displayHorizontalNonGame("#", "Subscribe", $formString, "forcedHighContainer");
		}


		?>

		</main>

<?php

require 'footer.php';

?>

		