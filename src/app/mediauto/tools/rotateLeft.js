/*global Microdraw*/
/*global paper*/

export var ToolRotateLeft = { rotateLeft : (function() {
  var tool = {

    /**
     * @function click
     * @desc home. Openseadragon initialisation parameter binds the function.
     * @param {string} prevTool The previous tool to which the selection goes back
     * @returns {void}
     */
    click : async function click(prevTool) {
      paper.view._matrix.rotate(-90)

      Microdraw.viewer.viewport.setRotation(Number(Microdraw.viewer.viewport.degrees) - 90);
      Microdraw.viewer.viewport.zoomBy(1.000000001);
      // 줌을 1로 하면 화면 재조정이 발생하지 않음
      // Microdraw.viewer.viewport.zoomBy(1);

      for(var reg of Microdraw.ImageInfo[1].Regions ) {
        reg.text.rotate(90)
      }
      for(var reg of Microdraw.ImageInfo[1].Measurements ) {
        reg.text.rotate(90)
      }
      for(var reg of Microdraw.ImageInfo[1].Comments ) {
        reg['area'].text.rotate(90)
      }
      Microdraw.backToPreviousTool(prevTool);
    }
  };

  return tool;
}())};
