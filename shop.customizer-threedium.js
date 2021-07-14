/**
 * @file Initialize all js that connect directly to threedium's 3D model and initial options.
 * @author joelthorner
 */

var module = {
  /**
   * Object that contains all related of Threedium
   */
  threedium: {

    /**
     * Indicates if the threedium model has been initialized
     * @type {boolean}
     */
    initialized: false,

    /**
     * Initializes Unlimited3D library.
     * https://threedium.co.uk/documentation/api
     */
    options: {
      distID: 'latest',
      // solution3DID: '4792',
      // solution3DName: 'trilogi-aj-80250',
      projectName: 'carmina-shoes-demo',
      containerID: 'customizer-render',
      collectAnalytics: false,

      /**
       * Called when loading of models and textures has changed First and only parameter is an object contain information about loading status.
       * @param {object} loading 
       */
      onLoadingChanged(loading) {
        SHOP.customizer.components.setLoadingPercent(loading.progress);

        if (loading.progress >= 100) {
          SHOP.customizer.components.hideLoading();
        }
      },

      /**
       * Called whenever user clicks on the scene First and only parameter is an array of objects in format.
       * @param {object[]} objectsClick 
       */
      onPointerClick(objectsClick) {
        console.log(objectsClick);

        if (objectsClick.length) {
          let clickedValue = objectsClick[0].shortName,
            regexp = `(${SHOP.customizer.getAllThreediumGroupParts().join('|')})`,
            match = clickedValue.match(new RegExp(regexp));

          if (match) {
            let step = SHOP.customizer.getStepByThreediumGroupPart(match[0]);
            SHOP.customizer.actions.activeStep(step.id);
          } else {
            let findedStep = SHOP.customizer.findStepByOptionSelectedValue(clickedValue);
            if (findedStep) {
              SHOP.customizer.actions.activeStep(findedStep.id);
            }
          }
        }
      },
    },

    configuration: {
      parts: {
        // hide,
        // show,
        override: NO_CONFIGURABLE_PARTS,
        materials: {},
      },
    },

    /**
     * Array of functions that will be executed just after starting the 3d model.
     * @type {Function[]}
     */
    onLoadCallbacks: [],

    /**
     * Callback function called after action is completed first parameter returned is error, 
     * which is set to null in case of success.
     * @param {object|null} error 
     */
    onLoad(error) {
      let self = SHOP.customizer;

      if (error == null) {
        self.components.hideLoading();

        if (self.debug.findErrors) self.debug.checkConfiguration();

        self.threedium.onLoadCallbacks.forEach(func => func.call());
      } else {
        CustomizerError('Customizer loading error: ', error);
        self.components.hideLoading(true);
      }

      self.threedium.initialized = true;
    },

    /**
     * This method import threedium api js and call init on callback.
     */
    import() {
      let src = THREEDIUM_API_SRC.replace('{VERSION}', THREEDIUM_API_VERSION);
      Fluid.require.js(src, this.init);
    },

    /**
     * Init of threedium canvas with model, project and other options.
     * This function is called into threedium import method.
     */
    init() {
      // Self is necessary because Fluid.import losses "this" reference
      let self = SHOP.customizer;

      self.actions.applyAllRestrictions();

      self.threedium.getConfiguration();

      self.threedium.options = self.threedium.getOptions();

      // If mode is findErrors initialize without confs and search bad part/material
      if (self.debug.findErrors) {
        Unlimited3D.init(self.threedium.options, {}, self.threedium.onLoad);
      } else {
        Unlimited3D.init(self.threedium.options, self.threedium.configuration, self.threedium.onLoad);
      }
    },

    /**
     * Merge default defined threedium model options with product
     * CT options if exists.
     * @return {object}
     */
    getOptions() {
      let $ctOptions = $('#threedium-model-options'),
        ctOptions = $ctOptions.length ? $ctOptions.data('options') : {};

      if (Object.keys(ctOptions).length === 0 && ctOptions.constructor === Object) {
        CustomizerError(false, 'Threedium model parameters missing');
      }

      return { ...this.options, ...ctOptions };
    },

    /**
     * Threedium method https://threedium.co.uk/documentation/api#ChangeMaterial
     * @param {string[]} [parts]
     * @param {string} [material]
     * @param {function} [callback]
     */
    changeMaterial(parts = [], material = '', callback = (error) => CustomizerError(error, 'on changeMaterial')) {
      parts = parts.filter(Boolean);

      if (parts.length && material.length) {
        Unlimited3D.changeMaterial({
          parts: parts,
          material: material,
        }, callback);
      }
    },

    /**
     * Set camera position and target
     * @param {object} view 
     * @param {function} [callback]
     * @deprecated
     */
    setCameraPositionSetTarget(view, callback = (error) => CustomizerError(error, 'on setCameraPositionSetTarget')) {
      if (view) {
        this.setCameraPosition(view, (error) => {
          CustomizerError(error, 'on setCameraPosition');
          this.setCameraTarget(view, callback);
        });
      }
    },

    /**
     * Threedium method https://threedium.co.uk/documentation/api#Setcameraposition
     * @param {object} view
     * @param {function} [callback]
     * @deprecated
     */
    setCameraPosition(view, callback = (error) => CustomizerError(error, 'on setCameraPosition')) {
      if (view) {
        Unlimited3D.setCameraPosition({
          position: view.position,
        }, callback);
      }
    },

    /**
     * Threedium method https://threedium.co.uk/documentation/api#Setcameratarget
     * @param {object} view
     * @param {function} [callback]
     * @deprecated
     */
    setCameraTarget(view, callback = (error) => CustomizerError(error, 'on setCameraTarget')) {
      if (view) {
        Unlimited3D.setCameraTarget({
          target: view.target,
        }, callback);
      }
    },

    /**
     * Threedium method https://threedium.co.uk/documentation/api#Activatetransition
     * @param {string} transitionName
     * @param {function} [callback]
     */
    activeTransitionView(transitionName, callback = (error) => CustomizerError(error, 'on activeTransitionView')) {
      if (transitionName.length) {
        Unlimited3D.activateTransition({
          transition: transitionName,
          target: 'Camera Editor',
        }, callback);
      }
    },

    /**
     * Threedium method https://threedium.co.uk/documentation/api#SetOverlayToPart
     * @param {string} part 
     * @param {string} overlayName
     * @param {string} [oldOverlayName] 
     * @param {function} [callback]
     */
    changeOverlay(part, overlayName, oldOverlayName = '', callback = (error) => CustomizerError(error, 'on changeOverlay')) {
      if (part.length && overlayName.length) {
        if (oldOverlayName.length) {
          Unlimited3D.removeOverlayFromPart({
            overlay: oldOverlayName,
            part: part,
          }, (error) => {
            CustomizerError(error, 'on changeOverlay');

            Unlimited3D.setOverlayToPart({
              overlay: overlayName,
              part: part,
            }, callback);
          });
        } else {
          Unlimited3D.setOverlayToPart({
            overlay: overlayName,
            part: part,
          }, callback);
        }
      }
    },

    /**
     * Update overlay text
     * Threedium method https://threedium.co.uk/documentation/api#Updateoverlay
     * @param {string} overlay
     * @param {string} textValue
     * @param {function} [callback]
     */
    updateOverlayText(overlay, textValue, callback = (error) => CustomizerError(error, 'on updateOverlayText')) {
      if (overlay.length) {
        Unlimited3D.updateOverlay({
          overlay: overlay,
          overlayEntry: `${overlay}_Text`,
          options: {
            text: textValue,
          },
        }, callback);
      }
    },

    /**
     * Update overlay entry
     * Threedium method https://threedium.co.uk/documentation/api#Updateoverlay
     * @param {string} overlay
     * @param {string} overlayEntry
     * @param {boolean} enabled
     * @param {function} [callback]
     */
    updateOverlayEntry(overlay, overlayEntry, enabled, callback = (error) => CustomizerError(error, 'on updateOverlayEntry')) {
      if (overlay.length) {
        Unlimited3D.updateOverlay({
          overlay: overlay,
          overlayEntry: overlayEntry,
          options: {
            enabled: enabled,
          },
        }, callback);
      }
    },

    /**
     * From an overlay it disable all the overlay entries and enable a specific one.
     * @param {string} part
     * @param {string} overlay
     * @param {string} selectedOverlayEntry
     * @deprecated
     */
    exchangeOverlayEntries(part, overlay, selectedOverlayEntry) {
      if (part.length && overlay.length && selectedOverlayEntry.length) {
        Unlimited3D.getPartOverlays({
          part: part,
        }, (error, result) => {
          CustomizerError(error, 'on exchangeOverlayEntries');

          if (result && result[0] && result[0].entries) {
            for (let index = 0; index < result[0].entries.length; index++) {
              const entry = result[0].entries[index];
              SHOP.customizer.threedium.updateOverlayEntry(overlay, entry.name, (entry.name == selectedOverlayEntry));
            }
          }
        });
      }
    },

    /**
     * Threedium method https://threedium.co.uk/documentation/api#Hideparts
     * @param {string[]} parts 
     * @param {function} [callback] 
     */
    hideGroup(parts, callback = (error) => CustomizerError(error, 'on hideGroup')) {
      parts = parts.filter(Boolean);

      if (parts.length) {
        Unlimited3D.hideParts({
          parts: parts,
        }, callback);
      }
    },

    /**
     * Threedium method https://threedium.co.uk/documentation/api#Showparts
     * @param {string[]} parts 
     * @param {function} [callback] 
     */
    showPart(parts, callback = (error) => CustomizerError(error, 'on showPart')) {
      parts = parts.filter(Boolean);

      if (parts.length) {
        Unlimited3D.showParts({
          partObjects: [
            {
              parts: parts,
            },
          ],
        }, callback);
      }
    },

    /**
     * Hide group of parts and show a part
     * @param {string[]} [hideParts] 
     * @param {string[]} [showParts] 
     * @param {function} [callback] 
     */
    hideGroupShowPart(hideParts = [], showParts = [], callback = (error) => CustomizerError(error, 'on hideGroupShowPart')) {
      hideParts = hideParts.filter(Boolean);
      showParts = showParts.filter(Boolean);

      if (showParts.length) {
        this.hideGroup(hideParts, (error) => {
          CustomizerError(error, 'on hideGroup');
          this.showPart(showParts, callback);
        });
      }
    },

    /**
     * Hide group of parts, show a part and change material.
     * @param {string[]} [hideParts] 
     * @param {string[]} [showParts] 
     * @param {string[]} [changeMaterialParts] 
     * @param {string} [material] 
     * @param {function} [callback] 
     */
    hideGroupShowPartChangeMaterial(hideParts = [], showParts = [], changeMaterialParts = [], material = '', callback = (error) => CustomizerError(error, 'on hideGroupShowPartChangeMaterial')) {
      hideParts = hideParts.filter(Boolean);
      showParts = showParts.filter(Boolean);
      changeMaterialParts = changeMaterialParts.filter(Boolean);

      this.hideGroupShowPart(hideParts, showParts, callback);

      if (changeMaterialParts.length && material.length) {
        this.changeMaterial(changeMaterialParts, material, callback);
      }
    },

    /**
     * Show part and after hide part
     * @param {string[]} [showParts]
     * @param {string[]} [hideParts]
     * @param {function} [callback]
     */
    showPartHidePart(showParts = [], hideParts = [], callback = (error) => CustomizerError(error, 'on showPartHidePart')) {
      showParts = showParts.filter(Boolean);
      hideParts = hideParts.filter(Boolean);

      if (showParts.length) {
        this.showPart(showParts, (error) => {
          CustomizerError(error, 'on showPart');
          this.hideGroup(hideParts, callback);
        });
      }
    },

    /**
     * Show a part and change material, after hide a part.
     * @param {string[]} [showParts]
     * @param {string[]} [hideParts]
     * @param {string[]} [changeMaterialParts]
     * @param {string} [material]
     * @param {function} [callback]
     */
    showPartHidePartChangeMaterial(showParts = [], hideParts = [], changeMaterialParts = [], material = '', callback = (error) => CustomizerError(error, 'on showPartHidePartChangeMaterial')) {
      showParts = showParts.filter(Boolean);
      hideParts = hideParts.filter(Boolean);
      changeMaterialParts = changeMaterialParts.filter(Boolean);

      this.showPartHidePart(showParts, hideParts, callback);

      if (changeMaterialParts.length && material.length) {
        this.changeMaterial(changeMaterialParts, material, callback);
      }
    },

    /**
     * Get picado and stormwelt materials by Edge color option and picado part name
     * @param {object} edgeColor - option
     * @param {object} viraPicado - option
     * @return {object}
     */
     getViraPicadoMaterials(edgeColor, viraPicado) {
      let materials = {
        picado: null,
        stormwelt: null,
      };

      if (edgeColor && viraPicado) {
        if (edgeColor.params[3]) {
          materials.picado = `${viraPicado.selectedValue}_${edgeColor.params[3]}`;
        }
        if (edgeColor.params[4]) {
          materials.stormwelt = edgeColor.params[4];
        }
      }

      return materials;
    },

    /**
     * Find over vira-picado option weight value, 270 or 360.
     * If it does not find the value in the selectedValue of the option, it will look for it among the parameters
     * @param {object} option 
     * @return {string}
     */
    getViraValue(option) {
      let result = SOLES_VIRA_270,
        regExp = new RegExp(`${SOLES_VIRA_270}|${SOLES_VIRA_360}`),
        viraPicadoValueMatch = option.selectedValue.match(regExp);

      if (viraPicadoValueMatch) {
        result = viraPicadoValueMatch;
      }

      let isEmptyValue = SHOP.customizer.isNoneValue(option.selectedValue),
        existViraParam270 = SHOP.customizer.existsOptionParam(option.params, SOLES_VIRA_270),
        existViraParam360 = SHOP.customizer.existsOptionParam(option.params, SOLES_VIRA_360);

      if (isEmptyValue && (existViraParam270 || existViraParam360)) {
        result = existViraParam270 ? SOLES_VIRA_270 : SOLES_VIRA_360;
      }

      return result.toString();
    },

    /**
     * Replace from string the soles thickness parts to new value.
     * Example: Edge_Leather_PISO-0001_270_TH-00 --> Edge_Leather_PISO-0001_270_TH-15
     * @param {string} text
     * @param {string} replacePart
     * @returns {string}
     */
    replaceThickness(text, replacePart) {
      return text
        .replace(SOLES_THICKNESS_NORMAL, replacePart)
        .replace(SOLES_THICKNESS_DOUBLE, replacePart)
        .replace(SOLES_THICKNESS_TRIPLE, replacePart);
    },

    /**
     * This function returns the resulting part of Sole i Edge 
     * according to the selected values of all the options that affect them.
     * @param {object} [soleStepParam] - Step Sole object
     * @param {object} [optSoleTypeParam] - option sole type from Sole step object
     * @returns {object}
     */
    getSoleAndEdgePartsFromSelectedOptions(soleStepParam, optSoleTypeParam) {
      let self = SHOP.customizer,
        stepEdge = self.getStepData(STEP_ID_EDGE),

        soleStep = soleStepParam ? soleStepParam : self.getStepData(STEP_ID_SOLES),
        optSoleType = optSoleTypeParam ? optSoleTypeParam : self.getStepOptionByType(soleStep, TYPE_SOLE_TYPE),
        optEdgeThickness = self.getStepOptionByType(stepEdge, TYPE_EDGE_THICKNESS),
        optViraPicado = self.getStepOptionByType(stepEdge, TYPE_VIRA_PICADO),

        solePart = optSoleType.selectedValue,
        EdgePart = solePart.replace(ID_PREFIX_SOLE, ID_PREFIX_EDGE),
        result = {
          solePart: solePart,
          EdgePart: EdgePart
        };

      // Change <normal|double|triple> from Edge Thickness
      if (optEdgeThickness) {
        for (const key in result) {
          if (Object.hasOwnProperty.call(result, key)) {
            result[key] = this.replaceThickness(result[key], optEdgeThickness.selectedValue);
          }
        }
      }

      // Change <270|360> from Edge Vira-Stormwelt
      if (optViraPicado) {
        let viraPicadoValue = optViraPicado.selectedValue.match(new RegExp(`${SOLES_VIRA_270}|${SOLES_VIRA_360}`));

        if (viraPicadoValue) {
          for (const key in result) {
            if (Object.hasOwnProperty.call(result, key)) {
              result[key] = result[key]
                .replace(SOLES_VIRA_270, viraPicadoValue[0])
                .replace(SOLES_VIRA_360, viraPicadoValue[0])
            }
          }
        }
      }

      return result;
    },
  },
};

SHOP.customizer = { ...SHOP.customizer, ...module };
