var fs              = require('fs')
  , execSync        = require('child_process').execSync

	//directories of the JS files
  , inDir           = './src/'
	, outDir          = ''

  //these are the paths to the final combined files that you want to have in the end
  , temp            = ''
  , result          = ''
	, wrapper         = 'WickedGrid'
  , combinedFile    = outDir + 'wickedgrid'
  , combinedFileMin = outDir + 'wickedgrid.min'

	, files           = [
	    //non-constructors next
			{
				WickedGrid: [
					//statics off of WickedGrid
					'statics',

					'autoFiller',
					'cellTypeHandlers',
					'cl',
					'columnFreezer',
					'columnResizer',
					'customTab',
					'defaults',
					'enclosure',
					'functions',
					'header',
					'inPlaceEdit',
					'menu',
					'rowFreezer',
					'rowResizer',
					'sheetUI',
					'spreadsheetAdder',
					'tab',
					'tabs',
					'thread',
					'ui',
					'utilities',

					//children namespaces next
					{
						event: ['Cell', 'Document', 'Formula']
					},
					{
						loader: ['HTML', 'JSON', 'XML']
					},

					//constructors next
					'ActionUI',
					'Cell',
					'CellContextMenu',
					'CellHandler',
					'CellRange',
					'ColumnMenu',
					'ColumnContextMenu',
					'Highlighter',
					'SpreadsheetUI',
					'RowContextMenu',
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

result = fs.readFileSync(inDir + wrapper + '.js', 'utf8').toString()
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