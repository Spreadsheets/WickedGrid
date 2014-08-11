
Sheet.StyleUpdater = (function(document) {
    function Constructor(updateFn) {
        var el = this.styleElement = document.createElement('style');
        el.styleUpdater = this;
        this.update = updateFn;
    }

    //ie
    if (document.createElement('style').styleSheet) {
        Constructor.prototype = {
            setStyle: function (css) {
                var el = this.styleElement,
                    ss = el.styleSheet;

                ss.disabled = false;//IE8 bug, for some reason in some scenarios disabled never becomes enabled.  And even setting here don't actually set it, it just ensures that is is set to disabled = false when the time is right
                if (!ss.disabled) {
                    ss.cssText = css;
                }
            },
            getStyle: function() {
                var el = this.styleElement,
                    ss = el.styleSheet;

                ss.disabled = false;//IE8 bug, for some reason in some scenarios disabled never becomes enabled.  And even setting here don't actually set it, it just ensures that is is set to disabled = false when the time is right
                if (!ss.disabled) {
                    return ss.cssText;
                }
                return '';
            }
        };
    } else {
        //standard
        Constructor.prototype = {
            setStyle: function (css) {
                this.styleElement.innerHTML = css;
            },
            getStyle: function() {
                return this.styleElement.innerHTML;
            }
        };
    }

    return Constructor;
})(document);