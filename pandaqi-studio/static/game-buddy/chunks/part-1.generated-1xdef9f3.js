var e=[{id:"backgammon",text:`# backgammon.gamebuddy — two dice, one board, a match to five

[game]
name: Backgammon
players: 2
time: 30m
tags: board, dice, duel
icon: backgammon
source: Traditional game — no official source
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Set up the fifteen checkers on each side
- Agree a match length, or play a single game
- Put the doubling cube within reach
- Roll one die each to start; the higher roll moves first

[rules]
Race your checkers around and off the board before your opponent.
- Roll two dice and move one checker per die
- A point with two or more enemy checkers is blocked
- A lone checker is hit and goes to the bar, where it must re-enter
- Once all your checkers are home, bear them off
- Win the game, or the match at the agreed number of points

[tool dice]
roll: 2d6

[tool score]
mode: rounds
target: 5
win: highest
hint: five points takes the match

[tool rules]
quick: Bear off every checker first, and take five points for the match.
`},{id:"betrayal",text:`# betrayal.gamebuddy — explore the house, then someone turns

[game]
name: Betrayal at House on the Hill
players: 3-6
time: 60m
tags: board, rpg
icon: betrayal
source: https://www.hasbro.com/en-us/product/betrayal-at-house-on-the-hill
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Pick a character and set the trait trackers
- Shuffle the omen, event and item decks
- Put the ground floor tiles in reach
- Start everyone at the front door

[rules]
Explore the house until a haunt begins, then survive it.
- On your turn move, then draw the room's card or use the room
- Omens trigger a haunt roll; when it fails, one player becomes the traitor
- The haunt book gives each side its own goal, read privately
- Trait rolls use six dice, and each die shows 0, 1 or 2
- The haunt ends when one side completes its goal

[tool dice]
faces: 0, 1, 2
lab-count: 6

[tool turns]
phases: Move, Action, Haunt roll
pass: no

[tool lives]
mode: players
lives: 4
max: 8
step: 1
elimination: yes
`},{id:"chess-blitz",text:`# chess-blitz.gamebuddy — two clocks, one increment

[game]
name: Chess / Blitz
players: 2
time: 10-60m
tags: board, duel
icon: knight
source: https://www.fide.com/
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Set up the board with the queen on her own colour
- Agree on the time control, for example five minutes plus three seconds
- Decide who plays white
- Put the clocks where both players can reach them

[rules]
Standard chess. Checkmate wins; a flag fall loses on time.
- White moves first, then players alternate
- The clock only runs for the player to move
- Tap the clock to hand the turn over; the increment is added
- Resign, draw or checkmate ends the game

[tool timer]
mode: chess
duration: 5m
players: 2
increment: 3s
sound: bell
haptic: short
`},{id:"cluedo",text:`# cluedo.gamebuddy — cross off what you have ruled out

[game]
name: Cluedo
players: 2-6
time: 45m
tags: board, deduction, family
icon: cluedo
source: https://www.hasbro.com/en-us/product/clue
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Take one suspect, one weapon and one room out of their decks, unseen, for the envelope
- Shuffle each deck and deal the rest to the players
- Put every token on its starting space
- Give everyone a sheet to cross off

[rules]
Find the three cards in the envelope before anyone else.
- Roll and move; a room is the only place you may suggest
- Name a suspect, weapon and room, then ask each player in turn for one matching card, privately
- When you are ready, accuse all three out loud. A wrong accusation knocks you out
- The first correct accusation wins

[tool dice]
roll: 1d6

[tool turns]
phases: Move, Suggest, Accuse
pass: no

[notes]
Write what you have ruled out and who showed you which card. Private notes, shared phone.
`},{id:"darts",text:`# darts.gamebuddy — count down from 501 without busting

[game]
name: Darts
players: 2-8
time: 30m
tags: betting, party
icon: darts
source: Traditional game — no official source
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Agree the starting score, normally 501
- Agree whether you need a double to finish
- Agree the number of legs
- Throw one dart each to decide who starts
- Tap a score to type the whole throw at once

[rules]
Throw three darts, subtract the score and reach exactly zero.
- Each turn is three darts; write the total and take it off your score
- Going below zero, or hitting zero without the agreed double, is a bust: the turn scores nothing
- The first player to finish the leg wins it
- Play the agreed number of legs, best of three is usual

[tool lives]
mode: players
lives: 501
max: 501
step: 1
elimination: yes

[tool turns]
phases: Dart 1, Dart 2, Dart 3
pass: no
`},{id:"dnd-5e-combat",text:`# dnd-5e-combat.gamebuddy — initiative, hit points and dice macros

[game]
name: D&D 5e combat
players: 3-7
time: varies
tags: combat, rpg
icon: d20
source: https://dnd.wizards.com/
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Roll initiative for every combatant and write the order
- Note each character's maximum hit points
- Put the dice where everyone can reach them
- Agree on how long a turn may take

[rules]
Combat runs in rounds. Each turn has movement, one action and possibly a bonus action.
- Roll initiative once; highest goes first
- Attack, cast or dash as your action
- Track hit points and conditions here
- The fight ends when one side is down or flees

[tool turns]
phases: Action, Bonus action, Move, End
timer: 1m
pass: no
auto-start: no

[tool lives]
mode: players
lives: 30
max: 60
elimination: yes

[tool dice]
roll: 1d20
macros: attack=1d20+5, damage=2d6+3, save=1d20
`},{id:"dominoes",text:`# dominoes.gamebuddy — the draw pile is the deck

[game]
name: Dominoes
players: 2-4
time: 20m
tags: family, tile
icon: dominoes
source: Traditional game — no official source
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Shuffle the double-six set face down
- Deal seven tiles each, hidden
- Leave the rest as the draw pile, called the boneyard
- The highest double starts, or draw for it

[rules]
Match pips and empty your hand.
- On your turn, play a tile whose end matches an open end of the line
- If you cannot play, draw from the boneyard until you can, or pass
- A double is played across the line
- The first player out wins the round and scores the pips left in every other hand
- Play to 100 points

[tool decks]
deck: domino
players: 2
deal: 7
hidden: yes

[tool score]
mode: rounds
target: 100
win: highest
hint: 100 points takes the match

[tool turns]
phases: Draw, Play, Pass
pass: no
`},{id:"gloomhaven",text:`# gloomhaven.gamebuddy — initiative, hit points and loot

[game]
name: Gloomhaven
icon: gloomhaven
players: 1-4
time: 90m
tags: campaign, rpg
source: https://cephalofair.com/
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Pick a scenario and lay out the map tiles
- Place monsters and treasure as the scenario says
- Choose two ability cards per character
- Shuffle the monster ability deck

[rules]
A scenario is a series of rounds. Everyone picks two cards, then acts in initiative order.
- Track hit points with the lives tool
- Gold and experience go in the ledger as they are earned
- A short rest or long rest costs a turn
- Complete the scenario goal to win

[tool lives]
mode: players
lives: 10
max: 30
elimination: yes

[tool score]
mode: ledger

[tool turns]
phases: Initiative, Player, Monster, End
`},{id:"kitchen-rush-timers",text:`# kitchen-rush-timers.gamebuddy — one hourglass per cook

[game]
name: Kitchen Rush
icon: kitchen-rush
players: 2-4
time: 45m
tags: board, realtime
source: https://boardgamegeek.com/boardgame/224783/kitchen-rush
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Give every player an hourglass timer
- Shuffle the order deck and deal the opening orders
- Put the ingredients within reach of the whole table
- Start the shift together

[rules]
A realtime cooperative kitchen. Your hourglass is your worker.
- Flip your timer to take actions while it runs
- When it empties, you must stop and wait for someone to flip it again
- Complete orders before the shift ends
- Track coins and wasted ingredients in the counters tool

[tool timer]
mode: flip
duration: 90s
per-player: yes
players: 4
layout: grid
sound: bell
haptic: short

[tool counters]
counters: coins=0, wasted=0
bank: 0
`},{id:"mtg",text:`# mtg.gamebuddy — twenty life, poison and commander damage

[game]
name: Magic: the Gathering
icon: mtg
players: 2-4
time: 30m
tags: card, duel
source: https://magic.wizards.com/
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Shuffle your decks and draw seven cards
- Start at 20 life, or 40 in Commander
- Agree on mulligans and who plays first
- Keep a turn timer if the table tends to stall

[rules]
Cast spells, summon creatures and reduce your opponents to zero life.
- Life goes down and up; use the lives tool
- Poison counters and commander damage are tracked separately
- A player with ten poison counters loses
- Last player standing wins

[tool lives]
mode: players
lives: 20
max: 40
elimination: yes

[tool counters]
counters: poison=0, commander=0, treasures=0
bank: 0

[tool timer]
mode: countdown
duration: 2m
sound: bell
start: manual
`},{id:"poker-night",text:`# poker-night.gamebuddy — stacks, a pot and blind levels

[game]
name: Poker Night
players: 2-9
time: 180m
tags: betting, card
icon: poker
source: Traditional game — no official source
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Agree on a buy-in and give everyone the same starting stack
- Put the chip bank in the middle
- Set the blind level timer
- Deal for the button

[rules]
Texas Hold'em: two hole cards, five community cards, best hand wins the pot.
- Track each stack with a ledger entry; start everyone at the same number
- The shared bank holds the pot and the chips not in play
- Blind levels go up on the interval timer
- Blind bids record secret all-in amounts

[tool score]
mode: ledger
start: 1000
win: highest

[tool counters]
counters: pot=0
bank: 1000
denominations: 1, 5, 25, 100

[tool turns]
phases: Preflop, Flop, Turn, River, Showdown

[tool reveal]
mode: bid
min-bid: 0
max-bid: 10000

[tool timer]
mode: interval
interval: 15m
sound: bell
`},{id:"rummy",text:`# rummy.gamebuddy — meld sets and runs, and count the cards left in hand

[game]
name: Rummy
players: 2-6
time: 40m
tags: card, family
icon: rummy
source: Traditional game — no official source
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Shuffle a standard deck and deal to the table
- Turn one card face up for the discard pile
- Put the rest face down as the stock
- Agree the target score, 500 is usual

[rules]
Meld your cards into sets and runs, then go out before anyone else.
- A turn is draw one, then discard one
- A set is three or four of a kind; a run is three or more in one suit
- Lay melds down when you can, and add to the table's melds
- Go out by melding or discarding your last card, and score the cards still in other hands
- Face cards count ten, aces one or fifteen, and the first to the target wins

[tool decks cards]
deck: standard
# Seven each; some tables deal ten at two players, which Edit tools can change.
players: 2
deal: 7
hidden: yes

[tool score]
mode: rounds
target: 500
win: highest
hint: 500 points takes the game
`},{id:"scrabble",text:`# scrabble.gamebuddy — draw tiles, check words, keep the score

[game]
name: Scrabble
players: 2-4
time: 60m
tags: board, words
icon: scrabble
source: https://en.wikipedia.org/wiki/Scrabble
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Put every tile in the bag and mix them
- Each player draws seven tiles
- Place the board between you and agree on the dictionary
- The player who can form a word from their tiles starts

[rules]
Build words across the board; every letter has a value and premium squares multiply it.
- Draw back up to seven tiles after your turn
- Challenge a word if you think it is not allowed; the checking tool is a hint, not a referee
- The game ends when the bag is empty and one player uses their last tile
- Highest total wins

[tool bag tiles]
set: scrabble
draw: 7
tray: per-player

[tool words check]
profile: en
mode: check

[tool score]
mode: simple
win: highest
`},{id:"speedrun-practice",text:`# speedrun-practice.gamebuddy — segment times against your best

[game]
name: Speedrun Practice
players: 1
time: 30m
tags: speedrun, video-game
icon: speedrun
source: Generic practice route
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[rules]
Time each segment of a route and compare against your personal best.
- Space starts and splits, R resets the attempt
- Targets are your comparison until a run beats them
- Gold splits remember your fastest segment ever

[tool splits run]
game: Practice Route
category: Any%
splits: Opening | 45, Middle | 90, Boss | 60, Finale | 30
keys: yes
`},{id:"terraforming-mars",text:`# terraforming-mars.gamebuddy — every point on the final card

[game]
name: Terraforming Mars
players: 1-5
time: 120m
tags: board, engine, strategy
icon: terraforming-mars
source: https://fryxgames.se/product/terraforming-mars/
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Give everyone a corporation and a starting hand of project cards
- Set the three global parameters to their starting values
- Place the ocean, temperature and oxygen markers
- Agree the generation count

[rules]
Raise oxygen, temperature and oceans until Mars is habitable, and score the most points.
- Each generation you buy cards, play projects and run production
- Terraforming raises the global parameters and pays the player who did it
- Claim milestones and fund awards when you can afford them
- Add up terraform rating, cards, tiles, milestones and awards at the end
- Highest total wins

[tool score]
mode: categories
categories: terraform-rating=1, milestones=5, awards=5, cards=1, tiles=1, resources=1
win: highest
hint: 80 points usually wins

[tool turns]
phases: Research, Actions, Production
pass: no
`},{id:"trivia-night",text:`# trivia-night.gamebuddy — buzzers, a shot clock and a scorepad

[game]
name: Trivia Night
players: 2-20
time: 60m
tags: party, quiz
icon: trivia
source: Generic pub-quiz format
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Pick a quizmaster who does not score
- Split the room into teams and enter them in the score sheet
- Arm the buzzers and agree the points per round

[rules]
Ask a question, let the first buzz answer, and score each round.
- Arm the buzzers before reading the question; a false start hands the question over
- One point for a correct answer, bonus points for a themed round
- The team with the most points after the last round wins

[tool buzzer buzz]
players: 4
delay: 3s
false-start: yes

[tool timer shot]
mode: countdown
duration: 30s
warn-at: 10s
sound: buzzer

[tool score teams]
mode: rounds
rounds: 6
win: highest

[tool rules]
quick: Most points after six rounds wins.
`},{id:"yahtzee",text:`# yahtzee.gamebuddy — thirteen categories and five dice

[game]
name: Yahtzee
players: 2-6
time: 30m
tags: dice
icon: yahtzee
source: https://www.hasbro.com/en-us/product/yahtzee
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Give every player a score sheet and a pen
- Put five dice and the cup in the middle
- Agree on the order of play

[rules]
Roll up to three times, keeping any dice, then score one empty category.
- Upper section counts the matching faces; 63 or more is a 35 point bonus
- Lower section has three and four of a kind, full house, small and large straight, Yahtzee and chance
- The highest total after thirteen rounds wins

[tool dice]
roll: 5d6

[tool score]
mode: rounds
rounds: 13
win: highest
`},{id:"bidding-blocks",text:`# bidding-blocks.gamebuddy — bid between cards, then play out the challenges

[game]
name: Bidding Blocks
players: 3-6
time: 30m
tags: card, pandaqi, trick-taking
icon: bidding-blocks
source: https://pandaqi.com/bidding-blocks/
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Grab a pen and paper for the score
- Shuffle all cards into a single deck and pick the first dealer
- Plan for eight cards each; cards are dealt one at a time, with a chance to bid after every card
- Agree the target; the rulebook recommends 100 points

[rules]
Play out challenges to build a house together, but an early bid can bring it down.
- The dealer gives everyone one card, then anyone may bid on how many challenges they will win
- Write the bid and how many cards you held when you made it; a bid can't be changed
- Deal on until everyone has eight cards; the first bid was made with the least information and is divided by the smallest number
- The dealer starts each challenge, either together (everyone plays facedown, highest number of the dealer's type wins) or in turn (cards must fit on top, last card wins)
- An exact bid is worth 100 points, one off is worth 50, anything else 0, all divided by the cards you held when bidding and rounded
- The rulebook recommends 100 points for the evening; the first player to reach it wins

[tool score]
mode: rounds
win: highest
target: 100
hint: 100 for an exact bid, 50 if off by one, divided by the cards you held when you bid
`},{id:"captain-flip",text:`# captain-flip.gamebuddy — one flip, one action, one score pile

[game]
name: Captain Flip
players: 2-6
time: 30m
tags: memory, pandaqi, tile
icon: captain-flip
source: https://pandaqi.com/captain-flip/
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Shuffle the tile deck and lay a 5x5 grid facedown
- Turn the two main diagonals faceup
- For an easier game, use a 4x4 grid
- Keep the deck and a score pile within reach

[rules]
Flip one tile on your turn and use the action on the side you turned up.
- A heart action triggers when a tile turns faceup; a skull action when it turns facedown
- Score a facedown tile by taking it to your score pile, then refill the gap faceup
- You cannot score the tile you just flipped unless an action says so
- A fully faceup row or column clears and refills with facedown tiles
- The game ends when the map is empty; add the values of the tiles you scored
- Highest score wins
- The rulebook's expansions add colour patterns, negative types and a three-tile hand

[tool score]
mode: simple
win: highest
hint: Add the value of every tile in your score pile
`},{id:"feed-the-beast",text:`# feed-the-beast.gamebuddy — empty your food storage first

[game]
name: Feed the Beast
players: 2-6
time: 30m
tags: board, family, pandaqi
icon: feed-the-beast
source: https://pandaqi.com/feed-the-beast/
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Pick a beast and place it faceup in the centre; start with a level 1 beast
- Shuffle the Tier 1 food (one dot on each side) and deal 10 to each player
- Shuffle the menu cards, place one next to the beast, and lay 4 more faceup as the market
- Put the rest of the food supply within reach

[rules]
Keep the beast satisfied with apples, pie and bread, and be the first to empty your food storage.
- On your turn, place one food token on the beast
- If it is part of the menu, take the reward or upgrade one of your food tokens
- If it is not, you paid the wrong food: downgrade one food and draw a new Tier 1 food
- A higher tier can stand in for any lower tier
- At 10 food on the beast, it resets: swap in a new menu from the market and clear the food
- If you end your turn with no food, you win at once
- The game's page has the rulebook and every beast
`},{id:"fiddlefoo",text:`# fiddlefoo.gamebuddy — open a range, let the others throw their music in

[game]
name: Fiddlefoo
players: 2-6
time: 30m
tags: card, family, pandaqi
icon: fiddlefoo
source: https://pandaqi.com/fiddlefoo/
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Place one random card of each colour in a 2x2 square: the start of the shared map
- Shuffle the rest into a draw pile
- Deal each player 8 cards
- Agree who plays first

[rules]
Empty your hand without letting the others throw their music at you.
- On your turn, add one card to the map; it must connect, share a row (horizontal, vertical or diagonal) with another card of its colour, and not sit next to one of that colour
- Each new pair sets a number range and a music-note difference
- Everyone may then give you cards of that colour whose number is inside the range, or cards with that note difference
- The cards you receive go into your hand; if you end your turn with none, the game ends and you win
- At the end, the music notes left in each hand are negative points; play several games and the least negative total wins
- This sheet counts the notes left and treats the lowest total as best

[tool turns]
phases: Play, Pairs, Throw in

[tool score]
mode: rounds
win: lowest
hint: 0 (an empty hand); enter the music notes left in each hand
`},{id:"keebble-games",text:`# keebble-games.gamebuddy — word games on one sheet of paper

[game]
name: Keebble Games
players: 2-6
time: 20-60m
tags: pandaqi, paper, words
icon: keebble-games
source: https://pandaqi.com/keebble-games/
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Fold a blank sheet in half six times to make 64 cells, or print a generated starting board
- Each player claims one edge cell as their letter hand and grabs a pen
- Agree the word direction and the dictionary before the first word
- For Domino, print the domino set; for Knickknack, bring one phone with internet

[rules]
Scrabble-like word games played on one sheet of paper, with no tiles to lose.
- Keebble: play a word on the grid using letters from your hand, following Scrabble placement
- Vowels score 1, consonants 3, and a letter nobody else holds scores 5
- Then call two letters; every other player takes one or draws a wall on an empty edge
- The hand limit is 7; once 10 edge cells hold letters, only play words; the game ends when someone runs out
- Keebble: Domino uses dominoes printed with an ambigram font, so each tile reads as several letters (2-6, 40m)
- Keebble: Knickknack runs the board and extras in a phone app and needs internet (2-5, 60m)
- Only base Keebble is pure paper; the other two need their own material
- Highest score wins

[tool words]
profile: en
mode: check

[tool score]
mode: simple
win: highest
hint: Add each word as it scores; the highest total wins
`},{id:"magnetmen",text:`# magnetmen.gamebuddy — collect icons before they repel you

[game]
name: Magnetmen
players: 2-4
time: 20m
tags: pandaqi, paper, puzzle
icon: magnetmen
source: https://pandaqi.com/magnetmen/
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Print one game board per player and hand out pens
- Each player picks one inventory at the edge of the board
- Keep the board where everyone can reach it

[rules]
Collect Magnetmen while their growing repulsion cuts off the board around you.
- On your turn, pick an unused square, cross it out and draw its icon in an empty inventory slot
- The more copies you hold of an icon, the more squares around it you may not collect
- One copy blocks horizontal neighbours; two blocks horizontal and vertical; three or more blocks all eight neighbours
- A full inventory means no more turns
- The game ends when nobody can move; add the values of all collected Magnetmen
- Highest score wins
- Advanced rules add a destroy action and stop you at four copies of one icon

[tool score]
mode: simple
win: highest
hint: Add the printed value of every Magnetman you collected
`},{id:"mammoth-messages",text:`# mammoth-messages.gamebuddy — two words, cave drawings, sixty seconds

[game]
name: Mammoth Messages
players: 2-8
time: 30m
tags: cooperative, drawing, pandaqi, party
icon: mammoth-messages
source: https://pandaqi.com/mammoth-messages/
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Print the word tiles, cave drawings and choice tiles
- Draw one word tile and show its ten numbered words
- Draw ten cave drawings and one choice tile
- The choice tile names two words by number and colour
- Keep the rest of the decks within reach for the next turn

[rules]
Communicate two secret words using only cave drawings, while the table guesses.
- The choice tile gives one number and one colour; those are your two words
- You may reveal up to five cave drawings, in any arrangement, and may not move them once placed
- Start the 60-second timer; no words, gestures or other hints
- The others say and tap both words; both correct scores 10 points minus the drawings you revealed
- A wrong guess or an expired timer scores 0 for that turn
- Play 10 rounds and add the table's points; the group is trying for the highest shared total
- If number and colour point to the same word, communicate that single word and win on the first matching guess

[tool timer]
mode: countdown
duration: 60s
start: manual
sound: bell

[tool counters]
mode: count
counters: Points=0
step: 1
`},{id:"maybe-games",text:`# maybe-games.gamebuddy — one proposal, everyone votes at once

[game]
name: Maybe Games
players: 3-6
time: 30-60m
tags: pandaqi, party, voting
icon: maybe-games
source: https://pandaqi.com/maybe-games/
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Pick one of the three games and print its material
- Maybe Movies and Maybe Missions: build the vote deck (5 yes and 5 no per player), deal 10 each, and redeal a hand that is all one kind
- Maybe Minister: deal 5 cards each and give everyone a Support card with 2 votes on it
- Lay out that game's faceup market if it has one, and read its rulebook before the first proposal
- Agree who proposes first

[rules]
Every game here runs on the Maybe Mechanic: one player proposes, everyone votes yes or no at the same time, and the result pays some players and costs others.
- Maybe Movies (3-6): pitch a film from the market; yes votes pay its budget, no votes sink it, and a successful film pays the yes voters
- Maybe Missions (3-6): prepare a mission; the majority decides success, and every yes voter collects a card, green on success, red on failure
- Maybe Minister (3-6): propose laws; accepted laws become scoring rules, and the first player to 25 points wins
- Votes are secret: pick your card, then reveal together. The ballot below records the direction; the number on your card is what counts
- Maybe Movies and Maybe Missions end when the votes run out; the highest total wins
- The series page has every rulebook and the printable material

[tool turns]
phases: Propose, Vote, Resolve

[tool reveal]
mode: ballot
ballot: Yes or no?
options: Yes, No

[tool score]
mode: simple
win: highest
hint: 25 for Maybe Minister; the other two end when the votes run out
`},{id:"waterfall",text:`# waterfall.gamebuddy — fall down the waterfall for gemstones

[game]
name: Waterfall
players: 2-6
time: 30m
tags: pandaqi, push-your-luck, tile
icon: waterfall
source: https://pandaqi.com/waterfall/
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Place one add (+) tile faceup to start the waterfall
- Give every player 4 tiles and 1 pawn; place each pawn above the waterfall
- Put the rest of the tiles facedown as the draw pile

[rules]
Build the waterfall downward, then fall as far as your cards let you to collect gemstones.
- On your turn, play any number of hand cards; their numbers sum to the spaces you may fall
- For each space, choose down-left or down-right and execute the tile you land on
- An empty space means you exit the waterfall and reset to the top
- Score actions let you bank hand tiles whose gemstone matches your path
- You may not enter an occupied tile unless both choices are blocked
- The game ends at 20 or more waterfall tiles, or when the deck runs out
- Add the values of your scored tiles; highest score wins

[tool score]
mode: simple
win: highest
hint: Add the numbers on the tiles in your score pile
`}];export{e as templateTexts};
