// Requires backbone.js
var UndoManager = Backbone.Model.extend({
    
    commandStack: undefined,
    index: undefined,
    undoManagerContext: false,

    initialize: function () {
        this.commandStack = [];
        this.set({index: -1});
    },
    
    callCommand: function (command) {
        if (!command) {
            return;
        }
        this.undoManagerContext = true;
        command.f.apply(command.o, command.p);
        this.undoManagerContext = false;
    }
});

/*
Registers an undo and redo command. Both commands are passed as parameters and turned into command objects.
param undoObj: caller of the undo function
param undoFunc: function to be called at myUndoManager.undo
param undoParamsList: (array) parameter list
param undoMsg: message to be used
*/
UndoManager.prototype.register = function (
    undoObj, undoFunc, undoParamsList, undoMsg,
    redoObj, redoFunc, redoParamsList, redoMsg
) {
    "use strict";
    if (this.undoManagerContext) {
        return;
    }

    // if we are here after having called undo,
    // invalidate items higher on the stack
    this.commandStack.splice(this.get('index') + 1, this.commandStack.length - this.get('index'));
            
    this.commandStack.push(
        {
            undo: {o: undoObj, f: undoFunc, p: undoParamsList, m: undoMsg},
            redo: {o: redoObj, f: redoFunc, p: redoParamsList, m: redoMsg}
        }
    );
    // set the current index to the end
    this.set({index: this.commandStack.length - 1});
};
    
UndoManager.prototype.undo = function () {
    "use strict";
    var command = this.commandStack[this.get('index')];
    if (!command) {
        return;
    }
    this.callCommand(command.undo);
    this.set({index: this.get('index') - 1});
};  

UndoManager.prototype.redo = function () {
    "use strict";
    var command = this.commandStack[this.get('index') + 1];
    if (!command) {
        return;
    }
    this.callCommand(command.redo);
    this.set({index: this.get('index') + 1});
};
  
UndoManager.prototype.clear = function () {
    "use strict";
    this.initialize();
};
  
UndoManager.prototype.hasUndo = function () {
    "use strict";
    return this.get('index') !== -1;
};
  
UndoManager.prototype.hasRedo = function () {
    "use strict";
    return this.get('index') < (this.commandStack.length - 1);
};
  
/*
Pass a function to be called on undo and redo actions.
*/
UndoManager.prototype.setCallback = function (callbackFunc) {
    "use strict";
    this.callback = callbackFunc;
};

/*
LICENSE

The MIT License

Copyright (c) 2010-2011 Arthur Clemens, arthur@visiblearea.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions: 

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/