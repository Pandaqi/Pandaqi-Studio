---
type: "single"
gamepage: true
boardgame: true

title: "Aeronaut Odyssey"
headerTitle: "Aeronaut Odyssey | Claim routes and connect sky castles in a fast game inspired by Ticket to Ride."
blurb: "Travel the world, claim the most valuable routes and profit from it. Connect the sky castles faster than your opponents, in a One Paper Game inspired by Ticket to Ride."


extraCSS: true
extraJS: true

---

{{% section-centered heading="Material" anchor="material" html="true" %}}

<p>The tool below can generate random playing boards! Input your settings, press the button, and download the PDF with your unique world.</p>

{{< boardgame-settings type="board" local_storage="aeronautOdysseyConfig" >}}
	{{< setting-hidden id="setting-gameTitle" text="Aeronaut Oddysey" >}}
  {{< setting-checkbox id="setting-inkFriendly" text="Ink Friendly?" remark="Turns the board mostly grayscale." >}}
{{< /boardgame-settings >}}

{{% /section-centered %}}