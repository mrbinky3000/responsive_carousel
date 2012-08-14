#Responsive Carousel


A fully responsive carousel that works on desktop browsers, iPhones, iPads, and even Droid.* It can be 
configured to respond to touch events, mouse events, or both.  You can use the left and right arrows and/or 
use your finger or mouse to swipe the carousel left and right.  The code is currently is in the form of a jQuery UI
widget and relies on hammer.js to handle the touch events.

##Overhead

- jQuery ~32kb
- jQuery UI (you only need the core and widget factory) ~8kb
- hammer.js ~2kb
- Modernizer (you only need the "Css Transitions" option) ~2.4kb

Total overhead: 44.5kb (but you're prob already using jquery, so really it's like 12.4kb)

##History

This code was born out of necessity. I needed a swipe-able carousel that would work on Androids* as well as iOS devices. There were a lot of responsive carousels, but none of the ones I found worked on older Androids.  If they did, they often had reduced functionality.

I took care to minimize the number of reflows caused by the code.   I used the timeline tool in Chrome to find and eliminate all but the most-necessary reflows. I also
use CSS3 transitions that fall back to jQuery's default $.animation() method.

##Wishlist

- Make it so that you can choose which touch events library you want to use.  Right now it requires hammer.js, but lets say you preferr swipe.js.
- automatic slide show.  Should be easy enough.

##Known Bugs

- Things get weird if a user touches both the left and right scroll arrows at the same time.
- Long-presses on Androids bring up a popup menu dialog.  Still need to figure out how to suppress that.
- Sometimes arrows become un responsive if you press them in rapid succession.  A quick swipe with your finger seems to make the arrows respond again.
- Including Facebook's "Like" buttons on the same page as the carousel slows the heck out of the carousel on older Droids.  This is because Facebook's javascript is contantly causing the broswer to do a reflow every few milliseconds.

*The carousel runs a little slow on some older Androids.  Facebook's javascript API further slows down older Androids.

##How To Use

1) need to supply a small, simple function that returns an integer with the number of elements you want in the carousel.  Your callback function can poll the size of the current window, or any other dom element, and then make a decision.  


##Example

###HTML
<pre><code>
  &lt;div class=&quot;slider&quot;&gt;
		&lt;div class=&quot;slider-nav&quot;&gt;
			&lt;div class=&quot;arrow-left arrow&quot;&gt;&lt;a href=&quot;#&quot; title=&quot;Back&quot;&gt;&lt;/a&gt;&lt;/div&gt;
			&lt;div class=&quot;arrow-right arrow&quot;&gt;&lt;a href=&quot;#&quot; title=&quot;Next&quot;&gt;&lt;/a&gt;&lt;/div&gt;
		&lt;/div&gt;
		&lt;div class=&quot;slider-mask-wrap&quot;&gt;
			&lt;div class=&quot;slider-mask&quot;&gt;
				&lt;ul class=&quot;slider-target&quot;&gt;
					&lt;li&gt;&lt;/li&gt;
					&lt;li&gt;&lt;/li&gt;
					&lt;li&gt;&lt;/li&gt;
					&lt;li&gt;&lt;/li&gt;
					&lt;li&gt;&lt;/li&gt;
					&lt;li&gt;&lt;/li&gt;
					&lt;li&gt;&lt;/li&gt;
					&lt;li&gt;&lt;/li&gt;
					&lt;li&gt;&lt;/li&gt;
					&lt;li&gt;&lt;/li&gt;
					&lt;li&gt;&lt;/li&gt;
					&lt;li&gt;&lt;/li&gt;
				&lt;/ul&gt;
				&lt;div class=&quot;clearit&quot;&gt;&lt;/div&gt;
			&lt;/div&gt;
		&lt;/div&gt;
	&lt;/div&gt;
</code></pre>

###JavaScript


    // set up the carousel
    $('#target')
        .RISimpleSlider({
            unitWidth: 'compute',
            dragEvents: Modernizer.touch,
            responsiveUnitSize: function () {
                var m, w, i = $('document').width(); // use the document width to determine how many elements we want in the carousel.

                if (i > 800) { m = 5; }
                else if (i > 600) { m = 4; }
                else if (i > 400) { m = 3; }
                else if (i > 200) { m = 2; }
                else { m = 1 }

                w = i / m;
                w = Math.floor(w);
                
                return w;

            },
            onRedraw: function() {
		// optional callback that is called after the slider is done adjusting to a new window width.  You can 
		// perform all sorts of cleanup here if you wish.
            }
        });
    
    
    // bleh... CSS media queries seem to be applied to a document sometime between the document.ready and window.load events. Do a redraw so the slider has the most accurate measurements.
    $(window).on('load',function(){
        $('.slider').RISimpleSlider('redraw');
    });



 ### CSS