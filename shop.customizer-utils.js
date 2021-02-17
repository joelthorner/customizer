/**
 * @file Generic utils
 * @author joelthorner
 */

var module = {
  /**
   * Transform underscore case to CamelCase method
   * @param {string} value 
   * @return {string}
   */
  getMethodName(value, prefix = '') {
    let camelCase = value.toLowerCase().replace(/_([a-z])/g, function (g) { return g[1].toUpperCase(); });
    return prefix + camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
  },

  /**
   * Return true if option value <Value> is empty string value
   * @param {string} value 
   * @return {boolean}
   */
  isEmptyOptionValuePart(value) {
    return value ? value === EMPTY_OPTION_VALUE_PART : false;
  },

  /**
   * Returns true or false if element is a text html element
   * @param {object} $element - jQuery element
   */
  isTextOption($element) {
    return $element.is('textarea, input[type="text"]');
  },

  /**
   * Returns true or false if element is a checkbox html element
   * @param {object} $element - jQuery element
   */
  isCheckboxOption($element) {
    return $element.is('input[type="checkbox"]');
  },

  /**
   * Returns true or false if element is a radio html element
   * @param {object} $element - jQuery element
   */
  isRadioOption($element) {
    return $element.is('input[type="radio"]');
  },
};

SHOP.customizer = { ...SHOP.customizer, ...module };
