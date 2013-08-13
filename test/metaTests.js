describe("meta.js tests", function() {
	it("should load mscorlib.dll and read all tables", function() {
		load("mscorlib.dll", function(buffer) {
			var stream = Stream(buffer);
			var meta = MetaReader(stream);
			var obj = {};
			for (var i = 0; i < meta.tables.length; i++) {
				var table = meta.tables[i];
				if (table == null) continue;
				// export metadata as json object and dump it to file
				console.log("Table %s:", table.name);
				var rows = [];
				for (var r = 0; r < table.rowCount; r++) {
					var row = table.fetch(r);
					rows.push(row);
				}
				obj[table.name] = rows;
			}
			console.log(obj);
		});
	});
});