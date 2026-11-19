var e=[{id:"azul",text:`# azul.gamebuddy — draft tiles, fill a wall

[game]
name: Azul
icon: azul
players: 2-4
time: 40m
tags: board, puzzle
source: https://boardgamegeek.com/boardgame/230802/azul
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Give every player a player board
- Fill the round factory displays with four tiles each
- Put the first player marker in the middle
- Shuffle the bag

[rules]
Take tiles from a factory, place them on a pattern line, then score when the line completes.
- A completed line scores its tile and every connected tile on the wall
- Floor tiles cost points
- The game ends when a player completes a row
- Add end-of-game bonuses; the highest total wins

[tool score]
mode: ledger
win: highest
`},{id:"boggle",text:`# boggle.gamebuddy — three minutes, then compare lists

[game]
name: Boggle
players: 2-8
time: 15m
tags: party, words
icon: boggle
source: https://en.wikipedia.org/wiki/Boggle
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Shake the letter dice and set the tray
- Give everyone paper or use the score tool in rounds
- Agree that only words of three letters or more count

[rules]
Find as many words as you can in the grid before the timer runs out.
- Words must join neighbouring letters and may not reuse a die
- Write your list, then read it out; crossed words score nothing
- Short words are worth one point, longer words more
- Highest score after the agreed number of rounds wins

[tool timer round]
mode: countdown
duration: 3m
sound: bell
warn-at: 20s

[tool words check]
profile: en
mode: filters

[tool score]
mode: rounds
rounds: 3
win: highest
`},{id:"carcassonne",text:`# carcassonne.gamebuddy — tile by tile, point by point

[game]
name: Carcassonne
players: 2-5
time: 45m
tags: board, strategy, tile
icon: carcassonne
source: https://www.zmangames.com/en/games/carcassonne/
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Shuffle the land tiles and split them into a few face-down stacks
- Give every player their eight meeples
- Place the starting tile in the middle
- Agree who draws first

[rules]
Build a walled city, one tile at a time, and score the features you finish.
- Draw a tile and match its edges to the tiles already on the table
- You may place one meeple on the feature you just extended
- Close a city, road or monastery to score it and take the meeple back
- Fields score at the end for the farmers who stay on them
- Highest total when the tiles run out wins

[tool score]
mode: simple
win: highest
hint: 80 points is a strong game

[tool turns]
phases: Place tile, Place meeple, Score
pass: no
`},{id:"decrypto",text:`# decrypto.gamebuddy — clues, interceptions and a two minute clock

[game]
name: Decrypto
icon: decrypto
players: 3-8
time: 30m
tags: deduction, party
source: https://www.scorpionmasque.com/
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Split into two teams and sit so each team shares a screen
- Deal four keyword cards to each team
- Give each team a code card and a pen
- Put the interception tokens where both teams can reach them

[rules]
Give clues that point at your keywords without giving them away.
- The clue giver writes a three number code, then says three clues
- Their team guesses which keyword matches each number
- The other team may try to intercept the code
- Two interceptions or two miscommunications end the game; log tokens per team here

[tool timer]
mode: countdown
duration: 2m
sound: bell
start: manual

[tool score]
mode: ledger
win: lowest

[tool reveal]
mode: ballot
ballot: Did the other team intercept?
options: Intercepted, Missed
`},{id:"dixit",text:`# dixit.gamebuddy — one sentence, six pictures, one guess

[game]
name: Dixit
icon: dixit
players: 3-6
time: 30m
tags: card, party
source: https://www.libellud.com/
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Deal six cards to each player
- Give every player a voting dial or tokens
- Shuffle the rest of the deck as the draw pile

[rules]
The storyteller says a sentence about a card, everyone else adds a card, then the table votes.
- Score three points if your card is guessed
- The storyteller scores if some but not all players guess their card
- Everyone who votes for the storyteller's card scores too
- First to 30 points wins

[tool score]
mode: simple
target: 30
win: highest

[tool reveal]
mode: ballot
ballot: Was the storyteller found?
options: Found, Missed
`},{id:"king-of-tokyo",text:`# king-of-tokyo.gamebuddy — six dice, ten lives, twenty points

[game]
name: King of Tokyo
players: 2-6
time: 30m
tags: board, dice, family
icon: king-of-tokyo
source: https://www.ienjoygames.com/
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Give every player a monster board and set its life to ten
- Shuffle the power cards and lay out three
- Put the victory point markers in reach
- The first monster in Tokyo takes the city

[rules]
Roll three times, keep the dice you like, and be the last monster standing or reach twenty points.
- Claws hurt the monsters in Tokyo; a monster in Tokyo hurts everyone outside
- A monster in Tokyo cannot heal while it stays there
- Hearts heal, energy buys power cards, and numbers score victory points
- Twenty points wins at once; losing your last life leaves the game
- Track life per player here, points in the scorepad

[tool lives]
mode: players
lives: 10
max: 10
step: 1
elimination: yes

[tool dice]
pool: 6d6

[tool score]
mode: simple
target: 20
win: highest
`},{id:"mario-kart-night",text:`# mario-kart-night.gamebuddy — four races, one cup

[game]
name: Mario Kart Night
players: 2-8
time: 60m
tags: tournament, video-game
icon: wheel
source: Fan-made helper; Mario Kart is a trademark of Nintendo
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Agree the number of races and the points for each finishing place
- Draw the cup with the bracket tool, or skip it for a simple points night
- Set up controllers and pick the first track

[rules]
Score points each race and crown a cup winner.
- Write each player's points per race in the score sheet
- Optional cup: a single-elimination bracket for a knockout evening
- Highest total after the last race wins

[tool score cup]
mode: rounds
rounds: 4
win: highest
hint: 40 points usually wins a four-race cup

[tool bracket knockout]
format: single
best-of: 1
seeding: random

[tool rules]
quick: Most points after four races wins the cup.
`},{id:"monikers",text:`# monikers.gamebuddy — the same clues, three times worse

[game]
name: Monikers
players: 4-12
time: 45m
tags: guessing, party, realtime
icon: monikers
source: https://www.monikersgame.com/
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Split into two teams
- Put a stack of name cards in the middle
- Agree the round length, one minute is usual
- Give the first team a timer and a score slot

[rules]
Get your team to guess as many names as you can, three rounds in a row.
- Round one: say anything except the name
- Round two: one word only
- Round three: no words at all, just act it out
- Every correct guess is a point, and the same cards keep coming back
- Highest total after three rounds wins

[tool timer]
mode: countdown
duration: 1m
warn-at: 15s
sound: buzzer

[tool score]
mode: rounds
rounds: 3
win: highest
hint: 20 points a round is a strong pace
`},{id:"seven-wonders",text:`# seven-wonders.gamebuddy — seven kinds of points

[game]
name: 7 Wonders
icon: seven-wonders
players: 3-7
time: 45m
tags: board, strategy
source: https://www.rprod.com/
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Deal a wonder board and three coins to each player
- Shuffle the three age decks separately
- Put the military conflict tokens within reach

[rules]
Three ages of card drafting. Every card is played, sold or used to build a wonder.
- Military wins beat neighbours
- Science sets score by their combinations
- Coins, civilian buildings, commerce and guilds all add points
- Add up everything at the end; the highest total wins

[tool score]
mode: ledger
win: highest
`},{id:"spades",text:`# spades.gamebuddy — bid your tricks, then take them

[game]
name: Spades
players: 4
time: 45m
tags: card, trick-taking, family
icon: spades
source: Traditional game — no official source
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Sit opposite your partner and deal thirteen cards each
- Agree the target score, 500 is usual
- Agree whether a nil bid is worth 100 or 50
- The player left of the dealer leads the first trick

[rules]
Two partnerships bid the tricks they will take, and spades are always trump.
- Each player bids a number of tricks before the first card
- Follow suit if you can; spades may be led only once they are broken
- A made contract scores ten points a trick, plus one for each overtrick
- A missed contract costs ten points a trick, and bags can cost a penalty later
- First partnership to the target wins

[tool decks deal]
deck: standard
players: 4
deal: 13
hidden: yes

[tool score]
mode: rounds
target: 500
win: highest
hint: 500 takes the game; a missed bid costs ten a trick

[tool turns]
phases: Bid, Play, Score
pass: no
`},{id:"the-mind",text:`# the-mind.gamebuddy — play the cards in order without talking

[game]
name: The Mind
icon: the-mind
players: 2-4
time: 20m
tags: cooperative, party
source: https://www.pandasaurusgames.com/
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Shuffle the deck of 1 to 100 cards
- Deal one card per player for level one
- Put the lives and throwing stars in the middle
- Agree that nobody may talk about their cards

[rules]
Everyone holds numbered cards. Play them in ascending order without speaking.
- Any card played out of order costs a life
- Clear the level and deal one more card per player
- A throwing star lets the table discard the lowest card
- Lose all lives and the run ends; track them here

[tool lives]
mode: shared
lives: 3
max: 5
step: 1
elimination: yes

[tool counters]
counters: shurikens=1
bank: 0
`},{id:"uno",text:`# uno.gamebuddy — a digital deck when the real one went missing

[game]
name: Uno
players: 2-10
time: 30m
tags: card, family
icon: uno
source: https://en.wikipedia.org/wiki/Uno_(card_game)
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Shuffle the deck and deal seven cards each, hidden
- Turn one card to start the discard pile
- Agree whether stacking draw cards is allowed

[rules]
Match the top card by colour or number, and empty your hand first.
- Play one card, then draw if you cannot
- Skip, reverse and draw cards do what they say
- Call a colour when you play a wild card
- The first player with no cards left wins the round

[tool decks cards]
deck: uno
decks: 1
players: 2
deal: 7
hidden: yes

[tool score]
mode: rounds
rounds: 5
win: lowest

[tool rules]
quick: Empty your hand first.
`},{id:"warhammer-40k",text:`# warhammer-40k.gamebuddy — phases, command points and a lot of dice

[game]
name: Warhammer 40,000
players: 2
time: 180m
tags: dice, strategy, war
icon: warhammer-40k
source: https://www.warhammer.com/
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Agree the points limit and build both armies
- Set up terrain, then deploy in the agreed pattern
- Write down command points, wounds and objectives
- Roll for first turn

[rules]
Score objectives over five battle rounds while your army survives.
- Each round has a command phase, movement, shooting, charge and fight
- Roll a pool of dice to hit, wound and save; the modifiers on your datasheet decide the rest
- Command points pay for stratagems; keep the total visible
- Hold objectives at the end of your turn to score primary points
- The highest total after the last round wins

[tool turns]
phases: Command, Movement, Shooting, Charge, Fight
pass: no

[tool dice]
pool: 10d6
roll: 1d6

[tool lives]
mode: players
lives: 10
max: 20
step: 1
elimination: no
`},{id:"firecrackers",text:`# firecrackers.gamebuddy — push your luck, then build a better deck

[game]
name: Firecrackers
players: 2-10
time: 60m
tags: card, deck-building, pandaqi, push-your-luck
icon: firecrackers
source: https://pandaqi.com/firecrackers/
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Build the deck: all black cards plus one coloured set per player
- Give each player a starting deck of one card from each of three colours and two black cards
- Shuffle each starting deck and place it facedown
- Lay the remaining cards faceup in the shop, one pile per colour and one for cards without actions

[rules]
Reveal cards to earn coins, stop before a colour explodes, and build a more valuable deck.
- On your turn, reveal the top card of your deck or stop
- Resolve any action, then add the numbers of revealed cards of the same colour
- A colour total of 10 or more explodes and takes you out of the round
- When you stop, every revealed card is worth 1 coin; buy cards from the shop into your discard
- The round ends when everyone has stopped or exploded; the last player left becomes Firemaster
- The game ends after the round in which the shop runs out
- Add the numbers of all cards in your deck, including purchases; highest score wins

[tool score]
mode: simple
win: highest
hint: Add the numbers of every card in your final deck
`},{id:"luck-legends",text:`# luck-legends.gamebuddy — cards that behave like dice

[game]
name: The Luck Legends
players: 2-8
time: 30m
tags: dice, pandaqi, strategy
icon: luck-legends
source: https://pandaqi.com/the-luck-legends/
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Pick one game from the series and print its material
- Read that game's own rulebook before the first roll; the seven games play differently
- Shuffle the cards that stand in for the dice
- Keep a pen and paper nearby only if the rulebook you chose asks for a score

[rules]
A series of games where a shuffled deck stands in for the dice.
- A roll is a shuffle and the top card, so the deck is the die
- You can customise a die by adding or removing cards, and choose how you draw
- Each game has its own ending and its own win condition:
- Champions of Chance (3-6): the first player out of cards wins
- A Little White Die (2-6): the most cards when someone runs out, or the last player holding cards
- Lucky Lions (3-6): the first to 10 points
- Tossing Tiger, Rolling Dragon (2-6): the most cards when someone drops below 2
- Folly & Fortune (2-6): the most health when every hand is empty
- Chaos Contract (2-5): the first to 6 contracts
- Deceptidice (2-8): the most cards left when someone is down to 3
- The series page lists every title, its rulebook and the material
`},{id:"mapped-out",text:`# mapped-out.gamebuddy — build the map around the route you were dealt

[game]
name: Mapped Out
players: 2-5
time: 30m
tags: board, pandaqi, tile
icon: mapped-out
source: https://pandaqi.com/mapped-out/
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Deal each player 8 random movement cards, facedown in a row; nobody looks at them
- Give each player a pawn and 5 map tiles for their hand
- Place a random starting tile in the centre and put every pawn on it
- Agree who plays the first tile

[rules]
Design the treasure map so the route you were dealt is worth the most at the end.
- On your turn, play one map tile from your hand onto the shared map
- The tile's place action then resolves: reveal a movement card, swap one with another, or study several (yours or another player's)
- Draw a new tile; the map phase ends when someone has revealed all eight of their movement cards, or the tiles run out
- Then walk your row of cards left to right and find the fish type you visited most; repeat visits don't count
- Each fish of that type scores 1 point; highest score wins
- The game's page has the rulebook and a generator for your own material

[tool score]
mode: simple
win: highest
hint: 1 point per fish of the type you visited most

[tool turns]
phases: Play tile, Place action, Draw
`}];export{e as templateTexts};
