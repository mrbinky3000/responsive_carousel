Obviously, this repo is no longer maintained.  However, if you still use jQuery UI, drop me a line and I might help.  In the meantime, check out my new carousel for React, Pure React Carousel [[github]](https://github.com/express-labs/pure-react-carousel#readme) [[demo]](https://express-labs.github.io/pure-react-carousel/)


# Responsive Carousel

A fully responsive carousel [jQuery UI widget](http://jqueryui.com/widget/ "jQuery UI widget documentation") that works on desktop browsers, iPhones, iPads, and even older Androids.* It can be configured to respond to touch events, mouse events, or both.  You can use the left and right arrows and/or use your finger or mouse to swipe the carousel left and right.  Combine with the popular lazyLoad.js plugin to lazy load images in your carousel, thus cutting page load times (great for mobile). The code is currently is in the form of a jQuery UI widget and relies on hammer.js to handle the touch events.

### Stand-out Features:

- FAST.  Uses css transitions.  Code optimized to use as few redraws as possible.  Always getting faster.
- Continuous infinite scrolling.  Hold down a navigation arrow and keep holding it down. No need to keep clicking or tapping.
- You can have slide "units" of different widths!  Great for navigation menus.
- A callback function that lets you specify the number of units to show at different width
- Loose HTML. This doesn't force you to use certain HTML structures.  Your navigation can be anywhere in the DOM.
- Optionally works with the popular [Lazy Load jQuery Plugin](http://www.appelsiini.net/projects/lazyload) Images that are out of view are not loaded until the user interacts with the carousel.



You don't need all of jQuery UI or any of the theme assets (images, css, etc). All you need is the jQuery UI core and the widget factory.  Here is a [link](http://jqueryui.com/download/#!version=1.10.0&themeParams=none&components=1100000000000000000000000000000000 "jQuery UI with min needed options") to the download page with the minimum jQuery UI options checked for you. [LINK](http://jqueryui.com/download/#!version=1.10.0&themeParams=none&components=1100000000000000000000000000000000 "jQuery UI with min required options.")

See it in Action:

- [Example 1](http://matthewtoledo.com/creations/responsive-carousel/example/example-1.html) : A simulated product shelf.  The number and size of the boxes change based on the width of the window.
- [Example 2](http://matthewtoledo.com/creations/responsive-carousel/example/example-2.html) : A simulated hero slide show.  There is only one unit visible at a time.  Uses callbacks to add more functionality to the slideshow.
- [Example 3](http://matthewtoledo.com/creations/responsive-carousel/example/example-3.html) : Same as example 1 but with added infinite scrolling.
- [Example 4](http://matthewtoledo.com/creations/responsive-carousel/example/example-4.html) : A slideshow showing 2 slides at a time and featuring infinite scrolling.
- [Example 5](http://matthewtoledo.com/creations/responsive-carousel/example/example-5.html) : Horizontal navigation demo with units of different widths.

*The carousel animation runs a little slow on some older Androids that don't 
support CSS3 transitions.  If Facebook's javascript API is also included on the page it will
further slow down older Androids because Facebook causes page reflows every few milliseconds.





## Supported Browsers
Please help me out by testing on other browsers so I can add to the support list. I have tested this on the following browsers:
- IE7 and higher
- Chrome 21 and higher
- Mobile Chrome Browser 20 and higher (Android 4.2 and higher)
- Safari 5.1.7 and higher
- Mobile Safari (iPhone / iPad) 5.1.7 and higher
- FireFox 14 and higher
- Android Browser (~Chrome 12-ish, Approximately, Android 4.0 to 4.1)


## Overhead
How many KB does it take to get your Note: These are non-gzipped sizes.  Using gzip compression on your server can decrease sizes even more.
- 32kb : jQuery
- 8kb : jQuery UI (you ONLY need the core and widget factory)
- 2kb : hammer.js
- 2.4kb : Modernizer (you only need the "CSS3 Transitions" test)
- 10kb : responsiveCarousel.min.js (note, when gzip compression is enabled on your server, the size is 3kb)

Total overhead (without gzip): **54.4kb** (However, you're already using jQuery on your site for other things, so the overhead is really **22.4kb**, and if you are already using jQuery UI, then overhead added by this script drops to **14.4kb**.)


## History

This code was born out of necessity. I needed a swipe-able carousel that would work on Androids* as well as iOS devices. There were a lot of responsive carousels, but none of the ones I found worked on older Androids.  If they did, they often had reduced functionality. They also usually added a lot of HTML that I couldn't easily alter.

I took care to minimize the number of reflows caused by the code.   I used the timeline tool in Chrome to find and eliminate all but the most-necessary 
reflows. I also use fast CSS3 transitions that fall back to jQuery's default
$.animation() method.



## To Do List

- Make it so that you can choose which touch events library you want to use.  Right now it requires hammer.js, but lets say you preferr swipe.js.
- ~~Automatic slide show option.  Should be easy enough.~~ DONE!
- ~~get-able property with the currently left-most visible slide unit~~ DONE!
- ~~Infinite scroll / slide show  (Buggy beta version available in experimental branch.  Will most likely re-write infinite scroll with new approach.)~~ DONE!
- ~~slides of different widths~~ DONE!


## Known Bugs

Please report any bugs encountered!  I will fix em'

- none so far. Please notify me if some are found


## Config Options

Here are the default options:

```javascript
{
	options: {
	    arrowLeft: '.arrow-left',
	    arrowRight: '.arrow-right',
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
	    delta: 1,
	    dragVertical: false,
	    dragPreventDefault: false,
	    lazyload: false // work with lazyload.js plugin http://www.appelsiini.net/projects/lazyload
	},
}
```


#### arrowLeft  (css selector string)
A css selector representing the left arrow.  NOTE: This should be a span or other element instead of an anchor tag.  Our
responsiveCarousel script lets you hold down the arrow buttons for continuous scrolling.  If the arrows are anchor tags,
Android devices will prompt you to save the target URL for the anchor. It's impossible to turn this "feature" off. Don't
make the arrows anchors or buttons.  I recommend div or span elements. the script will attach the correct event
listeners.  You just need to add css so when the mouse hovers over your arrow element, it gets the same pointer as an
anchor tag.

Your arrow tags can be ANYWHERE on the page.  They do not need to be children of the DOM element where you attached
responsiveCarousel.  Heck, you can even attach the carousel to $(document) if you like. You can also set your select in
such a way that you can have multiple buttons that control the slider.

#### arrowRight (css selector string)
See above.

#### mask (css selector string)
A css selector representing the immediate parent of the the target element.  This element has visibility set to
"overflow hidden" and helps us give the illusion of a horizontal scroll. Do not give the mask CSS borders, margins or
padding.

#### target (css selector string)
A css selector representing the actual DOM element that will slide behind the masking dom element.  Usually this is an
unordered list containing list elements. Do not give CSS borders, margin, or padding to the target.

#### unitElement  (css selector string)
A css selector representing the child elements of target.  Usually, these are list elements.  Do not apply border,
margin, or padding to these elements. If you need spacing, add div's inside the unitElement and apply borders, padding,
and margins to the div.

#### unitWidth  (string)
__You're going to want to set this to 'compute' on responsive sites.__   'compute' relies on the responsiveUnitSize
function below to provide the number of units to show in the carousel at a particular width.
[See example 1](http://matthewtoledo.com/creations/responsive-carousel/example/example-1.html) for details.

 The default, 'inherit', inherits the width from your current CSS and is best suited for static, non-responsive sites.

 There is a new option added in 1.5, 'individual'.  This lets you have list elements of different (read: non-uniform)
 widths.  I created this so that I could have a horizontally scrolling navigation menu like some native mobile apps do.
 [See example 5](http://matthewtoledo.com/creations/responsive-carousel/example/example-5.html)

#### responsiveUnitSize (function)
This is only required if unitWidth is set to 'compute'.  See full details in the "Callback Options" section of the
documentation.

#### dragEvents (boolean)
Setting this to "true" enables touch & mouse drag events.  false turns them off.  Hint:  Modernizr's property,
Modernizr.touch, returns a boolean true or false.  You can enable "mousedrag" events on desktop computers if this is set
to true for non-touch devices.  Note:  mousedrag only works best on carousels that do not contain images or anchor tags,
as your browser lets you drag images and anchors to new tabs so you can open them.  This is built-in browser behavior
that is hard to prevent reliably across all browsers.

#### easing (string)
Used when "cssAnimations" option is set to boolean true. This is the same as the css-animation-timing property options
for CSS3 transitions.  To recap, they are: 'linear','ease','ease-in','ease-out','ease-in-out', and
'cubic-bezier(n,n,n,n)' [More details here](http://www.w3schools.com/cssref/css3_pr_animation-timing-function.asp)

#### speed   (integer)
Number milliseconds it takes to scroll one unitWidth to the left or right when you click on an arrow or during the slide
show.

#### slideSpeed  (integer)
Number of milliseconds to pause on each slide in a slideshow.

#### step (integer)
How many unitWidths to move to the left or right during a slide show.  -1 moves 1 unitWidth to the left. Positive
numbers move to the right. Hint:  You can go by groups of four or five.  Set this option to a function that returns an
integer for more dynamic / responsive results.

#### cssAnimations (boolean)
If the browser supports css3, then we use the much faster css3 transitions.  Otherwise, fall back to slower
(on older devices) jQuery animations.

#### nudgeThreshold (integer)
The minimum amount of pixels the user must drag the target before we force a slide one unit to the left or right.  If
your carousel scrolls too easily on mobile devices when you scroll the page vertically, you can increase this value.
Just make sure that it's generally less than 1/3 the minimum width you anticipate for each carousel unit element.

#### infinite (boolean)
Set this to true to have infinite scrolling. This means when you reach the ends of carousel, the carousel starts over
again.  Hint: Combine infinite with toggleSlideShow() to have an infinite slide show.
See [Example 3](http://matthewtoledo.com/creations/responsive-carousel/example/example-3.html "Example 2") and
[Example 4](http://matthewtoledo.com/creations/responsive-carousel/example/example-4.html "Example 4")

#### delta (integer)
A force-multiplier for dragging slides, like a lever, that increases the speed the carousel moves when you drag it
from side to side. The larger the number, the faster your slider will slide to the left or right when dragging.

#### lazyLoad (boolean)
Use the [Lazy Load](http://www.appelsiini.net/projects/lazyload) plugin for jQuery in combination with this plugin.
Carousels exist so they can contain a lot of information "above the fold" (I know, there is no fold on the Interwebz,
but clients still ask for stuff above it.)  As a result a lot of images can load that aren't even used unless the user
interacts with the carousel.  To use this option, include lazyLoad.js in your page and format your image tags according
to that plug-in's documentation.  When the carousel is created, all the visible images are loaded by default but
the images that are not visible are deferred until the user starts to interact with the carousel by pressing the
navigation arrows, moving their mouse over the carousel, or using their finger to drag the carousel.

    <img data-original=“img/example.jpg” src=“img/grey.gif”>


## Callback Options

#### responsiveUnitSize  (function)
Arguments passed to this function by responsiveCarousel are: $el, internal, options.  This is only used if your
unitWidth is set to 'compute'.  It is a callback function that should return an integer representing the number of
unitElements that should be visible in the carousel  at one time.  See the examples
([Example 1](http://matthewtoledo.com/creations/responsive-carousel/example/example-1.html), [Example 2](http://matthewtoledo.com/creations/responsive-carousel/example/example-2.html)) for more details.  Here is an example of usage below.

```javascript
    var winW;

    $(window).on('resize',function(){
        winW = $(window).width();
    });

	$elem.responsiveCarousel({
        infinite:       false,
        target:         '.slider-target',
        unitElement:    '.slider-target > li',
        mask:           '.slider-mask',
        arrowLeft:      '.arrow-left',
        arrowRight:     '.arrow-right',
        unitWidth:      'compute',

        dragEvents: Modernizr.touch,
        responsiveUnitSize: function () {
            var i = 4;
            if ( winW < 800 ) { i = 3; }
            if ( winW < 600 ) { i = 2; }
            if ( winW < 400 ) { i = 1; }
            return i;
        }
    });
```

#### onRedraw  (function)
A callback function that fires whenever something happens that would affect the size of stuff in the slider, e.g.
when the carousel is first created, after a window resize, after an image gets loaded in the carousel, etc.
Arguments passed to this function by responsiveCarousel are: $el, internal, options. Can be called manually to.
See examples. ([Example 1](http://matthewtoledo.com/creations/responsive-carousel/example/example-1.html),
[Example 2](http://matthewtoledo.com/creations/responsive-carousel/example/example-2.html))

#### ondragstart (function)
A callback function that is fired when dragging starts. Arguments passed to this function by responsiveCarousel are: options, internal.

#### ondragend (function)
A callback function that is fired when dragging ends. Arguments passed to this function by responsiveCarousel are: options, internal.

#### responsiveStep (function)
NOT IMPLEMENTED YET:  It will be a function that returns an integer representing the number of unitWidths to slide during a slide show or when arrows are pressed.

#### onShift  (function)
A callback function that is triggered after the carousel is moved to the left or right any amount of unitWidths.  Arguments passed to this function by responsiveCarousel are: i (the number of the current left-most visible slide starting from 0). Could for triggering other events on the page. based on the current left-most visible slide.  [See example 2](http://matthewtoledo.com/creations/responsive-carousel/example/example-2.html) to see this in use.  Note for IE8:  If you use custom web fonts (glyphs) in any of the slides, or for signposts (signposts = those dots in the slideshow example) then don't use [data-icon]:before to insert the glyphs.  It will cause onShift to seem like it's miss-firing.


## Methods

Since this is a jQuery UI widget, you can call these public methods like so:

```javascript
$([CSS Selector]).responsiveCarousel('[method name]', [arguments]);
```

#### startSlideShow()
Starts up the slide show.

#### stopSlideShow()
Derrrrrr. Stops the slide show.

#### toggleSlideShow()
Starts / stops the slide show. You might want a button or anchor tag someplace to turn on the slide show, or add it to a dom-ready event for an auto-start feature. Example of usage:

```javascript
$('#example-2').responsiveCarousel('toggleSlideShow');
```	

#### redraw()
Force a redraw of the carousel.  THIS IS HANDY IF YOUR CAROUSEL WAS HIDDEN.  Elements that are hidden on page load have no dimensions.  You will need to call redraw once they become visible.  Example of usage:

```javascript
$('.some-button').toggle('#slider-wrap');
if ($('#slider-wrap').is(':visible')) {
  $('#example-2').responsiveCarousel('redraw');
}
```

#### goToSlide(i,a)
Jump to slide i (numbering starts at zero). Set "a" to true to use animation. Set "a" to false to just jump to the slide without animation.  If you leave out "a", it defaults to true.

#### destroy()
Clean up all event handlers and HTML added by this widget.






## Change Log

### Version 1.7.3 - 6/27/2013
- Bug fixes for the "individual" mode ("individual" is when slides in the carousel have different fixed widths)
- Further speed enhancements for "individual" mode by using reverse while loops

### Version 1.7.0 - 5/22/2013
- MAJOR bug fixes on all fronts due to tons of time spent Q.A.-ing the carousel for a major client.  Tons of updates in
speed, functionality, optimization, and improvements to the carousel when in 'individual' mode.

### Version 1.5.2 - 3/5/2013
- The latest update to Apple's OS introduced a scrolling bug that causes the carousels to become non-responsive.  Fixed.
- Fixed issues when a carousel is created in a hidden parent container.
- Various ie8, ie9, Apple fixes.  Please note: webfonts + [data-icon]:before = onShift callback FAIL!  Nothing I can do about this one, it's ie8.

### Version 1.5.1 - 2/15/2013
- Bugfix where internal.nudgeDirection was never reset to null between nudges causing unwanted slider advancement under certain conditions
- onShift function was returning fractions of pixels or NAN if the carousel was hidden.
- hammer.js "swipe" event was causing weirdness.  Disabled, as it is unnecessary for our needs.

### Version 1.5.0 - 2/11/2013
- I had to invest LOTS of time into getting this ready for a major Fortune 500 client.  It's no longer beta.  It's ready for the real world! (It better be, because it's going to be used a lot on that web site)

### Version 0.5.1 - 1/16/2013
- Bugfixes with nudgeThreshold option.  It was sometimes skipping a unit, going from 1 to 3 bypassing 2, for example. Fixed now.

### Version 0.5.0 - 1/15/2013
- New Feature: Infinite Scrolling!
- Bugfixes and speed enhancements

### Version 0.4.0 - 1/10/2013
- Bugfix. Script to determine vendor prefix for CSS transitions were not working on Firefox.  Switched to a new method.
- Added "nudgeThreshold" option so people can slide to the next slide with a little flick instead of dragging half the distance of the entire slide.  I think this improves the user experience.
- Updated example 1 so that people can use their mouse to drag the carousel on non-touch screens.
