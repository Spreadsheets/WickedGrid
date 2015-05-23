Sheet.Cell = (function() {
	var u = undefined;

	function Cell(sheetIndex, td, jS, cellHandler) {
		if (Cell.cellLoading === null) {
			Cell.cellLoading = jS.msg.cellLoading;
		}
		if (td !== undefined && td !== null) {
			this.td = td;
			td.jSCell = this;
		} else {
			this.td = null;
		}
		this.dependencies = [];
		this.formula = '';
		this.cellType = null;
		this.value = '';
		this.valueOverride = null;
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
		this.waitingCallbacks = [];
		this.parsedFormula = null;
		this.defer = null;
		this.isEdit = false;
		this.edited = false;
		this.covered = false;
	}

	Cell.prototype = {
		clone: function() {
			var clone = new Cell(this.sheetIndex, this.td, this.jS, this.cellHandler),
				prop;
			for (prop in this) if (
				prop !== undefined
				&& this.hasOwnProperty(prop)
			) {
				if (this[prop] !== null && this[prop].call === undefined) {
					clone[prop] = this[prop];
				} else if (this[prop] === null) {
					clone[prop] = this[prop];
				}
			}

			return clone;
		},

		addDependency:function(cell) {
			if (cell === undefined || cell === null) return;

			if (cell.type !== Sheet.Cell) {
				throw new Error('Wrong Type');
			}

			if (this.dependencies.indexOf(cell) < 0 && this !== cell) {
				this.dependencies.push(cell);
				if (this.loader !== null) {
					this.loader.addDependency(this, cell);
				}
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
				&& this.defer === null
			) {
				var result = (this.valueOverride !== null ? this.valueOverride : this.value);
				this.displayValue();
				if (callback !== u) {
					callback.call(this, result);
				}
				if (this.waitingCallbacks.length > 0) while (this.waitingCallbacks.length > 0) this.waitingCallbacks.pop().call(this, result);
				return;
			}

			//If the value is empty or has no formula, and doesn't have a starting and ending handler, then don't process it
			if (this.cellType === null && this.defer === null && this.formula.length < 1) {
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
					this.needsUpdated = false;
					this.updateDependencies();

					if (callback !== u) {
						callback.call(this, this.value);
					}
					if (this.waitingCallbacks.length > 0) while (this.waitingCallbacks.length > 0) this.waitingCallbacks.pop().call(this, this.value);
					return;
				}
			}

			var operatorFn,
				cell = this,
				cache,
				value = this.value,
				formula = this.formula,
				cellType = this.cellType,
				cellTypeHandler,
				defer = this.defer,
				callbackValue,
				resolveFormula = function (parsedFormula) {
					cell.parsedFormula = parsedFormula;
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
					});
				},
				doneFn = function(value) {
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

					cell.state.shift();

					if (cell.loader !== null) {
						cell.loader
							.setCellAttributes(cell.loadedFrom, {
								'cache': (typeof cache !== 'object' ? cache : null),
								'formula': cell.formula,
								'parsedFormula': cell.parsedFormula,
								'value': cell.value + '',
								'cellType': cell.cellType,
								'uneditable': cell.uneditable
							})
							.setDependencies(cell);
					}

					cell.needsUpdated = false;

					callbackValue = cell.valueOverride !== null ? cell.valueOverride : cell.value;
					if (callback !== u) {
						callback.call(cell, callbackValue);
					}
					if (cell.waitingCallbacks.length > 0) while (cell.waitingCallbacks.length > 0) cell.waitingCallbacks.pop().call(cell, callbackValue);

					cell.updateDependencies();
				};

			if (this.state.length > 0) {
				if (callback !== u) {
					this.waitingCallbacks.push(callback);
				}
				return;
			}

			//TODO: Detect reciprocal dependency
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
			if (defer !== null) {
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
					value.cell = cell;
					cell.value = value;
					cell.updateDependencies();
					cell.needsUpdated = false;
					cell.displayValue();
					if (callback !== u) {
						callback.call(cell, value);
					}
					if (cell.waitingCallbacks.length > 0) while (cell.waitingCallbacks.length > 0) cell.waitingCallbacks.pop().call(cell, value);
				});
				return;
			}

			//we detect the last value, so that we don't have to update all cell, thus saving resources
			//reset values
			this.oldValue = value;
			this.state.unshift('updating');
			this.fnCount = 0;
			this.valueOverride = null;

			//increment times this cell has been calculated
			this.calcCount++;
			if (formula.length > 0) {
				if (formula.charAt(0) === '=') {
					cell.formula = formula = formula.substring(1);
				}

				//visual feedback
				if (cell.td !== null) {
					while(cell.td.lastChild !== null) {
						cell.td.removeChild(cell.td.lastChild);
					}
					cell.td.appendChild(document.createTextNode(Cell.cellLoading));
				}

				Sheet.calcStack++;

				if (this.parsedFormula !== null) {
					resolveFormula(this.parsedFormula);
				} else {
					this.jS.parseFormula(formula, resolveFormula);
				}

			} else if (
				value !== u
				&& value !== null
				&& cellType !== null
				&& (cellTypeHandler = Sheet.CellTypeHandlers[cellType]) !== u
			) {
				value = cellTypeHandler(cell, value);
				doneFn(value);
			} else {
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
				html = value.html,
				text;

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
						while(td.lastChild !== null) {
							td.removeChild(td.lastChild);
						}
					} else if (html.appendChild !== u) {

						//if html already belongs to another element, just return nothing for it's cache, formula function is probably managing it
						if (html.parentNode === null) {
							//otherwise, append it to this td
							while(td.lastChild !== null) {
								td.removeChild(td.lastChild);
							}
							td.appendChild(html);
						}

						return '';
					}
				case 'string':
				default:
					while(td.lastChild !== null) {
						td.removeChild(td.lastChild);
					}
					td.appendChild(document.createTextNode(html));
			}

			return td.innerHTML;
		},

		resolveFormula: function(parsedFormula, callback) {
			//if error, return it
			if (typeof parsedFormula === 'string') {
				callback(parsedFormula);
			}

			var cell = this,
				steps = [],
				i = 0,
				max = parsedFormula.length,
				parsed,
				handler = this.cellHandler,
				resolved = [],
				addCell = function(cell, args) {
					var boundArgs = [],
						arg,
						j = args.length - 1;

					if (j < 0) return;
					do {
						arg = args[j];
						switch (typeof arg) {
							case 'number':
								boundArgs[j] = resolved[arg];
								break;
							case 'string':
								boundArgs[j] = arg;
								break;
							case 'object':
								if (arg instanceof Array) {
									boundArgs[j] = argBinder(arg);
									break;
								}
							default:
								boundArgs[j] = arg;
						}
					} while(j-- > 0);

					boundArgs.unshift(cell);

					return boundArgs;
				},
				argBinder = function(args) {
					var boundArgs = [],
						j = args.length - 1,
						arg;

					if (j < 0) return;
					do {
						arg = args[j];
						switch (typeof arg) {
							case 'number':
								boundArgs[j] = resolved[arg];
								break;
							case 'string':
								boundArgs[j] = arg;
								break;
							case 'object':
								if (arg.hasOwnProperty('args')) {
									boundArgs[j] = arg;
									boundArgs[j].a = argBinder(arg.a);
									break;
								}
								else if (arg instanceof Array) {
									boundArgs[j] = argBinder(arg);
									break;
								}
							default:
								boundArgs[j] = arg;
						}
					} while (j-- > 0);

					return boundArgs;
				},
				doneFn;

			if (cell.jS.s.useStack) {
				doneFn = function(value) {
					var j = Cell.thawIndex,
						thaws = Cell.thaws,
						_thaw,
						isThawAbsent = (typeof thaws[j] === 'undefined');

					if (isThawAbsent) {
						_thaw = Cell.thaws[j] = new Thaw([]);
					} else {
						_thaw = thaws[j];
					}

					Cell.thawIndex++;
					if (Cell.thawIndex > Cell.thawLimit) {
						Cell.thawIndex = 0;
					}

					_thaw.add(function() {
						if (steps.length > 0) {
							steps.shift()();
						} else {
							callback(cell.value = (value !== u ? value : null));
						}
					});
				};
			} else {
				doneFn = function(value) {
					if (steps.length > 0) {
						steps.shift()();
					} else {
						callback(cell.value = (value !== u ? value : null));
					}
				}
			}

			for (; i < max; i++) {
				parsed = parsedFormula[i];
				switch (parsed.t) {
					//method
					case 'm':
						(function(parsed, i) {
							steps.push(function() {
								doneFn(resolved[i] = handler[parsed.m].apply(handler, addCell(cell, parsed.a)));
							});
						})(parsed, i);
						break;

					//lookup
					case 'l':
						(function(parsed, i) {
							steps.push(function() {
								//setup callback
								var lookupArgs = addCell(cell, parsed.a);

								lookupArgs.push(function (value) {
									doneFn(resolved[i] = value);
								});

								handler[parsed.m].apply(handler, lookupArgs);
							});
						})(parsed, i);
						break;
					//value
					case 'v':
						(function(parsed, i) {
							steps.push(function() {
								doneFn(resolved[i] = parsed.v);
							});
						})(parsed, i);
						break;

					case 'cell':
						(function(parsed, i) {
							steps.push(function() {
								resolved[i] = parsed;
								doneFn();
							});
						})(parsed, i);

						break;
					case u:
						resolved[i] = parsed;
						break;
					default:
						resolved[i] = null;
						throw new Error('Not implemented:' + parsed.t);
						break;
				}
			}

			doneFn();
		},

		recurseDependencies: function (fn, depth) {

			if (depth > Cell.maxRecursion) {
				this.recurseDependenciesFlat(fn);
				return this;
			}

			var i = 0,
				dependencies = this.dependencies,
				dependency,
				max = dependencies.length;

			if (depth === undefined) {
				depth = 0;
			}

			for(;i < max; i++) {
				dependency = dependencies[i];
				fn.call(dependency);
				dependency.recurseDependencies(fn, depth);
			}

			return this;
		},

		//http://jsfiddle.net/robertleeplummerjr/yzswj5tq/
		//http://jsperf.com/recursionless-vs-recursion
		recurseDependenciesFlat: function (fn) {
			var dependencies = this.dependencies,
				i = dependencies.length - 1,
				dependency,
				childDependencies,
				remaining = [];

			if (i < 0) return;

			do {
				remaining.push(dependencies[i]);
			} while (i-- > 0);

			do {
				dependency = remaining[remaining.length - 1];
				remaining.length--;
				fn.call(dependency);

				childDependencies = dependency.dependencies;
				i = childDependencies.length - 1;
				if (i > -1) {
					do {
						remaining.push(childDependencies[i]);
					} while(i-- > 0);
				}

			} while (remaining.length > 0);
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
		setAttribute: function (attribute, value) {
			var td = this.td;

			if (td !== u) {
				td[attribute] = value;
			}

			this.loader.setCellAttribute(this.loadedFrom, attribute, value);

			return this;
		},
		setAttributes: function(attributes) {
			var td = this.td,
				i;

			if (td !== u) {
				for (i in attributes) if (attributes.hasOwnProperty(i)) {
					td[attributes] = attributes[i];
				}
			}

			this.loader.setCellAttributes(this.loadedFrom, attributes);

			return this;
		},
		addClass: function(_class) {
			var td = this.td,
				classes,
				index,
				loadedFrom = this.loadedFrom;

			if (td !== u) {
				if (td.classList) {
					td.classList.add(_class);
				} else {
					td.className += ' ' + _class;
				}
			}

			if (loadedFrom !== u) {
				classes = (this.loader.getCellAttribute(loadedFrom, 'class') || '');
				index = classes.split(' ').indexOf(_class);
				if (index < 0) {
					classes += ' ' + _class;
					this.loader.setCellAttribute(loadedFrom, 'class', classes);
				}
			}

			return this;
		},
		removeClass: function(_class) {
			var td = this.td,
				classes,
				index,
				loadedFrom = this.loadedFrom;

			if (td !== u) {
				if (td.classList) {
					td.classList.remove(_class);
				} else {
					classes = (td.className + '').split(' ');
					index = classes.indexOf(_class);
					if (index > -1) {
						classes.splice(index, 1);
						td.className = classes.join(' ');
					}
				}
			}

			if (loadedFrom !== u) {
				classes = (this.loader.getCellAttribute(loadedFrom, 'class') || '').split(' ');
				index = classes.indexOf(_class);
				if (index > -1) {
					classes.splice(index, 1);
					this.loader.setCellAttribute(loadedFrom, 'class', classes.join(' '));
				}
			}

			return this;
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

		type: Cell,
		typeName: 'Sheet.Cell'
	};


	Cell.thaws = [];
	Cell.thawLimit = 500;
	Cell.thawIndex = 0;

	Cell.cellLoading = null;
	Cell.maxRecursion = 10;

	return Cell;
})();