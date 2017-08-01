
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
var block = true;
var drawingPolygon = false;
var canDrawElement = true;
var isEditing = false;
var canDraw = 0;
var CAN_DRAW_CIRCLE = 1;
var CAN_DRAW_RECT = 2;

var clickedObject;
var draw; //svg
var rect; //make stereotyped rect

var svgClickX;
var svgClickY;
var testClickX;
var testClickY;
var svgClickColor = new Array();
var svgClickTool = new Array();
var svgClickSize = new Array();
var svgClickDrag = new Array();

var clickedObject;
var _copyClickedObject;
var copiedObject;
var clickedObjectBox = new Array();
var clickedObjectBoxPoints = new Array();

var drawings = new Array(); //save drawings. 최근부터 리턴(stack), 저장하면 초기화
var changes = new Array();
//var clickedGroup;

var FACE = "face"
		BODY = "body"
		HEAD = "head"
		EYES = "eyes"
		MOUTH = "mouth"
		ARMS = "arms"
		LEGS = "legs"
		DEFAULT = "default"

var face;
var body;
var head;
var arms;
var legs;
var eyes;
var mouth;
var current;
var currentGroup;
var groups = new Array();

function clearCanvas()
{
	drawings.forEach(function(element) {
		element.remove();
	})
}


function drawSVGCanvas(){
	draw = SVG('svgDraw');
	console.log('main SVG'
	+ draw.rbox().x
	+ draw.rbox().y);
	var drawLeft = draw.offsetLeft,
			drawTop = draw.offsetTop,
			elements = new Array();
	var clicked = false;
	head = draw.group();
	face = draw.group();
	body = draw.group();
	arms = draw.group();
	legs = draw.group();
	eyes = draw.group();
	mouth = draw.group();
	current = draw.group();


	draw.on('mousedown', function(event){
		var baseTag = document.getElementById("defaultTag")
		var tagString = baseTag.textContent;
		console.log('isDrawingPolygon? '+ drawingPolygon)
		if(drawingPolygon) {
			return;
		}

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
			+ element.rbox().x + ", " + element.rbox().y + " )");

			if(element.inside(_x, _y)) {
				clicked = true;
				if(clickedObject != element && clickedObject != null) {
					deleteBoundingBox();
					makeUndraggable();
				}
				clickedObject = element;
				clickedObject.front();
				var _box = clickedObject.rbox();

				var _rotate = clickedObject.transform('rotation');

				/*
				var _rotate;
				if(clickedGroup == null){
					_rotate = 0;
				}else {
					_rotate = clickedGroup.transform('rotation');
				}*/

				drawBoundingBox(_box, _rotate);
				putObjectStatus();

				if(draggable) {
					console.log('움직인다')
					makeDraggable();
				}
			}
		});
		console.log('clicked? '+clicked)
		console.log('candrawelement? '+canDrawElement)
		if(!clicked && canDrawElement) {
			if(tagString != DEFAULT && tagString != "default" && !block) {
				switch(tagString) {
					case FACE: makeGroupDraggable(face);break;
					case HEAD: makeGroupDraggable(head);break;
					case BODY: makeGroupDraggable(body);break;
					case ARMS: makeGroupDraggable(arms);break;
					case LEGS: makeGroupDraggable(legs);break;
					case EYES: makeGroupDraggable(eyes);break;
					case MOUTH: makeGroupDraggable(mouth);break;
				}
			}

			document.getElementById('itemTag').textContent = tagString;
			deleteBoundingBox();
			makeUndraggable();
			draggable = true;
			scalable = false;
			//clickedGroup = null;
		}
	}, false);

	$('#deleteElement').mousedown(function(e) {
		if(clickedObject != null) {
			deleteBoundingBox();
			clickedObject.data('tag', null);
			clickedObject.hide();
		}
	})

	$('#flipX').mousedown(function(e) {
		if(clickedObject != null) {
			clickedObject.flip('x');
		}
	})

	$('#flipY').mousedown(function(e) {
		if(clickedObject != null) {
			clickedObject.flip('');
		}
	})

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

	$('#createTest').mousedown(function(e) {
		if(canDrawElement) {
			drawTest();
			canDrawElement = false;
		}
	})

	$('#createPolygon').mousedown(function(e) {
		if(canDrawElement) {
			drawPolygon();
			canDrawElement = false;
			drawingPolygon = true;
		}
	})

	$('#createObject1').mousedown(function(e) {
		if(canDrawElement) {
			drawObject('M45.4,11.5c-3.2,0-11,0-16.9,5.9c-0.5,0.5-5.4,5.6-5.9,13.3c-0.3,6.1,2.6,7.2,2.4,13.3c-0.3,7.5-4.9,9-4.4,13.6, c0.8,7.3,13.2,13.5,23.9,14c13.8,0.7,28.4-7.9,28.6-15.5c0.1-4-3.8-4.7-5.1-11.4c-1.2-6.2,1.7-7.9,0.7-14.5, c-0.2-1.6-1.2-7.9-6.2-12.8C56.4,11.5,48.3,11.5,45.4,11.5z')
			canDrawElement = false;
		}
	})

	$('#createObject2').mousedown(function(e) {
		if(canDrawElement) {
			drawObject('M41.1,15.4c-11.7,0.1-18.9,10.8-20.7,13.5c-1.7,2.6-5.5,8.4-5,16.4c0.1,2.1,0.4,7.7,4.4,12.4, c5.9,7.1,15.9,6.9,23.6,6.7c6.6-0.1,13.6-0.3,19.3-5.5c0.9-0.8,4.7-4.5,6-10.6c2.3-11.2-6.3-20.4-8.7-23, C56.7,22,50.4,15.3,41.1,15.4z')
			canDrawElement = false;
		}
	})

	$('#createObject3').mousedown(function(e) {
		if(canDrawElement) {
			drawObject('M72,43.4c-2-3.6-8.1-1.6-17.9-3c-9.9-1.4-12.6-4.7-22.8-5.2c-0.9,0-4.6-0.2-9,1.3c-2.9,0.9-5.3,1.7-6.7,4.2, c-1.4,2.3-1.5,5.4-0.3,7.8c1.3,2.6,4.1,3.9,7.9,4.9c5.8,1.5,9.9,1.4,26.2,0.4c0.4,0,5.9-0.4,13-1.8c6.3-1.2,9-2.3,9.9-4.5, C72.7,46.2,72.7,44.7,72,43.4z')
			canDrawElement = false;
		}
	})

	$('#createObject4').mousedown(function(e) {
		if(canDrawElement) {
			drawObject('M39.1,66.5c-3.8-2.4-4.6-7.7-5.3-15.9c-1.4-14.7-1.5-27.7,2.9-33.4c0.5-0.7,1.8-2.3,4-3.2 ,c2.9-1.1,5.8-0.2,6.8,0.1c1.5,0.5,2.6,0.8,3.3,1.6c2.2,2.6-2.5,7.7-5,15.4c-3.5,10.8-2.1,25-0.2,29.3c0.2,0.4,1.2,2.5,0.7,4.8,c-0.1,0.6-0.4,1.9-1.4,2.6C42.8,68.9,39.6,66.8,39.1,66.5z')
			canDrawElement = false;
		}
	})

	$('#createObject5').mousedown(function(e) {
		if(canDrawElement) {
			drawObject('M15.6,36.3c-0.3-5.8-0.6-10.7,2.4-15.6c3.1-5.2,8.1-7.8,9.9-8.7c4.8-2.4,9-2.7,13.9-3c6.1-0.4,11-0.7,16.7,1.8,c1.9,0.8,9,3.9,12.2,10.9c2.1,4.5,1.1,7.8,0.6,14.9c-1.7,21.5,4,25.8-1.2,33.5c-4.6,6.9-13.1,9.4-13.9,9.6c-3.6,1-7,1-10.5,1,c-2.2,0-6.2,0-10.7-0.9c-3.6-0.7-10.7-2.2-15.3-6.5C15.3,69.3,17,66.2,15.6,36.3z')
			canDrawElement = false;
		}
	})

	$('#createObject6').mousedown(function(e) {
		if(canDrawElement) {
			drawObject('M36.5,17.3c0.9-1.4,2.8-4.5,5.4-4.5c0.4,0,2.6,0.1,5.1,4.1C54.8,29,54.9,59.1,47.4,66c-0.7,0.7-2.6,2.4-5.1,2.4,c-2.4-0.1-4.2-1.8-4.9-2.5C30.6,59,28.4,30.5,36.5,17.3z')
			canDrawElement = false;
		}
	})

	$('#createObject7').mousedown(function(e) {
		if(canDrawElement) {
			drawObject('M15.9,48.1c-3.4-9,8.6-26.3,23.6-26.8c15.5-0.4,28.5,17.5,25.2,26.5c-3.2,9-22.4,9-24.6,9,C37,56.8,19.2,56.8,15.9,48.1z')
			canDrawElement = false;
		}
	})

	$('#createObject8').mousedown(function(e) {
		if(canDrawElement) {
			drawObject('M23.1,25.5c6.4-10.7,30.7-10.1,36.6,0.7c5.8,10.7-6.5,31.3-19,31C28.3,57,16.9,36,23.1,25.5z')
			canDrawElement = false;
		}
	})

	$('#createObject9').mousedown(function(e) {
		if(canDrawElement) {
			drawObject('M38.3,67.2c-4.1-3.1-9.4-8-14.2-15.1c-3.3-4.9-4.9-8.8-6.9-13.6c-3.8-9.3-6.9-16.7-3.6-20.5,c0.1-0.2,1.7-1.9,4.1-2.1C23.9,15.5,28.8,26.6,30,26c1-0.5-3.5-7.4-0.8-11.6c1.3-2,4.1-3,6.4-2.9c6.8,0.4,11.3,10.5,12.4,9.9,c0.8-0.5-3-6.3-0.9-9c1.3-1.7,4.5-1.5,6.4-0.9c2.4,0.8,4.3,2.5,7.1,7.9c1.9,3.5,4.3,8.2,6,15.7c2,8.8,1.4,15.4,1.3,17,c-0.5,5-0.9,8.6-3.5,12.2c-1.2,1.6-3.9,4.8-8.5,6.3c-4.1,1.4-7.6,0.8-9.2,0.4C42.6,70.3,39.7,68.3,38.3,67.2z')
			canDrawElement = false;
		}
	})

	$('#createObject10').mousedown(function(e) {
		if(canDrawElement) {
			drawObject('M25.5,12.7c0.3-1.4,0.8-4,2.9-6.2c5.7-6.2,19.3-6,24.1,0.2c1.9,2.5,2,5.4,2,7.3c0.5,23.6,2.2,31.5-1.7,54.3,c-0.4,2.3-0.9,5.2-3.2,7.6c-5.4,5.6-17.5,5.4-23-0.4c-2.1-2.2-2.8-4.8-3.1-6.2C21.3,60.4,19,44.7,25.5,12.7z')
			canDrawElement = false;
		}
	})

	$('#createObject11').mousedown(function(e) {
		if(canDrawElement) {
			drawObject('M18.6,23.9c-1.6,1.8-5.3,6.4-6,13.3c-0.8,7.6,2.3,14.3,5.9,18.4c9.9,11.1,31.6,11.7,41,0.6,c5.8-6.8,5.3-15.8,5.2-17.1c-0.5-7.7-4.4-12.9-5.9-14.6c1.9-1,3-2.9,2.9-4.8c-0.2-2.7-2.9-4.7-5.6-4.5c-2.6,0.2-4.8,2.3-5,5.1,c-2.6-1-6.4-2.2-11.1-2.5c-6.3-0.4-11.4,1.1-14.4,2.1c-0.4-2.3-2.1-4.1-4.3-4.6c-2.1-0.4-4.9,0.3-5.8,2.6,C14.8,20.1,16,22.9,18.6,23.9z')
			canDrawElement = false;
		}
	})

	$('#createObject12').mousedown(function(e) {
		if(canDrawElement) {
			drawObject('M24.6,35.4c-1.5,1.3-6.8,6-8,13.9c-1.5,9.9,4.8,17.1,5.9,18.4c9.9,11.1,31.6,11.7,41,0.6c6-7,5.3-16.2,5.2-17.1,c-0.9-9.4-7.1-14.8-8.4-15.9c2.6-1.7,6.3-4.4,9.8-8.7c3.3-4,8.7-10.6,6.3-15.3c-1.2-2.4-4.5-3.9-7.2-3.6c-4.6,0.5-7.2,6.2-9.8,12.1,c-2.4,5.3-3.3,10-3.7,13c-2.5-1.1-6.5-2.6-11.7-2.8c-6.7-0.3-11.9,1.6-14.6,2.8c-0.9-2.1-2.4-5.3-4.4-9c-4.6-8.3-7.5-13.3-11.7-13.5,c-2.8-0.1-6,2-6.8,4.6c-1.8,5.3,6.2,12.1,9.9,15.2C19.6,32.6,22.6,34.3,24.6,35.4z')
			canDrawElement = false;
		}
	})

	$('#itemX').change(function (e) {
		//isEditing = false;
		console.log("I am now EDITTINGASDFASODF "+ isEditing )
		var _deltaX = document.getElementById('itemX').value;
		modifyXPosition(_deltaX);
	})

	$('#itemY').change(function (e) {
		//isEditing = false;
		var _deltaY = document.getElementById('itemY').value;
		modifyYPosition(_deltaY);
	})

	$('#itemWidth').change(function(e) {
		var _width = document.getElementById('itemWidth').value;
		modifyWidth(_width);
	})

	$('#itemHeight').change(function(e) {
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

	$('#itemTime').change(function(e) {
		//var _angle = clickedObject.transform('rotation');
		var _angle = document.getElementById('itemAngle').value;
		var _time = document.getElementById('itemTime').value;
		modifyAngleWithAnimation(_angle, _time);
	})

	$('#freeScale').mousedown(function(e) {
		if(!scalable) {
			scalable = true;
			draggable = false;
		}
	})

	$('#tagMove').mousedown(function(e) {
		block = !block;
	})

	$('#tagOn').mousedown(function(e) {
		var baseTag = document.getElementById("defaultTag")
		var tagString = baseTag.textContent;
		if(tagString != "default") {
			if(clickedObject != null) {
				switch(tagString) {
					case HEAD: head.add(clickedObject);currentGroup = head;break;
					case BODY: body.add(clickedObject);currentGroup = body;break;
					case FACE: face.add(clickedObject);currentGroup = face;break;
					case LEGS: legs.add(clickedObject);currentGroup = legs;break;
					case ARMS: arms.add(clickedObject);currentGroup = arms;break;
					case EYES: eyes.add(clickedObject);currentGroup = eyes;break;
					case MOUTH: mouth.add(clickedObject);currentGroup = mouth;break;
					case DEFAULT: currentGroup = null; break;
					//일단 두개만 넣었음
				}
				clickedObject.data('tag', tagString);
			}
		}
		document.getElementById('itemTag').textContent = tagString;
	})

	$('#tagHide').mousedown(function(e) {
		var baseTag = document.getElementById("defaultTag")
		var tagString = baseTag.textContent;
		if(tagString != "default") {
			if(clickedObject != null) {
				switch(tagString) {
					case HEAD: head.hide();break;
					case BODY: body.hide();break;
					case FACE: face.hide();break;
					case LEGS: legs.hide();break;
					case ARMS: arms.hide();break;
					case EYES: eyes.hide();break;
					case MOUTH: mouth.hide();break;
					//일단 두개만 넣었음
				}
			}
		}
	})

	$('#tagShow').mousedown(function(e) {
		var baseTag = document.getElementById("defaultTag")
		var tagString = baseTag.textContent;
		if(tagString != "default") {
			if(clickedObject != null) {
					switch(tagString) {
					case HEAD: head.show();break;
					case BODY: body.show();break;
					case FACE: face.show();break;
					case LEGS: legs.show();break;
					case ARMS: arms.show();break;
					case EYES: eyes.show();break;
					case MOUTH: mouth.show();break;
					//일단 두개만 넣었음
				}
			}
		}
	})

	$('#face').mousedown(function(e) {
		face.front();
	})

	$('#head').mousedown(function(e) {
		head.front();
	})

	$('#body').mousedown(function(e) {
		body.front();
	})

	$('#arms').mousedown(function(e) {
		arms.front();
	})

	$('#legs').mousedown(function(e) {
		legs.front();
	})

	$('#eyes').mousedown(function(e) {
		eyes.front();
	})

	$('#mouth').mousedown(function(e) {
		mouth.front();
	})

	$('#base').mousedown(function(e) {
		current.front();
	})

	$('#save').mousedown(function(e) {
		//encode_as_img_and_link();
		img_and_link();
	})

	$('#clear').mousedown(function(e) {
		clearCanvas();
	})

	$('#undo').mousedown(function() {
		undoDrawing();
	})

	$('#copy').mousedown(function() {
		copyDrawing();
	})

	$('#cut').mousedown(function () {
		cutDrawing();
	})

	$('#paste').mousedown(function () {
		pasteDrawing();
	})

	$('#resize').mousedown(function() {
		if(!scalable) {
			scalable = true;
			draggable = false;
		}
	})

	$('#vertical-flip').mousedown(function() {
		if(clickedObject != null) {
			clickedObject.flip('');
		}
	})

	$('#horizontal-flip').mousedown(function() {
		if(clickedObject != null) {
			clickedObject.flip('x');
		}
	})

	$('#startAnimation').mousedown(function() {
		if(clickedObject != null) {
			var _dx = document.getElementById("animationDX").value;
			var _dy = document.getElementById("animationDY").value;
			var _angle = document.getElementById("animationAngle").value;
			var _time = document.getElementById("animationTime").value;
			_copyClickedObject = clickedObject.clone().hide();
			drawings.push(_copyClickedObject);
			//console.log("dx "+_dx+", dy "+_dy+", angle "+_angle+", time "+_time);
			startAnimation(_dx, _dy, _angle, _time);
		}
	})

	$('#stopAnimation').mousedown(function() {
		if(clickedObject != null) {
			clickedObject.remove();
			clickedObject = _copyClickedObject.show();
		}
	})
}

function startAnimation(dx, dy, angle, time) {
	var _box = clickedObject.bbox();
	deleteBoundingBox();
	//console.log("dx "+(_box.x+(dx*1))+", dy "+(_box.y+(dy*1))+", angle "+angle+", time "+time);
	clickedObject.animate(time*1000, '<>').move(_box.x+(dx*1), _box.y+(dy*1)).rotate(angle);

	setTimeout(function() {
		clickedObject.hide();
		clickedObject = _copyClickedObject.show();
		var _box = _copyClickedObject.rbox();
		drawBoundingBox(_box, _copyClickedObject.transform('rotation'));
	}, time*1000);
}

function makeScalable() {
	var _box = clickedObject.rbox();
	var heightError = (window.innerHeight - 200) * 0.103 + 50;
	var widthError = (window.innerWidth - 350) * 0.05 + 100;
	var _boxX = _box.x - widthError;
	var _boxY = _box.y - heightError;

	var cursor1 = draw.rect(5,5).move(_boxX + _box.width + 5, _boxY+ _box.height + 2).fill('#b2305c')
			.stroke({color: "#b2305c", width: 2})
	var cursor2 = draw.rect(5,5).move(_boxX + _box.width + 5, _boxY - 10).fill('#b2305c')
			.stroke({color: "#b2305c", width: 2})
	var cursor3 = draw.rect(5,5).move(_boxX - 10, _boxY+ _box.height + 2).fill('#b2305c')
			.stroke({color: "#b2305c", width: 2})
	var cursor4 = draw.rect(5,5).move(_boxX - 10, _boxY -10).fill('#b2305c')
			.stroke({color: "#b2305c", width: 2})

	draggableCursor1(cursor1, cursor2, cursor3, cursor4);
	draggableCursor2(cursor2, cursor1, cursor3, cursor4);
	draggableCursor3(cursor3, cursor1, cursor2, cursor4);
	draggableCursor4(cursor4, cursor1, cursor2, cursor3);

}

function img_and_link() {
 var svg = document.getElementById("svgDraw");

 //get svg source.
 var serializer = new XMLSerializer();
 var source = serializer.serializeToString(svg);
 saveSvgAsPng(document.getElementById('SvgjsSvg1006'), "myCharacter.png");

}

function img_and_link_with_other_name(name) {
 var svg = document.getElementById("svgDraw");

 //get svg source.
 var serializer = new XMLSerializer();
 var source = serializer.serializeToString(svg);
 var fileName = name+".png"
 saveSvgAsPng(document.getElementById('SvgjsSvg1006'), fileName);

}

function draggableCursor1(cursor, cursor2, cursor3, cursor4) {
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
		_box = clickedObject.rbox();//need to modify

		drawBoundingBox(_box, clickedObject.transform('rotation'));
		cursor.remove();
		svgClickX = null;
		svgClickY = null;
	})
}

