/**
 * @file Manage all the logic that interacts directly with the threedium camera
 * @author joelthorner
 */

/**
 * Main view, side view with a little angle
 * @constant {string}
 */
const TRANSITION_MAIN_VIEW = 'Transition_Main_View';

/**
 * Top left view
 * @constant {string}
 */
const TRANSITION_TOP_LEFT_VIEW = 'Transition_Top_Left_View';

/**
 * Back view
 * @constant {string}
 */
const TRANSITION_BACK_VIEW = 'Transition_Back_View';

/**
 * Bottom (sole) view
 * @constant {string}
 */
const TRANSITION_BOTTOM_VIEW = 'Transition_Bottom_View';

/**
 * Lining view
 * @constant {string}
 */
const TRANSITION_LINING_VIEW = 'Transition_Lining_View';

/**
 * Medallion view
 * @constant {string}
 */
const TRANSITION_MEDALLION_VIEW = 'Transition_Medallion_View';

/**
 * Front view
 * @constant {string}
 */
const TRANSITION_FRONT_VIEW = 'Transition_Front_View';

/**
 * Step/View declaration
 * Each step option defines its default view 
 * and its views by options if they are different.
 * @constant {object}
 */
const STEPS_VIEW = {
  ToeCap: {
    default: TRANSITION_MAIN_VIEW,
    Medallions: TRANSITION_MEDALLION_VIEW,
  },
  Vamp: {
    default: TRANSITION_MAIN_VIEW,
  },
  Heel: {
    default: TRANSITION_MAIN_VIEW,
  },
  Stitching: {
    default: TRANSITION_MAIN_VIEW,
  },
  Canto: {
    default: TRANSITION_TOP_LEFT_VIEW,
    // Picado: TRANSITION_TOP_LEFT_VIEW,
  },
  PullLoop: {
    default: TRANSITION_BACK_VIEW,
  },
  HeelStripe: {
    default: TRANSITION_BACK_VIEW,
  },
  Soles: {
    default: TRANSITION_BOTTOM_VIEW,
  },
  Buckles: {
    default: TRANSITION_LINING_VIEW,
  },
  Lining: {
    default: TRANSITION_LINING_VIEW,
  },
  Eyelets: {
    default: TRANSITION_FRONT_VIEW,
  },
  Hooks: {
    default: TRANSITION_FRONT_VIEW,
  },
  Shoelaces: {
    default: TRANSITION_FRONT_VIEW,
  },
}

var module = {
  /**
   * Object that contains all related of Threedium camera
   */
  camera: {
    /**
     * Save last transition applied
     * @type {string}
     */
    lastTransitionApplied: '',

    init() {
      let firstStep = SHOP.customizer.getFirstStep(),
        firstOptionStep = SHOP.customizer.getFirstOptionStep(firstStep.id),
        stepViews = this.getStepViews(firstStep.id),
        optionView = this.getOptionView(firstOptionStep.params, stepViews);

      this.lastTransitionApplied = optionView;
    },

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

          if (this.lastTransitionApplied != optionView) {
            SHOP.customizer.threedium.activeTransitionView(optionView);
            this.lastTransitionApplied = optionView;
          }
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
