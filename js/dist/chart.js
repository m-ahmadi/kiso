"use strict";

define([], function () {
	var inst = {};

	var COLOR = {
		ONE: "rgba(75, 192, 192, 0.4)",
		TWO: ""
	};

	function create() {
		var ctx = $("#myChart"); // #f3e3e0
		ctx.width = 300;
		ctx.height = 300;

		var data = {
			labels: ["January", "February", "March", "April", "May", "June", "July"],
			datasets: [{
				label: "Urea",

				fill: false,
				lineTension: 0,
				backgroundColor: "rgba(75, 192, 192, 0.4)",
				borderColor: "rgba(75,192,192,1)",
				borderCapStyle: 'square', // butt round square
				borderDash: [],
				borderDashOffset: 0.0,
				borderJoinStyle: 'miter',
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
				spanGaps: false
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
		};
		var options = {
			legend: {
				display: true,
				position: "right",
				label: {
					usePointStyle: true
				}
			}
		};
		var myLineChart = new Chart(ctx, {
			type: 'line',
			data: data,
			options: options
		});
	}

	inst.create = create;
	return inst;
});
//# sourceMappingURL=chart.js.map