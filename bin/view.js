// Code for managing the view (i.e. text output etc)

function TadsView(transcriptElement, statusLineElement)
{
	this.outputStatus = 0;
	this.transcript = transcriptElement;
	this.statusLine = statusLineElement;
	this.isHtmlMode = false;
	this.bufferedOutput = "";
	// We need a special div for formatting raw non-html text
	this.plainTranscriptDiv = null;  
	this.plainStatusLineDiv = null;  
}

TadsView.prototype.stringHtmlToDocumentFragment = function(str) {
	var div = document.createElement('div');
	div.innerHTML = str;
	var frag = document.createDocumentFragment();
	while (div.firstChild != null)
		frag.appendChild(div.firstChild);
	return frag;
};


// Where output goes to (0 = main, 1 = status, other = suppress)
TadsView.prototype.setOutputStatus = function(out) {
	if (this.outputStatus != out) {
		this.forceBufferedOutputFlush();
		// Clear the status line before we start writing to it.
		if (out == 1)
		{
			this.statusLine.innerHTML = '';  
			this.plainStatusLineDiv = null;
		}
	}
	this.outputStatus = out;
};

TadsView.prototype.switchToHtmlMode = function() {
	this.forceBufferedOutputFlush();
	this.plainTranscriptDiv = null;
	this.plainStatusLineDiv = null;
};

TadsView.prototype.switchToPlainMode = function() {
	this.forceBufferedOutputFlush();
	this.plainTranscriptDiv = null;
	this.plainStatusLineDiv = null;
};


TadsView.prototype.startHtml = function() {
	if (!this.isHtmlMode)
		this.switchToHtmlMode();
	this.isHtmlMode = true;
};

TadsView.prototype.endHtml = function() {
	if (this.isHtmlMode)
		this.switchToPlainMode();
	this.isHtmlMode = false;
};

TadsView.prototype.plain = function() {
	if (this.isHtmlMode)
		this.switchToPlainMode();
	this.isHtmlMode = false;
};

TadsView.prototype.print = function(str) {
	this.bufferedOutput = this.bufferedOutput + str;
};

TadsView.prototype.appendUserInput = function(val) {
	if (this.isHtmlMode)
		this.print(val + '<br>');
	else
		this.print(val + '\n');
}

TadsView.prototype.forceBufferedOutputFlush = function() {
	var str = this.bufferedOutput;
	this.bufferedOutput = "";
	if (this.outputStatus == 0)
	{
		if (this.isHtmlMode)
		{
			this.transcript.appendChild(this.stringHtmlToDocumentFragment(str));
		}
		else
		{
			if (this.plainTranscriptDiv == null)
			{
				this.plainTranscriptDiv = document.createElement('div');
				this.plainTranscriptDiv.style.whiteSpace = 'pre-wrap';
				this.transcript.appendChild(this.plainTranscriptDiv);
			}
			this.plainTranscriptDiv.appendChild(document.createTextNode(str));
		}
		// Scroll to bottom
		//document.body.scrollTop = document.body.scrollHeight;
	}
	else if (this.outputStatus == 1)
	{
		if (this.isHtmlMode)
		{
			this.statusLine.appendChild(this.stringHtmlToDocumentFragment(str));
		}
		else
		{
			this.statusLine.appendChild(document.createTextNode(str));
		}
	}
}

// In HTML mode, we may receive partial tags and incomplete HTML output
// that we need to hold-off from displaying until we figure out how to
// interpret it. On user input though, we want to force everything onto 
// the screen. We will resolve ambiguities in the HTML output as 
// appropriate in order to do so.
TadsView.prototype.outputFlushBeforeInput = function() {
	this.forceBufferedOutputFlush();
}