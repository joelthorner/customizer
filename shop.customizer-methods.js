let methods = {
  /**
   * Direct methods of the customizer, transversal actions between threedium, 
   * components and listeners.
   */
  methods: {

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
     * @param {string} stepId
     * @param {object} data
     */
    selectOptionValue($target, stepId, data) {
      var self = SHOP.customizer,
        stepOptionData = self.getOptionData(stepId, data.optionId);

      // Save step option data
      self.setStepOptionData(stepId, data.optionId, {
        selected: true,
        selectedValueId: data.valueId,
        selectedValue: data.threediumValue,
        selectedTitle: data.valueTitle,
        selectedValueImg: data.valueImg,
        selectedValueImg: data.valueImg,
        params: data.params,
      });

      // Save if all step options are selected
      self.setStepSelectedData(stepId, self.getStepAllOptsSelected(stepId));

      // Active component opt value
      self.components.activeOptionValue($target);

      // Select real option value (fluid)
      self.components.syncRadioOrCheckOption(data.optionId, data.valueId);

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

      if ($target.is('textarea, input[type="text"]')) {
        self.components.syncTextOption(optionId, selectedValue);
      } else if ($target.is('input[type="radio"]')) {
        self.components.syncRadioOrCheckOption(optionId, valueId);
      } else if ($target.is('input[type="checkbox"]')) {
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
        self.components.changeBuyFormSubmit(
          resumeOptData.selected,
          resumeOptData.title
        );
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
      let self = SHOP.customizer;

      self.getStepsData().forEach((step) => {
        step.options.forEach((option) => {
          // Restriction TYPE_SOLE_TYPE, restricts TYPE_SOLE_COLOR & TYPE_CANTO_COLOR
          if (option.type == TYPE_SOLE_TYPE) {
            let optionSoleColor = self.getStepOptionByType(step, TYPE_SOLE_COLOR),
              solePartParams = self.getSoleTypeValueParams(option.selectedValue)

            if (solePartParams) {
              self.methods.restrictOptionValues(solePartParams.id, optionSoleColor);

              let stepCanto = SHOP.customizer.getStepData(STEP_ID_CANTO),
                optionCantoColor = SHOP.customizer.getStepOptionByType(stepCanto, TYPE_CANTO_COLOR);

              self.methods.restrictOptionValues(solePartParams.id, optionCantoColor);
            }
          }
          // Restriction XXXXX
          // if () {}
        });
      });
    },
  },
};

// Add methods into customizer object
SHOP.customizer = { ...SHOP.customizer, ...methods };
