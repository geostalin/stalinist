"use strict";
var _db = $$fObj$$;
var listeners = {};
_db.on = function (eventName, func, scope) {
	if(eventName.indexOf(" ")>0){
		return eventName.split(" ").map(function(v){
			return _db.on(v,func,scope);
		},_db);
	}
	eventName = eventName +  _db.__codeWord__;
	scope = scope || _db;
	if (!(eventName in listeners)) {
		listeners[eventName] = [];
	}
	listeners[eventName].push(function (a) {
		func.call(scope, a, _db);
	});
};
function _fire(eventName,data){
	if(eventName.indexOf(" ")>0){
		eventName.split(" ").forEach(function(v){
			_fire(v,data);
		});
		return;
	}
	eventName = eventName +  _db.__codeWord__;
	if (!(eventName in listeners)) {
		return;
	}
	listeners[eventName].forEach(function (v) {
		v(data);
	});
}

_db.fire = function (eventName, data, transfer) {
	if(eventName.indexOf(" ")>0){
		eventName = eventName.split(" ").map(function(a){
			return a + _db.__codeWord__;
		}).join(" ");
	}else{
		eventName = eventName +  _db.__codeWord__;
	}
	parent.window.postMessage([
		[eventName], data], "*");
};
_db.off=function(eventName,func){
	if(eventName.indexOf(" ")>0){
		return eventName.split(" ").map(function(v){
			return _db.off(v,func);
		});
	}
	eventName = eventName + _db.__codeWord__;
	if(!(eventName in listeners)){
		return;
	}else if(!func){
		delete listeners[eventName];
	}else{
		if(listeners[eventName].indexOf(func)>-1){
			if(listeners[eventName].length>1){
				delete listeners[eventName];
			}else{
				listeners[eventName].splice(listeners[eventName].indexOf(func),1);
			}
		}
	}
};
var console={};
function makeConsole(method){
	return function(){
		var len = arguments.length;
		var out =[];
		var i = 0;
		while (i<len){
			out.push(arguments[i]);
			i++;
		}
		_db.fire("console",[method,out]);
	};
}
["log", "debug", "error", "info", "warn", "time", "timeEnd"].forEach(function(v){
	console[v]=makeConsole(v);
});
window.onmessage=function(e){
	_fire("messege",e.data[1]);
	if(e.data[0][0]===_db.__codeWord__){
		return regMsg(e);
	}else{
		_fire(e.data[0][0],e.data[1]);
	}
};
var regMsg = function(e){
	var cb=function(data){
		parent.window.postMessage([e.data[0],data],"*");
	};
	var result;
	/*console.log(e);*/
	
	try{
		result = _db[e.data[1]](e.data[2],cb,_db);
		if(typeof result !== "undefined"){
			cb(result);
		}
	}catch(e){
		_db.fire("error", JSON.stringify(e));
	}
};
__errors__.forEach(function(e){
	_db.fire("error", ["initerror",JSON.stringify(e)]);
});
_db.initialize(_db);
