# Range Rider
This is a simple prototype and shouldn't be used in production.

### Instal Dependancies
Run ```npm install```

### To build
Run ```npm build```

Use rr.bundle.js and rr.style.css in your project

### To Use
```javascript
// element to attach the slider to
var anchor = document.getElementById('slider-container');

// create our dual range slider
RangeRider({
    anchor: anchor,
    range: [0, 10],
    start: [0, 10]
});
```

### Demo
http://jsfiddle.net/narklord/gfgdpegd/
