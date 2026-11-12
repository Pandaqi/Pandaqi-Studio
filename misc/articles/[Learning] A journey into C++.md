**Learning C++**

Why learn C++?

-   Gives control over everything, allowing faster, easier, more suited programs

-   Several great game engines using C++

-   More knowledge about how computers work, how to optimize code, etc.

-   Ability to extend Godot

-   Appears everywhere, especially in games, so it seems like a good thing to at least partially understand.

How to develop?

-   Install the full Visual Studio, instead of just Code. (Should give easy compilation for debug/release into .exe)

-   Learn how to use OpenGL (or other libraries needed for games)

-   Learn how to combine libraries, link stuff, and build executables on all platforms: Windows/Mac/Linux, Android and iOS, etc.

Alternative viewpoint: learn *functional languages*. For example: Elm, Clojure, Elixir. (Go and Scala?)

-   "elm-ui" would prevent us from writing CSS?

-   LibGDX supports Scala?

And what about CoffeeScript / TypeScript as better alternative to JavaScript?

Could also be a future alternative to PHP for websites?

-   Some functional language (such as Elixir)

-   Or Ruby on Rails (using Ruby)

-   Or Django (using Python)

-   Or YAML (or whatever my GRAV installation is using)

**Functional Programming in 40 Minutes:** <https://www.youtube.com/watch?v=0if71HOyVjY>

(A bit slow to start, but eventually a very good explanation.)

What I like:

-   The idea of immutable data structures/"pure" functions

-   Atoms get passed a function, which they apply to their own value and update to the result. (Plus thread/fault safety.)

-   Building a "bridge" between the pure and nice functional world, and the messy world that actually *changes* stuff.

-   We get paid for the "side effects"!

**Talk about Immutability (from Kevlin Henney): <https://www.youtube.com/watch?v=APUCMSPiNh4>**

At a few points, he gives a really nice summary with the 5 key points.

Key points:

-   Instead of *changing* values, instead politely request an *object with the following changes*.

    -   For example: given that A is the current state of this object, could you please *transform* it and return a new object that is A but with some differences?

    -   This makes the original values immutable.

    -   Example: instead of "set clock to hour 2", you request "clock.withHour(2)"

-   When you embrace the idea of immutability, it's very important to give objects a good starting point/starting life.

    -   Which means default constructors are not preferable.

    -   Instead of using an if-statement to check if something is empty, or doesn't exist, whatever -- create two separate objects/constructors, without the need of if-statements.

-   Defensive copying: I don't give you the original objects, only the copies.

    -   Do *not* use defensive comments: "please don't change this" does not work.

In summary, "asking a question should not change the answer, nor should asking twice!"

You want a **pipeline** => a piece of **data flow** => for as many operations as possible.

> Example: blabla.filter(something).map(somethingelse)....

Some quotes:

-   Try to leave out the part that readers tend to skip.

-   When it is not necessary to change, it is necessary not to change

**More low-level/advanced stuff:**

-   Everyone should know how amazing compilers are: <https://www.youtube.com/watch?v=w0sz5WbS5AM>

-   (Chandler Carruth) Hybrid Data Structures: <https://www.youtube.com/watch?v=vElZc6zSIXM>

-   

**C++ (from The Cherno)**

**Last video**: "How C++ Works" (<https://www.youtube.com/watch?v=SfGuIVzE_Os>)

**Leave this until after my exams.**

**Resources**

Full C++ playlist from The Cherno: <https://www.youtube.com/playlist?list=PLlrATfBNZ98dudnM48yfGUldqGD0S4FFb>

FreeCodeCamp: Full C++ course (a bit too basic maybe): <https://www.youtube.com/watch?v=vLnPwxZdW4Y>

What are pointers? (One Lone Coder): <https://www.youtube.com/watch?v=iChalAKXffs>

Data-Oriented Demo (mostly about JAI, from Jonathan Blow, but some C++ as well): <https://www.youtube.com/watch?v=ZHqFrNyLlpA>

**Header 2**

Lala
