

/*!
 * responsiveCarousel
 * A responsive carousel that works in desktop browsers, ipad, iphone, and even
 * most Androids.  It uses css3 animations with a jquery animation fallback for
 * greater speed.  The code was optimized to minimize page reflows to further
 * enhance the overall speed.
 *
 * This is a jQuery UI Widget
 *
 * @author Matthew Toledo
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
            unitElement: 'li',
            unitWidth: 'inherit',
            responsiveUnitSize: null,
            onRedraw: null,
            dragEvents: false,
            cssAnimations: Modernizr.cssanimations
        },

        // a place to store internal vars used only by this instance of the widget
        internal: {
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
            prefix: null
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


        _animate: function ($target, props, speed, easing, callback) {
            var options = this.options,
                internal = this.internal,
                animationOptions = speed && typeof speed === "object" ? jQuery.extend({}, speed) : {
                complete:callback || !callback && easing ||
                    jQuery.isFunction(speed) && speed,
                duration:speed,
                easing:callback && easing || easing && !jQuery.isFunction(easing) && easing
            };


            return $target.each(function () {
                var $this = $(this),
                    easing = (animationOptions.easing) ? easing : 'ease-in-out',
                    prefix = (internal.prefix);
                if (options.cssAnimations) {
                    $this.css(prefix + 'transition', 'all ' + speed / 1000 + 's ease-in-out').css(props);
                    setTimeout(function () {
                        $this.css(prefix + 'transition', '');
                        if ($.isFunction(animationOptions.complete)) {
                            animationOptions.complete();
                        }
                    }, speed);
                }
                else {
                    $this.animate(props, speed, animationOptions);
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
         * Set the visibility of the left and right scroll arrows.
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
                this._animate($target,{left:this.computeAdjust($target)},400,function(){
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

            /*
            var _clearInterval = function() {
                if ('number' === typeof t) {
                    internal.isArrowBeingClicked  = false;
                    clearInterval(internal.timer);
                }
                if (false === busy) {
                    $target.animate({left:that.computeAdjust($target)},400);
                }
            };
            */

			/* not used yet - do a mouse up event if too far left or right while pressing arrow */
            var _checkTooFar = function($target) {
                var i = $target.position().left;
                return;
            };


            var _doArrowBeingClicked = function(direction) {


                var currLeft = $target.position().left,
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
                    throw "unknown direction";
                }


                // do the animation here
                if (options.dragEvents === true) {
                    $target.css({'left':newLeft});
                    that._setArrowVisibility();
                    _checkTooFar($target);
                } else {
                    busy = true;
                    that._animate($target,{left:newLeft},400,function(){
                        that._setArrowVisibility();
                        busy = false;
                        _checkTooFar($target);
                    });
                }

            };

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
                    internal.timer = window.setInterval(function(){_doArrowBeingClicked('left')},10);
                }
            });


            // right arrow, move right
            $arrowRight.on(eventStringDown,function(ev){
                if(busy === false){
                    internal.isArrowBeingClicked = internal.firstMouseClick = true;
                    internal.timer = window.setInterval(function(){_doArrowBeingClicked('right')},10);
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

            var w,
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

            // TODO  DELETE THIS HACK
            var tweak = 0;
            /*if ($.browser.mozilla) {
                tweak = 20;
            }*/


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
                    w = options.responsiveUnitSize($el, internal, options);
                    $target.find(options.unitElement).css('width',w - tweak);
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
                        w = options.responsiveUnitSize($el, internal, options);
                        $target.find(options.unitElement).css('width',w - tweak);
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
                            w = options.responsiveUnitSize($el, internal, options);
                            $target.find(options.unitElement).css('width',w - tweak);
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
                that._animate($target,{left:that.computeAdjust($target)},400,function(){
                    console.log('animate dragend');
                    that._setArrowVisibility();
                    busy = false;
                });

            }
        },

        /**
         * Extend jQuery so that Animations are done using css3 animations.  If css3 is not available,
         * fall back to standard jQuery animations.   CSS3 animations are faster.  Thanks to
         * http://addyosmani.com/blog/css3transitions-jquery/
         * @private
         */
        _initAnimate:function () {

            var sliderOptions = this.options;



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