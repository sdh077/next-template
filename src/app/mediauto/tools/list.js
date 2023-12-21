/*global Microdraw*/
/*global paper*/

export var ToolList = { list : (function() {
  var tool = {

    /**
     * @function click
     * @desc home. Openseadragon initialisation parameter binds the function.
     * @param {string} prevTool The previous tool to which the selection goes back
     * @returns {void}
     */
    click : function click(prevTool) {
      // window.history.go(-1);
      // window.location = "/annotation/imageList" + page_info;
      // window.location = "/annotation/imageList" + window.location.search;
      if (!Microdraw.isSaved) {
        $.confirm({
          title: '',
          content: 'There are unsaved changes. Do you want to save before leaving this page?',
          type: 'custom',
          typeAnimated: true,
          buttons: {
              tryAgain: {
                text: 'SAVE',
                btnClass: 'btn-custom',
                action: async ()=>{
                  if (await Microdraw.save()) {
                    window.onbeforeunload = null;
                    window.popupImageList?.close();
                    window.location = "/annotation/imageList" + window.location.search;
                  }
                }
              },
              close: {
                text: 'IGNORE',
                action: function(){
                  window.onbeforeunload = null;
                  window.popupImageList?.close();
                  window.location = "/annotation/imageList" + window.location.search;
                }

              }
          }
        });
      }
      else {
        window.popupImageList?.close();
        window.location = "/annotation/imageList" + window.location.search;
      }
        Microdraw.backToPreviousTool(prevTool);
    }
  };

  return tool;
}())};
