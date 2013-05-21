// from https://github.com/larrymyers/jasmine-reporters
// reduced and refactored
(function() {
    if (!jasmine) {
        throw new Error("jasmine library does not exist in global namespace!");
    }

    /**
     * Basic reporter that outputs spec results to for the Teamcity build system
     *
     * Usage:
     *
     * jasmine.getEnv().addReporter(new jasmine.TeamcityReporter());
     * jasmine.getEnv().execute();
     */
    var TeamcityReporter = function() {
        this.started = false;
        this.finished = false;
    };

    TeamcityReporter.prototype = {
        reportRunnerResults: function(runner) { },

        reportRunnerStarting: function(runner) { },

        reportSpecResults: function(spec) { },

        reportSpecStarting: function(spec) { },

        reportSuiteResults: function(suite) {
            var results = suite.results();
            var path = [];
            while(suite) {
                path.unshift(suite.description);
                suite = suite.parentSuite;
            }
            var description = path.join(' ');

            log("##teamcity[testSuiteStarted name='" + escape(description) + "']");

	        var items = results.getItems();
	        for (var i = 0; i < items.length; i++) {
	        	logspec(items[i]);
            }

            log("##teamcity[testSuiteFinished name='" + escape(description) + "']");
        },

        log: log,

        hasGroupedConsole: function() {
            var console = jasmine.getGlobal().console;
            return console && console.info && console.warn && console.group && console.groupEnd && console.groupCollapsed;
        },
    };

	function logspec(spec) {
		if (!spec.description) return;

		log("##teamcity[testStarted name='" + escape(spec.description) + "' captureStandardOutput='true']");

		var items = spec.getItems();
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			if (item.passed()) continue;
			var msg = "case " + (i + 1) + ". " + item.trace.toString();
			log("##teamcity[testFailed name='" + escape(spec.description) + "' message='|[FAILED|]' details='" + escape(msg) + "']");
		}

		log("##teamcity[testFinished name='" + escape(spec.description) + "']");
	}

	function log(str) {
    	var console = jasmine.getGlobal().console;
    	if (console && console.log) {
    		console.log(str);
    	}
    }

	function escape(msg) {
		if (!msg) return "";
		return msg.replace(/\|/g, "||")
			.replace(/\'/g, "|'")
			.replace(/\n/g, "|n")
			.replace(/\r/g, "|r")
			.replace(/\u0085/g, "|x")
			.replace(/\u2028/g, "|l")
			.replace(/\u2029/g, "|p")
			.replace(/\[/g, "|[")
			.replace(/]/g, "|]");
	}

	// export public
    jasmine.TeamcityReporter = TeamcityReporter;
})();

