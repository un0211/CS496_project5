
var canvas;

var context;


//canvas size
var canvasWidth = 490;
var canvasHeight = 220;
var padding = 25;
var lineWidth = 8;

//colors
var colorPurple = "#cb3594";
var colorGreen = "#659b41";
var colorYellow = "#ffcf33";
var colorBrown = "#986928";

//click informations
var clickX = new Array();  //클릭했던 X들
var clickY = new Array();  //클릭했던 Y들
var clickColor = new Array();  //썼던 색들
var clickTool = new Array();  //썼던 툴들
var clickSize = new Array();
var clickDrag = new Array();  //Drag들

var draggable = true;
var scalable = false;
var canDrawElement = true;
var canDraw = 0;
var CAN_DRAW_CIRCLE = 1;
var CAN_DRAW_RECT = 2;

var clickedObject;
var draw; //svg
var rect; //make stereotyped rect

var svgClickX;
var svgClickY;
var svgClickColor = new Array();
var svgClickTool = new Array();
var svgClickSize = new Array();
var svgClickDrag = new Array();

var clickedObject;
var copiedObject;
var clickedObjectBox = new Array();
var clickedObjectBoxPoints = new Array();


var drawings = new Array(); //save drawings. 최근부터 리턴(stack), 저장하면 초기화
var changes = new Array();
var clickedGroup;
/*
function prepareCanvas()
{
	context = document.getElementById('canvas').getContext("2d");

	var clickX = new Array();
	var clickY = new Array();
	var clickDrag = new Array();
	var paint;

	$('#canvas').mousedown(function(e){
	  var mouseX = e.pageX - this.offsetLeft - 100;
	  var mouseY = e.pageY - this.offsetTop - 80;

	  paint = true;
	  addClick(e.pageX - this.offsetLeft - 100, e.pageY - this.offsetTop - 80);
	  redraw();
	});

	$('#canvas').mousemove(function(e){
	  if(paint){
	    addClick(e.pageX - this.offsetLeft - 100, e.pageY - this.offsetTop - 80, true);
	    redraw();
	  }
	});

	$('#canvas').mouseup(function(e){
	  paint = false;
	});

	$('#canvas').mouseleave(function(e){
	  paint = false;
	});
}

function addClick(x, y, dragging)
{
  clickX.push(x);
  clickY.push(y);
  clickDrag.push(dragging);
}

function redraw(){
  clearCanvas();

  context.strokeStyle = "#df4b26";
  context.lineJoin = "round";
  context.lineWidth = 5;

  for(var i=0; i < clickX.length; i++) {
    context.beginPath();
    if(clickDrag[i] && i){
      context.moveTo(clickX[i-1], clickY[i-1]);
     }else{
       context.moveTo(clickX[i]-1, clickY[i]);
     }
     context.lineTo(clickX[i], clickY[i]);
     context.closePath();
     context.stroke();
  }
}
*/


function clearCanvas()
{
	context.clearRect(0, 0, canvasWidth, canvasHeight);
}


