var e=[{id:"avalon",text:`# avalon.gamebuddy — good and evil, five missions

[game]
name: The Resistance: Avalon
players: 5-10
time: 30m
tags: deduction, party, voting
icon: avalon
source: https://www.indieboardsandcards.com/
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Deal one secret role per player
- Read the mission sizes for your player count
- At eight or more players, give Minions a count in Edit roles (3, or 4 at ten)
- Evil players open their eyes and learn each other

[rules]
Good wins three missions; evil wins three, or assassinates Merlin.
- The leader proposes a team for the mission
- Everyone votes approve or reject in the open
- An approved team goes on the mission in secret; one fail card sinks it, except on the fourth mission
- Five rejected proposals in a row hands the mission to evil
- After three successful missions, the assassin may name Merlin
- Mission sizes: 5 players 2-3-2-3-3, 6 players 2-3-4-3-4, 7 players 2-3-3-4-4, 8-10 players 3-4-4-5-5

[tool reveal roles]
mode: roles
roles: merlin=1, assassin=1, percival=1, morgana=1, loyal=fill, minion=fill
auto-hide: 8

[tool reveal vote]
mode: ballot
ballot: Approve this team?
options: Approve, Reject

[tool counters]
mode: count
counters: good-missions=0, evil-missions=0
step: 1

[tool turns]
phases: Propose, Vote, Mission
pass: no
`},{id:"coup",text:`# coup.gamebuddy — two influences and a pile of coins

[game]
name: Coup
icon: coup
players: 2-6
time: 15m
tags: bluffing, party
source: https://boardgamegeek.com/boardgame/131357/coup
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Shuffle the role deck and deal two face-down cards to each player
- Give every player two coins
- Put the rest of the deck face down as the court deck

[rules]
Bluff your way to being the last player with influence.
- Coins buy actions: income, foreign aid, coup and character powers
- Each role does one thing: Duke takes 3 coins, Assassin pays 3 to kill, Captain steals 2, Ambassador swaps, Contessa blocks
- Anyone may challenge a claim; the loser loses an influence
- Track coins as ledger entries and influences with the lives tool
- The last player with a face-down card wins

[tool lives]
mode: players
lives: 2
max: 2
elimination: yes

[tool score]
mode: ledger
`},{id:"cribbage",text:`# cribbage.gamebuddy — pegs, hands and a crib to 121

[game]
name: Cribbage
players: 2
time: 30m
tags: card, family
icon: cribbage
source: Traditional game — no official source
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Deal six cards each and two to the crib
- Cut for the starter card
- Each player discards two more into the crib
- Agree a board and pegs

[rules]
Score points for combinations and be first to 121.
- Lay cards in turn, counting aloud to 31 for pegging points
- Then score your hand with the starter: pairs, runs, fifteens and a flush
- The dealer scores the crib on the same terms
- First peg to 121 wins; a skunk is a win by 31 or more

[tool decks]
deck: standard
players: 2
deal: 6
hidden: yes

[tool score]
mode: rounds
target: 121
win: highest
hint: 121 wins, 91 is a skunk
`},{id:"dominion",text:`# dominion.gamebuddy — deck building and victory cards

[game]
name: Dominion
icon: dominion
players: 2-4
time: 30m
tags: card, deck-building
source: https://www.riograndegames.com/
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Lay out ten kingdom cards plus the base treasures and victory cards
- Give every player a starting deck: seven coppers and three estates
- Shuffle and draw five cards
- Put the trash pile in the middle

[rules]
Each turn: action, buy, clean up, draw five.
- Treasures buy cards; kingdom cards change the rules
- The game ends when the province pile or three other piles run out
- Count victory points: provinces 6, duchies 3, estates 1, curses -1
- The highest total wins

[tool score]
mode: categories
categories: provinces=6, duchies=3, estates=1, curses=-1
win: highest

[tool turns]
phases: Action, Buy, Cleanup
`},{id:"escape-room",text:`# escape-room.gamebuddy — phases, script and one big clock

[game]
name: Escape Room
players: 2-6
time: 60m
tags: party, realtime
icon: escape
source: Generic escape-room kit
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Read the introduction out loud
- Hide the clue envelopes before anyone enters
- Start the main clock only when the door closes

[rules]
Solve the chain of puzzles before the clock runs out.
- The script walks the host through the introduction and each reveal
- Hints cost time on the main clock if you play that way
- Solving the final puzzle stops the clock

[tool timer room]
mode: sequence
phases: Intro=5m, Main=45m, Finale=5m
sound: gong
warn-at: 5m

[script story]
1. note: Welcome the players and lock the door.
2. say: The room is silent except for a clock. Find out why you are here.
3. timer: room start
4. wait: 5s
5. say: Every envelope holds one clue. Read them in order.
6. note: Hand out the first envelope now.
7. wait: 30s
8. say: If you are stuck, ask for a hint. It costs five minutes.
9. timer: room start

[tool rules]
quick: Solve the puzzle chain before the clock runs out.
`},{id:"hanabi",text:`# hanabi.gamebuddy — a cooperative fireworks show

[game]
name: Hanabi
icon: hanabi
players: 2-5
time: 25m
tags: card, cooperative
source: https://boardgamegeek.com/boardgame/98778/hanabi
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Shuffle the fireworks deck and deal four or five cards to each player
- Hold your cards facing the other players
- Put the fuse and information tokens in the middle

[rules]
Build five fireworks from one to five without seeing your own cards.
- A turn is one action: play a card, discard a card or give a clue
- Clues cost information tokens; discards refill them
- Three fuses end the game
- Score the highest card in each completed firework; 25 is perfect

[tool score]
mode: simple
target: 25
win: highest

[tool timer]
mode: up
sound: none
`},{id:"just-one",text:`# just-one.gamebuddy — one word clues, one guesser

[game]
name: Just One
icon: just-one
players: 3-7
time: 20m
tags: party, words
source: https://boardgamegeek.com/boardgame/254640/just-one
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Write a stack of mystery words, or use the word tool to draw them
- Everyone gets a pen and a clue card
- Choose the first guesser

[rules]
Everyone writes a one-word clue for the same mystery word.
- Compare clues out loud; identical clues are cancelled before the guesser sees them
- The guesser gets one guess
- A correct guess scores one point, a wrong one scores nothing
- Pass the role of guesser clockwise

[tool words mystery]
profile: en
mode: filters

[tool score]
mode: rounds
rounds: 13
win: highest

[tool timer turn]
mode: countdown
duration: 60s
warn-at: 15s
`},{id:"pandemic",text:`# pandemic.gamebuddy — cubes, outbreaks and a ticking clock

[game]
name: Pandemic
icon: pandemic
players: 2-4
time: 45m
tags: board, cooperative
source: https://www.zmangames.com/
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Give every player a role card and a pawn
- Place three cubes of each colour on the starting cities
- Shuffle the infection deck and infect nine cities
- Put the outbreak and cure markers within reach

[rules]
A cooperative race to cure four diseases before the world runs out of time.
- Each turn: four actions, then draw cards, then infect cities
- The infection rate rises with every outbreak
- Five outbreaks or running out of cubes loses the game
- Track the cube supply and outbreaks here; cure all four to win

[tool counters]
counters: red=24, yellow=24, blue=24, black=24, outbreaks=0
bank: 0

[tool timer]
mode: up
sound: none
`},{id:"perudo",text:`# perudo.gamebuddy — dice under cups and escalating bids

[game]
name: Perudo / Liar's Dice
icon: perudo
players: 2-6
time: 30m
tags: bluffing, dice
source: https://boardgamegeek.com/boardgame/45/perudo
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Give every player a cup and five dice
- Agree on the starting player
- Everyone rolls and peeks under their own cup

[rules]
Bid on how many dice of a face are on the table, then call the bluff.
- A bid is a quantity and a face; each bid must raise the last
- Calling a bid reveals every cup; the loser loses a die
- Ones are wild unless someone has bid them
- Last player with dice wins; use lives and blind bids here

[tool dice]
roll: 1d6
pool: 5d6
macros: cup=5d6

[tool lives]
mode: players
lives: 5
max: 5
elimination: yes

[tool reveal]
mode: bid
min-bid: 1
max-bid: 30
`},{id:"phase-10",text:`# phase-10.gamebuddy — ten phases, lowest score wins

[game]
name: Phase 10
icon: phase-10
players: 2-6
time: 45m
tags: card, family
source: https://www.mattelgames.com/
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Shuffle the deck and deal ten cards to each player
- Turn one card face up for the discard pile
- Put the phase cards where everyone can see the ten goals

[rules]
Each round has one phase to complete, from two sets of three up to a run of nine.
- Complete your phase, then go out by discarding your last card
- Cards left in hand count against you
- Penalty points go in the next round cell
- The lowest total after ten rounds wins

[tool score]
mode: rounds
rounds: 10
win: lowest
step: 5
`},{id:"risk",text:`# risk.gamebuddy — reinforcements, attacks and fortifying

[game]
name: Risk
icon: risk
players: 2-6
time: 120m
tags: board, war
source: https://www.hasbro.com/en-us/product/risk
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Deal out the territory cards and place one army on each
- Players take turns placing their remaining armies
- Shuffle the territory deck and deal a starting hand

[rules]
Take over the world one territory at a time.
- Reinforce from your territories and continent bonuses
- Attack with up to three dice against up to two defenders
- Fortify once at the end of your turn
- Track each player's army count as a ledger entry; the last player standing wins

[tool score]
mode: ledger

[tool counters]
counters: reinforcements=0
bank: 0

[tool turns]
phases: Reinforce, Attack, Fortify

[tool dice]
roll: 3d6
macros: attacker=3d6, defender=2d6
`},{id:"scattergories",text:`# scattergories.gamebuddy — one letter, a list of categories, three minutes

[game]
name: Scattergories
players: 2-6
time: 30m
tags: party, words, realtime
icon: scattergories
source: https://www.hasbro.com/en-us/product/scattergories
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Give every player an answer sheet and a pen
- Agree the number of rounds, three is usual
- Put the category cards where everyone can read them
- Draw the first letter before the clock starts

[rules]
Everyone writes one answer per category, all starting with the round's letter.
- Draw the letter, then start three minutes
- One answer for every category, and it must start with that letter
- Read the lists out loud; an answer two players share is crossed out
- A unique answer scores a point, and two when every word in it starts with the letter
- Highest total after the last round wins

[tool words letter]
profile: en
mode: letters
count: 1

[tool timer round]
mode: countdown
duration: 3m
warn-at: 30s
sound: buzzer

[tool score]
mode: rounds
rounds: 3
win: highest
`},{id:"skull",text:`# skull.gamebuddy — place a rose, make a bid, flip the skulls

[game]
name: Skull
icon: skull
players: 3-6
time: 20m
tags: bluffing, party
source: https://boardgamegeek.com/boardgame/92415/skull
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Give every player one mat and four discs: three roses and one skull
- Agree on a starting player
- Keep the discs hidden from the other players

[rules]
Two phases: place discs face down, then bid on how many you can flip.
- The highest bidder flips that many discs, starting with their own
- One skull ends the attempt and costs a disc
- Two successful bids win the game
- Use the blind bid tool for the bidding and the scorepad for wins

[tool reveal]
mode: bid
min-bid: 1
max-bid: 8

[tool score]
mode: simple
target: 2
win: highest
`},{id:"spirit-island",text:`# spirit-island.gamebuddy — fear, blight and a very patient island

[game]
name: Spirit Island
players: 1-4
time: 120m
tags: board, cooperative, strategy
icon: spirit-island
source: https://greaterthangames.com/product/spirit-island/
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Choose a spirit and take its board and presence
- Set the island up for your adversary and scenario
- Place the fear pool and the blight card
- Agree who reads the invader phase

[rules]
Scare the invaders away before the island is blighted.
- Spirits grow by placing presence and gaining power cards
- Fast powers resolve before the invaders act, slow powers after
- The invaders explore, build and ravage in that order
- Fear pushes the invaders out; enough fear wins the game
- If the blight card flips and runs out, the island loses

[tool turns]
phases: Spirit, Fast powers, Invaders, Slow powers
pass: no

[tool counters]
mode: count
counters: fear=0, blight=0, ravage=0, build=0
step: 1

[tool rules]
quick: Win by fear, lose by blight. Fast powers first, slow powers last.
`},{id:"splendor",text:`# splendor.gamebuddy — gems, cards and fifteen points

[game]
name: Splendor
players: 2-4
time: 30m
tags: board, engine
icon: gem
source: https://www.spacecowboys.fr/splendor
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Shuffle the three development decks and lay out four of each
- Give every player a starting tile
- Sort the gem tokens by colour
- Reveal five nobles

[rules]
Collect gems, buy development cards and attract nobles.
- A turn is one action: take gems, reserve a card or buy a card
- Cards give permanent discounts and points
- Nobles visit at fifteen points of card bonuses
- First to fifteen points wins; the gem counters track the bank

[tool score]
mode: simple
target: 15
win: highest

[tool counters]
counters: emerald=7, sapphire=7, ruby=7, diamond=7, onyx=7, gold=5
bank: 0
`},{id:"sushi-go",text:`# sushi-go.gamebuddy — three quick rounds of card picking

[game]
name: Sushi Go!
players: 2-5
time: 20m
tags: card, party
icon: sushi
source: https://gamewright.com/product/Sushi-Go
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Shuffle the deck and deal the right number of cards per player
- Agree on who starts the first pass
- Keep the pudding cards visible; they score at the end

[rules]
Pick one card, pass the rest, repeat. Three rounds in total.
- Maki rolls, tempura, sashimi and dumplings score in their own ways
- Pudding is scored after the last round
- Add each round here; the highest total wins

[tool score]
mode: rounds
rounds: 3
win: highest
`},{id:"taboo",text:`# taboo.gamebuddy — say the word without the words on the card

[game]
name: Taboo
players: 4-12
time: 30m
tags: party, guessing, realtime
icon: taboo
source: https://www.hasbro.com/en-us/product/taboo
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Split into two teams and shuffle the card deck
- Agree the round length, one minute is usual
- Agree the number of rounds, six is a full game
- Pick the first clue-giver

[rules]
Get your team to say the word without saying the word or any word on its card.
- The clue-giver may not say the answer or the forbidden words
- No gestures, spelling, rhymes or "sounds like"
- A correct guess scores a point, and a pass costs one
- Teams alternate clue-givers until the rounds are done
- Highest total wins

[tool timer round]
mode: countdown
duration: 1m
warn-at: 15s
sound: buzzer

[tool turns]
phases: Clue, Guess, Score
pass: no

[tool score]
mode: rounds
rounds: 6
win: highest
`},{id:"the-crew",text:`# the-crew.gamebuddy — ten tasks, one shared crew

[game]
name: The Crew
players: 3-5
time: 20m
tags: card, cooperative, trick-taking
icon: the-crew
source: https://www.kosmos.de/
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Shuffle the forty-card deck: 1 to 9 in four colours, plus rockets 1 to 4 as top trumps
- Reveal the number of task cards the mission asks for
- Deal the whole deck: 13 each with three players (one card stays over), 10 with four, 8 with five
- The deck tool deals as many as it can, so it stops when the deck runs out; set its seats to your table
- Look at your hand and plan who can take what

[rules]
Win every task as a crew, in order, with no talking about hands.
- The commander leads the first trick
- Follow suit if you can; trumps beat the led suit
- Communication is one card and one token per player, once per mission
- A task is complete when its card is won by the right player
- Lose a trick you needed and the mission fails; try it again

[tool decks]
deck: custom
# The Crew deals 13 cards at three players, 10 at four and 8 at five.
players: 3
deal: 13
hidden: yes
# The Crew's own deck: 1 to 9 in four colours, then four rockets as trumps.
cards: 1♠, 2♠, 3♠, 4♠, 5♠, 6♠, 7♠, 8♠, 9♠,
  1♥, 2♥, 3♥, 4♥, 5♥, 6♥, 7♥, 8♥, 9♥,
  1♦, 2♦, 3♦, 4♦, 5♦, 6♦, 7♦, 8♦, 9♦,
  1♣, 2♣, 3♣, 4♣, 5♣, 6♣, 7♣, 8♣, 9♣,
  Rocket 1, Rocket 2, Rocket 3, Rocket 4

[tool counters]
mode: count
counters: Tasks=0
step: 1

[tool turns]
phases: Lead, Follow, Check tasks
pass: no
`},{id:"ticket-to-ride",text:`# ticket-to-ride.gamebuddy — routes, tickets and the longest path

[game]
name: Ticket to Ride
players: 2-5
time: 60m
tags: board, strategy
icon: train
source: https://www.daysofwonder.com/tickettoride/
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Give every player 45 trains and a matching score marker
- Deal three destination tickets and keep at least two
- Shuffle the train deck and deal five cards to each player
- Lay out the five face-up cards

[rules]
Claim routes by spending matching train cards, then score at the end.
- A route is worth its printed points
- Destination tickets add or subtract their value if completed
- The longest continuous path is worth 10 bonus points
- The highest total wins

[tool score]
mode: ledger
win: highest

[tool turns]
phases: Draw, Play, End
timer: 0s
pass: no
`},{id:"wingspan",text:`# wingspan.gamebuddy — birds, bonuses and round goals

[game]
name: Wingspan
players: 1-5
time: 70m
tags: board, engine
icon: bird
source: https://stonemaiergames.com/games/wingspan/
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Give every player a player mat, eight action cubes and five food
- Deal five bird cards and keep any you can afford
- Shuffle the bird deck and lay out the tray
- Reveal the first round goal

[rules]
Build an engine of birds across four rounds. Each turn is one action: play a bird, gain food, lay eggs or draw cards.
- Birds score their printed points
- Bonus cards and round goals add points
- Eggs, cached food and tucked cards score at the end
- The highest total after round four wins

[tool score]
mode: ledger
win: highest
`},{id:"death-by-digits",text:`# death-by-digits.gamebuddy — find the numbers nobody is holding

[game]
name: Death by Digits
players: 2-6
time: 30m
tags: card, deduction, pandaqi
icon: death-by-digits
source: https://pandaqi.com/death-by-digits/
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Count the players and multiply by 3; use cards 1 to that number, three of each
- Deal each player twice as many cards as there are players
- Put 3 cards facedown to one side: these are the Murder
- Leave the rest facedown as shared Evidence

[rules]
Be a math detective and name the three numbers that are in nobody's hand.
- On your turn, either guess another player's highest or lowest card, or play a combo to the Evidence
- A single card steals 3 random cards unless someone shows the same number to stop it
- Two cards that add or subtract to the Midnumber (half the top number, rounded) take 2 from the Evidence
- Three of a kind lets you look at one Murder card
- At the end of your turn you may name the three Murder numbers; a correct answer wins at once, a wrong one puts you out
- The base game is kid-friendly; Dastardly Digits adds six special cards
- The game's page has the full rulebook
`},{id:"hasty-accusations",text:`# hasty-accusations.gamebuddy — keep one secret suspect alive

[game]
name: Hasty Accusations
players: 2-7
time: 30m
tags: bluffing, card, deduction, pandaqi
icon: hasty-accusations
source: https://pandaqi.com/hasty-accusations/
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Pick a card set; the base set is best for a first game
- Choose at least 5 suspects, and more suspects than players
- Lay the suspects faceup in a row and put the loupe above the middle one
- Deal each player one secret suspect card, then deal 4 playing cards each
- Put 4 cards faceup beside the deck as the market

[rules]
Keep one secret suspect alive while the evidence piles around the others grow.
- On your turn, play as many cards as you like under living suspects
- A faceup card runs its action and moves the loupe forward; a facedown card moves it back
- If you play nothing, discard your hand and move the loupe forward
- When the loupe wraps around, review the largest evidence pile
- Reveal that pile top to bottom; a murdered suspect is turned facedown, and a player whose secret suspect dies is out
- Refill hands to 4 from the market, then refill the market
- The last player left wins; the traitor variant lets one player win by outlasting everyone else
- The rulebook has the full card actions and variants

[tool lives]
lives: 1
max: 1
mode: players
elimination: yes
hidden: no

[tool turns]
phases: Play cards, Review, Refill
pass: no
`},{id:"the-game-of-dilemmas",text:`# the-game-of-dilemmas.gamebuddy — five rounds of controversial choices

[game]
name: The Game of Dilemmas
players: 3-6
time: 30m
tags: pandaqi, party, voting
icon: the-game-of-dilemmas
source: https://pandaqi.com/the-game-of-dilemmas/
author: pandaqi
license: CC-BY-SA-4.0
format: 1

[setup]
- Sort the cards into positive and negative piles; ignore neutral cards for the base game
- Shuffle both piles and place them facedown
- Deal each player 4 positive and 4 negative cards
- Put out yes and no tokens: half the number of dilemmas, rounded up, of each

[rules]
Build the most controversial dilemma, then collect the yes votes it earns.
- Each round, everyone secretly combines one positive and one negative card
- Reveal all dilemmas, then everyone places yes/no tokens facedown on every dilemma
- The dilemma with the smallest difference between yes and no is the most controversial and wins the round
- Its creator scores one point per yes token on it; ties go to the dilemma with more no tokens
- Everyone draws a new positive and negative card
- The game ends after 5 rounds; highest score wins
- Neutral cards, supervotes and co-op dilemmas are optional upgrades in the rulebook

[tool score]
mode: rounds
rounds: 5
win: highest
hint: One point per yes token on your winning dilemma
`}];export{e as templateTexts};
