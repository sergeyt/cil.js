// TODO wrap to meta module

// metadata table codes.
var TableId = {
	Assembly: 0x20,
	AssemblyOS: 0x22,
	AssemblyProcessor: 0x21,
	AssemblyRef: 0x23,
	AssemblyRefOS: 0x25,
	AssemblyRefProcessor: 0x24,
	ClassLayout: 0x0F,
	Constant: 0x0B,
	CustomAttribute: 0x0C,
	DeclSecurity: 0x0E,
	EventMap: 0x12,
	Event: 0x14,
	ExportedType: 0x27,
	Field: 0x04,
	FieldLayout: 0x10,
	FieldMarshal: 0x0D,
	FieldRVA: 0x1D,
	File: 0x26,
	GenericParam: 0x2A,
	GenericParamConstraint: 0x2C,
	ImplMap: 0x1C,
	InterfaceImpl: 0x09,
	ManifestResource: 0x28,
	MemberRef: 0x0A,
	MethodDef: 0x06,
	MethodImpl: 0x19,
	MethodSemantics: 0x18,
	MethodSpec: 0x2B,
	Module: 0x00,
	ModuleRef: 0x1A,
	NestedClass: 0x29,
	Param: 0x08,
	Property: 0x17,
	PropertyMap: 0x15,
	StandAloneSig: 0x11,
	TypeDef: 0x02,
	TypeRef: 0x01,
	TypeSpec: 0x1B,
	FieldPtr: 3,
	MethodPtr: 5,
	ParamPtr: 7,
	EventPtr: 19,
	PropertyPtr: 22,
	EncodingLog: 30,
	EncodingMap: 31,
};

Array.range = function(start, length){
	var r = [];
	for (var i = 0; i < length; i++)
		r.push(start + i);
	return r;
};

var STR = 101; // index to string pool
var BLOB = 102; // index to blob pool
var GUID = 103; // index to guid pool

function TableIndex(tableId) { return { tableId: tableId }; }

var CodedIndex = {
	CustomAttributeType: {
		bits: 3,
		tables: [
			TableId.TypeRef, // unused
			TableId.TypeRef, // unused
			TableId.MethodDef,
			TableId.MemberRef,
			TableId.TypeDef // unused
		]
	},
	HasConstant: {
		bits: 2,
		tables: [TableId.Field, TableId.Param, TableId.Property]
	},
	//NOTE FROM SPEC:
	//[Note: HasCustomAttributes only has values for tables that are “externally visible”; that is, that correspond to items
	//in a user source program. For example, an attribute can be attached to a TypeDef table and a Field table, but not a
	//ClassLayout table. As a result, some table types are missing from the enum above.]
	HasCustomAttribute: {
		bits: 5,
		tables: [
			TableId.MethodDef,
            TableId.Field,
            TableId.TypeRef,
            TableId.TypeDef,
            TableId.Param,
            TableId.InterfaceImpl,
            TableId.MemberRef,
            TableId.Module,
            TableId.DeclSecurity,
            TableId.Property,
            TableId.Event,
            TableId.StandAloneSig,
            TableId.ModuleRef,
            TableId.TypeSpec,
            TableId.Assembly,
            TableId.AssemblyRef,
            TableId.File,
            TableId.ExportedType,
            TableId.ManifestResource,
            TableId.GenericParam
		]
	},
	HasDeclSecurity: {
		bits: 2,
		tables: [TableId.TypeDef, TableId.MethodDef, TableId.Assembly]
	},
	HasFieldMarshal: {
		bits: 1,
		tables: [TableId.Field, TableId.Param]
	},
	HasSemantics: {
		bits: 1,
		tables: [TableId.Event, TableId.Property]
	},
	Implementation: {
		bits: 2,
		tables: [TableId.File, TableId.AssemblyRef, TableId.ExportedType]
	},
	MemberForwarded: {
		bits: 1,
		tables: [TableId.Field, TableId.MethodDef]
	},
	MemberRefParent: {
		bits: 3,
		tables: [TableId.TypeDef, TableId.TypeRef, TableId.ModuleRef, TableId.MethodDef, TableId.TypeSpec]
	},
	MethodDefOrRef: {
		bits: 1,
		tables: [TableId.MethodDef, TableId.MemberRef]
	},
	ResolutionScope: {
		bits: 2,
		tables: [TableId.Module, TableId.ModuleRef, TableId.AssemblyRef, TableId.TypeRef]
	},
	TypeDefOrRef: {
		bits: 2,
		tables: [TableId.TypeDef, TableId.TypeRef, TableId.TypeSpec]
	},
	TypeOrMethodDef: {
		bits: 1,
		tables: [TableId.TypeDef, TableId.MethodDef]
	},
};

