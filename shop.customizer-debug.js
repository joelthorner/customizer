let debug = {
  debug: {

    /**
     * Enable/disable debug info. Errors will continue to appear in console.
     * @type {boolean} 
     */
    enabled: true,

    init() {
      if (this.enabled) {
        this.printDebugPanel();
      }
    },

    printDebugPanel() {
      // this.debounce(() => {
        console.log('print');
        let stringJson = JSON.stringify(SHOP.customizer.data, null, 2),
        prettyJson = SHOP.customizer.debug.syntaxHighlight(stringJson),
        $panel = $('#customizer-threedium-debug');
        
        if (!$panel.length) {
          $('body').append('<pre id="customizer-threedium-debug"></pre>');
          $panel = $('#customizer-threedium-debug');
        }
        
        $panel.html(prettyJson);
      // }, 1000);
    },

    syntaxHighlight(json) {
      if (typeof json != 'string') {
        json = JSON.stringify(json, undefined, 2);
      }
      json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'key';
          } else {
            cls = 'string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'boolean';
        } else if (/null/.test(match)) {
          cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
      });
    },

    // debounce(func, wait, immediate) {
    //   var timeout;
    //   return function () {
    //     var context = this, args = arguments;
    //     var later = function () {
    //       timeout = null;
    //       if (!immediate) func.apply(context, args);
    //     };
    //     var callNow = immediate && !timeout;
    //     clearTimeout(timeout);
    //     timeout = setTimeout(later, wait);
    //     if (callNow) func.apply(context, args);
    //   };
    // },

    handler() {
      let t = null;

      return {
        // get: (obj, prop) => {
        //   // clearTimeout(t);

        //   // setTimeout(() => {
        //   //   this.printDebugPanel();
        //   // }, 1000);
        //   console.log('gotit');

        //   // this.throttle(() => {
        //   //   console.log('print 1');
        //   //   this.printDebugPanel();
        //   // }, 1000);
        //   // this.debounce(() => {
        //   //   this.printDebugPanel();
        //   // }, 1000);


        //   if (['[object Object]', '[object Array]'].indexOf(Object.prototype.toString.call(obj[prop])) > -1) {
        //     return new Proxy(obj[prop], this.handler());
        //   }
        //   return obj[prop];
        // },
        set: (obj, prop, value) => {
          console.log('set it');

          // this.throttle(() => {
          //   console.log('print 2');
          //   this.printDebugPanel();
          // }, 1000);

          // this.debounce(() => {
          // }, 1000);
          this.printDebugPanel();

          obj[prop] = value;
          return true;
        }
      };
    },
  },
};

// Add debug into customizer object
SHOP.customizer = { ...SHOP.customizer, ...debug };
