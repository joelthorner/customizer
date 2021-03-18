/**
 * @file Debug tools
 * @author joelthorner
 */

var module = {

  debug: {
    /**
     * Enable/disable debug info. Errors will continue to appear in console.
     * @type {boolean} 
     */
    enabled: window.location.search.includes('debug=1'),

    /**
     * If findErrors is true, initialize threedium without confs and search bad part/material
     * @type {boolean} 
     */
    findErrors: window.location.search.includes('findErrors=1'),

    /**
     * Initialize debug functions
     */
    init() {
      if (this.enabled) {
        this.printDebugPanel();
      }
      if (this.findErrors) {
        console.log('Looking for errors in materials and parts/groups. Please wait...');
      }
    },

    /**
     * Com que threedium no proporciona un control d'errors
     * dels params de configuració al inicialitzar, es fa un
     * mode per buscar-ho manualment si s'activa aquesta funcio 
     * via url per "findErrors".
     */
    checkConfiguration() {
      let confParts = SHOP.customizer.threedium.configuration.parts.override;
      let confMaterials = SHOP.customizer.threedium.configuration.parts.materials;

      Unlimited3D.getAvailableParts((error, parts) => {
        if (parts) {
          confParts.forEach(confPart => {
            let isValid = false;

            for (let i = 0; i < parts.length; i++) {
              if (parts[i].shortName === confPart) {
                isValid = true;
                break;
              }
            }

            if (!isValid)
              console.warn(`Invalid option value [part/group] with name "${confPart}"`);
          });
        }
        console.log(`End each parts/groups`);
      });

      Unlimited3D.getAvailableMaterials((error, materials) => {
        if (materials) {
          for (const confMaterial in confMaterials) {
            let isValid = false;

            for (let i = 0; i < materials.length; i++) {
              if (materials[i].shortName == confMaterial) {
                isValid = true;
                break;
              }
            }

            if (!isValid)
              console.error(`Invalid option value [material name] with "${confMaterial}"`);
          }
        }
        console.log(`End each materials`);
      });
    },

    /**
     * Print and update the debug panel with SHOP.customizzer.data
     */
    printDebugPanel() {
      var panel = document.getElementById('customizer-threedium-debug');

      if (!panel) {
        var panel = document.createElement('div');
        panel.id = 'customizer-threedium-debug';
        document.body.appendChild(panel);
      }

      var jsonViewer = new JSONViewer();
      panel.innerHTML = '';
      panel.appendChild(jsonViewer.getContainer());
      jsonViewer.showJSON(SHOP.customizer.data);
    },

    /**
     * Permet detectar sempre que s'updateja el objecte
     * SHOP.customizer.data i fer un redraw del debug panel cada vegada.
     */
    handler() {
      return {
        get: (obj, prop) => {
          // this.printDebugPanel();
          if (['[object Object]', '[object Array]'].indexOf(Object.prototype.toString.call(obj[prop])) > -1) {
            return new Proxy(obj[prop], this.handler());
          }
          return obj[prop];
        },
        set: (obj, prop, value) => {
          this.printDebugPanel();

          obj[prop] = value;
          return true;
        }
      };
    },
  },
};

SHOP.customizer = { ...SHOP.customizer, ...module };

/**
 * Print error on console after good Threedium object init.
 */
CustomizerError = (error, message = '') => {
  if (error) {
    if (message.length)
      console.error(error, message);
    else
      console.error(error);
  }
}

/**
 * JSONViewer - by Roman Makudera 2016 (c) MIT licence.
 */
var JSONViewer = function (e) { var t = {}.toString, n = t.call(new Date); function a() { this._dom_container = e.createElement("pre"), this._dom_container.classList.add("json-viewer") } function i(t, n) { var a = e.createElement("span"), i = typeof t, l = "" + t; return "string" === i ? l = '"' + t + '"' : null === t ? i = "null" : n && (i = "date", l = t.toLocaleString()), a.className = "type-" + i, a.textContent = l, a } function l(t) { var n = e.createElement("span"); return n.className = "items-ph hide", n.innerHTML = function (e) { return e + " " + (e > 1 || 0 === e ? "items" : "item") }(t), n } function r(t) { var n = e.createElement("a"); return n.classList.add("list-link"), n.href = "javascript:void(0)", n.innerHTML = t || "", n } return a.prototype.showJSON = function (a, s, d) { var o = "number" == typeof s ? s : -1, c = "number" == typeof d ? d : -1; this._dom_container.innerHTML = "", function a(s, d, o, c, p) { var h = t.call(d) === n; var u = !h && "object" == typeof d && null !== d && "toJSON" in d ? d.toJSON() : d; if ("object" != typeof u || null === u || h) s.appendChild(i(d, h)); else { var f = o >= 0 && p >= o, g = c >= 0 && p >= c, v = Array.isArray(u), m = v ? u : Object.keys(u); if (0 === p) { var y = l(m.length), L = r(v ? "[" : "{"); m.length ? (L.addEventListener("click", function () { f || (L.classList.toggle("collapsed"), y.classList.toggle("hide"), s.querySelector("ul").classList.toggle("hide")) }), g && (L.classList.add("collapsed"), y.classList.remove("hide"))) : L.classList.add("empty"), L.appendChild(y), s.appendChild(L) } if (m.length && !f) { var C = m.length - 1, N = e.createElement("ul"); N.setAttribute("data-level", p), N.classList.add("type-" + (v ? "array" : "object")), m.forEach(function (t, n) { var s = v ? t : d[t], h = e.createElement("li"); if ("object" == typeof s) if (!s || s instanceof Date) h.appendChild(e.createTextNode(v ? "" : t + ": ")), h.appendChild(i(s || null, !0)); else { var u = Array.isArray(s), f = u ? s.length : Object.keys(s).length; if (f) { var g = ("string" == typeof t ? t + ": " : "") + (u ? "[" : "{"), m = r(g), y = l(f); o >= 0 && p + 1 >= o ? h.appendChild(e.createTextNode(g)) : (m.appendChild(y), h.appendChild(m)), a(h, s, o, c, p + 1), h.appendChild(e.createTextNode(u ? "]" : "}")); var L = h.querySelector("ul"), T = function () { m.classList.toggle("collapsed"), y.classList.toggle("hide"), L.classList.toggle("hide") }; m.addEventListener("click", T), c >= 0 && p + 1 >= c && T() } else h.appendChild(e.createTextNode(t + ": " + (u ? "[]" : "{}"))) } else v || h.appendChild(e.createTextNode(t + ": ")), a(h, s, o, c, p + 1); n < C && h.appendChild(e.createTextNode(",")), N.appendChild(h) }, this), s.appendChild(N) } else if (m.length && f) { var T = l(m.length); T.classList.remove("hide"), s.appendChild(T) } if (0 === p) { if (!m.length) { var T = l(0); T.classList.remove("hide"), s.appendChild(T) } s.appendChild(e.createTextNode(v ? "]" : "}")), g && s.querySelector("ul").classList.add("hide") } } }(this._dom_container, a, o, c, 0) }, a.prototype.getContainer = function () { return this._dom_container }, a }(document);
