/*global Microdraw*/
/*global paper*/

export var ToolPopupHint = { popupHint : (function() {
  var tool = {

    /**
     * @function click
     * @desc home. Openseadragon initialisation parameter binds the function.
     * @param {string} prevTool The previous tool to which the selection goes back
     * @returns {void}
     */
    click : function click(prevTool) {
        Microdraw.dom.querySelector("#labelDiv").style.visibility = 'hidden';
        Microdraw.dom.querySelector("#changeLabelDiv").style.visibility = 'hidden';
        Microdraw.dom.querySelector("#popup-info").style.visibility = 'hidden';

        if (Microdraw.dom.querySelector("#popup-hint").style.visibility == 'visible') {
            Microdraw.dom.querySelector("#popup-hint").style.visibility = 'hidden';
        }
        else {
            Microdraw.dom.querySelector("#popup-hint").style.visibility = 'visible';
        }
        
        Microdraw.backToPreviousTool(prevTool);
    }
  };

  return tool;
}())};
