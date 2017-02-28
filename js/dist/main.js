"use strict";

requirejs.config({
	baseUrl: "js/dist"

});

require(['mediator'], function (core) {
	$(function () {
		core.init();
	});
});
//# sourceMappingURL=main.js.map