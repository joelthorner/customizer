/**
 * Src threedium api (Fluid.import)
 * @constant {string}
 */
const THREEDIUM_API_SRC = 'https://distcdn.unlimited3d.com/pres/v/1.1.21/unlimited3d.min.js';

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
 * Prefix of Soles option values id (selected value part)
 * "SoleXXX_360_double" --> "Sole"
 * @constant {string}
 */
const ID_PREFIX_SOLE = 'Sole';

/**
 * Prefix of Soles option values id (selected value part)
 * "CantoXXX_360_double" --> "Canto"
 * @constant {string}
 */
const ID_PREFIX_CANTO = 'Canto';

/**
 * Static id of Soles Step
 * @constant {string}
 */
const STEP_ID_SOLES = 'Soles';

/**
 * Static id of Canto Step
 * @constant {string}
 */
const STEP_ID_CANTO = 'Canto';

/**
 * Static part of value sole|canto, thickness.
 * "CantoXXX_360_normal" --> "normal"
 * @constant {string}
 */
const SOLES_THICKNESS_NORMAL = 'normal';

/**
 * Static part of value sole|canto, thickness.
 * "CantoXXX_360_double" --> "double"
 * @constant {string}
 */
const SOLES_THICKNESS_DOUBLE = 'double';

/**
 * Static part of value sole|canto, vira.
 * "CantoXXX_270_double" --> "270"
 * @constant {number}
 */
const SOLES_VIRA_270 = 270;

/**
 * Static part of value sole|canto, vira.
 * "CantoXXX_360_double" --> "360"
 * @constant {number}
 */
const SOLES_VIRA_360 = 360;

/*
 * Types of options (option image field)
 * Define how that option will behave within a step and in the customizer.
 * http://10.254.1.55:8090/display/~joel.torner/Carmina+Threedium+personalitzador
 */

const TYPE_TOECAP = 'TOECAP';

const TYPE_BURNISH = 'BURNISH';

const TYPE_MEDALLION = 'MEDALLION';

const TYPE_SIMPLE_MATERIAL = 'SIMPLE_MATERIAL';

const TYPE_SOLE_TYPE = 'SOLE_TYPE';

const TYPE_SOLE_COLOR = 'SOLE_COLOR';

const TYPE_CANTO_COLOR = 'CANTO_COLOR';

const TYPE_CANTO_THICKNESS = 'CANTO_THICKNESS';

const TYPE_VIRA_PICADO = 'VIRA_PICADO';

const CUSTOMIZER_OPT_TYPES = [
  TYPE_TOECAP,
  TYPE_BURNISH,
  TYPE_MEDALLION,
  TYPE_SIMPLE_MATERIAL,
  TYPE_SOLE_TYPE,
  TYPE_SOLE_COLOR,
  TYPE_CANTO_COLOR,
  TYPE_CANTO_THICKNESS,
  TYPE_VIRA_PICADO,
];