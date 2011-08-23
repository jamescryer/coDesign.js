(function ($) {
	
	var view = ''
		+ '<div class="caper-control">'
		+ 	'<button id="caper-selected-brush" class="caper-brush-<%=defaultBrush%>"></button>'
		+ 	'<button id="caper-selected-color" class="caper-color-<%=defaultColor%>"></button>'
		+ 	'<button id="caper-selected-size" class="caper-size-<%=defaultSize%>"></button>'
		+ 	'</div>'
		+ 	'<div class="caper-dropdown" id="caper-brushes" style="display:none">'
		+ 		'<% for (var i = 0, len = brushes.length; i++ < len;) { %>'
		+			'<button data-name="<%=brushes[i].name%>" class="caper-brush-<%=brushes[i].name%>"></button>'
		+ 		'<%} %>'
		+ 	'</div>'
		+ 	'<div class="caper-dropdown" id="caper-colors" style="display:none">'
		+		'<div id="caper-color-picker">'
		+		'</div>'
		+		'<button data-name="eraser" class="caper-color-eraser"></button>'
		+ 		'<% for (var i = 0, len = colors.length; i++ < len;) { %>'
		+			'<button data-name="<%=colors[i].name%>" class="caper-color-<%=colors[i].name%>"></button>'
		+ 		'<%} %>'
		+ 	'</div>'
		+ 	'<div class="caper-dropdown" id="caper-sizes" style="display:none">'
		+ 		'<% for (var i = 0, len = sizes.length; i++ < len;) { %>'
		+			'<button data-value="<%=sizes[i]%>" class="caper-size-<%=sizes[i]%>"></button>'
		+ 		'<%} %>'
		+ 	'</div>'
		+ '</div>';
		
	var renderer = tmpl(view);

	window.CanvasControl = function( options ){

		this.painter = options.painter;
		this.writer = options.writer;
		this.brushes = options.brushes || {};
		this.colors = options.colors || {};
		this.sizes = options.sizes || [1,3,5,8,16,32];
		this.$context = options.$context;

		buildAndBind(this);
	};

	// public methods
	
	window.CanvasControl.prototype = {
		
	};

	// private methods
	
	function buildAndBind(_){

console.log(_.colors);

		var htmlString = renderer({
			brushes: _.brushes,
			colors: _.colors,
			defaultBrush: _.brushes.default.name || '',
			defaultColor: '#f00'.replace('#',''),
			defaultSize: 2,
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
		
		_.$sizeDropdown = $('#caper-sizes');
		_.$sizeButton = $('#caper-selected-size');
		
		bindDropdown(_.$brushDropdown, _.$brushButton);
		bindDropdown(_.$colorDropdown, _.$colorButton);
		bindDropdown(_.$sizeDropdown, _.$sizeButton);
		
		_.$colorPicker = $('#caper-color-picker');
		
		_.$colorButton.css({
			backgroundColor: '#f00'
		});
		
		$.farbtastic(_.$colorPicker).
			setColor('#f00').
			linkTo(function(hex){
				
				_.painter.setErase(false);
				_.painter.updateColor(hex);
				_.writer.updateColor(hex);
				
				_.$colorButton.css({
					backgroundColor: hex
				});
				
			});
		
		_.$colorDropdown.
			find('button').
			click(function(){
				selectColor(_, $control, $(this));
			});
		
		_.$brushDropdown.
			find('button').
			click(function(){
				selectBrush(_, $control, $(this));
			});
		
		_.$eraseButton = $('#erase').
			click(function(){
				erase(_, $control, _.$eraseButton);
			});
		
		_.$sizeDropdown.
			find('button').
			click(function(){
				selectSize(_, $control, _.$size);
			});
	}
	
	function bindDropdown($dropdown, $button){
		$dropdown.click(function(e){e.stopPropagation();});
		$button.
			bind('mouseup mousedown', function(e){e.stopPropagation();} ).
			click(
				function(e){
					var pos = $button.position();
					
					$dropdown.
						css({
							top: pos.top+$button.height(),
							left: pos.left
						}).
						toggle();
						
					e.stopPropagation();
					
				});
	}
	
	function selectBrush(_, $control, $button){
		
		var name = $button.data('name');
		
		_.$selectedBrush.removeClass('active');
		_.$selectedBrush = $button.addClass('active');
        _.painter.updateBrush(_.brushes[name]);
	}
	
	function selectColor(_, $control, $button){
		
		var name = $button.data('name');
		
		_.$selectedColor.removeClass('active');
		_.$selectedColor = $button.addClass('active');
		
		if(name === 'erase'){
			_.painter.setErase(true);
		} else {
			_.painter.setErase(false);
			_.painter.updateColor(_.colors[name]);
		}
	}
	
	function selectSize(_, $control, $button){
		var value = $button.data('value');
		_.$selectedSize.removeClass('active');
		_.$selectedSize = $button.addClass('active');
		_.painter.size = value;
		_.painter.updateBrush({});
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