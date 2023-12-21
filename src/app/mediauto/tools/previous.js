/*global Microdraw*/
/*global paper*/

export const ToolPrevious = { previous : (function () {
  var tool = {

    /**
     * @function click
     * @desc previous. Previous image.
     * @param {string} prevTool The previous tool to which the selection goes back
     * @returns {void}
     */
    click : function click(prevTool) {
      Microdraw.loadPreviousImage();
      Microdraw.backToPreviousTool(prevTool);
    }
  }
    
  return tool;
}())};
