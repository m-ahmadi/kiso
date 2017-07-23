requirejs.config({
	baseUrl: "js/"
	
});

require(['mediator'], function (core) {
	$(function () {
		core.init();
	});
});