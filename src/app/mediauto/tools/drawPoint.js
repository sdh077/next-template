/*global Microdraw*/
/*global paper*/

// var ToolDrawPoint = {drawPoint: (function() {

//   /* can be changed/loaded via config  */
//   let drawingPointFlag = false;

  

//   var tool = {

//     /**
//      * @function onDeselect
//      * @description Function called when the tool is deselected
//      * @returns {void}
//      */
//     onDeselect: function onDeselect() {
//       // test if user is changing tool without closing the Point.
//       // If yes, close the Point
//       if( Microdraw.drawingPointFlag === true ) {
//         finishDrawingPoint(true);
//       }
//     },

//     /**
//      * @function mouseDown
//      * @param {object} point The point where you click (x,y)
//      * @returns {void}
//      */
//     mouseDown: function mouseDown(point) {
//       if (Microdraw.isLocked || _auth_level == "UO") {
//         return;
//       }
//       // mouseUndo.callback is expected to be a function
//       Microdraw.mouseUndo.callback = ((currentFlag) => () => {
//         Microdraw.drawingPointFlag = currentFlag;
//       })(Microdraw.drawingPointFlag);

//       if (point.x < 0 || point.x > Microdraw.projectSize.x || 
//         point.y < 0 || point.y > Microdraw.projectSize.y) {
//         return;
//       }

//       let selectedLabel = Microdraw.labelSelected.point;
//       if (selectedLabel.labelNo == undefined) {
//         toast.warning('Need select a label.')
//         return;
//       }

//       // is already drawing a Point or not?
//       if( Microdraw.drawingPointFlag === false ) {

//         // deselect previously selected region
//         if( Microdraw.region ) { Microdraw.region.path.selected = false; }

//         // Start a new Region with alpha 0
//         const path = new paper.Path({segments:[point]});
//         path.strokeWidth = Microdraw.config.defaultStrokeWidth;
//         Microdraw.region = Microdraw.newRegion({path:path, labelNo: selectedLabel.labelNo, labelName: selectedLabel.labelName, hex: selectedLabel.hex}, 1, true);
//         Microdraw.region.path.type = "POINT";
//         Microdraw.region.path.fillColor.alpha = 0.1;
//         Microdraw.region.path.selected = true;

//         Microdraw.drawingPointFlag = true;

//       } else {
//         // test if user is closing the Point
//         // 폴리곤 첫 점의 X,Y
//         let firstX = Microdraw.region.path.segments[0].point._x;
//         let firstY = Microdraw.region.path.segments[0].point._y;

//         let distX = Math.abs(point.x - firstX)
//         let distY = Math.abs(point.y - firstY)

//         // 줌 값에 따라 간격 기준 조정
//         let zoom = Microdraw.viewer.viewport.zoomSpring.target.value;

//         // 첫 점 클릭 완료 판정 늘리기
//         // 타겟 X, Y와 첫 점의 X, Y 거리 차이 비교하여 조건 충족시 아래 hitTest true 되도록 point 값 수정
//         if (distX + distY < (5 / zoom)) {
//           point.x = firstX;
//           point.y = firstY;
//         }

//         const hitResult = paper.project.hitTest(point, {tolerance:Microdraw.tolerance, segments:true});
//         if( hitResult
//                     && hitResult.item === Microdraw.region.path
//                     && hitResult.segment.point === Microdraw.region.path.segments[0].point ) {
//           // clicked on first point of current path
//           // --> close path and remove drawing flag
//           finishDrawingPoint(true);
//         } else {
//           // add point to region
//           Microdraw.region.path.add(point);
//         }
//       }

//       Microdraw.commitMouseUndo();
//     },

//     mouseDrag: function mouseDrag(point, dpoint) {
//       if( Microdraw.drawingPointFlag) {
//         if (point.x < 0 || point.x > Microdraw.projectSize.x || 
//           point.y < 0 || point.y > Microdraw.projectSize.y) {
//           return;
//         }

//         let path = Microdraw.region.path._segments;
  
//         let firstX = path[0].point._x;
//         let firstY = path[0].point._y;
  
//         let distX = Math.abs(point.x - firstX)
//         let distY = Math.abs(point.y - firstY)
  
//         // 줌 값에 따라 간격 기준 조정
//         let zoom = Microdraw.viewer.viewport.zoomSpring.target.value;

//         // 드래그 하여 첫점 근처 도달시 드로잉 종료
//         if (distX + distY < (5 / zoom) && path.length > 1) {
//           // drawingPointFlag = false로 변경됨
//           finishDrawingPoint(true);
//           return;
//         }

//         let pathLen = path['length'];
//         let lastPoint = path[pathLen-1]._point;
  
