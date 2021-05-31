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

    // Change culet material
    let culetMaterial = SHOP.customizer.isNoneValue(option.params[2]) ? null : option.params[2];
    if (culetMaterial) {
      this.changeMaterial([CULET_PART], culetMaterial);
    }

    // Change culet overlay
    let oldCuletOverlay = SHOP.customizer.isNoneValue(oldOption.params[3]) ? null : oldOption.params[3],
      culetOverlay = SHOP.customizer.isNoneValue(option.params[3]) ? null : option.params[3];

    if (culetOverlay) {
      this.changeOverlay(CULET_PART, culetOverlay, oldCuletOverlay);
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
      if (SHOP.customizer.isNoneValue(option.selectedValue)) {
        if (SHOP.customizer.isBothValue(oldOption.selectedValue)) {
          this.hideGroup([BURNISH_HEEL_PART, BURNISH_TOECAP_PART]);
        } else {
          this.hideGroup([oldOption.selectedValue]);
        }
      } else if (SHOP.customizer.isBothValue(option.selectedValue)) {
        if (oldOption.selectedValue === BURNISH_HEEL_PART) {
          this.showPart([BURNISH_TOECAP_PART]);
        } else if (oldOption.selectedValue === BURNISH_TOECAP_PART) {
          this.showPart([BURNISH_HEEL_PART]);
        } else {
          this.showPart([BURNISH_TOECAP_PART, BURNISH_HEEL_PART]);
        }
      } else {
        if (SHOP.customizer.isBothValue(oldOption.selectedValue)) {
          if (option.selectedValue === BURNISH_HEEL_PART) {
            this.hideGroup([BURNISH_TOECAP_PART]);
          } else if (option.selectedValue === BURNISH_TOECAP_PART) {
            this.hideGroup([BURNISH_HEEL_PART]);
          }
        } else if (SHOP.customizer.isNoneValue(oldOption.selectedValue)) {
          this.showPart([option.selectedValue]);
        } else {
          this.hideGroupShowPart([oldOption.selectedValue], [option.selectedValue]);
        }
      }
    }
    else if (step.id === STEP_ID_HEEL) {
      if (SHOP.customizer.isNoneValue(option.selectedValue)) {
        this.hideGroup([BURNISH_HEEL_PART]);
      } else {
        this.showPart([option.selectedValue]);
      }
    }
    else if (step.id === STEP_ID_TOECAP) {
      if (SHOP.customizer.isNoneValue(option.selectedValue)) {
        this.hideGroup([BURNISH_TOECAP_PART]);
      } else {
        this.showPart([option.selectedValue]);
      }
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
      solePartParams = self.getSoleTypeValueParams(option.selectedValue),

      soleCantoParts = self.threedium.getSoleAndCantoPartsFromSelectedOptions(step, option),
      solePart = soleCantoParts.solePart,
      cantoPart = soleCantoParts.cantoPart,
      showParts = [solePart, cantoPart],

      oldSoleCantoParts = self.threedium.getSoleAndCantoPartsFromSelectedOptions(step, oldOption),
      oldSolePart = oldSoleCantoParts.solePart,
      oldCantoPart = oldSoleCantoParts.cantoPart,
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
    let self = SHOP.customizer,
      stepSoles = self.getStepData(STEP_ID_SOLES),
      optSoleType = self.getStepOptionByType(stepSoles, TYPE_SOLE_TYPE),
      optSoleColor = self.getStepOptionByType(stepSoles, TYPE_SOLE_COLOR),
      optCantoColor = self.getStepOptionByType(step, TYPE_CANTO_COLOR);

    if (optSoleType) {
      let soleCantoParts = this.getSoleAndCantoPartsFromSelectedOptions(),
        solePart = soleCantoParts.solePart,
        cantoPart = soleCantoParts.cantoPart,
        showParts = [solePart, cantoPart],

        oldSolePart = this.replaceThickness(solePart, oldOption.selectedValue),
        oldCantoPart = this.replaceThickness(cantoPart, oldOption.selectedValue),
        hideParts = [oldSolePart, oldCantoPart];

      this.showPartHidePart(showParts, hideParts, () => {
        if (optSoleColor) this.changeMaterial([solePart], optSoleColor.selectedValue);
        if (optCantoColor) this.changeMaterial([cantoPart], optCantoColor.selectedValue);
      });

      self.setOption(STEP_ID_SOLES, optSoleType.id, {
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

};

SHOP.customizer.threedium = { ...SHOP.customizer.threedium, ...module };