function drawSVGCanvas(){
	draw = SVG('svgDraw');
	console.log('main SVG'
	+ draw.bbox().x
	+ draw.bbox().y);
	var drawLeft = draw.offsetLeft,
			drawTop = draw.offsetTop,
			elements = new Array();
	var clicked = false;

	draw.on('mousedown', function(event){
		canDrawElement = true;
		console.log('is scalable' + scalable)
		clicked = false;
		var _x = event.pageX - 175,
				_y = event.pageY - 153;
		if(scalable && clickedObject != null) {
			makeUndraggable();
			makeScalable(_x, _y);
		}

		drawings.forEach(function(element) {
			console.log('the position of this element ('
			+ element.bbox().x + ", " + element.bbox().y + " )");
			if(element.inside(_x, _y)) {
				clicked = true;
				if(clickedObject != element && clickedObject != null) {
					deleteBoundingBox();
					makeUndraggable();
				}
				clickedObject = element;
				clickedObject.front();
				var _box = clickedObject.bbox();
				//var _rotate = clickedObject.transform('rotation');

				var _rotate;
				if(clickedGroup == null){
					_rotate = 0;
				}else {
					_rotate = clickedGroup.transform('rotation');
				}

				drawBoundingBox(_box, _rotate);
				putObjectStatus();

				if(draggable) {
					console.log('움직인다')
					makeDraggable();
				}
			}
		});
		if(!clicked) {
			deleteBoundingBox();
			makeUndraggable();
			draggable = true;
			scalable = false;
			clickedGroup = null;
		}
	}, false);


	$('#createRect').mousedown(function(e){
		canDraw = CAN_DRAW_RECT;
		console.log('candraw? '+ canDrawElement)
		if(canDrawElement)
		{
			drawRect()
			canDrawElement = false;
		}
	})

	$('#createCircle').mousedown(function(e) {
		canDraw = CAN_DRAW_CIRCLE;
		console.log('candraw? '+ canDrawElement)
		if(canDrawElement)
		{
			drawCircle()
			canDrawElement = false;
		}
	})

	$('#itemX').blur(function (e) {
		var _deltaX = document.getElementById('itemX').value;
		modifyXPosition(_deltaX);
	})

	$('#itemX').blur(function (e) {
		var _deltaY = document.getElementById('itemY').value;
		modifyYPosition(_deltaY);
	})

	$('#itemWidth').blur(function(e) {
		var _width = document.getElementById('itemWidth').value;
		modifyWidth(_width);
	})

	$('#itemHeight').blur(function(e) {
		var _height = document.getElementById('itemHeight').value;
		modifyHeight(_height);
	})

	$('#planeColorText').blur(function(e) {
		var _planeColor = "#"+document.getElementById('planeColorText').value;
		modifyPlaneColor(_planeColor);
	})

	$('#lineColorText').blur(function(e) {
		var _lineColor = "#"+document.getElementById('lineColorText').value;
		modifyLineColor(_lineColor);
	})

	$('#planeColor').change(function(e) {
		var _planecolor = document.getElementById("planeColor").value;
		modifyPlaneColor(_planecolor);
	})

	$('#lineColor').change(function(e) {
		var _lineColor = document.getElementById('lineColor').value;
		modifyLineColor(_lineColor);
	})

	$('#itemAngle').change(function(e) {
		var _angle = document.getElementById('itemAngle').value;
		modifyAngle(_angle);
	})

	$('#freeScale').mousedown(function(e) {
		if(!scalable) {
			scalable = true;
			draggable = false;
		}
	})

}

function makeScalable() {
	var _box = clickedObject.bbox();
	var cursor1 = draw.rect(5,5).move(_box.x + _box.width + 5, _box.y + _box.height + 5).fill('#b2305c')
			.stroke({color: "#b2305c", width: 2})
	var cursor2 = draw.rect(5,5).move(_box.x + _box.width + 5 , _box.y - 7).fill('#b2305c')
			.stroke({color: "#b2305c", width: 2})
	var cursor3 = draw.rect(5,5).move(_box.x - 7, _box.y + _box.height + 5).fill('#b2305c')
			.stroke({color: "#b2305c", width: 2})
	var cursor4 = draw.rect(5,5).move(_box.x - 7, _box.y - 7).fill('#b2305c')
			.stroke({color: "#b2305c", width: 2})

	draggableCursor(cursor1, cursor2, cursor3, cursor4);
	draggableCursor(cursor2, cursor1, cursor3, cursor4);
	draggableCursor(cursor3, cursor1, cursor2, cursor4);
	draggableCursor(cursor4, cursor1, cursor2, cursor3);

}

