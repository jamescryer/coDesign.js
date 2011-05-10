(function(){

	window.Rainbow = function( options ){

		this.canvas = options.canvas;
		this.colourOptions = options.colourOptions || {};
		this.brushOptions = options.brushOptions || {};

		this.colors = _makeColorGradient(this.colourOptions);
		this.colorsLength = this.colors.length;

		this.brushes = _makeBrushGradient(this.brushOptions);
		this.brushLength = this.brushes.length;
	};

	// public methods
	window.Rainbow.prototype = {

		isActive: false,
		points: [],
		colorCyclePos: 0,
		brushCyclePos: 0,
		brushReverse: false,
		colorReverse: false,

		begin: function(){
			this.isActive = true;
			return this;
		},

		complete: function(){
			this.isActive =  false;
			this.points = [];
			return this;
		},

		draw: function(position){
			var command, color, brush, size;

			if( !this.isActive ) return this;

			color = _getColor(this);
			brush = _getBrush(this);

			command = {
				x: position.x,
				y: position.y,
				color: color,
				brush: brush
			};

			_draw(this, command);
			return this;
		}
	};

	// private methods

	function _getColor( inst ){
		var i;
		if( inst.colorReverse ){
			if (inst.colorCyclePos === 0 ){
				i = 1;
				inst.colorReverse = false;
			} else {
				i = -1;
				inst.colorReverse = true;
			}
		} else {
			if(inst.colorCyclePos === inst.colorsLength){
				i = -1;
				inst.colorReverse = true;
			} else{
				i = 1;
				inst.colorReverse = false;
			}
		}
		return inst.colors[inst.colorCyclePos+=i];
	}

	function _getBrush( inst ){
		var i;
		if( inst.brushReverse ){
			if (inst.brushCyclePos === 0 ){
				i = 1;
				inst.brushReverse = false;
			} else {
				i = -1;
				inst.brushReverse = true;
			}
		} else {
			if(inst.brushCyclePos ===  inst.brushLength){
				i = -1;
				inst.brushReverse = true;
			} else{
				i = 1;
				inst.brushReverse = false;
			}
		}
		return inst.brushes[inst.brushCyclePos+=i];
	}

	function _makeColorGradient( options ){

		// adapted from: http://www.krazydad.com/makecolors.php

		var frequencyR 	= options.frequencyR || .1,
			frequencyG	= options.frequencyG || .1,
			frequencyB	= options.frequencyB || .1,
			phaseR		= options.phaseR || 0,
			phaseG		= options.phaseG || 2,
			phaseB		= options.phaseB || 4,
			alpha		= options.alpha || .2,
			center		= options.center || 128,
			width		= options.width || 127,
			len			= options.len || 50,
			rainbow 	= [],

			red, grn, blu;

		for (var i = 0; i < len; ++i)
		{
			red = Math.sin(frequencyR*i + phaseR) * width + center;
			grn = Math.sin(frequencyG*i + phaseG) * width + center;
			blu = Math.sin(frequencyB*i + phaseB) * width + center;
			rainbow.push({
				r: Math.floor(red),
				g: Math.floor(grn),
				b: Math.floor(blu),
				a: alpha
			});
		}

		return rainbow;
	}

	function _makeBrushGradient( options ){

		var i = 0,
			frequencyR			= options.radialWave || .5,
			frequencyP			= options.pressureWave || .3,
			len					= options.len || 5,
			spin				= options.spin || 20/360,
			points				= options.points || 8,
			layers 				= options.layers || 3,
			radiusAmplitude		= options.maxSize || 8,
			radiusCenter		= options.minSize || 5,
			pressureAmplitude	= options.maxPressure || 5,
			pressureCenter		= options.minPressure || 2,
			brush 				= [],

			layers, radius, pressure;

		for (; i < len; ++i)
		{
			radius = Math.sin(frequencyR*i) * radiusAmplitude + radiusCenter;
			pressure = Math.sin(frequencyP*i) * pressureAmplitude + pressureCenter;

			brush.push({
				layers : layers,
				pointsPerLayer: points,
				lineWidth: pressure,
				size: radius,
				spin: spin,
				width: options.width || radius,
				height: options.height || radius
			});
		}

		return brush;
	}

	function _draw( inst, command ){

		// adapted from: http://www.pixelwit.com/blog/2007/06/basic-circle-drawing-actionscript/

		var context 			= inst.canvas.getContext('2d'),
			centerX 			= command.x,
			centerY 			= command.y,
			radius 				= command.brush.size,
			sides 				= command.brush.pointsPerLayer,
			layers 				= command.brush.layers,
			incrementRadiusBy 	= Math.round(radius/layers);

		context.lineWidth = command.brush.lineWidth;
		context.strokeStyle = "rgba("+command.color.r+","+command.color.g+","+command.color.b+","+command.color.a+")";

		radius += incrementRadiusBy;

		do{
			_drawOval({
				centerX:centerX,
				centerY:centerY,
				radiusX: command.brush.width,
				radiusY: command.brush.height,
				spin:command.brush.spin,
				steps:sides,
				layers:layers,
				drawMethod: function(i, xx, yy){

					context.beginPath();

					if(!inst.points[layers]) inst.points[layers] = [];

					if( !inst.points[layers][i] ){
						context.moveTo( xx, yy );
					}
					else {
						context.moveTo(inst.points[layers][i].x, inst.points[layers][i].y);
					}

					inst.points[layers][i] = {
						x: xx,
						y: yy
					};

					context.lineTo(xx, yy);
					context.stroke();
				}
			});

			radius -= incrementRadiusBy;
			layers--;
		} while(radius>=incrementRadiusBy )

	};

	function _drawOval(options) {
		var centerX 		= options.centerX,
			centerY 		= options.centerY,
			radiusX 		= options.radiusX,
			radiusY 		= options.radiusY,
			spin 			= options.spin,
			steps 			= options.steps,
			layers 			= options.layers,
			drawMethod 		= options.drawMethod,
			i,
			radian,
			radianSin,
			radianCos,
			arrayOfPoints 	= [],
			spinRadians 	= spin * 2 * Math.PI,
			spinSin 		= Math.sin(spinRadians),
			spinCos 		= Math.cos(spinRadians),
			xx 				= centerX + spinCos * radiusX,
			yy 				= centerY + spinSin * radiusX;

		for (i=1; i<=steps; i++) {
			radian = i/steps * 2 * Math.PI;
			radianSin = Math.sin(radian);
			radianCos = Math.cos(radian);

			xx = centerX+(radiusX*radianCos*spinCos-radiusY*radianSin*spinSin);
			yy = centerY+(radiusX*radianCos*spinSin+radiusY*radianSin*spinCos);

			drawMethod(i, xx,yy);
		}
	};

})();