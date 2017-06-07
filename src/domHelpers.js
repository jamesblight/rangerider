import {classes} from './const';

// Add a class to a DOM element
export function addClass(element, className) {
  if (element.classList) {
    element.classList.add(className);
  } else {
    // < ie8
    element.className += ' ' + className;
  }
}

// Remove a class from a DOM element
export function removeClass(element, className) {
  if (element.classList)
    element.classList.remove(className);
  else
    element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
  }

// Get the bounding object for this DOM element.
export function getBounds(element) {
  var bounds = element.getBoundingClientRect();
  return {
    left: bounds.left + document.body.scrollLeft,
    top: bounds.top + document.body.scrollTop,
    width: bounds.width,
    height: bounds.height
  };
}

// Add handles to an anchor element based on the options provided
export function addHandles(anchor, options) {
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

// Append a slider element to an anchor. The slider is the section between two handles
export function addSlider(anchor) {
  var uiSlider = document.createElement('div');
  // Apply classes
  addClass(uiSlider, classes[1]);
  // Attach slider to DOM target
  return anchor.appendChild(uiSlider);
}