function draggableCursor(cursor, cursor2, cursor3, cursor4) {
	cursor.draggable();
	cursor.draggable().on('dragstart', function(event) {
		deleteBoundingBox();
		cursor2.remove();
		cursor3.remove();
		cursor4.remove();
	})
	cursor.draggable().on('dragmove', function(event) {
		_box = clickedObject.bbox();
		var deltaWidth;
		var deltaHeight;
		if(svgClickX != null && svgClickY != null) {
			deltaWidth = svgClickX - event.detail.p.x;
			deltaHeight = svgClickY - event.detail.p.y;
		} else {
			deltaWidth = 0;
			deltaHeight = 0;
		}
		svgClickX = event.detail.p.x
		svgClickY = event.detail.p.y

		clickedObject.size(-deltaWidth + _box.width, -deltaHeight+ _box.height)
		putObjectStatus();
	})
	cursor.draggable().on('dragend', function(event) {
		_box = clickedObject.bbox();//need to modify
		//drawBoundingBox(_box, clickedObject.transform('rotation'));
		drawBoundingBox(_box, clickedGroup.transform('rotation'));
		cursor.remove();
	})
}

function modifyWidth(width) {
	if(clickedObject != null) {
		var _box = clickedObject.bbox();
		deleteBoundingBox();
		clickedObject.size(width, _box.height);
		_box = clickedObject.bbox();
		//drawBoundingBox(_box, clickedObject.transform('rotation'));
		drawBoundingBox(_box, clickedGroup.transform('rotation'));
		console.log("bbox: " + _box.x + ", " + _box.y);
		console.log("clickedObject: " + clickedObject.attr('x') + ", " + clickedObject.attr('y'));
		putObjectStatus();
	}
}

function modifyheight(height) {
	if(clickedObject != null) {
		var _box = clickedObject.bbox();
		deleteBoundingBox();
		clickedObject.size(_box.width, height);
		_box = clickedObject.bbox();
		//drawBoundingBox(_box, clickedObject.transform('rotation'));
		drawBoundingBox(_box, clickedGroup.transform('rotation'));
		console.log("bbox: " + _box.x + ", " + _box.y);
		console.log("clickedObject: " + clickedObject.attr('x') + ", " + clickedObject.attr('y'));
		putObjectStatus();
	}
}

function modifyAngle(angle) {
	if(clickedObject != null) {
		deleteBoundingBox();
		//clickedObject.rotate(angle);
		drawBoundingBox(clickedObject.bbox(), angle);
		putObjectStatus();
	}
}

function modifyPlaneColor(color) {
	var planeColor = document.getElementById('planeColor');
	var planeColorText = document.getElementById('planeColorText');
	planeColor.value = color;
	planeColorText.value = color.substring(1,).toUpperCase();
	clickedObject.fill(color);
}

function modifyLineColor(color) {
	var lineColor = document.getElementById('lineColor');
	var lineColorText = document.getElementById('lineColorText');
	lineColor.value = color;
	lineColorText.value = color.substring(1,).toUpperCase();
	clickedObject.stroke(color);
}


function clickBoundingBoxPoints(x, y) {
	console.log('I clicked ...what?')
	if(clickedObjectBoxPoints[0].inside(x, y)) {
		console.log('I clicked 0 box point')
		scaleWithBoundingBoxPoint(0);
	} else if (clickedObjectBoxPoints[1].inside(x, y)) {
		console.log('I clicked 1 box point')
		scaleWithBoundingBoxPoint(1);
	} else if (clickedObjectBoxPoints[2].inside(x, y)) {
		console.log('I clicked 2 box point')
		scaleWithBoundingBoxPoint(2);
	} else if (clickedObjectBoxPoints[3].inside(x, y)) {
		console.log('I clicked 3 box point')
		scaleWithBoundingBoxPoint(3);
	}
}

function scaleWithBoundingBoxPoint(i) {
	if(clickedObject != null) {
		var _box = clickedObject.bbox();
		console.log('now this point is draggable')
		clickedObjectBoxPoints[i].draggable();
		clickedObjectBoxPoints[i].draggable().on('dragstart', function(e) {
			clickedObjectBox.forEach(function(element) {
				element.remove()
			});
			for (var j = 0; j < 4; j++) {
				if(i != j) {clickedObjectBoxPoints[j].remove()}
			}
		});
		clickedObjectBoxPoints[i].draggable().on('dragmove', function(e) {
			clickedObject.size(_box.width + e.detail.p.x, _box.height + e.detail.p.y)
			putObjectStatus();
		});
		clickedObjectBoxPoints[i].draggable().on('dragend', function(e) {
			_box = clickedObject.bbox();
			//drawBoundingBox(_box, clickedObject.transform('rotation'));
			drawBoundingBox(_box, clickedGroup.transform('rotation'));
		})
	}
}

