var TargetArchitecture = {
	I386: 0x014c,
	AMD64: 0x8664,
	IA64: 0x0200,
	ARMv7: 0x01c4
};

var ModuleKind = {
	Dll: 0,
	Windows: 1,
	Console: 2
};

var ModuleAttributes = {
	ILOnly: 1,
	Required32Bit: 2,
	StrongNameSigned: 8,
	Preferred32Bit: 0x00020000
};

var ModuleCharacteristics = {
	HighEntropyVA: 0x0020,
	DynamicBase: 0x0040,
	NoSEH: 0x0400,
	NXCompat: 0x0100,
	AppContainer: 0x1000,
	TerminalServerAware: 0x8000
};

function readsz(reader, length) {
	var s = "";
	for (var i = 0; i < length; i++){
		var c = reader.read(U8);
		if (c == 0) {
			reader.skip(length - i - 1);
			break;
		}
		s += String.fromCharCode(c);
	}
	return s;
}

/**
 * PE image reader.
 */
function PEImage(reader) {

	function BadImageFormat() { return new Error("bad image format"); }

	var image = {};

	image.resolveRva = function(rva){
		for (var i = 0; i < image.sections.length; i++)
		{
			var section = image.sections[i];
			if (rva >= section.addr && rva < section.addr + section.size)
			{
				return section.offset + rva - section.addr;
			}
		}

		throw new RangeError("bad rva");
	}

	function load() {

		if (reader.length < 128)
			throw BadImageFormat();

		// DOSHeader: { PE: 2, Start: 58, Lfanew: 4, End: 64 }
		if (reader.read(U16) != 0x5a4d)
			throw BadImageFormat();

		reader.skip(58);
		reader.seek(reader.read(U32));

		// PE NT signature
		if (reader.read(U32) != 0x00004550)
			throw BadImageFormat();

		// PEFileHeader

	

		// TODO convert architecture to enum (human readable string)
		image.architecture = reader.read(U16);
		var numberOfSections = reader.read(U16);

		// TimeDateStamp		4
		// PointerToSymbolTable	4
		// NumberOfSymbols		4
		// OptionalHeaderSize	2
		reader.skip(14);

		// Characteristics		2
		var characteristics = reader.read(U16);

		var cli, subsystem, dll_characteristics;
		readOptionalHeaders();

		image.kind = resolveModuleKind();
		image.characteristics = dll_characteristics;

		image.sections = readSections();
		// TODO
		// readCliHeader();

		function readDataDirectory() {
			return {
				rva: reader.read(U32),
				size: reader.read(U32)
			};
		}

		function readOptionalHeaders()
		{
			// - PEOptionalHeader
			//   - StandardFieldsHeader

			// Magic				2
			var pe64 = reader.read(U16) == 0x20b;

			//						pe32 || pe64

			// LMajor				1
			// LMinor				1
			// CodeSize				4
			// InitializedDataSize	4
			// UninitializedDataSize4
			// EntryPointRVA		4
			// BaseOfCode			4
			// BaseOfData			4 || 0

			//   - NTSpecificFieldsHeader

			// ImageBase			4 || 8
			// SectionAlignment		4
			// FileAlignement		4
			// OSMajor				2
			// OSMinor				2
			// UserMajor			2
			// UserMinor			2
			// SubSysMajor			2
			// SubSysMinor			2
			// Reserved				4
			// ImageSize			4
			// HeaderSize			4
			// FileChecksum			4
			reader.skip(66);

			// SubSystem			2
			subsystem = reader.read(U16);

			// DLLFlags				2
			dll_characteristics = reader.read(U16);
			// StackReserveSize		4 || 8
			// StackCommitSize		4 || 8
			// HeapReserveSize		4 || 8
			// HeapCommitSize		4 || 8
			// LoaderFlags			4
			// NumberOfDataDir		4

			//   - DataDirectoriesHeader

			// ExportTable			8
			// ImportTable			8
			// ResourceTable		8
			// ExceptionTable		8
			// CertificateTable		8
			// BaseRelocationTable	8

			reader.skip(pe64 ? 88 : 72);

			// Debug				8
			var debug = readDataDirectory();

			// Copyright				8
			// GlobalPtr				8
			// TLSTable					8
			// LoadConfigTable			8
			// BoundImport				8
			// IAT						8
			// DelayImportDescriptor	8
			reader.skip(56);

			// CLIHeader			8
			cli = readDataDirectory();

			if (cli.IsEmpty)
				throw new BadImageFormat();

			// Reserved				8
			reader.skip(8);
		}

		function readSections() {
			var sections = new Array(numberOfSections);

			for (var i = 0; i < numberOfSections; i++) {
				var section = {};

				section.name = readsz(reader, 8);

				// VirtualSize		4
				reader.skip(4);

				section.rva = reader.read(U32);
				section.size = reader.read(U32);
				section.offset = reader.read(U32);

				// PointerToRelocations		4
				// PointerToLineNumbers		4
				// NumberOfRelocations		2
				// NumberOfLineNumbers		2
				// Characteristics			4
				reader.skip(16);

				sections[i] = section;
			}

			return sections;
		}

		function resolveModuleKind() {
			if ((characteristics & 0x2000) != 0) // ImageCharacteristics.Dll
				return ModuleKind.Dll;

			if (subsystem == 0x2 || subsystem == 0x9) // SubSystem.WindowsGui || SubSystem.WindowsCeGui
				return ModuleKind.Windows;

			return ModuleKind.Console;
		}
	}

	load();
}