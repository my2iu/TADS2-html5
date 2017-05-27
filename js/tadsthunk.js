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

});