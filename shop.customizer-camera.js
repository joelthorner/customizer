/**
 * @file Manage all the logic that interacts directly with the threedium camera
 * @author joelthorner
 */

/**
 * Main view, side view with a little angle
 * @constant {number[]}
 */
const CAMERA_MAIN_VIEW = {
  position: [0.059, 0.114, 0.470],
  target: [0.012, 0.017, -0.065],
};

/**
 * Top left view
 * @constant {number[]}
 */
const CAMERA_TOP_LEFT_VIEW = {
  position: [0.346, 0.393, 0.258],
  target: [0.008, 0, -0.042],
};

/**
 * Back view
 * @constant {number[]}
 */
const CAMERA_BACK_VIEW = {
  position: [-0.575, 0.073, -0.033],
  target: [0.011, 0.018, 0.003],
};

/**
 * Bottom (sole) view
 * @constant {number[]}
 */
const CAMERA_BOTTOM_VIEW = {
  position: [0.018, -0.566, -0.005],
  target: [0.011, 0.018, -0.003],
};

/**
 * Lining view
 * @constant {number[]}
 */
const CAMERA_LINING_VIEW = {
  position: [0.150, 0.307, 0.443],
  target: [0.011, 0.018, -0.003],
};

/**
 * Medallion view
 * @constant {number[]}
 */
const CAMERA_MEDALLION_VIEW = {
  position: [0.209, 0.259, -0.012],
  target: [0.104, -0.032, -0.004],
};

/**
 * Front view
 * @constant {number[]}
 */
const CAMERA_FRONT_VIEW = {
  position: [0.324, 0.446, 0.186],
  target: [0.030, 0.027, -0.018],
};

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
          SHOP.customizer.threedium.setCameraPositionSetTarget(optionView);
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
