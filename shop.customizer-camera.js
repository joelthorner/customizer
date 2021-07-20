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
  [STEP_ID_TOE]: {
    default: TRANSITION_MAIN_VIEW,
    [MEDALLIONS_PART]: TRANSITION_MEDALLION_VIEW,
  },
  [STEP_ID_VAMP]: {
    default: TRANSITION_MAIN_VIEW,
  },
  [STEP_ID_HEEL]: {
    default: TRANSITION_MAIN_VIEW,
  },
  [STEP_ID_STITCHING]: {
    default: TRANSITION_MAIN_VIEW,
  },
  [STEP_ID_EDGE]: {
    default: TRANSITION_TOP_LEFT_VIEW,
    // Picado: TRANSITION_TOP_LEFT_VIEW,
  },
  [STEP_ID_PULL_LOOP]: {
    default: TRANSITION_BACK_VIEW,
  },
  [STEP_ID_HEEL_STRIPE]: {
    default: TRANSITION_BACK_VIEW,
  },
  [STEP_ID_SOLES]: {
    default: TRANSITION_BOTTOM_VIEW,
  },
  [STEP_ID_BUCKLES]: {
    default: TRANSITION_LINING_VIEW,
  },
  [STEP_ID_LINING]: {
    default: TRANSITION_LINING_VIEW,
  },
  [STEP_ID_EYELETS]: {
    default: TRANSITION_FRONT_VIEW,
  },
  [STEP_ID_HOOKS]: {
    default: TRANSITION_FRONT_VIEW,
  },
  [STEP_ID_SHOELACES]: {
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

    /**
     * Manual transitions defined on a product customtag.
     * @type {object}
     */
    manualTransitions: {},

    /**
     * Camera object onload function.
     */
    init() {
      this.setManualTransitions();

      let firstStep = SHOP.customizer.getFirstStep(),
        firstOptionStep = SHOP.customizer.getFirstOptionStep(firstStep.id),
        stepViews = this.getStepViews(firstStep.id),
        optionView = this.getOptionView(firstOptionStep.params, stepViews);

      this.lastTransitionApplied = optionView;
    },

    /**
     * Set manual transitions customtag data into camera object.
     * - Regexp is a list validator "a:b,c:d"
     */
    setManualTransitions() {
      let $ctTransitions = $('#threedium-manual-transitions'),
        ctTransitions = $ctTransitions.length ? $ctTransitions.data('value') : '',
        isValid = ctTransitions.match(/^[\w\-]+:[\w\-]+(?:,[\w\-]+:[\w\-]+)*$/);

      if (ctTransitions.length && isValid) {
        let items = ctTransitions.split(',');

        for (let i = 0; i < items.length; i++) {
          const idTransitionArr = items[i].split(':');
          this.manualTransitions[idTransitionArr[0]] = idTransitionArr[1];
        }
      }

      if (ctTransitions.length && !isValid) {
        CustomizerError(false, 'Manual transitions customtag value is wrong.');
      }
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
          let optionView = this.getOptionView(optionData, stepViews);

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
     * @return {object|null}
     */
    getStepViews(stepId) {
      return STEPS_VIEW[stepId] ? STEPS_VIEW[stepId] : null;
    },

    /**
     * Return option transition name
     * @param {object} option 
     * @param {object} stepViews 
     * @return {string}
     */
    getOptionView(option, stepViews) {
      let result = stepViews.default;

      if (this.manualTransitions[option.internalId]) {
        // Get manual transition by option internal id
        return this.manualTransitions[option.internalId];
      } else {
        // Search into predefined transitions object
        for (const key in stepViews) {
          if (stepViews[key] && key !== 'default' && SHOP.customizer.existsOptionParam(option.params, key)) {
            return stepViews[key];
          }
        }
      }

      return result;
    },
  },
};

SHOP.customizer = { ...SHOP.customizer, ...module };
