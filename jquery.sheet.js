/**
 * @project jQuery.sheet() The Ajax Spreadsheet - https://github.com/Spreadsheets/jQuery.sheet
 * @author RobertLeePlummerJr@gmail.com
 * Licensed under MIT
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
 * Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
 * OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

/**
 * @namespace
 * @type {Object|Function}
 */
var jQuery = window.jQuery || {};
var Sheet = (function($, document, window, Date, String, Number, Boolean, Math, RegExp, Error) {
	"use strict";

	var Sheet = {
	defaultTheme: 0,
	themeRollerTheme: 0,
	bootstrapTheme: 1,
	customTheme: 2,

	excelSelectModel: 0,
	googleDriveSelectModel: 1,
	openOfficeSelectModel: 2,

	defaultColumnWidth: 120,
	defaultRowHeight: 20,

	calcStack: 0
};Sheet.Cell = (function() {
	var u = undefined;

	function Constructor(sheetIndex, td, jS, cellHandler) {
		if (Constructor.cellLoading === null) {
			Constructor.cellLoading = jS.msg.cellLoading;
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
	}

	Constructor.prototype = {
		clone: function() {
			var clone = new Constructor(this.sheetIndex, this.td, this.jS, this.cellHandler),
				prop;
			for (prop in this) if (this.hasOwnProperty(prop)) {
				clone[prop] = this[prop];
			}

			return clone;
		},
		addDependency:function(cell) {
			if (cell === undefined || cell === null) return;

			if (cell.type !== Sheet.Cell) {
				throw new Exception('Wrong Type');
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
					this.updateDependencies();
					this.needsUpdated = false;

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
					cell.td.innerHTML = Constructor.cellLoading;
				}

				Sheet.calcStack++;

				if (this.parsedFormula !== null) {
					resolveFormula(this.parsedFormula);
				} else {
					cell.parseFormula({
						formula: formula,
						callback: resolveFormula
					});
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
						if (html.parentNode === null) {
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
					var j = Constructor.thawIndex,
						thaws = Constructor.thaws,
						_thaw,
						isThawAbsent = (typeof thaws[j] === 'undefined');

					if (isThawAbsent) {
						_thaw = Constructor.thaws[j] = new Thaw([]);
					} else {
						_thaw = thaws[j];
					}

					Constructor.thawIndex++;
					if (Constructor.thawIndex > Constructor.thawLimit) {
						Constructor.thawIndex = 0;
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

			if (depth > Constructor.maxRecursion) {
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

		type: Constructor,
		typeName: 'Sheet.Cell',
		parseFormula: function(item) {
			if (!this.jS.s.useMultiThreads) {
				var formulaParser = this.cellHandler.formulaParser(Sheet.calcStack);
				formulaParser.yy.types = [];
				item.callback(formulaParser.parse(item.formula));
				return;
			}
			var i = Constructor.threadIndex,
				threads = Constructor.threads,
				thread,
				isThreadAbsent = (typeof threads[i] === 'undefined');

			if (isThreadAbsent) {
				thread = Constructor.threads[i] = operative(function(formula) {
					if (typeof formula === 'string') {
						var formulaParser = parser.Formula();
						formulaParser.yy.types = [];
						return formulaParser.parse(formula);
					}
					return null;
				}, [
					Constructor.formulaParserUrl
				]);
				thread.busy = false;
				thread.stash = [];
			} else {
				thread = threads[i];
			}

			Constructor.threadIndex++;
			if (Constructor.threadIndex > Constructor.threadLimit) {
				Constructor.threadIndex = 0;
			}

			if (thread.busy) {
				thread.stash.push(function() {
					thread.busy = true;
					thread(item.formula, function(parsedFormula) {
						thread.busy = false;
						item.callback(parsedFormula);
						if (thread.stash.length > 0) {
							thread.stash.shift()();
						}
					});
				});
			} else {
				thread.busy = true;
				thread(item.formula, function(parsedFormula) {
					thread.busy = false;
					item.callback(parsedFormula);
					if (thread.stash.length > 0) {
						thread.stash.shift()();
					}
				});
			}
		}
	};

	Constructor.threads = [];
	Constructor.threadLimit = 10;
	Constructor.threadIndex = 0;

	Constructor.thaws = [];
	Constructor.thawLimit = 500;
	Constructor.thawIndex = 0;

	Constructor.cellLoading = null;
	Constructor.formulaParserUrl = '../parser/formula/formula.js';
	Constructor.maxRecursion = 10;

	return Constructor;
})();Sheet.CellHandler = (function(Math) {
	function isNum(num) {
		return !isNaN(num);
	}

	var u = undefined,
		nAN = NaN;

	function Constructor(jS, jSE, fn) {
		this.jS = jS;
		this.jSE = jSE;
		this.fn = fn;
		this.spareFormulaParsers = {};
	}

	Constructor.prototype = {
		/**
		 * Variable handler for formulaParser, arguments are the variable split by '.'.  Expose variables by using jQuery.sheet setting formulaVariables
		 * @param {Sheet.Cell} parentCell
		 * @param {*} variable
		 * @returns {*}
		 */
		variable:function (parentCell, variable) {
			if (arguments.length) {
				var name = variable[0],
					attr = variable[1],
					formulaVariables = this.jS.s.formulaVariables,
					formulaVariable,
					result;

				switch (name.toLowerCase()) {
					case 'true':
						result = new Boolean(true);
						result.html = 'TRUE';
						result.cell = parentCell;
						return result;
					case 'false':
						result = new Boolean(false);
						result.html = 'FALSE';
						result.cell = parentCell;
						return result;
				}

				if (formulaVariable = formulaVariables[name] && !attr) {
					return formulaVariable;
				} else if (formulaVariable && attr) {
					return formulaVariable[attr];
				} else {
					return '';
				}
			}
		},

		/**
		 * time to fraction of day 1 / 0-24
		 * @param {Sheet.Cell} parentCell
		 * @param {String} time
		 * @param {Boolean} isAmPm
		 * @returns {*}
		 */
		time:function (parentCell, time, isAmPm) {
			return times.fromString(time, isAmPm);
		},

		/**
		 * get a number from variable
		 * @param {Sheet.Cell} parentCell
		 * @param {*} num
		 * @returns {Number}
		 */
		number:function (parentCell, num) {
			if (isNaN(num) || num === null) {
				num = 0;
			}

			switch (typeof num) {
				case 'number':
					return num;
				case 'string':
					if (isNum(num)) {
						return num * 1;
					}
				case 'object':
					if (num.getMonth) {
						return dates.toCentury(num);
					}
			}
			return num;
		},

		/**
		 * get a number from variable
		 * @param {Sheet.Cell} parentCell
		 * @param {*} _num
		 * @returns {Number}
		 */
		invertNumber: function(parentCell, _num) {
			if (isNaN(_num)) {
				_num = 0;
			}

			var num = this.number(parentCell, _num),
				inverted = new Number(num.valueOf() * -1);
			if (num.html) {
				inverted.html = num.html;
			}

			return inverted;
		},

		/**
		 * Perform math internally for parser
		 * @param {Sheet.Cell} parentCell
		 * @param {String} mathType
		 * @param {*} num1
		 * @param {*} num2
		 * @returns {*}
		 */
		performMath: function (parentCell, mathType, num1, num2) {
			if (
				num1 === u
				|| num1 === null
			) {
				num1 = 0;
			}

			if (
				num2 === u
				|| num2 === null
			) {
				num2 = 0;
			}

			var type1,
				type2,
				type1IsNumber = true,
				type2IsNumber = true,
				errors = [],
				value,
				output = function(val) {return val;};

			if (num1.hasOwnProperty('cell')) {
				num1.cell.addDependency(parentCell);
			}
			if (num2.hasOwnProperty('cell')) {
				num2.cell.addDependency(parentCell);
			}

			switch (type1 = (typeof num1.valueOf())) {
				case 'number':break;
				case 'string':
					if (isNum(num1)) {
						num1 *= 1;
					} else {
						type1IsNumber = false;
					}
					break;
				case 'object':
					if (num1.getMonth) {
						num1 = dates.toCentury(num1);
						output = dates.get;
					} else {
						type1IsNumber = false;
					}
					break;
				default:
					type1IsNumber = false;
			}

			switch (type2 = (typeof num2.valueOf())) {
				case 'number':break;
				case 'string':
					if (isNum(num2)) {
						num2 *= 1;
					} else {
						type2IsNumber = false;
					}
					break;
				case 'object':
					if (num2.getMonth) {
						num2 = dates.toCentury(num2);
					} else {
						type2IsNumber = false;
					}
					break;
				default:
					type2IsNumber = false;
			}

			if (!type1IsNumber && mathType !== '+') {
				errors.push('not a number: ' + num1);
				num1 = 0;
			}

			if (!type2IsNumber) {
				errors.push('not a number: ' + num2);
				num2 = 0;
			}

			if (errors.length) {
				//throw new Error(errors.join(';') + ';');
			}

			switch (mathType) {
				case '+':
					value = num1 + num2;
					break;
				case '-':
					value = num1 - num2;
					break;
				case '/':
					value = num1 / num2;
					if (value == Infinity || value == nAN) {
						value = 0;
					}
					break;
				case '*':
					value = num1 * num2;
					break;
				case '^':
					value = Math.pow(num1, num2);
					break;
			}

			return output(value);
		},

		not: function(parentCell, value1, value2) {
			var result;

			if (value1.valueOf() != value2.valueOf()) {
				result = new Boolean(true);
				result.html = 'TRUE';
				result.cell = parentCell;
			} else {
				result = new Boolean(false);
				result.html = 'FALSE';
				result.cell = parentCell;
			}

			return result;
		},

		concatenate: function(parentCell, value1, value2) {
			if (value1 === null) value1 = '';
			if (value2 === null) value2 = '';

			return value1.toString() + value2.toString();
		},

		/**
		 * Get cell value
		 * @param {Sheet.Cell} parentCell
		 * @param {Object} cellRef
		 * @param {Function} [callback]
		 * @returns {Sheet.CellHandler}
		 */
		cellValue:function (parentCell, cellRef, callback) {
			var jS = this.jS,
				loc = jSE.parseLocation(cellRef.c, cellRef.r),
				cell,
				value;

			cell = jS.getCell(parentCell.sheetIndex, loc.row, loc.col);
			if (cell !== null) {
				cell.addDependency(parentCell);
				cell.updateValue(callback);
			} else if (callback !== u) {
				callback.call(parentCell, 0);
			}

			return this;
		},


		/**
		 * Get cell values as an array
		 * @param {Sheet.Cell} parentCell
		 * @param {Object} start
		 * @param {Object} end
		 * @param {Function} [callback]
		 * @returns {Sheet.CellHandler}
		 */
		cellRangeValue:function (parentCell, start, end, callback) {
			return this.remoteCellRangeValue(parentCell, parentCell.sheetIndex, start, end, callback);
		},


		/**
		 * Get cell value from a different sheet within an instance
		 * @param {Sheet.Cell} parentCell
		 * @param {String} sheet example "SHEET1"
		 * @param {Object} cellRef
		 * @param {Function} [callback]
		 * @returns {Sheet.CellHandler}
		 */
		remoteCellValue:function (parentCell, sheet, cellRef, callback) {
			var jSE = this.jSE,
				jS = this.jS,
				loc = jSE.parseLocation(cellRef.c, cellRef.r),
				sheetIndex = jSE.parseSheetLocation(sheet),
				cell;

			if (sheetIndex < 0) {
				sheetIndex = jS.getSpreadsheetIndexByTitle(sheet);
			}

			cell = jS.getCell(sheetIndex, loc.row, loc.col);
			if (cell !== null) {
				cell.addDependency(parentCell);
				cell.updateValue(callback);
			} else if (callback !== u) {
				callback.call(parentCell, 0);
			}

			return this;
		},

		/**
		 * Get cell values as an array from a different sheet within an instance
		 * @param {Sheet.Cell} parentCell
		 * @param {String} sheetTitle example "SHEET1"
		 * @param {Object} start
		 * @param {Object} end
		 * @param {Function} [callback]
		 * @returns {Array}
		 */
		remoteCellRangeValue:function (parentCell, sheetTitle, start, end, callback) {
			var sheetIndex = (typeof sheetTitle === 'string' ? jSE.parseSheetLocation(sheetTitle) : sheetTitle),
				_start = jSE.parseLocation(start.c, start.r),
				_end = jSE.parseLocation(end.c, end.r),
				rowIndex = Math.max(_start.row, _end.row),
				rowIndexEnd = Math.min(_start.row, _end.row),
				colIndexStart = Math.max(_start.col, _end.col),
				colIndexEnd = Math.min(_start.col, _end.col),
				jS = this.jS,
				result = [],
				colIndex,
				cell,
				row,
				stack = [],
				key = sheetIndex + '!' + start.c + start.r + ':' + end.c + end.r,
				cachedRange = Constructor.cellRangeCache[key],
				i,
				max,
				useCache,
				that = this,
				remaining = ((colIndexEnd - 1) - colIndexStart) * ((rowIndexEnd - 1) - rowIndex),
				detected = remaining + 0,
				count = 0,
				sheet;

			if (sheetIndex < 0) {
				sheetIndex = jS.getSpreadsheetIndexByTitle(sheetTitle);
			}

			//can't find spreadsheet here
			if (sheetIndex < 0) {
				result = new String('');
				result.html = '#NAME?';
				callback.call(parentCell, result);

				return this;
			}

			/*if (cachedRange !== u) {
			 useCache = true;
			 max = cachedRange.length;
			 for (i = 0; i < max; i++) {
			 if (cachedRange[i].needsUpdated) {
			 useCache = false
			 }
			 }

			 if (useCache) {
			 callback.call(parentCell, Constructor.cellRangeCache[key]);
			 return this;
			 }
			 }*/

			sheet = jS.spreadsheets[sheetIndex];

			if (sheet === u) {
				jS.spreadsheets[sheetIndex] = sheet = [];
			}

			if (rowIndex >= rowIndexEnd || colIndexStart >= colIndexEnd) {
				result.rowCount = (rowIndexEnd - rowIndex) + 1;
				result.columnCount = (colIndexEnd - colIndexStart) + 1;

				do {
					colIndex = colIndexStart;
					row = (sheet[rowIndex] !== u ? sheet[rowIndex] : null);
					do {
						if (row === null || (cell = row[colIndex]) === u) {
							cell = jS.getCell(sheetIndex, rowIndex, colIndex);
						} else {
							cell.sheetIndex = sheetIndex;
							cell.rowIndex = rowIndex;
							cell.columnIndex = colIndex;
						}

						if (cell !== null) {
							cell.addDependency(parentCell);
							cell.updateValue(function(value) {
								result.unshift(value);
								remaining--;
								if (remaining < 1) {
									Constructor.cellRangeCache[key] = result;
									callback.call(parentCell, result);
								}
							});
							count++;
						}
					} while(colIndex-- > colIndexEnd);
				} while (rowIndex-- > rowIndexEnd);
			}

			return this;
		},

		/**
		 * Calls a function either from jQuery.sheet.engine or defined in jQuery sheet setting formulaFunctions.  When calling a function the cell being called from is "this".
		 * @param {Sheet.Cell} parentCell
		 * @param {String} fn function name (Will be converted to upper case)
		 * @param {Array} [args] arguments needing to be sent to function
		 * @returns {*}
		 */
		callFunction:function (parentCell, fn, args) {
			fn = fn.toUpperCase();
			args = args || [];

			var actualFn = this.fn[fn],
				result;

			if (actualFn !== u) {
				parentCell.fnCount++;
				result = actualFn.apply(parentCell, args);
			}

			else {
				result = new String();
				result.html = "Function " + fn + " Not Found";
			}

			return result;
		},

		formulaParser: function(callStack) {
			var formulaParser;
			//we prevent parsers from overwriting each other
			if (callStack > -1) {
				//cut down on un-needed parser creation
				formulaParser = this.spareFormulaParsers[callStack];
				if (formulaParser === u) {
					formulaParser = this.spareFormulaParsers[callStack] = Formula(this);
				}
			}

			//use the sheet's parser if there aren't many calls in the callStack
			else {
				formulaParser = this.jS.formulaParser;
			}

			return formulaParser;
		}
	};

	Constructor.cellRangeCache = {};

	return Constructor;
})(Math);Sheet.CellTypeHandlers = (function() {
	var n = isNaN,
		CellTypeHandlers = {
		percent: function (cell, value) {
			//https://stackoverflow.com/questions/2652319/how-do-you-check-that-a-number-is-nan-in-javascript/16988441#16988441
			//NaN !== NaN
			if (value !== value) return 0;
			var num = (n(value) ? Globalize.parseFloat(value) : value * 1),
				result;

			if (!n(num)) {//success
				result = new Number(num);
				result.html = Globalize.format(num, 'p');
				return result;
			}

			return value;
		},
		date: function (cell, value) {
			if (value !== value) return 0;
			var date = Globalize.parseDate(value);
			if (date === null) {
				return value;
			} else {
				cell.valueOverride = date;
				cell.html = Globalize.format(date, 'd');
				return value;
			}
		},
		time: function (cell, value) {
			if (value !== value) return 0;
			var date = Globalize.parseDate(value);
			if (date === null) {
				return value;
			} else {
				date.html = Globalize.format(date, 't');
				return date;
			}
		},
		currency: function (cell, value) {
			if (value !== value) return 0;
			var num = (n(value) ? Globalize.parseFloat(value) : value * 1),
				result;

			if (!n(num)) {//success
				result = new Number(num);
				result.html = Globalize.format(num, 'c');
				return result;
			}

			return value;
		},
		number: function (cell, value) {
			if (value !== value) return 0;
			var radix, result;

			if (!CellTypeHandlers.endOfNumber) {
				radix = Globalize.culture().numberFormat['.'];
				CellTypeHandlers.endOfNumber = new RegExp("([" + (radix == '.' ? "\." : radix) + "])([0-9]*?[1-9]+)?(0)*$");
			}

			if (!n(value)) {//success
				result = new Number(value);
				result.html = Globalize.format(value + '', "n10")
					.replace(CellTypeHandlers.endOfNumber, function (orig, radix, num) {
						return (num ? radix : '') + (num || '');
					});
				return result;
			}

			return value;
		}
	};

	return CellTypeHandlers;
})();Sheet.CellRange = (function() {
	function Constructor(cells) {
		this.cells = cells || [];
	}

	Constructor.prototype = {
		clone: function() {
			var clones = [],
				cells = this.cells,
				max = cells.length,
				cell,
				clone;

			for(var i = 0; i < max;i++) {
				cell = cells[i];

				clone = cell.clone();

				clones.push(clone);
			}

			return new Constructor(clones);
		},
		type: Constructor,
		typeName: 'Sheet.CellRange'
	};

	return Constructor;
})();
/**
 * Creates the scrolling system used by each spreadsheet
 */
Sheet.ActionUI = (function(document, window, Math, Number, $) {
	var Constructor = function(enclosure, table, cl, frozenAt, max) {
		this.enclosure = enclosure;
		this.pane = document.createElement('div');
		this.table = table;
		this.max = max;

		this.xIndex = 0;
		this.yIndex = 0;

		this.scrollAxisX = {};
		this.scrollAxisY = {};

		this.scrollSize = {};

		this.hiddenColumns = [];

		if (!(this.frozenAt = frozenAt)) {
			this.frozenAt = {row:0, col:0};
		}

		this.frozenAt.row = Math.max(this.frozenAt.row, 0);
		this.frozenAt.col = Math.max(this.frozenAt.col, 0);

		/**
		 * Where the current sheet is scrolled to
		 * @returns {Object}
		 */
		this.scrolledArea = {
			row: Math.max(this.frozenAt.row, 1),
			col: Math.max(this.frozenAt.col, 1)
		};

		this.foldArea = {
			row: 0,
			col: 0
		};

		var that = this,
			pane = this.pane,
			tBody = this.tBody = table.tBody,
			cssId = '#' + table.getAttribute('id'),
			scrollOuter = this.scrollUI = pane.scrollOuter = document.createElement('div'),
			scrollInner = pane.scrollInner = document.createElement('div'),
			scrollStyleX = this.scrollAxisX.scrollStyle = pane.scrollStyleX = this.scrollStyleX = new Sheet.StyleUpdater(function(index, style) {
				//the reason we save the index and return false is to prevent redraw, a scrollbar may move 100 pixels, but only need to redraw once
				if (that.xIndex === index) return false;

				if (index === undefined || index === null) index = that.xIndex;

				var endIndex = index + that.maximumVisibleColumns,
					startOfSet = arrHelpers.ofSet(that.hiddenColumns, index),
					endOfSet = arrHelpers.ofSet(that.hiddenColumns, endIndex);

				if (startOfSet !== null) {
					index = startOfSet.end + (index - startOfSet.start);
				}

				if (endOfSet !== null) {
					endIndex = endOfSet.end + (endIndex - endOfSet.start);
				}

				that.xIndex = index;

				if (style === undefined) {
					var col = that.frozenAt.col;
					 style =
						 //hide all previous td/th/col elements
						 cssId + ' tr > *:nth-child(-n+' + index + ') {display: none;}' +
						 cssId + ' col:nth-child(-n+' + index + ') {display: none;}' +

						 //but show those that are frozen
						 cssId + ' tr > *:nth-child(-n+' + (col + 1) + ') {display: table-cell;}' +
						 cssId + ' col:nth-child(-n+' + (col + 1) + ') {display: table-column;}' +

						 //hide those that are ahead of current scroll area, but are not in view to keep table redraw fast
						 cssId + ' tr > *:nth-child(' + (endIndex) + ') ~ * {display: none;}' +
						 cssId + ' col:nth-child(' + (endIndex) + ') ~ col {display: none;}';

				}

				this.setStyle(style);
				that.scrolledArea.col = Math.max(index || 1, 1);
				that.foldArea.col = endIndex;
				return true;
			}, max);

		this.yDetacher = new Sheet.Detacher(tBody);

		scrollOuter.setAttribute('class', cl);
		scrollOuter.appendChild(scrollInner);

		$(scrollOuter)
			.disableSelectionSpecial();

		scrollOuter.addEventListener('scroll', function() {
			var total = scrollOuter.scrollTop + scrollOuter.clientHeight;
			if (total >= (scrollInner.clientHeight - (scrollOuter.clientHeight / 2))) {
				scrollInner.style.height = (scrollInner.clientHeight + (scrollOuter.clientHeight * 2)) + 'px';
			}

			total = scrollOuter.scrollLeft + scrollOuter.clientWidth;
			if (total >= (scrollInner.clientWidth - (scrollOuter.clientWidth / 2))) {
				scrollInner.style.width = (scrollInner.clientWidth + (scrollOuter.clientWidth * 2)) + 'px';
			}
		});

		pane.appendChild(scrollStyleX.styleElement);

		new MouseWheel(pane, scrollOuter);
	};

	Constructor.prototype = {
		/**
		 * scrolls the sheet to the selected cell
		 * @param {HTMLElement} td
		 */
		putTdInView:function (td) {
			var i = 0,
				x = 0,
				y = 0,
				direction,
				scrolledTo;

			this.xIndex = 0;
			this.yIndex = 0;

			while ((direction = this.directionToSeeTd(td)) !== null) {
				scrolledTo = this.scrolledArea;

				if (direction.left) {
					x--;
					this.scrollTo(
						'x',
						0,
						scrolledTo.col - 1
					);
				} else if (direction.right) {
					x++;
					this.scrollTo(
						'x',
						0,
						scrolledTo.col + 1
					);
				}

				if (direction.up) {
					y--;
					this.scrollTo(
						'y',
						0,
						scrolledTo.row - 1
					);
				} else if (direction.down) {
					y++;
					this.scrollTo(
						'y',
						0,
						scrolledTo.row + 1
					);
				}

				i++;
				if (i < 25) {
					break;
				}
			}
		},

		/**
		 * detects if a td is not visible
		 * @param {HTMLElement} td
		 * @returns {Boolean|Object}
		 */
		directionToSeeTd:function(td) {
			var pane = this.pane,
				visibleFold = {
					top:0,
					bottom:pane.clientHeight,
					left:0,
					right:pane.clientWidth
				},

				tdWidth = td.clientWidth,
				tdHeight = td.clientHeight,
				tdLocation = {
					top:td.offsetTop,
					bottom:td.offsetTop + tdHeight,
					left:td.offsetLeft,
					right:td.offsetLeft + tdWidth
				},
				tdParent = td.parentNode,
				scrollTo = this.scrolledArea;

			if (!td.col) {
				return null;
			}

			var xHidden = td.barTop.cellIndex < scrollTo.col,
				yHidden = tdParent.rowIndex < scrollTo.row,
				hidden = {
					up:yHidden,
					down:tdLocation.bottom > visibleFold.bottom && tdHeight <= pane.clientHeight,
					left:xHidden,
					right:tdLocation.right > visibleFold.right && tdWidth <= pane.clientWidth
				};

			if (
				hidden.up
				|| hidden.down
				|| hidden.left
				|| hidden.right
			) {
				return hidden;
			}

			return null;
		},



		/**
		 * Causes the pane to redraw, really just for fixing issues in Chrome
		 */
		redraw: function() {
			var style = this.pane.style;

			style.opacity = 0.9999;

			setTimeout(function() {
				style.opacity = 1;
			},0);
		},

		hide:function (jS, hiddenColumns, hiddenRows) {
			var cssId = '#' + this.table.getAttribute('id'),
				pane = this.pane,
				that = this;

			if (this.toggleHideStyleX === null) {
				this.toggleHideStyleX = new Sheet.StyleUpdater(function () {
					var style = this.nthCss('col', cssId, that.hiddenColumns, 0) +
						this.nthCss('> td', cssId + ' tr', that.hiddenColumns, 0) +
						this.nthCss('> th', cssId + ' tr', that.hiddenColumns, 0);

					this.setStyle(style);
				});
			}

			pane.appendChild(this.toggleHideStyleX.styleElement);

			this.hiddenColumns = (hiddenColumns !== null ? hiddenColumns : []);

			if (hiddenRows !== null && hiddenRows.length > 0) {
				hiddenRows.sort();
				this.toggleHideRowRange(jS, hiddenRows[0], hiddenRows[hiddenRows.length - 1], true);
			}

			if (this.hiddenColumns.length > 0) {
				this.hiddenColumns.sort();
				this.toggleHideStyleX.update();
			}
		},

		/**
		 * Toggles a row to be visible
		 * @param {jQuery.sheet.instance} jS
		 * @param {Number} rowIndex
		 */
		toggleHideRow: function(jS, rowIndex) {
			this.toggleHideRowRange(jS, rowIndex);
		},

		/**
		 * Toggles a range of rows to be visible starting at index of 1
		 * @param {jQuery.sheet.instance} jS
		 * @param {Number} startIndex
		 * @param {Number} [endIndex]
		 * @param {Boolean} [hide]
		 */
		toggleHideRowRange: function(jS, startIndex, endIndex, hide) {
			if (!startIndex) return;
			if (!endIndex) endIndex = startIndex;

			var spreadsheets = jS.spreadsheets,
				spreadsheet = spreadsheets[jS.i],
				tBody = this.tBody,
				rowIndex = startIndex,
				row,
				tr,
				removing = (hide !== undefined ? hide : (spreadsheet[startIndex][1].td.parentNode.parentNode !== null)),
				lastAnchorIndex = endIndex + 1,
				lastAnchor = null;

			if (removing) {
				for(;rowIndex <= endIndex && (row = spreadsheet[rowIndex]) !== undefined; rowIndex++){
					tr = row[1].td.parentNode;
					if (tr.parentNode !== null) {
						tBody.removeChild(tr);
					}
				}
			} else {

				while (lastAnchor === null && lastAnchorIndex < spreadsheet.length) {
					row = spreadsheet[lastAnchorIndex++];
					lastAnchor = row[1].td.parentNode;
					if (lastAnchor.parentNode === null) {
						lastAnchor = null;
					}
				}

				for(;rowIndex <= endIndex && (row = spreadsheet[rowIndex]) !== undefined; rowIndex++){
					tr = row[1].td.parentNode;
					if (tr.parentNode !== null) {
						tBody.insertBefore(tr, lastAnchor);
					}
				}
			}

		},

		/**
		 * @param {jQuery.sheet.instance} jS
		 * Makes all rows visible
		 */
		rowShowAll:function (jS) {
			var spreadsheet = jS.spreadsheets[jS.i],
				lastIndex = spreadsheet.length - 1;

			this.toggleHideRowRange(jS, 1, lastIndex, false);
		},


		/**
		 * Toggles a column to be visible
		 * @param {Number} index
		 */
		toggleHideColumn: function(index) {
			var key;
			if ((key = this.hiddenColumns.indexOf(index)) > -1) {
				this.hiddenColumns.splice(key, 1);
			} else {
				this.hiddenColumns.push(index);
			}
			this.hiddenColumns.sort();
			this.toggleHideStyleX.update();
		},
		/**
		 * Toggles a range of columns to be visible starting at index of 1
		 * @param {Number} startIndex
		 * @param {Number} [endIndex]
		 */
		toggleHideColumnRange: function(startIndex, endIndex) {
			if (!startIndex) return;
			if (!endIndex) endIndex = startIndex;

			var hiddenColumns = this.hiddenColumns,
				newHiddenColumns = [],
				max = hiddenColumns.length,
				hiddenColumn,
				i = 0,
				removing = null;

			for(;i < max; i++){
				hiddenColumn = hiddenColumns[i];
				if (hiddenColumn >= startIndex && hiddenColumn <= endIndex) {
					if (removing === null) {
						removing = true;
					}
				} else {
					newHiddenColumns.push(hiddenColumn);
				}
			}

			if (removing === null) {
				for(i = startIndex; i <= endIndex; i++) {
					newHiddenColumns.push(i);
				}
			}

			newHiddenColumns.sort();
			this.hiddenColumns = newHiddenColumns;
			this.toggleHideStyleX.update();
		},
		columnShowAll:function () {
			this.toggleHideStyleX.setStyle('');
			this.hiddenColumns = [];
		},

		remove: function() {

		},


		/**
		 * Scrolls to a position within the spreadsheet
		 * @param {Number} pixel scrollTO
		 */
		scrollToPixelX:function (pixel) {
			var axis = this.scrollAxisX,
				max,
				i,
				value = (pixel / this.pixelScrollDensity) >> 1,
				offset = arrHelpers.indexOfNearestLessThan(this.hiddenColumns, value) + 1;

			if (offset > 0) {
				value += offset;
			}

			max = axis.max;
			axis.value = value;

			i = value > max ? max : value;
			return axis.scrollStyle.update(i);
		},

		/**
		 * Scrolls to a position within the spreadsheet
		 * @param {Number} pixel
		 * @param {Boolean} [isUp]
		 */
		scrollToPixelY: function(pixel, isUp) {
			var i = (pixel / this.pixelScrollDensity) >> 1,
				detacher = this.yDetacher;

			this.yIndex = i;
			this.scrolledArea.row = Math.max(i || 1, 1);

			if (isUp === true) {
				detacher
					.attachAboveAfter(i)
					.detachBelowAfter(i + this.maximumVisibleRows + 1);
			} else {
				detacher
					.detachAboveBefore(i)
					.attachBelowBefore(i + this.maximumVisibleRows + 1);
			}

			return detacher.aboveChanged || detacher.belowChanged;
		},

		scrollToCell: function(axis, value) {
			throw new Error('Not yet implemented');
		},

		/**
		 * @type Sheet.StyleUpdater
		 */
		toggleHideStyleX: null,

		/**
		 * @type Sheet.StyleUpdater
		 */
		toggleHideStyleY: null,

		pixelScrollDensity: 30,
		maximumVisibleRows: 65,
		maximumVisibleColumns: 35
	};

	return Constructor;
})(document, window, Math, Number, $);Sheet.SpreadsheetUI = (function() {
	var stack = [];

	function Constructor(i, ui, table, options) {
		options = options || {};

		this.i = i;
		this.ui = ui;
		this.table = table;
		this.isLast = options.lastIndex === i;
		this.enclosure = null;
		this.pane = null;
		this.spreadsheet = null;

		this.sizeCheck = options.sizeCheck || function() {};
		this.initChildren = options.initChildren || function() {};
		this.done = options.done || function() {};

		this.sizeCheck(this);
	}

	Constructor.prototype = {
		load: function() {
			var table = this.table;
			this.initChildren(this.ui, table, this.i);

			table.pane.ui = this.ui;
			this.enclosure = table.enclosure;
			this.pane = table.pane;
			this.spreadsheet = table.spreadsheet;

			stack.push(this.i);

			if (this.isLast) {
				this.loaded();
			}
		},
		loaded: function() {
			this.done(stack, this);
		}
	};

	return Constructor;
})();Sheet.Theme = (function($) {
	function Constructor(theme) {
		theme = theme || Sheet.defaultTheme;

		switch (theme) {
			case Sheet.customTheme:
				this.cl = Constructor.customClasses;
				break;


			case Sheet.bootstrapTheme:
				this.cl = Constructor.bootstrapClasses;
				break;

			default:
			case Sheet.themeRollerTheme:
				this.cl = Constructor.themeRollerClasses;
				break;
		}

		$.extend(this, this.cl);
	}

	Constructor.themeRollerClasses = {
		autoFiller:'ui-state-active',
		bar:'ui-widget-header',
		barHighlight:'ui-state-active',
		barHandleFreezeLeft:'ui-state-default',
		barHandleFreezeTop:'ui-state-default',
		barMenuTop:'ui-state-default',
		tdActive:'ui-state-active',
		tdHighlighted:'ui-state-highlight',
		control:'ui-widget-header ui-corner-top',
		controlTextBox:'ui-widget-content',
		fullScreen:'ui-widget-content ui-corner-all',
		inPlaceEdit:'ui-state-highlight',
		menu:'ui-widget-header',
		menuFixed: '',
		menuUl:'ui-widget-header',
		menuLi:'ui-widget-header',
		menuHover: 'ui-state-highlight',
		pane: 'ui-widget-content',
		parent:'ui-widget-content ui-corner-all',
		table:'ui-widget-content',
		tab:'ui-widget-header',
		tabActive:'ui-state-highlight',
		barResizer:'ui-state-highlight',
		barFreezer:'ui-state-highlight',
		barFreezeIndicator:'ui-state-highlight'
	};

	Constructor.bootstrapClasses = {
		autoFiller:'btn-info',
		bar:'bg-primary',
		barHighlight:'label-info',
		barHandleFreezeLeft:'bg-warning',
		barHandleFreezeTop:'bg-warning',
		barMenuTop:'bg-warning',
		tdActive:'active',
		tdHighlighted:'bg-info',
		control:'bg-primary',
		controlTextBox:'form-control',
		fullScreen:'',
		inPlaceEdit:'form-control',
		menu:'panel panel-default',
		menuFixed: 'nav navbar-nav',
		menuUl:'panel-info',
		menuLi:'active',
		menuHover: 'bg-primary active',
		pane: 'well',
		parent:'panel panel-default',
		table:'table table-bordered table-condensed',
		tab:'btn-default btn-xs',
		tabActive:'active',
		barResizer:'bg-info',
		barFreezer:'bg-warning',
		barFreezeIndicator:'bg-warning'
	};

	Constructor.customClasses = {
		autoFiller:'',
		bar:'',
		barHighlight:'',
		barHandleFreezeLeft:'',
		barHandleFreezeTop:'',
		barMenuTop:'',
		tdActive:'',
		tdHighlighted:'',
		control:'',
		controlTextBox:'',
		fullScreen:'',
		inPlaceEdit:'',
		menu:'',
		menuFixed: '',
		menuUl:'',
		menuLi:'',
		menuHover: '',
		pane: '',
		parent:'',
		table:'',
		tab:'',
		tabActive:'',
		barResizer:'',
		barFreezer:'',
		barFreezeIndicator:''
	};

	return Constructor;
})(jQuery);
/**
 * Creates the scrolling system used by each spreadsheet
 */
Sheet.Highlighter = (function(document, window, $) {
	var Constructor = function(cssClass, cssClassBars, cssClassTabs, callBack) {
		this.cssClass = cssClass;
		this.cssClassBars = cssClassBars;
		this.cssClassTabs = cssClassTabs;
		this.callBack = callBack || function() {};

		this.last = $([]);
		this.lastTop = $([]);
		this.lastLeft = $([]);
		this.lastTab = $([]);
		this.startRowIndex = 0;
		this.startColumnIndex = 0;
		this.endRowIndex = 0;
		this.endColumnIndex = 0;
	};

	Constructor.prototype = {
		set: function (obj) {
			if (obj.parentNode !== undefined) {
				obj = [obj];
			}

			var i,
				oldObjects = this.last;

			//_obj is the old selected items
			if (oldObjects && oldObjects.length > 0) {
				i = oldObjects.length - 1;
				do {
					oldObjects[i].isHighlighted = false;
				} while (i-- > 0);
			}

			if (obj.length > 0) {
				i = obj.length - 1;
				do {
					if (!obj[i].isHighlighted) {
						obj[i].isHighlighted = true;
						if (!obj[i].className.match(this.cssClass)) {
							obj[i].className += ' ' + this.cssClass;
						}
					}
				} while (i-- > 0);
			}

			this.clear(oldObjects);
			this.last = obj;

			this.callBack();
			return this;
		},

		/**
		 * Detects if there is a cell highlighted
		 * @returns {Boolean}
		 */
		is:function () {
			return this.last.length > 0;
		},

		/**
		 * Clears highlighted cells
		 * @param {Object} [obj]
		 */
		clear:function (obj) {
			if (this.is()) {
				obj = obj || this.last;

				if (obj && obj.length) {
					var i = obj.length - 1;
					do {
						if (!obj[i].isHighlighted) {
							obj[i].className = obj[i].className.replace(this.cssClass, '');
							obj[i].isHighlighted = false;
						}
					} while (i-- > 0);
				}
			}

			this.last = $([]);

			return this;
		},


		/**
		 * Sets a bar to be active
		 * @param {String} direction left or top
		 * @param {HTMLElement} td index of bar
		 */
		setBar:function (direction, td) {
			switch (direction) {
				case 'top':
					this.lastTop
						.removeClass(this.cssClassBars);
					this.lastTop = $(td).addClass(this.cssClassBars);
					break;
				case 'left':
					this.lastLeft
						.removeClass(this.cssClassBars);
					this.lastLeft = $(td).addClass(this.cssClassBars);
					break;
			}

			return this;
		},

		/**
		 * Clears bars from being active
		 */
		clearBar:function () {
			this.lastTop
				.removeClass(this.cssClassBars);
			this.lastTop = $([]);

			this.lastLeft
				.removeClass(this.cssClassBars);
			this.lastLeft = $([]);

			return this;
		},



		/**
		 * Sets a tab to be active
		 */
		setTab:function (tab) {
			this.clearTab();
			this.lastTab = tab.addClass(this.cssClassTabs);

			return this;
		},

		/**
		 * Clears a tab from being active
		 */
		clearTab:function () {
			this.lastTab
				.removeClass(this.cssClassTabs);

			return this;
		},

		setStart: function(cell) {
			this.startRowIndex = cell.rowIndex + 0;
			this.startColumnIndex = cell.columnIndex + 0;

			return this;
		},

		setEnd: function(cell) {
			this.endRowIndex = cell.rowIndex + 0;
			this.endColumnIndex = cell.columnIndex + 0;

			return this;
		}
	};

	return Constructor;

})(document, window, jQuery);
;Sheet.ColumnAdder = (function() {
	function Constructor() {
		this.qty = -1;

		this.addedFinishedFn = null;
		this.createBarFn = null;
		this.createCellFn = null;
	}

	Constructor.prototype = {
		setQty: function(qty, sheetSize) {
			var max = $.sheet.max;

			if (max) {
				//if current size is less than max, but the qty needed is more than the max
				if (max > sheetSize.cols && max <= sheetSize.cols + qty) {
					this.qty = max - sheetSize.cols;
				}

				//if current size is more than max
				else if (max && max <= sheetSize.cols + qty) {
					return false;
				}
			} else {
				this.qty = qty;
			}

			return true;
		},
		setAddedFinishedFn: function(fn) {
			this.addedFinishedFn = fn;
		},
		setCreateBarFn: function(fn) {
			this.createBarFn = fn;
		},
		setCreateCellFn: function(fn) {
			this.createCellFn = fn;
		},
		createCells:function (i, size, isBefore) {
			var offset = (isBefore ? 0 : 1),
				rowMax = size.rows || 1,
				colMax = i + this.qty,
				row,
				col = i,
				bar;

			for (; col < colMax; col++) {

				bar = this.createBarFn(col + offset);

				for (row = 1; row <= rowMax; row++) {
					this.createCellFn(row, col + offset, bar);
				}
			}

			if (this.addedFinishedFn !== null) {
				this.addedFinishedFn({
					row: 0,
					col: this.qty
				});
			}
		}
	};

	return Constructor;
})();
;Sheet.RowAdder = (function() {
	function Constructor() {
		this.qty = -1;

		this.addedFinishedFn = null;
		this.createBar = null;
		this.createCell = null;
		this.hidden = null;
	}

	Constructor.prototype = {
		setQty: function(qty, sheetSize, minSize) {
			var max = $.sheet.max;

			if (max) {
				//if current size is less than max, but the qty needed is more than the max
				if (max > sheetSize.rows && max <= sheetSize.rows + qty) {
					this.qty = max - sheetSize.rows;
				}

				//if current size is more than max
				else if (max && max <= sheetSize.rows + qty) {
					return false;
				}
			} else {
				this.qty = qty;
			}

			return true;
		},
		setAddedFinishedFn: function(fn) {
			this.addedFinishedFn = fn;
		},
		setCreateBarFn: function(fn) {
			this.createBar = fn;
		},
		setCreateCellFn: function(fn) {
			this.createCell = fn;
		},
		setHidden: function(hidden) {
			this.hidden = hidden || [];
		},
		createCells:function (i, size, isBefore) {
			var offset = (isBefore ? 0 : 1),
				rowMax = i + this.qty,
				colMax = size.cols || 1,
				rowParent,
				isHidden,
				row = i,
				col;

			for (; row < rowMax; row++) {
				isHidden = this.hidden.indexOf(row + offset) > -1;

				//create a new row
				rowParent = this.createBar(row + offset, isHidden);

				for (col = 1; col <= colMax; col++) {
					this.createCell(row + offset, col, rowParent, isHidden);
				}
			}

			if (this.addedFinishedFn !== null) {
				this.addedFinishedFn({
					row: this.qty,
					col: 0
				});
			}
		}
	};

	return Constructor;
})();(function(Sheet) {
	var u = undefined;

	/**
	 * Detaches DOM elements from a parent to keep the DOM fast. Can be used with hundreds of thousands r even millions of
	 * DOM elements to simulate a scrolling like behaviour.
	 * @param {HTMLElement} parent
	 * @param {Number} maximumVisible
	 * @property {Array} detachedAbove
	 * @property {Array} detachedBelow
	 * @property {HTMLElement} parent
	 * @property {Boolean} aboveChanged
	 * @property {Boolean} belowChanged
	 * @constructor
	 * @memberOf Sheet
	 */
	function Detacher(parent, maximumVisible) {
		this.parent = parent;
		this.maximumVisible = maximumVisible;

		this.detachedAbove = [];
		this.detachedBelow = [];
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
			i;

		//if there are too many in above count, return
		if (maxIndex < aboveCount) return;

		while ((i = (aboveCount + (children.length - 1))) > maxIndex) {
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
				detachedAbove = this.detachedAbove;

			this.aboveChanged = false;

			while (detachedAbove.length - 1 < maxIndex) {
				//we will always detach the first element
				detachable = detachables[1];

				//if the first element doesn't exist, then stop detaching
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
				detachedAbove = this.detachedAbove,
				i;

			this.aboveChanged = false;

			while ((i = detachedAbove.length - 1) >= minIndex) {
				//attach it
				detached = detachedAbove.pop();
				frag.insertBefore(detached, frag.firstChild);

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
				detachedBelow = this.detachedBelow,
				frag = document.createDocumentFragment(),
				fragChildren = frag.children,
				offset = this.detachedAbove.length + parent.children.length,
				i;

			this.belowChanged = false;
			while ((i = offset + (fragChildren.length - 1)) < maxIndex && this.detachedBelow.length > 0) {
				if (detachedBelow.length < 1) break;
				//attach it
				detached = detachedBelow.shift();
				frag.appendChild(detached);
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
Sheet.StyleUpdater = (function(document) {
	function Constructor(updateFn) {
		var el = this.styleElement = document.createElement('style');
		el.styleUpdater = this;
		this._update = updateFn;
	}
	Constructor.prototype = {
		/**
		 * @methodOf Sheet.StyleUpdater
		 * @type {Function}
		 */
		setStyle: null,
		/**
		 * @methodOf Sheet.StyleUpdater
		 * @type {Function}
		 */
		getStyle: null,

		/**
		 * Creates css for an iterated element
		 * @param {String} elementName
		 * @param {String} parentSelectorString
		 * @param {Array} indexes
		 * @param {Number} min
		 * @param {String} [css]
		 * @methodOf Sheet.StyleUpdater
		 * @type {Function}
		 * @returns {String}
		 */
		nthCss: function (elementName, parentSelectorString, indexes, min, css) {
			var style = [],
				index = indexes.length;

			css = css || '{display: none;}';

			do {
				if (indexes[index] > min) {
					style.unshift(parentSelectorString + ' ' + elementName + ':nth-child(' + (indexes[index] + 1) + ')');
				}
			} while (index--);

			if (style.length) {
				return style.join(',') + css;
			}

			return '';
		},

		/**
		 * Repeats a string a number of times
		 * @param {String} str
		 * @param {Number} num
		 * @returns {String}
		 */
		repeat: function (str, num) {
			var result = '';
			while (num > 0) {
				if (num & 1) {
					result += str;
				}
				num >>= 1;
				str += str;
			}
			return result;
		},
		update: function() {
			return this._update.apply(this, arguments);
		}
	};

	//ie
	if (document.createElement('style').styleSheet) {
		Constructor.prototype.setStyle = function(css) {
			var el = this.styleElement,
				ss = el.styleSheet;

			ss.disabled = false;//IE8 bug, for some reason in some scenarios disabled never becomes enabled.  And even setting here don't actually set it, it just ensures that is is set to disabled = false when the time is right
			if (!ss.disabled) {
				ss.cssText = css;
			}
		};

		Constructor.prototype.getStyle = function() {
			var el = this.styleElement,
				ss = el.styleSheet;

			ss.disabled = false;//IE8 bug, for some reason in some scenarios disabled never becomes enabled.  And even setting here don't actually set it, it just ensures that is is set to disabled = false when the time is right
			if (!ss.disabled) {
				return ss.cssText;
			}
			return '';
		};
	} else {
		//standard
		Constructor.prototype.setStyle = function(css) {
			this.styleElement.innerHTML = css;
		};
		Constructor.prototype.getStyle = function() {
			return this.styleElement.innerHTML;
		};
	}

	return Constructor;
})(document);/**
 * @project jQuery.sheet() The Ajax Spreadsheet - http://code.google.com/p/jquerysheet/
 * @author RobertLeePlummerJr@gmail.com
 * $Id: jquery.sheet.dts.js 933 2013-08-28 12:59:30Z robertleeplummerjr $
 * Licensed under MIT
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

;Sheet.JSONLoader = (function($, document, String) {
	"use strict";
	function Constructor(json) {
		if (json !== undefined) {
			this.json = json;
			this.count = json.length;
		} else {
			this.json = [];
			this.count = 0;
		}

		this.cellIds = {};
		this.jS = null;
		this.handler = null;
	}

	Constructor.prototype = {
		bindJS: function(jS) {
			this.jS = jS;
			return this;
		},
		bindHandler: function(handler) {
			this.handler = handler;
			return this;
		},
		size: function(spreadsheetIndex) {
			var size = {
					cols: 0,
					rows: 0
				},
				json = this.json,
				jsonSpreadsheet,
				rows,
				firstRow,
				firstRowColumns;

			if ((jsonSpreadsheet = json[spreadsheetIndex]) === undefined) return size;
			if ((rows = jsonSpreadsheet.rows) === undefined) return size;
			if ((firstRow = rows[0]) === undefined) return size;
			if ((firstRowColumns = firstRow.columns) === undefined) return size;

			return {
				rows: rows.length,
				cols: firstRowColumns.length
			};
		},
		getWidth: function(sheetIndex, columnIndex) {
			var json = this.json,
				jsonSpreadsheet = json[sheetIndex] || {},
				metadata = jsonSpreadsheet.metadata || {},
				widths = metadata.widths || [],
				width = widths[columnIndex] || Sheet.defaultColumnWidth;

			return width;
		},
		getHeight: function(sheetIndex, rowIndex) {
			var json = this.json,
				jsonSpreadsheet = json[sheetIndex] || {},
				rows = jsonSpreadsheet.rows || [],
				row = rows[rowIndex] || {},
				height = row.height || Sheet.defaultRowHeight;

			return height;
		},
		isHidden: function(sheetIndex) {
			var json = this.json,
				jsonSpreadsheet = json[sheetIndex] || {},
				metadata = jsonSpreadsheet.metadata || {};

			return metadata.hidden === true;
		},
		setMetadata: function(sheetIndex, metadata) {
			var json = this.json,
				jsonSpreadsheet = json[sheetIndex] || {},
				jsonMetadata = jsonSpreadsheet.metadata || (jsonSpreadsheet.metadata = {});

			var i;
			for (i in metadata) if (metadata.hasOwnProperty(i)) {
				jsonMetadata[i] = metadata[i];
			}

			return this;
		},
		setupCell: function(sheetIndex, rowIndex, columnIndex) {
			var td = document.createElement('td'),
				cell = this.jitCell(sheetIndex, rowIndex, columnIndex),
				jsonCell,
				html;

			if (cell === null) return cell;
			jsonCell = cell.loadedFrom;
			if (jsonCell === null) return null;


			if (cell.hasOwnProperty('formula')) {
				td.setAttribute('data-formula', cell['formula'] || '');
				/*if (cell.hasOwnProperty('value') && cell.value !== null) {
					html = cell.value.hasOwnProperty('html') ? cell.value.html : cell.value;
					switch (typeof html) {
						case 'object':
							if (html.appendChild !== undefined) {
								td.appendChild(html);
								break;
							}
						case 'string':
						default:
							td.innerHTML = html;
							break;
					}
				}*/
				if (jsonCell.hasOwnProperty('cache')) {
					if (jsonCell['cache'] !== null && jsonCell['cache'] !== '') {
						td.innerHTML = jsonCell['cache'];
					}
				}
			} else if (jsonCell['cellType'] !== undefined) {
				td.setAttribute('data-celltype', jsonCell['cellType']);
				cell.cellType = jsonCell['cellType'];
				if (jsonCell.hasOwnProperty('cache')) {
					td.innerHTML = jsonCell['cache'];
				}
			}
			else {
				td.innerHTML = cell['value'];
			}


			if (jsonCell['class'] !== undefined) td.className = jsonCell['class'];
			if (jsonCell['style'] !== undefined) td.setAttribute('style', jsonCell['style']);
			if (jsonCell['rowspan'] !== undefined) td.setAttribute('rowspan', jsonCell['rowspan']);
			if (jsonCell['colspan'] !== undefined) td.setAttribute('colspan', jsonCell['colspan']);
			if (jsonCell['uneditable'] !== undefined) td.setAttribute('data-uneditable', jsonCell['uneditable']);

			if (jsonCell['id'] !== undefined) {
				td.setAttribute('id', jsonCell['id']);
				cell.id = jsonCell['id'];
			}

			td.jSCell = cell;
			cell.td = td;
			cell.sheetIndex = sheetIndex;
			cell.rowIndex = rowIndex;
			cell.columnIndex = columnIndex;

			return cell;
		},
		getCell: function(sheetIndex, rowIndex, columnIndex) {
			var json = this.json,
				jsonSpreadsheet,
				rows,
				row,
				cell;

			if ((jsonSpreadsheet = json[sheetIndex]) === undefined) return null;
			if ((rows = jsonSpreadsheet.rows) === undefined) return null;
			if ((row = rows[rowIndex - 1]) === undefined) return null;
			if ((cell = row.columns[columnIndex - 1]) === undefined) return null;

			return cell;
		},
		jitCell: function(sheetIndex, rowIndex, columnIndex) {
			var jsonCell = this.getCell(sheetIndex, rowIndex, columnIndex);

			if (jsonCell === null) return null;

			if (jsonCell.getCell !== undefined) {
				return jsonCell.getCell();
			}

			var jitCell,
				i,
				id,
				max,
				value,
				cache,
				formula,
				parsedFormula,
				cellType,
				uneditable,
				dependency,
				dependencies,
				jsonDependency,
				hasId,
				hasValue,
				hasCache,
				hasFormula,
				hasParsedFormula,
				hasCellType,
				hasUneditable,
				hasDependencies;

			id = jsonCell['id'];
			value = jsonCell['value'];
			cache = jsonCell['cache'];
			formula = jsonCell['formula'];
			parsedFormula = jsonCell['parsedFormula'];
			cellType = jsonCell['cellType'];
			uneditable = jsonCell['uneditable'];
			dependencies = jsonCell['dependencies'];

			hasId = (id !== undefined && id !== null);
			hasValue = (value !== undefined && value !== null);
			hasCache = (cache !== undefined && cache !== null && (cache + '').length > 0);
			hasFormula = (formula !== undefined && formula !== null && formula !== '');
			hasParsedFormula = (parsedFormula !== undefined && parsedFormula !== null);
			hasCellType = (cellType !== undefined && cellType !== null);
			hasUneditable = (uneditable !== undefined && uneditable !== null);
			hasDependencies = (dependencies !== undefined && dependencies !== null);

			jitCell = new Sheet.Cell(sheetIndex, null, this.jS, this.handler);
			jitCell.rowIndex = rowIndex;
			jitCell.columnIndex = columnIndex;
			jitCell.loadedFrom = jsonCell;
			jitCell.loader = this;

			if (hasId) jitCell.id = id;

			if (hasFormula) jitCell.formula = formula;
			if (hasParsedFormula) jitCell.parsedFormula = parsedFormula;
			if (hasCellType) jitCell.cellType = cellType;
			if (hasUneditable) jitCell.uneditable = uneditable;


			if (hasValue) {
				jitCell.value = new String(value);
			}
			else {
				jitCell.value = new String();
			}

			if (hasCache) {
				jitCell.value.html = cache;
				jitCell.needsUpdated = false;
			} else {
				jitCell.needsUpdated = (hasFormula || hasCellType || jitCell.hasOperator.test(value));
			}

			if (hasDependencies) {
				max = dependencies.length;
				for (i = 0; i < max; i++) {
					jsonDependency = dependencies[i];
					dependency = this.jitCell(jsonDependency['s'], jsonDependency['r'], jsonDependency['c']);
					if (dependency !== null) {
						jitCell.dependencies.push(dependency);
					}
				}
			}

			jitCell.value.cell = jitCell;


			jsonCell.getCell = function() {
				return jitCell;
			};

			return jitCell;
		},
		jitCellById: function(id) {
			if (this.cellIds[id] !== undefined) {
				return this.cellIds[id].requestCell();
			}

			var loader = this,
				json = this.json,
				sheetIndex = json.length - 1,
				sheet,
				rowIndex,
				rows,
				row,
				columnIndex,
				columns,
				column;

			if (sheetIndex < 0) return null;

			do {
				sheet = json[sheetIndex];
				rows = sheet.rows;
				rowIndex = rows.length - 1;
				do {
					row = rows[rowIndex];
					columns = row.columns;
					columnIndex = columns.length - 1;

					do {
						column = columns[columnIndex];
						if (typeof column['id'] == 'string') {
							this.cellIds[id] = {
								cell: column,
								sheetIndex: sheetIndex,
								rowIndex: rowIndex,
								columnIndex: columnIndex,
								requestCell: function() {
									return loader.jitCell(this.sheetIndex, this.rowIndex, this.columnIndex);
								}
							};
						}
					} while(columnIndex-- > 0);
				} while(rowIndex-- > 0);
			} while(sheetIndex-- > 0);

			if (this.cellIds[id] !== undefined) {
				return this.cellIds[id].requestCell();
			}
			return this.cellIds[id] = null;
		},
		title: function(sheetIndex) {
			var json = this.json,
				jsonSpreadsheet;

			if ((jsonSpreadsheet = json[sheetIndex]) === undefined) return '';

			return jsonSpreadsheet.title || '';
		},
		hiddenRows: function(sheetIndex) {
			var metadata = this.json[sheetIndex].metadata || {},
				jsonHiddenRows = metadata.hiddenRows || [],
				max = jsonHiddenRows.length,
				result = [],
				i = 0;

			for (;i < max; i++) result.push(jsonHiddenRows[i]);

			return result;
		},
		hiddenColumns: function(sheetIndex) {
			var metadata = this.json[sheetIndex].metadata || {},
				jsonHiddenColumns = metadata.hiddenColumns || [],
				max = jsonHiddenColumns.length,
				result = [],
				i = 0;

			for (;i < max; i++) result.push(jsonHiddenColumns[i]);

			return result;
		},
		hasSpreadsheetAtIndex: function(index) {
			return (this.json[index] !== undefined);
		},
		getSpreadsheetIndexByTitle: function(title) {
			var json = this.json,
				max = this.count,
				i = 0,
				jsonTitle;

			title = title.toLowerCase();

			for(;i < max; i++) {
				if (json[i] !== undefined) {
					jsonTitle = json[i].title;
					if (jsonTitle !== undefined && jsonTitle !== null && jsonTitle.toLowerCase() == title) {
						return i;
					}
				}
			}

			return -1;
		},
		addSpreadsheet: function(jsonSpreadsheet, atIndex) {
			if (atIndex === undefined) {
				this.json.push(jsonSpreadsheet);
			} else {
				this.json.splice(atIndex, 0, jsonSpreadsheet);
			}
			this.count = this.json.length;
		},
		getCellAttribute: function(cell, attribute) {
			return cell[attribute];
		},
		setCellAttribute: function(cell, attribute, value) {
			cell[attribute] = value;
		},
		setCellAttributes: function(cell, attributes) {
			var i;
			for (i in attributes) {
				if (attributes.hasOwnProperty(i)) {
					cell[i] = attributes[i];
				}
			}

			return this;
		},


		/**
		 *
		 * @param {Sheet.Cell} cell
		 */
		setDependencies: function(cell) {
			//TODO: need to handle the cell's cache that are dependent on this one so that it changes when it is in view
			//some cells just have a ridiculous amount of dependencies
			if (cell.dependencies.length > Constructor.maxStoredDependencies) {
				delete cell.loadedFrom['dependencies'];
				return this;
			}

			var i = 0,
				loadedFrom = cell.loadedFrom,
				dependencies = cell.dependencies,
				dependency,
				max = dependencies.length,
				jsonDependencies = loadedFrom['dependencies'] = [];

			for(;i<max;i++) {
				dependency = dependencies[i];
				jsonDependencies.push({
					s: dependency.sheetIndex,
					r: dependency.rowIndex,
					c: dependency.columnIndex
				});
			}

			return this;
		},

		addDependency: function(parentCell, dependencyCell) {
			var loadedFrom = parentCell.loadedFrom;

			if (loadedFrom.dependencies === undefined) {
				loadedFrom.dependencies = [];
			}

			loadedFrom.dependencies.push({
				s: dependencyCell.sheetIndex,
				r: dependencyCell.rowIndex,
				c: dependencyCell.columnIndex
			});

		    return this;
		},

		cycleCells: function(sheetIndex, fn) {
			var json = this.json,
				jsonSpreadsheet,
				rows,
				columns,
				jsonCell,
				row,
				rowIndex,
				columnIndex;

			if ((jsonSpreadsheet = json[sheetIndex]) === undefined) return;
			if ((rowIndex = (rows = jsonSpreadsheet.rows).length) < 1) return;
			if (rows[0].columns.length < 1) return;

			rowIndex--;
			do
			{
				row = rows[rowIndex];
				columns = row.columns;
				columnIndex = columns.length - 1;
				do
				{
					jsonCell = columns[columnIndex];
					fn.call(jsonCell, sheetIndex, rowIndex + 1, columnIndex + 1);
				}
				while (columnIndex-- > 0);
			}
			while (rowIndex-- > 0);

			return this;
		},
		cycleCellsAll: function(fn) {
			var json = this.json,
				sheetIndex = json.length - 1;

			if (sheetIndex < 0) return;

			do
			{
				this.cycleCells(sheetIndex, fn);
			}
			while (sheetIndex-- > 0);

			return this;
		},
		/**
		 * Create a table from json
		 * @param {Array} json array of spreadsheets - schema:<pre>
		 * [{ // sheet 1, can repeat
		 *  "title": "Title of spreadsheet",
		 *  "metadata": {
		 *	  "widths": [
		 *		  120, //widths for each column, required
		 *		  80
		 *	  ]
		 *  },
		 *  "rows": [
		 *	  { // row 1, repeats for each column of the spreadsheet
		 *		  "height": 18, //optional
		 *		  "columns": [
		 *			  { //column A
		 *				  "cellType": "", //optional
		 *				  "class": "css classes", //optional
		 *				  "formula": "=cell formula", //optional
		 *				  "value": "value", //optional
		 *				  "style": "css cell style", //optional
		 *				  "uneditable": true, //optional
		 *				  "cache": "" //optional
		 *			  },
		 *			  {} //column B
		 *		  ]
		 *	  },
		 *	  { // row 2
		 *		  "height": 18, //optional
		 *		  "columns": [
		 *			  { // column A
		 *				  "cellType": "", //optional
		 *				  "class": "css classes", //optional
		 *				  "formula": "=cell formula", //optional
		 *				  "value": "value", //optional
		 *				  "style": "css cell style" //optional
		 *				  "uneditable": true, //optional
		 *				  "cache": "" //optional
		 *			  },
		 *			  {} // column B
		 *		  ]
		 *	  }
		 *  ]
		 * }]</pre>
		 * @returns {*|jQuery|HTMLElement} a simple html table
		 * @memberOf Sheet.JSONLoader
		 */
		toTables: function() {

			var json = this.json,
				max = this.count,
				tables = $([]),
				spreadsheet,
				rows,
				row,
				columns,
				column,
				metadata,
				widths,
				width,
				frozenAt,
				hiddenRows,
				hiddenColumns,
				height,
				table,
				colgroup,
				col,
				tr,
				td,
				i = 0,
				j,
				k;


			for (; i < max; i++) {
				spreadsheet = json[i];
				table = $(document.createElement('table'));
				if (spreadsheet['title']) table.attr('title', spreadsheet['title'] || '');

				tables = tables.add(table);

				rows = spreadsheet['rows'];
				for (j = 0; j < rows.length; j++) {
					row = rows[j];
					if (height = (row['height'] + '').replace('px','')) {
						tr = $(document.createElement('tr'))
							.attr('height', height)
							.css('height', height + 'px')
							.appendTo(table);
					}
					columns = row['columns'];
					for (k = 0; k < columns.length; k++) {
						column = columns[k];
						td = $(document.createElement('td'))
							.appendTo(tr);

						if (column['class']) td.attr('class', column['class'] || '');
						if (column['style']) td.attr('style', column['style'] || '');
						if (column['formula']) td.attr('data-formula', (column['formula'] ? '=' + column['formula'] : ''));
						if (column['cellType']) td.attr('data-celltype', column['cellType'] || '');
						if (column['value']) td.html(column['value'] || '');
						if (column['uneditable']) td.html(column['uneditable'] || '');
						if (column['rowspan']) td.attr('rowspan', column['rowspan'] || '');
						if (column['colspan']) td.attr('colspan', column['colspan'] || '');
						if (column['id']) td.attr('id', column['id'] || '');
						if (column['cache']) td.html(column['cache']);
					}
				}

				if (metadata = spreadsheet['metadata']) {
					if (widths = metadata['widths']) {
						colgroup = $(document.createElement('colgroup'))
							.prependTo(table);
						for(k = 0; k < widths.length; k++) {
							width = (widths[k] + '').replace('px', '');
							col = $(document.createElement('col'))
								.attr('width', width)
								.css('width', width + 'px')
								.appendTo(colgroup);
						}
					}
					if (frozenAt = metadata['frozenAt']) {
						if (frozenAt['row']) {
							table.attr('data-frozenatrow', frozenAt['row']);
						}
						if (frozenAt['col']) {
							table.attr('data-frozenatcol', frozenAt['col']);
						}
					}

					if (hiddenRows = metadata['hiddenRows']) {
						table.attr('data-hiddenrows', hiddenRows.join(','));
					}

					if (hiddenColumns = metadata['hiddenColumns']) {
						table.attr('data-hiddencolumns', hiddenColumns.join(','));
					}
				}
			}

			return tables;
		},

		/**
		 * Create json from jQuery.sheet Sheet instance
		 * @param {Boolean} [doNotTrim] cut down on added json by trimming to only edited area
		 * @returns {Array}  - schema:<pre>
		 * [{ // sheet 1, can repeat
				 *  "title": "Title of spreadsheet",
				 *  "metadata": {
				 *	  "widths": [
				 *		  "120px", //widths for each column, required
				 *		  "80px"
				 *	  ],
				 *	  "frozenAt": {row: 0, col: 0},
				 *	  "hiddenRows": [1,2,3],
				 *	  "hiddenColumns": [1,2,3]
				 *  },
				 *  "rows": [
				 *	  { // row 1, repeats for each column of the spreadsheet
				 *		  "height": "18px", //optional
				 *		  "columns": [
				 *			  { //column A
				 *				  "cellType": "", //optional
				 *				  "class": "css classes", //optional
				 *				  "formula": "=cell formula", //optional
				 *				  "value": "value", //optional
				 *				  "style": "css cell style", //optional
				 *				  "uneditable": false,  //optional
				 *				  "cache": "",  //optional
				 *				  "id": "" //optional
				 *			  },
				 *			  {} //column B
				 *		  ]
				 *	  },
				 *	  { // row 2
				 *		  "height": "18px", //optional
				 *		  "columns": [
				 *			  { // column A
				 *				  "cellType": "", //optional
				 *				  "class": "css classes", //optional
				 *				  "formula": "=cell formula", //optional
				 *				  "value": "value", //optional
				 *				  "style": "css cell style", //optional
				 *				  "uneditable": true, //optional
				 *				  "cache": "", //optional
				 *				  "id": "" //optional
				 *			  },
				 *			  {} // column B
				 *		  ]
				 *	  }
				 *  ]
				 * }]</pre>
		 * @memberOf Sheet.JSONLoader
		 */
		fromSheet: function(doNotTrim) {
			doNotTrim = (doNotTrim == undefined ? false : doNotTrim);

			var output = [],
				jS = this.jS,
				i = 1 * jS.i,
				pane,
				sheet = jS.spreadsheets.length - 1,
				jsonSpreadsheet,
				spreadsheet,
				row,
				column,
				parentAttr,
				jsonRow,
				jsonColumn,
				cell,
				attr,
				cl,
				parent,
				rowHasValues,
				parentEle,
				parentHeight;

			if (sheet < 0) return output;

			do {
				rowHasValues = false;
				jS.i = sheet;
				jS.evt.cellEditDone();
				pane = jS.obj.pane();
				jsonSpreadsheet = {
					"title": (jS.obj.table().attr('title') || ''),
					"rows": [],
					"metadata": {
						"widths": [],
						"frozenAt": {
							"row": pane.actionUI.frozenAt.row,
							"col": pane.actionUI.frozenAt.col
						}
					}
				};

				output.unshift(jsonSpreadsheet);

				spreadsheet = jS.spreadsheets[sheet];
				row = spreadsheet.length - 1;
				do {
					parentEle = spreadsheet[row][1].td.parentNode;
					parentHeight = parentEle.style['height'];
					jsonRow = {
						"columns": [],
						"height": (parentHeight ? parentHeight.replace('px', '') : jS.s.colMargin)
					};

					column = spreadsheet[row].length - 1;
					do {
						cell = spreadsheet[row][column];
						jsonColumn = {};
						attr = cell.td.attributes;

						if (doNotTrim || rowHasValues || attr['class'] || cell['formula'] || cell['value'] || attr['style']) {
							rowHasValues = true;

							cl = (attr['class'] ? $.trim(
								(attr['class'].value || '')
									.replace(jS.cl.uiCellActive , '')
									.replace(jS.cl.uiCellHighlighted, '')
							) : '');

							parent = cell.td.parentNode;

							jsonRow.columns.unshift(jsonColumn);

							if (!jsonRow["height"]) {
								jsonRow["height"] = (parent.style['height'] ? parent.style['height'].replace('px' , '') : jS.s.colMargin);
							}

							if (cell['formula']) jsonColumn['formula'] = cell['formula'];
							if (cell['cellType']) jsonColumn['cellType'] = cell['cellType'];
							if (cell['value']) jsonColumn['value'] = cell['value'];
							if (cell['uneditable']) jsonColumn['uneditable'] = cell['uneditable'];
							if (cell['cache']) jsonColumn['cache'] = cell['cache'];
							if (cell['id']) jsonColumn['id'] = cell['id'];
							if (attr['style'] && attr['style'].value) jsonColumn['style'] = attr['style'].value;


							if (cl.length) {
								jsonColumn['class'] = cl;
							}
							if (attr['rowspan']) jsonColumn['rowspan'] = attr['rowspan'].value;
							if (attr['colspan']) jsonColumn['colspan'] = attr['colspan'].value;

							if (row * 1 == 1) {
								jsonSpreadsheet.metadata.widths.unshift($(jS.col(null, column)).css('width').replace('px', ''));
							}
						}
					} while (column-- > 1);

					if (rowHasValues) {
						jsonSpreadsheet.rows.unshift(jsonRow);
					}

				} while (row-- > 1);
			} while (sheet--);
			jS.i = i;

			return this.json = output;
		},
		type: Constructor,
		typeName: 'Sheet.JSONLoader',

		clearCaching: function() {
			var json = this.json,
				spreadsheet,
				row,
				rows,
				column,
				columns,
				sheetIndex = 0,
				rowIndex,
				columnIndex,
				sheetMax = json.length,
				rowMax,
				columnMax;

			for (;sheetIndex < sheetMax; sheetIndex++) {
				spreadsheet = json[sheetIndex];
				rows = spreadsheet['rows'];
				rowMax = rows.length;

				for (rowIndex = 0; rowIndex < rowMax; rowIndex++) {
					row = rows[rowIndex];
					columns = row['columns'];
					columnMax = columns.length;

					for (columnIndex = 0; columnIndex < columnMax; columnIndex++) {
						column = columns[columnIndex];

						delete column['cache'];
						delete column['dependencies'];
						delete column['parsedFormula'];
					}
				}
			}

			return this;
		},
		/**
		 *
		 */
		download: function(rowSplitAt) {
			rowSplitAt = rowSplitAt || 500;

			var w = window.open(),
				d,
				entry,
				json = this.json,
				i = 0,
				max = json.length - 1,
				spreadsheet;


			//popup blockers
			if (w !== undefined) {
				d = w.document;
				d.write('<html>\
	<head id="head"></head>\
	<body>\
		<div id="entry">\
		</div>\
	</body>\
</html>');

				entry = $(d.getElementById('entry'));

				while (i <= max) {
					spreadsheet = json[i];

					//strategy: slice spreadsheet into parts so JSON doesn't get overloaded and bloated
					if (spreadsheet.rows.length > rowSplitAt) {
						var spreadsheetPart = {
								title: spreadsheet.title,
								metadata: spreadsheet.metadata,
								rows: []
							},
							rowParts = [],
							rowIndex = 0,
							row,
							rows = spreadsheet.rows,
							rowCount = rows.length,
							fileIndex = 1,
							setIndex = 0,
							addFile = function(json, index) {
								entry.append(document.createElement('br'));
								entry
									.append(
										$(document.createElement('a'))
											.attr('download', spreadsheet.title + '-part' + index +'.json')
											.attr('href', URL.createObjectURL(new Blob([JSON.stringify(json)], {type: "application/json"})))
											.text(spreadsheet.title + ' - part ' + index)
									);
							};

						addFile(spreadsheetPart, fileIndex);
						/*entry
							.append(
								document.createElement('br')
							)
							.append(
								$(document.createElement('a'))
									.attr('download', spreadsheet.title + '-part' + fileIndex +'.json')
									.attr('href', new Blob([JSON.stringify()], {type: "application/json"}))
									.text(spreadsheet.title + ' part:' + fileIndex)
							);*/

						while (rowIndex < rowCount) {
							if (setIndex === rowSplitAt) {
								setIndex = 0;
								fileIndex++;

								addFile(rowParts, fileIndex);

								rowParts = [];
							}
							rowParts.push(rows[rowIndex]);
							setIndex++;
							rowIndex++
						}

						if (rowParts.length > 0) {
							fileIndex++;
							addFile(rowParts, fileIndex);
						}
					}

					//strategy: stringify sheet and output
					else {
						entry
							.append(
								document.createElement('br')
							)
							.append(
								$(document.createElement('a'))
									.attr('download', spreadsheet.title + '.json')
									.attr('href', URL.createObjectURL(new Blob([JSON.stringify(spreadsheet)], {type: "application/json"})))
									.text(spreadsheet.title)
							);
					}
					i++;
				}


				d.close();
				w.focus();
			}
		}
	};

	Constructor.maxStoredDependencies = 100;

	return Constructor;
})(jQuery, document, String);/**
 * @project jQuery.sheet() The Ajax Spreadsheet - http://code.google.com/p/jquerysheet/
 * @author RobertLeePlummerJr@gmail.com
 * $Id: jquery.sheet.dts.js 933 2013-08-28 12:59:30Z robertleeplummerjr $
 * Licensed under MIT
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

;Sheet.XMLLoader = (function($, document) {
	"use strict";

	/**
	 *
	 * @param {String|jQuery|HTMLElement} xml - schema:<textarea disabled=disabled>
	 * <spreadsheets>
	 *	 <spreadsheet title="spreadsheet title">
	 *		 <metadata>
	 *			 <widths>
	 *				 <width>120</width>
	 *				 <width>80</width>
	 *			 </widths>
	 *			 <frozenAt>
	 *				 <row>0</row>
	 *				 <col>0</col>
	 *			 </frozenAt>
	 *		 </metadata>
	 *		 <rows>
	 *			 <row height=15>
	 *				  <columns>
	 *					  <column>
	 *						  <cellType></cellType>
	 *						  <formula>=cell formula</formula>
	 *						  <value>cell value</value>
	 *						  <style>cells style</style>
	 *						  <class>cells class</class>
	 *					  </column>
	 *					  <column></column>
	 *				  </columns>
	 *			  </row>
	 *			 <row height=15>
	 *				  <columns>
	 *					  <column>
	 *						  <cellType></cellType>
	 *						  <formula>=cell formula</formula>
	 *						  <value>cell value</value>
	 *						  <style>cells style</style>
	 *						  <class>cells class</class>
	 *					  </column>
	 *					  <column></column>
	 *				  </columns>
	 *			  </row>
	 *		 </rows>
	 *	 </spreadsheet>
	 * </spreadsheets></textarea>
	 */
	function Constructor(xml) {
		if (xml !== undefined) {
			this.xml = $.parseXML(xml);
			this.spreadsheets = this.xml.getElementsByTagName('spreadsheets')[0].getElementsByTagName('spreadsheet');
			this.count = this.xml.length;
		} else {
			this.xml = null;
			this.spreadsheets = null;
			this.count = 0;
		}
	}

	Constructor.prototype = {
		size: function(spreadsheetIndex) {
			var xmlSpreadsheet = this.xml[spreadsheetIndex],
				rows = xmlSpreadsheet.rows,
				firstRow = rows[0],
				firstRowColumns = firstRow.columns;

			return {
				rows: rows.length,
				cols: firstRowColumns.length
			};
		},
		setWidth: function(sheetIndex, columnIndex, colElement) {
			var spreadsheets = this.spreadsheets,
				xmlSpreadsheet = spreadsheets[sheetIndex],
				metadata = xmlSpreadsheet.getElementsByTagName('metadata')[0] || {},
				widths = metadata.getElementsByTagName('width') || [],
				widthElement = widths[columnIndex],
				width = (widthElement.textContent || widthElement.text);

			colElement.style.width = width + 'px';
		},
		setRowHeight: function(sheetIndex, rowIndex, barTd) {
			var spreadsheets = this.spreadsheets,
				xmlSpreadsheet,
				rows,
				row,
				height;

			if ((xmlSpreadsheet = spreadsheets[sheetIndex]) === undefined) return;
			if ((rows = xmlSpreadsheet.getElementsByTagName('rows')[0].getElementsByTagName('row')) === undefined) return;
			if ((row = rows[rowIndex]) === undefined) return;
			if ((height = row.attributes['height'].nodeValue) === undefined) return;

			barTd.style.height = height + 'px';
		},
		setupCell: function(sheetIndex, rowIndex, columnIndex, blankCell, blankTd) {
			var spreadsheets = this.spreadsheets,
				xmlSpreadsheet,
				row,
				cell,
				jitCell;

			if ((xmlSpreadsheet = spreadsheets[sheetIndex]) === undefined) return false;
			if ((row = xmlSpreadsheet.getElementsByTagName('rows')[0].getElementsByTagName('row')[rowIndex - 1]) === undefined) return false;
			if ((cell = row.getElementsByTagName('columns')[0].getElementsByTagName('column')[columnIndex - 1]) === undefined) return false;

			blankCell.cellType = cell.attributes['cellType'].nodeValue || '';

			if ((jitCell = cell.jitCell) !== undefined) {
				blankCell.html = jitCell.html;
				blankCell.state = jitCell.state;
				blankCell.cellType = jitCell.cellType;
				blankCell.value = jitCell.value;
				blankCell.uneditable = jitCell.uneditable;
				blankCell.sheet = jitCell.sheet;
				blankCell.dependencies = jitCell.dependencies;
			}

			if (cell.attributes['formula']) {
				blankCell.formula = cell.attributes['formula'].nodeValue || '';
				blankTd.setAttribute('data-formula', cell.attributes['formula'].nodeValue || '');
			} else {
				blankTd.innerHTML = blankCell.value = cell.attributes['value'].nodeValue || '';
			}

			blankTd.className = cell.attributes['class'].nodeValue || '';
			blankTd.setAttribute('style', cell.attributes['style'].nodeValue || '');

			if (cell.attributes['rowspan']) blankTd.setAttribute('rowspan', cell.attributes['rowspan'].nodeValue || '');
			if (cell.attributes['colspan']) blankTd.setAttribute('colspan', cell.attributes['colspan'].nodeValue || '');

			return true;
		},
		getCell: function(sheetIndex, rowIndex, columnIndex) {
			//TODO
			return null;
		},
		jitCell: function(sheetIndex, rowIndex, columnIndex) {
			var spreadsheets = this.spreadsheets,
				xmlSpreadsheet,
				row,
				cell;

			if ((xmlSpreadsheet = spreadsheets[sheetIndex]) === undefined) return false;
			if ((row = xmlSpreadsheet.getElementsByTagName('rows')[0].getElementsByTagName('row')[rowIndex - 1]) === undefined) return false;
			if ((cell = row.getElementsByTagName('columns')[0].getElementsByTagName('column')[columnIndex - 1]) === undefined) return false;

			return {
				td: {
					cellIndex: columnIndex,
					parentNode:{
						rowIndex: rowIndex
					},
					html: function() {}
				},
				html: [],
				state: [],
				cellType: cell.attributes['cellType'].nodeValue || '',
				formula: cell.attributes['formula'].nodeValue || '',
				value: cell.attributes['value'].nodeValue || '',
				type: 'cell',
				sheet: sheetIndex,
				id: null
			}
		},
		title: function(sheetIndex) {
			var spreadsheets = this.spreadsheets,
				spreadsheet;

			if ((spreadsheet = spreadsheets[sheetIndex]) === undefined) return '';

			return (spreadsheet.attributes['title'] ? spreadsheet.attributes['title'].nodeValue : '');
		},
		getSpreadsheetIndexByTitle: function(title) {
			//TODO
		},
		addSpreadsheet: function(xmlSpreadsheet, atIndex) {
			//TODO
			if (atIndex === undefined) {
				this.spreadsheets.append.push(jsonSpreadsheet);
			} else {
				this.json.splice(atIndex, 0, jsonSpreadsheet);
			}
			this.count = this.json.length;
		},
		setCellAttribute: function(cell, attribute, value) {
			//TODO
		},
		/**
		 * @returns {*|jQuery|HTMLElement} a simple html table
		 * @memberOf Sheet.XMLLoader
		 */
		toTables: function() {
			var xml = this.xml,
				tables = $([]),
				spreadsheets = xml.getElementsByTagName('spreadsheets')[0].getElementsByTagName('spreadsheet'),
				spreadsheet,
				rows,
				row,
				columns,
				column,
				attr,
				metadata,
				frozenat,
				frozenatrow,
				frozenatcol,
				widths,
				width,
				height;

			for (var i = 0; i < spreadsheets.length; i++) {
				spreadsheet = spreadsheets[i];
				var table = $(document.createElement('table')).attr('title', (spreadsheet.attributes['title'] ? spreadsheet.attributes['title'].nodeValue : '')),
					colgroup = $(document.createElement('colgroup')).appendTo(table),
					tbody = $(document.createElement('tbody')).appendTo(table);

				tables = tables.add(table);

				rows = spreadsheet.getElementsByTagName('rows')[0].getElementsByTagName('row');
				metadata = spreadsheet.getElementsByTagName('metadata')[0];

				for (var l = 0; l < rows.length; l++) {//row
					row = rows[l];
					var tr = $(document.createElement('tr')).appendTo(tbody);

					if (height = row.attributes['height']) {
						height = (height.nodeValue || '').replace('px','');
						tr
							.css('height', height)
							.attr('height', height + 'px');
					}

					columns = row.getElementsByTagName('columns')[0].getElementsByTagName('column');
					for (var m = 0; m < columns.length; m++) {
						column = columns[m];
						var td = $(document.createElement('td')).appendTo(tr),
							formula = column.getElementsByTagName('formula')[0],
							cellType = column.getElementsByTagName('cellType')[0],
							value = column.getElementsByTagName('value')[0],
							style = column.getElementsByTagName('style')[0],
							cl = column.getElementsByTagName('class')[0],
							rowspan = column.getElementsByTagName('rowspan')[0],
							colspan = column.getElementsByTagName('colspan')[0],
							id = column.getElementsByTagName('id')[0];

						if (formula) td.attr('data-formula', '=' + (formula.textContent || formula.text));
						if (cellType) td.attr('data-celltype', cellType.textContent || cellType.text);
						if (value) td.html(value.textContent || value.text);
						if (style) td.attr('style', style.textContent || style.text);
						if (cl) td.attr('class', cl.textContent || cl.text);
						if (rowspan) td.attr('rowspan', rowspan.textContent || rowspan.text);
						if (colspan) td.attr('colspan', colspan.textContent || colspan.text);
						if (id) td.attr('id', id.textContent || id.text);
					}
				}

				widths = metadata.getElementsByTagName('width');
				for (var l = 0; l < widths.length; l++) {
					width = (widths[l].textContent || widths[l].text).replace('px', '');
					$(document.createElement('col'))
						.attr('width', width)
						.css('width', width + 'px')
						.appendTo(colgroup);
				}

				frozenat = metadata.getElementsByTagName('frozenAt')[0];
				if (frozenat) {
					frozenatcol = frozenat.getElementsByTagName('col')[0];
					frozenatrow = frozenat.getElementsByTagName('row')[0];

					if (frozenatcol) table.attr('data-frozenatcol', (frozenatcol.textContent || frozenatcol.text) * 1);
					if (frozenatrow) table.attr('data-frozenatrow', (frozenatrow.textContent || frozenatrow.text) * 1);
				}
			}
			return tables;
		},

		/**
		 * Create xml from jQuery.sheet Sheet instance
		 * @param {Object} jS the jQuery.sheet instance
		 * @param {Boolean} [doNotTrim] cut down on added json by trimming to only edited area
		 * @param {Boolean} [doNotParse] skips turning the created xml string back into xml
		 * @returns {String} - schema:<textarea disabled=disabled>
		 * <spreadsheets>
		 *	 <spreadsheet title="spreadsheet title">
		 *		 <metadata>
		 *			 <widths>
		 *				 <width>120px</width>
		 *				 <width>80px</width>
		 *			 </widths>
		 *		 </metadata>
		 *		 <rows>
		 *			 <row height="15px">
		 *				  <columns>
		 *					  <column>
		 *						  <cellType></cellType>
		 *						  <formula>=cell formula</formula>
		 *						  <value>cell value</value>
		 *						  <style>cells style</style>
		 *						  <class>cells class</class>
		 *					  </column>
		 *					  <column></column>
		 *				  </columns>
		 *			  </row>
		 *			 <row height="15px">
		 *				  <columns>
		 *					  <column>
		 *						  <cellType></cellType>
		 *						  <formula>=cell formula</formula>
		 *						  <value>cell value</value>
		 *						  <style>cells style</style>
		 *						  <class>cells class</class>
		 *					  </column>
		 *					  <column></column>
		 *				  </columns>
		 *			  </row>
		 *		 </rows>
		 *	 </spreadsheet>
		 * </spreadsheets></textarea>
		 * @memberOf Sheet.XMLLoader
		 */
		fromSheet: function(jS, doNotTrim, doNotParse) {
			doNotTrim = (doNotTrim == undefined ? false : doNotTrim);
			var output = '',
				i = 1 * jS.i,
				sheet = jS.spreadsheets.length - 1,
				xmlSpreadsheet,
				spreadsheet,
				row,
				column,
				parentAttr,
				xmlRow,
				xmlColumn,
				xmlColumns,
				cell,
				attr,
				cl,
				parent,
				frozenAt,
				rowHasValues,
				widths,
				parentEle,
				parentHeight;

			if (sheet < 0) return output;

			do {
				rowHasValues = false;
				jS.i = sheet;
				jS.evt.cellEditDone();
				frozenAt = $.extend({}, jS.obj.pane().actionUI.frozenAt);
				widths = [];

				spreadsheet = jS.spreadsheets[sheet];
				row = spreadsheet.length - 1;
				xmlRow = '';
				do {
					xmlColumns = '';
					column = spreadsheet[row].length - 1;
					do {
						xmlColumn = '';
						cell = spreadsheet[row][column];
						attr = cell.td[0].attributes;
						cl = (attr['class'] ? $.trim(
							(attr['class'].value || '')
								.replace(jS.cl.uiCellActive, '')
								.replace(jS.cl.uiCellHighlighted, '')
						) : '');

						if (doNotTrim || rowHasValues || cl || cell.formula || cell.value || attr['style']) {
							rowHasValues = true;

							xmlColumn += '<column>';

							if (cell.formula) xmlColumn += '<formula>' + cell.formula + '</formula>';
							if (cell.cellType) xmlColumn += '<cellType>' + cell.cellType + '</cellType>';
							if (cell.value) xmlColumn += '<value>' + cell.value + '</value>';
							if (attr['style']) xmlColumn += '<style>' + attr['style'].value + '</style>';
							if (cl) xmlColumn += '<class>' + cl + '</class>';
							if (attr['rowspan']) xmlColumn += '<rowspan>' + attr['rowspan'].value + '</rowspan>';
							if (attr['colspan']) xmlColumn += '<colspan>' + attr['colspan'].value + '</colspan>';
							if (attr['id']) xmlColumn += '<id>' + attr['id'].value + '</id>';

							xmlColumn += '</column>';

							xmlColumns = xmlColumn + xmlColumns;

							if (row * 1 == 1) {
								widths[column] = '<width>' + $(jS.col(null, column)).css('width').replace('px', '') + '</width>';
							}
						}

					} while (column -- > 1);

					if (xmlColumns) {
						parentEle = spreadsheet[row][1].td[0].parentNode;
						parentHeight = parentEle.style['height'];
						xmlRow = '<row height="' + (parentHeight ? parentHeight.replace('px', '') : jS.s.colMargin) + '">' +
							'<columns>' +
							xmlColumns +
							'</columns>' +
							'</row>' + xmlRow;
					}

				} while (row-- > 1);
				xmlSpreadsheet = '<spreadsheet title="' + (jS.obj.table().attr('title') || '') + '">' +
					'<rows>' +
					xmlRow +
					'</rows>' +
					'<metadata>' +
					(
						frozenAt.row || frozenAt.col ?
							'<frozenAt>' +
								(frozenAt.row ? '<row>' + frozenAt.row + '</row>' : '') +
								(frozenAt.col ? '<col>' + frozenAt.col + '</col>' : '') +
								'</frozenAt>' :
							''
						) +
					'<widths>' + widths.join('') + '</widths>' +
					'</metadata>' +
					'</spreadsheet>';

				output = xmlSpreadsheet + output;
			} while (sheet--);

			jS.i = i;

			output = '<?xml version="1.0" encoding="UTF-8"?><spreadsheets xmlns="http://www.w3.org/1999/xhtml">' + output + '</spreadsheets>';

			if (doNotParse !== true) {
				this.xml = $.parseXML(output);
			}

			return output;
		},
		type: Constructor,
		typeName: 'Sheet.XMLLoader'
	};

	return Constructor;
})(jQuery, document);/**
 * @namespace
 * @type {Object}
 * @name jQuery()
 */
$.fn.extend({
	/**
	 * @memberOf jQuery()
	 * @function
	 * @returns {jQuery()}
	 * @description
	 * <pre>
	 * The jQuery.sheet plugin
	 * Supports the following jQuery events
	 *
	 * sheetAddRow - occurs just after a row has been added
	 *  arguments: e (jQuery event), jS, i (row index), isBefore, qty
	 *	  example:
	 *		  $(obj).sheet({
	 *			  sheetAddRow: function(e, jS, i, isBefore, qty) {
	 *
	 *			  }
	 *		  });
	 *	  or:
	 *		  $(obj).bind('sheetAddRow', function(e, jS, i, isBefore, qty) {
	 *
	 *		  })
	 *		  .sheet();
	 *
	 * sheetAddColumn - occurs just after a column has been added
	 *	  arguments: e (jQuery event), jS, i (column index), isBefore, qty
	 *	  example:
	 *		  $(obj).sheet({
	 *			  sheetAddColumn: function(e, jS, i, isBefore, qty) {
	 *
	 *			  }
	 *		  });
	 *	  or:
	 *		  $(obj).bind('sheetAddColumn', function(e, jS, i, isBefore, qty) {
	 *
	 *		  })
	 *		  .sheet();
	 *
	 * sheetSwitch - occurs after a spreadsheet has been switched
	 *	  arguments: e (jQuery event), jS (jQuery.sheet instance), i (spreadsheet index)
	 *	  example:
	 *		  $(obj).sheet({
	 *			  sheetSwitch: function(e, jS, i) {
	 *
	 *			  }
	 *		  });
	 *	  or:
	 *		  $(obj).bind('sheetSwitch', function(e, jS, i) {
	 *
	 *		  })
	 *		  .sheet();
	 *
	 * sheetRename - occurs just after a spreadsheet is renamed, to obtain new title jS.obj.table().attr('title');
	 *	  arguments: e (jQuery event), jS (jQuery.sheet instance), i (spreadsheet index)
	 *	  example:
	 *		  $(obj).sheet({
	 *			  sheetRename: function(e, jS, i) {
	 *
	 *			  }
	 *		  });
	 *	  or:
	 *		  $(obj).bind('sheetRename', function(e, jS, i) {
	 *
	 *		  })
	 *		  .sheet();
	 *
	 * sheetTabSortStart - occurs at the beginning of a sort for moving a spreadsheet around in order
	 *	  arguments: e (jQuery event), jS (jQuery.sheet instance), E (jQuery sortable event), ui, (jQuery ui event)
	 *	  example:
	 *		  $(obj).sheet({
	 *			  sheetTabSortStart: function(e, jS, E, ui) {
	 *
	 *			  }
	 *		  });
	 *	  or:
	 *		  $(obj).bind('sheetTabSortStart',NPER: function(e, jS, E, ui) {
	 *
	 *		  })
	 *		  .sheet();
	 *
	 * sheetTabSortUpdate - occurs after a sort of a spreadsheet has been completed
	 *	  arguments: e (jQuery event), jS (jQuery.sheet instance), E (jQuery sotable event), ui, (jQuery ui event), i (original index)
	 *	  example:
	 *		  $(obj).sheet({
	 *			  sheetTabSortUpdate: function(e, jS, E, ui) {
	 *
	 *			  }
	 *		  });
	 *	  or:
	 *		  $(obj).bind('sheetTabSortUpdate', function(e, jS, E, ui) {
	 *
	 *		  })
	 *		  .sheet();
	 *
	 * sheetFormulaKeydown - occurs just after keydown on either inline or static formula
	 *	  arguments: e (jQuery event)
	 *	  example:
	 *		  $(obj).sheet({
	 *			  sheetFormulaKeydown: function(e) {
	 *
	 *			  }
	 *		  });
	 *	  or:
	 *		  $(obj).bind('sheetFormulaKeydown') {
	 *
	 *		  })
	 *		  .sheet();
	 * sheetCellEdit - occurs just before a cell has been started to edit
	 *	  arguments: e (jQuery event), jS (jQuery.sheet instance), cell (jQuery.sheet.instance.spreadsheet cell)
	 *	  example:
	 *		  $(obj).sheet({
	 *			  sheetCellEdit: function(e, jS, cell) {
	 *
	 *			  }
	 *		  });
	 *	  or:
	 *		  $(obj).bind('sheetCellEdit', function(e, jS, cell) {
	 *
	 *		  })
	 *		  .sheet();
	 *
	 * sheetCellEdited - occurs just after a cell has been updated
	 *	  arguments: e (jQuery event), jS (jQuery.sheet instance), cell (jQuery.sheet.instance.spreadsheet cell)
	 *	  example:
	 *		  $(obj).sheet({
	 *			  sheetCellEdited: function(e, jS, cell) {
	 *
	 *			  }
	 *		  });
	 *	  or:
	 *		  $(obj).bind('sheetCellEdited', function(e, jS, cell) {
	 *
	 *		  })
	 *		  .sheet();
	 *
	 * sheetCalculation - occurs just after a spreadsheet has been fully calculated
	 *	  arguments: e (jQuery event), jS (jQuery.sheet instance)
	 *	  example:
	 *		  $(obj).sheet({
	 *			  sheetCalculation: function(e, jS) {
	 *
	 *			  }
	 *		  });
	 *	  or:
	 *		  $(obj).bind('sheetCalculation', function(e, jS) {
	 *
	 *		  })
	 *		  .sheet();
	 *
	 * sheetAdd - occurs just after a spreadsheet has been added
	 *	  arguments: e (jQuery event), jS (jQuery.sheet instance), i (new sheet index)
	 *	  example:
	 *		  $(obj).sheet({
	 *			  sheetAdd: function(e, jS, i) {
	 *
	 *			  }
	 *		  });
	 *	  or:
	 *		  $(obj).bind('sheetAdd', function(e, jS, i) {
	 *
	 *		  })
	 *		  .sheet();
	 *
	 * sheetDelete - occurs just after a spreadsheet has been deleted
	 *	  arguments: e (jQuery event), jS (jQuery.sheet instance), i (old sheet index)
	 *	  example:
	 *		  $(obj).sheet({
	 *			  sheetDelete: function(e, jS, i) {
	 *
	 *			  }
	 *		  });
	 *	  or:
	 *		  $(obj).bind('sheetDelete', function(e, jS, i) {
	 *
	 *		  })
	 *		  .sheet();
	 *
	 * sheetDeleteRow - occurs just after a row has been deleted
	 *	  arguments: e (jQuery event), jS (jQuery.sheet instance), i (old row index)
	 *	  example:
	 *		  $(obj).sheet({
	 *			  sheetDeleteRow: function(e, jS, i) {
	 *
	 *			  }
	 *		  });
	 *	  or:
	 *		  $(obj).bind('sheetDeleteRow', function(e, jS, i) {
	 *
	 *		  })
	 *		  .sheet();
	 *
	 * sheetDeleteColumn - occurs just after a column as been deleted
	 *	  arguments: e (jQuery event), jS (jQuery.sheet instance), i (old column index)
	 *	  example:
	 *		  $(obj).sheet({
	 *			  sheetDeleteColumn: function(e, jS, i) {
	 *
	 *			  }
	 *		  });
	 *	  or:
	 *		  $(obj).bind('sheetDeleteColumn', function(e, jS, i) {
	 *
	 *		  })
	 *		  .sheet();
	 *
	 * sheetOpen - occurs just after a single sheet within a set of sheets has been opened, this is triggered when calling sheet, so it needs to be bound beforehand
	 *	  arguments: e (jQuery event), jS (jQuery.sheet instance), i (new sheet index)
	 *	  example:
	 *		  $(obj).sheet({
	 *			  sheetOpen: function(e, jS, i) {
	 *
	 *			  }
	 *		  });
	 *	  or:
	 *		  $(obj).bind('sheetOpen', function(e, jS, i) {
	 *
	 *		  })
	 *		  .sheet();
	 *
	 * sheetAllOpened - occurs just after all sheets have been loaded and complete user interface has been created, this is triggered when calling sheet, so it needs to be bound beforehand
	 *	  arguments: e (jQuery event), jS (jQuery.sheet instance)
	 *	  example:
	 *		  $(obj).sheet({
	 *			  sheetAllOpened: function(e, jS) {
	 *
	 *			  }
	 *		  });
	 *	  or:
	 *		  $(obj).bind('sheetAllOpened', function(e, jS) {
	 *
	 *		  })
	 *		  .sheet();
	 *
	 * sheetSave - an assistance event called when calling jS.toggleState(), but not tied to anything internally
	 *	  arguments: e (jQuery event), jS (jQuery.sheet instance), tables (tables from spreadsheet)
	 *	  example:
	 *		  $(obj).sheet({
	 *			  sheetSave: function(e, jS, tables) {
	 *
	 *			  });
	 *		  }
	 *	  or:
	 *		  $(obj).bind('sheetSave', function(e, jS, tables) {
	 *
	 *		  })
	 *		  .sheet();
	 *
	 * sheetFullScreen - triggered when the sheet goes full screen
	 *	  arguments: e (jQuery event), jS (jQuery.sheet instance), isFullScreen (boolean, true if full screen, false if not)
	 *	  example:
	 *		  $(obj).sheet({
	 *			  sheetFullScreen: function(e, jS, isFullScreen) {
	 *
	 *			  });
	 *		  }
	 *	  or:
	 *		  $(obj).bind('sheetFullScreen', function(e, jS, isFullScreen) {
	 *
	 *		  })
	 *		  .sheet();
	 * </pre>
	 *
	 * @param {Object} [settings] supports the following properties/methods:
	 * <pre>
	 * editable {Boolean}, default true, Makes the sheet editable or viewable
	 *
	 * editableNames {Boolean}, default true, Allows sheets to have their names changed, depends on settings.editable being true
	 *
	 * barMenus {Boolean}, default true, Turns bar menus on/off
	 *
	 * freezableCells {Boolean}, default true, Turns ability to freeze cells on/off
	 *
	 * allowToggleState {Boolean}, default true, allows the spreadsheet to be toggled from write/read
	 *
	 * newColumnWidth {Number}, default 120, width of new columns
	 *
	 * title {String|Function}, title of spreadsheet, if function, expects string and is sent jS
	 *
	 * menuRight {String|Function}, default '', 'this' is jQuery.sheet instance. If ul object, will attempt to create menu
	 *
	 * menuLeft {String|Function}, default '', 'this' is jQuery.sheet instance. If ul object, will attempt to create menu
	 *
	 * calcOff {Boolean} default false, turns turns off ability to calculate
	 *
	 * lockFormulas {Boolean} default false, turns on/off the ability to edit formulas
	 *
	 * colMargin {Number} default 18, size of height of new cells, and width of cell bars
	 *
	 * boxModelCorrection {Number} default 2, if box model is detected, it adds these pixels to ensure the size of the spreadsheet controls are correct
	 *
	 * formulaFunctions {Object} default {}, Additional functions for formulas. Will overwrite default functions if named the same.
	 *	  Javascript Example:
	 *		  $(obj).sheet({
	 *			  formulaFunctions: {
	 *				  NEWFUNCTION: function(arg1, arg2) {
	 *					  //this = the parser's cell object object
	 *					  return 'string'; //can return a string
	 *					  return { //can also return an object {value: '', html: ''}
	 *						  value: 'my value seen by other cells or if accessed directly',
	 *						  html: $('What the end user will see on the cell this is called in')
	 *					  }
	 *				  }
	 *			  }
	 *		  });
	 *
	 *	  Formula Example:
	 *		  =NEWFUNCTION(A1:B1, C3);
	 *
	 * formulaVariables {Object} default {}, Additional variables that formulas can access.
	 *	  Javascript Example:
	 *		  $(obj).sheet({
	 *			  formulaVariables: {
	 *				  newVariable: 100
	 *			  }
	 *		  });
	 *
	 *	  Formula Example (will output 200)
	 *		  =newVariable + 100
	 *
	 * cellSelectModel {String} default Sheet.excelSelectModel, accepts Sheet.excelSelectModel, Sheet.openOfficeSelectModel, or Sheet.googleDriveSelectModel, makes the select model act differently
	 *
	 * autoAddCells {Boolean} default true, allows you to add cells by selecting the last row/column and add cells by pressing either tab (column) or enter (row)
	 *
	 * resizableCells {Boolean} default true, turns resizing on and off for cells, depends on jQuery ui
	 *
	 * resizableSheet {Boolean} default true, turns resizing on and off for sheet, depends on jQuery ui
	 *
	 * autoFiller {Boolean} default true, turns on/off the auto filler, the little square that follows the active cell around that you can drag and fill the values of other cells in with.
	 *
	 * minSize {Object} default {rows: 1, cols: 1}, the minimum size of a spreadsheet
	 *
	 * error {Function} default function(e) { return e.error; }, is triggered on errors from the formula engine
	 *
	 * encode {Function} default is a special characters handler for strings only, is a 1 way encoding of the html if entered manually by the editor.  If you want to use html with a function, return an object rather than a string
	 *
	 * frozenAt {Object} default [{row: 0,col: 0}], Gives the ability to freeze cells at a certain row/col
	 *
	 * contextmenuTop {Object} default is standard list of commands for context menus when right click or click on menu dropdown
	 *	  Javascript example:
	 *		  {
	 *			  "What I want my command to say": function() {}
	 *		  }
	 *
	 * contextmenuLeft {Object} default is standard list of commands for context menus when right click
	 *	  Javascript example:
	 *		  {
	 *			  "What I want my command to say": function() {}
	 *		  }
	 *
	 * contextmenuCell {Object} default is standard list of commands for context menus when right click or click on menu dropdown
	 *	  Javascript example:
	 *		  {
	 *			  "What I want my command to say": function() {}
	 *		  }
	 *
	 * hiddenRows {Array} default [], Hides certain rows from being displayed initially. [sheet Index][row index]. example: [[1]] hides first row in first spreadsheet; [[]],[1]] hides first row in second spreadsheet
	 *
	 * hiddenColumns {Array} default [], Hides certain columns from being displayed initially. [sheet Index][column index]. example: [[1]] hides first column in first spreadsheet; [[],[1]] hides first column in second spreadsheet
	 *
	 * alert {Function} default function(msg) {alert(msg);}
	 * prompt {Function} default function(msg, callback, initialValue) {callback(prompt(msg, initialValue));}
	 * confirm {Function} default
	 *	  function(msg, callbackIfTrue, callbackIfFalse) {
	 *		  if (confirm(msg)) {
	 *			  callbackIfTrue();
	 *		  } else if (callbackIfFalse) {
	 *			  callbackIfFalse();
	 *		  }
	 *	  }
	 * </pre>
	 *
	 * initCalcRows {Number} default 40
	 * initCalcCols {Number} default 20
	 */
	sheet:function (settings) {
		var n = isNaN,
			events = $.sheet.events;

		$(this).each(function () {
			var me = $(this),
				chosenSettings = $.extend(true, {}, $.sheet.defaults, settings || {}),
				jS = this.jS;

			chosenSettings.useStack = (window.thaw === undefined ? false : chosenSettings.useStack);
			chosenSettings.useMultiThreads = (window.operative === undefined ? false : chosenSettings.useMultiThreads);

			//destroy already existing spreadsheet
			if (jS) {
				var tables = me.children().detach();
				jS.kill();
				me.html(tables);

				for (var event in events) {
					if (events.hasOwnProperty(event)) {
						me.unbind(events[event]);
					}
				}
			}

			chosenSettings.parent = me;

			if ((this.className || '').match(/\bnot-editable\b/i) != null) {
				chosenSettings['editable'] = false;
			}

			for (var i in events) {
				if (events.hasOwnProperty(i)) {
					me.bind(events[i], chosenSettings[events[i]]);
				}
			}

			if (!$.sheet.instance.length) $.sheet.instance = [];

			this.jS = jS = $.sheet.createInstance(chosenSettings, $.sheet.instance.length);
			$.sheet.instance.push(jS);
		});
		return this;
	},

	/**
	 * @memberOf jQuery()
	 * @method
	 * @returns {HTMLElement}
	 */
	disableSelectionSpecial:function () {
		this.each(function () {
			this.onselectstart = function () {
				return false;
			};
			this.unselectable = "on";
			this.style['-moz-user-select'] = 'none';
		});
		return this;
	},

	/**
	 * @memberOf jQuery()
	 * @returns {jS}
	 */
	getSheet:function () {
		var me = this[0],
			jS = (me.jS || {});
		return jS;
	},

	/**
	 * Get cell value
	 * @memberOf jQuery()
	 * @param {Number} sheetIndex
	 * @param {Number} rowIndex
	 * @param {Number} colIndex
	 * @param {Function} callback
	 * @returns {jQuery}
	 */
	getCellValue:function (sheetIndex, rowIndex, colIndex, callback) {
		var me = this[0],
			jS = (me.jS || {}),
			cell;

		if (jS.getCell) {
			cell = jS.getCell(sheetIndex, rowIndex, colIndex);
			if (cell !== null) {
				cell.updateValue(callback);
			}
		}

		return this;
	},

	/**
	 * Set cell value
	 * @memberOf jQuery()
	 * @param {String|Number} value
	 * @param {Number} rowIndex
	 * @param {Number} colIndex
	 * @param {Number} [sheetIndex] defaults to 0
	 * @param {Function} [callback]
	 * @returns {jQuery}
	 */
	setCellValue:function (value, rowIndex, colIndex, sheetIndex, callback) {
		var me = this[0],
			jS = (me.jS || {}),
			cell;

		sheetIndex = (sheetIndex || 0);

		if (
			jS.getCell
				&& (cell = jS.getCell(sheetIndex, rowIndex, colIndex))
			) {
			try {
				if ((value + '').charAt(0) == '=') {
					cell.valueOverride = cell.value = '';
					cell.formula = value.substring(1);
				} else {
					cell.value = value;
					cell.valueOverride = cell.formula = '';
				}
				cell.updateValue(callback);
			} catch (e) {}
		}
		return this;
	},

	/**
	 * Set cell formula
	 * @memberOf jQuery()
	 * @param {String} formula
	 * @param {Number} rowIndex
	 * @param {Number} colIndex
	 * @param {Number} [sheetIndex] defaults to 0
	 * @param {Function} [callback]
	 * @returns {jQuery}
	 */
	setCellFormula:function (formula, rowIndex, colIndex, sheetIndex, callback) {
		var me = this[0],
			jS = (me.jS || {}),
			cell;

		sheetIndex = (sheetIndex || 0);

		if (jS.getCell) {
			try {
				cell = jS.getCell(sheetIndex, rowIndex, colIndex);
				if (cell !== null) {
					cell.formula = formula;
					cell.valueOverride = cell.value = '';
					cell.updateValue(callback);
				}
			} catch (e) {}
		}
		return this;
	},

	/**
	 * Detect if spreadsheet is full screen
	 * @memberOf jQuery()
	 * @returns {Boolean}
	 */
	isSheetFullScreen:function () {
		var me = this[0],
			jS = (me.jS || {});

		if (jS.obj) {
			return jS.obj.fullScreen().is(':visible');
		}
		return false;
	},

	/**
	 * Get inputs serialized from spreadsheet type_sheet-index_row-index_column-index_instance-index (dropdown_0_1_1_0 = sheet 1, row 1, column A, instance 0
	 * @param {Boolean} [isArray] return serialized as array (true) or string (false, default false
	 * @memberOf jQuery()
	 * @returns {*}
	 */
	serializeCellInputs:function (isArray) {
		var me = this[0],
			jS = (me.jS || {}),
			inputs = jS.obj.tables().find(':input');

		if (isArray) {
			return inputs.serializeArray();
		} else {
			return inputs.serialize();
		}
	},

	/**
	 * prints the source of a sheet for a user to see
	 * @param {Boolean} [pretty] makes html a bit easier for the user to see
	 * @returns {String}
	 * @memberOf jQuery()
	 */
	viewSource:function (pretty) {
		var source = "";
		$(this).each(function () {
			if (pretty) {
				source += $(this).toPrettySource();
			} else {
				source += $(this).toCompactSource();
			}
		});
		$.printSource(source);

		return source;
	},

	/**
	 * prints html to 1 line
	 * @returns {String}
	 * @memberOf jQuery()
	 */
	toCompactSource:function () {
		var node = this[0];
		var result = "";
		if (node.nodeType == 1) {
			// ELEMENT_NODE
			result += "<" + node.tagName.toLowerCase();

			var n = node.attributes.length;
			for (var i = 0; i < n; i++) {
				var key = node.attributes[i].name,
					val = node.getAttribute(key);

				if (val) {
					if (key == "contentEditable" && val == "inherit") {
						continue;
						// IE hack.
					}

					if (typeof(val) == "string") {
						result += " " + key + '="' + val.replace(/"/g, "'") + '"';
					} else if (key == "style" && val.cssText) {
						result += ' style="' + val.cssText + '"';
					}
				}
			}

			if (node.tagName == "COL") {
				// IE hack, which doesn't like <COL..></COL>.
				result += '/>';
			} else {
				result += ">";
				var childResult = "";
				$(node.childNodes).each(function () {
					childResult += $(this).toCompactSource();
				});
				result += childResult;
				result += "</" + node.tagName.toLowerCase() + ">";
			}

		} else if (node.nodeType == 3) {
			// TEXT_NODE
			result += node.data.replace(/^\s*(.*)\s*$/g, "$1");
		}
		return result;
	},

	/**
	 *  prints html to many lines, formatted for easy viewing
	 * @param {String} [prefix]
	 * @returns {String}
	 * @memberOf jQuery()
	 */
	toPrettySource:function (prefix) {
		var node = this[0],
			n,
			i;
		prefix = prefix || "";

		var result = "";
		if (node.nodeType == 1) {
			// ELEMENT_NODE
			result += "\n" + prefix + "<" + node.tagName.toLowerCase();
			n = node.attributes.length;
			for (i = 0; i < n; i++) {
				var key = node.attributes[i].name,
					val = node.getAttribute(key);

				if (val) {
					if (key == "contentEditable" && val == "inherit") {
						continue; // IE hack.
					}
					if (typeof(val) == "string") {
						result += " " + key + '="' + $.trim(val.replace(/"/g, "'")) + '"';
					} else if (key == "style" && val.cssText) {
						result += ' style="' + $.trim(val.cssText) + '"';
					}
				}
			}
			if (node.childNodes.length <= 0) {
				if (node.tagName == "COL") {
					result += "/>";
				} else {
					result += "></" + node.tagName.toLowerCase() + ">";
				}
			} else {
				result += ">";
				var childResult = "";

				n = node.childNodes.length;

				for (i = 0; i < n; i++) {
					childResult += $(node.childNodes[i]).toPrettySource(prefix + "  ");
				}
				result += childResult;
				if (childResult.indexOf('\n') >= 0) {
					result += "\n" + prefix;
				}
				result += "</" + node.tagName.toLowerCase() + ">";
			}
		} else if (node.nodeType == 3) {
			// TEXT_NODE
			result += node.data.replace(/^\s*(.*)\s*$/g, "$1");
		}
		return result;
	}
});

/**
 * @namespace
 * @type {Object}
 * @memberOf jQuery
 * @name jQuery.sheet
 */
$.sheet = {

	/**
	 * Defaults
	 */
	defaults: {
		editable:true,
		editableNames:true,
		barMenus:true,
		freezableCells:true,
		allowToggleState:true,
		menuLeft:null,
		menuRight:null,
		newColumnWidth:120,
		title:null,
		calcOff:false,
		lockFormulas:false,
		parent:null,
		colMargin:20,
		boxModelCorrection:2,
		formulaFunctions:{},
		formulaVariables:{},
		cellSelectModel:Sheet.excelSelectModel,
		autoAddCells:true,
		resizableCells:true,
		resizableSheet:true,
		autoFiller:true,
		minSize:{rows:1, cols:1},
		error:function (e) {
			return e.error;
		},
		endOfNumber: false,
		frozenAt:[],
		contextmenuTop:{
			"Insert column after":function (jS) {
				jS.controlFactory.addColumn(jS.colLast);
				return false;
			},
			"Insert column before":function (jS) {
				jS.controlFactory.addColumn(jS.colLast, true);
				return false;
			},
			"Add column to end":function (jS) {
				jS.controlFactory.addColumn();
				return false;
			},
			"Delete this column":function (jS) {
				jS.deleteColumn();
				return false;
			},
			"Hide column":function (jS) {
				jS.toggleHideColumn();
				return false;
			},
			"Show all columns": function (jS) {
				jS.columnShowAll();
			},
			"Toggle freeze columns to here":function (jS) {
				var col = jS.getTdLocation(jS.obj.tdActive()).col,
					actionUI = jS.obj.pane().actionUI;
				actionUI.frozenAt.col = (actionUI.frozenAt.col == col ? 0 : col);
			}
		},
		contextmenuLeft:{
			"Insert row after":function (jS) {
				jS.controlFactory.addRow(jS.rowLast);
				return false;
			},
			"Insert row before":function (jS) {
				jS.controlFactory.addRow(jS.rowLast, true);
				return false;
			},
			"Add row to end":function (jS) {
				jS.controlFactory.addRow();
				return false;
			},
			"Delete this row":function (jS) {
				jS.deleteRow();
				return false;
			},
			"Hide row":function (jS) {
				jS.toggleHideRow(jS);
				return false;
			},
			"Show all rows": function (jS) {
				jS.rowShowAll();
			},
			"Toggle freeze rows to here":function (jS) {
				var row = jS.getTdLocation(jS.obj.tdActive()).row,
					actionUI = jS.obj.pane().actionUI;
				actionUI.frozenAt.row = (actionUI.frozenAt.row == row ? 0 : row);
			}
		},
		contextmenuCell:{
			/*"Copy":false,
			 "Cut":false,
			 "line1":'line',*/
			"Insert row after":function (jS) {
				jS.controlFactory.addRow(jS.rowLast);
				return false;
			},
			"Insert row before":function (jS) {
				jS.controlFactory.addRow(jS.rowLast, true);
				return false;
			},
			"Add row to end":function (jS) {
				jS.controlFactory.addRow();
				return false;
			},
			"Delete this row":function (jS) {
				jS.deleteRow();
				return false;
			},
			"line2":'line',
			"Insert column after":function (jS) {
				jS.controlFactory.addColumn(jS.colLast);
				return false;
			},
			"Insert column before":function (jS) {
				jS.controlFactory.addColumn(jS.colLast, true);
				return false;
			},
			"Add column to end":function (jS) {
				jS.controlFactory.addColumn();
				return false;
			},
			"Delete this column":function (jS) {
				jS.deleteColumn();
				return false;
			},
			"line3":"line",
			"Add spreadsheet":function (jS) {
				jS.addSheet();
			},
			"Delete spreadsheet":function (jS) {
				jS.deleteSheet();
			}
		},
		hiddenRows:[],
		hiddenColumns:[],
		alert: function(msg) {
			alert(msg);
		},
		prompt: function(msg, callback, initialValue) {
			callback(prompt(msg, initialValue));
		},
		confirm: function(msg, callbackIfTrue, callbackIfFalse) {
			if (confirm(msg)) {
				callbackIfTrue();
			} else if (callbackIfFalse) {
				callbackIfFalse();
			}
		},
		initCalcRows: 50,
		initCalcCols: 15,
		initScrollRows: 0,
		initScrollCols: 0,
		loader: null,
		useStack: true,
		useMultiThreads: true
	},

	/**
	 * Array of instances of jQuery.sheet, generally short-handed to jS
	 * @memberOf jQuery.sheet
	 */
	instance:[],

	/**
	 * Contains the dependencies if you use $.sheet.preLoad();
	 * @memberOf jQuery.sheet
	 */
	dependencies:{
		coreCss:{css:'jquery.sheet.css'},

		jQueryUI:{script:'jquery-ui/jquery-ui.min.js', thirdParty:true},
		jQueryUIThemeRoller:{css:'jquery-ui/themes/smoothness/jquery-ui.min.css', thirdParty:true},

		globalize:{script:'globalize/lib/globalize.js', thirdParty:true},

		nearest:{script:'jquery-nearest/src/jquery.nearest.min.js', thirdParty:true},

		mousewheel:{script:'MouseWheel/MouseWheel.js', thirdParty:true},

		operative:{script:'operative/dist/operative.js', thirdParty:true}
	},

	/**
	 * Contains the optional plugins if you use $.sheet.preLoad();
	 * @memberOf jQuery.sheet
	 */
	optional:{
		//native
		advancedFn:{script:'plugins/jquery.sheet.advancedfn.js'},
		financeFn:{script:'plugins/jquery.sheet.financefn.js'},

		//3rd party
		colorPicker:{
			css:'really-simple-color-picker/colorPicker.css',
			script:'really-simple-color-picker/jquery.colorPicker.min.js',
			thirdParty:true
		},

		elastic:{script:'jquery-elastic/jquery.elastic.source.js', thirdParty:true},

		globalizeCultures:{script:'globalize/lib/cultures/globalize.cultures.js', thirdParty:true},

		raphael:{script:'raphael/raphael.js', thirdParty:true},
		gRaphael:{script:'graphael/g.raphael.js', thirdParty:true},
		gRaphaelBar:{script:'graphael/g.bar.js', thirdParty:true},
		gRaphaelDot:{script:'graphael/g.dot.js', thirdParty:true},
		gRaphaelLine:{script:'graphael/g.line.js', thirdParty:true},
		gRaphaelPie:{script:'graphael/g.pie.js', thirdParty:true},

		thaw: {script:"thaw.js/thaw.js", thirdParty:true},

		undoManager:{script: 'Javascript-Undo-Manager/js/undomanager.js', thirdParty:true},

		zeroClipboard:{script:'zeroclipboard/dist/ZeroClipboard.min.js', thirdParty:true}
	},

	/**
	 * events list
	 * @memberOf jQuery.sheet
	 */
	events:[
		'sheetAddRow',
		'sheetAddColumn',
		'sheetSwitch',
		'sheetRename',
		'sheetTabSortStart',
		'sheetTabSortUpdate',
		'sheetCellEdit',
		'sheetCellEdited',
		'sheetCalculation',
		'sheetAdd',
		'sheetDelete',
		'sheetDeleteRow',
		'sheetDeleteColumn',
		'sheetOpen',
		'sheetAllOpened',
		'sheetSave',
		'sheetFullScreen',
		'sheetFormulaKeydown'
	],

	/**
	 * Used to load in all the required plugins and dependencies needed by sheet in it's default directories.
	 * @param {String} [path] path
	 * @param {Object} settings
	 * @memberOf jQuery.sheet
	 *
	 */
	preLoad:function (path, settings) {
		path = path || '';
		settings = $.extend({
			skip: ['globalizeCultures'],
			thirdPartyDirectory: 'bower_components/'
		},settings);

		var injectionParent = $('script:first'),
			write = function () {
				var script;
				if (this.script !== undefined) {
					script = document.createElement('script');
					script.src = path + (this.thirdParty ? settings.thirdPartyDirectory : '') + this.script;
					injectionParent.after(script);
				}
				if (this.css !== undefined) {
					script = document.createElement('link');
					script.rel = 'stylesheet';
					script.type = 'text/css';
					script.href = path + (this.thirdParty ? settings.thirdPartyDirectory : '') + this.css;
					injectionParent.after(script);
				}
			};

		$.each(this.dependencies, write);

		$.each(this.optional, write);
	},

	/**
	 * The instance creator of jQuery.sheet
	 * @memberOf jQuery.sheet
	 * @param {Object} s settings from jQuery.fn.sheet
	 * @param {Number} I the index of the instance
	 * @returns {jS} jS jQuery sheet instance
	 */
	createInstance:function (s, I) {

		var self = this,
		//create function, it expects 2 values.
			insertAfter = function (newElement, targetElement) {
				//target is what you want it to go after. Look for this elements parent.
				var parent = targetElement.parentNode;

				//if the parents lastchild is the targetElement...
				if(parent.lastchild == targetElement) {
					//add the newElement after the target element.
					parent.appendChild(newElement);
				} else {
					// else the target has siblings, insert the new element between the target and it's next sibling.
					parent.insertBefore(newElement, targetElement.nextSibling);
				}
			},
			$window = $(window),
			$document = $(document),
			body = document.body,
			$body = $(body),
			emptyFN = function () {},
			u = undefined,
			math = Math,
			n = isNaN,
			nAN = NaN,
			thaw = ($.sheet.defaults.useStack && window.thaw !== u ? window.thaw : function(stack, options) {
				options = options || {};

				var i = 0,
					max = stack.length,
					item,
					each = options.each || function() {},
					done = options.done || function() {};

				if (stack[0].call !== u) {
					for (; i < max; i++) {
						item = stack[i];
						item();
					}
				} else {
					for (; i < max; i++) {
						item = stack[i];
						each.apply(item);
					}
					done();
				}
			}),
			createCellsIfNeeded = (s.loader !== null),

			/**
			 * A single instance of a spreadsheet, shorthand, also accessible from jQuery.sheet.instance[index].
			 * Generally called by jQuery().sheet().  Exposed for the ability to override methods if needed
			 * @namespace
			 * @alias jQuery.sheet.instance[]
			 * @name jS
			 */
			jS = {
				/**
				 * Current version of jQuery.sheet
				 * @memberOf jS
				 * @type {String}
				 */
				version:'4.x',

				/**
				 * The active sheet index within the a set of sheets
				 * @memberOf jS
				 * @type {Number}
				 */
				i:0,

				/**
				 * The instance index
				 * @memberOf jS
				 * @type {Number}
				 */
				I:I,

				/**
				 * The current count of sheet's within the instance
				 * @memberOf jS
				 * @type {Number}
				 */
				sheetCount:0,

				/**
				 * The internal storage array of the spreadsheets for an instance, constructed as array 3 levels deep, spreadsheet, rows, cells, can easily be used for custom exporting/saving
				 * @memberOf jS
				 * @type {Array}
				 */
				spreadsheets:[],

				/**
				 * Internal storage array of controls for an instance
				 * @memberOf jS
				 */
				controls:{
					autoFiller:[],
					bar:{
						helper:[],
						corner:[],
						x:{
							controls:[],
							handleFreeze:[],
							menu:[],
							menuParent:[],
							parent:[],
							th:[],
							ths:function () {
								var ths = [],
									i = 0,
									_ths = this.th[jS.i],
									max = _ths.length;

								for (; i < max; i++) {
									ths.push(_ths[i]);
								}

								return ths;
							}
						},
						y:{
							controls:[],
							handleFreeze:[],
							menu:[],
							parent:[],
							th:[],
							ths:function () {
								var ths = [],
									i = 0,
									_ths = this.th[jS.i],
									max = _ths.length;

								for (; i < max; i++) {
									ths.push(_ths[i]);
								}

								return ths;
							}
						}
					},
					barMenuLeft:[],
					barMenuTop:[],
					barLeft:[],
					barTop:[],
					barTopParent:[],
					chart:[],
					tdMenu:[],
					cellsEdited:[],
					enclosure:[],
					enclosures:null,
					formula:null,
					fullScreen:null,
					header:null,
					inPlaceEdit:[],
					inputs:[],
					label:null,
					menuLeft:[],
					menuRight:[],
					menus:[],
					pane:[],
					panes:null,
					scrolls:null,
					sheetAdder:null,
					table:[],
					tables:null,
					tab:[],
					tabContainer:null,
					tabs:null,
					title:null,
					toggleHide:{
						x:[],
						y:[]
					},
					ui:null
				},

				/**
				 * Object selectors for interacting with a spreadsheet
				 * @memberOf jS
				 * @type {Object}
				 */
				obj:{
					autoFiller:function () {
						return jS.controls.autoFiller[jS.i] || $([]);
					},
					barCorner:function () {
						return jS.controls.bar.corner[jS.i] || $([]);
					},
					barHelper:function () {
						return jS.controls.bar.helper[jS.i] || (jS.controls.bar.helper[jS.i] = $([]));
					},
					barLeft:function (i) {
						return (jS.controls.bar.y.th[jS.i] && jS.controls.bar.y.th[jS.i][i] ? jS.controls.bar.y.th[jS.i][i] : []);
					},
					barLeftControls:function () {
						return jS.controls.bar.y.controls[jS.i] || $([]);
					},
					barLefts:function () {
						return jS.controls.bar.y.ths();
					},
					barHandleFreezeLeft:function () {
						return jS.controls.bar.y.handleFreeze[jS.i] || $([]);
					},
					barMenuLeft:function () {
						return jS.controls.bar.y.menu[jS.i] || $([]);
					},
					barTop:function (i) {
						return (jS.controls.bar.x.th[jS.i] && jS.controls.bar.x.th[jS.i][i] ? jS.controls.bar.x.th[jS.i][i] : []);
					},
					barTopControls:function () {
						return jS.controls.bar.x.controls[jS.i] || $([]);
					},
					barTops:function () {
						return jS.controls.bar.x.ths();
					},
					barTopParent:function () {
						return jS.controls.bar.x.parent[jS.i] || $([]);
					},
					barHandleFreezeTop:function () {
						return jS.controls.bar.x.handleFreeze[jS.i] || $([]);
					},
					barMenuParentTop:function () {
						return jS.controls.bar.x.menuParent[jS.i] || $([]);
					},
					barMenuTop:function () {
						return jS.controls.bar.x.menu[jS.i] || $([]);
					},
					tdActive:function () {
						return jS.cellLast.td || null;
					},
					cellActive:function() {
						return jS.cellLast;
					},
					tdMenu:function () {
						return jS.controls.tdMenu[jS.i] || $([]);
					},
					cellsEdited: function () {
						return (jS.controls.cellsEdited !== u ? jS.controls.cellsEdited : jS.controls.cellsEdited = []);
					},
					chart:function () {
						return jS.controls.chart[jS.i] || $([]);
					},
					enclosure:function () {
						return jS.controls.enclosure[jS.i] || $([]);
					},
					enclosures:function () {
						return jS.controls.enclosures || $([]);
					},
					formula:function () {
						return jS.controls.formula || $([]);
					},
					fullScreen:function () {
						return jS.controls.fullScreen || $([]);
					},
					header:function () {
						return jS.controls.header || $([]);
					},
					highlighted: function() {
						return jS.highlighter.last || $([]);
					},
					menuRight:function () {
						return jS.controls.menuRight[jS.i] || $([]);
					},
					inPlaceEdit:function () {
						return jS.controls.inPlaceEdit[jS.i] || $([]);
					},
					inputs:function() {
						return jS.controls.inputs[jS.i] || $([]);
					},
					label:function () {
						return jS.controls.label || $([]);
					},
					menus:function() {
						return jS.controls.menus[jS.i] || $([]);
					},
					menuLeft:function () {
						return jS.controls.menuLeft[jS.i] || $([]);
					},
					pane:function () {
						return jS.controls.pane[jS.i] || {};
					},
					panes:function () {
						return jS.controls.panes || $([]);
					},
					parent:function () {
						return s.parent;
					},
					scrolls:function () {
						return jS.controls.scrolls || $([]);
					},
					sheetAdder:function () {
						return jS.controls.sheetAdder || $([]);
					},
					table:function () {
						return jS.controls.table[jS.i] || $([]);
					},
					tables:function () {
						return jS.controls.tables || $([]);
					},
					tab:function () {
						return jS.controls.tab[jS.i] || $([]);
					},
					tabs:function () {
						return jS.controls.tabs || $([]);
					},
					tabContainer:function () {
						return jS.controls.tabContainer || $([]);
					},
					title:function () {
						return jS.controls.title || $([]);
					}
				},

				/**
				 * Internal id's of table, used for scrolling and a few other things
				 * @memberOf jS
				 * @type {String}
				 */
				id:'jS_' + I + '_',

				/**
				 * Internal css classes of objects
				 * @memberOf jS
				 * @type {Object}
				 */
				cl:{
					autoFiller:'jSAutoFiller',
					autoFillerHandle:'jSAutoFillerHandle',
					autoFillerCover:'jSAutoFillerCover',
					barCorner:'jSBarCorner',
					barController:'jSBarController',
					barControllerChild: 'jSBarControllerChild',
					barHelper:'jSBarHelper',
					barLeft:'jSBarLeft',
					barHandleFreezeLeft:'jSBarHandleFreezeLeft',
					barTop:'jSBarTop',
					barTopMenuButton: 'jSBarTopMenuButton',
					barHandleFreezeTop:'jSBarHandleFreezeTop',
					barTopParent:'jSBarTopParent',
					chart:'jSChart',
					formula:'jSFormula',
					formulaParent:'jSFormulaParent',
					header:'jSHeader',
					fullScreen:'jSFullScreen',
					inPlaceEdit:'jSInPlaceEdit',
					menu:'jSMenu',
					menuFixed:'jSMenuFixed',
					parent:'jSParent',
					scroll:'jSScroll',
					sheetAdder: 'jSSheetAdder',
					table:'jS',
					label:'jSLoc',
					pane:'jSEditPane',
					tab:'jSTab',
					tabContainer:'jSTabContainer',
					tabContainerScrollable:'jSTabContainerScrollable',
					tdMenu:'jSTdMenu',
					title:'jSTitle',
					enclosure:'jSEnclosure',
					ui:'jSUI'
				},

				/**
				 * Messages for user interface
				 * @memberOf jS
				 * @type {Object}
				 */
				msg:{
					addRowMulti:"How many rows would you like to add?",
					addColumnMulti:"How many columns would you like to add?",
					cellFind:"What are you looking for in this spreadsheet?",
					cellNoFind:"No results found.",
					dragToFreezeCol:"Drag to freeze column",
					dragToFreezeRow:"Drag to freeze row",
					addSheet:"Add a spreadsheet",
					openSheet:"Are you sure you want to open a different sheet?  All unsaved changes will be lost.",
					toggleHideRow:"No row selected.",
					toggleHideColumn:"No column selected.",
					loopDetected:"Loop Detected",
					newSheetTitle:"What would you like the sheet's title to be?",
					notFoundColumn:"Column not found",
					notFoundRow:"Row not found",
					notFoundSheet:"Sheet not found",
					setCellRef:"Enter the name you would like to reference the cell by.",
					sheetTitleDefault:"Spreadsheet {index}",
					maxRowsBrowserLimitation:"You've reached the maximum amount of rows this browser supports. Try using Chrome, FireFox, or Internet Explorer 9+",
					maxColsBrowserLimitation:"You've reached the maximum amount of columns this browser supports. Try using Chrome, FireFox, or Internet Explorer 9+",
					maxSizeBrowserLimitationOnOpen:"The spreadsheet you are loading is larger than the maximum size of cells this browser supports. Try using Chrome, Firefox, or Internet Explorer 9+. You can an proceed, but the spreadsheet may not work as intended.",
					cellLoading: "Loading..."
				},

				/**
				 * Deletes a jQuery sheet instance
				 * @memberOf jS
				 */
				kill:function () {
					if (!jS) {
						return false;
					}
					$(document).unbind('keydown');
					this.obj.fullScreen().remove();
					(this.obj.inPlaceEdit().destroy || emptyFN)();
					s.parent
						.trigger('sheetKill')
						.removeClass(jS.theme.parent)
						.html('');

					delete s.parent[0].jS;

					this.obj.menus().remove();

					var max = $.sheet.events.length;
					for (var i = 0; i < max; i++) {
						s.parent.unbind($.sheet.events[i]);
					}

					$.sheet.instance.splice(I, 1);
					return true;
				},

				/**
				 * Event trigger for jQuery sheet, wraps jQuery's trigger event to always return jS
				 * @param {String} eventType event type
				 * @param {Array} [extraParameters]
				 * @memberOf jS
				 */
				trigger:function (eventType, extraParameters) {
					//wrapper for $ trigger of parent, in case of further mods in the future
					extraParameters = extraParameters || [];
					return s.parent.triggerHandler(eventType, [jS].concat(extraParameters));
				},

				/**
				 * Returns all spreadsheets within an instance as an array, builds it if it doesn't exist
				 * @param [forceRebuild]
				 * @returns {Array|spreadsheets}
				 * @memberOf jS
				 */
				spreadsheetsToArray:function (forceRebuild) {
					if (forceRebuild || jS.spreadsheets.length == 0) {
						jS.cycleCellsAll(function (sheet, row, col) {
							jS.createCell(sheet, row, col);
						});
					}
					return jS.spreadsheets;
				},

				/**
				 * Returns singe spreadsheet from a set of spreadsheets within as instance, builds if it doesn't exist
				 * @param {Boolean} forceRebuild Enforces the spreadsheet to be rebuilt
				 * @param {Number} i Spreadsheet index
				 * @memberOf jS
				 */
				spreadsheetToArray:function (forceRebuild, i) {
					i = (i ? i : jS.i);
					if (!jS.spreadsheets[i]) {
						jS.cycleCells(function (sheet, row, col) {
							jS.createCell(sheet, row, col);
						});
					}
					return jS.spreadsheets[i];
				},

				/**
				 * Creates a single cell within
				 * @param {Number} sheetIndex
				 * @param {Number} [rowIndex]
				 * @param {Number} [colIndex]
				 * @param {Number} [calcCount]
				 * @memberOf jS
				 */
				createCell:function (sheetIndex, rowIndex, colIndex, calcCount) {
					//first create cell
					var sheet,
						row,
						jSCell,
						value,
						table,
						colGroup,
						col,
						tBody,
						tr,
						td,
						tdsX,
						tdsY,
						formula,
						cellType,
						hasCellType,
						uneditable,
						id;

					if ((sheet = jS.spreadsheets[sheetIndex]) === u) { //check if spreadsheet exists, if not, create it as an array
						sheet = jS.spreadsheets[sheetIndex] = [];
					}

					if ((row = sheet[rowIndex]) === u) { //check if row exists, if not, create it
						row = sheet[rowIndex] = [];
					}

					if ((table = jS.controls.tables[sheetIndex]) === u) return null;
					if ((tBody = table.tBody) === u) return null;
					if ((tr = tBody.children[rowIndex]) === u) return null;
					if ((td = tr.children[colIndex]) === u) return null;

					jSCell = row[colIndex] = td.jSCell = new Sheet.Cell(sheetIndex, td, jS, jS.cellHandler);
					jSCell.sheetIndex = sheetIndex;
					jSCell.rowIndex = rowIndex;
					jSCell.columnIndex = colIndex;

					formula = td.getAttribute('data-formula');
					cellType = td.getAttribute('data-celltype');
					uneditable = td.getAttribute('data-uneditable');
					id = td.getAttribute('id');

					if (formula !== null)
						jSCell.formula = formula;
					if (cellType !== null) {
						jSCell.cellType = cellType;
						hasCellType = true;
					}
					if (uneditable !== null)
						jSCell.uneditable = uneditable;
					if (id !== null)
						jSCell.id = id;

					value = td.textContent || td.innerText;
					switch (typeof(value)) {
						case 'object':
							break;
						case 'undefined':
							value = new String();
							break;
						case 'number':
							jSCell.value = new Number(value);
							break;
						case 'boolean':
							jSCell.value = new Boolean(value);
							break;
						case 'string':
						default:
							jSCell.value = new String(value);
							break;
					}
					jSCell.value.cell = jSCell;
					jSCell.calcCount = calcCount || 0;
					jSCell.needsUpdated = jSCell.formula.length > 0 || hasCellType;



					if (jSCell.formula.length > 0 && jSCell.formula.charAt(0) == '=') {
						jSCell.formula = jSCell.formula.substring(1);
					}


					//attach cells to col
					colGroup = table.colGroup;
					if ((col = colGroup.children[colIndex]) === u) {
						//if a col doesn't exist, it adds it here
						col = document.createElement('col');
						col.setAttribute('style', 'width:' + jS.s.newColumnWidth + 'px;');
						colGroup.appendChild(col);
					}

					//now create row
					if ((tdsY = jS.controls.bar.y.th[sheetIndex]) === u) {
						tdsY = jS.controls.bar.y.th[sheetIndex] = [];
					}
					if (tdsY[rowIndex] === u) {
						tdsY[rowIndex] = tr.children[0];
					}

					if ((tdsX = jS.controls.bar.x.th[sheetIndex]) === u) {
						tdsX = jS.controls.bar.x.th[sheetIndex] = [];
					}
					if (tdsX[colIndex] !== u) {
						tdsX[colIndex] = tBody.children[0].children[colIndex];
					}

					//return cell
					return jSCell;
				},

				/**
				 * Get cell value
				 * @memberOf jS
				 * @param {Number} sheetIndex
				 * @param {Number} rowIndex
				 * @param {Number} columnIndex
				 * @returns {Sheet.Cell|Null}
				 */
				getCell: function (sheetIndex, rowIndex, columnIndex) {
					var spreadsheet, row, cell;
					if (
						(spreadsheet = jS.spreadsheets[sheetIndex]) === u
						|| (row = spreadsheet[rowIndex]) === u
						|| (cell = row[columnIndex]) === u
					) {
						//look in loader first
						if (s.loader !== null) {
							cell = s.loader.jitCell(sheetIndex, rowIndex, columnIndex);
						}
						//if loader doesn't have the cell, perhaps it is in the table still
						else {
							cell = jS.createCell(sheetIndex, rowIndex, columnIndex);
						}
					}

					if (cell === u || cell === null) {
						return null;
					}

					cell.sheetIndex = sheetIndex;
					cell.rowIndex = rowIndex;
					cell.columnIndex = columnIndex;
					return cell;
				},

				/**
				 *
				 * @param {String} cellId
				 * @param {Number|Function} [callbackOrSheet]
				 * @param {Function} [callback]
				 * @returns {*}
				 */
				getCellById: function(cellId, callbackOrSheet, callback) {
					var hasLoader = s.loader !== null,
						cell,
						sheet;

					if (typeof callbackOrSheet === 'function') {
						sheet = -1;
						callback = callbackOrSheet;
					} else {
						sheet = callbackOrSheet;
						if (typeof sheet === 'sting') {
							sheet = s.loader.getSpreadsheetIndexByTitle(sheet);
						}
					}

					if (hasLoader) {
						cell = s.loader.jitCellById(cellId, sheet);

						if (callback !== u && cell !== null) {
							callback.call(cell);
							return this;
						}

						return cell;
					}

					return null;
				},
				getCells: function(cellReferences, callback) {
					var i = 0,
						max = cellReferences.length,
						remaining = max - 1,
						cellReference,
						cellLocation,
						cell,
						cells = [];

					for(;i < max; i++) {
						cellReference = cellReferences[i];
						if (typeof cellReference === 'string') {
							//TODO: get cellLocation from string here
							cell = jS.getCellById(cellReference);
						} else {
							cellLocation = cellReference;
							cell = jS.getCell(cellLocation.sheet, cellLocation.rowIndex, cellLocation.columnIndex);
						}

						if (cell !== null) {
							cells.push(cell);
						}
					}

					return cells;
				},

				updateCells: function(cellReferences, callback) {
					var i = 0,
						max = cellReferences.length,
						remaining = max - 1,
						cellReference,
						cellLocation,
						cell,
						values = [];

					for(;i < max; i++) {
						cellReference = cellReferences[i];
						if (typeof cellReference === 'string') {
							cell = jS.getCellById(cellReference);
						} else {
							cellLocation = cellReference;
							cell = jS.getCell(cellLocation.sheet, cellLocation.rowIndex, cellLocation.columnIndex);
						}

						if (cell !== null) {

							if (callback !== u) {
								(function(cell, i) {
									cell.updateValue(function (value) {
										remaining--;
										values[i] = value;
										if (remaining < 0) {
											callback.apply(jS, values);
										}
									});
								})(cell, i);
							}
						} else {
							remaining--;
						}
					}
				},
				/**
				 * Tracks which spreadsheet is active to intercept keystrokes for navigation
				 * @type {Boolean}
				 * @memberOf jS
				 */
				nav:false,

				/**
				 * Turns off all intercept keystroke navigation instances, with exception of supplied instance index
				 * @param {Boolean} nav Instance index
				 * @memberOf jS
				 */
				setNav:function (nav) {
					var instance = $.sheet.instance;
					for(var i = 0; i < instance.length; i++) {
						(instance[i] || {}).nav = false;
					}

					jS.nav = nav;
				},

				/**
				 * Creates the different objects required by sheets
				 * @memberOf jS
				 * @type {Object}
				 * @namespace
				 */
				controlFactory:{
					/**
					 * Creates multi rows
					 * @param {Number} [i] row index
					 * @param {Number} [qty] the number of cells you'd like to add, if not specified, a dialog will ask
					 * @param {Boolean} [isBefore] places cells before the selected cell if set to true, otherwise they will go after, or at end
					 * @param {Boolean} [skipFormulaReParse] re-parses formulas if needed
					 * @param {Boolean} [isInit]
					 * @memberOf jS.controlFactory
					 */
					addRowMulti:function (i, qty, isBefore, skipFormulaReParse, isInit) {
						var addCellsType = (isInit ? 'row-init' : 'row');
						function add(qty) {
							if (qty) {
								if (!n(qty)) {
									jS.controlFactory.addCells(i, isBefore, parseInt(qty), addCellsType, skipFormulaReParse);
									jS.trigger('sheetAddRow', [i, isBefore, qty]);
								}
							}
						}

						if (!qty) {
							s.prompt(
								jS.msg.addRowMulti,
								add
							);
						} else {
							add(qty);
						}
					},

					/**
					 * Creates multi columns
					 * @param {Number} [i] column index
					 * @param {Number} [qty] the number of cells you'd like to add, if not specified, a dialog will ask
					 * @param {Boolean} [isBefore] places cells before the selected cell if set to true, otherwise they will go after, or at end
					 * @param {Boolean} [skipFormulaReParse] re-parses formulas if needed
					 * @param {Boolean} [isInit]
					 * @memberOf jS.controlFactory
					 */
					addColumnMulti:function (i, qty, isBefore, skipFormulaReParse, isInit) {
						var addCellsType = (isInit ? 'col-init' : 'col');
						function add(qty) {
							if (qty) {
								if (!n(qty)) {
									jS.controlFactory.addCells(i, isBefore, parseInt(qty), addCellsType, skipFormulaReParse);
									jS.trigger('sheetAddColumn', [i, isBefore, qty]);
								}
							}
						}

						if (!qty) {
							s.prompt(
								jS.msg.addColumnMulti,
								add
							);
						} else {
							add(qty);
						}
					},
					rowAdder: new Sheet.RowAdder(),
					columnAdder: new Sheet.ColumnAdder(),
					/**
					 * Creates cells for sheet and the bars that go along with them
					 * @param {Number} [spreadsheetIndex] index where cells should be added, if null, cells go to end
					 * @param {Boolean} [isBefore] places cells before the selected cell if set to true, otherwise they will go after, or at end;
					 * @param {Number} [qty] how many rows/columns to add
					 * @param {String} [type] "row" or "col", default "col"
					 * @param {Boolean} [skipFormulaReParse] re-parses formulas if needed
					 * @memberOf jS.controlFactory
					 * @returns {Boolean}
					 */
					addCells:function (spreadsheetIndex, isBefore, qty, type, skipFormulaReParse) {
						if (qty < 1) return false;

						//hide the autoFiller, it can get confused
						jS.autoFillerHide();

						jS.setDirty(true);
						jS.setChanged(true);
						jS.obj.barHelper().remove();

						var domIndex,
							pane = jS.obj.pane(),
							table = pane.table,
							actionUI = pane.actionUI,
							tBody = table.tBody,
							colGroup = table.colGroup,
							isLast = false,
							activeCell = jS.obj.cellActive(),
							spreadsheet = jS.spreadsheets[jS.i] || (jS.spreadsheets[jS.i] = []),
							o,
							offset,
							rowBarClasses = jS.cl.barLeft + ' ' + jS.theme.bar,
							colBarClasses = jS.cl.barTop + ' ' + jS.theme.bar,
							loc,
							loader = (s.loader !== null ? s.loader : null),
							getWidth = (loader !== null ? function(i, col) { return loader.getWidth(i, col); } : function() { return s.newColumnWidth; }),
							getHeight = (loader !== null ? function (i, row) { return loader.getHeight(i, row); } : function() { return s.colMargin; }),
							defaultSetupCell = function (sheetIndex, rowIndex, columnIndex, createCellFn) {
								var td = document.createElement('td');
								return new Sheet.Cell(jS.i, td, jS, jS.cellHandler);
							},
							setupCell = (loader !== null ? loader.setupCell : defaultSetupCell),
							controlX = jS.controls.bar.x.th[jS.i] || (jS.controls.bar.x.th[jS.i] = []),
							controlY = jS.controls.bar.y.th[jS.i] || (jS.controls.bar.y.th[jS.i] = []),
							sheetSize = pane.size(),
							tableSize = table.size(),
							frag = document.createDocumentFragment(),
							maximumVisibleQty,
							detacher = actionUI.yDetacher,
							storeInDetacher = false;

						qty = qty || 1;
						type = type || 'col';

						switch (type) {
							case "row-init":
							case "row":
								maximumVisibleQty = actionUI.maximumVisibleRows;

								//ensure that i isn't out of bounds
								if (spreadsheetIndex === u || spreadsheetIndex === null) {
									spreadsheetIndex = spreadsheet.length - 1;
									isLast = true;
								}

								if (type === 'row-init' && ((spreadsheetIndex === 0 && spreadsheet.length === 0) || spreadsheetIndex === spreadsheet.length - 1)) {
									isLast = true;
								}

								if (spreadsheetIndex > sheetSize.rows) {
									spreadsheetIndex = sheetSize.rows;
									isLast = true;
								}

								domIndex = spreadsheetIndex;

								if (domIndex > tableSize.rows) {
									domIndex = tableSize.rows;
								} else if (spreadsheetIndex === 0) {
									isBefore = false;
								}

								if (isLast) {
									storeInDetacher = detacher.isBelowActive();
									if (storeInDetacher) {
										spreadsheetIndex += detacher.detachedBelow.length - 1;
									}
								}

								loc = {row: spreadsheetIndex, col: 0};
								o = this.rowAdder;
								if (o.setQty(qty, tableSize) === false) {
									if (!jS.isBusy()) {
										s.alert(jS.msg.maxRowsBrowserLimitation);
									}
									return;
								}

								o.setCreateBarFn(function (rowIndex, isHidden) {
									var barParent = document.createElement('tr'),
										bar = document.createElement('th');

									if (tableSize.cols === 0) {
										var topBarParent = tBody.children[0],
											col = document.createElement('col'),
											topBar = document.createElement('th');

										col.style.width = getWidth(jS.i, 1) + 'px';

										topBar.entity = 'top';
										topBar.type = 'bar';
										topBar.innerHTML = topBar.label = jSE.columnLabelString(1);
										topBar.className = colBarClasses;
										controlX[1] = topBar;
										topBarParent.appendChild(topBar);
										colGroup.appendChild(col);
									}

									bar.className = rowBarClasses;
									bar.entity = 'left';
									bar.type = 'bar';
									bar.style.height = getHeight(jS.i, rowIndex) + 'px';
									bar.innerHTML = bar.label = rowIndex;

									barParent.appendChild(bar);

									//if row is hidden, simply don't add it to the rows in the detacher, but access it simply from spreadsheet
									if (!isHidden) {
										if (storeInDetacher) {
											detacher.detachedBelow.push(barParent);
										}
										else if (tBody.children.length + frag.children.length < actionUI.maximumVisibleRows) {
											frag.appendChild(barParent);
											if (frag.children.length === maximumVisibleQty) {
												storeInDetacher = true;
											}
										}
										else {
											detacher.detachedBelow.push(barParent);
										}
									}

									if (spreadsheet.length === 0) {
										controlY[rowIndex] = bar;
										//make the spreadsheet ready to accept cells;
										spreadsheet[rowIndex] = [];
									} else {
										if (rowIndex >= spreadsheet.length) {
											controlY[rowIndex] = bar;
											//make the spreadsheet ready to accept cells;
											spreadsheet[rowIndex] = [];
										} else {
											controlY.splice(rowIndex, 0, bar);
											//make the spreadsheet ready to accept cells;
											spreadsheet.splice(rowIndex, 0, []);
										}
									}

									return barParent;
								});

								o.setCreateCellFn(function (rowIndex, columnIndex, rowParent, isHidden) {
									var cell = setupCell.call(loader, jS.i, rowIndex, columnIndex, jS),
										td,
										spreadsheetRow = spreadsheet[rowIndex];

									if (cell === null) {
										cell = defaultSetupCell(jS.i, rowIndex, columnIndex, jS);
									}

									td = cell.td;
									td.jSCell = cell;

									if (spreadsheetRow === u) {
										console.log(jS);
									}

									if (spreadsheetRow.length === 0) {
										spreadsheetRow[columnIndex] = cell;
									} else {
										spreadsheetRow.splice(columnIndex, 0, cell);
									}

									//TODO: handle those that are hidden when they are unhidden
									if (!isHidden) {
										cell.updateValue();
									}

									rowParent.insertBefore(td, rowParent.children[columnIndex]);
								});

								o.setHidden(s.hiddenRows[jS.i]);

								o.setAddedFinishedFn(function(_offset) {
									if (spreadsheetIndex === 0 && isLast) {
										tBody.appendChild(frag);
									} else {
										tBody.insertBefore(frag, isBefore ? tBody.children[domIndex] : tBody.children[domIndex].nextSibling);
									}
									if (!isLast) {
										jS.refreshRowLabels(spreadsheetIndex);
									}
									offset = _offset;
								});
								break;
							case "col":
								//setupCell = null;
							case "col-init":
								//ensure that i isn't out of bounds
								if (spreadsheetIndex === u || spreadsheetIndex === null) {
									spreadsheetIndex = tableSize.cols;
									isLast = true;
								}

								if (type === 'col-init' && ((spreadsheetIndex === 0 && spreadsheet[1].length === 0) || spreadsheetIndex === spreadsheet[1].length - 1)) {
									isLast = true;
								}

								if (spreadsheetIndex > sheetSize.cols) {
									spreadsheetIndex = sheetSize.cols;
									isLast = true;
								}

								domIndex = spreadsheetIndex;

								if (domIndex > tableSize.cols) {
									domIndex = tableSize.cols;
								} else if (spreadsheetIndex === 0 ) {
									isBefore = false;
								}

								loc = {row: 0, col: spreadsheetIndex};
								o = this.columnAdder;
								if (o.setQty(qty, tableSize) === false) {
									if (!jS.isBusy()) {
										s.alert(jS.msg.maxColsBrowserLimitation);
									}
									return;
								}
								o.setCreateBarFn(function(columnIndex) {
									var barParent = tBody.children[0],
										col = document.createElement('col'),
										topBar = document.createElement('th'),
										leftBar,
										rowParent = tBody.children[1]; //the very first row may not exist yet

									col.style.width = getWidth(jS.i, columnIndex) + 'px';

									topBar.entity = 'top';
									topBar.type = 'bar';
									topBar.innerHTML = topBar.label = jSE.columnLabelString(columnIndex);
									topBar.className = colBarClasses;

									//If the row has not been created lets set it up
									if (rowParent === u) {
										leftBar = document.createElement('th');
										leftBar.setAttribute('class', rowBarClasses);
										leftBar.entity = 'left';
										leftBar.type = 'bar';

										rowParent = document.createElement('tr');
										rowParent.style.height = getHeight(jS.i, columnIndex) + 'px';
										rowParent.appendChild(leftBar);
										tBody.appendChild(rowParent);

										leftBar.innerHTML = rowParent.rowIndex;
										controlY[1] = leftBar;
									}

									colGroup.insertBefore(col, colGroup.children[columnIndex]);
									barParent.insertBefore(topBar, barParent.children[columnIndex]);

									if (controlX.length === 0) {
										controlX[columnIndex] = topBar;
									} else {
										controlX.splice(columnIndex, 0, topBar);
									}

									return {
										bar: topBar,
										col: col,
										barParent: barParent,
										firstRowParent: rowParent
									};
								});

								o.setCreateCellFn(function (rowIndex, columnIndex, createdBar) {
									var cell = setupCell.call(loader, jS.i, rowIndex, columnIndex, jS),
										td,
										rowParent,
										spreadsheetRow = spreadsheet[rowIndex];

									if (cell === null) {
										cell = defaultSetupCell(jS.i, rowIndex, columnIndex, jS);
									}

									td = cell.td;
									if (spreadsheetRow === u) {
										spreadsheet[rowIndex] = spreadsheetRow = [];
										rowParent = tBody.children[rowIndex];
									} else if (rowIndex === 1 && createdBar.firstRowParent) {
										rowParent = createdBar.firstRowParent;
									} else {
										rowParent = spreadsheetRow[1].td.parentNode;
									}

									if (spreadsheetRow.length === 0) {
										spreadsheetRow[columnIndex] = cell;
									} else {
										spreadsheetRow.splice(columnIndex, 0, cell);
									}

									cell.updateValue();

									rowParent.insertBefore(td, rowParent.children[columnIndex]);
								});

								o.setAddedFinishedFn(function(_offset) {
									if (!isLast) {
										jS.refreshColumnLabels(spreadsheetIndex);
									}
									offset = _offset;
								});
								break;
						}

						o.createCells(spreadsheetIndex, tableSize, isBefore);

						if (!skipFormulaReParse && isLast != true) {
							//offset formulas
							jS.offsetFormulas(loc, offset, isBefore);
						}

						if (pane.inPlaceEdit) {
							pane.inPlaceEdit.goToTd();
						}
						if (activeCell) {
							jS.colLast = activeCell.columnIndex;
							jS.rowLast = activeCell.rowIndex;
						}

						return true;
					},

					/**
					 * creates single row
					 * @param {Number} [i] row index
					 * @param {Boolean} [isBefore] places cells before the selected cell if set to true, otherwise they will go after, or at end
					 * @memberOf jS.controlFactory
					 */
					addRow:function (i, isBefore) {
						jS.controlFactory.addCells(i, isBefore, 1, 'row');
						jS.trigger('sheetAddRow', [i, isBefore, 1]);
					},

					/**
					 * creates single column
					 * @param {Number} [i], column index
					 * @param {Boolean} [isBefore] places cells before the selected cell if set to true, otherwise they will go after, or at end
					 * @memberOf jS.controlFactory
					 */
					addColumn:function (i, isBefore) {
						jS.controlFactory.addCells(i, isBefore, 1, 'col');
						jS.trigger('sheetAddColumn', [i, isBefore, 1]);
					},

					/**
					 * Creates all the bars to the left of the spreadsheet, if they exist, they are first removed
					 * @param {jQuery|HTMLElement} table Table of spreadsheet
					 * @memberOf jS.controlFactory
					 */
					barLeft:function (table) {
						var tr = table.tBody.children,
							th,
							i = tr.length - 1,
							barLeft = jS.controls.bar.y.th[jS.i] = [];

						//table / tBody / tr
						if (i > 0) {
							do {
								th = document.createElement('th');
								barLeft[i] = th;
								tr[i].insertBefore(th, tr[i].children[0]);
							} while(i-- > 1); //We only go till row 1, row 0 is handled by barTop with corner etc
						}
					},

					/**
					 * Creates all the bars to the top of the spreadsheet on colGroup col elements, if they exist, they are first removed
					 * @param {HTMLElement} table representing spreadsheet
					 * @memberOf jS.controlFactory
					 */
					barTop:function (table) {
						var colGroup = table.colGroup,
							cols = colGroup.children,
							i,
							trFirst = table.tBody.children[0],

							colCorner = document.createElement('col'), //left column & corner
							thCorner = document.createElement('th'),

							barTopParent = document.createElement('tr'),
							existingTdsInFirstRow = 0,
							barTop = jS.controls.bar.x.th[jS.i] = [];

						if (trFirst === u) {
							colGroup.innerHTML = '';
						} else {
							existingTdsInFirstRow = trFirst.children.length;
							//If the col elements outnumber the td's, get rid of the extra as it messes with the ui
							while (cols.length > existingTdsInFirstRow) {
								colGroup.removeChild(cols[cols.length -1]);
							}
						}

						colCorner.style.width = colCorner.style.minWidth = s.colMargin + 'px';
						colGroup.insertBefore(colCorner, colGroup.children[0]); //end col corner

						barTopParent.appendChild(thCorner);

						barTopParent.className = jS.cl.barTopParent;
						table.tBody.insertBefore(barTopParent, table.tBody.children[0]);
						table.barTopParent = barTopParent;
						table.corner = thCorner;
						thCorner.col = colCorner;
						jS.controls.barTopParent[jS.i] = $(barTopParent);

						i = Math.min(existingTdsInFirstRow, s.initCalcCols);

						if (i > 0) {
							do {
								var th = document.createElement('th');
								barTop[i] = th;
								if (!cols[i]) {
									cols[i] = document.createElement('col');
									colGroup.insertBefore(cols[i], colCorner.nextSibling);

								}

								cols[i].bar = th;
								th.col = cols[i];
								barTopParent.insertBefore(th, thCorner.nextSibling);
							} while (i-- > 1);
						}

						table.barTop = jS.controls.barTopParent[jS.i].children();

						return barTopParent;
					},

					/**
					 * Creates the draggable objects for freezing cells
					 * @type {Object}
					 * @memberOf jS.controlFactory
					 * @namespace
					 */
					barHandleFreeze:{

						/**
						 * @param {jQuery|HTMLElement} pane
						 * @returns {Boolean}
						 * @memberOf jS.controlFactory.barHandleFreeze
						 */
						top:function (pane) {
							if (jS.isBusy()) {
								return false;
							}
							var
								actionUI = jS.obj.pane().actionUI,
								frozenAt = actionUI.frozenAt,
								scrolledArea = actionUI.scrolledArea;

							if (!(scrolledArea.col <= (frozenAt.col + 1))) {
								return false;
							}

							jS.obj.barHelper().remove();

							var table = pane.table,
								tBody = table.tBody,
								firstRow = tBody.children[0],
								tds = firstRow.children,
								bar = $(tds[frozenAt.col + 1]),
								pos = bar.position(),
								highlighter,
								offset = $(pane).offset(),
								handle = document.createElement('div'),
								$handle = pane.freezeHandleTop = $(handle)
									.appendTo(pane)
									.addClass(jS.theme.barHandleFreezeTop + ' ' + jS.cl.barHelper + ' ' + jS.cl.barHandleFreezeTop)
									.height(bar.height())
									.css('left', (pos.left - handle.clientWidth) + 'px')
									.attr('title', jS.msg.dragToFreezeCol);


							jS.controls.bar.helper[jS.i] = jS.obj.barHelper().add(handle);
							jS.controls.bar.x.handleFreeze[jS.i] = $handle;

							jS.draggable($handle, {
								axis:'x',
								start:function () {
									jS.setBusy(true);

									highlighter = $(document.createElement('div'))
										.appendTo(pane)
										.css('position', 'absolute')
										.addClass(jS.theme.barFreezeIndicator + ' ' + jS.cl.barHelper)
										.height(pane.table.corner.clientHeight)
										.fadeTo(0,0.33);
								},
								drag:function() {
									var target = jS.nearest($handle, tds).prev();
									if (target.length && target.position) {
										highlighter.width(target.position().left + target.width());
									}
								},
								stop:function (e, ui) {
									highlighter.remove();
									jS.setBusy(false);
									jS.setDirty(true);
									var target = jS.nearest($handle, tds);

									jS.obj.barHelper().remove();
									scrolledArea.col = actionUI.frozenAt.col = jS.getTdLocation(target[0]).col - 1;
									jS.autoFillerHide();
								},
								containment:[offset.left, offset.top, math.min(offset.left + pane.table.clientWidth, offset.left + pane.clientWidth - window.scrollBarSize.width), offset.top]
							});

							return true;
						},

						/**
						 *
						 * @param {jQuery|HTMLElement} pane
						 * @returns {Boolean}
						 * @memberOf jS.controlFactory.barHandleFreeze
						 */
						left:function (pane) {
							if (jS.isBusy()) {
								return false;
							}
							var pane = jS.obj.pane(),
								actionUI = pane.actionUI,
								frozenAt = actionUI.frozenAt,
								scrolledArea = actionUI.scrolledArea;

							if (!(scrolledArea.row <= (frozenAt.row + 1))) {
								return false;
							}

							jS.obj.barHelper().remove();

							var table = pane.table,
								tBody = table.tBody,
								bar = $(tBody.children[frozenAt.row + 1].children[0]),
								pos = bar.position(),
								highlighter,
								offset = $(pane).offset(),
								handle = document.createElement('div'),
								trs = tBody.children,
								$handle = pane.freezeHandleLeft = $(handle)
									.appendTo(pane)
									.addClass(jS.theme.barHandleFreezeLeft + ' ' + jS.cl.barHelper + ' ' + jS.cl.barHandleFreezeLeft)
									.width(bar.width())
									.css('top', (pos.top - handle.clientHeight + 1) + 'px')
									.attr('title', jS.msg.dragToFreezeRow);

							jS.controls.bar.helper[jS.i] = jS.obj.barHelper().add(handle);
							jS.controls.bar.y.handleFreeze[jS.i] = $handle;

							jS.draggable($handle, {
								axis:'y',
								start:function () {
									jS.setBusy(true);

									highlighter = $(document.createElement('div'))
										.appendTo(pane)
										.css('position', 'absolute')
										.addClass(jS.theme.barFreezeIndicator + ' ' + jS.cl.barHelper)
										.width(handle.clientWidth)
										.fadeTo(0,0.33);
								},
								drag:function() {
									var target = jS.nearest($handle, trs).prev();
									if (target.length && target.position) {
										highlighter.height(target.position().top + target.height());
									}
								},
								stop:function (e, ui) {
									highlighter.remove();
									jS.setBusy(false);
									jS.setDirty(true);
									var target = jS.nearest($handle, trs);
									jS.obj.barHelper().remove();
									scrolledArea.row = actionUI.frozenAt.row = math.max(jS.getTdLocation(target.children(0)[0]).row - 1, 0);
									jS.autoFillerHide();
								},
								containment:[offset.left, offset.top, offset.left, math.min(offset.top + pane.table.clientHeight, offset.top + pane.clientHeight - window.scrollBarSize.height)]
							});

							return true;
						},

						/**
						 * @memberOf jS.controlFactory.barHandleFreeze
						 */
						corner:function () {
						}
					},

					/**
					 *
					 * Creates menus for contextual menus and top bar button
					 * @param bar
					 * @param menuItems
					 * @returns {jQuery|HTMLElement}
					 * @memberOf jS.controlFactory
					 */
					menu:function (bar, menuItems) {
						var menu, buttons = $([]), hoverClass = jS.theme.menuHover;

						switch (bar) {
							case "top":
								menu = $(document.createElement('div'))
									.addClass(jS.theme.menu + ' ' + jS.cl.tdMenu);
								jS.controls.bar.x.menu[jS.i] = menu;
								break;
							case "left":
								menu = $(document.createElement('div'))
									.addClass(jS.theme.menu + ' ' + jS.cl.tdMenu);
								jS.controls.bar.y.menu[jS.i] = menu;
								break;
							case "cell":
								menu = $(document.createElement('div'))
									.addClass(jS.theme.menu + ' ' + jS.cl.tdMenu);
								jS.controls.tdMenu[jS.i] = menu;
								break;
						}

						jS.controls.menus[jS.i] = jS.obj.menus().add(menu);

						menu
							.mouseleave(function () {
								menu.hide();
							})
							.bind('contextmenu', function() {return false;})
							.appendTo($body)
							.hide()
							.disableSelectionSpecial();

						for (var msg in menuItems) {
							if (menuItems[msg]) {
								if ($.isFunction(menuItems[msg])) {
									buttons.pushStack(
										$(document.createElement('div'))
											.text(msg)
											.data('msg', msg)
											.click(function () {
												menuItems[$(this).data('msg')].call(this, jS);
												menu.hide();
												return false;
											})
											.appendTo(menu)
											.hover(function() {
												buttons.removeClass(hoverClass);
												$(this).addClass(hoverClass);
											}, function() {
												$(this).removeClass(hoverClass);
											})
									);

								} else if (menuItems[msg] == 'line') {
									$(document.createElement('hr')).appendTo(menu);
								}
							}
						}

						return menu;
					},

					/**
					 * Creates items within menus using jQuery.sheet.instance.msg
					 * @memberOf jS.controlFactory
					 * @namespace
					 */
					barMenu:{

						/**
						 * @param {Object} e jQuery event
						 * @param {Number} i column
						 * @param {jQuery|HTMLElement} target
						 * @returns {*}
						 * @memberOf jS.controlFactory.barMenu
						 */
						top:function (e, i, target) {
							if (jS.isBusy()) {
								return false;
							}
							var menu = jS.obj.barMenuTop().hide();

							if (!menu.length) {
								menu = jS.controlFactory.menu('top', s.contextmenuTop);
							}

							jS.obj.menus().hide();

							if (!target) {
								menu
									.css('left', (e.pageX - 5) + 'px')
									.css('top', (e.pageY - 5) + 'px')
									.show();
								return menu;
							}

							var barMenuParentTop = jS.obj.barMenuParentTop().hide();

							if (!barMenuParentTop.length) {

								barMenuParentTop = $(document.createElement('div'))
									.addClass(jS.theme.barMenuTop + ' ' + jS.cl.barHelper + ' ' + jS.cl.barTopMenuButton)
									.append(
										$(document.createElement('span'))
											.addClass('ui-icon ui-icon-triangle-1-s')
									)
									.mousedown(function (e) {
										barMenuParentTop.parent()
											.mousedown()
											.mouseup();

										var offset = barMenuParentTop.offset();

										menu
											.css('left', (e.pageX - 5) + 'px')
											.css('top', (e.pageY - 5) + 'px')
											.show();
									})
									.blur(function () {
										if (menu) menu.hide();
									});

								barMenuParentTop.get(0).destroy = function(){
									barMenuParentTop.remove();
									jS.controls.bar.x.menuParent[jS.i] = null;
								};

								jS.controls.bar.x.menuParent[jS.i] = barMenuParentTop;
							}

							barMenuParentTop
								.prependTo(target)
								.show();
						},

						/**
						 *
						 * @param e
						 * @param i
						 * @returns {Boolean}
						 * @memberOf jS.controlFactory.barMenu
						 */
						left:function (e, i) {
							if (jS.isBusy()) {
								return false;
							}
							jS.obj.barMenuLeft().hide();

							if (i) {
								jS.obj.barHandleFreezeLeft().remove();
							}
							var menu;

							menu = jS.obj.barMenuLeft();

							if (!menu.length) {
								menu = jS.controlFactory.menu('left', s.contextmenuLeft);
							}

							jS.obj.menus().hide();

							menu
								.css('left', (e.pageX - 5) + 'px')
								.css('top', (e.pageY - 5) + 'px')
								.show();

							return true;
						},

						/**
						 * @memberOf jS.controlFactory.barMenu
						 */
						corner:function () {
						}
					},


					/**
					 * Creates contextual menus for cells (a right click menu)
					 * @param {Object} e jQuery event
					 * @returns {Boolean}
					 * @memberOf jS.controlFactory
					 */
					tdMenu:function (e) {
						if (jS.isBusy()) {
							return false;
						}
						jS.obj.tdMenu().hide();

						var menu = jS.obj.tdMenu();

						if (!menu.length) {
							menu = jS.controlFactory.menu('cell', s.contextmenuCell);
						}

						jS.obj.menus().hide();

						menu
							.css('left', (e.pageX - 5) + 'px')
							.css('top', (e.pageY - 5) + 'px')
							.show();

						return true;
					},


					/**
					 * Creates the control/container for everything above the spreadsheet, removes them if they already exist
					 * @memberOf jS.controlFactory
					 */
					header:function () {
						jS.obj.header().remove();
						jS.obj.sheetAdder().remove();
						jS.obj.tabContainer().remove();

						var header = document.createElement('div'),
							firstRow = document.createElement('table'),
							firstRowTr = document.createElement('tr'),
							secondRow,
							secondRowTr,
							title = document.createElement('td'),
							label,
							menuLeft,
							menuRight,
							formula,
							formulaParent;

						header.appendChild(firstRow);
						firstRow.appendChild(firstRowTr);
						header.className = jS.cl.header + ' ' + jS.theme.control;

						jS.controls.header = $(header);

						if (s.title) {
							if ($.isFunction(s.title)) {
								s.title = jS.title(jS, I);
							}

							title.className = jS.cl.title;
							jS.controls.title = $(title).html(s.title)
						} else {
							$(title).hide();
						}
						firstRowTr.appendChild(title);

						//Sheet Menu Control
						function makeMenu(menu) {
							if ($.isFunction(menu)) {
								menu = $(menu.call(jS));
							} else {
								menu = $(menu);
							}

							if (menu.is('ul')) {
								menu
									.find("ul").hide()
									.addClass(jS.theme.menuUl);

								menu
									.find("li")
									.addClass(jS.theme.menuLi)
									.hover(function () {
										$(this).find('ul:first')
											.hide()
											.show();
									}, function () {
										$(this).find('ul:first')
											.hide();
									});
							}
							return menu;
						}

						if (jS.isSheetEditable()) {
							if (s.menuLeft) {
								menuLeft = document.createElement('td');
								menuLeft.className = jS.cl.menu + ' ' + jS.cl.menuFixed + ' ' + jS.theme.menuFixed;
								firstRowTr.insertBefore(menuLeft, title);

								jS.controls.menuLeft[jS.i] = $(menuLeft)
									.append(makeMenu(s.menuLeft))
									.children()
									.addClass(jS.theme.menuFixed);

								jS.controls.menuLeft[jS.i].find('img').load(function () {
									jS.sheetSyncSize();
								});
							}

							if (s.menuRight) {
								menuRight = document.createElement('td');
								menuRight.className = jS.cl.menu + ' ' + jS.cl.menuFixed;
								firstRowTr.appendChild(menuRight);

								jS.controls.menuRight[jS.i] = $(menuRight)
									.append(makeMenu(s.menuRight))
									.children()
									.addClass(jS.theme.menuFixed);

								jS.controls.menuRight[jS.i].find('img').load(function () {
									jS.sheetSyncSize();
								});
							}

							label = document.createElement('td');
							label.className = jS.cl.label + ' ' + jS.theme.control;
							jS.controls.label = $(label);

							//Edit box menu
							formula = document.createElement('textarea');
							formula.className = jS.cl.formula + ' ' + jS.theme.controlTextBox;
							formula.onkeydown = jS.evt.formula.keydown;
							formula.onkeyup = function () {
								jS.obj.inPlaceEdit().value = this.value;
							};
							formula.onchange = function () {
								jS.obj.inPlaceEdit().value = this.value;
							};
							formula.onpaste = jS.evt.pasteOverCells;
							formula.onfocus = function () {
								jS.setNav(false);
							};
							formula.onfocusout = function () {
								jS.setNav(true);
							};
							formula.onblur = function () {
								jS.setNav(true);
							};
							jS.controls.formula = $(formula);

							// resizable formula area - a bit hard to grab the handle but is there!
							var formulaResize = document.createElement('span');
							formulaResize.appendChild(formula);

							secondRow = document.createElement('table');
							secondRowTr = document.createElement('tr');
							secondRow.appendChild(secondRowTr);

							header.appendChild(secondRow);


							formulaParent = document.createElement('td');
							formulaParent.className = jS.cl.formulaParent;
							formulaParent.appendChild(formulaResize);
							secondRowTr.appendChild(label);
							secondRowTr.appendChild(formulaParent);

							//spacer
							secondRowTr.appendChild(document.createElement('td'));

							jS.resizableSheet($(formulaResize), {
								minHeight:jS.controls.formula.height(),
								maxHeight:78,
								handles:'s',
								resize:function (e, ui) {
									jS.controls.formula.height(ui.size.height);
								},
								stop: function() {
									jS.sheetSyncSize();
								}
							});

							var instance = $.sheet.instance;
							for(var i = 0; i < instance.length; i++) {
								(instance || {}).nav = false;
							}

							jS.setNav(true);

							$(document).keydown(jS.evt.document.keydown);
						}

						return header;
					},

					/**
					 * Creates the user interface for spreadsheets
					 * @memberOf jS.controlFactory
					 */
					ui:function () {
						var ui = document.createElement('div');
						ui.setAttribute('class', jS.cl.ui);
						jS.obj.ui = ui;
						return ui;
					},

					sheetAdder: function () {
						var addSheet = document.createElement('span');
						if (jS.isSheetEditable()) {
							addSheet.setAttribute('class', jS.cl.sheetAdder + ' ' + jS.cl.tab + ' ' + jS.theme.tab);
							addSheet.setAttribute('title', jS.msg.addSheet);
							addSheet.innerHTML = '+';
							addSheet.onmousedown = function () {
								jS.addSheet();

								return false;
							};
							addSheet.i = -1;
						}
						return jS.controls.sheetAdder = $(addSheet);
					},

					/**
					 * Creates the tab interface for spreadsheets
					 * @memberOf jS.controlFactory
					 */
					tabContainer:function () {
						var tabContainer = document.createElement('span'),
							startPosition;
						tabContainer.setAttribute('class', jS.cl.tabContainer);

						tabContainer.onmousedown = function (e) {
							e = e || window.event;

							var i = (e.target || e.srcElement).i;
							if (i >= 0) {
								jS.trigger('sheetSwitch', [i]);
							}
							return false;
						};
						tabContainer.ondblclick = function (e) {
							e = e || window.event;
							var i = (e.target || e.srcElement).i;
							if (i >= 0) {
								jS.trigger('sheetRename', [i]);
							}
							return false;
						};


						if (jS.isSheetEditable() && $.fn.sortable) {
							return jS.controls.tabContainer = $(tabContainer).sortable({
								placeholder:'ui-state-highlight',
								axis:'x',
								forceHelperSize:true,
								forcePlaceholderSize:true,
								opacity:0.6,
								start:function (e, ui) {
									startPosition = ui.item.index();
									jS.trigger('sheetTabSortStart', [e, ui]);
								},
								update:function (e, ui) {
									jS.trigger('sheetTabSortUpdate', [e, ui, startPosition]);
								}
							});
						}

						return jS.controls.tabContainer = $(tabContainer);
					},

					/**
					 * Creates the spreadsheet user interface
					 * @param {HTMLElement} ui raw user interface
					 * @param {HTMLElement} table raw table
					 * @param {Number} i the new count for spreadsheets in this instance
					 * @memberOf jS.controlFactory
					 */
					sheetUI:function (ui, table, i) {
						jS.i = i;

						jS.tuneTableForSheetUse(table);

						jS.readOnly[i] = (table.className || '').match(/\breadonly\b/i) != null;

						var hasChildren = table.tBody.children.length > 0,
							enclosure = jS.controlFactory.enclosure(table),
							settings = jS.s,
							hiddenRows = settings.hiddenRows[i],
							hiddenColumns = settings.hiddenColumns[i],
							pane = enclosure.pane,
							$pane = $(pane),
							paneContextmenuEvent = function (e) {
								e = e || window.event;
								if (jS.isBusy()) {
									return false;
								}
								if (jS.isBar(e.target)) {
									var entity = e.target.entity,
										i = jS.getBarIndex[entity](e.target);

									if (i < 0) return false;

									if (jS.evt.barInteraction.first == jS.evt.barInteraction.last) {
										jS.controlFactory.barMenu[entity](e, i);
									}
								} else {
									jS.controlFactory.tdMenu(e);
								}
								return false;
							};

						ui.appendChild(enclosure);

						jS.controlFactory.barTop(table);
						jS.controlFactory.barLeft(table);

						pane.appendChild(table);

						if (jS.isSheetEditable()) {
							jS.controlFactory.autoFiller(pane);
						}

						if (jS.isSheetEditable()) {
							var formula = jS.obj.formula(),
								mouseDownEntity = "";

							$pane.mousedown(function (e) {
								jS.setNav(true);
								if (jS.isBusy()) {
									return false;
								}

								if (jS.isCell(e.target)) {
									if (e.button == 2) {
										paneContextmenuEvent.call(this, e);
										jS.evt.cellOnMouseDown(e);
										return true;
									}
									jS.evt.cellOnMouseDown(e);
									return false;
								}

								if (jS.isBar(e.target)) { //possibly a bar
									if (e.button == 2) {
										paneContextmenuEvent.call(this, e);
									}
									mouseDownEntity = e.target.entity;
									jS.evt.barInteraction.select(e.target);
									return false;
								}

								return true;
							});

							pane.onmouseup = function() {
								mouseDownEntity = "";
							};

							pane.onmouseover = function (e) {
								e = e || window.event;

								var target = e.target || e.srcElement;

								//This manages bar resize, bar menu, and bar selection
								if (jS.isBusy()) {
									return false;
								}

								if (!jS.isBar(target)) {
									return false;
								}
								var bar = $(target),
									entity = target.entity,
									i = jS.getBarIndex[entity](target);

								if (i < 0) {
									return false;
								}

								if (jS.evt.barInteraction.selecting && entity == mouseDownEntity) {
									jS.evt.barInteraction.last = i;

									jS.cellSetActiveBar(entity, jS.evt.barInteraction.first, jS.evt.barInteraction.last);
								} else {
									jS.resizeBar[entity](bar, i, pane, table);

									if (jS.isSheetEditable()) {
										jS.controlFactory.barHandleFreeze[entity](pane);

										if (entity == "top") {
											jS.controlFactory.barMenu[entity](e, i, bar);
										}
									}
								}

								return true;
							};

							pane.ondblclick = jS.evt.cellOnDblClick;

							$pane
								.bind('contextmenu', paneContextmenuEvent)
								.disableSelectionSpecial()
								.bind('cellEdit', jS.evt.cellEdit);
						}

						jS.createSpreadsheet(table, i);

						if (settings.loader !== null) {
							hiddenRows = settings.loader.hiddenRows(i);
							hiddenColumns = settings.loader.hiddenColumns(i);
						}

						else {
							hiddenRows = hiddenRows || null;
							hiddenColumns = hiddenColumns || null;

							if (hiddenRows === null || hiddenRows.length < 1) {
								hiddenRows = table.getAttribute('data-hiddenrows');

								if (hiddenRows !== null) {
									hiddenRows = arrHelpers.toNumbers(hiddenRows.split(','));
								}
							}

							if (hiddenColumns === null || hiddenColumns.length < 1) {
								hiddenColumns = table.getAttribute('data-hiddencolumns');

								if (hiddenColumns !== null) {
									hiddenColumns = arrHelpers.toNumbers(hiddenColumns.split(','));
								}
							}
						}

						if (settings.hiddenRows[i] === u) {
							settings.hiddenRows[i] = [];
						}
						if (settings.hiddenColumns[i] === u) {
							settings.hiddenColumns[i] = [];
						}

						//hide cells, if we use loader, it is done dynamically as the cells are built, otherwise it is done here
						enclosure.actionUI.hide(jS, hiddenColumns, s.loader === null ? hiddenRows : null);

						settings.hiddenRows[i] = hiddenRows;
						settings.hiddenColumns[i] = hiddenColumns;

						jS.checkMinSize(table);

						jS.controlFactory.tab();

						jS.setChanged(true);
					},

					/**
					 * The viewing console for spreadsheet
					 * @returns {*|jQuery|HTMLElement}
					 * @memberOf jS.controlFactory
					 */
					enclosure:function (table) {
						var enclosure = document.createElement('div'),
							$enclosure = $(enclosure),
							actionUI = new Sheet.ActionUI(enclosure, table, jS.cl.scroll, jS.s.frozenAt[jS.i], $.sheet.max),
							scrollUI = actionUI.scrollUI,
							pane = actionUI.pane,
							tBody = table.tBody,
							rows = tBody.children,
							columns = table.colGroup.children,
							scrollAction,
							lastScrollLeft = 0,
							lastScrollTop = 0,
							scrollLeft,
							scrollTop,
							xUpdated,
							yUpdated;

						table.size = function() { return jS.tableSize(table); };
						pane.size = function() { return jS.sheetSize(table); };

						pane.scrollToX = function () {
							//since you can only scroll one direction at a time, check that and if scrolled Y, then skip x
							if (yUpdated) return;

							xUpdated = false;
							scrollLeft = scrollUI.scrollLeft;
							if (lastScrollLeft !== scrollLeft) {
								lastScrollLeft = scrollLeft;
								xUpdated = actionUI.scrollToPixelX(scrollLeft);
							}
						};

						pane.scrollToY = function () {
							yUpdated = false;
							scrollTop = scrollUI.scrollTop;
							if (lastScrollTop !== scrollTop) {
								yUpdated = actionUI.scrollToPixelY(scrollTop, lastScrollTop > scrollTop);
								lastScrollTop = scrollTop;
							}
						};

						pane.updateX = function () {
							//since you can only scroll one direction at a time, check that and if scrolled Y, then skip x
							if (yUpdated) return;

							if (xUpdated) {
								jS.calcVisibleCol(actionUI);
							}
						};

						pane.updateY = function () {
							if (yUpdated) {
								jS.calcVisibleRow(actionUI);
								jS.updateYBarWidthToCorner(actionUI);
							}
						};

						pane.finishScroll = function () {
							if (xUpdated || yUpdated) {
								jS.obj.barHelper().remove();
								jS.autoFillerGoToTd();
								if (pane.inPlaceEdit) {
									pane.inPlaceEdit.goToTd();
								}
							}
						};

						scrollAction = [
							pane.updateY,
							pane.scrollToY,
							pane.updateX,
							pane.scrollToX,
							pane.finishScroll
						];

						//here we have two different types of functionality to cut down on logic between behaviours.
						scrollUI.onscroll = function () {
							this.scrollTop = 0;
							this.scrollLeft = 0;

							scrollUI.onscroll = function() {
								if (jS.isBusy()) return;
								thaw(scrollAction);
							}
						};

						scrollUI.onmousedown = function() {
							jS.obj.barHelper().remove();
						};

						enclosure.actionUI = pane.actionUI = actionUI;

						enclosure.scrollUI = pane.scrollUI = scrollUI;
						enclosure.appendChild(scrollUI);
						scrollUI.scrollTop = 0;
						scrollUI.scrollLeft = 0;

						pane.setAttribute('class', jS.cl.pane + ' ' + jS.theme.pane);
						enclosure.appendChild(pane);
						enclosure.setAttribute('class', jS.cl.enclosure);

						enclosure.pane = pane;
						enclosure.table = table;

						pane.table = table;
						pane.enclosure = enclosure;
						pane.$enclosure = $enclosure;

						table.pane = pane;
						table.enclosure = enclosure;
						table.$enclosure = $enclosure;

						jS.controls.pane[jS.i] = pane;
						jS.controls.panes = jS.obj.panes().add(pane);
						jS.controls.enclosure[jS.i] = $enclosure;
						jS.controls.enclosures = jS.obj.enclosures().add(enclosure);

						return enclosure;
					},

					/**
					 * Adds a tab for navigation to a spreadsheet
					 * @returns {Node|jQuery}
					 * @memberOf jS.controlFactory
					 */
					tab:function () {
						var tab = document.createElement('span'),
							$tab = jS.controls.tab[jS.i] = $(tab).appendTo(jS.obj.tabContainer());

						tab.setAttribute('class', jS.cl.tab + ' ' + jS.theme.tab);
						jS.sheetTab(true, function(sheetTitle) {
							tab.innerHTML = sheetTitle;
						});

						tab.i = jS.i;
						jS.controls.tabs = jS.obj.tabs().add($tab);

						return tab;
					},

					customTab: function(title) {
						var tab = document.createElement('span'),
							$tab = $(tab).appendTo(jS.obj.tabContainer());

						tab.setAttribute('class', jS.cl.tab + ' ' + jS.theme.tab);
						tab.innerHTML = title;

						return $tab;
					},

					/**
					 * Creates a textarea for a user to put a value in that floats on top of the current selected cell
					 * @param {jQuery|HTMLElement} td the td to be edited
					 * @param {Boolean} selected selects the text in the inline editor
					 * @memberOf jS.controlFactory
					 */
					inPlaceEdit:function (td, selected) {
						td = td || jS.obj.cellActive().td || null;

						if (td === null) {
							td = jS.rowTds(null, 1)[1];
							jS.cellEdit(td);
						}

						if (td === null) return;

						(jS.obj.inPlaceEdit().destroy || emptyFN)();

						var formula = jS.obj.formula(),
							val = formula.val(),
							textarea,
							$textarea,
							pane = jS.obj.pane();

						if (!td.isHighlighted) return; //If the td is a dud, we do not want a textarea

						textarea = document.createElement('textarea');
						$textarea = $(textarea);
						pane.inPlaceEdit = textarea;
						textarea.i = jS.i;
						textarea.className = jS.cl.inPlaceEdit + ' ' + jS.theme.inPlaceEdit;
						textarea.td = td;
						//td / tr / tbody / table
						textarea.table = td.parentNode.parentNode.parentNode;
						textarea.goToTd = function() {
							this.offset = $(td).position();
							if (!this.offset.left && !this.offset.right) {
								$(textarea).hide();
							} else {
								this.setAttribute('style',
									'left:' + (this.offset.left - 1) + 'px;' +
										'top:' + (this.offset.top - 1) + 'px;' +
										'width:' + this.td.clientWidth + 'px;' +
										'height:' + this.td.clientHeight + 'px;' +
										'min-width:' + this.td.clientWidth + 'px;' +
										'min-height:' + this.td.clientHeight + 'px;');
							}
						};
						textarea.goToTd();
						textarea.onkeydown = jS.evt.inPlaceEdit.keydown;
						textarea.onchange =
							textarea.onkeyup =
								function() { formula[0].value = textarea.value; };

						textarea.onfocus = function () { jS.setNav(false); };

						textarea.onblur =
							textarea.onfocusout =
								function () { jS.setNav(true); };

						textarea.onpaste = jS.evt.pasteOverCells;

						textarea.destroy = function () {
							pane.inPlaceEdit = null;
							jS.cellLast.isEdit = (textarea.value != val);
							textarea.parentNode.removeChild(textarea);
							jS.controls.inPlaceEdit[textarea.i] = false;
						};

						pane.appendChild(textarea);

						textarea.onfocus();

						jS.controls.inPlaceEdit[jS.i] = textarea;


						//This is a little trick to get the cursor to the end of the textarea
						$textarea
							.focus()
							.val('')
							.val(formula[0].value);

						if (selected) {
							$textarea.select();
						}

						//Make the textarea resizable automatically
						if ($.fn.elastic) {
							$(textarea).elastic();
						}
					},

					/**
					 * Created the autoFiller object
					 * @returns {*|jQuery|null}
					 * @memberOf jS.controlFactory
					 * @param {HTMLElement} pane
					 */
					autoFiller:function (pane) {
						if (!s.autoFiller) return false;

						var autoFiller = document.createElement('div'),
							handle = document.createElement('div'),
							cover = document.createElement('div');

						autoFiller.i = jS.i;

						autoFiller.className = jS.cl.autoFiller + ' ' + jS.theme.autoFiller;
						handle.className = jS.cl.autoFillerHandle;
						cover.className = jS.cl.autoFillerCover;

						autoFiller.onmousedown = function () {
							var td = jS.obj.tdActive();
							if (td) {
								var loc = jS.getTdLocation(td);
								jS.cellSetActive(td, loc, true, jS.autoFillerNotGroup, function () {
									var highlighted = jS.highlighted(),
										hLoc = jS.getTdLocation(highlighted.last());
									jS.fillUpOrDown(hLoc.row < loc.row || hLoc.col < loc.col);
									jS.autoFillerGoToTd(td);
									jS.autoFillerNotGroup = false;
								});
							}

							return false;
						};

						pane.autoFiller = jS.controls.autoFiller[jS.i] = $(autoFiller);
						pane.appendChild(autoFiller);
						return true;
					}
				},

				/**
				 * Allows grouping of cells
				 * @memberOf jS
				 */
				autoFillerNotGroup:true,


				tsv: new TSV(),
				/**
				 * Sends tab delimited string into cells, usually a paste from external spreadsheet application
				 * @param [oldVal] what formula should be when this is done working with all the values
				 * @returns {Boolean}
				 * @memberOf jS
				 */
				updateCellsAfterPasteToFormula:function (oldVal) {
					var newValCount = 0,
						formula = jS.obj.formula(),
						startCell = jS.cellLast;

					oldVal = oldVal || formula.val();

					var val = formula.val(), //once ctrl+v is hit formula now has the data we need
						firstValue = val;

					//at this point we need to check if there is even a cell selected, if not, we can't save the information, so clear formula editor
					if ((startCell.rowIndex == 0 && startCell.columnIndex == 0) || val.length === 0) {
						return false;
					}

					var parsedRows = jS.tsv.parse(val);

					//Single cell value
					if (!$.isArray(parsedRows)) {
						formula.val(parsedRows);
						jS.fillUpOrDown(false, parsedRows);
						return true;
					}

					var i = 0,
						j,
						parsedColumns,
						spreadsheet,
						row,
						cell;

					//values that need put into multi cells
					for (; i < parsedRows.length; i++) {
						startCell.isEdit = true;
						parsedColumns = parsedRows[i];
						for (j = 0; j < parsedColumns.length; j++) {
							newValCount++;

							if (
								!(spreadsheet = jS.spreadsheets[jS.i])
								|| !(row = spreadsheet[i + startCell.rowIndex])
								|| !(cell = row[j + startCell.columnIndex])
							) continue;

							if (cell) {
								(function(cell, parsedColumn) {
									s.parent.one('sheetPreCalculation', function () {
										if ((parsedColumn + '').charAt(0) == '=') { //we need to know if it's a formula here
											cell.formula = parsedColumn.substring(1);
											cell.value = '';
											cell.td.setAttribute('data-formula', parsedColumn);
										} else {
											cell.formula = '';
											cell.value = parsedColumn;
											cell.td.removeData('formula');
										}
									});
								})(cell, parsedColumns[j]);
								jS.resolveCell(cell);

								if (i == 0 && j == 0) { //we have to finish the current edit
									firstValue = parsedColumns[j];
								}
							}

						}
					}

					if (val != firstValue) {
						formula.val(firstValue);
					}

					jS.fillUpOrDown(false, firstValue);

					jS.evt.cellEditDone(true);

					return true;
				},

				/**
				 * Event handlers for instance
				 * @memberOf jS
				 * @namespace
				 */
				evt:{

					inPlaceEdit:{
						/**
						 *
						 * @param {Object} e jQuery event
						 * @returns {*}
						 * @memberOf jS.evt.inPlaceEdit
						 */
						enter:function (e) {
							if (e.shiftKey) {
								return true;
							}
							return jS.evt.cellSetActiveFromKeyCode(e, true);
						},

						/**
						 *
						 * @param {Object} e jQuery event
						 * @returns {*}
						 * @memberOf jS.evt.inPlaceEdit
						 */
						tab:function (e) {
							if (e.shiftKey) {
								return true;
							}
							return jS.evt.cellSetActiveFromKeyCode(e, true);
						},
						/**
						 * Edits the textarea that appears over cells for in place edit
						 * @param {Object} e jQuery event
						 * @returns {*}
						 * @memberOf jS.evt.inPlaceEdit
						 */
						keydown:function (e) {
							e = e || window.event;
							jS.trigger('sheetFormulaKeydown', [true]);

							switch (e.keyCode) {
								case key.ENTER:
									return jS.evt.inPlaceEdit.enter(e);
									break;
								case key.TAB:
									return jS.evt.inPlaceEdit.tab(e);
									break;
								case key.ESCAPE:
									jS.evt.cellEditAbandon();
									return false;
									break;
							}
						}
					},

					formula:{
						/**
						 *
						 * @param {Object} e jQuery event
						 * @returns {*}
						 * @memberOf jS.evt.formula
						 */
						keydown:function (e) {
							e = e || window.event;
							if (jS.readOnly[jS.i]) return false;
							if (jS.cellLast !== null && (jS.cellLast.rowIndex < 0 || jS.cellLast.columnIndex < 0)) return false;

							jS.trigger('sheetFormulaKeydown', [false]);

							switch (e.keyCode) {
								case key.C:
									if (e.ctrlKey) {
										return jS.evt.document.copy(e);
									}
								case key.X:
									if (e.ctrlKey) {
										return jS.evt.document.cut(e);
									}
								case key.Y:
									if (e.ctrlKey) {
										jS.evt.document.redo(e);
										return false;
									}
									break;
								case key.Z:
									if (e.ctrlKey) {
										jS.evt.document.undo(e);
										return false;
									}
									break;
								case key.ESCAPE:
									jS.evt.cellEditAbandon();
									return true;
									break;
								case key.ENTER:
									jS.evt.cellSetActiveFromKeyCode(e, true);
									return false;
									break;
								case key.UNKNOWN:
									return false;
							}

							jS.cellLast.isEdit = true;
						},

						/**
						 * Helper for events
						 * @param {Boolean} ifTrue
						 * @param e {Object} jQuery event
						 * @returns {*}
						 * @memberOf jS.evt.keydownHandler
						 */
						If:function (ifTrue, e) {
							if (ifTrue) {
								$(jS.obj.tdActive()).dblclick();
								return true;
							}
							return false;
						}
					},

					/**
					 * Key down handlers
					 * @memberOf jS.evt
					 */
					document:{
						/**
						 *
						 * @param {Object} e jQuery event
						 * @returns {*}
						 * @memberOf jS.evt.document
						 */
						enter:function (e) {
							if (!jS.cellLast.isEdit && !e.ctrlKey) {
								$(jS.obj.tdActive()).dblclick();
							}
							return false;
						},

						/**
						 *
						 * @param {Object} e jQuery event
						 * @returns {*}
						 * @memberOf jS.evt.document
						 */
						tab:function (e) {
							jS.evt.cellSetActiveFromKeyCode(e);
						},

						/**
						 *
						 * @param {Object} e jQuery event
						 * @returns {*}
						 * @memberOf jS.evt.document
						 */
						findCell:function (e) {
							if (e.ctrlKey) {
								jS.cellFind();
								return false;
							}
							return true;
						},

						/**
						 *
						 * @param {Object} e jQuery event
						 * @returns {*}
						 * @memberOf jS.evt.document
						 */
						redo:function (e) {
							if (e.ctrlKey && !jS.cellLast.isEdit) {
								jS.undo.manager.redo();
								return false;
							}
							return true;
						},

						/**
						 *
						 * @param {Object} e jQuery event
						 * @returns {*}
						 * @memberOf jS.evt.document
						 */
						undo:function (e) {
							if (e.ctrlKey && !jS.cellLast.isEdit) {
								jS.undo.manager.undo();
								return false;
							}
							return true;
						},

						/**
						 * Copy what is in the highlighted tds
						 * @param [e]
						 * @param [clearValue]
						 * @returns {Boolean}
						 */
						copy:function (e, clearValue) {
							var tds = jS.highlighted(true),
								formula = jS.obj.formula(),
								oldValue = formula.val(),
								cellsTsv = jS.toTsv(tds, clearValue);

							formula
								.val(cellsTsv)
								.focus()
								.select();

							$document
								.one('keyup', function () {
									if (clearValue) {
										formula.val('');
									} else {
										formula.val(oldValue);
									}
								});

							return true;
						},

						cut:function (e) {
							return this.copy(e, true);
						},

						/**
						 * Manages the page up and down buttons
						 * @param {Boolean} [reverse] Go up or down
						 * @returns {Boolean}
						 * @memberOf jS.evt.document
						 */
						pageUpDown:function (reverse) {
							var size = jS.sheetSize(),
								pane = jS.obj.pane(),
								paneHeight = pane.clientHeight,
								prevRowsHeights = 0,
								thisRowHeight = 0,
								td,
								i;
							//TODO: refactor to use scroll position
							if (reverse) { //go up
								for (i = jS.cellLast.rowIndex; i > 0 && prevRowsHeights < paneHeight; i--) {
									td = jS.getTd(-1, i, 1);
									if (td !== null && !td.getAttribute('data-hidden') && $(td).is(':hidden')) $(td).show();
									prevRowsHeights += td.parentNode.clientHeight;
								}
							} else { //go down
								for (i = jS.cellLast.rowIndex; i < size.rows && prevRowsHeights < paneHeight; i++) {
									td = jS.getTd(-1, i, 1);
									if (td === null) continue;
									prevRowsHeights += td.parentNode.clientHeight;
								}
							}
							jS.cellEdit(td);

							return false;
						},

						/**
						 *
						 * @param {Object} e jQuery event
						 * @returns {*}
						 * @memberOf jS.evt.document
						 */
						keydown:function (e) {
							e = e || window.event;
							if (jS.readOnly[jS.i]) return false;
							if (jS.cellLast !== null && (jS.cellLast.rowIndex < 0 || jS.cellLast.columnIndex < 0)) return false;
							var td = jS.cellLast.td;

							if (jS.nav) {
								//noinspection FallthroughInSwitchStatementJS
								switch (e.keyCode) {
									case key.DELETE:
										jS.toTsv(null, true);
										jS.obj.formula().val('');
										break;
									case key.TAB:
										jS.evt.document.tab(e);
										break;
									case key.ENTER:
										jS.evt.cellSetActiveFromKeyCode(e);
										break;
									case key.LEFT:
									case key.UP:
									case key.RIGHT:
									case key.DOWN:
										(e.shiftKey ? jS.evt.cellSetHighlightFromKeyCode(e) : jS.evt.cellSetActiveFromKeyCode(e));
										break;
									case key.PAGE_UP:
										jS.evt.document.pageUpDown(true);
										break;
									case key.PAGE_DOWN:
										jS.evt.document.pageUpDown();
										break;
									case key.HOME:
									case key.END:
										jS.evt.cellSetActiveFromKeyCode(e);
										break;
									case key.V:
										if (e.ctrlKey) {
											return jS.evt.formula.If(!jS.evt.pasteOverCells(e), e);
										} else {
											$(td).trigger('cellEdit');
											return true;
										}
										break;
									case key.Y:
										if (e.ctrlKey) {
											jS.evt.document.redo(e);
											return false;
										} else {
											$(td).trigger('cellEdit');
											return true;
										}
										break;
									case key.Z:
										if (e.ctrlKey) {
											jS.evt.document.undo(e);
											return false;
										} else {
											$(td).trigger('cellEdit');
											return true;
										}
										break;
									case key.ESCAPE:
										jS.evt.cellEditAbandon();
										break;
									case key.F:
										if (e.ctrlKey) {
											return jS.evt.formula.If(jS.evt.document.findCell(e), e);
										} else {
											$(td).trigger('cellEdit');
											return true;
										}
										break;
									case key.CAPS_LOCK:
									case key.SHIFT:
									case key.ALT:
										break;
									case key.CONTROL: //we need to filter these to keep cell state
										jS.obj.formula().focus().select();
										return true;
										break;
									default:
										if (jS.obj.inPlaceEdit().td !== td) {
											$(td).trigger('cellEdit');
										}
										return true;
										break;
								}
								return false;
							}
						}
					},

					/**
					 * Used for pasting from other spreadsheets
					 * @param {Object} e jQuery event
					 * @returns {Boolean}
					 * @memberOf jS.evt
					 */
					pasteOverCells:function (e) {
						e = e || window.event;
						if (e.ctrlKey || e.type == "paste") {
							var fnAfter = function () {
								jS.updateCellsAfterPasteToFormula();
							};

							var $doc = $document
								.one('keyup', function () {
									fnAfter();
									fnAfter = function () {
									};
									$doc.mouseup();
								})
								.one('mouseup', function () {
									fnAfter();
									fnAfter = function () {
									};
									$doc.keyup();
								});

							jS.setDirty(true);
							jS.setChanged(true);
							return true;
						}

						return false;
					},

					/**
					 * Updates a cell after edit afterward event "sheetCellEdited" is called w/ params (td, row, col, spreadsheetIndex, sheetIndex)
					 * @param {Boolean} [force] if set to true forces a calculation of the selected sheet
					 * @memberOf jS.evt
					 */
					cellEditDone:function (force) {
						var inPlaceEdit = jS.obj.inPlaceEdit(),
							inPlaceEditHasFocus = $(inPlaceEdit).is(':focus'),
							cell = jS.cellLast;

						(jS.obj.inPlaceEdit().destroy || emptyFN)();
						if (cell !== null && (cell.isEdit || force)) {
							var formula = (inPlaceEditHasFocus ? $(inPlaceEdit) : jS.obj.formula()),
								td = cell.td;

							if (jS.isFormulaEditable(td)) {
								//Lets ensure that the cell being edited is actually active
								if (td && jS.cellLast.rowIndex > 0 && jS.cellLast.columnIndex > 0) {

									//This should return either a val from textbox or formula, but if fails it tries once more from formula.
									var v = formula.val(),
										i = 0,
										loader = s.loader,
										loadedFrom;

									if (!cell.edited) {
										cell.edited = true;
										jS.obj.cellsEdited().push(cell);
									}

									s.parent.one('sheetPreCalculation', function () {
										//reset formula to null so it can be re-evaluated
										cell.parsedFormula = null;
										if (v.charAt(0) == '=') {
											td.setAttribute('data-formula', v);
											//change only formula, previous value will be stored and recalculated momentarily
											cell.formula = v;
										} else {
											td.removeAttribute('data-formula');
											cell.value = v;
											cell.formula = '';

											if ((loadedFrom = cell.loadedFrom) !== null) {
												loader.setCellAttributes(loadedFrom, {
													'cache': u,
													'formula': '',
													'value': v
												});
											}
										}

										cell.setNeedsUpdated();
									});
									jS.resolveCell(cell);

									//formula.focus().select();
									jS.cellLast.isEdit = false;

									//perform final function call
									jS.trigger('sheetCellEdited', [cell]);
								}
							}
						}
					},

					/**
					 * Abandons a cell edit
					 * @param {Boolean} [skipCalc] if set to true will skip sheet calculation;
					 * @memberOf jS.evt
					 */
					cellEditAbandon:function (skipCalc) {
						(jS.obj.inPlaceEdit().destroy || emptyFN)();

						jS.highlighter
							.clearBar()
							.clear();

						if (!skipCalc) {
							jS.calc();
						}

						jS.cellLast = null;
						jS.rowLast = 0;
						jS.colLast = 0;
						jS.highlighter.startRowIndex = 0;
						jS.highlighter.startColumnIndex = 0;
						jS.highlighter.endRowIndex = 0;
						jS.highlighter.endColumnIndex = 0;

						jS.labelUpdate('');
						jS.obj.formula()
							.val('')
							.blur();

						jS.autoFillerHide();

						return false;
					},


					/**
					 * Highlights a cell from a key code
					 * @param {Object} e jQuery event
					 * @returns {Boolean}
					 * @memberOf jS.evt
					 */
					cellSetHighlightFromKeyCode:function (e) {
						var grid = jS.orderedGrid(jS.highlighter),
							size = jS.sheetSize(),
							cellActive = jS.cellActive,
							highlighter = jS.highlighter;

						if (cellActive === null) return false;

						switch (e.keyCode) {
							case key.UP:
								if (grid.startRowIndex < cellActive.rowIndex) {
									grid.startRowIndex--;
									grid.startRowIndex = grid.startRowIndex > 0 ? grid.startRowIndex : 1;
									break;
								}

								grid.endRowIndex--;
								grid.endRowIndex = grid.endRowIndex > 0 ? grid.endRowIndex : 1;

								break;
							case key.DOWN:
								//just beginning the highlight
								if (grid.startRowIndex === grid.endRowIndex) {
									grid.startRowIndex++;
									grid.startRowIndex = grid.startRowIndex < size.rows ? grid.startRowIndex : size.rows;
									break;
								}

								//if the highlight is above the active cell, then we have selected up and need to move down
								if (grid.startRowIndex < cell.rowIndex) {
									grid.startRowIndex++;
									grid.startRowIndex = grid.startRowIndex > 0 ? grid.startRowIndex : 1;
									break;
								}

								//otherwise we increment the row, and limit it to the size of the total grid
								grid.endRowIndex++;
								grid.endRowIndex = grid.endRowIndex < size.rows ? grid.endRowIndex : size.rows;

								break;
							case key.LEFT:
								if (grid.startColumnIndex < cell.columnIndex) {
									grid.startColumnIndex--;
									grid.startColumnIndex = grid.startColumnIndex > 0 ? grid.startColumnIndex : 1;
									break;
								}

								grid.endColumnIndex--;
								grid.endColumnIndex = grid.endColumnIndex > 0 ? grid.endColumnIndex : 1;

								break;
							case key.RIGHT:
								if (grid.startColumnIndex < cell.columnIndex) {
									grid.startColumnIndex++;
									grid.startColumnIndex = grid.startColumnIndex < size.cols ? grid.startColumnIndex : size.cols;
									break;
								}

								grid.endColumnIndex++;
								grid.endColumnIndex = grid.endColumnIndex < size.cols ? grid.endColumnIndex : size.cols;

								break;
						}

						//highlight the cells
						highlighter.startRowIndex = grid.startRowIndex;
						highlighter.startColumnIndex = grid.startColumnIndex;
						highlighter.endRowIndex = grid.endRowIndex;
						highlighter.endColumnIndex = grid.endColumnIndex;

						jS.cycleCellArea(function (o) {
							highlighter.set(o.td);
						}, grid);

						return false;
					},


					/**
					 * Activates a cell from a key code
					 * @param {Object} e jQuery event
					 * @param {Boolean} [skipMove]
					 * @returns {Boolean}
					 * @memberOf jS.evt
					 */
					cellSetActiveFromKeyCode:function (e, skipMove) {
						if (jS.cellLast === null) return false;

						var cell = jS.cellLast,
							loc = {
								rowIndex: cell.rowIndex,
								columnIndex: cell.columnIndex
							},
							spreadsheet,
							row,
							nextCell,
							overrideIsEdit = false,
							highlighted,
							doNotClearHighlighted = false;

						switch (e.keyCode) {
							case key.UP:
								loc.rowIndex--;
								break;
							case key.DOWN:
								loc.rowIndex++;
								break;
							case key.LEFT:
								loc.columnIndex--;
								break;
							case key.RIGHT:
								loc.columnIndex++;
								break;
							case key.ENTER:
								loc = jS.evt.incrementAndStayInGrid(jS.orderedGrid(jS.highlighter), loc, true, e.shiftKey);
								overrideIsEdit = true;
								highlighted = jS.highlighted();
								if (highlighted.length > 1) {
									doNotClearHighlighted = true;
								} else {
									if (!skipMove) {
										loc.rowIndex += (e.shiftKey ? -1 : 1);
									}
									if (s.autoAddCells && loc.rowIndex > jS.sheetSize(e.target.table).rows) {
										jS.controlFactory.addRow();
									}
								}
								break;
							case key.TAB:
								loc = jS.evt.incrementAndStayInGrid(jS.orderedGrid(jS.highlighter), loc, false, e.shiftKey);
								overrideIsEdit = true;
								highlighted = jS.highlighted();
								if (highlighted.length > 1) {
									doNotClearHighlighted = true;
								} else {
									if (!skipMove) {
										loc.columnIndex += (e.shiftKey ? -1 : 1);
									}
									if (s.autoAddCells && loc.columnIndex > jS.sheetSize(e.target.table).cols) {
										jS.controlFactory.addColumn();
									}
								}
								break;
							case key.HOME:
								loc.columnIndex = 1;
								break;
							case key.END:
								loc.columnIndex = jS.obj.tdActive().parentNode.children.length - 2;
								break;
						}

						//we check here and make sure all values are above 0, so that we get a selected cell
						loc.columnIndex = loc.columnIndex || 1;
						loc.rowIndex = loc.rowIndex || 1;

						//to get the td could possibly make keystrokes slow, we prevent it here so the user doesn't even know we are listening ;)
						if (!cell.isEdit || overrideIsEdit) {
							//get the td that we want to go to
							if ((spreadsheet = jS.spreadsheets[jS.i]) === u) return false;
							if ((row = spreadsheet[loc.rowIndex]) === u) return false;
							if ((nextCell = row[loc.columnIndex]) === u) return false;

							//if the td exists, lets go to it
							if (nextCell !== null) {
								jS.cellEdit(nextCell.td, null, doNotClearHighlighted);
								return false;
							}
						}
						//default, can be overridden above
						return true;
					},

					/**
					 * Calculate position for either horizontal movement or vertical movement within a grid, both forward and reverse
					 * @param {Object} grid
					 * @param {Object} loc
					 * @param {Boolean} isRows
					 * @param {Boolean} reverse
					 * @returns {Object} loc
					 * @memberOf jS.evt
					 */
					incrementAndStayInGrid: function (grid, loc, isRows, reverse) {
						if (isRows) {
							if (reverse) {
								loc.rowIndex--;
								if (loc.rowIndex < grid.startRowIndex) {
									loc.rowIndex = grid.endRowIndex;
									loc.columnIndex--;
								}
								if (loc.columnIndex < grid.startColumnIndex) {
									loc.columnIndex = grid.endColumnIndex;
								}
							} else {
								loc.rowIndex++;
								if (loc.rowIndex > grid.endRowIndex) {
									loc.rowIndex = grid.startRowIndex;
									loc.columnIndex++;
								}
								if (loc.columnIndex > grid.endColumnIndex) {
									loc.columnIndex = grid.startColumnIndex;
								}
							}
						}
						else {
							if (reverse) {
								loc.columnIndex--;
								if (loc.columnIndex < grid.startColumnIndex) {
									loc.columnIndex = grid.endColumnIndex;
									loc.rowIndex--;
								}
								if (loc.rowIndex < grid.startRowIndex) {
									loc.rowIndex = grid.endRowIndex;
								}
							} else {
								loc.columnIndex++;
								if (loc.columnIndex > grid.endColumnIndex) {
									loc.columnIndex = grid.startColumnIndex;
									loc.rowIndex++;
								}
								if (loc.rowIndex > grid.endRowIndex) {
									loc.rowIndex = grid.startRowIndex;
								}
							}
						}
						return loc;
					},

					/**
					 * Cell on mouse down
					 * @param {Object} e jQuery event
					 * @memberOf jS.evt
					 */
					cellOnMouseDown:function (e) {


						jS.obj.formula().blur();
						if (e.shiftKey) {
							jS.getTdRange(e, jS.obj.formula().val());
						} else {
							jS.cellEdit(e.target, true);
						}
					},

					/**
					 * Cell on double click
					 * @param {Object} e jQuery event
					 * @memberOf jS.evt
					 */
					cellOnDblClick:function (e) {
						if (jS.isBusy()) {
							return false;
						}

						jS.controlFactory.inPlaceEdit();

						return true;
					},

					cellEdit: function(e) {
						if (jS.isBusy()) {
							return false;
						}

						jS.controlFactory.inPlaceEdit(null, true);

						return true;
					},

					/**
					 * Handles bar events, used for highlighting and activating
					 * @memberOf jS.evt
					 * @namespace
					 */
					barInteraction:{

						/**
						 * The first bar that received the event (mousedown)
						 * @memberOf jS.evt.barInteraction
						 */
						first:0,

						/**
						 * The last bar that received the event (mousedown)
						 * @memberOf jS.evt.barInteraction
						 */
						last:0,

						/**
						 * Tracks if we are in select mode
						 * @memberOf jS.evt.barInteraction
						 */
						selecting:false,

						/**
						 * Manages the bar selection
						 * @param {Object} o target
						 * @returns {*}
						 * @memberOf jS.evt.barInteraction
						 */
						select:function (o) {
							if (!o) return;
							if (!o.type == 'bar') return;
							var entity = o.entity, //returns "top" or "left";
								i = jS.getBarIndex[entity](o);

							if (i < 0) return false;

							jS[entity + 'Last'] = i; //keep track of last column for inserting new columns
							jS.evt.barInteraction.last = jS.evt.barInteraction.first = i;

							jS.cellSetActiveBar(entity, jS.evt.barInteraction.first, jS.evt.barInteraction.last);
							jS.evt.barInteraction.first = jS.evt.barInteraction.last = jS[entity + 'Last'] = i;

							jS.evt.barInteraction.selecting = true;
							$document
								.one('mouseup', function () {
									jS.evt.barInteraction.selecting = false;
								});

							return false;
						}
					}
				},

				/**
				 *
				 * @param {Number} start index to start from
				 * @memberOf jS
				 */
				refreshColumnLabels:function (start) {
					start = start || 0;

					var $barMenuParentTop = jS.obj.barMenuParentTop();
					if (($barMenuParentTop) && ($barMenuParentTop.length)){
						var barMenuParentTop = $barMenuParentTop.get(0);
						if ($.isFunction(barMenuParentTop.destroy)) { 
							barMenuParentTop.destroy(); 
						}
					}

					var ths = jS.controls.bar.x.th[jS.i],
						th;

					if (!ths) return;

					for (var i = Math.max(start, 0); i < ths.length; i++) {
						//greater than 1 (corner)
						if (i > 0) {
							th = ths[i];
							th.innerHTML = th.label = jSE.columnLabelString(th.cellIndex);
						}
					}
				},


				/**
				 *
				 * @param {Number} start index to start from
				 * @param {Number} [end] index to end at
				 * @memberOf jS
				 */
				refreshRowLabels:function (start, end) {
					start = start || 0;

					var ths = jS.controls.bar.y.th[jS.i],
						th;

					if (!ths) return;

					end = end || ths.length;

					for (var i = start; i < end; i++) {
						if (i > 0) {
							th = ths[i];
							th.innerHTML = th.label = th.parentNode.rowIndex;
						}
					}
				},

				/**
				 * Detects if an object is a td within a spreadsheet's table
				 * @param {jQuery|HTMLElement} o target
				 * @returns {Boolean}
				 * @memberOf jS
				 */
				isCell:function (o) {
					if (o && o.jSCell !== u) {
						return true;
					}
					return false;
				},

				/**
				 * Detects if an object is a bar td within a spreadsheet's table
				 * @param {jQuery|HTMLElement} o target
				 * @returns {Boolean}
				 * @memberOf jS
				 */
				isBar:function (o) {
					if (o && o.tagName && o.tagName == 'TH' && o.type && o.type == 'bar') {
						return true;
					}
					return false;
				},

				/**
				 * Tracks read state of spreadsheet
				 * @memberOf jS
				 */
				readOnly:[],

				/**
				 * Detects read state of a spreadsheet
				 * @param {Number} [i] index of spreadsheet within instance
				 * @returns {Boolean}
				 * @memberOf jS
				 */
				isSheetEditable:function (i) {
					i = i || jS.i;
					return (
						s.editable == true && !jS.readOnly[i]
						);
				},

				/**
				 * Detects read state of formula of an object
				 * @param {jQuery|HTMLElement} o target
				 * @returns {Boolean}
				 * @memberOf jS
				 */
				isFormulaEditable:function (o) {
					if (s.lockFormulas) {
						if (o.data('formula') !== u) {
							return false;
						}
					}
					return true;
				},

				/**
				 * Toggles full screen mode
				 * @memberOf jS
				 */
				toggleFullScreen:function () {
					if (!jS) return;
					jS.evt.cellEditDone();
					var fullScreen = jS.obj.fullScreen(),
						pane = jS.obj.pane();
					if (fullScreen.is(':visible')) {
						$window.unbind('jSResize');
						$body.removeClass('bodyNoScroll');
						s.parent = fullScreen[0].origParent;

						s.parent.prepend(fullScreen.children());

						fullScreen.remove();

						jS.sheetSyncSize();
						if (pane.inPlaceEdit) {
							pane.inPlaceEdit.goToTd();
						}
						jS.trigger('sheetFullScreen', [false]);
					} else { //here we make a full screen
						$body.addClass('bodyNoScroll');

						var parent = $(s.parent),
							fullScreen = document.createElement('div'),
							events = $._data(s.parent[0], 'events');

						fullScreen.className = jS.cl.fullScreen + ' ' + jS.theme.fullScreen + ' ' + jS.cl.parent;

						fullScreen.origParent = parent;
						s.parent = jS.controls.fullScreen = $(fullScreen)
							.append(parent.children())
							.appendTo($body);

						$window
							.bind('resize', function() {
								$window.trigger('jSResize');
							})
							.bind('jSResize', function () {
								this.w = $window.width();
								this.h = $window.height();
								s.parent
									.width(this.w)
									.height(this.h);

								jS.sheetSyncSize();
								if (pane.inPlaceEdit) {
									pane.inPlaceEdit.goToTd();
								}
							})
							.trigger('jSResize');


						parent.trigger('sheetFullScreen', [true]);

						for (var event in events) {
							for (var i = 0; i < events[event].length; i++) {
								s.parent.bind(event, events[event][i].handler);
							}
						}
					}
				},

				/**
				 * Assists in rename of spreadsheet
				 * @memberOf jS
				 */
				renameSheet:function (i) {
					if (n(i)) {
						return false;
					}

					if (i > -1) {
						jS.sheetTab();
					}

					return true;
				},

				/**
				 * Switches spreadsheet
				 * @param {Number} i index of spreadsheet within instance
				 * @memberOf jS
				 */
				switchSheet:function (i) {
					if (n(i)) {
						return false;
					}

					if (i == -1) {
						jS.addSheet();
					} else if (i != jS.i) {
						jS.setActiveSheet(i);
						if (s.loader === null) {
							jS.calc(i);
						}
					}

					return true;
				},

				/**
				 * Makes table object usable by sheet
				 * @param {jQuery|HTMLElement} table
				 * @returns {*}
				 * @memberOf jS
				 */
				tuneTableForSheetUse:function (table) {
					var $table = $(table);
					jS.controls.table[jS.i] = $table
						.addClass(jS.cl.table)
						.addClass(jS.theme.table)
						.attr('id', jS.id + jS.i)
						.attr('border', '1px')
						.attr('cellpadding', '0')
						.attr('cellspacing', '0');

					table.spreadsheetIndex = jS.i;

					jS.formatTable(table);
					jS.sheetDecorateRemove(false, $table);

					jS.controls.tables = jS.obj.tables().add(table);

					//override frozenAt settings with table's data-frozenatrow and data-frozenatcol
					var frozenAtRow = $table.attr('data-frozenatrow') * 1,
						frozenAtCol = $table.attr('data-frozenatcol') * 1;

					if (!jS.s.frozenAt[jS.i]) jS.s.frozenAt[jS.i] = {row:0, col:0};
					if (frozenAtRow) jS.s.frozenAt[jS.i].row = frozenAtRow;
					if (frozenAtCol) jS.s.frozenAt[jS.i].col = frozenAtCol;
				},

				/**
				 * Cycles through all the td's and turns table into spreadsheet
				 * @param {HTMLElement} table spreadsheet
				 * @param {Number} i spreadsheet index within instance
				 * @memberOf jS
				 */
				createSpreadsheet:function (table, i) {
					this.createSpreadsheetForArea(table, i);
				},

				/**
				 * Cycles through all the td's and turns table into spreadsheet
				 * @param {HTMLElement} table spreadsheet
				 * @param {Number} i spreadsheet index within instance
				 * @param {Number} [rowStart]
				 * @param {Number} [rowEnd]
				 * @param {Number} [colStart]
				 * @param {Number} [colEnd]
				 * @memberOf jS
				 */
				createSpreadsheetForArea:function (table, i, rowStart, rowEnd, colStart, colEnd) {
					var rowIndex,
						tBody = table.tBody,
						columnIndex,
						loader = (s.loader !== null ? s.loader : null),
						standardHeight = s.colMargin + 'px',
						setRowHeight = (loader !== null ? loader.setRowHeight : function(sheetIndex, rowIndex, barTd) {
							var sibling,
								style,
								height = standardHeight;

							//This element is generated and needs to track the height of the item just before it
							if ((sibling = barTd.nextSibling) === u) return height;
							if ((style = sibling.style) === u) return height;
							if (style.height !== u) height = style.height;

							barTd.style.height = height;
						}),
						pane = table.pane,
						trChildren = tBody.children,
						tr,
						actionUI = pane.actionUI,
						detacher = actionUI.yDetacher,
						spreadsheet,
						row,
						cells,
						cell,
						qty,
						lastRowIndex,
						lastColumnIndex,
						tds,
						td;

					//if we are starting at the beginning of the spreadsheet, then we start from empty
					if (rowStart === u && colStart === u) {
						table.spreadsheet = jS.spreadsheets[i] = []; //reset the sheet's spreadsheet
					}

					spreadsheet = table.spreadsheet;

					rowStart = rowStart || 0;
					rowEnd = (rowEnd === u && s.loader === null ? trChildren.length - 1: rowEnd || 1);
					colStart = colStart || 0;
					colEnd = (colEnd === u && s.loader === null ? trChildren[0].children.length - 1: colEnd || 1);

					rowIndex = rowStart;

					for (;rowIndex <= rowEnd; rowIndex++) {
						row = spreadsheet[rowIndex];
						columnIndex = colStart;
						if (row === u) {
							if (createCellsIfNeeded) {
								lastRowIndex = (spreadsheet.length > 0 ? spreadsheet.length - 1 : 0);
								qty = rowIndex - lastRowIndex;
								jS.controlFactory.addCells(lastRowIndex, false, (qty > 0 ? qty : 1), 'row-init');
								row = spreadsheet[rowIndex];
							} else {
								row = spreadsheet[rowIndex] = [];
							}
						}

						columnIndex = colStart;
						for (;columnIndex <= colEnd;columnIndex++) {
							if (rowIndex > 0 && columnIndex > 0) {
								cell = row[columnIndex];

								if (cell === u) {
									if (createCellsIfNeeded) {
										lastColumnIndex = (row.length > 0 ? row.length - 1 : 0);
										qty = columnIndex - lastColumnIndex;
										jS.controlFactory.addCells(row.length - 1, false, qty > 0 ? qty : 1, 'col-init');
										cell = row[columnIndex];
									} else {
										jS.createCell(i, rowIndex, columnIndex);
										cell = row[columnIndex];
										cell.needsUpdated = true;
									}
								} else {
									cell.updateValue();
								}
							} else {
								tr = trChildren[rowIndex];
								td = (tr !== u && tr.children.length > columnIndex ? tr.children[columnIndex] : null);
								if (td !== null) {
									if (columnIndex == 0 && rowIndex > 0) { //barleft
										td.type = 'bar';
										td.entity = 'left';
										td.innerHTML = rowIndex;
										td.className = jS.cl.barLeft + ' ' + jS.cl.barLeft + '_' + jS.i + ' ' + jS.theme.bar;

										if (setRowHeight !== u) {
											setRowHeight.call(loader, i, rowIndex, td);
										}
									}

									if (rowIndex == 0 && columnIndex > 0) { //bartop
										td.type = 'bar';
										td.entity = 'top';
										td.innerHTML = jSE.columnLabelString(columnIndex);
										td.className = jS.cl.barTop + ' ' + jS.cl.barTop + '_' + jS.i + ' ' + jS.theme.bar;
									}

									if (rowIndex == 0 && columnIndex == 0) { //corner
										td.type = 'bar';
										td.entity = 'corner';
										td.className = jS.theme.bar + ' ' + jS.cl.barCorner;
										jS.controls.bar.corner[jS.i] = td;
									}
								}
							}
						}
					}
				},
				updateYBarWidthToCorner: function(actionUI) {
					var scrolledArea = actionUI.scrolledArea,
						table = actionUI.table,
						tBody = table.tBody,
						corner = table.corner,
						target = Math.min(s.initCalcRows + scrolledArea.row, scrolledArea.row + 20, tBody.lastChild.rowIndex),
						tr = tBody.children[target],
						th,
						text,
						newWidth,
						minWidth = 20,
						col = corner.col;

					if (tr === u) {
						return;
					}

					th = tr.children[0];

					if (th.label === u) return;

					text = th.label + '';

					newWidth = window.defaultCharSize.width * text.length;
					//set a miniumum width, because css doesn't respect this on col in FF
					newWidth = (newWidth > minWidth ? newWidth : minWidth);

					if (newWidth !== col._width || col._width === u) {
						col._width = newWidth;
						col.style.width = (newWidth) + 'px';
					}
				},

				toggleHideRow: function(i) {
					i = i || jS.rowLast;
					if (!i) return;

					var actionUI = jS.obj.pane().actionUI;

					actionUI.toggleHideRow(jS, i);
					jS.autoFillerGoToTd();
				},
				toggleHideRowRange: function(startIndex, endIndex) {
					var actionUI = jS.obj.pane().actionUI;

					actionUI.toggleHideRowRange(jS, startIndex, endIndex);
					jS.autoFillerGoToTd();
				},
				toggleHideColumn: function(i) {
					i = i || jS.colLast;
					if (!i) return;

					var actionUI = jS.obj.pane().actionUI;

					actionUI.toggleHideColumn(i);
					jS.autoFillerGoToTd();
				},
				toggleHideColumnRange: function(startIndex, endIndex) {
					var actionUI = jS.obj.pane().actionUI;

					actionUI.toggleHideColumnRange(startIndex, endIndex);
					jS.autoFillerGoToTd();
				},
				rowShowAll: function() {
					jS.obj.pane().actionUI.rowShowAll();
				},
				columnShowAll: function() {
					jS.obj.pane().actionUI.columnShowAll();
				},
				/**
				 * Merges cells together
				 * @param {Object} [tds]
				 * @memberOf jS
				 */
				merge:function (tds) {
					tds = tds || jS.highlighted();
					if (!tds.length) {
						return;
					}
					var
						cellsValue = [],
						firstTd = tds[0],
						lastTd = tds[tds.length - 1],
						firstLocRaw = jS.getTdLocation(firstTd),
						lastLocRaw = jS.getTdLocation(lastTd),
						firstLoc = {},
						lastLoc = {},
						colSpan = 0,
						rowSpan = 0,
						i = tds.length - 1,
						cell,
						_td,
						td,
						loc;

					if (firstLocRaw.row) {
						jS.setDirty(true);
						jS.setChanged(true);

						if (firstLocRaw.row < lastLocRaw.row) {
							firstLoc.row = firstLocRaw.row;
							lastLoc.row = lastLocRaw.row;
							td = firstTd;
						} else {
							firstLoc.row = lastLocRaw.row;
							lastLoc.row = firstLocRaw.row;
							td = lastTd;
						}

						if (td.hasAttribute('rowSpan') || td.hasAttribute('colSpan')) {
							return false;
						}

						if (firstLocRaw.col < lastLocRaw.col) {
							firstLoc.col = firstLocRaw.col;
							lastLoc.col = lastLocRaw.col;
						} else {
							firstLoc.col = lastLocRaw.col;
							lastLoc.col = firstLocRaw.col;
						}

						rowSpan = (lastLoc.row - firstLoc.row) + 1;
						colSpan = (lastLoc.col - firstLoc.col) + 1;

						loc = jS.getTdLocation(td);

						do {
							_td = tds[i];
							cell = _td.jSCell;
							if (cell.formula || cell.value) {
								cellsValue.unshift(cell.formula ? "(" + cell.formula.substring(1) + ")" : cell.value);
							}
							s.parent.one('sheetPreCalculation', function () {
								if (_td.cellIndex != loc.col || _td.parentNode.rowIndex != loc.row) {
									cell.formula = '';
									cell.value = '';
									cell.defer = td.jSCell;

									_td.removeAttribute('data-formula');
									_td.removeAttribute('data-celltype');
									_td.innerHTML = '';
									//_td.style.display = 'none';
									_td.style.visibility = 'collapse';
									//_td.colSpan = colSpan - (_td.cellIndex - td.cellIndex);
									//_td.rowSpan = rowSpan - (_td.parentNode.rowIndex - td.parentNode.rowIndex);
								}
							});

							jS.resolveCell(cell);
						} while(i--);

						td.jSCell.value = $.trim(cellsValue.join(' '));
						td.jSCell.formula = $.trim(td.jSCell.formula ? cellsValue.join(' ') : '');

						td.setAttribute('rowSpan', rowSpan);
						td.setAttribute('colSpan', colSpan);
						td.style.display = '';
						td.style.visibility = '';
						td.style.position = '';
						td.style.height = td.clientHeight + 'px';
						td.style.width = td.clientWidth + 'px';
						td.style.position = 'absolute';

						jS.resolveCell(td.jSCell);
						jS.evt.cellEditDone();
						jS.autoFillerGoToTd(td);
						jS.cellSetActive(td, loc);
					}
					return true;
				},

				/**
				 * Unmerges cells together
				 * @param {jQuery} [td]
				 * @memberOf jS
				 */
				unmerge:function (td) {
					td = td || jS.highlighted();
					if (!td) {
						return;
					}
					var loc = jS.getTdLocation(td),
						last = new Date(),
						row = math.max(td.getAttribute('rowSpan') * 1, 1) - 1,
						col = math.max(td.getAttribute('colSpan') * 1, 1) - 1,
						i = row + loc.row,
						j,
						_td,
						tds = [];

					if (row == 0 && col == 0) {
						return false;
					}

					do {
						j = loc.col + col;
						do {
							_td = jS.getTd(-1, i, j);
							if (_td === null) continue;
							_td.style.display = '';
							_td.style.visibility = '';
							_td.removeAttribute('colSpan');
							_td.removeAttribute('rowSpan');
							_td.jSCell.defer = null;

							jS.resolveCell(_td.jSCell, last);

							tds.push(_td);
						} while (j-- > loc.col);
					} while (i-- > loc.row);

					jS.evt.cellEditDone();
					jS.autoFillerGoToTd(td);
					jS.cellSetActive(td, loc);
					jS.highlighter.set(tds);
					return true;
				},

				/**
				 * Fills values down or up to highlighted cells from active cell;
				 * @param {Boolean} [goUp] default is down, when set to true value are filled from bottom, up;
				 * @param {String} [v] the value to set cells to, if not set, formula will be used;
				 * @param {Object} [cells]
				 * @memberOf jS
				 * @returns {Boolean}
				 */
				fillUpOrDown:function (goUp, v, cells) {
					jS.evt.cellEditDone();
					cells = cells || jS.highlighted(true);

					if (cells.length < 1) {
						return false;
					}

					var activeTd = jS.obj.tdActive();

					if (cells.length < 1) {
						return false;
					}

					var startLoc = jS.getTdLocation(cells[0].td),
						endLoc = jS.getTdLocation(cells[cells.length - 1].td),
						relativeLoc = jS.getTdLocation(activeTd),
						offset = {
							row:0,
							col:0
						},
						newV = v || activeTd.jSCell.value,
						isNumber = false,
						i = cells.length - 1,
						fn = function() {};

					v = v || activeTd.jSCell.value;

					if (i >= 0) {
						if (v.charAt && v.charAt(0) == '=') {
							if (i >= 0) {
								do {
									if (!goUp) {
										offset.row = relativeLoc.row - endLoc.row;
										offset.col = relativeLoc.col - endLoc.col;
									} else {
										offset.row = relativeLoc.row - startLoc.row;
										offset.col = relativeLoc.col - startLoc.col;
									}

									newV = jS.reparseFormula(v, offset);

									s.parent.one('sheetPreCalculation', function () {
										cells[i].formula = newV;
										cells[i].value = '';
										cells[i].td.setAttribute('data-formula', newV);
									});

									jS.resolveCell(cells[i]);
								} while (i--);
								return true;
							}
						} else {
							if ((isNumber = !n(newV)) || newV.length > 0) {
								if (isNumber && newV != '') {
									newV *= 1;

									if (goUp) {
										newV -= cells.length - 1;
									}
									fn = function() {
										newV++;
									};
								}
							}

							do {
								s.parent.one('sheetPreCalculation', function () {
									cells[i].formula = '';
									cells[i].value = newV + '';
									cells[i].td.removeAttribute('data-formula');
								});

								jS.resolveCell(cells[i]);

								fn();
							} while (i--);
							return true;
						}
					}

					return false;
				},

				/**
				 * Turns values into a tab separated value
				 * @param {Object} [cells]
				 * @param {String} [clearValue]
				 * @param {Object} [fnEach]
				 * @memberOf jS
				 * @returns {String}
				 */
				toTsv:function (cells, clearValue, fnEach) {
					cells = cells || jS.highlighted(true);
					if (cells.type) {
						cells = [cells];
					}
					fnEach = fnEach || function (loc, cell) {
						if (clearValue) {
							s.parent.one('sheetPreCalculation', function () {
								cell.formula = '';
								cell.value = '';
							});
							jS.resolveCell(cell);
						}
					};
					var cellValues = [],
						firstLoc,
						lastLoc,
						minLoc = {},
						i = cells.length - 1,
						row,
						col;

					if (i >= 0) {
						firstLoc = jS.getTdLocation(cells[0].td);
						lastLoc = jS.getTdLocation(cells[cells.length - 1].td);
						minLoc.row = math.min(firstLoc.row, lastLoc.row);
						minLoc.col = math.min(firstLoc.col, lastLoc.col);
						do {
							var loc = jS.getTdLocation(cells[i].td),
								value = (cells[i].formula ? '=' + cells[i].formula : cells[i].value);

							row = math.abs(loc.row - minLoc.row);
							col = math.abs(loc.col - minLoc.col);

							if (!cellValues[row]) cellValues[row] = [];

							if ((value += '').match(/\n/)) {
								value = '"' + value + '"';
							}

							cellValues[row][col] = (value || '');

							fnEach.call(cells[i].td, loc, cells[i]);
						} while (i-- > 0);


						i = cellValues.length - 1;
						do {
							cellValues[i] = cellValues[i].join('\t');
						} while (i-- > 0);

						return cellValues.join('\n');
					}
					return '';
				},

				/**
				 * Makes cell formulas increment within a range
				 * @param {Object} loc expects keys row,col
				 * @param {Object} offset expects keys row,col, offsets increment
				 * @param {Boolean} [isBefore] inserted before location
				 * @param {Boolean} [wasDeleted]
				 * @memberOf jS
				 */
				offsetFormulas:function (loc, offset, isBefore, wasDeleted) {
					var size = jS.sheetSize(),
					//effected range is the entire spreadsheet
						affectedRange = {
							first:{
								row:1,
								col:1
							},
							last:{
								row:size.rows,
								col:size.cols
							}
						},
						cellStack = [];



					jS.cycleCells(function () {
						var cell = this;
						if (this.formula && typeof this.formula == 'string' && jS.isFormulaEditable(this.td)) {
							this.formula = jS.reparseFormula(this.formula, offset, loc, isBefore, wasDeleted);

							this.td.setAttribute('data-formula', '=' + this.formula);
						}

						cellStack.push(function() {
							jS.resolveCell(cell, true);
						});

					}, affectedRange.first, affectedRange.last);

					while (cellStack.length) {
						cellStack.pop()();
					}

					jS.evt.cellEditDone();
				},

				/**
				 * Re-parses a formula
				 * @param formula
				 * @param {Object} offset expects keys row,col, offsets increment
				 * @param {Object} [loc]
				 * @param {Boolean} [isBefore]
				 * @param {Boolean} [wasDeleted]
				 * @returns {String}
				 * @memberOf jS
				 */
				reparseFormula:function (formula, offset, loc, isBefore, wasDeleted) {
					return formula.replace(jSE.regEx.cell, function (ignored, col, row, pos) {
						if (col == "SHEET") return ignored;
						offset = offset || {loc: 0, row: 0};

						var oldLoc = {
								row:row * 1,
								col:jSE.columnLabelIndex(col)
							},
							moveCol,
							moveRow,
							override = {
								row: row,
								col: col,
								use: false
							};

						if (loc) {
							if (wasDeleted) {
								if (isBefore) {
									if (oldLoc.col && oldLoc.col == loc.col - 1) {
										override.col = '#REF!';
										override.use = true;
									}
									if (oldLoc.row && oldLoc.row == loc.row - 1) {
										override.row = '#REF!';
										override.use = true;
									}

									if (oldLoc.col >= loc.col) {
										moveCol = true;
									}
									if (oldLoc.row >= loc.row) {
										moveRow = true;
									}
								} else {
									if (loc.col && oldLoc.col == loc.col) {
										override.col = '#REF!';
										override.use = true;
									}
									if (loc.row && oldLoc.row == loc.row) {
										override.row = '#REF!';
										override.use = true;
									}

									if (loc.col && oldLoc.col > loc.col) {
										moveCol = true;
									}
									if (loc.row && oldLoc.row > loc.row) {
										moveRow = true;
									}
								}

								if (override.use) {
									return override.col + override.row;
								}

								if (moveCol) {
									oldLoc.col += offset.col;
									return jS.makeFormula(oldLoc);
								}

								if (moveRow) {
									oldLoc.row += offset.row;
									return jS.makeFormula(oldLoc);
								}
							} else {
								if (isBefore) {
									if (loc.col && oldLoc.col >= loc.col) {
										moveCol = true;
									}
									if (loc.row && oldLoc.row >= loc.row) {
										moveRow = true;
									}
								} else {
									if (loc.col && oldLoc.col > loc.col) {
										moveCol = true;
									}
									if (loc.row && oldLoc.row > loc.row) {
										moveRow = true;
									}
								}

								if (moveCol) {
									oldLoc.col += offset.col;
									return jS.makeFormula(oldLoc);
								}

								if (moveRow) {
									oldLoc.row += offset.row;
									return jS.makeFormula(oldLoc);
								}
							}
						} else {
							return jS.makeFormula(oldLoc, offset);
						}

						return ignored;
					});
				},


				/**
				 * Reconstructs a formula
				 * @param {Object} loc expects keys row,col
				 * @param {Object} [offset] expects keys row,col
				 * @returns {String}
				 * @memberOf jS
				 */
				makeFormula:function (loc, offset) {
					offset = $.extend({row:0, col:0}, offset);

					//set offsets
					loc.col += offset.col;
					loc.row += offset.row;

					//0 based now
					if (loc.col < 0) loc.col = 0;
					if (loc.row < 0) loc.row = 0;

					return jSE.parseCellName(loc.col, loc.row);
				},

				/**
				 * Cycles through a certain group of td objects in a spreadsheet table and applies a function to them
				 * @param {Function} fn the function to apply to a cell
				 * @param {Object} [firstLoc] expects keys row,col, the cell to start at
				 * @param {Object} [lastLoc] expects keys row,col, the cell to end at
				 * @param {Number} [i] spreadsheet index within instance
				 * @memberOf jS
				 */
				cycleCells:function (fn, firstLoc, lastLoc, i) {
					i = i || jS.i;
					firstLoc = firstLoc || {rowIndex:1, col:1};

					if (!lastLoc) {
						var size = jS.sheetSize();
						lastLoc = {row:size.rows, col:size.cols};
					}

					var spreadsheet = jS.spreadsheets[i],
						rowIndex,
						colIndex,
						row,
						cell;

					for(colIndex = firstLoc.col; colIndex <= lastLoc.col; colIndex++) {
						for(rowIndex = firstLoc.row; rowIndex <= lastLoc.row; rowIndex++) {

							if ((row = spreadsheet[rowIndex]) === u) continue;
							if ((cell  = row[colIndex]) === u) continue;

							//Something may have happened to the spreadsheet dimensions, lets go ahead and update the indexes
							cell.rowIndex = rowIndex;
							cell.columnIndex = colIndex;

							fn.call(cell, i, rowIndex, colIndex);
						}
					}
				},

				/**
				 * Cycles through all td objects in a spreadsheet table and applies a function to them
				 * @param fn
				 * @memberOf jS
				 */
				cycleCellsAll:function (fn) {
					var jSI = jS.i, i,size,endLoc;
					for (i = 0; i <= jS.sheetCount; i++) {
						jS.i = i;
						size = jS.sheetSize();
						endLoc = {row:size.rows, col:size.cols};
						jS.cycleCells(fn, {row:0, col:0}, endLoc, i);
					}
					jS.i = jSI;
				},

				/**
				 * Cycles through a certain group of td objects in a spreadsheet table and applies a function to them, firstLoc can be bigger then lastLoc, this is more dynamic
				 * @param {Function} fn the function to apply to a cell
				 * @param {Object} grid {startRowIndex, startColumnIndex, endRowIndex, endColumnIndex}
				 * @memberOf jS
				 */
				cycleCellArea:function (fn, grid) {
					var rowIndex,
						columnIndex,
						row,
						cell,
						i = jS.i,
						o = {cell: [], td: []},
						spreadsheet = jS.spreadsheets[i];

					for(rowIndex = grid.startRowIndex; rowIndex <= grid.endRowIndex; rowIndex++) {
						if ((row = spreadsheet[rowIndex]) === u) continue;

						for(columnIndex = grid.startColumnIndex; columnIndex <= grid.endColumnIndex; columnIndex++) {
							if ((cell = row[columnIndex]) === u) continue;

							o.cell.push(cell);
							o.td.push(cell.td);
						}
					}

					if (fn) {
						fn(o);
					}
				},


				/**
				 * Adds tBody, colGroup, heights and widths to different parts of a spreadsheet
				 * @param {HTMLElement} table table object
				 * @memberOf jS
				 */
				formatTable:function (table) {
					var w = s.newColumnWidth + 'px',
						h = s.colMargin + 'px',
						children = table.children,
						i = children.length - 1,
						j,
						col,
						tBody,
						colGroup,
						firstTr,
						hasTBody,
						hasColGroup,
						loader = (s.loader !== null ? s.loader : null),
						getWidth = (loader !== null ? loader.getWidth : function(sheetIndex, columnIndex) {
							return s.newColumnWidth;
						});

					if (i > -1) {
						do {
							switch (children[i].nodeName) {
								case 'TBODY':
									hasTBody = true;
									tBody = children[i];
									break;
								case 'COLGROUP':
									hasColGroup = true;
									colGroup = children[i];
									break;
							}
						} while (i--);
					} else {
						/*var child = document.createElement('tr');
						table.appendChild(child);
						children = table.children;*/
					}

					if (!tBody) {
						tBody = document.createElement('tbody');

						if (children.length > 0) {
							do {
								tBody.appendChild(children[0]);
							} while (children.length);
						}
					}

					if (!colGroup || colGroup.children.length < 1) {
						colGroup = document.createElement('colgroup');

						table.appendChild(colGroup);
						table.appendChild(tBody);

						if (tBody.children.length > 0) {
							firstTr = tBody.children[0];

							for (i = 0, j = Math.min(firstTr.children.length, s.initCalcCols); i < j; i++) {
								col = document.createElement('col');
								col.style.width = getWidth(jS.i, i) + 'px';

								colGroup.appendChild(col);

							}
							for (i = 0, j = Math.min(tBody.children.length, s.initCalcRows); i < j; i++) {
								tBody.children[i].style.height = h;
							}
						}
					}

					table.tBody = tBody;
					table.colGroup = colGroup;
					table.removeAttribute('width');
					table.style.width = '';
				},

				/**
				 * Ensure sheet minimums have been met, if not add columns and rows
				 * @param {jQuery|HTMLElement} table object
				 * @memberOf jS
				 */
				checkMinSize:function (table) {
					var size = jS.tableSize(table),
						addRows = s.minSize.rows || 0,
						addCols = s.minSize.cols || 0,
						actionUI = jS.obj.pane().actionUI,
						frozenAt = actionUI.frozenAt;

					addRows = Math.max((frozenAt.row > addRows ? frozenAt.row + 1 : addRows), 1, s.initScrollRows);
					addCols = Math.max((frozenAt.col > addCols ? frozenAt.col + 1 : addCols), 1, s.initScrollCols);

					if (size.cols < addCols) {
						addCols -= size.cols;

						if (actionUI.hiddenColumns.length > 0) {
							addCols += arrHelpers.indexOfNearestLessThan(actionUI.hiddenColumns, addCols) + 1;
						}

						jS.controlFactory.addColumnMulti(null, addCols, false, true, true);
					}

					//The sheet size (rows) may have changed
					size = jS.tableSize(table);

					if (size.rows < addRows) {
						addRows -= size.rows;

						//TODO
						//if (actionUI.hiddenRows.length > 0) {
						//	addRows += arrHelpers.indexOfNearestLessThan(actionUI.hiddenRows, addRows) + 1;
						//}

						jS.controlFactory.addRowMulti(null, addRows, false, true, true);
					}
				},

				/**
				 * @type Sheet.Theme
				 */
				theme: null,

				/**
				 * @type Sheet.Highlighter
				 */
				highlighter: null,

				/**
				 * jQuery ui resizeable integration
				 * @param {jQuery|HTMLElement} o To set resizable
				 * @param {Object} settings the settings used with jQuery ui resizable
				 * @memberOf jS
				 */
				resizable:function (o, settings) {
					if (!o.data('resizable')) {
						o.resizable(settings);
					}
				},

				/**
				 * instance busy state
				 * @memberOf jS
				 */
				busy:[],


				/**
				 * Set the spreadsheet busy status
				 * @param {Boolean} busy
				 * @memberOf jS
				 */
				setBusy:function (busy) {
					if (busy) {
						jS.busy.push(busy);
					} else {
						jS.busy.pop();
					}
				},

				/**
				 * get the spreadsheet busy status
				 * @memberOf jS
				 * @returns {Boolean}
				 */
				isBusy:function () {
					return (jS.busy.length > 0);
				},

				/**
				 * jQuery ui draggable integration
				 * @param {jQuery|HTMLElement} o To set resizable
				 * @param {Object} settings the settings used with jQuery ui resizable
				 * @memberOf jS
				 */
				draggable:function (o, settings) {
					if (!o.data('jSdraggable')) {
						o
							.data('jSdraggable', true)
							.draggable(settings);
					}
				},

				/**
				 * jQuery nearest integration
				 * @param o
				 * @param elements
				 * @memberOf jS
				 */
				nearest:function (o, elements) {
					return $(o).nearest(elements);
				},

				/**
				 * Bar resizing
				 * @memberOf jS
				 * @namespace
				 */
				resizeBar:{

					/**
					 * Provides the top bar with ability to resize
					 * @param {jQuery|HTMLElement} $bar td bar object
					 * @param {Number} i index of bar
					 * @param {jQuery|HTMLElement} pane spreadsheet pane
					 * @param {jQuery|HTMLElement} sheet spreadsheet table
					 * @memberOf jS.resizeBar
					 */
					top:function ($bar, i, pane, sheet) {
						jS.obj.barTopControls().remove();
						var barController = document.createElement('div'),
							$barController = $(barController)
								.addClass(jS.cl.barController + ' ' + jS.theme.barResizer)
								.width($bar.width())
								.prependTo($bar),
							col,
							handle;

						jS.controls.bar.x.controls[jS.i] = jS.obj.barTopControls().add($barController);

						jS.resizableCells($barController, {
							handles:'e',
							start:function (e, ui) {
								jS.autoFillerHide();
								jS.setBusy(true);
								col = jS.col(sheet, i);
								if (pane.freezeHandleTop) {
									pane.freezeHandleTop.remove();
								}
								col.removeAttribute('width');
							},
							resize:function (e, ui) {
								col.style.width = ui.size.width + 'px';

								if (pane.inPlaceEdit) {
									pane.inPlaceEdit.goToTd();
								}
							},
							stop:function (e, ui) {
								jS.setBusy(false);
								if (pane.inPlaceEdit) {
									pane.inPlaceEdit.goToTd();
								}
								jS.followMe();
								jS.setDirty(true);
							},
							minWidth: 32
						});

						handle = barController.children[0];
						handle.style.height = $bar.outerHeight() + 'px';
						handle.style.position = 'absolute';
					},

					/**
					 * Provides the left bar with ability to resize
					 * @param {jQuery|HTMLElement} $bar td bar object
					 * @param {Number} i index of bar
					 * @param {jQuery|HTMLElement} pane spreadsheet pane
					 * @param {jQuery|HTMLElement} sheet spreadsheet table
					 * @memberOf jS.resizeBar
					 */
					left:function ($bar, i, pane, sheet) {
						jS.obj.barLeftControls().remove();
						var offset = $bar.offset(),
							barController = document.createElement('div'),
							$barController = $(barController)
								.addClass(jS.cl.barController + ' ' + jS.theme.barResizer)
								.prependTo($bar)
								.offset({
									top:offset.top,
									left:offset.left
								}),
							bar = $bar[0],
							td = $bar.next()[0],
							parent = td.parentNode,
							child = document.createElement('div'),
							$child = $(child)
								.addClass(jS.cl.barControllerChild)
								.height($bar.height())
								.prependTo($barController),
							handle;

						jS.controls.bar.y.controls[jS.i] = jS.obj.barLeftControls().add($barController);

						jS.resizableCells($child, {
							handles:'s',
							start:function () {
								jS.autoFillerHide();
								jS.setBusy(true);
								if (pane.freezeHandleLeft) {
									pane.freezeHandleLeft.remove();
								}
								parent.removeAttribute('height');
								bar.removeAttribute('height');
								td.removeAttribute('height');
							},
							resize:function (e, ui) {
								barController.style.height =
								td.style.height =
								bar.style.height =
								parent.style.height =
								ui.size.height + 'px';

								if (pane.inPlaceEdit) {
									pane.inPlaceEdit.goToTd();
								}
							},
							stop:function (e, ui) {
								jS.setBusy(false);
								if (pane.inPlaceEdit) {
									pane.inPlaceEdit.goToTd();
								}
								jS.followMe();
								jS.setDirty(true);
							},
							minHeight: 15
						});

						handle = child.children[0];
						handle.style.width = $bar.outerWidth() + 'px';
						handle.style.position = 'absolute';
					},

					/**
					 * Provides the corner bar, just a place holder, needed for auto events
					 * @memberOf jS.resizeBar
					 */
					corner:function () {
					}
				},

				/**
				 * Removes sheet decorations
				 * @param {Boolean} makeClone creates a clone rather than the actual object
				 * @param {jQuery|HTMLElement} sheets spreadsheet table object to remove decorations from
				 * @returns {jQuery|HTMLElement}
				 * @memberOf jS
				 */
				sheetDecorateRemove:function (makeClone, sheets) {
					sheets = sheets || jS.obj.tables();
					sheets = (makeClone ? sheets.clone() : sheets);

					//Get rid of highlighted cells and active cells
					sheets.find('td.' + jS.theme.tdActive)
						.removeClass(jS.theme.tdActive);

					sheets.find('td.' + jS.theme.tdHighlighted)
						.removeClass(jS.theme.tdHighlighted);
					return sheets;
				},

				/**
				 * Updates the label so that the user knows where they are currently positioned
				 * @param {Sheet.Cell|*} entity
				 * @memberOf jS
				 */
				labelUpdate:function (entity) {
					if (entity instanceof Sheet.Cell) {
						var name = jSE.parseCellName(entity.columnIndex, entity.rowIndex);
						jS.obj.label().text(name);
					} else {
						jS.obj.label().text(entity);
					}
				},

				/**
				 * Starts td to be edited
				 * @param {HTMLElement} td
				 * @param {Boolean} [isDrag] should be determined by if the user is dragging their mouse around setting cells
				 * @param {Boolean} [doNotClearHighlighted]
				 */
				cellEdit:function (td, isDrag, doNotClearHighlighted) {
					jS.autoFillerNotGroup = true; //make autoFiller directional again.
					//This finished up the edit of the last cell
					jS.evt.cellEditDone();

					if (td === null) return;

					var cell = td.jSCell,
						v;

					if (cell === u || cell === null) return;
					if (cell.uneditable) return;

					jS.trigger('sheetCellEdit', [cell]);

					if (jS.cellLast !== null && td !== jS.cellLast.td) {
						jS.followMe(td);
					} else {
						jS.autoFillerGoToTd(td);
					}

					//Show where we are to the user
					jS.labelUpdate(cell);

					if (cell.formula.length > 0) {
						v = '=' + cell.formula;
					} else {
						v = cell.value;
					}

					jS.obj.formula()
						.val(v)
						.blur();

					jS.cellSetActive(cell, isDrag, false, null, doNotClearHighlighted);
				},

				/**
				 * sets cell active to sheet, and highlights it for the user, shouldn't be called directly, should use cellEdit
				 * @param {Sheet.Cell} cell
				 * @param {Boolean} [isDrag] should be determined by if the user is dragging their mouse around setting cells
				 * @param {Boolean} [directional] makes highlighting directional, only left/right or only up/down
				 * @param {Function} [fnDone] called after the cells are set active
				 * @param {Boolean} [doNotClearHighlighted]
				 * @memberOf jS
				 */
				cellSetActive:function (cell, isDrag, directional, fnDone, doNotClearHighlighted) {
					var td = cell.td;

					jS.cellLast = cell;

					jS.rowLast = cell.rowIndex;
					jS.colLast = cell.columnIndex;

					if (!doNotClearHighlighted) {
						jS.highlighter
							.set(cell.td) //themeroll the cell and bars
							.setStart(cell)
							.setEnd(cell);
					}

					jS.highlighter
						.setBar('left', td.parentNode.children[0])
						.setBar('top', td.parentNode.parentNode.children[0].children[td.cellIndex]);

					var selectModel,
						clearHighlightedModel;

					switch (s.cellSelectModel) {
						case Sheet.excelSelectModel:
						case Sheet.googleDriveSelectModel:
							selectModel = function () {};
							clearHighlightedModel = function() {};
							break;
						case Sheet.openOfficeSelectModel:
							selectModel = function (target) {
								if (jS.isCell(target)) {
									jS.cellEdit(target);
								}
							};
							clearHighlightedModel = function () {};
							break;
					}

					if (isDrag) {
						var pane = jS.obj.pane(),
							highlighter = jS.highlighter,
							grid = {
								startRowIndex: cell.rowIndex,
								startColumnIndex: cell.columnIndex,
								endRowIndex: 0,
								endColumnIndex: 0
							},
							lastTouchedRowIndex = cell.rowIndex,
							lastTouchedColumnIndex = cell.columnIndex;

						pane.onmousemove = function (e) {
							e = e || window.event;

							var target = e.target || e.srcElement;

							if (jS.isBusy()) {
								return false;
							}

							if (target.jSCell === u) return false;

							var touchedCell = target.jSCell,
								ok = true;

							grid.endColumnIndex = touchedCell.columnIndex;
							grid.endRowIndex = touchedCell.rowIndex;

							if (directional) {
								ok = (cell.columnIndex === touchedCell.columnIndex || cell.rowIndex === touchedCell.rowIndex);
							}

							if ((
								lastTouchedColumnIndex !== touchedCell.columnIndex
								|| lastTouchedRowIndex !== touchedCell.rowIndex
								) && ok) { //this prevents this method from firing too much
								//select active cell if needed
								selectModel(target);

								//highlight the cells
								jS.cycleCellArea(function (o) {
									highlighter.set(o.td);
								}, jS.orderedGrid(grid));
							}

							jS.followMe(target);

							var mouseY = e.clientY,
								mouseX = e.clientX,
								offset = pane.$enclosure.offset(),
								up = touchedCell.rowIndex,
								left = touchedCell.columnIndex,
								move = false,
								previous;

							if (n(up) || n(left)) {
								return false;
							}

							if(mouseY > offset.top){
								move = true;
								up--
							}
							if(mouseX > offset.left){
								move = true;
								left--
							}
							if(move){
								if (up < 1 || left < 1) {
									return false;
								}
								previous = jS.spreadsheets[jS.i][up][left];
								jS.followMe(previous.td, true);
							}

							lastTouchedColumnIndex = touchedCell.columnIndex;
							lastTouchedRowIndex = touchedCell.rowIndex;
							return true;
						};

						document.onmouseup = function() {
							pane.onmousemove = null;
							pane.onmousemove = null;
							pane.onmouseup = null;
							document.onmouseup = null;

							if (fnDone) {
								fnDone();
							}
						};
					}

				},

				/**
				 * the most recent used column
				 * @memberOf jS
				 */
				colLast:0,

				/**
				 * the most recent used row
				 * @memberOf jS
				 */
				rowLast:0,

				/**
				 * the most recent used cell, {td, row, col, isEdit}
				 * @memberOf jS
				 * @type {Object}
				 */
				cellLast:null,

				/**
				 * the most recent highlighted cells {td, rowStart, colStart, rowEnd, colEnd}, in order
				 * @memberOf jS
				 * @type {Object}
				 */
				orderedGrid: function(grid) {
					var gridOrdered = {
						startRowIndex: (grid.startRowIndex < grid.endRowIndex ? grid.startRowIndex : grid.endRowIndex),
						startColumnIndex: (grid.startColumnIndex < grid.endColumnIndex ? grid.startColumnIndex : grid.endColumnIndex),
						endRowIndex: (grid.endRowIndex > grid.startRowIndex ? grid.endRowIndex : grid.startRowIndex),
						endColumnIndex: (grid.endColumnIndex > grid.startColumnIndex ? grid.endColumnIndex : grid.startColumnIndex)
					};

					return gridOrdered;
				},

				/**
				 * sets cell(s) class for styling
				 * @param {String} setClass class(es) to set cells to
				 * @param {String} [removeClass] class(es) to remove from cell if the setClass would conflict with
				 * @param {Object} [tds]
				 * @returns {Boolean}
				 * @memberOf jS
				 */
				cellStyleToggle:function (setClass, removeClass, tds) {
					tds = tds || jS.highlighted();
					if (tds.length < 1) {
						return false;
					}
					jS.setDirty(true);
					//Lets check to remove any style classes
					var td,
						$td,
						i = tds.length - 1,
						cells = jS.obj.cellsEdited(),
						hasClass;

					//TODO: use resolveCell and sheetPreCalculation to set undo redo data

					if (i >= 0) {
						hasClass = tds[0].className.match(setClass); //go by first element in set
						do {
							td = tds[i];
							$td = $(td);

							if (removeClass) {//If there is a class that conflicts with this one, we remove it first
								$td.removeClass(removeClass);
							}

							//Now lets add some style
							if (hasClass) {
								$td.removeClass(setClass);
							} else {
								$td.addClass(setClass);
							}

							if (!td.jSCell.edited) {
								td.jSCell.edited = true;
								cells.push(td.jSCell);
							}

						} while (i--);

						return true;
					}

					return false;
				},

				/**
				 * sets cell(s) type
				 * @param {String} [type] cell type
				 * @param {Object} [cells]
				 * @returns {Boolean}
				 * @memberOf jS
				 */
				cellTypeToggle:function(type, cells) {
					cells = cells || jS.highlighted(true);

					if (cells.length < 1) {
						return;
					}

					var i = cells.length - 1,
						remove = cells[i].cellType == type,
						cell;

					if (i >= 0) {
						do {
							cell = cells[i];
							if (remove) {
								cell.cellType = null;
							} else {
								cell.cellType = type;
							}
							//TODO set needsUpdate on cell and dependencies
							cell.updateValue();

						} while(i--);
					}
				},

				/**
				 * Resize fonts in a cell by 1 pixel
				 * @param {String} direction "up" or "down"
				 * @param {Object} [tds]
				 * @memberOf jS
				 * @returns {Boolean}
				 */
				fontReSize:function (direction, tds) {
					tds = tds || jS.highlighted();
					if (tds.length < 1) {
						return false;
					}

					var resize = 0;
					switch (direction) {
						case 'up':
							resize = 1;
							break;
						case 'down':
							resize = -1;
							break;
					}

					//Lets check to remove any style classes
					var td,
						$td,
						i = tds.length - 1,
						size,
						cells = jS.obj.cellsEdited();

					//TODO: use resolveCell and sheetPreCalculation to set undo redo data

					if (i >= 0) {
						do {
							td = tds[i];
							$td = $(td);
							size = ($td.css("font-size") + '').replace("px", "") * 1;
							$td.css("font-size", ((size || 10) + resize) + "px");

							if (!td.jSCell.edited) {
								td.jSCell.edited = true;
								cells.push(td.jSCell);
							}
						} while(i--);
						return true;
					}
					return false;
				},



				/**
				 * Object handler for formulaParser
				 * @type {Sheet.CellHandler}
				 * @memberOf jS
				 */
				cellHandler: null,

				/**
				 * Where jS.spreadsheets are calculated, and returned to their td counterpart
				 * @param {Number} [sheetIndex] table index
				 * @param {Boolean} [refreshCalculations]
				 * @memberOf jS
				 */
				calc:function (sheetIndex, refreshCalculations) {
					sheetIndex = (sheetIndex === u ? jS.i : sheetIndex);
					if (
						jS.readOnly[sheetIndex]
						|| jS.isChanged(sheetIndex) === false
						&& !refreshCalculations
					) {
						return false;
					} //readonly is no calc at all

					var loader = s.loader,
						cell;

					if (loader !== null) {
						loader.cycleCells(sheetIndex, function(sheetIndex, rowIndex, columnIndex) {
							cell = loader.jitCell(sheetIndex, rowIndex, columnIndex);
							cell.updateValue();
						});
					} else {
						var sheet = jS.spreadsheetToArray(null, sheetIndex);
						jSE.calc(sheetIndex, sheet);
						jS.trigger('sheetCalculation', [
							{which:'spreadsheet', sheet:sheet, index:sheetIndex}
						]);
					}
					jS.setChanged(false);
					return true;
				},

				/**
				 * Where jS.spreadsheets are all calculated, and returned to their td counterpart
				 * @param {Boolean} [refreshCalculations]
				 * @memberOf jS
				 */
				calcAll: function(refreshCalculations) {
					var sheetIndex = 0,
						max;
					if (s.loader !== null) {
						max = s.loader.count;

						for(;sheetIndex < max; sheetIndex++) {
							jS.calc(sheetIndex, refreshCalculations);
						}
					} else {
						max = jS.spreadsheets.length;

						for(;sheetIndex < max; sheetIndex++) {
							jS.calc(sheetIndex, refreshCalculations);
						}
					}
				},

				calcVisiblePos: {
					row: -1,
					col: -1
				},
				calcVisibleInit: function(sheetIndex) {
					sheetIndex = sheetIndex || jS.i;

					var spreadsheet = jS.spreadsheetToArray(null, sheetIndex) || [],
						min = Math.min,
						initRows = s.initCalcRows,
						initCols = s.initCalcCols,
						rowIndex = 1,
						rowIndexMax = min(spreadsheet.length - 1, initRows),
						row,
						columnIndex,
						columnIndexMax,
						pos = {row: -1, col: -1},
						stack = [],
						each = function() {
							this.cell.rowIndex = this.rowIndex;
							this.cell.columnIndex = this.columnIndex;
							this.cell.updateValue();
						},
						done = function() {
							stack.length = 0;
							jS.trigger('sheetCalculation', [
								{which:'spreadsheet', sheet:spreadsheet, index:sheetIndex}
							]);
						};


					pos.row = rowIndexMax;
					for (;rowIndex <= rowIndexMax; rowIndex++) {
						if (rowIndex > 0 && (row = spreadsheet[rowIndex]) !== u) {
							columnIndexMax = pos.col = min(row.length - 1, initCols);
							columnIndex = 1;

							for (;columnIndex <= columnIndexMax;columnIndex++) {
								stack.push({
									cell: row[columnIndex],
									rowIndex: rowIndex,
									columnIndex: columnIndex
								});
							}

						}
					}


					thaw(stack, {
						each: each,
						done: done
					});

					this.calcVisiblePos = pos;
					jS.setChanged(false);
				},
				calcVisibleRow: function(actionUI, sheetIndex) {
					sheetIndex = sheetIndex || jS.i;

					var spreadsheet = jS.spreadsheets[sheetIndex],
						initRows = s.initCalcRows,
						table = actionUI.table,
						pane = actionUI.pane,
						columnIndex,
						columnMax,
						calcVisiblePos = this.calcVisiblePos,
						grow = function() {
							var stack = [],
								sheetSize = pane.size(),
								tableSize = table.size(),
								rowIndex,
								row,
								cell;

							if(
								tableSize.rows < initRows
								&& spreadsheet.length <= sheetSize.rows
								&& calcVisiblePos.row <= (sheetSize.rows + 1)
							) {
								rowIndex = calcVisiblePos.row;//self incrementing

								calcVisiblePos.row++;

								columnIndex = 1;
								columnMax = calcVisiblePos.col;
								for (; columnIndex <= columnMax; columnIndex++) {
									row = spreadsheet[rowIndex];
									cell = row !== u ? row[columnIndex] : u;

									stack.push({
										row: row,
										cell: cell,
										rowIndex: rowIndex,
										columnIndex: columnIndex
									});
								}

								thaw(stack, {
									each: function() {
										if (this.row === u || (this.row = spreadsheet[this.rowIndex]) === u) {
											if (spreadsheet[this.rowIndex] === u) {
												jS.createSpreadsheetForArea(actionUI.table, sheetIndex, this.rowIndex, this.rowIndex, this.columnIndex, this.columnIndex);
												this.row = spreadsheet[this.rowIndex];
											}
										} else {
											if ((this.cell = this.row[this.columnIndex]) === u) {
												jS.createCell(jS.i, this.rowIndex, this.columnIndex);
												this.cell = this.row[this.columnIndex];
											}
										}
									},
									done: function() {
										grow();
									}
								});
							}
						};

					calcVisiblePos.row = calcVisiblePos.row >= 0 ? calcVisiblePos.row : initRows;

					grow();

					jS.setChanged(false);
				},
				calcVisibleCol: function(actionUI, sheetIndex) {
					sheetIndex = sheetIndex || jS.i;

					var spreadsheet = jS.spreadsheetToArray(null, sheetIndex) || [],
						endScrolledArea = actionUI.scrolledArea,
						sheetSize = actionUI.pane.size(),
						initRows = s.initCalcRows,
						initCols = s.initCalcCols,
						targetRow = Math.max((endScrolledArea.row + initRows) - 1, actionUI.foldArea.row),
						targetCol = Math.max((endScrolledArea.col + initCols) - 1, actionUI.foldArea.col),
						rowIndex,
						row,
						colIndex,
						cell,
						oldPos = this.calcVisiblePos,
						newPos = {row: oldPos.row, col: oldPos.col},
						stack = [],
						each = function() {
							if (this.row === u || this.cell === u) {
								jS.createSpreadsheetForArea(actionUI.table, sheetIndex, this.rowIndex, this.rowIndex, this.colIndex, this.colIndex);
								this.row = spreadsheet[this.rowIndex];
							}

							if (this.row === u) {
								return;
							}

							cell = this.row[this.colIndex];
							if (cell === u) {
								return;
							}
							cell.updateValue();
						};

					targetRow = targetRow < sheetSize.rows ? targetRow : sheetSize.rows;
					targetCol = targetCol < sheetSize.cols ? targetCol : sheetSize.cols;
					rowIndex = targetRow;

					if (rowIndex > 0 && targetCol > 0) {
						do {
							colIndex = targetCol;
							row = spreadsheet[rowIndex];
							stack.push({
								row: row,
								cell: row !== u ? row[colIndex] : u,
								rowIndex: rowIndex,
								colIndex: colIndex
							});
						} while(rowIndex-- > 1);
					}

					this.calcVisiblePos = newPos;

					thaw(stack,{
						each: each
					});

					jS.trigger('sheetCalculation', [
						{which:'spreadsheet', sheet:spreadsheet, index:sheetIndex}
					]);
					jS.setChanged(false);
				},

				/**
				 * Calculates just the dependencies of a single cell, and their dependencies recursively
				 * @param {Sheet.Cell} cell
				 * @param {Boolean} [skipUndoable]
				 * @memberOf jS
				 */
				resolveCell:function (cell, skipUndoable) {
					var updateDependencies = !cell.needsUpdated;
					if (!skipUndoable) {
						jS.undo.createCells([cell], function(cells) {
							jS.trigger('sheetPreCalculation', [
								{which:'cell', cell:cell}
							]);

							jS.setDirty(true);
							jS.setChanged(true);
							cell.updateValue(function() {
								jS.trigger('sheetCalculation', [
									{which:'cell', cell: cell}
								]);

								if (updateDependencies) {
									cell.updateDependencies();
								}
							});
							return cells;
						});
					} else {
						jS.trigger('sheetPreCalculation', [
							{which:'cell', cell:cell}
						]);

						jS.setDirty(true);
						jS.setChanged(true);
						cell.updateValue(function() {
							jS.trigger('sheetCalculation', [
								{which:'cell', cell: cell}
							]);

							if (updateDependencies) {
								cell.updateDependencies();
							}
						});
					}
				},

				/**
				 * adds a spreadsheet table
				 * @param {Object} [size]
				 * @memberOf jS
				 */
				addSheet:function (size) {
					size = size || {rows: 25, cols: 10};

					jS.evt.cellEditAbandon();
					jS.setDirty(true);
					jS.controlFactory.sheetUI(jS.obj.ui, $.sheet.makeTable(size), jS.sheetCount);

					jS.setActiveSheet(jS.sheetCount);

					jS.sheetCount++;

					jS.sheetSyncSize();

					var pane = jS.obj.pane();
					if (pane.inPlaceEdit) {
						pane.inPlaceEdit.goToTd();
					}

					jS.trigger('sheetAdd', [jS.i]);
				},

				insertSheet: null,

				/**
				 * deletes a spreadsheet table
				 * @param {Number} [i] spreadsheet index within instance
				 * @memberOf jS
				 */
				deleteSheet:function (i) {
					var oldI = i || jS.i,
						enclosureArray =jS.controls.enclosures.toArray(),
						tabIndex;

					enclosureArray.splice(oldI,1);

					jS.obj.barHelper().remove();

					jS.obj.enclosure().remove();
					//BUG Found:
					//The enclosure will not be removed correctly while you delete the sheet.You may find all the enclosure will be hidden after you add a sheet and delete it.
					//The reason is that "jS.controls.enclosures" is a jQuery selector object( "$([])" ) which can't not remove element like an array.All enclosure are reserved after sheet has been deleted.
					//Here I remove the element by creating the selector object again.
					jS.controls.enclosures = $(enclosureArray);
					jS.obj.menus().remove();
					jS.obj.tabContainer().children().eq(jS.i).remove();
					jS.spreadsheets.splice(oldI, 1);
					jS.controls.autoFiller.splice(oldI, 1);
					jS.controls.bar.helper.splice(oldI, 1);
					jS.controls.bar.corner.splice(oldI, 1);
					jS.controls.bar.x.controls.splice(oldI, 1);
					jS.controls.bar.x.handleFreeze.splice(oldI, 1);
					jS.controls.bar.x.controls.splice(oldI, 1);
					jS.controls.bar.x.menu.splice(oldI, 1);
					if (jS.controls.bar.x.menuParent && jS.controls.bar.x.menuParent[oldI]) {
						jS.controls.bar.x.menuParent.splice(oldI, 1);
					}
					jS.controls.bar.x.parent.splice(oldI, 1);
					jS.controls.bar.x.th.splice(oldI, 1);
					jS.controls.bar.y.controls.splice(oldI, 1);
					jS.controls.bar.y.handleFreeze.splice(oldI, 1);
					jS.controls.bar.y.controls.splice(oldI, 1);
					jS.controls.bar.y.menu.splice(oldI, 1);
					if (jS.controls.bar.y.menuParent && jS.controls.bar.y.menuParent[oldI]) {
						jS.controls.bar.y.menuParent.splice(oldI, 1);
					}
					jS.controls.bar.y.parent.splice(oldI, 1);
					jS.controls.bar.y.th.splice(oldI, 1);
					jS.controls.barMenuLeft.splice(oldI, 1);
					jS.controls.barMenuTop.splice(oldI, 1);
					jS.controls.barLeft.splice(oldI, 1);
					jS.controls.barTop.splice(oldI, 1);
					jS.controls.barTopParent.splice(oldI, 1);
					jS.controls.chart.splice(oldI, 1);
					jS.controls.tdMenu.splice(oldI, 1);
					jS.controls.enclosure.splice(oldI, 1);
					jS.controls.fullScreen = null;
					jS.controls.inPlaceEdit.splice(oldI, 1);
					jS.controls.menus.splice(oldI, 1);
					jS.controls.menuLeft.splice(oldI, 1);
					jS.controls.menuRight.splice(oldI, 1);
					jS.controls.pane.splice(oldI, 1);
					jS.controls.tables.splice(oldI, 1);
					jS.controls.table.splice(oldI, 1);
					//BUGFIX - After removing of sheet, we need update the tab.i property - start from removed sheet's position.
					for (tabIndex = oldI+1; tabIndex < jS.controls.tab.length; ++tabIndex) {
						var tab = jS.controls.tab[tabIndex].get(0);
						tab.i--;
					}
					jS.controls.tab.splice(oldI, 1);
					jS.controls.toggleHide.x.splice(oldI, 1);
					jS.controls.toggleHide.y.splice(oldI, 1);
					jS.readOnly.splice(oldI, 1);
					jS.i = 0;
					jS.sheetCount--;
					jS.sheetCount = math.max(jS.sheetCount, 0);

					if (jS.sheetCount == 0) {
						jS.addSheet();
					}

					jS.setActiveSheet(jS.i);
					jS.setDirty(true);
					jS.setChanged(true);

					jS.trigger('sheetDelete', [oldI]);
				},

				/**
				 * removes the currently selected row
				 * @param {Number} [rowIndex]
				 * @param {Boolean} skipCalc
				 * @memberOf jS
				 */
				deleteRow:function (rowIndex, skipCalc) {
					var i,
						start,
						end,
						qty,
						size = jS.sheetSize(),
						row,
						pane = jS.obj.pane(),
						tBody = pane.table.tBody,
						td,
						highlighter = jS.highlighter;

					if (rowIndex) {
						start = end = rowIndex;
					} else {
						start = (highlighter.startRowIndex < highlighter.endRowIndex ? highlighter.startRowIndex : highlighter.endRowIndex);
						end = (highlighter.endRowIndex > highlighter.startRowIndex ? highlighter.endRowIndex : highlighter.startRowIndex);
					}

					qty = (end - start) + 1;

					if (start < 1 || size.cols < 2 || qty >= size.rows) {
						return;
					}

					i = end;

					do {
						//remove tr's first
						td = jS.getTd(-1, i, 1);
						if (td === null) continue;
						row = td.parentNode;
						tBody.removeChild(row);
					} while (start < i--);

					//now remove bar
					jS.controls.bar.y.th[jS.i].splice(start, qty);

					//now remove cells
					jS.spreadsheets[jS.i].splice(start, qty);

					jS.refreshRowLabels(start);

					jS.setChanged(true);

					jS.offsetFormulas({
							row:start,
							col:0
						}, {
							row:-qty,
							col:0
						},
						false,
						true
					);

					jS.setDirty(true);

					jS.evt.cellEditAbandon();

					if (pane.inPlaceEdit) {
						pane.inPlaceEdit.goToTd();
					}

					jS.trigger('sheetDeleteRow', i);
				},

				/**
				 * removes the columns associated with highlighted cells
				 * @param {Number} [i]
				 * @memberOf jS
				 */
				deleteColumn:function (i) {
					var j,
						start,
						end,
						qty,
						size = jS.sheetSize(),
						cells,
						k,
						pane = jS.obj.pane(),
						highlighter = jS.highlighter;

					if (i) {
						start = end = i;
					} else {
						start = (highlighter.startColumnIndex < highlighter.endColumnIndex ? highlighter.startColumnIndex : highlighter.endColumnIndex);
						end = (highlighter.endColumnIndex > highlighter.startColumnIndex ? highlighter.endColumnIndex : highlighter.startColumnIndex);
					}

					qty = (end - start) + 1;

					if (
						start < 1
							|| size.cols < 2
							|| qty >= size.cols
						) {
						return;
					}

					j = end;

					jS.obj.barHelper().remove();
					do {
						var table = jS.obj.table(),
							col = jS.col(table[0], j);

						//now remove bar
						$(jS.obj.barTop(j)).remove();

						//now remove col
						$(col).remove();
					} while (start < j--);

					//remove column
					jS.controls.bar.x.th[jS.i].splice(start, qty);

					//remove cells & tds
					k = jS.spreadsheets[jS.i].length - qty;
					do {
						cells = jS.spreadsheets[jS.i][k].splice(start, qty);
						while (cells.length > 0) {
							$(cells.pop().td).remove();
						}
					} while (k-- > 1);

					//refresh labels
					jS.refreshColumnLabels(start);

					jS.setChanged(true);

					jS.offsetFormulas({
							row:0,
							col:start
						}, {
							row:0,
							col:-qty
						},
						false,
						true
					);

					jS.setDirty(true);

					jS.evt.cellEditAbandon();

					if (pane.inPlaceEdit) {
						pane.inPlaceEdit.goToTd();
					}

					jS.trigger('sheetDeleteColumn', j);
				},

				/**
				 * manages a tabs inner value
				 * @param {Boolean} [get] makes return the current value of the tab
				 * @param {Function} [callback]
				 * @returns {String}
				 * @memberOf jS
				 */
				sheetTab:function (get, callback) {
					var sheetTab = '',
						table;
					if (get) {
						table = jS.obj.table();
						sheetTab = table.attr('title') || jS.msg.sheetTitleDefault.replace(/[{]index[}]/gi, jS.i + 1);
						if (callback) {
							table.attr('title', sheetTab);
							callback(sheetTab);
						}
						return sheetTab;
					} else if (jS.isSheetEditable() && s.editableNames) { //ensure that the sheet is editable, then let them change the sheet's name
						s.prompt(
							jS.msg.newSheetTitle,
							function(newTitle) {
								if (!newTitle) { //The user didn't set the new tab name
									sheetTab = jS.obj.table().attr('title');
									newTitle = (sheetTab ? sheetTab : jS.msg.sheetTitleDefault.replace(/[{]index[}]/gi, jS.i + 1));
								} else {
									jS.setDirty(true);
									jS.obj.table().attr('title', newTitle);
									jS.obj.tab().html(newTitle);

									sheetTab = newTitle;
								}

								if (callback) {
									callback($(document.createElement('div')).text(sheetTab).html());
								}
							},
							jS.sheetTab(true)
						);
						return null;
					}
				},

				/**
				 * scrolls the sheet to the selected cell
				 * @param {HTMLElement} [td] default is tdActive
				 * @param {boolean} [dontMoveAutoFiller] keeps autoFillerHandler in default position
				 * @memberOf jS
				 */
				followMe:function (td, dontMoveAutoFiller) {
					td = td || jS.obj.tdActive();
					if (td === null) return;

					var pane = jS.obj.pane(),
						actionUI = pane.actionUI;

					jS.setBusy(true);

					actionUI.putTdInView(td);

					jS.setBusy(false);

					if(!dontMoveAutoFiller){
						jS.autoFillerGoToTd(td);
					}
				},

				/**
				 * moves autoFiller to a selected cell if it is enabled in settings
				 * @param {HTMLElement} [td] default is tdActive
				 * @param {Number} [h] height of a td object
				 * @param {Number} [w] width of a td object
				 * @memberOf jS
				 */
				autoFillerGoToTd:function (td, h, w) {
					if (!s.autoFiller) return;

					if (td === u && jS.cellLast !== null) {
						td = jS.cellLast.td;
					}

					if (td && td.type == 'cell') { //ensure that it is a usable cell
						h = h || td.clientHeight;
						w = w || td.clientWidth;
						if (!td.offsetHeight || !td.offsetWidth || !td.clientHeight || !td.clientWidth) {
							jS.autoFillerHide();
							return;
						}

						var tdPos = $(td).position();

						jS.obj.autoFiller()
							.show()
							.css('top', ((tdPos.top + (h || td.clientHeight) - 3) + 'px'))
							.css('left', ((tdPos.left + (w || td.clientWidth) - 3) + 'px'));
					}
				},

				/**
				 * hides the auto filler if it is enabled in settings
				 * @memberOf jS
				 */
				autoFillerHide:function () {
					if (!s.autoFiller) return;

					jS.obj.autoFiller().hide();
				},

				/**
				 * sets active a spreadsheet inside of a sheet instance
				 * @param {Number} [i] a sheet integer desired to show, default 0
				 * @param {Object} [spreadsheetUI]
				 * @memberOf jS
				 */
				setActiveSheet:function (i, spreadsheetUI) {
					if (spreadsheetUI !== u) {
						i = spreadsheetUI.i;
					} else {
						i = i || 0;
					}

					if (jS.cellLast !== null && (jS.cellLast.rowIndex > 0 || jS.cellLast.columnIndex > 0)) {
						jS.evt.cellEditDone();
						jS.obj.formula().val('');
					}

					//the below use of _scrollLeft and _scrollTop are protected from IE, which makes those attributes go away after something is hidden, thus forgetting where you are scrolled to when you change sheets
					//IE, stop flossin' me
					var enclosures = jS.obj.enclosures(),
						j = enclosures.length - 1,
						enclosure,
						pane;

					jS.autoFillerHide();

					if (j > 0) {
						do {
							if (i != j) {
								enclosure = enclosures[j];
								enclosure._scrollLeft = enclosure._scrollLeft || enclosure.scrollUI.scrollLeft;
								enclosure._scrollTop = enclosure._scrollTop || enclosure.scrollUI.scrollTop;
								enclosure.style.display = "none";
							}
						} while (j-- > 0);
					}

					jS.i = i;

					if (spreadsheetUI !== u) {
						enclosure = spreadsheetUI.enclosure;
					} else {
						enclosure = jS.controls.enclosure[i][0];
					}

					enclosure.style.display = "";

					jS.highlighter.setTab(jS.obj.tab());

					jS.readOnly[i] = (enclosure.table.className || '').match(/\breadonly\b/i) != null;

					pane = enclosure.pane;
					if (pane.inPlaceEdit) {
						pane.inPlaceEdit.goToTd();
					}

					enclosure.scrollUI.scrollLeft = enclosure._scrollLeft || enclosure.scrollUI.scrollLeft;
					enclosure.scrollUI.scrollTop = enclosure._scrollTop || enclosure.scrollUI.scrollTop;
					enclosure._scrollLeft = enclosure._scrollTop = null;
					enclosure.scrollUI.onscroll();
				},


				getSpreadsheetIndexByTitle: function(title) {
					if (s.loader !== null) {
						var spreadsheetIndex = s.loader.getSpreadsheetIndexByTitle(title);
						return spreadsheetIndex;
					}

					var tables = jS.obj.tables(),
						max = tables.length,
						table,
						i = 0;

					for (;i < max; i++) {
						table = tables[i];
						if (table.getAttribute('title') == title) {
							return table.spreadsheetIndex;
						}
					}

					return null;
				},


				/**
				 * opens a spreadsheet into the active sheet instance
				 * @param {Array} tables
				 * @memberOf jS
				 */
				openSheet:function (tables) {
					var lastIndex = tables.length - 1,
						open = function() {
							jS.setBusy(true);
							var header = jS.controlFactory.header(),
								ui = jS.controlFactory.ui(),
								sheetAdder = jS.controlFactory.sheetAdder(),
								tabContainer = jS.controlFactory.tabContainer(),
								i,
								options = {
									sizeCheck: function(spreadsheetUI) {
										if ($.sheet.max) {
											var size = jS.tableSize(spreadsheetUI.table);
											if (size.rows > $.sheet.max || size.cols > $.sheet.max) {
												jS.trigger('sheetMaxSize', [spreadsheetUI.table, spreadsheetUI.i]);
												s.confirm(
													jS.msg.maxSizeBrowserLimitationOnOpen,
													function() {spreadsheetUI.load();}
												);
											} else {
												spreadsheetUI.load();
											}
										} else {
											spreadsheetUI.load();
										}
									},
									initChildren: function(ui, table, i) {
										jS.controlFactory.sheetUI(ui, table, i);
										jS.trigger('sheetOpened', [i]);
									},
									done: function(stack) {
										jS.sheetSyncSize();

										jS.setActiveSheet(0);

										jS.setDirty(false);
										jS.setBusy(false);

										while (stack.length > 0) {
											jS.calcVisibleInit(jS.i = stack.pop());
										}

										jS.trigger('sheetAllOpened');
									},
									lastIndex: lastIndex
								},
								firstSpreadsheetUI;

							header.ui = ui;
							header.tabContainer = tabContainer;

							ui.header = header;
							ui.sheetAdder = sheetAdder;
							ui.tabContainer = tabContainer;

							tabContainer.header = header;
							tabContainer.ui = ui;

							s.parent
								.append(header)
								.append(ui)
								.append(sheetAdder)
								.append(tabContainer);

							// resizable container div
							jS.resizableSheet(s.parent, {
								minWidth:s.parent.width() * 0.1,
								minHeight:s.parent.height() * 0.1,
								start:function () {
									jS.setBusy(true);
									jS.obj.enclosure().hide();
									ui.sheetAdder.hide();
									ui.tabContainer.hide();
								},
								stop:function () {
									jS.obj.enclosure().show();
									ui.sheetAdder.show();
									ui.tabContainer.show();
									jS.setBusy(false);
									jS.sheetSyncSize();
									var pane = jS.obj.pane();
									if (pane.inPlaceEdit) {
										pane.inPlaceEdit.goToTd();
									}
								}
							});



							if (s.loader === null) {
								for (i = 0; i < tables.length; i++) {
									new Sheet.SpreadsheetUI(i, ui, tables[i], options);
									jS.sheetCount++;
								}
							} else {

								jS.insertSheet = function(data, i, makeVisible, table) {
									jS.sheetCount++;
									data = data || null;
									table = table || document.createElement('table');
									makeVisible = makeVisible !== u ? makeVisible : true;
									i = i || jS.sheetCount - 1;

									if (data !== null) {
										s.loader.addSpreadsheet(data);
									}

									if (!table.hasAttribute('title')) {
										table.setAttribute('title', s.loader.title(i));
									}

									var showSpreadsheet = function() {
											jS.obj.enclosure().hide();
											jS.setBusy(true);
											var spreadsheetUI = new Sheet.SpreadsheetUI(i, ui, table, options);
											jS.setActiveSheet(-1, spreadsheetUI);
											jS.calcVisibleInit(i);
											jS.setBusy(false);
											jS.sheetSyncSize();
										},
										tab;

									if (makeVisible) {
										showSpreadsheet();
										return;
									}


									tab = jS.controlFactory.customTab(table.getAttribute('title'))
										.mousedown(function () {
											showSpreadsheet();
											jS.obj.tab().insertBefore(this);
											$(this).remove();
											return false;
										});

									if (s.loader.isHidden(i)) {
										tab.hide();
									}
								};

								//always load at least the first spreadsheet
								firstSpreadsheetUI = new Sheet.SpreadsheetUI(0, ui, tables[0], options);
								jS.sheetCount++;

								if (tables.length > 1) {
									//set the others up to load on demand
									for (i = 1; i < tables.length; i++) {
										jS.insertSheet(null, i, false, tables[i]);
									}
									jS.i = 0;

									firstSpreadsheetUI.loaded();
								}
							}
						};

					if (jS.isDirty) {
						s.confirm(
							jS.msg.openSheet,
							open
						);
					} else {
						open();
					}
				},

				/**
				 * creates a new sheet from size from prompt
				 * @memberOf jS
				 */
				newSheet:function () {
					s.parent
						.html($.sheet.makeTable())
						.sheet(s);
				},


				/**
				 * synchronizes the called parent's controls so that the controls fit correctly within the parent
				 * @function sheetSyncSize
				 * @memberOf jS
				 */
				sheetSyncSize:function () {
					var $parent = s.parent,
						parent = $parent[0],
						h = parent.clientHeight,
						w = parent.clientWidth,
						$tabContainer = jS.obj.tabContainer(),
						tabContainer = $tabContainer[0],
						tabContainerStyle = tabContainer.style,
						scrollBarWidth = window.scrollBarSize.width,
						tabContainerInnerWidth,
						tabContainerOuterWidth,
						widthTabContainer,
						heightTabContainer,
						uiStyle = jS.obj.ui.style,
						paneHeight,
						paneWidth,
						standardHeight,
						standardWidth,
						tabContainerScrollLeft;

					if (!h) {
						h = 400; //Height really needs to be set by the parent
						$parent.height(h);
					} else if (h < 200) {
						h = 200;
						$parent.height(h);
					}
					tabContainerScrollLeft = tabContainer.scrollLeft;
					tabContainerStyle.width = '';
					tabContainerInnerWidth = tabContainer.clientWidth;
					tabContainerOuterWidth = (w - (s.colMargin + scrollBarWidth));
					widthTabContainer = (w - s.colMargin * 2) + 'px';
					heightTabContainer = ((s.colMargin + scrollBarWidth) + 'px');
					if (tabContainerInnerWidth > tabContainerOuterWidth) {
						tabContainerStyle.height = heightTabContainer;
						$tabContainer.addClass(jS.cl.tabContainerScrollable);
						h -= scrollBarWidth;
					} else {
						tabContainerStyle.height = null;
						$tabContainer.removeClass(jS.cl.tabContainerScrollable);
					}
					tabContainerStyle.width = widthTabContainer;
					tabContainer.scrollLeft = tabContainerScrollLeft;

					h -= jS.obj.header().outerHeight() + s.boxModelCorrection;
					h -= tabContainer.clientHeight + s.boxModelCorrection;

					paneHeight = (h - window.scrollBarSize.height - s.boxModelCorrection) + 'px';
					paneWidth = (w - window.scrollBarSize.width) + 'px';
					standardHeight = (h + 'px');
					standardWidth = (w + 'px');

					jS.obj.panes().each(function() {
						var style = this.style,
							scrollStyle = this.actionUI.scrollUI.style,
							enclosureStyle = this.enclosure.style;

						style.height = paneHeight;
						style.width = paneWidth;

						enclosureStyle.height = scrollStyle.height = standardHeight;
						enclosureStyle.width = scrollStyle.width = standardWidth;
					});


					uiStyle.height = standardHeight;
					uiStyle.width = standardWidth;
				},

				/**
				 *
				 */
				showSheets: function() {
					jS.obj.tabContainer().children().each(function(i) {
						$(this).show();
						if (s.loader !== null) {
							s.loader.setMetadata(i, {
								hidden: false
							});
						}
					});
				},

				showSheet: function(sheetIndex) {
					jS.obj.tabContainer().children().eq(sheetIndex).show();
					if (s.loader !== null) {
						s.loader.setMetadata(sheetIndex, {
							hidden: false
						});
					}
				},

				hideSheet: function(sheetIndex) {
					jS.obj.tabContainer().children().eq(sheetIndex).hide();
					if (s.loader !== null) {
						s.loader.setMetadata(sheetIndex, {
							hidden: true
						});
					}
				},

				/**
				 * changes a cell's style and makes it undoable/redoable
				 * @param style
				 * @param value
				 * @param cells
				 */
				cellChangeStyle:function (style, value, cells) {
					cells = cells || jS.highlighted(true);
					if (cells.length < 1) {
						return false;
					}

					jS.setDirty(this);
					var i = cells.length - 1;

					if ( i >= 0) {
						jS.undo.createCells(cells, function(cells) { //save state, make it undoable
							do {
								cells[i].td.css(style, value);
							} while(i--);

							return cells;
						});
						return true;
					}

					return false;
				},

				/**
				 * Finds a cell in a sheet from a value
				 * @param {String} [v] value to look for within a cell, if not supplied, a prompt is given
				 * @memberOf jS
				 */
				cellFind:function (v) {
					function find (v) {
						var trs = jS.obj.table()
							.children('tbody')
							.children('tr');

						if (v) {//We just do a simple uppercase/lowercase search.
							var o = trs.children('td:contains("' + v + '")');

							if (o.length < 1) {
								o = trs.children('td:contains("' + v.toLowerCase() + '")');
							}

							if (o.length < 1) {
								o = trs.children('td:contains("' + v.toUpperCase() + '")');
							}

							o = o.eq(0);
							if (o.length > 0) {
								jS.cellEdit(o);
							} else {
								s.alert(jS.msg.cellNoFind);
							}						   }
					}
					if (!v) {
						s.prompt(
							jS.msg.cellFind,
							find
						);
					} else {
						find(v);
					}

				},

				/**
				 * Sets active bar
				 * @param {String} type "col" || "row" || "all"
				 * @param {Number} begin start highlighting from
				 * @param {Number} end end highlighting to
				 * @memberOf jS
				 */
				cellSetActiveBar:function (type, begin, end) {
					var size = jS.sheetSize(),
						first = math.min(begin, end),
						last = math.max(begin, end),
						start = {},
						stop = {},

						/**
						 * Sets active bar
						 * @param {Boolean} [before]
						 */
						SetActive = function (before) {
							switch (s.cellSelectModel) {
								case Sheet.openOfficeSelectModel: //follow cursor behavior
									this.row = (before ? start.row : stop.row);
									this.col = (before ? start.col : stop.col);
									this.td = jS.getTd(-1, this.row, this.col);
									if (this.td !== null && (jS.cellLast !== null && this.td !== jS.cellLast.td)) {
										jS.cellEdit(this.td, false, true);
									}
									break;
								default: //stay at initial cell
									this.row = (before ? stop.row : start.row);
									this.col = (before ? stop.col : start.col);
									this.td = jS.getTd(-1, this.row, this.col);
									if (this.td !== null && (jS.cellLast !== null && this.td !== jS.cellLast.td)) {
										jS.cellEdit(this.td, false, true);
									}
									break;
							}
						},
						obj = [],
						scrolledArea  = jS.obj.pane().actionUI.scrolledArea,
						sheet = jS.obj.table(),
						col,
						row,
						td,
						highlighter = jS.highlighter;

					switch (type) {
						case 'top':
							start.row = scrolledArea.row;
							start.col = first;
							stop.row = scrolledArea.row;
							stop.col = last;

							highlighter.startRowIndex = 1;
							highlighter.startColumnIndex = first;
							highlighter.endRowIndex = size.rows;
							highlighter.endColumnIndex = last;

							col = last;

							do {
								obj.push(jS.col(sheet[0], col));
							} while(col-- > first);
							break;
						case 'left':
							start.row = first;
							start.col = scrolledArea.col;
							stop.row = last;
							stop.col = scrolledArea.col;

							highlighter.startRowIndex = first;
							highlighter.startColumnIndex = 1;
							highlighter.endRowIndex = last;
							highlighter.endColumn = size.cols;

							row = last;

							do {
								td = jS.getTd(-1, row, 1);
								if (td === null) continue;
								obj.push(td.parentNode);
							} while(row-- > first);
							break;
						case 'corner': //all
							start.row = 1;
							start.col = 1;
							stop.col = size.cols;
							stop.row = size.rows;

							obj.push(sheet[0]);
							break;
					}

					new SetActive(begin > end);

					jS.highlighter.set(obj);
				},

				/**
				 * gets a range of selected cells, then returns it
				 * @param {Object} [e] jQuery event, when in use, is during mouse down
				 * @param {String} v Value to preserve and return
				 * @param {String} [newFn]
				 * @param {Boolean} [notSetFormula]
				 * @returns {String}
				 * @memberOf jS
				 */
				getTdRange:function (e, v, newFn, notSetFormula) {
					jS.cellLast.isEdit = true;

					var range = function (loc) {
							if (loc.first.col > loc.last.col ||
								loc.first.row > loc.last.row
								) {
								return {
									first:jSE.parseCellName(loc.last.col, loc.last.row),
									last:jSE.parseCellName(loc.first.col, loc.first.row)
								};
							} else {
								return {
									first:jSE.parseCellName(loc.first.col, loc.first.row),
									last:jSE.parseCellName(loc.last.col, loc.last.row)
								};
							}
						},
						label = function (loc) {
							var rangeLabel = range(loc),
								v2 = v + '';
							v2 = (v2.match(/=/) ? v2 : '=' + v2); //make sure we can use this value as a formula

							if (newFn || v2.charAt(v2.length - 1) != '(') { //if a function is being sent, make sure it can be called by wrapping it in ()
								v2 = v2 + (newFn ? newFn : '') + '(';
							}

							var formula,
								lastChar = '';
							if (rangeLabel.first != rangeLabel.last) {
								formula = rangeLabel.first + ':' + rangeLabel.last;
							} else {
								formula = rangeLabel.first;
							}

							if (v2.charAt(v2.length - 1) == '(') {
								lastChar = ')';
							}

							return v2 + formula + lastChar;
						},
						newVal = '',
						loc,
						sheet,
						cells;

					if (e) { //if from an event, we use mousemove method
						loc = {
							first:jS.getTdLocation([e.target])
						};

						sheet = jS.obj.table().mousemove(function (e) {
							loc.last = jS.getTdLocation([e.target]);

							newVal = label(loc);

							if (!notSetFormula) {
								jS.obj.formula().val(newVal);
								jS.obj.inPlaceEdit().val(newVal);
							}
						});

						$document.one('mouseup', function () {
							sheet.unbind('mousemove');
							return newVal;
						});
					} else {
						cells = jS.highlighted().not(jS.obj.tdActive());

						if (cells.length) {
							loc = { //tr/td column and row index
								first:jS.getTdLocation(cells.first()),
								last:jS.getTdLocation(cells.last())
							};

							newVal = label(loc);

							if (!notSetFormula) {
								jS.obj.formula().val(newVal);
								jS.obj.inPlaceEdit().val(newVal);
							}

							return newVal;
						} else {
							return '';
						}
					}
					return '';
				},

				/**
				 * Gets the td element within a spreadsheet instance
				 * @param {Number} tableIndex table index
				 * @param {Number} rowIndex row index
				 * @param {Number} colIndex column index
				 * @returns {HTMLElement|null}
				 * @memberOf jS
				 */
				getTd:function (tableIndex, rowIndex, colIndex) {
					var table = (tableIndex > -1 ? jS.obj.tables()[tableIndex] : jS.obj.table()[0]),
						tBody,
						row,
						td;

					if (
						!table
							|| !(tBody = table.tBody)
							|| !(row = tBody.children[rowIndex])
							|| !(td = row.children[colIndex])
						) {
						return null;
					}

					return td;
				},

				/**
				 * Gets the td row and column index as an object {row, col}
				 * @param {HTMLTableCellElement} td
				 * @returns {Object}
				 * @memberOf jS
				 */
				getTdLocation:function (td) {
					var result = {col:0, row:0},
						rowOffset = 0,
						pane = jS.obj.pane();

					//rowOffset = pane.actionUI.yDetacher.aboveIndex;

					if (td === u || td === null) return result;

					if (td.parentNode === u || (td.parentNode.rowIndex + rowOffset) < 0) {
						return result;
					}

					return {
						col: td.cellIndex,
						row: td.parentNode.rowIndex + rowOffset
					};
				},

				/**
				 * Get the bar index from an Element
				 * @memberOf jS
				 * @namespace
				 */
				getBarIndex:{

					/**
					 * get index from bar left element
					 * @param [td] if null, will return -1
					 * @returns {Number}
					 * @memberOf jS.getBarIndex
					 */
					left:function (td) {
						td = td || {};
						if (!td.parentNode || n(td.parentNode.rowIndex)) {
							return -1;
						} else {
							return td.parentNode.rowIndex;
						}
					},

					/**
					 * get index from bar top element
					 * @param [td] if null, will return -1
					 * @returns {Number} cellIndex
					 * @memberOf hS.getBarIndex
					 */
					top:function (td) {
						td = td || {};
						if (n(td.cellIndex)) {
							return -1;
						} else {
							return td.cellIndex;
						}
					},
					corner:function () {
						return 0;
					}
				},

				/**
				 * Time manager for measuring execution speed
				 * @namespace
				 * @memberOf jS
				 */
				time:{
					now:new Date(),
					last:new Date(),
					diff:function () {
						return math.abs(math.ceil(this.last.getTime() - this.now.getTime()) / 1000).toFixed(5);
					},
					set:function () {
						this.last = this.now;
						this.now = new Date();
					},
					get:function () {
						return this.now.getHours() + ':' + this.now.getMinutes() + ':' + this.now.getSeconds();
					}
				},

				/**
				 * Changed tracker per sheet
				 * @memberOf jS
				 */
				changed:[],

				/**
				 * Changed = needs to be calculated
				 * @memberOf jS
				 * @param tableIndex
				 */
				isChanged:function (tableIndex) {
					return jS.changed[tableIndex || jS.i];
				},

				/**
				 * Sets changed
				 * @param {Boolean} changed changed state
				 * @memberOf jS
				 */
				setChanged:function (changed) {
					jS.changed[jS.i] = changed;
				},

				/**
				 * Dirty = changed needs saved
				 * @memberOf jS
				 */
				isDirty:false,

				/**
				 * Dirty manager
				 * @param dirty
				 * @memberOf jS
				 */
				setDirty:function (dirty) {
					jS.dirty = dirty;
				},

				/**
				 * @param v
				 * @memberOf jS
				 */
				appendToFormula:function (v) {
					var formula = jS.obj.formula(),
						fV = formula.val();

					if (fV.charAt(0) != '=') {
						fV = '=' + fV;
					}

					formula.val(fV + v);
				},

				/**
				 * undo manager integration
				 * @memberOf jS
				 * @namespace
				 */
				undo:{
					manager:(
						window.UndoManager
							? new UndoManager()
							: {
								undo: emptyFN,
								redo: emptyFN,
								register: emptyFN
							}),
					cells:[],
					id:-1,
					createCells: function(cells, fn, id) {
						if (id === u) {
							jS.undo.id++;
							id = jS.undo.id;
						}

						var before = (new Sheet.CellRange(cells)).clone().cells,
							after = (fn !== u ? (new Sheet.CellRange(fn(cells)).clone()).cells : before);

						before.id = id;
						after.id = id;

						jS.undo.manager.add({
							undo: function() {
								jS.undo.removeCells(before, id);
							},
							redo: function() {
								jS.undo.createCells(after, null, id);
							}
						});

						if (id !== jS.undo.id) {
							jS.undo.draw(after);
						}

						return true;
					},
					removeCells: function(cells, id) {
						var i = 0, index = -1;
						if (cells.id === id) {
							index = i;
						}

						if (index !== -1) {
							jS.undo.cells.splice(index, 1);
						}
						jS.undo.draw(cells);
					},
					draw: function(clones) {
						var i,
							td,
							clone,
							cell,
							loc;

						for (i = 0; i < clones.length; i++) {
							clone = clones[i];
							loc = jS.getTdLocation(clone.td);
							cell = jS.spreadsheets[clone.sheetIndex][loc.row][loc.col];

							//TODO add clone method to Sheet.Cell
							cell.value = clone.value;
							cell.formula = clone.formula;
							td = cell.td = clone.td;
							cell.dependencies = clone.dependencies;
							cell.needsUpdated = clone.needsUpdated;
							cell.calcCount = clone.calcCount;
							cell.sheetIndex = clone.sheetIndex;
							cell.rowIndex = loc.row;
							cell.columnIndex = loc.col;
							cell.state = clone.state;
							cell.jS = clone.jS;
							td.setAttribute('style', clone.style);
							td.setAttribute('class', clone.cl);

							cell.setNeedsUpdated();
							cell.updateValue();
						}
					}
				},

				/**
				 * get cols associated with a sheet/table within an instance
				 * @param {jQuery|HTMLElement} [table]
				 * @returns {HTMLCollection|Array}
				 * @memberOf jS
				 */
				cols:function (table) {
					table = table || jS.obj.table()[0];

					//table / colGroup / col
					if (!table) return [];
					if (!table.colGroup) return [];
					if (!table.colGroup.children) return [];

					return table.colGroup.children
				},

				/**
				 * clone tables associated with sheet, and return them free of decorations and enclosure/pane etc.
				 * @param {jQuery|HTMLElement} [tables]
				 * @param {Boolean} [useActualTables]
				 * @returns {jQuery|Element}
				 * @memberOf jS
				 */
				tables:function (tables, useActualTables) {
					tables = tables || jS.obj.tables();
					var clonedTables = [],
						i = tables.length - 1,
						j,
						table,
						tBody,
						colGroup,
						colLeft,
						tdLeft,
						trTop,
						trs,
						tr;

					do {
						table = (useActualTables ? document.body.removeChild(tables[i]) : tables[i].cloneNode(true));

						if (
							(colGroup = table.children[0])
								&& (colLeft = colGroup.children[0])
							) {
							colGroup.removeChild(colLeft);
						}

						if (tBody = table.children[1]) {
							trs = tBody.children;
							trTop = trs[0];
							tBody.removeChild(trTop);
							j = trs.length - 1;
							do {
								tr = trs[j];
								tdLeft = tr.children[0];
								tr.removeChild(tdLeft);
							} while ( j-- > 0 ); //1 because trTop still exists in the array
						}
						clonedTables[i] = table;
					} while (i-- > 0);

					return jS.sheetDecorateRemove(false, $(clonedTables));
				},

				/**
				 * get col associated with a sheet/table within an instance
				 * @param {jQuery|HTMLElement} table
				 * @param {Number} [i] Index of column, default is last
				 * @returns {Element}
				 * @memberOf jS
				 */
				col:function (table, i) {
					table = table || jS.obj.table()[0];

					var cols = jS.cols(table);

					if (i === u) {
						i = cols.length - 1;
					}

					return cols[i];
				},

				/**
				 * get cells of a table row
				 * @param {HTMLElement} [table]
				 * @param {Number} [i] Index of row, default is last
				 * @returns {HTMLCollection|Array}
				 * @memberOf jS
				 */
				rowTds:function (table, i) {
					table = table || jS.obj.table();

					var rows = jS.rows(table);

					if (!rows.length) {
						return [];
					}

					if (i == u) {
						i = rows.length - 1;
					}


					if (!rows[i]) return []; //tr
					if (!rows[i].children) return []; //td

					return rows[i].children;
				},

				/**
				 * Get rows of a sheet/table
				 * @param {HTMLElement} table
				 * @returns {HTMLCollection|Array}
				 * @memberOf jS
				 */
				rows:function (table) {
					table = table || jS.obj.table()[0];
					if (table === u) return []; //table
					if (table.tBody === u) return []; //tBody
					if (table.tBody.children === u) return []; //tr

					return table.tBody.children;
				},

				/**
				 * Get all the td objects that are currently highlighted
				 * @param {Boolean} [cells] will return cell objects rather than HTMLElement
				 * @returns {jQuery|HTMLElement|Array}
				 */
				highlighted:function(cells) {
					var highlighted = jS.highlighter.last || $([]),
						obj = [],
						tag,
						i;

					if (!(tag = highlighted) || !highlighted.length || !(tag = tag[0]) || !tag.tagName) {
						return cells ? obj : $(obj);
					}

					switch (tag.tagName) {
						case 'TD':
							i = highlighted.length - 1;
							do {
								obj.unshift(cells ? highlighted[i].jSCell : highlighted[i]);
							} while (i-- > 0);
							break;
						case 'TR':
							i = highlighted.length - 1;
							do {
								if (highlighted[i].tds) {
									obj = obj.concat(cells ? highlighted[i].jSCells : highlighted[i].tds);
								}
							} while(i-- > 0);
							break;
						case 'COL':
							highlighted = highlighted.filter('col');
							i = highlighted.length - 1;
							do {
								if (highlighted[i].tds) {
									obj = obj.concat(cells ? highlighted[i].jSCells : highlighted[i].tds);
								}
							} while(i-- > 0);
							break;
						case 'TABLE':
							obj = (cells ? tag.jSCells : tag.tds);
							break;
					}

					return cells ? obj : $(obj);
				},

				/**
				 *
				 * @param {jQuery|HTMLElement} [table]
				 * @returns {Object} {cols, rows}
				 * @memberOf jS
				 */
				sheetSize:function (table) {
					table = table || jS.obj.table()[0];

					var lastRow,
						loc,
						size = {},
						minSize = s.minSize || {rows: 1, cols: 1},
						loaderSize;

					//if we are using a dataloader, get the size from that too and compare
					if (s.loader !== null) {
						loaderSize = s.loader.size(table.spreadsheetIndex);

						size.rows = Math.max(loaderSize.rows, minSize.rows);
						size.cols = Math.max(loaderSize.cols, minSize.cols);
					}
					 else {
						//table / tBody / tr / td

						if (
							(size.cols = s.initScrollCols) > 0
							&& (size.rows = s.initScrollRows) > 0
						) {
							//already set from above
						} else {
							lastRow = jS.rowTds(table);
							loc = jS.getTdLocation(lastRow[lastRow.length - 1]);
							size.cols = loc.col;
							size.rows = loc.row;
						}
					}


					return size;
				},

				sortVerticalSelectAscending:function() {
					if (confirm('Do you want to extend your selection?')) {
						jS.sortVertical(); return true;
					} else {
						jS.sortVerticalSingle(false); return true
					}
				},

				sortVerticalSelectDescending:function() {
					if (confirm('Do you want to extend your selection?')) {
						jS.sortVertical(); return false;
					} else {
						jS.sortVerticalSingle(true); return false
					}
				},


				/**
				 * Sorts what is highlighted vertically, and updates accordingly
				 * @param {Boolean} [reversed]
				 * @memberOf jS
				 */
				sortVertical:function (reversed) {

					var selected = jS.highlighted(true),
						trSibling = selected[0].td.parent().prev(),
						length = selected.length,
						date = new Date(),
						isNum = true,
						vals = [],
						row = [],
						offset,
						i = 0,
						cell,
						val,
						td;

					while(i<length){
						cell = selected[i];
						td = cell.td;
						if(!isNaN(cell.value)){
							val = (new Number(cell.value.valueOf()));
						}
						else{
							isNum = false;
							val = (new String(cell.value.valueOf()));
						}
						val.loc = jS.getTdLocation(td);
						val.row = td.parentNode;
						val.col = td;
						val.cell = cell;
						vals.push(val);
						i++;
					}


					if(reversed){
						if(isNum == false){
							vals.sort(function(a,b){return b-a});
						}
						else{
							vals.sort();
							vals.reverse();
						}
					}

					else
					{
						if(isNum == true){
							vals.sort(function(a,b){return a-b});
						}
						else{
							vals.sort();
						}
					}

					jS.undo.createCells(selected);
					while(offset = vals.length)							{
						val = vals.pop();
						row = jS.spreadsheets[jS.i].splice(val.row.rowIndex, 1);
						cell = val.cell;
						cell.value = val.valueOf();
						val.row.parentNode.removeChild(val.row);
						trSibling.after(val.row);
						val.row.children[0].innerHTML = trSibling[0].rowIndex + offset;
						jS.spreadsheets[jS.i].splice(trSibling[0].rowIndex + 1, 0, row[0]);
						jS.track.call(cell, true);
					}

					jS.undo.createCells(selected);
				},

				/**
				 * Sorts a single column
				 * @param reversed
				 */
				sortVerticalSingle: function (reversed) {
					var selected = jS.highlighted(true),
						length = selected.length,
						i =  0,
						num = [],
						cell;

					while(i<length){
						num.push(selected[i].value);
						i++
					}
					if(reversed){
						num.sort(function(a,b){return b-a});
					}
					else{
						num.sort(function(a,b){return a-b});
					}
					while(selected.length){
						cell = selected.pop();
						cell.value = num[selected.length];
						cell.updateValue();
					}
				},

				sortHorizontalSelectAscending:function() {
					if (confirm('Do you want to extend your selection?')) {
						jS.sortHorizontal(); return true;
					} else {
						jS.sortHorizontalSingle(false); return true;
					}
				},

				sortHorizontalSelectDescending:function() {
					if (confirm('Do you want to extend your selection?')) {
						jS.sortHorizontal(); return false;
					} else {
						jS.sortHorizontalSingle(true); return false;
					}
				},

				/**
				 * Sorts what is highlighted horizontally, and updates accordingly
				 * @param {Boolean} [reversed]
				 * @memberOf jS
				 */
				sortHorizontal:function (reversed) {

					var selected = jS.highlighted(true),
						tdSibling = selected[0].td[0],
						tdSiblingIndex = tdSibling.cellIndex,
						colGroup = tdSibling.table.colGroup,
						size = jS.sheetSize().rows,
						length = selected.length,
						date = new Date(),
						isNum = true,
						vals = [],
						offset,
						i = 0,
						x,
						cell,
						val,
						tr,
						td;

					while(i<length){
						x = 0;
						cell = selected[i];
						td = cell.td;
						if(!isNaN(cell.value)){
							val = new Number(cell.value.valueOf());
						}
						else{
							isNum = false;
							val = new String(cell.value.valueOf());
						}
						val.tds = [];
						val.loc = jS.getTdLocation(td);
						val.tr = td.parentNode;
						val.td = td;
						val.cell = cell;
						while(x <= size){
							val.tds.push(jS.obj.pane().table.children[1].children[x].children[td.cellIndex]);
							x++;
						}
						vals.push(val);
						i++;

					}


					if(reversed){
						if(isNum == false){
							vals.sort(function(a,b){return b-a});
						}
						else{
							vals.sort();
							vals.reverse();
						}
					}

					else
					{
						if(isNum == true){
							vals.sort(function(a,b){return a-b});
						}
						else{
							vals.sort();
						}
					}

					jS.undo.createCells(selected);
					while(vals.length){
						val = vals.pop();
						while(val.tds.length > 1){
							td = val.tds.pop();
							tr = td.parentNode;
							cell = jS.spreadsheets[jS.i][tr.rowIndex].splice(td.cellIndex, 1);
							tr.insertBefore(td, tr.children[tdSiblingIndex]);
							td.col = colGroup.children[vals.length + td.cellIndex - 1];
							td.barTop = td.col.bar;
							cell.value = td.jSCell.value;
							jS.spreadsheets[jS.i][tr.rowIndex].splice(td.cellIndex, 0, cell[0]);
							jS.resolveCell(cell, true);
						}
					}
					jS.undo.createCells(selected);
				},

				/**
				 * Sorts a single row
				 * @param reversed
				 */
				sortHorizontalSingle: function (reversed) {
					var selected = jS.highlighted(true),
						length = selected.length,
						i =  0,
						num = [],
						cell;

					while(i<length){
						num.push(selected[i].value);
						i++
					}
					if(reversed){
						num.sort(function(a,b){return b-a});
					}
					else{
						num.sort(function(a,b){return a-b});
					}
					while(selected.length){
						cell = selected.pop();
						cell.value = num[selected.length];
						cell.updateValue();
					}
				},

				/**
				 *
				 * @param {HTMLElement} [table]
				 * @returns {Object} {cols, rows}
				 * @memberOf jS
				 */
				tableSize:function (table, getActualSize) {
					var tBody,
						tBodyChildren,
						tr,
						trChildren,
						td,
						pane = table.pane,
						row = 0,
						column = 0,
						rowOffset = 0;

					//rowOffset = pane.actionUI.yDetacher.aboveIndex;

					table = table || jS.obj.table()[0];
					//table / tBody / tr / td

					if ((tBody = table.tBody) !== u
						&& (tBodyChildren = tBody.children) !== u
						&& (tr = tBodyChildren[tBodyChildren.length - 1]) !== u
						&& (trChildren = tr.children) !== u
						&& (td = trChildren[trChildren.length - 1]) !== u
					) {
						if (getActualSize === true) {
							row = tr.rowIndex;
						} else {
							row = tr.rowIndex + rowOffset;
						}

						column = td.cellIndex;
					} else {
						return {};
					}

					return {
						cols: column,
						rows: row
					};
				},

				/**
				 * Toggles from editable to viewable and back
				 * @param replacementTables
				 * @memberOf jS
				 */
				toggleState:function (replacementTables) {
					if (s.allowToggleState) {
						var tables = replacementTables || jS.tables();
						if (s.editable) {
							jS.evt.cellEditAbandon();
							jS.trigger('sheetSave', [tables]);
						}
						jS.setDirty(false);
						jS.setChanged(true);
						s.editable = !s.editable;

						jS.kill();


						s.parent
							.html(tables)
							.sheet(s);
						s = null;
					}
				},

				/**
				 * Turns a cell into a formula variable so it can be accessed by a name
				 * @param ref
				 * @memberOf jS
				 */
				setCellRef:function (ref) {
					function setRef(ref) {
						if (ref) { //TODO: need to update value when cell is updated

							jS.s.formulaVariables[ref] = cell.updateValue();
						}
					}

					var td = jS.obj.tdActive(),
						cell = td.jSCell;

					if (ref) {
						setRef(ref);
					} else {
						s.prompt(
							jS.msg.setCellRef,
							setRef
						);
					}
				},

				/**
				 * @memberOf jS
				 */
				formulaParser: null,

				/**
				 *
				 * @param {Number} [i]
				 * @param {Boolean} [skipStyles]
				 */
				print: function(i, skipStyles) {
					i = i || jS.i;

					var pWin = window.open(),
						pDoc;


					//popup blockers
					if (pWin !== u) {
						pDoc = pWin.document;
						pDoc.write('<html>\
	<head id="head"></head>\
	<body>\
		<div id="entry" class="' + jS.cl.parent + '" style="overflow: show;">\
		</div>\
	</body>\
</html>');


						if (skipStyles !== true) {
							$(pDoc.getElementById('head')).append($('style,link').clone());
						}

						$(pDoc.getElementById('entry')).append(jS.obj.pane().cloneNode(true));
						pDoc.close();
						pWin.focus();
						pWin.print();
					}
				}
			},
			loaderTables = [],
			loaderTable;

		jS.setBusy(true);
		s.parent[0].jS = jS;

		//got tired of ie crashing when console not available
		if (!window.console) window.console = {log:function () {}};

		if (window.scrollBarSize === u) {
			window.scrollBarSize = getScrollBarSize();
		}

		if (window.defaultCharSize === u) {
			window.defaultCharSize = getAverageCharacterSize();
		}

		jS.cellHandler = new Sheet.CellHandler(jS, jSE, $.sheet.fn);

		jS.theme = new Sheet.Theme(s.theme);

		jS.highlighter = new Sheet.Highlighter(jS.theme.tdHighlighted, jS.theme.barHighlight, jS.theme.tabActive, function() {
			//Chrome has a hard time rendering table col elements when they change style, this triggers the table to be re-rendered
			jS.obj.pane().actionUI.redraw();
		});

		//We need to take the sheet out of the parent in order to get an accurate reading of it's height and width
		s.origHtml = s.parent.children().detach();

		s.parent.addClass(jS.cl.parent);

		s.parent
			.bind('sheetSwitch', function (e, js, i) {
				jS.switchSheet(i);
			})
			.bind('sheetRename', function (e, js, i) {
				jS.renameSheet(i);
			});

		//Use the setting height/width if they are there, otherwise use parent's
		s.width = (s.width ? s.width : s.parent.width());
		s.height = (s.height ? s.height : s.parent.height());


		// Drop functions if they are not needed & save time in recursion
		if (!$.nearest) {
			jS.nearest = emptyFN;
		}

		jS.resizableCells = jS.resizableSheet = jS.resizable;
		if (!$.ui) {
			jS.resizable = jS.resizableCells = jS.resizableSheet = jS.draggable = emptyFN;
		} else {
			if (!s.resizableCells) jS.resizableCells = emptyFN;
			if (!s.resizableSheet) jS.resizableSheet = emptyFN;
		}

		if (!$.support.boxModel) {
			s.boxModelCorrection = 0;
		}

		if (!s.barMenus) {
			jS.controlFactory.barMenuTop = jS.controlFactory.barMenuLeft = emptyFN;
		}

		if (!s.freezableCells) {
			jS.controlFactory.barHandleFreeze.top = jS.controlFactory.barHandleFreeze.left = emptyFN;
		}

		if (s.calcOff) {
			jS.calc = emptyFN;
		}

		if (!window.Raphael) {
			jSE.chart = emptyFN;
		}

		$window
			.resize(function () {
				if (jS && !jS.isBusy()) { //We check because jS might have been killed
					s.width = s.parent.width();
					s.height = s.parent.height();
					jS.sheetSyncSize();
				}
			})
			.unload(function() {
				var threads = Sheet.Cell.threads,
					i = 0,
					max = threads.length;

				for (;i<max;i++) {
					threads[i].terminate();
				}
			});


		if ($.sheet.fn) { //If the new calculations engine is alive, fill it too, we will remove above when no longer needed.
			//Extend the calculation engine plugins
			$.sheet.fn = $.extend($.sheet.fn, s.formulaFunctions);

			//Extend the calculation engine with advanced functions
			if ($.sheet.advancedfn) {
				$.sheet.fn = $.extend($.sheet.fn, $.sheet.advancedfn);
			}

			//Extend the calculation engine with finance functions
			if ($.sheet.financefn) {
				$.sheet.fn = $.extend($.sheet.fn, $.sheet.financefn);
			}
		}

		s.title = s.title || s.parent.attr('title') || '';

		jS.s = s;

		s.parent.addClass(jS.theme.parent);

		if (s.origHtml.length) {
			jS.openSheet(s.origHtml);
		} else {
			if (s.loader !== null) {
				s.loader
					.bindJS(jS)
					.bindHandler(jS.cellHandler);

				while(loaderTables.length < s.loader.count) {
					loaderTable = document.createElement('table');
					loaderTable.setAttribute('title', s.loader.title(loaderTables.length) || jS.msg.sheetTitleDefault.replace(/[{]index[}]/gi, loaderTables.length + 1));
					loaderTables.push(loaderTable);
				}
				jS.openSheet(loaderTables);
			}

			else {
				jS.openSheet([document.createElement('table')]);
			}
		}

		jS.setBusy(false);

		return jS;
	},

	/**
	 * Creates an HTMLElement from a size given
	 * @memberOf jQuery.sheet
	 * @param {Object} [size] expects keys rows,cols,
	 * @param {Number} [columnWidth] column width as number
	 * @param {Number} [rowHeight] row height as number
	 * @returns {HTMLElement}
	 */
	makeTable:function (size, columnWidth, rowHeight) {
		var doc = document;
		//set defaults;
		size = size || {rows:25, cols:10};
		columnWidth = columnWidth || 120;
		rowHeight = rowHeight || 15;

		//Create elements before loop to make it faster.
		var table = document.createElement('table'),
			colGroup = document.createElement('colgroup'),
			tBody = document.createElement('tbody'),
			colStyle = 'width:' + columnWidth + 'px;',
			rowStyle = 'height:' + rowHeight + 'px;',
			tr,
			col,
			i,
			j;

		i = size.cols;

		do {
			col = document.createElement('col');
			col.setAttribute('style', colStyle);
			colGroup.appendChild(col);
		} while (i-- > 1);

		i = size.rows;
		do {
			tr = document.createElement('tr');
			tr.setAttribute('style', rowStyle);

			j = size.cols;
			do {
				tr.appendChild(document.createElement('td'));
			} while (j-- > 1);

			tBody.appendChild(tr);
		} while (i-- > 1);

		table.appendChild(colGroup);
		table.appendChild(tBody);

		return table;

	},

	/**
	 * Destroy all spreadsheets loaded
	 * @memberOf jQuery.sheet
	 */
	killAll:function () {
		if ($.sheet) {
			var instance = $.sheet.instance;
			if (instance) {
				for (var i = 0; i< instance.length; i++) {
					if (instance[i] && instance[i].kill) {
						instance[i].kill();
					}
				}
				$.sheet.instance = [];
			}
		}
	},

	/**
	 * Make 2 or more spreadsheets scroll to together, useful for history viewing or spreadsheet comparison
	 * @param {Number} I instance index
	 * @memberOf jQuery.sheet
	 */
	scrollLocker:function (I) {
		var instance = $.sheet.instance;
		instance[I].obj.panes().each(function (i) {
			var me;
			$(me = this.scrollUI).scroll(function (e) {
				var j = instance.length - 1,
					scrollUI;
				if (j > -1) {
					do {
						scrollUI = instance[j].controls.enclosure[i][0].scrollUI;

						if (this !== scrollUI) {
							scrollUI.scrollLeft = me.scrollLeft;
							scrollUI.scrollTop = me.scrollTop;
						}
					} while (j--);
				}
			});
		});
	},

	/**
	 * Make 2 or more spreadsheets switch together, just like clicking their tabs at the same time
	 * @param {Number} I instance index
	 * @memberOf jQuery.sheet
	 */
	switchSheetLocker:function (I) {
		$.each($.sheet.instance, function () {
			this.s.parent.bind('sheetSwitch', function (e, jS, i) {
				$.each($.sheet.instance, function () {
					this.setActiveSheet(i);
				});
			});
		});
	},

	/**
	 * Get current instance count
	 * @returns {Number}
	 * @memberOf jQuery.sheet
	 */
	I:function () {
		var I = 0;
		if (this.instance) {
			I = (this.instance.length === 0 ? 0 : this.instance.length - 1); //we use length here because we havent yet created sheet, it will append 1 to this number thus making this the effective instance number
		} else {
			this.instance = [];
		}
		return I;
	}
};/**
 * jQuery.sheet's default formula engine
 * @namespace
 * @memberOf jQuery.sheet
 * @alias jQuery.sheet.engine
 */
var jSE = $.sheet.engine = {
	/**
	 * Calculate a spreadsheet
	 * @param {Number} sheet
	 * @param {Array} spreadsheet [row][cell], [1][1] = SHEET1!A1
	 * @param {Function} ignite function to run on every cell
	 * @memberOf jSE
	 */
	calc:function (sheet, spreadsheet, ignite) {
		spreadsheet = spreadsheet || [];

		var rowIndex = spreadsheet.length - 1,
			row,
			colIndex,
			cell;

		if (rowIndex > 0) {
			do {
				if (rowIndex > 0 && spreadsheet[rowIndex]) {
					row = spreadsheet[rowIndex];
					colIndex = row.length - 1;
					if (colIndex > 0) {
						do {
							cell = row[colIndex];
							cell.updateValue();
						} while (colIndex-- > 1);
					}
				}
			} while(rowIndex-- > 1);
		}
	},

	/**
	 * Parse a cell name to it's location
	 * @param {String} columnStr "A"
	 * @param {String|Number} rowString "1"
	 * @returns {Object} {row: 1, col: 1}
	 * @memberOf jQuery.sheet.engine
	 */
	parseLocation:function (columnStr, rowString) {
		return {
			row: parseInt(rowString),
			col: jSE.columnLabelIndex(columnStr)
		};
	},

	/**
	 * Parse a sheet name to it's index
	 * @param {String} locStr SHEET1 = 0
	 * @returns {Number}
	 * @memberOf jQuery.sheet.engine
	 */
	parseSheetLocation:function (locStr) {
		var sheetIndex = ((locStr + '').replace(/SHEET/i, '') * 1) - 1;
		return isNaN(sheetIndex) ? -1 : sheetIndex ;
	},

	/**
	 *
	 * @param {Number} col 1 = A
	 * @param {Number} row 1 = 1
	 * @returns {String}
	 * @memberOf jQuery.sheet.engine
	 */
	parseCellName:function (col, row) {
		return jSE.columnLabelString(col) + (row || '');
	},

	/**
	 * Available labels, used for their index
	 * @memberOf jQuery.sheet.engine
	 */
	alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
	/**
	 * Available labels, used for their index
	 * @memberOf jQuery.sheet.engine
	 */
	columnLabels: {},
	/**
	 * Get index of a column label
	 * @param {String} str A to 1, B to 2, Z to 26, AA to 27
	 * @returns {Number}
	 * @memberOf jQuery.sheet.engine
	 */
	columnLabelIndex:function (str) {
		return this.columnLabels[str.toUpperCase()];
	},

	/**
	 * Available indexes, used for their labels
	 * @memberOf jQuery.sheet.engine
	 */
	columnIndexes:[],

	/**
	 * Get label of a column index
	 * @param {Number} index 1 = A, 2 = B, 26 = Z, 27 = AA
	 * @returns {String}
	 * @memberOf jQuery.sheet.engine
	 */
	columnLabelString:function (index) {
		if (!this.columnIndexes.length) { //cache the indexes to save on processing
			var s = '', i, j, k, l;
			i = j = k = -1;
			for (l = 1; l < 16385; ++l) {
				s = '';
				++k;
				if (k == 26) {
					k = 0;
					++j;
					if (j == 26) {
						j = 0;
						++i;
					}
				}
				if (i >= 0) s += this.alphabet[i];
				if (j >= 0) s += this.alphabet[j];
				if (k >= 0) s += this.alphabet[k];
				this.columnIndexes[l] = s;
				this.columnLabels[s] = l;
			}
		}
		return this.columnIndexes[index] || '';
	},

	/**
	 * Regular expressions cache
	 * @memberOf jQuery.sheet.engine
	 */
	regEx: {
		n: 				/[\$,\s]/g,
		cell: 			/(\$?[a-zA-Z]+|[#]REF[!])(\$?[0-9]+|[#]REF[!])/gi, //a1
		range: 			/(\$?[a-zA-Z]+)\$?([0-9]+):(\$?[a-zA-Z]+)(\$?[0-9]+)/gi, //a1:a4
		remoteCell:		/\$?(SHEET+)(\$?[0-9]+)[:!](\$?[a-zA-Z]+)(\$?[0-9]+)/gi, //sheet1:a1
		remoteCellRange:/\$?(SHEET+)(\$?[0-9]+)[:!](\$?[a-zA-Z]+)(\$?[0-9]+):(\$?[a-zA-Z]+)(\$?[0-9]+)/gi, //sheet1:a1:b4
		sheet:			/SHEET/i,
		amp: 			/&/g,
		gt: 			/</g,
		lt: 			/>/g,
		nbsp: 			/&nbsp;/g
	},

	/**
	 * Creates a chart, piggybacks g Raphael JS
	 * @param {Object} o options
	 * x: { legend: "", data: [0]}, //x data
	 * y: { legend: "", data: [0]}, //y data
	 * title: "",
	 * data: [0], //chart data
	 * legend: "",
	 * td: jS.getTd(this.sheet, this.row, this.col), //td container for cell
	 * chart: jQuery('<div class="' + jS.cl.chart + '" />') //chart
	 * @returns {jQuery|HTMLElement}
	 */
	chart:function (o) {
		var jS = this.jS,
			chart = document.createElement('div'),
			td = this.td,
			gR,
			body = document.body;

		body.appendChild(chart);

		function sanitize(v, toNum) {
			if (!v) {
				if (toNum) {
					v = 0;
				} else {
					v = "";
				}
			} else {
				if (toNum) {
					v = arrHelpers.toNumbers(v);
				} else {
					v = arrHelpers.flatten(v);
				}
			}
			return v;
		}

		o = $.extend({
			x:{ legend:"", data:[0]},
			y:{ legend:"", data:[0]},
			title:"",
			data:[0],
			legend:""
		}, o);

		chart.className = jS.cl.chart;
		chart.onmousedown = function () {
			$(td).mousedown();
		};
		chart.onmousemove = function () {
			$(td).mousemove();
			return false;
		};

		jS.controls.chart[jS.i] = jS.obj.chart().add(chart);

		o.data = sanitize(o.data, true);
		o.x.data = sanitize(o.x.data, true);
		o.y.data = sanitize(o.y.data, true);
		o.legend = sanitize(o.legend);
		o.x.legend = sanitize(o.x.legend);
		o.y.legend = sanitize(o.y.legend);

		o.legend = (o.legend ? o.legend : o.data);

		var width,
			height,
			r = Raphael(chart);

		if (td.clientHeight > 0) {
			width = Math.max(td.clientWidth, 100);
			height = Math.max(td.clientHeight, 50);
		}

		if (o.title) r.text(width / 2, 10, o.title).attr({"font-size":20});
		switch (o.type) {
			case "bar":
				gR = r.barchart(width / 8, height / 8, width * 0.8, height * 0.8, o.data, o.legend)
					.hover(function () {
						this.flag = r.popup(
							this.bar.x,
							this.bar.y,
							this.bar.value || "0"
						).insertBefore(this);
					}, function () {
						this.flag.animate({
								opacity:0
							}, 300,

							function () {
								this.remove();
							}
						);
					});
				break;
			case "hbar":
				gR = r.hbarchart(width / 8, height / 8, width * 0.8, height * 0.8, o.data, o.legend)
					.hover(function () {
						this.flag = r.popup(this.bar.x, this.bar.y, this.bar.value || "0").insertBefore(this);
					}, function () {
						this.flag.animate({
								opacity:0
							}, 300,
							function () {
								this.remove();
							}
						);
					});
				break;
			case "line":
				gR = r.linechart(width / 8, height / 8, width * 0.8, height * 0.8, o.x.data, o.y.data, {
					nostroke:false,
					axis:"0 0 1 1",
					symbol:"circle",
					smooth:true
				})
					.hoverColumn(function () {
						this.tags = r.set();
						if (this.symbols.length) {
							for (var i = 0, ii = this.y.length; i < ii; i++) {
								this.tags.push(
									r
										.tag(this.x, this.y[i], this.values[i], 160, 10)
										.insertBefore(this)
										.attr([
											{ fill:"#fff" },
											{ fill:this.symbols[i].attr("fill") }
										])
								);
							}
						}
					}, function () {
						this.tags && this.tags.remove();
					});

				break;
			case "pie":
				gR = r.piechart(width / 2, height / 2, (width < height ? width : height) / 2, o.data, {legend:o.legend})
					.hover(function () {
						this.sector.stop();
						this.sector.scale(1.1, 1.1, this.cx, this.cy);

						if (this.label) {
							this.label[0].stop();
							this.label[0].attr({ r:7.5 });
							this.label[1].attr({ "font-weight":800 });
						}
					}, function () {
						this.sector.animate({ transform:'s1 1 ' + this.cx + ' ' + this.cy }, 500, "bounce");

						if (this.label) {
							this.label[0].animate({ r:5 }, 500, "bounce");
							this.label[1].attr({ "font-weight":400 });
						}
					});
				break;
			case "dot":
				gR = r.dotchart(width / 8, height / 8, width * 0.8, height * 0.8, o.x.data, o.y.data, o.data, {
					symbol:"o",
					max:10,
					heat:true,
					axis:"0 0 1 1",
					axisxstep:o.x.data.length - 1,
					axisystep:o.y.data.length - 1,
					axisxlabels:(o.x.legend ? o.x.legend : o.x.data),
					axisylabels:(o.y.legend ? o.y.legend : o.y.data),
					axisxtype:" ",
					axisytype:" "
				})
					.hover(function () {
						this.marker = this.marker || r.tag(this.x, this.y, this.value, 0, this.r + 2).insertBefore(this);
						this.marker.show();
					}, function () {
						this.marker && this.marker.hide();
					});

				break;
		}

		gR.mousedown(function () {
			$(td).mousedown().mouseup();
		});

		body.removeChild(chart);

		return chart;
	}
};/**
 * The functions container of all functions used in jQuery.sheet
 * @namespace
 * @alias jQuery.sheet.fn
 * @name jFN
 */
var jFN = $.sheet.fn = {
	/**
	 * information function
	 * @param v
	 * @returns {Boolean}
	 * @this jSCell
	 * @memberOf jFN
	 */
	ISNUMBER:function (v) {
		var result;
		if (!isNaN(v.valueOf())) {
			result = new Boolean(true);
			result.html = 'TRUE';
			return result;
		}
		result = new Boolean(false);
		result.html = 'FALSE'
		return result;
	},
	/**
	 * information function
	 * @param v
	 * @memberOf jFN
	 * @returns {*}
	 */
	N:function (v) {
		if (v == null) {
			return 0;
		}
		if (v instanceof Date) {
			return v.getTime();
		}
		if (typeof(v) == 'object') {
			v = v.toString();
		}
		if (typeof(v) == 'string') {
			v = parseFloat(v.replace(jSE.regEx.n, ''));
		}
		if (isNaN(v)) {
			return 0;
		}
		if (typeof(v) == 'number') {
			return v;
		}
		if (v == true) {
			return 1;
		}
		return 0;
	},

	/**
	 * information function
	 * @returns {*|string}
	 * @memberOf jFN
	 */
	VERSION:function () {
		return this.jS.version;
	},

	/**
	 * math function
	 * @param v
	 * @returns {number}
	 * @memberOf jFN
	 */
	ABS:function (v) {
		return Math.abs(jFN.N(v));
	},

	/**
	 * math function
	 * @param value
	 * @param significance
	 * @returns {number}
	 * @memberOf jFN
	 */
	CEILING:function (value, significance) {
		significance = significance || 1;
		return (parseInt(value / significance) * significance) + significance;
	},

	/**
	 * math function
	 * @param v
	 * @returns {number}
	 * @memberOf jFN
	 */
	EVEN:function (v) {
		v = Math.round(v);
		var even = (v % 2 == 0);
		if (!even) {
			if (v > 0) {
				v++;
			} else {
				v--;
			}
		}
		return v;
	},

	/**
	 * math function
	 * @param v
	 * @returns {number}
	 * @memberOf jFN
	 */
	EXP:function (v) {
		return Math.exp(v);
	},

	/**
	 * math function
	 * @param value
	 * @param significance
	 * @returns {*}
	 * @memberOf jFN
	 */
	FLOOR:function (value, significance) {
		significance = significance || 1;
		if (
			(value < 0 && significance > 0 )
				|| (value > 0 && significance < 0 )
			) {
			var result = new Number(0);
			result.html = '#NUM';
			return result;
		}
		if (value >= 0) {
			return Math.floor(value / significance) * significance;
		} else {
			return Math.ceil(value / significance) * significance;
		}
	},

	/**
	 * math function
	 * @param v
	 * @returns {number}
	 * @memberOf jFN
	 */
	INT:function (v) {
		return Math.floor(jFN.N(v));
	},

	/**
	 * math function
	 * @param v
	 * @returns {number}
	 * @memberOf jFN
	 */
	LN:function (v) {
		return Math.log(v);
	},

	/**
	 * math function
	 * @param v
	 * @param n
	 * @returns {number}
	 * @memberOf jFN
	 */
	LOG:function (v, n) {
		n = n || 10;
		return Math.log(v) / Math.log(n);
	},

	/**
	 * math function
	 * @param v
	 * @returns {*}
	 * @memberOf jFN
	 */
	LOG10:function (v) {
		return jFN.LOG(v);
	},

	/**
	 * math function
	 * @param x
	 * @param y
	 * @returns {number}
	 * @memberOf jFN
	 */
	MOD:function (x, y) {
		var modulus = x % y;
		if (y < 0) {
			modulus *= -1;
		}
		return modulus;
	},

	/**
	 * math function
	 * @param v
	 * @returns {number}
	 * @memberOf jFN
	 */
	ODD:function (v) {
		var gTZ = false;
		if (v > 0) {
			v = Math.floor(Math.round(v));
			gTZ = true;
		} else {
			v = Math.ceil(v);
		}

		var vTemp = Math.abs(v);
		if ((vTemp % 2) == 0) { //even
			vTemp++;
		}

		if (gTZ) {
			return vTemp;
		} else {
			return -vTemp;
		}
	},

	/**
	 * math function
	 * @returns {number}
	 * @memberOf jFN
	 */
	PI:function () {
		return Math.PI;
	},

	/**
	 * math function
	 * @param x
	 * @param y
	 * @returns {number}
	 * @memberOf jFN
	 */
	POWER:function (x, y) {
		return Math.pow(x, y);
	},

	/**
	 * math function
	 * @param v
	 * @returns {number}
	 * @memberOf jFN
	 */
	SQRT:function (v) {
		return Math.sqrt(v);
	},

	/**
	 * math function
	 * @returns {number}
	 * @memberOf jFN
	 */
	RAND:function () {
		return Math.random();
	},

	/**
	 * math function
	 * @returns {number}
	 * @memberOf jFN
	 */
	RND:function () {
		return Math.random();
	},

	/**
	 * math function
	 * @param v
	 * @param decimals
	 * @returns {number}
	 * @memberOf jFN
	 */
	ROUND:function (v, decimals) {
		var shift = Math.pow(10, decimals || 0);
		return Math.round(v * shift) / shift;
	},

	/**
	 * math function
	 * @param v
	 * @param decimals
	 * @returns {number}
	 * @memberOf jFN
	 */
	ROUNDDOWN:function (v, decimals) {
		var neg = (v < 0);
		v = Math.abs(v);
		decimals = decimals || 0;
		v = Math.floor(v * Math.pow(10, decimals)) / Math.pow(10, decimals);
		return (neg ? -v : v);
	},

	/**
	 * math function
	 * @param v
	 * @param decimals
	 * @returns {number}
	 * @memberOf jFN
	 */
	ROUNDUP:function (v, decimals) {
		var neg = (v < 0);
		v = Math.abs(v);
		decimals = decimals || 0;
		v = Math.ceil(v * Math.pow(10, decimals)) / Math.pow(10, decimals);
		return (neg ? -v : v);
	},

	/**
	 * math function
	 * @returns {number}
	 * @memberOf jFN
	 */
	SUM:function () {
		var sum = 0,
			args = arguments,
			arg,
			v,
			i = args.length - 1,
			j,
			k,
			_isNaN = isNaN;

		if (i < 0) {
			return 0;
		}

		do {
			arg = args[i];
			j = arg.length - 1;
			do {
				v = arg[j];
				if (v === null || v === undefined) continue;
				v = v.valueOf();
				if (!_isNaN(v)) {
					switch (typeof v) {
						case 'string':
							sum += (v * 1);
							break;
						default:
							sum += v;
					}
				}
			} while (j-- > 0);
		} while (i-- > 0);

		return sum;
	},

	/**
	 * math function
	 * @param number
	 * @param digits
	 * @returns {*}
	 * @memberOf jFN
	 */
	TRUNC:function (number, digits) {
		digits = digits || 0;
		number = number + '';

		if (digits == 0) {
			return number.split('.').shift();
		}

		if (number.match('.')) {
			if (digits == 1) {
				number = number.substr(0, number.length - 1);
			} else if (digits == -1) {
				number = number.split('.').shift();
				number = number.substr(0, number.length - 1) + '0';
			}
		}

		return number;
	},


	/**
	 * statistical function
	 * @returns {number}
	 * @memberOf jFN
	 */
	AVERAGE:function () {
		return jFN.SUM.apply(this, arguments) / jFN.COUNT.apply(this, arguments);
	},

	/**
	 * statistical function
	 * @returns {number}
	 * @memberOf jFN
	 */
	AVG:function () {
		return jFN.AVERAGE.apply(this, arguments);
	},

	/**
	 * statistical function
	 * @returns {number}
	 * @memberOf jFN
	 */
	COUNT:function () {
		var count = 0,
			v = arrHelpers.toNumbers(arguments),
			i = v.length - 1;

		if (i < 0) {
			return count;
		}

		do {
			if (v[i] !== null) {
				count++;
			}
		} while (i--);

		return count;
	},

	/**
	 * statistical function
	 * @returns {number}
	 * @memberOf jFN
	 */
	COUNTA:function () {
		var count = 0,
			v = arrHelpers.flatten(arguments),
			i = v.length - 1;

		if (i < 0) {
			return count;
		}

		do {
			if (v[i]) {
				count++;
			}
		} while (i--);

		return count;
	},

	/**
	 * statistical function
	 * @returns {*}
	 * @memberOf jFN
	 */
	MAX:function () {
		var v = arrHelpers.toNumbers(arguments),
			max = v[0],
			i = v.length - 1;

		if (i < 0) {
			return 0;
		}

		do {
			max = (v[i] > max ? v[i] : max);
		} while (i--);

		return max;
	},

	/**
	 * statistical function
	 * @returns {*}
	 * @memberOf jFN
	 */
	MIN:function () {
		var v = arrHelpers.toNumbers(arguments),
			min = v[0],
			i = v.length - 1;

		if (i < 0) {
			return 0;
		}

		do {
			min = (v[i] < min ? v[i] : min);
		} while (i--);

		return min;
	},

	/**
	 * string function
	 * @param v
	 * @returns {Number}
	 * @memberOf jFN
	 */
	ASC:function (v) {
		return v.charCodeAt(0);
	},
	/**
	 * string function
	 * @param v
	 * @returns {string}
	 * @memberOf jFN
	 */
	CHAR:function (v) {
		return String.fromCharCode(v);
	},
	/**
	 * string function
	 * @param v
	 * @returns {String}
	 * @memberOf jFN
	 */
	CLEAN:function (v) {
		var exp = new RegExp("[\cG\x1B\cL\cJ\cM\cI\cK\x07\x1B\f\n\r\t\v]","g");
		return v.replace(exp, '');
	},
	/**
	 * string function
	 * @param v
	 * @returns {*}
	 * @memberOf jFN
	 */
	CODE:function (v) {
		return jFN.ASC(v);
	},
	/**
	 * string function
	 * @returns {String}
	 * @memberOf jFN
	 */
	CONCATENATE:function () {
		var arr = arrHelpers.flatten(arguments),
			result = '',
			cell = this;
		jQuery.each(arr, function (i) {
			result += arr[i];
		});
		return result;
	},
	/**
	 * string function
	 * @param v
	 * @param decimals
	 * @param symbol
	 * @returns {Number}
	 * @memberOf jFN
	 */
	DOLLAR:function (v, decimals, symbol) {
		decimals = decimals || 2;
		symbol = symbol || '$';

		var result = new Number(v),
			r = jFN.FIXED(v, decimals, false);

		if (v >= 0) {
			result.html = symbol + r;
		} else {
			result.html = '(' + symbol + r.slice(1) + ')';
		}
		return result;
	},
	/**
	 * string function
	 * @param v
	 * @param decimals
	 * @param noCommas
	 * @returns {String}
	 * @memberOf jFN
	 */
	FIXED:function (v, decimals, noCommas) {
		decimals = (decimals === undefined ? 2 : decimals);
		var multiplier = Math.pow( 10, decimals),
			result,
			v = Math.round( v * multiplier ) / multiplier;



		result = new String(v.toFixed(decimals));
		result.html = Globalize.format(v, 'n' + decimals);

		if (noCommas) {
			result.html = result.html.replace(Globalize.culture().numberFormat[','], '');
		}

		return result;

	},
	/**
	 * string function
	 * @param v
	 * @param numberOfChars
	 * @returns {string}
	 * @memberOf jFN
	 */
	LEFT:function (v, numberOfChars) {
		v = v.valueOf().toString();
		numberOfChars = numberOfChars || 1;
		return v.substring(0, numberOfChars);
	},
	/**
	 * string function
	 * @param v
	 * @returns {*}
	 * @memberOf jFN
	 */
	LEN:function (v) {
		if (!v) {
			return 0;
		}
		return v.length;
	},
	/**
	 * string function
	 * @param v
	 * @returns {string}
	 * @memberOf jFN
	 */
	LOWER:function (v) {
		return v.toLowerCase();
	},

	/**
	 * string function
	 * @param v
	 * @param start
	 * @param end
	 * @returns {*}
	 * @memberOf jFN
	 */
	MID:function (v, start, end) {
		if (!v || !start || !end) {
			var result = new Number(0);
			result.html = 'ERROR';
			return result;
		}
		return v.substring(start - 1, end + start - 1);
	},
	/**
	 * string function
	 * @param oldText
	 * @param start
	 * @param numberOfChars
	 * @param newText
	 * @returns {*}
	 * @memberOf jFN
	 */
	REPLACE:function (oldText, start, numberOfChars, newText) {
		if (!oldText || !start || !numberOfChars || !newText) {
			var result = new String('');
			result.html = 'ERROR';
			return result;
		}
		var result = oldText.split('');
		result.splice(start - 1, numberOfChars);
		result.splice(start - 1, 0, newText);
		return result.join('');
	},
	/**
	 * string function
	 * @param v
	 * @param times
	 * @returns {string}
	 * @memberOf jFN
	 */
	REPT:function (v, times) {
		var result = '';
		for (var i = 0; i < times; i++) {
			result += v;
		}
		return result;
	},
	/**
	 * string function
	 * @param v
	 * @param numberOfChars
	 * @returns {string}
	 * @memberOf jFN
	 */
	RIGHT:function (v, numberOfChars) {
		numberOfChars = numberOfChars || 1;
		return v.substring(v.length - numberOfChars, v.length);
	},
	/**
	 * string function
	 * @param find
	 * @param body
	 * @param start
	 * @returns {*}
	 * @memberOf jFN
	 */
	SEARCH:function (find, body, start) {
		start = start || 0;
		if (start) {
			body = body.split('');
			body.splice(0, start - 1);
			body = body.join('');
		}
		var i = body.search(find);

		if (i < 0) {
			var result = new String('');
			result.html = '#VALUE!';
			return result;
		}

		return start + (start ? 0 : 1) + i;
	},
	/**
	 * string function
	 * @param text
	 * @param oldText
	 * @param newText
	 * @param nthAppearance
	 * @returns {string}
	 * @memberOf jFN
	 */
	SUBSTITUTE:function (text, oldText, newText, nthAppearance) {
		nthAppearance = nthAppearance || 0;
		oldText = new RegExp(oldText, 'g');
		var i = 1;
		text = text.replace(oldText, function (match, contents, offset, s) {
			var result = match;
			if (nthAppearance) {
				if (i >= nthAppearance) {
					result = newText;
				}
			} else {
				result = newText;
			}

			i++;
			return result;
		});
		return text;
	},
	/**
	 * string function
	 * @returns {*}
	 * @memberOf jFN
	 */
	TEXT:function (value, formatText) {
		//for the time being
		//TODO: fully implement
		return value;
	},
	/**
	 * string function
	 * @param v
	 * @returns {string}
	 * @memberOf jFN
	 */
	UPPER:function (v) {
		return v.toUpperCase();
	},
	/**
	 * string function
	 * @param v
	 * @returns {*}
	 * @memberOf jFN
	 */
	VALUE:function (v) {
		if (jQuery.isNumeric(v)) {
			return v *= 1;
		} else {
			var result = new String('');
			result.html = '#VALUE!';
			return result;
		}
	},

	/**
	 * date/time function
	 * @returns {Date}
	 * @memberOf jFN
	 */
	NOW:function () {
		var today = new Date();
		today.html = dates.toString(today);
		return today;
	},
	/**
	 * date/time function
	 * @returns {Number}
	 * @memberOf jFN
	 */
	TODAY:function () {
		var today = new Date(),
			result = new Number(dates.toCentury(today) - 1);
		result.html = dates.toString(today, 'd');
		return result;
	},
	/**
	 * date/time function
	 * @param weeksBack
	 * @returns {Date}
	 * @memberOf jFN
	 */
	WEEKENDING:function (weeksBack) {
		var date = new Date();
		date = new Date(
			date.getFullYear(),
			date.getMonth(),
			date.getDate() + 5 - date.getDay() - ((weeksBack || 0) * 7)
		);

		date.html = dates.toString(date, 'd');
		return date;
	},
	/**
	 * date/time function
	 * @param date
	 * @param returnValue
	 * @returns {number}
	 * @memberOf jFN
	 */
	WEEKDAY:function (date, returnValue) {
		date = dates.get(date);
		var day = date.getDay();

		returnValue = (returnValue ? returnValue : 1);
		switch (returnValue) {
			case 3:
				switch (day) {
					case 0:return 7;
					case 1:return 1;
					case 2:return 2;
					case 3:return 3;
					case 4:return 4;
					case 5:return 5;
					case 6:return 6;
				}
				break;
			case 2:
				switch (day) {
					case 0:return 6;
					case 1:return 0;
					case 2:return 1;
					case 3:return 2;
					case 4:return 3;
					case 5:return 4;
					case 6:return 5;
				}
				break;
			case 1:
				day++;
				break;
		}

		return day;
	},
	/**
	 * date/time function
	 * @param date
	 * @returns {number}
	 * @memberOf jFN
	 */
	WEEKNUM:function (date) {//TODO: implement week starting
		date = dates.get(date);
		return dates.week(date) + 1;
	},
	/**
	 * date/time function
	 * @param date
	 * @returns {number}
	 * @memberOf jFN
	 */
	YEAR:function (date) {
		date = dates.get(date);
		return date.getFullYear();
	},
	/**
	 * date/time function
	 * @param year
	 * @param month
	 * @param day
	 * @returns {number}
	 * @memberOf jFN
	 */
	DAYSFROM:function (year, month, day) {
		return Math.floor((new Date() - new Date(year, (month - 1), day)) / dates.dayDiv);
	},
	/**
	 * date/time function
	 * @param v1
	 * @param v2
	 * @returns {number}
	 * @memberOf jFN
	 */
	DAYS:function (v1, v2) {
		var date1 = dates.get(v1),
			date2 = dates.get(v2),
			ONE_DAY = 1000 * 60 * 60 * 24;
		return Math.round(Math.abs(date1.getTime() - date2.getTime()) / ONE_DAY);
	},
	/**
	 * date/time function
	 * @param date
	 * @returns {number}
	 * @memberOf jFN
	 */
	DAY:function (date) {
		date = dates.get(date);
		return date.getDate();
	},
	/**
	 * date/time function
	 * @param date1
	 * @param date2
	 * @param method
	 * @returns {number}
	 * @memberOf jFN
	 */
	DAYS360:function (date1, date2, method) {
		date1 = dates.get(date1);
		date2 = dates.get(date2);

		var startDate = date1.getDate(),
			endDate = date2.getDate(),
			startIsLastDay = dates.isLastDayOfMonth(date1),
			endIsLastDay = dates.isLastDayOfMonth(date2),
			monthCount = dates.diffMonths(date1, date2);

		if (method) {//Euro method
			startDate = Math.min(startDate, 30);
			endDate = Math.min(endDate, 30);
		} else { //Standard
			if (startIsLastDay) {
				startDate = 30;
			}
			if (endIsLastDay) {
				if (startDate < 30) {
					monthCount++;
					endDate = 1;
				} else {
					endDate = 30;
				}
			}
		}

		return (monthCount * 30) + (endDate - startDate);
	},
	/**
	 * date/time function
	 * @param year
	 * @param month
	 * @param day
	 * @returns {Number}
	 * @memberOf jFN
	 */
	DATE:function (year, month, day) {
		var date = new Date(year, month - 1, day),
			result = new Number(dates.toCentury(date));
		result.html = dates.toString(date, 'd');

		return result;
	},
	/**
	 * date/time function
	 * @param date
	 * @returns {Number}
	 * @memberOf jFN
	 */
	DATEVALUE:function (date) {
		date = dates.get(date);
		var result = new Number(dates.toCentury(date));
		result.html = dates.toString(date, 'd');
		return result;
	},
	/**
	 * date/time function
	 * @param date
	 * @param months
	 * @returns {Number}
	 * @memberOf jFN
	 */
	EDATE:function (date, months) {
		date = dates.get(date);
		date.setMonth(date.getMonth() + months);
		var result = new Number(dates.toCentury(date));
		result.html = dates.toString(date, 'd');
		return result;
	},
	/**
	 * date/time function
	 * @param date
	 * @param months
	 * @returns {Number}
	 * @memberOf jFN
	 */
	EOMONTH:function (date, months) {
		date = dates.get(date);
		date.setMonth(date.getMonth() + months + 1);
		date = new Date(date.getFullYear(), date.getMonth(), 0);
		var result = new Number(dates.toCentury(date));
		result.html = dates.toString(date, 'd');
		return result;
	},
	/**
	 * date/time function
	 * @param time
	 * @returns {*}
	 * @memberOf jFN
	 */
	HOUR:function (time) {
		time = times.fromMath(time);
		return time.hour;
	},
	/**
	 * date/time function
	 * @param time
	 * @returns {*}
	 * @memberOf jFN
	 */
	MINUTE:function (time) {
		return times.fromMath(time).minute;
	},
	/**
	 * date/time function
	 * @param date
	 * @returns {number}
	 * @memberOf jFN
	 */
	MONTH:function (date) {
		date = dates.get(date);
		return date.getMonth() + 1;
	},
	/**
	 * date/time function
	 * @param time
	 * @returns {*}
	 * @memberOf jFN
	 */
	SECOND:function (time) {
		return times.fromMath(time).second;
	},
	/**
	 * date/time function
	 * @param hour
	 * @param minute
	 * @param second
	 * @returns {number}
	 * @memberOf jFN
	 */
	TIME:function (hour, minute, second) {
		second = (second ? second : 0);
		minute = (minute ? minute : 0);
		hour = (hour ? hour : 0);

		if (second && second > 60) {
			var minuteFromSecond = (((second / 60) + '').split('.')[0]) * 1;
			second = second - (minuteFromSecond * 60);
			minute += minuteFromSecond;
		}

		if (minute && minute > 60) {
			var hourFromMinute = (((minute / 60) + '').split('.')[0]) * 1;
			minute = minute - (hourFromMinute * 60);
			hour += hourFromMinute;
		}

		var millisecond = (hour * 60 * 60 * 1000) + (minute * 60 * 1000) + (second * 1000);

		return millisecond / dates.dayDiv;
	},
	/**
	 * date/time function
	 * @param time
	 * @returns {*}
	 * @memberOf jFN
	 */
	TIMEVALUE:function (time) {
		if (!isNaN(time)) {
			return time;
		}
		if (/([0]?[1-9]|1[0-2])[:][0-5][0-9]([:][0-5][0-9])?[ ]?(AM|am|aM|Am|PM|pm|pM|Pm)/.test(time)) {
			return times.fromString(time, true);
		} else if (/([0]?[0-9]|1[0-9]|2[0-3])[:][0-5][0-9]([:][0-5][0-9])?/.test(time)) {
			return times.fromString(time);
		}
		return 0;
	},
	/**
	 * date/time function
	 * @param startDate
	 * @param days
	 * @param holidays
	 * @returns {Number}
	 * @memberOf jFN
	 */
	WORKDAY:function (startDate, days, holidays) {
		var workDays = {1:true, 2:true, 3:true, 4:true, 5:true},
			startDate = dates.get(startDate),
			days = (days && !isNaN(days) ? days : 0),
			dayCounter = 0,
			daysSoFar = 0,
			workingDate = startDate,
			result;

		if (holidays) {
			if (!jQuery.isArray(holidays)) {
				holidays = [holidays];
			}
			holidays = arrHelpers.flatten(holidays);
			var holidaysTemp = {};
			jQuery.each(holidays, function (i) {
				if (holidays[i]) {
					holidaysTemp[dates.toString(dates.get(holidays[i]), 'd')] = true;
				}
			});
			holidays = holidaysTemp;
		} else {
			holidays = {};
		}

		while (daysSoFar < days) {
			workingDate = new Date(workingDate.setDate(workingDate.getDate() + 1));
			if (workDays[workingDate.getDay()]) {
				if (!holidays[dates.toString(workingDate, 'd')]) {
					daysSoFar++;
				}
			}
			dayCounter++;
		}

		result = new Number(dates.toCentury(workingDate));
		result.html = dates.toString(workingDate, 'd');
		return result;
	},
	/**
	 * date/time function
	 * @param startDate
	 * @param endDate
	 * @param basis
	 * @returns {*}
	 * @memberOf jFN
	 */
	YEARFRAC:function (startDate, endDate, basis) {
		startDate = dates.get(startDate);
		endDate = dates.get(endDate);

		if (!startDate || !endDate) {
			var result = new String('');
			result.html = '#VALUE!';
			return result;
		}

		basis = (basis ? basis : 0);
		this.html = [];

		var numerator = dates.diff(startDate, endDate, basis),
			denom = dates.calcAnnualBasis(startDate, endDate, basis);
		return numerator / denom;
	},

	/**
	 * logical function
	 * @returns {*}
	 * @memberOf jFN
	 */
	AND:function () {
		var arg,
			i = 0,
			max = arguments.length;

		for (;i < max; i++) {
			arg = arguments[i];
			if (arg === undefined || (arg.valueOf !== undefined && arg.valueOf() != true) || arg != true) {
				return jFN.FALSE();
			}
		}

		return jFN.TRUE();
	},
	/**
	 * logical function
	 * @returns {Boolean}
	 * @memberOf jFN
	 */
	FALSE:function () {
		var result = new Boolean(false);
		result.html = 'FALSE';
		return result;
	},
	/**
	 * logical function
	 * @param expression
	 * @param resultTrue
	 * @param resultFalse
	 * @returns {*}
	 * @memberOf jFN
	 */
	IF:function (expression, resultTrue, resultFalse) {
		var primitiveExpression = expression.valueOf(),
			str;

		switch (typeof primitiveExpression) {
			case 'boolean':
				if (primitiveExpression === true) {
					return resultTrue;
				} else {
					return resultFalse;
				}
				break;
			case 'number':
				if (primitiveExpression !== 0) {
					return resultTrue;
				} else {
					return resultFalse;
				}
				break;
			case 'string':
				str = primitiveExpression.toUpperCase();
				if (str === 'TRUE') {
					return resultTrue;
				} else if (str === 'FALSE') {
					return resultFalse;
				} else if (str.replace(/ /g, '').length > 0) {
					return resultTrue;
				}
				break;
		}

		if (primitiveExpression) {
			return resultTrue;
		}

		return resultTrue;
	},
	/**
	 * logical function
	 * @param v
	 * @returns {Boolean}
	 * @memberOf jFN
	 */
	NOT:function (v) {
		var result;
		if (!v.valueOf()) {
			result = new Boolean(true);
			result.html = 'TRUE';
		} else {
			result = new Boolean(false);
			result.html = 'FALSE';
		}

		return result;
	},
	/**
	 * logical function
	 * @returns {Boolean}
	 * @memberOf jFN
	 */
	OR:function () {
		var args = arguments,
			result,
			i = args.length - 1,
			v;

		if (i > -1) {
			do {
				v = args[i].valueOf();
				if (v) {
					result = new Boolean(true);
					result.html = 'TRUE';
					return result;
				}
			} while (i--);
		}
		result = new Boolean(false);
		result.html = 'FALSE';
		return result;
	},
	/**
	 * logical function
	 * @returns {Boolean}
	 * @memberOf jFN
	 */
	TRUE:function () {
		var result = new Boolean(true);
		result.html = 'TRUE';
		return result;
	},
	/**
	 * logical function
	 * @param left
	 * @param right
	 * @returns {Boolean}
	 * @memberOf jFN
	 */
	GREATER:function(left, right) {
		var result;

		if (left > right) {
			result = new Boolean(true);
			result.html = 'TRUE';
		} else {
			result = new Boolean(false);
			result.html = 'FALSE';
		}

		return result;
	},
	/**
	 * logical function
	 * @param left
	 * @param right
	 * @returns {Boolean}
	 * @memberOf jFN
	 */
	LESS:function(left, right) {
		var result;

		if (left < right) {
			result = new Boolean(true);
			result.html = 'TRUE';
		} else {
			result = new Boolean(false);
			result.html = 'FALSE';
		}

		return result;
	},
	/**
	 * logical function
	 * @param left
	 * @param right
	 * @returns {Boolean}
	 * @memberOf jFN
	 */
	EQUAL: function(left, right) {
		var result,
			leftAsString,
			rightAsString;

		if (left === undefined || left === null) left = '';
		if (right === undefined || right === null) right = '';

		//We need to cast, because an internal value may just be a primitive
		leftAsString = left + '';
		rightAsString = right + '';

		if (leftAsString == rightAsString) {
			result = new Boolean(true);
			result.html = 'TRUE';
		} else {
			result = new Boolean(false);
			result.html = 'FALSE';
		}

		return result;
	},
	/**
	 * logical function
	 * @param left
	 * @param right
	 * @returns {Boolean}
	 * @memberOf jFN
	 */
	GREATER_EQUAL:function(left, right) {
		var result;

		if (left >= right) {
			result = new Boolean(true);
			result.html = 'TRUE';
		} else {
			result = new Boolean(false);
			result.html = 'FALSE';
		}

		return result;
	},
	/**
	 * logical function
	 * @param left
	 * @param right
	 * @returns {Boolean}
	 * @memberOf jFN
	 */
	LESS_EQUAL:function(left, right) {
		var result;

		if (left <= right) {
			result = new Boolean(true);
			result.html = 'TRUE';
		} else {
			result = new Boolean(false);
			result.html = 'FALSE';
		}

		return result;
	},

	/**
	 * html function
	 * @param v
	 * @returns {String}
	 * @memberOf jFN
	 */
	IMG:function (v) {
		var result = new String('');
		result.html = $(document.createElement('img'))
			.attr('src', v);
		return result;
	},
	/**
	 * html function
	 * @param v
	 * @returns {*}
	 * @memberOf jFN
	 */
	TRIM:function (v) {
		if (typeof(v) == 'string') {
			v = $.trim(v);
		}
		return v;
	},
	/**
	 * html function
	 * @param link
	 * @param [name]
	 * @returns {String}
	 * @memberOf jFN
	 */
	HYPERLINK:function (href, name) {
		name = name || 'LINK';
		var result = new String(name.valueOf()),
			link = document.createElement('a');
		link.setAttribute('href', href);
		link.setAttribute('target', '_new');
		link.innerText = link.textContent = name;

		result.html = link;

		return result;
	},
	/**
	 * html function
	 * @returns {*}
	 * @memberOf jFN
	 */
	DROPDOWN:function () {
		var cell = this,
			jS = this.jS,
			td = this.td,
			value,
			v,
			html,
			select,
			id,
			result,
			i = 0,
			max;

		if (td !== null) {
			$(td).children().detach();
			html = cell.value.html;
		}

		if (html === undefined || cell.needsUpdated || html.length < 1) {
			v = arrHelpers.flatten(arguments);
			v = arrHelpers.unique(v);

			if (this.id !== null) {
				id = this.id + '-dropdown';
			} else if (td !== null) {
				id = "dropdown" + this.sheetIndex + "_" + this.rowIndex + "_" + this.columnIndex + '_' + jS.I;
			}

			select = document.createElement('select');
			select.setAttribute('name', id);
			select.setAttribute('id', id);
			select.className = 'jSDropdown';
			select.cell = this;

			select.onmouseup = function() {
				if (this.cell.td !== null) {
					jS.cellEdit(this.cell.td);
				}
			};
			select.onchange = function () {
				value = new String(this.value);
				value.html = select;
				value.cell = cell;
				cell.value = value;
				cell.setNeedsUpdated(false);
				jS.resolveCell(cell);
				jS.trigger('sheetCellEdited', [cell]);
			};

			max = (v.length <= 50 ? v.length : 50);
			for (; i < max; i++) {
				if (v[i]) {
					var opt = document.createElement('option');
					opt.setAttribute('value', v[i]);
					opt.text = opt.innerText = v[i];
					select.appendChild(opt);
				}
			}

			if (!jS.s.editable) {
				select.setAttribute('disabled', true);
			} else {
				jS.s.parent.bind('sheetKill', function() {
					td.innerText = td.textContent = cell.value.valueOf();
				});
			}

			select.value = cell.value || v[0];
		}

		if (typeof cell.value !== 'object') {
			result = new String(cell.value);
		} else {
			result = cell.value;
		}

		result.html = select;
		return result;
	},
	/**
	 * html function
	 * @returns {*}
	 * @memberOf jFN
	 */
	RADIO:function () {
		var cell = this,
			jS = this.jS,
			td = this.td,
			v,
			value,
			html,
			radio,
			id,
			result;

		if (td !== null) {
			html = cell.value.html;
			$(td).children().detach();
		}

		if (html === undefined || html.length < 1 || cell.needsUpdated) {
			v = arrHelpers.flatten(arguments);
			v = arrHelpers.unique(v);

			if (this.id !== null) {
				id = this.id + '-radio';
			} else if (td !== null) {
				id = "radio" + this.sheetIndex + "_" + this.rowIndex + "_" + this.columnIndex + '_' + jS.I;
			}

			html = document.createElement('span');
			html.className = 'jSRadio';
			html.onmousedown = function () {
				if (this.cell.td !== null) {
					jS.cellEdit(cell.td);
				}
			};
			html.cell = cell;

			for (var i = 0; i < (v.length <= 25 ? v.length : 25); i++) {
				if (v[i]) {
					var input = document.createElement('input'),
						label = document.createElement('span');

					input.setAttribute('type', 'radio');
					input.setAttribute('name', id);
					input.className = id;
					input.value = v[i];
					if (!jS.s.editable) {
						input.setAttribute('disabled', 'disabled');
					}
					input.onchange = function() {
						value = new String(this.value);
						value.html = html;
						value.cell = cell;
						cell.value = value;
						cell.setNeedsUpdated(false);
						jS.resolveCell(cell);
						jS.trigger('sheetCellEdited', [cell]);
					};

					if (v[i].valueOf() === cell.value.valueOf()) {
						input.checked = true;
					}
					label.textContent = label.innerText = v[i];
					html.appendChild(input);
					label.input = input;
					label.onmousedown = function () {
						$(this.input).click();
					};
					html.appendChild(label);
					html.appendChild(document.createElement('br'));
				}
			}

			jS.s.parent.bind('sheetKill', function() {
				td.textContent = td.innerText = cell.value.valueOf();
			});
		}

		if (typeof cell.value !== 'object') {
			result = new String(cell.value);
		} else {
			result = cell.value;
		}

		result.html = html;

		return result;
	},
	/**
	 * html function
	 * @param v
	 * @returns {*}
	 * @memberOf jFN
	 */
	CHECKBOX:function (v) {
		if ($.isArray(v)) v = v[0];

		var cell = this,
			jS = this.jS,
			td = this.td,
			html,
			label,
			checkbox,
			id,
			value,
			result;

		if (td !== null) {
			html = cell.value.html;
			$(td).children().detach();
		}

		if (html === undefined || html.length < 1 || cell.needsUpdated) {
			if (this.id !== null) {
				id = this.id + '-checkbox';
			} else if (td !== null) {
				id = "checkbox" + this.sheetIndex + "_" + this.rowIndex + "_" + this.columnIndex + '_' + jS.I;
			}

			checkbox = document.createElement('input');
			checkbox.setAttribute('type', 'checkbox');
			checkbox.setAttribute('name', id);
			checkbox.setAttribute('id', id);
			checkbox.className = id;
			checkbox.value = v;
			checkbox.onchange = function () {
				if (this.checked) {
					value = new String(v);
				} else {
					value = new String('');
				}
				value.html = html;
				value.cell = cell;
				cell.value = value;
				cell.setNeedsUpdated(false);
				jS.resolveCell(cell);
				jS.trigger('sheetCellEdited', [cell]);
			};

			if (!jS.s.editable) {
				checkbox.setAttribute('disabled', 'true');
			} else {
				jS.s.parent.bind('sheetKill', function() {
					cell.value = (cell.value == 'true' || checkbox.checked ? v : '');
					if (cell.td !== null) {
						cell.td.innerText = cell.td.textContent = cell.value.valueOf();
					}
				});
			}

			html = document.createElement('span');
			html.className='jSCheckbox';
			html.appendChild(checkbox);
			label = document.createElement('span');
			label.textContent = label.innerText = v;
			html.appendChild(label);
			html.appendChild(document.createElement('br'));
			html.onmousedown = function () {
				if (this.cell.td !== null) {
					jS.cellEdit(this.cell.td);
				}
			};
			html.cell = cell;

			switch (cell.value.valueOf()) {
				case v.valueOf():
				case 'true':
					checkbox.checked = true;
			}
		}

		//when spreadsheet initiates, this will be the value, otherwise we are dependent on the checkbox being checked
		if (
			cell.value === 'true'
			|| checkbox.checked
		) {
			result = new String(v);
		}

		//if no value, than empty string
		else {
			result = new String('');
		}

		result.html = html;

		return result;
	},
	/**
	 * html function
	 * @param values
	 * @param legend
	 * @param title
	 * @returns {String}
	 * @memberOf jFN
	 */
	BARCHART:function (values, legend, title) {
		var result = new String('');
		result.html = jSE.chart.call(this, {
			type:'bar',
			data:values,
			legend:legend,
			title:title
		});
		return result;
	},
	/**
	 * html function
	 * @param values
	 * @param legend
	 * @param title
	 * @returns {String}
	 * @memberOf jFN
	 */
	HBARCHART:function (values, legend, title) {
		var result = new String('');
		result.html = jSE.chart.call(this, {
			type:'hbar',
			data:values,
			legend:legend,
			title:title
		});
		return result;
	},
	/**
	 * html function
	 * @param valuesX
	 * @param valuesY
	 * @returns {String}
	 * @memberOf jFN
	 */
	LINECHART:function (valuesX, valuesY) {
		var result = new String('');
		result.html = jSE.chart.call(this, {
			type:'line',
			x:{
				data:valuesX
			},
			y:{
				data:valuesY
			},
			title:""
		});
		return result;
	},
	/**
	 * html function
	 * @param values
	 * @param legend
	 * @param title
	 * @returns {String}
	 * @memberOf jFN
	 */
	PIECHART:function (values, legend, title) {
		var result = new String('');
		result.html = jSE.chart.call(this, {
			type:'pie',
			data:values,
			legend:legend,
			title:title
		});
		return result;
	},
	/**
	 * html function
	 * @param valuesX
	 * @param valuesY
	 * @param values
	 * @param legendX
	 * @param legendY
	 * @param title
	 * @returns {String}
	 * @memberOf jFN
	 */
	DOTCHART:function (valuesX, valuesY, values, legendX, legendY, title) {
		var result = new String('');
		result.html = jSE.chart.call(this, {
			type:'dot',
			data:(values ? values : valuesX),
			x:{
				data:valuesX,
				legend:legendX
			},
			y:{
				data:(valuesY ? valuesY : valuesX),
				legend:(legendY ? legendY : legendX)
			},
			title:title
		});
		return result;
	},
	/**
	 * html function
	 * @param v
	 * @returns {*}
	 * @memberOf jFN
	 */
	CELLREF:function (v) {
		return (this.jS.spreadsheets[v] ? this.jS.spreadsheets[v] : 'Cell Reference Not Found');
	},
	/**
	 * html function
	 * @param [pre] text before
	 * @param [post] test after
	 * @returns {string}
	 * @memberOf jFN
	 */
	CALCTIME:function (pre, post) {
		pre = pre || '';
		post = post || '';

		var cell = this,
			jS = this.jS;

		this.jS.s.parent.one('sheetCalculation', function () {
			jS.time.last = jS.calcLast;
			cell.td.text(pre + jS.time.diff() + post);
		});
		return "";
	},


	/**
	 * cell function
	 * @param value
	 * @param range
	 * @param indexNumber
	 * @param notExactMatch
	 * @returns {*}
	 * @memberOf jFN
	 */
	HLOOKUP:function (value, range, indexNumber, notExactMatch) {

		if (value === undefined) return null;

		var jS = this.jS,
			found,
			foundCell,
			result = '',
			i = 0,
			max = range.length;

		indexNumber = indexNumber || 1;
		notExactMatch = notExactMatch !== undefined ? notExactMatch : true;

		if (value !== undefined || ((isNaN(value) && value != '#REF!') || value.length === 0)) {

			for(; i < max; i++) {
				if (range[i].toString() == value) {
					found = range[i];
					break;
				}
			}

		} else {
			arrHelpers.getClosestNum(value, range, function(closest, i) {
				if (notExactMatch) {
					found = closest;
				} else if (closest == value) {
					found = closest;
				}
			});
		}

		if (found !== undefined) {
			foundCell = found.cell;
			foundCell = jS.getCell(foundCell.sheetIndex, indexNumber, foundCell.columnIndex);
			if (foundCell !== null) {
				result = foundCell.updateValue();
			} else {
				result = '';
			}
		} else {
			result = new String();
			result.html = '#N/A';
		}

		return result;
	},
	/**
	 * cell function
	 * @param value
	 * @param range
	 * @param indexNumber
	 * @param notExactMatch
	 * @returns {*}
	 * @memberOf jFN
	 */
	VLOOKUP:function (value, range, indexNumber, notExactMatch) {

		if (value === undefined) return null;

		var jS = this.jS,
			found,
			foundCell,
			result,
			i = 0,
			max = range.length;

		notExactMatch = notExactMatch !== undefined ? notExactMatch : true;


		if ((isNaN(value) && value != '#REF!') || value.length === 0) {
			for(; i < max; i++) {
				if (range[i].toString() == value) {
					found = range[i];
					break;
				}
			}

		} else {
			arrHelpers.getClosestNum(value, range, function(closest, i) {
				if (notExactMatch) {
					found = closest;
				} else if (closest == value) {
					found = closest;
				}
			});
		}

		if (found !== undefined) {
			foundCell = found.cell;
			foundCell = jS.getCell(foundCell.sheetIndex, foundCell.rowIndex, indexNumber);
			if (foundCell !== null) {
				result = foundCell.value;
			} else {
				result = '';
			}
		} else {
			result = new String();
			result.html = '#N/A';
		}

		return result;
	},
	/* Gets the adjucent value for the reference array. Ip- reference array*/
	TRANSPOSE: function (range) {
		var i = 0,
			jS = this.jS,
			sheetIndex = this.sheetIndex,
			firstValue = range[0],
			firstCell = firstValue.cell,
			lastValue = range[range.length - 1],
			lastCell = lastValue.cell,
			startRow = firstCell.rowIndex,
			startColumn = firstCell.columnIndex,
			rowIndex,
			columnIndex,
			cell,
			cells = [],
			transposedCell,
			transposedCells = [],
			value,
			max = range.length,
			error,
			isOverwrite = false;

		for(;i<max;i++) {
			value = range[i];
			cell = value.cell;
			rowIndex = this.rowIndex + (cell.columnIndex - startColumn);
			columnIndex = this.columnIndex + (cell.rowIndex - startRow);

			transposedCell = jS.getCell(this.sheetIndex, rowIndex, columnIndex);
			if (transposedCell !== null && transposedCell !== this) {
				if (transposedCell.value != '') {
					isOverwrite = true;
				}
				transposedCells.push(transposedCell);
				cells.push(cell);
			}
		}

		if (isOverwrite) {
			error = new String('');
			error.html = '#REF!';
			return error;
		}

		i = 0;
		max = transposedCells.length;
		for(;i<max;i++) {
			transposedCell = transposedCells[i];
			if (transposedCell !== this) {
				cell = cells[i];
				transposedCell.setNeedsUpdated();
				transposedCell.defer = cell;
				transposedCell.updateValue();
				transposedCell.addDependency(this);
			}
		}

		return firstValue.valueOf();
	},
	/**
	 * cell function
	 * @param col
	 * @returns {*}
	 * @memberOf jFN
	 */
	THISROWCELL:function (col) {
		var jS = this.jS;

		if (isNaN(col)) {
			col = jSE.columnLabelIndex(col);
		}
		return jS.getCell(this.sheetIndex, this.rowIndex, col).updateValue();
	},
	/**
	 * cell function
	 * @param row
	 * @returns {*}
	 * @memberOf jFN
	 */
	THISCOLCELL:function (row) {
		var jS = this.jS;

		return jS.getCell(this.sheetIndex, row, this.columnIndex).updateValue();
	}
};var key = { /* key objects, makes it easier to develop */
	BACKSPACE: 			8,
	CAPS_LOCK: 			20,
	COMMA: 				188,
	CONTROL: 			17,
	ALT:				18,
	DELETE: 			46,
	DOWN: 				40,
	END: 				35,
	ENTER: 				13,
	ESCAPE: 			27,
	HOME: 				36,
	INSERT: 			45,
	LEFT: 				37,
	NUMPAD_ADD: 		107,
	NUMPAD_DECIMAL: 	110,
	NUMPAD_DIVIDE: 		111,
	NUMPAD_ENTER: 		108,
	NUMPAD_MULTIPLY: 	106,
	NUMPAD_SUBTRACT: 	109,
	PAGE_DOWN: 			34,
	PAGE_UP: 			33,
	PERIOD: 			190,
	RIGHT: 				39,
	SHIFT: 				16,
	SPACE: 				32,
	TAB: 				9,
	UP: 				38,
	C:				  67,
	F:					70,
	V:					86,
	X:				  88,
	Y:					89,
	Z:					90,
	UNKNOWN:			229
};

var arrHelpers = window.arrHelpers = {
	math: Math,
	toNumbers:function (arr) {
		arr = this.flatten(arr);
		var i = arr.length - 1;

		if (i < 0) {
			return [];
		}

		do {
			if (arr[i]) {
				arr[i] = $.trim(arr[i]);
				if (isNaN(arr[i])) {
					arr[i] = 0;
				} else {
					arr[i] = arr[i] * 1;
				}
			} else {
				arr[i] = 0;
			}
		} while (i--);

		return arr;
	},
	unique:function (arr) {
		var o = {}, i, l = arr.length, r = [];
		for(i=0; i<l;i+=1) o[arr[i]] = arr[i];
		for(i in o) r.push(o[i]);
		return r;
	},
	flatten:function (arr) {
		var flat = [],
			item,
			i = 0,
			max = arr.length;

		for (; i < max; i++) {
			item = arr[i];
			if (item instanceof Array) {
				flat = flat.concat(this.flatten(item));
			} else {
				flat = flat.concat(item);
			}
		}
		return flat;
	},
	insertAt:function (arr, val, index) {
		$(val).each(function () {
			if (index > -1 && index <= arr.length) {
				arr.splice(index, 0, this);
			}
		});
		return arr;
	},
	indexOfNearestLessThan: function (array, needle) {
		if (array.length === 0) return -1;

		var high = array.length - 1,
			low = 0,
			mid,
			item,
			target = -1;

		if (array[high] < needle) {
			return high;
		}

		while (low <= high) {
			mid = (low + high) >> 1;
			item = array[mid];
			if (item > needle) {
				high = mid - 1;
			} else if (item < needle) {
				target = mid;
				low = mid + 1;
			} else {
				target = low;
				break;
			}
		}

		return target;
	},
	ofSet: function (array, needle) {
		if (array.length === 0) return null;

		var high = array.length - 1,
			lastIndex = high,
			biggest = array[high],
			smallest = array[0],
			low = 0,
			mid,
			item,
			target = -1,
			i,
			highSet = -1,
			lowSet = -1;

		if (array[high] < needle || array[0] > needle) {
			return null;
		} else {

			while (low <= high) {
				mid = (low + high) >> 1;
				item = array[mid];
				if (item > needle) {
					target = mid;
					high = mid - 1;
				} else if (item < needle) {
					low = mid + 1;
				} else {
					target = high;
					break;
				}
			}
		}

		if (target > -1) {
			i = target;
			while (i <= lastIndex) {
				if (array[i] + 1 === array[i + 1]) {
					i++;
				} else {
					highSet = array[i];
					break;
				}
			}

			if (highSet === -1) {
				highSet = biggest;
			}

			i = target;
			while (i >= 0) {
				if (array[i] - 1 === array[i - 1]) {
					i--;
				} else {
					lowSet = array[i];
					break;
				}
			}

			if (lowSet === -1) {
				lowSet = smallest;
			}
		}

		return {
			start: lowSet,
			end: highSet
		};
	},
	closest:function (array, num, min, max) {
		min = min || 0;
		max = max || array.length - 1;

		var target,
			item;

		while (true) {
			target = ((min + max) >> 1);
			item = array[target];
			if ((target === max || target === min) && item !== num) {
				return item;
			}
			if (item > num) {
				max = target;
			} else if (item < num) {
				min = target;
			} else {
				return item;
			}
		}
	},
	getClosestNum: function(num, ar, fn) {
		var i = 0, I, closest, closestDiff, currentDiff;
		if(ar.length) {
			closest = ar[0];
			I = i;
			for(i;i<ar.length;i++) {
				closestDiff = Math.abs(num - closest);
				currentDiff = Math.abs(num - ar[i]);
				if(currentDiff < closestDiff)
				{
					I = i;
					closest = ar[i];
				}
				closestDiff = null;
				currentDiff = null;
			}
			//returns first element that is closest to number
			if (fn) {
				return fn(closest, I);
			}
			return closest;
		}
		//no length
		return false;
	},
	//http://stackoverflow.com/questions/11919065/sort-an-array-by-the-levenshtein-distance-with-best-performance-in-javascript
	levenshtein: (function() {
		var row2 = [];
		return function(s1, s2) {
			if (s1 === s2) {
				return 0;
			} else {
				var s1_len = s1.length, s2_len = s2.length;
				if (s1_len && s2_len) {
					var i1 = 0, i2 = 0, a, b, c, c2, row = row2;
					while (i1 < s1_len)
						row[i1] = ++i1;
					while (i2 < s2_len) {
						c2 = s2.charCodeAt(i2);
						a = i2;
						++i2;
						b = i2;
						for (i1 = 0; i1 < s1_len; ++i1) {
							c = a + (s1.charCodeAt(i1) === c2 ? 0 : 1);
							a = row[i1];
							b = b < a ? (b < c ? b + 1 : c) : (a < c ? a + 1 : c);
							row[i1] = b;
						}
					}
					return b;
				} else {
					return s1_len + s2_len;
				}
			}
		};
	})(),
	lSearch: function(arr, value) {
		var i = 0,
			item,
			max = arr.length,
			found = -1,
			distance;

		for(;i < max; i++) {
			item = arr[i];
			distance = new Number(this.levenshtein(item, value));
			distance.item = item;
			if (distance < found) {
				found = distance;
			}
		}

		return (distance !== undefined ? distance.item : null);
	}
};

var dates = {
	dayDiv: 86400000,
	math: Math,
	toCentury:function (date, dayDiv) {
		dayDiv = dayDiv || 86400000;

		return this.math.round(this.math.abs((new Date(1900, 0, -1)) - date) / dayDiv);
	},
	get:function (date, dayDiv) {
		dayDiv = dayDiv || 86400000;

		if (date.getMonth) {
			return date;
		} else if (isNaN(date)) {
			return new Date(Globalize.parseDate(date));
		} else {
			date *= dayDiv;
			//date = new Date(date);
			var newDate = (new Date(1900, 0, -1)) * 1;
			date += newDate;
			date = new Date(date);
			return date;
		}
	},
	week:function (date, dayDiv) {
		dayDiv = dayDiv || 86400000;

		var onejan = new Date(date.getFullYear(), 0, 1);
		return this.math.ceil((((date - onejan) / dayDiv) + onejan.getDay() + 1) / 7);
	},
	toString:function (date, pattern) {
		if (!pattern) {
			return Globalize.format(date);
		}
		return Globalize.format(date, Globalize.culture().calendar.patterns[pattern]);
	},
	diff:function (start, end, basis, dayDiv) {
		dayDiv = dayDiv || 86400000;

		switch (basis) {
			case 0:
				return this.days360Nasd(start, end, 0, true);
			case 1:
			case 2:
			case 3:
				var result = this.math.abs(end - start) / dayDiv;
				return result;
			case 4:
				return this.days360Euro(start, end);
		}

		return 0;
	},
	diffMonths:function (start, end) {
		var months;
		months = (end.getFullYear() - start.getFullYear()) * 12;
		months -= start.getMonth() + 1;
		months += end.getMonth() + 1;
		return months;
	},
	days360:function (startYear, endYear, startMonth, endMonth, startDate, endDate) {
		return ((endYear - startYear) * 360) + ((endMonth - startMonth) * 30) + (endDate - startDate)
	},
	days360Nasd:function (start, end, method, useEom) {
		var startDate = start.getDate(),
			startMonth = start.getMonth(),
			startYear = start.getFullYear(),
			endDate = end.getDate(),
			endMonth = end.getMonth(),
			endYear = end.getFullYear();

		if (
			(endMonth == 2 && this.isEndOfMonth(endDate, endMonth, endYear)) &&
				(
					(startMonth == 2 && this.isEndOfMonth(startDate, startMonth, startYear)) ||
						method == 3
					)
			) {
			endDate = 30;
		}

		if (endDate == 31 && (startDate >= 30 || method == 3)) {
			endDate = 30;
		}

		if (startDate == 31) {
			startDate = 30;
		}

		if (useEom && startMonth == 2 && this.isEndOfMonth(startDate, startMonth, startYear)) {
			startDate = 30;
		}

		return this.days360(startYear, endYear, startMonth, endMonth, startDate, endDate);
	},
	days360Euro:function (start, end) {
		var startDate = start.getDate(),
			startMonth = start.getMonth(),
			startYear = start.getFullYear(),
			endDate = end.getDate(),
			endMonth = end.getMonth(),
			endYear = end.getFullYear();

		if (startDate == 31) startDate = 30;
		if (endDate == 31) endDate = 30;

		return this.days360(startYear, endYear, startMonth, endMonth, startDate, endDate);
	},
	isEndOfMonth:function (day, month, year) {
		return day == (new Date(year, month + 1, 0, 23, 59, 59)).getDate();
	},
	isLeapYear:function (year) {
		return new Date(year, 1, 29).getMonth() == 1;
	},
	calcAnnualBasis:function (start, end, basis) {
		switch (basis) {
			case 0:
			case 2:
			case 4: return 360;
			case 3: return 365;
			case 1:
				var startDate = start.getDate(),
					startMonth = start.getMonth(),
					startYear = start.getFullYear(),
					endDate = end.getDate(),
					endMonth = end.getMonth(),
					endYear = end.getFullYear(),
					result = 0;

				if (startYear == endYear) {
					if (this.isLeapYear(startYear)) {
						result = 366;
					} else {
						result = 365;
					}
				} else if (((endYear - 1) == startYear) && ((startMonth > endMonth) || ((startMonth == endMonth) && startDate >= endDate))) {
					if (this.isLeapYear(startYear)) {
						if (startMonth < 2 || (startMonth == 2 && startDate <= 29)) {
							result = 366;
						} else {
							result = 365;
						}
					} else if (this.isLeapYear(endYear)) {
						if (endMonth > 2 || (endMonth == 2 && endDate == 29)) {
							result = 366;
						} else {
							result = 365;
						}
					} else {
						result = 365;
					}
				} else {
					for (var iYear = startYear; iYear <= endYear; iYear++) {
						if (this.isLeapYear(iYear)) {
							result += 366;
						} else {
							result += 365;
						}
					}
					result = result / (endYear - startYear + 1);
				}
				return result;
		}
		return 0;
	},
	lastDayOfMonth:function (date) {
		date.setDate(0);
		return date.getDate();
	},
	isLastDayOfMonth:function (date) {
		return (date.getDate() == this.lastDayOfMonth(date));
	}
};

var times = window.times = {
	math: Math,
	fromMath:function (time) {
		var result = {}, me = this;

		result.hour = ((time * 24) + '').split('.')[0] * 1;

		result.minute = function (time) {
			time = me.math.round(time * 24 * 100) / 100;
			time = (time + '').split('.');
			var minute = 0;
			if (time[1]) {
				if (time[1].length < 2) {
					time[1] += '0';
				}
				minute = time[1] * 0.6;
			}
			return me.math.round(minute);
		}(time);

		result.second = function (time) {
			time = me.math.round(time * 24 * 10000) / 10000;
			time = (time + '').split('.');
			var second = 0;
			if (time[1]) {
				for (var i = 0; i < 4; i++) {
					if (!time[1].charAt(i)) {
						time[1] += '0';
					}
				}
				var secondDecimal = ((time[1] * 0.006) + '').split('.');
				if (secondDecimal[1]) {
					if (secondDecimal[1] && secondDecimal[1].length > 2) {
						secondDecimal[1] = secondDecimal[1].substr(0, 2);
					}

					return me.math.round(secondDecimal[1] * 0.6);
				}
			}
			return second;
		}(time);

		return result;
	},
	fromString:function (time, isAmPm) {
		var date = new Date(), timeParts = time, timeValue, hour, minute, second, meridiem;
		if (isAmPm) {
			meridiem = timeParts.substr(-2).toLowerCase(); //get ampm;
			timeParts = timeParts.replace(/(am|pm)/i, '');
		}

		timeParts = timeParts.split(':');
		hour = timeParts[0] * 1;
		minute = timeParts[1] * 1;
		second = (timeParts[2] ? timeParts[2] : 0) * 1;

		if (isAmPm && meridiem == 'pm') {
			hour += 12;
		}

		return jFN.TIME(hour, minute, second);
	}
};


$.extend(Math, {
	log10:function (arg) {
		// http://kevin.vanzonneveld.net
		// +   original by: Philip Peterson
		// +   improved by: Onno Marsman
		// +   improved by: Tod Gentille
		// +   improved by: Brett Zamir (http://brett-zamir.me)
		// *	 example 1: log10(10);
		// *	 returns 1: 1
		// *	 example 2: log10(1);
		// *	 returns 2: 0
		return Math.log(arg) / 2.302585092994046; // Math.LN10
	},
	signum:function (x) {
		return (x / Math.abs(x)) || x;
	},
	log1p: function (x) {
		// http://kevin.vanzonneveld.net
		// +   original by: Brett Zamir (http://brett-zamir.me)
		// %		  note 1: Precision 'n' can be adjusted as desired
		// *	 example 1: log1p(1e-15);
		// *	 returns 1: 9.999999999999995e-16

		var ret = 0,
			n = 50; // degree of precision
		if (x <= -1) {
			return '-INF'; // JavaScript style would be to return Number.NEGATIVE_INFINITY
		}
		if (x < 0 || x > 1) {
			return Math.log(1 + x);
		}
		for (var i = 1; i < n; i++) {
			if ((i % 2) === 0) {
				ret -= Math.pow(x, i) / i;
			} else {
				ret += Math.pow(x, i) / i;
			}
		}
		return ret;
	}
});

/**
 * Get scrollBar size
 * @returns {Object} {height: int, width: int}
 */
var getScrollBarSize = function () {
	var doc = document,
		inner = $(document.createElement('p')).css({
			width:'100%',
			height:'100%'
		}),
		outer = $(document.createElement('div')).css({
			position:'absolute',
			width:'100px',
			height:'100px',
			top:'0',
			left:'0',
			visibility:'hidden',
			overflow:'hidden'
		}).append(inner);

	$(document.body).append(outer);

	var w1 = inner.width(),
		h1 = inner.height();

	outer.css('overflow', 'scroll');

	var w2 = inner.width(),
		h2 = inner.height();

	if (w1 == w2 && outer[0].clientWidth) {
		w2 = outer[0].clientWidth;
	}
	if (h1 == h2 && outer[0].clientHeight) {
		h2 = outer[0].clientHeight;
	}

	outer.detach();

	var w = w1 - w2, h = h1 - h2;

	return {
		width: w || 15,
		height: h || 15
	};
};

var getAverageCharacterSize = function() {
	var characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
		el = $(document.createElement('span'))
			.html(characters)
			.appendTo('body'),
		size = {
			width: el.width() / characters.length,
			height: el.height()
		};

	el.remove();

	return size;
};

var debugPositionBox = function (x, y, box, color, which) {
	color = color || '#' + Math.floor(Math.random() * 16777215).toString(16);
	if (box) {
		var $box = $([]);
		$box = $box.add(debugPositionBox(box.left, box.top, null, color, 'top-left'));
		$box = $box.add(debugPositionBox(box.right, box.top, null, color, 'top-right'));
		$box = $box.add(debugPositionBox(box.left, box.bottom, null, color, 'bottom-left'));
		$box = $box.add(debugPositionBox(box.right, box.bottom, null, color, 'bottom-right'));
		return $box;
	}
	return $('<div style="width: 10px; height: 10px; position: absolute;"></div>')
		.css('top', (y - 5) + 'px')
		.css('left', (x + 5) + 'px')
		.css('background-color', color)
		.click(function () {
			console.log(which || 'none');
		})
		.appendTo('body');
};

$.printSource = function (s) {
	var w = win.open();
	w.document.write("<html><body><xmp>" + s + "\n</xmp></body></html>");
	w.document.close();
};//This is a fix for Jison
if (!Object.getPrototypeOf) {
	Object.getPrototypeOf = function(obj) {
		return obj || {};
	};
}

//IE8 fix
if (!Array.prototype.indexOf) {
	$.sheet.max = 60;
	Array.prototype.indexOf = function(obj, start) {
		for (var i = (start || 0), j = this.length; i < j; i++) {
			if (this[i] === obj) { return i; }
		}
		return -1;
	}
}

	return Sheet;
})(jQuery, document, window, Date, String, Number, Boolean, Math, RegExp, Error);
/* parser generated by jison 0.4.15 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var parser = (function(){
var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[1,5],$V1=[1,6],$V2=[1,8],$V3=[1,9],$V4=[1,10],$V5=[1,13],$V6=[1,11],$V7=[1,12],$V8=[1,14],$V9=[1,15],$Va=[1,20],$Vb=[1,18],$Vc=[1,21],$Vd=[1,22],$Ve=[1,17],$Vf=[1,24],$Vg=[1,25],$Vh=[1,26],$Vi=[1,27],$Vj=[1,28],$Vk=[1,29],$Vl=[1,30],$Vm=[1,31],$Vn=[1,32],$Vo=[4,13,14,15,17,18,19,20,21,22,23,35,36],$Vp=[1,35],$Vq=[1,36],$Vr=[1,37],$Vs=[4,13,14,15,17,18,19,20,21,22,23,35,36,38],$Vt=[4,13,14,15,17,18,19,20,21,22,23,35,36,39],$Vu=[4,13,14,15,17,18,19,20,21,22,23,29,35,36],$Vv=[4,14,15,17,18,19,20,35,36],$Vw=[1,71],$Vx=[4,14,17,18,19,35,36],$Vy=[4,14,15,17,18,19,20,21,22,35,36],$Vz=[17,35,36];
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"expressions":3,"EOF":4,"expression":5,"variableSequence":6,"TIME_AMPM":7,"TIME_24":8,"number":9,"STRING":10,"ESCAPED_STRING":11,"LETTERS":12,"&":13,"=":14,"+":15,"(":16,")":17,"<":18,">":19,"-":20,"*":21,"/":22,"^":23,"E":24,"FUNCTION":25,"expseq":26,"cellRange":27,"cell":28,":":29,"SHEET":30,"!":31,"NUMBER":32,"$":33,"REF":34,";":35,",":36,"VARIABLE":37,"DECIMAL":38,"%":39,"$accept":0,"$end":1},
terminals_: {2:"error",4:"EOF",7:"TIME_AMPM",8:"TIME_24",10:"STRING",11:"ESCAPED_STRING",12:"LETTERS",13:"&",14:"=",15:"+",16:"(",17:")",18:"<",19:">",20:"-",21:"*",22:"/",23:"^",24:"E",25:"FUNCTION",29:":",30:"SHEET",31:"!",32:"NUMBER",33:"$",34:"REF",35:";",36:",",37:"VARIABLE",38:"DECIMAL",39:"%"},
productions_: [0,[3,1],[3,2],[5,1],[5,1],[5,1],[5,1],[5,1],[5,1],[5,1],[5,3],[5,3],[5,3],[5,3],[5,4],[5,4],[5,4],[5,3],[5,3],[5,3],[5,3],[5,3],[5,3],[5,2],[5,2],[5,1],[5,3],[5,4],[5,1],[27,1],[27,3],[27,3],[27,5],[28,2],[28,3],[28,3],[28,4],[28,1],[28,2],[28,2],[28,2],[28,3],[28,3],[28,3],[28,3],[28,3],[28,3],[28,4],[28,4],[28,4],[26,1],[26,2],[26,2],[26,3],[26,3],[6,1],[6,3],[9,1],[9,3],[9,2]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:

        return null;
    
break;
case 2:

    	var types = yy.types;
    	yy.types = [];
        return types;
    
break;
case 3:

        //js

			var type = {
		    	t: 'm',
		    	m: 'variable',
		    	a: [$$[$0]]
		    };
		    this.$ = yy.types.length;
		    yy.types.push(type);

        /*php
            this.$ = $this->variable($$[$0]);
        */
    
break;
case 4:

	    //js

            var type = {
            	t: 'm',
                m: 'time',
            	a: [$$[$0], true]
            };
            this.$ = yy.types.length;
            yy.types.push(type);
        //
    
break;
case 5:

        //js
            
            var type = {
            	t: 'm',
                m: 'time',
            	a: [$$[$0]]
            };
            this.$ = yy.types.length;
            yy.types.push(type);
        //

    
break;
case 6:

	    //js
	        
            var type = {
            	t: 'm',
            	m: 'number',
            	a: [$$[$0]]
            };
            this.$ = yy.types.length;
			yy.types.push(type);

        /*php
            this.$ = $$[$0] * 1;
        */
    
break;
case 7:

        //js
            
            var type = {
            	t: 'v',
            	v: yy.escape($$[$0].substring(1, $$[$0].length - 1))
            };
            this.$ = yy.types.length;
            yy.types.push(type);

        /*php
	        this.$ = substr($$[$0], 1, -1);
        */
    
break;
case 8:

        //js

            var type = {
            	t: 'v',
            	v: yy.escape($$[$0].substring(2, $$[$0].length - 2))
            };
            this.$ = yy.types.length;
            yy.types.push(type);

        /*php
            this.$ = substr($$[$0], 2, -2);
        */
    
break;
case 9:

        var type = {
        	t: 'v',
        	v: $$[$0]
        };
        yy.types.push(type);
    
break;
case 10:

        //js
            
            var type = {
            	t: 'm',
            	m: 'concatenate',
            	a: [$$[$0-2], $$[$0]]
            };
            this.$ = yy.types.length;
            yy.types.push(type);

        /*php
            this.$ = $$[$0-2] . '' . $$[$0];
        */
    
break;
case 11:

	    //js
	        
            var type = {
            	t: 'm',
            	m: 'callFunction',
            	a: ['EQUAL', [$$[$0-2], $$[$0]]]
            };
            this.$ = yy.types.length;
            yy.types.push(type);

        /*php
            this.$ = $$[$0-2] == $$[$0];
        */
    
break;
case 12:

	    //js

			var type = {
				t: 'm',
				m: 'performMath',
				a: ['+', $$[$0-2], $$[$0]]
			};
			this.$ = yy.types.length;
			yy.types.push(type);

        /*php
			if (is_numeric($$[$0-2]) && is_numeric($$[$0])) {
			   this.$ = $$[$0-2] + $$[$0];
			} else {
			   this.$ = $$[$0-2] . $$[$0];
			}
        */
    
break;
case 13:

	    //js
	        
	        this.$ = $$[$0-1];
        //
	
break;
case 14:

        //js
            
            var type = {
            	t: 'm',
            	m: 'callFunction',
            	a: ['LESS_EQUAL', [$$[$0-3], $$[$0]]]
            };
            this.$ = yy.types.length;
            yy.types.push(type);

        /*php
            this.$ = ($$[$0-3] * 1) <= ($$[$0] * 1);
        */
    
break;
case 15:

        //js
            
            var type = {
            	t: 'm',
            	m: 'callFunction',
            	a: ['GREATER_EQUAL', [$$[$0-3], $$[$0]]]
            };
            this.$ = yy.types.length;
            yy.types.push(type);

        /*php
            this.$ = ($$[$0-3] * 1) >= ($$[$0] * 1);
        */
    
break;
case 16:

		//js

			var type = {
				t: 'm',
				m: 'not',
				a: [$$[$0-3], $$[$0]]
			};
			this.$ = yy.types.length;
			yy.types.push(type);

		/*php
        	this.$ = ($$[$0-3]) != ($$[$0]);
		*/
    
break;
case 17:

	    //js
	        
			var type = {
				t: 'm',
				m: 'callFunction',
				a: ['GREATER', [$$[$0-2], $$[$0]]]
			};
			this.$ = yy.types.length;
			yy.types.push(type);

		/*php
		    this.$ = ($$[$0-2] * 1) > ($$[$0] * 1);
        */
    
break;
case 18:

        //js
            
            var type = {
            	t: 'm',
            	m: 'callFunction',
            	a: ['LESS', [$$[$0-2], $$[$0]]]
            };
            this.$ = yy.types.length;
            yy.types.push(type);

        /*php
            this.$ = ($$[$0-2] * 1) < ($$[$0] * 1);
        */
    
break;
case 19:

        //js
            
            var type = {
            	t: 'm',
            	m: 'performMath',
            	a: ['-', $$[$0-2], $$[$0]]
			};
			this.$ = yy.types.length;
			yy.types.push(type);

        /*php
            this.$ = ($$[$0-2] * 1) - ($$[$0] * 1);
        */
    
break;
case 20:

	    //js
	        
            var type = {
            	t: 'm',
            	m: 'performMath',
            	a: ['*', $$[$0-2], $$[$0]]
            };
            this.$ = yy.types.length;
            yy.types.push(type);

        /*php
            this.$ = ($$[$0-2] * 1) * ($$[$0] * 1);
        */
    
break;
case 21:

	    //js
	        
            var type = {
            	t: 'm',
            	m: 'performMath',
            	a: ['/', $$[$0-2], $$[$0]]
            };
            this.$ = yy.types.length;
            yy.types.push(type);

        /*php
            this.$ = ($$[$0-2] * 1) / ($$[$0] * 1);
        */
    
break;
case 22:

        //js

            var type = {
            	t: 'm',
            	m: 'performMath',
            	a: ['^', $$[$0-2], $$[$0]]
            };
            this.$ = yy.types.length;
            yy.types.push(type);

        /*php
            this.$ = pow(($$[$0-2] * 1), ($$[$0] * 1));
        */
    
break;
case 23:

		//js

			var type = {
				t: 'm',
				m: 'invertNumber',
				a: [$$[$0]]
			};
			this.$ = yy.types.length;
			yy.types.push(type);

        /*php
            this.$ = $$[$0-1] * 1;
        */
	
break;
case 24:

	    //js

	        var type = {
	        	t: 'm',
				m: 'number',
				a: [$$[$0]]
	        };
	        this.$ = yy.types.length;
	        yy.types.push(type);

        /*php
            this.$ = $$[$0-1] * 1;
        */
	
break;
case 25:
/*this.$ = Math.E;*/;
break;
case 26:

	    //js
	        
			var type = {
				t: 'm',
				m: 'callFunction',
				a: [$$[$0-2]]
			};
			this.$ = yy.types.length;
			yy.types.push(type);

		/*php
		    this.$ = $this->callFunction($$[$0-2]);
        */
    
break;
case 27:

	    //js
	        
			var type = {
				t: 'm',
				m: 'callFunction',
				a: [$$[$0-3], $$[$0-1]]
			};
			this.$ = yy.types.length;
			yy.types.push(type);

        /*php
            this.$ = $this->callFunction($$[$0-3], $$[$0-1]);
        */
    
break;
case 29:

	    //js
	        
			var type = {
				t: 'l',
				m: 'cellValue',
				a: [$$[$0]]
			};
			this.$ = yy.types.length;
			yy.types.push(type);

        /*php
            this.$ = $this->cellValue($$[$0]);
        */
    
break;
case 30:

	    //js

			var type = {
				t: 'l',
				m: 'cellRangeValue',
				a: [$$[$0-2], $$[$0]]
			};
			this.$ = yy.types.length;
			yy.types.push(type);

        /*php
            this.$ = $this->cellRangeValue($$[$0-2], $$[$0]);
        */
    
break;
case 31:

	    //js
			var type = {
				t: 'l',
				m: 'remoteCellValue',
				a: [$$[$0-2], $$[$0]]
			};
			this.$ = yy.types.length;
			yy.types.push(type);

        /*php
            this.$ = $this->remoteCellValue($$[$0-2], $$[$0]);
        */
    
break;
case 32:

	    //js
            var type = {
            	t: 'l',
            	m: 'remoteCellRangeValue',
            	a: [$$[$0-4], $$[$0-2], $$[$0]]
            };
            this.$ = yy.types.length;
            yy.types.push(type);

        /*php
            this.$ = $this->remoteCellRangeValue($$[$0-4], $$[$0-2], $$[$0]);
        */
    
break;
case 33:

		//js
			var type = {
				t: 'cell',
				c: $$[$0-1],
				r: $$[$0]
			};
			this.$ = yy.types.length;
			yy.types.push(type);
	
break;
case 34:

		//js
            var type = {
            	t: 'cell',
                c: $$[$0-1],
                r: $$[$0]
            };
            this.$ = yy.types.length;
            yy.types.push(type);
	
break;
case 35: case 36:

        //js
            var type = {
            	t: 'cell',
                c: $$[$0-2],
                r: $$[$0]
            };
            this.$ = yy.types.length;
            yy.types.push(type);
    
break;
case 37: case 38: case 39: case 40: case 41: case 42: case 43: case 44: case 45: case 46: case 47: case 48: case 49:
return '#REF!';
break;
case 50:

	    //js
            this.$ = [$$[$0]];

        /*php
            this.$ = array($$[$0]);
        */
    
break;
case 53:

	    //js
	        $$[$0-2].push($$[$0]);
	        this.$ = $$[$0-2];

        /*php
            $$[$0-2][] = $$[$0];
            this.$ = $$[$0-2];
        */
    
break;
case 54:

 	    //js
	        $$[$0-2].push($$[$0]);
	        this.$ = $$[$0-2];

        /*php
			$$[$0-2][] = $$[$0];
			this.$ = $$[$0-2];
        */
    
break;
case 55:

        this.$ = [$$[$0]];
    
break;
case 56:

        //js
            this.$ = ($$[$0-2] instanceof Array ? $$[$0-2] : [$$[$0-2]]);
            this.$.push($$[$0]);

        /*php
            this.$ = (is_array($$[$0-2]) ? $$[$0-2] : array());
            this.$[] = $$[$0];
        */
    
break;
case 57:

        this.$ = $$[$0];
    
break;
case 58:

        //js
            this.$ = ($$[$0-2] + '.' + $$[$0]) * 1;

        /*php
            this.$ = $$[$0-2] . '.' . $$[$0];
        */
    
break;
case 59:

        this.$ = $$[$0-1] * 0.01;
    
break;
}
},
table: [{3:1,4:[1,2],5:3,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},{1:[3]},{1:[2,1]},{4:[1,23],13:$Vf,14:$Vg,15:$Vh,18:$Vi,19:$Vj,20:$Vk,21:$Vl,22:$Vm,23:$Vn},o($Vo,[2,3],{38:[1,33]}),o($Vo,[2,4]),o($Vo,[2,5]),o($Vo,[2,6],{39:[1,34]}),o($Vo,[2,7]),o($Vo,[2,8]),o($Vo,[2,9],{32:$Vp,33:$Vq,34:$Vr}),{5:38,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},{5:39,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},{5:40,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},o($Vo,[2,25]),{16:[1,41]},o($Vo,[2,28]),o($Vs,[2,55]),o($Vt,[2,57],{38:[1,42]}),o($Vo,[2,29],{29:[1,43]}),{31:[1,44]},{12:[1,45],34:[1,46]},o($Vu,[2,37],{32:[1,47],33:[1,49],34:[1,48]}),{1:[2,2]},{5:50,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},{5:51,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},{5:52,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},{5:55,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,14:[1,53],15:$V5,16:$V6,19:[1,54],20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},{5:57,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,14:[1,56],15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},{5:58,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},{5:59,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},{5:60,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},{5:61,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},{37:[1,62]},o($Vt,[2,59]),o($Vu,[2,33]),{32:[1,63],34:[1,64]},o($Vu,[2,39]),{13:$Vf,14:$Vg,15:$Vh,17:[1,65],18:$Vi,19:$Vj,20:$Vk,21:$Vl,22:$Vm,23:$Vn},o($Vv,[2,23],{13:$Vf,21:$Vl,22:$Vm,23:$Vn}),o($Vv,[2,24],{13:$Vf,21:$Vl,22:$Vm,23:$Vn}),{5:68,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,17:[1,66],20:$V7,24:$V8,25:$V9,26:67,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},{32:[1,69]},{12:$Vw,28:70,33:$Vc,34:$Vd},{12:$Vw,28:72,33:$Vc,34:$Vd},{32:[1,73],33:[1,74],34:[1,75]},{32:[1,76],33:[1,78],34:[1,77]},o($Vu,[2,38]),o($Vu,[2,40]),{32:[1,79],34:[1,80]},o([4,17,35,36],[2,10],{13:$Vf,14:$Vg,15:$Vh,18:$Vi,19:$Vj,20:$Vk,21:$Vl,22:$Vm,23:$Vn}),o([4,14,17,35,36],[2,11],{13:$Vf,15:$Vh,18:$Vi,19:$Vj,20:$Vk,21:$Vl,22:$Vm,23:$Vn}),o($Vv,[2,12],{13:$Vf,21:$Vl,22:$Vm,23:$Vn}),{5:81,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},{5:82,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},o($Vx,[2,18],{13:$Vf,15:$Vh,20:$Vk,21:$Vl,22:$Vm,23:$Vn}),{5:83,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},o($Vx,[2,17],{13:$Vf,15:$Vh,20:$Vk,21:$Vl,22:$Vm,23:$Vn}),o($Vv,[2,19],{13:$Vf,21:$Vl,22:$Vm,23:$Vn}),o($Vy,[2,20],{13:$Vf,23:$Vn}),o($Vy,[2,21],{13:$Vf,23:$Vn}),o([4,14,15,17,18,19,20,21,22,23,35,36],[2,22],{13:$Vf}),o($Vs,[2,56]),o($Vu,[2,35]),o($Vu,[2,45]),o($Vo,[2,13]),o($Vo,[2,26]),{17:[1,84],35:[1,85],36:[1,86]},o($Vz,[2,50],{13:$Vf,14:$Vg,15:$Vh,18:$Vi,19:$Vj,20:$Vk,21:$Vl,22:$Vm,23:$Vn}),o($Vt,[2,58]),o($Vo,[2,30]),{32:$Vp,33:$Vq,34:$Vr},o($Vo,[2,31],{29:[1,87]}),o($Vu,[2,34]),{32:[1,88]},o($Vu,[2,42]),o($Vu,[2,41]),o($Vu,[2,43]),{32:[1,89],34:[1,90]},o($Vu,[2,44]),o($Vu,[2,46]),o($Vx,[2,14],{13:$Vf,15:$Vh,20:$Vk,21:$Vl,22:$Vm,23:$Vn}),o($Vx,[2,16],{13:$Vf,15:$Vh,20:$Vk,21:$Vl,22:$Vm,23:$Vn}),o($Vx,[2,15],{13:$Vf,15:$Vh,20:$Vk,21:$Vl,22:$Vm,23:$Vn}),o($Vo,[2,27]),o($Vz,[2,51],{6:4,9:7,27:16,28:19,5:91,7:$V0,8:$V1,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve}),o($Vz,[2,52],{6:4,9:7,27:16,28:19,5:92,7:$V0,8:$V1,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve}),{12:$Vw,28:93,33:$Vc,34:$Vd},o($Vu,[2,36]),o($Vu,[2,47]),o($Vu,[2,49]),o($Vz,[2,53],{13:$Vf,14:$Vg,15:$Vh,18:$Vi,19:$Vj,20:$Vk,21:$Vl,22:$Vm,23:$Vn}),o($Vz,[2,54],{13:$Vf,14:$Vg,15:$Vh,18:$Vi,19:$Vj,20:$Vk,21:$Vl,22:$Vm,23:$Vn}),o($Vo,[2,32])],
defaultActions: {2:[2,1],23:[2,2]},
parseError: function parseError(str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        throw new Error(str);
    }
},
parse: function parse(input) {
    var self = this,
        stack = [0],
        tstack = [], // token stack
        vstack = [null], // semantic value stack
        lstack = [], // location stack
        table = this.table,
        yytext = '',
        yylineno = 0,
        yyleng = 0,
        recovering = 0,
        TERROR = 2,
        EOF = 1;

    var args = lstack.slice.call(arguments, 1);

    //this.reductionCount = this.shiftCount = 0;

    var lexer = Object.create(this.lexer);
    var sharedState = { yy: {} };
    // copy state
    for (var k in this.yy) {
      if (Object.prototype.hasOwnProperty.call(this.yy, k)) {
        sharedState.yy[k] = this.yy[k];
      }
    }

    lexer.setInput(input, sharedState.yy);
    sharedState.yy.lexer = lexer;
    sharedState.yy.parser = this;
    if (typeof lexer.yylloc == 'undefined') {
        lexer.yylloc = {};
    }
    var yyloc = lexer.yylloc;
    lstack.push(yyloc);

    var ranges = lexer.options && lexer.options.ranges;

    if (typeof sharedState.yy.parseError === 'function') {
        this.parseError = sharedState.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }

    function popStack (n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }

_token_stack:
    function lex() {
        var token;
        token = lexer.lex() || EOF;
        // if token isn't its numeric value, convert
        if (typeof token !== 'number') {
            token = self.symbols_[token] || token;
        }
        return token;
    }

    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        // retreive state number from top of stack
        state = stack[stack.length - 1];

        // use default actions if available
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            // read action for current state and first input
            action = table[state] && table[state][symbol];
        }

_handle_error:
        // handle parse error
        if (typeof action === 'undefined' || !action.length || !action[0]) {
            var error_rule_depth;
            var errStr = '';

            // Return the rule stack depth where the nearest error rule can be found.
            // Return FALSE when no error recovery rule was found.
            function locateNearestErrorRecoveryRule(state) {
                var stack_probe = stack.length - 1;
                var depth = 0;

                // try to recover from error
                for(;;) {
                    // check for error recovery rule in this state
                    if ((TERROR.toString()) in table[state]) {
                        return depth;
                    }
                    if (state === 0 || stack_probe < 2) {
                        return false; // No suitable error recovery rule available.
                    }
                    stack_probe -= 2; // popStack(1): [symbol, action]
                    state = stack[stack_probe];
                    ++depth;
                }
            }

            if (!recovering) {
                // first see if there's any chance at hitting an error recovery rule:
                error_rule_depth = locateNearestErrorRecoveryRule(state);

                // Report error
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push("'"+this.terminals_[p]+"'");
                    }
                }
                if (lexer.showPosition) {
                    errStr = 'Parse error on line '+(yylineno+1)+":\n"+lexer.showPosition()+"\nExpecting "+expected.join(', ') + ", got '" + (this.terminals_[symbol] || symbol)+ "'";
                } else {
                    errStr = 'Parse error on line '+(yylineno+1)+": Unexpected " +
                                  (symbol == EOF ? "end of input" :
                                              ("'"+(this.terminals_[symbol] || symbol)+"'"));
                }
                return this.parseError(errStr, {
                    text: lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: lexer.yylineno,
                    loc: yyloc,
                    expected: expected,
                    recoverable: (error_rule_depth !== false)
                });
            } else if (preErrorSymbol !== EOF) {
                error_rule_depth = locateNearestErrorRecoveryRule(state);
            }

            // just recovered from another error
            if (recovering == 3) {
                if (symbol === EOF || preErrorSymbol === EOF) {
                    throw new Error(errStr || 'Parsing halted while starting to recover from another error.');
                }

                // discard current lookahead and grab another
                yyleng = lexer.yyleng;
                yytext = lexer.yytext;
                yylineno = lexer.yylineno;
                yyloc = lexer.yylloc;
                symbol = lex();
            }

            // try to recover from error
            if (error_rule_depth === false) {
                throw new Error(errStr || 'Parsing halted. No suitable error recovery rule available.');
            }
            popStack(error_rule_depth);

            preErrorSymbol = (symbol == TERROR ? null : symbol); // save the lookahead token
            symbol = TERROR;         // insert generic error symbol as new lookahead
            state = stack[stack.length-1];
            action = table[state] && table[state][TERROR];
            recovering = 3; // allow 3 real symbols to be shifted before reporting a new error
        }

        // this shouldn't happen, unless resolve defaults are off
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: '+state+', token: '+symbol);
        }

        switch (action[0]) {
            case 1: // shift
                //this.shiftCount++;

                stack.push(symbol);
                vstack.push(lexer.yytext);
                lstack.push(lexer.yylloc);
                stack.push(action[1]); // push state
                symbol = null;
                if (!preErrorSymbol) { // normal execution/no error
                    yyleng = lexer.yyleng;
                    yytext = lexer.yytext;
                    yylineno = lexer.yylineno;
                    yyloc = lexer.yylloc;
                    if (recovering > 0) {
                        recovering--;
                    }
                } else {
                    // error just occurred, resume old lookahead f/ before error
                    symbol = preErrorSymbol;
                    preErrorSymbol = null;
                }
                break;

            case 2:
                // reduce
                //this.reductionCount++;

                len = this.productions_[action[1]][1];

                // perform semantic action
                yyval.$ = vstack[vstack.length-len]; // default to $$ = $1
                // default location, uses first token for firsts, last for lasts
                yyval._$ = {
                    first_line: lstack[lstack.length-(len||1)].first_line,
                    last_line: lstack[lstack.length-1].last_line,
                    first_column: lstack[lstack.length-(len||1)].first_column,
                    last_column: lstack[lstack.length-1].last_column
                };
                if (ranges) {
                  yyval._$.range = [lstack[lstack.length-(len||1)].range[0], lstack[lstack.length-1].range[1]];
                }
                r = this.performAction.apply(yyval, [yytext, yyleng, yylineno, sharedState.yy, action[1], vstack, lstack].concat(args));

                if (typeof r !== 'undefined') {
                    return r;
                }

                // pop off stack
                if (len) {
                    stack = stack.slice(0,-1*len*2);
                    vstack = vstack.slice(0, -1*len);
                    lstack = lstack.slice(0, -1*len);
                }

                stack.push(this.productions_[action[1]][0]);    // push nonterminal (reduce)
                vstack.push(yyval.$);
                lstack.push(yyval._$);
                // goto new state = table[STATE][NONTERMINAL]
                newState = table[stack[stack.length-2]][stack[stack.length-1]];
                stack.push(newState);
                break;

            case 3:
                // accept
                return true;
        }

    }

    return true;
}};

var Formula = function(handler) {
	var formulaLexer = function () {};
	formulaLexer.prototype = parser.lexer;

	var formulaParser = function () {
		this.lexer = new formulaLexer();
		this.yy = {
			types: [],
			escape: function(value) {
				return value
					.replace(/&/gi, '&amp;')
					.replace(/>/gi, '&gt;')
					.replace(/</gi, '&lt;')
					.replace(/\n/g, '\n<br>')
					.replace(/\t/g, '&nbsp;&nbsp;&nbsp ')
					.replace(/  /g, '&nbsp; ');
			},
			parseError: function(msg, hash) {
				this.done = true;
				var result = new String();
				result.html = '<pre>' + msg + '</pre>';
				result.hash = hash;
				return result;
			}
		};
	};

	formulaParser.prototype = parser;
	var newParser = new formulaParser();
	return newParser;
};
if (typeof(window) !== 'undefined') {
	window.Formula = Formula;
} else {
	parser.Formula = Formula;
}/* generated by jison-lex 0.3.4 */
var lexer = (function(){
var lexer = ({

EOF:1,

parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },

// resets the lexer, sets new input
setInput:function (input, yy) {
        this.yy = yy || this.yy || {};
        this._input = new Parser.InputReader(input);
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0,0];
        }
        this.offset = 0;
        return this;
    },

// consumes and returns one char from the input
input:function () {
        var ch = this._input.ch();
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }

        return ch;
    },

// unshifts one char (or a string) into the input
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input.unCh(len, ch);
        this.yytext = this.yytext.substr(0, this.yytext.length - len);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);

        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;

        this.yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
              this.yylloc.first_column - len
        };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    },

// When called from action, caches matched text and appends it on next action
more:function () {
        this._more = true;
        return this;
    },

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });

        }
        return this;
    },

// retain first n characters of the match
less:function (n) {
        this.unput(this.match.slice(n));
    },

// displays already matched input, i.e. for error messages
pastInput:function () {
        var matched = this._input.toString();
        var past = matched.substr(0, matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },

// displays upcoming input, i.e. for error messages
upcomingInput:function () {
        var next = this._input.input.substr(this._input.position, this._input.input.length - 1);
        return (next.substr(0, 20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    },

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    },

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function (match, indexed_rule) {
        var token,
            lines,
            backup,
            k;

        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = this.yylloc.range.slice(0);
            }
        }

        lines = match.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines !== null ?
                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                         this.yylloc.last_column + match.length
        };
        this.yytext += match;
        this.match += match;
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input.addMatch(match);
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && !this._input.done) {
            this.done = false;
        }
        if (token) {
            return token;
        } else if (this._backtrack) {
            // recover context
            for (k in backup) if (backup.hasOwnProperty(k)) {
                this[k] = backup[k];
            }
            return null; // rule action called reject() implying the next rule should be tested instead.
        }
        return null;
    },

// return next match in input
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (this._input.done) {
            this.done = true;
        }

        var token,
            match,
            tempMatch,
            index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch !== null && (match === undefined || tempMatch[0].length > match.length)) {
                match = tempMatch[0];
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch[0], rules[i]);
                    if (token !== null) {
                        return token;
                    } else if (this._backtrack) {
                        match = undefined;
                        continue; // rule action called reject() implying a rule MISmatch.
                    } else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return null;
                    }
                } else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match !== undefined) {
            token = this.test_match(match, rules[index]);
            if (token !== null) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return null;
        }
        if (this._input.done) {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    },

// return next match that has a token
lex:function lex() {
        var r = this.next();
        if (r !== null) {
            return r;
        } else {
            return this.lex();
        }
    },

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },

// pop the previously active lexer condition state off the condition stack
popState:function popState() {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        } else {
            return this.conditionStack[0];
        }
    },

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
            return this.conditions["INITIAL"].rules;
        }
    },

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState(n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        } else {
            return "INITIAL";
        }
    },

// alias for begin(condition)
pushState:function pushState(condition) {
        this.begin(condition);
    },

// return the number of states currently on the stack
stateStackSize:function stateStackSize() {
        return this.conditionStack.length;
    },
options: {},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {
var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:/* skip whitespace */
break;
case 1:return 25;
break;
case 2:return 7;
break;
case 3:return 8;
break;
case 4:
	return 30;

break;
case 5:
    //js
        yy_.yytext = yy_.yytext.substring(1, yy_.yytext.length - 1);
        return 30;

    /*php
        $yy_.yytext = substr($yy_.yytext, 1, -1);
        return 30;
    */

break;
case 6:return 10;
break;
case 7:return 10;
break;
case 8:return 11;
break;
case 9:return 11;
break;
case 10:return 12;
break;
case 11:return 37;
break;
case 12:return 37;
break;
case 13:return 32;
break;
case 14:return 33;
break;
case 15:return 13;
break;
case 16:return ' ';
break;
case 17:return 38;
break;
case 18:return 29;
break;
case 19:return 35;
break;
case 20:return 36;
break;
case 21:return 21;
break;
case 22:return 22;
break;
case 23:return 20;
break;
case 24:return 15;
break;
case 25:return 23;
break;
case 26:return 16;
break;
case 27:return 17;
break;
case 28:return 19;
break;
case 29:return 18;
break;
case 30:return 'PI';
break;
case 31:return 24;
break;
case 32:return '"';
break;
case 33:return "'";
break;
case 34:return '\"';
break;
case 35:return "\'";
break;
case 36:return "!";
break;
case 37:return 14;
break;
case 38:return 39;
break;
case 39:return 34;
break;
case 40:return '#';
break;
case 41:return 4;
break;
}
},
rules: [/^(?:\s+)/,/^(?:([A-Za-z]{1,})([A-Za-z_0-9]+)?(?=[(]))/,/^(?:([0]?[1-9]|1[0-2])[:][0-5][0-9]([:][0-5][0-9])?[ ]?(AM|am|aM|Am|PM|pm|pM|Pm))/,/^(?:([0]?[0-9]|1[0-9]|2[0-3])[:][0-5][0-9]([:][0-5][0-9])?)/,/^(?:(([A-Za-z0-9]+))(?=[!]))/,/^(?:((['](\\[']|[^'])*['])|(["](\\["]|[^"])*["]))(?=[!]))/,/^(?:((['](\\[']|[^'])*['])))/,/^(?:((["](\\["]|[^"])*["])))/,/^(?:(([\\]['].+?[\\]['])))/,/^(?:(([\\]["].+?[\\]["])))/,/^(?:[A-Z]+(?=[0-9$]))/,/^(?:[A-Za-z]{1,}[A-Za-z_0-9]+)/,/^(?:[A-Za-z_]+)/,/^(?:[0-9]+)/,/^(?:\$)/,/^(?:&)/,/^(?: )/,/^(?:[.])/,/^(?::)/,/^(?:;)/,/^(?:,)/,/^(?:\*)/,/^(?:\/)/,/^(?:-)/,/^(?:\+)/,/^(?:\^)/,/^(?:\()/,/^(?:\))/,/^(?:>)/,/^(?:<)/,/^(?:PI\b)/,/^(?:E\b)/,/^(?:")/,/^(?:')/,/^(?:\\")/,/^(?:\\')/,/^(?:!)/,/^(?:=)/,/^(?:%)/,/^(?:#REF!)/,/^(?:[#])/,/^(?:$)/],
conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41],"inclusive":true}}
});
return lexer;
})();
parser.lexer = lexer;
function Parser () {
  this.yy = {};
}Parser.prototype = parser;

/**
 * in input reader for parser/lexer, uses sticky behavior when available, falls back to standard string modification when it is not
 * @param {String} input
 */
Parser.InputReader = (function(Math, parser, lexer) {
    var stickyCompatible = RegExp.prototype.sticky !== undefined,
        rules,
        rule,
        max,
        i;

    function Parser_InputReader(input) {
        this.done = false;
        this.input = input;
        this.length = input.length;
        this.matches = [];
        this.position = 0;
    }

	//sticky implementation
    if (stickyCompatible) {
        Parser_InputReader.prototype = {
            addMatch: function addMatch(match) {
                this.matches.push(match);
                this.position += match.length;
                this.done = (this.position >= this.length);
            },

            ch: function ch() {
                var ch = this.input[this.position];
                this.addMatch(ch);
                return ch;
            },

            unCh: function unCh(chLength) {
                this.position -= chLength;
                this.position = Math.max(0, this.position);
                this.done = (this.position >= this.length);
            },

            substring: function substring(start, end) {
                start = (start != 0 ? this.position + start : this.position);
                end = (end != 0 ? start + end : this.length);
                return this.input.substring(start, end);
            },

            match: function match(rule) {
                var match;
                rule.lastIndex = this.position;
                if ((match = rule.exec(this.input)) !== null) {
                    return match;
                }
                return null;
            },

            toString: function toString() {
                return this.matches.join('');
            }
        };

        rules = lexer.rules;
        max = rules.length;
        i = 0;
        for(;i < max; i++) {
            rule = rules[i];
            rules[i] = new RegExp(rule.source.substring(1),'y');
        }
    }

    //fallback to non-sticky implementations
    else {

        Parser_InputReader.prototype = {
            addMatch: function addMatch(match) {
                this.input = this.input.slice(match.length);
                this.matches.push(match);
                this.position += match.length;
                this.done = (this.position >= this.length);
            },

            ch: function ch() {
                var ch = this.input[0];
                this.addMatch(ch);
                return ch;
            },

            unCh: function unCh(chLength, ch) {
                this.position -= chLength;
                this.position = Math.max(0, this.position);
	            this.input = ch + this.input;
                this.done = (this.position >= this.length);
            },

            substring: function substring(start, end) {
                start = (start != 0 ? this.position + start : this.position);
                end = (end != 0 ? start + end : this.length);
                return this.input.substring(start, end);
            },

            match: function match(rule) {
                var match,
                    input = this.input;

                if ((match = input.match(rule)) !== null) {
                    return match;
                }

                return null;
            },

            toString: function toString() {
                return this.matches.join('');
            }
        };
    }

    return Parser_InputReader;
})(Math, parser, lexer);
parser.Parser = Parser;
return new Parser;
})();


if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = parser;
exports.Parser = parser.Parser;
exports.parse = function () { return parser.parse.apply(parser, arguments); };
exports.main = function commonjsMain(args) {
    if (!args[1]) {
        console.log('Usage: '+args[0]+' FILE');
        process.exit(1);
    }
    var source = require('fs').readFileSync(require('path').normalize(args[1]), "utf8");
    return exports.parser.parse(source);
};
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(process.argv.slice(1));
}
}
/* parser generated by jison 0.4.15 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var parser = (function(){
var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[1,10],$V1=[1,11],$V2=[1,12],$V3=[1,13],$V4=[5,7,8,9,10],$V5=[1,19],$V6=[1,20],$V7=[5,7,8,9,10,12,13],$V8=[1,21],$V9=[5,7,8,9,10,12,13,14,16];
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"grid":3,"rows":4,"EOF":5,"row":6,"END_OF_LINE":7,"END_OF_LINE_WITH_EMPTY_NEXT_FIRST_COLUMN":8,"END_OF_LINE_WITH_NO_COLUMNS":9,"END_OF_LINE_WITH_EMPTY_COLUMN":10,"string":11,"COLUMN_EMPTY":12,"COLUMN_STRING":13,"CHAR":14,"QUOTE_ON":15,"QUOTE_OFF":16,"$accept":0,"$end":1},
terminals_: {2:"error",5:"EOF",7:"END_OF_LINE",8:"END_OF_LINE_WITH_EMPTY_NEXT_FIRST_COLUMN",9:"END_OF_LINE_WITH_NO_COLUMNS",10:"END_OF_LINE_WITH_EMPTY_COLUMN",12:"COLUMN_EMPTY",13:"COLUMN_STRING",14:"CHAR",15:"QUOTE_ON",16:"QUOTE_OFF"},
productions_: [0,[3,2],[3,1],[4,1],[4,1],[4,1],[4,1],[4,1],[4,2],[4,2],[4,2],[4,2],[4,3],[4,3],[4,3],[4,3],[6,1],[6,1],[6,2],[6,3],[6,1],[6,2],[6,3],[11,1],[11,2],[11,3]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:

		return $$[$0-1];
	
break;
case 2:

		return [['']];
	
break;
case 3:

	    //row
		this.$ = [$$[$0]];
	
break;
case 4:

	    //END_OF_LINE
        this.$ = [];
	
break;
case 5:

	    //END_OF_LINE_WITH_EMPTY_NEXT_FIRST_COLUMN
	    this.$ = [''];
	
break;
case 6:

	    //END_OF_LINE_WITH_NO_COLUMNS
	    this.$ = [''];
	
break;
case 7:

        //END_OF_LINE_WITH_EMPTY_COLUMN
        this.$ = [''];
    
break;
case 8:

        //rows END_OF_LINE
        this.$ = $$[$0-1];
    
break;
case 9:

        //rows END_OF_LINE_WITH_EMPTY_NEXT_FIRST_COLUMN
        $$[$0-1].push(['']);
        this.$ = $$[$0-1];
    
break;
case 10:

        //rows END_OF_LINE_WITH_NO_COLUMNS
        $$[$0-1].push(['']);
        this.$ = $$[$0-1];
    
break;
case 11:

        //rows END_OF_LINE_WITH_EMPTY_COLUMN
        $$[$0-1][$$[$0-1].length - 1].push('');
        this.$ = $$[$0-1];
    
break;
case 12:

        //rows END_OF_LINE row
        $$[$0-2].push($$[$0]);
        this.$ = $$[$0-2];
    
break;
case 13:

        //rows END_OF_LINE_WITH_EMPTY_NEXT_FIRST_COLUMN row
        $$[$0].unshift('');
        $$[$0-2].push($$[$0]);
        this.$ = $$[$0-2];
    
break;
case 14:

        //rows END_OF_LINE_WITH_NO_COLUMNS row
        $$[$0-2].push(['']);
        $$[$0-2].push($$[$0]);
        this.$ = $$[$0-2];
    
break;
case 15:

        //rows END_OF_LINE_WITH_EMPTY_COLUMN row
        $$[$0-2][$$[$0-2].length - 1].push('');
        $$[$0-2].push($$[$0]);
        this.$ = $$[$0-2];
    
break;
case 16:

	    //string
		this.$ = [$$[$0].join('')];
	
break;
case 17:

	    //COLUMN_EMPTY
		this.$ = [''];
	
break;
case 18:

        //row COLUMN_EMPTY
        $$[$0-1].push('');
        this.$ = $$[$0-1];
    
break;
case 19:

        //row COLUMN_EMPTY string
        $$[$0-2].push('');
        $$[$0-2].push($$[$0].join(''));
        this.$ = $$[$0-2];
    
break;
case 20:

        //COLUMN_STRING
    
break;
case 21:

        //row COLUMN_STRING
    
break;
case 22:

        //row COLUMN_STRING string
        $$[$0-2].push($$[$0].join(''));
        this.$ = $$[$0-2];
    
break;
case 23:

	    //CHAR
		this.$ = [$$[$0]];
	
break;
case 24:

	    //string CHAR
		$$[$0-1].push($$[$0]);
		this.$ = $$[$0-1];
	
break;
case 25:

	    //QUOTE_ON string QUOTE_OFF
        this.$ = $$[$0-1];
    
break;
}
},
table: [{3:1,4:2,5:[1,3],6:4,7:[1,5],8:[1,6],9:[1,7],10:[1,8],11:9,12:$V0,13:$V1,14:$V2,15:$V3},{1:[3]},{5:[1,14],7:[1,15],8:[1,16],9:[1,17],10:[1,18]},{1:[2,2]},o($V4,[2,3],{12:$V5,13:$V6}),o($V4,[2,4]),o($V4,[2,5]),o($V4,[2,6]),o($V4,[2,7]),o($V7,[2,16],{14:$V8}),o($V7,[2,17]),o($V7,[2,20]),o($V9,[2,23]),{11:22,14:$V2,15:$V3},{1:[2,1]},o($V4,[2,8],{11:9,6:23,12:$V0,13:$V1,14:$V2,15:$V3}),o($V4,[2,9],{11:9,6:24,12:$V0,13:$V1,14:$V2,15:$V3}),o($V4,[2,10],{11:9,6:25,12:$V0,13:$V1,14:$V2,15:$V3}),o($V4,[2,11],{11:9,6:26,12:$V0,13:$V1,14:$V2,15:$V3}),o($V7,[2,18],{11:27,14:$V2,15:$V3}),o($V7,[2,21],{11:28,14:$V2,15:$V3}),o($V9,[2,24]),{14:$V8,16:[1,29]},o($V4,[2,12],{12:$V5,13:$V6}),o($V4,[2,13],{12:$V5,13:$V6}),o($V4,[2,14],{12:$V5,13:$V6}),o($V4,[2,15],{12:$V5,13:$V6}),o($V7,[2,19],{14:$V8}),o($V7,[2,22],{14:$V8}),o($V9,[2,25])],
defaultActions: {3:[2,2],14:[2,1]},
parseError: function parseError(str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        throw new Error(str);
    }
},
parse: function parse(input) {
    var self = this, stack = [0], tstack = [], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    var args = lstack.slice.call(arguments, 1);
    var lexer = Object.create(this.lexer);
    var sharedState = { yy: {} };
    for (var k in this.yy) {
        if (Object.prototype.hasOwnProperty.call(this.yy, k)) {
            sharedState.yy[k] = this.yy[k];
        }
    }
    lexer.setInput(input, sharedState.yy);
    sharedState.yy.lexer = lexer;
    sharedState.yy.parser = this;
    if (typeof lexer.yylloc == 'undefined') {
        lexer.yylloc = {};
    }
    var yyloc = lexer.yylloc;
    lstack.push(yyloc);
    var ranges = lexer.options && lexer.options.ranges;
    if (typeof sharedState.yy.parseError === 'function') {
        this.parseError = sharedState.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    _token_stack:
        function lex() {
            var token;
            token = lexer.lex() || EOF;
            if (typeof token !== 'number') {
                token = self.symbols_[token] || token;
            }
            return token;
        }
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
                    if (typeof action === 'undefined' || !action.length || !action[0]) {
                var errStr = '';
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push('\'' + this.terminals_[p] + '\'');
                    }
                }
                if (lexer.showPosition) {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                } else {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                }
                this.parseError(errStr, {
                    text: lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: lexer.yylineno,
                    loc: yyloc,
                    expected: expected
                });
            }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(lexer.yytext);
            lstack.push(lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = lexer.yyleng;
                yytext = lexer.yytext;
                yylineno = lexer.yylineno;
                yyloc = lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
                yyval._$.range = [
                    lstack[lstack.length - (len || 1)].range[0],
                    lstack[lstack.length - 1].range[1]
                ];
            }
            r = this.performAction.apply(yyval, [
                yytext,
                yyleng,
                yylineno,
                sharedState.yy,
                action[1],
                vstack,
                lstack
            ].concat(args));
            if (typeof r !== 'undefined') {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}};

if (typeof GLOBAL !== 'undefined') {
    GLOBAL.window = GLOBAL;
}
if (typeof window.TSV === 'undefined') {
    var parse = parser.parse;
    parser.parse = function(input) {
        var setInput = this.lexer.setInput;
        this.lexer.setInput = function(input) {
            setInput.call(this, input);
            this.begin('BOF');
            return this;
        };

        this.parse = parse;
        return parse.call(this, input);
    };

	window.TSV = function(handler) {
		var TSVLexer = function () {};
		TSVLexer.prototype = parser.lexer;

		var TSVParser = function () {
			this.lexer = new TSVLexer();
			this.yy = {};
		};

		TSVParser.prototype = parser;
		var newParser = new TSVParser;
		newParser.setObj = function(obj) {
			newParser.yy.obj = obj;
		};
		newParser.yy.handler = handler;
		return newParser;
	};
}/* generated by jison-lex 0.3.4 */
var lexer = (function(){
var lexer = ({

EOF:1,

parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },

// resets the lexer, sets new input
setInput:function (input, yy) {
        this.yy = yy || this.yy || {};
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0,0];
        }
        this.offset = 0;
        return this;
    },

// consumes and returns one char from the input
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }

        this._input = this._input.slice(1);
        return ch;
    },

// unshifts one char (or a string) into the input
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);

        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;

        this.yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
              this.yylloc.first_column - len
        };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    },

// When called from action, caches matched text and appends it on next action
more:function () {
        this._more = true;
        return this;
    },

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });

        }
        return this;
    },

// retain first n characters of the match
less:function (n) {
        this.unput(this.match.slice(n));
    },

// displays already matched input, i.e. for error messages
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },

// displays upcoming input, i.e. for error messages
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    },

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    },

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function (match, indexed_rule) {
        var token,
            lines,
            backup;

        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                matched: this.matched,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                _input: this._input,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = this.yylloc.range.slice(0);
            }
        }

        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines ?
                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                         this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
            this.done = false;
        }
        if (token) {
            return token;
        } else if (this._backtrack) {
            // recover context
            for (var k in backup) {
                this[k] = backup[k];
            }
            return false; // rule action called reject() implying the next rule should be tested instead.
        }
        return false;
    },

// return next match in input
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) {
            this.done = true;
        }

        var token,
            match,
            tempMatch,
            index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch, rules[i]);
                    if (token !== false) {
                        return token;
                    } else if (this._backtrack) {
                        match = false;
                        continue; // rule action called reject() implying a rule MISmatch.
                    } else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return false;
                    }
                } else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match) {
            token = this.test_match(match, rules[index]);
            if (token !== false) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return false;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    },

// return next match that has a token
lex:function lex() {
        var r = this.next();
        if (r) {
            return r;
        } else {
            return this.lex();
        }
    },

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },

// pop the previously active lexer condition state off the condition stack
popState:function popState() {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        } else {
            return this.conditionStack[0];
        }
    },

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
            return this.conditions["INITIAL"].rules;
        }
    },

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState(n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        } else {
            return "INITIAL";
        }
    },

// alias for begin(condition)
pushState:function pushState(condition) {
        this.begin(condition);
    },

// return the number of states currently on the stack
stateStackSize:function stateStackSize() {
        return this.conditionStack.length;
    },
options: {},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {
var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:
    //<QUOTE>(\n|"\n")
    return 14;

break;
case 1:
    //<QUOTE>([\'\"])(?=<<EOF>>)
    this.popState();
    return 16;

break;
case 2:
    //<QUOTE>([\'\"])
    if (yy_.yytext == this.quoteChar) {
        this.popState();
        this.begin('STRING');
        return 16;
	} else {
	    return 14;
	}

break;
case 3:
    //<QUOTE>(?=(\t))
	this.popState();
	this.begin('STRING');
	return 14;

break;
case 4:
    //<BOF>([\'\"])
    this.popState();
    this.quoteChar = yy_.yytext.substring(0);
	this.begin('QUOTE');
	return 15;

break;
case 5:
    //<PRE_QUOTE>([\'\"])
    this.quoteChar = yy_.yytext;
    this.popState();
	this.begin('QUOTE');
	return 15;

break;
case 6:
    //(\t|"\t")(?=[\'\"])
	this.begin('PRE_QUOTE');
	return 13;

break;
case 7:
    //(\n|"\n")(?=[\'\"])
	this.begin('PRE_QUOTE');
	return 7;

break;
case 8:
    //<QUOTE>([a-zA-Z0-9_]+|.)
    return 14;

break;
case 9:
    //<STRING>(\n\n|"\n\n")
	this.popState();
	return 8;

break;
case 10:
    //<STRING>(\n\n|"\n\n")
	this.popState();
	return 9;

break;
case 11:
    //<STRING>(\n|"\n")
	this.popState();
	return 7;

break;
case 12:
    //<STRING>(\t|"\t")
	this.popState();
	return 13;

break;
case 13:
    //<STRING>([a-zA-Z0-9_ ]+|.)
    return 14;

break;
case 14:
    //<BOF>
    this.popState();

break;
case 15:
    return 'BUFFIN';

break;
case 16:
    //(\n\n|"\n\n")
    return 9;

break;
case 17:
    //(\t\n)
    return 10;

break;
case 18:
    //(\t)
    return 12;

break;
case 19:
    //(\n)
    return 7;

break;
case 20:
    //([a-zA-Z0-9_ ]+|.)
	this.begin('STRING');
	return 14;

break;
case 21:
    //<<EOF>>
    //lexer.yy.conditionStack = [];
    return 5;

break;
}
},
rules: [/^(?:(\n|\\n))/,/^(?:([\'\"])(?=$))/,/^(?:([\'\"]))/,/^(?:(?=(\t)))/,/^(?:([\'\"]))/,/^(?:([\'\"]))/,/^(?:(\t|\\t)(?=[\'\"]))/,/^(?:(\n|\\n)(?=[\'\"]))/,/^(?:([a-zA-Z0-9_ ]+|.))/,/^(?:(\n\t|\\n\\t))/,/^(?:(\n\n|\\n\\n))/,/^(?:(\n|\\n))/,/^(?:(\t|\\t))/,/^(?:([a-zA-Z0-9_ ]+|.))/,/^(?:)/,/^(?:(\n\t|\\n\\t)(?=.))/,/^(?:(\n\n|\\n\\n))/,/^(?:(\t\n))/,/^(?:(\t))/,/^(?:(\n))/,/^(?:([a-zA-Z0-9_ ]+|.))/,/^(?:$)/],
conditions: {"BOF":{"rules":[4,6,7,14,15,16,17,18,19,20,21],"inclusive":true},"PRE_QUOTE":{"rules":[5,6,7,15,16,17,18,19,20,21],"inclusive":true},"QUOTE":{"rules":[0,1,2,3,6,7,8,15,16,17,18,19,20,21],"inclusive":true},"STRING":{"rules":[6,7,9,10,11,12,13,15,16,17,18,19,20,21],"inclusive":true},"INITIAL":{"rules":[6,7,15,16,17,18,19,20,21],"inclusive":true}}
});
return lexer;
})();
parser.lexer = lexer;
function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();


if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = parser;
exports.Parser = parser.Parser;
exports.parse = function () { return parser.parse.apply(parser, arguments); };
exports.main = function commonjsMain(args) {
    if (!args[1]) {
        console.log('Usage: '+args[0]+' FILE');
        process.exit(1);
    }
    var source = require('fs').readFileSync(require('path').normalize(args[1]), "utf8");
    return exports.parser.parse(source);
};
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(process.argv.slice(1));
}
}
