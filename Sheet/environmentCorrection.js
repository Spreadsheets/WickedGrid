$.print = function (s) {
    var w = win.open();
    w.document.write("<html><body><xmp>" + s + "\n</xmp></body></html>");
    w.document.close();
};

//This is a fix for Jison
if (!Object.getPrototypeOf) {
    Object.getPrototypeOf = function(obj) {
        return obj || {};
    };
}

//IE8 fix
if (!Array.prototype.indexOf) {
    $.sheet.max = 60;
    Array.prototype.indexOf = function(obj, start) {
        for (var i = (start || 0), j = this.length; i < j; i++) {
            if (this[i] === obj) { return i; }
        }
        return -1;
    }
}