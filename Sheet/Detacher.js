/**
 * @param {HTMLElement} parent
 * @param {HTMLCollection} detachables
 * @constructor
 */
Sheet.Detacher = (function(document) {
	var u = undefined;

	function Constructor(parent, detachables) {
		this.detached = {};
		this.detachedBeforeCount = 0;
		this.detachedAfterCount = 0;
		this.parent = parent;
		this.detachables = detachables;
	}

	Constructor.prototype = {
		detachBefore: function(i) {
			var detachables = this.detachables,
				min = 1,
				parent = this.parent,
				detachable,
				detached = this.detached;

			//first check if it exists, and if it can be reattached
			if (detached[i] !== u || i < 1) return false;

			this.detachBefore(i - 1);

			for (; i >= min; i--) {
				if (detached[i] === u) {
					detachable = detachables[i - this.detachedBeforeCount];
					if (detachable !== u && detachable !== parent.firstChild) {
						this.detachedBeforeCount++;
						detachable.nextSiblingLocked = detachable.nextSibling;
						this.detached[i] = parent.removeChild(detachable);
					}
				} else {
					return false;
				}
			}

			return true;
		},
		detach: function(i) {
			var detachable = this.detachables[i - this.detachedBeforeCount],
				parent = this.parent;

			//first check if it exists, and if it can be detached
			if (i > 0 && detachable === u || this.detached[i] !== u) return false;

			//detach it
			detachable.nextSiblingLocked = detachable.nextSibling;
			this.detached[i] = parent.removeChild(detachable);
			this.detachedBeforeCount++;
			return true;
		},
		detachAfter: function(i) {
			var detachables = this.detachables,
				max = detachables.length,
				detached = this.detached,
				parent = this.parent,
				detachable;

			if (i < 1) i = 1;

			//first check if it exists, and if it can be reattached
			if (detached[i] !== u || i < 1) return false;

			for (; i < max; i++) {
				if (detached[i] === u) {
					detachable = detachables[i - this.detachedAfterCount];
					detachable.prevSiblingLocked = detachable.previousSibling;
					this.detached[i] = parent.removeChild(detachable);
					this.detachedAfterCount++;
				} else {
					return;
				}
			}
		},


		reattachBefore: function(i) {
			var detached = this.detached[i],
				parent = this.parent;

			//first check if it exists, and if it can be reattached
			if (detached === u || i < 1) return false;

			while (this.reattachBefore(i + 1)) {}

			//attach it
			delete this.detached[i];
			parent.insertBefore(detached, detached.nextSiblingLocked);
			delete detached.nextSiblingLocked;
			this.detachedBeforeCount--;

			return true;
		},
		reattachAfter: function(i) {
			var detached = this.detached[i],
				parent = this.parent;

			//first check if it exists, and if it can be reattached
			if (detached === u || i < 1) return false;

			while (this.reattachAfter(i - 1)) {}

			//attach it
			delete this.detached[i];
			parent.insertBefore(detached, detached.prevSiblingLocked);
			delete detached.prevSiblingLocked;
			this.detachedAfterCount--;

			return true;
		}
	};

	return Constructor;
})(document);