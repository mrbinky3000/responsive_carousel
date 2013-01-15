#Responsive Carousel

A fully responsive carousel [jQuery UI widget](http://jqueryui.com/widget/ "jQuery UI widget documentation") that works on desktop browsers, iPhones, iPads, and even older Androids.* It can be configured to respond to touch events, mouse events, or both.  You can use the left and right arrows and/or use your finger or mouse to swipe the carousel left and right.  The code is currently is in the form of a jQuery UI widget and relies on hammer.js to handle the touch events.

You don't need all of jQuery UI or any of the theme assets (images, css, etc). All you need is the jQuery UI core and the widget factory.  Here is a [link](http://jqueryui.com/download/#themeParams=none&zComponents=5d000001005702000000000000003d8889a73445cfa2549752eb7d5b0fde05c98ebf91d7c7d9c45fea7207439222bfdeef8f217649db6e5aea9e164adfe948b6de7623420184c14e9dc8d7d811a9c755a71664e483f3459d92b441d01744f148ef2cc79f5870e3311a9e94d1e42f9b0cad1022ed5169c595ea345a6afcc38b75ce0586a3496e04001d04b0690257fd1cbb11395fd272cb91887639ea5f9f9b23259ee98fdaa0b3949c67f9028bb471dbc04c14d875384b78a68872ab02462330b6265c29802a99ddb915c78cafd3be102e26c7193ae335a4109f5f269618a9f0ffe5690f75 "jQuery UI with min needed options") to the download page with the minimum jQuery UI options checked for you. [LINK](http://jqueryui.com/download/#themeParams=none&zComponents=5d000001005702000000000000003d8889a73445cfa2549752eb7d5b0fde05c98ebf91d7c7d9c45fea7207439222bfdeef8f217649db6e5aea9e164adfe948b6de7623420184c14e9dc8d7d811a9c755a71664e483f3459d92b441d01744f148ef2cc79f5870e3311a9e94d1e42f9b0cad1022ed5169c595ea345a6afcc38b75ce0586a3496e04001d04b0690257fd1cbb11395fd272cb91887639ea5f9f9b23259ee98fdaa0b3949c67f9028bb471dbc04c14d875384b78a68872ab02462330b6265c29802a99ddb915c78cafd3be102e26c7193ae335a4109f5f269618a9f0ffe5690f75 "jQuery UI with min required options.")

See it in Action:

- [Example 1](http://matthewtoledo.com/creations/responsive-carousel/example/example-1.html) : A simulated product shelf.  The number and size of the boxes change based on the width of the window.
- [Example 2](http://matthewtoledo.com/creations/responsive-carousel/example/example-2.html) : A simulated hero slide show.  There is only one unit visible at a time.  Uses callbacks to add more functionality to the slideshow.
- [Example 3](http://matthewtoledo.com/creations/responsive-carousel/example/example-3.html) : Same as example 1 but with added infinite scrolling.
- [Example 2](http://matthewtoledo.com/creations/responsive-carousel/example/example-4.html) : A slideshow showing 2 slides at a time and featuring infinite scrolling.

*The carousel animation runs a little slow on some older Androids that don't 
support CSS3 transitions.  If Facebook's javascript API is also included on the page it will further slow down older Androids because Facebook causes page reflows every few miliseconds.





##Supported Browsers
Please help me out by testing on other browsers so I can add to the support list. I have tested this on the following browsers:
- IE7 and higher
- Chrome 21 and higher
- Safari 5.1.7 and higher
- FireFox 14 and higher
- iPhone / iPad (safari)
- Android Browser (~Chrome 12)




##Overhead
How many KB does it take to get your Note: These are non-gzipped sizes.  Using gzip compression on your server can decrease sizes even more.
- 32kb : jQuery
- 8kb : jQuery UI (you ONLY need the core and widget factory)
- 2kb : hammer.js
- 2.4kb : Modernizer (you only need the "CSS3 Transitions" test)
- 10kb : responsiveCarousel.min.js (note, when gzip compression is enabled on your server, the size is 3kb)

Total overhead (without gzip): **54.4kb** (However, you're already using jQuery on your site for other things, so the overhead is really **22.4kb**, and if you are already using jQuery UI, then overhead added by this script drops to **14.4kb**.)


##History

This code was born out of necessity. I needed a swipe-able carousel that would work on Androids* as well as iOS devices. There were a lot of responsive carousels, but none of the ones I found worked on older Androids.  If they did, they often had reduced functionality. They also usually added a lot of HTML that I couldn't easily alter.

I took care to minimize the number of reflows caused by the code.   I used the timeline tool in Chrome to find and eliminate all but the most-necessary 
reflows. I also use fast CSS3 transitions that fall back to jQuery's default
$.animation() method.



##To Do List

- Make it so that you can choose which touch events library you want to use.  Right now it requires hammer.js, but lets say you preferr swipe.js.
- ~~Automatic slide show option.  Should be easy enough.~~ DONE!
- ~~get-able property with the currently left-most visible slide unit~~ DONE!
- ~~Infinite scroll / slide show  (Buggy beta version available in experimental branch.  Will most likely re-write infinite scroll with new approach.) DONE!


##Known Bugs

Please report any bugs encountered!  I will fix em'

- ~~Things get weird if a user touches both the left and right scroll arrows at the same time. Seems to be fixed!
- Sometimes arrows become un responsive if you press them in rapid succession on older iPads / iPhones.  A quick swipe with your finger seems to make the arrows respond again.
- ~~Including Facebook's "Like" buttons on the same page as the carousel slows the heck out of the carousel on older Droids.  This is because Facebook's javascript is constantly causing the browser to do a repaint every few milliseconds. Seems to be fixed!
- As of Chrome 18 for mobile, while holding down the arrows for continuous sliding, sometimes the animation stops for some unknown reason.  Chrome is starting their rapid-update schedule for their mobile browser starting in March of 2013, so hopefully this issue goes away. 


##Config Options

Here are the default options:

        options: {
            arrowLeft: '.arrow-left span',
            arrowRight: '.arrow-right span',
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
            cssAnimations: Modernizr.csstransitions,
            nudgeThreshold: 10,
			infinite: false
        },

####arrowLeft  (string)
A css selector representing the left arrow.  Hint:  you can make this a specific anchor tag, or have several elements on a page that scroll the carousel to the left.

####arrowRight (string)
A css selector representing the right arrow.

####target (string)
A css selector representing the actual DOM element that will slide behind the masking dom element.  Usually an unordered list containing list elements. This must be a child element of the carousel.

####mask (string)
A css selector representing the immediate parent of the the target element.  This element is set to overflow hidden and helps us give the illusion of a horizontal scroll. This must be a child element of the carousel.

####unitElement  (string)
A css selector representing the child elements of target.  Usually, these are list elements.  CSS NOTE: Do not apply border, margin, or padding to these elements.

####unitWidth  (string)
__You're going to want to set this to 'compute' on responsive sites.__   The default, 'inherit', inherits the width from your current CSS and is best suited for static sites. 'compute' relies on the responsiveUnitSize function below to provide the number of units to show in the carousel at a particular width. [See example 1](http://matthewtoledo.com/creations/responsive-carousel/example/example-1.html) for details.

####responsiveUnitSize  (function)
A callback function that returns an integer representing the number of unitElements that should be visible in the carousel  at one time.  See the examples ([Example 1](http://matthewtoledo.com/creations/responsive-carousel/example/example-1.html), [Example 2](http://matthewtoledo.com/creations/responsive-carousel/example/example-2.html)) for more details.

####onRedraw  (function)
A callback function that is implemented whenever the page is done resizing.  Can be called manually to.  See examples. ([Example 1](http://matthewtoledo.com/creations/responsive-carousel/example/example-1.html), [Example 2](http://matthewtoledo.com/creations/responsive-carousel/example/example-2.html))

####dragEvents (boolean)
true enables touch & mouse drag events.  false turns them off.  Hint:  Modernizr.touch returns true/false.

####speed   (integer)
Number milliseconds it takes to scroll one unitWidth to the left or right when you click on an arrow or during the slide show.

####slideSpeed  (integer)
Number of milliseconds to pause on each slide in a slideshow.

####step (integer)
How many unitWidths to move to the left or right during a slide show.  -1 moves 1 unitWidth to the left. Positive numbers move to the right. Hint:  You can go by groups of four or five.  Use a function that returns an integer for more dynamic / responsive results.

####responsiveStep (function)
A function that returns an integer representing the number of unitWidths to slide when the arrows are pressed.

####onShift  (function)
A callback function that is triggered after the carousel is moved to the left or right any amount of unitWidths.  Could for triggering other events on the page based on the current left-most visible slide.  [See example 2](http://matthewtoledo.com/creations/responsive-carousel/example/example-2.html) to see this in use.

####cssAnimations (boolean)
If the browser supports css3, then we use the much faster css3 transitions.  Otherwise, fall back to slower (on older devices) jQuery animations.

####nudgeThreshold (integer)
The minimum amount of pixels the user must drag the target before we force a slide one unit to the left or right.

####infinite (boolean)
Set this to true to have infinite scrolling. This means when you reach the ends of carousel, the carousel starts over again.  Hint: Combine infinite with toggleSlideShow() to have an infinite slide show. See [Example 3](http://matthewtoledo.com/creations/responsive-carousel/example/example-3.html "Example 2") and [Example 4](http://matthewtoledo.com/creations/responsive-carousel/example/example-4.html "Example 4")




## Methods

Since this is a jQuery UI widget, you can call these public methods like so:

	$([CSS Selector]).responsiveCarousel('[method name]', [arguments]);

####toggleSlideShow()
Call to activate the slide show. Call again to deactivate. You might want a button or anchor tag someplace to turn on the slide show, or add it to a dom-ready event for an auto-start feature. Example of usage:

	$('#example-2').responsiveCarousel('toggleSlideShow');

####redraw()
Force a redraw of the carousel.

####goToSlide(i,a)
Jump to slide i (numbering starts at zero). Set "a" to true to use animation. Set "a" to false to just jump to the slide without animation.  If you leave out "a", it defaults to true.

####destroy()
Clean up all event handlers and HTML added by this widget. 





##Change Log

#### Version 0.5.0 - 1/15/2013
- New Feature: Infinite Scrolling!
- Bugfixes and speed enhancements

#### Version 0.4.0 - 1/10/2013
- Bugfix. Script to determine vendor prefix for CSS transitions were not working on Firefox.  Switched to a new method.
- Added "nudgeThreshold" option so people can slide to the next slide with a little flick instead of dragging half the distance of the entire slide.  I think this improves the user experience.
- Updated example 1 so that people can use their mouse to drag the carousel on non-touch screens.
