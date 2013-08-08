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
	var tag = (int)(value & mask);
	if (tag < 0 || tag >= desc.tables.length)
		throw new RangeError("Invalid coded index " + value);
	var index = codedIndex >> Bits;
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
	},
};

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
		return reader.seek(((reader.position() + 3) / 4) * 4);
	}

	function readAlignedString(maxLength) {
		var read = 0;
		var s = "";
		while (read < maxLength) {
			var c = reader.read(U8);
			if (c == 0) break;
			read++;
			s += String.fromCharCode(c);
		}
		reader.skip(-1 + ((read + 4) & ~3) - read);
		return s;
	}

	function load() {
		var mdbOffset = reader.Position;

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
		var n = reader.read(U6);
		var headers = [];

		var i;
		for (i = 0; i < n; i++) {
			headers[i] = {
				offset: startOffset + reader.read(U32),
				size: reader.read(U32),
				name: readAlignedString(16)
			};
		}

		for (i = 0; i < n; i++) {
			var h = headers[i];

			switch (h.name) {
				case "#-":
				case "#~":
					reader.seek(h.offset);
					initTables(h.offset, h.size);
					break;
				case "#Strings":
					var stringsHeap = reader.slice(h.offset, h.size);
					strings = {
						fetch: function(offset) {
							if (offset >= stringsHeap.length())
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
					while (h.size > 0) {
						var guid = guidHeap.readBytes(16);
						// TODO introduce guid object
						guids.push(guid);
						size -= 16;
					}
					break;
				case "#Blob":
					var blobHeap = reader.slice(h.offset, h.size);
					blobs = {
						fetch: function(offset) {
							if (offset >= blobHeap.length)
								throw new BadMetadataException("Invalid #Blob heap offset.");

							blobHeap.seek(offset);

							var length = readPackedInt(blobHeap);
							if (length <= 0) return EmptyBlob;

							//TODO: implement slice without need to know that _heap is another slice
							return blobHeap.slice(0, length);
						}
					};
					break;
			}
		}
	}

	function initTables() {
		reader.skip(4); //reserved: 4, always 0

		var header = {
			majorVersion: reader.read(U8),
			minorVersion: reader.read(U8),
			heapSizes: reader.read(U8),
			reserved: reader.read(U8), //reserved: 1, always 1
			// TODO read two U32 nums since js unsupports 64-bit ints
			valid: reader.read(U64),
			sorted: reader.read(U64),
		};

		var heapSizes = header.heapSizes;
		var maxTableCount = 64;
		md.tables = new Array(maxTableCount);

		// read table row nums
		var present = header.Valid; // if bit is set table is presented, otherwise it is empty
		for (var i = 0; i < maxTableCount; i++) {
			// if flag set table is presented
			if (((present >> i) & 1) != 0) {
				var rowCount = reader.read(I32);
				var table = {
					id: i,
					name: String(id), // TODO key inside TableId
				};
				table.rowCount = rowCount;
				table.isSorted = ((header.sorted >> i) & 1) != 0;
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
				if (col.tableId !== undefined) {
					return tableIndexSize(col.tableId);
				} else { // coded index
					var tables = col.tables.map(tableIndexSize);
					// TODO cache size of coded index
					return Math.max.apply(tables);
				}
			}

			switch (col) {
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
		for (var i = 0; i < MaxTableCount; i++) {
			var table = md.tables[i];
			if (table != null) {
				table.offset = pos;
				var rowSize = 0;
				for (var column in Object.keys(MetaSchema[table.name]))
					rowSize += getColumnSize(column);
				table.rowSize = rowSize;
				table.size = table.rowCount * rowSize;
				pos += table.size;
			}
		}
	}

	load();
	
	// TODO read/fetch row as function of table object

	return md;
}