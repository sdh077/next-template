/*global Microdraw*/
/*global paper*/


// var ToolSelect = {select: (function() {
//     var tool = {

//         /**
//          * @function mouseDrag
//          * @param {object} point The point where you moved to (x,y)
//          * @param {object} dpoint The movement of the point
//          * @return {void}
//         */
//         mouseDrag: function mouseDrag(point,dpoint) {
//             // event.stopHandlers = true;
//             if (!Microdraw.region?.path.fullySelected && !Microdraw.region?.path.type.includes('COMMENT')) {
//                 return;
//             }

//             var reg = Microdraw.region
//             // for( var reg of Microdraw.ImageInfo[Microdraw.currentImage].Regions ) {
//             if (reg !== null) {
//                 if( reg.path.selected ) {
//                     reg.path.position.x += dpoint.x;
//                     reg.path.position.y += dpoint.y;
//                     reg.text.position.x += dpoint.x;
//                     reg.text.position.y += dpoint.y;
    
//                     if (reg.path.type == 'MEASUREMENT') {
//                         Microdraw.tools['drawMeasurement'].calcMeasurement();
//                     }
//                     else {
//                         Microdraw.commitMouseUndo();
//                     }
//                 }
//             }

//             // }
//         },

//         /**
//          * @function mouseDown
//          * @param {object} point The point where you click (x,y)
//          * @returns {void}
//          */
//         mouseDown: function mouseDown(point) {
//             Microdraw.mouseUndo = Microdraw.getUndo();
//             var prevRegion = null;
//             var hitResult;

//             Microdraw.handle = null;
//             Microdraw.objComment = null;

//             hitResult = paper.project.hitTest(point, {
//                 tolerance: Microdraw.tolerance,
//                 stroke: true,
//                 segments: true,
//                 fill: true,
//                 handles: true
//             });

//             if (hitResult) {
//                 hitResult.item.type == 'COMMENTLINE' ? hitResult = null : hitResult.item.type;
//             }
            

//             var i = 0;
//             var reg;
//             var arrays = [];
//             Microdraw.newRegionFlag === false;
//             if( hitResult ) {
//                 //var i, re;
//                 // for( i = 0; i < Microdraw.ImageInfo[Microdraw.currentImage].Regions.length; i += 1 ) {
//                 //     if (hitResult.item.className == "PointText") {
//                 //         if (Microdraw.ImageInfo[Microdraw.currentImage].Regions[i].name === hitResult.item.name) {
//                 //             reg = Microdraw.ImageInfo[Microdraw.currentImage].Regions[i];
//                 //         }
//                 //     }

//                 //     else {
//                 //         if( Microdraw.ImageInfo[Microdraw.currentImage].Regions[i].path === hitResult.item ) {
//                 //             reg = Microdraw.ImageInfo[Microdraw.currentImage].Regions[i];
//                 //         }
//                 //     }
//                 // }

//                 // 글자 클릭시 className, name으로 비교
//                 if (hitResult.item.className == "PointText") {
//                     if (hitResult.item.name.includes('MEASUREMENT')) {
//                         arrays = Microdraw.ImageInfo[Microdraw.currentImage].Measurements;
//                     }
//                     else if (hitResult.item.name.includes('COMMENT')) {
//                         arrays = Microdraw.ImageInfo[Microdraw.currentImage].Comments;
//                     }
//                     else {
//                         arrays = Microdraw.ImageInfo[Microdraw.currentImage].Regions;
//                     }

//                     for( i = 0; i < arrays.length; i += 1 ) {
//                         if (arrays[i].name === hitResult.item.name) {
//                             reg = arrays[i];
//                         }
//                     }
//                 }

//                 // object 클릭시 item.type, path로 비교
//                 else {
//                     if (hitResult.item.type?.includes('COMMENT')) {
//                         arrays = Microdraw.ImageInfo[Microdraw.currentImage].Comments;

//                         let type;
//                         switch(hitResult.item.type) {
//                             case 'COMMENTAREA' : type = 'area'; break;
//                             case 'COMMENTBOX' : type = 'box'; break;
//                             case 'COMMENTLINE' : type = 'line'; break;
//                         }

