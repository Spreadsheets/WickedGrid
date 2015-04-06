Sheet.JSONStreamer = {
	sheetRows: function(sheetUrl, rowUrls, sheet, callback) {

		var t = new Thaw([], {each: function() {
			sheet.rows.push(JSON.parse(this));
		}});

		Sheet.thread()
			.streamJSONSheetRows(operative.getBaseURL(), sheetUrl, rowUrls, function(type, str) {
				var i, json;

				switch (type) {
					case 'sheet':
						json = JSON.parse(str);

						for(i in json) if (json.hasOwnProperty(i)) {
							sheet[i] = json[i];
						}
						if (sheet.rows === undefined) sheet.rows = [];

						break;
					case 'row':
						t.add(str);
						break;
					default:
						if (callback) {
							callback(sheet);
						}
						break;
				}
			});

		return this;
	},

	rows: function(urls, sheet, callback) {
		if (sheet.rows === undefined) sheet.rows = [];

		var t = new Thaw([], {each: function() {
			sheet.rows.push(JSON.parse(this));
		}});

		Sheet.thread()
			.streamJSONRows(operative.getBaseURL(), urls, function(type, str) {
				switch (type) {
					case 'row':
						t.add(str);
						break;
					default:
						if (callback) callback.call(Sheet, sheet.rows);
				}
			});

		return this;
	},

	sheet: function(url, sheet, callback) {
		var t = new Thaw([], {each: function() {
			sheet.rows.push(JSON.parse(this));
		}});

		Sheet.thread()
			.streamJSONSheet(operative.getBaseURL(), url, function(type, str) {
				var json, i;

				switch(type) {
					case 'sheet':
						json = JSON.parse(str);

						for(i in json) if (json.hasOwnProperty(i)) {
							sheet[i] = json[i];
						}
						if (sheet.rows === undefined) sheet.rows = [];
						break;
					case 'row':
						t.add(str);
						break;
					default:
						if (callback) callback.call(Sheet, sheet);
				}
			});

		return this;
	}
};