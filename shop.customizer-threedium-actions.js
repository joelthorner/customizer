/**
 * @file It contains all the logic for changing options
 * @author joelthorner
 */

var module = {

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

  /**
   * Manages Vamp option
   * @param {string} step
   * @param {object} option
   * @param {object} oldOption
   */
  actionVamp(step, option, oldOption) {
    // Change Vamp material
    this.changeMaterial([option.threediumGroupPart], option.selectedValue);



    // Change culet overlay
    let oldCuletOverlay = SHOP.customizer.isNoneValue(oldOption.params[3]) ? null : oldOption.params[3],
      culetOverlay = SHOP.customizer.isNoneValue(option.params[3]) ? null : option.params[3];

    if (culetOverlay) {
      this.changeOverlay(CULET_PART, culetOverlay, oldCuletOverlay, (error) => {
        CustomizerError(error, 'on changeOverlay of Vamp on actionVamp function');

        // Change culet material
        let culetMaterial = SHOP.customizer.isNoneValue(option.params[2]) ? null : option.params[2];
        if (culetMaterial) {
          this.changeMaterial([CULET_PART], culetMaterial);
        }
      });
    }

    // Burnish
    let optBurnish = SHOP.customizer.getStepOptionByType(step, TYPE_BURNISH);

    if (optBurnish) {
      let param = SHOP.customizer.isNoneValue(option.params[4]) ? '' : option.params[4];
      SHOP.customizer.actions.restrictOptionValues(param, optBurnish);
    }
  },

  /**
   * Manages Burnish option
   * @param {string} step 
   * @param {object} option
   * @param {object} oldOption
   */
  actionBurnish(step, option, oldOption) {
    if (step.id === STEP_ID_VAMP) {
      this.actionBurnish_vamp(option, oldOption);
    }
    else if (step.id === STEP_ID_HEEL) {
      this.actionBurnish_heel(option, oldOption);
    }
    else if (step.id === STEP_ID_TOE) {
      this.actionBurnish_toe(option, oldOption);
    }
  },

  /**
   * Manages Burnish option if step is TYPE_VAMP
   * @param {object} option
   * @param {object} oldOption
   */
  actionBurnish_vamp(option, oldOption) {
    if (SHOP.customizer.isNoneValue(option.selectedValue)) {
      if (SHOP.customizer.isBothValue(oldOption.selectedValue)) {
        this.hideGroup([BURNISH_HEEL_PART, BURNISH_TOE_PART]);
      } else {
        this.hideGroup([oldOption.selectedValue]);
      }
    } else if (SHOP.customizer.isBothValue(option.selectedValue)) {
      if (oldOption.selectedValue === BURNISH_HEEL_PART) {
        this.showPart([BURNISH_TOE_PART]);
      } else if (oldOption.selectedValue === BURNISH_TOE_PART) {
        this.showPart([BURNISH_HEEL_PART]);
      } else {
        this.showPart([BURNISH_TOE_PART, BURNISH_HEEL_PART]);
      }
    } else {
      if (SHOP.customizer.isBothValue(oldOption.selectedValue)) {
        if (option.selectedValue === BURNISH_HEEL_PART) {
          this.hideGroup([BURNISH_TOE_PART]);
        } else if (option.selectedValue === BURNISH_TOE_PART) {
          this.hideGroup([BURNISH_HEEL_PART]);
        }
      } else if (SHOP.customizer.isNoneValue(oldOption.selectedValue)) {
        this.showPart([option.selectedValue]);
      } else {
        this.hideGroupShowPart([oldOption.selectedValue], [option.selectedValue]);
      }
    }
  },

  /**
   * Manages Burnish option if step is TYPE_HEEL
   * @param {object} option
   * @param {object} oldOption
   */
  actionBurnish_heel(option, oldOption) {
    if (SHOP.customizer.isNoneValue(option.selectedValue)) {
      this.hideGroup([BURNISH_HEEL_PART]);
    } else {
      this.showPart([option.selectedValue]);
    }
  },

  /**
   * Manages Burnish option if step is TYPE_TOE
   * @param {object} option
   * @param {object} oldOption
   */
  actionBurnish_toe(option, oldOption) {
    if (SHOP.customizer.isNoneValue(option.selectedValue)) {
      this.hideGroup([BURNISH_TOE_PART]);
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
   * Restrictions: TYPE_SOLE_TYPE, restricts TYPE_SOLE_COLOR & TYPE_EDGE_COLOR
   * Restrictions: TYPE_SOLE_TYPE, restricts TYPE_INSCRIPTION_SOLE
   * @param {string} step 
   * @param {object} option
   * @param {object} oldOption
   */
  actionSoleType(step, option, oldOption) {
    let self = SHOP.customizer,
      optSoleColor = self.getStepOptionByType(step, TYPE_SOLE_COLOR),
      stepEdge = self.getStepData(ID_PREFIX_EDGE),
      optEdgeColor = self.getStepOptionByType(stepEdge, TYPE_EDGE_COLOR),
      optInscriptionSole = self.getStepOptionByType(step, TYPE_INSCRIPTION_SOLE),

      soleMaterial = optSoleColor ? optSoleColor.selectedValue : '',
      solePartParams = self.getSoleTypeValueParams(option.selectedValue),

      soleEdgeParts = self.threedium.getSoleAndEdgePartsFromSelectedOptions(step, option),
      solePart = soleEdgeParts.solePart,
      edgePart = soleEdgeParts.edgePart,
      showParts = [solePart, edgePart],

      oldSoleEdgeParts = self.threedium.getSoleAndEdgePartsFromSelectedOptions(step, oldOption),
      oldSolePart = oldSoleEdgeParts.solePart,
      oldEdgePart = oldSoleEdgeParts.edgePart,
      hideParts = [oldSolePart, oldEdgePart];

    if (soleMaterial.length) {
      this.showPartHidePartChangeMaterial(showParts, hideParts, [], soleMaterial);
    } else {
      this.showPartHidePart(showParts, hideParts);
    }

    if (solePartParams) {
      if (optSoleColor) self.actions.restrictOptionValues(solePartParams.id, optSoleColor);
      if (optEdgeColor) self.actions.restrictOptionValues(solePartParams.id, optEdgeColor);
    }

    if (optInscriptionSole) {
      self.actions.restrictionInscriptionSole(step, optInscriptionSole);
    }
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
   * Manages Edge color option 
   * @param {string} step 
   * @param {object} option
   * @param {object} oldOption
   */
  actionEdgeColor(step, option, oldOption) {
    let self = SHOP.customizer,
      stepSoles = self.getStepData(STEP_ID_SOLES),
      optSoleType = self.getStepOptionByType(stepSoles, TYPE_SOLE_TYPE),
      optViraPicado = self.getStepOptionByType(step, TYPE_VIRA_PICADO),
      viraPicadoMaterials = this.getViraPicadoMaterials(option, optViraPicado);

    if (optSoleType) {
      let edgePart = optSoleType.selectedValue.replace(ID_PREFIX_SOLE, ID_PREFIX_EDGE);
      this.changeMaterial([edgePart], option.selectedValue);
    }

    // Apply Edge material to vira-picado & stormwelt
    if (viraPicadoMaterials.picado) {
      this.changeMaterial([optViraPicado.selectedValue], viraPicadoMaterials.picado);
    }
    if (viraPicadoMaterials.stormwelt) {
      this.changeMaterial([STORMWELT], viraPicadoMaterials.stormwelt);
    }
  },

  /**
   * Manages Edge thickness option
   * @param {string} step 
   * @param {object} option
   * @param {object} oldOption
   */
  actionEdgeThickness(step, option, oldOption) {
    let self = SHOP.customizer,
      stepSoles = self.getStepData(STEP_ID_SOLES),
      optSoleType = self.getStepOptionByType(stepSoles, TYPE_SOLE_TYPE),
      optSoleColor = self.getStepOptionByType(stepSoles, TYPE_SOLE_COLOR),
      optEdgeColor = self.getStepOptionByType(step, TYPE_EDGE_COLOR);

    if (optSoleType) {
      let soleEdgeParts = this.getSoleAndEdgePartsFromSelectedOptions(),
        solePart = soleEdgeParts.solePart,
        edgePart = soleEdgeParts.edgePart,
        showParts = [solePart, edgePart],

        oldSolePart = this.replaceThickness(solePart, oldOption.selectedValue),
        oldEdgePart = this.replaceThickness(edgePart, oldOption.selectedValue),
        hideParts = [oldSolePart, oldEdgePart];

      this.showPartHidePart(showParts, hideParts, () => {
        if (optSoleColor) this.changeMaterial([solePart], optSoleColor.selectedValue);
        if (optEdgeColor) this.changeMaterial([edgePart], optEdgeColor.selectedValue);
      });

      self.setOption(STEP_ID_SOLES, optSoleType.id, {
        selectedValue: solePart,
      });
    }
  },

  /**
   * Manages Edge Vira-picado option
   * @param {string} step 
   * @param {object} option
   * @param {object} oldOption
   */
  actionViraPicado(step, option, oldOption) {
    let self = SHOP.customizer,
      stepSoles = self.getStepData(STEP_ID_SOLES),
      optSoleType = self.getStepOptionByType(stepSoles, TYPE_SOLE_TYPE),
      optSoleColor = self.getStepOptionByType(stepSoles, TYPE_SOLE_COLOR),
      optEdgeColor = self.getStepOptionByType(step, TYPE_EDGE_COLOR),
      viraPicadoMaterials = this.getViraPicadoMaterials(optEdgeColor, option);

    if (optSoleType) {
      let viraPicadoValue = this.getViraValue(option),
        replaceValuePart = (text) => text.replace(VIRA_PICADO_WEIGHT_270, viraPicadoValue).replace(VIRA_PICADO_WEIGHT_360, viraPicadoValue),
        edgePart = replaceValuePart(optSoleType.selectedValue.replace(ID_PREFIX_SOLE, ID_PREFIX_EDGE)),
        solePart = replaceValuePart(optSoleType.selectedValue),
        showParts = [],
        partsWithEdgeMaterial = [edgePart],

        oldEdgePart = optSoleType.selectedValue.replace(ID_PREFIX_SOLE, ID_PREFIX_EDGE),
        oldSolePart = optSoleType.selectedValue,
        hideParts = [];

      // Stormwelt
      if (self.existsOptionParam(option.params, STORMWELT)) {
        showParts.push(STORMWELT);
      } else {
        hideParts.push(STORMWELT);
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

      // Add Sole & Edge to showParts if change 270 or 360
      let oldViraPicadoValue = optSoleType.selectedValue.match(new RegExp(`${VIRA_PICADO_WEIGHT_270}|${VIRA_PICADO_WEIGHT_360}`)),
        newViraPicadoValue = viraPicadoValue;

      if (newViraPicadoValue && oldViraPicadoValue) {
        if (newViraPicadoValue != oldViraPicadoValue[0]) {
          showParts = [...showParts, ...[edgePart, solePart]];
          hideParts = [...hideParts, ...[oldEdgePart, oldSolePart]];

          SHOP.customizer.setOption(STEP_ID_SOLES, optSoleType.id, {
            selectedValue: solePart,
          });
        }
      }

      this.showPartHidePart(showParts, hideParts, (error) => {
        CustomizerError(error, 'on actionViraPicado');

        if (optSoleColor) this.changeMaterial([solePart], optSoleColor.selectedValue);
        if (optEdgeColor) this.changeMaterial(partsWithEdgeMaterial, optEdgeColor.selectedValue);

        if (viraPicadoMaterials.picado) this.changeMaterial([option.selectedValue], viraPicadoMaterials.picado);
        if (viraPicadoMaterials.stormwelt) this.changeMaterial([STORMWELT], viraPicadoMaterials.stormwelt);
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

};

SHOP.customizer.threedium = { ...SHOP.customizer.threedium, ...module };
