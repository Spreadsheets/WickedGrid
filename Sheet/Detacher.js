/**
 * Detaches DOM elements from a parent to keep the DOM fast. Can be used with hundreds of thousands r even millions of
 * DOM elements to simulate a scrolling like behaviour.
 * @param {HTMLElement} parent
 * @property {Object} detached
 * @property {Number} topIndex
 * @property {Number} bottomIndex
 * @property {HTMLElement} parent
 * @property {Boolean} topChanged
 * @property {Boolean} bottomChanged
 * @constructor
 */
Sheet.Detacher = (function() {
	var u = undefined;

	function Constructor(parent) {
		this.detached = {};
		this.topIndex = 0;
		this.bottomIndex = 0;
		this.parent = parent;
		this.topChanged = false;
		this.bottomChanged = false;
	}

	Constructor.prototype = {
		/**
		 * Ideally used when scrolling down.  Detaches anything before a given index at the top of the parent
		 * @param maxIndex
		 * @returns {Sheet.Detacher}
		 */
		detachTopBefore: function(maxIndex) {
			var detachable,
				parent = this.parent,
				detachables = parent.children,
				i = this.topIndex;

			this.topChanged = false;

			while (i < maxIndex) {
				//we will always detach the first element
				detachable = detachables[1];
				this.detached[i] = detachable;
				parent.removeChild(detachable);
				i++;

				this.topChanged = true;
			}

			this.topIndex = maxIndex;

			return this;
		},

		/**
		 * Ideally used when scrolling up.  Detaches anything after a given index at the bottom of the parent
		 * @param minIndex
		 * @returns {Sheet.Detacher}
		 */
		detachBottomAfter: function(minIndex) {
			var detachable,
				parent = this.parent,
				detachables = parent.children,
				htmlIndex = minIndex - this.topIndex,
				i = minIndex;

			this.bottomChanged = false;

			while ((detachable = detachables[htmlIndex]) !== u) {
				this.detached[i] = detachable;
				parent.removeChild(detachable);
				//NOTE: index increases, but htmlIndex doesn't because at this moment, it has just decremented
				i++;
				this.bottomChanged = true;
			}

			this.bottomIndex = minIndex;
			return this;
		},


		/**
		 * Ideally used when scrolling up.  Attaches anything detached after a given index at the top of the parent
		 * @param minIndex
		 * @returns {Sheet.Detacher}
		 */
		attachTopAfter: function(minIndex) {
			var detached,
				parent = this.parent,
				i = minIndex,
				frag = document.createDocumentFragment();

			this.topChanged = false;

			while ((detached = this.detached[i]) !== u) {
				detached = this.detached[i];
				//attach it
				delete this.detached[i];
				frag.appendChild(detached);
				i++;
				this.topChanged = true;
			}

			if (this.topChanged) {
				parent.insertBefore(frag, parent.children[1]);
			}

			this.topIndex = minIndex;

			return this;
		},

		/**
		 * Ideally used when scrolling down.  Attaches anything detached before a given index at the bottom of the parent
		 * @param maxIndex
		 * @returns {Sheet.Detacher}
		 */
		attachBottomBefore: function(maxIndex) {
			var detached,
				parent = this.parent,
				htmlIndex = maxIndex - this.topIndex,
				i = maxIndex,
				frag = document.createDocumentFragment();

			this.bottomChanged = false;

			while ((detached = this.detached[i]) !== u) {
				//attach it
				delete this.detached[i];
				frag.insertBefore(detached, frag.firstChild);
				i--;
				this.bottomChanged = true;
			}

			//attach point is going to be at the end of the parent
			if (this.bottomChanged) {
				parent.insertBefore(frag, parent.children[htmlIndex]);
			}

			this.bottomIndex = maxIndex;

			return this;
		}
	};

	return Constructor;
})();