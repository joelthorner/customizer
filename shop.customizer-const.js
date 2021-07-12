/**
 * Src threedium api (Fluid.import)
 * @constant {string}
 */
const THREEDIUM_API_SRC = 'https://distcdn.unlimited3d.com/pres/v/{VERSION}/unlimited3d.min.js';

/**
 * Static id of resume "step"
 * @constant {string}
 */
const RESUME_ID_STEP = 'resume';

/**
 * Type of size option from resume step
 * @constant {string}
 */
const RESUME_SIZE_TYPE = 'size';

/**
 * 'Empty' value of option value internal id
 * @constant {string}
 */
const EMPTY_OPTION_VALUE_PART = 'NONE';

/**
 * 'Both' value of option value internal id
 * @constant {string}
 */
const BOTH_OPTION_VALUE_PART = 'BOTH';

/**
 * Prefix of Soles option values id (selected value part)
 * @example "SoleXXX_360_double" --> "Sole"
 * @constant {string}
 */
const ID_PREFIX_SOLE = 'Sole';

/**
 * Prefix of Soles option values id (selected value part)
 * @example "EdgeXXX_360_double" --> "Edge"
 * "Edge_Rojo" --> "Edge"
 * @constant {string}
 */
const ID_PREFIX_EDGE = 'Edge';

/**
 * Static id of Soles Step
 * @constant {string}
 */
const STEP_ID_SOLES = 'Soles';

/**
 * Static id of Edge Step
 * @constant {string}
 */
const STEP_ID_EDGE = 'Edge';

/**
 * Static id of Heel Step
 * @constant {string}
 */
const STEP_ID_HEEL = 'Heel';

/**
 * Static id of Toe Step
 * @constant {string}
 */
const STEP_ID_TOE = 'Toe';

/**
 * Static id of Vamp Step
 * @constant {string}
 */
const STEP_ID_VAMP = 'Vamp';

const STEP_ID_STITCHING = 'Stitching';

const STEP_ID_PULL_LOOP = 'PullLoop';

const STEP_ID_PULL_HEEL_STRIPE = 'HeelStripe';

const STEP_ID_PULL_BUCKLES = 'Buckles';

const STEP_ID_PULL_LINING = 'Lining';

const STEP_ID_PULL_EYELETS = 'Eyelets';

const STEP_ID_PULL_HOOKS = 'Hooks';

const STEP_ID_PULL_SHOELACES = 'Shoelaces';

/**
 * Thickness part of Sole/Edge. Normal value.
 * @constant {string}
 */
const SOLES_THICKNESS_NORMAL = 'TH-00';

/**
 * Thickness part of Sole/Edge. Double value.
 * @constant {string}
 */
const SOLES_THICKNESS_DOUBLE = 'TH-15';

/**
 * Thickness part of Sole/Edge. Triple value.
 * @constant {string}
 */
const SOLES_THICKNESS_TRIPLE = 'TH-30';

/**
 * Weight part of Sole/Edge.
 * @constant {number}
 */
const SOLES_VIRA_270 = 270;

/**
 * Weight part of Sole/Edge.
 * @constant {number}
 */
const SOLES_VIRA_360 = 360;

/**
 * Static part of value of vira_picado option.
 * @constant {string}
 */
const STORMWELT_PARAM = 'Stormwelt';

/**
 * Static part of value of simple material option.
 * @constant {string}
 */
const BURNISH_PARAM = 'Burnish';

/**
 * Culet is a interior sole 3D model part
 * @constant {string}
 */
const CULET_PART = 'Culet';

/**
 * Sole_interior is a interior sole 3D model part
 * @constant {string}
 */
const SOLE_INTERIOR_PART = 'Sole_interior';

/**
 * no_Lining is a interior sole 3D model part
 * @constant {string}
 */
const NO_LINING_PART = 'no_Lining';

/**
 * Burnish_Heel is a back burnish part
 * @constant {string}
 */
const BURNISH_HEEL_PART = 'Burnish_Heel';

/**
 * Burnish_Toe is a front burnish part
 * @constant {string}
 */
const BURNISH_TOE_PART = 'Burnish_Toe';


/**
 * Parts of the 3D model that are not configured with logicommerce options
 * @constant {string[]}
 */
const NO_CONFIGURABLE_PARTS = [
  CULET_PART,
  SOLE_INTERIOR_PART,
  NO_LINING_PART,
];

/*
 * Types of options (option image field)
 * Define how that option will behave within a step and in the customizer.
 * http://10.254.1.55:8090/display/~joel.torner/Carmina+Threedium+personalitzador
 */

const TYPE_BURNISH = 'BURNISH';

const TYPE_MEDALLION = 'MEDALLION';

const TYPE_SIMPLE_MATERIAL = 'SIMPLE_MATERIAL';

const TYPE_SOLE_TYPE = 'SOLE_TYPE';

const TYPE_SOLE_COLOR = 'SOLE_COLOR';

const TYPE_CANTO_COLOR = 'CANTO_COLOR';

const TYPE_CANTO_THICKNESS = 'CANTO_THICKNESS';

const TYPE_VIRA_PICADO = 'VIRA_PICADO';

const TYPE_CHANGE_PART = 'CHANGE_PART';

const TYPE_INSCRIPTION_3 = 'INSCRIPTION_3';

const TYPE_INSCRIPTION_15 = 'INSCRIPTION_15';

const TYPE_INSCRIPTION_SOLE = 'INSCRIPTION_SOLE';

const TYPE_HIDDEN_INSCRIPTION_PRICE = 'HIDDEN_INSCRIPTION_PRICE';

const TYPE_VAMP = 'VAMP';

/**
 * All step types
 * @constant {string[]}
 */
const CUSTOMIZER_OPT_TYPES = [
  TYPE_BURNISH,
  TYPE_MEDALLION,
  TYPE_SIMPLE_MATERIAL,
  TYPE_SOLE_TYPE,
  TYPE_SOLE_COLOR,
  TYPE_CANTO_COLOR,
  TYPE_CANTO_THICKNESS,
  TYPE_VIRA_PICADO,
  TYPE_CHANGE_PART,
  TYPE_INSCRIPTION_3,
  TYPE_INSCRIPTION_15,
  TYPE_INSCRIPTION_SOLE,
  TYPE_HIDDEN_INSCRIPTION_PRICE,
  TYPE_VAMP,
];

/**
 * Text step types
 * @constant {string[]}
 */
const CUSTOMIZER_INSCRIPTION_TYPES = [
  TYPE_INSCRIPTION_3,
  TYPE_INSCRIPTION_15,
  TYPE_INSCRIPTION_SOLE,
];
