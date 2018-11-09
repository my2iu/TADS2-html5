var runMainImmediately = false;  // Start the TADS WASM code as soon as it is ready (all other configuration from the main UI thread has already been done)
var emscriptenReady = false;
  
importScripts('lib/tr.js');

function callAndWait(fn)
{
	var val = Atomics.load(tadsWorkerLock, 0);
	fn();
	Atomics.wait(tadsWorkerLock, 0, val);
}

// Implementation of in-memory files that hold file contents in the 
// worker thread before we send the contents back and forth to the 
// main UI thread
function EsInMemoryFile(filename, fileContents) 
{
	this.filename = filename;
	this.fileContents = fileContents;
	this.size = fileContents.length;
}
EsInMemoryFile.prototype.pos = 0;
EsInMemoryFile.prototype.fileContents = null;
EsInMemoryFile.prototype.size = 0;
EsInMemoryFile.prototype.filename = '';
EsInMemoryFile.prototype.growBuffer = function(size) {
	if (size < this.fileContents.length) return;
	var newSize = Math.max(8, this.fileContents.length);
	while (newSize < size) newSize *= 2;
	var newFileContents = new Uint8Array(newSize);
	for (var n = 0; n < this.fileContents.length; n++)
		newFileContents[n] = this.fileContents[n];
	this.fileContents = newFileContents;
};
EsInMemoryFile.nextFileId = 0;
EsInMemoryFile.files = {};

// Start loading the WASM code (Use our own loader that isn't subject
// to restrictions requiring developers to start their own web server 
// for testing)
var Tads = null;
var xmlhttp = new XMLHttpRequest();
xmlhttp.addEventListener("load", function(e) {
	// We've downloaded the WASM code, so go compile it and start it running.
	var Module = {
		wasmBinary: xmlhttp.response
	}
	xmlhttp = null;
	TadsLoader(Module).then(function(loaded) {
		Tads = loaded;
		emscriptenReady = true;
		if (runMainImmediately)
			Tads._tads_worker_main();
	});
});
xmlhttp.responseType = 'arraybuffer';
xmlhttp.open("GET", "lib/tr.wasm");
xmlhttp.send();

// Gets the TADS interpreter to start when it is ready
function main()
{
	// Call into the TADS interpreter
	if (emscriptenReady)
		Tads._tads_worker_main();
	else
		runMainImmediately = true;

	// Game has ended. Tell the main UI thread.
	callAndWait(function() {
		postMessage({type: 'end'});
	});
}

var tadsWorkerLock;
var passbackBuffer;
var testCount;

// Listen for messages from the parent
addEventListener('message', function(evt) {
	evt.preventDefault();
	switch (evt.data.type)
	{
		case 'synchBuffer':
			var sharedArray = evt.data.synch;
			tadsWorkerLock = new Int32Array(sharedArray);
			break;
		case 'passbackBuffer':
			var passbackArray = evt.data.buf;
			passbackBuffer = new Uint8Array(passbackArray);
			break;

		case 'start':
			main();
			break;
	}
});

