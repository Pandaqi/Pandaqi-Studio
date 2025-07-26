--- 
draft: true


title: "Proof of Loch Ness"
headerTitle: "Proof of Loch Ness &mdash; Tracking mythical monsters that might not even exist"
blurb: "??"



buttonColor: "#7CFF86"

googleFonts: "https://fonts.googleapis.com/css2?family=Ravi+Prakash&family=Roboto+Condensed:ital,wght@0,400;0,700;1,400;1,700&display=swap"


date: 2021-04-29

categories: ["boardgame"]
tags: ["hybrid"]

meta:
  - name: ages
    val: all
  - name: complexity
    val: low
  - name: playtime
    val: 30 minutes
---

{{% boardgame-intro heading="Proof of Loch Ness" img="" url="#" %}}
... tagline here ...
{{% /boardgame-intro %}}

{{% section-centered heading="Hoe werkt het?" %}}
Lalavalvla
{{% /section-centered %}}

{{% section-centered heading="Game" html="true" %}}

	<p>Input your desired settings, click the button, start!</p>

	{{< boardgame-settings type="game" local_storage="proofOfLochNessConfig" >}}

		{{< setting-hidden id="setting-gameTitle" text="Proof of Loch Ness" >}}
		{{< setting-playercount min="1" max="8" def="4" >}}
		{{< setting-enum id="setting-scenario" text="Scenario?" values="Unicorn Park,Desert Drama,Loch Ness,Footprint Forest,Platypus" keys="Uni,Desert,Nessie,Forest,Platypus" >}}
		{{< setting-enum id="setting-monster" text="Monster?" values="Preferred,Unicorn,Cactus Cat,Nessie,Bigfoot,Platyput" valaskey="true" keep-case="true" remark="Leave it on <em>preferred</em> to play the default monster for your chosen scenario." >}}

	{{< /boardgame-settings >}}

{{% /section-centered %}}

{{% section-centered heading="Picture book" %}}

This game inspired me to create an _interactive picture book_, which is published in the Netherlands. 

If you're Dutch, check it out: <a href="#"> ... link here ... (Het Bewijs van Loch Ness)</a>

{{% /section-centered %}}