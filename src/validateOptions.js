// Validates required options
export default function validateOptions(options) {

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
    if (Array.isArray(options.start) && options.start.length !== 0) {

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