function draggableCursor2(cursor, cursor2, cursor3, cursor4) {
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

		clickedObject.size(-deltaWidth + _box.width, deltaHeight+ _box.height)
		putObjectStatus();
	})

	cursor.draggable().on('dragend', function(event) {
		_box = clickedObject.rbox();//need to modify

		drawBoundingBox(_box, clickedObject.transform('rotation'));
		cursor.remove();
		svgClickX = null;
		svgClickY = null;
	})
}

function draggableCursor3(cursor, cursor2, cursor3, cursor4) {
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

		clickedObject.size(deltaWidth + _box.width, -deltaHeight+ _box.height)
		putObjectStatus();
	})

	cursor.draggable().on('dragend', function(event) {
		_box = clickedObject.rbox();//need to modify

		drawBoundingBox(_box, clickedObject.transform('rotation'));
		cursor.remove();
		svgClickX = null;
		svgClickY = null;
	})
}

function draggableCursor4(cursor, cursor2, cursor3, cursor4) {
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

		clickedObject.size(deltaWidth + _box.width, deltaHeight+ _box.height)
		putObjectStatus();
	})

	cursor.draggable().on('dragend', function(event) {
		_box = clickedObject.bbox();//need to modify

		drawBoundingBox(_box, clickedObject.transform('rotation'));
		cursor.remove();
		svgClickX = null;
		svgClickY = null;
	})
}

