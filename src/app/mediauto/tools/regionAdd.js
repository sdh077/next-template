// /*global Microdraw*/
// /*global paper*/

// var ToolAddRegion = { addRegion : (function() {
//   var tool = {

//     /**
//          * @function mouseDown
//          * @param {object} point The point where you clicked (x,y)
//          * @returns {void}
//          */
//     mouseDown : function mouseDown(point) {
//       var prevRegion = null;
//       var hitResult = paper.project.hitTest(point, {
//         tolerance : Microdraw.tolerance,
//         stroke : true,
//         segments : true,
//         fill : true,
//         handles : true
//       });
//       Microdraw.newRegionFlag = false;

//       if( hitResult ) {
//         var re = Microdraw.ImageInfo[Microdraw.currentImage].Regions.find((region) => region.path === hitResult.item);

//         // select path
//         if( Microdraw.region && Microdraw.region !== re ) {
//           Microdraw.region.path.selected = false;
//           prevRegion = Microdraw.region;
//         }
//         Microdraw.selectRegion(re);

//         if( prevRegion ) {
//           var newPath = Microdraw.region.path.unite(prevRegion.path);
//           Microdraw.removeRegion(prevRegion);
//           Microdraw.region.path.remove();
//           Microdraw.region.path = newPath;
//           // Microdraw.updateRegionList();
//           Microdraw.selectRegion(Microdraw.region);
//           paper.view.draw();
//           Microdraw.commitMouseUndo();
//           Microdraw.backToSelect();
//         }
//       } else if( Microdraw.region ) {
//         Microdraw.region.path.selected = false;
//         Microdraw.region = null;
//       }
//       paper.view.draw();
//     },

//     /**
//          * @function click
//          * @desc add an additional point to the selected annotation
//          * @param {string} prevTool The previous tool to which the selection goes back
//          * @returns {void}
//          */
//     click : function click(prevTool) {
//       Microdraw.navEnabled = false;
//       Microdraw.handle = null;
//     }
//   };

//   return tool;
// }())};

/*global Microdraw*/
/*global paper*/

