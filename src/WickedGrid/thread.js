Sheet.thread = (function (operative) {
	var i = 0,
		threads = [];

	function thread() {
		var t = threads[i],
			limit = thread.limit;

		if (t === undefined) {
			t = threads[i] = thread.create();
		} else {
			t = threads[i];
		}

		i++;
		if (i > limit) {
			i = 0;
		}

		return t;
	}

	thread.limit = 10;

	thread.create = function() {
		var t = operative({
			parseFormula: function(formula) {
				formulaParser.yy.types = [];
				return formulaParser.parse(formula);
			},
			streamJSONSheet: function(location, url, callback) {
				Promise
					.all([gR(location + url)])
					.then(function(sheetSets) {
						var json = sheetSets[0],
							sheet = JSON.parse(json),
							rows,
							max,
							i = 0;

						if (sheet.pop !== undefined) {
							sheet = sheet[0];
						}

						rows = sheet.rows;
						max = rows.length;

						sheet.rows = [];
						callback('sheet', JSON.stringify(sheet));

						for (; i < max; i++) {
							callback('row', JSON.stringify(rows[i]));
						}

						callback();

					}, function(err) {
						callback('error', err);
					});
			},
			streamJSONRows: function(location, urls, callback) {
				var i = 0,
					max = urls.length,
					getting = [];

				if (typeof urls === 'string') {
					getting.push(gR(location + urls));
				} else {
					for (; i < max; i++) {
						getting.push(gR(location + urls[i]));
					}
				}

				Promise
					.all(getting)
					.then(function(jsons) {
						var i = 0,
							j,
							row,
							rowSet,
							rowSets = jsons,
							iMax = rowSets.length,
							jMax;

						for(;i<iMax;i++) {
							rowSet = JSON.parse(rowSets[i]);
							jMax = rowSet.length;
							for(j = 0;j<jMax;j++) {
								row = rowSet[j];
								callback('row', JSON.stringify(row));
							}
						}

						callback();
					}, function(err) {
						callback('error', err);
					});
			},
			streamJSONSheetRows: function(location, sheetUrl, rowsUrls, callback) {
				var i = 0,
					max = rowsUrls.length,
					getting = [gR(location + sheetUrl)];

				if (typeof rowsUrls === 'string') {
					getting.push(gR(location + rowsUrls));
				} else {
					for (; i < max; i++) {
						getting.push(gR(location + rowsUrls[i]));
					}
				}

				Promise
					.all(getting)
					.then(function(jsons) {
						callback('sheet', jsons[0]);

						var i = 1,
							j,
							row,
							rowSet,
							rowSets = jsons,
							iMax = rowSets.length,
							jMax;

						for(;i<iMax;i++) {
							rowSet = JSON.parse(rowSets[i]);
							jMax = rowSet.length;
							for(j = 0;j<jMax;j++) {
								row = rowSet[j];
								callback('row', JSON.stringify(row));
							}
						}

						callback();
					}, function(err) {
						callback('error', err);
					});
			}
		}, [
			Sheet.formulaParserUrl,
			Sheet.threadScopeUrl
		]);

		t.stash = [];
		t.busy = false;

		return t;
	};

	thread.kill = function() {
		var i = 0,
			max = threads.length;

		for(;i < max; i++) {
			threads[i].terminate();
		}
	};

	return thread;
})(window.operative);