//                         for( i = 0; i < arrays.length; i += 1 ) {
//                             if (arrays[i][type].path === hitResult.item) {
//                                 reg = arrays[i][type];
//                                 Microdraw.objComment = arrays[i];
//                             }
//                         }
//                     }

//                     else {
//                         if (hitResult.item.type?.includes('MEASUREMENT')) {
//                             arrays = Microdraw.ImageInfo[Microdraw.currentImage].Measurements;
//                         }
    
//                         else {
//                             arrays = Microdraw.ImageInfo[Microdraw.currentImage].Regions;
//                         }
    
//                         for( i = 0; i < arrays.length; i += 1 ) {
//                             if (arrays[i].path === hitResult.item) {
//                                 reg = arrays[i];
//                             }
//                         }
//                     }

//                 }

//                 // select path
//                 if( Microdraw.region && Microdraw.region != reg ) {
//                     Microdraw.region.path.selected = false;
//                     prevRegion = Microdraw.region;
//                 }

//                 if (reg.path.type?.includes('MEASUREMENT')) {
//                     Microdraw.selectMeasurement(reg);
//                     Microdraw.selectComment(null);
//                     Microdraw.selectRegion(null);
//                 }
//                 else if (reg.path.type?.includes('COMMENT')) {
//                     Microdraw.selectMeasurement(null);
//                     Microdraw.selectComment(reg);
//                     Microdraw.selectRegion(null);
//                 }
//                 else {
//                     Microdraw.selectMeasurement(null);
//                     Microdraw.selectComment(null);
//                     Microdraw.selectRegion(reg);
//                 }
                
//                 Microdraw.currentRegions();

//                 if (!Microdraw.region.path.fullySelected && !Microdraw.region.path.type?.includes('COMMENT')) {
//                     if (Microdraw.latestStatus == 'progressing') {
//                         toast.warning('Accepted object cannot be modified.');
//                     }
//                 }
//                 // $("#labelName").val(re.labelNo).trigger('change');

//                 if( hitResult.type == 'handle-in' ) {
//                     Microdraw.handle = hitResult.segment.handleIn;
//                     Microdraw.handle.point = point;
//                 } else if( hitResult.type == 'handle-out' ) {
//                     Microdraw.handle = hitResult.segment.handleOut;
//                     Microdraw.handle.point = point;
//                 } else if( hitResult.type == 'segment') {
//                     Microdraw.handle = hitResult.segment.point;
//                     Microdraw.handle.point = point;

//                     if (Microdraw.region.path.type == 'COMMENTAREA') {
//                         let segments = Microdraw.region.path.segments

//                         switch (hitResult.segment.point) {
//                             case segments[0].point : {
//                               Microdraw.handleFrom = segments[2];
//                               break;
//                             }
//                             case segments[1].point : {
//                                 Microdraw.handleFrom = segments[3];
//                               break;
//                             }
//                             case segments[2].point : {
//                                 Microdraw.handleFrom = segments[0];
//                               break;
//                             }
//                             case segments[3].point : {
//                                 Microdraw.handleFrom = segments[1];
//                               break;
//                             }
//                           }
//                     }
//                 } else if( hitResult.type == 'bounds') {
//                     // Microdraw.handle = hitResult.item.bounds[hitResult.name];
//                     // snake to camel
//                     var targetBound = hitResult.name.toLowerCase().replace(/[-_][a-z]/g, (group) => group.slice(-1).toUpperCase());
//                     Microdraw.handle = hitResult.item.bounds[targetBound];
//                     Microdraw.handle.point = hitResult.item.bounds[targetBound];
//                 }
//             }

//             if( hitResult == null && Microdraw.region ) {
//                 //deselect paths
//                 Microdraw.region.path.selected = false;
//                 Microdraw.region = null;
//             }

//             Microdraw.objectListPopup();

//             paper.view.draw();

//             return hitResult;
//         },


//         mouseUp: function mouseUp(point,dpoint) {
//             // event.stopHandlers = true;