function modifyWidth(width) {
	if(clickedObject != null) {
		var _box = clickedObject.bbox();
		deleteBoundingBox();
		clickedObject.size(width, _box.height);
		_box = clickedObject.bbox();
		drawBoundingBox(_box, clickedObject.transform('rotation'));
		//drawBoundingBox(_box, clickedGroup.transform('rotation'));
		putObjectStatus();
	}
}

function modifyHeight(height) {
	if(clickedObject != null) {
		var _box = clickedObject.bbox();
		deleteBoundingBox();
		clickedObject.size(_box.width, height);
		_box = clickedObject.bbox();
		drawBoundingBox(_box, clickedObject.transform('rotation'));
		//drawBoundingBox(_box, clickedGroup.transform('rotation'));
		putObjectStatus();
	}
}

function modifyAngle(angle) {
	if(clickedObject != null) {
		deleteBoundingBox();
		clickedObject.rotate(angle);//
		drawBoundingBox(clickedObject.rbox(), angle);
		putObjectStatus();
	}
}

function modifyAngleWithAnimation(angle, time) {
	deleteBoundingBox();
	clickedObject.data('time', time);
	clickedObject.rotate(0).animate(time*1000, '<>').rotate(angle);//
	drawBoundingBox(clickedObject.rbox(), angle);
	putObjectStatus();
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

function putObjectStatus(){
	if(clickedObject != null) {
		var _box = clickedObject.bbox();
		var _planeColor = clickedObject.attr('fill');
		var _lineColor = clickedObject.attr('stroke');
		var _rotate = clickedObject.transform('rotation');
		//var _rotate = clickedGroup.transform('rotation');
		var _time = clickedObject.data('time');
		var _tag = clickedObject.data('tag');

		if(_time == null){
			_time = 0;
		}

		if(_tag == null){
			_tag = "default";
		}

		document.getElementById('itemWidth').value = _box.width;
		document.getElementById('itemHeight').value = _box.height;

		document.getElementById('itemX').value = _box.x;
		document.getElementById('itemY').value = _box.y;

		document.getElementById('planeColorText').value = _planeColor.substring(1,).toUpperCase();
		document.getElementById('lineColorText').value = _lineColor.substring(1,).toUpperCase();
		document.getElementById('planeColor').value = _planeColor;
		document.getElementById('lineColor').value = _lineColor;

		document.getElementById('itemAngle').value = _rotate;
		document.getElementById('itemTime').value = _time;

		document.getElementById('itemTag').textContent = _tag;
	}
}

function modifyXPosition(deltaX) {
	var _box = clickedObject.bbox();
	deleteBoundingBox();
	clickedObject.move(deltaX, _box.y);
	_box = clickedObject.bbox();
	drawBoundingBox(_box, clickedObject.transform('rotation'));
	//drawBoundingBox(_box, clickedGroup.transform('rotation'));
	putObjectStatus();
}

function modifyYPosition(deltaY) {
	var _box = clickedObject.bbox();
	deleteBoundingBox();
	clickedObject.move(_box.x, deltaY);
	_box = clickedObject.bbox();
	drawBoundingBox(_box, clickedObject.transform('rotation'));
	//drawBoundingBox(_box, clickedGroup.transform('rotation'));
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
		var _box = clickedObject.rbox();
		drawBoundingBox(_box, clickedObject.transform('rotation'));
		//drawBoundingBox(_box, clickedGroup.transform('rotation'));
	})
}

