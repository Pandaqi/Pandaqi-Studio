
			<section>
				<img src="#" class="bigHeaderImage" />
				<div class="autoCenter">
					<h1>Conductors of the Underground</h1>
					<p class="tagline">Hades has some trouble controlling his underworld. There are just too many souls arriving across the Styx! Help every soul to the right place by efficiently sending trains across the network. A <a class="link" href="boardgames#one_paper_games">One Paper Game</a> for 2&ndash;8 players.</p>
					<p class="tagline taglineData">Ages: everyone | Complexity: Low | Playtime: 45 minutes </p>
					<p style="text-align: center;"><a href="#" class="btn download-btn">Download</a></p>
				</div>
			</section>

			<section>
				<div class="autoCenter">
					<h2>What's the idea?</h2>
					<p>Hades has some trouble controlling his underworld. There are just too many souls arriving! And all of them have different needs, curses and treatments!</p>
					<p>He has asked you to take care of his troubles. The player who wins ( = TO DO OBJECTIVE HERE) will officially receive the job as Conductor of the Underground, for all eternity. Isn’t that nice?</p>
				</div>
			</section>

			<section>
				<div class="autoCenter">
					<h2>Board Generation</h2>
					<p>Testing, testing, testing ... </p>
					<p><em>Where is the "player count" setting?</em> You don't need it! Each board can support any player count you want. With fewer players, the rules simply tell you to ignore certain parts of the board.</p>

					<div id="gameSettings">
						<div>
							<div>
								<label for="setting-inputSeed">Seed? </label>
								<input type="text" id="setting-inputSeed" placeholder="... type anything ..." maxlength="20" />

								<span class="settingRemark">The same seed (max. 20 characters) will always produce exactly the same board.</span>

								<label for="setting-boardType">Board type?</label>
								<select name="setting-boardType" id="setting-boardType">
									<option value="simple">Simplified</option>
									<option value="hexagon">Hexagon</option>
									<option value="rectangle">Rectangle</option>
								</select>

								<span class="settingRemark">Hexagon boards are more structured and simpler, Rectangle boards are more varied (as there are more options for each route)</span>

								<label for="setting-inkFriendly">Ink Friendly? </label>
								<input type="checkbox" name="setting-inkFriendly" id="setting-inkFriendly">

								<span class="settingRemark">Removes many decorational elements and turns the board black-and-white.</span>
							</div>
						</div>
					</div>

					<div style="text-align: center;">
						<button id="gameButton">Generate Board</button>
					</div>

					<div id="phaserContainer">
					</div>
				</div>
			</section>

		</main>

		

<?php

require '../../footer.php';

?>

		