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

  /**
   * Replace from string the soles thickness parts to new value.
   * Example: CantoXXX_360_normal --> CantoXXX_360_triple
   * @param {string} text
   * @param {string} replacePart
   * @returns {string}
   */
  replaceThickness(text, replacePart) {
    return text
      .replace(SOLES_THICKNESS_NORMAL, replacePart)
      .replace(SOLES_THICKNESS_DOUBLE, replacePart)
      .replace(SOLES_THICKNESS_TRIPLE, replacePart);
  },

  /**
   * This function returns the resulting part of Sole i Canto 
   * according to the selected values of all the options that affect them.
   * @param {object} soleStep - Step Sole object
   * @param {object} [optSoleTypeParam] - option sole type from Sole step object
   * @returns {object}
   */
  getSoleAndCantoPartsFromSelectedOptions(soleStep, optSoleTypeParam) {
    let self = SHOP.customizer,
      stepCanto = self.getStepData(STEP_ID_CANTO),

      optSoleType = optSoleTypeParam ? optSoleTypeParam : self.getStepOptionByType(soleStep, TYPE_SOLE_TYPE),
      optCantoThickness = self.getStepOptionByType(stepCanto, TYPE_CANTO_THICKNESS),
      optViraPicado = self.getStepOptionByType(stepCanto, TYPE_VIRA_PICADO),

      solePart = optSoleType.selectedValue,
      cantoPart = solePart.replace(ID_PREFIX_SOLE, ID_PREFIX_CANTO),
      result = {
        solePart: solePart,
        cantoPart: cantoPart
      };

    // Change <normal|double|triple> from Canto Thickness
    if (optCantoThickness) {
      for (const key in result) {
        if (Object.hasOwnProperty.call(result, key)) {
          result[key] = SHOP.customizer.replaceThickness(result[key], optCantoThickness.selectedValue);
        }
      }
    }

    // Change <270|360> from Canto Vira-Stormwelt
    if (optViraPicado) {
      let viraPicadoValue = optViraPicado.selectedValue.match(new RegExp(`${SOLES_VIRA_270}|${SOLES_VIRA_360}`));

      if (viraPicadoValue) {
        for (const key in result) {
          if (Object.hasOwnProperty.call(result, key)) {
            result[key] = result[key]
              .replace(SOLES_VIRA_270, viraPicadoValue[0])
              .replace(SOLES_VIRA_360, viraPicadoValue[0])
          }
        }
      }
    }

    return result;
  }
};

SHOP.customizer = { ...SHOP.customizer, ...module };
