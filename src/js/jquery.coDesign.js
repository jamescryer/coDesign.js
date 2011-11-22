(function($){

    var drawClients = {},
        writeClients = {},
        defaults = {
			brushes: $.coDesign.brushes,
			colors: $.coDesign.colors,
            color: '#b33',
            brushSize: 2,
            height: null,
            width: null,
            fullScreen: false,
            onDraw: function(){},
            onWrite: function(){},
			enableControls: true
        };

    $.fn['coDesign'] = function(opts, args){

        this.each(function(){
            
            var $this = $(this),
                options, width, height, canvas, position, timer, rainbow, textRenderer, textarea, defaultBrush, _private;

            if(typeof opts === 'string'){
                $this.trigger({
                    type:opts+'.rainbow',
                    options: args
                });
                return $this;
            }

            $this       = $(this);
            options     = $.extend({}, defaults, opts || {});
            width       = options.width || $this.width();
            height      = options.fullScreen ? $(window).height() : (options.height || $this.height());

            canvas      = $('<canvas tabindex="1" class="codesign-canvas" width="'+width+'" height="'+height+'" />').appendTo($this);
            
			if(!canvas.get(0).getContext || !canvas.get(0).getContext("2d")){
				alert('coDesign.js will not work for you.  Your browser does not support HTML5 canvas.  Please consider upgrading your browser.');
				return false;
		   }
			
            position    = $this.position();
			
			defaultBrush = getDefault(options.brushes);

           var lines = [];
           var offset = canvas.offset();

            _private = {
                
                init: function(){
					
					var context = canvas.get(0).getContext("2d");
					context.fillStyle = '#fff';
					context.fillRect(0,0,width,height);
					
					canvas.mousedown(function(e){e.preventDefault();});
					
                    rainbow = new $.coDesign.CanvasDraw( {
                        canvas: canvas.get(0),
                        color  : options.color,
                        size  : options.brushSize,
                        brush : $.extend({}, defaultBrush ) || {} // use extend to create copy / dont use object reference
                    });
        
                    textRenderer = new $.coDesign.CanvasWrite({
                        canvas:canvas.get(0),
                        color: options.color
                    });

                    canvas.get(0).onkeypress = _private.textareaKeyUp;

                    if(options.enableControls){
						_private.enableControls();
                    }
					
                },
                
                textareaKeyUp: function( event ){
                    
                    var action,
                        charCode = event.which,
                        charStr = String.fromCharCode(charCode);

                    if(charCode === 8){
                        action = 'backspace';
                        textRenderer.backspace();
                    }
                    else
                    if(charCode === 13){
                        action = 'newline';
                        textRenderer.newline();
                    }
                    else {
                        action = 'complete';
                        textRenderer.draw(charStr);
                    }

                    options.onWrite({
                        'action': action,
                        'value': charStr,
                        'color': textRenderer.color
                    });
                },
                
                enableControls: function(){
                    
                    new $.coDesign.CanvasControl({
						canvas:canvas.get(0),
                        brushes: options.brushes,
                        colors: options.colors,
                        painter: rainbow,
                        writer: textRenderer,
                        $context: $this,
                        defaultColor: options.color,
						defaultBrush: defaultBrush
                    });
                    
                },

                mouseUp: function( event ){
                    
                    var top = event.clientY + window.pageYOffset - position.top,
                        left = event.clientX + window.pageXOffset - position.left;

                    event.preventDefault();

                    textRenderer
                        .begin({
                            top: top,
                            left: left
                        });

                    options.onWrite({
                        'action': 'begin',
                        'top': top,
                        'left':  left,
                        'color': textRenderer.color
                    });

                    clearInterval(timer);
                    rainbow.complete();

                    options.onDraw({
                        type: 'push-paint',
                        action: 'complete'
                    });
                    
                },
                
                mouseDown: function( event ){
					
					var x = event.clientX + window.pageXOffset - position.left,
						y = event.clientY + window.pageYOffset - position.top;
					
                    event.preventDefault();

                    canvas.focus();

                    rainbow.begin();

                    options.onDraw({
                        'type': 'push-paint',
                        'action': 'begin'
                    });

                    timer = setInterval(function(){
                        rainbow
                            .draw({
                                x: x,
                                y: y
                            });

                        if(rainbow.brush && rainbow.color){
                            options.onDraw({
                                'action': 'incomplete',
                                'brush': rainbow.brush,
                                'color': rainbow.color,
                                'x': x,
                                'y': y
                            });
                        }

                    },300);
                },
                
                mouseMove: function( event ){
					
                    event.preventDefault();

					if(!rainbow.isActive) return;

					var x = event.clientX + window.pageXOffset - position.left,
						y = event.clientY + window.pageYOffset - position.top;
					
                    clearInterval(timer);
					
                    rainbow.draw({
                        x: x,
                        y: y
                    });

                    if(rainbow.isActive && rainbow.brush && rainbow.color){
                        options.onDraw({
                            'action': 'incomplete',
                            'brush': rainbow.brush,
                            'color': rainbow.color,
                            'x': x,
                            'y': y
                        });
                    }
                },

                touchUp: function( event ){
                    event.preventDefault();

                    rainbow.complete();

                    options.onDraw({
                        type: 'push-paint',
                        action: 'complete'
                    });
                },

                touchDown: function( event ){
                                       
                    event.preventDefault();

                    // for touch screens
                    $.each(event.touches, function(i, touch) {
                        var id = touch.identifier;
                        lines[id] = { 
                            x : this.pageX - offset.left, 
                            y : this.pageY - offset.top
                        };
                    });

                    canvas.focus();
                    rainbow.begin();
                    options.onDraw({
                        'type': 'push-paint',
                        'action': 'begin'
                    });
                },

                touchMove: function( event ){
                    
                    event.preventDefault();

                    if(!rainbow.isActive) return;
                    
                    $.each(event.touches, function(i, touch) {
                        var id = touch.identifier,
                            moveX = this.pageX - offset.left - lines[id].x,
                            moveY = this.pageY - offset.top - lines[id].y;

                        rainbow.draw({
                            x: lines[i].x,
                            y: lines[i].y
                        });

                        if(rainbow.isActive && rainbow.brush && rainbow.color){
                            options.onDraw({
                                'action': 'incomplete',
                                'brush': rainbow.brush,
                                'color': rainbow.color,
                                'x': x,
                                'y': y
                            });
                        }

                        lines[id].x = lines[i].x + moveX;
                        lines[id].y = lines[i].y + moveY;
                    });
                },
                
                paint: function( config ){
                    
                    var event = config.options,
                        action = event.action,
                        clientId = event.clientId,
                        client;

                    if (!action || !clientId) return;

                    client = writeClients[clientId];

                    if(!client){ client = writeClients[clientId] = new $.coDesign.CanvasDraw({canvas: canvas.get(0)}); }

                    if (action === 'begin'){ client.begin(event); }
                    else
                    if (action === 'complete'){ client.complete(); }
                    else
                    if (action === 'incomplete'){
                        client
                            .draw({
                                color: event.color,
                                x: event.x,
                                y: event.y,
                                brush: event.brush
                            });
                    }
                },
                
                write: function( config ){
                    var event = config.options,
                        action = event.action,
                        clientId = event.clientId,
                        client;

                    if (!action || !clientId) return;

                    client = drawClients[clientId];

                    if(!client){ client = drawClients[clientId] = new $.coDesign.CanvasWrite({canvas:canvas.get(0)}); }

                    if (action === 'begin'){
                        client.begin({
                            top: event.top,
                            left: event.left,
                            color: event.color
                        });
                    }
                    else
                    if (action === 'complete'){ client.draw(event.value); }
                    else
                    if (action === 'newline'){ client.newline(); }
                    else
                    if (action === 'backspace'){ client.backspace(); }
                }
            }

            _private.init();
            
			var mousedownistrue;
			
			$(document.body).
				bind('mousedown',function(){
					mousedownistrue = true;
				}).
				bind('mouseup', function(){
					mousedownistrue	 = false;
				});
			
			canvas.
				bind('mouseleave', function(event){
					_private.mouseUp(event);
				}).
				bind('mouseenter', function(event){
					// tabName check is a bit of hack
					if(mousedownistrue && ( !event.fromElement || event.fromElement.tagName !== 'BUTTON')) {
						_private.mouseDown(event);
					}
				}).
				bind('mouseup', _private.mouseUp ).
                bind('mousedown', _private.mouseDown ).
                bind('mousemove', _private.mouseMove );
			
            canvas.get(0).addEventListener('touchstart', _private.touchDown, false);
            canvas.get(0).addEventListener('touchmove', _private.touchMove , false);
            canvas.get(0).addEventListener('touchend', _private.touchUp , false);

            return $this.
                bind('paint.rainbow', _private.paint ).
                bind('write.rainbow', _private.write );
        });

    };

	function getDefault(object){
		var i;
		for(i in object){
			if(object.hasOwnProperty(i) && object[i]['default']){
				object[i].realName = i;
				return object[i];
			}
		}
	}

}(jQuery));