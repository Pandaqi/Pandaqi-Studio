**Getting Started with Heaps.io**

**Heaps.io** is one of those game engines that is not getting enough attention. It's fast, it's free, it's open source, it uses the Haxe language (which I personally think is a great language for any type of programmer), what's there not to like?

Well, as you'll quickly see after a few Google sessions, the *information* about it is rather scarce.

There's a documentation, but it leaves out many bits of the engine, or common things people might want to do. There are (extremely) short guides on how to actually compile your project, which are usually outdated, which means I spent three days trying to get my game into an executable.

In this guide, I want to resolve those issues. I want to help you actually get started with Heaps.io, teach you how to do the most common operations, give some tips, and hopefully allow you to create your next dream game in Heaps.io :)

So, let's get started!

**Installation**

Installation is extremely simple and quick. Both the language, engine, and libraries around it are very small.

-   Download and install the Haxe language.
-   Haxe works via the "install everything from the command line"-system. If you want something, you just type "haxelib install \<name>". So, let's install heaps and its dependencies:
    -   Haxelib install heaps
    -   Haxelib install ...
-   Download and install HashLink. Set your PATH variable so that it can find hl. (TO DO: Link/explanation here)
-   Install a code editor. I recommend Visual Studio Code. It has a set of extensions (called Haxe Extension Pack) which does all the work for you and gives you some great tools.

**What is HashLink?** Haxe has one main feature: it can be compiled into *other* languages. That's what HashLink (or HL) does. You give it a haxe program as input, and it spits out the program in a different language:

\<CODE HERE>

**Why is that necessary?** Most game engines these days boast about being "cross-platform": you can make your game once and compile it to any platform! This is a good thing, but it also means people seem to forget that it's not *straightforward* to do so. Different platforms use completely different systems, libraries and languages.

So, if you want to export your game to multiple platforms, you'll need a combination of HashLink + some platform specific tool. (Don't worry if you do not understand this at the moment, I'll explain it properly soon.)

First, HashLink must convert the code to C (or C++) code:

\<CODE HERE>

Then you must use a specific tool to convert that code to an executable. On windows, we typically use "gcc", like this:

\<CODE HERE>

**Starting a new/empty project:**

Start a new project.

Create a Main.hx file that looks somewhat like this:

\<CODE HERE>

This is the *entry point* of your program. Whenever your game is started, it looks for this file, and executes it. It's your responsibility to make sure this program sets up the rest of your game, because the computer isn't going to call anything besides your entry point.

As the comments point out, this simply creates a text field with some text. If you don't see that on your screen, there's something wrong.

Now create a compile.hx file that looks like this:

-lib heaps
-lib hldx
-hl output.hl
-main Main

This file tells the computer *how* you want the project compiled. In this case, include the libraries mentioned, use HashLink, and use our entry point created above.

This is enough for creating a project. **However**, there's a good chance you want something that's easier to test.

For this, you need to create a (debug) build configuration in Visual Studio. One that uses HashLink to quickly create your program and launch it.

\<CODE HERE>

You should be able to run this every time you want to test your code, and a window should pop up containing your game (after several seconds).

**If Visual Studio gives errors**, try the following things:

