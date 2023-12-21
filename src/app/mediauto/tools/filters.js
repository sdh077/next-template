/*global Microdraw*/
/*global paper*/

export var ToolFilters = { filters : (function() {
    var tool = {
  
      /**
       * @function click
       * @desc home. Openseadragon initialisation parameter binds the function.
       * @param {string} prevTool The previous tool to which the selection goes back
       * @returns {void}
       */
      click : function click(prevTool) {
          Microdraw.dom.querySelector("#labelDiv").style.display = 'none';
          Microdraw.dom.querySelector("#changeLabelDiv").style.display = 'none';
          Microdraw.dom.querySelector("#popup-info").style.display = 'none';
  
          var canvas = $($('#content')[0].shadowRoot.querySelector('.openseadragon-canvas canvas'))[0];
  
          Microdraw.tempCanvas = window.document.createElement("canvas");
          Microdraw.tempCanvas.width = canvas.width,
          Microdraw.tempCanvas.height = canvas.height;
          Microdraw.tempCanvas.getContext("2d").drawImage(canvas, 0, 0)
          // Microdraw.tempCanvas = c;
  
          if (Microdraw.dom.querySelector("#filtersDiv").style.display == 'block') {
              Microdraw.dom.querySelector("#filtersDiv").style.display = 'none';
          }
          else {
              Microdraw.dom.querySelector("#filtersDiv").style.display = 'block';
          }
          
          Microdraw.backToPreviousTool(prevTool);
      }
    };
  
    return tool;
  }())};
  