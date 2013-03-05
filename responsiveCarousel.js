/*!
 * responsiveCarousel
 * A responsive carousel that works in desktop browsers, ipad, iphone, and even
 * most Androids.  It uses css3 animations with a jquery animation fallback for
 * greater speed.  The code was optimized to minimize page reflows to further
 * enhance the overall speed..
 *
 * This is a jQuery UI Widget
 *
 * @version 1.5.2
 * @releaseDate 3/5/2013
 * @author Matthew Toledo
 * @url https://github.com/mrbinky3000/responsive_carousel
 * @requires jQuery, jQuery UI (only the Core and Widget Factory), modernizr (only css3 transitions test, touch test optional), hammer.js
 */
(function ($, window, document) {
    "use strict";

    var instanceCount = 0;

    $.widget("ri.responsiveCarousel", {

        // default options for every instance of the widget
        options: {
            arrowLeft: '.arrow-left span',
            arrowRight: '.arrow-right span',
            mask: '.slider-mask',
            target: 'ul',
            unitElement: 'li',
            unitWidth: 'inherit',
            responsiveUnitSize: null,
            onRedraw: null,
            ondragstart: null,
            ondragend: null,
            dragEvents: false,
            easing: 'linear',
			speed: 400,
			slideSpeed: 2500,
			step: -1,
			responsiveStep: null,
            onShift: null,
            cssAnimations: Modernizr.csstransitions,
            nudgeThreshold: 10,
            infinite: false,
            delta: 1
        },

        /**
         * Automatically add the correct vendor specific prefix for a css property if there is no native support.
         *
         * @param prop string A string representing a CSS property
         * @return string The prefixed CSS property if prefixing exists. If there is also an non-prefixed version or no prefix exists, return the original non-prefixed value of prop.
         * @private
         */
        _getPrefix: function (prop) {
            var prefixes = ['Moz', 'Webkit', 'Khtml', '0', 'ms'],
                elem = document.createElement('div'),
                upper = prop.charAt(0).toUpperCase() + prop.slice(1),
                pref = "",
                len = prefixes.length;

            while (len > -1) {
                if (elem.style[prefixes[len] + upper] !== undefined) {
                    pref = (prefixes[len]);
                }
                len = len - 1;
            }

            if (elem.style[prop]) {
                pref = prop.toLowerCase();
            } else {
                pref =  '-' + pref.toLowerCase() + '-';
            }

            return pref;

        },


        /**
         * Rounds the number X to the nearest interval of internal.unitWidth.
         *
         * Only if options.unitWidth !== 'individual'
         *
         * Some browsers seem dead set on providing fractions of pixels when using jQuery's $.position()
         * method.  It could be a browser peculiarity or just a side-effect of JavaScript's  weird
         * handling of floating numbers.  Either way, this function fixes that by always providing us
         * with whole number multiple of the unitWidth.  It's great for figuring out the "left" of the
         * slider target so that the slider doesn't slide past the left or right boundaries.
         *
         * @param x number
         * @return x number
         * @private
         */
        _round: function (x) {
            // round x to the nearest interval of internal.unitWidth
            if (this.options.unitWidth === 'compute' || this.options.unitWidth === 'inherit' || this.options.unitWidth === 'integer') {
                x = Math.round( x / this.internal.unitWidth) * this.internal.unitWidth;
            }
            return x;
        },

        /**
         * A proxy function that should be called to animate stuff instead of using jQuery's $.animate() function.
         * If the user's browser supports CSS3 Transitions, we use them since they are faster.  If they don't support
         * Transitions, we jQuery's default $.animate() method which is fast on newer computers, but slower on some
         * under-powered mobile devices.  $.animate() also causes page reflows, which we are trying to avoid.
         *
         * @param $target
         * @param props object The css attributes to animate
         * @param speed integer Speed in milliseconds
         * @param callback function A function to call after the animation is done
         * @return {*} This is chain-able.
         * @private
         */
        _animate: function ($target, props, speed, callback) {

            var options = this.options,
                internal = this.internal,
                transition = internal.prefix + 'transition',
                currentLeft = this._round(Math.floor($target.position().left)),
                newLeft = props.left,
                diff = currentLeft + newLeft,
                i,

                _transition = function(o) {
                    $target.css(o);
                };




            // options for seamless looping
            if (options.infinite === true) {
                if (newLeft !== undefined) {
                    if (newLeft < currentLeft) {
                        // sliding to the left
                        // Am I at the start of the clones?
                        i = internal.unitWidth * (internal.numUnits - internal.numVisibleUnits) * -1;
                        if (currentLeft === i) {
                            // Yes! Jump to start of carousel first
                            _transition({
                                transition : '',
                                'left' : 0
                            });
                            props.left = -internal.unitWidth;
                        }
                        // No! Go ahead and slide left
                    } else if (newLeft > currentLeft) {
                        // sliding to the right
                        // Is current left at 0?
                        if (currentLeft === 0 ) {
                            // Yes! Jump to the start of the clones
                            i = Math.floor($target.find('.clone:first').position().left) * -1;
                            _transition({
                                transition : '',
                                'left' : i
                            });
                            props.left = i + diff;
                        }
                        // No! Go ahead and slide right
                    }
                }
            }

            // stupid hack! For some reason, if the code below is not delayed the transitions bellow occur BEFORE
            // the code above where transitions are turned off and the slider jumps to the start of the clones
            // or to the start of the slider.  I think it has to do with how browsers render CSS that originates in JS.
            // I think that no matter the order in which CSS is applied in JS, the browser renders transitions in
            // a specific order. I could be wrong.  Let me know if I am!
            window.setTimeout(function () {
                if (options.cssAnimations) {
                    _transition($.extend({transition :  'left ' + speed / 1000 + 's ' + options.easing }, props));
                    window.setTimeout(function () {
                        // execute a the supplied callback (if any) that was given to _animate
                        _transition({transition :  ''});
                        if ($.isFunction(callback)) {
                            callback();
                        }
                    }, speed);
                } else {
                    $target.animate(props, speed, function () {
                        if ($.isFunction(callback)) {
                            callback();
                        }
                    });
                }
           } ,1); // set to 1 millisecond, but will most likely be "animation frame" or about 10ms
        },

        /**
         * Compute the new width for the target element (the element that holds all the things
         * that slide). Store the new width in our internal object.  Finally, assign the target
         * the new width.
         *
         * @param caller string Optional string used for debugging.
         * @return void
         * @private
         */
        _setTargetWidth: function (caller) {
            var internal = this.internal,
                options = this.options,
                $el = $(this.element),
                $target = $(options.target);

            caller = ' ' + caller; // shut up jsLint console.log this to see which function called it. (or use trace)
            // console.log('caller',caller);
            internal.numUnits = $(options.unitElement).length;

            // if we are doing individual widths, then loop through all the unitElements and
            // save each width as element data while totalling the width.
            if (options.unitWidth === 'individual') {
                internal.targetWidth = 0;
                $(options.unitElement).each(function(){
                    var $this = $(this),
                        width;

                    // clear any previous width that we set.  Let the browser re-draw naturally.
                    $this.css('width','');

                    // get rid of any sub-pixels. Only whole numbers please.  Some browsers have sub pixels
                    // even though we set stuff to whole numbers.  Might have to do with borders or
                    // padding, not sure.  Don't care.
                    width = Math.ceil($this.width()) + 1;  // +1px is because IE9 SUCKS!!!!!!!!!!
                    $this.width(width);

                    // add the whole number width to the running width total
                    internal.targetWidth = internal.targetWidth + width;

                    // store all this in a data
                    $(this).data("responsiveCarousel",{
                        'width' : width,
                        'top' : Math.floor($this.position().top),
                        'right' : Math.floor($this.position().left) + $this.width(),
                        'bottom' : Math.floor($this.position().top) + $this.height(),
                        'left' : Math.floor($this.position().left)
                    });
                });
            }

            // All other unitWidth modes involve widths that are universal for all elements
            else {
                internal.targetWidth =  internal.numUnits * internal.unitWidth;
            }


            $(options.target).width(internal.targetWidth); // target width (no border or padding)
            internal.targetHeight = $(options.target).height();
            internal.maskWidth = $(options.mask).width();
            internal.maskHeight = $(options.mask).height();

        },

        /**
         * Set the visibility of the left and right scroll arrows.  Also computes the number of
		 * the left-most visible slide.
         * @private
         * @return void
         */
        _setArrowVisibility: function (s) {

            var options = this.options,
                internal = this.internal,
                $target = $(options.target),
                $arrowLeft = $(options.arrowLeft),
                $arrowRight = $(options.arrowRight),
                maskLeft = 0,
                p,
                i,
                maskRight = internal.maskWidth,
                currentLeft  = this._round(Math.floor($target.position().left)), // position does not include for margin & border of parent
                currentRight = internal.targetWidth + currentLeft;

			// right arrow
            if ($arrowRight.length) {
                if (options.infinite !== true && currentRight <= maskRight) {
                    $arrowRight.addClass('disabled');
                    if (internal.isArrowBeingClicked === true) {
                        this._clearInterval();
                    }
                    internal.arrowRightVisible = internal.isArrowBeingClicked = false;
                } else {
                    if (false === internal.arrowRightVisible) {
                        $arrowRight.removeClass('disabled');
                        internal.arrowRightVisible = true;
                    }
                }
            }


			// left arrow
            if ($arrowLeft.length) {
                if (options.infinite !== true && currentLeft >= maskLeft) {
                    $arrowLeft.addClass('disabled');
                    if (internal.isArrowBeingClicked === true) {
                        this._clearInterval();
                    }
                    internal.arrowLeftVisible = internal.isArrowBeingClicked  = false;
                } else {
                    if (false === internal.arrowLeftVisible) {
                        $arrowLeft.removeClass('disabled');
                        internal.arrowLeftVisible = true;
                    }
                }

            }


			// determine number of left-most visible slide
            if (options.unitWidth === 'individual') {
                // when in "individual" mode, each unit has a unique width.
                for (i = 0; i < internal.numUnits; i++) {
                    p = $(options.unitElement).eq(i);

                    if (Math.abs(currentLeft) >= p.data('responsiveCarousel').left && Math.abs(currentLeft) < p.data('responsiveCarousel').right ) {
                        internal.currentSlide = p.data('slide');
                        break;
                    }
                }
            } else {
                // All the other unit width modes (compute, inherit, integer) have units with the same
                // width. So, it's easy to use math to find the current leftmost element.
                // this could be NaN if slider is display:none.
                internal.currentSlide = $(options.unitElement).eq([Math.abs(currentLeft / internal.unitWidth)]).data('slide');

            }
			if ($.isFunction(options.onShift)) {
                i = internal.currentSlide;
                if (typeof i === 'number') { // carousel might be hidden and therefore has no dimensions. So, no shift.
                    // $('#log').append('#' + i +'(' + s +') ');
                    options.onShift(i);
                }
			} else if (options.onShift !== null ) {
                throw new Error('The onShift option must be a function or null if not in use.');
            }

        },


        _clearInterval : function () {
            var internal = this.internal,
                options = this.options,
                $target = $(options.target);

            if ('number' === typeof internal.timer) {
                internal.isArrowBeingClicked  = false;
                window.clearInterval(internal.timer);
            }
            if (false === internal.busy) {
                internal.busy = true;
                this._animate($target, {left: this.computeAdjust($target, 'clearInterval') }, options.speed, function () {
                    internal.busy = false;
                });
            }
        },

		/**
		 * Handles when one of navigation arrows is being pressed with a finger or the mouse.
		 * @private
		 * @return void
		 */
		_doArrowBeingClicked: function (direction) {

            var that = this,
                internal = this.internal,
                options = this.options,
                $target = $(options.target),
                currLeft = Math.floor($target.position().left),
                newLeft;

            if (internal.busy === true) {
                return;
            }

            if (options.unitWidth === 'individual') {

                // when options.unitWidth is set to "individual" each unit has a unique width.
                if (direction === 'right') {
                    if ( $(options.unitElement).eq(internal.currentSlide + 1).length ) {
                        newLeft = $(options.unitElement).eq(internal.currentSlide + 1).data('responsiveCarousel').left * -1;
                    } else {
                        newLeft = currLeft - (internal.nudgeThreshold ? internal.nudgeThreshold : 20);
                    }
                } else if (direction === "left") {
                    if ( $(options.unitElement).eq(internal.currentSlide - 1).length ) {
                        newLeft = $(options.unitElement).eq(internal.currentSlide - 1).data('responsiveCarousel').left * -1;
                    } else {
                        newLeft = currLeft + (internal.nudgeThreshold ? internal.nudgeThreshold : 20);
                    }
                } else {
                    throw new Error("unknown direction");
                }

            } else {

                // all other unit width types (integer, compute, inherit) are uniform widths
                if (direction === "left") {
                    newLeft =  currLeft  + internal.unitWidth;
                } else if (direction === "right") {
                    newLeft =  currLeft - internal.unitWidth;
                } else {
                    throw new Error("unknown direction");
                }

            }

            // for some stupid reason, some browsers want to add sub-pixel sizes even though absolutely
            // everything is whole numbers.  Math floor it!
            newLeft = Math.floor(newLeft);

            // do the animation here
            internal.busy = true;
            this._animate($target, {left: newLeft}, options.speed, function () {
                that._setArrowVisibility('_doArrowBeingClicked');
                internal.busy = false;
            });

        },

        /**
         * Initialize the left and right arrow events.
         * @private
         * @return void
         */
        _setArrowEvents: function () {

            var that = this,
                options = this.options,
                internal = this.internal,
                $arrowLeft = $(options.arrowLeft),
                $arrowRight = $(options.arrowRight),
                eventStringDown = "",
                eventStringUp = "";

            // discard click on left arrow
            $arrowLeft.on('click' + this.instanceId, function (ev) {
                ev.preventDefault();
            });

            // discard click on right arrow
            $arrowRight.on('click' + this.instanceId, function (ev) {
                ev.preventDefault();
            });

            // type of events depend on touch or not.
            if (options.dragEvents === true) {
                eventStringDown = 'mousedown' + this.instanceId +
                    ' touchstart' + this.instanceId +
                    ' gesturestart' + this.instanceId +
                    ' gesturechange' + this.instanceId;
                eventStringUp = 'mouseup' + this.instanceId +
                    ' mouseout' + this.instanceId +
                    ' mouseleave' + this.instanceId +
                    ' touchend' + this.instanceId +
                    ' touchleave' + this.instanceId +
                    ' gestureend' + this.instanceId;
            } else {
                eventStringDown = 'mousedown' + this.instanceId;
                eventStringUp = 'mouseup' + this.instanceId +
                    ' mouseout' + this.instanceId +
                    ' mouseleave' + this.instanceId;
            }

            // left arrow, move left
            $arrowLeft.on(eventStringDown, function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                if (internal.busy === false && !$arrowLeft.hasClass('disabled')) {
                    internal.isArrowBeingClicked = internal.firstMouseClick = true;
                    internal.timer = window.setInterval(function () {that._doArrowBeingClicked('left'); }, 10);
                    if (internal.slideTimer) {
                        window.clearInterval(internal.slideTimer);
                        internal.slideShowActive = false;
                    }
                }
            });


            // right arrow, move right
            $arrowRight.on(eventStringDown, function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                if (internal.busy === false && !$arrowRight.hasClass('disabled')) {
                    internal.isArrowBeingClicked = internal.firstMouseClick = true;
                    internal.timer = window.setInterval(function () {that._doArrowBeingClicked('right'); }, 10);
					if (internal.slideTimer) {
                        window.clearInterval(internal.slideTimer);
                        internal.slideShowActive = false;
                    }
                }
            });

            // mouse is up / touch is over?
            $.each([$arrowLeft, $arrowRight], function (){
                $(this).on(eventStringUp, function () {
                    if (internal.isArrowBeingClicked === true) {
                        that._clearInterval();
                    }
                });
            });

            // Other fringe events that require a cancel of an arrow touch event.
            $(window).on('scroll' + this.instanceId +' resize' + this.instanceId +' onorientationchange' + this.instanceId, function(){
                that._clearInterval();
            });


        },

        /**
         * Figure out the width of each slider element (usually an li)
         *
         * "inherit"
         * ---------
         * If options.unitWidth is set to the string 'inherit', use the current width of the
         * first slide unit encountered.  For example, if the slideUnit config option is 'li'
         * Then all the li blocks get assigned the same width as the first 'li' element
         * encountered.
         *
         * "individual"
         * ------------
         * If options.unitWidth is set to 'individual', each element can have it's own unique
         * width.  When done dragging, snap the leftmost visible element to the left so that.
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
                $target = $(options.target),
                $el = $(this.element),
                $units = $(options.unitElement + ':not(.clone)'),
                $firstUnit = $units.eq(0),
                delay,

                _importWidthFromDOM = function () {
                    internal.unitWidth = $firstUnit.width();  // make sure your unitElements (LI) don't have margin, padding, or border set in CSS!
                },

                _setResponsiveUnitWidth = function () {
                    var maskWidth = $(options.mask).width();
                    m = options.responsiveUnitSize($el, internal, options);
                    if ('number' !== typeof m || m < 1) {
                        throw new Error("The responsiveUnitSize callback must return a whole number greater than 0");
                    }
                    w = maskWidth / m;
                    w = Math.floor(w);
                    $(options.unitElement).css('width', w);

                    // if we have infinite scrolling, add clones to the front and back of our our list. to give the illusion of infinite scrolling
                    if (options.infinite === true && m > 0 && m !== internal.numVisibleUnits) {
                        internal.numVisibleUnits = m;

                        // clear all the old clones, make way for the new clones.
                        $target.find('.clone').remove();

                        // make new clones
                        $units.slice(0,internal.numVisibleUnits).clone(true).addClass('clone').appendTo($target);
                    }

                    internal.unitWidth = w;
                    internal.numVisibleUnits = m;

                };


            if (options.unitWidth === 'inherit') {

                // first visit to page
                _importWidthFromDOM();


                // If the target has images in it's child elements, these images
                // can cause the widths to change as the page is updated. To counter
                // this, we'll re-run _importWidthFromDom after each image load in the
                // target or it's child elements.
                $target.find('img').one('load' + that.instanceId, function () {
                    // fire the responsiveUnitSize callback
                    _importWidthFromDOM();
                    that._setTargetWidth('inherit');
                    that._setArrowVisibility('_setUnitWidth inherit imageload');
                    if ($.isFunction(options.onRedraw)) {
                        options.onRedraw($el, internal, options);
                    }

                });


            } else if (options.unitWidth === 'individual') {


                // first visit to the page
                if ($.isFunction(options.onRedraw)) {
                    options.onRedraw($el, internal, options);
                }

                // If the target has images in it's child elements, these images
                // can cause the widths to change as the page is updated. To counter
                // this, we'll re-run _setTargetWidth() after each image load in the
                // target or it's child elements.
                $target.find('img').one('load' + that.instanceId, function () {
                    that._setTargetWidth('individual');
                    that._setArrowVisibility('_setUnitWidth individual imageload');
                    if ($.isFunction(options.onRedraw)) {
                        options.onRedraw($el, internal, options);
                    }
                });

                // re-import the width every time the page is re-sized
                $(window).on('resize' + that.instanceId, function () {
                    clearTimeout(delay);
                    delay = setTimeout(function(){
                        var adjust;

                        that._setTargetWidth('individual (window resize)');

                        // keep the left-most fully visible object prior to the resize
                        // in the left-most slot after the resize
                        adjust = $(options.unitElement).eq(internal.currentSlide).data('responsiveCarousel').left * -1;

                        // if we are not animating a transition, update the scroll arrows
                        $target.css({left: adjust});
                        that._setArrowVisibility('_setUnitWidth individual resize');

                        if ($.isFunction(options.onRedraw)) {
                            options.onRedraw($el, internal, options);
                        }

                    }, 400);  // if carousel acts weird, increase this number, your page is huge!
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
                $target.find('img').each(function(){
                    // sometimes stuff like fonts get loaded as img and cause an infinite loop
                    // combat with a jQuery "one" load per image. Jquery bug? Browser bug?
                    $(this).one('load' + that.instanceId, function () {
                        // only do stuff if this is visible
                        if ($target.is(':hidden') === false) {
                            // fire the responsiveUnitSize callback
                            if ($.isFunction(options.responsiveUnitSize)) {
                                _setResponsiveUnitWidth();
                            }
                            _importWidthFromDOM();
                            that._setTargetWidth('compute (image load) ' + that.instanceId);
                            that._setArrowVisibility('_setUnitWidth compute imageload');
                            if ($.isFunction(options.onRedraw)) {
                                options.onRedraw($el, internal, options);
                            }
                        }
                    });
                });

                // re-import the width every time the page is re-sized.
                $(window).on('resize' + that.instanceId, function () {

                    clearTimeout(delay);
                    // only do stuff if the target is visible
                    if ($target.is(':hidden') === false) {
                        delay = setTimeout(function(){
                            var adjust;

                            if ($.isFunction(options.responsiveUnitSize)) {
                                _setResponsiveUnitWidth();
                                _importWidthFromDOM();
                            }

                            // get the new width from the dom and store internally
                            _importWidthFromDOM();
                            that._setTargetWidth('compute (window resize) ' + that.instanceId);

                            // keep the left-most fully visible object prior to the resize
                            // in the left-most slot after the resize
                            adjust = internal.currentSlide * -1 * internal.unitWidth;
                            // but don't go too far left! Fill in new space to the right.
                            if (adjust < ( -1 * internal.maskWidth)) {
                                adjust = internal.maskWidth - internal.targetWidth;
                            }



                            // if we are not animating a transition, update the scroll arrows
                            $target.css({left: adjust});
                            that._setArrowVisibility('_setUnitWidth compute resize');

                            if ($.isFunction(options.onRedraw)) {
                                options.onRedraw($el, internal, options);
                            }

                        }, 400); // if carousel acts weird, increase this number, your page is huge!

                    }
                });

            } else {

                internal.unitWidth = options.unitWidth;
            }
        },

        /**
         * Handle optional drag events.  Works on touch and non-touch screens via mouse drag.
         *
         * @private
         * @return void
         */
        _dragEvents: function () {

            var that = this,
                options = this.options,
                internal = this.internal,
                $target = $(options.target),
                $mask = $(options.mask),
                content = $target,
                hammer = new Hammer($mask.get(0), {
                    prevent_default: false,
                    css_hacks: true,
                    drag: true,
                    drag_vertical: false,
                    drag_horizontal: true,
                    drag_min_distance: 10,
                    swipe: false,
                    transform: false,
                    tap: false,
                    tap_double: false,
                    hold: false
                }),
                scroll_start = {},
                scroll_dim = {},
                content_dim = {},
                delay,

                getScrollPosition = function () {
                    var o = {
                        top: parseInt(content.css('top'), 10),
                        left: parseInt(content.css('left'), 10)
                    };
                    return o;
                };

            internal.touchObject = hammer;

            hammer.ondragstart = function () {

                // stop the slide show if any
                that.stopSlideShow();

                if (true === internal.isArrowBeingClicked || true === internal.busy) {
                    // prevent jitters due to fat fingers touching scroll arrow and carousel at same time.
                    // if we're already busy, ignore
                    return {};
                }



                internal.busy = true;

                scroll_start = getScrollPosition();
                scroll_start.time = new Date().getTime();
                scroll_dim = {
                    width: internal.maskWidth,
                    height: internal.maskHeight
                };
                content_dim = {
                    width: internal.targetWidth,
                    height: internal.targetHeight
                };

                // copy the scroll start position to internal storage so computeAdjust() can reference it when
                // determining if a nudge makes it past the nudge threshold and warrants moving to the next slide
                internal.scrollStart = scroll_start;

                if ($.isFunction(options.ondragstart)) {
                    options.ondragstart(options, internal);
                }
            };

            hammer.ondrag = function (ev) {

                // insurance just in case the dragend event does not fire due to a very quick touch
                // combined with a very slow device.  This is a documented bug with hammer.js issue 67
                // turning swipe to false fixes it, this is here just in case of future bugs in hammer.
                if (delay) {
                    clearTimeout(delay);
                }
                delay = setTimeout(function(){
                    if (internal.busy === true) {
                        //$('.log').prepend('backup dragend trigger</br>');
                        hammer.ondragend();
                    }
                },400);

                if (true === internal.isArrowBeingClicked) {
                    // prevent jitters due to fat fingers touching scroll arrow and carousel at same time.
                    return;
                }

				var delta = options.delta,
                    left,
                    distance,
                    startOfClones = internal.unitWidth * (internal.numUnits - internal.numVisibleUnits) * -1;

                if (ev.direction === 'up' || ev.direction === 'left') {
                    ev.distance = ev.distance * -1;
                }

                left = scroll_start.left + ev.distance * delta;
                distance = Math.abs(internal.scrollStart.left - left);

                // Determine if we've nudged the slider just enough to pass the minimum threshold for initiating a slide
                // nudge must be more than the threshold, but less than the total unit width. if nudged, raise a flag
                // that is handled by computeAdjust() later.
                if ((distance > options.nudgeThreshold) && (distance < internal.unitWidth / 2)) {
                    if (ev.direction === 'up' || ev.direction === 'left') {
                        internal.nudgeDirection = 'left';
                    } else {
                        internal.nudgeDirection = 'right';
                    }
                } else if (distance <= options.nudgeThreshold) {
                    internal.nudgeDirection = 'abort';
                } else {
                    internal.nudgeDirection = null;
                }




                // hey!  infinite scrolling!
                if (options.infinite === true) {
                    if (left <= startOfClones) {
                        left = 0 + ev.distance * delta;
                        internal.scrollStart.left = 0;
                    }
                    if (left >= 0) {
                        left = startOfClones + ev.distance * delta;
                        internal.scrollStart.left = startOfClones;
                    }
                }


                internal.left = left;
				content.css('left', left);

            };

            hammer.ondragend = function () {
                if (delay) {
                    window.clearTimeout(delay);
                }
                $target.stop(true, false);
                that._animate($target, {left: that.computeAdjust($target,'dragend')}, options.speed, function () {
                    that._setArrowVisibility('ondragend');
                    internal.busy = false;
                    if ($.isFunction(options.ondragend)) {
                        options.ondragend(options, internal);
                    }
                });
            };


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

            instanceCount = instanceCount + 1;

            var options = this.options,
                $el = $(this.element),
                $target = $(options.target);

            // unique instance for events
            this.instanceId = '.carousel_' + instanceCount.toString(10);

            // a place to store internal vars used only by this instance of the widget
            this.internal = {
                busy: false,
                currentSlide: 0,
                left: 0,
                targetWidth: 0,
                targetHeight: 0,
                maskWidth: 0,
                maskHeight: 0,
                unitWidth: 0,
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
                slideBumped: false,
                nudgeDirection: null,
                infinite: false,
                numUnits: null,
                numVisibleUnits: null,
                scrollStart: 0,
                touchObject: null
            };

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
                'position': 'relative',
                'left': 0
            });

            //number all the unitElements
            $(options.unitElement).each(function (i) {
                $(this).attr({"data-slide": i});
            });

            // init touch events if applicable
            if (options.dragEvents === true) {
                this._dragEvents();
            }

            this._setArrowEvents();

            // if the target is in a hidden div, this will have to be delayed until they
            // call "redraw" method
            if ($target.not(':hidden')) {
                this._setUnitWidth();
                this._setTargetWidth('first load');
                this._setArrowVisibility('_create');
            }


            if ($.isFunction(options.onRedraw)) {
                options.onRedraw($el, this.internal, options);
            }

            // ios6 scroll issue fix
            if ($('body').data('iosfix'+ this.instanceId) !== true) {
                $(document).on('scroll' + this.instanceId, function () {
                    // trigger touch event
                    $(document).trigger('touchend');
                });
                $('body').data('iosfix',true);
            }

            // be nice to lazy loading
            $(options.target).find('img').trigger('appear');

        },


        /**
         * Force a redraw of the carousel.
         * @public
         * @return void
         */
        redraw: function () {
            var that = this,
                internal = this.internal,
                options = this.options,
                $el = $(this.element);

            // only redraw if the slider is visible, otherwise it gets all zeros
            if ($(options.target).not(":hidden"))  {
                if (this.unitWidth === undefined) {
                    this._setUnitWidth();
                }
                this._setTargetWidth('_redraw (manually called) ' + that.instanceId);
                this._setArrowVisibility('forced redraw');
                if ($.isFunction(this.options.onRedraw)) {
                    that.options.onRedraw($el, internal, options);
                }
            }
        },

        /**
         * return the number of the current slide.  numbering starts at zero.
         * @public
         * @return integer
         */
		getCurrentSlide: function () {
			return this.internal.currentSlide;
		},

        /**
         * Make a specified slide the left-most visible slide in the slider
         * @public
         */
		goToSlide: function (i,a) {
            var that = this,
                internal = this.internal,
				options = this.options,
				$target = $(options.target),
				newLeft;

            a = (a !== undefined) ? a : true;

            // only do stuff if the target is visible, otherwise widths are all 0's
            if ($target.not(":hidden"))  {
                if (this.unitWidth === undefined){
                    this._setUnitWidth();
                }

                if (options.unitWidth === 'individual') {
                    newLeft = $(options.unitElement).eq(i).data("responsiveCarousel").left;
                } else {
                    newLeft = i * internal.unitWidth * -1;
                }
    			internal.busy = true;
                if (a === true) {
                    this._animate($target, {'left': newLeft}, options.speed, function () {
                        internal.busy = false;
                        that._setArrowVisibility('goto slide');
                    });
                } else {
                    $target.css('left',newLeft);
                }
            }

		},

        /**
         * Activate / Deactivate slide show mode.
         * @public
         */
		toggleSlideShow: function () {


			var internal = this.internal;


			if (false === internal.slideShowActive) {
				this.startSlideShow();
			} else {
				this.stopSlideShow();
			}

		},

        _step: function (i) {
            var that = this,
                internal = this.internal,
                options = this.options,
                $target = $(options.target),
                width = internal.maskWidth,
                left = this._round(Math.floor($target.position().left)),
                newLeft = left + i * internal.unitWidth,
                right = left + internal.targetWidth,
                newRight = right + i * internal.unitWidth,
                adjustedLeft = newLeft;


            if (internal.slideBumped === false) {

                if (options.infinite === false) {
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
            internal.busy = true;
            this._animate($target, {'left': adjustedLeft}, options.speed, function () {
                internal.busy = false;
                that._setArrowVisibility('_step');
            });

        },

        startSlideShow: function () {
            var that = this,
                internal = this.internal,
                options = this.options;

            if (false === internal.slideShowActive) {
                internal.slideShowActive = true;
                internal.slideTimer = window.setInterval(function () {
                    that._step(options.step);
                }, options.slideSpeed);
            }
        },

        stopSlideShow: function () {
            var internal = this.internal;

            if (true === internal.slideShowActive) {
                internal.slideShowActive = false;
                window.clearInterval(internal.slideTimer);
            }
        },

        /**
         * Destroy this plugin and clean up modifications the widget has made to the DOM
         * @public
         * @return void
         */
        _destroy: function () {
            var $target = $(this.options.target);
            var $mask = $(this.options.mask);

            // remove events created by this instance
            $(this.options.arrowLeft).unbind(this.instanceId);
            $(this.options.arrowRight).unbind(this.instanceId);
            $target.find('img').unbind(this.instanceId);
            if (this.internal.touchObject !== null) {
                this.internal.touchObject.destroy();
            }
            $(document).unbind(this.instanceId);
            $('body').removeData('iosfix'+ this.instanceId);
            $mask.css({
                '-webkit-user-select' : '',
                '-webkit-user-drag': '',
                '-webkit-tap-highlight-color': ''
            });
            window.setTimeout(function(){
                $target.css({
                    'position': '',
                    'left': '',
                    'width' : ''
                });
            },1);

            // For UI 1.8, destroy must be invoked from the base widget
            // $.Widget.prototype.destroy.call(this);
            // For UI 1.9, there is no need to do anything else, this method has you covered.
        },


        /**
         * Try to keep the leftmost visible element (usually an LI) flush against the left border.
         * Use this to prevent on fractions of elements from being visible.
         * @public
         * @param $target jQuery
         * @param s string Optional string used for debugging
         * @return integer
         */
        computeAdjust : function ($target,s) {


            var internal = this.internal,
                options = this.options,
                left = Math.floor($target.position().left),
                right,
                width = internal.maskWidth,
                newLeft,
                direction = internal.nudgeDirection,
                unitWidth = internal.unitWidth,
                p,
                leftFlag = false;

            // nudged with finger or mouse past the threshold level
            if (direction !== null) {
                if (direction === 'left') {
                    newLeft = left - unitWidth;
                }
                if (direction === 'right') {
                    newLeft = left + unitWidth;
                }
                if (direction === 'abort') {
                    newLeft = internal.scrollStart.left;
                }
                left = newLeft;
                internal.nudgeDirection = null;
            }

            // entire slider is too far left
            right = left + internal.targetWidth;
            if (right < width) {
                newLeft = left + width - right;
                left = newLeft;
                leftFlag = true;
            }

            // entire slider is too far right
            if (left > 0) {
                left = newLeft = 0;
            }


            // keep left most fully visible object aligned with left border
            if (options.unitWidth === 'individual') {
                // when unitWidth is set to 'individual', each slider element has it's own unique width.
                for (var i = 0; i < internal.numUnits; i++) {
                    p = $(options.unitElement).eq(i);
                    if (leftFlag == true) {
                        // if we dragged too far to the left, we are trying to see the menu item on the far right.
                        if (internal.targetWidth > width) {
                            newLeft = internal.maskWidth - internal.targetWidth;
                        }
                    } else {
                        // if we didn't drag too far to the left, the go to nearest interval
                        if (Math.abs(left) >= p.data('responsiveCarousel').left && Math.abs(left) <= p.data('responsiveCarousel').right) {
                           newLeft = p.data('responsiveCarousel').left * -1;
                           break;
                       }
                    }

                }
                // get rid of sub pixels
                // newLeft = Math.floor(newLeft);
            } else {
                // all other options for options.unitWidth  (integer, compute, inherit) have uniform widths
                // move to the closest left border via _round()
                newLeft = this._round(left);
            }

            // compute the number of the left-most slide and store the number of the left-most slide
            return newLeft;
        }


    });

}(jQuery, window, document));
