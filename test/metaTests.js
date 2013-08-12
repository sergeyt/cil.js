describe("meta.js tests", function() {
	it("should load mscorlib.dll and read all tables", function() {
		load("mscorlib.dll", function(buffer) {
			var stream = Stream(buffer);
			var meta = MetaReader(stream);
			for (var i = 0; i < meta.tables.length; i++) {
				var table = meta.tables[i];
				if (table == null) continue;
				console.log("Table %s:", table.name);
				for (var r = 0; r < table.rowCount; r++) {
					var row = table.fetch(r);
					var s = row.cells.join(", ");
					// console.log("[%d] = %s", r, s);
				}
			}
		});
	});
});