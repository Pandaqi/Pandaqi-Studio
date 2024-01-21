---
type: "single"
gamepage: true
boardgame: true

title: "Swerving Spaceships"
headerTitle: "Swerving Spaceships | A Naivigation game about steering a single spaceship together"
blurb: "A Naivigation game about steering a single spaceship together, visiting planets and dodging asteroids."

extraCSS: true
downloadLink: ""

# @TODO: removed links for headers and stuff for now, as it can't be found by the system

customHeight: "small"
headerDarkened: true

color: "brown"

bgColor: "#230e00"
bgColorLink: "#2d2d2d"

textColor: "#fff0e8"
textColorLink: "#e0e0e0"

googleFonts: ""

date: 2023-01-01 # 2024-12-26

categories: ["boardgame"]
tags: ["creative", "guessing", "word"]

multiplayermode: "cooperative"
language: EN
genre: ["card", "party", "social"]
playtime: 30
playercount: [2,3,4,5,6,7,8]
complexity: low
ages: everyone

---

{{% boardgame-intro heading="" %}}

A [Naivigation](/naivigation/) game about steering a single spaceship together, visiting planets and dodging asteroids.

{{% /boardgame-intro %}}

{{% section-centered heading="What do I need?" %}}

This game is part of the Naivigation universe. If you have no idea what that is, [visit the overview page](/naivigation/) first.

It means you need two things to play this game.
* The Core Set from Naivigation (which you need for all games).
* And the specific material for _this_ game. (Which you can get by clicking that "Download" button > Core Set.)

Print and cut it, read the short [playful rules](rules), and you can play!

**Playful Rules?** It means you can press a button to get random examples of turns and setup, which is far more useful (and fun) than reading some text! I've been creating such rules for years now to great success.

**Want more?** You can also [generate your own material](#material) right on this website, to suit your specific needs.

{{% /section-centered %}}

{{% section-centered heading="Material" anchor="material" html="true" %}}

<p>Pick your desired settings and click the button! The settings already selected are the "core set" mentioned in the introduction.</p>

{{< boardgame-settings type="game" local_storage="naivigationSwervingSpaceshipsConfig" btn_label="Generate Material" >}}
	{{< setting-hidden id="setting-gameTitle" text="Naivigation: Swerving Spaceships" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the material mostly grayscale." >}}
  {{< setting-enum id="setting-itemSize" text="Card Size?" values="small,regular,large" valaskey="true" def="regular" >}}
  {{< setting-checkbox id="setting-includeMapTiles" text="Include Map Tiles?" checked="checked" >}}
  {{< setting-checkbox id="setting-includeVehicleCards" text="Include Vehicle Cards?" checked="checked" >}}
  {{< setting-checkbox id="setting-includeHealthCards" text="Include Health Cards?" checked="checked" >}}
  {{< setting-checkbox id="setting-includeActionTokens" text="Include Action Tokens?" >}}
  {{< setting-checkbox id="setting-includeGPSCards" text="Include GPS Cards?" >}}
{{< /boardgame-settings >}}

<p class="settings-remark"><strong>Not working? Or unsure what to do?</strong> The "Download" button above has PDFs I already made for you! Pick any one of those.</p>

{{% /section-centered %}}

{{% section-centered heading="Credits" anchor="credits" %}}

This version is now the recommended "first version" because of its simplicity. Space is free! You can move anywhere, it has lots of empty space, and rockets can't do anything besides fly forward. That made this version the one that introduces new players to Naivigation.

But it wasn't the first I made. That was the car-based version, which I invented when I was barely an adult. That first "prototype", however flawed it was, helped me reach this much better version of the idea that you can enjoy now. Looking at the original idea with fresh eyes, now well into my twenties, immediately revealed the thousands of ways to simplify and improve these ideas.

Similarly, back then I didn't even have any website! I certainly hadn't built my framework to generate material and playful rules on the fly, in your browser. Crucial tools that make this game easier to learn and create now.

This is an example of why it's good to just _make something_ and then iterate on it. Make mistakes, break stuff, then try again with the lessons learned. Before you know it, you end up with a large group of really simple and fun cooperative games about crashing every vehicle imaginable.

For more information, check out the credits and supporting information from the [Naivigation overview page](/naivigation/).

{{% /section-centered %}}