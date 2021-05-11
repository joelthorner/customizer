/**
 * @file Manage all the logic that interacts directly with the threedium camera
 * @author joelthorner
 */

/**
 * Main view, side view with a little angle
 * @constant {number[]}
 */
const CAMERA_MAIN_VIEW = [0.052, 0.0987, 0.386];

/**
 * Top left view
 * @constant {number[]}
 */
const CAMERA_TOP_LEFT_VIEW = [0.346, 0.393, 0.258];

/**
 * Back view
 * @constant {number[]}
 */
const CAMERA_BACK_VIEW = [-0.575, 0.089, -0.035];

/**
 * Bottom (sole) view
 * @constant {number[]}
 */
const CAMERA_BOTTOM_VIEW = [0.018, -0.566, -0.005];

/**
 * Lining view
 * @constant {number[]}
 */
const CAMERA_LINING_VIEW = [0.150, 0.307, 0.443];

/**
 * Medallion view
 * @constant {number[]}
 */
const CAMERA_MEDALLION_VIEW = [0.165, 0.287, -0.008];

/**
 * Front view
 * @constant {number[]}
 */
const CAMERA_FRONT_VIEW = [0.399, 0.387, 0.200];

/**
 * Step/View declaration
 * Each step option defines its default view 
 * and its views by options if they are different.
 * @constant {object}
 */
const STEPS_VIEW = {
  ToeCap: {
    default: CAMERA_MAIN_VIEW,
    Medallions: CAMERA_MEDALLION_VIEW, // TODO change target
  },
  Vamp: {
    default: CAMERA_MAIN_VIEW,
  },
  Heel: {
    default: CAMERA_MAIN_VIEW,
  },
  Stitching: {
    default: CAMERA_MAIN_VIEW,
  },
  Canto: {
    default: CAMERA_TOP_LEFT_VIEW,
    // Picado: CAMERA_TOP_LEFT_VIEW,
  },
  PullLoop: {
    default: CAMERA_BACK_VIEW,
  },
  HeelStripe: {
    default: CAMERA_BACK_VIEW,
  },
  Soles: {
    default: CAMERA_BOTTOM_VIEW,
  },
  Buckles: {
    default: CAMERA_LINING_VIEW,
  },
  Lining: {
    default: CAMERA_LINING_VIEW,
  },
  Eyelets: {
    default: CAMERA_FRONT_VIEW,
  },
  Hooks: {
    default: CAMERA_FRONT_VIEW,
  },
  Shoelaces: {
    default: CAMERA_FRONT_VIEW,
  },
}

var module = {
  /**
   * Object that contains all related of Threedium camera
   */
  camera: {
    /**
     * Set camera view
     * @param {string} stepId 
     * @param {string} optionId
     */
    setView(stepId, optionId) {
      let stepData = SHOP.customizer.getStepData(stepId),
        optionData = SHOP.customizer.getOption(stepId, optionId);

      if (stepData && optionData) {
        let stepViews = this.getStepViews(stepId);

        if (stepViews) {
          let optionView = this.getOptionView(optionData.params, stepViews);
          SHOP.customizer.threedium.setCameraPosition(optionView);
        }
      }
    },

    /**
     * Return step views
     * @param {string} stepId 
     * @returns {object}
     */
    getStepViews(stepId) {
      return STEPS_VIEW[stepId] ? STEPS_VIEW[stepId] : null;
    },

    /**
     * 
     * @param {string[]} params 
     * @param {object} stepViews 
     */
    getOptionView(params, stepViews) {
      let result = stepViews.default;

      for (const key in stepViews) {
        if (Object.hasOwnProperty.call(stepViews, key)) {
          if (key !== 'default' && SHOP.customizer.existsOptionParam(params, key)) {
            return stepViews[key];
          }
        }
      }

      return result;
    },
  },
};

SHOP.customizer = { ...SHOP.customizer, ...module };
