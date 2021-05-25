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
        override: NO_CONFIGURABLE_PARTS,
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
      let src = THREEDIUM_API_SRC.replace('{VERSION}', THREEDIUM_API_VERSION);
      Fluid.require.js(src, this.init);
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
      // Fix. If the step hasn't change_part type
      let optChangePart = SHOP.customizer.getStepOptionByType(step, TYPE_CHANGE_PART);
      if (!optChangePart) {
        this.addConfigMaterialPart(option.selectedValue, option.threediumGroupPart);
        this.addConfigOverridePart(option.threediumGroupPart);
      }
    },

    /**
     * Set threedium configuration of TYPE_BURNISH type
     * @param {object} step 
     * @param {object} option 
     */
    getConfBurnish(step, option) {
      if (!SHOP.customizer.isNoneValue(option.selectedValue)) {
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

      if (!SHOP.customizer.isNoneValue(option.selectedValue)) {
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

      if (!SHOP.customizer.isNoneValue(option.selectedValue)) {
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
        optSoleColor = self.getStepOptionByType(step, TYPE_SOLE_COLOR),
        optCantoColor = self.getStepOptionByType(stepCanto, TYPE_CANTO_COLOR),
        soleCantoParts = self.getSoleAndCantoPartsFromSelectedOptions(step, option),
        solePart = soleCantoParts.solePart,
        cantoPart = soleCantoParts.cantoPart,
        showParts = [solePart, cantoPart];

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
      if (!SHOP.customizer.isNoneValue(option.selectedValue)) {
        showParts.push(option.selectedValue);
      }
      if (SHOP.customizer.existsOptionParam(option.params, STORMWELT_PARAM)) {
        showParts.push(STORMWELT_PARAM);
      }
      this.addConfigOverridePart(showParts);
    },

    /**
     * Set threedium configuration of TYPE_INSCRIPTION types
     * @param {object} step
     * @param {object} option
     */
    getConfInscription(step, option) {
      let resetInscriptionOverlay = function () {
        SHOP.customizer.threedium.updateOverlayText(option.threediumGroupPart, '');
      };
      this.onLoadCallbacks.push(resetInscriptionOverlay);
    },

    /**
     * Set threedium configuration of TYPE_VAMP type
     * @param {object} step
     * @param {object} option
     */
    getConfVamp(step, option) {
      // Change material part
      this.addConfigMaterialPart(option.selectedValue, option.threediumGroupPart);
      this.addConfigOverridePart(option.threediumGroupPart);

      // Change culet material
      let culetMaterial = SHOP.customizer.isNoneValue(option.params[2]) ? null : option.params[2];
      if (culetMaterial) {
        this.addConfigMaterialPart(culetMaterial, CULET_PART);
      }

      // Change culet overlay
      let culetOverlay = SHOP.customizer.isNoneValue(option.params[3]) ? null : option.params[3];
      let culetOverlayEntry = SHOP.customizer.isNoneValue(option.params[4]) ? null : option.params[4];

      if (culetOverlay) {
        // No va el init :C
        let updateCuletOverlay = function () {
          SHOP.customizer.threedium.changeOverlay(CULET_PART, culetOverlay, () => {
            if (culetOverlayEntry) {
              SHOP.customizer.threedium.exchangeOverlayEntries(CULET_PART, culetOverlay, culetOverlayEntry);
            }
          });
        };
        this.onLoadCallbacks.push(updateCuletOverlay);
      }
    },

    /**
     * Set threedium configuration of TYPE_INSCRIPTION_SOLE type
     * @param {object} step
     * @param {object} option
     */
    getConfInscriptionSole(step, option) {
      let self = SHOP.customizer,
        stepSole = step,
        optSoleType = self.getStepOptionByType(stepSole, TYPE_SOLE_TYPE),
        overlayName = self.isNoneValue(optSoleType.params[2]) ? null : optSoleType.params[2];

      if (overlayName) {
        let addSoleInscriptionOverlay = function () {
          let stepSole = SHOP.customizer.getStepData(STEP_ID_SOLES),
            soleCantoParts = SHOP.customizer.getSoleAndCantoPartsFromSelectedOptions(stepSole),
            solePart = soleCantoParts.solePart;

          SHOP.customizer.threedium.changeOverlay(solePart, overlayName);
        };
        this.onLoadCallbacks.push(addSoleInscriptionOverlay);
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
     * Set camera position and target
     * @param {object} view 
     * @param {function} [callback]
     */
    setCameraPositionSetTarget(view, callback = (error) => CustomizerError(error, 'on setCameraPositionSetTarget')) {
      if (view) {
        this.setCameraPosition(view, (error) => {
          CustomizerError(error, 'on setCameraPosition');
          this.setCameraTarget(view, callback);
        });
      }
    },

    /**
     * Threedium method https://threedium.co.uk/documentation/api#Setcameraposition
     * @param {object} view
     * @param {function} [callback]
     */
    setCameraPosition(view, callback = (error) => CustomizerError(error, 'on setCameraPosition')) {
      if (view) {
        Unlimited3D.setCameraPosition({
          position: view.position,
        }, callback);
      }
    },

    /**
     * Threedium method https://threedium.co.uk/documentation/api#Setcameratarget
     * @param {object} view
     * @param {function} [callback]
     */
    setCameraTarget(view, callback = (error) => CustomizerError(error, 'on setCameraTarget')) {
      if (view) {
        Unlimited3D.setCameraTarget({
          target: view.target,
        }, callback);
      }
    },

    /**
     * Threedium method https://threedium.co.uk/documentation/api#SetOverlayToPart
     * @param {string} part 
     * @param {string} overlayName
     * @param {string} [oldOverlayName] 
     * @param {function} [callback]
     */
    changeOverlay(part, overlayName, oldOverlayName = '', callback = (error) => CustomizerError(error, 'on changeOverlay')) {
      if (part.length && overlayName.length) {
        if (oldOverlayName.length) {
          Unlimited3D.removeOverlayFromPart({
            overlay: oldOverlayName,
            part: part,
          }, (error) => {
            CustomizerError(error, 'on changeOverlay')

            Unlimited3D.setOverlayToPart({
              overlay: overlayName,
              part: part,
            }, callback);
          });
        } else { 
          Unlimited3D.setOverlayToPart({
            overlay: overlayName,
            part: part,
          }, callback);
        }
      }
    },

    /**
     * Update overlay text
     * Threedium method https://threedium.co.uk/documentation/api#Updateoverlay
     * @param {string} overlay
     * @param {string} textValue
     * @param {function} [callback]
     */
    updateOverlayText(overlay, textValue, callback = (error) => CustomizerError(error, 'on updateOverlayText')) {
      if (overlay.length) {
        Unlimited3D.updateOverlay({
          overlay: overlay,
          overlayEntry: 'Text',
          options: {
            text: textValue,
          },
        }, callback);
      }
    },

    /**
     * Update overlay entry
     * Threedium method https://threedium.co.uk/documentation/api#Updateoverlay
     * @param {string} overlay
     * @param {string} overlayEntry
     * @param {boolean} enabled
     * @param {function} [callback]
     */
    updateOverlayEntry(overlay, overlayEntry, enabled, callback = (error) => CustomizerError(error, 'on updateOverlayEntry')) {
      if (overlay.length) {
        Unlimited3D.updateOverlay({
          overlay: overlay,
          overlayEntry: overlayEntry,
          options: {
            enabled: enabled,
          },
        }, callback);
      }
    },

    /**
     * From an overlay it disable all the overlay entries and enable a specific one.
     * @param {string} part
     * @param {string} overlay
     * @param {string} selectedOverlayEntry
     */
    exchangeOverlayEntries(part, overlay, selectedOverlayEntry) {
      if (part.length && overlay.length && selectedOverlayEntry.length) {
        Unlimited3D.getPartOverlays({
          part: part,
        }, (error, result) => {
          CustomizerError(error, 'on exchangeOverlayEntries');

          if (result && result[0] && result[0].entries) {
            for (let index = 0; index < result[0].entries.length; index++) {
              const entry = result[0].entries[index];
              SHOP.customizer.threedium.updateOverlayEntry(overlay, entry.name, (entry.name == selectedOverlayEntry));
            }
          }
        });
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
     * Show part and after hide part
     * @param {string[]} [showParts]
     * @param {string[]} [hideParts]
     * @param {function} [callback]
     */
    showPartHidePart(showParts = [], hideParts = [], callback = (error) => CustomizerError(error, 'on showPartHidePart')) {
      showParts = showParts.filter(Boolean);
      hideParts = hideParts.filter(Boolean);

      if (showParts.length) {
        this.showPart(showParts, (error) => {
          CustomizerError(error, 'on showPart');
          this.hideGroup(hideParts, callback);
        });
      }
    },

    /**
     * Show a part and change material, after hide a part.
     * @param {string[]} [showParts]
     * @param {string[]} [hideParts]
     * @param {string[]} [changeMaterialParts]
     * @param {string} [material]
     * @param {function} [callback]
     */
    showPartHidePartChangeMaterial(showParts = [], hideParts = [], changeMaterialParts = [], material = '', callback = (error) => CustomizerError(error, 'on showPartHidePartChangeMaterial')) {
      showParts = showParts.filter(Boolean);
      hideParts = hideParts.filter(Boolean);
      changeMaterialParts = changeMaterialParts.filter(Boolean);

      this.showPartHidePart(showParts, hideParts, callback);

      if (changeMaterialParts.length && material.length) {
        this.changeMaterial(changeMaterialParts, material, callback);
      }
    },

    /**
     * Execute a function depending on the type of an option
     * @param {string} type - value of CUSTOMIZER_OPT_TYPES
     * @param {string} stepId
     * @param {object} option - option data after user selection (updated data)
     * @param {object} oldOption - option data before user selection
     */
    action(type, stepId, option, oldOption) {
      let step = SHOP.customizer.getStepData(stepId),
        methodName = SHOP.customizer.getMethodName(type, 'action');

      if (CUSTOMIZER_OPT_TYPES.includes(type) && typeof this[methodName] === 'function' && this.initialized)
        this[methodName](step, option, oldOption);
    },

    /**
     * Default options action type. Simple change material of part.
     * @param {string} step 
     * @param {object} option 
     * @param {object} oldOption
     */
    actionSimpleMaterial(step, option, oldOption) {
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
        let param = SHOP.customizer.isNoneValue(option.params[2]) ? '' : option.params[2];
        SHOP.customizer.actions.restrictOptionValues(param, optBurnish);
      }
    },

    actionVamp(step, option, oldOption) {
      // Change Vamp material
      this.changeMaterial([option.threediumGroupPart], option.selectedValue);

      // Change culet material
      let culetMaterial = SHOP.customizer.isNoneValue(option.params[2]) ? null : option.params[2];
      if (culetMaterial) {
        this.changeMaterial([CULET_PART], culetMaterial);
      }

      // Change culet overlay
      let oldCuletOverlay = SHOP.customizer.isNoneValue(oldOption.params[3]) ? null : oldOption.params[3],
        // oldCuletOverlayEntry = SHOP.customizer.isNoneValue(oldOption.params[4]) ? null : oldOption.params[4],
        culetOverlay = SHOP.customizer.isNoneValue(option.params[3]) ? null : option.params[3],
        culetOverlayEntry = SHOP.customizer.isNoneValue(option.params[4]) ? null : option.params[4];

      if (culetOverlay) {
        this.changeOverlay(CULET_PART, culetOverlay, oldCuletOverlay, () => {
          if (culetOverlayEntry) {
            this.exchangeOverlayEntries(CULET_PART, culetOverlay, culetOverlayEntry);
          }
        });
      }
    },

    /**
     * Manages Burnish option
     * @param {string} step 
     * @param {object} option
     * @param {object} oldOption
     */
    actionBurnish(step, option, oldOption) {
      if (SHOP.customizer.isNoneValue(option.selectedValue)) {
        // Hide example: Burnish > Burnish_Heel
        this.hideGroup([oldOption.params[1]]);
      } else {
        this.showPart([option.selectedValue]);
      }
    },

    /**
     * Manages Medallion (Floron) option
     * @param {string} step 
     * @param {object} option
     * @param {object} oldOption
     */
    actionMedallion(step, option, oldOption) {
      let optSimpleMaterial = SHOP.customizer.getStepOptionByType(step, TYPE_SIMPLE_MATERIAL);

      if (SHOP.customizer.isNoneValue(option.selectedValue)) {
        let showParts = optSimpleMaterial ? [optSimpleMaterial.threediumGroupPart] : [];
        this.hideGroupShowPart([option.threediumGroupPart], showParts);
      } else {
        let hidePartsArr = optSimpleMaterial ? [optSimpleMaterial.threediumGroupPart] : [];
        let material = optSimpleMaterial ? optSimpleMaterial.selectedValue : '';
        hidePartsArr.push(oldOption.selectedValue);
        this.showPartHidePartChangeMaterial([option.selectedValue], hidePartsArr, [option.selectedValue], material);
      }
    },

    /**
     * Manages Sole (type) option
     * Restrictions: TYPE_SOLE_TYPE, restricts TYPE_SOLE_COLOR & TYPE_CANTO_COLOR
     * Restrictions: TYPE_SOLE_TYPE, restricts TYPE_INSCRIPTION_SOLE
     * @param {string} step 
     * @param {object} option
     * @param {object} oldOption
     */
    actionSoleType(step, option, oldOption) {
      let self = SHOP.customizer,
        optSoleColor = self.getStepOptionByType(step, TYPE_SOLE_COLOR),
        stepCanto = self.getStepData(ID_PREFIX_CANTO),
        optCantoColor = self.getStepOptionByType(stepCanto, TYPE_CANTO_COLOR),
        optInscriptionSole = self.getStepOptionByType(step, TYPE_INSCRIPTION_SOLE),

        soleMaterial = optSoleColor ? optSoleColor.selectedValue : '',
        solePart = option.selectedValue,
        cantoPart = option.selectedValue.replace(ID_PREFIX_SOLE, ID_PREFIX_CANTO),
        showParts = [solePart, cantoPart],
        solePartParams = self.getSoleTypeValueParams(option.selectedValue),

        oldSolePart = oldOption.selectedValue,
        oldCantoPart = oldOption.selectedValue.replace(ID_PREFIX_SOLE, ID_PREFIX_CANTO),
        hideParts = [oldSolePart, oldCantoPart];

      this.showPartHidePartChangeMaterial(showParts, hideParts, [], soleMaterial);

      if (solePartParams) {
        self.actions.restrictOptionValues(solePartParams.id, optSoleColor);
        self.actions.restrictOptionValues(solePartParams.id, optCantoColor);
      }

      self.actions.restrictionInscriptionSole(step, optInscriptionSole);
    },

    /**
     * Manages Sole color option
     * @param {string} step 
     * @param {object} option
     * @param {object} oldOption
     */
    actionSoleColor(step, option, oldOption) {
      let optSoleType = SHOP.customizer.getStepOptionByType(step, TYPE_SOLE_TYPE);

      if (optSoleType) {
        this.changeMaterial([optSoleType.selectedValue], option.selectedValue);
      }
    },

    /**
     * Manages Canto color option
     * @param {string} step 
     * @param {object} option
     * @param {object} oldOption
     */
    actionCantoColor(step, option, oldOption) {
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
     * @param {object} option
     * @param {object} oldOption
     */
    actionCantoThickness(step, option, oldOption) {
      let stepSoles = SHOP.customizer.getStepData(STEP_ID_SOLES),
        optSoleType = SHOP.customizer.getStepOptionByType(stepSoles, TYPE_SOLE_TYPE),
        optSoleColor = SHOP.customizer.getStepOptionByType(stepSoles, TYPE_SOLE_COLOR),
        optCantoColor = SHOP.customizer.getStepOptionByType(step, TYPE_CANTO_COLOR);

      if (optSoleType) {
        let cantoPart = SHOP.customizer.replaceThickness(optSoleType.selectedValue.replace(ID_PREFIX_SOLE, ID_PREFIX_CANTO), option.selectedValue),
          solePart = SHOP.customizer.replaceThickness(optSoleType.selectedValue, option.selectedValue),
          showParts = [cantoPart, solePart],

          oldCantoPart = optSoleType.selectedValue.replace(ID_PREFIX_SOLE, ID_PREFIX_CANTO),
          oldSolePart = optSoleType.selectedValue,
          hideParts = [oldCantoPart, oldSolePart];

        this.showPartHidePart(showParts, hideParts, () => {
          if (optSoleColor) this.changeMaterial([solePart], optSoleColor.selectedValue);
          if (optCantoColor) this.changeMaterial([cantoPart], optCantoColor.selectedValue);
        });

        SHOP.customizer.setOption(STEP_ID_SOLES, optSoleType.id, {
          selectedValue: solePart,
        });
      }
    },

    /**
     * Manages Canto Vira-picado option
     * @param {string} step 
     * @param {object} option
     * @param {object} oldOption
     */
    actionViraPicado(step, option, oldOption) {
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
          showParts = [],
          partsWithCantoMaterial = [cantoPart],

          oldCantoPart = optSoleType.selectedValue.replace(ID_PREFIX_SOLE, ID_PREFIX_CANTO),
          oldSolePart = optSoleType.selectedValue,
          hideParts = [];

        // Stormwelt
        if (self.existsOptionParam(option.params, STORMWELT_PARAM)) {
          showParts.push(STORMWELT_PARAM);
        } else {
          hideParts.push(STORMWELT_PARAM);
        }

        if (self.isNoneValue(option.selectedValue)) {
          hideParts.push(option.selectedValue);
        } else {
          showParts.push(option.selectedValue);
        }
        if (self.isNoneValue(oldOption.selectedValue)) {
          hideParts.push(oldOption.selectedValue);
        } else {
          hideParts.push(oldOption.selectedValue);

        }

        // Add Sole & Canto to showParts if change 270 or 360
        let oldViraPicadoValue = optSoleType.selectedValue.match(new RegExp(`${SOLES_VIRA_270}|${SOLES_VIRA_360}`)),
          newViraPicadoValue = viraPicadoValue;

        if (newViraPicadoValue && oldViraPicadoValue) {
          if (newViraPicadoValue != oldViraPicadoValue[0]) {
            showParts = [...showParts, ...[cantoPart, solePart]];
            hideParts = [...hideParts, ...[oldCantoPart, oldSolePart]];

            SHOP.customizer.setOption(STEP_ID_SOLES, optSoleType.id, {
              selectedValue: solePart,
            });
          }
        }

        this.showPartHidePart(showParts, hideParts, (error) => {
          CustomizerError(error, 'on actionViraPicado');

          if (optSoleColor) this.changeMaterial([solePart], optSoleColor.selectedValue);
          if (optCantoColor) this.changeMaterial(partsWithCantoMaterial, optCantoColor.selectedValue);

          if (viraPicadoMaterials.picado) this.changeMaterial([option.selectedValue], viraPicadoMaterials.picado);
          if (viraPicadoMaterials.stormwelt) this.changeMaterial([STORMWELT_PARAM], viraPicadoMaterials.stormwelt);
        });
      }
    },

    /**
     * Manages change part option
     * @param {string} step 
     * @param {object} option
     * @param {object} oldOption
     */
    actionChangePart(step, option, oldOption) {
      let optSimpleMaterial = SHOP.customizer.getStepOptionByType(step, TYPE_SIMPLE_MATERIAL);

      if (SHOP.customizer.isNoneValue(option.selectedValue)) {
        let showParts = optSimpleMaterial ? [optSimpleMaterial.threediumGroupPart] : [];
        this.hideGroupShowPart([option.threediumGroupPart], showParts);
      } else {
        let hideParts = optSimpleMaterial ? [oldOption.selectedValue] : [];
        let material = optSimpleMaterial ? optSimpleMaterial.selectedValue : '';

        hideParts.push(oldOption.selectedValue);
        this.showPartHidePartChangeMaterial([option.selectedValue], hideParts, [option.selectedValue], material);
      }
    },

    /**
     * Manages Inscription option types TYPE_INSCRIPTION_3 and TYPE_INSCRIPTION_15
     * @param {string} step
     * @param {object} option
     * @param {object} oldOption
     */
    actionInscription(step, option, oldOption) {
      this.updateOverlayText(option.threediumGroupPart, option.selectedValue);
    },

    /**
     * Manages Inscription option type TYPE_INSCRIPTION_SOLE
     * @param {string} step
     * @param {object} option
     * @param {object} oldOption
     */
    actionInscriptionSole(step, option, oldOption) {
      let optSoleType = SHOP.customizer.getStepOptionByType(step, TYPE_SOLE_TYPE),
        overlayName = SHOP.customizer.isNoneValue(optSoleType.params[2]) ? null : optSoleType.params[2];

      if (optSoleType && overlayName) {
        this.updateOverlayText(overlayName, option.selectedValue);
      }
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

          if (!SHOP.customizer.isNoneValue(viraPicado.selectedValue)) {
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

      let isEmptyValue = SHOP.customizer.isNoneValue(option.selectedValue),
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
