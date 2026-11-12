# Pandaqi Studio

This is the full source code / project behind [Pandaqi](https://pandaqi.com), also known as Pandaqi Games or Pandaqi Studio. 

It currently hosts a bit over 100 board games, video games, and game utility tools. All of these are custom games fully designed by us, not ports or rip-offs of existing games.

## What?

It contains the landing pages and assets for all our games (both video games and board games).

* Most board games are generated on the website itself, though, so it also contains the code for those generators.
* Most rulebooks contain code for interactive widgets, as those are way better at teaching game rules (and more fun).

The project uses **HUGO**. It's a static website that rebuilds whenever this repository is updated.

* The actual website (hosted online) is inside `pandaqi-studio`.
* Anything in development is kept in `pandaqi-studio-dev`. (Once done, a game is transfered to the public version.)
* Everything else is metadata or supportive documents for the project.

There are no other dependencies.

It's a completely free website. It will always stay that way. You can use any part of the work in any way you like.

If you find anything broken, let us know. Updates can sometimes be slow because we need to prioritize other projects that actually make us money. We hope you understand :)

## Project Structure

This is by far my largest project. Hence, some sub projects have their own GitHub repository.

* [Pandaqi Blog](https://github.com/Pandaqi/Pandaqi-Blog) => my blog that mostly contains devlogs / diaries about these games
* [Pandaqi Tutorials](https://github.com/Pandaqi/Pandaqi-Tutorials) => my huge tutorials website with free interactive courses on lots of things
* I've written many custom libraries powering all of this, which are all open source and on my GitHub account. Examples:
  * [PQ-Rulebook](https://github.com/Pandaqi/pq-rulebook) is our system for interactive, open source board game rulebooks.
  * [PQ-Games](https://github.com/Pandaqi/pq-games) is our powerful system for generating board game material (cards, boards, etc) on the fly and exporting to high-resolution PDFs.
  * [PQ-Trivia](https://github.com/Pandaqi/pq-trivia) is our system for quickly creating (pub) quizzes on any topic, physical or digital, including images/audio/video.
  * [PQ-Words](https://github.com/Pandaqi/pq-words) is a useful list of common English words, tagged in useful ways, to use in word games/activities/language education.
  * [PQ-Bamboo](https://github.com/Pandaqi/pq-bamboo) is our own (simplified, beginner-friendly) coding language to learn programming right inside the browser.
  * [PQ-Midi](https://github.com/Pandaqi/pq-midi) is a MIDI player to learn and play with songwriting right within your browser (used in our music courses)
  * [PQ-DAW](https://github.com/Pandaqi/pq-daw) goes even further by providing a minimal "Digital Audio Workstation" on the page (used in our music courses)
  * And more ...

> Update: This website has since been overtaken by [The Wayward Melody](https://github.com/Pandaqi/The-Wayward-Melody), our massive online educational store, as our largest project! It hosts educational board and video games, some of them paid.

Nothing is hidden or changed for this public version. In fact, you'll find many projects that are yet to release/finish in the development environment.

## Why?

I'm open sourcing all my websites in an effort towards an open world based on sharing and transparency. It's the least I can do. 

Adding an external reward to any work, such as money, only encourages bad practices, destroys intrinsic motivation, and inevitably leads to shady secret behavior. I used to love making games just because---then I hated it for years as I was told I needed to be successful and make money from it. 

All I do is free and in the open. I just hope to add joy to the world or help people learn through my work. Maybe, just maybe, this disease will spread and we can have an actual free and happy society in my lifetime ...