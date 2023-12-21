

export const ToolDrawLine = {
    drawLine: (function () {
      var tool = {
  
        /**
              * @function mouseDown
              * @param {object} point The point where you click (x,y)
              * @returns {void}
              */
        mouseDown: function mouseDown(point) {
          // if (Microdraw.isLocked || _auth_level == "UO") {
          //   return;
          // }
  
          if (Microdraw.region) {
            Microdraw.region.path.selected = false;
          }
  
          if (point.x < 0 || point.x > Microdraw.projectSize.x || 
            point.y < 0 || point.y > Microdraw.projectSize.y) {
            return;
          }
          
          // let selectedLabel = Microdraw.labelSelected.line;
          let selectedLabel = {
            "labelNo": "4913",
            "labelName": "LN_normal",
            "hex": "0x06e49c"
        };
          if (selectedLabel.labelNo == undefined) {
            toast.warning('Need select a label.')
            return;
          }
  
          // var path = new paper.Path({ segments: [point] });
          var path = new paper.Path.Line(point, point);
          // const path = new paper.Path({segments:[point]});
          path.strokeWidth = Microdraw.config.defaultStrokeWidth;
          // Microdraw.region = Microdraw.newRegion({ path: path }, 1, true);
          Microdraw.region = Microdraw.newRegion({path:path, labelNo: selectedLabel.labelNo, labelName: selectedLabel.labelName, hex: selectedLabel.hex}, 1, true);
          // Microdraw.region.labelNo = "LINE";
          // Microdraw.region.labelName = "LINE";
          // Microdraw.region.hex = "";
          Microdraw.region.path.type = "LINE";
          Microdraw.region.path.fillColor.alpha = 0.1;
  
          Microdraw.commitMouseUndo();
        },
  
        /**
               * @function mouseDrag
               * @param {object} point The point where you moved to (x,y)
               * @param {object} dpoint The movement of the point
               * @return {void}
              */
        mouseDrag: function mouseDrag(point) {
          // Microdraw.region.path.add(point);
          if (point.x < 0 || point.x > Microdraw.projectSize.x || 
            point.y < 0 || point.y > Microdraw.projectSize.y) {
            return;
          }
  
          if (Microdraw.region == null) {
            return;
          }
  
          Microdraw.region.path.segments[1].point.x = point.x;
          Microdraw.region.path.segments[1].point.y = point.y;
        },
  
        /**
               * @function mouseUp
               * @returns {void}
               */
        mouseUp: function mouseUp(point) {
  
          // this handler may get called for multiple times in one drawing session
          if (!Microdraw.region) {
            return;
          }
  
          // do not keep paths with too little segments
          // if ((Microdraw.region.path.segments || []).length < Microdraw.tolerance) {
          //   Microdraw.removeRegion(Microdraw.region);
          //   paper.view.draw();
  
          //   return;
          // }
          // var segments = Microdraw.region.path.segments;
          // if (segments[0].point.x != segments[1].point.x && segments[0].point.y != segments[1].point.y) {
            Microdraw.region.path.closed = false;
            Microdraw.region.path.fullySelected = true;
  
            // to delete all unnecessary segments while preserving the form of the
            // region to make it modifiable; & adding handles to the segments
            var origSegments = Microdraw.region.path.segments.length;
  
            if (Microdraw.debug) {
              var finalSegments = Microdraw.region.path.segments.length;
              console.log( finalSegments, parseInt(finalSegments/origSegments*100, 10) + "% segments conserved" );
            }
            Microdraw.initText(Microdraw.region);
            // Microdraw.currentRegions();
            
          // }
          paper.view.draw();
        },
  
        /**
               * @function click
               * @desc Convert polygon path to bezier curve
               * @param {string} prevTool The previous tool to which the selection goes back
               * @returns {void}
               */
        click: function click(prevTool) {
          Microdraw.navEnabled = false;
        }
      };
  
      return tool;
    }())
  };
  
  // export default ToolDrawLine;
  