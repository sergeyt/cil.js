describe("meta.js tests", function() {

	it("check mscorlib.dll table locations", function() {
		load("mscorlib.dll", function(buffer) {

			var expected = {
				"Module": {
					"offset": 1375156,
					"size": 12,
					"rowCount": 1,
					"rowSize": 12,
					"isSorted": false
				},
				"TypeRef": null,
				"TypeDef": {
					"offset": 1375168,
					"size": 18126,
					"rowCount": 1007,
					"rowSize": 18,
					"isSorted": false
				},
				"FieldPtr": null,
				"Field": {
					"offset": 1393294,
					"size": 32370,
					"rowCount": 3237,
					"rowSize": 10,
					"isSorted": false
				},
				"MethodPtr": null,
				"MethodDef": {
					"offset": 1425664,
					"size": 213894,
					"rowCount": 11883,
					"rowSize": 18,
					"isSorted": false
				},
				"ParamPtr": null,
				"Param": {
					"offset": 1639558,
					"size": 158768,
					"rowCount": 19846,
					"rowSize": 8,
					"isSorted": false
				},
				"InterfaceImpl": {
					"offset": 1798326,
					"size": 1212,
					"rowCount": 303,
					"rowSize": 4,
					"isSorted": true
				},
				"MemberRef": {
					"offset": 1799538,
					"size": 2820,
					"rowCount": 235,
					"rowSize": 12,
					"isSorted": false
				},
				"Constant": {
					"offset": 1802358,
					"size": 11100,
					"rowCount": 1110,
					"rowSize": 10,
					"isSorted": true
				},
				"CustomAttribute": {
					"offset": 1813458,
					"size": 206940,
					"rowCount": 17245,
					"rowSize": 12,
					"isSorted": true
				},
				"FieldMarshal": null,
				"DeclSecurity": {
					"offset": 2020398,
					"size": 24,
					"rowCount": 3,
					"rowSize": 8,
					"isSorted": true
				},
				"ClassLayout": {
					"offset": 2020422,
					"size": 208,
					"rowCount": 26,
					"rowSize": 8,
					"isSorted": true
				},
				"FieldLayout": null,
				"StandAloneSig": {
					"offset": 2020630,
					"size": 2160,
					"rowCount": 540,
					"rowSize": 4,
					"isSorted": false
				},
				"EventMap": {
					"offset": 2022790,
					"size": 144,
					"rowCount": 36,
					"rowSize": 4,
					"isSorted": false
				},
				"EventPtr": null,
				"Event": {
					"offset": 2022934,
					"size": 1568,
					"rowCount": 196,
					"rowSize": 8,
					"isSorted": false
				},
				"PropertyMap": {
					"offset": 2024502,
					"size": 1824,
					"rowCount": 456,
					"rowSize": 4,
					"isSorted": false
				},
				"PropertyPtr": null,
				"Property": {
					"offset": 2026326,
					"size": 21060,
					"rowCount": 2106,
					"rowSize": 10,
					"isSorted": false
				},
				"MethodSemantics": {
					"offset": 2047386,
					"size": 19674,
					"rowCount": 3279,
					"rowSize": 6,
					"isSorted": true
				},
				"MethodImpl": {
					"offset": 2067060,
					"size": 2532,
					"rowCount": 422,
					"rowSize": 6,
					"isSorted": true
				},
				"ModuleRef": null,
				"TypeSpec": {
					"offset": 2069592,
					"size": 464,
					"rowCount": 116,
					"rowSize": 4,
					"isSorted": false
				},
				"ImplMap": null,
				"FieldRVA": {
					"offset": 2070056,
					"size": 204,
					"rowCount": 34,
					"rowSize": 6,
					"isSorted": true
				},
				"EncodingLog": null,
				"EncodingMap": null,
				"Assembly": {
					"offset": 2070260,
					"size": 28,
					"rowCount": 1,
					"rowSize": 28,
					"isSorted": false
				},
				"AssemblyProcessor": null,
				"AssemblyOS": null,
				"AssemblyRef": null,
				"AssemblyRefProcessor": null,
				"AssemblyRefOS": null,
				"File": null,
				"ExportedType": null,
				"ManifestResource": {
					"offset": 2070288,
					"size": 14,
					"rowCount": 1,
					"rowSize": 14,
					"isSorted": false
				},
				"NestedClass": {
					"offset": 2070302,
					"size": 436,
					"rowCount": 109,
					"rowSize": 4,
					"isSorted": true
				},
				"GenericParam": {
					"offset": 2070738,
					"size": 1170,
					"rowCount": 117,
					"rowSize": 10,
					"isSorted": true
				},
				"MethodSpec": {
					"offset": 2071908,
					"size": 192,
					"rowCount": 32,
					"rowSize": 6,
					"isSorted": false
				},
				"GenericParamConstraint": {
					"offset": 2072100,
					"size": 8,
					"rowCount": 2,
					"rowSize": 4,
					"isSorted": true
				}
			};

			var stream = Stream(buffer);
			var meta = MetaReader(stream);

			for (var i = 0; i < 64; i++) {
				var name = getTableNameById(i);
				var master = expected[name];
				var table = meta.tables[i];
				if (table == null)
				{
					expect(master === undefined || master === null).toBe(true);
					continue;
				}
				expect(table.offset).toEqual(master.offset);
				expect(table.size).toEqual(master.size);
				expect(table.rowCount).toEqual(master.rowCount);
				expect(table.rowSize).toEqual(master.rowSize);
				expect(table.isSorted).toEqual(master.isSorted);
			}
		});
	});

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