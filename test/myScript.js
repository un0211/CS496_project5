var canvas;
var context;
var canvasWidth = 490;
var canvasHeight = 220;
var padding = 25;
var lineWidth = 8;
var colorPurple = "#cb3594";
var colorGreen = "#659b41";
var colorYellow = "#ffcf33";
var colorBrown = "#986928";
var clickX = new Array();
var clickY = new Array();
var clickColor = new Array();
var clickTool = new Array();
var clickSize = new Array();
var clickDrag = new Array();

var draw;
var rect;
var svgClickX = new Array();
var svgClickY = new Array();
var svgClickColor = new Array();
var svgClickTool = new Array();
var svgClickSize = new Array();
var svgClickDrag = new Array();

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




function drawSimpleSVG() {
	var draw = SVG('svgDraw')
	var rect = draw.rect().fill('#182673').draw();
	draw.on('mousedown', function(event) {
		rect.draw('point', event);
	});

	draw.on('mouseup', function(){
		rect.draw('done');
	});

/*
	var poly = draw.polyline().fill('none').draw()
						.stroke({color: '#1f3f3f', width:2});
	draw.on('mousedown', function(event){
		poly.draw('update', event);
	});
	draw.on('mouseup', function(){
		poly.draw('done');
	})*/
}
/**
 *this is for vector drawing
 */
function drawSVG()
{
	var draw = SVG('svgDraw')
	var rect = draw.rect(100, 100).fill('#754823').stroke({color: '#1f3f3f', width:2});

	svgClickX = new Array();
	svgClickY = new Array();
	svgClickDrag = new Array();
	var svgDraw;

	draw.mousedown(function(e){
	  var mouseX = e.pageX - this.offsetLeft;
	  var mouseY = e.pageY - this.offsetTop;

	  paint = true;
	  addClickSvg(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
	  redrawSvg();
	});

	draw.mousemove(function(e){
	  if(paint){
	    addClickSvg(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
	    redrawSvg();
	  }
	});

	draw.mouseup(function(e){
	  paint = false;
	});

	draw.mouseover(function(e){
	  paint = false;
	});

}

function addClickSvg(x, y, dragging)
{
  svgClickX.push(x);
  svgClickY.push(y);
  svgClickDrag.push(dragging);
}

function redrawSvg(){
  clearSvgCanvas();

  //draw.strokeStyle = "#df4b26";
  //draw.lineJoin = "round";
	var pointArray = new Array();

	for (var i = 0; i < svgClickX.length; i++) {
		var onePointArray = new Array();
		onePointArray[0] = svgClickX[i];
		onePointArray[1] = svgClickY[i];

		pointArray[i] = onePointArray;
	}
	draw.polyline(pointArray).fill('none').stroke({width:1})
	/*
  for(var i=0; i < svgClickX.length; i++) {
    draw.beginPath();
    if(clickDrag[i] && i){
      draw.moveTo(svgClickX[i-1], svgClickY[i-1]);
     }else{
       draw.moveTo(svgClickX[i]-1, svgClickY[i]);
     }
     draw.lineTo(svgClickX[i], svgClickY[i]);
     draw.closePath();
     draw.stroke();
  }*/
}
