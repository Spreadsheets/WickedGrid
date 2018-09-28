/*jslint browser: true */

var CircleDrawer = function (canvasId, undoManager) {
    "use strict";

    var CANVAS_WIDTH = document.getElementById(canvasId).width,
        CANVAS_HEIGHT = document.getElementById(canvasId).height,
        MIN_CIRCLE_RADIUS = 10,
        MAX_CIRCLE_RADIUS = 40,
        drawingContext,
        circles = [],
        circleId = 0,
        drawingCanvas = window.document.getElementById(canvasId);

    if (drawingCanvas.getContext === undefined) {
        return;
    }

    drawingContext = drawingCanvas.getContext('2d');

    function clear() {
        drawingContext.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    function drawCircle(x, y, radius, color) {
        drawingContext.fillStyle = color;
        drawingContext.beginPath();
        drawingContext.arc(x, y, radius, 0, Math.PI * 2, true);
        drawingContext.closePath();
        drawingContext.fill();
    }

    function draw() {
        clear();
        var i,
            circle;
        for (i = 0; i < circles.length; i = i + 1) {
            circle = circles[i];
            drawCircle(circle.x, circle.y, circle.radius, circle.color);
        }
    }

    function removeCircle(id) {
        var i = 0, index = -1;
        for (i = 0; i < circles.length; i += 1) {
            if (circles[i].id === id) {
                index = i;
            }
        }
        if (index !== -1) {
            circles.splice(index, 1);
        }
        draw();
    }

    function createCircle(attrs) {
        circles.push(attrs);
        draw();
        undoManager.add({
            undo: function () {
                removeCircle(attrs.id);
            },
            redo: function () {
                createCircle(attrs);
            }
        });
    }

    drawingCanvas.addEventListener("click", function (e) {
        var mouseX = 0,
            mouseY = 0,
            intColor,
            hexColor,
            color,
            id = circleId,
            radius;

        if (!e) {
            e = window.event;
        }
        if (e.pageX || e.pageY) {
            mouseX = e.pageX;
            mouseY = e.pageY;
        } else if (e.clientX || e.clientY) {
            mouseX = e.clientX + document.body.scrollLeft
                + document.documentElement.scrollLeft;
            mouseY = e.clientY + document.body.scrollTop
                + document.documentElement.scrollTop;
        }
        mouseX -= drawingCanvas.offsetLeft;
        mouseY -= drawingCanvas.offsetTop;

        intColor = Math.floor(Math.random() * (256 * 256 * 256));
        hexColor = parseInt(intColor, 10).toString(16);
        color = '#' + ((hexColor.length < 2) ? "0" + hexColor : hexColor);
        id = id + 1;
        radius = MIN_CIRCLE_RADIUS + Math.random() * (MAX_CIRCLE_RADIUS - MIN_CIRCLE_RADIUS);

        createCircle({
            id: id,
            x: mouseX,
            y: mouseY,
            radius: radius,
            color: color
        });
    }, false);
};