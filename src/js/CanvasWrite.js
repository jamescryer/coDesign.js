(function(){

	$.coDesign.CanvasWrite = function( options ){
		this.canvas = options.canvas;
		this.fontStyle = 'bold';
		this.fontSize = options.fontSize || 16; /*px*/
		this.fontFamily = 'sans-serif';
		this.baseline = 'top';
		this.color = options.color || '#fff';
		this.colorString = '#fff';
		this.align = 'left';
		this.top = 0;
		this.left = 0;
		this.lastCharacters = [];
	};

	function _getColor(color){
		var c;
		if (typeof color === 'string'){
			return color;
		} else {
			c = color.next();
			return "rgba("+c.r+","+c.g+","+c.b+",.8)"
		}
	}

	// public methods
	$.coDesign.CanvasWrite.prototype = {
		begin: function(opts){
			var context = this.canvas.getContext('2d');
			
			this.lastCharacters = [];
			this.top = opts.top;
			this.beginLeft = opts.left;
			this.left = opts.left;

			this.color = opts.color || this.color;
			
			if(typeof this.color === 'string'){
				this.colorString = this.color;
			} else {
				this.colorString = _getColor( this.color);
			}

			context.textBaseline = "middle";
			context.globalAlpha = .9;
		},

		draw: function(opts){
			var context = this.canvas.getContext('2d'),
				text = opts.value,
				width,
				imageData;
			
			context.font = this.fontStyle+ ' '+ ( opts.size || this.fontSize) + 'px ' + this.fontFamily;
			context.fillStyle = opts.color || _getColor(this.color);
			
			width = context.measureText(text).width;
			
			try {
				imageData = context.getImageData(this.left-1, this.top-(this.fontSize/2)-1, width+2, this.fontSize+2)	
			} catch(e){}

			this.lastCharacters.push({
				top: this.top-1,
				left: this.left-1,
				height: this.fontSize+2,
				width: width+1,
				imageData: imageData
				});

			this.colorString = context.fillStyle;
			
			context.fillText(text, this.left, this.top);
			
			this.left += width; // move to next character position
		},

		backspace: function(){
			var context = this.canvas.getContext('2d'),
				_char;

			if(this.lastCharacters.length === 0) return;

			_char = this.lastCharacters.pop();

			try{
				context.putImageData(_char.imageData, _char.left,_char.top-(_char.height/2));	
			}catch(e){}

			this.left -= _char.width;
		},

		newline: function(){
			this.top += this.fontSize;
			this.left = this.beginLeft;
		},

		updateColor: function(color){
			if(typeof color === 'string'){
				this.color = color;
			} else {
				this.color = new $.coDesign.ColorArray(color);
				this.colorString = _getColor( new $.coDesign.ColorArray(color) );
			}
		}
	};
}());