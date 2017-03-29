"use strict";

define(["util", "positions"], function (u, sensorPos) {
	var inst = {};

	var ATLAS_PATH = "images/atlas.json";
	var PLANT_PATH = "images/plant.png";
	var BG_PATH = "images/bg.png";
	var HOST = determineHost();
	var AJAX_URL = "http://" + HOST + "/khp/report"; // "http://127.0.0.1:1081/khp/report"
	var REFRESH_TIME = 60000;
	var FAIL_RETRY_TIME = 200;
	var NO_ASSETS_RETRY_TIME = 100;

	var TXT_SCALE = 0.2;
	var BOX_COLOR = 0x02C4C4;
	var SCALE_X = 1.2;
	var SCALE_Y = 1.4;
	var SPACE_BETWEEN_BOXES = 8;

	// Scope globals prefixed with g. for better readablity:
	var g = {
		renderer: {},
		stage: {},
		main: {},
		textures: {},
		sensors: {},
		sensorsList: function () {
			var a = [];Object.keys(sensorPos).forEach(function (k, i) {
				a[i] = k;
			});
		}(),
		initialAjaxLoaded: false,
		assetsLoaded: false
	};

	function determineHost() {
		var host = window.location.host;
		var res = void 0;
		if (host) {
			if (host === "localhost" || host === "127.0.0.1") {
				res = host + ":1081";
			} else if (host === "80.85.82.83" || host === "10.10.200.64") {
				res = host + ":8081";
			}
		}
		return res;
	}
	function ajax(data) {
		var d = {};

		d.num_rows = 1;
		d.timestamp_start = 1487968298000;
		d.timestamp_end = 1488056858000;
		d.table_name = "csv_report";
		d.sensors = data.sensorsList ? data.sensorsList.join(",") : g.sensorsList.join(",");

		$.ajax({
			url: AJAX_URL,
			type: "GET",
			dataType: "json",
			data: d,
			beforeSend: data.beforeSend
		}).done(data.done).fail(data.fail);
	}
	var makeDraggable = function (el) {
		function start(e) {
			e.stopPropagation();
			this.data = e.data;
			this.alpha = 0.5;
			this.dragging = true;
			this.dragPoint = e.data.getLocalPosition(this.parent);
			this.dragPoint.x -= this.position.x;
			this.dragPoint.y -= this.position.y;

			var arr = this.parent.children;
			if (arr.length) {
				arr.splice(arr.indexOf(this), 1);
				arr.push(this);
			}
		}
		function move(e) {
			if (this.dragging) {
				var newPosition = this.data.getLocalPosition(this.parent);
				this.position.x = newPosition.x - this.dragPoint.x;
				this.position.y = newPosition.y - this.dragPoint.y;
			}
		}
		function end() {
			this.alpha = 1;
			this.dragging = false;
			this.data = null;
		}
		function add(el) {
			el.interactive = true;
			el.on("mousedown", start).on("touchstart", start).on("mouseup", end).on("mouseupoutside", end).on("touchend", end).on("touchendoutside", end).on("mousemove", move).on("touchmove", move);
		}
		return add;
	}();
	function animate() {
		requestAnimationFrame(animate);
		g.renderer.render(g.stage);
	}
	function mousewheel(e) {
		zoom(e.pageX, e.pageY, e.deltaY > 0);
	}
	function addEvt() {
		$("canvas").on("mousewheel", mousewheel);
		$(window).on("resize", function () {
			g.renderer.resize(window.innerWidth, window.innerHeight);
		});
	}
	function zoom(x, y, zoomIn) {
		var direction = zoomIn ? 1 : -1,
		    factor = 1 + direction * 0.1,
		    local_pt = new PIXI.Point(),
		    point = new PIXI.Point(x, y),
		    el = g.stage;

		PIXI.interaction.InteractionData.prototype.getLocalPosition(el, local_pt, point);

		el.scale.x *= factor;
		el.scale.y *= factor;
		el.pivot = local_pt;
		el.position = point;
	}

	function start() {
		var tile = new PIXI.extras.TilingSprite.fromImage(BG_PATH, g.renderer.width / g.renderer.resolution * 1000000, g.renderer.height / g.renderer.resolution * 1000000);
		tile.position.x = -1000000;
		tile.position.y = -1000000;
		g.main.addChild(tile);

		// var s = new PIXI.Sprite.fromImage( "images/1.png");
		var x = 0,
		    y = 0;
		for (var i = 0; i < 9; i += 1) {
			var s = new PIXI.Sprite(g.textures[i + ".png"]);
			s.scale.set(0.5);
			s.x = x;
			s.y = y;
			x += 50;
			y += 50;
			makeDraggable(s);
			g.main.addChild(s);
		}
	}
	function createPlant() {
		var c = new PIXI.Container();
		var s = new PIXI.Sprite(g.textures.plant);

		s.scale.set(0.5);
		c.addChild(s);

		g.main.addChild(c);
		g.stage.position.set(500, 50);
	}
	function getLongestText(sensors) {
		var nameMax = 0,
		    valueMax = 0,
		    keys = Object.keys(sensors),
		    name = void 0,
		    value = void 0;

		for (var i = 0, len = keys.length; i < len; i += 1) {
			var sensor = sensors[keys[i]],
			    nameLen = sensor.name.length,
			    valueLen = sensor.value.length;

			if (nameLen > nameMax) {
				nameMax = nameLen;
				name = keys[i];
			}
			if (valueLen > valueMax) {
				valueMax = valueLen;
				value = keys[i];
			}
		}

		return { name: name, value: value };
	}
	function createSensor(sensor, k, largestName, largestVal, wR1, wR2, add) {
		var Text = PIXI.Text;
		var Graphics = PIXI.Graphics;
		var ts1 = {
			fontFamily: 'Arial',
			fontSize: '100px',
			fontWeight: 'bold',
			fill: '#002200', // 002200
			stroke: '#4a1850'
		};
		var ts2 = {
			fontFamily: 'Arial',
			fontSize: '100px',
			fontWeight: 'bold',
			fill: '#002200', // F7EDCA
			stroke: '#4a1850'
		};

		var b = new PIXI.Container();

		var t1 = new Text("" + sensor.name, ts1);
		t1.scale.set(TXT_SCALE);

		var t2 = new Text("" + sensor.value, ts2);
		t2.scale.set(TXT_SCALE);

		var r1 = new Graphics();
		r1.beginFill(BOX_COLOR);
		r1.drawRect(0, 0, wR1 ? wR1 : t1.width * SCALE_X, t1.height * SCALE_Y);
		r1.endFill();

		var r2 = new Graphics();
		r2.beginFill(BOX_COLOR);
		r2.drawRect(0, 0, wR2 ? wR2 : t2.width * SCALE_X * 1.3, t2.height * SCALE_Y);
		r2.endFill();
		r2.position.x = r1.x + r1.width + SPACE_BETWEEN_BOXES;

		t1.position.x += (r1.width - t1.width) / 2;
		t1.position.y += (r1.height - t1.height) / 2;
		t2.position.x = r2.x + (r2.width - t2.width) / 2;
		t2.position.y = r2.y + (r2.height - t2.height) / 2;

		b.position.set(sensor.x, sensor.y);

		b.addChild(r1);
		b.addChild(r2);
		b.addChild(t1);
		b.addChild(t2);

		if (add) {
			g.main.addChild(b);
			g.sensors[k] = {
				box: b,
				nameRectEl: r1,
				valueTxtEl: t2,
				valueRectEl: r2
			};
		}

		return largestName ? r1.width : largestVal ? r2.width : undefined;
	}
	function createSensors(sensors) {
		var longest = getLongestText(sensors);
		var lngName = longest.name;
		var lngVal = longest.value;

		var nW = createSensor(sensors[lngName], lngName, true);
		var vW = createSensor(sensors[lngVal], lngVal, false, true);

		Object.keys(sensors).forEach(function (k) {
			var sensor = sensors[k];
			if (sensor) {
				createSensor(sensor, k, false, false, nW, vW, true);
			}
		});
	}
	function updateSensors(arr) {
		arr.forEach(function (itm, idx) {
			var sensor = g.sensors[itm.sensorId];
			sensor.valueTxtEl.setText("" + itm.value);
		});
	}
	function loadData() {
		ajax({
			done: function done(data) {
				updateSensors(data.rowList);
				setTimeout(loadData, REFRESH_TIME);
			},
			fail: function fail() {
				setTimeout(loadData, 1000);
			}
		});
	}
	function makeInitAjax() {
		if (g.assetsLoaded) {
			var list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
			var o = {};
			g.sensorsList = list;

			o.sensorsList = list;
			o.done = function (data) {
				g.initialAjaxLoaded = true;

				var arr = data.rowList;
				arr.forEach(function (itm) {
					var sensor = sensorPos[itm.sensorId];

					sensor.name = itm.sensorName + " :";
					sensor.value = "" + itm.value;
				});

				createSensors(sensorPos);

				setTimeout(loadData, REFRESH_TIME);
			};
			o.fail = function (data) {
				setTimeout(makeInitAjax, FAIL_RETRY_TIME);
			};

			ajax(o);
		} else {
			setTimeout(makeInitAjax, NO_ASSETS_RETRY_TIME);
		}
	}
	function init(el, fn) {
		makeInitAjax();
		var Container = PIXI.Container;
		var loader = PIXI.loader;
		var div = el instanceof jQuery ? el : u.isStr(el) ? $(el) : $(document.body);

		PIXI.utils.skipHello();
		g.renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, {
			backgroundColor: 0x4e342e, // 0xf5eed8, // 0xAB9988, // 0xAB9999,
			antialias: false,
			transparent: false
		});
		g.stage = new Container();
		g.main = new Container();

		var renderer = g.renderer;
		var stage = g.stage;
		var main = g.main;
		var renReso = renderer.resolution;

		div.append(renderer.view);

		main.hitArea = new PIXI.Rectangle(-1000000, -1000000, renderer.width / renReso * 1000000, renderer.height / renReso * 1000000);
		//	stage.interactive = true;
		makeDraggable(main);
		addEvt();
		stage.addChild(main);

		// PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;
		loader.add(PLANT_PATH);
		loader.add(ATLAS_PATH);
		loader.load(function () {
			g.assetsLoaded = true;
			g.textures = loader.resources[ATLAS_PATH].textures;
			g.textures["plant"] = loader.resources[PLANT_PATH].texture;
			if (u.isFn(fn)) {
				fn();
			}
			//	start();
			createPlant();
		});
		requestAnimationFrame(animate);
		renderer.render(stage);
	}

	inst.init = init;
	inst.g = g;
	window.map = inst;

	return inst;
});
//# sourceMappingURL=map.js.map