//         // 마우스 포인터와 폴리곤에서 마지막에 찍힌 점의 X, Y 거리 비교
//         distX = Math.abs(point.x - lastPoint._x)
//         distY = Math.abs(point.y - lastPoint._y)
          
//         // 드래그시 일정 간격마다 포인트 추가
//         if (distX + distY > (15 / zoom))
//           Microdraw.region.path.add(point);
//       }
//     },
    
//     /**
//      * @function mouseUp
//      * @returns {void}
//      */
//     mouseUp: function mouseUp() {
//       if( Microdraw.newRegionFlag === true ) {
//         Microdraw.region.path.closed = true;
//         Microdraw.region.path.fullySelected = true;
//         // to delete all unnecessary segments while preserving the form of the
//         // region to make it modifiable; & adding handles to the segments
//         const origSegments = Microdraw.region.path.segments.length;

//         if (Microdraw.debug) {
//           var finalSegments = Microdraw.region.path.segments.length;
//           console.log( finalSegments, parseInt(finalSegments/origSegments*100, 10) + "% segments conserved" );
//         }
//       }
//       paper.view.draw();
//     },

//     /**
//      * @function click
//      * @desc Convert Point path to bezier curve
//      * @param {string} prevTool The previous tool to which the selection goes back
//      * @returns {void}
//      */
//     click: function click(prevTool) {
//       Microdraw.navEnabled = false;
//     }
//   };

//   return tool;
// }())};

// /**
//    * @function finishDrawingPoint
//    * @description cleanup finishing drawing Point
//    * @param {bool} closed True if the Point has to be closed
//    * @returns {void}
//    */
//  function finishDrawingPoint(closed) {

//   if (Microdraw.region.path.segments.length < 3) {
//     Microdraw.removeRegion(Microdraw.region);
//     toast.warning("Points with less than 2 points have been deleted.");
//     Microdraw.UndoStack.pop(Microdraw.UndoStack.length-1)
//     paper.view.draw();
//   }

//   // finished the drawing of the Point
//   if( closed ) {
//     Microdraw.region.path.closed = true;
//     Microdraw.region.path.fillColor.alpha = Microdraw.config.defaultFillAlpha;
//   } else {
//     Microdraw.region.path.fillColor.alpha = 0;
//   }
//   Microdraw.region.path.fullySelected = true;
//   Microdraw.drawingPointFlag = false;
//   Microdraw.initText(Microdraw.region);
//   Microdraw.currentRegions();
// }

