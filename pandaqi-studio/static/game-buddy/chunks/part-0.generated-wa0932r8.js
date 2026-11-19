var e=[{id:"bananagrams",text:`# bananagrams.gamebuddy — a shared pile of letters and one race

[game]
name: Bananagrams
icon: bananagrams
players: 2-8
time: 15m
tags: realtime, words
source: https://en.wikipedia.org/wiki/Bananagrams
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Tip every tile face down in the middle and mix
- Everyone takes their starting tiles
- Agree who calls the start

[rules]
Everyone builds their own word grid at the same time from the shared pile.
- Start together; take a new tile whenever you need one
- When the pile is empty, call it and everyone checks their grid
- A valid grid uses all your tiles in one connected crossword
- First valid grid wins the round

[tool bag pile]
set: bananagrams
draw: 21
tray: per-player

[tool timer race]
mode: countdown
duration: 5m
sound: buzzer
warn-at: 30s

[tool words check]
profile: en
mode: check

[tool score]
mode: rounds
rounds: 3
win: highest
`},{id:"cascadia",text:`# cascadia.gamebuddy — habitat, wildlife and twenty turns

[game]
name: Cascadia
players: 1-4
time: 45m
tags: board, puzzle, strategy
icon: cascadia
source: https://www.alderac.com/cascadia/
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Give every player a starter habitat tile, three hexes, face up
- Put the wildlife tokens in the bag and shake it well
- Lay out four habitat tiles, paired with four wildlife tokens
- Put the nature tokens nearby; the game runs twenty turns each

[rules]
Draft a habitat tile and a wildlife token, place both, and score five habitats and five species at the end.
- A turn is take one pair, then place the tile and the animal
- An animal cannot share a tile, and once placed it stays
- The right animal on a keystone tile, marked by a pinecone, earns a nature token
- Spend a nature token to take any tile with any animal, or to draw fresh animals
- After twenty turns each, add habitats, wildlife and bonuses

[tool turns]
phases: Draft, Place, Score
pass: no

[tool score]
mode: ledger
win: highest
hint: 100 points is a strong game
`},{id:"catan",text:`# catan.gamebuddy — victory points on the table, not on scrap paper

[game]
name: Catan
players: 3-4
time: 90m
tags: board, strategy
icon: catan
source: https://www.catan.com/
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Shuffle the hexes, ring the board with sea and place the desert
- Shuffle the number tokens onto the hexes in order
- Place one settlement and road per player in turn, then a second pair in reverse
- Take the starting resources from the second settlement

[rules]
Race to 10 victory points. Settlements are 1 point, cities 2, longest road and largest army 2 each, and a few development cards add a point.
- Roll for resources, trade, then build
- The first player to reach 10 points on their own turn wins
- Track the counts here; the totals follow the category points

[tool score]
mode: categories
categories: settlements=1, cities=2, longest-road=2, largest-army=2, cards=1
target: 10
win: highest
`},{id:"charades",text:`# charades.gamebuddy — sixty seconds, no words

[game]
name: Charades
players: 4-16
time: 30m
tags: drawing, guessing, party, realtime
icon: charades
source: Traditional game — no official source
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Split into two teams
- Agree whether you act, draw or describe
- Agree the round length, one minute is usual
- Write a pile of words both teams can see

[rules]
Get your team to say the word without saying it yourself.
- One player guesses at a time; the rest of the team shouts answers
- No words, no letters and no pointing at the answer
- Each correct guess scores a point
- Pass on a word if it is hopeless, usually for a small penalty
- Highest score when the rounds are done wins

[tool timer]
mode: countdown
duration: 1m
warn-at: 15s
sound: buzzer

[tool score]
mode: rounds
target: 30
win: highest
hint: 30 points is a good night

[tool turns]
phases: Act, Guess, Score
pass: no
`},{id:"codenames",text:`# codenames.gamebuddy — a 5x5 board with a hidden key

[game]
name: Codenames
players: 4-8
time: 20m
tags: party, words
icon: codenames
source: https://boardgamegeek.com/boardgame/178900/codenames
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Split into two teams and pick one spymaster per team
- Generate a board; the spymaster peeks at the key privately
- Place the red and blue agent cards if you have them, or track guesses here

[rules]
Two spymasters know which words belong to which team; everyone else guesses.
- A clue is one word and one number
- Guess up to that many words; stop whenever you like
- An innocent bystander ends your turn and the assassin loses the game
- Clear all your team's words to win
- Mark each word as it is guessed, and count the cards each team has left here

[tool words board]
profile: en
mode: codenames

[tool timer turn]
mode: countdown
duration: 2m
warn-at: 20s
sound: bell

[tool counters]
mode: count
counters: red-left=9, blue-left=8
step: 1
`},{id:"exploding-kittens",text:`# exploding-kittens.gamebuddy — draw, defuse, survive

[game]
name: Exploding Kittens
players: 2-5
time: 15m
tags: card, party
icon: kitten
source: https://boardgamegeek.com/boardgame/172225/exploding-kittens
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Shuffle the deck and deal five cards each, hidden
- Agree the number of defuse cards in play
- The youngest player starts

[rules]
Take turns drawing cards. Draw an exploding kitten and you are out, unless you defuse it.
- Play any number of cards, then draw one
- Defuse, then put the kitten back anywhere in the deck
- Survive to the end to win

[tool decks deck]
deck: standard
decks: 1
jokers: 2
players: 2
deal: 5
hidden: yes

[tool score]
mode: simple
win: highest

[tool rules]
quick: Do not draw the kitten.
`},{id:"farkle",text:`# farkle.gamebuddy — roll six, keep the good ones, know when to stop

[game]
name: Farkle
players: 2-6
time: 30m
tags: dice, party, push-your-luck
icon: farkle
source: Traditional game — no official source
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Give everyone a pen and a score slot
- Agree the target, 10,000 is usual
- Agree the bonus for six of a kind
- Roll to see who starts

[rules]
Bank points, but roll again only if you dare.
- Roll six dice and set aside at least one scoring die
- Three of a kind, a straight, three pairs and a six-die run all score
- Roll the rest; a roll with no scoring die is a farkle and loses the turn's points
- Stop and bank, or push on for more
- First to 10,000 wins

[tool dice]
roll: 6d6

[tool score]
mode: rounds
target: 10000
win: highest
hint: 10,000 ends the game; the highest score wins
`},{id:"hearts",text:`# hearts.gamebuddy — avoid every heart, and the queen

[game]
name: Hearts
players: 3-6
time: 45m
tags: card, trick-taking
icon: hearts
source: Traditional game — no official source
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Deal the whole deck evenly
- Agree whether to pass cards before each round
- The player with the two of clubs leads first
- Write every player on the scorepad

[rules]
Take as few hearts as you can; the queen of spades is thirteen points.
- Follow suit if you can; the highest card of the led suit takes the trick
- Hearts may not be led until they have been broken
- Every heart is one point and the queen of spades is thirteen
- Shooting the moon gives you zero and everyone else 26
- The lowest score when someone reaches 100 wins

[tool decks]
deck: standard
# 17 each at three, 13 at four, 10 at five and 8 at six.
players: 3
deal: 17
hidden: yes

[tool score]
mode: rounds
target: 100
win: lowest
hint: 100 ends the game, and the lowest score wins
`},{id:"jackbox-night",text:`# jackbox-night.gamebuddy — one screen, everyone's phone

[game]
name: Jackbox Night
players: 2-8
time: 45m
tags: party, video-game
icon: jackbox
source: https://www.jackboxgames.com/
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Put the big screen where everyone can see it
- Everyone joins the room code on their own phone
- Pick the pack and the first game
- Agree a points goal or play a fixed number of games

[rules]
Play a run of party games and keep one score for the night.
- Each Jackbox game scores its own way; write each player's total per game
- The host reads the room code and starts the next game
- Ban phones only for the games that ask for it
- Highest running total at the end wins the night

[tool score]
mode: rounds
rounds: 5
win: highest
hint: five games makes a full night

[tool timer]
mode: interval
interval: 20m
sound: bell
`},{id:"love-letter",text:`# love-letter.gamebuddy — tokens of affection, one card in hand

[game]
name: Love Letter
icon: love-letter
players: 2-4
time: 20m
tags: card, deduction
source: https://www.zmangames.com/
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Shuffle the sixteen card deck and remove one card face down
- Deal one card to each player
- Put the remaining cards face down as the draw pile
- Give the first player the tokens of affection

[rules]
Draw one card, play one card, knock players out until one is left.
- Each card has a number and an effect; guards guess a card
- The last player in the round wins a token of affection
- Play until someone has four tokens
- Add a point per round win here

[tool score]
mode: simple
target: 4
win: highest
`},{id:"monopoly",text:`# monopoly.gamebuddy — cash on the ledger, pieces in the bank

[game]
name: Monopoly
players: 2-6
time: 120m
tags: board, family
icon: monopoly
source: https://www.hasbro.com/en-us/product/monopoly
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Give every player 1500 in cash
- Shuffle the chance and community chest decks
- Put the houses and hotels in the bank
- Each player picks a token and starts on go

[rules]
Buy, trade and charge rent until one player is left solvent.
- Every player starts at 1500; add salary and rent, subtract purchases and fines
- The houses and hotels counter tracks what is left in the bank
- Highest cash is a useful tie-breaker if you stop early

[tool score]
mode: ledger
start: 1500
win: highest

[tool counters]
counters: houses=32, hotels=12
bank: 0

[tool turns]
phases: Roll, Buy, Build, End
`},{id:"secret-hitler",text:`# secret-hitler.gamebuddy — secret roles, public laws

[game]
name: Secret Hitler
players: 5-10
time: 30m
tags: bluffing, deduction, party
icon: secret-hitler
source: https://www.secrethitler.com/
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Deal one secret role per player and keep it hidden
- Set the liberal and fascist policy tracks to zero
- Put the draw pile, discard pile and election tracker in the middle
- Nominate the first president

[rules]
Liberals pass five laws; fascists pass six, or get Hitler elected.
- The president nominates a chancellor, and everyone votes yes or no in the open
- A passed government draws three policies, discards one and plays one
- Failed votes move the election tracker; a full tracker hands a policy to the top of the deck
- Fascists know each other, and Hitler knows who they are
- Track the laws here and keep the roles behind the phone

[tool reveal roles]
mode: roles
roles: liberal=3, fascist=2, hitler=1
auto-hide: 6

[tool counters]
mode: count
counters: liberal-laws=0, fascist-laws=0
step: 1

[tool reveal vote]
mode: ballot
ballot: Ja or Nein?
options: Ja, Nein

[tool turns]
phases: Nominate, Vote, Legislative session
pass: no
`},{id:"smash-night",text:`# smash-night.gamebuddy — brackets, stocks and a shot clock

[game]
name: Smash Night
icon: smash-night
players: 2-8
time: 60m
tags: tournament, video-game
source: Fan-made helper; Super Smash Bros. is a trademark of Nintendo
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Enter every player into the bracket
- Agree the stock count and the stage list
- Put the bracket on the display screen if you have a second one

[rules]
A knockout bracket of one-on-one matches.
- Report the winner of each match in the bracket
- Keep the agreed stocks per match
- The bracket advances itself; use "next up" to call the players
- The last player standing wins the night

[tool bracket bracket]
format: single
best-of: 3
seeding: random

[tool timer match]
mode: countdown
duration: 8m
warn-at: 1m
sound: gong

[tool score standings]
mode: simple
win: highest

[tool rules]
quick: Win your match, advance, repeat.
`},{id:"spyfall",text:`# spyfall.gamebuddy — everyone knows the place except one

[game]
name: Spyfall
players: 3-8
time: 20m
tags: party, deduction, bluffing
icon: spyfall
source: https://boardgamegeek.com/boardgame/166384/spyfall
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Deal one role card each; one player is the spy
- Put the location cards where the table can see them
- Agree the round length, eight minutes is usual
- Pick the first player to ask a question

[rules]
Everyone knows the location except the spy, who has to work it out.
- Ask one player a question about the place, and they answer as if they know it
- Do not name the location in a question or an answer
- Anyone may call a vote at any time; the table points at one player
- A caught spy gets one guess at the location
- The spy wins by guessing the location or by not being caught

[tool reveal roles]
mode: roles
roles: spy=1, agent=fill
auto-hide: 6

[tool timer round]
mode: countdown
duration: 8m
warn-at: 1m
sound: bell

[tool reveal vote]
mode: ballot
ballot: Who is the spy?
`},{id:"wavelength",text:`# wavelength.gamebuddy — a clue somewhere on the dial

[game]
name: Wavelength
players: 3-12
time: 30m
tags: bluffing, guessing, party
icon: wavelength
source: https://www.wavelength.zone/
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Split into two teams
- Set the dial and hide the target behind the screen
- Agree a target score, ten points is usual
- Pick the first psychic

[rules]
Give a clue that lands your team on the hidden target.
- The psychic draws a target and a spectrum, then says one clue
- The team turns the dial to where they think the target sits
- The closer the dial, the more points: four for dead centre, down to two at the edge
- The opposing team may guess left or right of the dial for a bonus point
- First team to ten wins

[tool score]
mode: rounds
target: 10
win: highest
hint: ten points takes the game

[tool timer]
mode: countdown
duration: 1m
warn-at: 15s
sound: bell
`},{id:"werewolf",text:`# werewolf.gamebuddy — deal roles, then run the night

[game]
name: Werewolf
players: 5-10
time: 30m
tags: deduction, party
icon: werewolf
source: https://en.wikipedia.org/wiki/Mafia_(party_game)
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Deal one role per player, face down
- Put the night script within reach of the narrator
- Agree the length of the discussion phase

[rules]
Villagers must find the werewolves before the village empties.
- Everyone looks at their role privately
- Follow the night script: werewolves wake, the seer inspects, everyone wakes
- Discuss for the agreed time, then vote; the most votes is out
- The village wins when every werewolf is out; the werewolves win otherwise

[tool reveal roles]
mode: roles
roles: werewolf=2, seer=1, villager=fill
auto-hide: 8

[tool timer discuss]
mode: countdown
duration: 3m
warn-at: 30s
sound: bell

[script night]
1. say: Everyone, look at your role and keep it secret.
2. reveal: roles
3. say: Everyone, close your eyes.
4. wait: 3s
5. say: Werewolves, open your eyes and look at each other.
6. wait: 5s
7. say: Werewolves, close your eyes.
8. say: Seer, open your eyes. Point at one player and the narrator shows you that role card.
9. wait: 5s
10. say: Seer, close your eyes. Everyone, open your eyes.
11. wait: 5s
12. say: Discuss and vote for a werewolf.
13. timer: discuss start

[tool rules]
quick: Find the werewolves before the village is destroyed.
`},{id:"chiptales",text:`# chiptales.gamebuddy — poker patterns without the poker table

[game]
name: Chiptales
players: 2-9
time: 30m
tags: betting, card, pandaqi
icon: chiptales
source: https://pandaqi.com/chiptales/
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Pick one game from the series and print its cards; Noble Flood also needs its contracts, Six of Sparrows its bid cards
- Shuffle and deal the opening hands, and keep a pen and paper for the score
- Put the draw pile and any shared row of cards where everyone can reach them
- Read that game's rulebook; the three games score differently

[rules]
Three poker-inspired card games; each keeps the patterns and drops a different part of poker.
- Six of Sparrows (2-5): bid on a pattern while the cards are still arriving; an exact pattern scores its value divided by the cards you held, a miss costs 10 points
- Noble Flood (2-6): pick contracts, build a shared 5x5 map and complete their patterns; met contracts score plus, missed ones minus
- Pietenpoker (3-9): a simpler Sinterklaas poker with two combinations, same suit or same number; the Dutch rulebook has the full rules
- Six of Sparrows plays to a recommended 500 points
- Noble Flood ends when the contract deck runs out; Pietenpoker ends when the deck can no longer deal a round
- In every game the highest total wins

[tool score]
mode: rounds
win: highest
hint: 500 for Six of Sparrows; the other two end when their deck runs out
`},{id:"i-bid-you-not",text:`# i-bid-you-not.gamebuddy — build an offer, then auction it

[game]
name: I Bid You Not
players: 3-6
time: 45m
tags: bidding, card, pandaqi, puzzle
icon: i-bid-you-not
source: https://pandaqi.com/i-bid-you-not/
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Shuffle the deck and place the top card faceup: it is the opening offer
- Deal the remaining cards until the deck is empty
- For a shorter game, remove the extreme numbers before shuffling
- Put the used cards within reach: every player keeps a score pile

[rules]
Take turns building an offer of ascending cards, then auction it; whoever takes the offer keeps every card in it.
- On your turn, add a card with a higher number than the last offer card, or declare an auction
- An auction: everyone secretly picks one card from their hand, then all bids are revealed at once
- Sort the bids from highest to lowest; if every bid falls inside the offer's number range, the order inverts
- Ask in that order who wants the offer; the first player to take it adds every offer card to their score pile
- A player who does not want it discards a random card from their score pile, then adds one card from their hand to the offer anywhere in the row
- The last player in the order must take the offer, and so must anyone who cannot pay to skip
- The lowest bid starts the next offer, and every other bid is discarded
- The game ends when all players are out of cards; add up the price value of your score pile and the highest total wins

[tool reveal]
mode: bid
min-bid: 0
max-bid: 100

[tool score]
mode: ledger
win: highest

[notes]
Add each offer you win as one ledger entry with the total price of its cards.
The bid tool covers 0 to 100: the base deck and Double Devices stay inside that, but
the Odd Inventions expansion adds negative numbers, which have to be noted by hand.
Expansions also add card actions; they change no other rule.
`},{id:"naivigation",text:`# naivigation.gamebuddy — one vehicle, everyone steering at once

[game]
name: Naivigation
players: 2-10
time: 60m
tags: cooperative, pandaqi, party
icon: naivigation
source: https://pandaqi.com/naivigation/
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Pick a vehicle; the five major games need the shared core set as well as that vehicle's material
- Build the 5x5 map: 25 tiles including 5 collectibles and a starting tile, then put the vehicle on the start
- Combine the default and vehicle cards, shuffle them faceup, and give everyone 3
- Shuffle the health cards and take 5 as the health deck
- Lay out 5 instruction tokens and pick a start player

[rules]
Everyone steers one vehicle together, and the trick is keeping it in one piece.
- Play happens in rounds: take clockwise turns putting a vehicle card facedown under an empty instruction token
- Then reveal the instructions left to right and move; the player who filled the first slot starts the next round
- Visit all 5 collectibles to win; lose at once when the health deck is empty
- Taking damage reveals the next health card, and its handicap stays in force
- No table talk by default; the Discuss card is the way to buy some
- The five major games share this core and change the vehicle; the two specials are standalone spin-offs
- Track damage here; when the health deck runs out, the vehicle is lost

[tool counters]
mode: count
counters: damage=0
step: 1
`},{id:"slippery-slopes",text:`# slippery-slopes.gamebuddy — describe a word with sliders and a timer

[game]
name: Slippery Slopes
players: 2-10
time: 20m
tags: guessing, pandaqi, party
icon: slippery-slopes
source: https://pandaqi.com/slippery-slopes/
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Shuffle the slider deck and draw 4 sliders in front of the start player
- Shuffle the word deck and keep it within reach
- Agree on 10 rounds and a 1-2 minute talking limit
- For the competitive variant, split into two teams and alternate turns

[rules]
Communicate a secret word using only a set of sliders, while the table guesses.
- On your turn, first change the sliders; use a sideways facedown card to mark where your word ranks
- Then start the timer and communicate using only the sliders; no words, gestures or other hints
- Anyone may guess or ask questions during the turn
- A correct guess scores 5 points; if time runs out, the turn scores 0
- The default game is cooperative: add the table's points over 10 rounds
- The competitive variant gives each team its own score after 10 rounds
- Glidy Gifts actions are optional and each one reduces that word's score by 1

[tool timer]
mode: countdown
duration: 2m
start: manual
sound: bell

[tool counters]
mode: count
counters: Points=0
step: 5
down: 1
`},{id:"throneless-games",text:`# throneless-games.gamebuddy — simultaneous votes and seat swaps

[game]
name: Throneless Games
players: 4-10
time: 20-30m
tags: card, deduction, pandaqi, party
icon: throneless-games
source: https://pandaqi.com/throneless-games/
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Pick one of the four games: Smallseat, Queenseat, Kingseat or Kaizerseat, and print its Princes
- Choose at least as many Princes as players; add all their cards, shuffle, and deal the deck equally
- Put any leftover cards faceup in the Tell, and choose the Kingseat position
- Trade two cards to the right, two to the left, then set one card aside as your secret Loyalty
- Keep a facedown Tell for winning votes and a faceup Discard

[rules]
Four games built on one shared vote: everyone secretly backs a Prince while swapping seats to control the count.
- Each round, first give one card to your neighbour; the direction alternates left and right
- Then everyone secretly picks a vote card and reveals together
- The Prince with the most votes wins the round; a tie goes to the Prince closest to the Kingseat clockwise
- Winning cards go to the Tell; every other player either uses their card's action or swaps seats and one hand card
- The game ends when all hands are empty; reveal the Tell and count the votes
- The Prince with the most votes wins, and every player whose secret Loyalty matches that Prince also wins
- Smallseat is the simplest, Queenseat adds a throne card, Kingseat is the middle game, Kaizerseat the longest
- Each game has its own Princes and twists; read that game's rulebook
`}];export{e as templateTexts};
