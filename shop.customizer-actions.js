/**
 * @file Manage actions that have specific actions on the customizer. The actions link many parts of the customizer.
 * @author joelthorner
 */

var module = {
  /**
   * Direct actions of the customizer, transversal actions between threedium, 
   * components, api and listeners.
   */
  actions: {

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

      self.camera.setView(stepData.id, optionId);
    },

    /**
     * Select option value method
     * @param {object} $target
     * @param {string} [stepId]
     * @param {object} [data]
     */
    selectOptionValue($target, stepId = $target.data('step-id'), data = $target.data('option-value')) {
      let self = SHOP.customizer,
        option = self.getOption(stepId, data.optionId),
        oldOption = { ...option },
        selectedValue = data.value,
        valueTitle = data.valueTitle;

      // Select real option value (fluid)
      if (self.isTextOption($target)) {
        self.components.syncTextOption(data.optionId, selectedValue);

        if (CUSTOMIZER_INSCRIPTION_TYPES.includes(option.type)) {
          self.actions.updateInscriptionAssocOption(stepId, selectedValue);
        }
      } else if (self.isRadioOption($target)) {
        self.components.syncRadioOrCheckOption(data.optionId, data.valueId);
      } else if (self.isCheckboxOption($target)) {
        self.components.syncRadioOrCheckOption(data.optionId, data.valueId);
        selectedValue = $target.prop('checked');
      }

      // Save step option data
      self.setOption(stepId, data.optionId, {
        selected: true,
        selectedValueId: data.valueId,
        selectedValue: selectedValue,
        selectedTitle: valueTitle,
        selectedValueImg: data.valueImg,
        params: data.params,
      });

      // Save if all step options are selected
      self.setStepSelectedData(stepId, self.getStepAllOptsSelected(stepId));

      // Active component opt value
      self.components.activeOptionValue($target);

      // Threedium actions
      self.threedium.action(option.type, stepId, option, oldOption);
    },

    /**
     * Of an inscription type option synchronizes with the 
     * associated single sseleccio type option. For a price increase.
     * @param {string} stepId - Step id of option
     * @param {string} selectedValue - Selected value from inscription option
     */
    updateInscriptionAssocOption(stepId, selectedValue) {
      let self = SHOP.customizer,
        step = self.getStepData(stepId),
        assocOption = self.getStepOptionByType(step, TYPE_HIDDEN_INSCRIPTION_PRICE),
        assocValue = selectedValue.length ? true : false,
        assocValueId = null;

      if (assocOption) {
        for (let i = 0; i < assocOption.values.length; i++) {
          const value = assocOption.values[i];
          if (self.existsOptionParam(value.params, assocValue)) {
            assocValueId = value.id;
          }
        }

        if (assocValueId) {
          self.components.syncRadioOrCheckOption(assocOption.id, assocValueId);
        }
      }
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

      if (self.isTextOption($target)) {
        self.components.syncTextOption(optionId, selectedValue);
      } else if (self.isRadioOption($target)) {
        self.components.syncRadioOrCheckOption(optionId, valueId);
      } else if (self.isCheckboxOption($target)) {
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
        self.components.changeBuyFormSubmit(resumeOptData.selected, resumeOptData.title);
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
     * Restrict option values from step by other option selected value
     * @param {string} restrictParam 
     * @param {object} optionToRestrict 
     */
    restrictOptionValues(restrictParam, optionToRestrict) {
      var self = SHOP.customizer;

      if (optionToRestrict) {
        var $stepContentOption = self.components.getRestrictedOption(optionToRestrict.id),
          $optionValueTriggerItems = self.components.getRestrictedOptionValues($stepContentOption);

        self.components.updateRestrictedData($optionValueTriggerItems, restrictParam);
        self.components.toggleOptionValueTriggerItems($optionValueTriggerItems);

        if ($stepContentOption.hasClass('double')) {
          let $elements = $stepContentOption.find('.option-tab-control a, .mobile-collapse-btn');
          self.components.toggleRestrictedOptionElements($elements);
        }

        let $activeOptionValue = $('.option-value-trigger-item-' + optionToRestrict.selectedValueId);
        this.checkRestrictedOptionValues($stepContentOption, $activeOptionValue);
      }
    },

    /**
     * Check restricted already option values. 
     * If an option value is active but restricted, the first valid value is searched and selected.
     * It also edits the components to show / hide the groupings in "double" options that are left empty.
     * @param {object} $option - Option container
     * @param {object} $optionValue - Selected option value
     */
    checkRestrictedOptionValues($option, $optionValue) {
      let self = SHOP.customizer,
        data = $optionValue.data('option-value');

      if (data.restricted) {
        let $validOptionValue = undefined;

        if ($option.hasClass('double')) {
          let $validTabControl = self.components.getFirstValidTabOptionControl($option),
            $target = $($validTabControl.data('target'));

          self.components.activeDoubleOptionValuesTab($validTabControl, $target);
          self.components.activeDoubleOptionValuesCollapse($target);
          $validOptionValue = self.components.getFirstValidOptionValueControl($target);
        } else {
          $validOptionValue = self.components.getFirstValidOptionValueControl($option);
        }

        if ($validOptionValue.length) {
          let stepId = $validOptionValue.data('step-id'),
            optionValueData = $validOptionValue.data('option-value');

          this.selectOptionValue($validOptionValue, stepId, optionValueData);
        }
      }
    },

    /**
     * Apply all restrictions between options and steps
     */
    applyAllRestrictions() {
      let steps = SHOP.customizer.getStepsData(),
        totalRestrictions = SHOP.customizer.getTotalRestrictions(),
        restrictionsDone = 0;

      if (totalRestrictions > 0) {
        for (let i = 0; i < steps.length; i++) {
          const step = steps[i];

          for (let j = 0; j < step.options.length; j++) {
            const option = step.options[j];
            restrictionsDone += this.applyRestriction(step, option);

            if (restrictionsDone === totalRestrictions) {
              break;
            }
          }
          if (restrictionsDone === totalRestrictions) {
            break;
          }
        }
      }
    },

    /**
     * For each type restriction calls dedicated restriction and return 
     * restriction counter.
     * @param {object} step 
     * @param {object} option
     * @returns {number}
     */
    applyRestriction(step, option) {
      if (option.type === TYPE_SOLE_COLOR) {
        this.restrictionSoleColor(step, option);
        return 1;
      }
      else if (option.type === TYPE_EDGE_COLOR) {
        this.restrictionEdgeColor(option);
        return 1;
      }
      else if (option.type === TYPE_BURNISH) {
        this.restrictionBurnish(step, option);
        return 1;
      }
      else if (option.type === TYPE_INSCRIPTION_SOLE) {
        this.restrictionInscriptionSole(step, option);
        return 1;
      }
      else if (option.type === TYPE_SIMPLE_MATERIAL_RESTRICTED) {
        this.restrictionSimpleMaterialRestricted(step, option);
        return 1;
      }
      return 0;
    },

    /**
     * Apply the restriction of TYPE_SOLE_TYPE on TYPE_INSCRIPTION_SOLE
     * This case show or hide entire option.
     * @param {object} step - sole step
     * @param {object} option - sole type option
     */
    restrictionInscriptionSole(step, option) {
      let optSoleType = SHOP.customizer.getStepOptionByType(step, TYPE_SOLE_TYPE);

      if (optSoleType) {
        let show = !SHOP.customizer.isNoneValue(optSoleType.params[2]);

        // 1. save data show
        SHOP.customizer.setOption(step.id, option.id, {
          show: show,
        });

        // 2. hide option component
        SHOP.customizer.components.toggleOption(option.id, option.show);

        // 3. reset opcio inscripció
        if (!show) {
          SHOP.customizer.components.resetOptionText(option.id);
          SHOP.customizer.setOption(step.id, option.id, {
            selectedValue: '',
          });
        }
      }
    },

    /**
     * Apply the restriction of TYPE_SIMPLE_MATERIAL on TYPE_BURNISH
     * @param {object} step
     * @param {object} option
     */
    restrictionBurnish(step, option) {
      let optionSimpleMaterial = SHOP.customizer.getStepOptionByType(step, TYPE_SIMPLE_MATERIAL),
        optionVamp = SHOP.customizer.getStepOptionByType(step, TYPE_VAMP);

      if (optionSimpleMaterial) {
        let param = SHOP.customizer.isNoneValue(optionSimpleMaterial.params[2]) ? '' : optionSimpleMaterial.params[2];
        this.restrictOptionValues(param, option);
      }
      if (optionVamp) {
        let param = SHOP.customizer.isNoneValue(optionVamp.params[4]) ? '' : optionVamp.params[4];
        this.restrictOptionValues(param, option);
      }
    },

    /**
     * Apply the restriction of TYPE_SOLE_TYPE on TYPE_SOLE_COLOR
     * @param {object} step
     * @param {object} option 
     */
    restrictionSoleColor(step, option) {
      let optionSoleColor = option,
        optionSoleType = SHOP.customizer.getStepOptionByType(step, TYPE_SOLE_TYPE);

      if (optionSoleType) {
        let solePartParams = SHOP.customizer.getSoleTypeValueParams(optionSoleType.selectedValue);

        if (solePartParams) {
          this.restrictOptionValues(solePartParams.id, optionSoleColor);
        }
      }
    },

    /**
     * Apply the restriction of TYPE_CHANGE_PART_RESTRICTION on TYPE_SIMPLE_MATERIAL_RESTRICTED
     * @param {object} step
     * @param {object} option 
     */
    restrictionSimpleMaterialRestricted(step, option) {
      let optionSimpleMaterial = option,
        optionChangePart = SHOP.customizer.getStepOptionByType(step, TYPE_CHANGE_PART_RESTRICTION);

      if (optionChangePart) {
        let param = SHOP.customizer.isNoneValue(optionSimpleMaterial.params[2]) ? '' : optionSimpleMaterial.params[2];
        this.restrictOptionValues(param, option);
      }
    },

    /**
     * Apply the restriction of TYPE_SOLE_TYPE on TYPE_EDGE_COLOR
     * @param {object} option 
     */
    restrictionEdgeColor(option) {
      let optionEdgeColor = option,
        stepSole = SHOP.customizer.getStepData(STEP_ID_SOLES),
        optionSoleType = SHOP.customizer.getStepOptionByType(stepSole, TYPE_SOLE_TYPE);

      if (optionSoleType) {
        let solePartParams = SHOP.customizer.getSoleTypeValueParams(optionSoleType.selectedValue);

        if (solePartParams) {
          this.restrictOptionValues(solePartParams.id, optionEdgeColor);
        }
      }
    },

    /**
     * Call active step grouped option tab component and update system data
     * @param {object} $target
     */
    showStepGroupedOptionTab($target) {
      SHOP.customizer.components.activeStepGroupedOptionTab(
        $target,
        $($target.data('target'))
      );

      SHOP.customizer.setActiveStep(
        $target.data('step-id'),
        $target.data('step-option')
      );

      SHOP.customizer.camera.setView(
        $target.data('step-id'),
        $target.data('step-option')
      );
    },

    /**
     * Call active double option tab (vertical tabs inside option values)
     * @param {object} $target
     */
    showDoubleOptionValuesTab($target) {
      SHOP.customizer.components.activeDoubleOptionValuesTab(
        $target,
        $($target.data('target'))
      );
    },

    /**
     * Call show resume modal component method
     */
    showResumeModal() {
      SHOP.customizer.components.showResumeModal();
    },

    /**
     * Call hide resume modal component method
     */
    hideResumeModal() {
      SHOP.customizer.components.hideResumeModal();
    },

    /**
     * Goes to previous step from active step
     */
    prevStep() {
      var self = SHOP.customizer,
        active = self.getActiveStep();

      if (active.stepId == RESUME_ID_STEP) {
        var lastStep = self.getLastStep(),
          lastStepOpt = self.getLastStepOption(lastStep.id);

        self.actions.activeStep(lastStep.id, lastStepOpt.id);
      }
      else {
        var stepData = self.getStepData(active.stepId),
          stepDataPrevOption = self.getPrevStepOptionData(active.stepId, active.optionId),
          prevStepData = self.getPrevStepData(stepData.id);

        if (stepData.grouped && stepDataPrevOption) {
          self.actions.activeStep(stepData.id, stepDataPrevOption.id, true);
        }
        else if (prevStepData) {
          var lastOptId = prevStepData.options[prevStepData.options.length - 1].id;
          self.actions.activeStep(prevStepData.id, lastOptId);
        }
      }
    },

    /**
     * Goes to next step from active step
     */
    nextStep() {
      var self = SHOP.customizer,
        active = self.getActiveStep(),
        stepData = self.getStepData(active.stepId),
        stepDataNextOption = self.getNextStepOptionData(active.stepId, active.optionId),
        nextStepData = self.getNextStepData(stepData.id);

      if (stepData.grouped && stepDataNextOption) {
        self.actions.activeStep(stepData.id, stepDataNextOption.id, true);
      } else if (nextStepData) {
        self.actions.activeStep(nextStepData.id);
      } else {
        self.actions.activeResume();
      }
    },
  },
};

SHOP.customizer = { ...SHOP.customizer, ...module };
