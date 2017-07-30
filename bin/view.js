// Code for managing the view (i.e. text output etc)

function TadsView(transcriptElement, statusLineElement)
{
	this.outputStatus = 0;
	this.transcript = transcriptElement;
	this.statusLine = statusLineElement;
	this.isHtmlMode = false;
}

// Where output goes to (0 = main, 1 = status, other = suppress)
TadsView.prototype.setOutputStatus = function(out) {
	this.outputStatus = out;
};

TadsView.prototype.startHtml = function() {
	this.isHtmlMode = true;
};

TadsView.prototype.endHtml = function() {
	this.isHtmlMode = false;
};

TadsView.prototype.plain = function() {
	this.isHtmlMode = false;
};

TadsView.prototype.print = function(str) {
	if (this.outputStatus == 0)
	{
		this.transcript.appendChild(document.createTextNode(str));
		// Scroll to bottom
		document.body.scrollTop = document.body.scrollHeight;
	}
	else if (this.outputStatus == 1)
	{
		this.statusLine.appendChild(document.createTextNode(str));
	}
};
