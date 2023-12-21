/*global Microdraw*/
/*global paper*/

export var ToolDrawComment = {
  drawComment: (function () {
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
        // if (point.x < 0 || point.x > Microdraw.projectSize.x || 
        //   point.y < 0 || point.y > Microdraw.projectSize.y) {
        //   return;
        // }

        Microdraw.objComment = null;
        // 첫 클릭시 첫점을 handleFrom
        // 마우스 드래그시 좌표를 handle
        var path = new paper.Path.Circle(point, 1);
        Microdraw.handleFrom = point;
        Microdraw.handleFrom.point = point;
        path.type = 'COMMENTAREA'
        Microdraw.region = Microdraw.newCommentArea({ path: path}, 1, true);
        Microdraw.regionCircle = Microdraw.region;
      },

      /**
       * @function mouseDrag
       * @param {object} point The point where you moved to (x,y)
       * @param {object} dpoint The movement of the point
       * @return {void}
      */
      mouseDrag: function mouseDrag(point) {
        // Microdraw.region.path.add(point);
        // if (point.x < 0 || point.x > Microdraw.projectSize.x || 
        //   point.y < 0 || point.y > Microdraw.projectSize.y) {
        //   return;
        // }

        if (Microdraw.region == null) {
          return;
        }

        let type;
        switch(Microdraw.region?.path.type) {
            case 'COMMENTAREA' : type = 'area'; break;
            case 'COMMENTBOX' : type = 'box'; break;
            case 'COMMENTLINE' : type = 'line'; return;
        }

        if (type == 'area') {
          Microdraw.handleTo = point;
          Microdraw.handleTo.point = point;
  
          this.calcCircle(point);
        }

        else if (type == 'box') {
          this.calcBox(point);
        }
      },

      calcCircle: function calcCircle(point) {
        let handleFrom = Microdraw.handleFrom;
        let handleTo = Microdraw.handleTo

        let x2 = handleTo.point.x;
        let x1 = handleFrom.point.x;
        let y2 = handleTo.point.y;
        let y1 = handleFrom.point.y;

        // 원 컨트롤
        let px = (x1 + x2) * 0.5;
        let py = (y1 + y2) * 0.5;

        let rx = px - x1;
        let ry = py - y1;

        var tempPath = new paper.Path.Circle(new paper.Point(px, py), Math.sqrt(rx * rx + ry * ry));
        tempPath.uid = Microdraw.region.uid;
        tempPath.type = 'COMMENTAREA';
        tempPath.fillColor = Microdraw.color.commentArea;
        Microdraw.regionCircle = Microdraw.newCircle({ path: tempPath }, 1, true);
        Microdraw.initText(Microdraw.regionCircle);

        // Microdraw.regionCircle.text.position = Microdraw.regionCircle.path.position;

        paper.view.draw();
      },

      calcBox: function calcBox(point) {
        // Microdraw.region.path.add(point);
        if (Microdraw.region == null) {
          return;
        }

        if (!Microdraw.region.path.fullySelected) {
          return;
        }

        let pointX = point.x;
        let pointY = point.y;
        let handle = Microdraw.handle

        if (handle == null) {
          // Microdraw.region.path.segments[0].point.y = pointY;
          // Microdraw.region.path.segments[2].point.x = pointX;
          // Microdraw.region.path.segments[3].point.x = pointX;
          // Microdraw.region.path.segments[3].point.y = pointY;
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

        let commentArea;
        let commentBox;
        let commentLine;

        if (Microdraw.region.path.type == 'COMMENTAREA') {
          Microdraw.region.path = Microdraw.regionCircle?.path;

          Microdraw.region.path.fillColor = Microdraw.color.commentArea;
          commentArea = Microdraw.region;
        }
        else {
          commentArea = Microdraw.objComment.area;
        }
        


        // push the new region to the Regions array
        var circleTopPoint = commentArea.path.segments[1].point;
        var circleRightPoint = commentArea.path.segments[2].point;

        var boxStartX;
        var boxStartY;
        var boxEndX;
        var boxEndY;

        if (Microdraw.objComment) {
          commentBox = Microdraw.objComment['box']

          let pointMinMax = Microdraw.calcPointMinMax(commentBox.path.segments)
          var newPath = new paper.Path.Rectangle(new paper.Point(pointMinMax.minX, pointMinMax.minY), new paper.Point(pointMinMax.maxX, pointMinMax.maxY));
          newPath.strokeWidth = Microdraw.config.defaultStrokeWidth;

          commentBox.path.segments = newPath.segments
          newPath.remove();
          // Microdraw.objComment.line.path.remove();

          boxStartX = commentBox.path.segments[0].point.x;
          boxStartY = commentBox.path.segments[0].point.y;
          boxEndY = commentBox.path.segments[1].point.y;
        }
        else {
          boxStartX = circleTopPoint.x + circleRightPoint.x - circleTopPoint.x + 20;
          boxStartY = circleTopPoint.y;
          boxEndX = boxStartX + 100;
          boxEndY = circleTopPoint.y + 50;

          var boxStartPoint = new paper.Point(boxStartX, boxStartY)
          var boxEndPoint = new paper.Point(boxEndX, boxEndY)
  
          var path = new paper.Path.Rectangle(boxStartPoint, boxEndPoint);
          path.strokeWidth = Microdraw.config.defaultStrokeWidth;
          commentBox = Microdraw.newCommentBox({ path: path }, 1, '');
          // commentBox.path.type = "COMMENTBOX";
          // commentBox.path.fillColor.alpha = 0.1;
        }


        var lineStartPoint = circleRightPoint;
        var lineEndY = (boxStartY + boxEndY) / 2;
        var lineEndPoint = new paper.Point(boxStartX, lineEndY);

        var path = new paper.Path.Line(lineStartPoint, lineEndPoint);
        // const path = new paper.Path({segments:[point]});
        path.strokeWidth = Microdraw.config.defaultStrokeWidth;
        commentLine = Microdraw.newCommentLine(commentArea, commentBox, { path: path }, 1, true);
        // commentLine = Microdraw.newCommentLine({ path: path }, 1, true);
        // commentLine.path.type = "COMMENTLINE";
        // commentLine.path.fillColor.alpha = 0.1;

        if (Microdraw.objComment) {
          // Microdraw.objComment.area = Microdraw.region;
          // Microdraw.objComment.box.path.remove();
          // Microdraw.objComment.box.path = commentBox.path;
          Microdraw.objComment.line.path.remove();
          Microdraw.objComment.line.path = commentLine.path;
        }
        else {
          Microdraw.ImageInfo[Microdraw.currentImage].Comments.push({uid: `tempCOMMENT${Microdraw.commentSeq}`, name: `Comment${Microdraw.commentSeq}`, area: commentArea, box: commentBox, line: commentLine});
          Microdraw.commentSeq += 1;
        }

        Microdraw.region.path.closed = true;
        Microdraw.region.text.position = Microdraw.region.path.position;

        Microdraw.selectComment(Microdraw.region);

        // to delete all unnecessary segments while preserving the form of the
        // region to make it modifiable; & adding handles to the segments
        var origSegments = Microdraw.region.path.segments.length;

        if (Microdraw.debug) {
          var finalSegments = Microdraw.region.path.segments.length;
          console.log( finalSegments, parseInt(finalSegments/origSegments*100, 10) + "% segments conserved" );
        }
        // Microdraw.initText(Microdraw.region);
        if (Microdraw.region.path.type == "COMMENTAREA") Microdraw.initText(Microdraw.region);
        Microdraw.currentRegions();
        Microdraw.regionCircle = null;
        Microdraw.resizeCommentBox();
        Microdraw.dbCommentSave();
        // Microdraw.regionCircle.path.remove();
        // }

        if (Microdraw.selectedTool == 'drawComment') {
          Microdraw.prevTool = 'select';
          Microdraw.selectedTool = 'select';
          Microdraw.selectTool();
        }


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