function makeGroupDraggable(thisGroup) {

	var _y = (window.innerHeight - 200) * 0.3 + 50;
	var _x = (window.innerWidth - 350) * 0.3 + 100;

	var cursor = draw.image('test/drag.png', 50, 50).move(_x, _y)

	cursor.draggable().on('dragstart', function(event) {
		if(clickedObject != null) {
			deleteBoundingBox();
		}
	})
	cursor.draggable().on('dragmove', function(event) {
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

		//var group = draw.selectAll('thisGroup')
		thisGroup.each(function(element) {
			console.log(this)
			var _box = this.bbox();
			this.move(_box.x - deltaWidth, _box.y - deltaHeight)
		})
	})

	cursor.draggable().on('dragend', function(event) {
		if(clickedObject != null){
			var _box = clickedObject.bbox();
			drawBoundingBox(_box, clickedObject.transform("rotation"))
			cursor.remove();
			svgClickX = null;
			svgClickY = null;
		}
	})
}

function drawBoundingBox(box, angle) {
	//clickedGroup = draw.group();

	var _box = clickedObject.rbox();
	var heightError = (window.innerHeight - 200) * 0.103 + 50;
	var widthError = (window.innerWidth - 350) * 0.05 + 100;
	var _boxX = _box.x - widthError;
	var _boxY = _box.y - heightError;
	var _clickedObjectBox = draw.rect(_box.width + 10, _box.height + 10).addClass('box')
	//.rotate(angle)
	.move(_boxX - 6, _boxY - 6).fill('none')
	.stroke({color:'#d597a1', width: 1});

	var leftUp = draw.rect(3, 3).addClass('box')
	.move(_boxX -10, _boxY - 10).fill('none')
	.stroke({color: '#000000', width: 1});

	var leftDown = draw.rect(3, 3).addClass('box')
	.move(_boxX - 10, _boxY + 2 + _box.height).fill('none')
	.stroke({color: '#000000', width: 1});

	var rightUp = draw.rect(3, 3).addClass('box')
	.move(_boxX + _box.width + 5, _boxY - 10).fill('none')
	.stroke({color: '#000000', width: 1});

	var rightDown = draw.rect(3, 3).addClass('box')
	.move(_boxX + _box.width + 5, _boxY + _box.height + 2).fill('none')
	.stroke({color: '#000000', width: 1});

	clickedObjectBox.push(_clickedObjectBox);                                                                                                                                               clickedObjectBox.push(_clickedObjectBox);
	clickedObjectBoxPoints.push(leftUp);
	clickedObjectBoxPoints.push(leftDown);
	clickedObjectBoxPoints.push(rightUp);
	clickedObjectBoxPoints.push(rightDown);
	/*
	clickedGroup.add(_clickedObjectBox);
	clickedGroup.add(clickedObject);
	clickedGroup.add(leftUp);
	clickedGroup.add(rightUp);
	clickedGroup.add(leftDown);
	clickedGroup.add(rightDown);
	clickedGroup.rotate(angle);*/
}

