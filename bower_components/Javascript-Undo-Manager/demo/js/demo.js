window.onload = function () {
    "use strict";

    var undoManager,
        circleDrawer,
        btnUndo,
        btnRedo,
        btnClear;

    undoManager = new UndoManager();    
    circleDrawer = new CircleDrawer("view", undoManager);

    ctrlLimit = document.getElementById("ctrlLimit");
    btnUndo = document.getElementById("btnUndo");
    btnRedo = document.getElementById("btnRedo");
    btnClear = document.getElementById("btnClear");

    function updateUI() {
        btnUndo.disabled = !undoManager.hasUndo();
        btnRedo.disabled = !undoManager.hasRedo();
    }
    undoManager.setCallback(updateUI);

    btnUndo.onclick = function () {
        undoManager.undo();
        updateUI();
    };
    btnRedo.onclick = function () {
        undoManager.redo();
        updateUI();
    };
    btnClear.onclick = function () {
        undoManager.clear();
        updateUI();
    };
    var handleLimit = function(l) {
        var limit = parseInt(l, 10);
        if (!isNaN(limit)) {
            undoManager.setLimit(limit);
        }
        updateUI();
    };
    ctrlLimit.onchange = function() {
        handleLimit(this.value);
    };
    ctrlLimit.oninput = function() {
        handleLimit(this.value);
    };
    
    updateUI();
};