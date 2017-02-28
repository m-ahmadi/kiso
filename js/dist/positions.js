"use strict";

define(function () {
	var diff = 66 - 10,
	    a = { x: 910, y: 6 },
	    b = { x: -20, y: 625 },
	    c = { x: 647, y: 664 },
	    d = { x: 896, y: 559 };

	/*
                                           ######## 1
                                         a ######## 2
                                           ######## 3
                                                   
                                                   
                                                   
                                                   
                                                   
                                                   
                                                   
                                                   
                                               d   
                                           ######## 10
     b                                     ######## 11
 ######## 4                       c                
 ######## 5                    ######## 7
 ######## 6                    ######## 8
                               ######## 9
 */

	return {
		"1": {
			x: a.x,
			y: a.y
		},
		"2": {
			x: a.x,
			y: a.y + diff
		},
		"3": {
			x: a.x,
			y: a.y + diff * 2
		},
		"4": {
			x: b.x,
			y: b.y
		},
		"5": {
			x: b.x,
			y: b.y + diff
		},
		"6": {
			x: b.x,
			y: b.y + diff * 2
		},
		"7": {
			x: c.x,
			y: c.y
		},
		"8": {
			x: c.x,
			y: c.y + diff
		},
		"9": {
			x: c.x,
			y: c.y + diff * 2
		},
		"10": {
			x: d.x,
			y: d.y
		},
		"11": {
			x: d.x,
			y: d.y + diff
		}
	};
});
//# sourceMappingURL=positions.js.map