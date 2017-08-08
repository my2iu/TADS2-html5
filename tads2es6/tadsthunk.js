mergeInto(LibraryManager.library, {
  js_gets: function(s, bufLength) {
	callAndWait(function() {
		postMessage({type: 'gets'});
	});
	for (var n = 0; n < Math.min(passbackBuffer.length, bufLength); n++)
	{
		setValue(s + n, passbackBuffer[n], 'i8');
	}
  },
	js_printz: function(s) {
		var str = UTF8ToString(s);
		callAndWait(function() {
			postMessage({type: 'printz', str: str});
		});
	},
	js_getc: function() {
		callAndWait(function() {
			postMessage({type: 'getc'});
		});
		return (new Int32Array(passbackBuffer.buffer))[0];
	},
	js_askfile: function(prompt, fname_buf, fname_len, prompt_type, file_type) {
		var promptStr = UTF8ToString(prompt);
		callAndWait(function() {
			postMessage({type: 'askfile', prompt: promptStr, 
				promptType: prompt_type, fileType: file_type});
		});
		for (var n = 0; n < Math.min(passbackBuffer.length, fname_len); n++)
		{
			setValue(fname_buf + n, passbackBuffer[n], 'i8');
		}
		if (passbackBuffer[0] == 0) return 0;
		return 1;
//		extern int js_askfile(const char *prompt, char *fname_buf, int fname_len,
//		int prompt_type, int file_type);
	},
	js_openfile: function(s) {
		var str = UTF8ToString(s);
		var fileId = self.EsInMemoryFile.nextFileId;
		self.EsInMemoryFile.nextFileId++;
		callAndWait(function() {
			postMessage({type: 'openfile', name: str});
		});
		var fileSize = (new Int32Array(passbackBuffer.buffer))[0];
		if (fileSize < 0) return -1;  // Error
		
		// Copy over the file contents
		var fileContents = new Uint8Array(fileSize);
		for (var n = 0; n < fileSize; n += passbackBuffer.length)
		{
			callAndWait(function() {
				postMessage({type: 'readfile', offset: n});
			});
			for (var i = n; i < Math.min(n + passbackBuffer.length, fileSize); i++)
				fileContents[i] = passbackBuffer[i - n];
		}
		// Don't need to wait, this just tells the main thread to clean-up
		postMessage({type: 'readfile', offset: -1});
		EsInMemoryFile.files[fileId] = new EsInMemoryFile(fileContents);
		return fileId;
	},
	js_ftell: function(fileId) {
		return EsInMemoryFile.files[fileId].pos;
	},
	js_fread : function(ptr, elSize, numEl, fileId) {
		var file = EsInMemoryFile.files[fileId];
		var el;
		for (el = 0; el < numEl; el++)
		{
			for (var b = 0; b < elSize; b++)
			{
				if (file.pos >= file.fileContents.length)
					return el;
				setValue(ptr + (el * elSize) + b, file.fileContents[file.pos], 'i8');
				file.pos++;
			}
		}
		return el;
	},
	js_fseek : function(fileId, offset, mode) {
		var file = EsInMemoryFile.files[fileId];
		if (mode == -1)
			file.pos = offset;
		else if (mode == 1)
			file.pos = file.fileContents.length + offset;
		else
			file.pos = file.pos + offset;
		return 0;
	},
	js_fclose : function(fileId) {
		delete EsInMemoryFile.files[fileId];
	},
	js_start_html : function() {
		callAndWait(function() {
			postMessage({type: 'start_html'});
		});
	},
	js_end_html : function () {
		callAndWait(function() {
			postMessage({type: 'end_html'});
		});
	},
	js_more_prompt : function() {
		callAndWait(function() {
			postMessage({type: 'more_prompt'});
		});
	},
	js_plain : function() {
		callAndWait(function() {
			postMessage({type: 'plain'});
		});
	},
	js_status : function(stat) {
		callAndWait(function() {
			postMessage({type: 'status', stat: stat});
		});
	},
	js_get_status : function() {
		callAndWait(function() {
			postMessage({type: 'get_status'});
		});
		return (new Int32Array(passbackBuffer.buffer))[0];
	},
	js_score : function(cur, turncount) {
		callAndWait(function() {
			postMessage({type: 'score', cur: cur, turncount: turncount});
		});
	},
	js_strsc : function(s) {
		var str = UTF8ToString(s);
		callAndWait(function() {
			postMessage({type: 'strsc', str: str});
		});
	}
});