/*global Microdraw*/
/*global paper*/

export var ToolHome = { zoomHome : (function() {
  var tool = {

    /**
     * @function click
     * @desc home. Openseadragon initialisation parameter binds the function.
     * @param {string} prevTool The previous tool to which the selection goes back
     * @returns {void}
     */
    click : function click(prevTool) {
      for(var reg of Microdraw.ImageInfo[1].Regions ) {
        reg.text.rotate(360 - (Number(Microdraw.viewer.viewport.degrees) * -1))
      }
      for(var reg of Microdraw.ImageInfo[1].Measurements ) {
        reg.text.rotate(360 - (Number(Microdraw.viewer.viewport.degrees) * -1))
      }

      paper.view._matrix.rotate(360 - Number(Microdraw.viewer.viewport.degrees))
      Microdraw.viewer.viewport.setRotation(0);
      Microdraw.viewer.viewport.goHome();

      for(var reg of Microdraw.ImageInfo[1].Regions ) {
        reg.text.setFontSize(13)
      }

      Microdraw.backToPreviousTool(prevTool);
    }
  };

  return tool;
}())};
