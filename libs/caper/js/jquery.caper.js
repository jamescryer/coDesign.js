(function($, CanvasDraw, CanvasWrite, CanvasControl){

    var drawClients = {},
        writeClients = {},
        defaults = {
			brushes: $.caper.brushes,
			colors: $.caper.colors,
            color: '#333',
            brushSize: 2,
            height: null,
            width: null,
            fullScreen: false,
            onDraw: function(){},
            onWrite: function(){},
			enableControls: true
        };

    $.fn.caper = function(opts, args){

        this.each(function(){
            
            var $this = $(this),
                options, width, height, canvas, position, timer, rainbow, textRenderer, textarea, _private;

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

            canvas      = $('<canvas style="position:absolute; background:#fff" width="'+width+'" height="'+height+'" />').appendTo($this);
            
            position    = $this.position();

            _private = {
                
                init: function(){
                    
                    rainbow = new CanvasDraw( {
                        canvas: canvas.get(0),
                        color  : options.color,
                        size  : options.brushSize,
                        brush : $.extend({},options.brushes.default) || {} // use extend to create copy / dont use object reference
                    });
        
                    textRenderer = new CanvasWrite({
                        canvas:canvas.get(0),
                        color: options.color
                    });
        
                    textarea = $('<textarea style="position:absolute;"></textarea>').prependTo($this);
        
                    textarea
                        .bind('keyup', _private.textareaKeyUp );
                    
                    if(options.enableControls){
						_private.enableControls();
                    }
					
                },
                
                textareaKeyUp: function( event ){
                    
                    var action;

                    if(event.keyCode === 8){
                        action = 'backspace';
                        textRenderer.backspace();
                    }
                    else
                    if(event.keyCode === 13){
                        action = 'newline';
                        textRenderer.newline();
                    }
                    else {
                        action = 'complete';
                        textRenderer.draw(this.value);
                    }

                    options.onWrite({
                        'action': action,
                        'value': this.value,
                        'color': textRenderer.color
                    });

                    this.value = '';
                },
                
                enableControls: function(){
                    
                    new CanvasControl({
                        brushes: options.brushes,
                        colors: options.colors,
                        painter: rainbow,
                        writer: textRenderer,
                        $context: $this,
                        defaultColor: options.color
                    });
                    
                },

                mouseUp: function( event ){
                    
                    var top = event.clientY + window.pageYOffset - position.top,
                        left = event.clientX + window.pageXOffset - position.left;

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

                    textarea.focus();

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

                    },100);
                },
                
                mouseMove: function( event ){
					
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
                
                paint: function( config ){
                    
                    var event = config.options,
                        action = event.action,
                        clientId = event.clientId,
                        client;

                    if (!action || !clientId) return;

                    client = writeClients[clientId];

                    if(!client){ client = writeClients[clientId] = new CanvasDraw({canvas: canvas.get(0)}); }

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

                    if(!client){ client = drawClients[clientId] = new CanvasWrite({canvas:canvas.get(0)}); }

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
            
            return $this
                .bind('mouseup', _private.mouseUp )
                .bind('paint.rainbow', _private.paint )
                .bind('write.rainbow', _private.write )
                .bind('mousedown', _private.mouseDown )
                .bind('mousemove', _private.mouseMove );
        });

    };

}(jQuery, CanvasDraw, CanvasWrite, CanvasControl));