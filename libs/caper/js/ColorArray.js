(function(){
	
	window.ColorArray = function( instructions ){
		var array = _makeColorGradient( instructions );
		var colorCyclePos = 0;
		var colorReverse = false;
		var length = array.length;

		array.next = function(){
			var i;

			if(colorReverse){
				if (colorCyclePos === 0 ){
					i = 1;
					colorReverse = false;
				} else {
					i = -1;
					colorReverse = true;
				}
			} else {
				if(colorCyclePos === length-1){
					i = -1;
					colorReverse = true;
				} else{
					i = 1;
					colorReverse = false;
				}
			}
			return array[colorCyclePos+=i];
		};
		
		return array;
	};
	
	function _makeColorGradient( o ){

		// adapted from: http://www.krazydad.com/makecolors.php

		var frequencyR 	= o.frequencyR || .1,
			frequencyG	= o.frequencyG || .1,
			frequencyB	= o.frequencyB || .1,
			phaseR		= o.phaseR || .1,
			phaseG		= o.phaseG || .1,
			phaseB		= o.phaseB || .1,
			alpha		= o.alpha || .3,
			center		= o.center || 200,
			width		= o.width || /*127*/100,
			len			= o.len || 50,
			rainbow 	= [],

			red, grn, blu, i;

		for (i = 0; ++i < len;){
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

}());