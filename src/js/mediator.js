define(["mediator", "map/map", "chart"], function (page, map, chart) {
	var inst = {};
	
	function init() {
		map.init( $("#map-container") );
		chart.init();
	}
	
	inst.init = init;
	return inst;
});