Sheet.CellHandler = (function(Math) {
	function isNum(num) {
		return !isNaN(num);
	}

	var u = undefined,
		nAN = NaN;

	function Constructor(jS, jSE, fn) {
		this.jS = jS;
		this.jSE = jSE;
		this.fn = fn;
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
})(Math);