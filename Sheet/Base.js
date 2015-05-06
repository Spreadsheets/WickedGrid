var Sheet = {
	Loader: {},
	Plugin: {},

	defaultTheme: 0,
	themeRollerTheme: 0,
	bootstrapTheme: 1,
	customTheme: 2,

	excelSelectModel: 0,
	googleDriveSelectModel: 1,
	openOfficeSelectModel: 2,

	defaultColumnWidth: 120,
	defaultRowHeight: 20,

	domRows: 40,
	domColumns: 35,

	calcStack: 0,

	formulaParserUrl: '../parser/formula/formula.js',
	threadScopeUrl: '../Sheet/threadScope.js',

	defaultFormulaParser: null,

	spareFormulaParsers: [],

	formulaParser: function(callStack) {
		var formulaParser;
		//we prevent parsers from overwriting each other
		if (callStack > -1) {
			//cut down on un-needed parser creation
			formulaParser = this.spareFormulaParsers[callStack];
			if (formulaParser === undefined) {
				formulaParser = this.spareFormulaParsers[callStack] = Formula();
			}
		}

		//use the sheet's parser if there aren't many calls in the callStack
		else {
			formulaParser = Sheet.defaultFormulaParser;
		}

		formulaParser.yy.types = [];

		return formulaParser;
	},

	parseFormulaSlow: function(formula, callback) {
		if (Sheet.defaultFormulaParser === null) {
			Sheet.defaultFormulaParser = Formula();
		}

		var formulaParser = Sheet.formulaParser(Sheet.calcStack);
		callback(formulaParser.parse(formula));
	},

	parseFormula: function(formula, callback) {
		var thread = Sheet.thread();

		if (thread.busy) {
			thread.stash.push(function() {
				thread.busy = true;
				thread.parseFormula(formula, function(parsedFormula) {
					thread.busy = false;
					callback(parsedFormula);
					if (thread.stash.length > 0) {
						thread.stash.shift()();
					}
				});
			});
		} else {
			thread.busy = true;
			thread.parseFormula(formula, function(parsedFormula) {
				thread.busy = false;
				callback(parsedFormula);
				if (thread.stash.length > 0) {
					thread.stash.shift()();
				}
			});
		}
	}
};