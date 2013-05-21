// require("DataView")

(function(global){

	global.BinaryReader = function(buffer, offset, length, le){
		var stream = new DataView(buffer, offset, length);
		stream.pos = 0;
		this.stream = stream;
		this.le = le;
	}

	global.BinaryReader.prototype = {
		constructor: BinaryReader,

		readInt8: function(count){
			return readImpl(this, this.stream.readInt8, 1, count);
		},
		readUInt8: function(count){
			return readImpl(this, this.stream.readUint8, 1, count);
		},
		readInt16: function(count){
			return readImpl(this, this.stream.readInt16, 1, count);
		},
		readUInt16: function(count){
			return readImpl(this, this.stream.readUint16, 1, count);
		},
		readInt32: function(count){
			return readImpl(this, this.stream.readInt32, 1, count);
		},
		readUInt32: function(count){
			return readImpl(this, this.stream.readUint32, 1, count);
		},
		readFloat32: function(count){
			return readImpl(this, this.stream.readFloat32, 1, count);
		},
		readFloat64: function(count){
			return readImpl(this, this.stream.readFloat64, 1, count);
		}
	};

	function readImpl(reader, fn, size, count){
		var stream = reader.stream;
		if (count === undefined){
			var pos = stream.pos;
			stream.pos += size;
			return fn.call(stream, pos, reader.le);
		}
		// TODO: consider to use typed arrays
		var arr = [];
		for (var i = 0; i < count; i++){
			arr[i] = fn.call(stream, stream.pos, reader.le);
			stream.pos += size;
		}
		return arr;
	}

})(this);

