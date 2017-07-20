define(['page', 'map', 'chart'], function (page, map, chart) {
	var inst = {};
	
	function init() {
		page.init();
		map.init();
		chart.init();
	}
	
	inst.init = init;
	return inst;
});