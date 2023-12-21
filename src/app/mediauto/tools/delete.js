/*global Microdraw*/
/*global paper*/

export var ToolDelete = { delete : (function() {
  var tool = {

    /**
         * @function click
         * @desc add an additional point to the selected annotation
         * @param {string} prevTool The previous tool to which the selection goes back
         * @returns {void}
         */
    click : function click(prevTool) {
      Microdraw.cmdDeleteSelected();
      Microdraw.backToPreviousTool(prevTool);
      Microdraw.currentRegions();
    }
  };

  return tool;
}())};
