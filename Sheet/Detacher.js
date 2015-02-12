(function(Sheet) {
	var u = undefined;

	/**
	 * Detaches DOM elements from a parent to keep the DOM fast. Can be used with hundreds of thousands r even millions of
	 * DOM elements to simulate a scrolling like behaviour.
	 * @param {HTMLElement} parent
	 * @property {Array} detachedAbove
	 * @property {Array} detachedBelow
	 * @property {Number} aboveIndex
	 * @property {Number} belowIndex
	 * @property {HTMLElement} parent
	 * @property {Boolean} aboveChanged
	 * @property {Boolean} belowChanged
	 * @constructor
	 * @memberOf Sheet
	 */
	function Detacher(parent) {
		this.detachedAbove = [];
		this.detachedBelow = [];
		this.aboveIndex = 0;
		this.belowIndex = 0;
		this.parent = parent;
		this.aboveChanged = false;
		this.belowChanged = false;
		this.hasInitialDetach = false;
	}

	/**
	 *
	 * @param {Detacher} _this
	 * @param {Number} maxIndex
	 */
	function initialDetach(_this, maxIndex) {
		var parent = _this.parent,
			children = parent.children,
			aboveCount = _this.detachedAbove.length;

		//if there are too many in above count, return
		if (maxIndex < aboveCount) return;


		while (aboveCount + children.length > maxIndex) {
			_this.detachedBelow.unshift(parent.lastChild);
			parent.removeChild(parent.lastChild);
		}
	}

	Detacher.prototype = {
		/**
		 * Ideally used when scrolling down.  Detaches anything before a given index at the above of the parent
		 * @param maxIndex
		 * @returns {Detacher}
		 */
		detachAboveBefore: function(maxIndex) {
			var detachable,
				parent = this.parent,
				detachables = parent.children,
				i = this.aboveIndex;

			this.aboveChanged = false;

			while (i < maxIndex) {
				//we will always detach the first element
				detachable = detachables[1];
				if (detachable === u) {
					break;
				}

				this.detachedAbove.push(detachable);
				parent.removeChild(detachable);
				i++;

				this.aboveChanged = true;
			}

			this.aboveIndex = maxIndex;

			return this;
		},

		/**
		 * Ideally used when scrolling up.  Detaches anything after a given index virtually below the parent
		 * @param minIndex
		 * @returns {Detacher}
		 */
		detachBelowAfter: function(minIndex) {
			if (!this.hasInitialDetach) {
				this.hasInitialDetach = true;
				initialDetach(this, minIndex);
			}

			var detachable,
				parent = this.parent,
				detachedAboveCount = this.detachedAbove.length,
				children = parent.children;

			this.belowChanged = false;


			while (detachedAboveCount + children.length > minIndex) {
				this.detachedBelow.unshift(detachable = parent.lastChild);
				parent.removeChild(detachable);
				this.belowChanged = true;
			}

			this.belowIndex = minIndex;

			return this;
		},


		/**
		 * Ideally used when scrolling up.  Attaches anything detached after a given index at the above of the parent
		 * @param minIndex
		 * @returns {Detacher}
		 */
		attachAboveAfter: function(minIndex) {
			var parent = this.parent,
				frag = document.createDocumentFragment();

			this.aboveChanged = false;

			while (this.detachedAbove.length > minIndex) {
				//attach it
				frag.insertBefore(this.detachedAbove.pop(), frag.firstChild);
				this.aboveChanged = true;
			}

			if (this.aboveChanged) {
				parent.insertBefore(frag, parent.children[1]);
			}

			this.aboveIndex = minIndex;

			return this;
		},

		/**
		 * Ideally used when scrolling down.  Attaches anything detached before a given index virtually below the parent
		 * @param maxIndex
		 * @returns {Detacher}
		 */
		attachBelowBefore: function(maxIndex) {
			if (!this.hasInitialDetach) {
				this.hasInitialDetach = true;
				initialDetach(this, maxIndex);
			}

			var detached,
				parent = this.parent,
				htmlIndex = maxIndex - this.aboveIndex,
				frag = document.createDocumentFragment(),
				fragChildren = frag.children,
				offset = this.detachedAbove.length + parent.children.length;

			this.belowChanged = false;

			while (offset + fragChildren.length < maxIndex && this.detachedBelow.length > 0) {
				//attach it
				detached = this.detachedBelow.shift();
				frag.appendChild(detached);
				this.belowChanged = true;
			}

			//attach point is going to be at the end of the parent
			if (this.belowChanged) {
				parent.appendChild(frag);
			}

			this.belowIndex = maxIndex;

			return this;
		},
		isAboveActive: function() {
			return this.detachedAbove.length > 0
		},
		isBelowActive: function() {
			return this.detachedBelow.length > 0
		}
	};

	Sheet.Detacher = Detacher;
})(Sheet);