//             var reg = Microdraw.region
//             // annotation이 이미지 범위를 넘을경우 값 조정
//             // for( var reg of Microdraw.ImageInfo[Microdraw.currentImage].Regions ) {
//             if (reg !== null) {
//                 if (reg.path.type.includes("COMMENT")) {
//                     if (reg.path.type == "COMMENTAREA") {
//                         Microdraw.region = Microdraw.regionCircle;
//                     }
//                     Microdraw.tools['drawComment'].mouseUp();
                        
//                     return;
//                 }


//                 if( reg.path.selected ) {
//                     for( var seg of reg.path.segments ) {
//                         var pointX = seg.point.x;
//                         var pointY = seg.point.y;
    
//                         if (pointX < 0) {
//                             seg.point.x = 0;
//                         }
//                         if (pointX > Microdraw.projectSize.x) {
//                             seg.point.x = Microdraw.projectSize.x;
//                         }
//                         if (pointY < 0) {
//                             seg.point.y = 0;
//                         } 
//                         if (pointY > Microdraw.projectSize.y) {
//                             seg.point.y = Microdraw.projectSize.y;
//                         }
//                     }
    
//                     reg.text.position = reg.path.position;
//                     Microdraw.calcRegArea(reg)
//                     // Microdraw.commitMouseUndo();
    
//                     if (reg.path.type == "MEASUREMENT") {
//                         Microdraw.tools['drawMeasurement'].calcMeasurement();
//                         Microdraw.regionCircle.path.remove();
//                         paper.view.draw();
//                     }
//                 }
//             }

//             Microdraw.selectedTool = Microdraw.prevTool;

//             // }

//             // if (Microdraw.region.path.type == "MEASUREMENT") {
//             //     Microdraw.tools["drawMeasurement"].mouseUp(point);
//             // }


//         },


//         /*
//          * @function click
//          * @desc Convert polygon path to bezier curve
//          * @param {string} prevTool The previous tool to which the selection goes back
//          * @returns {void}
//          */
//         click: function click(prevTool) {
//             Microdraw.navEnabled = false;
//             Microdraw.handle = null;
//             Microdraw.handleFrom = null;
//         }
//     };

//     return tool;
// }())};

