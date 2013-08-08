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

function TableIndex(tableId) {
	return function(md) {
		var n = md.tables[tableId].rowCount;
		return n >= 0x10000 ? I32 : I16;
	};
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
		interface: CodedIndex.TypeDefOrRef
	},
	// TODO add all tables
	ManifestResource: {

	},
};

function MetaReader(stream) {

	var pe = PEImage(stream);
	var md = {
		tables: []
	};

	// TODO load metadata tables

	return md;
}