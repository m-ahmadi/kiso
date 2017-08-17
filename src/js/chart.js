define(["core/fn"], function (fn) {
	let inst = {};
	
	const HOST = fn.determineHost();
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
		newData["Urea (2FR1042)"] = data.urea;
		newData["Amonia (2TI1029)"] = data.amonia;
		newData["Melamin (2FC1003_MV)"] = data.melamin;
		
		console.log(labelArr);
		g.chart.data.labels = labelArr;
		g.chart.data.datasets.forEach(o => {
			o.data = newData[ o.label ];
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
				label: "Amonia (2TI1029)",
				lineTension: 0,
		//		data: data.amonia,
				fill: false,
				borderColor: "#ff558f"
			}, {
				label: "Urea (2FR1042)",
				lineTension: 0,
		//		data: data.urea,
				fill: false,
				borderColor: "#00daff"
			}, {
				label: "Melamin (2FC1003_MV)",
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