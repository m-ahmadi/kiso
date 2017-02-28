"use strict";

define(["util", "positions"], function (u, sensorPos) {
	var inst = {};

	var ATLAS_PATH = "images/atlas.json";
	var PLANT_PATH = "images/plant.png";
	var BG_PATH = "images/bg.png";
	var AJAX_URL = "http://127.0.0.1:1081/khp/report";
	var REFRESH_TIME = 1000;

	// Scope Globals:
	var g = {
		renderer: {},
		stage: {},
		main: {},
		textures: {},
		sensorsList: false,
		sensors: {},
		sensorsList: function () {
			var a = [];Object.keys(sensorPos).forEach(function (k, i) {
				a[i] = k;
			});
		}(),
		initialAjaxLoaded: false,
		assetsLoaded: false
	};

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
			var arr;
			e.stopPropagation();
			this.data = e.data;
			this.alpha = 0.5;
			this.dragging = true;
			this.dragPoint = e.data.getLocalPosition(this.parent);
			this.dragPoint.x -= this.position.x;
			this.dragPoint.y -= this.position.y;

			arr = this.parent.children;
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
		console.log(e.deltaY);
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
		var i;
		var s;
		var x = 0;
		var y = 0;
		for (i = 0; i < 9; i += 1) {
			s = new PIXI.Sprite(g.textures[i + ".png"]);
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
		var c, s;

		c = new PIXI.Container();
		s = new PIXI.Sprite(g.textures.plant);
		s.scale.set(0.5);
		c.addChild(s);

		g.main.addChild(c);
		g.stage.position.set(500, 50);
	}
	function getLongestText(sensors) {
		var maxNameLen = 0,
		    maxValLen = 0,
		    keys = Object.keys(sensors);

		for (var i = 0, len = keys.length; i < len; i += 1) {
			var sensor = sensors[keys[i]],
			    nameLen = sensor.name.length,
			    valueLen = sensor.value.length;

			if (nameLen > maxNameLen) {
				maxNameLen = nameLen;
			}
			if (valueLen > maxValLen) {
				maxValLen = valueLen;
			}
		}
	}
	function createSensors(sensors) {
		var ts1,
		    ts2,
		    Text = PIXI.Text,
		    Graphics = PIXI.Graphics,
		    TXT_SCALE = 0.2,
		    BOX_COLOR = 0x02C4C4,
		    SCALE_X = 1.2,
		    SCALE_Y = 1.4,
		    SPACE_BETWEEN_BOXES = 8;

		ts1 = {
			fontFamily: 'Arial',
			fontSize: '100px',
			fill: '#002200',
			stroke: '#4a1850'
		};
		ts2 = {
			fontFamily: 'Arial',
			fontSize: '100px',
			fill: '#F7EDCA',
			stroke: '#4a1850'
		};

		Object.keys(sensors).forEach(function (k) {
			var sensor = sensors[k],
			    b = new PIXI.Container(),
			    r1,
			    r2,
			    t1,
			    t2;

			t1 = new Text("" + sensor.name, ts1);
			t1.scale.set(TXT_SCALE);

			t2 = new Text("" + sensor.value, ts2);
			t2.scale.set(TXT_SCALE);

			r1 = new Graphics();
			r1.beginFill(BOX_COLOR);
			r1.drawRect(0, 0, t1.width * SCALE_X, t1.height * SCALE_Y);
			r1.endFill();

			r2 = new Graphics();
			r2.beginFill(BOX_COLOR);
			r2.drawRect(0, 0, t2.width * SCALE_X * 1.3, t2.height * SCALE_Y);
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

			g.main.addChild(b);

			g.sensors[k] = {
				box: b,
				nameRectEl: r1,
				valueTxtEl: t2,
				valueRectEl: r2
			};
		});
	}
	function updateSensors(arr) {
		arr.forEach(function (itm, idx) {
			var sensor = g.sensors[itm.sensorId],
			    r1,
			    t2,
			    r2;

			r2 = sensor.valueRectEl;
			r1 = sensor.nameRectEl;
			t2 = sensor.valueTxtEl;

			r2.destroy(true);

			t2.setText("" + itm.value);

			r2 = new PIXI.Graphics();
			r2.beginFill(0x02C4C4);
			r2.drawRect(0, 0, t2.width * 1.5, t2.height * 1.4);
			r2.endFill();
			r2.position.x = r1.x + r1.width + 8;
			sensor.box.addChild(r2);

			var arr = t2.parent.children;
			arr.splice(arr.indexOf(t2), 1);
			arr.push(t2);

			sensor.valueRectEl = r2;
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
		var list, o;

		if (g.assetsLoaded) {
			list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
			o = {};
			g.sensorsList = list;

			o.sensorsList = list;
			o.done = function (data) {
				var arr;

				g.initialAjaxLoaded = true;

				arr = data.rowList;
				arr.forEach(function (itm) {

					var sensor = sensorPos[itm.sensorId];

					sensor.name = itm.sensorName + " :";
					sensor.value = "" + itm.value;
				});

				createSensors(sensorPos);

				setTimeout(loadData, REFRESH_TIME);
			};
			o.fail = function (data) {
				setTimeout(makeInitAjax, 1000);
			};

			ajax(o);
		} else {
			setTimeout(makeInitAjax, 1000);
		}
	}
	function init(div, fn) {
		makeInitAjax();

		div = div instanceof jQuery ? div : u.isStr(div) ? $(div) : $(document.body);
		var stage,
		    main,
		    renderer,
		    renReso,
		    N = 100000;

		PIXI.utils.skipHello();
		g.renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, {
			backgroundColor: 0x4e342e, // 0xf5eed8, // 0xAB9988, // 0xAB9999,
			antialias: false,
			transparent: false
		});
		g.stage = new PIXI.Container();
		g.main = new PIXI.Container();

		renderer = g.renderer;
		stage = g.stage;
		main = g.main;
		renReso = renderer.resolution;

		div.append(renderer.view);

		main.hitArea = new PIXI.Rectangle(-1000000, -1000000, renderer.width / renReso * 1000000, renderer.height / renReso * 1000000);
		//	stage.interactive = true;
		makeDraggable(main);
		addEvt();
		stage.addChild(main);

		// PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;
		PIXI.loader.add(PLANT_PATH);
		PIXI.loader.add(ATLAS_PATH);
		PIXI.loader.load(function () {
			g.assetsLoaded = true;
			g.textures = PIXI.loader.resources[ATLAS_PATH].textures;
			g.textures["plant"] = PIXI.loader.resources[PLANT_PATH].texture;
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

/* $.support.cors = true;

	$.ajaxSetup({
		crossDomain: true
	}); */
//# sourceMappingURL=map.js.map