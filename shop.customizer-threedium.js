/**
 * @file Manage all the logic that interacts directly with the threedium library api
 * @author joelthorner
 */

var module = {
  /**
   * Object that contains all related of Threedium
   */
  threedium: {

    /**
     * Indicates if the threedium model has been initialized
     * @type {boolean}
     */
    initialized: false,

    /**
     * Initializes Unlimited3D library.
     * https://threedium.co.uk/documentation/api
     */
    options: {
      distID: 'latest',
      // solution3DID: '4792',
      // solution3DName: 'trilogi-aj-80250',
      projectName: 'carmina-shoes-demo',
      containerID: 'customizer-render',
      collectAnalytics: false,

      /**
       * Called when loading of models and textures has changed First and only parameter is an object contain information about loading status.
       * @param {object} loading 
       */
      onLoadingChanged(loading) {
        SHOP.customizer.components.setLoadingPercent(loading.progress);

        if (loading.progress >= 100) {
          SHOP.customizer.components.hideLoading();
        }
      },

      /**
       * Called whenever user clicks on the scene First and only parameter is an array of objects in format.
       * @param {object[]} objectsClick 
       */
      onPointerClick(objectsClick) {
        console.log(objectsClick);

        if (objectsClick.length) {
          let clickedValue = objectsClick[0].shortName,
            regexp = `(${SHOP.customizer.getAllThreediumGroupParts().join('|')})`,
            match = clickedValue.match(new RegExp(regexp));

          if (match) {
            let step = SHOP.customizer.getStepByThreediumGroupPart(match[0]);
            SHOP.customizer.actions.activeStep(step.id);
          } else {
            let findedStep = SHOP.customizer.findStepByOptionSelectedValue(clickedValue);
            if (findedStep) {
              SHOP.customizer.actions.activeStep(findedStep.id);
            }
          }
        }
      },
    },

    configuration: {
      parts: {
        // hide,
        // show,
        override: [
          // 'Culet_logo',
          'Sole_interior',
        ],
        materials: {},
      },
    },

    /**
     * Array of functions that will be executed just after starting the 3d model.
     * @type {Function[]}
     */
    onLoadCallbacks: [],

    /**
     * Callback function called after action is completed first parameter returned is error, 
     * which is set to null in case of success.
     * @param {object|null} error 
     */
    onLoad(error) {
      let self = SHOP.customizer;

      if (error == null) {
        self.components.hideLoading();

        if (self.debug.findErrors) self.debug.checkConfiguration();

        self.threedium.onLoadCallbacks.forEach(func => func.call());
      } else {
        CustomizerError('Customizer loading error: ', error);
        self.components.hideLoading(true);
      }

      self.threedium.initialized = true;
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
      // Self is necessary because Fluid.import losses "this" reference
      let self = SHOP.customizer;

      self.actions.applyAllRestrictions();

      self.threedium.getConfiguration();

      self.threedium.options = self.threedium.getOptions();

      // If mode is findErrors initialize without confs and search bad part/material
      if (self.debug.findErrors) {
        Unlimited3D.init(self.threedium.options, {}, self.threedium.onLoad);
      } else {
        Unlimited3D.init(self.threedium.options, self.threedium.configuration, self.threedium.onLoad);
      }
    },

    /**
     * Merge default defined threedium model options with product
     * CT options if exists.
     * @return {object}
     */
    getOptions() {
      let $ctOptions = $('#threedium-model-options'),
        ctOptions = $ctOptions.length ? $ctOptions.data('options') : {};

      if (Object.keys(ctOptions).length === 0 && ctOptions.constructor === Object) {
        CustomizerError(false, 'Threedium model parameters missing');
      }

      return { ...this.options, ...ctOptions };
    },

    /**
     * Create an object with the initial 3D model settings. 
     * According to the options that are selected.
     * Nomes es mostraran les parts que jo digui la resta s'ocultaran gracies al <override>.
     * @example
     * parts: {
     *   show: ['PartName'],
     *   hide: ['PartName'],
     *   override: ['PartName'],
     *   materials: {
     *     'Boxcalf_Black': ['ToeCap'],
     *   },
     * },
     */
    getConfiguration() {
      SHOP.customizer.getStepsData().forEach((step) => {
        step.options.forEach((option) => {
          let methodName = SHOP.customizer.getMethodName(option.type, 'getConf');

          if (CUSTOMIZER_OPT_TYPES.includes(option.type) && typeof this[methodName] === 'function') {
            this[methodName](step, option);
          }
        });
      });
    },

    /**
     * Set threedium configuration of TYPE_SIMPLE_MATERIAL type
     * @param {object} step 
     * @param {object} option 
     */
    getConfSimpleMaterial(step, option) {
      this.addConfigMaterialPart(option.selectedValue, option.threediumGroupPart);
      this.addConfigOverridePart(option.threediumGroupPart);
    },

    /**
     * Set threedium configuration of TYPE_BURNISH type
     * @param {object} step 
     * @param {object} option 
     */
    getConfBurnish(step, option) {
      if (!SHOP.customizer.isEmptyOptionValuePart(option.selectedValue)) {
        this.addConfigOverridePart(option.selectedValue);
      }
    },

    /**
     * Set threedium configuration of TYPE_MEDALLION type
     * @param {object} step 
     * @param {object} option 
     */
    getConfMedallion(step, option) {
      let optSimpleMaterial = SHOP.customizer.getStepOptionByType(step, TYPE_SIMPLE_MATERIAL);

      if (!SHOP.customizer.isEmptyOptionValuePart(option.selectedValue)) {
        this.addConfigOverridePart(option.selectedValue);

        if (optSimpleMaterial) {
          this.addConfigMaterialPart(optSimpleMaterial.selectedValue, option.selectedValue);
        }
      }
    },

    /**
     * Set threedium configuration of TYPE_CHANGE_PART type
     * @param {object} step 
     * @param {object} option 
     */
    getConfChangePart(step, option) {
      let optSimpleMaterial = SHOP.customizer.getStepOptionByType(step, TYPE_SIMPLE_MATERIAL);

      if (!SHOP.customizer.isEmptyOptionValuePart(option.selectedValue)) {
        this.addConfigOverridePart(option.selectedValue);

        if (optSimpleMaterial) {
          this.addConfigMaterialPart(optSimpleMaterial.selectedValue, option.selectedValue);
        }
      }
    },

    /**
     * Set threedium configuration of TYPE_SOLE_TYPE type
     * @param {object} step 
     * @param {object} option 
     */
    getConfSoleType(step, option) {
      // Per donar una part bona a la configuració s'agafen totes les parts i materials aplicats
      // sobre Sole i Canto d'una tacada ja que son parts fraccionades entre varies opcions.
      let self = SHOP.customizer,
        stepCanto = self.getStepData(STEP_ID_CANTO),

        optSoleType = option,
        optSoleColor = self.getStepOptionByType(step, TYPE_SOLE_COLOR),
        optCantoColor = self.getStepOptionByType(stepCanto, TYPE_CANTO_COLOR),
        optCantoThickness = self.getStepOptionByType(stepCanto, TYPE_CANTO_THICKNESS),
        optViraPicado = self.getStepOptionByType(stepCanto, TYPE_VIRA_PICADO),

        solePart = optSoleType.selectedValue,
        cantoPart = solePart.replace(ID_PREFIX_SOLE, ID_PREFIX_CANTO),
        showParts = [solePart, cantoPart];

      // Change <normal|double> from Canto Thickness
      if (optCantoThickness) {
        for (let i = 0; i < showParts.length; i++) {
          showParts[i] = showParts[i]
            .replace(SOLES_THICKNESS_NORMAL, optCantoThickness.selectedValue)
            .replace(SOLES_THICKNESS_DOUBLE, optCantoThickness.selectedValue)
        }
      }

      // Change <270|360> from Canto Vira-Stormwelt
      if (optViraPicado) {
        let viraPicadoValue = optViraPicado.selectedValue.match(new RegExp(`${SOLES_VIRA_270}|${SOLES_VIRA_360}`));

        if (viraPicadoValue) {
          for (let i = 0; i < showParts.length; i++) {
            showParts[i] = showParts[i]
              .replace(SOLES_VIRA_270, viraPicadoValue[0])
              .replace(SOLES_VIRA_360, viraPicadoValue[0])
          }
        }
      }

      this.addConfigOverridePart(showParts);

      if (optSoleColor) {
        let material = optSoleColor ? optSoleColor.selectedValue : '';
        this.addConfigMaterialPart(material, solePart);
      }
      if (optCantoColor) {
        let material = optCantoColor ? optCantoColor.selectedValue : '';
        this.addConfigMaterialPart(material, cantoPart);
      }
    },

    /**
     * Set threedium configuration of TYPE_VIRA_PICADO type
     * @param {object} step 
     * @param {object} option 
     */
    getConfViraPicado(step, option) {
      let self = SHOP.customizer,
        showParts = [],
        optCantoColor = self.getStepOptionByType(step, TYPE_CANTO_COLOR),
        viraPicadoMaterials = this.getViraPicadoMaterials(optCantoColor, option);

      // Apply canto material to vira-picado & stormwelt
      if (optCantoColor) {
        if (viraPicadoMaterials.picado) {
          this.addConfigMaterialPart(viraPicadoMaterials.picado, option.selectedValue);
        }
        if (viraPicadoMaterials.stormwelt) {
          this.addConfigMaterialPart(viraPicadoMaterials.stormwelt, STORMWELT_PARAM);
        }
      }

      // Add picado and stormwelt parts
      if (!SHOP.customizer.isEmptyOptionValuePart(option.selectedValue)) {
        showParts.push(option.selectedValue);
      }
      if (SHOP.customizer.existsOptionParam(option.params, STORMWELT_PARAM)) {
        showParts.push(STORMWELT_PARAM);
      }
      this.addConfigOverridePart(showParts);
    },

    /**
     * Set threedium configuration of TYPE_CULET type
     * @param {object} step
     * @param {object} option
     */
    getConfCulet(step, option) {
      this.addConfigMaterialPart(option.selectedValue, option.threediumGroupPart);
      this.addConfigOverridePart(option.threediumGroupPart);

      if (option.params[2]) {
        let culetOverlayChange = function () {
          SHOP.customizer.threedium.changeOverlay(option.threediumGroupPart, option.params[2]);
        };
        this.onLoadCallbacks.push(culetOverlayChange);
      }
    },

    /**
     * Add part into material key to materials threedium config object
     * @param {string} material 
     * @param {string|string[]} part 
     */
    addConfigMaterialPart(material, part) {
      if (material.length) {
        if (typeof this.configuration.parts.materials[material] == 'undefined') {
          if (typeof part === 'string') {
            this.configuration.parts.materials[material] = [part];
          }
          else {
            this.configuration.parts.materials[material] = part;
          }
        }
        else {
          if (typeof part === 'string') {
            this.configuration.parts.materials[material].push(part);
          }
          else {
            this.configuration.parts.materials[material] = [...this.configuration.parts.materials[material], ...part]
          }
        }
      }
    },

    /**
     * Add part into overrite key to threedium config object
     * @param {string[]|string} parts 
     */
    addConfigOverridePart(parts) {
      if (Array.isArray(parts)) {
        this.configuration.parts.override = [...this.configuration.parts.override, ...parts]
      }
      else if (typeof parts === 'string') {
        this.configuration.parts.override.push(parts);
      }
    },

    /**
     * Threedium method https://threedium.co.uk/documentation/api#ChangeMaterial
     * @param {string[]} [parts]
     * @param {string} [material]
     * @param {function} [callback]
     */
    changeMaterial(parts = [], material = '', callback = (error) => CustomizerError(error, 'on changeMaterial')) {
      parts = parts.filter(Boolean);

      if (parts.length && material.length) {
        Unlimited3D.changeMaterial({
          parts: parts,
          material: material,
        }, callback);
      }
    },

    /**
     * Threedium method https://threedium.co.uk/documentation/api#SetOverlayToPart
     * @param {string} part 
     * @param {string} overlayName 
     * @param {function} [callback]
     */
    changeOverlay(part, overlayName, callback = (error) => CustomizerError(error, 'on changeOverlay')) {
      if (part.length && overlayName.length) {
        Unlimited3D.setOverlayToPart({
          overlay: overlayName,
          part: part,
        }, callback);
      }
    },

    /**
     * Threedium method https://threedium.co.uk/documentation/api#Hideparts
     * @param {string[]} parts 
     * @param {function} [callback] 
     */
    hideGroup(parts, callback = (error) => CustomizerError(error, 'on hideGroup')) {
      parts = parts.filter(Boolean);

      if (parts.length) {
        Unlimited3D.hideParts({
          parts: parts,
        }, callback);
      }
    },

    /**
     * Threedium method https://threedium.co.uk/documentation/api#Showparts
     * @param {string[]} parts 
     * @param {function} [callback] 
     */
    showPart(parts, callback = (error) => CustomizerError(error, 'on showPart')) {
      parts = parts.filter(Boolean);

      if (parts.length) {
        Unlimited3D.showParts({
          partObjects: [
            {
              parts: parts,
            },
          ],
        }, callback);
      }
    },

    /**
     * Hide group of parts and show a part
     * @param {string[]} [hideParts] 
     * @param {string[]} [showParts] 
     * @param {function} [callback] 
     */
    hideGroupShowPart(hideParts = [], showParts = [], callback = (error) => CustomizerError(error, 'on hideGroupShowPart')) {
      hideParts = hideParts.filter(Boolean);
      showParts = showParts.filter(Boolean);

      if (showParts.length) {
        this.hideGroup(hideParts, (error) => {
          CustomizerError(error, 'on hideGroup');
          this.showPart(showParts, callback);
        });
      }
    },

    /**
     * Hide group of parts, show a part and change material.
     * @param {string[]} [hideParts] 
     * @param {string[]} [showParts] 
     * @param {string[]} [changeMaterialParts] 
     * @param {string} [material] 
     * @param {function} [callback] 
     */
    hideGroupShowPartChangeMaterial(hideParts = [], showParts = [], changeMaterialParts = [], material = '', callback = (error) => CustomizerError(error, 'on hideGroupShowPartChangeMaterial')) {
      hideParts = hideParts.filter(Boolean);
      showParts = showParts.filter(Boolean);
      changeMaterialParts = changeMaterialParts.filter(Boolean);

      this.hideGroupShowPart(hideParts, showParts, callback);

      if (changeMaterialParts.length && material.length) {
        this.changeMaterial(changeMaterialParts, material, callback);
      }
    },

    /**
     * Execute a function depending on the type of an option
     * @param {string} type - value of CUSTOMIZER_OPT_TYPES
     * @param {string} stepId
     * @param {string} optionId
     */
    action(type, stepId, optionId) {
      let step = SHOP.customizer.getStepData(stepId),
        option = SHOP.customizer.getOptionData(stepId, optionId),
        methodName = SHOP.customizer.getMethodName(type, 'action');

      if (CUSTOMIZER_OPT_TYPES.includes(type) && typeof this[methodName] === 'function' && this.initialized)
        this[methodName](step, option);
    },

    /**
     * Default options action type. Simple change material of part.
     * @param {string} step 
     * @param {string} option 
     */
    actionSimpleMaterial(step, option) {
      let changeMaterialPartsArr = [];

      for (let i = 0; i < step.options.length; i++) {
        const element = step.options[i];
        if (element.type == TYPE_SIMPLE_MATERIAL) changeMaterialPartsArr.push(element.threediumGroupPart);
        if (element.type == TYPE_MEDALLION) changeMaterialPartsArr.push(element.selectedValue);
        if (element.type == TYPE_CHANGE_PART) changeMaterialPartsArr.push(element.selectedValue);
      }

      this.changeMaterial(changeMaterialPartsArr, option.selectedValue);

      let optBurnish = SHOP.customizer.getStepOptionByType(step, TYPE_BURNISH);

      if (optBurnish) {
        let param = option.params.length >= 3 ? option.params[2] : '';
        SHOP.customizer.actions.restrictOptionValues(param, optBurnish);
      }
    },

    /**
     * Manages Burnish option
     * @param {string} step 
     * @param {string} option 
     */
    actionBurnish(step, option) {
      if (SHOP.customizer.isEmptyOptionValuePart(option.selectedValue)) {
        // Hide example: Burnish > Burnish_Heel
        if (option.params.length >= 2) {
          this.hideGroup([option.params[1]]);
        }
      } else {
        this.showPart([option.selectedValue]);
      }
    },

    /**
     * Manages Medallion (Floron) option
     * @param {string} step 
     * @param {string} option 
     */
    actionMedallion(step, option) {
      let optSimpleMaterial = SHOP.customizer.getStepOptionByType(step, TYPE_SIMPLE_MATERIAL);

      if (SHOP.customizer.isEmptyOptionValuePart(option.selectedValue)) {
        let showParts = optSimpleMaterial ? [optSimpleMaterial.threediumGroupPart] : [];
        this.hideGroupShowPart([option.threediumGroupPart], showParts);
      } else {
        let hidePartsArr = optSimpleMaterial ? [optSimpleMaterial.threediumGroupPart] : [];
        let material = optSimpleMaterial ? optSimpleMaterial.selectedValue : '';
        hidePartsArr.push(option.threediumGroupPart);
        this.hideGroupShowPartChangeMaterial(hidePartsArr, [option.selectedValue], [option.selectedValue], material);
      }
    },

    /**
     * Manages Sole (type) option
     * Restrictions: TYPE_SOLE_TYPE, restricts TYPE_SOLE_COLOR & TYPE_CANTO_COLOR
     * @param {string} step 
     * @param {string} option 
     */
    actionSoleType(step, option) {
      let self = SHOP.customizer,
        optSoleColor = self.getStepOptionByType(step, TYPE_SOLE_COLOR),
        stepCanto = self.getStepData(ID_PREFIX_CANTO),
        optCantoColor = self.getStepOptionByType(stepCanto, TYPE_CANTO_COLOR),

        soleMaterial = optSoleColor ? optSoleColor.selectedValue : '',
        solePart = option.selectedValue,
        cantoPart = option.selectedValue.replace(ID_PREFIX_SOLE, ID_PREFIX_CANTO),
        showParts = [solePart, cantoPart],
        solePartParams = self.getSoleTypeValueParams(option.selectedValue);

      this.hideGroupShowPartChangeMaterial([option.threediumGroupPart], showParts, [], soleMaterial);

      if (solePartParams) {
        self.actions.restrictOptionValues(solePartParams.id, optSoleColor);
        self.actions.restrictOptionValues(solePartParams.id, optCantoColor);
      }
    },

    /**
     * Manages Sole color option
     * @param {string} step 
     * @param {string} option 
     */
    actionSoleColor(step, option) {
      let optSoleType = SHOP.customizer.getStepOptionByType(step, TYPE_SOLE_TYPE);

      if (optSoleType) {
        this.changeMaterial([optSoleType.selectedValue], option.selectedValue);
      }
    },

    /**
     * Manages Canto color option
     * @param {string} step 
     * @param {string} option 
     */
    actionCantoColor(step, option) {
      let self = SHOP.customizer,
        stepSoles = self.getStepData(STEP_ID_SOLES),
        optSoleType = self.getStepOptionByType(stepSoles, TYPE_SOLE_TYPE),
        optViraPicado = self.getStepOptionByType(step, TYPE_VIRA_PICADO),
        viraPicadoMaterials = this.getViraPicadoMaterials(option, optViraPicado);

      if (optSoleType) {
        let cantoPart = optSoleType.selectedValue.replace(ID_PREFIX_SOLE, ID_PREFIX_CANTO);
        this.changeMaterial([cantoPart], option.selectedValue);
      }

      // Apply canto material to vira-picado & stormwelt
      if (viraPicadoMaterials.picado) {
        this.changeMaterial([optViraPicado.selectedValue], viraPicadoMaterials.picado);
      }
      if (viraPicadoMaterials.stormwelt) {
        this.changeMaterial([STORMWELT_PARAM], viraPicadoMaterials.stormwelt);
      }
    },

    /**
     * Manages Canto thickness option
     * @param {string} step 
     * @param {string} option 
     */
    actionCantoThickness(step, option) {
      let stepSoles = SHOP.customizer.getStepData(STEP_ID_SOLES),
        optSoleType = SHOP.customizer.getStepOptionByType(stepSoles, TYPE_SOLE_TYPE),
        optSoleColor = SHOP.customizer.getStepOptionByType(stepSoles, TYPE_SOLE_COLOR),
        optCantoColor = SHOP.customizer.getStepOptionByType(step, TYPE_CANTO_COLOR);

      if (optSoleType) {
        let replaceValuePart = (text) => text.replace(SOLES_THICKNESS_NORMAL, option.selectedValue).replace(SOLES_THICKNESS_DOUBLE, option.selectedValue),
          cantoPart = replaceValuePart(optSoleType.selectedValue.replace(ID_PREFIX_SOLE, ID_PREFIX_CANTO)),
          solePart = replaceValuePart(optSoleType.selectedValue),
          showParts = [cantoPart, solePart];

        this.hideGroupShowPart([option.threediumGroupPart], showParts, () => {
          if (optSoleColor) this.changeMaterial([solePart], optSoleColor.selectedValue);
          if (optCantoColor) this.changeMaterial([cantoPart], optCantoColor.selectedValue);
        });

        SHOP.customizer.setStepOptionData(STEP_ID_SOLES, optSoleType.id, {
          selectedValue: solePart,
        });
      }
    },

    /**
     * Manages Canto Vira-picado option
     * @param {string} step 
     * @param {string} option 
     */
    actionViraPicado(step, option) {
      let self = SHOP.customizer,
        stepSoles = self.getStepData(STEP_ID_SOLES),
        optSoleType = self.getStepOptionByType(stepSoles, TYPE_SOLE_TYPE),
        optSoleColor = self.getStepOptionByType(stepSoles, TYPE_SOLE_COLOR),
        optCantoColor = self.getStepOptionByType(step, TYPE_CANTO_COLOR),
        viraPicadoMaterials = this.getViraPicadoMaterials(optCantoColor, option);

      if (optSoleType) {
        let viraPicadoValue = this.getViraValue(option),
          replaceValuePart = (text) => text.replace(SOLES_VIRA_270, viraPicadoValue).replace(SOLES_VIRA_360, viraPicadoValue),
          cantoPart = replaceValuePart(optSoleType.selectedValue.replace(ID_PREFIX_SOLE, ID_PREFIX_CANTO)),
          solePart = replaceValuePart(optSoleType.selectedValue),
          hideParts = [option.threediumGroupPart], // "Picado", "Soles"
          showParts = self.isEmptyOptionValuePart(option.selectedValue) ? [] : [option.selectedValue],
          partsWithCantoMaterial = [cantoPart];

        // Stormwelt
        if (self.existsOptionParam(option.params, STORMWELT_PARAM)) {
          showParts.push(STORMWELT_PARAM);
        }

        // Add Sole & Canto to showParts if change 270 or 360
        let oldViraPicadoValue = optSoleType.selectedValue.match(new RegExp(`${SOLES_VIRA_270}|${SOLES_VIRA_360}`)),
          newViraPicadoValue = viraPicadoValue;

        if (newViraPicadoValue && oldViraPicadoValue) {
          if (newViraPicadoValue != oldViraPicadoValue[0]) {
            showParts = [...showParts, ...[cantoPart, solePart]];
            hideParts.push(optSoleType.threediumGroupPart);

            SHOP.customizer.setStepOptionData(STEP_ID_SOLES, optSoleType.id, {
              selectedValue: solePart,
            });
          }
        }

        // Sole/Canto parts update (270/360) & Vira parts update 
        this.hideGroupShowPart(hideParts, showParts, (error) => {
          CustomizerError(error, 'on actionViraPicado');

          if (optSoleColor) this.changeMaterial([solePart], optSoleColor.selectedValue);
          if (optCantoColor) this.changeMaterial(partsWithCantoMaterial, optCantoColor.selectedValue);

          if (viraPicadoMaterials.picado) this.changeMaterial([option.selectedValue], viraPicadoMaterials.picado);
          if (viraPicadoMaterials.stormwelt) this.changeMaterial([STORMWELT_PARAM], viraPicadoMaterials.stormwelt);
        });
      }
    },

    /**
     * Manages Canto Vira-picado option
     * @param {string} step 
     * @param {string} option 
     */
    actionChangePart(step, option) {
      let optSimpleMaterial = SHOP.customizer.getStepOptionByType(step, TYPE_SIMPLE_MATERIAL);

      if (SHOP.customizer.isEmptyOptionValuePart(option.selectedValue)) {
        let showParts = optSimpleMaterial ? [optSimpleMaterial.threediumGroupPart] : [];
        this.hideGroupShowPart([option.threediumGroupPart], showParts);
      } else {
        let hidePartsArr = optSimpleMaterial ? [optSimpleMaterial.threediumGroupPart] : [];
        let material = optSimpleMaterial ? optSimpleMaterial.selectedValue : '';

        hidePartsArr.push(option.threediumGroupPart);
        this.hideGroupShowPartChangeMaterial(hidePartsArr, [option.selectedValue], [option.selectedValue], material);
      }
    },

    /**
     * Manages Culet option
     * @param {string} step
     * @param {string} option
     */
    actionCulet(step, option) {
      this.changeMaterial([option.threediumGroupPart], option.selectedValue, (error) => {
        if (option.params[2]) {
          this.changeOverlay(option.threediumGroupPart, option.params[2]);
        }
      });
    },

    /**
     * Transform canto material to vira-picado material and stormwelt material
     * 
     * Transform "Canto_Rojo" to "picado_0_270_Rojo" and "Stormwelt_Rojo"
     * Transform "Canto_Tomir_Rojo" to "picado_0_270_Rojo" and "Stormwelt_Rojo"
     * @param {object} cantoColor - option
     * @param {object} viraPicado - option
     * @return {object}
     */
    getViraPicadoMaterials(cantoColor, viraPicado) {
      let result = {
        picado: null,
        stormwelt: null,
      };

      if (cantoColor && viraPicado) {
        let regExp = new RegExp(`${ID_PREFIX_CANTO}_?(.*)?_(.*)`),
          match = cantoColor.selectedValue.match(regExp);

        if (match.length >= 2) {
          let materialPart = match[match.length - 1];

          if (!SHOP.customizer.isEmptyOptionValuePart(viraPicado.selectedValue)) {
            result.picado = `${viraPicado.selectedValue}_${materialPart}`;
          }
          if (SHOP.customizer.existsOptionParam(viraPicado.params, STORMWELT_PARAM)) {
            result.stormwelt = `${STORMWELT_PARAM}_${materialPart}`;
          }
        }
      }

      return result;
    },

    /**
     * Find over vira-picado option weight value, 270 or 360.
     * If it does not find the value in the selectedValue of the option, it will look for it among the parameters
     * @param {object} option 
     * @return {string}
     */
    getViraValue(option) {
      let result = SOLES_VIRA_270,
        regExp = new RegExp(`${SOLES_VIRA_270}|${SOLES_VIRA_360}`),
        viraPicadoValueMatch = option.selectedValue.match(regExp);

      if (viraPicadoValueMatch) {
        result = viraPicadoValueMatch;
      }

      let isEmptyValue = SHOP.customizer.isEmptyOptionValuePart(option.selectedValue),
        existViraParam270 = SHOP.customizer.existsOptionParam(option.params, SOLES_VIRA_270),
        existViraParam360 = SHOP.customizer.existsOptionParam(option.params, SOLES_VIRA_360);

      if (isEmptyValue && (existViraParam270 || existViraParam360)) {
        result = existViraParam270 ? SOLES_VIRA_270 : SOLES_VIRA_360;
      }

      return result.toString();
    },
  },
};

SHOP.customizer = { ...SHOP.customizer, ...module };
