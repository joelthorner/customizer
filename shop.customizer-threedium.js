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
            // TODO

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
            // Sole type

            // Per donar una part bona a la configuració 'sagafen totes les parts i materials aplicats
            // sobre Sole i Canto d'una tacada ja que son parts fraccionades entre varies opcions.
            var stepCanto = SHOP.customizer.getStepData(STEP_ID_CANTO),
              soleTypeOpt = option, // Sole type
              soleColorOpt = SHOP.customizer.getStepOptionByType(step, 'F'), // Sole color
              cantoColorOpt = SHOP.customizer.getStepOptionByType(stepCanto, 'G'), // Canto Color
              cantoThicknessOpt = SHOP.customizer.getStepOptionByType(stepCanto, 'H'); // Canto Thickness
            // TODO cantoViraStormweltOpt = SHOP.customizer.getStepOptionByType(stepCanto, 'I'); // Canto Vira-Stormwelt

            // @TODO Remove two replaces when threedium model sigui bo !!! tingui un id correcte
            var solePart = soleTypeOpt.selectedValue.replace('XXX', '').replace('YYY', ''),
              cantoPart = solePart.replace(ID_PREFIX_SOLE, ID_PREFIX_CANTO),
              showParts = [solePart, cantoPart];

            // Change <normal|double> from Canto Thickness
            if (cantoThicknessOpt) {
              showParts.forEach(part => {
                part = part
                  .replace(SOLES_THICKNESS_NORMAL, cantoThicknessOpt.selectedValue)
                  .replace(SOLES_THICKNESS_DOUBLE, cantoThicknessOpt.selectedValue)
              });
            }

            // TODO Change <270|360> from Canto Vira-Stormwelt
            // if (cantoViraStormweltOpt) { 
            //   showParts.forEach(part => {
            //     part = part
            //       .replace(SOLES_VIRA_270, cantoViraStormweltOpt.selectedValue)
            //       .replace(SOLES_VIRA_360, cantoViraStormweltOpt.selectedValue)
            //   });
            // }


            override = [...override, ...showParts];

            if (soleColorOpt) {
              var material = soleColorOpt ? soleColorOpt.selectedValue : '';
              this.addConfigMaterialPart(materials, material, showParts[0]); // Sole
            }
            if (cantoColorOpt) {
              var material = cantoColorOpt ? cantoColorOpt.selectedValue : '';
              this.addConfigMaterialPart(materials, material, showParts[1]); // Canto
            }

          } else if (option.type == 'F') {
            // Sole color
          } else if (option.type == 'G') {
            // Canto color
          } else if (option.type == 'H') {
            // Canto thickness
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
        if (material.length)
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
     * Restrictive option. E -> F
     * @param {string} step 
     * @param {string} option 
     * @TODO remove ID replace and change LC values
     */
    actionE(step, option) {
      var optionTypeF = SHOP.customizer.getStepOptionByType(step, 'F'),
        stepCanto = SHOP.customizer.getStepData(ID_PREFIX_CANTO),
        optionTypeCantoG = SHOP.customizer.getStepOptionByType(stepCanto, 'G'),
        material = optionTypeF ? optionTypeF.selectedValue : '',
        // @TODO Remove two replaces when threedium model sigui bo !!! tingui un id correcte
        solePart = option.selectedValue/* desde aqui va fora tot lo de la dreta */.replace('XXX', '').replace('YYY', ''),
        cantoPart = option.selectedValue.replace(ID_PREFIX_SOLE, ID_PREFIX_CANTO)/* desde aqui va fora tot lo de la dreta */.replace('XXX', '').replace('YYY', ''),
        showParts = [solePart, cantoPart],
        selectedValueSplit = option.selectedValue.split('_'); // "SoleXXX_270_normal" --> [id, weight, <normal|double>];

      this.hideGroupShowPartChangeMaterial([option.threediumGroupPart], showParts, material);

      SHOP.customizer.methods.restrictOptionValues(selectedValueSplit, optionTypeF);
      SHOP.customizer.methods.restrictOptionValues(selectedValueSplit, optionTypeCantoG);
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
          // optionTypeE.selectedValue.replace(ID_PREFIX_SOLE, ID_PREFIX_CANTO)/* desde aqui va fora tot lo de la dreta */.replace('XXX', '').replace('YYY', ''),
        ];

        this.changeMaterial(changeParts, option.selectedValue);
      }
    },

    /**
     * [Canto___Soles___Canto_color] options action type
     * @param {string} step 
     * @param {string} option 
     */
    actionG(step, option) {
      let stepSoles = SHOP.customizer.getStepData(STEP_ID_SOLES),
        optionTypeE = SHOP.customizer.getStepOptionByType(stepSoles, 'E'); // Sole Color

      if (optionTypeE) {
        let cantoPart = optionTypeE.selectedValue.replace(ID_PREFIX_SOLE, ID_PREFIX_CANTO);
        // solePart = optionTypeE.selectedValue;
        // showParts = [solePart, cantoPart];

        // TODO remove this
        cantoPart = cantoPart.replace('XXX', '').replace('YYY', '');

        // this.hideGroupShowPart([option.threediumGroupPart], showParts);
        this.changeMaterial([cantoPart], option.selectedValue);
      }
    },

    /**
     * [Canto___Soles___Thickness] options action type
     * @param {string} step 
     * @param {string} option 
     */
    actionH(step, option) {
      let stepSoles = SHOP.customizer.getStepData(STEP_ID_SOLES),
        optionTypeE = SHOP.customizer.getStepOptionByType(stepSoles, 'E'), // Sole type
        optionTypeF = SHOP.customizer.getStepOptionByType(stepSoles, 'F'), // Sole color
        optionTypeG = SHOP.customizer.getStepOptionByType(step, 'G'); // Canto Color

      if (optionTypeE) {
        let replaceValuePart = (text) => text.replace(SOLES_THICKNESS_NORMAL, option.selectedValue).replace(SOLES_THICKNESS_DOUBLE, option.selectedValue),
          cantoPart = replaceValuePart(optionTypeE.selectedValue.replace(ID_PREFIX_SOLE, ID_PREFIX_CANTO)),
          solePart = replaceValuePart(optionTypeE.selectedValue),
          showParts = [cantoPart, solePart];

        // TODO remove this
        showParts[0] = showParts[0].replace('XXX', '').replace('YYY', '');
        showParts[1] = showParts[1].replace('XXX', '').replace('YYY', '');
        solePart = solePart.replace('XXX', '').replace('YYY', '');
        cantoPart = cantoPart.replace('XXX', '').replace('YYY', '');

        this.hideGroupShowPart([option.threediumGroupPart], showParts, () => {
          if (optionTypeF) this.changeMaterial([solePart], optionTypeF.selectedValue);
          if (optionTypeG) this.changeMaterial([cantoPart], optionTypeG.selectedValue);
        });
      }
    },
  },
};

// Add threedium into customizer object
SHOP.customizer = { ...SHOP.customizer, ...threedium };