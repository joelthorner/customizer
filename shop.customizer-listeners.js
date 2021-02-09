/**
 * @file Manage the events of the sun and interact with the other parts of the customizer
 * @author joelthorner
 */

var module = {
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

      SHOP.customizer.actions.selectOptionValue($this, stepId, optionValueData);
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
        self.actions.activeStep(stepData.id, stepDataNextOption.id, true);
      } else if (nextStepData) {
        self.actions.activeStep(nextStepData.id);
      } else {
        self.actions.activeResume();
      }
    },

    /**
     * Go to step
     * @param {object} $this - jQuery event target element
     */
    goToStep($this) {
      var stepId = $this.data('step-id');
      SHOP.customizer.actions.activeStep(stepId);
    },

    /**
     * Go to resume
     * @param {object} $this - jQuery event target element
     */
    goToResume($this) {
      SHOP.customizer.actions.activeResume();
    },

    /**
     * Sync input text and textarea values with fake options
     * @param {object} $this 
     */
    syncInputResumeOption($this) {
      var optionId = $this.data('option-id');

      SHOP.customizer.actions.selectOptionResumeValue($this, optionId, 0);
    },

    /**
     * Sync checks and radios inputs values with fake options
     * @param {object} $this 
     */
    syncCheckResumeOption($this) {
      var optionId = $this.data('option-id'),
        valueId = $this.data('option-value-id');

      SHOP.customizer.actions.selectOptionResumeValue($this, optionId, valueId);
    },

    /**
     * Fake buyFormSubmit click fire this event
     * @param {object} $this 
     */
    productBuy($this) {
      SHOP.customizer.actions.productBuySubmit($this);
    },
  },
};

SHOP.customizer = { ...SHOP.customizer, ...module };
