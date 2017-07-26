define([], function () {
	let inst = {};
	
	const HOST = determineHost();
	const AJAX_URL = `http://${HOST}/khp/report`; // "http://127.0.0.1:1081/khp/report";
	const UREA = 12;
	const PRILE = 13;
	const AMONIA = 14;
	const MELAMIN = 15;
	const SENSORS = [12, 13, 14, 15].join(",");
	
	let g = {
		labels: [],
		months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
		chart: {},
		chartData: {};
		
		// "rgba(75, 192, 192, 0.4)"
	};
	
	function determineHost() {
		let host = window.location.host;
		let res;
		if (host) {	
			if (host === "localhost" || host === "127.0.0.1") {
				res = `${host}:1081`;
			} else if (host === "80.85.82.83" || host === "10.10.200.64") {
				res = `${host}:8081`;
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
			prile: [],
			amonia: [],
			melamin: []
		};
		
		list.forEach(function (o) {
			if (o.sensorId === UREA) {
				let timestamp = o.timestamp;
				let date = new Date(timestamp);
				labelArr.push( g.months[ date.getMonth() ] +"-"+ date.getDate() );
				
				data.urea.push(o.value);
			} else if (o.sensorId === PRILE) {
				data.prile.push(o.value);
			} else if (o.sensorId === AMONIA) {
				data.amonia.push(o.value);
			} else if (o.sensorId === MELAMIN) {
				data.melamin.push(o.value);
			}
		});
		console.log(labelArr);
		g.chart.data.labels = labelArr;
		g.chart.data.datasets.forEach(function (o) {
			
			o.data = data[ o.label.toLowerCase() ];
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
				label: "Urea",
				lineTension: 0,
		//		data: data.urea,
				fill: false,
				borderColor: "blue"
			}, {
				label: "Prile",
				lineTension: 0,
		//		data: data.prile,
				fill: false,
				borderColor: "green"
			}, {
				label: "Amonia",
				lineTension: 0,
		//		data: data.amonia,
				fill: false,
				borderColor: "red"
			}, {
				label: "Melamin",
				lineTension: 0,
		//		data: data.melamin,
				fill: false,
				borderColor: "orange"
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


/*
[{
	label: "Urea",
	fill: false,
	lineTension: 0,
	backgroundColor: "rgba(75, 192, 192, 0.4)",
	borderColor: "rgba(75,192,192,1)",
	borderCapStyle: "square", // butt round square
	borderDash: [],
	borderDashOffset: 0.0,
	borderJoinStyle: "miter",
	pointBorderColor: "rgba(75,192,192,1)",
	pointBackgroundColor: "#fff",
	pointBorderWidth: 5,
	pointHoverRadius: 5,
	pointHoverBackgroundColor: "rgba(75, 192, 192, 1)",
	pointHoverBorderColor: "rgba(220, 220, 220, 1)",
	pointHoverBorderWidth: 2,
	pointRadius: 1,
	pointHitRadius: 10,
	data: [65, 59, 80, 81, 56, 55, 40],
	spanGaps: false,
}, {
	label: "Prile",
	lineTension: 0,
	data: [10, 20, 30, 40, 50, 60, 70],
	fill: false,
	borderColor: "green"
}, {
	label: "Amonia",
	lineTension: 0,
	data: [80, 10, 60, 50, 40, 25, 60],
	fill: false,
	borderColor: "red"
}, {
	label: "Melamin",
	lineTension: 0,
	data: [20, 40, 12, 70, 65, 72, 12, 34, 56],
	fill: false,
	borderColor: "orange"
}]
*/