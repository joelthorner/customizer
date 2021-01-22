/*                     _                         _
                      | |                       (_)
   ___   _   _   ___  | |_    ___    _ __ ___    _   ____   ___   _ __ 
  / __| | | | | / __| | __|  / _ \  | '_ ` _ \  | | |_  /  / _ \ | '__|
 | (__  | |_| | \__ \ | |_  | (_) | | | | | | | | |  / /  |  __/ | |
  \___|  \__,_| |___/  \__|  \___/  |_| |_| |_| |_| /___|  \___| |_|   threedium
*/

const THREEDIUM_API_SRC = 'https://distcdn.unlimited3d.com/pres/v/1.1.21/unlimited3d.min.js';

const RESUME_ID_STEP = 'resume';
const RESUME_SIZE_TYPE = 'size';

const EMPTY_OPTION_VALUE_PART = 'NONE';

const ID_PREFIX_SOLE = 'Sole';
const ID_PREFIX_CANTO = 'Canto';

SHOP.customizer = {
  /**
   * Property that contains all data of customizer updated every moment
   * @type {object} 
   */
  data: {},

  /**
   * Customizer container element
   * @type {object} 
   */
  $el: $('#customizer-layout'),

  /**
   * Indicates if the user has interacted with the customizer
   * @type {boolean} 
   */
  userInteraction: false,

  /**
   * Main init of threedium customizer
   */
  init() {
    if (this.$el.length && $('html').hasClass('customizer-threedium')) {
      this.data = this.getData();
      this.fluidConfs();
      this.components.init();
      this.threedium.import();
      this.listeners.init();
      SHOP.module.sizeGuideMenu.init();
    }
  },

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
   * @return {array}
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
   * @return {array}
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
   * @return {array}
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

    for (let i = 0; i < step.options.length; i++) {
      const element = step.options[i];

      if (element.type === type) {
        result = element;
        break;
      }
    }

    return result;
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

  /**
   * Fluid configurations before customizer init
   */
  fluidConfs() {
    Fluid.config.showModalBasket = false;

    // Hide real option elements
    $('.real-options-output').find('label, input, textarea, button').attr('tabindex', -1);
  },

  /**
   * Object that contains all related of Threedium
   */
  threedium: {

    /**
     * Initializes Unlimited3D library.
     * https://threedium.co.uk/documentation/api
     * @TODO parametritzar model per producte
     */
    options: {
      distID: 'latest',
      solution3DName: 'trilogi-solution-2',
      projectName: 'carmina-shoes-demo',
      solution3DID: '4544',
      containerID: 'customizer-render',
      collectAnalytics: false,

      /**
       * Called when loading of models and textures has changed First and only parameter is an object contain information about loading status.
       * @param {object} loading 
       */
      onLoadingChanged(loading) {
        var text = loading.progress.toFixed(0) + '%',
          $loading = $('#loading-customizer');

        $loading.find('.percent').text(text);

        if (loading.progress >= 100) {
          $loading.addClass('hide');
        }

        // Fallback
        setTimeout(() => {
          $loading.addClass('hide');
        }, 8000);
      },

      /**
       * Called whenever user clicks on the scene First and only parameter is an array of objects in format.
       * @param {array} objectsClick 
       */
      onPointerClick: function (objectsClick) {
        console.log(objectsClick);
        if (objectsClick.length) {
          var clickedValue = objectsClick[0].shortName,
            step = SHOP.customizer.getStepData(clickedValue);

          if (step) {
            SHOP.customizer.methods.activeStep(step.id);
          } else {
            var findedStep = SHOP.customizer.findStepByOptionSelectedValue(clickedValue);
            if (findedStep) {
              SHOP.customizer.methods.activeStep(findedStep.id);
            }
          }
        }
      },
    },

    configuration: {},

    /**
     * Callback function called after action is completed first parameter returned is error, 
     * which is set to null in case of success.
     * @param {object|null} error 
     */
    onLoad(error) {
      if (error == null) {
        $('#loading-customizer').addClass('hide');
      } else {
        console.error('Customizer loading error: ', error);
      }
    },

    /**
     * This method import threedium api js and call init on callback.
     */
    import() {
      Fluid.require.js(THREEDIUM_API_SRC, this.init);
    },

    /**
     * Init of threedium canvas with model, project and other options.
     * This function is called into threedium import method.
     */
    init() {
      var self = SHOP.customizer.threedium;

      self.configuration = self.getConfiguration();
      console.log(self.configuration);
      Unlimited3D.init(self.options, self.configuration, self.onLoad);
    },

    /**
     * Create an object with the initial 3D moelo settings. 
     * According to the options that are selected.
     * 
     * @example
     * parts: {
     *   show: ['PartName'],
     *   hide: ['PartName'],
     *   override: ['PartName'],
     *   materials: {
     *     'Boxcalf_Black': ['ToeCap'],
     *   },
     * }, 
     * @return {object}
     */
    getConfiguration() {
      // Nomes es mostraran les parts que jo digui la resta s'ocultaran gracies al <override>.
      var materials = {}, override = [];

      SHOP.customizer.getStepsData().forEach((step) => {
        var part = step.id;

        step.options.forEach((option) => {
          if (option.type == 'A') {
            this.addConfigMaterialPart(materials, option.selectedValue, part);
            override.push(part);

          } else if (option.type == 'B') {

          } else if (option.type == 'C') {
            var optionTypeA = SHOP.customizer.getStepOptionByType(step, 'A');

            if (option.selectedValue === EMPTY_OPTION_VALUE_PART) {
              override.push(optionTypeA.threediumGroupPart);
            } else {
              if (optionTypeA) {
                this.addConfigMaterialPart(materials, optionTypeA.selectedValue, option.selectedValue);
              }
              override.push(option.selectedValue);
            }
          } else if (option.type == 'E') {
            var optionTypeF = SHOP.customizer.getStepOptionByType(step, 'F');
            // @TODO Remove two replaces when threedium model sigui bo !!! tingui un id correcte
            var showParts = [
              option.selectedValue/* desde aqui va fora tot lo de la dreta */.replace('XXX', '').replace('YYY', ''),
              option.selectedValue.replace(ID_PREFIX_SOLE, ID_PREFIX_CANTO)/* desde aqui va fora tot lo de la dreta */.replace('XXX', '').replace('YYY', ''),
            ];
            override = [...override, ...showParts];

            var material = optionTypeF ? optionTypeF.selectedValue : '';
            this.addConfigMaterialPart(materials, material, showParts);

          } else if (option.type == 'F') {
            // en aquest cas no hauriem de fer res doncs ja ho hem fet la opt 'E' del step Soles
          }
        });
      });

      return {
        parts: {
          // hide,
          // show,
          override,
          materials,
        },
      };
    },

    /**
     * Add part into material key to materials object
     * @param {object} materials 
     * @param {string} material 
     * @param {string|string[]} part 
     */
    addConfigMaterialPart(materials, material, part) {
      if (material.length) {
        if (typeof materials[material] == 'undefined') {

          if (typeof part === 'string')
            materials[material] = [part];
          else
            materials[material] = part;

        } else {

          if (typeof part === 'string')
            materials[material].push(part);
          else materials[material] = [...materials[material], ...part]

        }
      }
      return materials;
    },

    /**
     * Threedium method https://threedium.co.uk/documentation/api#ChangeMaterial
     * @param {string[]} parts
     * @param {string} material
     * @param {function} callback
     */
    changeMaterial(parts = [], material = '', callback = (error) => console.log(error)) {
      Unlimited3D.changeMaterial({
        parts: parts,
        material: material,
      }, callback);
    },

    /**
     * Threedium method https://threedium.co.uk/documentation/api#Hideparts
     * @param {string[]} parts 
     * @param {function} callback 
     */
    hideGroup(parts = [], callback = (error) => console.log(error)) {
      Unlimited3D.hideParts({
        parts: parts,
      }, callback);
    },

    /**
     * Threedium method https://threedium.co.uk/documentation/api#Showparts
     * @param {string[]} parts 
     * @param {function} callback 
     */
    showPart(parts = [], callback = (error) => console.log(error)) {
      Unlimited3D.showParts({
        partObjects: [
          {
            parts: parts,
          },
        ],
      }, callback);
    },

    /**
     * Hide group of parts and show a part
     * @param {string[]} hideParts 
     * @param {string[]} showParts 
     * @param {function} callback 
     */
    hideGroupShowPart(hideParts = [], showParts = [], callback = (error) => console.log(error)) {
      this.hideGroup(hideParts, (error) => {
        this.showPart(showParts, callback);
      });
    },

    /**
     * Hide group of parts, show a part and change material.
     * @param {string[]} hideParts 
     * @param {string[]} showParts 
     * @param {string[]} changeMaterialParts 
     * @param {string} material 
     * @param {function} callback 
     */
    hideGroupShowPartChangeMaterial(hideParts = [], showParts = [], changeMaterialParts = [], material = '', callback = (error) => console.log(error)) {
      this.hideGroupShowPart(hideParts, showParts, (error) => {
        this.changeMaterial(changeMaterialParts, material, callback);
      });
    },

    /**
     * Threedium api actions depending option type
     * @param {string} type - threedium type of option (A, B, C, E, F, G)
     * @param {string} stepId
     * @param {string} optionId
     */
    action(type, stepId, optionId) {
      var step = SHOP.customizer.getStepData(stepId),
        option = SHOP.customizer.getOptionData(stepId, optionId),
        methodName = 'action' + type.toUpperCase();

      if (typeof this[methodName] === 'function')
        this[methodName](step, option);
    },

    /**
     * [ToeCap___ToeCap] Default options action type. Simple change material of part.
     * @param {string} step 
     * @param {string} option 
     */
    actionA(step, option) {
      var changeMaterialPartsArr = [];

      for (let i = 0; i < step.options.length; i++) {
        const element = step.options[i];
        if (element.type == 'A') changeMaterialPartsArr.push(element.threediumGroupPart);
        if (element.type == 'C') changeMaterialPartsArr.push(element.selectedValue);
      }

      this.changeMaterial(changeMaterialPartsArr, option.selectedValue);
    },

    /**
     * [] options action type
     * @param {string} step 
     * @param {string} option 
     * @todo
     */
    actionB(step, option) {

    },

    /**
     * [ToeCap___Medallions] options action type
     * @param {string} step 
     * @param {string} option 
     */
    actionC(step, option) {
      var optionTypeA = SHOP.customizer.getStepOptionByType(step, 'A');

      if (option.selectedValue === EMPTY_OPTION_VALUE_PART) {
        var showParts = optionTypeA ? [optionTypeA.threediumGroupPart] : [];
        this.hideGroupShowPart([option.threediumGroupPart], showParts);
      } else {
        var hidePartsArr = optionTypeA ? [optionTypeA.threediumGroupPart] : [];
        var material = optionTypeA ? optionTypeA.selectedValue : '';

        hidePartsArr.push(option.threediumGroupPart);
        this.hideGroupShowPartChangeMaterial(hidePartsArr, [option.selectedValue], [option.selectedValue], material);
      }
    },

    /**
     * [Soles___Soles] options action type
     * @param {string} step 
     * @param {string} option 
     * @TODO
     */
    actionE(step, option) {
      var optionTypeF = SHOP.customizer.getStepOptionByType(step, 'F'),
        material = optionTypeF ? optionTypeF.selectedValue : '',
        // @TODO Remove two replaces when threedium model sigui bo !!! tingui un id correcte
        solePart = option.selectedValue/* desde aqui va fora tot lo de la dreta */.replace('XXX', '').replace('YYY', ''),
        cantoPart = option.selectedValue.replace(ID_PREFIX_SOLE, ID_PREFIX_CANTO)/* desde aqui va fora tot lo de la dreta */.replace('XXX', '').replace('YYY', ''),
        showParts = [solePart, cantoPart],

        soleId = null,
        selectedValueSplit = option.selectedValue.split('_');

      console.log(option);

      // "SoleXXX_270_normal" --> id, weight, <normal|double>
      if (selectedValueSplit.length === 3) soleId = selectedValueSplit[0];

      // Falta restringir els colors del seguent opcio type F segons match daquest
      if (soleId && optionTypeF) {
        // restringir materials (Soles___Color)
        SHOP.customizer.methods.restrictOptionValues(optionTypeF, soleId);
        
        // si la opcio de color que teniem seleccionada esta en disabled, activar la primera que trobi del primer tab actiu
        // activar el tab si no ho esta
        // seleccionar la opcio // amb click, ja saltará l'actionF i es canviara de colort
        
        // si el color ja seleccionat esta actiu, nomes canviar el material
        // this.hideGroupShowPartChangeMaterial([option.threediumGroupPart], showParts, solePart, material);
      }
    },

    /**
     * [Soles___Color] options action type
     * @param {string} step 
     * @param {string} option 
     */
    actionF(step, option) {
      var optionTypeE = SHOP.customizer.getStepOptionByType(step, 'E'),
        changeParts = [];

      if (optionTypeE) {
        changeParts = [
          // @TODO Remove two replaces when threedium model sigui bo !!! tingui un id correcte
          optionTypeE.selectedValue/* desde aqui va fora tot lo de la dreta */.replace('XXX', '').replace('YYY', ''),
          optionTypeE.selectedValue.replace(ID_PREFIX_SOLE, ID_PREFIX_CANTO)/* desde aqui va fora tot lo de la dreta */.replace('XXX', '').replace('YYY', ''),
        ];

        this.changeMaterial(changeParts, option.selectedValue);
      }

      // •	Canviarà el material de les parts visibles del grup Sole, Ex SoleXXX_360_normal i CantoXXX_360_normal
      // •	Marcara com a seleccionat el valor corresponent en l’opció Canto___Color per sincronitzar (? Cal confirmar)

      // var optionTypeF = SHOP.customizer.getStepOptionByType(step, 'F'),
      //   material = optionTypeF ? optionTypeF.selectedValue : '',
      //   showParts = [
      //     // @TODO Remove two replaces when threedium model sigui bo !!! tingui un id correcte
      //     option.selectedValue.replace('XXX', '').replace('YYY', ''),
      //     option.selectedValue.replace(ID_PREFIX_SOLE, ID_PREFIX_CANTO).replace('XXX', '').replace('YYY', '')
      //   ];

      // this.hideGroupShowPartChangeMaterial([option.threediumGroupPart], showParts, material);
    },

    /**
     * [Sole___Color] options action type
     * @param {string} step 
     * @param {string} option 
     */
    actionF(step, option) {
      console.log(step, option);
    },
  },

  /**
   * This object contains initializations of all HTML components except threedium, 
   * and methods to interact with them.
   */
  components: {
    /**
     * Controls swiper instance
     * @type {Swiper|null}
     */
    swiper: null,

    /**
     * Init function of components object
     */
    init() {
      this.initSwiperControls();
      this.scrollBars();
      this.initSizeOption();
    },

    /**
     * Initialize size radio fake buttons option
     */
    initSizeOption() {
      var $cont = $('.resume-option-size');

      if ($cont.length) {
        $cont.find('input[type="radio"]').each((index, el) => {
          $(el).data('simpleButtonRadios').options.changeCallback = (sbr) => {
            sbr.$element.closest('.resume-option-values')
              .find('div.resume-value-radio')
              .removeClass('resume-option-selected');

            sbr.$element.closest('div.resume-value-radio')
              .addClass('resume-option-selected');
          };
        });
      }
    },

    /**
     * Initialize step controls swiper
     */
    initSwiperControls() {
      this.swiper = new Swiper('.customizer-steps-controls', {
        spaceBetween: 0,
        slidesPerView: 'auto'
      });
    },

    /**
     * Change active slide of controls swiper
     * @param {string} stepId 
     */
    slideToControl(stepId) {
      var $control = $(`.step-control[data-step-id="${stepId}"]`).closest('.step-control-item'),
        index = $('.step-control-item').last().index();

      if ($control.length) {
        index = $control.index();
      }

      SHOP.customizer.components.swiper
        .slideTo(index);
    },

    /**
     * Initialize step custom scrollbars plugin
     */
    scrollBars() {
      $('.customizer-threedium .scrollbar-outer').scrollbar();
    },

    /**
     * Change elements classes on active step
     * @param {string|object} target - jQuery to activate elements or string with stepId value
     */
    activeStep(target) {
      $('.step-control, .step-content, .step-resume').removeClass('active');

      if (typeof target == 'string') {
        $(`.step-control[data-step-id="${target}"], .step-content[data-step-id="${target}"]`).addClass('active');
      }
      if (typeof target == "object" && target.length) {
        target.addClass('active');
      }
    },

    /**
     * Hide all steps and show resume
     */
    activeResume() {
      var self = SHOP.customizer,
        steps = self.getStepsData();

      $('.step-resume .resume-virtual-steps').html(self.components.getResumeHtmlSteps(steps));
      $('.step-control, .step-content').removeClass('active');
      $('.step-resume, .step-control-resume').addClass('active');
    },

    /**
     * Change classes on select option value froms step.
     * @param {object} $target - jQuery option value target element
     */
    activeOptionValue($target) {
      $target.parent().find('.option-value-trigger-item').removeClass('active');
      $target.addClass('active');
    },

    /**
     * Select grouped options step tab and change related tab elements.
     * @param {object} $target - jQuery event target trigger
     * @param {object} $relatedTargets - jQuery related targets
     */
    activeStepGroupedOptionTab($target, $relatedTargets) {
      // tab menu items [ a|b|c ]
      $target.closest('.step-content-gruped-menu').find('.grouped-menu-item').removeClass('active');
      $target.addClass('active');

      // tab titles [ 1.aaaa ] & tab containers [ oooo ]
      $relatedTargets.closest('.step-content').find('.step-content-option-values, .step-content-option-subtitle').removeClass('active');
      $relatedTargets.addClass('active');
    },

    /**
     * Select left side double option tabs and change related tab elemeents.
     * @param {object} $target - jQuery event target trigger
     * @param {object} $relatedTargets - jQuery related targets
     */
    activeDoubleOptionValuesTab($target, $relatedTargets) {
      // side tabs
      $target.closest('.option-tab-controls').find('.option-tab-control').removeClass('active');
      $target.closest('.option-tab-control').addClass('active');

      // tab containers
      $relatedTargets.closest('.option-block-split-panels').find('.option-block-split-panel').removeClass('active');
      $relatedTargets.closest('.option-block-split-panel').addClass('active');
    },

    /**
     * Open side modal resume and update self steps data.
     */
    showResumeModal() {
      var self = SHOP.customizer,
        $modal = $('#resume-menu-customizer-modal'),
        completedSteps = self.getCompletedSteps(),
        steps = self.getStepsData();

      $modal.find('.steps-data-current .current').text(completedSteps.length);
      $modal.find('.steps-data-current .total').text(steps.length);
      $modal.find('.resume-virtual-steps').html(self.components.getResumeHtmlSteps(steps));

      $modal.modal('show');
    },

    /**
     * Get resume modal step html
     * @param {array} steps
     * @return {string}
     */
    getResumeHtmlSteps(steps) {
      var html = '';

      steps.forEach((step, index) => {
        html += this.getResumeHtmlStep(step, index)
      });

      return html;
    },

    /**
     * Get resume modal step html
     * @param {object} step 
     * @return {string}
     */
    getResumeHtmlStep(step, index) {
      var optionsList = '';

      step.options.forEach((option) => {
        optionsList += this.getResumeHtmlStepOption(option);
      });

      return `
        <div class="virtual-resume-item">
          <a href="#" data-step-id="${step.id}" class="virtual-resume-trigger" data-click-action="goToStep">
            <div class="virtual-resume-item-img">
              <img class="large-img img-responsive" src="${step.resumeImg}">
            </div>
            <div class="virtual-resume-item-info">
              <span class="index-name">
                <span>${index + 1}</span><span>.</span><span>${step.title}</span>
              </span>
              <div class="options">${optionsList}</div>
            </div>
          </a>
        </div>`;
    },

    /**
     * Get resume modal step option html
     * @param {object} option 
     * @return {string}
     */
    getResumeHtmlStepOption(option) {
      var img = option.selectedValueImg.length ? `<img class="value-img img-responsive" src="${option.selectedValueImg}">` : ``;

      return (option.selected) ? `
        <div class="option">
          ${img}
          <span class="title">${option.title}</span>
          <span class="value">${option.selectedTitle}</span>
        </div>` : ``;
    },

    /**
     * Toggle prev step action HTML elements
     * @param {boolean} show
     */
    togglePrevElements(show) {
      $('[data-click-action="goToPrev"]')[show ? 'removeClass' : 'addClass']('disabled');
    },

    /**
     * Toggle next step action HTML elements
     * @param {boolean} show
     */
    toggleNextElements(show) {
      $('[data-click-action="goToNext"]')[show ? 'removeClass' : 'addClass']('disabled');
    },

    /**
     * Toggle resume menu triggers
     * @param {boolean} show
     */
    toggleResumeModalElements(show) {
      $('[data-click-action="showResumeModal"]')[show ? 'removeClass' : 'addClass']('disabled');
    },

    /**
     * Toggle resume bar buy elements
     * @param {boolean} show
     */
    toggleResumeBarBuyElements(show) {
      $('.resume-bar-buy')[show ? 'removeClass' : 'addClass']('hidden');
    },

    /**
     * Toggle size option alert warning
     * @param {boolean} show
     */
    toggleSizeAlert(show) {
      $('.resume-alert-container')[show ? 'removeClass' : 'addClass']('hidden');
    },

    /**
   * Sync selected customizer option value with {$ buyformOptions ...
   * only radio or checkbox inputs.
   * @param {number} optionId
   * @param {number} valueId
   */
    syncRadioOrCheckOption(optionId, valueId) {
      $(`.productOption${optionId}`)
        .find(`[name="optionValue${optionId}"][value="${valueId}"]`)
        .trigger('click');
    },

    /**
     * Sync selected customizer option value with {$ buyformOptions ...
     * only textarea or input text
     * @param {number} optionId 
     * @param {string} selectedValue 
     */
    syncTextOption(optionId, selectedValue) {
      $(`.productOption${optionId}`)
        .find('textarea, input[type="text"]')
        .val(selectedValue);
    },

    /**
     * Set selected size option to specifyc components
     * @param {object} option - SHOP.customizer.data.resume.size option
     */
    setSizeSelectedValue(option) {
      if (option.selectedValue) {
        $('#dropup-buy-options .value').html(option.selectedValue);
      }
    },

    /**
     * Enable / disable buyFormSubmit
     * @param {boolean} activeBuy 
     * @param {string} optTitle 
     */
    changeBuyFormSubmit(activeBuy, optTitle) {
      var $btn = $('.btn-customizer-buy');

      if (activeBuy) {
        $btn
          .html(languageSheet.BUY)
          .removeClass('disabled')

      } else {
        optTitle = optTitle.replace(':', '').trim();

        $btn
          .html(languageSheet.SELECTOPTION.replace('%option%', optTitle))
          .addClass('disabled')
      }
    },

    /**
     * Toggle size dropdown option
     * @param {object} $target
     */
    toggleSizeDropdown($target) {
      if (!$target.is('.btn-customizer-buy-mobile')) {
        $('#dropup-buy-options').dropdown('toggle');
      }
    },

    /**
     * Manually submit buyForm
     */
    submitForm() {
      $('.main-customizer-form').trigger('submit');
    },

    /**
     * Update container class of active step
     * @param {string} classSuffix 
     */
    updateContainerClassContext(classSuffix) {
      $('#customizer-layout')
        .removeClass((index, className) => {
          return (className.match(/customizerActive_[a-zA-Z]+/g) || []).join(' ');
        })
        .addClass(`customizerActive_${classSuffix}`);
    },

    /**
     * Hide or show '.option-value-trigger-item' elements
     * @param {object} $elements 
     */
    toggleOptionValueTriggerItems($elements) {
      $elements.each((index, el) => {
        var data = $(el).data('option-value');

        if (data.disabled) $(el).addClass('restricted-hidden');
        else $(el).removeClass('restricted-hidden');
      });
    },

    /**
     * Returns container option element from optionId
     * @param {string|number} optionId 
     * @return {object}
     */
    getRestrictedOption(optionId) {
      return $('.customizerStepOptionTab_' + optionId);
    },

    /**
     * Returns jQuery option values elements from '.step-content-option-values' element
     * @param {object} $stepContentOptionValues 
     * @return {object}
     */
    getRestrictedOptionValues($stepContentOptionValues) {
      return $stepContentOptionValues.find('.option-value-trigger-item');
    },

    /**
     * Hide or show '.option-tab-control a', tabs in double split options
     * @param {object} $optionTabControls 
     */
    toggleRestrictedOptionTabs($optionTabControls) {
      $optionTabControls.each((index, el) => {
        var target = $(el).data('target');
        var $elements = this.getRestrictedOptionValues($(target));

        if ($elements.not('.restricted-hidden').length) {
          $(el).removeClass('restricted-hidden');
        } else {
          $(el).addClass('restricted-hidden');
        }
      });
    },
  },

  /**
   * All click events associated with customizer components are executed here
   */
  listeners: {

    /**
     * Initialize the global listener and execute its specific method
     */
    init() {
      ['click', 'input', 'change'].forEach((type) => {
        $(document).on(type, `[data-${type}-action]`, function (event) {
          event.preventDefault();
          var method = $(this).data(`${type}-action`);

          if (typeof SHOP.customizer.listeners[method] === 'function')
            SHOP.customizer.listeners[method]($(this));
        });
      });
    },

    /**
     * Event, click on grouped options step horizontal tabs.
     * @param {object} $this - jQuery event target element
     */
    showStepGroupedOptionTab($this) {
      SHOP.customizer.components.activeStepGroupedOptionTab(
        $this,
        $($this.data('target'))
      );

      SHOP.customizer.setActiveStep(
        $this.data('step-id'),
        $this.data('step-option')
      );
    },

    /**
     * Event, click on double values option, vertical tabs.
     * @param {object} $this - jQuery event target element
     */
    showDoubleOptionValuesTab($this) {
      SHOP.customizer.components.activeDoubleOptionValuesTab(
        $this,
        $($this.data('target'))
      );
    },

    /**
     * Event, click on option value. Select option value, update global data,
     * sync real option, and call threedium action.
     * @param {object} $this - jQuery event target element
     */
    selectOptionValue($this) {
      var stepId = $this.data('step-id'),
        optionValueData = $this.data('option-value');

      SHOP.customizer.methods.selectOptionValue($this, stepId, optionValueData);
    },

    /**
     * Event, click on any trigger with this data value, call component
     * open resume lateral panel.
     * @param {object} $this - jQuery event target element
     */
    showResumeModal($this) {
      SHOP.customizer.components.showResumeModal();
    },

    /**
     * Force go to the next grouped option or step
     * @param {object} $this - jQuery event target element
     */
    goToPrev($this) {
      var self = SHOP.customizer,
        active = self.getActiveStep();

      if (active.stepId == RESUME_ID_STEP) {
        var lastStep = self.getLastStep(),
          lastStepOpt = self.getLastStepOption(lastStep.id);

        self.methods.activeStep(lastStep.id, lastStepOpt.id);
      }
      else {
        var stepData = self.getStepData(active.stepId),
          stepDataPrevOption = self.getPrevStepOptionData(active.stepId, active.optionId),
          prevStepData = self.getPrevStepData(stepData.id);

        if (stepData.grouped && stepDataPrevOption) {
          self.methods.activeStep(stepData.id, stepDataPrevOption.id, true);
        }
        else if (prevStepData) {
          var lastOptId = prevStepData.options[prevStepData.options.length - 1].id;
          self.methods.activeStep(prevStepData.id, lastOptId);
        }
      }
    },

    /**
     * Force go to the prev grouped option or step
     * @param {object} $this - jQuery event target element
     */
    goToNext($this) {
      var self = SHOP.customizer,
        active = self.getActiveStep(),
        stepData = self.getStepData(active.stepId),
        stepDataNextOption = self.getNextStepOptionData(active.stepId, active.optionId),
        nextStepData = self.getNextStepData(stepData.id);

      if (stepData.grouped && stepDataNextOption) {
        self.methods.activeStep(stepData.id, stepDataNextOption.id, true);
      } else if (nextStepData) {
        self.methods.activeStep(nextStepData.id);
      } else {
        self.methods.activeResume();
      }
    },

    /**
     * Go to step
     * @param {object} $this - jQuery event target element
     */
    goToStep($this) {
      var stepId = $this.data('step-id');
      SHOP.customizer.methods.activeStep(stepId);
    },

    /**
     * Go to resume
     * @param {object} $this - jQuery event target element
     */
    goToResume($this) {
      SHOP.customizer.methods.activeResume();
    },

    /**
     * Sync input text and textarea values with fake options
     * @param {object} $this 
     */
    syncInputResumeOption($this) {
      var optionId = $this.data('option-id');

      SHOP.customizer.methods.selectOptionResumeValue($this, optionId, 0);
    },

    /**
     * Sync checks and radios inputs values with fake options
     * @param {object} $this 
     */
    syncCheckResumeOption($this) {
      var optionId = $this.data('option-id'),
        valueId = $this.data('option-value-id');

      SHOP.customizer.methods.selectOptionResumeValue($this, optionId, valueId);
    },

    /**
     * Fake buyFormSubmit click fire this event
     * @param {object} $this 
     */
    productBuy($this) {
      SHOP.customizer.methods.productBuySubmit($this);
    },
  },

  /**
   * Direct methods of the customizer, transversal actions between threedium, 
   * components and listeners.
   */
  methods: {

    /**
     * Active resume method
     */
    activeResume() {
      var self = SHOP.customizer,
        sizeOption = self.getResumeSizeOption();

      // Save data
      self.setActiveStep(RESUME_ID_STEP, 0);

      // Depends size is selected change buyFormSubmit
      self.components.changeBuyFormSubmit(sizeOption.selected, sizeOption.title);

      // Active resume
      self.components.activeResume();

      // Manage prev next components
      self.components.togglePrevElements(true);
      self.components.toggleResumeBarBuyElements(true);
      self.components.toggleNextElements(false);
      self.components.toggleResumeModalElements(false);

      self.components.updateContainerClassContext(RESUME_ID_STEP);
      self.components.slideToControl(RESUME_ID_STEP);
    },

    /**
     * Active step method
     * @param {string} stepId
     * @param {string|number} [optionId]
     * @param {boolean} [activeOnlyOpt]
     */
    activeStep(stepId, optionId, activeOnlyOpt) {
      var self = SHOP.customizer,
        stepData = self.getStepData(stepId),
        optionId = optionId ? optionId : stepData.options[0].id,
        activeOnlyOpt = activeOnlyOpt === true ? true : false;

      // If grouped step show specific grouped opt
      if (stepData.grouped || activeOnlyOpt) {
        self.components.activeStepGroupedOptionTab(
          $(`[data-target=".customizerStepOptionTab_${optionId}"]`),
          $(`.customizerStepOptionTab_${optionId}`)
        );
      }

      // Show component step
      if (!activeOnlyOpt) self.components.activeStep(stepData.id);

      // Save data
      self.setActiveStep(stepData.id, optionId);

      // Manage prev next components
      self.components.togglePrevElements(
        !self.isFirstStepAndFirstOption(stepData.id, optionId)
      );
      self.components.toggleNextElements(true);
      self.components.toggleResumeModalElements(true);
      self.components.toggleResumeBarBuyElements(false);

      self.components.updateContainerClassContext(stepData.id);
      self.components.slideToControl(stepData.id);
    },

    /**
     * Select option value method
     * @param {object} $target
     * @param {string} stepId
     * @param {object} data
     */
    selectOptionValue($target, stepId, data) {
      var self = SHOP.customizer,
        stepOptionData = self.getOptionData(stepId, data.optionId);

      // Save step option data
      self.setStepOptionData(stepId, data.optionId, {
        selected: true,
        selectedValueId: data.valueId,
        selectedValue: data.threediumValue,
        selectedTitle: data.valueTitle,
        selectedValueImg: data.valueImg,
      });

      // Save if all step options are selected
      self.setStepSelectedData(stepId, self.getStepAllOptsSelected(stepId));

      // Active component opt value
      self.components.activeOptionValue($target);

      // Select real option value (fluid)
      self.components.syncRadioOrCheckOption(data.optionId, data.valueId);

      // Threedium actions
      self.threedium.action(stepOptionData.type, stepId, data.optionId);
    },

    /**
     * Select option value method (resume related options)
     * @param {object} $target
     * @param {number} optionId 
     * @param {number} valueId 
     */
    selectOptionResumeValue($target, optionId, valueId) {
      var self = SHOP.customizer,
        selectedValue = $target.val(),
        resumeOptData = self.getResumeOptionData(optionId);

      if ($target.is('textarea, input[type="text"]')) {
        self.components.syncTextOption(optionId, selectedValue);
      } else if ($target.is('input[type="radio"]')) {
        self.components.syncRadioOrCheckOption(optionId, valueId);
      } else if ($target.is('input[type="checkbox"]')) {
        self.components.syncRadioOrCheckOption(optionId, valueId);
        selectedValue = $target.prop('checked');
      }

      self.setResumeOptionData(optionId, {
        selected: true,
        selectedValueId: valueId,
        selectedValue: selectedValue,
      });

      if (resumeOptData.type == RESUME_SIZE_TYPE) {
        self.components.toggleSizeAlert(false);
        self.components.setSizeSelectedValue(resumeOptData);
        self.components.changeBuyFormSubmit(
          resumeOptData.selected,
          resumeOptData.title
        );
      }
    },

    /**
     * BuyForm submit method
     * @param {object} $target 
     */
    productBuySubmit($target) {
      setTimeout(() => {
        if ($target.hasClass('disabled')) {
          SHOP.customizer.components.toggleSizeDropdown($target);
        } else {
          SHOP.customizer.components.submitForm();
        }
      }, 100);
    },

    /**
     * 
     * @param {object} restrictedOption
     * @param {string} restrictingParam - "SoleXXX"
     */
    restrictOptionValues(restrictedOption, restrictingParam) {
      var self = SHOP.customizer,
        $stepContentOptionValues = self.components.getRestrictedOption(restrictedOption.id),
        $optionValueTriggerItems = self.components.getRestrictedOptionValues($stepContentOptionValues);

      // For each option value set enable or disable depending on restriction
      $optionValueTriggerItems.each((index, el) => {
        var data = $(el).data('option-value'),
          hide = true;

        for (let i = 0; i < data.params.length; i++) {
          const param = data.params[i];

          if (param.trim() === restrictingParam.trim())
            hide = false;
        }

        if (hide) data.disabled = true;
        else data.disabled = false;
      });

      self.components.toggleOptionValueTriggerItems($optionValueTriggerItems);

      if ($stepContentOptionValues.hasClass('double')) {
        self.components.toggleRestrictedOptionTabs($stepContentOptionValues.find('.option-tab-control a'));
      }
    }
  },
};
