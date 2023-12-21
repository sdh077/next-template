/*global Microdraw*/
/*global paper*/

export var ToolDeletePoint = { pointDelete : (function() {
  var tool = {

    /**
         * @function mouseDown
         * @param {object} point The point where you clicked (x,y)
         * @returns {void}
         */
    mouseDown : function mouseDown(point) {
      if (Microdraw.isLocked || _auth_level == "UO") {
        return;
      }
      
      var hitResult = paper.project.hitTest(point, {
        tolerance : Microdraw.tolerance,
        stroke : true,
        segments : true,
        fill : true,
        handles : true
      });
      Microdraw.newRegionFlag = false;

      if( hitResult ) {
        if (hitResult.item.type == "SEG") {
          var i, re;
          for( i = 0; i < Microdraw.ImageInfo[Microdraw.currentImage].Regions.length; i += 1 ) {
            if( Microdraw.ImageInfo[Microdraw.currentImage].Regions[i].path === hitResult.item ) {
              re = Microdraw.ImageInfo[Microdraw.currentImage].Regions[i];
              break;
            }
          }

          // select path
          if( Microdraw.region && Microdraw.region !== re ) {
            Microdraw.region.path.selected = false;
            prevRegion = Microdraw.region;
          }
          Microdraw.selectRegion(re);

          if (!Microdraw.region.path.fullySelected) {
            if (Microdraw.latestStatus == 'progressing') {
              toast.warning('Accepted object cannot be modified.');
            }
            return;
          }

          if( hitResult.type === 'segment' ) {
            hitResult.segment.remove();
            Microdraw.commitMouseUndo();
          }
        }
      } else if( Microdraw.region ) {
        Microdraw.region.path.selected = false;
        Microdraw.region = null;
      }
      paper.view.draw();
    },

    /**
         * @function click
         * @desc add an additional point to the selected annotation
         * @param {string} prevTool The previous tool to which the selection goes back
         * @returns {void}
         */
    click : function click(prevTool) {
      if (Microdraw.isLocked) {
        return;
      }
      Microdraw.navEnabled = false;
      Microdraw.handle = null;
    }
  };


  return tool;
}())};
