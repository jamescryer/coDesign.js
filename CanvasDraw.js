(function(){

	var id = 1;

	window.CanvasDraw = function( options ){
		this.id = id++;
		this.canvas = options.canvas;
		this.size = options.size;
		this.updateColor(options);
		this.updateBrush(options);
		this.isActive = false;
		this.erase = false;
		this.points = [];
	};

	// public methods
	window.CanvasDraw.prototype = {

		begin: function(options){
			this.isActive = true;
			return this;
		},

		complete: function(){
			this.isActive = false;
			this.points = [];
			return this;
		},

		draw: function(instructions){
			var command, color, brush, size;

			if( !this.isActive ) return this;

			if (this.erase) {
				this.canvas.getContext('2d').clearRect ( instructions.x-(this.size/2), instructions.y-(this.size/2), this.size, this.size );
				return this;
			}

			this.color = color = instructions.color || _getColor(this);
			brush = instructions.brush || _getBrush(this);

			command = {
				x: instructions.x,
				y: instructions.y,
				color: color,
				brush: brush
			};

			this.brush = brush;

			_draw(this, command);
			return this;
		},

		updateColor: function(options){
			if( typeof this.options === 'string'){
				this.colorOptions = {};
				this.color = this.options;
				this.colors = null;
			} else {
				this.colorOptions = options || {};
				this.colors = _makeColorGradient(this.colorOptions);
				this.colorsLength = this.colors.length;
			}

			this.colorCyclePos = 0;
			this.colorReverse = false;
		},

		updateBrush: function(options){
			var i;
			
			options = options || {};
			
			if( !this.brushOptions ){
				this.brushOptions = options;
			} else {
				for (i in options){
					if(options.hasOwnProperty(i)){
						this.brushOptions[i] = options[i] || this.brushOptions[i];
					}
				}
			}

			this.brushes = _makeBrushGradient(this.brushOptions, this.size);
			this.brushLength = this.brushes.length;

			this.brushCyclePos = 0;
			this.brushReverse = false;
		},
		
		setErase: function(bool){
			this.erase = bool === void 0 ? true : bool;
		}
	};

	// private methods

	function _getColor( inst ){
		var i;

		if(!inst.colors){
			return inst.color;
		}

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
			if(inst.brushCyclePos === inst.brushLength){
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
			phaseR		= options.phaseR || .1,
			phaseG		= options.phaseG || .1,
			phaseB		= options.phaseB || .1,
			alpha		= options.alpha || .3,
			center		= options.center || 200,
			width		= options.width || /*127*/100,
			len		= options.len || 50,
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

	function _makeBrushGradient( options, size){ // for waveyness

		var i = 0,
			frequencyR		= options.radialWave || .1,
			frequencyP		= options.pressureWave || .2,
			len			= options.len || 4,
			spin			= options.spin || 20/360,
			points			= options.points || 7,
			layers 			= options.layers || 4,
			radiusAmplitude		= size*(options.minSizeRatio||.5) || 10,
			radiusCenter		= Math.ceil(size*(options.minSizeRatio||.5)) || 6,
			pressureAmplitude	= options.maxPressure || 4,
			pressureCenter		= options.minPressure || 2,
			brush 			= [],

			layers, radius, pressure;

		for (; i < len; ++i){
			radius = Math.ceil(Math.sin(frequencyR*i) * radiusAmplitude + radiusCenter);
			pressure = Math.sin(frequencyP*i) * pressureAmplitude + pressureCenter;

			brush.push({
				layers : layers,
				pointsPerLayer: points,
				lineWidth: pressure,
				size: radius,
				spin: spin,
				widthRatio: options.widthRatio || 1,
				heightRatio: options.heightRatio || 1
			});
		}

		return brush;
	}

	function _draw( inst, command ){

		// adapted from: http://www.pixelwit.com/blog/2007/06/basic-circle-drawing-actionscript/

		if (!command.brush) return;
		if (!command.color) return;

		var context 			= inst.canvas.getContext('2d'),
			centerX 		= command.x,
			centerY 		= command.y,
			radius 			= command.brush.size,
			sides 			= command.brush.pointsPerLayer,
			layers 			= (command.brush.layers >= radius) ? radius : command.brush.layers,
			incrementRadiusBy 	= Math.floor(radius/layers) || 1;

		context.lineWidth = command.brush.lineWidth;
		context.strokeStyle = typeof command.color === 'string'
					? command.color
					: "rgba("+command.color.r+","+command.color.g+","+command.color.b+","+command.color.a+")";

		do{

			_drawOval({
				centerX:centerX,
				centerY:centerY,
				radiusX: radius * command.brush.heightRatio,
				radiusY: radius * command.brush.widthRatio,
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

		} while(layers)

	};

	function _drawOval(options) { // a rotated oval
		var centerX 		= options.centerX,
			centerY 	= options.centerY,
			radiusX 	= options.radiusX,
			radiusY 	= options.radiusY,
			spin 		= options.spin,
			steps 		= options.steps,
			drawMethod 	= options.drawMethod,
			i,
			radian,
			radianSin,
			radianCos,
			arrayOfPoints 	= [],
			spinRadians 	= spin * 2 * Math.PI,
			spinSin 	= Math.sin(spinRadians),
			spinCos 	= Math.cos(spinRadians),
			xx 		= centerX + spinCos * radiusX,
			yy 		= centerY + spinSin * radiusX;

		for (i=1; i<=steps; i++) {
			radian = i/steps * 2 * Math.PI;
			radianSin = Math.sin(radian);
			radianCos = Math.cos(radian);

			xx = centerX+(radiusX*radianCos*spinCos-radiusY*radianSin*spinSin);
			yy = centerY+(radiusX*radianCos*spinSin+radiusY*radianSin*spinCos);

			drawMethod(i, xx, yy);
		}
	};

}());