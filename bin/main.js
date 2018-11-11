var tadsVer = 2;
var tadsView;
var userInputField;
var openedFiles = {};

var lock;
var tadsWorker; 
var workerBuffer = null;
var asyncExpecting = null;
function wakeTadsWorker()
{
	Atomics.xor(lock, 0, 1);
	Atomics.wake(lock, 0, 1);
}

// We save a <span> in the transcript in the position where you made your last
// input so that we can keep it on screen when scrolling the transcript.
var lastInputScrollbackSpan = null;

// So we can cancel a scroll animation and restart it
var scrollAnimateTimeout = null;

// When the web worker has requested that a file be opened, the file
// will be copied in pieces (since the buffer is of limited size) from
// the main thread to the web worker. This stores the Uint8Array of the
// file being copied.
var openedFileBeingCopied = null;

// Game file that is to be run in the TADS interpreter when the interpreter
// starts up.
var gameFileArrayBuffer = null;

function handleTadsWorker(e)
{
	switch (e.data.type)
	{
		case 'printz':
		{
			tadsView.print(e.data.str);
			wakeTadsWorker();
			break;
		}
		case 'gets':
			tadsView.outputFlushBeforeInput();
			tadsView.showInputElement(userInputField);
			focusUserInputWithoutScrolling();
			pruneTranscriptAndScroll(lastInputScrollbackSpan);
			asyncExpecting = 'gets';
			break;
		case 'getc':
			tadsView.outputFlushBeforeInput();
			tadsView.showInputElement(userInputField);
			focusUserInputWithoutScrolling();
			pruneTranscriptAndScroll(lastInputScrollbackSpan);
			asyncExpecting = 'getc';
			break;
		case 'end':
			// Interpreter has exited. Flush the output so final messages
			// can be seen.
			tadsView.outputFlushBeforeInput();
			pruneTranscriptAndScroll(lastInputScrollbackSpan);
			wakeTadsWorker();
			break;
		case 'askfile':
		{
			tadsView.outputFlushBeforeInput();
			pruneTranscriptAndScroll(lastInputScrollbackSpan);
			var prompt = e.data.prompt;
			var promptType = e.data.promptType;
			var fileType = e.data.fileType;
			// We'll only handle a few restricted cases for now
			if (promptType == 1)
			{
				// Restoring a saved game
				asyncExpecting = 'askfile';

				var fileFilter = false;
				// Filetype 1 = saved game
				if (fileType == 1) {
					fileFilter = ".sav";
				}

				launchFileChooserWrapper(prompt, fileFilter, function(file) {
					if (file == null) {
						asyncExpecting = null;
						workerBuffer[0] = 0;
						wakeTadsWorker();
						return;
					}
					// Read in all the data as an array buffer
					var reader = new FileReader();
					reader.onload = function(evt) {
						if (asyncExpecting != 'askfile') return;
						asyncExpecting = null;
						// Assign an arbitrary name to the opened file
						var fname = file.name;
						openedFiles[fname] = reader.result;
						writeStringZToWorkerBuffer(fname, workerBuffer, 0);
						wakeTadsWorker();
					};
					reader.onerror = function(evt) {
						if (asyncExpecting != 'askfile') return;
						asyncExpecting = null;
						workerBuffer[0] = 0;
						wakeTadsWorker();
					}
					
					reader.readAsArrayBuffer(file);
				});
			}
			else if (promptType == 2) 
			{
				// Saving a game
				var fname = '?save1.sav';
				writeStringZToWorkerBuffer(fname, workerBuffer, 0);
				wakeTadsWorker();
			}
			else
			{
				workerBuffer[0] = 0;
				wakeTadsWorker();
			}
			break;
		}
			
		case 'openfile':
			var fname = e.data.name;
			if (fname == 'game.gam')
			{
				(new Int32Array(workerBuffer.buffer))[0] = gameFileArrayBuffer.byteLength;
				openedFileBeingCopied = new Uint8Array(gameFileArrayBuffer);
				wakeTadsWorker();
			}
			else if (openedFiles[fname] != null)
			{
				(new Int32Array(workerBuffer.buffer))[0] = openedFiles[fname].byteLength;
				openedFileBeingCopied = new Uint8Array(openedFiles[fname]);
				wakeTadsWorker();
			}
			else
				throw 'Requesting unknown file';
			break;
		case 'readfile':
			var offset = e.data.offset;
			if (offset == -1)
			{
				openedFileBeingCopied = null;
			}
			else
			{
				for (var n = offset; n < Math.min(offset + workerBuffer.length, openedFileBeingCopied.length); n++)
					workerBuffer[n - offset] = openedFileBeingCopied[n];
				wakeTadsWorker();
			}
			break;
		case 'transferfile':
			if (e.data.name == '?save1.sav') 
			{
				var saveLink = document.createElement('a');
				var blob = new Blob([e.data.contents], {type:'application/x-tads-save'});
				saveLink.href = URL.createObjectURL(blob);
				saveLink.download = 'tads2SaveGame.sav';
				saveLink.click();
			}
			else
			{
				console.log("We've been asked to save a file, but we don't know why");
			}
			wakeTadsWorker();
			break;
		case 'start_html':
			tadsView.startHtml();
			wakeTadsWorker();
			break;
		case 'end_html':
			tadsView.endHtml();
			wakeTadsWorker();
			break;
		case 'more_prompt':
			tadsView.outputFlushBeforeInput();
			pruneTranscriptAndScroll(lastInputScrollbackSpan);
			wakeTadsWorker();
			break;
		case 'plain':
			tadsView.plain();
			wakeTadsWorker();
			break;
		case 'status':
			tadsView.setOutputStatus(e.data.stat);
			wakeTadsWorker();
			break;
		case 'get_status':
			(new Int32Array(workerBuffer.buffer))[0] = tadsView.outputStatus;
			wakeTadsWorker();
			break;
		case 'score':
			// postMessage({type: 'score', cur: cur, turncount: turncount});
			wakeTadsWorker();
			break;
		case 'strsc':
			// postMessage({type: 'strsc', str: str});
			wakeTadsWorker();
			break;
		default:
			throw 'Unknown message from TADS';
	}
}
function prestartTadsWebWorker()
{
	// The web worker is a few MB, so it might be slow to
	// download initially, so we want to start it loading
	// as soon as possible.
	var workerJs = (tadsVer == 2 ? 'tads2worker.js' : 'tads3worker.js');
	tadsWorker = new Worker(workerJs);
	tadsWorker.onmessage = handleTadsWorker;
}
function startTadsWebWorker()
{
	// Create a shared buffer that can be used for synchronization
	var sharedArray = new SharedArrayBuffer(8);
	lock = new Int32Array(sharedArray);
	tadsWorker.postMessage({type: 'synchBuffer', synch: sharedArray});
	
	// Create a shared buffer for passing data back to the worker without
	// requiring a postMessage (because the web worker won't ever exit 
	// its event handler, so it can't check its messages)
	var workerPassthroughArray = new SharedArrayBuffer(128 * 1024);
	tadsWorker.postMessage({type: 'passbackBuffer', buf: workerPassthroughArray});
	workerBuffer = new Uint8Array(workerPassthroughArray);
	
	// Start off the TADS interpreter
	tadsWorker.postMessage({type: 'start'});
}
function writeStringZToWorkerBuffer(str, buffer, offset)
{
	let utf8Text = new TextEncoder().encode(str);
	for (let n = 0; n < utf8Text.length; n++)
		workerBuffer[offset + n] = utf8Text[n];
	workerBuffer[offset + utf8Text.length] = 0;
	return utf8Text.length + 1;
} 
function hookUi()
{
	var promptForm = document.querySelector('#promptForm');
	userInputField = promptForm.querySelector('input.userInput');
	promptForm.addEventListener('submit', function(evt) {
		evt.preventDefault();
		if (window.asyncExpecting == 'gets')
		{
			lastInputScrollbackSpan = tadsView.getCurrentScrollbackSpan();
			window.asyncExpecting = null;
			let val = userInputField.value;
			// Echo the user input back to the screen since
			// we will clear and reuse the input field where the
			// player actually entered their input.
			tadsView.appendUserInput(val);
			userInputField.value = '';
			writeStringZToWorkerBuffer(val, workerBuffer, 0);
			userInputField.style.display = 'none';
			wakeTadsWorker();
		}
	});
	userInputField.addEventListener('keydown', function(evt) {
		var scroller = document.querySelector('#main');
		var SLOP = 20;
		if (scroller.scrollTop + scroller.offsetHeight < scroller.scrollHeight - SLOP)
		{
			animateScrollTo(scroller.scrollTop + scroller.offsetHeight - SLOP);
			evt.preventDefault();
			evt.stopPropagation();
		}
	});
	userInputField.addEventListener('keypress', function(evt) {
		if (window.asyncExpecting == 'getc')
		{
			lastInputScrollbackSpan = tadsView.getCurrentScrollbackSpan();
			evt.preventDefault();
			window.asyncExpecting = null;
			(new Int32Array(workerBuffer.buffer))[0] = evt.keyCode;//' '.charCodeAt(0);
			userInputField.style.display = 'none';
			wakeTadsWorker();
		}
	});
	promptForm.addEventListener('click', function(evt) {
		focusUserInputWithoutScrolling();
	});
}

