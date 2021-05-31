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
    let methodName = prefix + camelCase.charAt(0).toUpperCase() + camelCase.slice(1);

    // For types like "INSCRIPTION_3" or "INSCRIPTION_15" remove under slash + number
    methodName = methodName.replace(/_[0-9]+/, '');

    return methodName;
  },

  /**
   * Return true if option value <Value> is EMPTY_OPTION_VALUE_PART string value
   * @param {string} value 
   * @return {boolean}
   */
  isNoneValue(value) {
    return value ? value === EMPTY_OPTION_VALUE_PART : false;
  },

  /**
   * Return true if option value <Value> is BOTH_OPTION_VALUE_PART string value
   * @param {string} value 
   * @return {boolean}
   */
  isBothValue(value) {
    return value ? value === BOTH_OPTION_VALUE_PART : false;
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
