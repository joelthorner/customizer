/**
 * @file Contains all the configuration logic of the 3D model before initializing it
 * @author joelthorner
 */

var module = {
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
   *     'Boxcalf_Black': ['Toe'],
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
    if (SHOP.customizer.isBothValue(option.selectedValue)) {
      this.addConfigOverridePart([BURNISH_TOE_PART, BURNISH_HEEL_PART]);
    }
    else if (!SHOP.customizer.isNoneValue(option.selectedValue)) {
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
    // sobre Sole i Edge d'una tacada ja que son parts fraccionades entre varies opcions.
    let self = SHOP.customizer,
      stepEdge = self.getStepData(STEP_ID_EDGE),
      optSoleColor = self.getStepOptionByType(step, TYPE_SOLE_COLOR),
      optEdgeColor = self.getStepOptionByType(stepEdge, TYPE_EDGE_COLOR),
      soleEdgeParts = self.threedium.getSoleAndEdgePartsFromSelectedOptions(step, option),
      solePart = soleEdgeParts.solePart,
      EdgePart = soleEdgeParts.EdgePart,
      showParts = [solePart, EdgePart];

    this.addConfigOverridePart(showParts);

    if (optSoleColor) {
      let material = optSoleColor ? optSoleColor.selectedValue : '';
      this.addConfigMaterialPart(material, solePart);
    }
    if (optEdgeColor) {
      let material = optEdgeColor ? optEdgeColor.selectedValue : '';
      this.addConfigMaterialPart(material, EdgePart);
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
      optEdgeColor = self.getStepOptionByType(step, TYPE_EDGE_COLOR),
      viraPicadoMaterials = this.getViraPicadoMaterials(optEdgeColor, option);

    // Apply Edge material to vira-picado & stormwelt
    if (optEdgeColor) {
      if (viraPicadoMaterials.picado) {
        this.addConfigMaterialPart(viraPicadoMaterials.picado, option.selectedValue);
      }
      if (viraPicadoMaterials.stormwelt) {
        this.addConfigMaterialPart(viraPicadoMaterials.stormwelt, STORMWELT);
      }
    }

    // Add picado and stormwelt parts
    if (!SHOP.customizer.isNoneValue(option.selectedValue)) {
      showParts.push(option.selectedValue);
    }
    if (SHOP.customizer.existsOptionParam(option.params, STORMWELT)) {
      showParts.push(STORMWELT);
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

    if (culetOverlay) {
      // No va el init :C
      let updateCuletOverlay = function () {
        SHOP.customizer.threedium.changeOverlay(CULET_PART, culetOverlay, '');
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
      optSoleType = self.getStepOptionByType(stepSole, TYPE_SOLE_TYPE);

    if (optSoleType) {
      let overlayName = self.isNoneValue(optSoleType.params[2]) ? null : optSoleType.params[2];

      if (overlayName) {
        let addSoleInscriptionOverlay = function () {
          let stepSole = SHOP.customizer.getStepData(STEP_ID_SOLES),
            soleEdgeParts = SHOP.customizer.threedium.getSoleAndEdgePartsFromSelectedOptions(stepSole),
            solePart = soleEdgeParts.solePart;

          SHOP.customizer.threedium.changeOverlay(solePart, overlayName);
        };
        this.onLoadCallbacks.push(addSoleInscriptionOverlay);
      }
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
};

SHOP.customizer.threedium = { ...SHOP.customizer.threedium, ...module };