function decodeCodedIndex(desc, value) {
	var mask = 0xFF >> (8 - desc.bits);
	var tag = value & mask;
	if (tag < 0 || tag >= desc.tables.length)
		throw new RangeError("Invalid coded index " + value);
	var index = value >> desc.bits;
	return { tableId: tag, index: index };
}

// metadata row structures
// NOTE: THE ORDER OF FIELDS IS IMPORTANT!
var MetaSchema = {
	Assembly: {
		hashAlgorithm: I32, // TODO add HashAlgorithm enum
		version: {
			major: I16,
			minor: I16,
			build: I16,
			revision: I16,
		},
		flags: I32, // TODO add AssemblyFlags enum,
		publicKey: BLOB,
		name: STR,
		culture: STR
	},
	AssemblyOS: {
		platform: I32,
		version: {
			major: I32,
			minor: I32
		},
	},
	AssemblyProcessor: {
		processor: I32,
	},
	AssemblyRef: {
		version: {
			major: I16,
			minor: I16,
			build: I16,
			revision: I16,
		},
		flags: I32,
		publicKeyOrToken: BLOB,
		name: STR,
		culture: STR,
		hash: BLOB
	},
	AssemblyRefOS: {
		platform: I32,
		version: {
			major: I32,
			minor: I32
		},
		assemblyRef: TableIndex(TableId.AssemblyRef)
	},
	AssemblyRefProcessor: {
		processor: I32,
		assemblyRef: TableIndex(TableId.AssemblyRef)
	},
	ClassLayout: {
		packingSize: I16,
		classSize: I32,
		parent: TableIndex(TableId.TypeDef)
	},
	Constant: {
		type: I16,
		parent: CodedIndex.HasConstant,
		value: BLOB
	},
	CustomAttribute: {
		parent: CodedIndex.HasCustomAttribute,
		type: CodedIndex.CustomAttributeType,
		value: BLOB
	},
	DeclSecurity: {
		action: I16,
		parent: CodedIndex.HasDeclSecurity,
		permissionSet: BLOB
	},
	EventMap: {
		parent: TableIndex(TableId.TypeDef),
		eventList: TableIndex(TableId.Event)
	},
	Event: {
		flags: I16, // TODO EventAttributes enum
		name: STR,
		type: CodedIndex.TypeDefOrRef
	},
	ExportedType: {
		flags: I32, // TODO TypeAttributes enum
		def: I32,
		name: STR,
		namespace: STR,
		impl: CodedIndex.Implementation,
	},
	Field: {
		flags: I16, // TODO FieldAttributes enum
		name: STR,
		signature: BLOB
	},
	FieldLayout: {
		offset: I32,
		field: TableIndex(TableId.Field)
	},
	FieldMarshal: {
		parent: CodedIndex.HasFieldMarshal,
		nativeType: BLOB
	},
	FieldRVA: {
		rva: I32,
		field: TableIndex(TableId.Field)
	},
	File: {
		flags: I32, // TODO FileFlags enum
		name: STR,
		hash: BLOB
	},
	GenericParam: {
		number: I16,
		flags: I16, // TODO GenericParamAttributes enum
		owner: CodedIndex.TypeOrMethodDef,
		name: STR
	},
	GenericParamConstraint: {
		owner: TableIndex(TableId.GenericParam),
		constraint: CodedIndex.TypeDefOrRef
	},
	ImplMap: {
		mappingFlags: I16, // PInvokeAttributes
		memberForwarded: CodedIndex.MemberForwarded,
		importName: STR,
		importScope: TableIndex(TableId.ModuleRef)
	},
	InterfaceImpl: {
		type: TableIndex(TableId.TypeDef),
		iface: CodedIndex.TypeDefOrRef
	},
	// TODO add all tables
	ManifestResource: {
		offset: I32,
		flags: I32, // TODO ManifestResourceAttributes enum
		name: STR,
		impl: CodedIndex.Implementation
	},
	MemberRef: {
		parent: CodedIndex.MemberRefParent,
		name: STR,
		signature: BLOB
	},
	MethodDef: {
		rva: I32,
		implFlags: I16, // TODO MethodImplAttributes enum
		flags: I16, // TODO MethodAttributes enum
		name: STR,
		signature: BLOB,
		params: TableIndex(TableId.Param)
	},
	MethodImpl: {
		type: TableIndex(TableId.TypeDef),
		body: CodedIndex.MethodDefOrRef,
		decl: CodedIndex.MethodDefOrRef
	},
	MethodSemantics: {
		semantics: I16, // TODO MethodSemanticsAttributes enum
		method: TableIndex(TableId.MethodDef),
		association: CodedIndex.HasSemantics
	},
	MethodSpec: {
		method: CodedIndex.MethodDefOrRef,
		instantiation: BLOB
	},
	Module: {
		generation: I16,
		name: STR,
		id: GUID,
		encId: GUID,
		encBaseId: GUID
	},
	ModuleRef: {
		name: STR
	},
	NestedClass: {
		type: TableIndex(TableId.TypeDef),
		enclosingType: TableIndex(TableId.TypeDef)
	},
	Param: {
		flags: I16, // TODO ParamAttributes enum
		sequence: I16,
		name: STR
	},
	Property: {
		flags: I16, // TODO PropertyAttributes enum
		name: STR,
		type: BLOB
	},
	PropertyMap: {
		parent: TableIndex(TableId.TypeDef),
		propertyList: TableIndex(TableId.Property)
	},
	StandAloneSig: {
		signature: BLOB
	},
	TypeDef: {
		flags: I32, // TODO TypeAttributes enum
		name: STR,
		namespace: STR,
		baseType: CodedIndex.TypeDefOrRef,
		fieldList: TableIndex(TableId.Field),
		methodList: TableIndex(TableId.MethodDef)
	},
	TypeRef: {
		resolutionScope: CodedIndex.ResolutionScope,
		name: STR,
		namespace: STR
	},
	TypeSpec: {
		siganture: BLOB
	},
	FieldPtr: {
		field: TableIndex(TableId.Field)
	},
	MethodPtr: {
		method: TableIndex(TableId.MethodDef)
	},
	ParamPtr: {
		param: TableIndex(TableId.Param)
	},
	EventPtr: {
		event: TableIndex(TableId.Event)
	},
	PropertyPtr: {
		property: TableIndex(TableId.Property)
	},
	EncodingLog: {
		token: I32,
		funcCode: I32
	},
	EncodingMap: {
		token: I32
	}
};

