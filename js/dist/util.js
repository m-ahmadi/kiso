'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var util = function () {
	if (typeof Object.create !== 'function') {
		Object.create = function (o) {
			function F() {}
			F.prototype = o;
			return new F();
		};
	}
	if (typeof Object.keys !== 'function') {
		Object.keys = function (o) {
			var keys = [],
			    k;
			for (k in o) {
				if (o.hasOwnProperty(k)) {
					keys.push(k);
				}
			}
			return keys;
		};
	}

	function isObj(v) {
		return v && (typeof v === 'undefined' ? 'undefined' : _typeof(v)) === 'object' && typeof v !== null && Object.prototype.toString.call(v) === '[object Object]' ? true : false;
	}
	function isArr(v) {
		if (typeof Array.isArray === 'function') {
			return Array.isArray(v);
		} else {
			return v && (typeof v === 'undefined' ? 'undefined' : _typeof(v)) === 'object' && typeof v.length === 'number' && typeof v.splice === 'function' && !v.propertyIsEnumerable('length') && Object.prototype.toString.call(v) === '[object Array]' ? true : false;
		}
	}
	function getArgs(a) {
		var args = new Array(a.length),
		    i;
		for (i = 0; i < args.length; i += 1) {
			args[i] = a[i];
		}
		return args;
	}
	function moveArrItem(a, f, t) {
		// array, from, to
		a.splice(t, 0, a.splice(f, 1)[0]);
	}
	function isInt(n) {
		return isNum(n) && n % 1 === 0;
	}
	function negateNum(n) {
		return isNum(n) ? Math.abs(n) * -1 : undefined;
	}
	function positNum(n) {
		return isNum(n) ? Math.abs(n) : undefined;
	}
	function reverseNumSign(n) {
		if (isNum(n)) {
			if (n > 0) {
				return negateNum(n);
			} else if (n < 0) {
				return positNum(n);
			}
		}
	}
	function isNumOdd(n) {
		return isNum(n) && n % 2 ? true : false;
	}
	function randInt(min, max) {
		// default between 0 and 1
		min = min ? Math.ceil(min) : 0;
		max = max ? Math.floor(max) : 2;
		return Math.floor(Math.random() * (max - min)) + min;
	}
	function randFloat(min, max) {
		min = min ? min : 0;
		max = max ? max : 1;
		return Math.random() * (max - min) + min;
	}
	function toDecimalPlace(n, p) {
		return isNum(n) ? parseFloat(n.toFixed(p)) : undefined;
	}
	function isEmptyObj(o) {
		var k;
		if (isObj(o)) {
			if (typeof Object.getOwnPropertyNames === 'function') {
				return Object.getOwnPropertyNames(o).length === 0; // ES5
			} else {
				for (k in o) {
					if (o.hasOwnProperty(k)) {
						return false;
					}
				}
				return true;
			}
		}
	}
	function isFn(v) {
		return typeof v === 'function';
	}
	function isStr(v) {
		return typeof v === 'string';
	}
	function isNum(v) {
		return typeof v === 'number';
	}
	function isBool(v) {
		return typeof v === 'boolean';
	}
	function isUndef(v) {
		return typeof v === 'undefined';
	}
	function isEmptyStr(v) {
		return typeof v === 'string' && v.length === 0;
	}
	function objLength(o) {
		if (isObj(o)) {
			return Object.keys(o).length;
		}
	}
	function extend() {
		var args = Array.prototype.slice.call(arguments),
		    len = args.length,
		    arr = [],
		    objects = [],
		    first,
		    last,
		    result;

		if (len === 1) {
			first = args[0];
			if (isArr(first) && first.length > 1) {
				last = first.pop();
				objects = first;
			} else if (isObj(first)) {
				result = Object.create(first);
			}
		} else if (len === 2) {
			first = args[0];
			last = args[len - 1];
			if (isObj(first)) {
				result = Object.create(first);
			}
		} else if (len > 2) {
			last = args.pop();
			objects = args;
		}

		if (objects.length !== 0) {
			arr.push({});
			objects.forEach(function (el, i) {
				if (isObj(el)) {
					Object.keys(el).forEach(function (k) {
						arr[i][k] = el[k];
					});
					arr.push(Object.create(arr[i]));
				}
			});
			result = arr[arr.length - 1];
		}

		if (last && isObj(last)) {
			Object.keys(last).forEach(function (key) {
				result[key] = last[key];
			});
		}
		return result;
	}
	function getCommentsInside(selector) {
		return $(selector).contents().filter(function () {
			return this.nodeType === 8;
		});
	}
	function getFirstCommentInside(selector) {
		return getCommentsInside(selector)[0].nodeValue.trim();
	}

	return {
		isObj: isObj,
		isArr: isArr,
		getArgs: getArgs,
		moveArrItem: moveArrItem,
		isInt: isInt,
		negateNum: negateNum,
		positNum: positNum,
		reverseNumSign: reverseNumSign,
		isNumOdd: isNumOdd,
		randInt: randInt,
		randFloat: randFloat,
		toDecimalPlace: toDecimalPlace,
		isEmptyObj: isEmptyObj,
		isFn: isFn,
		isStr: isStr,
		isNum: isNum,
		isBool: isBool,
		isUndef: isUndef,
		isEmptyStr: isEmptyStr,
		objLength: objLength,
		extend: extend,
		getCommentsInside: getCommentsInside,
		getFirstCommentInside: getFirstCommentInside
	};
}();

if (typeof define === 'function' && define.amd) {
	define(util);
} else if (typeof module !== 'undefined') {
	module.exports = util;
}
//# sourceMappingURL=util.js.map