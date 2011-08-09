(function($, CanvasDraw, CanvasWrite){

    var drawClients = {},
        writeClients = {},
        defaults = {
            color: '#000',
            brushSize: 2,
            height: null,
            width: null,
            fullScreen: false,
            onDraw: function(){},
            onWrite: function(){}
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
            canvas      = $('<canvas width="'+width+'" height="'+height+'" />').prependTo($this);
            position    = $this.offset();

            _private = {
                
                init: function(){
                    
                    rainbow = new CanvasDraw( {
                        canvas: canvas.get(0),
                        color  : options.color,
                        size  : options.brushSize,
                        brush : $.extend({},options.brushes.default) || {} // use extend to create copy / dont use object reference
                    });
        
                    textRenderer = new CanvasWrite({
                        canvas:canvas.get(0)
                    });
        
                    textarea = $('<textarea style="position: absolute; left: -10px; top: -10px; height:0px; width: 0px;"></textarea>')
                        .prependTo(document.body);
        
                    textarea
                        .bind('keyup', _private.textareaKeyUp );
                    
                    _private.enableControls();
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
                    
                    var controls = '';
                    
                    controls += '<div class="brushes option-group">';
                    $.each(options.brushes, function(name){
                        var active = (name == 'default' ? 'active': '');
                        controls +=  '<span class="'+active+' button" id="'+name+'" style="background-image: url('+this.image+')"></span>';
                    });
                    controls += '</div>';
                    
                    controls += ''
                            + '<div class="option-group">'
                            +   '<span class="button" id="erase" style="background-image: url()">'
                            +   '</span>'
                            + '</div>';
                    
                    controls += '<div class="colors last option-group">';
                    controls += ''
                        + '<span class="button active">'
                        +   '<input value="#f00" maxlength="7" class="miniColors" id="fgColor" autocomplete="off" type="hidden">'
                        + '</span>'
                    
                    $.each(options.colors, function(name){
                        controls +=  '<span class="button" id="'+name+'" style="background-image: url('+this.image+')"></span>';
                    });
                    
                    controls += ''
                            + '<div class="option-group">'
                            +   '<select id="size">'
                            +       '<option value="2">2</option>'
                            +       '<option value="4">4</option>'
                            +       '<option value="8">8</option>'
                            +       '<option value="16">16</option>'
                            +       '<option value="24">24</option>'
                            +       '<option value="32">32</option>'
                            +   '</select>'
                            + '</div>';                    
                    
                    controls = ''
                        + '<div id="caper-controls">'
                        + controls
                        + '</div>';
    
                    controls = $(controls);
    
                    $this.append(controls);
                    
                    _private.bindControlEvents(controls);
                    
                },
                
                bindControlEvents: function( $controls ){
                    
                    $controls.find('.miniColors').miniColors({
                        change: function(hex, rgb) {
                            $this.caper('color',hex); // this stinks - will fix later
                        }
                    });

                    $controls.find('.colors .button').click( _private.colorSelect );
                    $controls.find('.brushes .button').click( _private.brushSelect );
                    
                    $controls.find('#erase').click( _private.erase );
                    
                    $controls
                        .find('#size')
                        .bind('mouseup mousedown', function(){return false;} )
                        .change(function(){
                            var value = this.value;
                            rainbow.size = value;
                            rainbow.updateBrush({});
                        });
                },
                
                colorSelect: function( event ){

                    var $me = $(this);
                    
                    $me.siblings('.button').removeClass('active'); // super inefficient but im feeling lazy - fix later
                    $me.addClass('active');
                    
                    if(this.id === 'fgColor') return;
                    
                    $this.caper('color', options.colors[this.id] ); // this stinks - will fix later
                },
                
                brushSelect: function( event ){

                    var $me = $(this);
                    
                    $me.siblings('.button').removeClass('active'); // super inefficient but im feeling lazy - fix later
                    $me.addClass('active');
                    
                    console.log(options.brushes[this.id]);
                    
                    $this.caper('brush', options.brushes[this.id] ); // this stinks - will fix later
                },
                
                erase: function(){
                    var $me = $(this);
                    $me.toggleClass('active');
                    rainbow.setErase( $me.hasClass('active') );
                },
                
                mouseUp: function( event ){
                    
                    var top = event.clientY - position.top - document.body.scrollTop,
                        left = event.clientX - position.left - document.body.scrollLeft;

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
                    rainbow.begin();

                    options.onDraw({
                        'type': 'push-paint',
                        'action': 'begin'
                    });

                    timer = setInterval(function(){
                        rainbow
                            .draw({
                                x: event.clientX - position.left - document.body.scrollLeft,
                                y: event.clientY - position.top - document.body.scrollTop
                            });

                        if(rainbow.brush && rainbow.color){
                            options.onDraw({
                                'action': 'incomplete',
                                'brush': rainbow.brush,
                                'color': rainbow.color,
                                'x': event.clientX - position.left - document.body.scrollLeft,
                                'y': event.clientY - position.top - document.body.scrollTop
                            });
                        }

                    },50);
                },
                
                mouseMove: function( event ){
                    clearInterval(timer);
                    rainbow.draw({
                        x: event.clientX - position.left - document.body.scrollLeft,
                        y: event.clientY - position.top - document.body.scrollTop
                    });

                    if(rainbow.isActive && rainbow.brush && rainbow.color){
                        options.onDraw({
                            'action': 'incomplete',
                            'brush': rainbow.brush,
                            'color': rainbow.color,
                            'x': event.clientX - position.left - document.body.scrollLeft,
                            'y': event.clientY - position.top - document.body.scrollTop
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
                },
                
                applyColor: function( event ){
                    event.options = {color: event.options};
                    $.extend(options, event.options);
                    rainbow.updateColor(event.options);
                    if(typeof event.options.color === 'string'){
                        textRenderer.updateColor(event.options.color);
                    }
                },
                
                applyBrush: function( event ){
                    event.options = {brush: event.options};
                    $.extend(options, event.options);
                    rainbow.updateBrush(event.options);
                }

            }

            _private.init();
            
            return $this
                .bind('mouseup', _private.mouseUp )
                .bind('paint.rainbow', _private.paint )
                .bind('write.rainbow', _private.write )
                .bind('color.rainbow', _private.applyColor )
                .bind('brush.rainbow', _private.applyBrush )
                .bind('mousedown', _private.mouseDown )
                .bind('mousemove', _private.mouseMove );
        });
    };

}(jQuery, CanvasDraw, CanvasWrite ));