function deleteBoundingBox() {
	clickedObjectBox.forEach(function(element) {
		element.remove();
	});
	clickedObjectBoxPoints.forEach(function(element) {
		element.remove();
	})
}

function drawPolygon() {
	var poly = draw.polygon().fill('#fdffdb')
	.stroke({color: '#501726', width: 3}).draw();

	poly.on('drawstart', function(e){
		canDrawElement = true;
    document.addEventListener('keydown', function(e){
        if(e.keyCode == 13){
            poly.draw('done');
            poly.off('drawstart');
						drawingPolygon = false;
        }
      });
  });

  poly.on('drawstop', function(){
      // remove listener
  });
	drawings.push(poly);
}

function drawRect() {
	if(canDraw === CAN_DRAW_RECT){
		var rect = draw.rect().fill('#fdffdb')
		.stroke({ color: '#501726', width: 3});

		var drawingTest = draw.rect().fill('none').stroke({color: '#501726', width: 1}).draw();

		drawings.push(rect);
		console.log(drawings);
		var drawingNow = true;
		var _box;

		draw.on('mousedown', function(event) {
			canDrawElement = true;
			drawingTest.draw('point', event);
		});

		draw.on('mouseup', function(){
			drawingTest.draw(false);
			drawingTest.remove();
			if(drawingNow){
				var _box = drawingTest.bbox();
				rect.move(_box.x, _box.y);
				rect.size(_box.width, _box.height);
				drawingNow = false;
			}
		});
	}
}

