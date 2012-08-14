Responsive Carousel
===================

A fully responsive carousel that works on desktop browsers, iPhones, iPads, and even Droid.* It can be 
configured to respond to touch events, mouse events, or both.  You can use the left and right arrows and/or 
use your finger or mouse to swipe the carousel left and right.  The code is currently is in the form of a jQuery UI
widget and relies on hammer.js to handle the touch events.

Overhead
--------
- jQuery ~32kb
- jQuery UI (you only need the core and widget factory) ~8kb
- hammer.js ~2kb
- Modernizer (you only need the "Css Transitions" option) ~2.4kb

Total overhead: 44.5kb (but you're prob already using jquery, so really it's like 12.4kb)

History
-------
This code was born out of necessity. I needed a swipe-able carousel that would work on Androids* as well as iOS devices. There were a lot of responsive carousels, but none of the ones I found worked on older Androids.  If they did, they often had reduced functionality.

I took care to minimize the number of reflows caused by the code.   I used the timeline tool in Chrome to find and eliminate all but the most-necessary reflows. I also
use CSS3 transitions that fall back to jQuery's default $.animation() method.

Wishlist
--------
- Make it so that you can choose which touch events library you want to use.  Right now it requires hammer.js, but lets say you preferr swipe.js.
- automatic slide show.  Should be easy enough.

Known Bugs
----------
- Things get weird if a user touches both the left and right scroll arrows at the same time.
- Long-presses on Androids bring up a popup menu dialog.  Still need to figure out how to suppress that.
- Sometimes arrows become un responsive if you press them in rapid succession.  A quick swipe with your finger seems to make the arrows respond again.
- Including Facebook's "Like" buttons on the same page as the carousel slows the heck out of the carousel on older Droids.  This is because Facebook's javascript is contantly causing the broswer to do a reflow every few milliseconds.

*The carousel runs a little slow on some older Androids.  Facebook's javascript API further slows down older Androids.

How To Use
==========
1) You need to supply a small, simple function that returns an integer with the number of elements you want in the carousel.  Your callback function can poll the size of the current window, or any other dom element, and then make a decision.  