Sheet.thread = (function (operative) {
	var i = 0,
		threads = [];

	function thread() {
		var t = threads[i],
			limit = thread.limit;

		if (t === undefined) {
			t = threads[i] = thread.create();
			t.busy = false;
			t.stash = [];
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
			pedantic: true,
			parseFormula: function(formula) {
				formulaParser.yy.types = [];
				return formulaParser.parse(formula);
			},
			streamJSONSheet: function(location, url, callback) {
				gR(location + url, function(jsons) {
					var sheet = JSON.parse(jsons),
						rows = sheet.rows,
						max = rows.length,
						i = 0;

					sheet.rows = [];
					callback('sheet', JSON.stringify(sheet));

					for(;i<max;i++) {
						callback('row', JSON.stringify(rows[i]));
					}

					callback();
				});
			},
			streamJSONSheets: function(location, urls, callback) {
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
							sheetJsons = jsons,
							max = sheetJsons.length;

						for(;i<max;i++) {
							callback('sheet', sheetJsons[i]);
						}

						callback();
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