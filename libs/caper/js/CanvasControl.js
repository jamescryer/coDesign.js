(function ($) {
	
	var view = ''
		+ '<div class="caper-control">'
		+ 	'<button id="caper-selected-brush" title="Select a brush" class="caper-brush-<%=defaultBrush%>"></button>'
		+ 	'<button id="caper-selected-size" title="Choose a brush size" class="caper-size-<%=defaultSize%>"></button>'
		+ 	'<button id="caper-selected-color" title="What color would you like?"></button>'
		+ 	'<button data-name="eraser" id="eraser" title="Click to use eraser" class="caper-color-eraser last disabled"></button>'
		+ '</div>'
		+ '<div class="caper-dropdown" id="caper-brushes" style="display:none">'
		+ 	'<% for (var i in brushes) { %>'
		+ 		'<% if(brushes.hasOwnProperty(i)) { %>'
		+			'<button data-name="<%=i%>" class="caper-brush-<%=i%>"><%=i%></button>'
		+ 		'<%} %>'
		+ 	'<%} %>'
		+ '</div>'
		+ '<div class="caper-dropdown" id="caper-colors" style="display:none">'
		+	'<div class="caper-left-col">'
		+		'<div id="caper-color-picker"></div>'
		+		'<span class="caper-middle-text">or</span>'
		+	'</div>'
		+	'<div class="caper-right-col">'
		+ 		'<% for (var i in colors) { %>'
		+ 			'<% if(colors.hasOwnProperty(i)) { %>'
		+				'<button data-name="<%=i%>" class="caper-color-<%=i%>"><%=i%></button>'
		+ 			'<%} %>'
		+ 		'<%} %>'
		+	'</div>'
		+ '</div>'
		+ '<div class="caper-dropdown" id="caper-sizes" style="display:none">'
		+	'<button data-value="1" class="caper-size-1">small</button>'
		+		'<button data-value="16" class="caper-size-16">medium</button>'
		+		'<button data-value="32" class="last caper-size-32">large</button>'
		+ '</div>';
		
	var renderer = tmpl(view);

	window.CanvasControl = function( options ){

		this.painter = options.painter;
		this.writer = options.writer;
		this.brushes = options.brushes || {};
		this.colors = options.colors || {};
		this.sizes = options.sizes || [1,16,32];
		this.$context = options.$context;
		this.defaultColor = options.defaultColor || '#900';
		this.defaultBrush = options.defaultBrush || {};

		buildAndBind(this);
	};

	// public methods
	
	window.CanvasControl.prototype = {
		
	};

	// private methods
	
	function buildAndBind(_){

		var htmlString = renderer({
				brushes: _.brushes,
				colors: _.colors,
				defaultBrush: _.defaultBrush.name,
				defaultSize: 1,
				sizes: _.sizes
			});
		
		var $control = $(htmlString).appendTo(_.$context);
		
		$('body').mousedown(function(){
			_.$brushDropdown.hide();
			_.$colorDropdown.hide();
			_.$sizeDropdown.hide();
		});
		
		_.$brushDropdown = $('#caper-brushes');
		_.$brushButton = $('#caper-selected-brush');
		
		_.$colorDropdown = $('#caper-colors');
		_.$colorButton = $('#caper-selected-color');
				
		_.$sizeDropdown = $('#caper-sizes');
		_.$sizeButton = $('#caper-selected-size');
		
		bindDropdown(_.$brushDropdown, _.$brushButton, _);
		bindDropdown(_.$colorDropdown, _.$colorButton, _);
		bindDropdown(_.$sizeDropdown, _.$sizeButton, _);
		
		_.$colorPicker = $('#caper-color-picker');
		
		_.$colorButton.css({
			backgroundColor: _.defaultColor
		});
		
		_.currentColor = _.defaultColor;
		
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
		
		_.$eraseButton = $('#eraser').
			tipsy({gravity: 'sw'}).
			mousedown(function(){
				
				if(_.$eraseButton.hasClass('disabled')){
					_.painter.updateColor('#fff');
					_.$eraseButton.removeClass('disabled');
				} else {
					_.painter.updateColor(_.currentColor);
					_.$eraseButton.addClass('disabled');
				}
			});
		
		_.$sizeDropdown.
			find('button').
			mousedown(function(){
				selectSize(_, $control, $(this));
			});
	}
	
	function bindDropdown($dropdown, $button, _){
		$button.
			tipsy({gravity: 'sw'}).
			bind('mouseup mousedown', function(e){e.stopPropagation();} ).
			click(
				function(e){
					var pos = $button.position();
					
					if(_.$colorDropdown.get(0) !== $dropdown.get(0)) _.$colorDropdown.hide();
					if(_.$brushDropdown.get(0) !== $dropdown.get(0))_.$brushDropdown.hide();
					if(_.$sizeDropdown.get(0) !== $dropdown.get(0))_.$sizeDropdown.hide();
					
					$dropdown.
						/*css({
							top: pos.top + ($button.outerHeight()/1.5),
							left: pos.left + ($button.outerWidth()/1.5)
						}).*/
						toggle();

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
		_.$brushButton.addClass('caper-brush-'+name);	
        _.painter.updateBrush(_.brushes[name]);
	}
	
		
	function rmBrushClass(_){
		if(_.$selectedBrush){
			_.$brushButton.removeClass('caper-brush-'+_.$selectedBrush.data('name'));	
		}
	}
	
	function selectColor(_, $control, $button, hex){
		
		_.currentColor = hex;
		
		_.painter.updateColor(hex);
		_.writer.updateColor(hex);
		
		if(_.$selectedColor){
			_.$selectedColor.
				removeClass('active');
				
			rmColorClass(_);
		}
		
		//_.painter.setErase(false);
		
		_.$eraseButton.addClass('disabled');
		
		_.$colorButton.css({
			backgroundColor: hex
		});
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
					backgroundColor: '#fff'
				}).
				addClass('caper-color-'+name);
				
			//_.painter.setErase(false);
		
			_.currentColor = _.colors[name];
			_.painter.updateColor(_.currentColor);
		/*}*/
	}
	
	function rmColorClass(_){
		if(_.$selectedColor){
			_.$colorButton.removeClass('caper-color-'+_.$selectedColor.data('name'));	
		}
	}
	
	function selectSize(_, $control, $button){
		var value = $button.data('value');
		
		if(_.$selectedSize){
			_.$selectedSize.removeClass('active');
			_.$sizeButton.removeClass('caper-size-'+_.$selectedSize.data('value'));
		}
		
		_.$selectedSize = $button.addClass('active');
		_.$sizeButton.addClass('caper-size-'+value);
		
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