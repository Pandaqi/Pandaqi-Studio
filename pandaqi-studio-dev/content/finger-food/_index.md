---
draft: false
type: "single"

gamepage: true
boardgame: true

title: "Finger Food"
headerTitle: "Finger Food | A quick game playable with just a paper and your fingers"
blurb: "A quick game playable with just a single paper. Each turn, place a finger on a new square, to score more points than your opponents before you've used your whole hand."

googleFonts: "https://fonts.googleapis.com/css2?family=Cherry+Bomb+One&family=Quicksand:wght@500;700&display=swap"

extraCSS: true
extraJS: true
extraJSBuild: true

---

{{% section-centered heading="Board" html="true" anchor="board" %}}

{{< boardgame-settings type="board" local_storage="fingerFoodConfig" >}}
  {{< setting-hidden id="setting-gameTitle" text="Finger Food" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the material mostly grayscale to conserve ink." >}}
  {{< setting-checkbox id="setting-includeRules" text="Include Rules?" remark="Only turn off if you're familiar with all the rules." checked="checked" >}}
  <h3>Expansions</h3>
  {{< setting-checkbox id="setting-expansions-machines" text="Mighty Machines?" remark="Adds squares with a special action when you pick them." >}}
  {{< setting-checkbox id="setting-expansions-recipeBook" text="Recipe Book?" remark="Adds more ways to score by combining specific ingredients!" >}}
  {{< setting-checkbox id="setting-expansions-money" text="Dining Dollars?" remark="Adds the element of money, causing longer and more tactical games." >}}
  {{< setting-checkbox id="setting-expansions-fixedFingers" text="Fixed Fingers?" remark="Adds restrictions to which finger you're allowed to use for something." >}}
{{< /boardgame-settings >}}

<p class="remark-under-settings"><strong>Not working?</strong> Don't worry! At the "Download" link, you can also find PDFs with valid boards for all situations. Check the "Premade" folder.</p> 

{{% /section-centered %}}