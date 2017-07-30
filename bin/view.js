// Code for managing the view (i.e. text output etc)

// A simple HTML lexer for breaking down raw HTML text into tags and
// text
function HtmlLexer(rawText)
{
	this.rawText = rawText;
}

HtmlLexer.prototype.readNext = function() {
	// Our lexer only looks for tags and lets the browser's HTML parser take
	// care of entities and the rest.
	var str = this.rawText;
	var firstLt = str.indexOf('<');
	if (firstLt > 0)
	{
		// Let everything up until the start of the tag pass through to the
		// browser's HTML parser.
		this.rawText = str.substring(firstLt);
		return str.substring(0, firstLt);
	}
	else if (firstLt == 0)
	{
		// I'm basically winging the HTML lexing here. I don't know if this
		// is really the correct way to lex things. The official HTML rules
		// take up many pages and I'm too lazy to trace through them.
		
		// We've encountered a < meaning there's the start of some sort of tag. Depending
		// on how the tag starts, there are different endings for the tag.
		var tagStartType = '<';
		var tagEndExpected = '>';
		if (str.startsWith('<!--')) {
			tagStartType = '<!--';
			tagEndExpected = '-->';
		} else if (str.startsWith('<?')) {
			tagStartType = '<?';
			tagEndExpected = '>';
		} else if (str.startsWith('<![CDATA[')) {
			tagStartType = '<![CDATA[';
			tagEndExpected = ']]>';			
		} else if (str.startsWith('<!')) {
			tagStartType = '<!';
			tagEndExpected = '>';
		}
		
		// See if we have a full tag or not.
		if (str.substring(tagStartType.length).indexOf(tagEndExpected) == -1) 
		{
			// We have an incomplete tag. Just bail then.
			return null;
		}
		// Extract out the tag
		var endOfTagPos = tagStartType.length + str.substring(tagStartType.length).indexOf(tagEndExpected) + tagEndExpected.length;
		var tag = str.substring(0, endOfTagPos);
		this.rawText = str.substring(endOfTagPos);
		return tag;
	}
	else
	{
		// Just dump everything leftover for the browser to handle
		this.rawText = '';
		return str;
	}
};

// Given the text <a b='3'>, it will return 'a'
HtmlLexer.prototype.isOpeningTag = function(tagText) {
	return tagText[1] != '/' && tagText[1] != '!' && tagText[1] != '?';
};

HtmlLexer.prototype.isWhitespaceChar = function(ch) {
	return (ch == '\r' || ch == '\f' || ch == '\n' || ch == '\t' 
			|| ch == ' ');
};

// Given the text <a b='3'>, it will return 'a'
HtmlLexer.prototype.parseTagName = function(tagText) {
	var name = '';
	var idx = 1;
	var ch = tagText[idx];
	while (!this.isWhitespaceChar(ch) && ch != '/' && ch != '>')
	{
		name += ch;
		idx++;
		ch = tagText[idx];
	}
	return name;
};

// Given the text <a b='3' c =3>, it will return {b:'3', c:'3'}
HtmlLexer.prototype.parseTagAttributes = function(tagText) {
	var attribs = {};

	// Skip the tag name
	var idx = 1;
	var ch = tagText[idx];
	while (!this.isWhitespaceChar(ch)&& ch != '/' && ch != '>')
	{
		idx++;
		ch = tagText[idx];
	}

	while (true)
	{
		// Skip whitespace
		while (this.isWhitespaceChar(ch))
		{
			idx++;
			ch = tagText[idx];
		}

		// Read attribute name
		var attribName = '';
		while (!this.isWhitespaceChar(ch) && ch != '>' && ch != '/' && ch != '=')
		{
			attribName += ch;
			idx++;
			ch = tagText[idx];
		}

		if (attribName == '') break;

		// Skip whitespace
		while (this.isWhitespaceChar(ch))
		{
			idx++;
			ch = tagText[idx];
		}

		// Check if there's an equals sign
		if (ch != '=')
		{
			attribs[attribName] = null;
			continue;
		}

		// Remove the equals sign
		idx++;
		ch = tagText[idx];

		// Skip whitespace
		while (this.isWhitespaceChar(ch))
		{
			idx++;
			ch = tagText[idx];
		}

		// Check if there's a quote sign
		var attribValue = '';
		if (ch == '"' || ch == "'")
		{
			var quote = ch;
			idx++;
			ch = tagText[idx];
			while (ch != quote && idx < tagText.length)
			{
				attribValue += ch;
				idx++;
				ch = tagText[idx];
			}
			if (ch == quote)
			{
				idx++;
				ch = tagText[idx];
			}
		}
		else
		{
			while (!this.isWhitespaceChar(ch) && ch != '/' && ch != '>')
			{
				attribValue += ch;
				idx++;
				ch = tagText[idx];
			}	
		}
		attribs[attribName] = attribValue;
		
		// We have the possibility of reading past the end of the tag 
		// when reading attribute values.
		if (idx >= tagText.length)
			break;
	}

	return attribs;
};

