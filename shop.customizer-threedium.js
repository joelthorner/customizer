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
      var self = SHOP.customizer.threedium;

      // cal anar per cada "step" amb opcions de tipus restrictiu i fer un:
      // self.methods.restrictOptionValues();
      // combinacions restrictives: E -> F

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
     * Restrictive option. E -> F
     * @param {string} step 
     * @param {string} option 
     * @TODO remove ID replace and change LC values
     */
    actionE(step, option) {
      var optionTypeF = SHOP.customizer.getStepOptionByType(step, 'F'),
        material = optionTypeF ? optionTypeF.selectedValue : '',
        // @TODO Remove two replaces when threedium model sigui bo !!! tingui un id correcte
        solePart = option.selectedValue/* desde aqui va fora tot lo de la dreta */.replace('XXX', '').replace('YYY', ''),
        cantoPart = option.selectedValue.replace(ID_PREFIX_SOLE, ID_PREFIX_CANTO)/* desde aqui va fora tot lo de la dreta */.replace('XXX', '').replace('YYY', ''),
        showParts = [solePart, cantoPart];

      // no em funciona aixo
      console.log([option.threediumGroupPart], showParts); 
      this.hideGroupShowPartChangeMaterial([option.threediumGroupPart], showParts, material);

      SHOP.customizer.methods.restrictOptionValues(option, optionTypeF);
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
    },
  },
};

// Add threedium into customizer object
SHOP.customizer = { ...SHOP.customizer, ...threedium };