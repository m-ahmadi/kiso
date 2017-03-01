$.support.cors = true;

$.ajaxSetup({
	crossDomain: true
})


var sensor = g.sensors[ itm.sensorId ],
	r1, t2, r2;

r2 = sensor.valueRectEl;
r1 = sensor.nameRectEl;
t2 = sensor.valueTxtEl;

r2.destroy(true);

t2.setText(""+itm.value);

r2 = new PIXI.Graphics();
r2.beginFill( BOX_COLOR );
r2.drawRect(0, 0, t2.width * SCALE_X*1.3, t2.height * SCALE_Y);
r2.endFill();
r2.position.x = r1.x + r1.width + SPACE_BETWEEN_BOXES;
sensor.box.addChild(r2);

var arr = t2.parent.children;
arr.splice( arr.indexOf(t2), 1 );
arr.push(t2);

sensor.valueRectEl = r2;