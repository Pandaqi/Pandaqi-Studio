---
type: "project"
draft: true


title: "Bread & Plunder"
slug: "bread-and-plunder"
headerTitle: "Bread & Plunder -- the adventure of space pirates using a bakery to cover up their crimes"
blurb: "Lala vlavla"


buttonColor: "#7C593B"

googleFonts: "https://fonts.googleapis.com/css2?family=Acme&family=Rajdhani:wght@300;500;700&display=swap"

extraJS: true

date: 2021-04-29

categories: ["boardgame"]
tags: [""]

meta: 
  - name: ages
    val: everyone
  - name: complexity
    val: medium
  - name: playtime
    val: 45 minutes
---

<!--
FONTS? 
Teko (space-like): https://fonts.google.com/specimen/Teko
Sniglet (cartoony, thick): https://fonts.google.com/specimen/Sniglet
Chilanka (hand-written, but looks nice)

Acme (legible, but hint of pirateness): https://fonts.google.com/specimen/Acme
Rajdhani (thinner space-like): https://fonts.google.com/specimen/Rajdhani

Bready (pirate-like, thick, nice font) => free for personal use only (Dafont)
Pirates & Robbers (the PERFECT FONT) => not sure about if I can use it though?

Ezcar (not sure about this game, but will surely use this for something): https://fonts.google.com/specimen/Eczar

Spectral (extremely nice, free, commissioned workhorse font): https://fonts.google.com/specimen/Spectral

-->

{{% boardgame-intro heading="Bread & Plunder" img="" %}}

A boardgame for 1&ndash;8 players playing pirates in space, while keeping up a pretend bakery to cover-up your crimes.

{{% /boardgame-intro %}}

{{% section-centered heading="What's this?" %}}

This is a board game (no device/app required during play), BUT all components are randomly generated beforehand!

Input any word you like below ("SPACE", "PIRATES", ...) and click "generate game"

This will create several images, containing a random universe, player ships and powers, cities, and more.

Print these and play the game!

**Remark:** you can also print all materials as a PDF! This will often be quicker and easier to download and print.

**Remark:** because it's randomly generated, there's a tiny probability that it generates a game that is clearly unfair or unbalanced. (Or it simply creates a game board that looks ugly.) 

So check if you like what you see, before you print!

{{% /section-centered %}}

{{% section-centered heading="Board Generation" html="true" %}}
	
	<p>Input any seed you want (your favorite artist, a made-up word, whatever) and your player count.</p>
	<p>Click "Generate Board". Save the image and print it.</p>

	{{< boardgame-settings type="board" >}}

		{{< setting-seed >}}
		{{< setting-playercount min="2" max="7" def="4" >}}
		{{< setting-enum id="setting-boardVariation" text="Variation?" values="None,Small,Medium,Large,Extreme" def="Medium" >}}
		{{< setting-checkbox id="setting-pizzaPolice" text="Pizza Police?" >}}

	{{< /boardgame-settings >}}

	<p>General remarks about the game/digital component go here.</p>

{{% /section-centered %}}