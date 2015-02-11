(function(Sheet) {
	var u = undefined;

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
	 * @memberOf Sheet
	 */
	function Detacher(parent) {
		this.detachedTop = [];
		this.detachedBottom = [];
		this.topIndex = 0;
		this.bottomIndex = 0;
		this.parent = parent;
		this.topChanged = false;
		this.bottomChanged = false;
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
			topCount = _this.detachedTop.length;

		//if there are too many in top count, return
		if (maxIndex < topCount) return;


		while (topCount + children.length > maxIndex) {
			_this.detachedBottom.unshift(parent.lastChild);
			parent.removeChild(parent.lastChild);
		}
	}

	Detacher.prototype = {
		/**
		 * Ideally used when scrolling down.  Detaches anything before a given index at the top of the parent
		 * @param maxIndex
		 * @returns {Detacher}
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
				if (detachable === u) {
					break;
				}

				this.detachedTop.push(detachable);
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
		 * @returns {Detacher}
		 */
		detachBottomAfter: function(minIndex) {
			if (!this.hasInitialDetach) {
				this.hasInitialDetach = true;
				initialDetach(this, minIndex);
			}

			var detachable,
				parent = this.parent,
				detachedTopCount = this.detachedTop.length,
				children = parent.children;

			this.bottomChanged = false;


			while (detachedTopCount + children.length > minIndex) {
				this.detachedBottom.unshift(detachable = parent.lastChild);
				parent.removeChild(detachable);
				this.bottomChanged = true;
			}

			this.bottomIndex = minIndex;

			return this;
		},


		/**
		 * Ideally used when scrolling up.  Attaches anything detached after a given index at the top of the parent
		 * @param minIndex
		 * @returns {Detacher}
		 */
		attachTopAfter: function(minIndex) {
			var parent = this.parent,
				frag = document.createDocumentFragment();

			this.topChanged = false;

			while (this.detachedTop.length > minIndex) {
				//attach it
				frag.insertBefore(this.detachedTop.pop(), frag.firstChild);
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
		 * @returns {Detacher}
		 */
		attachBottomBefore: function(maxIndex) {
			if (!this.hasInitialDetach) {
				this.hasInitialDetach = true;
				initialDetach(this, maxIndex);
			}

			var detached,
				parent = this.parent,
				htmlIndex = maxIndex - this.topIndex,
				frag = document.createDocumentFragment(),
				fragChildren = frag.children,
				offset = this.detachedTop.length + parent.children.length;

			this.bottomChanged = false;

			while (offset + fragChildren.length < maxIndex && this.detachedBottom.length > 0) {
				//attach it
				detached = this.detachedBottom.shift();
				frag.appendChild(detached);
				this.bottomChanged = true;
			}

			//attach point is going to be at the end of the parent
			if (this.bottomChanged) {
				parent.appendChild(frag);
			}

			this.bottomIndex = maxIndex;

			return this;
		}
	};

	Sheet.Detacher = Detacher;
})(Sheet);