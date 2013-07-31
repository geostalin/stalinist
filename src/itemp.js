communist.Iworker = function Icommunist(obj) {
	if (typeof obj === 'function') {
		obj = {
			data: obj
		};
	}
	var codeWord = "com.communistjs.iWorker" + Math.random();
	var listeners = {};
	var loaded = false;
	var loading;
	var self = this;
	var iFrame;

	function ajax(url) {
		var promise = communist.deferred();
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url);
		xhr.onload = function () {
			promise.resolve(xhr.responseText);
		};
		xhr.onerror = function () {
			promise.reject('failed to download');
		};
		xhr.send();
		return promise.promise;
	}
	self.on = function (eventName, func, scope) {
		scope = scope || self;
		if (eventName.indexOf(' ') > 0) {
			eventName.split(' ').map(function (v) {
				return self.on(v, func, scope);
			}, this);
			return self;
		}
		eventName = eventName + codeWord;
		if (!(eventName in listeners)) {
			listeners[eventName] = [];
		}
		listeners[eventName].push(function (a) {
			func.call(scope, a);
		});
		return self;
	};

	function _fire(eventName, data) {
		if (eventName.indexOf(' ') > 0) {
			eventName.split(' ').forEach(function (v) {
				_fire(v, data);
			});
			return self;
		}
		if (!(eventName in listeners)) {
			return self;
		}
		listeners[eventName].forEach(function (v) {
			v(data);
		});
		return self;
	}
	self.fire = function (eventName, data, transfer) {
		iFrame.contentWindow.postMessage([
			[eventName], data], '*');
		return self;
	};
	self.off = function (eventName, func) {
		if (eventName.indexOf(' ') > 0) {
			eventName.split(' ').map(function (v) {
				return self.off(v, func);
			});
			return self;
		}
		eventName = eventName + codeWord;
		if (!(eventName in listeners)) {
			return self;
		}
		else if (!func) {
			delete listeners[eventName];
		}
		else {
			if (listeners[eventName].indexOf(func) > -1) {
				if (listeners[eventName].length > 1) {
					delete listeners[eventName];
				}
				else {
					listeners[eventName].splice(listeners[eventName].indexOf(func), 1);
				}
			}
		}
		return self;
	};
	var i = 0;
	var promises = [];
	var rejectPromises = function (msg) {
		if (typeof msg !== "string" && 'preventDefault' in msg) {
			msg.preventDefault();
			msg = msg.message;
		}
		promises.forEach(function (p) {
			if (p) {
				p.reject(msg);
			}
		});
	};
	obj.__codeWord__ = "'" + codeWord + "'";
	if (!("initialize" in obj)) {
		if ('init' in obj) {
			obj.initialize = obj.init;
		}
		else {
			obj.initialize = function () {};
		}
	}
	var fObj = "{";
	var keyFunc = function (key) {
		var out = function (data, transfer) {
			var i = promises.length;
			promises[i] = communist.deferred();
			iFrame.contentWindow.postMessage([
				[codeWord, i], key, data], '*');
			return promises[i].promise;
		};
		return function (data) {
			if (loaded) {
				return out(data);
			}
			else {
				return loading.then(function () {
					return out(data);
				});
			}
		};
	};
	for (var key in obj) {
		if (i !== 0) {
			fObj = fObj + ",";
		}
		else {
			i++;
		}
		fObj = fObj + key + ":" + obj[key].toString();
		self[key] = keyFunc(key);
	}
	fObj = fObj + "}";
	var regexed = regexImports(fObj);
	if (!document.body) {
		window.onload = function () {
			console.log('loaded');
		};
	}

	function whenLoaded() {
		iFrame = document.createElement('iframe');
		iFrame.style.display = 'none';
		document.body.appendChild(iFrame);
	}

	var isLoaded, iz;
	if (document.readyState === 'complete') {
		isLoaded = communist.resolve();
	}
	else {
		iz = communist.deferred();
		isLoaded = iz.promise;
		document.onreadyStateChange = function () {
			if (document.readyState === 'complete') {
				isLoaded.resolve();
			}
		};
	}
	var forImport = regexed[0];
	var arrayFunc = function () {
		if (forImport && forImport.length) {
			return communist.all(forImport.map(function (v) {
				return ajax(v);
			}));
		}
		else {
			return [];
		}
	};
	loading = isLoaded.then(whenLoaded).then(arrayFunc).then(function (array) {
		var iScript2 = document.createElement('script');
		iScript2.text = 'var __errors__=[];';
		array.forEach(function (js) {

			iScript2.text += 'try{' + js + '}catch(e){__errors__.push(e);};';
		});
		iScript2.text += workerScript(regexed[1]);
		iFrame.contentDocument.body.appendChild(iScript2);
		return true;
	});

	function workerScript(fObj) {
		return '"use strict";var _db = '+fObj+';var listeners = {};_db.on = function (eventName, func, scope) {	if(eventName.indexOf(" ")>0){		return eventName.split(" ").map(function(v){			return _db.on(v,func,scope);		},_db);	}	eventName = eventName +  _db.__codeWord__;	scope = scope || _db;	if (!(eventName in listeners)) {		listeners[eventName] = [];	}	listeners[eventName].push(function (a) {		func.call(scope, a, _db);	});};function _fire(eventName,data){	if(eventName.indexOf(" ")>0){		eventName.split(" ").forEach(function(v){			_fire(v,data);		});		return;	}	eventName = eventName +  _db.__codeWord__;	if (!(eventName in listeners)) {		return;	}	listeners[eventName].forEach(function (v) {		v(data);	});}_db.fire = function (eventName, data, transfer) {	if(eventName.indexOf(" ")>0){		eventName = eventName.split(" ").map(function(a){			return a + _db.__codeWord__;		}).join(" ");	}else{		eventName = eventName +  _db.__codeWord__;	}	parent.window.postMessage([		[eventName], data], "*");};_db.off=function(eventName,func){	if(eventName.indexOf(" ")>0){		return eventName.split(" ").map(function(v){			return _db.off(v,func);		});	}	eventName = eventName + _db.__codeWord__;	if(!(eventName in listeners)){		return;	}else if(!func){		delete listeners[eventName];	}else{		if(listeners[eventName].indexOf(func)>-1){			if(listeners[eventName].length>1){				delete listeners[eventName];			}else{				listeners[eventName].splice(listeners[eventName].indexOf(func),1);			}		}	}};var console={};function makeConsole(method){	return function(){		var len = arguments.length;		var out =[];		var i = 0;		while (i<len){			out.push(arguments[i]);			i++;		}		_db.fire("console",[method,out]);	};}["log", "debug", "error", "info", "warn", "time", "timeEnd"].forEach(function(v){	console[v]=makeConsole(v);});window.onmessage=function(e){	_fire("messege",e.data[1]);	if(e.data[0][0]===_db.__codeWord__){		return regMsg(e);	}else{		_fire(e.data[0][0],e.data[1]);	}};var regMsg = function(e){	var cb=function(data){		parent.window.postMessage([e.data[0],data],"*");	};	var result;	/*console.log(e);*/		try{		result = _db[e.data[1]](e.data[2],cb,_db);		if(typeof result !== "undefined"){			cb(result);		}	}catch(e){		_db.fire("error", JSON.stringify(e));	}};__errors__.forEach(function(e){	_db.fire("error", ["initerror",JSON.stringify(e)]);});_db.initialize(_db);';
	}
	window.onmessage = function (e) {
		if (typeof e.data === 'string') {
			return;
		}
		console.log(e);
		_fire('message', e.data[1]);
		if (e.data[0][0] === codeWord) {
			promises[e.data[0][1]].resolve(e.data[1]);
			promises[e.data[0][1]] = 0;
		}
		else {
			_fire(e.data[0], e.data[1]);
		}
	};
	self.on('error', function (e) {
		rejectPromises(e);
		_fire('error', e);
	});
	self.on('console', function (msg) {
		console[msg[0]].apply(console, msg[1]);
	});
	self._close = function () {
		//worker.terminate();
		document.body.removeChild(iFrame);
		rejectPromises("closed");
		return communist.resolve();
	};
	if (!('close' in self)) {
		self.close = self._close;
	}
};
communist.iworker = function (obj) {
	return new communist.Iworker(obj);
};
