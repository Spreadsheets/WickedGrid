var Thaw = (function(window) {

	//private variables
	var thawing = false,
		thaws = [];

	/**
	 * thaw an array of items
	 * @param {Array} items
	 * @param {Object} [options]
	 * @constructor
	 */
	function Thaw(items, options) {
		options = options || {};

		var tick = this.tick = function () {
				var items = self.items,
					i = self.i;

				if (i < 0) return;

				timeout = setTimeout(tick, 0);

				if (!thawing) {
					item = items[i];

					if (i >= items.length) {

						if (done !== null) {
							thawing = true;
							done.call(item, i);
							thawing = false;
						}

						self.i = -1;
						clearTimeout(timeout);
						return;
					}

					if (each !== null) {
						thawing = true;
						each.call(item, i);
						thawing = false;
					} else if (item !== u) {
						item();
					}
					self.i++;
				}
			},
			each = options.each || null,
			done = options.done || null,
			u = undefined,
			self = this,
			timeout,
			item;

		this.i = 0;
		this.items = items;

		thaws.push(this);

		tick();
	}

	/**
	 *
	 * @type {{each: null, done: null}}
	 */
	Thaw.defaultSettings = {
		each: null,
		done: null
	};

	Thaw.prototype = {
		/**
		 * readies thaw to continue
		 * @returns {boolean} if had to get ready
		 */
		makeReady: function() {
			if (this.i < 0) {
				this.i = this.items.length;
				return true;
			}
			return false;
		},

		/**
		 * Adds an item to the end of this instance of Thaw and readies Thaw to process it
		 * @param item
		 * @returns {Thaw}
		 */
		add: function(item) {
			var doTick = this.makeReady();

			this.items.push(item);

			if (doTick) {
				this.tick();
			}

			return this;
		},

		/**
		 * Inserts an item just after the current item being processed in Thaw and readies Thaw to process it
		 * @param item
		 * @returns {Thaw}
		 */
		insert: function(item) {
			var doTick = this.makeReady();

			this.items.splice(this.i, 0, item);

			if (doTick) {
				this.tick();
			}

			return this;
		},

		/**
		 * Adds an Array to the end of this instance of Thaw and readies Thaw to process it
		 * @param {Array} items
		 * @returns {Thaw}
		 */
		addArray: function(items) {
			var doTick = this.makeReady();

			this.items = this.items.concat(items);

			if (doTick) {
				this.tick();
			}

			return this;
		},

		/**
		 * Inserts an Array just after the current item being processed in Thaw and readies Thaw to process them
		 * @param {Array} items
		 * @returns {Thaw}
		 */
		insertArray: function(items) {
			var doTick = this.makeReady(),
				left = this.items,
				middle = items,
				right = this.items.splice(this.i, (this.items.length - this.i) + 1);

			this.items = left.concat(middle, right);

			if (doTick) {
				this.tick();
			}

			return this;
		},

		/**
		 * Stops this instance of Thaw
		 * @returns {Thaw}
		 */
		stop: function() {
			this.i = -1;

			return this;
		}
	};

	/**
	 * returns if Thaw.js is thawing
	 * @returns {boolean}
	 */
	Thaw.isThawing = function() {
		return thawing;
	};

	/**
	 * Stops all Thaw instances
	 */
	Thaw.stopAll = function() {
		var i = 0,
			max = thaws.length;

		for(;i< max; i++) {
			thaws[i].stop();
		}
	};

	/**
	 *
	 * @param {Object} [options]
	 * @param {Number} [count]
	 * @constructor
	 */
	Thaw.Block = function(options, count) {
		this.index = 0;
		this.thaws = [];
		this.count = count || 200;
		this.options = options;
	};

	Thaw.Block.prototype = {

		/**
		 * add an item to the end of items
		 * @param item
		 * @returns {Thaw.Block}
		 */
		add: function(item) {
			var next = this._next();
			next.add(item);

			return this;
		},

		/**
		 * add an Array to the end of items
		 * @param items
		 * @returns {Thaw.Block}
		 */
		addArray: function(items) {
			var next = this._next();
			next.addArray(items);

			return this;
		},

		/**
		 * insert an item into items @ current position
		 * @param item
		 * @returns {Thaw.Block}
		 */
		insert: function(item) {
			var next = this._next();
			next.insert(item);

			return this;
		},

		/**
		 * insert and array into items @ current position
		 * @param items
		 * @returns {Thaw.Block}
		 */
		insertArray: function(items) {
			var next = this._next();
			next.insertArray(items);

			return this;
		},

		/**
		 * Stops all thaws in this block
		 * @returns {Thaw.Block}
		 */
		stop: function() {
			var i = 0,
				thaws = this.thaws,
				max = thaws.length;

			for (;i < max;i++) {
				thaws[i].stop();
			}

			return this;
		},

		/**
		 * Get next available in block
		 * @returns {*}
		 * @private
		 */
		_next: function() {
			var _thaw,
				i = this.index,
				thaws = this.thaws;

			if (this.thaws.length < this.count) {
				this.thaws.push(_thaw = new Thaw([], this.options));
			} else {
				_thaw = thaws[i];
			}

			this.index++;
			if (this.index >= this.count) {
				this.index = 0;
			}

			return _thaw;
		}
	};


	/**
	 * simple thaw
	 * @param {Array} items
	 * @param {Object} [options]
	 * @returns Thaw
	 */
	function thaw(items, options) {
		options = options || {};

		var timeout,
			i = 0,
			done = options.done || null,
			each = options.each || null,
			item,
			u = undefined;

		function tick() {
			if (i < 0) return;

			timeout = setTimeout(tick, 0);

			if (!thawing) {
				item = items[i];

				if (i >= items.length) {

					if (done !== null) {
						thawing = true;
						done.call(item, i);
						thawing = false;
					}

					i = -1;
					clearTimeout(timeout);
					return;
				}

				if (each !== null) {
					thawing = true;
					each.call(item, i);
					thawing = false;
				} else if (item !== u) {
					item();
				}
				i++;
			}
		}

		tick();
	}

	thaw.stopAll = Thaw.stopAll;
	thaw.isThawing = Thaw.isThawing;

	if (window !== null) {
		window.thaw = thaw;
	}

	return Thaw;
})(typeof window !== 'undefined' ? window : null);