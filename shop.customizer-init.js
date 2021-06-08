/**
 * @file Declare the system-wide enter point of the customizer
 * @author joelthorner
 */

var module = {
  /**
   * Main init of threedium customizer
   */
  init() {
    this.$el = $('#customizer-layout');

    if (this.$el.length && $('html').hasClass('customizer-threedium')) {
      if (this.debug.enabled) {
        this.data = new Proxy(this.getData(), this.debug.handler());
      } else {
        this.data = this.getData();
      }

      this.fluidConfs();
      this.components.init();
      this.threedium.import();
      this.listeners.init();
      this.debug.init();
      this.camera.init();

      SHOP.module.sizeGuideMenu.init();
    }
  },

  /**
   * Fluid configurations before customizer init
   */
  fluidConfs() {
    Fluid.config.showModalBasket = false;
  },
};

SHOP.customizer = { ...SHOP.customizer, ...module };