HtmlLexer.prototype.lowercaseTagAttributes = function(attribs) {
	var lowerAttribs = {};
	for (var key in attribs)
	{
		lowerAttribs[key.toLowerCase()] = attribs[key];
	}
	return lowerAttribs;
};

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
};

TadsView.prototype.parseHtmlInto = function(str, element)
{
	var processedHtml = "";
	// Run through the HTML to parse it
	
	// Our lexer only looks for tags and lets the browser's HTML parser take
	// care of entities and the rest.
	var lexer = new HtmlLexer(str);
	var next = lexer.readNext();
	while (next != null && next.length > 0)
	{
		if (next.startsWith('<') && lexer.isOpeningTag(next))
		{
			// DO SPECIAL TAG PROCESSING HERE
			var tagName = lexer.parseTagName(next).toLowerCase();
			var tagAttribs = lexer.lowercaseTagAttributes(lexer.parseTagAttributes(next));
			if (tagName == 'tab')
			{
				// The <tab> tag never made it out of HTML 3. We'll only
				// handle the simple case of tab multiple for now
				if ('multiple' in tagAttribs)
				{
					var numTabs = parseInt(tagAttribs.multiple);
					next = '&nbsp;'.repeat(numTabs);
				}
			}
		}
		processedHtml += next;
		
		// Move on to the next bit of HTML.
		next = lexer.readNext();
	}
	
	// We have leftover bits of an incomplete tag. Just let the browser
	// figure it out
	if (next == null)
	{
		processedHtml += lexer.rawText;
	}
	
	// Put everything we have into the document.
	element.appendChild(this.stringHtmlToDocumentFragment(processedHtml));
}

TadsView.prototype.forceBufferedOutputFlush = function() {
	var str = this.bufferedOutput;
	this.bufferedOutput = "";
	if (this.outputStatus == 0)
	{
		if (this.isHtmlMode)
		{
			this.parseHtmlInto(str, this.transcript);
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
			this.parseHtmlInto(str, this.statusLine);
		}
		else
		{
			if (this.plainStatusLineDiv == null)
			{
				this.plainStatusLineDiv = document.createElement('div');
				this.plainStatusLineDiv.style.whiteSpace = 'pre-wrap';
				this.transcript.appendChild(this.plainStatusLineDiv);
			}
			this.plainStatusLineDiv.appendChild(document.createTextNode(str));
		}
	}
};

// In HTML mode, we may receive partial tags and incomplete HTML output
// that we need to hold-off from displaying until we figure out how to
// interpret it. On user input though, we want to force everything onto 
// the screen. We will resolve ambiguities in the HTML output as 
// appropriate in order to do so.
TadsView.prototype.outputFlushBeforeInput = function() {
	this.forceBufferedOutputFlush();
};

// Puts the given input element at the current transcript position
TadsView.prototype.showInputElement = function(el) {
	if (this.isHtmlMode)
	{
		this.transcript.appendChild(el);
	}
	else
	{
		if (this.plainTranscriptDiv == null)
		{
			this.plainTranscriptDiv = document.createElement('div');
			this.plainTranscriptDiv.style.whiteSpace = 'pre-wrap';
			this.transcript.appendChild(this.plainTranscriptDiv);
		}
		this.plainTranscriptDiv.appendChild(el);
	}
	el.style.display = '';
	// Shrink the input element initially to get its position
	el.style.width = '1em';
	// Figure out the position of the prompt, so we can size the width to
	// fill the rest of the line.
	var left = el.offsetLeft;
	el.style.width = 'calc(100% - ' + (left + 1) + 'px)';
};