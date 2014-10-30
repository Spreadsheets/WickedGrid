Sheet.Cell = (function() {
	var u = undefined;

	function Constructor(sheetIndex, td, jS, cellHandler) {
		this.td = (td !== undefined ? td : null);
		this.dependencies = [];
		this.formula = '';
		this.cellType = null;
		this.value = '';
		this.calcCount = 0;
		this.sheetIndex = sheetIndex;
		this.rowIndex = null;
		this.columnIndex = null;
		this.jS = (jS !== undefined ? jS : null);
		this.state = [];
		this.needsUpdated = true;
		this.uneditable = false;
		this.id = null;
		this.loader = null;
		this.loadedFrom = null;
		this.cellHandler = cellHandler;
	}

	Constructor.prototype = {
		addDependency:function(cell) {
			if (cell === undefined || cell === null) return;

			if (cell.type !== Sheet.Cell) {
				throw new Exception('Wrong Type');
			}

			if (this.dependencies.indexOf(cell) < 0) {
				this.dependencies.push(cell);
			}
		},
		/**
		 * Ignites calculation with cell, is recursively called if cell uses value from another cell, can be sent indexes, or be called via .call(cell)
		 * @returns {*} cell value after calculated
		 */
		updateValue:function () {
			if ( !this.needsUpdated) {
				return this.value;
			}

			var fn,
				cache,
				value = this.value,
				formula = this.formula,
				cellType = this.cellType,
				cellTypeHandler,
				defer = this.defer,
				td = this.td,
				calcStack,
				formulaParser;

			//detect state, if any
			switch (this.state[0]) {
				case 'updating':
					value = new String();
					value.cell = this;
					value.html = '#VAL!';
					return value;
				case 'updatingDependencies':
					return (this.valueOverride != u ? this.valueOverride : this.value);
			}

			//merging creates a defer property, which points the cell to another location to get the other value
			if (defer !== u) {
				if (value.length > 0) {
					value = new String();
					value.cell = this;
					td.innerHTML = '#REF!';
					return value;
				}
				value = defer.updateValue().valueOf();

				switch (typeof(result)) {
					case 'number':
						value = new Number(value);
						break;
					case 'boolean':
						value = new Boolean(value);
						break;
					case 'string':
						value = new String(value);
						break;
				}
				value.cell = this;
				this.updateDependencies();
				return this.value = value;
			}

			//we detect the last value, so that we don't have to update all cell, thus saving resources
			//reset values
			this.oldValue = value;
			this.state.unshift('updating');
			this.fnCount = 0;
			delete this.valueOverride;

			//increment times this cell has been calculated
			this.calcCount++;
			if (formula.length > 0) {
				if (formula.charAt(0) === '=') {
					this.formula = formula = formula.substring(1);
				}

				calcStack = Sheet.calcStack;
				formulaParser = this.cellHandler.formulaParser(calcStack);
				Sheet.calcStack++;
				formulaParser.setObj(this);

				try {
					value = formulaParser.parse(formula);
				} catch (e) {
					value = e.toString();
				}

				this.needsUpdated = false;

				Sheet.calcStack--;

				if (
					value !== u
					&& value !== null
					&& cellType !== null
					&& (cellTypeHandler = Sheet.CellTypeHandlers[cellType]) !== u
				) {
					value = cellTypeHandler(this, value);
				}
			} else if (
				value !== u
				&& value !== null
				&& cellType !== null
				&& (cellTypeHandler = Sheet.CellTypeHandlers[this.cellType]) !== u
			) {
				value = cellTypeHandler.call(this, value);
			} else {
				switch (typeof value) {
					case 'string':
						fn = this.cellStartingHandlers[value.charAt(0)];
						if (fn !== u) {
							this.valueOverride = fn.call(this, value);
						} else {
							fn = this.cellEndHandlers[value.charAt(value.length - 1)];
							if (fn !== u) {
								this.valueOverride = fn.call(this, value);
							}
						}
						break;
					case 'undefined':
						value = '';
						break;
				}
			}

			//setup cell trace from value
			if (
				value === u
				|| value === null
			) {
				value = new String();
			}

			if (value.cell === u) {
				switch (typeof(value)) {
					case 'number':
						value = new Number(value);
						break;
					case 'boolean':
						value = new Boolean(value);
						break;
					case 'string':
						value = new String(value);
						break;
				}
				value.cell = this;
			}
			this.value = value;
			cache = this.displayValue();

			if (this.loader !== null) {
				this.loader.setCellAttributes(this.loadedFrom, {
					'cache': cache,
					'formula': this.formula,
					'value': this.value + '',
					'cellType': this.cellType,
					'uneditable': this.uneditable
				});
			}

			this.needsUpdated = false;
			this.state.shift();
			this.updateDependencies();

			return (this.valueOverride !== u ? this.valueOverride : this.value);
		},

		/**
		 * Ignites calculation with dependent cells is recursively called if cell uses value from another cell, also adds dependent cells to the dependencies attribute of cell
		 */
		updateDependencies:function () {
			var dependencies,
				dependantCell,
				i;

			//just in case it was never set
			dependencies = this.dependencies;

			//reset
			this.dependencies = [];

			//length of original
			i = dependencies.length - 1;

			//iterate through them backwards
			if (i > -1) {
				this.state.unshift('updatingDependencies');
				do {
					dependantCell = dependencies[i];
					dependantCell.updateValue();
				} while (i-- > 0);
				this.state.shift();
			}

			//if no calculation was performed, then the dependencies have not changed
			if (this.dependencies.length === 0) {
				this.dependencies = dependencies;
			}
		},

		/**
		 * Filters cell's value so correct entity is displayed, use apply on cell object
		 * @returns {String}
		 */
		displayValue:function () {
			var value = this.value,
				td = this.td,
				encodedValue,
				valType = typeof value,
				html = value.html;

			if (
				valType === 'string'
				|| (
				value !== null
				&& valType === 'object'
				&& value.toUpperCase !== u
				)
				&& value.length > 0
			) {
				encodedValue = this.encode(value);
			}

			//if the td is from a loader, and the td has not yet been created, just return it's values
			if (td === null) {
				return value;
			}

			if (html === u) {
				if (encodedValue !== u) {
					html = encodedValue;
				} else {
					html = value;
				}
			}

			switch (typeof html) {
				case 'object':
					if (html === null) {
						td.innerHTML = '';
					} else if (html.appendChild !== u) {

						//if html already belongs to another element, just return nothing for it's cache.
						if (html.parentNode !== null) {
							td.innerHTML = value.valueOf();
							return '';
						}

						//otherwise, append it to this td
						td.innerHTML = '';
						td.appendChild(html);
						break;
					}
				case 'string':
				default:
					td.innerHTML = html;
			}

			return td.innerHTML;
		},

		recurseDependencies: function (fn) {
			var i = 0,
				dependencies = this.dependencies,
				dependency,
				max = dependencies.length;

			for(;i < max; i++) {
				dependency = dependencies[i];
				fn.call(dependency);
				dependency.recurseDependencies(fn);
			}
		},

		/**
		 * A flat list of all dependencies
		 * @returns {Array}
		 */
		getAllDependencies: function() {
			var flatDependencyTree = [];

			this.recurseDependencies(function () {
				flatDependencyTree.push(this);
			});

			return flatDependencyTree;
		},

		/**
		 *
		 */
		setNeedsUpdated: function() {
			this.needsUpdated = true;
			this.recurseDependencies(function() {
				this.needsUpdated = true;
			});
		},

		encode: function (val) {

			switch (typeof val) {
				case 'object':
					//check if it is a date
					if (val.getMonth !== u) {
						return globalize.format(val, 'd');
					}

					return val;
			}

			if (!val) {
				return val || '';
			}
			if (!val.replace) {
				return val || '';
			}
			/*var num = $.trim(val) * 1;
			 if (!isNaN(num)) {
			 return globalize.format(num, "n10").replace(this.endOfNumber, function (orig, radix, num) {
			 return (num ? radix : '') + (num || '');
			 });
			 }*/

			return val
				.replace(/&/gi, '&amp;')
				.replace(/>/gi, '&gt;')
				.replace(/</gi, '&lt;')
				.replace(/\n/g, '\n<br>')
				.replace(/\t/g, '&nbsp;&nbsp;&nbsp ')
				.replace(/  /g, '&nbsp; ');
		},

		cellStartingHandlers: {
			'$':function(val, ch) {
				return this.cellHandler.fn.DOLLAR.call(this, val.substring(1).replace(globalize.culture().numberFormat[','], ''), 2, ch || '$');
			},
			'£':function(val) {
				return this.cellStartingHandlers['$'].call(this, val, '£');
			}
		},

		cellEndHandlers: {
			'%': function(value) {
				return value.substring(0, this.value.length - 1) / 100;
			}
		},

		type: Constructor,
		typeName: 'Sheet.Cell'
	};

	return Constructor;
})();