-   Obviously, first check if something's wrong with your code. (You can even make mistakes copying code. Especially if it turns out to be bad/outdated code :p)
-   Check the Haxe plugin settings. Check if it has the correct path to HashLink (and some other library I'm forgetting?)
-   Restart. (After changing something, it's always wise to do a restart, just to be sure.)

**It is that simple** ... or that hard, depending how you look at it.

I found installation, setup and first steps to be a breeze. I found more advanced Heaps development and actual compilation to be a nightmare.

Hopefully, this guide will lift some of the mystery around it, so future developers don't have this experience.

**Compilation**

As stated at the start, if you want to target a certain platform, you need to do it yourself.

**Step 1** is always to convert your Haxe code to C code. This has a relatively simple command:

> haxe ---macro include('modules') -lib heaps -lib domkit -lib hldx -lib utest -lib tweenxcore -hl out/main.c -main Main

If you've added more libraries during the development, don't forget to type them here as well.

This should generate an "out" folder and place your game, converted to native C code, inside of it.

**Step 2** is the hard part. Almost all platforms accept C (or C++) code, they just have different methods of turning it into an executable or single package.

**Windows**

Install MinGW. Set PATH to point at it. This gives you a "gcc" command.

What

Don't forget to install 64-bit and point PATH variable to 64-bit one!

When you have the MinGW installer, don't select the i686 architecture. Select the x86_64 one. It should install (by default) to Program Files (not Program Files(x86)).

Now point a PATH variable to C:\\Program Files\\MinGw\\ ... \\ bin

Test it by opening a command window and typing "gcc". It should return an error *from the gcc program* like "gcc: fatal error: no input files", which is what you want. (It means the terminal can recognize the command correctly.)

**Things to remember:**

-   Specify input (main.c)
-   Specify output
-   Use -I blabla/include to get the *hashlink includes*
-   Use -I. (MIND THE DOT) for any other libraries
-   Give the full path to the libraries.
-   The parameters (such as -lhl) are usually not recognized? What's up?
-   The parameter **l\<name>** links a library with that name. The parameter **L\<path>** links a library path.
-   It seems that **-I** is for inclusion. **-I.** tells the linker "include everything within this directory", hence the dot.

SOURCES:

-   <https://github.com/HaxeFoundation/hashlink/issues/124>
-   <https://community.heaps.io/t/how-to-compile-c-files-generated-by-hashlink/74>
-   <https://haxe.org/manual/target-hl-c-compilation.html>
-   ??
-   <https://community.heaps.io/t/distribution-options/60/7> (working implementation on windows?)

**This compiles: but has "undefined reference to \_\_imp\_\_"**

gcc main.c -o main -I C:\\hl-1.11.0-win\\include -I. C:\\hl-1.11.0-win\\sdl.hdll C:\\hl-1.11.0-win\\fmt.hdll C:\\hl-1.11.0-win\\openal.hdll C:\\hl-1.11.0-win\\ui.hdll C:\\hl-1.11.0-win\\uv.hdll -lhl -lSDL2 -lm -lopenal -lGL

**This compiles: but says "cannot find -lhl"**

gcc main.c -o main -I C:\\hl-1.11.0-win\\include -I. -lhl C:\\hl-1.11.0-win\\sdl.hdll

**Ah yes, you must set the inclusion AFTER the library**

gcc main.c -o main -I C:\\hl-1.11.0-win\\include -I. C:\\hl-1.11.0-win\\sdl.hdll -lhl

**Okay, sdl is the HashLink standard library. SDL2 is the Graphics Library?**

gcc main.c -o main -I C:\\hl-1.11.0-win\\include -I. C:\\hl-1.11.0-win\\sdl.lib -lhl

gcc main.c -o main -I C:\\hl-1.11.0-win\\include -I. -LC:\\hl-1.11.0-win\\sdl.hdll -lhl

**Simpler:**

gcc -o main.exe main.c -I C:\\hl-1.11.0-win\\include -I. -lhl C:\\hl-1.11.0-win\\sdl.hdll

NO WAIT, here they say that you do need the libhl.dll!

<https://github.com/HaxeFoundation/hashlink/wiki/Distribution-&--Packaging>

gcc -o main.exe main.c -I C:\\hl-1.11.0-win\\include -I. C:\\hl-1.11.0-win\\libhl.dll -lhl

**Using the CL interface (from Visual Studio Build Tools)**

cl out\\main.c out.exe /I C:\\hl-1.11.0-win\\include /I C:\\hl-1.11.0-win \\directx.lib C:\\hl-1.11.0-win\\fmt.lib C:\\hl-1.11.0-win\\hl.lib C:\\hl-1.11.0-win\\libhl.lib C:\\hl-1.11.0-win\\mysql.lib C:\\hl-1.11.0-win\\openal.lib C:\\hl-1.11.0-win\\sdl.lib C:\\hl-1.11.0-win\\sqlite.lib C:\\hl-1.11.0-win\\ssl.lib C:\\hl-1.11.0-win\\ui.lib C:\\hl-1.11.0-win\\uv.lib

cl /Ox /Fo out/main /Fe app.exe -I C:\\hl-1.11.0-win\\include -I csrc out/main.c C:\\hl-1.11.0-win \\directx.lib C:\\hl-1.11.0-win\\fmt.lib C:\\hl-1.11.0-win\\hl.lib C:\\hl-1.11.0-win\\libhl.lib C:\\hl-1.11.0-win\\mysql.lib C:\\hl-1.11.0-win\\openal.lib C:\\hl-1.11.0-win\\sdl.lib C:\\hl-1.11.0-win\\sqlite.lib C:\\hl-1.11.0-win\\ssl.lib C:\\hl-1.11.0-win\\ui.lib C:\\hl-1.11.0-win\\uv.lib

**THIS ONE DID IT! WE WON! YAY!**

**What was the problem?** I tried to compile as x86, while the linker files were all made for x64. That's why they weren't recognized/used.

**Open "x64 Native Tools Command Prompt for VS 2019"**

**Type "cd \<directory to project>"**

**Do this:**

cl out/main.c -I out -I C:/hl-1.11.0-win/include /link /LIBPATH:C:/hl-1.11.0-win hl.lib libhl.lib directx.lib openal.lib fmt.lib ui.lib /MACHINE:x64

Check the bottom of this thread for REMOVING the console window (in an elegant way): <https://community.heaps.io/t/how-to-compile-c-files-generated-by-hashlink/74/11>

Good tutorial on command line arguments and what to do with GCC: <https://stackoverflow.com/questions/47379128/gcc-to-compile-compile-64-bit>

**What I also learned**

If you do not embed your resources, you must of course copy the whole folder to the same as where your .exe is

And you must copy all the **hdll** you used to that same folder as well!

(So, a "single executable", is really not a single one.)
