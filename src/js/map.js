define(["positions"], function (sensorPos) {
	let inst = {};
	
	const ATLAS_PATH = "images/atlas.json";
	const PLANT_PATH = "images/plant.png";
	const TABLE_PATH = "images/table.png";
	const BG_PATH = "images/bg.png";
	const HOST = determineHost();
	const AJAX_URL = `http://${HOST}/khp/report`; // "http://127.0.0.1:1081/khp/report"
	const AJAX_URL_2 = `http://${HOST}/khp/dashboard`; // http://127.0.0.1:1081/khp/dashboard
	const REFRESH_TIME = 60000;
	const FAIL_RETRY_TIME = 200;
	const NO_ASSETS_RETRY_TIME = 100;
	
	const TXT_SCALE = 0.2;
	const BOX_COLOR = 0x02C4C4;
	const SCALE_X = 1.2;
	const SCALE_Y = 1.4;
	const SPACE_BETWEEN_BOXES = 8;
	
	// Scope globals prefixed with g. for better readablity:
	let g = {
		renderer: {},
		stage: {},
		main: {},
		textures: {},
		sensors: {},
		sensorsList: Object.keys(sensorPos),
		initialAjaxLoaded: false,
		assetsLoaded: false
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
	function ajax(data) {
		let d = {};
		
		d.num_rows        = 1;
		d.timestamp_start = 1487968298000;
		d.timestamp_end   = 1488056858000;
		d.table_name      = "csv_report";
		d.sensors = data.sensorsList ? data.sensorsList.join(",") : g.sensorsList.join(",")
		
		$.ajax({
			url: AJAX_URL,
			type: "GET",
			dataType: "json",
			data: d,
			beforeSend: data.beforeSend
		})
		.done( data.done )
		.fail( data.fail );
	}
	let makeDraggable = (function (el) {
		function start(e) {
			e.stopPropagation();
			this.data = e.data;
			this.alpha = 0.9;
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
		let direction = (zoomIn) ? 1 : -1,
			factor = (1 + direction * 0.1),
			local_pt = new PIXI.Point(),
			point = new PIXI.Point(x, y),
			el = g.stage;
		
		PIXI.interaction.InteractionData.prototype.getLocalPosition(el, local_pt, point);
		
		el.scale.x *= factor;
		el.scale.y *= factor;
		el.pivot = local_pt;
		el.position = point;
	}
	
	function init(el, fn) {
		makeInitAjax();
		let Container = PIXI.Container;
		let loader = PIXI.loader;
		let div = el instanceof jQuery ? el    :
				  u.isStr(el)          ? $(el) :
				  $(document.body);
		
		PIXI.utils.skipHello();
		g.renderer = PIXI.autoDetectRenderer(
			window.innerWidth,
			window.innerHeight,
			{
				backgroundColor: 0xffffff, // 0x4e342e, // 0xf5eed8, // 0xAB9988, // 0xAB9999,
				antialias: false,
				transparent: false
			}
		);
		g.stage = new Container();
		g.main = new Container();
		
		let renderer = g.renderer;
		let stage = g.stage;
		let main = g.main;
		let renReso = renderer.resolution;
		
		div.append( renderer.view );
		
		main.hitArea = new PIXI.Rectangle( -1000000, -1000000, renderer.width / renReso * 1000000, renderer.height / renReso *1000000 );
	//	stage.interactive = true;
		makeDraggable(main);
		addEvt();
		stage.addChild( main );
		
		// PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;
		loader.add( PLANT_PATH );
		loader.add( TABLE_PATH );
		loader.add( ATLAS_PATH );
		loader.load(function () {
			g.assetsLoaded = true;
			g.textures = loader.resources[ ATLAS_PATH ].textures;
			g.textures["plant"] = loader.resources[ PLANT_PATH ].texture;
			g.textures["table"] = loader.resources[ TABLE_PATH ].texture;
			if ( u.isFn(fn) ) {
				fn();
			}
		//	start();
			createPlant();
			createTable();
		});
		requestAnimationFrame( animate );
		renderer.render( stage );
		
		
	}
	function makeInitAjax() {
		if ( g.assetsLoaded ) {
			let list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
			let o = {};
			g.sensorsList = list;
			
			o.sensorsList = list;
			o.done = function (data) {
				g.initialAjaxLoaded = true;
				
				let arr = data.rowList;
				arr.forEach(function (itm) {
					let sensor = sensorPos[itm.sensorId];
					
					sensor.name = itm.sensorName + " :";
					sensor.value = ""+itm.value;
					
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
	function createPlant() {
		let c = new PIXI.Container();
		let s = new PIXI.Sprite( g.textures.plant );
		
		s.scale.set(0.5);
		c.addChild(s);
		
		g.main.addChild(c);
		g.stage.scale.set(0.7);
		g.stage.position.set(700, 15);
	}
	function getLongestText(sensors) {
		let nameMax = 0,
			valueMax = 0,
			keys = Object.keys(sensors),
			name, value;
		
		for (let i=0, len=keys.length; i<len; i+=1) {
			let sensor = sensors[ keys[i] ],
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
		
		return {name, value};
	}
	function createSensor(sensor, k, largestName, largestVal, wR1, wR2, add) {
		let	Text = PIXI.Text;
		let Graphics = PIXI.Graphics;
		let ts1 = {
			fontFamily: 'Arial',
			fontSize: '100px',
			fontWeight : 'bold',
			fill: '#002200', // 002200
			stroke: '#4a1850'
		};
		let ts2 = {
			fontFamily: 'Arial',
			fontSize: '100px',
			fontWeight : 'bold',
			fill: '#002200', // F7EDCA
			stroke: '#4a1850'
		};
		
		let b = new PIXI.Container();
		
		let t1 = new Text(""+sensor.name, ts1);
		t1.scale.set( TXT_SCALE );
		
		let t2 = new Text(""+sensor.value, ts2);
		t2.scale.set( TXT_SCALE );
		
		let r1 = new Graphics();
		r1.beginFill( BOX_COLOR );
		r1.drawRect(0, 0, wR1 ? wR1 : t1.width * SCALE_X, t1.height * SCALE_Y);
		r1.endFill();
		
		let r2 = new Graphics();
		r2.beginFill( BOX_COLOR );
		r2.drawRect(0, 0, wR2 ? wR2 : t2.width * SCALE_X*1.3, t2.height * SCALE_Y);
		r2.endFill();
		r2.position.x = r1.x + r1.width + SPACE_BETWEEN_BOXES;
		
		t1.position.x += (r1.width - t1.width) /2;
		t1.position.y += (r1.height - t1.height) /2;
		t2.position.x = r2.x + (r2.width - t2.width) /2;
		t2.position.y = r2.y + (r2.height - t2.height) /2;
		
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
		
		
		return largestName ? r1.width :
			   largestVal   ? r2.width : undefined;
	}
	function createSensors(sensors) {
		let longest = getLongestText(sensors);
		let lngName = longest.name;
		let lngVal = longest.value;
		
		let nW = createSensor(sensors[lngName], lngName, true);
		let vW = createSensor(sensors[lngVal], lngVal, false, true);
		
		
		Object.keys(sensors).forEach(k => {
			let sensor = sensors[k];
			if (sensor) {
				createSensor( sensor, k, false, false, nW, vW, true );
			}
		});
		
	}
	function updateSensors(arr) {
		arr.forEach((itm, idx) => {
			let sensor = g.sensors[ itm.sensorId ];
			sensor.valueTxtEl.setText(""+itm.value);
		});
	}
	
	
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// table stuff
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
		let s = new PIXI.Sprite( g.textures.table );
		
		s.position.set(200, 920);
		s.scale.set(0.5);
		g.main.addChild(s);
		
		texts = makeTexts();
		
		texts.forEach(a => {
			a.forEach( o => g.main.addChild(o) );
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
	
	function start() {
		let tile = new PIXI.extras.TilingSprite.fromImage(BG_PATH, g.renderer.width / g.renderer.resolution * 1000000, g.renderer.height / g.renderer.resolution *1000000);
		tile.position.x = -1000000;
		tile.position.y = -1000000;
		g.main.addChild(tile);
		
		// var s = new PIXI.Sprite.fromImage( "images/1.png");
		let x = 0,
			y = 0;
		for (let i=0; i<9; i+=1) {
			let s = new PIXI.Sprite( g.textures[i+".png"] );
			s.scale.set(0.5);
			s.x = x;
			s.y = y;
			x+=50;
			y+=50;
			makeDraggable(s);
			g.main.addChild(s);
		}
	}
	
	inst.init = init;
	inst.g = g;
	window.map = inst;
	
	return inst;
});


/* function makeTexts() {
	let a, b, c, d, date;
	const f1 = 135;
	const f2 = 118;
	const lf = f1 + 740;
	const X = 1155;
	const X2 = 880;
	const Y1 = 1135;
	const Y2 = 1177;
	const Y3 = 1219;
	const Y4 = 1272;
	a = [
		mkTxt(X,           Y1),
		mkTxt(X  - f1,     Y1),
		mkTxt(X  - (f1*2), Y1),
		mkTxt(X2 - f2,     Y1),
		mkTxt(X2 - (f2*2), Y1),
		mkTxt(X2 - (f2*3), Y1),
		mkTxt(X2 - (f2*4), Y1),
		mkTxt(X  - lf,     Y1)
	];
	b = [
		mkTxt(X,           Y2),
		mkTxt(X  - f1,     Y2),
		mkTxt(X  - (f1*2), Y2),
		mkTxt(X2 - f2,     Y2),
		mkTxt(X2 - (f2*2), Y2),
		mkTxt(X2 - (f2*3), Y2),
		mkTxt(X2 - (f2*4), Y2),
		mkTxt(X  - lf,     Y2)
	];
	c = [
		mkTxt(X,           Y3),
		mkTxt(X  - f1,     Y3),
		mkTxt(X  - (f1*2), Y3),
		mkTxt(X2 - f2,     Y3),
		mkTxt(X2 - (f2*2), Y3),
		mkTxt(X2 - (f2*3), Y3),
		mkTxt(X2 - (f2*4), Y3),
		mkTxt(X  - lf,     Y3)
	];
	d = [
		mkTxt(X,           Y4),
		mkTxt(X  - f1,     Y4),
		mkTxt(X  - (f1*2), Y4)
	];
	date = [
		mkTxt(1200, 986, "90px")
	];
	return [a, b, c, d, date];
} */