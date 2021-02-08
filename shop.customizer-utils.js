/**
 * @file Generic utils
 * @author joelthorner
 */

let module = {
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
};

SHOP.customizer = { ...SHOP.customizer, ...module };