function drawCircle() {
	if(canDraw === CAN_DRAW_CIRCLE) {
		var circle = draw.ellipse().fill('#fdffdb')
		.stroke({ color: '#501726', width: 3});

		var drawingTest = draw.rect().fill('none').stroke({color: '#501726', width: 1}).draw();

		drawings.push(circle);
		console.log(drawings);
		var drawingNow = true;
		var _box;

		draw.on('mousedown', function(event) {
			canDrawElement = true;
			drawingTest.draw('point', event);
		});

		draw.on('mouseup', function(){
			drawingTest.draw(false);
			drawingTest.remove();
			if(drawingNow){
				var _box = drawingTest.bbox();
				circle.move(_box.x + _box.width/2, _box.y + _box.height/2);
				circle.size(_box.width, _box.height);
				drawingNow = false;
			}
		});
		canDrawElement = true;
	}
}

/**
 *견본입니다
 */
function drawTest() {
	//var test = draw.circle().draw();
	var test = draw.path('M27.9,12.3c11.5-6.5,23.3-2.2,25.5-1.4c1.9,0.7,14.4,5.4,19.3,18.5c4.9,13,1.1,31.3-12.8,38.4,c-13,6.6-27.9-0.3-35.7-8.4c-8.8-9.1-13-24.1-7.2-35.8C20.4,16.6,26.3,13.2,27.9,12.3z')
	.fill('#fdffdb').stroke({color: '#501726', width: 3}).size(1,1);
	var drawingTest = draw.rect().fill('none').stroke({color: '#501726', width: 1}).draw();

	drawings.push(test);
	console.log(drawings);
	var drawingNow = true;
	var _box;

	draw.on('mousedown', function(event) {
		drawingTest.draw('point', event);
	});

	draw.on('mouseup', function(){
		drawingTest.draw(false);
		drawingTest.remove();
		if(drawingNow){
			var _box = drawingTest.bbox();
			test.move(_box.x, _box.y);
			test.size(_box.width, _box.height);
			drawingNow = false;
		}
	});
}

