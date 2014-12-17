Sheet.Cell = (function() {
	var u = undefined;

	function Constructor(sheetIndex, td, jS, cellHandler) {
		if (Constructor.prototype.thaw === null) {
			Constructor.prototype.thaw = new Thaw([]);
			Constructor.cellLoading = jS.msg.cellLoading;
		}
		if (td !== undefined && td !== null) {
			this.td = td;
			td.jSCell = this;
		}
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

			if (this.dependencies.indexOf(cell) < 0 && this !== cell) {
				this.dependencies.push(cell);
			}
		},
		/**
		 * Ignites calculation with cell, is recursively called if cell uses value from another cell, can be sent indexes, or be called via .call(cell)
		 * @param {Function} [callback]
		 * @returns {*} cell value after calculated
		 */
		updateValue:function (callback) {
			if (
				!this.needsUpdated
				&& this.value.cell !== u
				&& this.defer === u
			) {
				var result = (this.valueOverride !== u ? this.valueOverride : this.value);
				this.displayValue();
				if (callback !== u) {
					callback.call(this, result);
				}
				return;
			}

			//If the value is empty or has no formula, and doesn't have a starting and ending handler, then don't process it
			if (this.formula.length < 1 && this.cellType === null && this.defer === u) {
				if (
					this.value !== undefined
					&& (
						(this.value + '').length < 1
						|| !this.hasOperator.test(this.value)
					)
				)
				{
					if (this.td !== null) {
						this.td.innerHTML = this.encode(this.value);
					}
					this.value = new String(this.value);
					this.value.cell = this;
					this.updateDependencies();
					this.needsUpdated = false;
					
					if (callback !== u) {
						callback.call(this, this.value);
					}
					return;
				}
			}

			var operatorFn,
				cell = this,
				cache,
				stack,
				value = this.value,
				formula = this.formula,
				cellType = this.cellType,
				cellTypeHandler,
				defer = this.defer,
				td = this.td,
				calcStack,
				formulaParser,
				typesStack,
				doneFn = function(value) {
					//cell.thaw
						//.add(function() {
							//setup cell trace from value
							if (
								value === u
								|| value === null
							) {
								value = new String();
							}

							if (value.cell === u) {
								switch (typeof(value)) {
									case 'object':
										break;
									case 'undefined':
										value = new String();
										break;
									case 'number':
										value = new Number(value);
										break;
									case 'boolean':
										value = new Boolean(value);
										break;
									case 'string':
									default:
										value = new String(value);
										break;
								}
								value.cell = cell;
							}
							cell.value = value;
							cache = cell.displayValue().valueOf();
						//})

						//cell.thaw.add(function() {
							cell.state.shift();
							cell.updateDependencies();
						//});

						//.add(function() {
							if (cell.loader !== null) {
								cell.loader
									.setCellAttributes(cell.loadedFrom, {
										'cache': (typeof cache !== 'object' ? cache : null),
										'formula': cell.formula,
										'value': cell.value + '',
										'cellType': cell.cellType,
										'uneditable': cell.uneditable
									})
									.setDependencies(cell);
							}

							cell.needsUpdated = false;
						//})

						//.add(function() {
							if (callback !== u) {
								callback.call(cell, cell.valueOverride !== u ? cell.valueOverride : cell.value);
							}
						//})
				};

			//detect state, if any
			/*switch (this.state[0]) {
				case 'updating':
					value = new String();
					value.cell = this;
					value.html = '#VAL!';
					if (callback !== u) {
						callback.call(this, value);
					}
					return;
				case 'updatingDependencies':
					if (callback !== u) {
						callback.call(this, this.valueOverride != u ? this.valueOverride : this.value);
					}
					return;
			}*/

			//merging creates a defer property, which points the cell to another location to get the other value
			if (defer !== u) {
				defer.updateValue(function(value) {
					value = value.valueOf();
	
					switch (typeof(value)) {
						case 'object':
							break;
						case 'undefined':
							value = new String();
							break;
						case 'number':
							value = new Number(value);
							break;
						case 'boolean':
							value = new Boolean(value);
							break;
						case 'string':
						default:
							value = new String(value);
							break;
					}
					value.cell = this;
					this.updateDependencies();
					this.needsUpdated = false;
					
					if (callback !== u) {
						callback.call(cell, value);
					}
				});
				return;
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
				//this.thaw.add(function() {
					if (formula.charAt(0) === '=') {
						cell.formula = formula = formula.substring(1);
					}

					calcStack = Sheet.calcStack;
					//visual feedback
					if (cell.td !== u) {
						cell.td.innerHTML = Constructor.cellLoading;
					}
					Sheet.calcStack++;

					cell.parseFormula({
						formula: formula,
						callback: function (parsedFormula) {
							cell.resolveFormula(parsedFormula, function (value) {
								if (value !== u && value !== null) {
									if (value.cell !== u && value.cell !== cell) {
										value = value.valueOf();
									}

									Sheet.calcStack--;

									if (
										cellType !== null
										&& (cellTypeHandler = Sheet.CellTypeHandlers[cellType]) !== u
									) {
										value = cellTypeHandler(cell, value);
									}

									doneFn.call(cell, value);
								} else {
									doneFn.call(cell, null);
								}
							}, formula);
						}
					});
				//});

			} else if (
				value !== u
				&& value !== null
				&& cellType !== null
				&& (cellTypeHandler = Sheet.CellTypeHandlers[cellType]) !== u
			) {
				//this.thaw.add(function() {
					value = cellTypeHandler(cell, value);
					doneFn(value);
				//});
			} else {
				//this.thaw.add(function () {
					switch (typeof value.valueOf()) {
						case 'string':
							operatorFn = cell.startOperators[value.charAt(0)];
							if (operatorFn !== u) {
								cell.valueOverride = operatorFn.call(cell, value);
							} else {
								operatorFn = cell.endOperators[value.charAt(value.length - 1)];
								if (operatorFn !== u) {
									cell.valueOverride = operatorFn.call(cell, value);
								}
							}
							break;
						case 'undefined':
							value = '';
							break;
					}
					doneFn(value);
				//});
			}
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
				valType = typeof value,
				html = value.html;

			if (html === u) {
				if (
					valType === 'string'
					|| (
					value !== null
					&& valType === 'object'
					&& value.toUpperCase !== u
					)
					&& value.length > 0
				) {
					html = this.encode(value);
				} else {
					html = value;
				}
			}

			//if the td is from a loader, and the td has not yet been created, just return it's values
			if (td === u || td === null) {
				return html;
			}

			switch (typeof html) {
				case 'object':
					if (html === null) {
						td.innerHTML = '';
					} else if (html.appendChild !== u) {

						//if html already belongs to another element, just return nothing for it's cache, formula function is probably managing it
						if (html.parentNode !== null) {
							td.innerHTML = value.valueOf();
						} else {
							//otherwise, append it to this td
							td.innerHTML = '';
							td.appendChild(html);
						}

						return '';
					}
				case 'string':
				default:
					td.innerHTML = html;
			}

			return td.innerHTML;
		},

		resolveFormula: function(parsedFormula, callback, formula) {
			//if error, return it
			if (typeof parsedFormula === 'string') {
				callback(parsedFormula);
			}

			var cell = this,
				steps = [],
				value,
				i = 0,
				max = parsedFormula.length,
				parsed,
				handler = this.cellHandler,
				thaw = this.thaw,
				addCell = function(cell, args) {
					var boundArgs = [],
						arg,
						j = 0,
						jMax = args.length;

					for (;j < jMax; j++) {
						arg = args[j];
						if (typeof(arg) == 'number') {
							arg = parsedFormula[arg];
						} else if (arg instanceof Array) {
							arg = argBinder(arg);
						}
						boundArgs[j] = arg;
					}

					boundArgs.unshift(cell);

					return boundArgs;
				},
				argBinder = function(args) {
					var i = args.length - 1,
						arg;
					if (i < 0) return;
					do {
						arg = args[i];
						if (typeof(arg) === 'number') {
							args[i] = parsedFormula[arg];
						}

						else if (arg.hasOwnProperty('args')) {
							args[i].args = argBinder(arg.args);
						}
						else if (arg instanceof Array) {
							args[i] = argBinder(arg);
						}
					} while (i-- > 0);

					return args;
				},
				doneFn = function(value) {
					if (steps.length > 0) {
						//thaw.add(
							steps.shift()();
						//);
					} else {
						if (value !== u) {
							//thaw.add(function() {
								callback(cell.value = value);
							//});
						}
					}
				};


			for (; i < max; i++) {
				parsed = parsedFormula[i];
				switch (parsed.type) {
					//method
					case 'm':
						(function(parsed, i) {
							steps.push(function() {
								doneFn(parsedFormula[i] = handler[parsed.method].apply(handler, addCell(cell, parsed.args)));
							});
						})(parsed, i);
						break;

					//lookup
					case 'l':
						(function(parsed, i) {
							steps.push(function() {
								//setup callback
								parsed.args.push(function (value) {
									doneFn(parsedFormula[i] = value);
								});

								handler[parsed.method].apply(handler, addCell(cell, parsed.args));
							});
						})(parsed, i);
						break;
					//value
					case 'v':
						(function(parsed, i) {
							steps.push(function() {
								doneFn(parsedFormula[i] = parsed.value);
							});
						})(parsed, i);
						break;

					case 'cell':
						steps.push(function() {
							doneFn();
						});
				}
			}

			doneFn();
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
		 * @param {Boolean} [parentNeedsUpdated] default true
		 */
		setNeedsUpdated: function(parentNeedsUpdated) {
			if (parentNeedsUpdated !== u) {
				this.needsUpdated = parentNeedsUpdated;
			} else {
				this.needsUpdated = true;
			}

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

			return val
				.replace(/&/gi, '&amp;')
				.replace(/>/gi, '&gt;')
				.replace(/</gi, '&lt;')
				//.replace(/\n/g, '\n<br>')  breaks are only supported from formulas
				.replace(/\t/g, '&nbsp;&nbsp;&nbsp ')
				.replace(/  /g, '&nbsp; ');
		},

		hasOperator: /(^[$£])|([%]$)/,

		startOperators: {
			'$':function(val, ch) {
				return this.cellHandler.fn.DOLLAR.call(this, val.substring(1).replace(Globalize.culture().numberFormat[','], ''), 2, ch || '$');
			},
			'£':function(val) {
				return this.startOperators['$'].call(this, val, '£');
			}
		},

		endOperators: {
			'%': function(value) {
				return value.substring(0, this.value.length - 1) / 100;
			}
		},

		type: Constructor,
		typeName: 'Sheet.Cell',
		thaw: null,
		parseFormula: function(item) {
			var i = Constructor.threadIndex,
				threads = Constructor.threads ,
				thread,
				thaw = this.thaw,
				isThreadAbsent = (typeof threads[i] === 'undefined');

			if (isThreadAbsent) {
				thread = Constructor.threads[i] = operative(function(formula) {
					if (typeof formula === 'string') {
						return parser.Formula().parse(formula);
					}
					return null;
				}, [
					Constructor.formulaParserUrl
				]);
			} else {
				thread = threads[i];
			}

			Constructor.threadIndex++;
			if (Constructor.threadIndex > Constructor.threadLimit) {
				Constructor.threadIndex = 0;
			}

			if (thread.stash === u) thread.stash = [];

			if (thread.busy) {
				thread.stash.push(function() {
					thread.busy = true;
					thread(item.formula, function(parsedFormula) {
						thread.busy = false;
						item.callback(parsedFormula);
						if (thread.stash.length > 0) {
							thaw.add(thread.stash.shift());
						}
					});
				});
			} else {
				thread.busy = true;
				thread(item.formula, function(parsedFormula) {
					thread.busy = false;
					item.callback(parsedFormula);
					if (thread.stash.length > 0) {
						thaw.add(thread.stash.shift());
					}
				});
			}
		}
	};

	Constructor.remainingItems = [];
	Constructor.threads = [];
	Constructor.threadLimit = 24;
	Constructor.threadIndex = 0;
	Constructor.cellLoading = null;
	Constructor.formulaParserUrl = '../parser/formula/formula.js';

	return Constructor;
})();