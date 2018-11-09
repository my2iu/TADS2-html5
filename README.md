# TADS2-html5

*This project requires browser support for the SharedArrayBuffer feature. Unfortunately, that feature was removed from all browsers except for Google Chrome for Mac/Win/Linux [due to](https://www.chromium.org/Home/chromium-security/ssca) [security](https://blogs.windows.com/msedgedev/2018/01/03/speculative-execution-mitigations-microsoft-edge-internet-explorer) [concerns](https://blog.mozilla.org/security/2018/01/03/mitigations-landing-new-class-timing-attack/) that are currently only Google Chrome has resolved.*

A very rough proof-of-concept port of the [TADS 2](http://tads.org/) interpreter for HTML5. It recompiles the TADS2 interpreter code into JavaScript using Emscripten. 

If you just want to play games, I've uploaded a copy to [itch.io that you can use immediately](https://my2iu.itch.io/tads-2-interpreter). To run it yourself, download the code, then visit the `index.html` file in the `bin` directory in a browser. Due to browser security restrictions, you must run the code from a web server. If you just try to view the `index.html` file on disk, it will [not work](#running-from-disk). 

The code requires newer JavaScript features that are available in the most recent browsers or will be available soon. The features it needs is support for shared array buffers and synchronization primitives. These features are already available in Safari and Chrome v60. It is expected to be available in Firefox by the end of August 2017, and in Edge for the Fall 2017 update release.

## What Works?
Although the interpreter seems to work fine, it is intended as more of a proof of concept, so it's not particularly polished or fully featured. It is useful for the preservation of older TADS 2 games and to serve as an architectural guide for creating similar interpreters. The code has very rudimentary support for HTMLTADS, allowing for simple formatting and the showing of images (even those embedded in .GAM files). Full HTMLTADS support requires the writing of a late-1990s, early 2000s era browser engine, so having full fidelity HTMLTADS output is unlikely. Very basic support for game loading and saving has been implemented. It could use better handling of scrolling, animated scrolling effects, plus improved keyboard controls.

## Automatically Starting a Game
If you are embedding the interpreter on a website and want it to automatically start a game when it loads up, simply supply the name of the game file as a hash in the URL, like `index.html#!file=game.gam` to automatically start the game file `game.gam`.

## Running from Disk
Although it is not recommended, you can disable the security restrictions in your browser to let you run the `index.html` interpreter in your browser from disk instead of needing to host in on a web page. To do so in Chrome, you must start Chrome with the `--allow-file-access-from-files` command-line option. To do so in Safari, you must go into the Safari menu...Preferences...Advanced (tab)...Show Develop menu. Then you go to the Develop menu...Disable Local File Restrictions.

## Technical Details
Since the TADS interpreter often blocks while waiting for input, it doesn't work well with the JavaScript event-driven model. I looked into JavaScript's support for generators and await/async, but they seemed to be too messy to be usable with code ported with Emscripten. I tried Emscripten's Emterpreter and Asyncify modes, but I encountered problems that I couldn't figure out. In the end, I went with using features from the new shared array buffer specification, which contains support for blocking synchronization primitives for non-UI threads. 

The TADS interpreter runs in a separate Web Worker thread. When it needs to do blocking I/O, it will send a message to the main JavaScript thread and then put itself to sleep. The main JavaScript thread will then do the I/O using normal HTML5 code, send the results to the TADS interpreter using shared memory, and then wake the TADS interpreter thread.

The code can be compiled by unzipping [`tads_src-2516.zip`](http://www.ifarchive.org/if-archive/programming/tads2/source/htads_src_2516.zip) into the `tads2` directory and then running the `BUILD.BAT` script (this assumes that you are using a Windows machine and that you have Emscripten installed). Running that build script will compile the C code of the TADS interpreter to the JavaScript file `bin/lib/tr.js`.

- The `tadsunix` directory contains code that came from the source [`tads23-unix.tar.gz`](http://www.ifarchive.org/if-archive/programming/tads2/source/tads23-unix.tar.gz). 
- The `tads2es6` directory contains C/C++ and JavaScript code for interfacing with html5 and the main UI thread
- The `bin` directory contains the main UI code and the web worker code which starts the C TADS2 interpreter code
