/*global Microdraw*/
/*global paper*/

export const ToolMove = { move : (function () {
  const tool = {

    /**
     * @function click
     * @desc next. Next image.
     * @param {string} prevTool The previous tool to which the selection goes back
     * @returns {void}
     */
    click : function click(prevTool) {
      Microdraw.navEnabled = true;
    }
  };

  return tool;
}())};
