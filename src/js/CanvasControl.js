(function ($) {
	
	var view = ''
		+ '<div class="codesign-modal" id="codesign-modal" style="display:none;"></div>'
		+ '<div class="codesign-control">'
		+ 	'<button data-name="save" id="codesign-save-button" title="Open in new window as image" class="codesign-save last"></button>'
		+ 	'<button id="codesign-selected-size" title="Choose a brush size" class="codesign-size-<%=defaultSize%>"></button>'
		+ 	'<button id="codesign-selected-brush" title="Select a brush" class="codesign-brush-<%=defaultBrush%>"></button>'
		+ 	'<button id="codesign-selected-color" title="What color would you like?"></button>'
		//+ 	'<button data-name="eraser" id="codesign-eraser" title="Click to use eraser" class="codesign-eraser disabled"></button>'
		+ '</div>'
		+ '<div class="codesign-dropdown" id="codesign-brushes" style="display:none">'
		+ 	'<% for (var i in brushes) { %>'
		+ 		'<% if(brushes.hasOwnProperty(i)) { %>'
		+			'<button data-name="<%=i%>" class="button"><span class="codesign-brush-<%=i%>">&nbsp;</span><%=brushes[i].name%></button>'
		+ 		'<%} %>'
		+ 	'<%} %>'
		+ '</div>'
		+ '<div class="codesign-dropdown" id="codesign-colors" style="display:none">'
		+	'<div class="codesign-left-col">'
		+		'<div id="codesign-color-picker"></div>'
		+		'<span class="codesign-middle-text">or</span>'
		+	'</div>'
		+	'<div class="codesign-right-col">'
		+ 		'<% for (var i in colors) { %>'
		+ 			'<% if(colors.hasOwnProperty(i)) { %>'
		+				'<button data-name="<%=i%>" class="button"><span class="codesign-color-<%=i%>">&nbsp;</span><%=colors[i].name%></button>'
		+ 			'<%} %>'
		+ 		'<%} %>'
		+	'</div>'
		+ '</div>'
		+ '<div class="codesign-dropdown" id="codesign-sizes" style="display:none">'
		+	'<button data-value="1" class="button"><span class="codesign-size-1">&nbsp;</span>Small</button>'
		+	'<button data-value="16" class="button"><span class="codesign-size-16">&nbsp;</span>Medium</button>'
		+	'<button data-value="32" class="button last"><span class="codesign-size-32">&nbsp;</span>Large</button>'
		+ '</div>'
		+ '<div class="codesign-dropdown" id="codesign-save" style="display:none">'
		+	'<div class="codesign-image">'
		+		'<img src="" id="codesign-image" />'
		+	'</div>'
		+	'<p class="codesign-save-message">To save, right click on the above image, and then select "Save Image As".</p>'
		+ '</div>';
		
	var renderer = tmpl(view);

	$.coDesign.CanvasControl = function( options ){

		this.painter = options.painter;
		this.writer = options.writer;
		this.brushes = options.brushes || {};
		this.colors = options.colors || {};
		this.sizes = options.sizes || [1,16,32];
		this.$context = options.$context;
		this.canvas = options.canvas;
		this.defaultColor = options.defaultColor || '#900';
		this.defaultBrush = options.defaultBrush || {};

		buildAndBind(this);
	};

	// public methods
	
	$.coDesign.CanvasControl.prototype = {
		
	};

	// private methods
	
	function buildAndBind(_){

		var htmlString = renderer({
				brushes: _.brushes,
				colors: _.colors,
				defaultBrush: _.defaultBrush.realName,
				defaultSize: 1,
				sizes: _.sizes
			});
		
		var $control = $(htmlString).appendTo(_.$context);
		
		$('body').mousedown(function(e){
			
			if(e.which !== 1) return true;
			
			_.$brushDropdown.hide();
			_.$colorDropdown.hide();
			_.$sizeDropdown.hide();
			_.$saveDropdown.hide();
			
			_.$modal.hide();	
		});
		
		_.$modal = $('#codesign-modal');
		
		_.$brushDropdown = $('#codesign-brushes');
		_.$brushButton = $('#codesign-selected-brush');
		
		_.$colorDropdown = $('#codesign-colors');
		_.$colorButton = $('#codesign-selected-color');
				
		_.$sizeDropdown = $('#codesign-sizes');
		_.$sizeButton = $('#codesign-selected-size');
		
		_.$saveDropdown = $('#codesign-save');
		_.$saveButton = $('#codesign-save-button');
		
		_.$image = $('#codesign-image');
		
		bindDropdown(_.$brushDropdown, _.$brushButton, _);
		bindDropdown(_.$colorDropdown, _.$colorButton, _);
		bindDropdown(_.$sizeDropdown, _.$sizeButton, _);
		bindDropdown(_.$saveDropdown, _.$saveButton, _);
		
		_.$colorPicker = $('#codesign-color-picker');
		
		_.$colorButton.css({
			borderColor: _.defaultColor
		});
		
		_.currentColor = _.defaultColor;
		_.currentBrush = _.currentBrush;
		
		$.farbtastic(_.$colorPicker).
			setColor(_.defaultColor).
			linkTo(function(hex){
				selectColor(_, $control, _.$colorPicker, hex);
			});
		
		_.$colorDropdown.
			find('button').
			mousedown(function(){
				selectComplexColor(_, $control, $(this));
			});
		
		_.$brushDropdown.
			find('button').
			mousedown(function(){
				selectBrush(_, $control, $(this));
			});
		
		_.$eraseButton = $('#codesign-eraser').
			tipsy({gravity: 'nw'}).
			mousedown(function(){
				
				if(_.$eraseButton.hasClass('disabled')){
					_.painter.updateColor('#fff');
					_.painter.updateBrush({
						len : 1,
						randomizePoints: false,
						randomizeSpin: false,
						spin: 45,
						points : 70,
						layers : 10,
						connectLines: true,
						pressure: {
							softness: 0
						}
					});
					_.$eraseButton.removeClass('disabled');
				} else {
					setCurrent(_);
				}
			});
		
		_.$saveButton.
			mousedown(function(){
				var data = _.canvas.toDataURL("image/jpeg");
				_.$image.attr('src', data);
			});
			
		_.$image.mousedown(function(e){return false;});
		
		_.$sizeDropdown.
			find('button').
			mousedown(function(){
				selectSize(_, $control, $(this));
			});
	}
	
	function bindDropdown($dropdown, $button, _){
		$button.
			tipsy({gravity: 'nw'}).
			bind('mouseup mousedown', function(e){e.stopPropagation();} ).
			click(
				function(e){
					var pos = $button.position();

					if(_.$colorDropdown.get(0) !== $dropdown.get(0)) _.$colorDropdown.hide();
					if(_.$brushDropdown.get(0) !== $dropdown.get(0)) _.$brushDropdown.hide();
					if(_.$sizeDropdown.get(0) !== $dropdown.get(0)) _.$sizeDropdown.hide();
					if(_.$saveDropdown.get(0) !== $dropdown.get(0)) _.$saveDropdown.hide();
					
					if($dropdown.css('display') === 'block'){
						_.$modal.hide();	
					} else {
						_.$modal.show();	
					}
					
					$dropdown.toggle();

					e.stopPropagation();
				});
	}
	
	function selectBrush(_, $control, $button){
		
		var name = $button.data('name');
		
		if(_.$selectedBrush){
			_.$selectedBrush.removeClass('active');
		}
		
		rmBrushClass(_);
		_.$selectedBrush = $button.addClass('active');
		_.$brushButton.addClass('codesign-brush-'+name);
		
		_.currentBrush = _.brushes[name];
        setCurrent(_);
	}
	
		
	function rmBrushClass(_){
		_.$brushButton.removeClass('codesign-brush-'+_.defaultBrush.realName);	
		if(_.$selectedBrush){
			_.$brushButton.removeClass('codesign-brush-'+_.$selectedBrush.data('name'));	
		}
	}
	
	function selectColor(_, $control, $button, hex){
		
		_.currentColor = hex;
		setCurrent(_);
		
		if(_.$selectedColor){
			_.$selectedColor.
				removeClass('active');
				
			rmColorClass(_);
		}
		
		//_.painter.setErase(false);
		
		_.$eraseButton.addClass('disabled');
		
		_.$colorButton.css({
			borderColor: hex
		});
	}
	
	function setCurrent(_){
		_.$eraseButton.addClass('disabled');
		_.painter.updateColor(_.currentColor);
		_.writer.updateColor(_.currentColor);
		_.painter.updateBrush(_.currentBrush);
	}
	
	function selectComplexColor(_, $control, $button){
		
		var name = $button.data('name');
		
		if(_.$selectedColor){
			_.$selectedColor.
				removeClass('active');
				
			rmColorClass(_);
		}
		
		//_.painter.setErase(false);
		
		_.$selectedColor = $button.addClass('active');
		
		_.$colorButton.removeClass('disabled');
		_.$eraseButton.addClass('disabled');
		
		/*if(name === 'erase'){
			_.painter.setErase(true);
		} else {*/
			_.$colorButton.
				css({
					borderColor: 'transparent'
				}).
				addClass('codesign-color-'+name);
				
			//_.painter.setErase(false);
		
			_.currentColor = _.colors[name];
			setCurrent(_);
		/*}*/
	}
	
	function rmColorClass(_){
		if(_.$selectedColor){
			_.$colorButton.removeClass('codesign-color-'+_.$selectedColor.data('name'));	
		}
	}
	
	function selectSize(_, $control, $button){
		var value = $button.data('value');
		
		if(_.$selectedSize){
			_.$selectedSize.removeClass('active');
			_.$sizeButton.removeClass('codesign-size-'+_.$selectedSize.data('value'));
		}
		
		_.$selectedSize = $button.addClass('active');
		_.$sizeButton.addClass('codesign-size-'+value);
		
		_.writer.fontSize = value < 10 ? 16 : ( value < 20 ? 24 : ( value < 40 ? 32 : 48) );
		_.painter.size = value;
		_.painter.updateBrush();
	}
	
	// Simple JavaScript Templating
	// John Resig - http://ejohn.org/ - MIT Licensed
	var cache = {};
	function tmpl(str, data){
		// Figure out if we're getting a template, or if we need to
		// load the template - and be sure to cache the result.
		var fn = !/\W/.test(str) ?
			cache[str] = cache[str] ||
			tmpl(document.getElementById(str).innerHTML) :
		
		// Generate a reusable function that will serve as a template
		// generator (and which will be cached).
		new Function("obj",
			"var p=[],print=function(){p.push.apply(p,arguments);};" +
		
		// Introduce the data as local variables using with(){}
		"with(obj){p.push('" +
		
		// Convert the template into pure JavaScript
		str
			.replace(/[\r\t\n]/g, " ")
			.split("<%").join("\t")
			.replace(/((^|%>)[^\t]*)'/g, "$1\r")
			.replace(/\t=(.*?)%>/g, "',$1,'")
			.split("\t").join("');")
			.split("%>").join("p.push('")
			.split("\r").join("\\'")
			+ "');}return p.join('');");
		
		// Provide some basic currying to the user
		return data ? fn( data ) : fn;
	};
}(jQuery));