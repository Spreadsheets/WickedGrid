Sheet.CellHandler = (function(Math) {
	function isNum(num) {
		return !isNaN(num);
	}

	var u = undefined,
		nAN = NaN;

	function CellHandler(jS, fn) {
		this.jS = jS;
		this.fn = fn;
	}

	CellHandler.prototype = {
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
				loc = this.parseLocation(cellRef.c, cellRef.r),
				cell;

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
			var jS = this.jS,
				loc = this.parseLocation(cellRef.c, cellRef.r),
				sheetIndex = this.parseSheetLocation(sheet),
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
			var sheetIndex = (typeof sheetTitle === 'string' ? this.parseSheetLocation(sheetTitle) : sheetTitle),
				_start = this.parseLocation(start.c, start.r),
				_end = this.parseLocation(end.c, end.r),
				rowIndex = (_start.row < _end.row ? _start.row : _end.row),
				rowIndexEnd = (_start.row < _end.row ? _end.row : _start.row),
				colIndexStart = (_start.col < _end.col ? _start.col : _end.col),
				colIndex = colIndexStart,
				colIndexEnd = (_start.col < _end.col ? _end.col : _start.col),
				totalNeedResolved = (colIndexEnd - (colIndexStart - 1)) * (rowIndexEnd - (rowIndex - 1)),
				currentlyResolve = 0,
				jS = this.jS,
				result = [],
				cachedRange,
				useCache,
				cell,
				row,
				key,
				i = 0,
				max,
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

			key = sheetIndex + '!' + start.c + start.r + ':' + end.c + end.r;
			cachedRange = CellHandler.cellRangeCache[key];

			if (cachedRange !== u) {
				useCache = true;
				max = cachedRange.length;
				for (i = 0; i < max; i++) {
					if (cachedRange[i].needsUpdated) {
						useCache = false
					}
				}

				if (useCache) {
					callback.call(parentCell, CellHandler.cellRangeCache[key]);
					return this;
				}
			}

			sheet = jS.spreadsheets[sheetIndex];

			if (sheet === u) {
				jS.spreadsheets[sheetIndex] = sheet = [];
			}

			result.rowCount = (rowIndexEnd - rowIndex) + 1;
			result.columnCount = (colIndexEnd - colIndex) + 1;

			for (;rowIndex <= rowIndexEnd;rowIndex++) {
				colIndex = colIndexStart;
				row = (sheet[rowIndex] !== u ? sheet[rowIndex] : null);
				for (; colIndex <= colIndexEnd;colIndex++) {
					if (row === null || (cell = row[colIndex]) === u) {
						cell = jS.getCell(sheetIndex, rowIndex, colIndex);
					} else {
						cell.sheetIndex = sheetIndex;
						cell.rowIndex = rowIndex;
						cell.columnIndex = colIndex;
					}

					if (cell !== null) {
						cell.addDependency(parentCell);
						(function(i) {
							cell.updateValue(function(value) {
								result[i] = value;
								currentlyResolve++;
								if (currentlyResolve === totalNeedResolved) {
									CellHandler.cellRangeCache[key] = result;
									callback.call(parentCell, result);
								}
							});
						})(i++);
					}
				}
			}

			if (i !== totalNeedResolved) {
				//throw new Error('Not all cells were found and added to range');
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
		},
		/**
		 * Parse a cell name to it's location
		 * @param {String} columnStr "A"
		 * @param {String|Number} rowString "1"
		 * @returns {Object} {row: 1, col: 1}
		 */
		parseLocation: function (columnStr, rowString) {
			return {
				row: rowString - 1,
				col: this.columnLabelIndex(columnStr)
			};
		},

		/**
		 * Parse a sheet name to it's index
		 * @param {String} locStr SHEET1 = 0
		 * @returns {Number}
		 */
		parseSheetLocation: function (locStr) {
			var sheetIndex = ((locStr + '').replace(/SHEET/i, '') * 1) - 1;
			return isNaN(sheetIndex) ? -1 : sheetIndex ;
		},

		/**
		 *
		 * @param {Number} col 0 = A
		 * @param {Number} row 0 = 1
		 * @returns {String}
		 */
		parseCellName: function (col, row) {
			var rowString = '';
			if (row !== undefined) {
				row++;
				rowString = row.toString();
			}
			return this.columnLabelString(col) + rowString;
		},

		/**
		 * Available labels, used for their index
		 */
		alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
		/**
		 * Available labels, used for their index
		 */
		columnLabels: {},
		/**
		 * Get index of a column label
		 * @param {String} str A to 1, B to 2, Z to 26, AA to 27
		 * @returns {Number}
		 */
		columnLabelIndex: function (str) {
			return this.columnLabels[str.toUpperCase()];
		},

		/**
		 * Available indexes, used for their labels
		 */
		columnIndexes:[],

		/**
		 * Get label of a column index
		 * @param {Number} index 1 = A, 2 = B, 26 = Z, 27 = AA
		 * @returns {String}
		 */
		columnLabelString: function (index) {
			if (!this.columnIndexes.length) { //cache the indexes to save on processing
				var s = '', i, j, k, l;
				i = j = k = -1;
				for (l = 0; l < 16385; ++l) {
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
		}
	};

	CellHandler.cellRangeCache = {};

	return CellHandler;
})(Math);