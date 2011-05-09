(function($, r){
    
    var defaults = {
        height: null,
        width: null,
        fullScreen: false
    };
    
    $.fn.rainbow = function(opts){

        this.each(function(){
            
            var $this = $(this),
                options = $.extend({}, defaults, opts),
                width = options.width || $this.width(),
                height = options.fullScreen ? $(window).height() : (options.height || $this.height()),
                canvas = $('<canvas width="'+width+'" height="'+height+'" />').appendTo($this),
                position = $this.offset(),
                timer,
                rainbow = new r( {
                    canvas: canvas.get(0)/*,
                    
                    colourOptions  : {
                        frequencyR: 0,
                        frequencyG: 0,
                        frequencyB: 0,
                        phaseR: 1,
                        phaseG: 0,
                        phaseB: 0,
                        alpha: 1,
                        center: 128,
                        width: 127,
                        len: 5
                    }*/
                    
                });
            
            return $this
                .bind('mouseup', function( event ){
                    clearInterval(timer);
                    rainbow.complete();
                })
                .bind('mousedown', function( event ){
                    rainbow.begin();
                        
                    timer = setInterval(function(){
                        rainbow
                            .draw({
                                x: event.clientX - position.left - document.body.scrollLeft,
                                y: event.clientY - position.top - document.body.scrollTop
                            });
                    },10);
                    
                })
                .bind('mousemove', function( event ){
                    clearInterval(timer);
                    rainbow.draw({
                        x: event.clientX - position.left - document.body.scrollLeft,
                        y: event.clientY - position.top - document.body.scrollTop
                    });
                });
        });
    };
    
})(jQuery, Rainbow);