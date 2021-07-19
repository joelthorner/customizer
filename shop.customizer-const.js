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
 * @example "Sole_Leather_PISO-0001_270_TH-00" --> "Sole"
 * @constant {string}
 */
const ID_PREFIX_SOLE = 'Sole';

/**
 * Prefix of Soles option values id (selected value part)
 * @example "Edge_Leather_PISO-0001_270_TH-00" --> "Edge"
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

/**
 * Static id of Stitching Step
 * @constant {string}
 */
const STEP_ID_STITCHING = 'Stitching';

/**
 * Static id of PullLoop Step
 * @constant {string}
 */
const STEP_ID_PULL_LOOP = 'PullLoop';

/**
 * Static id of HeelStripe Step
 * @constant {string}
 */
const STEP_ID_HEEL_STRIPE = 'HeelStripe';

/**
 * Static id of Buckles Step
 * @constant {string}
 */
const STEP_ID_BUCKLES = 'Buckles';

/**
 * Static id of Lining Step
 * @constant {string}
 */
const STEP_ID_LINING = 'Lining';

/**
 * Static id of Eyelets Step
 * @constant {string}
 */
const STEP_ID_EYELETS = 'Eyelets';

/**
 * Static id of Hooks Step
 * @constant {string}
 */
const STEP_ID_HOOKS = 'Hooks';

/**
 * Static id of Shoelaces Step
 * @constant {string}
 */
const STEP_ID_SHOELACES = 'Shoelaces';

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
const STORMWELT = 'Stormwelt';

/**
 * Static part of value of simple material option.
 * @constant {string}
 */
const BURNISH = 'Burnish';

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
 * Medallions threedium group
 * @constant {string}
 */
const MEDALLIONS_PART = 'Medallions';


/**
 * Parts of the 3D model that are not configured with logicommerce options
 * @constant {string[]}
 */
const NO_CONFIGURABLE_PARTS = [
  CULET_PART,
  SOLE_INTERIOR_PART,
  NO_LINING_PART,
];

/**
 * Option type "Burnish".
 * @constant {string}
 */
const TYPE_BURNISH = 'BURNISH';

/**
 * Option type "Toe/Medallion".
 * @constant {string}
 */
const TYPE_MEDALLION = 'MEDALLION';

/**
 * Option type "Simple material".
 * @constant {string}
 */
const TYPE_SIMPLE_MATERIAL = 'SIMPLE_MATERIAL';

/**
 * Option type "Simple material" restricted by TYPE_CHANGE_PART_RESTRICTION.
 * @constant {string}
 */
const TYPE_SIMPLE_MATERIAL_RESTRICTED = 'SIMPLE_MATERIAL_RESTRICTED';

/**
 * Option type "Sole/Type".
 * @constant {string}
 */
const TYPE_SOLE_TYPE = 'SOLE_TYPE';

/**
 * Option type "Sole/Color".
 * @constant {string}
 */
const TYPE_SOLE_COLOR = 'SOLE_COLOR';

/**
 * Option type "Edge/Color".
 * @constant {string}
 */
const TYPE_EDGE_COLOR = 'EDGE_COLOR';

/**
 * Option type "Edge/Thickness".
 * @constant {string}
 */
const TYPE_EDGE_THICKNESS = 'EDGE_THICKNESS';

/**
 * Option type "Edge/ViraPicado".
 * @constant {string}
 */
const TYPE_VIRA_PICADO = 'VIRA_PICADO';

/**
 * Option type "Change part".
 * @constant {string}
 */
const TYPE_CHANGE_PART = 'CHANGE_PART';

/**
 * Option type "Change part". Restricts TYPE_SIMPLE_MATERIAL_RESTRICTED
 * @constant {string}
 */
const TYPE_CHANGE_PART_RESTRICTION = 'CHANGE_PART_RESTRICTION';

/**
 * Option type "Inscription max len 3".
 * @constant {string}
 */
const TYPE_INSCRIPTION_3 = 'INSCRIPTION_3';

/**
 * Option type "Inscription max len 15".
 * @constant {string}
 */
const TYPE_INSCRIPTION_15 = 'INSCRIPTION_15';

/**
 * Option type "Sole/Inscription".
 * @constant {string}
 */
const TYPE_INSCRIPTION_SOLE = 'INSCRIPTION_SOLE';

/**
 * Option type "Inscription price".
 * @constant {string}
 */
const TYPE_HIDDEN_INSCRIPTION_PRICE = 'HIDDEN_INSCRIPTION_PRICE';

/**
 * Option type "Vamp".
 * @constant {string}
 */
const TYPE_VAMP = 'VAMP';

/**
 * All step types
 * @constant {string[]}
 */
const CUSTOMIZER_OPT_TYPES = [
  TYPE_BURNISH,
  TYPE_MEDALLION,
  TYPE_SIMPLE_MATERIAL,
  TYPE_SIMPLE_MATERIAL_RESTRICTED,
  TYPE_SOLE_TYPE,
  TYPE_SOLE_COLOR,
  TYPE_EDGE_COLOR,
  TYPE_EDGE_THICKNESS,
  TYPE_VIRA_PICADO,
  TYPE_CHANGE_PART,
  TYPE_CHANGE_PART_RESTRICTION,
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

/**
 * Restricted option types by other option type
 * @constant {string[]}
 */
const RESTRICTED_TYPES_BY_OTHER_TYPE = [
  TYPE_SOLE_COLOR,
  TYPE_EDGE_COLOR,
  TYPE_BURNISH,
  TYPE_INSCRIPTION_SOLE,
  TYPE_SIMPLE_MATERIAL_RESTRICTED,
];