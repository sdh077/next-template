/*global Microdraw*/
/*global paper*/

export var ToolDrawMeasurement = {
    drawMeasurement: (function () {
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
  
          // var path = new paper.Path({ segments: [point] });
          var path = new paper.Path.Line(point, point);
          // const path = new paper.Path({segments:[point]});
          path.strokeWidth = Microdraw.config.defaultStrokeWidth;
          Microdraw.region = Microdraw.newMeasurement({ path: path, type: 'MEASUREMENT' }, 1, true);
          // Microdraw.region.labelNo = "LINE";
          // Microdraw.region.labelName = "LINE";
          Microdraw.region.labelNo = "MEASUREMENT";
          Microdraw.region.labelName = "MEASUREMENT";
          Microdraw.region.hex = "";
          Microdraw.region.path.type = "MEASUREMENT";
          Microdraw.region.path.fillColor.alpha = 0.1;
          Microdraw.region.text.content = '';
  
          // 거리측정시 선,원 2개를 그려야하여 Microdraw.region, Microdraw.regionCircle 동시에 컨트롤
          var path2 = new paper.Path.Circle(point, 0);
          Microdraw.regionCircle = Microdraw.newCircle({ path: path2, type: 'MEASUREMENT' }, 1, true);
          // Microdraw.commitMouseUndo();
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
  
          // x1,y1, x2,y2 mouse down시 같은값으로 2개 좌표를 찍고 drag시 x2, y2 좌표 이동
          // 처음 그릴때만 적용, 수정시 mouseDraghandler에서 좌표 이동 처리
          if (!Microdraw.region.path.closed) {
            Microdraw.region.path.segments[1].point.x = point.x;
            Microdraw.region.path.segments[1].point.y = point.y;
          }
  
          this.calcMeasurement(point);
        },
  
        calcMeasurement: function calcMeasurement(point) {
          let x1 = Microdraw.region.path.segments[0].point.x;
          let x2 = Microdraw.region.path.segments[1].point.x;
  
          let y1 = Microdraw.region.path.segments[0].point.y;
          let y2 = Microdraw.region.path.segments[1].point.y;
  
          let x = Math.abs(x1 - x2)
          let y = Math.abs(y1 - y2)
  
          let resultUm

          if (Microdraw.umPerImagePixelX == 0) {
            let imageSize = Microdraw.imageSize;
            let projectPixel = Microdraw.projectSize;

            x = x * imageSize.x / projectPixel.x;
            y = y * imageSize.y / projectPixel.y;
            resultUm = (Math.sqrt(x * x + y * y)).toFixed(0) + 'px';

            // let webPixel = paper.view.projectToView(new paper.Point(x, y));
            // resultUm = Math.sqrt(webPixel.x * webPixel.x + webPixel.y * webPixel.y) + 'px';
          }
          else {
            // 선 거리 계산 * 픽셀당 um 거리
            resultUm = Math.sqrt(x * x + y * y) * Microdraw.umPerProjectPixelX;
              
            if (resultUm < 1000) {
              resultUm = (resultUm).toFixed(2) + 'um';
            }
            else {
              resultUm = (resultUm / 1000).toFixed(2) + 'mm';
            }
          }
          
  
          Microdraw.region.text.content = resultUm;
  
          Microdraw.initText(Microdraw.region);
          Microdraw.region.text.position = Microdraw.region.path.position;
  
          // 원 컨트롤
          let px = (x1 + x2) * 0.5;
          let py = (y1 + y2) * 0.5;
  
          let rx = px - x1;
          let ry = py - y1;
  
          var path2 = new paper.Path.Circle(new paper.Point(px, py), Math.sqrt(rx * rx + ry * ry));
          Microdraw.regionCircle = Microdraw.newCircle({ path: path2, type: 'MEASUREMENT' }, 1, true);
  
          paper.view.draw();
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
            Microdraw.region.path.closed = true;
            Microdraw.region.path.fullySelected = true;
  
            var segments = Microdraw.region.path.segments;
            if (segments[0].point.x == segments[1].point.x && segments[0].point.y == segments[1].point.y) {
              Microdraw.region.text.remove();
              Microdraw.region.path.remove();
            }
            else {
              Microdraw.initText(Microdraw.region);
              Microdraw.currentRegions();
            }

            Microdraw.regionCircle.path.remove();
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
  