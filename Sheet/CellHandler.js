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
		 * @returns {*}
		 */
		variable:function (variable) {
			if (arguments.length) {
				var name = arguments[0],
					attr = arguments[1],
					formulaVariables = this.jS.s.formulaVariables,
					formulaVariable,
					result;

				switch (name.toLowerCase()) {
					case 'true':
						result = new Boolean(true);
						result.html = 'TRUE';
						return result;
					case 'false':
						result = new Boolean(false);
						result.html = 'FALSE';
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
		 * @param {String} time
		 * @param {Boolean} isAmPm
		 * @returns {*}
		 */
		time:function (time, isAmPm) {
			return times.fromString(time, isAmPm);
		},

		/**
		 * get a number from variable
		 * @param {*} num
		 * @returns {Number}
		 */
		number:function (num) {
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
		 * @param {*} _num
		 * @returns {Number}
		 */
		numberInverted: function(_num) {
			var num = this.number(_num),
				inverted = new Number(num.valueOf() * -1);
			if (num.html) {
				inverted.html = num.html;
			}
			return inverted;
		},

		/**
		 * Perform math internally for parser
		 * @param {String} mathType
		 * @param {*} num1
		 * @param {*} num2
		 * @returns {*}
		 */
		performMath: function (mathType, num1, num2) {
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

		/**
		 * Get cell value
		 * @param {Sheet.Cell} parentCell
		 * @param {Object} cellRef
		 * @returns {*}
		 */
		cellValue:function (parentCell, cellRef) {
			var jS = this.jS,
				loc = jSE.parseLocation(cellRef.colString, cellRef.rowString), cell;

			cell = jS.getCell(parentCell.sheetIndex, loc.row, loc.col);
			if (cell !== null) {
				cell.addDependency(parentCell);
				return cell.updateValue();
			} else {
				return '';
			}
		},


		/**
		 * Get cell values as an array
		 * @param {Sheet.Cell} parentCell
		 * @param {Object} start
		 * @param {Object} end
		 * @returns {Array}
		 */
		cellRangeValue:function (parentCell, start, end) {
			var sheetIndex = parentCell.sheetIndex,
				_start = jSE.parseLocation(start.colString, start.rowString),
				_end = jSE.parseLocation(end.colString, end.rowString),
				rowIndex = Math.max(_start.row, _end.row),
				rowIndexEnd = Math.min(_start.row, _end.row),
				colIndexStart = Math.max(_start.col, _end.col),
				colIndexEnd = Math.min(_start.col, _end.col),
				jS = this.jS,
				sheet = jS.spreadsheets[sheetIndex],
				result = [],
				colIndex,
				cell,
				row;

			if (sheet === u) {
				jS.spreadsheets[sheetIndex] = sheet = {};
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
							parentCell.addDependency(cell);

							result.unshift(cell.updateValue());
						}
					} while(colIndex-- > colIndexEnd);
				} while (rowIndex-- > rowIndexEnd);

				return result;
			}

			return result;
		},

		/**
		 * Get cell value
		 * @param {Sheet.Cell} parentCell
		 * @param {Object} start
		 * @returns {*}
		 */
		fixedCellValue:function (parentCell, start) {
			return this.cellValue(parentCell, start);
		},

		/**
		 * Get cell values as an array
		 * @param {Sheet.Cell} parentCell
		 * @param {Object} start
		 * @param {Object} end
		 * @returns {Array}
		 */
		fixedCellRangeValue:function (parentCell, start, end) {
			return this.cellRangeValue(parentCell, start, end);
		},

		/**
		 * Get cell value from a different sheet within an instance
		 * @param {Sheet.Cell} parentCell
		 * @param {String} sheet example "SHEET1"
		 * @param {Object} cellRef
		 * @returns {*}
		 */
		remoteCellValue:function (parentCell, sheet, cellRef) {
			var jSE = this.jSE,
				jS = this.jS,
				loc = jSE.parseLocation(cellRef.colString, cellRef.rowString),
				sheetIndex = jSE.parseSheetLocation(sheet),
				cell;

			if (sheetIndex < 0) {
				sheetIndex = jS.getSpreadsheetIndexByTitle(sheet);
			}

			cell = jS.getCell(sheetIndex, loc.row, loc.col);
			if (cell !== null) {
				cell.addDependency(parentCell);

				return cell.updateValue();
			} else {
				return '';
			}
		},

		/**
		 * Get cell values as an array from a different sheet within an instance
		 * @param {Sheet.Cell} parentCell
		 * @param {String} sheet example "SHEET1"
		 * @param {Object} start
		 * @param {Object} end
		 * @returns {Array}
		 */
		remoteCellRangeValue:function (parentCell, sheet, start, end) {
			var jS = this.jS,
				jSE = this.jSE,
				_start = jSE.parseLocation(start.colString, start.rowString),
				_end = jSE.parseLocation(end.colString, end.rowString),
				sheetIndex = jSE.parseSheetLocation(sheet),
				colIndex,
				maxColIndex = _end.col,
				rowIndex,
				maxRowIndex = _end.row,
				result = [],
				cell;

			if (sheetIndex < 0) {
				sheetIndex = jS.getSpreadsheetIndexByTitle(sheet);
			}

			result.rowCount = (maxRowIndex - _start.row) + 1;
			result.columnCount = (maxColIndex - _start.col) + 1;
			for (colIndex = _start.col; colIndex <= maxColIndex; colIndex++) {
				for (rowIndex = _start.row; rowIndex <= maxRowIndex; rowIndex++) {
					cell = jS.getCell(sheetIndex, rowIndex, colIndex);
					if (cell !== null) {
						result.push(cell.updateValue());
						cell.addDependency(parentCell);
					}
				}
			}

			return result;
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


		spareFormulaParsers: {},
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

	return Constructor;
})(Math);