export var ToolSelect = {select: (function() {
    var tool = {

        /**
         * @function mouseDrag
         * @param {object} point The point where you moved to (x,y)
         * @param {object} dpoint The movement of the point
         * @return {void}
        */
        mouseDrag: function mouseDrag(point,dpoint) {
            // event.stopHandlers = true;
            if (!Microdraw.region?.path.fullySelected && !Microdraw.region?.path.type.includes('COMMENT')) {
                return;
            }

            var reg = Microdraw.region
            // for( var reg of Microdraw.ImageInfo[Microdraw.currentImage].Regions ) {
            if (reg !== null) {
                if( reg.path.selected ) {
                    reg.path.position.x += dpoint.x;
                    reg.path.position.y += dpoint.y;
                    reg.text.position.x += dpoint.x;
                    reg.text.position.y += dpoint.y;
    
                    if (reg.path.type == 'MEASUREMENT') {
                        Microdraw.tools['drawMeasurement'].calcMeasurement();
                    }
                    else {
                        Microdraw.commitMouseUndo();
                    }
                }
            }

            // }
        },

        /**
         * @function mouseDown
         * @param {object} point The point where you click (x,y)
         * @returns {void}
         */
        mouseDown: function mouseDown(point) {
            Microdraw.mouseUndo = Microdraw.getUndo();
            var prevRegion = null;
            var hitResult;

            Microdraw.handle = null;
            Microdraw.objComment = null;

            hitResult = paper.project.hitTest(point, {
                tolerance: Microdraw.tolerance,
                stroke: true,
                segments: true,
                fill: true,
                handles: true
            });

            if (hitResult) {
                hitResult.item.type == 'COMMENTLINE' ? hitResult = null : hitResult.item.type;
            }
            

            var i = 0;
            var reg;
            var arrays = [];
            Microdraw.newRegionFlag === false;
            if( hitResult ) {
                //var i, re;
                // for( i = 0; i < Microdraw.ImageInfo[Microdraw.currentImage].Regions.length; i += 1 ) {
                //     if (hitResult.item.className == "PointText") {
                //         if (Microdraw.ImageInfo[Microdraw.currentImage].Regions[i].name === hitResult.item.name) {
                //             reg = Microdraw.ImageInfo[Microdraw.currentImage].Regions[i];
                //         }
                //     }

                //     else {
                //         if( Microdraw.ImageInfo[Microdraw.currentImage].Regions[i].path === hitResult.item ) {
                //             reg = Microdraw.ImageInfo[Microdraw.currentImage].Regions[i];
                //         }
                //     }
                // }

                // 글자 클릭시 className, name으로 비교
                if (hitResult.item.className == "PointText") {
                    if (hitResult.item.name.includes('MEASUREMENT')) {
                        arrays = Microdraw.ImageInfo[Microdraw.currentImage].Measurements;
                    }
                    else if (hitResult.item.name.includes('COMMENT')) {
                        arrays = Microdraw.ImageInfo[Microdraw.currentImage].Comments;
                    }
                    else {
                        arrays = Microdraw.ImageInfo[Microdraw.currentImage].Regions;
                    }

                    for( i = 0; i < arrays.length; i += 1 ) {
                        if (arrays[i].name === hitResult.item.name) {
                            reg = arrays[i];
                        }
                    }
                }

                // object 클릭시 item.type, path로 비교
                else {
                    if (hitResult.item.type?.includes('COMMENT')) {
                        arrays = Microdraw.ImageInfo[Microdraw.currentImage].Comments;

                        let type;
                        switch(hitResult.item.type) {
                            case 'COMMENTAREA' : type = 'area'; break;
                            case 'COMMENTBOX' : type = 'box'; break;
                            case 'COMMENTLINE' : type = 'line'; break;
                        }

                        for( i = 0; i < arrays.length; i += 1 ) {
                            if (arrays[i][type].path === hitResult.item) {
                                reg = arrays[i][type];
                                Microdraw.objComment = arrays[i];
                            }
                        }
                    }

                    else {
                        // if (hitResult.item.type?.includes('POINT')) {
                        //     arrays = Microdraw.ImageInfo[Microdraw.currentImage].Regions;

                        //     for( i = 0; i < arrays.length; i += 1 ) {
                        //         if (arrays[i].arrPath) {
                        //             for (let path of arrays[i].arrPath) {
                        //                 if (path === hitResult.item) {
                        //                     reg = arrays[i];
                        //                 }
                        //             }
                        //         }
                        //     }
                        // }
                        // else {
                        //     if (hitResult.item.type?.includes('MEASUREMENT')) {
                        //         arrays = Microdraw.ImageInfo[Microdraw.currentImage].Measurements;
                        //     }
        
                        //     else {
                        //         arrays = Microdraw.ImageInfo[Microdraw.currentImage].Regions;
                        //     }
        
                        //     for( i = 0; i < arrays.length; i += 1 ) {
                        //         if (arrays[i].path === hitResult.item) {
                        //             reg = arrays[i];
                        //         }
                        //     }
                        // }
                        if (hitResult.item.type?.includes('MEASUREMENT')) {
                            arrays = Microdraw.ImageInfo[Microdraw.currentImage].Measurements;
                        }
    
                        else {
                            arrays = Microdraw.ImageInfo[Microdraw.currentImage].Regions;
                        }
    
                        for( i = 0; i < arrays.length; i += 1 ) {
                            if (arrays[i].path === hitResult.item) {
                                reg = arrays[i];
                            }
                        }
                    }

                }

                // select path
                if( Microdraw.region && Microdraw.region != reg ) {
                    Microdraw.region.path.selected = false;
                    prevRegion = Microdraw.region;
                }

                if (reg.path.type?.includes('MEASUREMENT')) {
                    Microdraw.selectMeasurement(reg);
                    Microdraw.selectComment(null);
                    Microdraw.selectRegion(null);
                }
                else if (reg.path.type?.includes('COMMENT')) {
                    Microdraw.selectMeasurement(null);
                    Microdraw.selectComment(reg);
                    Microdraw.selectRegion(null);
                }
                else {
                    Microdraw.selectMeasurement(null);
                    Microdraw.selectComment(null);
                    Microdraw.selectRegion(reg);
                }
                
                Microdraw.currentRegions();

                if (!Microdraw.region.path.fullySelected && !Microdraw.region.path.type?.includes('COMMENT')) {
                    if (Microdraw.latestStatus == 'progressing') {
                        toast.warning('Accepted object cannot be modified.');
                    }
                }
                // $("#labelName").val(re.labelNo).trigger('change');

                if( hitResult.type == 'handle-in' ) {
                    Microdraw.handle = hitResult.segment.handleIn;
                    Microdraw.handle.point = point;
                } else if( hitResult.type == 'handle-out' ) {
                    Microdraw.handle = hitResult.segment.handleOut;
                    Microdraw.handle.point = point;
                } else if( hitResult.type == 'segment') {
                    Microdraw.handle = hitResult.segment.point;
                    Microdraw.handle.point = point;
                    Microdraw.handle.index = hitResult.segment.index;

                    if (Microdraw.region.path.type == 'COMMENTAREA') {
                        let segments = Microdraw.region.path.segments

                        switch (hitResult.segment.point) {
                            case segments[0].point : {
                              Microdraw.handleFrom = segments[2];
                              break;
                            }
                            case segments[1].point : {
                                Microdraw.handleFrom = segments[3];
                              break;
                            }
                            case segments[2].point : {
                                Microdraw.handleFrom = segments[0];
                              break;
                            }
                            case segments[3].point : {
                                Microdraw.handleFrom = segments[1];
                              break;
                            }
                          }
                    }
                } else if( hitResult.type == 'bounds') {
                    // Microdraw.handle = hitResult.item.bounds[hitResult.name];
                    // snake to camel
                    var targetBound = hitResult.name.toLowerCase().replace(/[-_][a-z]/g, (group) => group.slice(-1).toUpperCase());
                    Microdraw.handle = hitResult.item.bounds[targetBound];
                    Microdraw.handle.point = hitResult.item.bounds[targetBound];
                }
            }

            if( hitResult == null && Microdraw.region ) {
                //deselect paths
                Microdraw.region.path.selected = false;
                Microdraw.region = null;
            }

            Microdraw.objectListPopup();

            paper.view.draw();

            return hitResult;
        },


        mouseUp: function mouseUp(point,dpoint) {
            // event.stopHandlers = true;

            var reg = Microdraw.region
            // annotation이 이미지 범위를 넘을경우 값 조정
            // for( var reg of Microdraw.ImageInfo[Microdraw.currentImage].Regions ) {
            if (reg !== null) {
                if (reg.path.type.includes("COMMENT")) {
                    if (reg.path.type == "COMMENTAREA") {
                        Microdraw.region = Microdraw.regionCircle;
                    }
                    Microdraw.tools['drawComment'].mouseUp();
                        
                    return;
                }


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
                    Microdraw.calcRegArea(reg)
                    // Microdraw.commitMouseUndo();
    
                    if (reg.path.type == "MEASUREMENT") {
                        Microdraw.tools['drawMeasurement'].calcMeasurement();
                        Microdraw.regionCircle.path.remove();
                        paper.view.draw();
                    }
                }
            }

            Microdraw.selectedTool = Microdraw.prevTool;

            // }

            // if (Microdraw.region.path.type == "MEASUREMENT") {
            //     Microdraw.tools["drawMeasurement"].mouseUp(point);
            // }


        },


        /*
         * @function click
         * @desc Convert polygon path to bezier curve
         * @param {string} prevTool The previous tool to which the selection goes back
         * @returns {void}
         */
        click: function click(prevTool) {
            Microdraw.navEnabled = false;
            Microdraw.handle = null;
            Microdraw.handleFrom = null;
        }
    };

    return tool;
}())};
