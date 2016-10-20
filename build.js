var fs              = require('fs')
  , execSync        = require('child_process').execSync
  , uglify          = require('uglify-js')

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
					'cl',
					'columnMenu',
					'columnResizer',
					'customTab',
					'defaults',
					'enclosure',
          'formulaEditor',
					'header',
					'inPlaceEdit',
					'menu',
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
						Event: ['cell', 'document', 'formula']
					},
					{
						Loader: ['HTML', 'JSON', 'XML']
					},

					//constructors next
					'ActionUI',
					'Cell',
					'CellContextMenu',
					'CellHandler',
					'CellRange',
					'CellTypeHandlers',
					'ColumnContextMenu',
					'ColumnFreezer',
					'Functions',
					'Highlighter',
					'SpreadsheetUI',
					'RowContextMenu',
					'RowFreezer',
					'Theme',
          'Undo'
				]
			},

		  //jQuery plugin
			'jQuery.WickedGrid',

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
	.replace('\'CODE_HERE\'', function() {
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


var tiny = uglify.minify([combinedFile + '.js'], {
    compress: {
      dead_code: true,
      global_defs: {
        DEBUG: false
      }
    }
  });


fs.writeFileSync(combinedFileMin + '.js', tiny.code);
execSync('git add ' + combinedFileMin + '.js');
process.exit(0);
