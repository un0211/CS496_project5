
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



var clickedObject;
var draw; //svg
var rect; //make stereotyped rect

var svgClickX = new Array();
var svgClickY = new Array();
var svgClickColor = new Array();
var svgClickTool = new Array();
var svgClickSize = new Array();
var svgClickDrag = new Array();
var clickedObject;

var drawings = new Array(); //save drawings. 최근부터 리턴(stack), 저장하면 초기화

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

	console.log('why not logging?');
	draw.on('mousedown', function(event){
		var _x = event.pageX - 100,
				_y = event.pageY - 80;
			 console.log('clicked the canvas ('
		 + _x + ', ' + _y + ' )');
				elements.forEach(function(element) {
					console.log('the position of this element ('
					+ element.bbox().x + ", " + element.bbox().y + " )");
					if(element.inside(_x, _y)) {
						clickedObject = element;
						console.log('clicked this element' + element.bbox().x);
					}
				});
	}, false);

	$('#createRect').mousedown(function(e){
		drawRect();
	})

	$('#createCircle').mousedown(function(e) {
		drawCircle();
	})

}

function drawRect() {
	var rect = draw.rect().fill('#182673')
	.stroke({ color: '#011011', width: 3}).draw();

	drawings.push(rect);
	console.log(drawings);

	draw.on('mousedown', function(event) {
		rect.draw('point', event);
	});

	draw.on('mouseup', function(){
	});
}

function drawCircle() {
	var circle = draw.circle().fill('#112233')
	.stroke({ color: '#011011', width: 3}).draw();

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