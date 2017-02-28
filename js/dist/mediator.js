'use strict';

define(['page', 'map', 'chart'], function (page, map, chart) {
	var inst = {};

	function init() {
		page.init();
		map.init();
		chart.create();
	}

	inst.init = init;
	return inst;
});
//# sourceMappingURL=mediator.js.map