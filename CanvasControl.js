(function ($) {
	
	var view = ''
		+ '<div class="caper-control">'
		+ 	'<button id="caper-selected-brush" class="caper-brush-<%=defaultBrush%>"></button>'
		+	'<span class="group">'
		+ 		'<button id="caper-selected-size" class="caper-size-<%=defaultSize%>"></button>'
		+	'</span>'
		+	'<span class="group">'
		+ 		'<button id="caper-selected-color" class="caper-color-<%=defaultColor%>"></button>'
		+ 		'<button id="caper-selected-gradient" class="disabled"></button>'
		+ 		'<button data-name="eraser" id="eraser" class="caper-color-eraser last disabled"></button>'
		+	'</span>'
		+ 	'</div>'
		+ 	'<div class="caper-dropdown" id="caper-brushes" style="display:none">'
		+ 		'<% for (var i in brushes) { %>'
		+ 			'<% if(brushes.hasOwnProperty(i)) { %>'
		+				'<button data-name="<%=i%>" class="caper-brush-<%=i%>"><%=i%></button>'
		+ 			'<%} %>'
		+ 		'<%} %>'
		+ 	'</div>'
		+ 	'<div class="caper-dropdown" id="caper-colors" style="display:none">'
		+		'<div id="caper-color-picker">'
		+		'</div>'
		+ 	'</div>'
		+ 	'<div class="caper-dropdown" id="caper-gradient" style="display:none">'
		+ 		'<% for (var i in colors) { %>'
		+ 			'<% if(colors.hasOwnProperty(i)) { %>'
		+				'<button data-name="<%=i%>" class="caper-color-<%=i%>"><%=i%></button>'
		+ 			'<%} %>'
		+ 		'<%} %>'
		+ 	'</div>'
		+ 	'<div class="caper-dropdown" id="caper-sizes" style="display:none">'
		+			'<button data-value="1" class="caper-size-1">small</button>'
		+			'<button data-value="16" class="caper-size-16">medium</button>'
		+			'<button data-value="32" class="last caper-size-32">large</button>'
		+ 	'</div>'
		+ '</div>';
		
	var renderer = tmpl(view);

	window.CanvasControl = function( options ){

		this.painter = options.painter;
		this.writer = options.writer;
		this.brushes = options.brushes || {};
		this.colors = options.colors || {};
		this.sizes = options.sizes || [1,16,32];
		this.$context = options.$context;
		this.defaultColor = options.defaultColor || '#f00';

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
			defaultBrush: _.brushes.default.name || '',
			defaultColor: _.defaultColor.replace('#',''),
			defaultSize: 1,
			sizes: _.sizes
		});
		
		var $control = $(htmlString).appendTo(_.$context);
		
		$('body').click(function(){
			_.$brushDropdown.hide();
			_.$colorDropdown.hide();
			_.$sizeDropdown.hide();
		});
		
		_.$brushDropdown = $('#caper-brushes');
		_.$brushButton = $('#caper-selected-brush');
		
		_.$colorDropdown = $('#caper-colors');
		_.$colorButton = $('#caper-selected-color');
		
		_.$gradientDropdown = $('#caper-gradient');
		_.$gradientButton = $('#caper-selected-gradient');
		
		_.$sizeDropdown = $('#caper-sizes');
		_.$sizeButton = $('#caper-selected-size');
		
		bindDropdown(_.$brushDropdown, _.$brushButton);
		bindDropdown(_.$colorDropdown, _.$colorButton);
		bindDropdown(_.$gradientDropdown, _.$gradientButton);
		bindDropdown(_.$sizeDropdown, _.$sizeButton);
		
		_.$colorPicker = $('#caper-color-picker');
		
		_.$colorButton.css({
			backgroundColor: _.defaultColor
		});
		
		$.farbtastic(_.$colorPicker).
			setColor(_.defaultColor).
			linkTo(function(hex){
				selectColor(_, $control, _.$colorPicker, hex);
			});
		
		_.$gradientDropdown.
			find('button').
			click(function(){
				selectComplexColor(_, $control, $(this));
			});
		
		_.$brushDropdown.
			find('button').
			click(function(){
				selectBrush(_, $control, $(this));
			});
		
		_.$eraseButton = $('#eraser').
			click(function(){
				selectColor(_, $control, _.$eraseButton, '#fff');
				
				_.$gradientButton.addClass('disabled');
				_.$colorButton.addClass('disabled');
				_.$eraseButton.removeClass('disabled');
				
			});
		
		_.$sizeDropdown.
			find('button').
			click(function(){
				selectSize(_, $control, $(this));
			});
	}
	
	function bindDropdown($dropdown, $button){
		$button.
			bind('mouseup mousedown', function(e){e.stopPropagation();} ).
			click(
				function(e){
					var pos = $button.position();
					
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
						
		_.painter.setErase(false);
		_.painter.updateColor(hex);
		_.writer.updateColor(hex);
		
		//rmColorClass(_);
		
		_.$gradientButton.addClass('disabled');
		_.$colorButton.removeClass('disabled');
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
		_.$selectedColor = $button.addClass('active');
		
		_.$gradientButton.removeClass('disabled');
		_.$colorButton.addClass('disabled');
		_.$eraseButton.addClass('disabled');
		
		/*if(name === 'erase'){
			_.painter.setErase(true);
		} else {*/
			_.$gradientButton.
				/*css({
					backgroundColor: '#fff'
				}).*/
				addClass('caper-color-'+name);
				
			//_.painter.setErase(false);
			_.painter.updateColor(_.colors[name]);
		/*}*/
	}
	
	function rmColorClass(_){
		if(_.$selectedColor){
			_.$gradientButton.removeClass('caper-color-'+_.$selectedColor.data('name'));	
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