function putObjectStatus(){
	if(clickedObject != null) {
		var _box = clickedObject.bbox();
		var _planeColor = clickedObject.attr('fill');
		var _lineColor = clickedObject.attr('stroke');
		//var _rotate = clickedObject.transform('rotation');
		var _rotate = clickedGroup.transform('rotation');

		document.getElementById('itemWidth').value = _box.width;
		document.getElementById('itemHeight').value = _box.height;

		document.getElementById('itemX').value = _box.x;
		document.getElementById('itemY').value = _box.y;

		document.getElementById('planeColorText').value = _planeColor.substring(1,).toUpperCase();
		document.getElementById('lineColorText').value = _lineColor.substring(1,).toUpperCase();
		document.getElementById('planeColor').value = _planeColor;
		document.getElementById('lineColor').value = _lineColor;

		document.getElementById('itemAngle').value = _rotate;
	}
}



function modifyXPosition(deltaX) {
	var _box = clickedObject.bbox();
	deleteBoundingBox();
	clickedObject.move(deltaX, _box.y);
	_box = clickedObject.bbox();
	//drawBoundingBox(_box, clickedObject.transform('rotation'));
	drawBoundingBox(_box, clickedGroup.transform('rotation'));
	putObjectStatus();
}

function modifyYPosition(deltaY) {
	var _box = clickedObject.bbox();
	deleteBoundingBox();
	clickedObject.move(_box.x, deltaY);
	_box = clickedObject.bbox();
	//drawBoundingBox(_box, clickedObject.transform('rotation'));
	drawBoundingBox(_box, clickedGroup.transform('rotation'));
	putObjectStatus();
}

function makeUndraggable() {
	if(clickedObject != null)
	{
		clickedObject.draggable(false);
		clickedObjectBox.forEach(function(element) {
			element.draggable(false);
		})
		clickedObjectBoxPoints.forEach(function(element) {
			element.draggable(false);
		});
	}
}

function makeDraggable() {
	clickedObject.draggable();
	clickedObject.draggable().on('dragstart', function(e){
		deleteBoundingBox();
	})
	clickedObject.draggable().on('dragmove', function(e) {
		putObjectStatus();
	})
	clickedObject.draggable().on('dragend', function(e){
		var _box = clickedObject.bbox();
		//drawBoundingBox(_box, clickedObject.transform('rotation'));
		drawBoundingBox(_box, clickedGroup.transform('rotation'));
	})
}

function drawBoundingBox(box, angle) {
	clickedGroup = draw.group();

	var _box = clickedObject.bbox();
	var _clickedObjectBox = draw.rect(_box.width + 10, _box.height + 10).addClass('box')
	//.rotate(angle)
	.move(_box.x - 5, _box.y - 5).fill('none')
	.stroke({color:'#d597a1', width: 1});

	var leftUp = draw.rect(3, 3).addClass('box')
	.move(_box.x - 7, _box.y - 7).fill('none')
	.stroke({color: '#000000', width: 1});

	var leftDown = draw.rect(3, 3).addClass('box')
	.move(_box.x - 7, _box.y + _box.height + 5).fill('none')
	.stroke({color: '#000000', width: 1});

	var rightUp = draw.rect(3, 3).addClass('box')
	.move(_box.x + _box.width + 5, _box.y - 7).fill('none')
	.stroke({color: '#000000', width: 1});

	var rightDown = draw.rect(3, 3).addClass('box')
	.move(_box.x + _box.width + 5, _box.y + _box.height + 5).fill('none')
	.stroke({color: '#000000', width: 1});

	clickedObjectBox.push(_clickedObjectBox);                                                                                                                                               clickedObjectBox.push(_clickedObjectBox);
	clickedObjectBoxPoints.push(leftUp);
	clickedObjectBoxPoints.push(leftDown);
	clickedObjectBoxPoints.push(rightUp);
	clickedObjectBoxPoints.push(rightDown);

	clickedGroup.add(_clickedObjectBox);
	clickedGroup.add(clickedObject);
	clickedGroup.add(leftUp);
	clickedGroup.add(rightUp);
	clickedGroup.add(leftDown);
	clickedGroup.add(rightDown);
	clickedGroup.rotate(angle);
}

