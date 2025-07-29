---
draft: true

title: "Hack Battle"
blurb: "Crack a network of wires and logic gates to find the password faster than your friend(s), or the in-game timer."

googleFonts: "https://fonts.googleapis.com/css2?family=Nova+Flat&display=swap"

date: 2022-03-30

categories: ["game"]
tags: ["desktop", "one_week_game", "logic", "abstract", "duel"]

externalLinks:
  - label: "Download"
    url: "http://pandaqi.itch.io/hack-battle"
    platforms: ["windows", "mac", "linux"]
    price: 0 
  - label: "Download"
    url: "http://pandaqi.itch.io/hack-battle"
    platforms: ["android"]
    price: 0

multiplayertype: 'offline'
multiplayermode: 'competitive'
price: 0
platform: ["windows", "mac", "linux", "android"]
language: EN
genre: ["puzzle"]
playtime: 5
playercount: [1,2,3,4]
input: ["controller", "keyboard", "mouse", "touch"]

---

{{% content/embed-video src="https://www.youtube.com/embed/OorjwESxxZ4" %}}

Solve codes. Before the timer runs out, or before your friend solves theirs.

## What?

Blocks and wires create a network. Wires start with a signal (ON or OFF), go through the network, until they end in password blocks. 

Your task? Figure out the password by deducing what the signals are at the end.

But those blocks aren't just for show. They take their input, do something with it, then output that to their output wires.

Maybe they invert it: ON becomes OFF, or vice versa. 

Maybe they ignore everything but the first signal.

The rules are always simple. But once a signal passes 2, 3, 5, 10 blocks ... cracking the code becomes a tough job.

@TODO: IMAGE?

## Three Flavors

Pick your poison:
* **ON/OFF**: Signals can only be on or off. (Easy)
* **SHAPES**: Signals are a shape out of five options. (Medium)
* **NUMBERS**: Signals contain a number 0-9. (Hard)

The game is identical. But 90% of the blocks will be different! And increasing the number of options for the signal greatly increases the difficulty.

@TODO: IMAGE?

## How To Play?

This game ... 

* Supports **1-4 players** (on the same device)
* Is playable on **Desktop** (Windows, Mac, Linux) and **Mobile** (Android only)
* Can be played with **touchscreen, mouse, or keyboard**. (Tap a password block to change your guess. Or press a key.)
* Has tools to help you on **lower difficulties**, such as clicking on wires to save what signal you think it has.
* Is a **very tough logic puzzle**. Easy to learn, yes, but don't expect it to be kind to you. That's why it's most fun playing against someone else, instead of the in-game timer, as then it's just a battle of wits.
The mobile version is supported by ads. The desktop version is completely free, but if you enjoyed it, consider donating to support more of these games!

## Anything Else?

This was my second "weekend project". It turned out so promising that I wanted to make the three flavors and worked on it much longer.

* Font? Nova Flat, available on Google Fonts.
* Software? Godot Engine 4.
* Everything else? My own work.

Bugs, improvements, feedback always welcome: [schoolofpanda@gmail.com](mailto:schoolofpanda@gmail.com)

Or read the devlog about how this game was made: [[Devlog] Hack Battle](/blog/videogames/one-week-games/devlog-hack-battle) (on Pandaqi Blog)
