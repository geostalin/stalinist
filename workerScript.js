self.onmessage=function(e){
	self.postMessage(e.data,[e.data]);
};