function deleteBoundingBox() {
	clickedObjectBox.forEach(function(element) {
		element.remove();
	});
	clickedObjectBoxPoints.forEach(function(element) {
		element.remove();
	})
}

function drawRect() {
	if(canDraw === CAN_DRAW_RECT){
		var rect = draw.rect().fill('#fdffdb')
		.stroke({ color: '#ffcf5c', width: 3}).draw();

		drawings.push(rect);
		console.log(drawings);

		draw.on('mousedown', function(event) {
			rect.draw('point', event);
		});

		draw.on('mouseup', function(){
		});
		canDrawElement = true;
	}
}

function drawCircle() {
	if(canDraw === CAN_DRAW_CIRCLE) {
		var circle = draw.ellipse().fill('#fdffdb')
		.stroke({ color: '#ffcf5c', width: 3}).draw();

		drawings.push(circle);
		console.log(drawings);

		draw.on('mousedown', function(event) {
			circle.draw('point', event);
		});

		draw.on('mouseup', function(){
		});
		canDrawElement = true;
	}
}

function drawPolygon() {
	draw = SVG('svgDraw');
	var polygon = draw.polygon().fill('#182673').draw();

	draw.on('keyon', function(){
		polygon.draw('done');
	})
}

function undoDrawing() {
	drawings.pop().remove();
}

//for ctrl+c
function copyDrawing(){
	copiedObject = clickedObject.clone().hide();
}

//for ctrl+x
function cutDrawing(){
	copyDrawing();
	drawings.pop(clickedObject).remove();
}

//for ctrl+v
function pasteDrawing(){
	if (copiedObject != null){
		var forPaste = copiedObject.move(copiedObject.x()+10,copiedObject.y()+10).clone();
		forPaste.show().front();
		drawings.push(forPaste);
	}
}

function drawColorPicker(){
	var draw = SVG('color_picker')

	var gradient = draw.gradient('linear', function(stop) {
	  stop.at(0, '#FF0000')
		stop.at(0.05, '#FF3300')
		stop.at(0.1, '#FF6600')
		stop.at(0.15, '#FF9900')
		stop.at(0.21, '#FFCC00')
		stop.at(0.29, '#FFFF00')
		stop.at(0.38, '#CCFF00')
		stop.at(0.42, '#99FF00')
		stop.at(0.44, '#66FF00')
		stop.at(0.45, '#33FF00')
		stop.at(0.48, '#00FF00')
		stop.at(0.51, '#00FF33')
		stop.at(0.56, '#00FF66')
		stop.at(0.59, '#00FF99')
		stop.at(0.63, '#00FFFF')
		stop.at(0.67, '#00CCFF')
		stop.at(0.72, '#0099FF')
		stop.at(0.75, '#0066FF')
		stop.at(0.78, '#0033FF')
		stop.at(0.82, '#0000FF')
		stop.at(0.84, '#1100EE')
		stop.at(0.85, '#2200DD')
		stop.at(0.86, '#3300CC')
		stop.at(0.92, '#330066')
		stop.at(1, '#660066')
	})

	var rect = draw.rect(180, 95).move(10, 0).fill(gradient)

	draw.circle(10).center(10, 110).fill(gradient.colorAt(0))
	draw.circle(10).center(55, 110).fill(gradient.colorAt(0.25))
	draw.circle(10).center(100, 110).fill(gradient.colorAt(0.5))
	draw.circle(10).center(145, 110).fill(gradient.colorAt(0.75))
	draw.circle(10).center(190, 110).fill(gradient.colorAt(1))
}
