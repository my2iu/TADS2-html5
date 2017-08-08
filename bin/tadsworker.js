var Module = {
    onRuntimeInitialized: function() {
      emscriptenReady = true;
    }
};
var emscriptenReady = false;
  
importScripts('lib/tr.js');

function callAndWait(fn)
{
	var val = Atomics.load(tadsWorkerLock, 0);
	fn();
	Atomics.wait(tadsWorkerLock, 0, val);
}

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

function main()
{
	// Call into the TADS interpreter
	var tads_worker_main = Module.cwrap('tads_worker_main', 'number', []);
	if (emscriptenReady)
		tads_worker_main();
	else
		Module.onRuntimeInitialized = function() {
			tads_worker_main();
		}

	console.log('Exiting');
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

