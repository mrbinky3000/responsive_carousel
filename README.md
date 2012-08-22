#Responsive Carousel

A fully responsive carousel that works on desktop browsers, iPhones, iPads, and
even older Androids.* It can be configured to respond to touch events, mouse 
events, or both.  You can use the left and right arrows and/or use your finger 
or mouse to swipe the carousel left and right.  The code is currently is in the 
form of a jQuery UI widget and relies on hammer.js to handle the touch events.

See it in Action:
- [Example 1](http://matthewtoledo.com/creations/responsive-carousel/example/example-1.html) : A simulated product shelf.  The number and size of the boxes change based on the width of the window.
- [Example 2](http://matthewtoledo.com/creations/responsive-carousel/example/example-2.html) : A simulated hero slide show.  There is only one unit visible at a time.  Uses callbacks to add more functionality to the slideshow.

*The carousel animation runs a little slow on some older Androids that don't 
support CSS3 transitions.  If Facebook's javascript API is also included on the 
page it will further slow down older Androids because Facebook causes page 
reflows every few miliseconds.

##Supported Browsers
Please help me out by testing on other browsers so I can add to the support list. I have tested this on the following browsers:
- IE7 and higher
- Chrome 21 and higher
- Safari 5.1.7 and higher
- FireFox 14 and higher
- iPhone / iPad (safari)
- Android Browser (~Chrome 12)

##Overhead

- 32kb : jQuery
- 8kb : jQuery UI (you only need the core and widget factory)
- 2kb : hammer.js
- 2.4kb : Modernizer (you only need the "CSS3 Transitions" test)

Total overhead: 44.5kb (but you're prob already using jquery, so really it's like 12.4kb)

##History

This code was born out of necessity. I needed a swipe-able carousel that would 
work on Androids* as well as iOS devices. There were a lot of responsive 
carousels, but none of the ones I found worked on older Androids.  If they did, 
they often had reduced functionality.

I took care to minimize the number of reflows caused by the code.   I used the 
timeline tool in Chrome to find and eliminate all but the most-necessary 
reflows. I also use fast CSS3 transitions that fall back to jQuery's default
$.animation() method.

##To Do List

- Make it so that you can choose which touch events library you want to use.  Right now it requires hammer.js, but lets say you preferr swipe.js.
- ~~Automatic slide show option.  Should be easy enough.~~ DONE!
- ~~get-able property with the currently left-most visible slide unit~~ DONE!
- Infinite scroll / slide show

##Known Bugs

- Things get weird if a user touches both the left and right scroll arrows at the same time.
- Sometimes arrows become un responsive if you press them in rapid succession on iPads / iPhones.  A quick swipe with your finger seems to make the arrows respond again.
- Including Facebook's "Like" buttons on the same page as the carousel slows the heck out of the carousel on older Droids.  This is because Facebook's javascript is contantly causing the broswer to do a reflow every few milliseconds.

##Config Options

Here are the default options:

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
true enables touch & mouse drag events.  false turns them off.  Hint:  Modernizr.touch

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