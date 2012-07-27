Responsive Carousel
===================

A fully responsive carousel that works on desktop browsers, iPhones, iPads, and even Droid.* It can be 
configured to respond to touch events, mouse events, or both.  You can use the left and right arrows and/or 
use your finger or mouse to swipe the carousel left and right.  The code is currently is in the form of a jQuery UI
widget and relies on hammer.js to handle the touch events.

Requirements
------------
- jQuery (~32kb)
- jQuery UI core and jQuery UI widget (~8k)
- hammer.js (~2k)

History
-------
This code was born out of necessity. I needed a swipe-able carousel that would work on Droids* as well as iOS devices.
There were a lot of responsive carousels, but none of the ones I found worked on Droids.  If they did, they often had
reduced functionality.

I took care to minimize the number of reflows caused by the code.   I used the timeline tool in Chrome to find and eliminate all but the most-necessary reflows.

Wishlist
--------
- Make it so that you can choose which touch events library you want to use.  Right now it requires hammer.js, but lets say you preferr swipe.js.


Known Bugs
----------
- Things get weird if a user touches both the left and right scroll arrows at the same time.
- Long-presses on Droids bring up a popup menu dialog.  Still need to figure out how to suppress that.
- Sometimes arrows become un responsive if you press them in rapid succession.  A quick swipe with your finger seems to make the arrows respond again.
- Including Facebook's "Like" buttons on the same page as the carousel slows the heck out of the carousel on older Droids.  This is because Facebook's javascript is contantly causing the broswer to do a reflow every few milliseconds.

*The carousel runs a little slow on some droids.

How To Use
==========
1) You need to supply a small, simple function that returns a width in integer form.  This is the "responsive" part.  Your function will basically look at the size of something, like the window, and then determine how many things to show in the carousel. 