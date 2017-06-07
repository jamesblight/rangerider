var RangeRider = (function () {
'use strict';

// list of classes to apply to the slider
var classes = [
  'ui-slider-target',         // 0
  'ui-slider',                // 1
  'ui-slider-range',          // 2
  'ui-slider-handle',         // 3
  'ui-slider-handle-origin',  // 4
  'ui-selected',              // 5
  'ui-slider-background',     // 6
  'ui-slider-connect'         // 7
];

// Events to capture
var actions = {
  start: 'mousedown',
  move: 'mousemove',
  end: 'mouseup',
  startTouch: 'touchstart',
  moveTouch: 'touchmove',
  endTouch: 'touchend'
};

// z-index styles
var zPriority = {
  background: 1,
  foreground: 2
};

// Add a class to a DOM element
function addClass (element, className) {
    if (element.classList) {
        element.classList.add(className);
    } else {
        // < ie8
        element.className += ' ' + className;
    }
}

// Remove a class from a DOM element
function removeClass(element, className) {
    if (element.classList)
        element.classList.remove(className);
    else
        element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
}

// Get the bounding object for this DOM element.
function getBounds(element) {
    var bounds = element.getBoundingClientRect();
    return {
        left: bounds.left + document.body.scrollLeft,
        top: bounds.top + document.body.scrollTop,
        width: bounds.width,
        height: bounds.height
    };
}

// Add handles from options.
function addHandles(anchor, options) {
  var handles = [],
  index,
  origin;

  // Append a handle to an anchor element.
  function addHandle(anchor) {
    var handle = document.createElement('div');
    // Apply classes
    addClass(handle, classes[3]);
    // Attach handle to slider
    return anchor.appendChild(handle);
  }

  for (index = 0; index < options.start.length; index++) {
    origin = document.createElement('div');
    addClass(origin, classes[4]);
    anchor.appendChild(origin);

    handles.push(addHandle(origin, options));
  }

  // If we have multiple handles then set the classes to display a coloured connection bar
  // |-------[============]---|
  if (handles.length > 1) {

    // Add the connect class to the first handle to show a connection bar
    addClass(handles[0].parentNode, classes[7]);

    // Add the background class to the second handle to hide the connection bar beyond the handle
    addClass(handles[1].parentNode, classes[6]);
  }

  return handles;
}

function addSlider (anchor) {
  var uiSlider = document.createElement('div');

  // Apply classes
  addClass(uiSlider, classes[1]);

  // Attach slider to DOM target
  return anchor.appendChild(uiSlider);
}

// Validates required options
function validateOptions(options) {

    // Anchor element must be defined
    if (typeof options.anchor === 'undefined') {
        throw new Error('validateOptions(): anchor was not defined');
    }

    // Range must be an array of length 2 ( min and max )
    if (options.range && Array.isArray(options.range)) {
        if (options.range.length !== 2) {
            throw new Error('validateOptions(): range array must have 2 elements ( min and max ) ');
        }
    } else {
        throw new Error('validateOptions(): range was not defined or it is not an Array');
    }

    // Range min must be less than max
    if (options.range[0] >= options.range[1]) {
        throw new Error('validateOptions(): range min is not less than range max');
    }
    // Range max must be greather than min
    if (options.range[1] <= options.range[0]) {
        throw new Error('validateOptions(): range max is not greater than range min');
    }

    // Optionals
    // Default value will be given for the start option

    // If start option is undefined then give it the default value of range min
    if (typeof options.start !== 'undefined') {
        if (Array.isArray( options.start) && options.start.length !== 0) {

            // Make sure the start value is valid ( within the range )
            if (options.start.length > 0) {
                // Single handle slider
                if (options.start[0] < options.range[0] || options.start[0] > options.range[1]) {
                    throw new Error('validateOptions(): start option ( lower ) is not within the range');
                }
            }

            if (options.start.length > 1) {
                // Dual handle slider
                if (options.start[1] < options.range[0] || options.start[0] > options.range[1]) {
                    throw new Error('validateOptions(): start option ( upper ) is not within the range');
                }
            }

            if (options.start.length > 2) {
                throw new Error('validateOptions(): start option can not have more than 2 elements')
            }
        } else {
            throw new Error('validateOptions(): start option must be an Array with at least 1 and less than 2 elements (lower and upper handle');
        }
    } else {
        // Set the default start to a single handle slider starting at the min range
        options.start = [options.range[0]];
    }
}

// General Helpers
// Calculates the percentage of this value on the range
function percentToValue(range, percent) {
  var adjustRange = range[1] - range[0],
  percentValue = adjustRange * (percent / 100),
  readjustRange = percentValue + range[0];

  return Math.round(readjustRange);
}

// Calculates the value of this percentage along the range
function valueToPercent(range, value) {
  var // Normalize the range
  nRange = range[1] - range[0],
  // Normalize the value
  nValue = value - range[0];

  return (nValue / nRange) * 100;
}

// Slider Closure
function RangeRider (options) {

    // Scope Variables
    var base,
        handles = [],
        selectedHandle,
        locations,
        prevAnchor = null,
        self = this,
        step = options.step,
        stepPercentage;


    function applyStep(location, stepPercentage) {
        var remainder;

        remainder = location % stepPercentage;

        if (remainder >= stepPercentage / 2) {
            return location - remainder + stepPercentage;
        }
        return location - remainder;
    }

    function getContainerOffset() {
        return getBounds(base);
    }

    // Attach events to appropriate slider parts
    function attachEvents() {

        // Add the 'mousedown' listeners to the handles
        for (var index = 0; index < handles.length; index++) {
            handles[index].addEventListener(actions.start , start);
            handles[index].addEventListener(actions.startTouch , start);
        }

    }

    // Initialize locations and handles
    function initLocations() {
        // convert start values to %
        locations = [];
        for (var index = 0; index < options.start.length; index++) {
            locations.push(valueToPercent( options.range, options.start[index]));
        }

        // Calculate step percentage if step was specified
        if (typeof step !== 'undefined') {
            stepPercentage = step * 100 / options.range[1];
        }

        // Set the start values
        setHandlePositions(locations);
        setDataValues(locations);
    }

    // Set the handle positions
    function setHandlePositions(locations) {
        var location,
            index;
        for (index = 0; index < handles.length; index++) {
            location = locations[index];

            if (location !== null) {
                // Apply step if specified
                if (typeof step !== 'undefined') {
                    location = applyStep(location, stepPercentage);
                }

                handles[index].parentNode.style[options.style] = location + '%';
            }
        }
    }

    // Set the values for each handle as a 'data-value' attribute
    function setDataValues(locations) {
        var location,
            index;
        for (index = 0; index < locations.length; index++) {
            location = locations[index];
            // Apply step if specified
            if (typeof step !== 'undefined') {
                location = applyStep(location, stepPercentage);
            }

            // Skip this handle if the value is null
            // This allows us to skip a handle if we just want to update one or the other
            if (location !== null) {
                handles[index].setAttribute('data-value', percentToValue(options.range, location));
            }
        }
    }


    // Event Handlers

    // Handle mousedown and touchstart events on handle
    function start(event) {
        var pageX;

        // Check if it is a touch event
        if (typeof event.touches !== 'undefined') {
            // Get touch coordinates
            pageX = event.touches[0].pageX;

            // Emulate left click
            event.button = 0;
        } else {
            // Get mouse coordinates
            pageX = event.pageX;
        }

        // Only capture left click
        if (event.button === 0) {
            if (typeof event.preventDefault !== 'undefined') {
                event.preventDefault();
            }

            // Get the bounds of the handle in the DOM so we can get the click event offset from the center.
            var bounds = getBounds(event.target),
                index;

            // Set the offset of the click from the center of the handle to be used later in positioning the handle.
            event.target.offset = bounds.left + (bounds.width / 2) - pageX;

            // Reset all handles zIndex
            for (index = 0; index < handles.length; index++) {
                handles[index].style.zIndex = zPriority.background;
            }

            // Set the selected handle to the handle that was clicked
            selectedHandle = event.target;

            // Give the selected handled the 'selected' class
            addClass(selectedHandle, classes[5]);

            // Put the selected handle in the foreground
            selectedHandle.style.zIndex = zPriority.foreground;

            // Attach event listeners to the window for mouse up and move.
            // Attach to the window so we capture mouse events outside of the element.
            window.addEventListener(actions.move, move);
            window.addEventListener(actions.moveTouch, move);
            window.addEventListener(actions.end, end);
            window.addEventListener(actions.endTouch, end);

            // Invoke onStart handler
            self.onStart();
        }
    }

    // Handle mousemove and touchmove event for handle
    function move(event) {
        var dif,
            containerOffset = getContainerOffset(),
            pageX;

        // Check if it is a touch event
        if (typeof event.touches !== 'undefined') {
            // Get touch coordinates
            pageX = event.touches[0].pageX;
        } else {
            // Get mouse coordinates
            pageX = event.pageX;
        }

        dif = pageX - containerOffset.left + selectedHandle.offset;

        dif = Math.min(Math.max(0, (dif / containerOffset.width * 100)), 100);

        // Which handle is selected?
        if (selectedHandle === handles[0]) {
            // Lower handle selected
            // limit the slider to either the upper handle (if it exists) or the upper range ( 100% )
            locations[0] = Math.min(dif, locations.length > 1 ? locations[1] : 100);
        } else {
            // Upper handle selected
            locations[1] = Math.max(dif, locations[0]);
        }

        setHandlePositions(locations);
        setDataValues(locations);

        // Invoke onSlide handler
        self.onSlide();
    }

    // Handle mouse up event
    function end(event) {

        // Check if it is a touch event
        if (typeof event.touches !== 'undefined') {
            // Emulate left click
            event.button = 0;
        }

        // Only capture left click event
        if(event.button === 0) {
            // remove our window event listeners
            window.removeEventListener(actions.move, move);
            window.removeEventListener(actions.moveTouch, move);
            window.removeEventListener(actions.end, end);
            window.removeEventListener(actions.endTouch, end);

            // clear the selected handle reference
            removeClass(selectedHandle, classes[7]);
            selectedHandle = null;

            // Invoke onEnd handler
            self.onEnd();
        }
    }

    // Handler invoked on start - Interface method.
    // It does nothing, because it should be overridden.
    this.onStart = function () {};

    // Handler invoked on start - Interface method.
    // It does nothing, because it should be overridden.
    this.onSlide = function () {};

    // Handler invoked on end (mouse up) - Interface method.
    // It does nothing, because it should be overridden
    this.onEnd = function () {};

    // Attaches the Range Rider to a DOM element
    this.setAnchor = function (anchor) {
        // If specified, detach the Range Rider from the previous anchor
        if (prevAnchor !== null) {
            prevAnchor.removeChild(base);
        }
        prevAnchor = anchor; // Save new anchor as previous anchor

        // Create the base and handle components of the slider
        base = addSlider(anchor, options);
        handles = addHandles(base, options);


        // Add classes to the anchor element
        addClass(anchor, classes[0]);
        // Check options for a 'connect' property
        if (options.hasOwnProperty('connect')) {
            // If we want to connect the lower handle then add the appropriate classes
            if (options.connect === 'lower') {
                addClass(anchor, classes[7]);
                addClass(handles[0].parentNode, classes[6]);
            } else {
                // 'connect' property  is not recognised
                // So add the default class
                addClass(anchor, classes[6]);
            }
        } else {
            // No 'connect' property so add the default class
            addClass(anchor, classes[6]);
        }

        // Attach movement events
        attachEvents();

        // Initialize locations and handles
        initLocations();
    };

    // Update with a new range, start and step values (all optional)
    this.update = function (newRange, newStart, newStep) {
        // Update rider options
        if (typeof newRange !== 'undefined') {
            options.range = newRange;
        }
        if (typeof newStart !== 'undefined') {
            options.start = newStart;
        }
        if (typeof newStep !== 'undefined') {
            step = newStep;
        }

        // Update rider
        initLocations();
    };

    // Define access properties
    Object.defineProperties(this, {
        'lower': {
            'get': function () { return handles[0].getAttribute( 'data-value' ); },
            'set': function (value) {
                var location = valueToPercent(options.range, value);
                setHandlePositions([ location ]);
                setDataValues([ location ]);
            }
        },
        'upper': {
            'get': function () { return handles[1].getAttribute( 'data-value' ); },
            'set': function (value) {
                var location = valueToPercent(options.range, value);
                setHandlePositions([ null, location ]);
                setDataValues([ null, location ]);
            }
        }
    });


    // Initialize the slider

    // set the style to be modified for handles
    // 'left' for horizontal slider
    options.style = 'left';

    // Set handlers if defined
    if (options.hasOwnProperty('onStart') && typeof options.onStart === 'function') {
        this.onStart = options.onStart;
    }
    if (options.hasOwnProperty('onSlide') && typeof options.onSlide === 'function') {
        this.onSlide = options.onSlide;
    }
    if (options.hasOwnProperty('onEnd') && typeof options.onEnd === 'function') {
        this.onEnd = options.onEnd;
    }

    // Set the anchor (DOM element) if defined
    if (typeof options.anchor !== 'undefined') {
        this.setAnchor(options.anchor);
    }
}


// @param options {
//  anchor      {DOM element}
//  range       {Array}
//  start       {Array}         optional
//  connect     {String}        optional
//  step        {Number}        optional
//  onStart     {Function}      optional
//  onSlide     {Function}      optional
//  onEnd       {Function}      optional
// }
function create (options) {
    // Validate the options here before initializing
    validateOptions(options);

    // Return the new slider instance
    return new RangeRider(options);
}

var rangerider = {
    create
};

return rangerider;

}());
