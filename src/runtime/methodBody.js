// Parses method body.
function MethodBody(reader) {

	var MethodBodyFlags = {
		SmallFormat: 0x00,
		TinyFormat: 0x02,
		FatFormat: 0x03,
		TinyFormat1: 0x06,
		FormatMask: 0x07,
		InitLocals: 0x10,
		MoreSects: 0x08
	};

	var lsb = reader.readByte();
	var flags = lsb;
	var maxStackSize = 8;
	var format = (flags & MethodBodyFlags.FormatMask);
	var codeSize;
	var localSig = 0;
	var code = [];
	var seh = [];

	switch (format) {
		case MethodBodyFlags.FatFormat:
			var msb = reader.readByte();
			// var dwordMultipleSize = (msb & 0xF0) >> 4;
			// assert(dwordMultipleSize == 3); // the fat header is 3 dwords
			maxStackSize = reader.read(U16);
			codeSize = reader.read(I32);
			localSig = reader.read(I32);

			flags = (MethodBodyFlags)((msb & 0x0F) << 8 | lsb);
			readCode();

			if ((flags & MethodBodyFlags.MoreSects) != 0) {
				seh = readSehSections();
			}
			break;
		case MethodBodyFlags.TinyFormat:
		case MethodBodyFlags.TinyFormat1:
			codeSize = (lsb >> 2);
			readCode();
			break;
	}

	function readCode() {
		// TODO implement
	}

	function readSehSections() {
		// TODO implement
	}

	return {
		maxStackSize: maxStackSize,
		localSig: localSig,
		code: code,
		seh: seh
	};
}