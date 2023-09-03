---
draft: false
type: "single"

gamepage: true
boardgame: true

title: "Kangaruse"
headerTitle: "Kangaruse | Jumping has never been so tactical and treacherous"
blurb: "Jumping has never been so tactical and treacherous. Hop along the smartest route to collect the most points before your opponents stamped the whole brushland to dust."

googleFonts: ""

extraCSS: true
extraJS: true
extraJSBuild: true

---


{{% section-centered heading="Board" html="true" anchor="board" %}}

<p>Input your desired settings and click "generate".</p>

{{< boardgame-settings type="board" local_storage="kangaruseConfig" >}}
  {{< setting-hidden id="setting-gameTitle" text="Kangaruse" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the material mostly grayscale to conserve ink." >}}
  {{< setting-enum id="setting-sideBarType" text="Side Bar?" values="No,Rules,Score" valaskey="true" remark="Add the rules or a score tracker on the paper itself?" def="Rules" >}}
  {{< setting-checkbox id="setting-startingPositions" text="Starting Positions?" remark="Marks a few squares as possible starting positions." >}}
  {{< setting-enum id="setting-boardSize" text="Board Size?" values="Tiny,Small,Regular,Large,Huge" valaskey="true" remark="For a really short or really long game." def="Regular" >}}
  {{< setting-checkbox id="setting-expansions-collector" text="Collector Expansion?" remark="Adds more ways to score points by collecting the right squares." >}}
{{< /boardgame-settings >}}

<p class="remark-under-settings"><strong>Not working?</strong> Don't worry! At the "Download" link, you can also find PDFs with valid boards for all situations. Check the "Premade" folder.</p> 

<p class="remark-under-settings"><strong>Score Trackers?</strong> If you print the score trackers on the page, you can only play with 4 players at most. (There's simply no space for more.) It's mostly recommended to enable this once you play the expansion!</p> 

{{% /section-centered %}}