export var ToolRegionAdd = { regionAdd : (function() {
    var tool = {
  
      /**
           * @function mouseDown
           * @param {object} point The point where you clicked (x,y)
           * @returns {void}
           */
      mouseDown : function mouseDown(point) {
        // is already drawing a polygon or not?
  
        if( Microdraw.drawingPolygonFlag === false ) {
          Microdraw.prevRegion = Microdraw.region;
  
          // deselect previously selected region
          if( Microdraw.region ) { Microdraw.region.path.selected = false; }
  
          // Start a new Region with alpha 0
          const path = new paper.Path({segments:[point]});
          path.strokeWidth = Microdraw.config.defaultStrokeWidth;
          Microdraw.region = Microdraw.newRegion({path:path, uid: 'regionTemp', name: 'regionTemp'}, 1, true);
          Microdraw.region.path.type = "SEG";
          Microdraw.region.path.fillColor.alpha = 0.1;
          Microdraw.region.path.selected = true;
  
          // drawingPolygonFlag = true;
          Microdraw.drawingPolygonFlag = true;
  
        } else {
          // test if user is closing the polygon
          // 폴리곤 첫 점의 X,Y
          let firstX = Microdraw.region.path.segments[0].point._x;
          let firstY = Microdraw.region.path.segments[0].point._y;
  
          let distX = Math.abs(point.x - firstX)
          let distY = Math.abs(point.y - firstY)
  
          // 줌 값에 따라 간격 기준 조정
          let zoom = Microdraw.viewer.viewport.zoomSpring.target.value;
  
          // 첫 점 클릭 완료 판정 늘리기
          // 타겟 X, Y와 첫 점의 X, Y 거리 차이 비교하여 조건 충족시 아래 hitTest true 되도록 point 값 수정
          if (distX + distY < (5 / zoom)) {
            point.x = firstX;
            point.y = firstY;
          }
  
          const hitResult = paper.project.hitTest(point, {tolerance:Microdraw.tolerance, segments:true});
          if( hitResult
                      && hitResult.item === Microdraw.region.path) {
            // clicked on first point of current path
            // --> close path and remove drawing flag
            finishDrawingRegionAdd(true);
          } else {
            // add point to region
            Microdraw.region.path.add(point);
          }
        }
      },
  
      mouseDrag: function mouseDrag(point, dpoint) {
        if( Microdraw.drawingPolygonFlag) {
          if (point.x < 0 || point.x > Microdraw.projectSize.x || 
            point.y < 0 || point.y > Microdraw.projectSize.y) {
            return;
          }
                    
          // const hitResult = Microdraw.prevRegion.path.hitTest(point, {tolerance:Microdraw.tolerance, fill:true});
          // if( hitResult && hitResult.item === Microdraw.prevRegion.path) {
          //   Microdraw.regionFlag = true;
          // }
          // else {
          //   Microdraw.regionFlag = false;
          // }
  
          let path = Microdraw.region.path._segments;
    
          let firstX = path[0].point._x;
          let firstY = path[0].point._y;
    
          let distX = Math.abs(point.x - firstX)
          let distY = Math.abs(point.y - firstY)
    
          // 줌 값에 따라 간격 기준 조정
          let zoom = Microdraw.viewer.viewport.zoomSpring.target.value;
  
          // 드래그 하여 첫점 근처 도달시 드로잉 종료
          if (distX + distY < (5 / zoom) && path.length > 1) {
            // drawingPolygonFlag = false로 변경됨
            // finishDrawingRegionAdd(true);
            // return;
          }
  
          let pathLen = path['length'];
          let lastPoint = path[pathLen-1]._point;
    
          // 마우스 포인터와 폴리곤에서 마지막에 찍힌 점의 X, Y 거리 비교
          distX = Math.abs(point.x - lastPoint._x)
          distY = Math.abs(point.y - lastPoint._y)
            
          // 드래그시 일정 간격마다 포인트 추가
          if (distX + distY > (15 / zoom)) {
            Microdraw.region.path.add(point);
          }
  
        }
      },
  
      mouseUp: function mouseUp(point, dpoint) {
        if (Microdraw.prevRegion.path.type?.includes('COMMENT')) {
          this.finishDrawingRegion(false)
        }

        else {
          const hitResult = Microdraw.prevRegion.path.hitTest(point, {tolerance:Microdraw.tolerance, fill:true});
          if (hitResult && hitResult.item === Microdraw.prevRegion.path) {
            // clicked on first point of current path
            // --> close path and remove drawing flag
            this.finishDrawingRegion(true);
          }
          else {
            this.finishDrawingRegion(false);
          }
        }

        // finishDrawingRegionAdd(true);
            // return;
      },
  
      /**
           * @function click
           * @desc add an additional point to the selected annotation
           * @param {string} prevTool The previous tool to which the selection goes back
           * @returns {void}
           */
      click : function click(prevTool) {
        Microdraw.navEnabled = false;
        Microdraw.handle = null;
      },
  
      /**
       * @function finishDrawingPolygon
       * @description cleanup finishing drawing polygon
       * @param {bool} closed True if the polygon has to be closed
       * @returns {void}
       */
      finishDrawingRegion: function finishDrawingRegion(closed) {
        // finished the drawing of the polygon
        if( closed ) {
          if( Microdraw.prevRegion ) {
            Microdraw.region.path.closed = true;
            var newPath = Microdraw.prevRegion.path.unite(Microdraw.region.path);
              
            if (newPath.children) {
              newPath.remove()
            }
            else {
              newPath.type = Microdraw.prevRegion.path.type;
              newPath.strokeColor = Microdraw.prevRegion.path.strokeColor;
              newPath.fillColor = Microdraw.prevRegion.path.fillColor;
              Microdraw.prevRegion.path.remove();
              Microdraw.prevRegion.path = newPath;
              Microdraw.commitMouseUndo();
            }
            Microdraw.region.path.remove();
            paper.view.draw();
          }
        } 
  
        Microdraw.removeRegion(Microdraw.region);
        Microdraw.selectRegion(Microdraw.prevRegion);
        Microdraw.drawingPolygonFlag = false;
        Microdraw.currentRegions();
        Microdraw.selectedTool = Microdraw.prevTool;
      }
    };
  
    return tool;
  }())};
  
  