export var ToolDrawPoint = {drawPoint: (function() {

  /* can be changed/loaded via config  */
  let drawingPointFlag = false;

  

  var tool = {

    /**
     * @function onDeselect
     * @description Function called when the tool is deselected
     * @returns {void}
     */
    onDeselect: function onDeselect() {
      // test if user is changing tool without closing the Point.
      // If yes, close the Point
      if( Microdraw.drawingPointFlag === true ) {
        finishDrawingPoint(true);
      }
    },

    /**
     * @function mouseDown
     * @param {object} point The point where you click (x,y)
     * @returns {void}
     */
    mouseDown: function mouseDown(point) {
      if (Microdraw.isLocked || _auth_level == "UO") {
        return;
      }
      // mouseUndo.callback is expected to be a function
      Microdraw.mouseUndo.callback = ((currentFlag) => () => {
        Microdraw.drawingPointFlag = currentFlag;
      })(Microdraw.drawingPointFlag);

      if (point.x < 0 || point.x > Microdraw.projectSize.x || 
        point.y < 0 || point.y > Microdraw.projectSize.y) {
        return;
      }

      let selectedLabel = Microdraw.labelSelected.point;
      if (selectedLabel.labelNo == undefined) {
        toast.warning('Need select a label.')
        return;
      }

      // is already drawing a Point or not?
      if( Microdraw.drawingPointFlag === false ) {

        // deselect previously selected region
        if( Microdraw.region ) { Microdraw.region.path.selected = false; }

        // Start a new Region with alpha 0
       

        // path.strokeWidth = Microdraw.config.defaultStrokeWidth;
        // Microdraw.region = Microdraw.newRegion({path:path, labelNo: selectedLabel.labelNo, labelName: selectedLabel.labelName, hex: selectedLabel.hex}, 1, true);
        // const path = new paper.Path();
        const path = new paper.Path({segments:[point]});
        path.type = "POINT";
        Microdraw.region = Microdraw.newRegion({path: path, labelNo: selectedLabel.labelNo, labelName: selectedLabel.labelName, hex: selectedLabel.hex}, 1, true);
        // Microdraw.region = {arrPath: [], path: {}};
        // Microdraw.region.path.type = "POINT";
        // Microdraw.region.path.fillColor.alpha = 0.1;
        Microdraw.region.path.selected = true;

        Microdraw.drawingPointFlag = true;
        // Microdraw.newPoint(point, selectedLabel.hex, true)

      } else {
        // test if user is closing the Point
        // 폴리곤 첫 점의 X,Y
        // let firstX = Microdraw.region.arrPath[0].position._x;
        // let firstY = Microdraw.region.arrPath[0].position._y;
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

        // const hitResult = paper.project.hitTest(point, {tolerance:Microdraw.tolerance, segments:true});

        // let isContain = false;
        // for (let path of Microdraw.region.arrPath) {
        //   if (hitResult?.item == path) {
        //     isContain = true;
        //     break;
        //   }
        // }

        // if( hitResult && isContain ) {
        //   // clicked on first point of current path
        //   // --> close path and remove drawing flag
        //   finishDrawingPoint(true);
        // } else {
        //   // add point to region
        //   // Microdraw.newPoint(point, Microdraw.labelSelected.point.hex);
        //   Microdraw.region.path.add(point);
        // }
        const hitResult = paper.project.hitTest(point, {tolerance:Microdraw.tolerance, segments:true});
        if( hitResult
                    && hitResult.item === Microdraw.region.path
                    && hitResult.segment.point === Microdraw.region.path.segments[0].point ) {
          // clicked on first point of current path
          // --> close path and remove drawing flag
          finishDrawingPoint(true);
        } else {
          // add point to region
          Microdraw.region.path.add(point);
          // Microdraw.newPoint(point, selectedLabel.hex, true)
        }
      }

      Microdraw.commitMouseUndo();
    },

    // mouseDrag: function mouseDrag(point, dpoint) {
    //   if( Microdraw.drawingPointFlag) {
    //     if (point.x < 0 || point.x > Microdraw.projectSize.x || 
    //       point.y < 0 || point.y > Microdraw.projectSize.y) {
    //       return;
    //     }

    //     let arrPath = Microdraw.region.arrPath;
  
    //     let firstX = arrPath[0].position._x;
    //     let firstY = arrPath[0].position._y;
  
    //     let distX = Math.abs(point.x - firstX)
    //     let distY = Math.abs(point.y - firstY)
  
    //     // 줌 값에 따라 간격 기준 조정
    //     let zoom = Microdraw.viewer.viewport.zoomSpring.target.value;

    //     // 드래그 하여 첫점 근처 도달시 드로잉 종료
    //     if (distX + distY < (5 / zoom) && arrPath.length > 1) {
    //       // drawingPointFlag = false로 변경됨
    //       finishDrawingPoint(true);
    //       return;
    //     }

    //     let lastPoint = arrPath[arrPath.length-1].position;
  
    //     // 마우스 포인터와 폴리곤에서 마지막에 찍힌 점의 X, Y 거리 비교
    //     distX = Math.abs(point.x - lastPoint._x)
    //     distY = Math.abs(point.y - lastPoint._y)
          
    //     // 드래그시 일정 간격마다 포인트 추가
    //     if (distX + distY > (15 / zoom)) {
    //       Microdraw.newPoint(point, Microdraw.labelSelected.point.hex);
    //     }
    //   }
    // },
    
    /**
     * @function mouseUp
     * @returns {void}
     */
    mouseUp: function mouseUp() {
      if( Microdraw.newRegionFlag === true ) {
        Microdraw.region.path.closed = true;
        Microdraw.region.path.fullySelected = true;
        // to delete all unnecessary segments while preserving the form of the
        // region to make it modifiable; & adding handles to the segments
        const origSegments = Microdraw.region.path.segments.length;

        if (Microdraw.debug) {
          var finalSegments = Microdraw.region.path.segments.length;
          console.log( finalSegments, parseInt(finalSegments/origSegments*100, 10) + "% segments conserved" );
        }
      }
      paper.view.draw();
    },

    /**
     * @function click
     * @desc Convert Point path to bezier curve
     * @param {string} prevTool The previous tool to which the selection goes back
     * @returns {void}
     */
    click: function click(prevTool) {
      Microdraw.navEnabled = false;
    },
  };

  return tool;
}())};

/**
   * @function finishDrawingPoint
   * @description cleanup finishing drawing Point
   * @param {bool} closed True if the Point has to be closed
   * @returns {void}
   */
 function finishDrawingPoint(closed) {
  // finished the drawing of the Point
  if( closed ) {
    Microdraw.region.path.closed = true;
    // Microdraw.region.path.fillColor.alpha = Microdraw.config.defaultFillAlpha;
  } else {
    // Microdraw.region.path.fillColor.alpha = 0;
  }
  Microdraw.region.path.fullySelected = true;
  Microdraw.drawingPointFlag = false;
  Microdraw.initText(Microdraw.region);
  Microdraw.currentRegions();
}
