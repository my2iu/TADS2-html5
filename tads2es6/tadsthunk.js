mergeInto(LibraryManager.library, {
	js_gets: function(s, bufLength) {
		Asyncify.handleSleep(function(wakeUp) {
			console.log('gets');
			postMessage({type: 'gets'});
			reenterWasmFunc = function() {
				console.log('gets return');
				for (var n = 0; n < Math.min(passbackBuffer.length, bufLength); n++)
				{
					setValue(s + n, passbackBuffer[n], 'i8');
				}
				wakeUp();
			};
		});
	},
	js_printz: function(s) {
		var str = UTF8ToString(s);
		Asyncify.handleSleep(function(wakeUp) {
			console.log('print');
			postMessage({type: 'printz', str: str});
			reenterWasmFunc = wakeUp;
		});
	},
	js_getc: function() {
		Asyncify.handleSleep(function(wakeUp) {
			console.log('getc');
			postMessage({type: 'getc'});
			reenterWasmFunc = function() {
				wakeUp((new Int32Array(passbackBuffer.buffer))[0]);
			}
		});
	},
	js_askfile: function(prompt, fname_buf, fname_len, prompt_type, file_type) {
		var promptStr = UTF8ToString(prompt);
		Asyncify.handleSleep(function(wakeUp) {
			console.log('askfile');
			postMessage({type: 'askfile', prompt: promptStr, 
				promptType: prompt_type, fileType: file_type});
			reenterWasmFunc = function() {
				for (var n = 0; n < Math.min(passbackBuffer.length, fname_len); n++)
				{
					setValue(fname_buf + n, passbackBuffer[n], 'i8');
				}
				if (passbackBuffer[0] == 0) 
				{
					wakeUp(0);
					return;
				}
				wakeUp(1);
			};
		});
//		extern int js_askfile(const char *prompt, char *fname_buf, int fname_len,
//		int prompt_type, int file_type);
	},
	js_openfile: function(s) {
		var str = UTF8ToString(s);
		let fileId = self.EsInMemoryFile.nextFileId;
		self.EsInMemoryFile.nextFileId++;
		Asyncify.handleSleep(function(wakeUp) {
			console.log('openfile');
			postMessage({type: 'openfile', name: str});
			reenterWasmFunc = function() {
				let fileSize = (new Int32Array(passbackBuffer.buffer))[0];
				if (fileSize < 0)
				{
					wakeUp(-1);  // Error
					return;
				}
				
				// Copy over the file contents
				let fileContents = new Uint8Array(fileSize);
				let n = 0;
				let readFilePart = null;
				readFilePart = function() {
					console.log('reading ' + n);
					for (let i = n; i < Math.min(n + passbackBuffer.length, fileSize); i++)
						fileContents[i] = passbackBuffer[i - n];
					n += passbackBuffer.length;
					if (n < fileSize)
					{
						console.log('readfile ' + n);
						postMessage({type: 'readfile', offset: n});
						reenterWasmFunc = readFilePart;
					}
					else
					{
						console.log('readfile done');
						postMessage({type: 'readfile', offset: -1});
						EsInMemoryFile.files[fileId] = new EsInMemoryFile(str, fileContents);
						wakeUp(fileId);
						// Don't need to wait, this just tells the main thread to clean-up
					}
				}
				if (n < fileSize)
				{
					console.log('readfile ' + n);
					postMessage({type: 'readfile', offset: n});
					reenterWasmFunc = readFilePart;
				}
				else
					readFilePart();
			};
		});
	},
	js_openTempFileForWriting: function(s) {
		var name = UTF8ToString(s);
		var fileId = self.EsInMemoryFile.nextFileId;
		self.EsInMemoryFile.nextFileId++;
		EsInMemoryFile.files[fileId] = new EsInMemoryFile(name, new Uint8Array(0));
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
				if (file.pos >= file.size)
					return el;
				setValue(ptr + (el * elSize) + b, file.fileContents[file.pos], 'i8');
				file.pos++;
			}
		}
		return el;
	},
	js_fwrite : function(ptr, elSize, numEl, fileId) {
		var file = EsInMemoryFile.files[fileId];
		var el;
		for (el = 0; el < numEl; el++)
		{
			for (var b = 0; b < elSize; b++)
			{
				file.growBuffer(file.pos + 1);
				var val = getValue(ptr + (el * elSize) + b, 'i8');
				file.fileContents[file.pos] = val;
				file.pos++;
				if (file.pos > file.size)
					file.size = file.pos;
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
	js_ftransferToMainThread : function(fileId) {
		var file = EsInMemoryFile.files[fileId];
		Asyncify.handleSleep(function(wakeUp) {
			console.log('transferfile');
			postMessage({type: 'transferfile', name: file.filename, contents: file.fileContents.buffer.slice(0, file.size)});
			reenterWasmFunc = wakeUp;
		});
	},
	js_fclose : function(fileId) {
		delete EsInMemoryFile.files[fileId];
	},
	js_start_html : function() {
		Asyncify.handleSleep(function(wakeUp) {
			console.log('starthtml');
			postMessage({type: 'start_html'});
			reenterWasmFunc = wakeUp;
		});
	},
	js_end_html : function () {
		Asyncify.handleSleep(function(wakeUp) {
			console.log('endhtml');
			postMessage({type: 'end_html'});
			reenterWasmFunc = wakeUp;
		});
	},
	js_more_prompt : function() {
		Asyncify.handleSleep(function(wakeUp) {
			console.log('more');
			postMessage({type: 'more_prompt'});
			reenterWasmFunc = wakeUp;
		});
	},
	js_plain : function() {
		Asyncify.handleSleep(function(wakeUp) {
			console.log('plain');
			postMessage({type: 'plain'});
			reenterWasmFunc = wakeUp;
		});
	},
	js_status : function(stat) {
		Asyncify.handleSleep(function(wakeUp) {
			console.log('status');
			postMessage({type: 'status', stat: stat});
			reenterWasmFunc = wakeUp;
		});
	},
	js_get_status : function() {
		Asyncify.handleSleep(function(wakeUp) {
			console.log('get_status');
			postMessage({type: 'get_status'});
			reenterWasmFunc = function() {
				wakeUp((new Int32Array(passbackBuffer.buffer))[0]);
			};
		});
	},
	js_score : function(cur, turncount) {
		Asyncify.handleSleep(function(wakeUp) {
			console.log('score');
			postMessage({type: 'score', cur: cur, turncount: turncount});
			reenterWasmFunc = wakeUp;
		});
	},
	js_strsc : function(s) {
		var str = UTF8ToString(s);
		Asyncify.handleSleep(function(wakeUp) {
			console.log('strsc');
			postMessage({type: 'strsc', str: str});
			reenterWasmFunc = wakeUp;
		});
	}
});