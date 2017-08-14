define([
	"core/config",
	"core/fn",
	"./positions"
], function (
	conf,
	fn,
	sensorPos
) {
	let inst = {};
	
	const PLANT_PATH = conf.ROOT+ "images/plant.png";
	const TABLE_PATH = conf.ROOT+ "images/table.png";
	const REFRESH_TIME = 60000;
	
	const TXT_SCALE = 0.2;
	const BOX_COLOR = 0x02C4C4;
	const SCALE_X = 1.2;
	const SCALE_Y = 1.4;
	const SPACE_BETWEEN_BOXES = 8;
	
	function init(el) {
		initMap(el);
		
	}
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
//	basic pixi stuff
	let renderer, stage, main, sensContainer;
	let textures = {};
	function initMap(canvasContainer) {
		PIXI.utils.skipHello();
		const loader = PIXI.loader;
		renderer = PIXI.autoDetectRenderer(
			window.innerWidth,
			window.innerHeight,
			{
				backgroundColor: 0xffffff, // 0x4e342e, // 0xf5eed8, // 0xAB9988, // 0xAB9999,
				antialias: true,
				transparent: false
			}
		);
		canvasContainer.append( renderer.view );
		
		stage = new PIXI.Container();
		main = new PIXI.Container();
		sensContainer = new PIXI.Container();
		
		const renReso = renderer.resolution;
		main.hitArea = new PIXI.Rectangle(
			-1000000,
			-1000000,
			renderer.width / renReso * 1000000,
			renderer.height / renReso *1000000
		);
	//	stage.interactive = true;
		makeDraggable(main);
		addEvt();
		main.addChild( sensContainer );
		stage.addChild( main );

		loader.add( PLANT_PATH );
		loader.add( TABLE_PATH );
		loader.load(function () {
			textures["plant"] = loader.resources[ PLANT_PATH ].texture;
			textures["table"] = loader.resources[ TABLE_PATH ].texture;
			createPlant();
			createTable();
			createSensors(sensorPos);
			loadData();
		});
		requestAnimationFrame( animate );
		renderer.render( stage );
		
		window.stage = stage;
		window.main = main;
		
	}
	function addEvt() {
		$("canvas").on("mousewheel", mousewheel);
		$(window).on("resize", function () {
			renderer.resize(window.innerWidth, window.innerHeight);
		});
	}
	let makeDraggable = (function (el) {
		function start(e) {
			e.stopPropagation();
			this.data = e.data;
			this.alpha = 1;
			this.dragging = true;
			this.dragPoint = e.data.getLocalPosition(this.parent);
			this.dragPoint.x -= this.position.x;
			this.dragPoint.y -= this.position.y;
			
			let arr = this.parent.children;
			if (arr.length) {
				arr.splice( arr.indexOf(this), 1 );
				arr.push(this);
			}
		}
		function move(e) {
			if (this.dragging) {
				let newPosition = this.data.getLocalPosition(this.parent);
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
			el
				.on("mousedown", start)
				.on("touchstart", start)
				.on("mouseup", end)
				.on("mouseupoutside", end)
				.on("touchend", end)
				.on("touchendoutside", end)
				.on("mousemove", move)
				.on("touchmove", move);
		}
		return add;
	}());
	function animate() {
		requestAnimationFrame(animate);
		renderer.render(stage);
	}
	function mousewheel(e) {
		zoom(e.pageX, e.pageY, e.deltaY > 0);
	}
	function zoom(x, y, zoomIn) {
		let direction = (zoomIn) ? 1 : -1,
			factor = (1 + direction * 0.1),
			local_pt = new PIXI.Point(),
			point = new PIXI.Point(x, y),
			el = stage;
		
		PIXI.interaction.InteractionData.prototype.getLocalPosition(el, local_pt, point);
		
		el.scale.x *= factor;
		el.scale.y *= factor;
		el.pivot = local_pt;
		el.position = point;
	}
	function createPlant() {
		let container = new PIXI.Container();
		let sprite = new PIXI.Sprite( textures.plant );
		
		sprite.scale.set(0.5);
		container.addChild(sprite);
		
		main.addChild(container);
		stage.scale.set(0.7);
		stage.position.set(700, 15);
		
		// stage.x = -1500;
		// stage.scale.set(2.5);
	}
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
//	sensor stuff
	let longestTextEl;
	let sens = [];
	const txtConf = {
		fontFamily: "Arial",
		fontSize: "100px",
		fontWeight: "bold",
		fill: "#002200", // 002200
		stroke: "#4a1850"
	};
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
	function loadData() {
		ajax({
			done(data) {
				updateSensors( data.rowList );
				setTimeout(loadData, REFRESH_TIME);
			},
			fail() {
				setTimeout(loadData, 1000);
			}
		});
	}
	function createSensor(sensor) {
		const txt = new PIXI.Text(sensor.name +" "+ sensor.value, txtConf);
		txt.scale.set( TXT_SCALE );
		
		const rect = new PIXI.Graphics();
		rect.beginFill( BOX_COLOR );
		rect.drawRect(
			0,
			0,
			200 * SCALE_X,
			longestTextEl.height * SCALE_Y
		);
		rect.endFill();
		
		txt.position.x += (rect.width - txt.width) /10;
		txt.position.y += (rect.height - txt.height) /2;
		
		const b = new PIXI.Container();
		b.position.set(sensor.x, sensor.y);
		b.addChild(rect);
		b.addChild(txt);
		
		return b;
	}
	function createSensors(sensors) {
		if (sens.length) sens.forEach( i => i.destroy(true) );
		sens = [];
		const names = sensorPos.map(sensor => sensor.name);
		const name = getLongestName(names);
		
		longestTextEl = new PIXI.Text(name, txtConf);
		longestTextEl.scale.set( TXT_SCALE );
		
		sensors.forEach(sensor => {
			const el = createSensor(sensor);
			sensContainer.addChild(el);
			sens.push(el);
		});
	}
	
	function updateSensors(arr) {
		const vals = {};
		if (arr.length) {
			arr.forEach(i => {
				vals[i.sensorName] = i.value;
			});
		}
		sensorPos.forEach(i => {
			const k = i.name.trim().slice(0, -1);
			if ( vals[k] ) {
				i.value = vals[k];
			} else {
				i.value = "---";
			}
		});
		createSensors(sensorPos);
	}
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
//	table stuff
	/* var x = [
		[0, 1, 2, 3, 4, 5, 6, 7],
		[0, 1, 2, 3, 4, 5, 6, 7],
		[0, 1, 2, 3, 4, 5, 6, 7],
		[0, 1, 2, 3],
		[0]
	]; */
	
	let texts;
	function mkTxt(x, y, fontSize, val) {
		let c = {
			fontFamily: "Arial",
			fontSize: fontSize || "100px",
			fill: "#002200", // F7EDCA
			stroke: "#4a1850"
		};
		let t = new PIXI.Text(""+(val || 111), c);
		t.scale.set(0.2);
		t.x = x;
		t.y = y;
		return t;
	}
	function loadTableData() {
		$.ajax({
			url: AJAX_URL_2,
			method: "GET"
		})
		.done(data => {
			updateTable( convertData(data) );
			setTimeout(loadTableData, REFRESH_TIME);
		})
		.fail(() => {
			setTimeout(loadTableData, 1000);
		});
	}
	function createTable() {
		let s = new PIXI.Sprite( textures.table );
		
		s.position.set(200, 920);
		s.scale.set(0.5);
		main.addChild(s);
		
		texts = makeTexts();
		
		texts.forEach(a => {
			a.forEach( o => main.addChild(o) );
		});
		
		loadTableData();
	}
	function updateTable(data) {
		let len = data.length;
		for (let i=0; i<len; i+=1) {
			let d = data[i];
			let len = d.length;
			let t = texts[i];
			for (let j=0; j<len; j+=1) {
				t[j].setText( d[j] );
			}
		}
	}
	function makeTexts() {
		let a, b, c, d, date;
		const f1 = 135;
		const f2 = 118;
		const lf = f1 + 730;
		
		const X1 = 1130;
		const X2 = 1000;
		const X3 = 875;
		const X4 = 736;
		const X5 = 620;
		const X6 = 540;
		const X7 = 385;
		const X8 = 250;
		
		const Y1 = 1140;
		const Y2 = 1180;
		const Y3 = 1222;
		const Y4 = 1274;
		a = [
			mkTxt(X1, Y1),
			mkTxt(X2, Y1),
			mkTxt(X3, Y1),
			mkTxt(X4, Y1),
			mkTxt(X5, Y1),
			mkTxt(X6, Y1),
			mkTxt(X7, Y1),
			mkTxt(X8, Y1),
		];
		b = [
			mkTxt(X1, Y2),
			mkTxt(X2, Y2),
			mkTxt(X3, Y2),
			mkTxt(X4, Y2),
			mkTxt(X5, Y2),
			mkTxt(X6, Y2),
			mkTxt(X7, Y2),
			mkTxt(X8, Y2),
		];
		c = [
			mkTxt(X1, Y3),
			mkTxt(X2, Y3),
			mkTxt(X3, Y3),
			mkTxt(X4, Y3),
			mkTxt(X5, Y3),
			mkTxt(X6, Y3),
			mkTxt(X7, Y3),
			mkTxt(X8, Y3),
		];
		d = [
			mkTxt(X1, Y4),
			mkTxt(X2, Y4),
			mkTxt(X3, Y4)
		];
		date = [
			mkTxt(1200, 986, "90px")
		];
		return [a, b, c, d, date];
	}
	function convertData(data) {
		let res = [];
		let a, b, c, d, date;
		
		let lines = data.lines;
		let { amooniak, oore, melamin } = lines;
		let total = data.total;
		
		let f = u.toDecimalPlace;
		a = [
			f(amooniak.toolid, 2),
			f(amooniak.darsad_nesbat_be_tarahi, 2),
			f(amooniak.darsad_toolid_nesbat_be_kol_boodje, 2),
			amooniak.moojodi_jari.mojodi_mojtama,
			amooniak.moojodi_jari.mojodi_zakhire,
			amooniak.moojodi_jari.mojodi_swap,
			amooniak.moojodi_jari.mojodi_afghanestan,
			amooniak.majmoo_mojodi
		];
		b = [
			f(oore.toolid, 2),
			f(oore.darsad_nesbat_be_tarahi, 2),
			f(oore.darsad_toolid_nesbat_be_kol_boodje, 2),
			oore.moojodi_jari.mojodi_mojtama,
			oore.moojodi_jari.mojodi_zakhire,
			oore.moojodi_jari.mojodi_swap,
			oore.moojodi_jari.mojodi_afghanestan,
			oore.majmoo_mojodi
		];
		c = [
			f(melamin.toolid, 2),
			f(melamin.darsad_nesbat_be_tarahi, 2),
			f(melamin.darsad_toolid_nesbat_be_kol_boodje, 2),
			melamin.moojodi_jari.mojodi_mojtama,
			melamin.moojodi_jari.mojodi_zakhire,
			melamin.moojodi_jari.mojodi_swap,
			melamin.moojodi_jari.mojodi_afghanestan,
			melamin.majmoo_mojodi
		];
		d = [
			f(total.toolid, 2),
			f(total.darsad_nesbat_be_tarahi, 2),
			f(total.darsad_toolid_nesbat_be_kol_boodje, 2)
		];
		let x = data.date;
		date = [
			x.slice(0, 4) +"/"+ x.slice(4, 6) +"/"+ x.slice(-2)
		];
		res = [a, b, c, d, date];
		return res;
	}
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
//	double request handling
	const HOST = fn.determineHost();
	const AJAX_URL = `http://${HOST}/khp/report`; // "http://127.0.0.1:1081/khp/report"
	const AJAX_URL_2 = `http://${HOST}/khp/dashboard`; // http://127.0.0.1:1081/khp/dashboard
	function getTimestamp(now) {
		let ts = Math.floor( Date.now() );
		return now
			? ts
			: ts - (24 * 3600);
	}
	const sensors_1 = [1228,1783,748,1258,533,1228,12,92,211,49,312,533,474];
	const sensors_2 = [1633,1630,1602,1530,1465];
	let rowList1;
	let rowList2;
	let mockData = {rowList: undefined, message: undefined};
	let _init_ = false;
	function base(table_name, sensors, done, fail) {
		let d = {};

		d.num_rows        = 1;
		d.timestamp_start = getTimestamp();
		d.timestamp_end   = getTimestamp(true);
		d.table_name      = table_name;
		d.sensors         = sensors.join(",");

		$.ajax({
			url: AJAX_URL,
			type: "GET",
			dataType: "json",
			data: d
		})
		.done( done )
		.fail( fail );
	}
	function req1() {
		rowList1 = undefined;
		base(
			"csv_report",
			sensors_1,
			d => rowList1 = d.rowList,
			() => setTimeout(req1, 200)
		);
	}
	function req2() {
		rowList2 = undefined;
		base(
			"report_1_hour",
			sensors_2,
			d => rowList2 = d.rowList,
			() => setTimeout(req2, 200)
		);
	}
	function ajax(data) {
		if (!_init_) {
			_init_ = true;
			req1();
			req2();
		}
		if (rowList1 && rowList2) {
			mockData.rowList = rowList1.concat(rowList2);
			data.done(mockData);
		} else {
			setTimeout(ajax, 200, data);
		}
	}
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
	
	inst.init = init;
	return inst;
});