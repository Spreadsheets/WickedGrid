/**
 * @param {HTMLElement} parent
 * @param {HTMLCollection} detachables
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
		/*detach: function(i) {
			var detachable = this.detachables[i - this.detachedBeforeCount],
				parent = this.parent;

			//first check if it exists, and if it can be detached
			if (i > 0 && detachable === u || this.detached[i] !== u) return false;

			//detach it
			this.detached[i] = parent.removeChild(detachable);
			this.detachedBeforeCount++;

			return this;
		},*/
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
		 * The idea here is to attach starting just before row 1 and just after row 0 in the table
		 * The detachBeforeCount needs to be added to the rowIndex of row 1
		 * @param minIndex
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