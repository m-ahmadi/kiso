define([], function () {
	let inst = {};
	
	const HOST = determineHost();
	const AJAX_URL = `http://${HOST}/khp/report`; // "http://127.0.0.1:1081/khp/report";
	const AMONIA = 14;
	const UREA = 12;
	const MELAMIN = 15;
	const SENSORS = [12, 14, 15].join(",");
	
	let g = {
		labels: [],
		months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
		chart: {},
		chartData: {}
		// "rgba(75, 192, 192, 0.4)"
	};
	
	function determineHost() {
		let hName = window.location.hostname;
		let res;
		if (hName) {	
			if (hName === "localhost" || hName === "127.0.0.1") {
				res = `${hName}:1081`;
			} else if (host === "80.85.82.83" || hName === "10.10.200.64") {
				res = `${hName}:8081`;
			}
		}
		return res;
	}
	function ajax(callback) {
		let d = {};
		let t = new Date();
		
		d.num_rows = 7;
		d.timestamp_start = t.setDate( t.getDate() - 7 ) ;
		d.timestamp_end = Date.now();
		d.table_name = "report_1_day";
		d.sensors = SENSORS;
		
		$.ajax({
			url: AJAX_URL,
			type: "GET",
			dataType: "json",
			data: d,
			beforeSend: function () {}
		})
		.done( handleChartData )
		.fail(  );
	}
	function handleChartData(d) {
		let list = d.rowList;
		let labelArr = [];
		let data = {
			urea: [],
			amonia: [],
			melamin: []
		};
		
		list.forEach(o => {
			if (o.sensorId === UREA) {
				let timestamp = o.timestamp;
				let date = new Date(timestamp);
				labelArr.push( g.months[ date.getMonth() ] +"-"+ date.getDate() );
				
				data.urea.push(o.value);
			} else if (o.sensorId === AMONIA) {
				data.amonia.push(o.value);
			} else if (o.sensorId === MELAMIN) {
				data.melamin.push(o.value);
			}
		});
		
		let newData = {};
		newData["urea ("+UREA+")"] = data.urea;
		newData["amonia ("+AMONIA+")"] = data.amonia;
		newData["melamin ("+MELAMIN+")"] = data.melamin;
		
		g.chart.data.labels = labelArr;
		g.chart.data.datasets.forEach(o => {
			
			o.data = newData[ o.label.toLowerCase() ];
		});
		g.chart.update();
	}

	function createChart() {
		let ctx = $("#myChart");  // #f3e3e0
		
		let options = {
			legend: {
				display: true,
				position: "right",
				label: {
					usePointStyle: true
				}
			}
		};
		let data = {
			labels: [],
			datasets: [{
				label: "Amonia ("+AMONIA+")",
				lineTension: 0,
		//		data: data.amonia,
				fill: false,
				borderColor: "#ff558f"
			}, {
				label: "Urea ("+UREA+")",
				lineTension: 0,
		//		data: data.urea,
				fill: false,
				borderColor: "#00daff"
			}, {
				label: "Melamin ("+MELAMIN+")",
				lineTension: 0,
		//		data: data.melamin,
				fill: false,
				borderColor: "#ffb749"
			}]
		};
		g.chart = new Chart(ctx, {
			type: "line",
			data: data,
			options: options
		});
	}
	function init() {
		ajax();
		createChart();
	}
	
	inst.init = init;
	
	window.chart = g;
	return inst;
});