function focusUserInputWithoutScrolling()
{
	var y = document.querySelector('#main').scrollTop;
	userInputField.focus({preventScroll: true});
	document.querySelector('#main').scrollTop = y;
}

function pruneTranscriptAndScroll(keepInView)
{
	var scroller = document.querySelector('#main');
	// Prune out transcript elements so that we only have a certain number of
	// screens of scrollback
	var SCROLLBACK_SCREENS = 10;
	var MIN_SCROLLBACK_ELS = 0;
	while (scroller.scrollHeight > SCROLLBACK_SCREENS * scroller.offsetHeight 
			&& tadsView.scrollbackSpans.length > MIN_SCROLLBACK_ELS
			&& tadsView.scrollbackSpans[0] != keepInView)
	{
		tadsView.pruneScrollbackBuffer();
	}
	
	// Calculate the desired scroll position
	var scrollPos = tadsView.getSpanScrollPosition(keepInView, scroller);
	animateScrollTo(scrollPos);
}

function animateScrollTo(pos)
{
	var scroller = document.querySelector('#main');
	
	var SCROLL_AMOUNT = 100;
	doScroll = function() {
		scrollAnimateTimeout = null;
		if (Math.abs(scroller.scrollTop - pos) < SCROLL_AMOUNT)
		{
			scroller.scrollTop = pos;
			return;
		}
		var orig = scroller.scrollTop;
		if (scroller.scrollTop < pos)
			scroller.scrollTop += SCROLL_AMOUNT;
		else
			scroller.scrollTop -= SCROLL_AMOUNT;
		if (scroller.scrollTop == orig)
			return;
		scrollAnimateTimeout = window.setTimeout(doScroll, 30);
	};
	if (scrollAnimateTimeout != null)
		window.clearTimeout(scrollAnimateTimeout);
	scrollAnimateTimeout = window.setTimeout(doScroll, 30);
	
}

