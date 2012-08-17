/*!
 * responsiveCarousel
 * A responsive carousel that works in desktop browsers, ipad, iphone, and even
 * most Androids.  It uses css3 animations with a jquery animation fallback for
 * greater speed.  The code was optimized to minimize page reflows to further
 * enhance the overall speed.
 *
 * This is a jQuery UI Widget
 *
 * @version 0.2.0
 * @releaseDate 8/15/2012
 * @author Matthew Toledo
 * @url https://github.com/mrbinky3000/responsive_carousel
 * @requires jQuery, jQuery UI (only the Core and Widget Factory), modernizr (only css3 transitions test), hammer.js
 */
(function ( $, window, document, undefined ) {
    "use strict";
    var busy = false;



    $.widget( "ri.responsiveCarousel" , {

        //Options to be used as defaults
        options: {
            arrowLeft: '.arrow-left a',
            arrowRight: '.arrow-right a',
            target: '.slider-target',
            mask: '.slider-mask',
            unitElement: 'li',
            unitWidth: 'inherit',
            responsiveUnitSize: null,
            onRedraw: null,
            dragEvents: false,
			speed: 400,
			slideSpeed: 2500,
			step: -1,
			responsiveStep: null,
			onShift: null, 
            cssAnimations: Modernizr.csstransitions
        },

        // a place to store internal vars used only by this instance of the widget
        internal: {
			currentSlide: 0,
            left:0,
            targetWidth: 0,
            unitWidth: 0,
            targetOuterWidth: 0,
            targetOuterHeight: 0,
            targetParentOuterWidth: 0,
            targetParentInnerWidth: 0,
            targetParentOuterHeight: 0,
            targetParentMarginLeft: 0,
            targetBackupCopy: null,
            isArrowBeingClicked: false,
            arrowLeftVisible: true,  // when page first loads, both arrows are visible until _setArrowVisibility() called
            arrowRightVisible: true,
            targetLeft: 0,
            timer: null,
            firstMouseClick: false,
            prefix: null, 
			slideShowActive: false,
			slideTimer: null,
			slideBumped: false
        },

        // Execute a callback only after a series of events are done being triggered.
        // prevents runaway conditions (like during a window resize)
        wait: function () {
            var t, _d = function(callback, ms) {
                if ('undefined' !== typeof t) {
                    window.clearTimeout(t);
                }
                t = window.setTimeout(callback, ms);
            };
            return {
                thenDo : function(callback,ms) {
                    _d(callback,ms);
                }
            };
        },

        _getPrefix: function (prop) {
            var prefixes = ['Moz', 'Webkit', 'Khtml', '0', 'ms'],
                elem = document.createElement('div'),
                upper = prop.charAt(0).toUpperCase() + prop.slice(1),
                pref = "";

            for (var len = prefixes.length; len--;) {
                if ((prefixes[len] + upper) in elem.style) {
                    pref = (prefixes[len]);
                }
            }

            if (prop in elem.style) {
                pref = (prop);
            }

            return '-' + pref.toLowerCase() + '-';

        },


        /**
         * A proxy function that should be called to animate stuff instead of using jQuery's $.animate() function.
         * If the user's browser supports CSS3 Transitions, we use them since they are faster.  If they don't support
         * Transitions, we jQuery's default $.animate() method which is fast on newer computers, but slower on some
         * under-powered mobile devices.  $.animate() also causes page reflows, which we are trying to avoid.
         *
         * @todo CLEAN THIS UP!!!!  Copied from other sites on the web and hacked by me to fix a bug.  This is way
         * too convoluted.  Make it nicer.
         *
         * @param $target
         * @param props
         * @param speed
         * @param easing
         * @param callback
         * @return {*}
         * @private
         */
        _animate: function ($target, props, speed, easing, callback) {
            var options = this.options,
                internal = this.internal,
                animationOptions = speed && typeof speed === "object" ? $.extend({}, speed) : {
                    complete:callback || !callback && easing || $.isFunction(speed) && speed,
                    duration:speed,
                    easing:callback && easing || easing && !$.isFunction(easing) && easing
                };



            return $target.each(function () {
                var $this = $(this),
                    easing,
                    prefix = (internal.prefix);

                if (options.cssAnimations) {
                    easing = (animationOptions.easing) ? easing : 'ease-in-out'
                    $this.css(prefix + 'transition', 'all ' + speed / 1000 + 's ' + easing).css(props);
                    setTimeout(function () {
                        $this.css(prefix + 'transition', '');
                        if ($.isFunction(animationOptions.complete)) {
                            animationOptions.complete();
                        }
                    }, speed);
                } else {
                    animationOptions.easing = 'linear';
                    $this.animate(props,speed,easing,callback);
                    //$this.animate(props, speed, animationOptions);  // this is the original one, that never worked.
                }
            });
        },



        /**
         * Compute the new width for the target element (the element that holds all the things
         * that slide). Store the new width in our internal object.  Finally, assign the target
         * the new width.
         *
         * @param string caller Optional string used for debugging.
         * @return void
         * @private
         */
        _setTargetWidth: function(caller) {
            var internal = this.internal,
                options = this.options,
                $el = $(this.element),
                $target = $(this.element).find(options.target);

            internal.targetWidth =  $target.find(options.unitElement).length * internal.unitWidth;
            $el.find(options.target).width(internal.targetWidth);
            internal.targetOuterWidth = $target.outerWidth();
            internal.targetOuterHeight = $target.outerHeight();
            internal.targetParentOuterWidth = $target.parent().outerWidth();
            internal.targetParentInnerWidth = $target.parent().innerWidth();
            internal.targetParentOuterHeight= $target.parent().outerHeight();
            internal.targetParentMarginLeft = parseInt($target.parents().css('marginLeft'),10);
        },

        /**
         * Set the visibility of the left and right scroll arrows.  Also computes the number of
		 * the left-most visible slide.
         * @private
         * @return void
         */
        _setArrowVisibility: function() {

            var options = this.options,
                internal = this.internal,
                $target = $(this.element).find(options.target),
                currentLeft  = $target.position().left,
                currentRight = internal.targetOuterWidth + currentLeft,
                $arrowLeft = $(this.element).find(options.arrowLeft),
                $arrowRight = $(this.element).find(options.arrowRight),
                maskLeft = 0,
                maskRight = internal.targetParentOuterWidth;

			// right arrow
            if (currentRight <= maskRight ) {
                $arrowRight.hide();
                if (internal.isArrowBeingClicked === true) {
                    this._clearInterval();
                }
                internal.arrowRightVisible = internal.isArrowBeingClicked = false;
            } else {
                if (false === internal.arrowRightVisible) {
                    $arrowRight.show();
                    internal.arrowRightVisible = true;
                }
            }

			// left arrow
            if (currentLeft >= maskLeft) {
                $arrowLeft.hide();
                if (internal.isArrowBeingClicked === true) {
                    this._clearInterval();
                }
                internal.arrowLeftVisible = internal.isArrowBeingClicked  = false;
            } else {
               if(false === internal.arrowLeftVisible) {
                   $arrowLeft.show();
                   internal.arrowLeftVisible = true;
               }
            }
			
			
			// determine number of left-most visible slide
			internal.currentSlide = Math.abs(currentLeft / internal.unitWidth);
			if ($.isFunction(options.onShift)) {
				options.onShift(internal.currentSlide);
			}

        },


        _clearInterval : function() {
            var internal = this.internal,
                options = this.options,
                $target = $(this.element).find(options.target);

            if ('number' === typeof internal.timer) {
                internal.isArrowBeingClicked  = false;
                window.clearInterval(internal.timer);
            }
            if (false === busy) {
                busy = true;
                this._animate($target,{left:this.computeAdjust($target)},options.speed,function(){
                    busy = false;
                });
            }
        },
		
		/**
		 * Handles when one of navigation arrows is being pressed with a finger or the mouse.
		 * @private
		 * @return void
		 */
		_doArrowBeingClicked: function(direction) {

                var that = this,
					internal = this.internal,
					options = this.options,
					$target = $(this.element).find(options.target),
					currLeft = $target.position().left,
                    parentLeftOffset = internal.targetParentMarginLeft,
                    newLeft;

                if (busy === true) {
                    return;
                }

                if ('left' === direction) {

                    if (options.dragEvents === true) {
                        newLeft =  currLeft - parentLeftOffset + 10;
                    } else {
                        newLeft =  currLeft - parentLeftOffset + internal.unitWidth;
                    }

                } else if ('right' === direction) {

                    if (options.dragEvents === true) {
                        newLeft =  currLeft - parentLeftOffset - 10;
                    } else {
                        newLeft =  currLeft - parentLeftOffset - internal.unitWidth;
                    }

                } else {
                    throw new Error("unknown direction");
                }


                // do the animation here
                if (options.dragEvents === true) {
                    $target.css({'left':newLeft});
                    this._setArrowVisibility();
                } else {
                    busy = true;
                    this._animate($target,{left:newLeft},options.speed,function(){
                        that._setArrowVisibility();
                        busy = false;
                    });
                }

            },

        /**
         * Initialize the left and right arrow events.
         * @private
         * @return void
         */
        _setArrowEvents: function () {

            var t,
                that = this,
                options = this.options,
                internal = this.internal,
                $target = $(this.element).find(options.target),
                $arrowLeft = $(this.element).find(options.arrowLeft),
                $arrowRight = $(this.element).find(options.arrowRight),
                eventStringDown = "",
                eventStringUp = "";
            

            // discard click on left arrow
            $arrowLeft.on('click.simpslide',function(ev){
                ev.preventDefault();
            });

            // discard click on right arrow
            $arrowRight.on('click.simpslide',function(ev){
                ev.preventDefault();
            });

            // type of events depend on touch or not.
            if (options.dragEvents === true) {
                eventStringDown = 'mousedown.simpslide touchstart.simpslide';
                eventStringUp = 'mouseup.simpslide touchend.simpslide';
            } else {
                eventStringDown = 'mousedown.simpslide';
                eventStringUp = 'mouseup.simpslide';
            }

            // left arrow, move left
            $arrowLeft.on(eventStringDown,function(ev){
                ev.preventDefault();
                if (busy === false) {
                    internal.isArrowBeingClicked = internal.firstMouseClick = true;
                    internal.timer = window.setInterval(function(){that._doArrowBeingClicked('left')},10);
					window.clearInterval(internal.slideTimer);
					internal.slideShowActive = false;
                }
            });


            // right arrow, move right
            $arrowRight.on(eventStringDown,function(ev){
                if(busy === false){
                    internal.isArrowBeingClicked = internal.firstMouseClick = true;
                    internal.timer = window.setInterval(function(){that._doArrowBeingClicked('right')},10);
					window.clearInterval(internal.slideTimer);
					internal.slideShowActive = false;
                }
            });

            // mouse is up / touch is over?
            $(this.element).on(eventStringUp,function(){
                if (internal.isArrowBeingClicked === true) {
                    that._clearInterval();
                }
            });



        },

        /**
         * Figure out the width of each slider element (usually an li)
         *
         * "inherit"
         * ---------
         * If options.unitWidth is set to the string 'inherit', use the current width of the
         * slide unit (the blocks that go inside the slide target, like LI elements, for example)
         *
         * "compute"
         * --------
         * If options.unitWidth is set to the string 'compute', use an external callback to
         * dynamically determine the width based on any function you create.  that function
         * must return an integer with the new unit width.
         *
         * integer
         * -------
         * If options.unitWidth is an integer, it is converted to a pixel width.
         *
         * @private
         * @return void
         */
        _setUnitWidth: function () {

            var w, m,
                that = this,
                internal = this.internal,
                options = this.options,
                $target = $(this.element).find(options.target),
                $el = $(this.element),
                $firstUnit = $target.find(options.unitElement).eq(0),
                delay = new this.wait();


            var _importWidthFromDOM = function () {
                internal.unitWidth = $firstUnit.outerWidth();
            };

            var _setResponsiveUnitWidth = function () {
                var maskInnerWidth = $el.find(options.mask).innerWidth();
                m = options.responsiveUnitSize($el, internal, options);
                if ('number' !== typeof m || m < 1) {
                    throw new Error("The responsiveUnitSize callback must return a whole number greater than 0");
                }
                w = maskInnerWidth / m;
                w = Math.floor(w);
                $target.find(options.unitElement).css('width',w);
				internal.unitWidth = w;
            };



            if (options.unitWidth === 'inherit') {

                // first visit to page
                _importWidthFromDOM();


                // If the target has images in it's child elements, these images
                // can cause the widths to change as the page is updated. To counter
                // this, we'll re-run _importWidthFromDom after each image load in the
                // target or it's child elements.
                $target.find('img').on('load.simpslide',function(){
                    // fire the responsiveUnitSize callback
                    _importWidthFromDOM();
                    that._setTargetWidth('inherit');
                    that._setArrowVisibility();
                    if ($.isFunction(options.onRedraw)) {
                        options.onRedraw($el, internal, options);
                    }

                });


            } else if (options.unitWidth === 'compute') {

                // first visit to page
                _importWidthFromDOM();

                if ($.isFunction(options.responsiveUnitSize)) {
                    _setResponsiveUnitWidth();
                    _importWidthFromDOM();
                }
                if ($.isFunction(options.onRedraw)) {
                    options.onRedraw($el, internal, options);
                }

                // If the target has images in it's child elements, these images
                // can cause the widths to change as the page is updated. To counter
                // this, we'll re-run _importWidthFromDom after each image load in the
                // target or it's child elements.
                $target.find('img').on('load',function(){
                    // fire the responsiveUnitSize callback
                    if ($.isFunction(options.responsiveUnitSize)) {
                        _setResponsiveUnitWidth();
                    }
                    _importWidthFromDOM();
                    that._setTargetWidth('compute');
                    that._setArrowVisibility();
                    if ($.isFunction(options.onRedraw)) {
                        options.onRedraw($el, internal, options);
                    }
                });


                // re-import the width every time the page is re-sized.
                $(window).on('resize.simpslide',function(){
                    delay.thenDo(function(){
                        var adjust;

                        // fire the responsiveUnitSize callback
                        if ($.isFunction(options.responsiveUnitSize)) {
                            _setResponsiveUnitWidth();
                        }

                        // get the new width from the dom and store internally
                        _importWidthFromDOM();
                        that._setTargetWidth('compute (window resize)');

                        // keep the left-most fully visible object (not partially hidden)
                        // aligned with the left of the container.  No fractional units
                        // allowed on the left. (Which means there should not be any
                        // fractional units on the right either, if all goes well)
                        adjust = that.computeAdjust($target);


                        // if we are not animating a transition, update the scroll arrows
                        $target.css({left:adjust});
                        that._setArrowVisibility();

                        if ($.isFunction(options.onRedraw)) {
                            options.onRedraw($el, internal, options);
                        }

                    },100);
                });


            } else {

                internal.unitWidth = options.unitWidth;
            }
        },

        /**
         * Handle optional drag events.  Works on touch and non-touch screens via mouse.  Recommended to only
         * enable this option for touch screens.
         * @param jQuery container The object (usually a UL) that contains the elements that scroll, (usually LI's)
         * @private
         * @return void
         */
        _dragEvents: function () {

            var that = this,
                options = this.options,
                internal = this.internal,
                $target = $(this.element).find(options.target),
                //$el = $(this.element),
                $mask = $target.parent(),
                content = $target,
                hammer = new Hammer($mask.get(0),{
                    drag:true,
                    drag_vertical:false,
                    drag_horizontal:true,
                    drag_min_distance:0,
                    transform:false,
                    tap:false,
                    tap_double:false,
                    hold:false
                }),
                dragWait = new this.wait(),
                scroll_start = {},
                scroll_dim = {},
                content_dim = {};

            var getScrollPosition = function() {
                return {
                    top: parseInt(content.css('top'),10),
                    left: parseInt(content.css('left'),10)
                }
            };


            hammer.ondragstart = function() {

                if (true === internal.isArrowBeingClicked || true === busy) {
                    // prevent jitters due to fat fingers touching scroll arrow and carousel at same time.
                    // if we're already busy, ignore
                    return {};
                }

                busy = true;

                scroll_start = getScrollPosition();
                scroll_start.time = new Date().getTime();
                scroll_dim = {
                    width: internal.targetParentOuterWidth,
                    height: internal.targetParentOuterHeight
                };
                content_dim = {
                    width: internal.targetOuterWidth,
                    height: internal.targetOuterHeight
                }
            };

            hammer.ondrag = function(ev) {

                if (true === internal.isArrowBeingClicked) {
                    // prevent jitters due to fat fingers touching scroll arrow and carousel at same time.
                    return;
                }

				var delta = 1, left;

				if(ev.direction === 'up' || ev.direction === 'left') {
					ev.distance = 0 - ev.distance;
				}
				left = scroll_start.left + ev.distance * delta;
                internal.left = left;
				content.css('left',left);


            };

            hammer.ondragend = function(ev) {

                $target.stop(true,false);
                that._animate($target,{left:that.computeAdjust($target)},options.speed,function(){
                    that._setArrowVisibility();
                    busy = false;
                });

            }
        },



        /**
         * Setup widget (eg. element creation, apply theming, bind events etc.)
         * @private
         * @return Void
         */
        _create: function () {

            // _create will automatically run the first time
            // this widget is called. Put the initial widget
            // setup code here, then you can access the element
            // on which the widget was called via this.element.
            // The options defined above can be accessed
            // via this.options this.element.addStuff();

            var options = this.options,
                internal = this.internal,
                $el = $(this.element),
                $target = $(this.element).find(options.target);




            // --------------------
            // _create MAIN FLOW
            // --------------------
            // backup original target element
            this.internal.targetBackupCopy = this.element;
            // if we are using css3 animations, determine the browser specific prefix (-ie,-moz,-webkit, etc)
            if (this.options.cssAnimations) {
                this.internal.prefix = this._getPrefix('transition');
            }
            // init the target DOM element's css
            $target.css({
                'position':'relative',
                'left':0
            });

            // init touch events if applicable
            if (options.dragEvents === true) {
                this._dragEvents();
            }

            this._setArrowEvents();
            this._setUnitWidth();
            this._setTargetWidth('first load');
            this._setArrowVisibility();

            if ($.isFunction(options.onRedraw)) {
                options.onRedraw($el, internal, options);
            }


        },


        /**
         * Force a redraw of the carousel.
         * @public
         * @return void
         */
        redraw: function() {
            var that = this,
                internal = this.internal,
                options = this.options,
                $el = $(this.element);

            this._setUnitWidth();
            this._setTargetWidth('_redraw');
            this._setArrowVisibility();
            if ($.isFunction(this.options.onRedraw)) {
                that.options.onRedraw($el, internal, options);
            }
        },
		
        /**
         * return the number of the current slide.  numbering starts at zero.
         * @public
         * @return integer
         */
		getCurrentSlide: function() {
			return this.internal.currentSlide;
		},

        /**
         * Make a specified slide the left-most visible slide in the slider
         * @public
         */		
		goToSlide: function(i) {
            var that = this,
                internal = this.internal,
				options = this.options,
				$target = $(this.element).find(options.target),
				newLeft;
			
			this._setUnitWidth();
			newLeft = i * this.internal.unitWidth * -1;
			busy = true;
			this._animate($target,{'left':newLeft},options.speed,function(){
				busy = false;
				that._setArrowVisibility();
			});			
						
		},

        /**
         * Activate / Deactivate slide show mode.
         * @public
         */				
		toggleSlideShow: function () {

			
			var that = this,
				internal = this.internal,
				options = this.options,
				$target = $(this.element).find(options.target);
				
			
			var _stopSlideShow = function() {
				if (true === internal.slideShowActive) {
					internal.slideShowActive = false;
					window.clearInterval(internal.slideTimer);
				}		
			};
			
			var _step = function (i) {
				var width = internal.targetParentInnerWidth,							
					left = $target.position().left,
					right = left + internal.targetWidth,
					newLeft = left + i * internal.unitWidth,
					newRight = right + i * internal.unitWidth,
					adjustedLeft = newLeft;
								
	
				
				if (internal.slideBumped === false) {
					
					// too far left
					if (newRight <= width) {
						adjustedLeft = newLeft + width - newRight;
						internal.slideBumped = 'left';
					}
		
					// too far right
					if (newLeft >= 0) {
						internal.slideBumped = 'right';
						adjustedLeft = 0;
					}
					
				} else {
				
				 	if ('left' === internal.slideBumped) {
						adjustedLeft = 0;	
					}
					
					if ('right' === internal.slideBumped) {
						adjustedLeft = left + width - right;
					}
					
					internal.slideBumped = false;
				 
				}
				
				// do the animation	
				busy = true;
				that._animate($target,{'left':adjustedLeft},options.speed,function(){
					busy = false;
					that._setArrowVisibility();
				});					
								
			};
			
			
			if (false === internal.slideShowActive) {
				internal.slideShowActive = true;
				internal.slideTimer = window.setInterval(function(){
					_step(options.step);
				},options.slideSpeed);				
			} else {
				_stopSlideShow();
			}			
			
		},

        /**
         * Destroy this plugin and clean up modifications the widget has made to the DOM
         * @public
         * @return void
         */
        destroy: function () {

            // remove events created by this instance
            $(window).unbind('.simpslide');
            $(this.element).find(this.options.arrowLeft).unbind('.simpslide');
            $(this.element).find(this.options.arrowRight).unbind('.simpslide');

            // restore the element to it's original pristine state
            this.element = this.internal.targetBackupCopy;

            // For UI 1.8, destroy must be invoked from the base widget
            $.Widget.prototype.destroy.call(this);
            // For UI 1.9, define _destroy instead and don't worry about calling the base widget
        },


        /**
         * Try to keep the leftmost visible element (usually an LI) flush against the left border.
         * Use this to prevent on fractions of elements from being visible.
         * @param jQuery $target
         * @return integer
         * @public
         */
        computeAdjust : function ($target) {


            var left,right,mod,thresh,width,newLeft;



            width = this.internal.targetParentInnerWidth;
            left = $target.position().left;
            right = left + this.internal.targetWidth;
            thresh = this.internal.unitWidth / -2;


            // too far left
            if (right < width) {
                newLeft = left + width - right;
                left = newLeft;
            }

            // too far right
            if (left > 0) {
                left = newLeft = 0;
            }


            // keep left most fully visible object aligned with left border
            mod = left % this.internal.unitWidth;
            if (mod !== 0) {
                if (mod < thresh) {
                    newLeft =  left - (this.internal.unitWidth + mod);
                }
                if (mod > thresh) {
                    newLeft = $target.position().left - mod;
                }
            }
            return newLeft;
        }


    });

})( jQuery, window, document );
