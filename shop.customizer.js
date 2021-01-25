let init = {

  /**
   * Main init of threedium customizer
   */
  init() {
    this.$el = $('#customizer-layout');

    if (this.$el.length && $('html').hasClass('customizer-threedium')) {
      this.data = this.getData();
      this.fluidConfs();
      this.components.init();
      this.threedium.import();
      this.listeners.init();
      SHOP.module.sizeGuideMenu.init();
    }
  },

  /**
   * Fluid configurations before customizer init
   */
  fluidConfs() {
    Fluid.config.showModalBasket = false;
  },

  /**
   * All click events associated with customizer components are executed here
   */
  listeners: {

    /**
     * Initialize the global listener and execute its specific method
     */
    init() {
      ['click', 'input', 'change'].forEach((type) => {
        $(document).on(type, `[data-${type}-action]`, function (event) {
          event.preventDefault();
          var method = $(this).data(`${type}-action`);

          if (typeof SHOP.customizer.listeners[method] === 'function')
            SHOP.customizer.listeners[method]($(this));
        });
      });
    },

    /**
     * Event, click on grouped options step horizontal tabs.
     * @param {object} $this - jQuery event target element
     */
    showStepGroupedOptionTab($this) {
      SHOP.customizer.components.activeStepGroupedOptionTab(
        $this,
        $($this.data('target'))
      );

      SHOP.customizer.setActiveStep(
        $this.data('step-id'),
        $this.data('step-option')
      );
    },

    /**
     * Event, click on double values option, vertical tabs.
     * @param {object} $this - jQuery event target element
     */
    showDoubleOptionValuesTab($this) {
      SHOP.customizer.components.activeDoubleOptionValuesTab(
        $this,
        $($this.data('target'))
      );
    },

    /**
     * Event, click on option value. Select option value, update global data,
     * sync real option, and call threedium action.
     * @param {object} $this - jQuery event target element
     */
    selectOptionValue($this) {
      var stepId = $this.data('step-id'),
        optionValueData = $this.data('option-value');

      SHOP.customizer.methods.selectOptionValue($this, stepId, optionValueData);
    },

    /**
     * Event, click on any trigger with this data value, call component
     * open resume lateral panel.
     * @param {object} $this - jQuery event target element
     */
    showResumeModal($this) {
      SHOP.customizer.components.showResumeModal();
    },

    /**
     * Force go to the next grouped option or step
     * @param {object} $this - jQuery event target element
     */
    goToPrev($this) {
      var self = SHOP.customizer,
        active = self.getActiveStep();

      if (active.stepId == RESUME_ID_STEP) {
        var lastStep = self.getLastStep(),
          lastStepOpt = self.getLastStepOption(lastStep.id);

        self.methods.activeStep(lastStep.id, lastStepOpt.id);
      }
      else {
        var stepData = self.getStepData(active.stepId),
          stepDataPrevOption = self.getPrevStepOptionData(active.stepId, active.optionId),
          prevStepData = self.getPrevStepData(stepData.id);

        if (stepData.grouped && stepDataPrevOption) {
          self.methods.activeStep(stepData.id, stepDataPrevOption.id, true);
        }
        else if (prevStepData) {
          var lastOptId = prevStepData.options[prevStepData.options.length - 1].id;
          self.methods.activeStep(prevStepData.id, lastOptId);
        }
      }
    },

    /**
     * Force go to the prev grouped option or step
     * @param {object} $this - jQuery event target element
     */
    goToNext($this) {
      var self = SHOP.customizer,
        active = self.getActiveStep(),
        stepData = self.getStepData(active.stepId),
        stepDataNextOption = self.getNextStepOptionData(active.stepId, active.optionId),
        nextStepData = self.getNextStepData(stepData.id);

      if (stepData.grouped && stepDataNextOption) {
        self.methods.activeStep(stepData.id, stepDataNextOption.id, true);
      } else if (nextStepData) {
        self.methods.activeStep(nextStepData.id);
      } else {
        self.methods.activeResume();
      }
    },

    /**
     * Go to step
     * @param {object} $this - jQuery event target element
     */
    goToStep($this) {
      var stepId = $this.data('step-id');
      SHOP.customizer.methods.activeStep(stepId);
    },

    /**
     * Go to resume
     * @param {object} $this - jQuery event target element
     */
    goToResume($this) {
      SHOP.customizer.methods.activeResume();
    },

    /**
     * Sync input text and textarea values with fake options
     * @param {object} $this 
     */
    syncInputResumeOption($this) {
      var optionId = $this.data('option-id');

      SHOP.customizer.methods.selectOptionResumeValue($this, optionId, 0);
    },

    /**
     * Sync checks and radios inputs values with fake options
     * @param {object} $this 
     */
    syncCheckResumeOption($this) {
      var optionId = $this.data('option-id'),
        valueId = $this.data('option-value-id');

      SHOP.customizer.methods.selectOptionResumeValue($this, optionId, valueId);
    },

    /**
     * Fake buyFormSubmit click fire this event
     * @param {object} $this 
     */
    productBuy($this) {
      SHOP.customizer.methods.productBuySubmit($this);
    },
  },

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
     * 
     * @param {object} selectedOption 
     * @param {object} optionToRestrict 
     */
    restrictOptionValues(selectedOption, optionToRestrict) {
      var self = SHOP.customizer,
        selectedValueSplit = selectedOption.selectedValue.split('_'), // "SoleXXX_270_normal" --> [id, weight, <normal|double>]
        restrictParam = selectedValueSplit.length === 3 ? selectedValueSplit[0] : null;

      if (restrictParam && optionToRestrict) {
        var $stepContentOption = self.components.getRestrictedOption(optionToRestrict.id),
          $optionValueTriggerItems = self.components.getRestrictedOptionValues($stepContentOption);

        // For each option value set enable or disable depending on restriction
        $optionValueTriggerItems.each((index, el) => {
          var data = $(el).data('option-value'), hide = true;

          for (let i = 0; i < data.params.length; i++) {
            if (data.params[i].trim() === restrictingParam.trim()) hide = false;
          }

          if (hide) data.disabled = true;
          else data.disabled = false;
        });

        self.components.toggleOptionValueTriggerItems($optionValueTriggerItems);

        if ($stepContentOption.hasClass('double')) {
          let $tabs = $stepContentOption.find('.option-tab-control a');
          self.components.toggleRestrictedOptionTabs($tabs);
        }
      }

      // Si resulta que el valor de la opció ja seleccionada esta restricted
      var optToRestrictSelectedVal = $('.option-value-trigger-item-' + optionToRestrict.selectedValueId).data('option-value');

      if (optToRestrictSelectedVal.data('restricted')) {
        var $validOptionValue = undefined;

        if ($stepContentOption.hasClass('double')) {
          var $validOptionTab = self.components.getFirstValidTabOptionControl($stepContentOption),
            $target = $($validOptionTab.data('target'));

          self.components.activeDoubleOptionValuesTab($validOptionTab, $target);
          $validOptionValue = self.components.getFirstValidOptionValueControl($target);
        } else {
          $validOptionValue = self.components.getFirstValidOptionValueControl($stepContentOption);
        }

        if ($validOptionValue) {
          var stepId = $validOptionValue.data('step-id'),
            optionValueData = $validOptionValue.data('option-value');

          this.selectOptionValue($validOptionValue, stepId, optionValueData);
        }
      }
    }
  },
};

// Add init into customizer object
SHOP.customizer = { ...SHOP.customizer, ...init };