function launchFileChooserWrapper(prompt, extension, onfile) {
	// File chooser must be launched from a user action (not the 
	// interpeter), so we must create a UI button that the user
	// can click to start the file chooser
	var div = document.createElement('div');
	document.body.appendChild(div);
	div.innerHTML = '<a href="javascript:void(0)">Click to load game</a> <a href="javascript:void(0)">Cancel</a>';
	div.style.position = 'fixed';
	div.style.left = '0';
	div.style.right = '0';
	div.style.top = '0';
	div.style.bottom = '0';
	div.style.backgroundColor = 'rgba(0,0,0,0.85)';
	div.style.textAlign = 'center';
	div.querySelectorAll('a')[0].onclick = function(e) {
		launchFileChooser(function(f) {
			document.body.removeChild(div);
			onfile(f);
		}, extension);
		e.preventDefault();
	};
	div.querySelectorAll('a')[1].onclick = function(e) {
		onfile(null);
		document.body.removeChild(div);
		e.preventDefault();
	};
}
function launchFileChooser(onfile, extension)
{
	var fileInput = document.createElement('input');
	fileInput.type = 'file';
	fileInput.style.display = 'none';
	document.body.appendChild(fileInput);
	if (extension) {
		fileInput.accept = extension;
	} else {
		fileInput.accept = undefined;
	}
	fileInput.onchange = function(e) {
		if (fileInput.files.length == 0) 
			onfile(null);
		else
			onfile(fileInput.files[0]);
		e.preventDefault();
		document.body.removeChild(fileInput);
	}
	fileInput.click();
}
function loadGameFileFromWeb(url, fileHandler)
{
	var xhttp = new XMLHttpRequest();
	var responded = false;
	xhttp.responseType = 'arraybuffer';
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4)
		{
			fileHandler(xhttp.response);
			responded = true;
		}
	}
	xhttp.onerror = function() {
		// On a missing file, we get both a readyState 4 and an error
		// but we only want to call the callback once.
		if (!responded)
			fileHandler(null);
	}
	xhttp.open("GET", url, true);
	xhttp.send();
}
function loadGameFileFromDisk(fileHandler)
{
	var ext = (tadsVer == 2 ? '.gam' : '.t3');
	document.querySelector('#openGamLink').onclick = function(e) {
		launchFileChooser(function(file) {
			if (file == null) return;
			var reader = new FileReader();
			reader.onload = function(evt) {
				fileHandler(reader.result);
			};
			reader.readAsArrayBuffer(file);
		}, ext);
		e.preventDefault();
	};
}

window.onload = function() {
	prestartTadsWebWorker();
	tadsView = new TadsView(document.querySelector('#transcript'), document.querySelector('#status'));
	hookUi();
	function gameFileLoaded(file)
	{
		if (file == null)
		{
			alert('Game file could not be loaded');
			return;
		}
		document.querySelector('#transcript').innerHTML = '';
		gameFileArrayBuffer = file;
		startTadsWebWorker();
		var resourceEntries = readGamIndex(gameFileArrayBuffer);
		tadsView.addResources(resourceEntries);
	}
	var gameUrl = null;
	// Check the has to see if we've been passed parameters to
	// immediately load a file
	if (location.hash.startsWith('#!file='))
	{
		gameUrl = decodeURIComponent(location.hash.substring('#!file='.length));
	}
	if (gameUrl == null)
	{
		loadGameFileFromDisk(gameFileLoaded);
	}
	else
	{
		document.querySelector('#openGamLink').style.display = 'none';
		loadGameFileFromWeb(gameUrl, gameFileLoaded);
	}
}
