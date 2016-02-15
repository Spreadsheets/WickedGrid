var fs = require('fs')
  , execSync = require('child_process').execSync


//compile parsers
//cd parser/formula
//node ../../../jison/ports/php/php.js formula.jison
//cd ../../

//directories of the JS files
  , inDir = './WickedGrid/'
	, outDir = '.'

  //these are the paths to the final combined files that you want to have in the end
  , temp = ''
  , result = ''
	, wrapper = inDir + 'wrapper.js'
  , combinedFile = outDir + 'wickedgrid.js'
  , combinedFileMin = outDir + 'wickedgrid.min.js'

	, files = [
	    //namespace first
		  'Base.js',

	    //non-constructors next
    	'fn.js',
    	'sheet.js',
    	'thread.js',
    	'utilities.js',

			//children namespaces next
			'Loader/HTML.js',
			'Loader/JSON.js',
			'Loader/XML.js',

			//constructors next
			'ActionUI.js',
			'Cell.js',
			'CellHandler.js',
			'CellTypeHandlers.js',
			'CellRange.js',
			'Highlighter.js',
			'SpreadsheetUI.js',
			'Theme.js',

			//environment correction last
			'environmentCorrection.js'
    ]
	, parserFiles = [
			'parser/formula/formula.js',
			'parser/tsv/tsv.js'
		]
  ;

//run through the JS files
files.forEach(function(file) {
	temp += fs.readFileSync(inDir + file, 'utf8').toString();
});

result = fs.readFileSync(wrapper, 'utf8').toString().replace('CODE_HERE', function() { return temp; });

//run through the parser files
parserFiles.forEach(function(file) {
  result += fs.readFileSync(file, 'utf8').toString();
});

fs.writeFileSync(combinedFile, result);

//compress it

//add the file to the git base
execSync('git add ' + combinedFile);

try {
  execSync('yui-compressor -o ' + combinedFileMin + ' ' + combinedFile);
  execSync('git add ' + combinedFileMin);
} catch (e) {
  console.log('WARNING: attempted to use yui-compressor, but it is not installed correctly');
}

process.exit(0);