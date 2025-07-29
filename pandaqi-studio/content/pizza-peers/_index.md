---
type: "project"

title: "Pizza Peers"
blurb: "Start the game on a computer, connect your smartphone, and have some cooperative multiplayer fun delivering tasty pizzas!"
deprecated: true

date: 2020-07-12

difficulty: "simple"
genres: ["action", "simulation"]
categories: ["game", "desktop", "smartphone-controlled"]
tags: ["cooking", "movement", "pick-up-and-deliver"]
themes: ["food", "pixel-art"]

multiplayertype: 'offline'
multiplayermode: 'cooperative'
price: 0
platform: ["windows", "mac", "linux", "android", "iOS"]
language: EN
playtime: 5
playercount: [1,2,3,4,5,6,7,8,9,10]
input: ["touch"]
devlog: "/blog/videogames/the-peerful-project/pizza-peers/"

media: [pizzapeers-logo, video/1_how_to_move, video/2_how_to_buy, video/3_how_to_deliver, video/4_how_to_combine, video/5_how_allergies_work, video/6_how_to_bake, video/7_how_to_take_orders, pizzapeers-logo-animated]

---

{{% embed-video src="https://youtube.com/embed/6BKfPS9q3qI" caption="(Hover/click logo for the trailer)" static-logo="pizzapeers_logo_animated" %}}

## How do I start a game?

Go to [pizza-peers.herokuapp.com](https://pizza-peers.herokuapp.com) on a computer. Press **start game**.

Now all players can connect with their smartphone! Go to the same website, enter the room code and a fun username, and click **join game**.

While everyone's connecting, you can choose your **difficulty**. The higher the difficulty, the more mechanics and rules are in the game. I highly recommend starting with "amateur" and working your way up from there!

## What's my goal?

Work together to keep your pizza place alive until the timer runs out! You lose if you **fail three deliveries**

Do not worry if you don't immediately remember the rules below. Have fun, play a few rounds, and everything will become clear.

## Amateur: How do I move?

Simply move your finger around the screen! (For example: if you touch the top left, your character moves in that direction.)

{{< video url="video/1_how_to_move" >}}

## Amateur: How do I make a pizza?

Every pizza goes through these steps. (On lower difficulty settings, though, you only do a few of these.)
1. Gather ingredients
2. Combine into pizza
3. Bake the pizza
4. Deliver

## Amateur: How do I get ingredients?

There are 5 main ingredients: dough, tomatoes, cheese, spice and vegetables.

You can buy ingredients by walking to the corresponding building and pressing the button on your phone.

_Beware!_ You only have space for **three things** in your personal backpack.

{{< video url="video/2_how_to_buy" >}}

## Amateur: How do I deliver?

Buildings will automatically place orders. How do you know? The building will flicker and their order will fly above it.

Also, an orange circle appears in front of it. Stand on it and press "deliver order" on your phone!

{{< video url="video/3_how_to_deliver" >}}

## Cook: How do I combine ingredients?

Combining is done on **tables**

Walk up to them and press the buttons on your phone to drop or pick up ingredients.

_Beware!_ You can only combine ingredients if you have the basis of all pizzas: **dough**

{{< video url="video/4_how_to_combine" >}}

## Cook: Allergies!

Each player receives a list of "allergies" at the start of the game. This remains visible at all times on your phone.

You cannot _hold_ any of these ingredients in your backpack!

If you have 4+ players, you also cannot hold a pizza that _contains_ any of those ingredients.

{{< video url="video/5_how_allergies_work" >}}

## Chef: How do I bake a pizza?

Baking is done at **ovens**

Walk up to them and press the button to drop the pizza.

Baking takes time. The heat meter will show you the current temperature.

If it's **green** (or higher), the pizza is hot enough.

{{< video url="video/6_how_to_bake" >}}

## Chef: How do I get orders?

From now on, buildings will not automatically order something &mdash; you need to ask them first!

A **dancing exclamation mark** means this building wants to order.

> Walk toward the orange circle in front of it and press "take their order" on your phone, before you're too late!

{{< video url="video/7_how_to_take_orders" >}}

## Master Chef: Special stuff

**Cooldown:** pizzas automatically cool down when out of the oven. So do not take too long when delivering!

**Burned:** a pizza that is too hot will become black. It's useless from now on.

**Vehicles:** use vehicles to move way faster. When inside a vehicle, however, you cannot interact with anything.

**Money Penalty:** you get a (severe) money penalty for failing orders!

## Miscellaneous

I wrote an in-depth article series about servers, peer-to-peer networking, using Phaser for browser games and more! 

Check out: [How I Created Pizza Peers](/blog/videogames/the-peerful-project/pizza-peers)

This game is optimized for **local multiplayer** play: people within the same room using the same Wi-Fi network. It works flawlessly there. In any other setup, connections may fail or be delayed.

This game is **completely free**, no need to sign up, no adverts, no installation! It's just a tiny website.

This game is part of [The Peerful Project](https://pandaqi.com/the-peerful-project). It's a collection of innovative free local multiplayer games, using smartphones as controllers. Why is it called like that? Because the technology powering this system is called peer-to-peer :)

**If you like my work**, please support me by donating, buying any of my games or simply sharing my work!

The game is hosted on a free server (precisely because I earn no income from it). **It may go down any time.** Because of the way I designed the game, this should rarely be a problem. It just means that, occasionally, establishing your first connection with the server might take a few seconds longer.