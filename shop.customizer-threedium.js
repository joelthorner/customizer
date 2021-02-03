let threedium = {
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
      // Self is necessary because Fluid.import losses "this" reference
      var self = SHOP.customizer;

      self.methods.applyAllRestrictions();

      self.threedium.configuration = self.threedium.getConfiguration();
      console.log(self.threedium.configuration);
      Unlimited3D.init(self.threedium.options, self.threedium.configuration, self.threedium.onLoad);
    },

    /**
     * Create an object with the initial 3D model settings. 
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
     * @todo extreure de cada type una funcio per separar el codi
     */
    getConfiguration() {
      // Nomes es mostraran les parts que jo digui la resta s'ocultaran gracies al <override>.
      let self = SHOP.customizer,
        materials = {},
        override = [
          'Culet_logo',
          'Sole_interior',
          'Culet', // TODO remove this cuan s'implementi el culet segons ToeCap
        ];

      self.getStepsData().forEach((step) => {
        let part = step.id;

        step.options.forEach((option) => {
          if (option.type == TYPE_SIMPLE_MATERIAL) {

            this.addConfigMaterialPart(materials, option.selectedValue, part);
            override.push(part);

          } else if (option.type == TYPE_BURNISH) {
            // TODO

          } else if (option.type == TYPE_MEDALLION) {

            // Todo, change type TYPE_SIMPLE_MATERIAL to TYPE_TOECAP in the future
            // fer un agafo TYPE_SIMPLE_MATERIAL sino trobo agafo TYPE_TOECAP
            let optSimpleMaterial = self.getStepOptionByType(step, TYPE_SIMPLE_MATERIAL);

            if (option.selectedValue === EMPTY_OPTION_VALUE_PART) {
              override.push(optSimpleMaterial.threediumGroupPart);
            } else {
              if (optSimpleMaterial) {
                this.addConfigMaterialPart(materials, optSimpleMaterial.selectedValue, option.selectedValue);
              }
              override.push(option.selectedValue);
            }
          } else if (option.type == TYPE_SOLE_TYPE) {

            // Per donar una part bona a la configuració 'sagafen totes les parts i materials aplicats
            // sobre Sole i Canto d'una tacada ja que son parts fraccionades entre varies opcions.
            let stepCanto = self.getStepData(STEP_ID_CANTO),
              optSoleType = option,
              optSoleColor = self.getStepOptionByType(step, TYPE_SOLE_COLOR),
              optCantoColor = self.getStepOptionByType(stepCanto, TYPE_CANTO_COLOR),
              optCantoThickness = self.getStepOptionByType(stepCanto, TYPE_CANTO_THICKNESS),
              optViraPicado = self.getStepOptionByType(stepCanto, TYPE_VIRA_PICADO),

              solePart = optSoleType.selectedValue,
              cantoPart = solePart.replace(ID_PREFIX_SOLE, ID_PREFIX_CANTO),
              showParts = [solePart, cantoPart];

            // TODO remove this
            showParts[0] = showParts[0].replace('XXX', '').replace('YYY', '');
            showParts[1] = showParts[1].replace('XXX', '').replace('YYY', '');
            // END TODO remove this

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

            override = [...override, ...showParts];

            if (optSoleColor) {
              var material = optSoleColor ? optSoleColor.selectedValue : '';
              this.addConfigMaterialPart(materials, material, showParts[0]); // Sole
            }
            if (optCantoColor) {
              var material = optCantoColor ? optCantoColor.selectedValue : '';
              this.addConfigMaterialPart(materials, material, showParts[1]); // Canto
            }
          } else if (option.type == TYPE_VIRA_PICADO) {
            
            // Stormwelt
            if (option.params[2] && option.params[2] === STORMWELT_PARAM) {
              override.push(STORMWELT_PARAM);
            }
            
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
          if (typeof part === 'string') {
            materials[material] = [part];
          }
          else {
            materials[material] = part;
          }
        }
        else {
          if (typeof part === 'string') {
            materials[material].push(part);
          }
          else {
            materials[material] = [...materials[material], ...part]
          }
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
        console.log(error)
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
        console.log(error)
        if (material.length) this.changeMaterial(changeMaterialParts, material, callback);
      });
    },

    /**
     * Execute a function depending on the type of an option
     * @param {string} type - value of CUSTOMIZER_OPT_TYPES
     * @param {string} stepId
     * @param {string} optionId
     */
    action(type, stepId, optionId) {
      var step = SHOP.customizer.getStepData(stepId),
        option = SHOP.customizer.getOptionData(stepId, optionId),
        camelCase = type.toLowerCase().replace(/_([a-z])/g, function (g) { return g[1].toUpperCase(); }),
        methodName = 'action' + camelCase.charAt(0).toUpperCase() + camelCase.slice(1);

      if (CUSTOMIZER_OPT_TYPES.includes(type) && typeof this[methodName] === 'function')
        this[methodName](step, option);
    },

    /**
     * Default options action type. Simple change material of part.
     * @param {string} step 
     * @param {string} option 
     */
    actionSimpleMaterial(step, option) {
      var changeMaterialPartsArr = [];

      for (let i = 0; i < step.options.length; i++) {
        const element = step.options[i];
        if (element.type == TYPE_SIMPLE_MATERIAL) changeMaterialPartsArr.push(element.threediumGroupPart);
        if (element.type == TYPE_MEDALLION) changeMaterialPartsArr.push(element.selectedValue);
      }

      this.changeMaterial(changeMaterialPartsArr, option.selectedValue);
    },

    /**
     * TODO
     * @param {string} step 
     * @param {string} option 
     * @todo all
     */
    actionBurnish(step, option) {

    },

    /**
     * Manages Medallion (Floron) option
     * @param {string} step 
     * @param {string} option 
     */
    actionMedallion(step, option) {
      var optSimpleMaterial = SHOP.customizer.getStepOptionByType(step, TYPE_SIMPLE_MATERIAL);

      if (option.selectedValue === EMPTY_OPTION_VALUE_PART) {
        var showParts = optSimpleMaterial ? [optSimpleMaterial.threediumGroupPart] : [];
        this.hideGroupShowPart([option.threediumGroupPart], showParts);
      } else {
        var hidePartsArr = optSimpleMaterial ? [optSimpleMaterial.threediumGroupPart] : [];
        var material = optSimpleMaterial ? optSimpleMaterial.selectedValue : '';

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
      var optSoleColor = SHOP.customizer.getStepOptionByType(step, TYPE_SOLE_COLOR),
        stepCanto = SHOP.customizer.getStepData(ID_PREFIX_CANTO),
        optCantoColor = SHOP.customizer.getStepOptionByType(stepCanto, TYPE_CANTO_COLOR),
        soleMaterial = optSoleColor ? optSoleColor.selectedValue : '',
        // @TODO Remove two replaces when threedium model sigui bo !!! tingui un id correcte
        solePart = option.selectedValue,
        cantoPart = option.selectedValue.replace(ID_PREFIX_SOLE, ID_PREFIX_CANTO),
        showParts = [solePart, cantoPart],
        selectedValueSplit = option.selectedValue.split('_'); // "SoleXXX_270_normal" --> [id, weight, <normal|double>];

      // TODO remove this
      showParts[0] = showParts[0].replace('XXX', '').replace('YYY', '');
      showParts[1] = showParts[1].replace('XXX', '').replace('YYY', '');

      // TODO revisar el tercer param aqui, que collons hi fa?
      this.hideGroupShowPartChangeMaterial([option.threediumGroupPart], showParts, soleMaterial);

      SHOP.customizer.methods.restrictOptionValues(selectedValueSplit, optSoleColor);
      SHOP.customizer.methods.restrictOptionValues(selectedValueSplit, optCantoColor);
    },

    /**
     * Manages Sole color option
     * @param {string} step 
     * @param {string} option 
     */
    actionSoleColor(step, option) {
      var optSoleType = SHOP.customizer.getStepOptionByType(step, TYPE_SOLE_TYPE),
        changeParts = [];

      if (optSoleType) {
        changeParts = [
          optSoleType.selectedValue,
          // optSoleType.selectedValue.replace(ID_PREFIX_SOLE, ID_PREFIX_CANTO),
        ];

        // TODO remove this
        changeParts[0] = changeParts[0].replace('XXX', '').replace('YYY', '');
        // changeParts[1] = changeParts[1].replace('XXX', '').replace('YYY', '');

        this.changeMaterial(changeParts, option.selectedValue);
      }
    },

    /**
     * Manages Canto color option
     * @param {string} step 
     * @param {string} option 
     */
    actionCantoColor(step, option) {
      let stepSoles = SHOP.customizer.getStepData(STEP_ID_SOLES),
        optSoleType = SHOP.customizer.getStepOptionByType(stepSoles, TYPE_SOLE_TYPE);

      if (optSoleType) {
        let cantoPart = optSoleType.selectedValue.replace(ID_PREFIX_SOLE, ID_PREFIX_CANTO);
        // solePart = optSoleType.selectedValue;
        // showParts = [solePart, cantoPart];

        // TODO remove this
        cantoPart = cantoPart.replace('XXX', '').replace('YYY', '');

        // this.hideGroupShowPart([option.threediumGroupPart], showParts);
        this.changeMaterial([cantoPart], option.selectedValue);
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

        // TODO remove this
        showParts[0] = showParts[0].replace('XXX', '').replace('YYY', '');
        showParts[1] = showParts[1].replace('XXX', '').replace('YYY', '');
        solePart = solePart.replace('XXX', '').replace('YYY', '');
        cantoPart = cantoPart.replace('XXX', '').replace('YYY', '');

        this.hideGroupShowPart([option.threediumGroupPart], showParts, () => {
          if (optSoleColor) this.changeMaterial([solePart], optSoleColor.selectedValue);
          if (optCantoColor) this.changeMaterial([cantoPart], optCantoColor.selectedValue);
        });
      }
    },

    /**
     * Manages Canto Vira-picado option
     * @param {string} step 
     * @param {string} option 
     */
    actionViraPicado(step, option) {
      let stepSoles = SHOP.customizer.getStepData(STEP_ID_SOLES),
        optSoleType = SHOP.customizer.getStepOptionByType(stepSoles, TYPE_SOLE_TYPE),
        optSoleColor = SHOP.customizer.getStepOptionByType(stepSoles, TYPE_SOLE_COLOR),
        optCantoColor = SHOP.customizer.getStepOptionByType(step, TYPE_CANTO_COLOR);

      if (optSoleType) {
        let viraPicadoValue = option.selectedValue.match(new RegExp(`${SOLES_VIRA_270}|${SOLES_VIRA_360}`)),
          replaceValuePart = (text) => text.replace(SOLES_VIRA_270, viraPicadoValue).replace(SOLES_VIRA_360, viraPicadoValue),
          cantoPart = replaceValuePart(optSoleType.selectedValue.replace(ID_PREFIX_SOLE, ID_PREFIX_CANTO)),
          solePart = replaceValuePart(optSoleType.selectedValue),
          hideParts = [option.threediumGroupPart], // "Picado", "Soles"
          showParts = [option.selectedValue];

        // Stormwelt
        if (option.params[2] && option.params[2] === STORMWELT_PARAM) showParts.push(STORMWELT_PARAM);

        // Add Sole & Canto to showParts if change 270 or 360
        let oldViraPicadoValue = optSoleType.selectedValue.match(new RegExp(`${SOLES_VIRA_270}|${SOLES_VIRA_360}`)),
          newViraPicadoValue = option.selectedValue.match(new RegExp(`${SOLES_VIRA_270}|${SOLES_VIRA_360}`));

        if (newViraPicadoValue && oldViraPicadoValue) {
          if (newViraPicadoValue[0] != oldViraPicadoValue[0]) {
            showParts = [...showParts, ...[cantoPart, solePart]];
            hideParts.push(optSoleType.threediumGroupPart);

            // TODO remove this
            if (showParts[0]) showParts[0] = showParts[0].replace('XXX', '').replace('YYY', '');
            if (showParts[1]) showParts[1] = showParts[1].replace('XXX', '').replace('YYY', '');
            if (showParts[2]) showParts[2] = showParts[2].replace('XXX', '').replace('YYY', '');
            solePart = solePart.replace('XXX', '').replace('YYY', '');
            cantoPart = cantoPart.replace('XXX', '').replace('YYY', '');
            // END TODO remove this

            SHOP.customizer.setStepOptionData(STEP_ID_SOLES, optSoleType.id, {
              selectedValue: solePart,
            });
          }
        }

        // TODO remove this
        if (showParts[0]) showParts[0] = showParts[0].replace('XXX', '').replace('YYY', '');
        if (showParts[1]) showParts[1] = showParts[1].replace('XXX', '').replace('YYY', '');
        if (showParts[2]) showParts[2] = showParts[2].replace('XXX', '').replace('YYY', '');
        solePart = solePart.replace('XXX', '').replace('YYY', '');
        cantoPart = cantoPart.replace('XXX', '').replace('YYY', '');
        // END TODO remove this

        // Sole/Canto parts update (270/360) & Vira parts update
        this.hideGroupShowPart(hideParts, showParts, (error) => {
          console.log(error);
          if (optSoleColor) this.changeMaterial([solePart], optSoleColor.selectedValue);
          if (optCantoColor) this.changeMaterial([cantoPart], optCantoColor.selectedValue);
        });
      }
    },
  },
};

// Add threedium into customizer object
SHOP.customizer = { ...SHOP.customizer, ...threedium };