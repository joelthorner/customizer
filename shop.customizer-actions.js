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
    },

    /**
     * Select option value method
     * @param {object} $target
     * @param {string} [stepId]
     * @param {object} [data]
     */
    selectOptionValue($target, stepId = $target.data('step-id'), data = $target.data('option-value')) {
      let self = SHOP.customizer,
        stepOptionData = self.getOptionData(stepId, data.optionId),
        selectedValue = data.value,
        valueTitle = data.valueTitle;

      // Select real option value (fluid)
      if (self.isTextOption($target)) {
        self.components.syncTextOption(data.optionId, $target.val());
        valueTitle = $target.val();
      } else if (self.isRadioOption($target)) {
        self.components.syncRadioOrCheckOption(data.optionId, data.valueId);
      } else if (self.isCheckboxOption($target)) {
        self.components.syncRadioOrCheckOption(data.optionId, data.valueId);
        selectedValue = $target.prop('checked');
      }

      // Save step option data
      self.setStepOptionData(stepId, data.optionId, {
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

        if ($validOptionValue) {
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
      let self = SHOP.customizer,
        steps = self.getStepsData(),
        totalRestrictions = 1, // Options that restrict three options
        restrictionsDone = 0;

      for (let i = 0; i < steps.length; i++) {
        let step = steps[i],
          options = step.options;

        for (let j = 0; j < options.length; j++) {
          const option = options[j];
          // Restriction TYPE_SOLE_TYPE, restricts TYPE_SOLE_COLOR and TYPE_CANTO_COLOR
          if (option.type == TYPE_SOLE_TYPE) {
            let optionSoleColor = self.getStepOptionByType(step, TYPE_SOLE_COLOR),
              solePartParams = self.getSoleTypeValueParams(option.selectedValue)

            if (solePartParams) {
              self.actions.restrictOptionValues(solePartParams.id, optionSoleColor);

              let stepCanto = SHOP.customizer.getStepData(STEP_ID_CANTO),
                optionCantoColor = SHOP.customizer.getStepOptionByType(stepCanto, TYPE_CANTO_COLOR);

              self.actions.restrictOptionValues(solePartParams.id, optionCantoColor);
            }
            restrictionsDone++;
          }
          // Add restrictions here
          // if () {}

          if (restrictionsDone === totalRestrictions) break;
        }
        if (restrictionsDone === totalRestrictions) break;
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