var EmptyGuid = "0000000000000000";

function readPackedInt(reader) {
	var b0 = reader.readByte();
	//1 byte
	if ((b0 & 0x80) == 0)
		return b0;

	var b1 = reader.readByte();

	//2 bytes
	if ((b0 & 0xC0) == 0x80)
		return (((b0 & 0x3F) << 8) | b1);

	//4 bytes
	var b2 = reader.readByte();
	var b3 = reader.readByte();
	return ((b0 & 0x3F) << 24) | (b1 << 16) | (b2 << 8) | b3;
}

// spec ref: Partition II, 24.2.1 Metadata root

function MetaReader(reader) {

	var pe = PEImage(reader);

	// heaps
	var strings = null;
	var userStrings = null;
	var guids = [];
	var blobs = null;

	var md = {
		tables: []
	};

	function align4() {
		var pos = reader.position();
		var d = pos % 4;
		if (d == 0) return;
		return reader.seek(pos + (4 - d));
	}

	function readszAligned(maxLength) {
		var s = "";
		while (maxLength-- > 0) {
			var c = reader.readByte();
			if (c == 0) {
				// TODO read all zero bytes
				align4();
				break;
			}
			s += String.fromCharCode(c);
		}
		return s;
	}

	function load() {
		var mdbOffset = reader.position();

		// Metadata Header
		// Signature
		if (reader.read(U32) != 0x424A5342)
			throw new Error("Invalid metadata header.");

		// MajorVersion			2
		// MinorVersion			2
		// Reserved				4
		reader.skip(8);

		var runtimeVersion = readsz(reader, reader.read(I32));

		// align for dword boundary
		align4();

		// Flags		2
		reader.skip(2);

		loadHeaps(mdbOffset);
	}

	function loadHeaps(startOffset) {
		// heap headers
		var n = reader.read(U16);
		var headers = [];

		var i;
		for (i = 0; i < n; i++) {
			headers[i] = {
				offset: startOffset + reader.read(U32),
				size: reader.read(U32),
				// Name of the stream as null-terminated variable length array
				// of ASCII characters, padded to the next 4-byte boundary
				// with \0 characters. The name is limited to 32 characters.
				name: readszAligned(32)
			};
		}

		for (i = 0; i < n; i++) {
			var h = headers[i];

			switch (h.name) {
				case "#-":
				case "#~":
					reader.seek(h.offset);
					initTables();
					break;
				case "#Strings":
					var stringsHeap = reader.slice(h.offset, h.size);
					strings = {
						fetch: function(offset) {
							if (offset >= stringsHeap.length)
								throw new RangeError("Invalid #Strings heap index.");
							// TODO cache strings
							stringsHeap.seek(offset);
							var s = stringsHeap.read(UTF8);
							return s;
						}
					};
					break;
				case "#US":
					var usHeap = reader.slice(h.offset, h.size);
					userStrings = {
						fetch: function(offset) {
							if (offset == 0)
								throw new RangeError("Invalid #US heap offset.");

							usHeap.seek(offset, SeekOrigin.Begin);

							var length = readPackedInt(usHeap);
							var bytes = usHeap.readBytes(length);

							if (bytes[length - 1] == 0 || bytes[length - 1] == 1)
								length--;

							// .net unicode encoding
							// TODO complete
							var s = "";
							for (var i = 0; i < length; i += 2) {

							}
							return s;
						}
					};
					break;
				case "#GUID":
					var guidHeap = reader.slice(h.offset, h.size);
					guids = [];
					var size = h.size;
					while (size > 0) {
						var guid = guidHeap.readBytes(16);
						var s = guid.join("");
						guids.push(s);
						size -= 16;
					}
					break;
				case "#Blob":
					var blobHeap = reader.slice(h.offset, h.size);
					blobs = {
						fetch: function(offset) {
							if (offset >= blobHeap.length)
								throw new RangeError("Invalid #Blob heap offset.");

							blobHeap.seek(offset);

							var blobLength = readPackedInt(blobHeap);
							if (blobLength <= 0) return EmptyBlob;

							return blobHeap.slice(blobHeap.position(), blobLength);
						}
					};
					break;
			}
		}
	}

	function getTableNames() {
		var result = new Array(64);
		var keys = Object.keys(TableId);
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			var id = TableId[key];
			if (id === undefined)
				continue;
			result[id] = key;
		}
		return result;
	}

	function isObject(v) { return !!(v && (typeof v == 'object')); }
	function isTableIndex(v) { return v.hasOwnProperty("tableId"); }
	function isCodedIndex(v) { return v.hasOwnProperty("bits") && v.hasOwnProperty("tables"); }

	function initTables() {
		reader.skip(4); //reserved: 4, always 0

		var header = {
			majorVersion: reader.read(U8),
			minorVersion: reader.read(U8),
			heapSizes: reader.read(U8),
			reserved: reader.read(U8), //reserved: 1, always 1
			valid1: reader.read(U32),
			valid2: reader.read(U32),
			sorted1: reader.read(U32),
			sorted2: reader.read(U32)
		};

		var heapSizes = header.heapSizes;
		var maxTableCount = 64;
		md.tables = new Array(maxTableCount);

		var tableNames = getTableNames();

		function isBitSet(u1, u2, bit) {
			if (bit <= 31) return ((u1 >> bit) & 1) != 0;
			return ((u2 >> (bit-32)) & 1) != 0;
		}

		// read table row nums
		for (var i = 0; i < maxTableCount; i++) {
			// if bit is set table is presented, otherwise it is empty
			if (isBitSet(header.valid1, header.valid2, i)) {
				var rowCount = reader.read(I32);

				var table = {
					id: i,
					name: tableNames[i],
					rowCount: rowCount,
					isSorted: isBitSet(header.sorted1, header.sorted2, i)
				};

				if (table.name === undefined)
					throw new Error("No table name!");

				table.schema = MetaSchema[table.name];
				if (table.schema === undefined)
					throw new Error("No table schema!");

				table.fetch = fetchRowFn(table);
				md.tables[i] = table;
			} else {
				md.tables[i] = null;
			}
		}

		function tableIndexSize(tableId) {
			var t = md.tables[tableId];
			var n = t != null ? t.rowCount : 0;
			return n >= 0x10000 ? 4 : 2;
		}

		function getColumnSize(col) {
			if (isObject(col)) {
				if (isTableIndex(col)) {
					return tableIndexSize(col.tableId);
				} else if (isCodedIndex(col)) {
					var tables = col.tables.map(tableIndexSize);
					// TODO cache size of coded index
					return Math.max.apply(null, tables);
				} else { // struct
					var keys = Object.keys(col);
					var size = 0;
					for (var i = 0; i < keys.length; i++) {
						var key = keys[i];
						var type = col[key];
						size += getColumnSize(type);
					}
					return size;
				}
			}

			switch (col) {
				case STR:
					return (heapSizes & 1) == 0 ? 2 : 4;
				case GUID:
					return (heapSizes & 2) == 0 ? 2 : 4;
				case BLOB:
					return (heapSizes & 4) == 0 ? 2 : 4;
				case I8:
				case U8:
					return 1;
				case I16:
				case U16:
					return 2;
				case I32:
				case U32:
					return 4;
			}

			throw new Error("you should not be here!");
		}

		// setup tables (offset, rowSize, size)
		var pos = reader.position();
		for (var i = 0; i < maxTableCount; i++) {
			var table = md.tables[i];
			if (table == null) continue;
			table.offset = pos;
			var rowSize = 0;
			var columns = [];
			var colkeys = Object.keys(table.schema);
			for (var j = 0; j < colkeys.length; j++) {
				var colkey = colkeys[j];
				var coldef = table.schema[colkey];
				var colsize = getColumnSize(coldef);
				rowSize += colsize;
				columns.push({ name: colkey, size: colsize, def: coldef });
			}
			table.columns = columns;
			table.rowSize = rowSize;
			table.size = table.rowCount * rowSize;
			pos += table.size;
		}
	}

	function fetchRowFn(table) {
		return function(rowIndex) {
			var offset = table.offset + rowIndex * table.rowSize;
			var rowReader = reader.slice(offset, table.rowSize);
			var colcount = table.columns.length;
			var row = {};
			for (var i = 0; i < colcount; i++) {
				var col = table.columns[i];
				var value = readColumnValue(rowReader, col);
				row[col.name] = value;
			}
			return row;
		};
	}

	function readColumnValue(rowReader, col) {
		var value;
		var def = col.def;
		if (isObject(def)) {
			if (isTableIndex(def)) {
				value = col.size == 2 ? rowReader.read(U16) : rowReader.read(U32);
				return { tableId: def.tableId, index: value };
			} else if (isCodedIndex(def)) {
				value = col.size == 2 ? rowReader.read(U16) : rowReader.read(U32);
				return decodeCodedIndex(def, value);
			} else { // struct
				var keys = Object.keys(def);
				value = {};
				for (var i = 0; i < keys.length; i++) {
					var key = keys[i];
					var type = def[key];
					value[key] = readColumnValue(rowReader, { def: type, size: 0 });
				}
				return value;
			}
		}

		switch (def) {
			case STR:
				value = col.size == 2 ? rowReader.read(U16) : rowReader.read(U32);
				return strings.fetch(value);
			case GUID:
				value = col.size == 2 ? rowReader.read(U16) : rowReader.read(U32);
				// guid index is 1 based
				return value == 0 ? EmptyGuid : guids[value - 1];
			case BLOB:
				value = col.size == 2 ? rowReader.read(U16) : rowReader.read(U32);
				return blobs.fetch(value);
			default:
				return rowReader.read(def);
		}
	}

	load();
	
	return md;
}