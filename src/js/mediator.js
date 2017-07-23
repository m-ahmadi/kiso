define(['mediator', 'map', 'chart'], function (page, map, chart) {
	var inst = {};
	
	function init() {
		map.init();
		chart.init();
	}
	
	inst.init = init;
	return inst;
});