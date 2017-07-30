
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


var draw; //svg
var rect; //make stereotyped rect

var svgClickX = new Array();
var svgClickY = new Array();
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

/**
 * clear the canvas
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
		clicked = false;
		var _x = event.pageX - 100,
				_y = event.pageY - 80;
			 console.log('clicked the canvas ('
		 + _x + ', ' + _y + ' )');
		drawings.forEach(function(element) {
			console.log('the position of this element ('
			+ element.bbox().x + ", " + element.bbox().y + " )");
			if(element.inside(_x, _y)) {
				clicked = true;
				if(clickedObject != element && clickedObject != null) {
					deleteBoundingBox();
				}
				clickedObject = element;
				var _box = clickedObject.bbox();
				drawBoundingBox(_box);
				clickedObject.front();
			}
		});
		if(!clicked) {
			deleteBoundingBox();
		}
	}, false);

	$('#createRect').mousedown(function(e){
		drawRect();
	})

	$('#createCircle').mousedown(function(e) {
		drawCircle();
	})

}

function drawBoundingBox( box ) {
	var _box = box;
	var _clickedObjectBox = draw.rect(_box.width + 10, _box.height + 10).addClass('box')
	.move(_box.x - 5, _box.y - 5).fill('none')
	.stroke({color:'#d597a1', width: 1});

	var leftUp = draw.rect(3, 3).addClass('box')
	.move(_box.x - 7, _box.y - 7).fill('none')
	.stroke({color: '#ffffff', width: 2});

	var leftDown = draw.rect(3, 3).addClass('box')
	.move(_box.x - 7, _box.y + _box.height + 5).fill('none')
	.stroke({color: '#ffffff', width: 2});

	var rightUp = draw.rect(3, 3).addClass('box')
	.move(_box.x + _box.width + 5, _box.y - 7).fill('none')
	.stroke({color: '#ffffff', width: 2});

	var rightDown = draw.rect(3, 3).addClass('box')
	.move(_box.x + _box.width + 5, _box.y + _box.height + 5).fill('none')
	.stroke({color: '#ffffff', width: 2});

	clickedObjectBox.push(_clickedObjectBox);
	clickedObjectBoxPoints.push(leftUp);
	clickedObjectBoxPoints.push(leftDown);
	clickedObjectBoxPoints.push(rightUp);
	clickedObjectBoxPoints.push(rightDown);
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
	var rect = draw.rect().fill('#fdffdb')
	.stroke({ color: '#ffcf5c', width: 3}).draw();

	drawings.push(rect);
	console.log(drawings);

	draw.on('mousedown', function(event) {
		rect.draw('point', event);
	});

	draw.on('mouseup', function(){
	});
}

function drawCircle() {
	var circle = draw.circle().fill('#fdffdb')
	.stroke({ color: '#ffcf5c', width: 3}).draw();

	drawings.push(circle);
	console.log(drawings);

	draw.on('mousedown', function(event) {
		circle.draw('point', event);
	});

	draw.on('mouseup', function(){
	});
}

function drawPolygon() {
	draw = SVG('svgDraw');
	var polygon = draw.polygon().fill('#182673').draw();

	draw.on('keyon', function(){
		polygon.draw('done');
	})
}


//for ctrl+z
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
