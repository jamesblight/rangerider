// list of classes to apply to the slider
export var classes = [
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
export var actions = {
  start: 'mousedown',
  move: 'mousemove',
  end: 'mouseup',
  startTouch: 'touchstart',
  moveTouch: 'touchmove',
  endTouch: 'touchend'
};

// z-index styles
export var zPriority = {
  background: 1,
  foreground: 2
};
