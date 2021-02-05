/**
 * Object with all customizer data stored
 * @typedef {Object} CustomizerData
 * @property {object} activeStep - Active step data
 * @property {object} resume - Resume object data
 * @property {object[]} steps - Object array of all steps
 */

SHOP.customizer = {
  /**
   * Property that contains all data of customizer updated every moment
   * @type {CustomizerData} 
   */
  data: {},

  /**
   * Customizer container element
   * @type {object|undefined} 
   */
  $el: undefined,

  /**
   * Indicates if the user has interacted with the customizer
   * @type {boolean} 
   */
  userInteraction: false,
};
