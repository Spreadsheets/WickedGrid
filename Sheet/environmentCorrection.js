//This is a fix for Jison
if (!Object.getPrototypeOf) {
	Object.getPrototypeOf = function(obj) {
		return obj || {};
	};
}

//IE8 fix
if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function(obj, start) {
		for (var i = (start || 0), j = this.length; i < j; i++) {
			if (this[i] === obj) { return i; }
		}
		return -1;
	}
}