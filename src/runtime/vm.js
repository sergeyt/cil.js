function VM(appUrl, args) {
	
	loadApp(appUrl, start);

	function start(app) {
		var entryPointIndex = decodeTableIndex(app.meta.entryPointToken);
		var methodDef = app.meta.tables[TableId.MethodDef];
		var entryMethod = methodDef.fetch(entryPointIndex - 1);
		// TODO resolve rva and compile method body
	}

	// TODO steps:
	// goto entry point
	// parse the body instructions
	// build AST and compile it to the function
	// call the compiled function with args

	function resolveToken(token) {
	}

	// methodEnv object:
	// body - stream to read method body
	// 
	function call(methodEnv) {
	}
}

// loads app - metadata of all assemblies
function loadApp(appUrl, appLoaded) {

	var baseUrl = appUrl.substr(0, appUrl.lastIndexOf('/'));

	var app = {
		url: appUrl,
		name: appUrl,
		meta: {},
		refs: {}
	};

	load(appUrl, function(buf) {
		app.meta = MetaReader(Stream(buf));
		app.name = app.meta.assembly.name;
		app.refs[app.name] = app.meta; // for possible backrefs
		loadRefs(app.meta, function() {
			appLoaded(app);
		});
	});

	function loadRefs(meta, complete) {
		var assemblyRefs = app.meta.tables[TableId.AssemblyRef];

		var count = assemblyRefs.rowCount;
		if (count <= 0) {
			complete();
			return;
		}

		var queue = [];
		for (var i = 0; i < count; i++) {
			var row = assemblyRefs.fetch(i);
			var name = row.name;
			if (!app.refs.hasOwnProperty(name)) {
				var asmUrl = baseUrl + name;
				loadRef(asmUrl, wrap(function(ref) {
					queue.push(ref);
					if (queue.length == count) {
						complete();
					}
				}, name));
			}
		}
	}

	function loadRef(url, complete) {
		load(url, function(buf) {
			var meta = MetaReader(Stream(buf));
			app.refs[meta.assembly.name] = meta;
			loadRefs(meta, complete);
		});
	}

	function wrap(f) {
		var args = arguments.slice(1);
		return function() {
			f.apply(null, args);
		};
	}
}