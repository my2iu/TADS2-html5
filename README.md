# TADS2-html5
A very rough proof-of-concept port of the [TADS 2](http://tads.org/) interpreter for HTML5. It recompiles the TADS2 interpreter code into JavaScript using Emscripten

To run it, download the code, then visit the `index.html` file in the `bin` directory in a browser. The code requires newer JavaScript features that are available in the most recent browsers or will be available soon.

The features it needs is support for shared array buffers and synchronization primitives. These features are already available in Safari and Chrome v60. It is expected to be available in Firefox by the end of August 2017, and in Edge for the Fall 2017 update release.

## Technical Details
Since the TADS interpreter often blocks while waiting for input, it doesn't work well with the JavaScript event-driven model. I looked into JavaScript's support for generators and await/async, but they seemed to be too messy to be usable with code ported with Emscripten. I tried Emscripten's Emterpreter and Asyncify modes, but I encountered problems that I couldn't figure out. In the end, I went with using features from the new shared array buffer specification, which contains support for blocking synchronization primitives for non-UI threads. 

The TADS interpreter runs in a separate Web Worker thread. When it needs to do blocking I/O, it will send a message to the main JavaScript thread and then put itself to sleep. The main JavaScript thread will then do the I/O using normal HTML5 code, send the results to the TADS interpreter using shared memory, and then wake the TADS interpreter thread.

The code can be compiled by unzipping [`tads_src-2516.zip`](http://www.ifarchive.org/if-archive/programming/tads2/source/htads_src_2516.zip) into the `tads2` directory and then running the `BUILD.BAT` script (this assumes that you are using a Windows machine and that you have Emscripten installed). Running that build script will compile the C code of the TADS interpreter to the JavaScript file `bin/lib/tr.js`.

- The `tadsunix` directory contains code that came from the source [`tads23-unix.tar.gz`](http://www.ifarchive.org/if-archive/programming/tads2/source/tads23-unix.tar.gz). 
- The `tads2es6` directory contains C/C++ and JavaScript code for interfacing with html5 and the main UI thread
- The `bin` directory contains the main UI code and the web worker code which starts the C TADS2 interpreter code
