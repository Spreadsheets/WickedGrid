(function(Sheet) {
	var u = undefined;

	/**
	 * Detaches DOM elements from a parent to keep the DOM fast. Can be used with hundreds of thousands r even millions of
	 * DOM elements to simulate a scrolling like behaviour.
	 * @param {HTMLElement} parent
	 * @property {Array} detachedAbove
	 * @property {Array} detachedBelow
	 * @property {Object} hidden
	 * @property {HTMLElement} parent
	 * @property {Boolean} aboveChanged
	 * @property {Boolean} belowChanged
	 * @constructor
	 * @memberOf Sheet
	 */
	function Detacher(parent) {
		this.detachedAbove = [];
		this.detachedBelow = [];
		this.hidden = {};
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
			aboveCount = _this.detachedAbove.length,
			i,
			hiddenOffset = 0,
			hidden = _this.hidden;

		//if there are too many in above count, return
		if (maxIndex < aboveCount) return;


		while ((i = (hiddenOffset + aboveCount + (children.length - 1))) > maxIndex) {
			if (hidden[i] === u) {
				_this.detachedBelow.unshift(parent.lastChild);
				parent.removeChild(parent.lastChild);
			} else {
				hiddenOffset++;
			}
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
				detachedAbove = this.detachedAbove;

			this.aboveChanged = false;

			while (detachedAbove.length - 1 < maxIndex) {
				//we will always detach the first element
				detachable = detachables[1];
				if (detachable === u) {
					break;
				}

				detachedAbove.push(detachable);
				parent.removeChild(detachable);

				this.aboveChanged = true;
			}

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

			return this;
		},


		/**
		 * Ideally used when scrolling up.  Attaches anything detached after a given index at the above of the parent
		 * @param minIndex
		 * @returns {Detacher}
		 */
		attachAboveAfter: function(minIndex) {
			var parent = this.parent,
				frag = document.createDocumentFragment(),
				detached,
				hiddenOffset = 0,
				detachedAbove = this.detachedAbove,
				i,
				hidden = this.hidden;

			this.aboveChanged = false;

			while ((i = detachedAbove.length + hiddenOffset) > minIndex) {
				//attach it
				detached = detachedAbove.pop();
				if (hidden[i - 1] === u) {
					frag.insertBefore(detached, frag.firstChild);
				} else {
					hiddenOffset++;
				}
				this.aboveChanged = true;
			}

			if (this.aboveChanged) {
				parent.insertBefore(frag, parent.children[1]);
			}

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
				frag = document.createDocumentFragment(),
				fragChildren = frag.children,
				offset = this.detachedAbove.length + parent.children.length,
				hiddenOffset = 0,
				i,
				hidden = this.hidden;

			this.belowChanged = false;

			while ((i = hiddenOffset + offset + fragChildren.length) < maxIndex && this.detachedBelow.length > 0) {
				//attach it
				detached = this.detachedBelow.shift();
				if (hidden[i - 1] === u) {
					frag.appendChild(detached);
				} else {
					hiddenOffset++;
				}
				this.belowChanged = true;
			}

			//attach point is going to be at the end of the parent
			if (this.belowChanged) {
				parent.appendChild(frag);
			}

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