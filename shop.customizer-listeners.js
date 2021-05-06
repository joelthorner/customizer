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
          let methods = $(this).data(`${type}-action`);

          methods.split(',').forEach((method) => {
            if (typeof SHOP.customizer.listeners[method] === 'function')
              SHOP.customizer.listeners[method]($(this));
          });
        });
      });
    },

    /**
     * Event, click on grouped options step horizontal tabs.
     * @param {object} $this - jQuery event target element
     */
    showStepGroupedOptionTab($this) {
      SHOP.customizer.actions.showStepGroupedOptionTab($this);
    },

    /**
     * Event, click on double values option, vertical tabs.
     * @param {object} $this - jQuery event target element
     */
    showDoubleOptionValuesTab($this) {
      SHOP.customizer.actions.showDoubleOptionValuesTab($this);
    },

    /**
     * Event, click on option value. Select option value, update global data,
     * sync real option, and call threedium action.
     * @param {object} $this - jQuery event target element
     */
    selectOptionValue($this) {
      if (!$this.is('.active')) {
        SHOP.customizer.actions.selectOptionValue($this);
      }
    },

    /**
     * Event, click on any trigger with this data value, call component
     * open resume lateral panel.
     */
    showResumeModal() {
      SHOP.customizer.actions.showResumeModal();
    },

    /**
     * Event, click on any trigger with this data value, call component
     * close resume lateral panel.
     */
    hideResumeModal() {
      SHOP.customizer.actions.hideResumeModal();
    },

    /**
     * Force go to the next grouped option or step
     */
    goToPrev() {
      SHOP.customizer.actions.prevStep();
    },

    /**
     * Force go to the prev grouped option or step
     */
    goToNext() {
      SHOP.customizer.actions.nextStep();
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
     */
    goToResume() {
      SHOP.customizer.actions.activeResume();
    },

    /**
     * Sync resume input text and textarea values with fake options
     * @param {object} $this 
     */
    syncInputResumeOption($this) {
      let optionId = $this.data('option-id');
      SHOP.customizer.actions.selectOptionResumeValue($this, optionId, 0);
    },

    /**
     * Sync step input text and textarea values with fake options
     * @param {object} $this
     */
    syncInputStepOption($this) {
      $this.data('option-value').value = $this.val().trim();

      let stepId = $this.data('step-id'),
        optionValueData = $this.data('option-value');

      SHOP.customizer.actions.selectOptionValue($this, stepId, optionValueData);
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