function drawObject(pathString) {
	//var test = draw.circle().draw();
	var object = draw.path(pathString)
	.fill('#fdffdb').stroke({color: '#501726', width: 3}).size(1,1);
	var drawingTest = draw.rect().fill('none').stroke({color: '#501726', width: 1}).draw();

	drawings.push(object);
	console.log(drawings);
	var drawingNow = true;
	var _box;

	draw.on('mousedown', function(event) {
		canDrawElement = true;
		drawingTest.draw('point', event);
	});

	draw.on('mouseup', function(){
		drawingTest.draw(false);
		drawingTest.remove();
		if(drawingNow){
			var _box = drawingTest.bbox();
			object.move(_box.x, _box.y);
			object.size(_box.width, _box.height);
			drawingNow = false;
		}
	});
}

function undoDrawing() {
	drawings.pop().data('tag', null).hide();
}

//for ctrl+c
function copyDrawing(){
	copiedObject = clickedObject.clone().hide();
}

//for ctrl+x
function cutDrawing(){
	copyDrawing();
	drawings.pop(clickedObject).hide();
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
		stop.at(0, '#FFFFFF')
		stop.at(1, '#0000000')
	})

	var gradient2 = draw.gradient('linear', function(stop) {
		stop.at(0, '#FFCC33')
		stop.at(0.5, '#F0F0F0')
		stop.at(1, '#FF99FF')
	})

	var gradient3 = draw.gradient('linear', function(stop) {
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

	var rect = draw.rect(180, 15).move(10, 0).fill(gradient)
	var rect2 = draw.rect(180, 15).move(10, 22).fill(gradient2)
	var rect3 = draw.rect(180, 50).move(10, 45).fill(gradient3)

	draw.circle(10).center(10, 110).fill(gradient3.colorAt(0))
	draw.circle(10).center(55, 110).fill(gradient3.colorAt(0.25))
	draw.circle(10).center(100, 110).fill(gradient3.colorAt(0.5))
	draw.circle(10).center(145, 110).fill(gradient3.colorAt(0.75))
	draw.circle(10).center(190, 110).fill(gradient3.colorAt(1))
}
