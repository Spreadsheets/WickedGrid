# JavaScript Undo Manager

Simple undo manager to provide undo and redo actions in your JavaScript application.


## Demo
See [Undo Manager with  canvas drawing](http://arthurclemens.github.com/Javascript-Undo-Manager/).


## Background

Each action the user does (typing a character, moving an object) must be undone AND recreated. We combine this destruction and recreation as one "command" and put it on the undo stack:

    var undoManager = new UndoManager();
    undoManager.add({
        undo: function() {
            // ...
        },
        redo: function() {
            // ...
        }
    });

Note that you are responsible for the initial creation; Undo Manager only bothers with destruction and recreation.

## Methods

    undoManager.undo();

Performs the undo action.


    undoManager.redo();

Performs the redo action.


    undoManager.clear();

Clears all stored states.


	undoManager.setLimit(limit);

Set the maximum number of undo steps. Default: 0 (unlimited).


	var hasUndo = undoManager.hasUndo();

Tests if any undo actions exist.


    var hasRedo = undoManager.hasRedo();

Tests if any redo actions exist.


	undoManager.setCallback(myCallback);

Get notified on changes.



## Example

    var undoManager = new UndoManager(),
        people = {},
        addPerson,
        removePerson,
        createPerson;        

    addPerson = function(id, name) {
        people[id] = name;
    };

    removePerson = function(id) {
        delete people[id];
    };

    createPerson = function (id, name) {

        // initial storage
        addPerson(id, name);

        // make undo-able
        undoManager.add({
            undo: function() {
                removePerson(id)
            },
            redo: function() {
                addPerson(id, name);
            }
        });
    }
    
    createPerson(101, "John");
    createPerson(102, "Mary");
    
    console.log("people", people);
    // people Object {101: "John", 102: "Mary"} 
    
    undoManager.undo();
    console.log("people", people);
    // people Object {101: "John"} 
    
    undoManager.undo();
    console.log("people", people);
    // people Object {} 
    
    undoManager.redo();
    console.log("people", people);
    // people Object {101: "John"}


## Loading with RequireJS

If you are using RequireJS, you need to use the ``shim`` config parameter.

Assuming ``require.js`` and ``domReady.js`` are located in ``js/extern``, the ``index.html`` load call would be:

    <script src="js/extern/require.js" data-main="js/demo"></script>

And ``demo.js`` would look like this:

    requirejs.config({
        baseUrl: "js",
        paths: {
            domReady: "extern/domReady",
            app: "../demo",
            undomanager: "../../js/undomanager",
            circledrawer: "circledrawer"
        },
        shim: {
            "undomanager": {
                exports: "UndoManager"
            },
            "circledrawer": {
                exports: "CircleDrawer"
            }
        }
    });

    require(["domReady", "undomanager", "circledrawer"], function(domReady, UndoManager, CircleDrawer) {
        "use strict";

        var undoManager,
            circleDrawer,
            btnUndo,
            btnRedo,
            btnClear;

        undoManager = new UndoManager();
        circleDrawer = new CircleDrawer("view", undoManager);
        
        // etcetera
    });

