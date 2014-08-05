/*
 * Mousewheel
 * */

/**
 * Ridiculous fast mousewheel integration either direction or captured into another element
 * Compatible with: IE8, FireFox, Chrome, Safari,Opera, iOS, Android
 * MouseWheel rewrites itself the first time it is triggered in order to perform faster for the environment it is being used in
 *
 * @param {HTMLElement} element
 * @param {HTMLElement} [scrollElement] default element
 * @param {Number} [verticalPixels] default 20
 * @param {Number} [horizontalPixels] default 10
 * @constructor
 */
var MouseWheel = (function(win) {
    var bindMouseWheel = function(el, fn) {
            el.onwheel = el.onmousewheel = el.onDOMMouseScroll = el.onMozMousePixelScroll = fn;
        },
        handler = function (e) {
            e = e || win.event;

            var mousewheel,
                mW = this.mW,
                horizontalPixels = mW.horizontalPixels,
                verticalPixels = mW.verticalPixels;

            if (e.type === "mousewheel") {
                //chrome sometimes
                if (e.wheelDeltaX !== undefined) {
                    this.mWType = 1;
                    mousewheel = function(e) {
                        e = e || win.event;

                        var deltaY = e.wheelDeltaY,
                            deltaX = e.wheelDeltaX,
                            scrollElement = this.scrollElement;

                        if (deltaY !== 0) {
                            scrollElement.scrollTop += deltaY < 0 ? horizontalPixels : -horizontalPixels;
                        }

                        else if (deltaX !== 0) {
                            scrollElement.scrollLeft += deltaX < 0 ? verticalPixels : -verticalPixels;
                        }

                        return false;
                    };
                } else {
                    //IE
                    this.mWType = 2;
                    mousewheel = function(e) {
                        e = e || win.event;

                        var delta = e.wheelDelta,
                            scrollElement = this.scrollElement;

                        if (delta !== 0) {
                            scrollElement.scrollTop += delta < 0 ? horizontalPixels : -horizontalPixels;
                        }

                        return false;
                    };
                }
            } else {
                //firefox & chrome
                this.mWType = 3;
                mousewheel = function(e) {
                    e.preventDefault();

                    var detail,
                        top = 0,
                        left = 0,
                        scrollElement = this.scrollElement;

                    if (e.deltaX !== 0) {
                        scrollElement.scrollLeft += e.deltaX > 0 ? horizontalPixels : -horizontalPixels;

                    }

                    else if (e.deltaY !== 0) {
                        scrollElement.scrollTop += e.deltaY > 0 ? verticalPixels : -verticalPixels;
                    }

                    else if (detail = this.detail = e.detail) {

                        (9 < detail ? detail = 3 : -9 > detail && (detail = -3));

                        switch (detail) {
                            case 1:
                            case -1:
                                left = detail * horizontalPixels;
                                scrollElement.scrollLeft += left;
                                break;
                            case 3:
                            case -3:
                                top = (detail / 3) * verticalPixels;
                                scrollElement.scrollTop += top;
                                break;
                        }
                    }

                    return false;
                };
            }

            bindMouseWheel(this, mousewheel);
            console.log(this.mWType);
            return false;
        };

    function Constructor (element, scrollElement, verticalPixels, horizontalPixels) {
        this.element = element;
        this.scrollElement = element.scrollElement = scrollElement || element;
        this.verticalPixels = verticalPixels || 20;
        this.horizontalPixels = horizontalPixels || 10;

        //initial binding, which will await the first trigger of mousewheel, then rewrite itself.
        bindMouseWheel(element, handler);

        element.mW = this;
    }

    return Constructor;
})(window);

