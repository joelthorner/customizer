/**
 * @file Manage communication between SHOP.customizer.data with getters and setters
 * @author joelthorner
 */

var module = {
  /**
   * Return data for SHOP.customizer.data property
   * @return {object}
   */
  getData() {
    this.setStepsData();
    this.setResumeData();

    var stepsData = this.getStepsData(),
      resumeData = this.getResumeData();

    return {
      steps: stepsData,
      activeStep: {
        stepId: stepsData[0].id,
        optionId: stepsData[0].options[0].id,
      },
      resume: resumeData,
    };
  },

  /**
   * Return SHOP.customizer.data.steps.stepX
   * @param {string} stepId
   * @return {object|null}
   */
  getStepData(stepId) {
    var step = null;

    this.data.steps.forEach(element => {
      if (element.id == stepId)
        step = element;
    });

    return step;
  },

  /**
   * Return data for SHOP.customizer.data.steps property
   * @return {object[]}
   */
  getStepsData() {
    return SHOP.customizer.data.steps;
  },

  /**
   * Return data for SHOP.customizer.data.resume property
   * @return {object}
   */
  getResumeData() {
    return SHOP.customizer.data.resume;
  },

  /**
   * SHOP.customizer.data.activeStep property
   * @return {object}
   */
  getActiveStep() {
    return SHOP.customizer.data.activeStep;
  },

  /**
   * Return next step of stepId passed, if is last step, return null.
   * @param {string} stepId
   * @return {object|null}
   */
  getNextStepData(stepId) {
    var step = null;

    for (var i = 0; i < this.data.steps.length; i++) {
      if (this.data.steps[i].id == stepId) {
        var nextStep = this.data.steps[i + 1];
        if (nextStep) step = nextStep;
      }
    }

    return step;
  },

  /**
   * Return next step grouped option if exists
   * @param {string} stepId
   * @param {string|number} optionId
   * @return {object|null}
   */
  getNextStepOptionData(stepId, optionId) {
    var options = this.getStepOptionsData(stepId),
      option = null

    for (var i = 0; i < options.length; i++) {
      if (options[i].id == optionId) {
        var nextOption = options[i + 1];
        if (nextOption) option = nextOption;
      }
    }

    return option;
  },

  /**
   * Return prev step of stepId passed, if is first step, return null.
   * @param {string} stepId
   * @return {object|null}
   */
  getPrevStepData(stepId) {
    var step = null;

    for (var i = 0; i < this.data.steps.length; i++) {
      if (this.data.steps[i].id == stepId) {
        var prevStep = this.data.steps[i - 1];
        if (prevStep) step = prevStep;
      }
    }

    return step;
  },

  /**
   * Return prev step grouped option if exists
   * @param {string} stepId
   * @param {string|number} optionId
   * @return {object|null}
   */
  getPrevStepOptionData(stepId, optionId) {
    var options = this.getStepOptionsData(stepId),
      option = null

    for (var i = 0; i < options.length; i++) {
      if (options[i].id == optionId) {
        var prevOption = options[i - 1];
        if (prevOption) option = prevOption;
      }
    }

    return option;
  },

  /**
   * Return SHOP.customizer.data.steps.stepX.options
   * @param {string} stepId
   * @return {object[]}
   */
  getStepOptionsData(stepId) {
    var step = this.getStepData(stepId);
    return step ? step.options : [];
  },

  /**
   * Return SHOP.customizer.data.steps.stepX.options.optionX
   * @param {string} stepId
   * @param {string|number} optionId
   * @return {object|null}
   */
  getOptionData(stepId, optionId) {
    var option = null;

    this.getStepData(stepId).options.forEach(element => {
      if (element.id == optionId)
        option = element;
    });

    return option;
  },

  /**
   * Returns if all the step options are selected
   * @param {string} stepId
   * @return {boolean}
   */
  getStepAllOptsSelected(stepId) {
    var result = true;

    this.getStepOptionsData(stepId).forEach(element => {
      if (!element.selected)
        result = false;
    });

    return result;
  },

  /**
   * Return all selected steps
   * @return {object[]}
   */
  getCompletedSteps() {
    var result = [];

    this.getStepsData().forEach(element => {
      if (element.selected) {
        result.push(element)
      }
    });

    return result;
  },

  /**
   * Return resume step image
   * @param {string} stepId
   * @return {string}
   */
  getResumeStepImage(stepId) {
    var image = '',
      stepOptions = this.getStepOptionsData(stepId);

    this.buyFormData.options[`id${stepOptions[0].id}`].values
  },

  /**
   * Get data to SHOP.customizer.data.resume.options.optionX
   * @param {number} optionId
   * @return {object|null}
   */
  getResumeOptionData(optionId) {
    var findedOption = null;

    this.data.resume.options.forEach((option) => {
      if (option.id == optionId)
        findedOption = option;
    });
    this.data.resume.size.forEach((option) => {
      if (option.id == optionId)
        findedOption = option;
    });

    return findedOption;
  },

  /**
   * Return last step of array (SHOP.customizer.data.steps)
   */
  getLastStep() {
    var steps = this.getStepsData();

    return steps[steps.length - 1];
  },

  /**
   * Return last step option of step
   * @param {string} stepId 
   * @return {object}
   */
  getLastStepOption(stepId) {
    var step = this.getStepData(stepId);

    return step.options[step.options.length - 1];
  },

  /**
   * Return resume size option if exists
   * @return {object|null}
   */
  getResumeSizeOption() {
    var findedOption = null;

    this.data.resume.size.forEach((option) => {
      if (option.type == RESUME_SIZE_TYPE)
        findedOption = option;
    });

    return findedOption;
  },

  /**
   * Return first option by type from a step.
   * @param {object} step
   * @param {string} type
   * @return {object|null}
   */
  getStepOptionByType(step, type) {
    var result = null;

    if (CUSTOMIZER_OPT_TYPES.includes(type)) {
      for (let i = 0; i < step.options.length; i++) {
        const element = step.options[i];

        if (element.type === type) {
          result = element;
          break;
        }
      }
    }

    return result;
  },

  /**
   * Returns the parameters of the option value of type SOLE_TYPE
   * If value is not 100% valid returns null
   * Params of string value are: <part>_<id>_<vira>_<thicknes>
   * Regexp: (Sole|Canto)_([a-zA-Z]+)_(270|360)_(normal|double)
   * @param {string} value
   * @return {object|null}
   */
  getSoleTypeValueParams(value) {
    let rgxp = new RegExp(`(${ID_PREFIX_SOLE}|${ID_PREFIX_CANTO})_([a-zA-Z]+)_(${SOLES_VIRA_270}|${SOLES_VIRA_360})_(${SOLES_THICKNESS_NORMAL}|${SOLES_THICKNESS_DOUBLE})`),
      matchResult = value.match(rgxp);

    if (matchResult)
      return {
        part: matchResult[1],
        id: matchResult[2],
        vira: matchResult[3],
        thicknes: matchResult[4],
      };

    return null;
  },

  /**
   * Return all steps id in a string array.
   * @return {string[]}
   */
  getAllStepIds() {
    return this.getStepsData().map((step) => step.id);
  },

  /**
   * Return all step options threediumGroupPart in a one level string array.
   * @return {string[]}
   */
  getAllThreediumGroupParts() {
    return [].concat(...[].concat(...this.getStepsData().map(step => step.options.map(option => option.threediumGroupPart))));
  },

  /**
   * Find step by threediumGroupPart into steps options
   * @param {string} value
   * @return {object|null}
   */
  getStepByThreediumGroupPart(value) {
    var result = null;

    for (var i = 0; i < this.data.steps.length; i++) {
      const step = this.data.steps[i];

      for (let j = 0; j < step.options.length; j++) {
        const option = step.options[j];

        if (option.threediumGroupPart == value) {
          result = step;
          break;
        }
      }

      if (result) break;
    }

    return result;
  },

  /**
   * From the parameters of an option value it returns us whether it exists or not
   * @param {string[]} params 
   * @param {string} value 
   * @return {boolean}
   */
  existsOptionParam(params, value) {
    if (value && params) {
      for (let index = 0; index < params.length; index++) {
        const element = params[index];

        if (value.trim() === element.trim()) {
          return true;
        }
      }
    }
    return false;
  },

  /**
   * Initialize data for SHOP.customizer.data.steps property.
   */
  setStepsData() {
    var steps = [];

    $('[data-step]').each((index, el) => {
      steps.push($(el).data('step'));
    });

    SHOP.customizer.data.steps = steps;
  },

  /**
   * Initialize data for SHOP.customizer.data.resume property.
   */
  setResumeData() {
    SHOP.customizer.data.resume = $('.step-resume').data('resume');
  },

  /**
   * Set data to SHOP.customizer.data.steps.stepX.options.optionX
   * @param {string} stepId
   * @param {string|number} optionId
   * @param {object} newData
   */
  setStepOptionData(stepId, optionId, newData) {
    var findedOption = null;

    this.getStepOptionsData(stepId).forEach(element => {
      if (element.id == optionId)
        findedOption = element;
    });

    if (findedOption) $.extend(findedOption, newData);
  },

  /**
   * Set data to SHOP.customizer.data.steps.stepX.selected
   * @param {string} stepId
   * @param {boolean} selected
   */
  setStepSelectedData(stepId, selected) {
    this.getStepData(stepId).selected = selected;
  },

  /**
   * Set data to SHOP.customizer.data.resume.options.optionX
   * @param {number} optionId 
   * @param {object} newData 
   */
  setResumeOptionData(optionId, newData) {
    var findedOption = null;

    this.data.resume.options.forEach((option) => {
      if (option.id == optionId)
        findedOption = option;
    });
    this.data.resume.size.forEach((option) => {
      if (option.id == optionId)
        findedOption = option;
    });

    if (findedOption) $.extend(findedOption, newData);
  },

  /**
   * Set data to SHOP.customizer.activeStep
   * @param {string} stepId
   * @param {string|number} [optionId]
   */
  setActiveStep(stepId, optionId) {
    SHOP.customizer.data.activeStep.stepId = stepId;
    if (optionId) {
      SHOP.customizer.data.activeStep.optionId = optionId;
    }
  },

  /**
   * Find step by selectedValue into step options arrays
   * @param {string} selectedValue
   * @return {object|null}
   */
  findStepByOptionSelectedValue(selectedValue) {
    var result = null;

    for (var i = 0; i < this.data.steps.length; i++) {
      const step = this.data.steps[i];

      for (let j = 0; j < step.options.length; j++) {
        const option = step.options[j];

        if (option.selectedValue == selectedValue) {
          result = step;
          break;
        }
      }

      if (result) break;
    }

    return result;
  },

  /**
   * Returns if selected step and option is first step and first option
   * @param {string} stepId
   * @param {string|number} optionId
   * @return {boolean}
   */
  isFirstStepAndFirstOption(stepId, optionId) {
    var steps = this.getStepsData();

    return steps[0].id == stepId && steps[0].options[0].id == optionId;
  },
};

SHOP.customizer = { ...SHOP.customizer, ...module };
