var fs              = require('fs')
  , execSync        = require('child_process').execSync

	//directories of the JS files
  , inDir           = './src/'
	, outDir          = ''

  //these are the paths to the final combined files that you want to have in the end
  , temp            = ''
  , result          = ''
	, wrapper         = inDir + 'wrapper'
  , combinedFile    = outDir + 'wickedgrid'
  , combinedFileMin = outDir + 'wickedgrid.min'

	, files           = [
		  'WickedGrid',
	    //non-constructors next
			{
				WickedGrid: [
					'autoFiller',
					'cellMenu',
					'cellTypeHandlers',
					'cl',
					'columnFreezer',
					'columnMenu',
					'columnResizer',
					'customTab',
					'defaults',
					'enclosure',
					'functions',
					'header',
					'inPlaceEdit',
					'menu',
					'rowFreezer',
					'rowMenu',
					'rowResizer',
					'sheetUI',
					'spreadsheetAdder',
					'tab',
					'tabs',
					'thread',
					'utilities',

					//children namespaces next
					{
						Event: ['Cell', 'Document', 'Formula']
					},
					{
						Loader: ['HTML', 'JSON', 'XML']
					},

					//constructors next
					'ActionUI',
					'Cell',
					'CellHandler',
					'CellRange',
					'Highlighter',
					'SpreadsheetUI',
					'Theme'
				]
			},

		  //jQuery plugin
			'jQuery.wickedGrid',

			//environment correction last
			'environmentCorrection'
    ]
	, parserFiles = [
			'parser/formula/formula',
			'parser/tsv/tsv'
		]
  ;

function pathify(path, cb, prefix) {
	prefix = prefix || '';
	if (path.constructor === Array) {
		path.forEach(function(file) {
			pathify(file, cb, prefix);
		});
	} else if (typeof path === 'object') {
		for (var p in path) {
			if (path.hasOwnProperty(p)) {
				pathify(path[p], cb, prefix + (prefix ? '/' : '') + p + '/');
			}
		}
	} else if (typeof path === 'string') {
		cb(prefix + path);
	}
}

//run through the JS files
pathify(files, function(file) {
	temp += fs.readFileSync(inDir + file + '.js', 'utf8').toString() + '\n';
});

result = fs.readFileSync(wrapper + '.js', 'utf8').toString()
	.replace('CODE_HERE', function() {
		return temp;
	});

//run through the parser files
parserFiles.forEach(function(file) {
  result += fs.readFileSync(file + '.js', 'utf8').toString();
});

fs.writeFileSync(combinedFile + '.js', result);

//compress it

//add the file to the git base
execSync('git add ' + combinedFile + '.js');

try {
  execSync('yui-compressor -o ' + combinedFileMin + ' ' + combinedFile + '.js');
  execSync('git add ' + combinedFileMin + '.js');
} catch (e) {
  console.log('WARNING: attempted to use yui-compressor, but it is not installed correctly');
}

process.exit(0);