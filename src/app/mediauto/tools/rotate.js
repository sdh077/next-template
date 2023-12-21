/*global Microdraw*/
/*global paper*/

export var ToolRotate = { rotate : (function(){
    var tool = {

        /**
         * @function mouseDrag
         * @param {object} point The point where you moved to (x,y)
         * @param {object} dpoint The movement of the point
         * @return {void}
         */
        mouseDrag : function mouseDrag(point,dpoint) {
            event.stopHandlers = true;

            if (!Microdraw.region.path.fullySelected || Microdraw.region.path.type.includes('COMMENT')) {
                return;
            }

            var movePoint = Math.abs(dpoint.x) + Math.abs(dpoint.y);
            var position = Microdraw.region.path.position

            if ((dpoint.x <= 0 && dpoint.y >= 0) && (point.x < position.x && point.y < position.y) || 
                (dpoint.x >= 0 && dpoint.y >= 0) && (point.x < position.x && point.y > position.y) ||
                (dpoint.x >= 0 && dpoint.y <= 0) && (point.x > position.x && point.y > position.y) ||
                (dpoint.x <= 0 && dpoint.y <= 0) && (point.x > position.x && point.y < position.y)) {
                movePoint = movePoint * -1;
            }

            var degree = parseInt(movePoint, 10) / 2;
            // for( i in Microdraw.ImageInfo[Microdraw.currentImage].Regions ) {
            //     if( Microdraw.ImageInfo[Microdraw.currentImage].Regions[i].path.selected ) {
            //         Microdraw.ImageInfo[Microdraw.currentImage].Regions[i].path.rotate(degree, Microdraw.region.origin);
            //         Microdraw.commitMouseUndo();
            //     }
            // }
            
            if( Microdraw.region !== null ) {
                Microdraw.region.path.rotate(degree, Microdraw.region.origin);

                if (Microdraw.region.path.type == 'MEASUREMENT') {
                    Microdraw.tools['drawMeasurement'].calcMeasurement();
                }
                else {
                    Microdraw.commitMouseUndo();
                }
            }
        },

        /**
         * @function mouseDown
         * @param {object} point The point where you clicked (x,y), will be the centre of rotation
         * @returns {void}
         */
        mouseDown : function mouseDown(point) {
            Microdraw.tools['select'].mouseDown(point);

            var point = {x:Microdraw.region.path.handleBounds.x + (Microdraw.region.path.handleBounds.width / 2), 
                        y:Microdraw.region.path.handleBounds.y + (Microdraw.region.path.handleBounds.height / 2)};
            Microdraw.region.origin = point;
        },

        /**
         * @function click
         * @desc rotate the selected annotation
         * @param {string} prevTool The previous tool to which the selection goes back
         * @returns {void}
         */
        click : function click(prevTool) {
            Microdraw.navEnabled = false;
            Microdraw.handle = null;
        },

        mouseUp: function mouseUp(point,dpoint) {
            // event.stopHandlers = true;

            var reg = Microdraw.region;
            // annotation이 이미지 범위를 넘을경우 값 조정
            // for( var reg of Microdraw.ImageInfo[Microdraw.currentImage].Regions ) {\
            if (reg !== null) {
                if( reg.path.selected ) {
                    for( var seg of reg.path.segments ) {
                        var pointX = seg.point.x;
                        var pointY = seg.point.y;
    
                        if (pointX < 0) {
                            seg.point.x = 0;
                        }
                        if (pointX > Microdraw.projectSize.x) {
                            seg.point.x = Microdraw.projectSize.x;
                        }
                        if (pointY < 0) {
                            seg.point.y = 0;
                        } 
                        if (pointY > Microdraw.projectSize.y) {
                            seg.point.y = Microdraw.projectSize.y;
                        }
                    }
                    reg.text.position = reg.path.position;
                    // Microdraw.commitMouseUndo();
    
                    if (reg.path.type == 'MEASUREMENT') {
                        Microdraw.tools['drawMeasurement'].calcMeasurement();
                        Microdraw.regionCircle.path.remove();
                        paper.view.draw();
                    }
                }
            }
            Microdraw.selectedTool = Microdraw.prevTool;
            // }
        },
    }
    
    return tool;
}())}