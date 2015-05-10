/*
Simple Javascript undo and redo.
https://github.com/ArthurClemens/Javascript-Undo-Manager
*/

Array.prototype.removeFromTo = function(from, to) {
    this.splice(from,
        !to ||
        1 + to - from + (!(to < 0 ^ from >= 0) && (to < 0 || -1) * this.length));
    return this.length;
};

var UndoManager = function () {
    "use strict";

    var commands = [],
        index = -1,
        limit = 0,
        isExecuting = false,
        callback,
        
        // functions
        execute;

    execute = function(command, action) {
        if (!command || typeof command[action] !== "function") {
            return this;
        }
        isExecuting = true;

        command[action]();

        isExecuting = false;
        return this;
    };

    return {

        /*
        Add a command to the queue.
        */
        add: function (command) {
            if (isExecuting) {
                return this;
            }
            // if we are here after having called undo,
            // invalidate items higher on the stack
            commands.splice(index + 1, commands.length - index);

            commands.push(command);
            
            // if limit is set, remove items from the start
            if (limit && commands.length > limit) {
                commands.removeFromTo(0, -(limit+1));
            }
            
            // set the current index to the end
            index = commands.length - 1;
            if (callback) {
                callback();
            }
            return this;
        },

        /*
        Pass a function to be called on undo and redo actions.
        */
        setCallback: function (callbackFunc) {
            callback = callbackFunc;
        },

        /*
        Perform undo: call the undo function at the current index and decrease the index by 1.
        */
        undo: function () {
            var command = commands[index];
            if (!command) {
                return this;
            }
            execute(command, "undo");
            index -= 1;
            if (callback) {
                callback();
            }
            return this;
        },

        /*
        Perform redo: call the redo function at the next index and increase the index by 1.
        */
        redo: function () {
            var command = commands[index + 1];
            if (!command) {
                return this;
            }
            execute(command, "redo");
            index += 1;
            if (callback) {
                callback();
            }
            return this;
        },

        /*
        Clears the memory, losing all stored states. Reset the index.
        */
        clear: function () {
            var prev_size = commands.length;

            commands = [];
            index = -1;

            if (callback && (prev_size > 0)) {
                callback();
            }
        },

        hasUndo: function () {
            return index !== -1;
        },

        hasRedo: function () {
            return index < (commands.length - 1);
        },

        getCommands: function () {
            return commands;
        },
        
        setLimit: function (l) {
            limit = l;
        }
    };
};
