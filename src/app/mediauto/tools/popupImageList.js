/*global Microdraw*/
/*global paper*/

export var ToolPopupImageList = { popupImageList : (function() {
  var tool = {
    initKey : function initKey() {
      Microdraw.key = '';
    },
    
    /**
     * @function click
     * @desc home. Openseadragon initialisation parameter binds the function.
     * @param {string} prevTool The previous tool to which the selection goes back
     * @returns {void}
     */
    click : function click(prevTool) {
      if (!window.popupImageList || window.popupImageList?.closed) {
        // window.popupImageList = window.open(`/annotation/imageListPopup${window.location.search}`,"popupImageList","height=740,width=380,top=100,left=1200,location=no");
        openImagePopup(window.location.search);
      }
      else {
        window.popupImageList.focus();
      }
        
      Microdraw.backToPreviousTool(prevTool);
    }
  };

  return tool;
}())};
