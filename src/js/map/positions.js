define(function () {
	const diff = 66 - 10;
	
	const a = {x:  965,  y: 6,   diff: 53};
	const b = {x: -45,  y: 714, diff: 60};
	const c = {x:  690,  y: 755, diff: 62};

	const pos =  [
		{
			x: 620,
			y: -10,
			name: "4FR1295N:",
			value: "---",
			id: 1228
		},
		
		{
			x: a.x,
			y: a.y + a.diff-15,
			name: "WI-5015:",
			value: "---",
			id: 1633
		},
		{
			x: a.x,
			y: a.y + (a.diff+15),
			name: "WI-5019:",
			value: "---",
			id: 1630
		},
		{
			x: a.x,
			y: a.y + (a.diff*2),
			name: "FI-1167:",
			value: "---",
			id: 1602
		},
		{
			x: a.x,
			y: a.y + ( (a.diff*3) -15 ),
			name: "FI-1004:",
			value: "---",
			id: 1530
		},
		{
			x: a.x,
			y: a.y + (a.diff*3+9),
			name: "1FI1006:",
			value: "---",
			id: 1783
		},
		
		{
			x: a.x,
			y: a.y + ( (a.diff*4)-5 ),
			name: "FI-1069:",
			value: "---",
			id: 1465
		},
		
		
		{
			x: -230,
			y: 485,
			name: "FR62101:",
			value: "---",
			id: 748
		},
		{
			x: -195,
			y: 547,
			name: "FI65510:",
			value: "---",
			id: 1258
		},


		/* {
			x: -170,
			y: 610,
			name: "4FR1024C:",
			value: "---",
			id: 533
		}, */
		{
			x: -100,
			y: 662,
			name: "4FR1295N:",
			value: "---",
			id: 1228
		},
		{
			x: b.x,
			y: b.y,
			name: "2FR1042:",
			value: "---",
			id: 12
		},



		{
			x: b.x,
			y: b.y + (b.diff),
			name: "2FR1047:",
			value: "---",
			id: 92
		},
		{
			x: b.x,
			y: b.y + (b.diff*2),
			name: "2FC1056:",
			value: "---",
			id: 211
		},
		{
			x: c.x,
			y: c.y,
			name: "2FR1061:",
			value: "---",
			id: 49
		},


		
		{
			x: c.x,
			y: c.y + (c.diff),
			name: "2FR1060C:",
			value: "---",
			id: 312
		},
		{
			x: c.x,
			y: c.y + (c.diff*2),
			name: "4FR1024C:",
			value: "---",
			id: 533
		},
		{
			x: 820,
			y: 675,
			name: "5FI1021:",
			value: "---",
			id: 474
		}
	];
	
	function getLongestName(names) {
		let longest = 0;
		let res;
		names.forEach(name => {
			const len = name.length;
			if (len > longest) {
				longest = len;
				res = name;
			}
		});
		return res;
	}
	const lonLen = getLongestName( pos.map(i=>i.name) ).length;
	pos.forEach(i => {
		const len = i.name.length;
		if (len < lonLen) {
			i.name = i.name + " ".repeat(lonLen - len);
		}
	});
	
	return pos;
});
/*
									######## 1
																		######## 2
																		######## 3
																		######## 4
																		######## 5
																		######## 6
																		######## 7

######## 8  
	######## 9  
		######## 10  
			######## 11										######## 18
				######## 12         
				######## 13					######## 15
				######## 14					######## 16
											######## 17
*/