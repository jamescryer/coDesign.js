(function(){

	window.CanvasWrite = function( options ){
		this.canvas = options.canvas;
		this.fontStyle = 'bold';
		this.fontSize = 22; /*px*/
		this.fontFamily = 'sans-serif';
		this.baseline = 'top';
		this.color = '#ffffff';
		this.align = 'left';
		this.top = 0;
		this.left = 0;
		this.lastCharacters = [];
	};

	// public methods
	window.CanvasWrite.prototype = {
		begin: function(opts){
			this.lastCharacters = [];
			this.top = opts.top;
			this.beginLeft = opts.left;
			this.left = opts.left;
			this.color = opts.color || this.color;
		},

		draw: function(text){
			var context = this.canvas.getContext('2d'),
				width = context.measureText(text).width;

			context.font = this.fontStyle+ ' '+ this.fontSize + 'px ' + this.fontFamily;
			context.fillStyle = this.color;
			context.fillText(text, this.left, this.top);
			context.textBaseline = "middle";

			this.lastCharacters.push({top: this.top, left: this.left, height: this.fontSize, width: width})
			this.left += width; // move to next character position
		},

		backspace: function(){
			var context = this.canvas.getContext('2d'),
				_char;

			if(this.lastCharacters.length === 0) return;

			_char = this.lastCharacters.pop();

			context.clearRect(_char.left,_char.top-(_char.height/2), _char.width, _char.height);

			this.left -= _char.width;
		},

		newline: function(){
			this.top += this.fontSize;
			this.left = this.beginLeft;
		},

		updateColor: function(color){
			this.color = color;
		}
	};

}());