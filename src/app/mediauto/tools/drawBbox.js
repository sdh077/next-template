/*global Microdraw*/
/*global paper*/

export var ToolDrawBbox = {
  drawBbox: (function () {
    var tool = {

      /**
            * @function mouseDown
            * @param {object} point The point where you click (x,y)
            * @returns {void}
            */
      mouseDown: function mouseDown(point) {
        if (Microdraw.isLocked || _auth_level == "UO") {
          return;
        }

        if (Microdraw.region) {
          Microdraw.region.path.selected = false;
        }

        if (point.x < 0 || point.x > Microdraw.projectSize.x || 
          point.y < 0 || point.y > Microdraw.projectSize.y) {
          return;
        }

        let selectedLabel = Microdraw.labelSelected.bbox;
        if (selectedLabel.labelNo == undefined) {
          toast.warning('Need select a label.')
          return;
        }

        // var path = new paper.Path({ segments: [point] });
        // var path = new paper.Path.Rectangle(point, {x : point.x + 30, y: point.y + 30});
        var path = new paper.Path.Rectangle(point, point);
        path.strokeWidth = Microdraw.config.defaultStrokeWidth;
        // Microdraw.region = Microdraw.newRegion({ path: path }, 1, true);
        Microdraw.region = Microdraw.newRegion({path:path, labelNo: selectedLabel.labelNo, labelName: selectedLabel.labelName, hex: selectedLabel.hex}, 1, true);
        // Microdraw.region.labelNo = "BBOX";
        // Microdraw.region.labelName = "BBOX";
        // Microdraw.region.hex = "";
        Microdraw.region.path.type = "BBOX";
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
        if (Microdraw.region == null) {
          return;
        }

        if (!Microdraw.region.path.fullySelected) {
          return;
        }

        let pointX = point.x;
        let pointY = point.y;

        if (point.x < 0) {
          pointX = 0;
        }
        if (point.x > Microdraw.projectSize.x) {
          pointX = Microdraw.projectSize.x;
        }
        if (point.y < 0) {
          pointY = 0;
        }
        if (point.y > Microdraw.projectSize.y) {
          pointY = Microdraw.projectSize.y;
        }

        let handle = Microdraw.handle

        if (handle == null) {
          Microdraw.region.path.segments[0].point.y = pointY;
          Microdraw.region.path.segments[2].point.x = pointX;
          Microdraw.region.path.segments[3].point.x = pointX;
          Microdraw.region.path.segments[3].point.y = pointY;
        }
        else {
          let segments = Microdraw.region.path.segments;

          switch (handle) {
            case segments[0].point : {
              Microdraw.region.path.segments[1].point.x = pointX;
              Microdraw.region.path.segments[3].point.y = pointY;
              Microdraw.region.path.segments[0].point.x = pointX;
              Microdraw.region.path.segments[0].point.y = pointY;
              break;
            }
            case segments[1].point : {
              Microdraw.region.path.segments[0].point.x = pointX;
              Microdraw.region.path.segments[2].point.y = pointY;
              Microdraw.region.path.segments[1].point.x = pointX;
              Microdraw.region.path.segments[1].point.y = pointY;
              break;
            }
            case segments[2].point : {
              Microdraw.region.path.segments[1].point.y = pointY;
              Microdraw.region.path.segments[3].point.x = pointX;
              Microdraw.region.path.segments[2].point.x = pointX;
              Microdraw.region.path.segments[2].point.y = pointY;
              break;
            }
            case segments[3].point : {
              Microdraw.region.path.segments[0].point.y = pointY;
              Microdraw.region.path.segments[2].point.x = pointX;
              Microdraw.region.path.segments[3].point.x = pointX;
              Microdraw.region.path.segments[3].point.y = pointY;
              break;
            }
          }
        }        
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

        // if (Microdraw.newRegionFlag === true) {
          Microdraw.region.path.closed = true;
          Microdraw.region.path.fullySelected = true;
          Microdraw.region.path.fillColor.alpha = Microdraw.config.defaultFillAlpha;

          // to delete all unnecessary segments while preserving the form of the
          // region to make it modifiable; & adding handles to the segments
          var origSegments = Microdraw.region.path.segments.length;

          if (Microdraw.debug) {
            var finalSegments = Microdraw.region.path.segments.length;
            console.log( finalSegments, parseInt(finalSegments/origSegments*100, 10) + "% segments conserved" );
          }

          Microdraw.initText(Microdraw.region);
          Microdraw.currentRegions();

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
