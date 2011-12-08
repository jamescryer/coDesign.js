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

        return this.each(function(){
            
            var $this = $(this),
                timer, 
                canvasPainter, 
                textRenderer, 
                textarea,
                mousedownistrue,
                defaultBrush;

            if(typeof opts === 'string'){
                $this.trigger({
                    type:opts+'.codesign',
                    options: args
                });
                return true;
            }

            if( $.data(this, 'IsCoDesign') ){
                $this.trigger({
                    type:'update.codesign',
                    options: opts
                });
                return true;
            }

            var options     = $.extend({}, defaults, opts || {});
            var width       = options.width || $this.width();
            var height      = options.fullScreen ? $(window).height() : (options.height || $this.height());
            var canvas      = $('<canvas tabindex="1" class="codesign-canvas" width="'+width+'" height="'+height+'" />').appendTo($this);
            
			if(!canvas.get(0).getContext || !canvas.get(0).getContext("2d")){
				alert('coDesign.js will not work for you.  Your browser does not support HTML5 canvas.  Please consider upgrading your browser.');
				return false;
            }
			
            var position    = $this.position();
            var lines = [];
            var offset = canvas.offset();

            var _private = {
                
                init: function(){
					
					var context = canvas.get(0).getContext("2d");
					context.fillStyle = '#fff';
					context.fillRect(0,0,width,height);
					
					canvas.mousedown(function(e){e.preventDefault();});
					
                    defaultBrush = _private.getDefault(options.brushes);

                    canvasPainter = new $.coDesign.CanvasDraw( {
                        canvas: canvas.get(0),
                        color  : options.color,
                        size  : options.brushSize,
                        brush : $.extend({}, defaultBrush ) || {} // use extend to create copy / dont use object reference
                    });
        
                    textRenderer = new $.coDesign.CanvasWrite({
                        canvas:canvas.get(0),
                        color: options.color
                    });

                    if(options.enableControls){
						_private.enableControls();
                    }

                    _private.bindCoDesignEvents();

                    $.data($this.get(0), 'IsCoDesign', true);
                },
                
                keypress: function( event ){
                    
                    var action,
                        charCode = event.which,
                        charStr = String.fromCharCode(charCode);

                    if(charCode === 8){
                        return false;
                    }
                    else
                    if(charCode === 13){
                        action = 'newline';
                        textRenderer.newline();
                    }
                    else {
                        action = 'complete';
                        textRenderer.draw({
                            value: charStr
                        });
                    }

                    options.onWrite({
                        'action': action,
                        'value': charStr,
                        'color': textRenderer.colorString,
                        'size': textRenderer.fontSize
                    });
                },

                backspace: function( event ){
                    var action,
                        charCode = event.which,
                        charStr = String.fromCharCode(charCode);

                    if(charCode === 8){
                        action = 'backspace';
                        textRenderer.backspace();
                        options.onWrite({
                            'action': action,
                            'value': charStr,
                            'color': textRenderer.colorString,
                            'size': textRenderer.fontSize
                        });
                        event.preventDefault();
                        return false;
                    }
                },

                enableControls: function(){
                    
                    new $.coDesign.CanvasControl({
						canvas:canvas.get(0),
                        brushes: options.brushes,
                        colors: options.colors,
                        painter: canvasPainter,
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
                        'color': textRenderer.colorString,
                        'size': textRenderer.fontSize
                    });

                    clearInterval(timer);
                    canvasPainter.complete();

                    options.onDraw({
                        action: 'complete'
                    });
                    
                },
                
                mouseDown: function( event ){
					
					var x = event.clientX + window.pageXOffset - position.left,
						y = event.clientY + window.pageYOffset - position.top;
					
                    event.preventDefault();

                    canvas.focus();

                    canvasPainter.begin();

                    options.onDraw({
                        'action': 'begin'
                    });

                    timer = setInterval(function(){
                        canvasPainter
                            .draw({
                                x: x,
                                y: y
                            });

                        if(canvasPainter.brush && canvasPainter.color){
                            options.onDraw({
                                'action': 'incomplete',
                                'brush': canvasPainter.brush,
                                'color': canvasPainter.color,
                                'left': x,
                                'top': y
                            });
                        }

                    },300);
                },
                
                mouseMove: function( event ){
					
                    event.preventDefault();

					if(!canvasPainter.isActive) return;

					var x = event.clientX + window.pageXOffset - position.left,
						y = event.clientY + window.pageYOffset - position.top;
					
                    clearInterval(timer);
					
                    canvasPainter.draw({
                        x: x,
                        y: y
                    });

                    if(canvasPainter.isActive && canvasPainter.brush && canvasPainter.color){
                        options.onDraw({
                            'action': 'incomplete',
                            'brush': canvasPainter.brush,
                            'color': canvasPainter.color,
                            'left': x,
                            'top': y
                        });
                    }
                },

                touchUp: function( event ){
                    event.preventDefault();

                    canvasPainter.complete();

                    options.onDraw({
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
                    canvasPainter.begin();
                    options.onDraw({
                        'action': 'begin'
                    });
                },

                touchMove: function( event ){
                    
                    event.preventDefault();

                    if(!canvasPainter.isActive) return;
                    
                    $.each(event.touches, function(i, touch) {
                        var id = touch.identifier,
                            moveX = this.pageX - offset.left - lines[id].x,
                            moveY = this.pageY - offset.top - lines[id].y;

                        canvasPainter.draw({
                            x: lines[i].x,
                            y: lines[i].y
                        });

                        if(canvasPainter.isActive && canvasPainter.brush && canvasPainter.color){
                            options.onDraw({
                                'action': 'incomplete',
                                'brush': canvasPainter.brush,
                                'color': canvasPainter.color,
                                'left': x,
                                'top': y
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
                                x: event.left,
                                y: event.top,
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
                            color: event.color,
                            size: event.size
                        });
                    }
                    else
                    if (action === 'complete'){ 
                        client.draw({
                            value: event.value,
                            color: event.color,
                            size: event.size
                        });
                     }
                    else
                    if (action === 'newline'){ client.newline(); }
                    else
                    if (action === 'backspace'){ client.backspace(); }
                },

                onBodyMouseDown : function(){
                    mousedownistrue = true;
                },

                onBodyMouseUp : function(){
                    mousedownistrue  = false;
                },
                
                destroy : function(){
                    $(document.body).
                        unbind('mousedown',_private.onBodyMouseDown).
                        unbind('mouseup', _private.onBodyMouseUp);

                    $this.empty(); // will unbind canvas events and remove element
                    
                    $this.
                        unbind('paint.codesign', _private.paint ).
                        unbind('write.codesign', _private.write ).
                        unbind('update.codesign', _private.update).
                        unbind('destroy.codesign', _private.destroy);

                    $.data(this, 'IsCoDesign', false);
                    delete _private;
                },

                update : function( event ){
                    $.extend(options, event.options || {});
                },

                clear : function(){
                    var cnv = canvas.get(0),
                        context = cnv.getContext('2d');

                    context.clearRect(0,0,cnv.width,cnv.height);
                },

                bindCoDesignEvents: function(){
                    var cnv = canvas.get(0);

                    $(document.body).
                        bind('mousedown',_private.onBodyMouseDown).
                        bind('mouseup', _private.onBodyMouseUp);
                    
                    canvas.
                        bind('mouseleave', function(event){
                            _private.mouseUp(event);
                        }).
                        bind('mouseenter', function(event){
                            if(mousedownistrue && ( !event.fromElement || event.fromElement.tagName !== 'BUTTON')) {
                                _private.mouseDown(event);
                            }
                        }).
                        bind('mouseup', _private.mouseUp ).
                        bind('mousedown', _private.mouseDown ).
                        bind('mousemove', _private.mouseMove );
                    
                    cnv.addEventListener('touchstart', _private.touchDown, false);
                    cnv.addEventListener('touchmove', _private.touchMove , false);
                    cnv.addEventListener('touchend', _private.touchUp , false);

                    cnv.addEventListener('keydown', _private.backspace, false);
                    cnv.addEventListener('keypress', _private.keypress , false);

                    $this.
                        bind('paint.codesign', _private.paint ).
                        bind('write.codesign', _private.write ).
                        bind('update.codesign', _private.update).
                        bind('destroy.codesign', _private.destroy).
                        bind('clear.codesign', _private.clear);
                },

                getDefault : function(object){
                    var i;
                    for(i in object){
                        if(object.hasOwnProperty(i) && object[i]['default']){
                            object[i].realName = i;
                            return object[i];
                        }
                    }
                }

            };

            _private.init();
        });
    };
}(jQuery));