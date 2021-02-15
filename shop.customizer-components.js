/**
 * @file Manages DOM and customizer interactions
 * @author joelthorner
 */

var module = {
  /**
   * This object contains initializations of all HTML components except threedium, 
   * and actions to interact with them.
   */
  components: {
    /**
     * Controls swiper instance
     * @type {Swiper|null}
     */
    swiper: null,

    /**
     * Init function of components object
     */
    init() {
      this.initSwiperControls();
      this.scrollBars();
      this.initSizeOption();
      this.initRealOptions();
    },

    /**
     * Hide real option elements
     */
    initRealOptions() {
      $('.real-options-output').find('label, input, textarea, button').attr('tabindex', -1);
    },

    /**
     * Initialize size radio fake buttons option
     */
    initSizeOption() {
      var $cont = $('.resume-option-size');

      if ($cont.length) {
        $cont.find('input[type="radio"]').each((index, el) => {
          $(el).data('simpleButtonRadios').options.changeCallback = (sbr) => {
            sbr.$element.closest('.resume-option-values')
              .find('div.resume-value-radio')
              .removeClass('resume-option-selected');

            sbr.$element.closest('div.resume-value-radio')
              .addClass('resume-option-selected');
          };
        });
      }
    },

    /**
     * Initialize step controls swiper
     */
    initSwiperControls() {
      this.swiper = new Swiper('.customizer-steps-controls', {
        spaceBetween: 0,
        slidesPerView: 'auto'
      });
    },

    /**
     * Change active slide of controls swiper
     * @param {string} stepId 
     */
    slideToControl(stepId) {
      var $control = $(`.step-control[data-step-id="${stepId}"]`).closest('.step-control-item'),
        index = $('.step-control-item').last().index();

      if ($control.length) {
        index = $control.index();
      }

      SHOP.customizer.components.swiper
        .slideTo(index);
    },

    /**
     * Initialize step custom scrollbars plugin
     */
    scrollBars() {
      $('.customizer-threedium .scrollbar-outer').scrollbar();
    },

    /**
     * Change elements classes on active step
     * @param {string|object} target - jQuery to activate elements or string with stepId value
     */
    activeStep(target) {
      $('.step-control, .step-content, .step-resume').removeClass('active');

      if (typeof target == 'string') {
        $(`.step-control[data-step-id="${target}"], .step-content[data-step-id="${target}"]`).addClass('active');
      }
      if (typeof target == "object" && target.length) {
        target.addClass('active');
      }
    },

    /**
     * Hide all steps and show resume
     */
    activeResume() {
      var self = SHOP.customizer,
        steps = self.getStepsData();

      $('.step-resume .resume-virtual-steps').html(self.components.getResumeHtmlSteps(steps));
      $('.step-control, .step-content').removeClass('active');
      $('.step-resume, .step-control-resume').addClass('active');
    },

    /**
     * Change classes on select option value froms step.
     * @param {object} $target - jQuery option value target element
     */
    activeOptionValue($target) {
      $target.parent().find('.option-value-trigger-item').removeClass('active');
      $target.addClass('active');
    },

    /**
     * Select grouped options step tab and change related tab elements.
     * @param {object} $target - jQuery event target trigger
     * @param {object} $relatedTargets - jQuery related targets
     */
    activeStepGroupedOptionTab($target, $relatedTargets) {
      // tab menu items [ a|b|c ]
      $target.closest('.step-content-gruped-menu').find('.grouped-menu-item').removeClass('active');
      $target.addClass('active');

      // tab titles [ 1.aaaa ] & tab containers [ oooo ]
      $relatedTargets.closest('.step-content').find('.step-content-option-values, .step-content-option-subtitle').removeClass('active');
      $relatedTargets.addClass('active');
    },

    /**
     * Select left side double option tabs and change related tab elemeents.
     * @param {object} $target - jQuery event target trigger
     * @param {object} $relatedTargets - jQuery related targets
     */
    activeDoubleOptionValuesTab($target, $relatedTargets) {
      // side tabs
      $target.closest('.option-tab-controls').find('.option-tab-control').removeClass('active');
      $target.closest('.option-tab-control').addClass('active');

      // tab containers
      $relatedTargets.closest('.option-block-split-panels').find('.option-block-split-panel').removeClass('active');
      $relatedTargets.closest('.option-block-split-panel').addClass('active');
    },

    /**
     * Active specyfic collapse (mobile souble option)
     * @param {object} $target - jQuery .panel to collapse show
     */
    activeDoubleOptionValuesCollapse($target) {
      $target.collapse('show');
    },

    /**
     * Open side modal resume and update self steps data.
     */
    showResumeModal() {
      var self = SHOP.customizer,
        $modal = $('#resume-menu-customizer-modal'),
        completedSteps = self.getCompletedSteps(),
        steps = self.getStepsData();

      $modal.find('.steps-data-current .current').text(completedSteps.length);
      $modal.find('.steps-data-current .total').text(steps.length);
      $modal.find('.resume-virtual-steps').html(self.components.getResumeHtmlSteps(steps));

      $modal.modal('show');
    },

    /**
     * Close side modal resume and update self steps data.
     */
    hideResumeModal() {
      var $modal = $('#resume-menu-customizer-modal');
      $modal.modal('hide');
    },

    /**
     * Get resume modal step html
     * @param {object[]} steps
     * @return {string}
     */
    getResumeHtmlSteps(steps) {
      var html = '';

      steps.forEach((step, index) => {
        html += this.getResumeHtmlStep(step, index)
      });

      return html;
    },

    /**
     * Get resume modal step html
     * @param {object} step 
     * @return {string}
     */
    getResumeHtmlStep(step, index) {
      var optionsList = '';

      step.options.forEach((option) => {
        optionsList += this.getResumeHtmlStepOption(option);
      });

      return `
        <div class="virtual-resume-item">
          <a href="#" data-step-id="${step.id}" class="virtual-resume-trigger" data-click-action="goToStep,hideResumeModal">
            <div class="virtual-resume-item-img">
              <img class="large-img img-responsive" src="${step.resumeImg}">
            </div>
            <div class="virtual-resume-item-info">
              <span class="index-name">
                <span>${index + 1}</span><span>.</span><span>${step.title}</span>
              </span>
              <div class="options">${optionsList}</div>
            </div>
          </a>
        </div>`;
    },

    /**
     * Get resume modal step option html
     * @param {object} option 
     * @return {string}
     */
    getResumeHtmlStepOption(option) {
      var img = option.selectedValueImg.length ? `<img class="value-img img-responsive" src="${option.selectedValueImg}">` : ``;

      return (option.selected) ? `
        <div class="option">
          ${img}
          <span class="title">${option.title}</span>
          <span class="value">${option.selectedTitle}</span>
        </div>` : ``;
    },

    /**
     * Toggle prev step action HTML elements
     * @param {boolean} show
     */
    togglePrevElements(show) {
      $('[data-click-action="goToPrev"]')[show ? 'removeClass' : 'addClass']('disabled');
    },

    /**
     * Toggle next step action HTML elements
     * @param {boolean} show
     */
    toggleNextElements(show) {
      $('[data-click-action="goToNext"]')[show ? 'removeClass' : 'addClass']('disabled');
    },

    /**
     * Toggle resume menu triggers
     * @param {boolean} show
     */
    toggleResumeModalElements(show) {
      $('[data-click-action="showResumeModal"]')[show ? 'removeClass' : 'addClass']('disabled');
    },

    /**
     * Toggle resume bar buy elements
     * @param {boolean} show
     */
    toggleResumeBarBuyElements(show) {
      $('.resume-bar-buy')[show ? 'removeClass' : 'addClass']('hidden');
    },

    /**
     * Toggle size option alert warning
     * @param {boolean} show
     */
    toggleSizeAlert(show) {
      $('.resume-alert-container')[show ? 'removeClass' : 'addClass']('hidden');
    },

    /**
   * Sync selected customizer option value with {$ buyformOptions ...
   * only radio or checkbox inputs.
   * @param {number} optionId
   * @param {number} valueId
   */
    syncRadioOrCheckOption(optionId, valueId) {
      $(`.productOption${optionId}`)
        .find(`[name="optionValue${optionId}"][value="${valueId}"]`)
        .trigger('click');
    },

    /**
     * Sync selected customizer option value with {$ buyformOptions ...
     * only textarea or input text
     * @param {number} optionId 
     * @param {string} selectedValue 
     */
    syncTextOption(optionId, selectedValue) {
      $(`.productOption${optionId}`)
        .find('textarea, input[type="text"]')
        .val(selectedValue);
    },

    /**
     * Set selected size option to specifyc components
     * @param {object} option - SHOP.customizer.data.resume.size option
     */
    setSizeSelectedValue(option) {
      if (option.selectedValue) {
        $('#dropup-buy-options .value').html(option.selectedValue);
      }
    },

    /**
     * Enable / disable buyFormSubmit
     * @param {boolean} activeBuy 
     * @param {string} optTitle 
     */
    changeBuyFormSubmit(activeBuy, optTitle) {
      var $btn = $('.btn-customizer-buy');

      if (activeBuy) {
        $btn
          .html(languageSheet.BUY)
          .removeClass('disabled')

      } else {
        optTitle = optTitle.replace(':', '').trim();

        $btn
          .html(languageSheet.SELECTOPTION.replace('%option%', optTitle))
          .addClass('disabled')
      }
    },

    /**
     * Toggle size dropdown option
     * @param {object} $target
     */
    toggleSizeDropdown($target) {
      if (!$target.is('.btn-customizer-buy-mobile')) {
        $('#dropup-buy-options').dropdown('toggle');
      }
    },

    /**
     * Manually submit buyForm
     */
    submitForm() {
      $('.main-customizer-form').trigger('submit');
    },

    /**
     * Update container class of active step
     * @param {string} classSuffix 
     */
    updateContainerClassContext(classSuffix) {
      $('#customizer-layout')
        .removeClass((index, className) => {
          return (className.match(/customizerActive_[a-zA-Z]+/g) || []).join(' ');
        })
        .addClass(`customizerActive_${classSuffix}`);
    },

    /**
     * Hide or show '.option-value-trigger-item' elements
     * @param {object} $elements 
     */
    toggleOptionValueTriggerItems($elements) {
      $elements.each((index, el) => {
        var data = $(el).data('option-value');

        if (data.restricted) $(el).addClass('restricted-hidden');
        else $(el).removeClass('restricted-hidden');
      });
    },

    /**
     * Returns container option element from optionId
     * @param {string|number} optionId 
     * @return {object}
     */
    getRestrictedOption(optionId) {
      return $('.customizerStepOptionTab_' + optionId);
    },

    /**
     * Returns jQuery option values elements from '.step-content-option-values' element
     * @param {object} $stepContentOptionValues 
     * @return {object}
     */
    getRestrictedOptionValues($stepContentOptionValues) {
      return $stepContentOptionValues.find('.option-value-trigger-item');
    },

    /**
     * Hide or show control elements into double options
     * @param {object} $elements 
     */
    toggleRestrictedOptionElements($elements) {
      $elements.each((index, el) => {
        var target = $(el).data('target');
        var $elements = this.getRestrictedOptionValues($(target));

        if ($elements.not('.restricted-hidden').length) {
          $(el).removeClass('restricted-hidden');
        } else {
          $(el).addClass('restricted-hidden');
        }
      });
    },

    /**
     * Get first '.option-tab-control a' not restricted finded into option container.
     * @param {object} $optionTabControls 
     * @return {object}
     */
    getFirstValidTabOptionControl($optionTabControls) {
      return $optionTabControls.find('.option-tab-control a').not('.restricted-hidden').first();
    },

    /**
     * Get first 'a.option-value-trigger-item' not restricted from container target
     * @param {object} $container 
     * @return {object}
     */
    getFirstValidOptionValueControl($container) {
      return $container.find('.option-value-trigger-item').not('.restricted-hidden').first();
    },

    /**
     * Update restricted data of value trigger items
     * @param {object} $elements 
     * @param {string} restrictParam 
     */
    updateRestrictedData($elements, restrictParam) {
      // For each option value set enable or disable depending on restriction
      $elements.each((index, el) => {
        var data = $(el).data('option-value'),
          hide = !SHOP.customizer.existsOptionParam(data.params, restrictParam);

        if (hide) data.restricted = true;
        else data.restricted = false;
      });
    },

    /**
     * Hide loading layer 
     * @param {boolean} isFallback
     */
    hideLoading(isFallback = false) {
      let $loading = $('#loading-customizer');

      if (isFallback) {
        setTimeout(() => {
          $loading.addClass('hide');
        }, 6000);
      } else {
        $loading.addClass('hide');
      }
    },

    /**
     * Set percent value to loading layer
     * @param {float} percent 
     */
    setLoadingPercent(percent) {
      let percentText = percent.toFixed(0) + '%';
      $('#loading-customizer .percent').text(percentText);
    },
  },
};

Object.assign(SHOP.customizer, module);