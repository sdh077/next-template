'use client'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { tools } from "./tools/index.js"
import Script from 'next/script.js';

const Home = (props) => {
    let Microdraw;
    const contentRef = useRef(null);

    const fn = function () {
        let popupObjectInit = { top: '192px', left: '24px', width: '320px', height: '496px' };
        var popupMemoInit = { top: '192px', right: '24px', width: '320px', height: '496px' };
        var me = {
            debug: 0,
            objInfo: {
                regions: [],
                measurements: [],
                comments: [],
            },               // regions, and projectID (for the paper.js canvas) for each sections, can be accessed by the section name. (e.g. me.ImageInfo[me.imageOrder[viewer.current_page()]])
            // regions contain a paper.js path, a unique ID and a name
            imageOrder: [],              // names of sections ordered by their openseadragon page numbers
            currentImage: 1,          // name of the current image
            prevImage: null,             // name of the last image
            region: null,                // currently selected region (one element of Regions[])
            regionCircle: null,
            objComment: null,
            prevRegion: null,
            copyRegion: null,            // clone of the currently selected region for copy/paste
            handle: null,                // currently selected control point or handle (if any)
            handleFrom: null,            // currently selected control point or handle (drawComment)
            handleTo: null,              // currently selected control point or handle (drawComment)
            prevTool: null,
            selectedTool: null,          // currently selected tool
            viewer: null,                // open seadragon viewer
            isAnimating: false,          // flag indicating whether there an animation going on (zoom, pan)
            navEnabled: true,            // flag indicating whether the navigator is enabled (if it's not, the annotation tools are)
            magicV: 1000,                // resolution of the annotation canvas - is changed automatically to reflect the size of the tileSource
            params: null,                // URL parameters
            source: null,                // data source
            section: null,               // section index in a multi-section dataset
            UndoStack: [],
            RedoStack: [],
            mouseUndo: null,             // tentative undo information.
            shortCuts: [],               // List of shortcuts
            newRegionFlag: null,         // true when a region is being drawn
            drawingPolygonFlag: false,   // true when drawing a polygon
            drawingPointFlag: false,       // true when drawing a Point
            annotationLoadingFlag: null, // true when an annotation is being loaded
            config: {
                "useDatabase": true,
                "hideToolbar": false,
                "regionOntology": true,
                "drawingEnabled": true,
                "removeTools": [],
                "multiImageSave": true,
                defaultStrokeColor: 'black',
                defaultStrokeWidth: 1,
                defaultFillAlpha: 0.1
            },                  // App configuration object
            tolerance: 10,
            counter: 1,
            tap: false,
            currentColorRegion: null,
            tools: {},
            imageSize: [],
            projectSize: [],
            key: '',
            annoSeq: 1,
            msrSeq: 1,
            commentSeq: 1,
            labelInfo: {
                point: [], line: [], bbox: [], seg: []
            },
            labelUnknown: '',
            labelSelected: {
                point: '', line: '', bbox: '', seg: ''
            },
            statusInfo: {},
            isLocked: false,
            isSaved: true,
            latestWork: '',
            latestStatus: '',
            initPopupFlag: true,
            umPerImagePixelX: 0,
            umPerProjectPixelX: 1,
            settingCookie: 'codipai_annotation',
            initSetting: {
                opacity: 0.1, strokeWidth: 1, handleSize: 10
                , 'popup-object': popupObjectInit
                , 'popup-memo': popupMemoInit
            },
            tempCanvas: null,
            canvasOrigin: null,
            canvasZoom: null,
            canvasTemp: null,
            isPressed: false,
            handleSize: null,
            viewportWebPixel: {},
            imageType: 'jpeg',
            jpegFilePath: '',
            color: {
                commentArea: 'rgba(0,0,0,0.1)',
                commentBox: 'rgba(230,230,230,1)'
            },

            /*
              Region handling functions
            */

            /**
             * @function debugPrint
             * @param {string} msg Message to print to console.
             * @param {int} level Minimum debug level to print.
             * @returns {void}
             */
            debugPrint: function (msg, level) {
                if (me.debug >= level) {
                    console.log(msg);
                }
            },

            /**
             * @function selectRegion
             * @desc Make the region selected
             * @param {object} reg The region to select, or null to deselect allr egions
             * @returns {void}
             */
            selectRegion: function (reg) {
                if (me.debug) { console.log("> selectRegion"); }

                var i;
                let fullySelected;

                // Select path
                for (i = 0; i < me.objInfo.regions.length; i += 1) {
                    if (me.objInfo.regions[i] === reg) {
                        if (Microdraw.latestWork == "Annotation" && Microdraw.latestStatus == 'progressing') {
                            fullySelected = true;
                        }
                        else if (Microdraw.latestWork == "Review") {
                            if (reg.review_yn == "Y") {
                                fullySelected = false;
                            }
                            else {
                                fullySelected = true;
                            }
                        }

                        else if (Microdraw.latestWork == "Termination") {
                            if (reg.termination_yn == "Y") {
                                fullySelected = false;
                            }
                            else {
                                fullySelected = true;
                            }
                        }

                        else {
                            fullySelected = false;
                        }

                        reg.path.fullySelected = fullySelected;
                        reg.path.selected = true;

                        me.region = reg;
                    } else {
                        let region = me.objInfo.regions[i];
                        region.path.selected = false;
                        region.path.fullySelected = false;
                    }
                }
                paper.view.draw();

                // Select region name in list
                [].forEach.call(me.dom.querySelectorAll("#popup-object .object"), function (r) {
                    r.classList.remove("selected");
                });

                if (reg) {
                    var tag = me.dom.querySelector(`#popup-object li.${name} .object`);

                    if (tag) {
                        tag.classList.add("selected");
                    }
                }

                if (me.debug) { console.log("< selectRegion"); }
            },

            /**
             * @function selectMeasurement
             * @desc Make the region selected
             * @param {object} reg The region to select, or null to deselect allr egions
             * @returns {void}
             */
            selectMeasurement: function (reg) {
                if (me.debug) { console.log("> selectMeasurement"); }

                var i;

                // Select path
                for (i = 0; i < me.objInfo.measurements.length; i += 1) {
                    if (me.objInfo.measurements[i] === reg) {
                        reg.path.fullySelected = true;
                        reg.path.selected = true;
                        me.region = reg;
                    } else {
                        me.objInfo.measurements[i].path.selected = false;
                        me.objInfo.measurements[i].path.fullySelected = false;
                    }
                }
                paper.view.draw();

                if (me.debug) { console.log("< selectMeasurement"); }
            },

            /**
             * @function selectComment
             * @desc Make the region selected
             * @param {object} reg The region to select, or null to deselect allr egions
             * @returns {void}
             */
            selectComment: function (reg) {
                if (me.debug) { console.log("> selectMeasurement"); }

                var i;

                let type;
                switch (reg?.path.type) {
                    case 'COMMENTAREA': type = 'area'; break;
                    case 'COMMENTBOX': type = 'box'; break;
                    case 'COMMENTLINE': type = 'line'; return;
                }

                // Select path
                for (i = 0; i < me.objInfo.comments.length; i += 1) {
                    if (me.objInfo.comments[i][type] === reg) {
                        reg.path.fullySelected = true;
                        reg.path.selected = true;
                        me.region = reg;
                        me.objComment = me.objInfo.comments[i];
                    } else {
                        me.objInfo.comments[i]['area'].path.selected = false;
                        me.objInfo.comments[i]['area'].path.fullySelected = false;
                        me.objInfo.comments[i]['box'].path.selected = false;
                        me.objInfo.comments[i]['box'].path.fullySelected = false;
                        me.objInfo.comments[i]['line'].path.selected = false;
                        me.objInfo.comments[i]['line'].path.fullySelected = false;
                    }
                }

                if (type === 'area') {
                    for (let seg of Microdraw.region.path.segments) {
                        seg.handleIn.selected = false;
                        seg.handleOut.selected = false;
                    }

                    Microdraw.regionCircle = Microdraw.region;
                }

                paper.view.draw();

                if (me.debug) { console.log("< selectMeasurement"); }
            },

            /**
             * @function newRegion
             * @desc  Create a new region.
             * @param {object} arg An object containing the name, uid and path of the region
             * @param {number} imageNumber The number of the image section where the region will be created
             * @returns {object} A new region
             */
            newRegion: function (arg, imageNumber, isDrawing) {
                if (me.debug) {
                    console.log("> newRegion");
                }
                var reg = {};

                if (arg.uid) {
                    reg.annoSeq = arg.annoSeq;
                }
                else {
                    reg.annoSeq = me.annoSeq;
                }

                if (arg.uid) {
                    reg.uid = arg.uid;
                } else {
                    reg.uid = 'temp' + me.annoSeq;
                }

                if (arg.name) {
                    reg.name = arg.name;
                } else {
                    reg.name = "Object" + me.annoSeq;
                }

                if (arg.path) {
                    reg.path = arg.path;
                    reg.path.strokeWidth = 1;
                    reg.path.strokeColor = 'rgba(' + (arg.hex ? me.hexToRgb(arg.hex) : '0, 0, 80') + ',' + 1 + ')';
                    reg.path.strokeScaling = false;
                    reg.path.selected = false;

                    if (reg.path.type == 'POINT') {
                        reg.path.dashArray = [5, 5];
                        reg.path.fillColor = 'rgba(' + (arg.hex ? me.hexToRgb(arg.hex) : '0, 0, 80') + ',' + 0 + ')';
                    }

                    else {
                        reg.path.fillColor = 'rgba(' + (arg.hex ? me.hexToRgb(arg.hex) : '0, 0, 80') + ',' + 0 + ')';
                    }
                }

                if (isDrawing) {
                    me.newText(reg, 0, reg.path.visible)
                }
                else {
                    var size = 10 / Microdraw.viewer.viewport.getZoom();
                    if (size > 12) {
                        size = 13;
                    }
                    me.newText(reg, size, reg.path.visible)
                }

                reg.labelNo = arg.labelNo ? arg.labelNo : ''
                reg.labelName = arg.labelName
                reg.hex = arg.hex ? arg.hex : ''
                reg.review_yn = arg.review_yn ? arg.review_yn : 'N'
                reg.termination_yn = arg.termination_yn ? arg.termination_yn : 'N'
                reg.del_yn = arg.del_yn ? arg.del_yn : 'N'

                if (reg.del_yn == "Y") {
                    reg.path.visible = false;
                    reg.path.selected = false;
                    reg.text.visible = false;
                }

                // push the new region to the Regions array
                me.objInfo['regions'].push(reg);

                // Select region name in list
                // me.selectRegion(reg);

                if (reg.path.type == 'SEG') {
                    if (reg.path.segments.length < 3) {
                        Microdraw.removeRegion(reg);
                        toast.warning("Polygons with less than 2 points have been deleted.");
                        Microdraw.UndoStack.pop(Microdraw.UndoStack.length - 1)
                        paper.view.draw();
                    }
                }

                if (arg.uid != 'regionTemp') {
                    me.annoSeq += 1;
                }

                return reg;
            },


            /**
             * @function newRegion
             * @desc  Create a new region.
             * @param {object} arg An object containing the name, uid and path of the region
             * @param {number} imageNumber The number of the image section where the region will be created
             * @returns {object} A new region
             */
            newPoint: function (point, hex) {
                const path = new paper.Path.Circle({
                    type: 'POINT',
                    center: point,
                    radius: Microdraw.handleSize / 2,
                    fillColor: `rgba(${me.hexToRgb(hex)}, 1)`,
                    strokeColor: `rgba(${me.hexToRgb(hex)}, 1)`
                });

                path.sendToBack();

                // path.selected = true;
                // path.fullySelected = true;

                // for (let seg of path.segments) {
                //     seg.handleIn.selected = false;
                //     seg.handleOut.selected = false;
                // }

                if (!Microdraw.region.arrPath) {
                    Microdraw.region.arrPath = [];
                }
                Microdraw.region.arrPath.push(path)
            },


            /**
             * @function newMeasurement
             * @desc  Create a new measurement.
             * @param {object} arg An object containing the name, uid and path of the region
             * @param {number} imageNumber The number of the image section where the region will be created
             * @returns {object} A new region
             */
            newMeasurement: function (arg) {
                if (me.debug) {
                    console.log("> newRegion");
                }
                var reg = {};


                if (arg.uid) {
                    reg.msrSeq = 'MEASUREMENT' + arg.msrSeq;
                }
                else {
                    reg.msrSeq = 'MEASUREMENT' + me.msrSeq;
                }

                if (arg.uid) {
                    reg.uid = arg.uid;
                } else {
                    reg.uid = 'MEASUREMENT' + me.msrSeq;
                }

                if (arg.name) {
                    reg.name = arg.name;
                } else {
                    reg.name = "MEASUREMENT" + me.msrSeq;
                }

                if (arg.path) {
                    reg.path = arg.path;
                    reg.path.strokeWidth = Microdraw.dom.querySelector('#strokeDiv .slider').slider('value');
                    reg.path.strokeColor = 'rgba(' + (arg.hex ? me.hexToRgb(arg.hex) : '0, 0, 80') + ',' + 1 + ')';
                    reg.path.strokeScaling = false;
                    reg.path.fillColor = 'rgba(' + (arg.hex ? me.hexToRgb(arg.hex) : '0, 0, 80') + ',' + 0.1 + ')';
                    reg.path.selected = false;
                }

                if (typeof imageNumber === "undefined") {
                    imageNumber = me.currentImage;
                }

                // if (isDrawing) {
                //     me.newText(reg, 0, reg.path.visible)
                // }
                // else {
                //     var size = 10 / Microdraw.viewer.viewport.getZoom();
                //     if (size > 12) {
                //         size = 13;
                //     }
                //     me.newText(reg, size, reg.path.visible, arg.text)
                // }

                var size = 10 / Microdraw.viewer.viewport.getZoom();
                if (size > 12) {
                    size = 13;
                }
                me.newText(reg, size, reg.path.visible, arg.text)

                reg.labelNo = arg.labelNo ? arg.labelNo : ''
                reg.labelName = arg.labelName
                reg.hex = arg.hex ? arg.hex : ''
                // reg.review_yn = arg.review_yn? arg.review_yn : 'N'
                // reg.termination_yn = arg.termination_yn? arg.termination_yn : 'N'
                // reg.del_yn = arg.del_yn? arg.del_yn : 'N'

                me.calcRegArea(reg)

                if (reg.del_yn == "Y") {
                    reg.path.visible = false;
                    reg.path.selected = false;
                    reg.text.visible = false;
                }

                // push the new region to the Regions array
                me.objInfo.measurements.push(reg);

                // Select region name in list
                me.selectRegion(null);
                // me.selectMeasurement(reg);

                me.msrSeq += 1;
                paper.view.draw();
                return reg;
            },

            /**
             * @function newRegion
             * @desc  Create a new region.
             * @param {object} arg An object containing the name, uid and path of the region
             * @param {number} imageNumber The number of the image section where the region will be created
             * @returns {object} A new region
             */
            newCircle: function (arg, imageNumber, isDrawing) {
                if (me.debug) {
                    console.log("> newRegion");
                }
                var reg = {};

                if (me.regionCircle !== null) {
                    reg = me.regionCircle;
                }

                if (arg.path.uid) {
                    reg.uid = arg.path.uid;
                }
                else {
                    reg.uid = 'circle';
                }


                if (arg.path) {
                    reg.path?.remove();
                    reg.path = arg.path;
                    reg.path.dashArray = [5, 5];
                    reg.path.strokeWidth = arg.path.strokeWidth ? arg.path.strokeWidth : me.config.defaultStrokeWidth;
                    reg.path.strokeColor = 'rgba(' + (arg.hex ? me.hexToRgb(arg.hex) : '0, 0, 80') + ',' + 1 + ')';
                    reg.path.strokeScaling = false;
                    reg.path.fillColor = arg.path.fillColor ? arg.path.fillColor : 'rgba(' + (arg.hex ? me.hexToRgb(arg.hex) : '0, 0, 0') + ',' + 0 + ')';
                    reg.path.selected = false;
                    reg.path.fullSelected = false;
                }

                // push the new region to the Regions array
                //me.ImageInfo[imageNumber].Regions.push(reg);

                // Select region name in list
                //me.selectRegion(reg);

                paper.view.draw();

                return reg;
            },

            /**
             * @function newMeasurement
             * @desc  Create a new measurement.
             * @param {object} arg An object containing the name, uid and path of the region
             * @param {number} imageNumber The number of the image section where the region will be created
             * @returns {object} A new region
             */
            newCommentArea: function (arg) {
                if (me.debug) {
                    console.log("> newRegion");
                }
                var reg = {};

                if (arg.uid) {
                    reg.commentSeq = 'COMMENTAREA' + arg.commentSeq;
                }
                else {
                    reg.commentSeq = 'COMMENTAREA' + me.commentSeq;
                }

                if (arg.uid) {
                    reg.uid = arg.uid;
                } else {
                    reg.uid = 'tempCOMMENTAREA' + me.commentSeq;
                }

                if (arg.name) {
                    reg.name = arg.name;
                } else {
                    reg.name = "Comment" + me.commentSeq;
                }

                if (arg.path) {
                    reg.path?.remove();
                    reg.path = arg.path;
                    reg.path.strokeWidth = Microdraw.dom.querySelector('#strokeDiv .slider').slider('value');
                    reg.path.strokeColor = 'rgba(' + (arg.hex ? me.hexToRgb(arg.hex) : '0, 0, 80') + ',' + 1 + ')';
                    reg.path.strokeScaling = false;
                    // reg.path.fillColor = 'rgba(' + (arg.hex? me.hexToRgb( arg.hex) : '0, 0, 80') + ',' + 0.1+ ')';
                    reg.path.fillColor = Microdraw.color.commentArea
                    reg.path.selected = false;
                }

                if (typeof imageNumber === "undefined") {
                    imageNumber = me.currentImage;
                }

                var size = 10 / Microdraw.viewer.viewport.getZoom();
                if (size > 12) {
                    size = 13;
                }
                me.newText(reg, size, reg.path.visible, arg.text)

                reg.labelNo = arg.labelNo ? arg.labelNo : ''
                reg.labelName = arg.labelName
                reg.hex = arg.hex ? arg.hex : ''

                // me.calcRegArea(reg)

                if (reg.del_yn == "Y") {
                    reg.path.visible = false;
                    reg.path.selected = false;
                    reg.text.visible = false;
                }

                // Select region name in list
                me.selectRegion(null);
                me.selectMeasurement(null);

                paper.view.draw();
                return reg;
            },

            /**
             * @function newRegion
             * @desc  Create a new region.
             * @param {object} arg An object containing the name, uid and path of the region
             * @param {number} imageNumber The number of the image section where the region will be created
             * @returns {object} A new region
             */
            newCommentBox: function (arg, imageNumber, contents) {
                if (me.debug) {
                    console.log("> newRegion");
                }
                var reg = {};

                if (arg.uid) {
                    reg.commentSeq = 'COMMENTBOX' + arg.commentSeq;
                }
                else {
                    reg.commentSeq = 'COMMENTBOX' + me.commentSeq;
                }

                if (arg.uid) {
                    reg.uid = arg.uid;
                } else {
                    reg.uid = 'tempCOMMENTBOX' + me.commentSeq;
                }

                if (arg.name) {
                    reg.name = arg.name;
                } else {
                    reg.name = "Comment" + me.commentSeq;
                }

                if (arg.path) {
                    reg.path = arg.path;
                    reg.path.dashArray = [5, 5];
                    reg.path.strokeWidth = Microdraw.dom.querySelector('#strokeDiv .slider').slider('value');
                    reg.path.strokeColor = 'rgba(' + (arg.hex ? me.hexToRgb(arg.hex) : '0, 0, 80') + ',' + 1 + ')';
                    reg.path.strokeScaling = false;
                    reg.path.fillColor = Microdraw.color.commentBox;
                    reg.path.selected = false;
                    reg.path.type = "COMMENTBOX";
                }

                if (typeof imageNumber === "undefined") {
                    imageNumber = me.currentImage;
                }

                me.newText(reg, 0, reg.path.visible)

                contents = contents ? contents : '';

                // if (isDrawing) {
                //     me.newText(reg, 0, reg.path.visible)
                // }
                // else {
                //     var size = 10 / Microdraw.viewer.viewport.getZoom();
                //     if (size > 12) {
                //         size = 13;
                //     }
                //     me.newText(reg, size, reg.path.visible)
                // }

                reg.hex = arg.hex ? arg.hex : ''
                reg.del_yn = arg.del_yn ? arg.del_yn : 'N'

                if (reg.del_yn == "Y") {
                    reg.path.visible = false;
                    reg.path.selected = false;
                    reg.text.visible = false;
                }


                if (!Microdraw.dom.querySelector(`#div${reg.name}`).length) {
                    let leftTopProjectPixel = reg.path.segments[1].point
                    let leftTopWebPixel = paper.view.projectToView(new OpenSeadragon.Point(leftTopProjectPixel.x, leftTopProjectPixel.y));

                    let rightBottomProjectPixel = reg.path.segments[3].point
                    let rightBottomWebPixel = paper.view.projectToView(new OpenSeadragon.Point(rightBottomProjectPixel.x, rightBottomProjectPixel.y));

                    var textarea = $(`<div class='comment-wrapper' id='div${reg.name}' name='${reg.name}'` +
                        `style='position:absolute; background-color: rgba(240,240,240,1); cursor: default; left: ${leftTopWebPixel.x}px; top: ${leftTopWebPixel.y}px; white-space: pre;` +
                        `width: ${rightBottomWebPixel.x - leftTopWebPixel.x}px; height: ${rightBottomWebPixel.y - leftTopWebPixel.y}px; z-index: 3' />` +
                        `<div onblur="Microdraw.dbCommentSave()" contenteditable='true' style='width: 100%; height: 100%; padding: 4px; overflow-y: scroll;'>${contents.replace(/\n/g, '<br>')}` +
                        "</div></div>");

                    // var textarea = $(`<textarea class='comment-wrapper' id='div${reg.name}'` + 
                    // `style='position:absolute; background-color: #e7ffcb; left: ${leftTopWebPixel.x}px; top: ${leftTopWebPixel.y}px;` + 
                    // `width: ${rightBottomWebPixel.x - leftTopWebPixel.x}px; height: ${rightBottomWebPixel.y - leftTopWebPixel.y}px; z-index: 10'>` + 
                    // `${reg.text.content}`+
                    // "</textarea>");

                    Microdraw.dom.querySelector('.openseadragon-container').append(textarea);

                    // $($('#content')[0].shadowRoot.querySelector(`#div${reg.name}`)).draggable({
                    //     disabled: true
                    // });

                    Microdraw.dom.querySelector(`#div${reg.name}`).draggable({
                        // handle: '.drag-btn',
                        // containment: "parent"
                    })
                    // }).resizable({minWidth: 200, minHeight:100, handles: 'all', containment: "parent"  });

                    Microdraw.dom.querySelector(`#div${reg.name}`).on('click', function (e) {
                        // $(this).draggable({disabled: false})
                        // me.tools['select'].mouseDown(paper.view.viewToProject(new paper.Point(e.currentTarget.offsetLeft, e.currentTarget.offsetTop)))

                        for (let div of Microdraw.dom.querySelectorAll('.comment-wrapper')) {
                            $(div).css('z-index', 3);
                        }
                        $(this).css('z-index', '9');
                        me.tools['select'].mouseDown(paper.view.viewToProject(new paper.Point(e.clientX - $('#main-lnb').width(), e.clientY - $('.topMenuArea').height())))
                        Microdraw.objComment?.box.path.bringToFront()
                    })

                    Microdraw.dom.querySelector(`#div${reg.name}`).on('dblclick', function () {
                        $(this).draggable({ disabled: true })
                        $(this).find('div').focus();
                        $(this).css('background-color', '#e7ffcb');
                        $(this).css('cursor', 'text');
                    })

                    var start = null, delta = null
                    Microdraw.dom.querySelector(`#div${reg.name}`).on('dragstart', function (e) {
                        start = { x: e.clientX, y: e.clientY }
                        // me.tools['select'].mouseDown(paper.view.viewToProject(new paper.Point(e.currentTarget.offsetLeft, e.currentTarget.offsetTop)))
                        me.tools['select'].mouseDown(paper.view.viewToProject(new paper.Point(e.clientX - $('#main-lnb').width(), e.clientY - $('.topMenuArea').height())))
                        me.handle = null;
                    })

                    Microdraw.dom.querySelector(`#div${reg.name}`).on('drag', function (e) {
                        delta = { x: e.clientX - start.x, y: e.clientY - start.y }
                        me.mouseDrag(e.originalEvent.offsetX, e.originalEvent.offsetY, delta.x, delta.y);
                        start = { x: start.x + delta.x, y: start.y + delta.y }
                    })

                    Microdraw.dom.querySelector(`#div${reg.name}`).on('dragstop', function (e) {
                        me.tools['drawComment'].mouseUp()
                    })
                }

                return reg;
            },

            /**
             * @function newRegion
             * @desc  Create a new region.
             * @param {object} arg An object containing the name, uid and path of the region
             * @param {number} imageNumber The number of the image section where the region will be created
             * @returns {object} A new region
             */
            newCommentLine: function (commentArea, commentBox, arg, imageNumber, isDrawing) {
                if (me.debug) {
                    console.log("> newRegion");
                }
                var reg = {};

                if (arg.uid) {
                    reg.commentSeq = 'COMMENTLINE' + arg.commentSeq;
                }
                else {
                    reg.commentSeq = 'COMMENTLINE' + me.commentSeq;
                }

                if (arg.uid) {
                    reg.uid = arg.uid;
                } else {
                    reg.uid = 'tempCOMMENTLINE' + me.commentSeq;
                }

                if (arg.name) {
                    reg.name = arg.name;
                } else {
                    reg.name = "Comment" + me.commentSeq;
                }

                let segmentsArea = commentArea.path.segments;
                let segmentsBox = commentBox.path.segments;

                let minPointArea = segmentsArea[0].point;
                let minPointBox = segmentsBox[0].point;
                let minValue = Math.abs(minPointArea.x - minPointBox.x) + Math.abs(minPointArea.y - minPointBox.y)

                let tempPointArea;
                let tempPointBox;
                let tempValue;

                for (let indexArea in segmentsArea) {
                    tempPointArea = segmentsArea[indexArea].point;
                    for (let indexBox in segmentsBox) {
                        tempPointBox = segmentsBox[indexBox].point;
                        tempValue = Math.abs(tempPointArea.x - tempPointBox.x) + Math.abs(tempPointArea.y - tempPointBox.y);

                        if (tempValue < minValue) {
                            minValue = tempValue;
                            minPointArea = tempPointArea;
                            minPointBox = tempPointBox;
                        }
                    }
                }

                let newPath = new paper.Path.Line(minPointArea, minPointBox);
                arg.path.segments = newPath.segments;
                newPath.remove();

                if (arg.path) {
                    reg.path = arg.path;
                    reg.path.dashArray = [5, 5];
                    reg.path.strokeWidth = Microdraw.dom.querySelector('#strokeDiv .slider').slider('value');
                    reg.path.strokeColor = 'rgba(' + (arg.hex ? me.hexToRgb(arg.hex) : '0, 0, 80') + ',' + 1 + ')';
                    reg.path.strokeScaling = false;
                    reg.path.fillColor = 'rgba(' + (arg.hex ? me.hexToRgb(arg.hex) : '0, 0, 80') + ',' + Microdraw.dom.querySelector('#opacityDiv .slider').slider('value') + ')';
                    reg.path.selected = false;
                    reg.path.type = "COMMENTLINE";
                    reg.path.fillColor.alpha = 0.1;
                    reg.path.sendToBack();
                }

                if (typeof imageNumber === "undefined") {
                    imageNumber = me.currentImage;
                }

                reg.hex = arg.hex ? arg.hex : ''
                reg.del_yn = arg.del_yn ? arg.del_yn : 'N'

                if (reg.del_yn == "Y") {
                    reg.path.visible = false;
                    reg.path.selected = false;
                    reg.text.visible = false;
                }

                return reg;
            },

            hexToRgb: function (hex) {
                var bigint = parseInt(hex, 16);
                var r = (bigint >> 16) & 255;
                var g = (bigint >> 8) & 255;
                var b = bigint & 255;

                return r + "," + g + "," + b;
            },

            /**
             * @function newText
             * @desc  Create a new text.
             * @param {object} arg An object containing the name, uid and path of the region
             * @param {number} imageNumber The number of the image section where the region will be created
             * @returns {void} A new region
             */
            newText: function (reg, fontSize, visible, text) {
                reg.text = new paper.PointText({
                    name: reg.name,
                    content: text ? text : reg.name,
                    justification: 'left'
                });

                reg.text.visible = visible;
                // reg.text.position = reg.path.position;
                reg.text.setFontSize(fontSize);
                //   reg.text.rotate(Number(Microdraw.viewer.viewport.degrees) * -1)
                reg.text.sendToBack();
            },

            /**
             * @function initText
             * @desc  Create a new text.
             * @param {object} arg An object containing the name, uid and path of the region
             * @param {number} imageNumber The number of the image section where the region will be created
             * @returns {void} A new region
             */
            initText: function (reg) {
                var size = 10 / me.viewer.viewport.getZoom();
                if (size > 12) {
                    me.region.text.setFontSize(13);
                }
                else {
                    me.region.text.setFontSize(size);
                }

                // Microdraw.region.text.setFontSize(Microdraw.ImageInfo[1].Regions.length > 0? Microdraw.ImageInfo[1].Regions[0].text.fontSize : 20);
                // reg.text.position = reg.path.position;
            },


            /**
             * Remove region from current image. The image not directly removed, but marked for removal,
             * so that it can be removed from the database.
             * @param {object} reg The region to be removed
             * @param {number} imageNumber The number of the image where the region will be removed
             * @returns {void}
             */
            removeRegion: function (reg, imageNumber) {
                if (me.debug) { console.log("> removeRegion"); }

                // remove from Regions array
                me.objInfo.regions.splice(me.objInfo.regions.indexOf(reg), 1);
                // remove from paths
                reg.path.remove();
                reg.text.remove();
            },

            removeMeasurement: function (reg, imageNumber) {
                if (me.debug) { console.log("> removeRegion"); }

                // remove from Regions array
                me.objInfo.measurements.splice(me.objInfo.measurements.indexOf(reg), 1);
                // remove from paths
                reg.path.remove();
                reg.text.remove();
            },

            removeComment: function (imageNumber) {
                if (me.debug) { console.log("> removeRegion"); }

                // 텍스트 편집중일 경우 삭제되지 않도록 수정
                if ($(Microdraw.dom.querySelector(`#div${me.objComment.name} div`)).is(':focus')) {
                    return;
                }

                axios.delete(web_url + `/api/annotation/comments/${me.objComment.uid}`).then((result) => {
                    // remove from Regions array
                    me.objInfo.comments.splice(me.objInfo.comments.indexOf(me.objComment), 1);
                    // remove from paths
                    me.objComment.area.path.remove();
                    me.objComment.area.text.remove();
                    me.objComment.line.path.remove();
                    me.objComment.box.path.remove();
                    me.objComment.box.text.remove();

                    Microdraw.dom.querySelector(`#div${me.objComment.name}`).remove();
                    Microdraw.objComment = null;

                    paper.view.draw();
                })
            },

            /**
             * @function clickHandler
             * @desc Interaction: mouse and tap: If on a computer, it will send click event; if on tablet, it will send touch event.
             * @param {object} event Event
             * @returns {void}
             */
            clickHandler: function (event) {
                if (me.debug) { console.log("> clickHandler"); }
                event.stopHandlers = !me.navEnabled;
            },

            /**
             * @function dblClickHandler
             * @desc Interaction: mouse and tap: If on a computer, it will send click event; if on tablet, it will send touch event.
             * @param {object} event Event
             * @returns {void}
             */
            dblClickHandler: function (event) {
                if (me.debug) { console.log("> dblClickHandler"); }
                event.stopHandlers = !me.navEnabled;
            },

            /**
             * @function pressHandler
             * @param {object} event Event
             * @returns {void}
             */
            pressHandler: function (event) {
                if (me.debug) { console.log("> pressHandler"); }

                // popup.focus();

                me.isPressed = true;

                if (me.dom.querySelector("#labelDiv").style.visibility == 'visible') {
                    me.dom.querySelector("#labelDiv").style.visibility = 'hidden';
                }

                if (me.dom.querySelector("#changeLabelDiv").style.visibility == 'visible') {
                    me.dom.querySelector("#changeLabelDiv").style.visibility = 'hidden';
                }

                if (me.dom.querySelector("#popup-info").style.visibility == 'visible') {
                    me.dom.querySelector("#popup-info").style.visibility = 'hidden';
                }

                if (me.dom.querySelector('.comment-wrapper')) {
                    let arrDiv = me.dom.querySelectorAll('.comment-wrapper');
                    let commentId
                    for (let div of arrDiv) {
                        commentId = me.dom.querySelector('.comment-wrapper').id;

                        $(div).draggable({
                            disabled: false
                        }).css('background-color', 'rgba(240,240,240,1)').css('cursor', 'default');

                        for (let reg of me.objInfo.comments) {
                            if (`div${reg.box.name}` == commentId) {
                                reg.box.text.setContent(Microdraw.dom.querySelector(`#div${reg.box.name} div`).innerText);
                                // reg.box.text.setContent(Microdraw.dom.querySelector(`#div${reg.box.name}`).value);
                                // Microdraw.dom.querySelector('.comment-wrapper').remove();
                                break;
                            }
                        }
                    }

                    me.dom.querySelector('.openseadragon-canvas').focus()
                }

                if (me.key == 'ctrl' || me.selectedTool == "move") {
                    me.navEnabled = true;
                }
                else {
                    var point = paper.view.viewToProject(new paper.Point(event.position.x, event.position.y));
                    me.navEnabled = false;
                    // hitResult = paper.project.hitTest(point, {
                    //     tolerance: me.tolerance,
                    //     stroke: true,
                    //     segments: true,
                    //     fill: true,
                    //     handles: true
                    // });

                    // if (me.key == 'r') {
                    //     me.prevTool = me.selectedTool;
                    //     me.selectedTool = 'rotate'
                    //     me.navEnabled = false;
                    // }
                    // else if (me.key == 'space') {
                    //     me.prevTool = me.selectedTool;
                    //     me.selectedTool = 'region'
                    //     me.navEnabled = false;
                    // }
                    // else if (me.key == 's') {
                    //     me.prevTool = me.selectedTool;
                    //     me.selectedTool = 'select'
                    //     me.navEnabled = false;
                    // }

                    // if( hitResult == null && me.drawingPolygonFlag == false && Microdraw.drawingPointFlag == false && Microdraw.selectedTool.indexOf("region") == -1) {
                    //     if (me.region) {
                    //          me.region.path.selected = false;
                    //          me.region = null;

                    //         paper.view.draw();
                    //         Microdraw.objectListPopup();
                    //     }
                    //     if (Microdraw.objComment) {
                    //         Microdraw.selectComment(null);
                    //         Microdraw.objComment = null;

                    //         paper.view.draw();
                    //     }

                    //     if (Microdraw.selectedTool.indexOf("draw") == -1) {
                    //         if (Microdraw.key != '') {
                    //             me.navEnabled = false;
                    //         }
                    //         else {
                    //             me.navEnabled = true;
                    //         }
                    //     }
                    //     else {
                    //         me.navEnabled = false;
                    //     }
                    // }
                    // else {
                    //     me.navEnabled = false;
                    // }
                }

                if (!me.navEnabled) {
                    event.stopHandlers = true;
                    me.mouseDown(event.originalEvent.layerX, event.originalEvent.layerY);
                }
            },

            /**
             * @function releaseHandler
             * @param {object} event Event
             * @returns {void}
             */
            releaseHandler: function (event) {
                if (me.debug) { console.log("> releaseHandler"); }

                me.isPressed = false;

                if (!me.navEnabled) {
                    event.stopHandlers = true;
                    me.mouseUp(event);
                }
            },

            /**
             * @function dragHandler
             * @param {object} event Event
             * @returns {void}
             */
            dragHandler: function (event) {
                if (me.debug > 1) { console.log("> dragHandler"); }

                if (me.isLocked && me.selectedTool == 'select') {
                    if (!Microdraw.region?.path.type.includes('COMMENT')) {
                        return;
                    }
                }

                if (me.isLocked && (me.selectedTool != 'select' && me.selectedTool != 'drawMeasurement' && me.selectedTool != 'drawComment')) {
                    return;
                }

                if (!me.navEnabled) {
                    event.stopHandlers = true;
                    me.mouseDrag(event.originalEvent.layerX, event.originalEvent.layerY, event.delta.x, event.delta.y, event);
                }
            },

            /**
             * @function dragHandler
             * @param {object} event Event
             * @returns {void}
             */
            moveHandler: function (event) {
                if (me.debug > 1) { console.log("> dragHandler"); }

                let viewportPoint = Microdraw.viewer.viewport.pointFromPixel(event.position);
                let imagePoint = Microdraw.viewer.viewport.viewportToImageCoordinates(viewportPoint.x, viewportPoint.y);



                // me.canvasZoom.putImageData(me.canvasOrigin.getImageData(event.position.x-50,event.position.y-50,event.position.x+50,event.position.y+50), 0,0)

                // 미반영 - 돋보기
                // if (!me.isPressed) {
                //     if (imagePoint.x > 0 && imagePoint.y > 0 && (imagePoint.x < me.imageSize.x) && (imagePoint.y < me.imageSize.y) ) {
                //         me.canvasZoom.save();

                //         // me.canvasTemp.clearRect(0,0,200,200);
                //         me.canvasTemp.putImageData(me.canvasOrigin.getImageData(
                //             event.position.x-50,
                //             event.position.y-50,
                //             event.position.x+50,
                //             event.position.y+50
                //         ), 0,0)


                //         // var pt = me.canvasZoom.transformedPoint(event.position.x,event.position.y);
                //         // me.canvasZoom.translate(event.position.x,event.position.y);
                //         // var factor = Math.pow(scaleFactor,clicks);
                //         me.canvasZoom.scale(3,3);

                //         me.canvasZoom.drawImage($($('#content')[0].shadowRoot.querySelector('#test2'))[0], 0, 0);


                //         me.canvasZoom.restore();
                //     }
                // }



                me.dom.querySelector("#pointX").innerText = imagePoint.x.toFixed(0);
                me.dom.querySelector("#pointY").innerText = imagePoint.y.toFixed(0);
            },

            /**
             * @function dragEndHandler
             * @param {object} event Event
             * @returns {void}
             */
            dragEndHandler: function (event) {
                if (me.debug > 1) { console.log("> dragEndHandler"); }

                if (!me.navEnabled) {
                    event.stopHandlers = true;
                    me.mouseUp();
                }
            },


            /**
             * @function scrollHandler
             * @param {object} ev Scroll event
             * @returns {void}
             */
            scrollHandler: function (ev) {
                if (me.debug > 1) { console.log("> scrollHandler") }

                if (me.tools[me.selectedTool]
                    && me.tools[me.selectedTool].scrollHandler) {
                    me.tools[me.selectedTool].scrollHandler(ev);
                }
                paper.view.draw();
            },

            /**
             * @function mouseDown
             * @param {number} x X-coordinate for mouse down
             * @param {number} y Y-coordinate for mouse down
             * @returns {void}
             */
            mouseDown: function (x, y) {
                me.debugPrint("> mouseDown", 1);

                //   me.mouseUndo = me.getUndo();
                var point = paper.view.viewToProject(new paper.Point(x, y));

                me.handle = null;

                if (me.selectedTool == 'region' && !me.isLocked) {
                    if (!Microdraw.region) return false;
                    if (Microdraw.region.path.type == 'LINE' || Microdraw.region.path.type == 'BBOX' || Microdraw.region.path.type == 'MEASUREMENT') return false;
                    if (Microdraw.region.arrPath) return false;

                    //accept 상태
                    if (!Microdraw.region.path.fullySelected) {
                        toast.warning('Accepted object cannot be deleted.');
                        return false;
                    }
                    let hitResult = Microdraw.region.path.hitTest(point, {
                        tolerance: 0,
                        stroke: false,
                        segments: true,
                        fill: true,
                        handles: true
                    });

                    if (Microdraw.region.path == hitResult?.item) {
                        me.selectedTool = 'regionAdd'
                    }
                    else {
                        me.selectedTool = 'regionSub'
                    }
                }

                // console.log(ToolDrawLine)


                // ToolDrawLine.mouseDown(point)
                if (me.tools[me.selectedTool]
                    && me.tools[me.selectedTool].mouseDown) {
                    if (Microdraw.key != 'r') {
                        me.tools[me.selectedTool].mouseDown(point);
                    }
                }
                // hitResult = paper.project.hitTest(point, {
                //     tolerance: Microdraw.tolerance,
                //     stroke: true,
                //     segments: true,
                //     fill: true,
                //     handles: true
                // });

                // if (hitResult == null) {
                //     me.tools[me.selectedTool].mouseDown(point);
                // }
                // else {
                //     if (hitResult.type == 'segment' || hitResult.type == 'fill') {
                //         me.selectedTool = 'select'
                //         me.tools[me.selectedTool].mouseDown(point);
                //     }
                // }

                paper.view.draw();
            },

            /**
             * @function mouseDrag
             * @param {number} x X-coordinate where drag event started
             * @param {number} y Y-coordinate where drag event started
             * @param {number} dx Size of the drag step in the X axis
             * @param {number} dy Size of the drag step in the Y axis
             * @returns {void}
             */
            mouseDrag: function (x, y, dx, dy, event) {
                //if( me.debug ) console.log("> mouseDrag");

                // transform screen coordinate into world coordinate
                var point = paper.view.viewToProject(new paper.Point(x, y));

                // transform screen delta into world delta
                var orig = paper.view.viewToProject(new paper.Point(0, 0));
                var dpoint = paper.view.viewToProject(new paper.Point(dx, dy));
                dpoint.x -= orig.x;
                dpoint.y -= orig.y;
                // 점 클릭시
                if (me.handle) {
                    if (!Microdraw.region.path.fullySelected && !Microdraw.region.path.type.includes('COMMENT')) {
                        return;
                    }

                    if (Microdraw.region.path.type == "BBOX") {
                        // if (Microdraw.region.path.type != null) {
                        me.tools["drawBbox"].mouseDrag(point, dpoint);
                        me.chkSaved(false);
                        me.commitMouseUndo();
                    }
                    else {
                        if (!Microdraw.region.path.type.includes("COMMENT")) {
                            if (point.x < 0 || point.x > Microdraw.projectSize.x ||
                                point.y < 0 || point.y > Microdraw.projectSize.y) {
                                return;
                            }
                        }

                        if (Microdraw.region.path.type == "MEASUREMENT") {
                            me.handle.x += point.x - me.handle.point.x;
                            me.handle.y += point.y - me.handle.point.y;
                            me.handle.point = point;
                            me.tools["drawMeasurement"].mouseDrag(point, dpoint);
                        }
                        else if (Microdraw.region.path.type.includes("COMMENT")) {
                            if (Microdraw.region.path.type != 'COMMENTBOX') {
                                me.handle.x += point.x - me.handle.point.x;
                                me.handle.y += point.y - me.handle.point.y;
                                me.handle.point = point;
                            }

                            me.tools["drawComment"].mouseDrag(point, dpoint);
                        }
                        else {
                            me.handle.x += point.x - me.handle.point.x;
                            me.handle.y += point.y - me.handle.point.y;
                            me.handle.point = point;

                            if (Microdraw.region.path.type == 'POINT' && Microdraw.region.arrPath) {
                                Microdraw.region.arrPath[me.handle.index].position.x = me.handle.x;
                                Microdraw.region.arrPath[me.handle.index].position.y = me.handle.y;
                            }

                            me.chkSaved(false);
                            me.commitMouseUndo();
                        }
                    }

                } else if (me.tools[me.selectedTool]) {
                    if (Microdraw.key == 'r' || me.selectedTool == "rotate") {
                        if (Microdraw.region != null && Microdraw.region.path.type != "BBOX") {
                            dpoint.x *= Microdraw.viewer.viewport.getZoom();
                            dpoint.y *= Microdraw.viewer.viewport.getZoom();
                            me.tools["rotate"].mouseDrag(point, dpoint);
                            me.chkSaved(false);
                        }
                    }

                    else if (me.tools[me.selectedTool].mouseDrag) {
                        me.tools[me.selectedTool].mouseDrag(point, dpoint);
                        if (me.selectedTool != "drawMeasurement" && Microdraw.region?.path.type != 'MEASUREMENT') {
                            me.chkSaved(false);
                        }
                    }


                }
                paper.view.draw();
            },

            /**
             * @function mouseUp
             * @returns {void}
             */
            mouseUp: function (event) {
                if (me.debug) {
                    console.log("> mouseUp");
                }
                if (me.tools[me.selectedTool] && me.tools[me.selectedTool].mouseUp) {
                    var point = paper.view.viewToProject(new paper.Point(event.originalEvent.layerX, event.originalEvent.layerY));
                    me.tools[me.selectedTool].mouseUp(point);
                }
            },

            resizeFontSize: function () {
                let reg;
                let size = 10 / Microdraw.viewer.viewport.getZoom();
                for (var regCnt = 0; regCnt < Microdraw.objInfo.regions.length; regCnt++) {
                    reg = Microdraw.objInfo.regions[regCnt];

                    if (size > 13) {
                        reg.text.setFontSize(13)
                    }
                    else if (size < 0) {
                        reg.text.setFontSize(1)
                    }
                    else {
                        reg.text.setFontSize(10 / Microdraw.viewer.viewport.getZoom())
                    }

                    reg.text.position = reg.path.position;
                }

                for (var regCnt = 0; regCnt < Microdraw.objInfo.measurements.length; regCnt++) {
                    reg = Microdraw.objInfo.measurements[regCnt];

                    if (size > 13) {
                        reg.text.setFontSize(13)
                    }
                    else if (size < 0) {
                        reg.text.setFontSize(1)
                    }
                    else {
                        reg.text.setFontSize(10 / Microdraw.viewer.viewport.getZoom())
                    }

                    reg.text.position = reg.path.position;
                }

                for (var regCnt = 0; regCnt < Microdraw.objInfo.comments.length; regCnt++) {
                    reg = Microdraw.objInfo.comments[regCnt];

                    var area = reg.area;
                    var box = reg.box;

                    if (size > 13) {
                        area.text.setFontSize(13)
                    }
                    else if (size < 0) {
                        area.text.setFontSize(1)
                    }
                    else {
                        area.text.setFontSize(10 / Microdraw.viewer.viewport.getZoom())
                    }

                    area.text.position = area.path.position;

                    box.text.setFontSize(0)

                    // box.text.position = box.path.segments[1].point;
                    // box.text.position = box.path.position;
                }
            },

            resizeCommentBox: function () {
                const rotationTargetPoint = {
                    0: { leftTop: 1, rightBottom: 3 },
                    90: { leftTop: 0, rightBottom: 2 },
                    180: { leftTop: 3, rightBottom: 1 },
                    270: { leftTop: 2, rightBottom: 0 },
                }

                let rotation = Math.round(paper.view._matrix.rotation) + 360;
                rotation = rotation >= 360 ? rotation - 360 : rotation;

                let arrComments = Microdraw.objInfo.comments;
                for (let obj of arrComments) {
                    let textBox = obj.box;
                    if (Microdraw.dom.querySelector(`#div${textBox.name}`)) {
                        let leftTopProjectPixel = textBox.path.segments[rotationTargetPoint[rotation]['leftTop']].point
                        let leftTopWebPixel = paper.view.projectToView(new OpenSeadragon.Point(leftTopProjectPixel.x, leftTopProjectPixel.y));

                        let rightBottomProjectPixel = textBox.path.segments[rotationTargetPoint[rotation]['rightBottom']].point
                        let rightBottomWebPixel = paper.view.projectToView(new OpenSeadragon.Point(rightBottomProjectPixel.x, rightBottomProjectPixel.y));

                        Microdraw.dom.querySelector(`#div${textBox.name}`).style.left = `${leftTopWebPixel.x + 1}px`
                        Microdraw.dom.querySelector(`#div${textBox.name}`).style.top = `${leftTopWebPixel.y + 1}px`
                        Microdraw.dom.querySelector(`#div${textBox.name}`).style.width = `${rightBottomWebPixel.x - leftTopWebPixel.x - 2}px`
                        Microdraw.dom.querySelector(`#div${textBox.name}`).style.height = `${rightBottomWebPixel.y - leftTopWebPixel.y - 2}px`
                    }
                }

            },

            /**
             * @function cmdUndo
             * @desc Command to actually perform an undo.
             * @returns {void}
             */
            cmdUndo: function () {
                if (Microdraw.isLocked) {
                    return;
                }
                if (me.UndoStack.length > 0) {
                    var redoInfo = me.getUndo();
                    var undoInfo = me.UndoStack.pop();
                    me.applyUndo(undoInfo);
                    me.RedoStack.push(redoInfo);
                    paper.view.draw();
                    Microdraw.currentRegions();
                }
            },

            /**
             * @function cmdRedo
             * @desc Command to actually perform a redo.
             * @returns {void}
             */
            cmdRedo: function () {
                if (Microdraw.isLocked) {
                    return;
                }
                if (me.RedoStack.length > 0) {
                    var undoInfo = me.getUndo();
                    var redoInfo = me.RedoStack.pop();
                    me.applyUndo(redoInfo);
                    me.UndoStack.push(undoInfo);
                    paper.view.draw();
                    Microdraw.currentRegions();
                }
            },

            /**
             * @function getUndo
             * @desc Return a complete copy of the current state as an undo object.
             * @returns {Object} The undo object
             */
            getUndo: function () {
                var undo = { regions: [], drawingPolygonFlag: me.drawingPolygonFlag };
                var info = me.objInfo.regions.filter(item => item.uid != 'regionTemp');
                var i;

                for (i = 0; i < info.length; i += 1) {
                    var el = {
                        json: JSON.parse(info[i].path.exportJSON()),
                        name: info[i].name,
                        annoSeq: info[i].annoSeq,
                        uid: info[i].uid,
                        labelNo: info[i].labelNo,
                        labelName: info[i].labelName,
                        hex: info[i].hex,
                        review_yn: info[i].review_yn,
                        termination_yn: info[i].termination_yn,
                        del_yn: info[i].del_yn,
                        type: info[i].path.type,
                        selected: info[i].path.selected,
                        fullySelected: info[i].path.fullySelected
                    };
                    undo.regions.push(el);
                }

                return undo;
            },

            /**
             * @function saveUndo
             * @desc Save an undo object. This has the side-effect of initializing the redo stack.
             * @param {object} undoInfo The undo info object
             * @returns {void}
             */
            saveUndo: function (undoInfo) {
                me.UndoStack.push(undoInfo);
                me.RedoStack = [];
            },

            /**
             * @function applyUndo
             * @desc Restore the current state from an undo object.
             * @param {object} undo The undo object to apply
             * @returns {void}
             */
            applyUndo: function (undo) {
                if (Microdraw.isLocked) {
                    return;
                }

                var info = me.objInfo.regions;
                var i;
                while (info.length > 0) {
                    me.removeRegion(info[0]);
                }
                me.region = null;
                var reg;

                me.annoSeq = 1;

                for (i = 0; i < undo.regions.length; i += 1) {
                    var el = undo.regions[i];
                    var project = paper.projects[0];

                    /* Create the path and add it to a specific project.
                    */

                    var path = new paper.Path();
                    project.addChild(path);

                    /*
                     * @todo This is a workaround for an issue on paper.js. It needs to be removed when the issue will be solved
                     */
                    var { insert } = path.insert;
                    path.importJSON(el.json);
                    path.insert = insert;

                    reg = me.newRegion({
                        name: el.name,
                        annoSeq: el.annoSeq,
                        uid: el.uid,
                        path: path,
                        hex: el.hex,
                        del_yn: el.del_yn,
                    }, undo.imageNumber);
                    // here order matters. if fully selected is set after selected, partially selected paths will be incorrect
                    reg.path.fullySelected = el.fullySelected;
                    reg.path.selected = el.selected;
                    reg.path.type = el.type;
                    reg.path.insert = (new paper.Path()).insert;
                    reg.name = el.name;
                    reg.labelNo = el.labelNo;
                    reg.labelName = el.labelName;
                    reg.hex = el.hex;
                    reg.review_yn = el.review_yn;
                    reg.termination_yn = el.termination_yn;
                    reg.del_yn = el.del_yn;

                    if (me.dom.querySelector('#labelChk' + el.labelNo)) {
                        if (me.dom.querySelector('#labelChk' + el.labelNo).checked && reg.del_yn == 'N') {
                            reg.path.visible = true;
                            reg.text.visible = true;
                        }
                        else {
                            reg.path.visible = false;
                            reg.text.visible = false;
                        }
                    }

                    if (el.selected) {
                        if (me.region === null) {
                            me.region = reg;
                        } else {
                            if (me.debug) {
                                console.log("Should not happen: two regions selected?");
                            }
                        }
                    }
                }

                if (undo.callback && typeof undo.callback === 'function') {
                    undo.callback();
                }

                me.chkSaved(false);

                /**
                 * @todo This line produces an error when the undo object is undefined. However, the code seems to work fine without this line. Check what the line was supposed to do
                 */
                // me.drawingPolygonFlag = me.undo.drawingPolygonFlag;
            },

            /**
             * @function commitMouseUndo
             * @desc If we have actually made a change with a mouse operation, commit the undo information.
             * @returns {void}
             */
            commitMouseUndo: function () {
                if (me.mouseUndo !== null) {
                    me.saveUndo(me.mouseUndo);
                    me.mouseUndo = null;
                }
                Microdraw.chkSaved(false);
            },

            /**
             * @function backToPreviousTool
             * @param {string} prevTool Name of the previously selected tool
             * @returns {void}
             */
            backToPreviousTool: function (prevTool) {
                // setTimeout(function() {
                //     if (!me.dom.querySelector("#" + prevTool).classList.contains("noBorder")) {
                //         me.selectedTool = prevTool;
                //     }
                //     // me.selectTool();
                // }, 500);
                if (!me.dom.querySelector("#" + prevTool).classList.contains("noBorder")) {
                    me.selectedTool = prevTool;
                    me.initCursor();
                    me.updateCursor();
                }
            },

            /**
             * @function backToSelect
             * @returns {void}
             */
            backToSelect: function () {
                setTimeout(function () {
                    me.selectedTool = "select";
                    // me.selectTool();
                }, 500);
            },

            /**
             * @function cmdDeleteSelected
             * @desc This function deletes the currently selected object.
             * @returns {void}
             */
            cmdDeleteSelected: function () {
                var undoInfo = me.getUndo();
                var i;

                if (me.objComment) {
                    me.removeComment();
                }

                if (Microdraw.isLocked || _auth_level == "UO") {
                    return;
                }

                for (i in me.objInfo.measurements) {
                    if (me.objInfo.measurements[i].path.selected) {
                        me.removeMeasurement(me.objInfo.measurements[i])
                        return;
                    }
                }

                for (i in me.objInfo.regions) {
                    if (me.objInfo.regions[i].path.selected) {
                        if (!me.objInfo.regions[i].path.fullySelected) {
                            toast.warning('Accepted object cannot be deleted.');
                            return;
                        }
                        if (me.objInfo.regions[i].uid.toString().includes('temp')) {
                            me.removeRegion(me.objInfo.regions[i])
                        }
                        else {
                            me.objInfo.regions[i].del_yn = "Y";
                            me.objInfo.regions[i].path.visible = false;
                            me.objInfo.regions[i].path.selected = false;
                            me.objInfo.regions[i].text.visible = false;
                        }

                        me.saveUndo(undoInfo);

                        Microdraw.currentRegions();

                        me.chkSaved(false);
                        return;
                    }
                }


            },

            /**
             * @function cmdPaste
             * @returns {void}
             */
            cmdPaste: function () {
                if (Microdraw.isLocked) {
                    return;
                }

                if (me.copyRegion !== null) {
                    if (me.copyRegion.type == 'MEASUREMENT') {
                        return;
                    }

                    var undoInfo = me.getUndo();
                    me.saveUndo(undoInfo);

                    me.copyRegion.name = "Object" + me.annoSeq;

                    var reg = JSON.parse(JSON.stringify(me.copyRegion));
                    reg.path = new paper.Path();

                    /**
                     * @todo Workaround for paperjs. remove when the issue will be solver
                     */
                    var { insert } = reg.path.insert;
                    reg.path.importJSON(me.copyRegion.path);
                    reg.path.insert = insert;
                    reg.path.type = me.copyRegion.type;

                    reg.path.fullySelected = true;

                    me.newRegion({
                        name: me.copyRegion.name,
                        labelNo: me.copyRegion.labelNo,
                        labelName: me.copyRegion.labelName,
                        hex: me.copyRegion.hex,
                        annoSeq: me.annoSeq,
                        uid: 'temp' + me.annoSeq,
                        path: reg.path
                    });
                }
                paper.view.draw();
            },

            /**
             * @function cmdCopy
             * @returns {void}
             */
            cmdCopy: function () {
                if (me.region !== null && !me.region.path.type.includes('COMMENT')) {
                    var json = me.region.path.exportJSON();
                    me.copyRegion = JSON.parse(JSON.stringify(me.region));
                    me.copyRegion.path = json;
                    me.copyRegion.type = me.region.path.type;
                }
            },

            /**
              * @function selectTool
              * @returns {void}
              */
            selectTool: function () {
                if (me.debug) { console.log("> selectTool"); }


                //   me.dom.querySelector("img.button1").classList.remove("selected");
                //   me.dom.querySelector("img.button1#" + me.selectedTool).classList.add("selected");
                me.dom.querySelector("#menuBar .selected").classList.remove("selected");
                me.dom.querySelector("#menuBar #" + me.selectedTool).classList.add("selected");
                me.initCursor();
                me.updateCursor();
            },

            clickTool: function (tool) {
                var prevTool = me.selectedTool;

                if (me.tools[prevTool] && me.tools[prevTool].onDeselect) {
                    me.tools[prevTool].onDeselect();
                }

                if (!me.dom.querySelector("#" + tool).classList.contains("noBorder")) {
                    me.initToolSelection();
                    me.dom.querySelector("#" + tool).classList.add("selected");
                    me.prevTool = tool;
                }


                me.selectedTool = tool;
                me.initCursor();
                me.updateCursor();

                if (me.selectedTool != "popupInfo") {
                    Microdraw.dom.querySelector("#popup-info").style.visibility = 'hidden';
                }

                Microdraw.dom.querySelector("#changeLabelDiv").style.visibility = 'hidden';

                if (me.selectedTool == "drawPoint" || me.selectedTool == "drawLine" || me.selectedTool == "drawBbox" || me.selectedTool == "drawSeg") {
                    me.listUpLabelByCoordinateKindCd(me.selectedTool.replace('draw', ''), '#labelDiv')

                    me.dom.querySelector("#labelDiv").style.visibility = 'visible';
                    // if (me.dom.querySelector("#labelDiv").style.visibility == 'visible') {
                    //     me.dom.querySelector("#labelDiv").style.visibility = 'hidden';
                    // }
                    // else {
                    //     me.dom.querySelector("#labelDiv").style.visibility = 'visible';
                    // }
                }
                else {
                    if (me.dom.querySelector("#labelDiv").style.visibility == 'visible') {
                        me.dom.querySelector("#labelDiv").style.visibility = 'hidden';
                    }
                }

                if (tool != 'region') {
                    ToolDrawLine.click(prevTool)
                    // me.tools[me.selectedTool].click(prevTool);
                }
            },

            /**
             * @function toolSelection
             * @returns {void}
             */
            toolSelection: function () {
                if (me.debug) {
                    console.log("> toolSelection");
                }

                if (this.parentElement.className.includes('locked') && !this.className.includes('no-lock') && me.isLocked) {
                    return;
                }

                const tool = this.id;
                me.clickTool(tool);
            },

            /**
             * @function statusSelection
             * @returns {void}
             * 헤더에서 start, progressing 클릭시 동작
             * start -> 로그인 유저 아이디 DB 업데이트
             * ongoin -> objectListPopup 노출
             */
            statusSelection: function () {
                if (me.debug) {
                    console.log("> statusSelection");
                }

                if (_auth_level == "UO") {
                    customAlert('You do not have permission to perform this operation.')
                    return;
                }

                let work = this.parentElement.getAttribute('work');
                let status = this.className;

                if (status == "start") {
                    if (work == "Review") {
                        //annotation 작업자 동일인이 review 불가                    
                        if (me.statusInfo.annotation_ssid == _ssid) {
                            customAlert('You can not review your annotation result.')
                            return;
                        }
                    }
                    if (work == "Termination") {
                        //Clinical Info가 입력되지 않은 경우 termination 불가
                        if (Microdraw.statusInfo.info_yn == "N") {
                            customAlert('Clinical Info has not been entered.')
                            return;
                        }
                        else {
                            //annotation 작업자 동일인이 termination 불가                    
                            if (me.statusInfo.annotation_ssid == _ssid) {
                                customAlert('You can not termination your annotation result.')
                                return;
                            }
                        }
                    }

                    me.statusUpdate(work, status);
                    this.className = "progressing";
                    // 진행 상태시 lock 해제
                    me.dom.querySelector("#buttonsBlock .btnArea2").classList.remove('locked');
                    me.dom.querySelector("#buttonsBlock .btnArea2").classList.remove('locked');
                    me.dom.querySelector("#buttonsBlock .btnArea3").classList.remove('locked');

                    me.isLocked = false;

                    if (Microdraw.region !== null) {
                        Microdraw.region.path.fullySelected = true;
                    }
                }

                else if (status == "progressing") {
                    if (!me.isLocked || _auth_level == 'SM' || _auth_level == 'GM' || _auth_level == 'OM') {
                        //Clinical Info가 입력되지 않은 경우 termination 불가
                        if (work == "Termination" && Microdraw.statusInfo.info_yn == "N") {
                            customAlert('Clinical Info has not been entered.')
                            return;
                        }

                        me.objectListPopup()
                    }
                }

                else if (status == "complete") {
                    if (work == "Annotation") {
                        if (me.statusInfo.review_ssid !== null || me.statusInfo.review_utc_dtm !== null
                            || me.statusInfo.termination_ssid !== null || me.statusInfo.termination_utc_dtm !== null) {
                            return;
                        }
                    }
                    else if (work == "Review") {
                        if (me.statusInfo.termination_ssid !== null || me.statusInfo.termination_utc_dtm !== null) {
                            return;
                        }
                    }

                    me.objectListPopup()
                }
            },

            /**
             * @function statusSelection
             * @returns {void}
             * 헤더에서 start, objectListPopup에서 complete 클릭시 상태값 업데이트
             */
            statusUpdate: function (work, status) {
                if (me.debug) {
                    console.log("> statusSelection");
                }

                var param = {
                    slide_id: Microdraw.slide_id,
                    work: work,
                    status: status
                }

                if (_auth_level != "UO") {
                    axios.post(web_url + `/api/annotation/status-input`, param)
                        .then((data) => {
                            toast.success(work + " " + status + " change success!");
                            me.chkSaved(true);
                            if (work == "Annotation") {
                                me.statusInfo.annotation_ssid = _ssid;
                            }
                            else if (work == "Review") {
                                me.statusInfo.review_ssid = _ssid;
                            }
                            else if (work == "Termination") {
                                me.statusInfo.termination_ssid = _ssid;
                            }

                            if (_auth_level != "UO" && status == "start") {
                                me.currentRegions();
                            }
                            me.dbStatusLoad();
                        })
                        .catch(error => {
                            toast.error(work + " " + status + " change failed!");
                        });
                }
            },

            // 헤더에서 start, progressing 버튼 클릭시 나오는 팝업
            objectListPopup: function () {
                let element_li = document.createElement('li');
                let element_div_objectArea;
                let element_div_labelArea;
                let element_div_label;
                let element_div_change;
                let element_div;
                let element_div_viewarea2;
                let element_div_accept;
                let element_div_save_area;
                let element_div_save;
                let element_div_complete;
                let element_div_reset;
                let element_div_cancel;
                let element_div_flex;
                let element_span;
                let reg;
                let ownFlag = false;
                let adminFlag = false;
                let status;

                //관리자 플래그 > reset, role cancel 버튼 구분
                if (_auth_level == 'SM' || _auth_level == 'GM' || _auth_level == 'OM') {
                    adminFlag = true;
                }

                //내 작업 구분 accept, label change, save, complete, reset, role cancel
                if (Microdraw.latestWork == "Annotation") {
                    if (_ssid == me.statusInfo.annotation_ssid) {
                        ownFlag = true;
                    }
                }

                else if (Microdraw.latestWork == "Review") {
                    if (_ssid == me.statusInfo.review_ssid) {
                        ownFlag = true;
                    }
                }

                else if (Microdraw.latestWork == "Termination") {
                    if (_ssid == me.statusInfo.termination_ssid) {
                        ownFlag = true;
                    }
                }

                // 관리자가 아니며 내 작업이 아니거나 뷰어 권한만 있을때 리스트만 출력
                if (!adminFlag && (!ownFlag || _auth_level == "UO")) {
                    Microdraw.latestWork = "Object List";
                    Microdraw.latestStatus = "";
                }

                // 매번 내용 전부 지우고 다시 그려줌
                me.dom.querySelector("#popup-object .titleText").innerText = Microdraw.latestWork;

                me.dom.querySelectorAll("#popup-object .viewArea ul li").forEach(
                    e => e.remove()
                );

                me.dom.querySelectorAll("#popup-object .viewArea2 div").forEach(
                    e => e.remove()
                );

                if (!me.initSetting['popup-object']) {
                    if (me.initSetting['reviewArea']) {
                        setSettingCookie({ 'popup-object': me.initSetting['reviewArea'] });
                        me.initSetting['popup-object'] = me.initSetting['reviewArea'];
                    }
                    else {
                        setSettingCookie({ 'popup-object': popupObjectInit });
                        me.initSetting['popup-object'] = popupObjectInit;
                    }
                }

                me.dom.querySelector("#popup-object").style.visibility = 'visible';
                me.dom.querySelector("#popup-object").style.left = me.initSetting['popup-object']['left'];
                me.dom.querySelector("#popup-object").style.top = me.initSetting['popup-object']['top'];
                me.dom.querySelector("#popup-object").style.width = me.initSetting['popup-object']['width'];
                me.dom.querySelector("#popup-object").style.height = me.initSetting['popup-object']['height'];

                // 목록 그리기
                for (var regCnt = 0; regCnt < me.objInfo.regions.length; regCnt++) {
                    reg = me.objInfo.regions[regCnt];

                    if (reg.del_yn == "N" && reg.path.type != 'MEASUREMENT') {
                        element_li = document.createElement('li');
                        element_li.className = 'clear ' + reg.name;
                        element_li.id = reg.name;

                        element_div = document.createElement('div');
                        element_div.className = 'flex ai-center object';
                        if (reg.path.selected) {
                            element_div.classList.add('selected');
                        }

                        element_span = document.createElement('span');
                        element_span.style.backgroundColor = 'rgb(' + me.hexToRgb(reg.hex) + ')';

                        element_div.append(element_span);
                        element_div.innerHTML = element_div.innerHTML + reg.name;

                        // object명 클릭시 select 하기
                        element_div.addEventListener("click", function () {
                            if (me.tools[Microdraw.selectedTool] && me.tools[Microdraw.selectedTool].onDeselect) {
                                me.tools[Microdraw.selectedTool].onDeselect();
                            }

                            me.dom.querySelectorAll("#popup-object .viewArea ul li div.object").forEach(
                                e => e.classList.remove('selected')
                            );

                            this.classList.add('selected');

                            let reg;
                            for (var regCnt = 0; regCnt < me.objInfo.regions.length; regCnt++) {
                                reg = me.objInfo.regions[regCnt];

                                if (reg.name == this.innerText) {
                                    Microdraw.selectRegion(reg);
                                    // reg.path.fullySelected = true;

                                    Microdraw.viewer.viewport.centerSpringX.target.value = reg.path.position.x / 1000;
                                    Microdraw.viewer.viewport.centerSpringY.target.value = reg.path.position.y / 1000;
                                }
                                else {
                                    reg.path.fullySelected = false;
                                }
                            }

                            Microdraw.selectMeasurement(null);
                            Microdraw.selectComment(null);

                            paper.view.draw();
                        });

                        element_div_objectArea = document.createElement('li');
                        element_div_objectArea.className = "flex sb"
                        element_div_objectArea.style.height = '24px';
                        element_div_objectArea.style.marginBottom = "4px"
                        element_div_objectArea.append(element_div);

                        // 작업 상태에 따라 accept 버튼 그리기
                        if ((Microdraw.latestWork == "Review" || Microdraw.latestWork == "Termination") && ownFlag && Microdraw.latestStatus != 'complete') {
                            element_div_accept = document.createElement('div');
                            if (Microdraw.latestWork == "Review") {
                                if (reg.review_yn == 'Y') {
                                    element_div_accept.className = 'acceptOff';
                                }
                                else {
                                    element_div_accept.className = 'acceptOn';
                                }
                            }
                            else if (Microdraw.latestWork == "Termination") {
                                if (reg.termination_yn == 'Y') {
                                    element_div_accept.className = 'acceptOff';
                                }
                                else {
                                    element_div_accept.className = 'acceptOn';
                                }
                            }
                            element_div_accept.innerText = 'Accept';

                            // accept 버튼 클릭이벤트, 신규 object는 insert 해줌
                            element_div_accept.addEventListener("click", function () {
                                if (this.className.includes('acceptOff')) {
                                    return;
                                }

                                if (!me.validateIntersect()) {
                                    return false;
                                }

                                if (me.tools[Microdraw.selectedTool] && me.tools[Microdraw.selectedTool].onDeselect) {
                                    me.tools[Microdraw.selectedTool].onDeselect();
                                }

                                let element_btnChange = this.parentElement.parentElement.querySelector(".btnChange");

                                let reg;
                                for (var regCnt = 0; regCnt < me.objInfo.regions.length; regCnt++) {
                                    reg = me.objInfo.regions[regCnt];

                                    if (reg.labelName.toUpperCase() == "UNKNOWN") {
                                        customAlert('Change UNKNOWN label name before accept.')
                                        return;
                                    }

                                    if (reg.name == this.previousSibling.innerText) {
                                        var coordinate_info = me.coordinateInfo(reg);
                                        var param = {};
                                        var values = [];
                                        let label_id = reg.labelNo;
                                        if (label_id == "") {
                                            label_id = null;
                                        }
                                        values.push({
                                            annotation_id: reg.uid,
                                            label_id: label_id,
                                            coordinate_kind_cd: reg.path.type,
                                            coordinate_info: coordinate_info,
                                            review_yn: 'N',
                                            termination_yn: 'N',
                                            del_yn: 'N',
                                        })

                                        if (me.dom.querySelector("#popup-object .titleText").innerText == "Review") {
                                            values[0].review_yn = 'Y'
                                            reg.review_yn = 'Y'
                                        }

                                        if (me.dom.querySelector("#popup-object .titleText").innerText == "Termination") {
                                            values[0].termination_yn = 'Y'
                                            reg.termination_yn = 'Y'
                                        }

                                        param = {
                                            slide_id: Microdraw.slide_id,
                                            annotation_list: values,
                                        }

                                        if (ownFlag && Microdraw.latestStatus != 'complete') {
                                            axios.post(web_url + `/api/annotation/input`, param)
                                                .then((result) => {
                                                    this.className = this.className.replace('acceptOn', 'acceptOff');
                                                    if (element_btnChange !== null) {
                                                        element_btnChange.style.visibility = 'hidden';
                                                    }
                                                    reg.path.fullySelected = false;
                                                    // reg.path.selected = true;
                                                    paper.view.draw();
                                                })
                                                .catch(error => {
                                                    toast.error("Annotation accept failed!");
                                                });
                                        }
                                        break;
                                    }
                                }

                            });
                            element_div_objectArea.append(element_div_accept);
                        }
                        element_li.append(element_div_objectArea);

                        element_div_labelArea = document.createElement('div');
                        element_div_labelArea.className = "flex sb ai-center";
                        element_div_labelArea.style.height = '24px';
                        element_div_labelArea.style.marginBottom = '4px';

                        // 라벨명 클릭시 나오는 라벨명 팝업
                        element_div_label = document.createElement('div');
                        element_div_label.className = "label-nm";
                        element_div_label.setAttribute('title', reg.labelName);
                        element_div_label.setAttribute('data-label-no', reg.labelNo);
                        element_div_label.setAttribute('data-type', reg.path.type);
                        element_div_label.style.overflow = 'hidden';
                        element_div_label.style.textOverflow = 'ellipsis';
                        element_div_label.style.whiteSpace = 'nowrap';
                        element_div_label.style.marginLeft = '5px';
                        element_div_label.style.fontSize = '12px';
                        if (!Microdraw.isLocked && _auth_level != "UO" && ownFlag && Microdraw.latestStatus != "complete") {
                            if (Microdraw.latestWork == "Review") {
                                if (reg.review_yn != 'Y') {
                                    element_div_label.style.cursor = 'pointer';
                                }
                            }
                            else if (Microdraw.latestWork == "Termination") {
                                if (reg.termination_yn != 'Y') {
                                    element_div_label.style.cursor = 'pointer';
                                }
                            }
                            else {
                                element_div_label.style.cursor = 'pointer';
                            }
                        }
                        element_div_label.innerText = reg.labelName;

                        element_div_label.addEventListener("click", async function (event) {
                            if (me.tools[Microdraw.selectedTool] && me.tools[Microdraw.selectedTool].onDeselect) {
                                await me.tools[Microdraw.selectedTool].onDeselect();
                            }

                            me.dom.querySelectorAll("#popup-object .viewArea ul li div").forEach(
                                e => e.classList.remove('selected')
                            );

                            me.dom.querySelectorAll("#changeLabelDiv li").forEach(
                                e => e.classList.remove('selected')
                            );

                            Microdraw.dom.querySelector("#popup-info").style.visibility = 'hidden';
                            Microdraw.dom.querySelector("#labelDiv").style.visibility = 'hidden';

                            let parent_object = Microdraw.dom.getElementById(`${this.parentElement.parentElement.id}`);
                            let element_object = parent_object.querySelector(".object")
                            element_object.classList.add('selected');

                            let selectedLabelNo = parent_object.querySelector(".label-nm").getAttribute('data-label-no');
                            let selectedType = parent_object.querySelector(".label-nm").getAttribute('data-type');

                            me.listUpLabelByCoordinateKindCd(selectedType, '#changeLabelDiv')

                            $(me.dom.querySelector("#changeLabelDiv")).find(`[data-label-no=${selectedLabelNo}]`).addClass('selected')

                            let reg;
                            for (var regCnt = 0; regCnt < me.objInfo.regions.length; regCnt++) {
                                reg = me.objInfo.regions[regCnt];

                                if (reg.name == element_object.innerText) {
                                    Microdraw.selectRegion(reg);
                                    reg.path.fullySelected = true;
                                }
                                else {
                                    reg.path.fullySelected = false;
                                }
                            }

                            paper.view.draw();

                            if (Microdraw.isLocked || _auth_level == "UO" || !ownFlag || Microdraw.latestStatus == "complete") {
                                me.dom.querySelector("#changeLabelDiv").style.visibility = 'hidden';
                                return;
                            }


                            if (Microdraw.latestWork == "Review") {
                                if (Microdraw.region.review_yn == 'Y') {
                                    me.dom.querySelector("#changeLabelDiv").style.visibility = 'hidden';
                                    return;
                                }
                            }
                            else if (Microdraw.latestWork == "Termination") {
                                if (Microdraw.region.termination_yn == 'Y') {
                                    me.dom.querySelector("#changeLabelDiv").style.visibility = 'hidden';
                                    return;
                                }
                            }

                            me.dom.querySelector("#popup-object").style.overflow = 'visible';
                            me.dom.querySelector("#changeLabelDiv").style.left = event.layerX + 'px';
                            me.dom.querySelector("#changeLabelDiv").style.top = event.layerY + 'px';
                            // me.dom.querySelector("#changeLabelDiv").style.left = event.offsetX + 20 + 'px';
                            // me.dom.querySelector("#changeLabelDiv").style.top = event.offsetY + 90 + 'px';
                            me.dom.querySelector("#changeLabelDiv").style.visibility = 'visible';

                            var changeLabelDivTop =
                                Microdraw.dom.querySelectorAll(`#changeLabelDiv`).offsetParent.offsetTop
                                + Microdraw.dom.querySelectorAll(`#changeLabelDiv`).offsetTop;

                            // var changeLabelDivOriginHeight = Microdraw.dom.querySelectorAll(`#changeLabelDiv`).attr('origin-height');
                            // 좌표 type에 따라 갯수가 다를것 대비하여 직접 계산
                            var changeLabelDivOriginHeight =
                                parseInt(Microdraw.dom.querySelector(`#changeLabelDiv`).css('border-top'))
                                + parseInt(Microdraw.dom.querySelector(`#changeLabelDiv`).css('border-bottom'))
                                + parseInt(Microdraw.dom.querySelector(`#changeLabelDiv`).css('padding-top'))
                                + parseInt(Microdraw.dom.querySelector(`#changeLabelDiv`).css('padding-bottom'))
                                + (
                                    Microdraw.dom.querySelectorAll(`#changeLabelDiv li`).length
                                    * parseInt(Microdraw.dom.querySelector(`#changeLabelDiv li`).css('height'))
                                );
                            var bodyHeight = Microdraw.dom.querySelectorAll(`body`).offsetHeight

                            if (bodyHeight - changeLabelDivTop - changeLabelDivOriginHeight - 5 < 1) {
                                Microdraw.dom.querySelectorAll(`#changeLabelDiv`).style.height = `${bodyHeight - changeLabelDivTop - 5}px`
                            }
                            else {
                                Microdraw.dom.querySelectorAll(`#changeLabelDiv`).style.height = `${changeLabelDivOriginHeight}px`;
                            }
                        });

                        element_div_labelArea.append(element_div_label);

                        // 라벨명 change 버튼; 신규object
                        let btnChangeFlag = true;
                        if (!reg.uid.toString().includes('temp') && !Microdraw.isLocked && _auth_level != "UO" && ownFlag && Microdraw.latestStatus != "complete") {
                            if (Microdraw.latestWork == "Review") {
                                if (reg.review_yn == 'Y') {
                                    btnChangeFlag = false;
                                }
                            }
                            else if (Microdraw.latestWork == "Termination") {
                                if (reg.termination_yn == 'Y') {
                                    btnChangeFlag = false;
                                }
                            }

                            if (btnChangeFlag) {
                                element_div_change = document.createElement('div');
                                element_div_change.innerText = 'Change';
                                element_div_change.className = 'btnChange';

                                element_div_change.addEventListener("click", function (event) {
                                    if (!me.validateIntersect()) {
                                        return false;
                                    }

                                    if (me.tools[Microdraw.selectedTool] && me.tools[Microdraw.selectedTool].onDeselect) {
                                        me.tools[Microdraw.selectedTool].onDeselect();
                                    }

                                    let reg;
                                    let element_object = this.parentElement.parentElement.querySelector(".object");

                                    for (var regCnt = 0; regCnt < me.objInfo.regions.length; regCnt++) {
                                        reg = me.objInfo.regions[regCnt];

                                        if (reg.name == element_object.innerText) {
                                            Microdraw.selectRegion(reg);
                                        }
                                        else {
                                            reg.path.selected = false;
                                            reg.path.fullySelected = false;
                                        }
                                    }

                                    if (Microdraw.isLocked || !ownFlag || _auth_level == "UO") {
                                        return;
                                    }

                                    paper.view.draw();

                                    if (Microdraw.region !== null) {
                                        if (Microdraw.region.labelNo !== null) {
                                            // 기존 주석을 change 버튼 클릭시 update
                                            var param = {};
                                            var values = [];

                                            values.push({
                                                annotation_id: Microdraw.region.uid,
                                                label_id: Microdraw.region.labelNo
                                            })

                                            param = {
                                                slide_id: Microdraw.slide_id,
                                                annotation_list: values,
                                            }

                                            axios.post(web_url + `/api/annotation/update-label`, param)
                                                .then((data) => {
                                                    toast.success("Label change success!");
                                                })
                                                .catch(error => {
                                                    toast.error("Label change failed!");
                                                });
                                        }
                                        else {
                                            toast.error(document.querySelector("#labelName").innerText + " can not change label!");
                                        }
                                    }
                                });

                                element_div_labelArea.append(element_div_change);
                            }
                        }

                        element_li.append(element_div_labelArea);
                    }

                    if (reg.del_yn == "N") {
                        me.dom.querySelector(".viewArea ul").append(element_li);
                    }
                }

                if (Microdraw.latestWork != "Object List" || adminFlag) {
                    if (!ownFlag && !adminFlag) {
                        if (me.dom.querySelector("#popup-object .viewArea2") !== null) {
                            me.dom.querySelector("#popup-object .viewArea2").remove()
                        }
                    }
                    else if (me.dom.querySelector("#popup-object .viewArea2") === null && (ownFlag || adminFlag) && _auth_level != "UO") {
                        element_div_viewarea2 = document.createElement('div');
                        element_div_viewarea2.className = 'viewArea2';
                        me.dom.querySelector("#popup-object").append(element_div_viewarea2);
                    }

                    // save 버튼
                    if ((ownFlag && Microdraw.latestStatus != 'complete')) {
                        element_div_save_area = document.createElement('div');
                        element_div_save_area.className = 'flex jc-center';

                        element_div_save = document.createElement('div');
                        element_div_save.className = 'btn-anno btnSave';
                        element_div_save.innerText = 'Temporary Save';

                        element_div_save.addEventListener("click", async function () {
                            me.save();
                        });

                        element_div_save_area.append(element_div_save);

                        // complete 버튼
                        element_div_complete = document.createElement('div');
                        element_div_complete.className = 'btn-anno btnComplete';
                        element_div_complete.innerText = 'Complete';

                        element_div_complete.addEventListener("click", function () {
                            if (me.tools[Microdraw.selectedTool] && me.tools[Microdraw.selectedTool].onDeselect) {
                                me.tools[Microdraw.selectedTool].onDeselect();
                            }

                            let reg;
                            for (var regCnt = 0; regCnt < me.objInfo.regions.length; regCnt++) {
                                reg = me.objInfo.regions[regCnt];
                                if (reg.labelName?.toUpperCase() == "UNKNOWN") {
                                    customAlert('Change UNKNOWN label name before complete.')
                                    return;
                                }
                            }

                            if (!me.validateIntersect()) {
                                return false;
                            }

                            $.confirm({
                                title: '',
                                content: 'Are you sure you want to finish ' + Microdraw.latestWork + ' work?',
                                type: 'custom',
                                typeAnimated: true,
                                animation: 'none',
                                buttons: {
                                    tryAgain: {
                                        text: 'CONFIRM',
                                        btnClass: 'btn-custom',
                                        action: () => {
                                            me.updateDelBeforeSave();

                                            let flag = false;
                                            let completeFlag = false;
                                            var param = {};
                                            var values = [];

                                            for (var regCnt = 0; regCnt < me.objInfo.regions.length; regCnt++) {
                                                reg = me.objInfo.regions[regCnt];

                                                if (reg.uid == 'regionTemp') {
                                                    continue;
                                                }

                                                if (me.dom.querySelector("#popup-object .titleText").innerText == "Annotation") {
                                                    flag = true;
                                                }

                                                if (me.dom.querySelector("#popup-object .titleText").innerText == "Review") {
                                                    if (reg.review_yn == 'N') {
                                                        flag = true;
                                                    }
                                                    else {
                                                        flag = false;
                                                    }
                                                }

                                                if (me.dom.querySelector("#popup-object .titleText").innerText == "Termination") {
                                                    if (reg.termination_yn == 'N') {
                                                        flag = true;
                                                    }
                                                    else {
                                                        flag = false;
                                                    }
                                                }

                                                if (reg.del_yn == "N") {
                                                    completeFlag = true;
                                                }

                                                // review, termination의 경우 accept N인 값만 update
                                                if (flag) {
                                                    var coordinate_info = me.coordinateInfo(reg);

                                                    var label_id = reg.labelNo;
                                                    if (label_id == "") {
                                                        label_id = null;
                                                    }

                                                    values.push({
                                                        annotation_id: reg.uid,
                                                        label_id: label_id,
                                                        coordinate_kind_cd: reg.path.type,
                                                        coordinate_info: coordinate_info,
                                                        review_yn: '',
                                                        termination_yn: '',
                                                        del_yn: reg.del_yn,
                                                    })

                                                    if (me.dom.querySelector("#popup-object .titleText").innerText == "Annotation") {
                                                        values[values.length - 1].review_yn = 'N'
                                                        values[values.length - 1].termination_yn = 'N'
                                                        reg.annotation_yn = 'Y'
                                                    }

                                                    if (me.dom.querySelector("#popup-object .titleText").innerText == "Review") {
                                                        values[values.length - 1].review_yn = 'Y'
                                                        values[values.length - 1].termination_yn = 'N'
                                                        reg.review_yn = 'Y'
                                                    }

                                                    if (me.dom.querySelector("#popup-object .titleText").innerText == "Termination") {
                                                        values[values.length - 1].termination_yn = 'Y'
                                                        reg.termination_yn = 'Y'
                                                        values[values.length - 1].review_yn = 'Y'
                                                        reg.review_yn = 'Y'
                                                    }


                                                }
                                            }

                                            param = {
                                                slide_id: Microdraw.slide_id,
                                                annotation_list: values,
                                            }

                                            if (param.annotation_list.length > 0 && _auth_level != "UO") {
                                                axios.post(web_url + `/api/annotation/input`, param)
                                                    .then((data) => {
                                                        // toast.warning("Complete success!");
                                                        me.chkSaved(true);
                                                    })
                                                    .catch(error => {
                                                        toast.error("Complete failed!");
                                                    });
                                            }


                                            if (completeFlag) {
                                                me.dom.querySelectorAll("#popup-object .clear div.acceptOn").forEach(
                                                    e => e.className = e.className.replace('acceptOn', 'acceptOff')
                                                );

                                                me.statusUpdate(Microdraw.latestWork, 'complete');
                                                me.loadDBData();
                                            }
                                            else {
                                                customAlert('Must have at least 1 annotation to complete.')
                                            }
                                        }
                                    },
                                    close: {
                                        text: 'Cancel',
                                    }
                                }
                            });
                        });

                        element_div_save_area.append(element_div_complete);
                        me.dom.querySelector("#popup-object .viewArea2").append(element_div_save_area);

                        if (me.initPopupFlag) {
                            me.dom.querySelector(".viewArea").style.height = 'calc(100% - 106px)';
                        }

                    }

                    if (ownFlag || adminFlag) {
                        element_div_flex = document.createElement('div');
                        element_div_flex.className = 'flex jc-center';

                        // reset 버튼
                        element_div_reset = document.createElement('div');
                        element_div_reset.className = 'btn-anno btnReset';
                        element_div_reset.innerText = 'Reset';

                        element_div_reset.addEventListener("click", function () {
                            if (me.tools[Microdraw.selectedTool] && me.tools[Microdraw.selectedTool].onDeselect) {
                                me.tools[Microdraw.selectedTool].onDeselect();
                            }

                            $.confirm({
                                title: '',
                                content: 'Are you sure you want to reset ' + Microdraw.latestWork + ' data?',
                                type: 'custom',
                                typeAnimated: true,
                                animation: 'none',
                                buttons: {
                                    tryAgain: {
                                        text: 'CONFIRM',
                                        btnClass: 'btn-custom',
                                        action: () => {
                                            me.updateDelBeforeSave();

                                            var param = {
                                                slide_id: Microdraw.slide_id,
                                                work: Microdraw.latestWork
                                            }

                                            if (_auth_level != "UO") {
                                                axios.post(web_url + `/api/annotation/status-reset`, param)
                                                    .then((data) => {
                                                        toast.success(Microdraw.latestWork + " reset success!");
                                                        me.chkSaved(true);

                                                        me.dom.querySelectorAll("#popup-object .clear div.acceptOff").forEach(
                                                            e => e.className = e.className.replace('acceptOff', 'acceptOn')
                                                        );

                                                        me.loadDBData();

                                                        if (Microdraw.latestWork == 'Annotation') {
                                                            document.querySelector(".topMenuArea li[work=Annotation" + '] span').className = 'progressing'
                                                        }

                                                        if (Microdraw.latestWork == 'Review') {
                                                            document.querySelector(".topMenuArea li[work=Review" + '] span').className = 'progressing'
                                                        }

                                                        if (Microdraw.latestWork == 'Termination') {
                                                            document.querySelector(".topMenuArea li[work=Termination" + '] span').className = 'progressing'
                                                        }

                                                    })
                                                    .catch(error => {
                                                        toast.error(Microdraw.latestWork + " reset failed!");
                                                    });
                                            }
                                        }
                                    },
                                    close: {
                                        text: 'Cancel',
                                    }
                                }
                            });
                        });
                        element_div_flex.append(element_div_reset);

                        // cancel 버튼
                        element_div_cancel = document.createElement('div');
                        element_div_cancel.className = 'btn-anno btnCancel';
                        element_div_cancel.innerText = 'Role Cancel';

                        element_div_cancel.addEventListener("click", function () {
                            if (me.tools[Microdraw.selectedTool] && me.tools[Microdraw.selectedTool].onDeselect) {
                                me.tools[Microdraw.selectedTool].onDeselect();
                            }

                            $.confirm({
                                title: '',
                                content: 'Are you sure you want to cancel the ' + Microdraw.latestWork + ' role?',
                                type: 'custom',
                                typeAnimated: true,
                                animation: 'none',
                                buttons: {
                                    tryAgain: {
                                        text: 'CONFIRM',
                                        btnClass: 'btn-custom',
                                        action: () => {
                                            me.updateDelBeforeSave();

                                            var param = {
                                                slide_id: Microdraw.slide_id,
                                                work: Microdraw.latestWork
                                            }

                                            if (_auth_level != "UO") {
                                                axios.post(web_url + `/api/annotation/status-cancel`, param)
                                                    .then((data) => {
                                                        toast.success(Microdraw.latestWork + " cancel success!");
                                                        me.chkSaved(true);

                                                        me.loadDBData();

                                                        if (Microdraw.latestWork == 'Annotation') {
                                                            document.querySelector(".topMenuArea li[work=Annotation" + '] span').className = 'start'
                                                        }
                                                        else if (Microdraw.latestWork == 'Review') {
                                                            document.querySelector(".topMenuArea li[work=Review" + '] span').className = 'start'
                                                        }
                                                        else if (Microdraw.latestWork == 'Termination') {
                                                            document.querySelector(".topMenuArea li[work=Termination" + '] span').className = 'start'
                                                        }

                                                    })
                                                    .catch(error => {
                                                        toast.error(Microdraw.latestWork + " reset failed!");
                                                    });
                                            }
                                        }
                                    },
                                    close: {
                                        text: 'Cancel',
                                    }
                                }
                            });
                        });

                        element_div_flex.append(element_div_cancel);

                        if (me.dom.querySelector("#popup-object .viewArea2") === null) {
                            element_div_viewarea2 = document.createElement('div');
                            element_div_viewarea2.className = 'viewArea2';
                            me.dom.querySelector("#popup-object").append(element_div_viewarea2);
                        }


                        if (me.initPopupFlag) {
                            if (me.dom.querySelector(".btnSave") !== null) {
                                me.dom.querySelector(".viewArea").style.height = 'calc(100% - 220px)'
                            }
                            else {
                                if (Microdraw.latestWork == 'Object List') {
                                    me.dom.querySelector(".viewArea").style.height = 'calc(100% - 118px)'
                                }
                                else {
                                    me.dom.querySelector(".viewArea").style.height = 'calc(100% - 182px)'
                                }
                            }
                        }

                        me.dom.querySelector("#popup-object .viewArea2").append(element_div_flex);
                    }
                }

                if (me.dom.querySelector("#popup-object .viewArea2")) {
                    me.dom.querySelectorAll('#popup-object .viewArea2 .btn-anno').forEach((el) => {
                        el.addEventListener('click',
                            e => {
                                me.dom.querySelector("#labelDiv").style.visibility = 'hidden';
                                me.dom.querySelector("#changeLabelDiv").style.visibility = 'hidden';
                            }
                        )
                    });
                }

                me.initPopupFlag = false;

                if (Microdraw.latestWork == "Object List" || (!adminFlag && !ownFlag)) {
                    me.dom.querySelectorAll("#popup-object .viewArea2").forEach(
                        e => e.remove()
                    );

                    me.dom.querySelector(".viewArea").style.height = 'calc(100% - 118px)'
                }
            },

            memoPopup: function () {
                if (_auth_level == "UO") {
                    me.dom.querySelector("#popup-memo .add_btn").remove();
                }

                me.dbMemoLoad()

                if (!me.initSetting['popup-memo']) {
                    setSettingCookie({ 'popup-memo': popupMemoInit });
                    me.initSetting['popup-memo'] = popupMemoInit;
                }

                if (me.initSetting['popup-memo']['left']) {
                    me.dom.querySelector("#popup-memo").style.left = me.initSetting['popup-memo']['left'];
                }
                else {
                    me.dom.querySelector("#popup-memo").style.right = me.initSetting['popup-memo']['right'];
                }
                me.dom.querySelector("#popup-memo").style.top = me.initSetting['popup-memo']['top'];
                me.dom.querySelector("#popup-memo").style.width = me.initSetting['popup-memo']['width'];
                me.dom.querySelector("#popup-memo").style.height = me.initSetting['popup-memo']['height'];
            },

            closePopupAll: function () {
                // objectList popup 미포함
                me.dom.querySelector("#labelDiv").style.visibility = 'hidden';
                me.dom.querySelector("#changeLabelDiv").style.visibility = 'hidden';
                me.dom.querySelector("#popup-info").style.visibility = 'hidden';
            },

            loadDBData: async function () {
                me.objInfo.regions = []
                paper.projects[0].clear();
                me.annoSeq = 1;
                await me.dbStatusLoad();
                me.dbLabelLoad();
                me.chkSaved(true);
                me.dbAnnotationLoad();
                me.dbCommentLoad();
            },

            dbAnnotationLoad: function () {
                me.annotationLoad()
                    .then(function (result) {
                        me.annoSeq = 1;
                        var result = result.data
                        let imageSize = me.imageSize;
                        let projectPixel = me.projectSize;

                        let crntInfo = [];
                        let point = [];
                        // let point2 = [[38128.2812,29816.6426], [37366.0781,30016.2676], [36658.3203,30342.9258], [35914.2656,30687.7324], [35170.2109,31086.9805], [34535.0391,31486.2305], [34045.0547,32193.9902], [33790.9844,32992.4883], [33790.9844,33827.2812], [33936.168,34553.1875], [34153.9375,35279.0938], [34571.3359,36041.2969], [35079.4727,36603.875], [35769.082,37075.7148], [36458.6953,37329.7852], [37257.1914,37347.9297], [38055.6914,37112.0117], [38654.5625,36694.6133], [39217.1406,36132.0352], [39779.7227,35605.7539], [40269.707,34988.7344], [40560.0703,34244.6758], [40668.957,33464.3281], [40687.1055,32720.2715], [40687.1055,31976.2168], [40541.9219,31214.0137], [40178.9688,30578.8457], [39507.5039,30215.8926], [38836.043,29925.5293]]
                        // let point2 = [[50581.336, 13290.66796875], [50197.336, 13120.0], [47978.67, 13120.0], [46314.67, 13034.66796875], [43840.0, 12949.3359375], [39744.0, 12778.66796875], [38890.67, 12736.0], [37994.668, 12608.0], [37482.668, 12309.3359375], [37056.0, 12010.66796875], [36885.336, 11840.0], [36800.0, 11754.66796875], [36458.668, 11584.0], [36160.0, 11413.3359375], [35776.0, 11200.0], [35093.336, 10901.3359375], [34368.0, 10602.66796875], [33770.668, 10261.333984375], [33301.336, 9962.66796875], [33088.0, 9664.0], [32874.668, 9408.0], [32618.668, 8768.0], [32490.668, 8640.0], [32320.0, 8128.0], [32277.336, 8000.0], [32064.0, 7232.0], [31808.0, 6165.333984375], [31722.668, 5781.333984375], [31509.336, 5141.333984375], [31466.668, 4672.0], [31424.0, 3989.3359375], [31381.336, 3520.0], [31381.336, 2453.3359375], [31296.0, 1813.3359375], [31296.0, 362.66796875], [31336.297, 0.0], [61984.004, 0.0], [62058.67, 149.3359375], [62229.336, 490.66796875], [62357.336, 746.66796875], [62442.67, 1002.66796875], [62613.336, 1514.66796875], [62656.0, 1685.3359375], [62869.336, 2410.66796875], [63040.0, 3434.66796875], [63125.336, 3946.66796875], [63168.0, 4586.66796875], [63253.336, 5269.333984375], [63338.67, 5994.66796875], [63338.67, 6506.66796875], [63424.0, 7189.333984375], [63509.336, 7488.0], [63552.0, 7829.333984375], [63637.336, 8128.0], [63722.67, 8725.333984375], [63722.67, 11072.0], [63637.336, 11285.3359375], [63552.0, 11456.0], [63424.0, 11754.66796875], [63168.0, 12053.3359375], [62613.336, 12949.3359375], [62229.336, 13674.66796875], [61930.67, 14016.0], [61760.0, 14186.66796875], [61461.336, 14186.66796875], [61290.67, 14229.3359375], [60778.67, 14229.3359375], [50581.336, 13290.66796875]];
                        // let point3 = [[67849.875, 17558.6309], [67810.1016, 17610.1816], [67764.4453, 17649.9512], [67737.9297, 17704.4492], [67718.7812, 17760.4199], [67711.4141, 17819.3359], [67708.4688, 17878.2539], [67707, 17937.1699], [67705.5234, 18006.3965], [67705.5234, 18066.7871], [67707, 18127.1758], [67734.9844, 18184.6191], [67771.8047, 18234.6992], [67814.5234, 18277.4141], [67846.9219, 18328.9648], [67873.4375, 18381.9902], [67917.625, 18421.7598], [67975.0703, 18440.9062], [68035.4609, 18440.9062], [68095.8516, 18440.9062], [68162.1328, 18440.9062], [68226.9375, 18440.9062], [68285.8516, 18439.4336], [68338.8828, 18408.5039], [68391.9062, 18381.9902], [68449.3516, 18368.7344], [68506.7891, 18351.0586], [68561.2891, 18315.709], [68605.4766, 18272.9941], [68640.8281, 18219.9707], [68671.7578, 18168.418], [68713, 18121.2852], [68760.1328, 18084.4609], [68804.3203, 18041.7461], [68849.9844, 18001.9785], [68897.1172, 17965.1562], [68936.8828, 17920.9688], [68966.3438, 17866.4707], [68973.7031, 17807.5527], [68973.7031, 17745.6914], [68944.25, 17691.1934], [68911.8438, 17636.6953], [68882.3828, 17585.1426], [68852.9297, 17532.1172], [68816.1016, 17480.5664], [68771.9141, 17440.7969], [68721.8359, 17408.3926], [68668.8125, 17377.4609], [68620.2031, 17343.584], [68562.7656, 17330.3281], [68500.8984, 17328.8555], [68440.5078, 17343.584], [68381.5938, 17353.8945], [68332.9844, 17389.2461], [68274.0703, 17392.1914], [68215.1562, 17384.8262], [68162.1328, 17412.8125], [68109.1016, 17445.2168], [68054.6094, 17468.7832], [68001.5781, 17496.7676], [67944.1406, 17512.9707], [67891.1094, 17539.4824]];
                        let data = [];
                        let path = [];
                        let segments = [];

                        // DB로드
                        // 필드 추가시 newRegion, getUndo, applyUndo 같이 추가 필요
                        for (var resultCnt = 0; resultCnt < result.length; resultCnt++) {
                            path = [];
                            segments = [];

                            crntInfo = JSON.parse(result[resultCnt].coordinate_info)
                            point = crntInfo.COORDINATE

                            if (result[resultCnt].coordinate_kind_cd == "BBOX") {
                                // 2 3
                                // 1 4 순서
                                segments.push([crntInfo.X * projectPixel.x / imageSize.x, (crntInfo.Y + crntInfo.H) * projectPixel.y / imageSize.y]);
                                segments.push([crntInfo.X * projectPixel.x / imageSize.x, crntInfo.Y * projectPixel.y / imageSize.y]);
                                segments.push([(crntInfo.X + crntInfo.W) * projectPixel.x / imageSize.x, crntInfo.Y * projectPixel.y / imageSize.y]);
                                segments.push([(crntInfo.X + crntInfo.W) * projectPixel.x / imageSize.x, (crntInfo.Y + crntInfo.H) * projectPixel.y / imageSize.y]);
                            }
                            else {
                                for (let pointCnt = 0; pointCnt < point.length; pointCnt += 1) {
                                    segments.push([point[pointCnt][0] * projectPixel.x / imageSize.x, point[pointCnt][1] * projectPixel.y / imageSize.y]);
                                    // segments.push([point[pointCnt][0] * projectPixel.x / Microdraw.fileWidth, point[pointCnt][1] * projectPixel.y / Microdraw.fileHeight]);
                                }
                            }

                            path.push('Path');
                            path.push({ segments: segments, closed: true, type: result[resultCnt].coordinate_kind_cd })

                            var reg = {};
                            var json = path;

                            reg.annoSeq = me.annoSeq;
                            reg.uid = result[resultCnt].annotation_id;
                            reg.labelNo = result[resultCnt].label_id ? result[resultCnt].label_id : result[resultCnt].coordinate_kind_cd;
                            reg.labelName = result[resultCnt].label_nm ? result[resultCnt].label_nm : result[resultCnt].coordinate_kind_cd;
                            reg.hex = result[resultCnt].rgb_hex;
                            reg.review_yn = result[resultCnt].review_yn;
                            reg.termination_yn = result[resultCnt].termination_yn;
                            reg.del_yn = 'N';
                            reg.path = new paper.Path();

                            if (result[resultCnt].coordinate_kind_cd == "POINT") {
                                reg.segments = segments
                            }

                            var { insert } = reg.path;
                            reg.path.importJSON(json);
                            reg.path.insert = insert;

                            reg = me.newRegion({
                                path: reg.path,
                                annoSeq: me.annoSeq,
                                uid: reg.uid,
                                labelNo: reg.labelNo,
                                labelName: reg.labelName,
                                hex: reg.hex,
                                review_yn: reg.review_yn,
                                termination_yn: reg.termination_yn
                            });

                            if (Microdraw.dom.querySelector("#labelBar div input") !== null) {
                                if (!Microdraw.dom.querySelector("#labelBar div[data-label-no='" + reg.labelNo + "'] input").checked) {
                                    reg.path.visible = false;
                                    reg.path.selected = false;
                                    reg.text.visible = false;
                                }
                            }
                        }

                        paper.view.draw();

                        // on db load, do not select any region by default
                        me.selectRegion(null);

                        paper.view.draw();
                        Microdraw.currentRegions();

                        if (me.debug) { console.log("< MicrodrawDBLoad resolve success. Number of regions:", me.objInfo.regions.length); }
                        // })
                        // .catch(function(error) {
                        //     console.error('< MicrodrawDBLoad resolve error', error);
                        // });
                    });
            },

            dbCommentSave: function () {

                if (!Microdraw.objComment) {
                    return;
                }

                let objComment = Microdraw.objComment;

                let param = {
                    slideId: Microdraw.slide_id,
                    commentId: objComment.uid,
                    coordinateInfo: JSON.stringify({ "AREA": me.coordinateInfo(objComment.area), "BOX": me.coordinateInfo(objComment.box) }),
                    contents: Microdraw.dom.querySelector(`#div${Microdraw.objComment.name} div`).innerText.replace(/\n\n/g, '\n')
                }

                axios.post(web_url + `/api/annotation/comments`, param)
                    .then((result) => {
                        objComment.uid = result.data;
                    })
            },

            dbCommentLoad: function () {
                Microdraw.dom.querySelectorAll(`.comment-wrapper`).remove()

                me.commentSeq = 1;
                axios.get(web_url + `/api/annotation/comments/${Microdraw.slide_id}`)
                    .then((result) => {
                        var result = result.data

                        let imageSize = me.imageSize;
                        let projectPixel = me.projectSize;

                        let crntInfo = [];
                        let point = [];
                        let data = [];
                        let path = [];
                        let segments = [];
                        let objArea = {};
                        let objLine = {};
                        let objBox = {};

                        let regArea = {};
                        let regLine = {};
                        let regBox = {};

                        let pointFrom;
                        let pointTo;

                        // DB로드
                        // 필드 추가시 newRegion, getUndo, applyUndo 같이 추가 필요
                        for (var resultCnt = 0; resultCnt < result.length; resultCnt++) {
                            path = [];
                            segments = [];

                            crntInfo = JSON.parse(result[resultCnt].coordinate_info)
                            point = crntInfo.COORDINATE

                            objArea = crntInfo['AREA'];
                            objBox = crntInfo['BOX']

                            pointFrom = new paper.Point(objArea.FROM[0] * projectPixel.x / imageSize.x, objArea.FROM[1] * projectPixel.y / imageSize.y);
                            pointTo = new paper.Point(objArea.TO[0] * projectPixel.x / imageSize.x, objArea.TO[1] * projectPixel.y / imageSize.y);


                            let x2 = pointTo.x;
                            let x1 = pointFrom.x;
                            let y2 = pointTo.y;
                            let y1 = pointFrom.y;

                            // 원 컨트롤
                            let px = (x1 + x2) * 0.5;
                            let py = (y1 + y2) * 0.5;

                            let rx = px - x1;
                            let ry = py - y1;

                            path = new paper.Path.Circle(new paper.Point(px, py), Math.sqrt(rx * rx + ry * ry));
                            path.type = 'COMMENTAREA';
                            path.fillColor = 'rgba(' + Microdraw.hexToRgb('0, 0, 80') + ',' + 0.1 + ')'
                            path = Microdraw.newCircle({ path: path }, 1, true).path;
                            regArea = Microdraw.newCommentArea({ path: path }, 1, true);
                            regArea.text.position = regArea.path.position;


                            pointFrom = new paper.Point(objBox.X * projectPixel.x / imageSize.x, objBox.Y * projectPixel.y / imageSize.y);
                            pointTo = new paper.Point((objBox.X + objBox.W) * projectPixel.x / imageSize.x, (objBox.Y + objBox.H) * projectPixel.y / imageSize.y);
                            path = new paper.Path.Rectangle(pointFrom, pointTo);

                            regBox = Microdraw.newCommentBox({ path: path }, 1, result[resultCnt].contents);

                            pointTo = new paper.Point(pointFrom.x, pointFrom.y + (pointTo.y - pointFrom.y) / 2);
                            pointFrom = new paper.Point(objArea.TO[0] * projectPixel.x / imageSize.x, objArea.TO[1] * projectPixel.y / imageSize.y);
                            path = new paper.Path.Line(pointFrom, pointTo);

                            regLine = Microdraw.newCommentLine(regArea, regBox, { path: path }, 1, '');

                            Microdraw.objInfo.comments.push({ uid: result[resultCnt].comment_id, name: `Comment${Microdraw.commentSeq}`, area: regArea, box: regBox, line: regLine });
                            Microdraw.commentSeq += 1;


                            // if (Microdraw.dom.querySelector("#labelBar div input") !== null) {
                            //     if (!Microdraw.dom.querySelector("#labelBar div[data-label-no='" + reg.labelNo + "'] input").checked) {
                            //         reg.path.visible = false;
                            //         reg.path.selected = false;
                            //         reg.text.visible = false;
                            //     }
                            // }
                        }

                        paper.view.draw();

                        // on db load, do not select any region by default
                        me.selectRegion(null);

                        paper.view.draw();
                        Microdraw.currentRegions();
                        Microdraw.resizeCommentBox();
                    }
                    )
            },

            dbStatusLoad: async function () {
                let params = {
                    page: 1,
                    pageLength: 1000,
                    whereOptions: ([] = [{ where_key: 'ts.id', where_value: Microdraw.slide_id, where_type: 'AND' }]),
                    orderOptions: ([] = []),
                };
                me.initPopupFlag = true;

                await axios.post(web_url + `/api/annotation/image-status-list`, params)
                    .then((result) => {
                        result = result.data.mainInfo[0];
                        me.statusInfo = result;

                        if (result.info_yn == "Y") {
                            document.querySelector('[work=Clinical-info]').children[0].className = 'complete'
                        }
                        else {
                            document.querySelector('[work=Clinical-info]').children[0].className = 'standby'
                        }

                        if (result.annotation_yn == "Y") {
                            document.querySelector('[work=Annotation]').children[0].className = 'complete'
                        }
                        else {
                            if (result.p_status == "N") {
                                if (result.annotation_ssid == null) {
                                    document.querySelector('[work=Annotation]').children[0].className = 'start'
                                    me.isLocked = true;
                                }
                                else {
                                    document.querySelector('[work=Annotation]').children[0].className = 'progressing'
                                    if (_ssid == me.statusInfo.annotation_ssid) {
                                        me.isLocked = false;
                                    }
                                    else {
                                        me.isLocked = true;
                                    }
                                }
                            }
                        }

                        if (result.review_yn == "Y") {
                            document.querySelector('[work=Review]').children[0].className = 'complete'
                        }
                        else {
                            if (result.p_status == "A") {
                                if (result.review_ssid == null) {
                                    document.querySelector('[work=Review]').children[0].className = 'start'
                                    me.isLocked = true;
                                }
                                else {
                                    document.querySelector('[work=Review]').children[0].className = 'progressing'
                                    if (_ssid == me.statusInfo.review_ssid) {
                                        me.isLocked = false;
                                    }
                                    else {
                                        me.isLocked = true;
                                    }
                                }
                            }
                            else {
                                document.querySelector('[work=Review]').children[0].className = 'standby'
                            }
                        }

                        if (result.termination_yn == "Y") {
                            document.querySelector('[work=Termination]').children[0].className = 'complete'
                            me.isLocked = true;
                        }
                        else {
                            if (result.p_status == "R") {
                                if (result.termination_ssid == null) {
                                    document.querySelector('[work=Termination]').children[0].className = 'start'
                                    me.isLocked = true;
                                }
                                else {
                                    document.querySelector('[work=Termination]').children[0].className = 'progressing'
                                    if (_ssid == me.statusInfo.termination_ssid) {
                                        me.isLocked = false;
                                    }
                                    else {
                                        me.isLocked = true;
                                    }
                                }
                            }
                            else {
                                document.querySelector('[work=Termination]').children[0].className = 'standby'
                            }
                        }

                        me.updateLatestStatus();

                        if (_auth_level == "UO") {
                            me.isLocked = true;
                        }

                        me.dom.querySelector("#fileName").innerText = result.filename;

                        if (me.isLocked) {
                            me.dom.querySelector("#buttonsBlock .btnArea2").classList.add('locked');
                            me.dom.querySelector("#buttonsBlock .btnArea3").classList.add('locked');
                        }
                        else {
                            me.dom.querySelector("#buttonsBlock .btnArea2").classList.remove('locked');
                            me.dom.querySelector("#buttonsBlock .btnArea3").classList.remove('locked');
                            me.isLocked = false;
                        }

                        me.dom.querySelector("#annotation-ssid").innerText = result.annotation_ssid ? result.annotation_ssid : '-';
                        me.dom.querySelector("#annotation-dtc-dtm").innerText = result.annotation_utc_dtm ? result.annotation_utc_dtm : '-';

                        me.dom.querySelector("#review-ssid").innerText = result.review_ssid ? result.review_ssid : '-';
                        me.dom.querySelector("#review-dtc-dtm").innerText = result.review_utc_dtm ? result.review_utc_dtm : '-';

                        me.dom.querySelector("#termination-ssid").innerText = result.termination_ssid ? result.termination_ssid : '-';
                        me.dom.querySelector("#termination-dtc-dtm").innerText = result.termination_utc_dtm ? result.termination_utc_dtm : '-';

                        if (me.dom.querySelector("#popup-object").style.visibility == 'visible') {
                            me.objectListPopup();
                        }

                        if (me.isLocked) {
                            $(Microdraw.dom.querySelector('#tools-side')).find('.selected').removeClass('selected')
                            $(Microdraw.dom.querySelector('#tools-side')).find('#select').addClass('selected')
                            me.selectedTool = 'select';
                            me.prevTool = 'select';
                            me.initCursor();
                        }
                    });
            },

            dbLabelLoad: function () {
                let params = {
                    page: 1,
                    pageLength: 1000,
                    whereOptions: ([] = [{ where_key: 'tumor_cd', where_value: Microdraw.tumor_code, where_type: 'AND' }]),
                };

                axios.post(web_url + `/api/annotation/label-list`, params)
                    .then((result) => {
                        let labelList = result.data.baseInfo
                        me.labelInfo = {
                            point: [], line: [], bbox: [], seg: []
                        }
                        me.labelUnknown = result.data.unknown[0]

                        var element = document.createElement("ul");
                        var element2 = document.createElement("ul");
                        var elSpan;

                        me.dom.querySelectorAll("#labelDiv ul").forEach(
                            e => e.remove()
                        );

                        me.dom.querySelectorAll("#changeLabelDiv ul").forEach(
                            e => e.remove()
                        );

                        labelList.map(item => {
                            if (item.coordinate_kind_cd == 'POINT') {
                                me.labelInfo.point.push(item)
                            }
                            else if (item.coordinate_kind_cd == 'LINE') {
                                me.labelInfo.line.push(item)
                            }
                            else if (item.coordinate_kind_cd == 'BBOX') {
                                me.labelInfo.bbox.push(item)
                            }
                            else if (item.coordinate_kind_cd == 'SEG') {
                                me.labelInfo.seg.push(item)
                            }
                        })

                        var element_option;
                        me.dom.querySelector("#labelDiv").append(element);
                        me.dom.querySelector("#changeLabelDiv").append(element2);

                        for (var labelCnt = 0; labelCnt < me.labelInfo.length; labelCnt++) {
                            element = document.createElement("li");
                            element.setAttribute('data-label-no', me.labelInfo[labelCnt].label_id);
                            element.setAttribute('data-label-nm', me.labelInfo[labelCnt].label_nm);
                            element.setAttribute('data-hex', me.labelInfo[labelCnt].rgb_hex);
                            element.setAttribute('tabindex', labelCnt + 1);

                            elSpan = document.createElement("span");
                            elSpan.style.backgroundColor = 'rgb(' + me.hexToRgb(me.labelInfo[labelCnt].rgb_hex) + ')';
                            element.append(elSpan);

                            element.innerHTML = element.innerHTML + me.labelInfo[labelCnt].label_nm + ' (' + me.labelInfo[labelCnt].label_desc + ')';

                            element.addEventListener("keydown", function (e) {
                                if (e.keyCode == 13) {
                                    me.dom.querySelectorAll("#labelDiv li").forEach(
                                        e => e.classList.remove('selected')
                                    );

                                    me.labelSelected = { labelNo: this.getAttribute('data-label-no'), labelName: this.getAttribute('data-label-nm'), hex: this.getAttribute('data-hex') }
                                    $(this).addClass('selected')
                                    me.dom.querySelector("#labelDiv").style.visibility = 'hidden';
                                }
                            });

                            element.addEventListener("click", function () {
                                me.dom.querySelectorAll("#labelDiv li").forEach(
                                    e => e.classList.remove('selected')
                                );

                                me.labelSelected = { labelNo: this.getAttribute('data-label-no'), labelName: this.getAttribute('data-label-nm'), hex: this.getAttribute('data-hex') }
                                $(this).addClass('selected')
                                me.dom.querySelector("#labelDiv").style.visibility = 'hidden';
                            });

                            me.dom.querySelector("#labelDiv ul").append(element);


                            element2 = document.createElement("li");
                            element2.setAttribute('data-label-no', me.labelInfo[labelCnt].label_id);
                            element2.setAttribute('data-label-nm', me.labelInfo[labelCnt].label_nm);
                            element2.setAttribute('data-hex', me.labelInfo[labelCnt].rgb_hex);
                            element2.setAttribute('tabindex', labelCnt + 1);

                            elSpan = document.createElement("span");
                            elSpan.style.backgroundColor = 'rgb(' + me.hexToRgb(me.labelInfo[labelCnt].rgb_hex) + ')';
                            element2.append(elSpan);

                            element2.innerHTML = element2.innerHTML + me.labelInfo[labelCnt].label_nm + ' (' + me.labelInfo[labelCnt].label_desc + ')';

                            // element2.addEventListener("keydown", function(e) {
                            //     if (e.keyCode == 13) {
                            //         me.region.hex = this.getAttribute('data-hex');
                            //         me.region.labelNo = Number(this.getAttribute('data-label-no'));
                            //         me.region.labelName = this.getAttribute('data-label-nm');

                            //         me.region.path.strokeColor = 'rgba(' + me.hexToRgb(this.getAttribute('data-hex')? this.getAttribute('data-hex') : 50, 94, 228) + ',' + 1 + ')'
                            //         me.region.path.fillColor = 'rgba(' + me.hexToRgb(this.getAttribute('data-hex')? this.getAttribute('data-hex') : 50, 94, 228) + ',' + 0.1+ ')';


                            //         reg.path = arg.path;
                            //         reg.path.strokeWidth = $($('#content')[0].shadowRoot.querySelector('#strokeDiv .slider')).slider('value');
                            //         reg.path.strokeColor = 'rgba(' + (arg.hex? me.hexToRgb( arg.hex) : '0, 0, 80') + ',' + 1 + ')';
                            //         reg.path.strokeScaling = false;
                            //         reg.path.selected = false;

                            //         me.dom.querySelector("#popup-object").style.overflow = 'hidden';
                            //         me.dom.querySelector("#changeLabelDiv").style.visibility = 'hidden';

                            //         me.updateUndoStack();
                            //         me.currentRegions(true);
                            //         paper.view.draw();
                            //     }
                            // });

                            // element2.addEventListener("click", function() {
                            //     me.region.hex = this.getAttribute('data-hex');
                            //     me.region.labelNo = Number(this.getAttribute('data-label-no'));
                            //     me.region.labelName = this.getAttribute('data-label-nm');

                            //     me.region.path.strokeColor = 'rgba(' + me.hexToRgb(this.getAttribute('data-hex')? this.getAttribute('data-hex') : 50, 94, 228) + ',' + 1 + ')'
                            //     me.region.path.fillColor = 'rgba(' + me.hexToRgb(this.getAttribute('data-hex')? this.getAttribute('data-hex') : 50, 94, 228) + ',' + 0.1+ ')';

                            //     me.dom.querySelector("#popup-object").style.overflow = 'hidden';
                            //     me.dom.querySelector("#changeLabelDiv").style.visibility = 'hidden';

                            //     me.updateUndoStack();
                            //     me.currentRegions(true);
                            //     paper.view.draw();
                            // });



                            me.dom.querySelector("#changeLabelDiv ul").append(element2);
                        }

                        // $($('#content')[0].shadowRoot.querySelectorAll(`#changeLabelDiv`)).attr('origin-height', $($('#content')[0].shadowRoot.querySelectorAll(`#changeLabelDiv`))[0].offsetHeight)                    
                    });
            },

            dbDeepzoomInformationLoad: async function () {

                await axios.get(deepcis_url + '/info/' + Microdraw.statusInfo.pre_path + `/` + Microdraw.statusInfo.filename)
                    .then((result) => {
                        if (result.data.Code == 'fail') {
                            me.dom.querySelector("#openseadragon1").innerText = 'Load image failed.';
                            me.dom.querySelector("#openseadragon1").classList.add('flex');
                            me.dom.querySelector("#openseadragon1").classList.add('ai-center');
                            me.dom.querySelector("#openseadragon1").classList.add('jc-center');
                        }
                        else {
                            let data = result.data;

                            for (let key in data) {
                                switch (key) {
                                    case "Micrometres Per Pixel X": {
                                        me.dom.querySelector(".infor.Txt2.pixelX").innerText = Number(data[key]).toFixed(4);
                                        me.umPerImagePixelX = Number(data[key]);
                                        break;
                                    }
                                    case "Micrometres Per Pixel Y": {
                                        me.dom.querySelector(".infor.Txt2.pixelY").innerText = Number(data[key]).toFixed(4);
                                        break;
                                    }
                                    case "Width(pixels)": {
                                        me.dom.querySelector(".infor.Txt2.width").innerText = data[key];
                                        break;
                                    }
                                    case "Height(pixels)": {
                                        me.dom.querySelector(".infor.Txt2.height").innerText = data[key];
                                        break;
                                    }
                                    case "Vendor": {
                                        me.dom.querySelector(".infor.Txt2.vendor").innerText = data[key];
                                        break;
                                    }
                                    case "property": {
                                        let content = "";
                                        for (let property in data[key]) {
                                            content += property + " : " + data[key][property] + "<br>";
                                        }
                                        me.dom.querySelector(".infor.textarea.property").innerHTML = content;
                                        break;
                                    }
                                }
                            }

                            me.umPerProjectPixelX = me.imageSize.x * me.umPerImagePixelX / me.projectSize.x;
                        }
                    })
                    .catch(err => { console.log(err) })
            },

            dbSlideInfoLoad: async function () {
                let deepzoomCode;
                // await axios.get(web_url + `/api/tumor/detail-slide/` + Microdraw.slide_id)
                await axios.get(web_url + `/api/tumor/slide-info/` + Microdraw.slide_id)
                    .then((result) => {
                        let deepzoomInfo = result.data.deepzoomInfo;
                        deepzoomCode = deepzoomInfo?.statusCode;

                        Microdraw.tumor_code = result.data.baseInfo.tumorCode;
                        Microdraw.slide_url = deepzoomInfo.slide_url;
                        Microdraw.jpegFilePath = result.data.jpegFilePath;

                        Microdraw.fileWidth = result.data.slideInfo.file_width;
                        Microdraw.fileHeight = result.data.slideInfo.file_height;
                        Microdraw.dom.querySelector(".infor.Txt2.width").innerText = result.data.slideInfo.file_width;
                        Microdraw.dom.querySelector(".infor.Txt2.height").innerText = result.data.slideInfo.file_height;

                        let data = result.data.columnInfos;

                        let element_li;
                        let element_div_txt1;
                        let element_div_txt2;
                        let optionArrays;

                        me.dom.querySelectorAll("#clinical-info li").forEach((el) => {
                            el.remove();
                        });



                        for (let arr of data) {
                            element_li = document.createElement('li');
                            element_li.className = 'listWrap';

                            element_div_txt1 = document.createElement('div');
                            element_div_txt1.className = 'infor ci-txt1';
                            element_div_txt1.innerText = arr.column_name;
                            element_li.append(element_div_txt1);

                            element_div_txt2 = document.createElement('div');
                            element_div_txt2.className = 'infor ci-txt2';
                            element_div_txt2.innerText = arr.column_value == "unSelected" ? '' : arr.column_value;

                            element_li.append(element_div_txt2);
                            me.dom.querySelector("#clinical-info").append(element_li)

                            if (arr.value_type == "S") {
                                optionArrays = JSON.parse(arr.selectOptions)
                                for (let optionArr of optionArrays) {
                                    if (optionArr.code_value == arr.column_value) {
                                        if (optionArr.option_exist == 'Y') {
                                            element_li = document.createElement('li');
                                            element_li.className = 'listWrap';

                                            element_div_txt1 = document.createElement('div');
                                            element_div_txt1.className = 'infor ci-txt1';
                                            element_div_txt1.innerText = arr.column_name + " Option";
                                            // element_div_txt1.style.color = 'blue';
                                            element_li.append(element_div_txt1);

                                            element_div_txt2 = document.createElement('div');
                                            element_div_txt2.className = 'infor ci-txt2';

                                            element_div_txt2.innerText = optionArr.option_value;

                                            element_li.append(element_div_txt2);
                                            me.dom.querySelector("#clinical-info").append(element_li)
                                        }
                                    }
                                }
                            }
                        }

                        element_li = document.createElement('li');
                        element_li.className = 'listWrap';

                        element_div_txt1 = document.createElement('div');
                        element_div_txt1.className = 'infor Txt1';
                        element_div_txt1.innerText = 'Memo';
                        element_li.append(element_div_txt1);

                        element_div_txt2 = document.createElement('div');
                        element_div_txt2.className = 'infor textarea memo';
                        element_div_txt2.innerHTML = result.data.baseInfo.memo;

                        element_li.append(element_div_txt2);
                        me.dom.querySelector("#clinical-info").append(element_li)
                    });

                return deepzoomCode;
            },

            dbMemoLoad: async function () {
                me.dom.querySelectorAll("#popup-memo li").forEach((el) => {
                    el.remove();
                });

                await axios.get(web_url + `/api/annotation/memos/${Microdraw.slide_id}`)
                    .then((result) => {
                        if (result.data.length) {
                            for (let item of result.data) {
                                me.createMemoElement(false, item)
                            }

                            Microdraw.dom.querySelector('#popup-memo').style.visibility = 'visible';

                            let memoList = Microdraw.dom.querySelector('#popup-memo .list');
                            $(memoList).scrollTop(result.data.length * 144)
                        }
                    });



                // return deepzoomCode;
            },

            createMemoElement: function (isNew, item) {
                let memoId = item.memoId ? item.memoId : 'new-memo';
                let title = item.title ? item.title : '';
                let contents = item.contents ? item.contents : '';
                let create_ssid = item.create_ssid ? item.create_ssid : '';
                let html =
                    `
                  <li class="memo-wrapper" data-memo-id="${memoId}">
                      <div class="memo-header">
                          <div class="memo-title">${title}</div>
                          <div class="btn-wrapper">
              `
                if (_auth_level != "UO") {
                    if (isNew) {
                        html += `<div class="ico save" data-memo-id="new-memo"}></div>`
                        html += `<div class="ico delete" data-memo-id="${memoId}"></div>`
                    }

                    else if (_auth_level == "SM" || _auth_level == "GM" || _auth_level == "OM" || _ssid === create_ssid) {
                        html += `<div class="ico delete" data-memo-id="${memoId}"></div>`
                    }
                    // html += `<div class="ico glyphicon glyphicon-trash" data-memo-id="${memoId}"></div>`
                }

                html += `
                          </div>
                      </div>
                      <textarea ${isNew ? '' : 'disabled'} class="diagnosis-textarea ${isNew ? 'new-memo' : ''}">${contents}</textarea>
                  </li>
              `;

                $(me.dom.querySelector("#popup-memo .list")).append(html)

                let divWrapper = Microdraw.dom.querySelector(`.memo-wrapper[data-memo-id="${memoId}"]`)
                if (isNew) {
                    let divSave = divWrapper?.find('.save')[0];

                    divSave.addEventListener('click', function (event) {
                        me.dbMemoSave(divWrapper.find('.diagnosis-textarea').val());
                    })
                }

                if (_auth_level == "SM" || _auth_level == "GM" || _auth_level == "OM" || _ssid === create_ssid) {
                    let divDelete = divWrapper?.find('.delete')[0];
                    divDelete?.addEventListener('click', function (event) {
                        me.dbMemoDelete(this, this.getAttribute('data-memo-id'))
                    })
                }
            },

            dbMemoSave: async function (contents) {
                let params = {
                    slideId: Microdraw.slide_id,
                    stickerMemo: contents
                }
                await axios.post(web_url + `/api/annotation/memos`, params)
                    .then((result) => {
                        toast.success("Memo save success!");
                    })
                    .catch(error => {
                        toast.error("Memo save failed!");
                    });

                await me.dbMemoLoad();
            },

            dbMemoDelete: async function (el, memoId) {
                let parentElement = $(el).parents('.memo-wrapper');

                parentElement.remove();

                if (memoId == 'new-memo') {
                    return false;
                }

                await axios.delete(web_url + `/api/annotation/memos/${memoId}`)
                    .then((result) => {
                        toast.success("Memo delete success!");
                    })
                    .catch(error => {
                        toast.error("Memo delete failed!");
                    });
            },

            /**
             * @function save
             * @returns {void}
             */
            save: async function () {
                if (me.debug) { console.log("> save"); }

                if (me.tools[Microdraw.selectedTool] && me.tools[Microdraw.selectedTool].onDeselect) {
                    me.tools[Microdraw.selectedTool].onDeselect();
                }

                let reg;
                for (var regCnt = 0; regCnt < me.objInfo.regions.length; regCnt++) {
                    reg = me.objInfo.regions[regCnt];
                    if (reg.labelName?.toUpperCase() == "UNKNOWN" && reg.del_yn == "N") {
                        customAlert('Change UNKNOWN label name before save.')
                        return Boolean(false);
                    }
                }

                if (!me.validateIntersect()) {
                    return false;
                }

                me.updateDelBeforeSave();

                var param = {};
                var values = [];
                var coordinate_info;
                var label_id;
                for (var regCnt = 0; regCnt < me.objInfo.regions.length; regCnt++) {
                    reg = me.objInfo.regions[regCnt];

                    if (reg.uid == 'regionTemp') {
                        continue;
                    }

                    if (Microdraw.latestWork == "Review" && reg.review_yn == "Y") {
                        continue;
                    }

                    if (Microdraw.latestWork == "Termination" && reg.termination_yn == "Y") {
                        continue;
                    }

                    coordinate_info = me.coordinateInfo(reg);

                    label_id = reg.labelNo;
                    if (label_id == "") {
                        label_id = null;
                    }

                    values = [];
                    values.push({
                        annotation_id: reg.uid,
                        label_id: label_id,
                        coordinate_kind_cd: reg.path.type,
                        coordinate_info: coordinate_info,
                        review_yn: 'N',
                        termination_yn: 'N',
                        del_yn: reg.del_yn,
                    })

                    param = {
                        slide_id: Microdraw.slide_id,
                        annotation_list: values,
                    }

                    if (param.annotation_list.length > 0 && _auth_level != "UO") {
                        await axios.post(web_url + `/api/annotation/input`, param)
                            .then((result) => {
                                if (reg.uid.toString().includes('temp')) {
                                    if (me.UndoStack.length > 0) {
                                        let undoArrs = me.UndoStack;
                                        let undoRegArrs;
                                        let undoReg;
                                        for (var undoCnt = 0; undoCnt < undoArrs.length; undoCnt++) {
                                            undoRegArrs = undoArrs[undoCnt].regions;
                                            for (var undoRegCnt = 0; undoRegCnt < undoRegArrs.length; undoRegCnt++) {
                                                undoReg = undoRegArrs[undoRegCnt];
                                                if (reg.uid == undoReg.uid) {
                                                    undoReg.uid = result.data[0];
                                                    continue;
                                                }
                                            }
                                        }
                                    }

                                    if (me.RedoStack.length > 0) {
                                        let redoArrs = me.RedoStack;
                                        let redoRegArrs;
                                        let redoReg;
                                        for (var redoCnt = 0; redoCnt < redoArrs.length; redoCnt++) {
                                            redoRegArrs = redoArrs[redoCnt].regions;
                                            for (var redoRegCnt = 0; redoRegCnt < redoRegArrs.length; redoRegCnt++) {
                                                redoReg = redoRegArrs[redoRegCnt];
                                                if (reg.uid == redoReg.uid) {
                                                    redoReg.uid = result.data[0];
                                                    continue;
                                                }
                                            }
                                        }
                                    }
                                }

                            })
                            .catch(error => {
                                toast.error("Save failed!");
                            });
                    }
                }

                if (param.annotation_list === undefined) {
                    toast.success("Save success!");
                }
                else if (param.annotation_list.length > 0 && _auth_level != "UO") {
                    toast.success("Save success!");
                    me.chkSaved(true);
                    me.loadDBData();
                }

                return Boolean(true);
            },

            //undo, redo 스택의 모든 uid 중 현재 도형리스트에 없는 값을 del_yn = 'Y'로 업데이트
            updateDelBeforeSave: function () {
                // undo, redo 스택의 모든 도형리스트의 uid 값을 stackUidArrs 배열에 넣고
                // 현재 도형리스트의 uid 값을 currUidArrs 배열에 넣고
                // stackUidArrs중 currUidArrs 에 없는 uid 값은 del_yn = 'Y'로 업데이트
                let undoArrs = me.UndoStack;
                let redoArrs = me.RedoStack;
                let regArrs;
                let stackUidArrs = [];
                let currUidArrs = [];

                for (var undoCnt = 0; undoCnt < undoArrs.length; undoCnt++) {
                    regArrs = undoArrs[undoCnt].regions;
                    for (var regCnt = 0; regCnt < regArrs.length; regCnt++) {
                        stackUidArrs.push(regArrs[regCnt].uid);
                    }
                }

                for (var redoCnt = 0; redoCnt < redoArrs.length; redoCnt++) {
                    regArrs = redoArrs[redoCnt].regions;
                    for (var regCnt = 0; regCnt < regArrs.length; regCnt++) {
                        stackUidArrs.push(regArrs[regCnt].uid);
                    }
                }

                regArrs = me.objInfo.regions;
                for (var regCnt = 0; regCnt < regArrs.length; regCnt++) {
                    currUidArrs.push(regArrs[regCnt].uid);
                }

                // 배열중복 제거
                stackUidArrs = [...new Set(stackUidArrs)];
                currUidArrs = [...new Set(currUidArrs)];

                stackUidArrs = stackUidArrs.filter(val => !currUidArrs.includes(val));

                let reg;
                var param = {};
                var values = [];

                for (var regCnt = 0; regCnt < stackUidArrs.length; regCnt++) {
                    if (!stackUidArrs[regCnt].toString().toLowerCase().includes('temp')) {
                        values = [];
                        values.push({
                            annotation_id: stackUidArrs[regCnt],
                            del_yn: 'Y',
                        })

                        param = {
                            slide_id: Microdraw.slide_id,
                            annotation_list: values,
                        }

                        if (param.annotation_list.length > 0) {
                            axios.post(web_url + `/api/annotation/delete`, param)
                                .then((data) => {

                                });
                        }
                    }
                }
            },

            coordinateInfo: function (reg) {
                // reg.path.selected = false;
                var path = JSON.parse(reg.path.exportJSON())
                var coordinate_info = '';

                let imagePoint;
                let imageSize = me.imageSize;
                let projectPixel = me.projectSize;

                var segments = path[1].segments;
                var result = [];
                for (var segCnt = 0; segCnt < segments.length; segCnt++) {

                    // 도형이 selected 상태일때 segments 값이 달라져 다르게 계산
                    if (reg.path.type === 'COMMENTAREA') {
                        if (segCnt != 0 && segCnt != 2) {
                            continue;
                        }
                        if (reg.path.selected) {
                            // imagePoint = {x: segments[segCnt][0].x * imageSize.x / projectPixel.x, y: segments[segCnt][0].y * imageSize.y / projectPixel.y};
                            imagePoint = { x: segments[segCnt][0].x * imageSize.x / projectPixel.x, y: segments[segCnt][0].y * imageSize.y / projectPixel.y };
                        }
                        else {
                            imagePoint = { x: segments[segCnt][0][0] * imageSize.x / projectPixel.x, y: segments[segCnt][0][1] * imageSize.y / projectPixel.y };
                        }

                    }
                    else {
                        if (reg.path.selected) {
                            imagePoint = { x: segments[segCnt].x * imageSize.x / projectPixel.x, y: segments[segCnt].y * imageSize.y / projectPixel.y };
                        }
                        else {
                            imagePoint = { x: segments[segCnt][0] * imageSize.x / projectPixel.x, y: segments[segCnt][1] * imageSize.y / projectPixel.y };
                        }
                    }

                    if (!reg.path.type.includes('COMMENT')) {
                        if (imagePoint.x > Microdraw.imageSize.x) {
                            imagePoint.x = Microdraw.imageSize.x
                        }

                        if (imagePoint.y > Microdraw.imageSize.y) {
                            imagePoint.y = Microdraw.imageSize.y
                        }

                        if (imagePoint.x < 0) {
                            imagePoint.x = 0
                        }

                        if (imagePoint.y < 0) {
                            imagePoint.y = 0
                        }
                    }


                    result.push([Number(imagePoint.x.toFixed(4)), Number(imagePoint.y.toFixed(4))])
                    // path[1].segments[segCnt][0] = Number(imagePoint.x.toFixed(4));
                    // path[1].segments[segCnt][1] = Number(imagePoint.y.toFixed(4));
                }

                if (reg.path.type == "BBOX" || reg.path.type == "COMMENTBOX") {
                    var minX;
                    var minY;
                    var maxX;
                    var maxY;

                    minX = result[0][0];
                    minY = result[0][1];
                    maxX = result[0][0];
                    maxY = result[0][1];


                    for (var segCnt = 0; segCnt < segments.length; segCnt++) {
                        if (minX > result[segCnt][0]) {
                            minX = result[segCnt][0];
                        }

                        if (minY > result[segCnt][1]) {
                            minY = result[segCnt][1];
                        }

                        if (maxX < result[segCnt][0]) {
                            maxX = result[segCnt][0];
                        }

                        if (maxY < result[segCnt][1]) {
                            maxY = result[segCnt][1];
                        }
                    }

                    if (reg.path.type == "COMMENTBOX") {
                        coordinate_info = { "X": minX, "Y": minY, "W": Number((maxX - minX).toFixed(4)), "H": Number((maxY - minY).toFixed(4)) };
                    }
                    else {
                        coordinate_info = JSON.stringify({ "X": minX, "Y": minY, "W": Number((maxX - minX).toFixed(4)), "H": Number((maxY - minY).toFixed(4)) });
                    }

                    // coordinate_info = JSON.stringify({"X":minX,"Y":minY,"W":(maxX-minX),"H":(maxY-minY)});
                }
                else if (reg.path.type == "COMMENTAREA") {
                    coordinate_info = { "FROM": result[0], "TO": result[1] };
                }
                else {
                    // coordinate_info = JSON.stringify({"COORDINATE" : path[1].segments});
                    coordinate_info = JSON.stringify({ "COORDINATE": result });
                }
                return coordinate_info;
            },

            /**
             * @function load
             * @returns {void}
             */
            load: function () {
                if (me.debug) { console.log("> load"); }

                var i, obj, reg;
                if (localStorage.Microdraw) {
                    console.log("Loading data from localStorage");
                    obj = JSON.parse(localStorage.Microdraw);
                    for (i = 0; i < obj.Regions.length; i += 1) {
                        reg = {};
                        var json;
                        reg.name = obj.Regions[i].name;
                        reg.uid = obj.Regions[i].uid;
                        json = obj.Regions[i].path;
                        reg.path = new paper.Path();
                        reg.path.importJSON(json);
                        me.newRegion({
                            name: reg.name,
                            uid: reg.uid,
                            path: reg.path
                        });
                    }
                    paper.view.draw();
                }
            },

            /**
             * @function resizeAnnotationOverlay
             * @returns {void}
             */
            resizeAnnotationOverlay: function () {
                if (me.debug > 1) { console.log("> resizeAnnotationOverlay"); }

                var width = me.dom.querySelector("#paperjs-container").offsetWidth;
                var height = me.dom.querySelector("#paperjs-container").offsetHeight;
                me.dom.querySelector("canvas.overlay").offsetWidth = width;
                me.dom.querySelector("canvas.overlay").offsetHeight = height;
                paper.view.viewSize = [
                    width,
                    height
                ];
                me.transform();
            },

            /**
             * @function initAnnotationOverlay
             * @returns {void}
             */
            initAnnotationOverlay: function () {
                if (me.debug) { console.log("> initAnnotationOverlay"); }

                // do not start loading a new annotation if a previous one is still being loaded
                if (me.annotationLoadingFlag === true) {
                    return;
                }

                //console.log("new overlay size" + me.viewer.world.getItemAt(0).getContentSize());

                /*
                   Activate the paper.js project corresponding to this section. If it does not yet
                   exist, create a new canvas and associate it to the new project. Hide the previous
                   section if it exists.
               */


                // change current section index (for loading and saving)
                me.section = me.currentImage;
                me.fileID = `${me.source}`;

                // hide previous section
                if (me.prevImage && paper.projects[0]) {
                    paper.projects[0].activeLayer.visible = false;
                    paper.projects[0].view.element.style.display = "none";
                }

                // if this is the first time a section is accessed, create its canvas, its project,
                // and load its regions from the database

                // create canvas
                var canvas = document.createElement("canvas");
                canvas.classList.add("overlay");
                canvas.id = me.currentImage;
                me.dom.querySelector("#paperjs-container").appendChild(canvas);

                // create project
                paper.setup(canvas);
                paper.install(window);

                // resize the view to the correct size
                var width = me.dom.querySelector("#paperjs-container").offsetWidth;
                var height = me.dom.querySelector("#paperjs-container").offsetHeight;
                paper.view.viewSize = [
                    width,
                    height
                ];

                me.transform();

                let imageSize = me.viewer.viewport._contentSize;
                // let imageSize = new OpenSeadragon.Point(Microdraw.fileWidth, Microdraw.fileHeight);
                let viewportPoint = me.viewer.viewport.imageToViewportCoordinates(imageSize.x, imageSize.y);
                // let viewportPoint = me.viewer.viewport.imageToViewportCoordinates(imageSize.x * imageSize.x / me.fileWidth, imageSize.y * imageSize.y / me.fileHeight);
                let webPixel = me.viewer.viewport.pixelFromPoint(viewportPoint);
                // let webPixel = Microdraw.viewer.viewport.getContainerSize()
                let projectPixel = paper.view.viewToProject(webPixel)

                // me.imageSize = imageSize;
                me.imageSize = new OpenSeadragon.Point(Microdraw.fileWidth, Microdraw.fileHeight);
                me.projectSize = projectPixel;

                let viewportWebPixelMin = me.viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(0, 0))
                me.viewportWebPixel = {
                    xMin: viewportWebPixelMin.x, yMin: viewportWebPixelMin.y,
                    xMax: webPixel.x, yMax: webPixel.y,
                    width: webPixel.x - viewportWebPixelMin.x, height: webPixel.y - viewportWebPixelMin.y
                }


                me.umPerProjectPixelX = imageSize.x * me.umPerImagePixelX / projectPixel.x;


                //메뉴바 resize 감지
                new ResizeObserver(resizeAnnotationOverlay).observe(me.dom.querySelector('#paperjs-container'))
                new ResizeObserver(setPopupHeight).observe(me.dom.querySelector('#popup-object'))

                // load regions from database
                // me.loadDBData();
                me.objInfo.regions = []
                paper.projects[0].clear();
                me.annoSeq = 1;
                // me.chkSaved(true);

                // me.dbLabelLoad();
                // me.dbAnnotationLoad();
                // me.dbCommentLoad();

                if (me.debug) { console.log('Set up new project, currentImage: ' + me.currentImage + ', ID: ' + 0); }


                // activate the current section and make it visible
                paper.projects[0].activate();
                paper.project.activeLayer.visible = true;
                paper.project.view.element.style.display = "block";

                // resize the view to the correct size
                // var width = me.dom.querySelector("#paperjs-container").offsetWidth;
                // var height = me.dom.querySelector("#paperjs-container").offsetHeight;
                // paper.view.viewSize = [
                //     width,
                //     height
                // ];
                //점 크기 조절
                paper.settings.handleSize = Microdraw.handleSize;
                // me.updateRegionList();
                paper.view.draw();

                /**
                 * @todo Commenting this line out solves the image size issues set size of the current overlay to match the size of the current image
                 */

                //me.magicV = me.viewer.world.getItemAt(0).getContentSize().x / 100;

                // me.transform();
            },

            /**
             * @function transform
             * @returns {void}
             */
            transform: function () {
                //if( me.debug ) console.log("> transform");

                var z = me.viewer.viewport.viewportToImageZoom(me.viewer.viewport.getZoom(true));
                var sw = me.viewer.source.width;
                var bounds = me.viewer.viewport.getBounds(true);
                //    var bounds = {
                //       "x": -0.3500388048117966,
                //       "y": 0,
                //       "width": 1.7000776096235932,
                //       "height": 0.8041666666666667,
                //       "degrees": 0
                //   }
                const [x, y, w, h] = [
                    me.magicV * bounds.x,
                    me.magicV * bounds.y,
                    me.magicV * bounds.width,
                    me.magicV * bounds.height
                ];
                paper.view.setCenter(x + (w / 2), y + (h / 2));
                const temp = (sw * z) / me.magicV;
                if (temp !== NaN)
                    paper.view.zoom = temp
            },

            /**
             * @function deparam
             * @returns {Object} Returns an object containing URL parametres
             */
            deparam: function () {
                if (me.debug) { console.log("> deparam"); }

                /** @todo Use URLSearchParams instead */
                var search = location.search.substring(1);
                var result = search ?
                    JSON.parse('{"' + search.replace(/[&]/g, '","').replace(/[=]/g, '":"') + '"}',
                        function (key, value) { return key === "" ? value : decodeURIComponent(value); }) :
                    {};
                if (me.debug) {
                    console.log("url parametres:", result);
                }

                return result;
            },

            /**
             * @function initShortCutHandler
             * @returns {void}
             */
            initShortCutHandler: function () {
                window.addEventListener("keydown", e => {
                    if (e.keyCode !== 32 && (me.selectedTool == 'regionAdd' || me.selectedTool == 'regionSub')) {
                        me.tools[me.selectedTool].finishDrawingRegion(false);
                        me.selectedTool = me.prevTool;
                        me.updateCursor();
                    }

                    if (e.isComposing || e.keyCode === 229) {
                        return;
                    }

                    const key = [];
                    me.initCursor();
                    if (e.ctrlKey) { key.push("^"); }
                    if (e.altKey) { key.push("alt"); }
                    if (e.shiftKey) { key.push("shift"); }
                    if (e.metaKey) { key.push("cmd"); }
                    key.push(String.fromCharCode(e.keyCode));
                    const code = key.join(" ");
                    if (me.shortCuts[code]) {
                        const shortcut = me.shortCuts[code];
                        shortcut();
                        e.stopPropagation();
                    }

                    switch (e.keyCode) {
                        // ctrl
                        case 17: { key.push("^"); me.key = 'ctrl'; me.addCursor("move"); break; }
                        // r
                        case 82: {
                            if (me.isLocked) {
                                return false;
                            }

                            key.push("r");
                            me.key = 'r';
                            me.addCursor("grab");

                            break;
                        }
                        // shift
                        case 16: { break; }
                        // meta
                        case 91: { key.push("cmd"); break; }
                        // space
                        case 32: {
                            if (me.isLocked) {
                                return false;
                            }

                            key.push("space");
                            me.key = 'space';
                            me.addCursor("knife");

                            break;
                        }
                        // s
                        case 83: { key.push("s"); me.key = 's'; me.addCursor("default"); break; }
                        // arrow up
                        case 38: { me.labelSelector(true); break; }
                        // arrow down
                        case 40: { me.labelSelector(false); break; }
                        // esc
                        case 27: { me.closePopupAll(); break; }
                        case 187:
                        case 107://=|+
                            me.viewer.viewport.zoomBy(1.5);
                            me.viewer.viewport.applyConstraints();
                            return false;
                        case 189://-|_
                        case 109://-|_
                            me.viewer.viewport.zoomBy(0.5);
                            me.viewer.viewport.applyConstraints();
                            return false;
                        case 48://0|)
                        case 96://0|)
                            me.viewer.viewport.goHome();
                            me.viewer.viewport.applyConstraints();
                            return false;
                    }
                });

                window.addEventListener("keyup", e => {
                    me.key = '';
                    me.initCursor();

                    if (e.keyCode === 32 && me.selectedTool.includes('region') && me.region) {
                        if (me.selectedTool == 'regionAdd' || me.selectedTool == 'regionSub') {
                            me.tools[me.selectedTool].finishDrawingRegion(false);
                        }
                    }

                    me.selectedTool = me.prevTool;
                    // me.initCursor();
                    me.updateCursor();
                });
            },

            labelSelector: function (isUp) {
                let currFocus;
                let tabIndex;
                let targetDiv;

                if (Microdraw.dom.querySelector(`#labelDiv`).style.visibility == 'visible') {
                    targetDiv = 'labelDiv';
                }
                else if (Microdraw.dom.querySelector(`#labelDiv`).style.visibility == 'visible') {
                    targetDiv = 'changeLabelDiv';
                }

                currFocus = Microdraw.dom.querySelector(`#${targetDiv} :focus`).length ? Microdraw.dom.querySelector(`#${targetDiv} :focus`) : Microdraw.dom.querySelector(`#${targetDiv} .selected`)
                tabIndex = currFocus.prop('tabindex') ? currFocus.prop('tabindex') : 0;

                if (isUp) {
                    if (tabIndex == 0 || tabIndex == 1) {
                        tabIndex = Microdraw.dom.querySelector(`#${targetDiv} li`).length;
                    }
                    else {
                        tabIndex = tabIndex - 1;
                    }
                }
                else {
                    if (tabIndex == Microdraw.dom.querySelector(`#${targetDiv} li`).length) {
                        tabIndex = 1;
                    }
                    else {
                        tabIndex = tabIndex + 1;
                    }
                }
                Microdraw.dom.querySelector(`#${targetDiv} li[tabindex=${tabIndex}]`).focus();

            },

            chkSaved: function (boolSaved) {
                //새로고침, 뒤로가기 이벤트
                // window.history.pushState(null, '', location.href); 

                if (Microdraw.region?.path.type.includes('COMMENT')) {
                    return;
                }

                me.isSaved = boolSaved;

                if (me.isSaved) {
                    window.onbeforeunload = null;
                }
                else {

                    window.onbeforeunload = function (event) {
                        // console.log(event)
                        return '';
                    }
                }
            },

            /**
             * @function shortCutHandler
             * @param {string} theKey Key used for the shortcut
             * @param {function} callback Function called for the specific key shortcut
             * @returns {void}
             */
            shortCutHandler: function (theKey, callback) {
                var key = me.isMac ? theKey.mac : theKey.pc;
                var arr = key.split(" ");
                var i;
                for (i = 0; i < arr.length; i += 1) {
                    if (arr[i].charAt(0) === "#") {
                        arr[i] = String.fromCharCode(parseInt(arr[i].substring(1), 10));
                    } else
                        if (arr[i].length === 1) {
                            arr[i] = arr[i].toUpperCase();
                        }
                }
                key = arr.join(" ");
                me.shortCuts[key] = callback;
            },

            /**
             * @function loadConfiguration
             * @desc Load general Microdraw configuration
             * @returns {Promise<void[]>} returns a promise that resolves when the configuration is loaded
             */
            loadConfiguration: function () {
                return Promise.all([

                    // 1st promise in array: always load the default tools
                    Promise.all([
                        // me.loadScript("/lib/paperJs/jquery-1.11.0.min.js"),
                        me.loadScript("/lib/paperJs/paper-full-0.9.25.min.js"),
                        me.loadScript("/lib/paperJs/openseadragon-bin-2.4.2/openseadragon.js"),
                        // me.loadScript("https://code.jquery.com/ui/1.13.2/jquery-ui.js")
                    ])
                        .then(() => {
                            return me.loadScript("/lib/paperJs/openseadragon-viewerinputhook.min.js");
                        })
                        .then(() => {
                            for (let item of tools) {
                                Object.assign(Microdraw.tools, item)
                            }
                            window.Microdraw = Microdraw;

                            return Promise.all([
                                me.loadScript("/lib/paperJs/OpenSeadragonScalebar/openseadragon-scalebar.js"),
                                me.loadScript("https://cdn.jsdelivr.net/gh/r03ert0/Openseadragon-screenshot@v0.0.1/openseadragonScreenshot.js"),
                                me.loadScript("https://cdn.jsdelivr.net/gh/r03ert0/muijs@v0.1.1/mui.js"),
                            ]);
                        }),
                ]);
            },

            /**
             * @function loadScript
             * @desc Loads script from path if test is not fulfilled
             * @param {string} path Path to script, either a local path or a url
             * @param {function} testScriptPresent Function to test if the script is already present. If undefined, the script will be loaded.
             * @returns {promise} A promise fulfilled when the script is loaded
             */
            loadScript: function (path, testScriptPresent) {
                return new Promise(function (resolve, reject) {
                    if (testScriptPresent && testScriptPresent()) {
                        // console.log("[loadScript] Script", path, "already present, not loading it again");
                        resolve();
                    }
                    var s = document.createElement("script");
                    s.src = path;
                    s.onload = function () {
                        // console.log("Loaded", path);
                        resolve();
                    };
                    s.onerror = function () {
                        // console.log("Error", path);
                        reject(new Error("something bad happened"));
                    };
                    document.body.appendChild(s);
                });
            },

            calcPointMinMax: function (segments) {
                var minX;
                var minY;
                var maxX;
                var maxY;

                if (!segments) {
                    return;
                }

                minX = segments[0].point.x;
                minY = segments[0].point.y;
                maxX = segments[0].point.x;
                maxY = segments[0].point.y;

                for (var seg of segments) {
                    if (minX > seg.point.x) {
                        minX = seg.point.x;
                    }

                    if (minY > seg.point.y) {
                        minY = seg.point.y;
                    }

                    if (maxX < seg.point.x) {
                        maxX = seg.point.x;
                    }

                    if (maxY < seg.point.y) {
                        maxY = seg.point.y;
                    }
                }

                return { minX: minX, minY: minY, maxX: maxX, maxY: maxY, width: maxX - minX, height: maxY - minY }
            },

            updateFilters: function () {
                var filters = [
                    OpenSeadragon.Filters.BRIGHTNESS(Microdraw.dom.querySelector('#brightnessDiv .slider').slider("value")),
                    OpenSeadragon.Filters.CONTRAST(Microdraw.dom.querySelector('#contrastDiv .slider').slider("value"))
                ]

                me.dom.querySelector("#chkInvert").checked ? filters.push(OpenSeadragon.Filters.INVERT()) : '';
                me.dom.querySelector("#chkGray").checked ? filters.push(OpenSeadragon.Filters.GREYSCALE()) : '';


                me.viewer.setFilterOptions({
                    filters: {
                        processors: filters
                    },
                    loadMode: 'sync'
                });
            },

            togglePopup: function (id) {
                if (me.dom.querySelector(`#${id}`).style.visibility != "visible") {
                    me.dom.querySelector(`#${id}`).style.visibility = "visible"
                }
                else if (me.dom.querySelector(`#${id}`).style.visibility == "visible") {
                    me.dom.querySelector(`#${id}`).style.visibility = "hidden"
                }
            },

            unsavedAlert: function (e, isKeepImagePopup) {
                if (e.currentTarget.href != "javascript:") {
                    if (isKeepImagePopup) {
                        window.onunload = null;
                    }
                    if (me.isSaved && e.target.id != 'prevSlide' && e.target.id != 'nextSlide' && e.currentTarget.getAttribute('name') != 'popup-image-list') {
                        window.popupImageList?.close();
                    }
                    else if (!me.isSaved) {
                        e.preventDefault();
                        $.confirm({
                            title: '',
                            content: 'There are unsaved changes. Do you want to save before leaving this page?',
                            type: 'custom',
                            typeAnimated: true,
                            animation: 'none',
                            buttons: {
                                tryAgain: {
                                    text: 'SAVE',
                                    btnClass: 'btn-custom',
                                    action: async () => {
                                        if (await Microdraw.save()) {
                                            if (window.popupImageList && !window.popupImageList?.closed) {
                                                openImagePopup(e.currentTarget.search)
                                            }
                                            window.onbeforeunload = null;
                                            window.location = e.currentTarget.href;
                                            if (!isKeepImagePopup) {
                                                window.popupImageList?.close();
                                            }
                                        }
                                    }
                                },
                                close: {
                                    text: 'IGNORE',
                                    action: async () => {
                                        if (window.popupImageList && !window.popupImageList?.closed) {
                                            openImagePopup(e.currentTarget.search)
                                        }
                                        window.onbeforeunload = null;
                                        window.location = e.currentTarget.href;
                                        if (!isKeepImagePopup) {
                                            window.popupImageList?.close();
                                        }
                                    }
                                }
                            }
                        });
                    }
                    else {
                        if (window.popupImageList && !window.popupImageList?.closed) {
                            if (e.target.id == 'prevSlide' || e.target.id == 'nextSlide') {
                                openImagePopup(e.currentTarget.getAttribute('search'))
                            }
                            else {
                                openImagePopup(e.currentTarget.search)
                            }
                        }

                        window.location = e.currentTarget.href;
                    }
                }
            },


            /**
             * @function initMicrodraw
             * @returns {void}
             */
            initMicrodraw: async () => {

                if (me.debug) {
                    console.log("> initMicrodraw promise");
                }
                // 브라우저 새로고침, 닫힐 때
                window.onunload = function (event) {
                    window.popupImageList?.close();
                }

                window.name = 'annotation'

                me.initSetting = getSettingCookie() ? getSettingCookie() : me.initSetting;
                me.handleSize = me.initSetting.handleSize ?? 10;
                paper.settings.handleSize = me.handleSize;

                // Enable click on toolbar buttons
                Array.prototype.forEach.call(me.dom.querySelectorAll('#buttonsBlock div.mui.push'), (el) => {
                    el.addEventListener('click', me.toolSelection);
                });

                Array.prototype.forEach.call(me.dom.querySelectorAll('#buttonsBlock2 div.mui.push'), (el) => {
                    el.addEventListener('click', me.toolSelection);
                });

                Array.prototype.forEach.call(document.querySelectorAll('.topMenuArea li span'), (el) => {
                    el.addEventListener('click', me.statusSelection);
                });

                Array.prototype.forEach.call(me.dom.querySelectorAll('.close_btn'), (el) => {
                    el.addEventListener('click', function (e) {
                        me.dom.querySelector(`#${e.target.parentElement.id}`).style.visibility = 'hidden'
                        if (e.target.parentElement.id == 'popup-object') {
                            me.dom.querySelector(`#changeLabelDiv`).style.visibility = 'hidden'
                        }
                    });
                });

                me.dom.querySelector('#btnNavigator').addEventListener('click', me.toggleNavigator);




                me.dom.querySelector('#chkInvert, #chkGray').addEventListener('click',
                    e => { me.updateFilters(); }
                );

                me.dom.querySelector('#btnResetFilters').addEventListener('click',
                    e => {
                        Microdraw.dom.querySelector('#brightnessDiv .slider').slider("value", 0);
                        Microdraw.dom.querySelector('#contrastDiv .slider').slider("value", 1);
                        me.dom.querySelector('#chkInvert').checked = false;
                        me.dom.querySelector('#chkGray').checked = false;

                        me.updateFilters();
                    }
                );



                var observer = new MutationObserver(function (mutations) {
                    mutations.forEach(function (mutationRecord) {
                        Microdraw.dom.querySelector('#brightnessDiv .tooltip').css("left", "" + (Microdraw.dom.querySelector('#brightnessDiv span').offsetLeft - 5) + "px")
                    });

                });



                // let urlParams = new URLSearchParams('?trId=908&codeName=BRCA&hospitalCode=SS&filename=4&addCondition=Y&condition=worked&step=annotation&status=completed&page=1&pageLength=15&sortFilename=0&sortIsNasExist=0&sortHospitalCode=0&sortInfoYn=1&sortAnnotationYn=0&sortReviewYn=0&sortTerminationYn=0&sortAnnoCount=0&sortRevCount=0&sortTermCount=0');
                let urlParams = new URLSearchParams(window.location.search);
                // for (let p of params) {
                //     console.log(p);
                // }

                Microdraw.slide_id = urlParams.get('trId');

                let params = {
                    // tid: `${_tid}`,
                    slide_id: urlParams.get('trId'),
                    page: urlParams.get('page'),
                    pageLength: urlParams.get('pageLength'),
                    whereOptions: [],
                    orderOptions: [],
                    ssid: urlParams.get('condition') == 'worker' ? urlParams.get('ssid') : '',
                };

                let _sortState = {
                    filename: urlParams.get('sortFilename'),
                    is_nas_exist: urlParams.get('sortIsNasExist'),
                    hospital_code: urlParams.get('sortHospitalCode'),
                    memo_yn: urlParams.get('sortMemoYn'),
                    info_yn: urlParams.get('sortInfoYn'),
                    annotation_yn: urlParams.get('sortAnnotationYn'),
                    review_yn: urlParams.get('sortReviewYn'),
                    termination_yn: urlParams.get('sortTerminationYn'),
                    anno_count: urlParams.get('sortAnnoCount'),
                    rev_count: urlParams.get('sortRevCount'),
                    term_count: urlParams.get('sortTermCount')
                };

                let _form_datas = [
                    { where_key: 'tumorCode', where_value: urlParams.get('codeName'), where_type: '=' },
                    { where_key: 'hospital_code', where_value: urlParams.get('hospitalCode'), where_type: '=' },
                    { where_key: 'filename', where_value: urlParams.get('filename'), where_type: 'like' },
                    { where_key: 'condition', where_value: urlParams.get('condition'), where_type: '' },
                    { where_key: 'step', where_value: urlParams.get('step'), where_type: '' },
                    { where_key: 'status', where_value: urlParams.get('status'), where_type: '' }
                ]

                //Set OrderFields
                for (const [field, value] of Object.entries(_sortState)) {
                    if (value !== '0') {
                        let obj = {
                            column_name: field,
                            orderOption: `${value == 1 ? 'desc' : 'asc'}`,
                        };
                        params.orderOptions.push(obj);
                    }
                }

                //Set Where Fields Make
                for (let arr of _form_datas) {
                    if (arr.where_key != 'addCondition' && arr.where_value != '') {
                        params.whereOptions.push({
                            where_key: arr.where_key,
                            where_value: arr.where_value,
                            where_type: arr.where_type,
                        });
                    }
                }


                // set annotation loading flag to false
                me.annotationLoadingFlag = false;

                // Initialize the control key handler and set shortcuts
                //단축키
                me.initShortCutHandler();
                me.shortCutHandler({ pc: '^ z', mac: 'cmd z' }, me.cmdUndo);
                // me.shortCutHandler({pc:'shift ^ z', mac:'shift cmd z'}, me.cmdRedo);
                me.shortCutHandler({ pc: '^ y', mac: 'cmd y' }, me.cmdRedo);
                me.shortCutHandler({ pc: 'alt r', mac: 'alt r' }, function () {
                    me.clickTool('drawMeasurement');
                });
                me.shortCutHandler({ pc: 'alt t', mac: 'alt t' }, function () {
                    me.clickTool('transformImage');
                });
                me.shortCutHandler({ pc: 'alt l', mac: 'alt l' }, function () {
                    if (!window.popupImageList || window.popupImageList?.closed) {
                        openImagePopup(window.location.search)
                    }
                    else {
                        window.popupImageList.focus();
                    }
                });
                me.shortCutHandler({ pc: 'alt o', mac: 'alt o' }, function () {
                    me.togglePopup('popup-object');
                });
                me.shortCutHandler({ pc: 'alt m', mac: 'alt m' }, function () {
                    me.togglePopup('popup-memo');
                });
                me.shortCutHandler({ pc: 'alt i', mac: 'alt i' }, function () {
                    me.togglePopup('popup-info');
                    Microdraw.dom.querySelector("#labelDiv").style.visibility = 'hidden';
                    Microdraw.dom.querySelector("#changeLabelDiv").style.visibility = 'hidden';
                });
                me.shortCutHandler({ pc: 'alt h', mac: 'alt h' }, function () {
                    me.togglePopup('popup-hint');
                    Microdraw.dom.querySelector("#labelDiv").style.visibility = 'hidden';
                    Microdraw.dom.querySelector("#changeLabelDiv").style.visibility = 'hidden';
                    Microdraw.dom.querySelector("#popup-info").style.visibility = 'hidden';
                });
                if (me.config.drawingEnabled) {
                    me.shortCutHandler({ pc: '^ x', mac: 'cmd x' }, function () {

                    });
                    me.shortCutHandler({ pc: '^ v', mac: 'cmd v' }, me.cmdPaste);
                    me.shortCutHandler({ pc: '^ a', mac: 'cmd a' }, function () {

                    });
                    me.shortCutHandler({ pc: '^ c', mac: 'cmd c' }, me.cmdCopy);
                    me.shortCutHandler({ pc: '#46', mac: '#8' }, me.cmdDeleteSelected); // delete key
                }
                // me.shortCutHandler({pc:'#37', mac:'#37'}, me.loadPreviousImage); // left-arrow key
                // me.shortCutHandler({pc:'#39', mac:'#39'}, me.loadNextImage); // right-arrow key

                // Configure currently selected tool
                me.prevTool = "select";
                me.selectedTool = "select";

                document.body.dataset.toolbardisplay = "left";

                // Consolita.init(me.dom.querySelector("#logScript"), me.dom);



                // Load regions label set
                // 색깔 관련
                // const res = await fetch("/js/paperJs/10regions.json");
                // const labels = await res.json();
                // me.ontology = labels;
                // me.updateLabelDisplay();
            },

            //tool background 제거
            initToolSelection: function () {
                Array.prototype.forEach.call(me.dom.querySelectorAll('#buttonsBlock div.mui.push'), (el) => {
                    el.classList.remove("selected")
                });
            },

            //마우스 포인터 초기화
            initCursor: function () {
                var classList = me.dom.querySelectorAll('.openseadragon-canvas canvas')[0]?.classList.value.split(' ')
                classList?.forEach((value, index) => {
                    if (value != "") {
                        me.dom.querySelectorAll('.openseadragon-canvas canvas')[0]?.classList.remove(value)
                    }
                });
            },

            addCursor: function (classNm) {
                Microdraw.dom.querySelectorAll('.openseadragon-canvas canvas')[0].classList.add(classNm);
            },

            //선택한 tool에 따라 마우스 포인터 변경
            updateCursor: function () {
                if (me.isLocked) {
                    return;
                }

                var tool = Microdraw.selectedTool;
                if (tool.indexOf("draw") == 0) {
                    me.addCursor("crosshair");
                }

                if (tool == "rotate") {
                    me.addCursor("grab");
                }

                if (tool == "move") {
                    me.addCursor("move");
                }

                if (tool == 'region') {
                    me.addCursor("knife")
                }

                if (tool == 'select') {
                    me.addCursor("default")
                }
            },

            updateUndoStack: function () {
                if (me.UndoStack.length > 0) {
                    let undoArrs = me.UndoStack;
                    let regArrs;
                    let reg;
                    for (var undoCnt = 0; undoCnt < undoArrs.length; undoCnt++) {
                        regArrs = undoArrs[undoCnt].regions;
                        for (var regCnt = 0; regCnt < regArrs.length; regCnt++) {
                            reg = regArrs[regCnt];
                            if (me.region.annoSeq == reg.annoSeq) {
                                reg.hex = me.region.hex;
                                reg.labelNo = me.region.labelNo;
                                reg.labelName = me.region.labelName;
                                continue;
                            }
                        }
                    }
                }

                if (me.RedoStack.length > 0) {
                    let redoArrs = me.RedoStack;
                    let regArrs;
                    let reg;
                    for (var redoCnt = 0; redoCnt < redoArrs.length; redoCnt++) {
                        regArrs = redoArrs[redoCnt].regions;
                        for (var regCnt = 0; regCnt < regArrs.length; regCnt++) {
                            reg = regArrs[regCnt];
                            if (me.region.annoSeq == reg.annoSeq) {
                                reg.hex = me.region.hex;
                                reg.labelNo = me.region.labelNo;
                                reg.labelName = me.region.labelName;
                                continue;
                            }
                        }
                    }
                }
            },

            //주석 현황 최신화
            currentRegions: function (unscrollFlag) {
                Microdraw.updateLabelBar();
                if (me.dom.querySelector("#popup-object").style.visibility == 'visible') {
                    Microdraw.objectListPopup();
                }

                //unscrollFlag true로 넘겨주면 scrolltop 동작 안함 
                Microdraw.selectedRegInfo(unscrollFlag);

            },

            selectedRegInfo: function (unscrollFlag) {
                let reg;
                let del_cnt = 0;

                for (var regCnt = 0; regCnt < me.objInfo.regions.length; regCnt++) {
                    reg = me.objInfo.regions[regCnt];
                    reg.text.position = reg.path.position;

                    if (reg.del_yn == "Y") {
                        del_cnt += 1;
                    }
                    if (reg.path.selected && !unscrollFlag) {
                        Microdraw.dom.querySelector('#popup-object .list').scrollTop((regCnt - del_cnt) * 65)
                    }
                }

                paper.view.draw();
            },

            // 도형 면적 구하기 신발끈 공식
            // Math.abs((x1*y2 + x2*y3 + x3*y1) - (x2*y1 + x3*y2 + x1*y3)) * 0.5 * me.umPerProjectPixelX * me.umPerProjectPixelX
            calcRegArea: function (reg) {
                let point;
                let pointNext;
                let segArrs = [...reg.path.segments];
                segArrs.push(segArrs[0]);

                let area1 = 0;
                let area2 = 0;

                for (var segCnt = 0; segCnt < segArrs.length - 1; segCnt++) {
                    point = segArrs[segCnt].point;
                    pointNext = segArrs[segCnt + 1].point;

                    area1 += point.x * pointNext.y;
                    area2 += point.y * pointNext.x;
                }

                reg.area = Math.abs(area1 - area2) * 0.5 * me.umPerProjectPixelX * me.umPerProjectPixelX;
            },

            //우측 라벨명 숨김/보임 목록
            updateLabelBar: function () {
                let labelArr = [];

                let labelList = {};
                let labelNo;
                // me.dom.querySelectorAll("#labelBar div").forEach(
                //     e => e.remove()
                // );



                // 현재 주석 기준으로 labelNo, labelName, hex 배열화
                for (var regCnt = 0; regCnt < me.objInfo.regions.length; regCnt++) {
                    if (me.objInfo.regions[regCnt].del_yn == "N") {
                        labelArr.push({ labelNo: me.objInfo.regions[regCnt].labelNo, labelName: me.objInfo.regions[regCnt].labelName, hex: me.objInfo.regions[regCnt].hex });
                    }
                }

                // 배열중복 제거
                labelArr = [...new Set(labelArr.map(JSON.stringify))].map(JSON.parse);

                // 라벨바에서 현재 주석에 없는 라벨은 remove
                // else labelList에 목록 넣음
                me.dom.querySelectorAll("#labelBar div").forEach(
                    function (element) {
                        let cnt = 0;
                        labelArr.forEach(function (e) {
                            if (e.labelNo == element.getAttribute('data-label-no')) {
                                cnt++;
                            }
                        });

                        if (cnt == 0) {
                            element.remove();
                        }
                        else {
                            labelNo = element.getAttribute('data-label-no');
                            labelList[labelNo] = labelNo;
                        }
                    }
                );

                var el = document.createElement("div");
                var elChkBox;
                var elLabel;

                for (var arrCnt = 0; arrCnt < labelArr.length; arrCnt++) {
                    // labelBar에 없는 라벨div를 새로 추가
                    if (labelList[labelArr[arrCnt].labelNo] === undefined) {
                        el = document.createElement("div");
                        el.setAttribute('data-label-no', labelArr[arrCnt].labelNo ? labelArr[arrCnt].labelNo : '');
                        el.setAttribute('data-label-nm', labelArr[arrCnt].labelName);
                        el.setAttribute('data-hex', labelArr[arrCnt].hex);

                        elChkBox = document.createElement("input");
                        elChkBox.setAttribute('type', 'checkbox');
                        elChkBox.setAttribute('name', 'checker');
                        elChkBox.setAttribute('class', 'chk');
                        elChkBox.setAttribute('checked', true);
                        elChkBox.setAttribute('id', 'labelChk' + (labelArr[arrCnt].labelNo ? labelArr[arrCnt].labelNo : labelArr[arrCnt].labelName));
                        el.append(elChkBox);

                        elLabel = document.createElement("label");
                        elLabel.setAttribute('for', 'labelChk' + (labelArr[arrCnt].labelNo ? labelArr[arrCnt].labelNo : labelArr[arrCnt].labelName));
                        elLabel.innerText = labelArr[arrCnt].labelName;
                        elLabel.style.color = 'rgb(' + me.hexToRgb(labelArr[arrCnt].hex) + ')';
                        el.append(elLabel);

                        el.addEventListener("click", function () {
                            if (Microdraw.drawingPolygonFlag === true) {
                                finishDrawingPolygon(true);
                            }

                            if (Microdraw.drawingPointFlag === true) {
                                finishDrawingPoint(true);
                            }

                            for (var regCnt = 0; regCnt < me.objInfo.measurements.length; regCnt++) {
                                if (me.objInfo.measurements[regCnt].labelNo == this.getAttribute('data-label-no')) {
                                    me.objInfo.measurements[regCnt].path.selected = false

                                    if (!this.children[0].checked) {
                                        me.objInfo.measurements[regCnt].path.visible = false;
                                        me.objInfo.measurements[regCnt].text.visible = false;
                                    }
                                    else {
                                        me.objInfo.measurements[regCnt].path.visible = true;
                                        me.objInfo.measurements[regCnt].text.visible = true;
                                    }
                                }
                            }

                            for (var regCnt = 0; regCnt < me.objInfo.regions.length; regCnt++) {
                                if (me.objInfo.regions[regCnt].del_yn == "N") {
                                    if (me.objInfo.regions[regCnt].labelNo == this.getAttribute('data-label-no')) {
                                        me.objInfo.regions[regCnt].path.selected = false

                                        if (!this.children[0].checked) {
                                            me.objInfo.regions[regCnt].path.visible = false;
                                            me.objInfo.regions[regCnt].text.visible = false;
                                        }
                                        else {
                                            me.objInfo.regions[regCnt].path.visible = true;
                                            me.objInfo.regions[regCnt].text.visible = true;
                                        }

                                    }
                                }
                            }
                            me.selectedRegInfo();
                            paper.view.draw();
                        });

                        me.dom.querySelector("#labelBar").append(el);
                    }
                }
            },

            updateLatestStatus: function () {
                //status DB값으로 최신 작업, 상태 구분
                if (Microdraw.statusInfo.termination_yn == "Y") {
                    Microdraw.latestWork = "Termination";
                    Microdraw.latestStatus = "complete";
                }
                else if (Microdraw.statusInfo.termination_ssid !== null && Microdraw.statusInfo.termination_utc_dtm === null) {
                    Microdraw.latestWork = "Termination";
                    Microdraw.latestStatus = "progressing";
                }
                else if (Microdraw.statusInfo.review_yn == "Y") {
                    Microdraw.latestWork = "Review";
                    Microdraw.latestStatus = "complete";
                }
                else if (Microdraw.statusInfo.review_ssid !== null && Microdraw.statusInfo.review_utc_dtm === null) {
                    Microdraw.latestWork = "Review";
                    Microdraw.latestStatus = "progressing";
                }
                else if (Microdraw.statusInfo.annotation_yn == "Y") {
                    Microdraw.latestWork = "Annotation";
                    Microdraw.latestStatus = "complete";
                }
                else if (Microdraw.statusInfo.annotation_ssid !== null && Microdraw.statusInfo.annotation_utc_dtm === null) {
                    Microdraw.latestWork = "Annotation";
                    Microdraw.latestStatus = "progressing";
                }
                else {
                    Microdraw.latestWork = "Object List";
                    Microdraw.latestStatus = "";
                }
            },

            listUpLabelByCoordinateKindCd: function (coordinate_kind_cd, targetDiv) {
                me.dom.querySelector(`${targetDiv} ul`).innerHTML = '';

                coordinate_kind_cd = coordinate_kind_cd.toLowerCase()
                let labelList = me.labelInfo[coordinate_kind_cd];

                for (var labelCnt = 0; labelCnt < labelList.length; labelCnt++) {
                    element = document.createElement("li");
                    element.setAttribute('data-label-no', labelList[labelCnt].label_id);
                    element.setAttribute('data-label-nm', labelList[labelCnt].label_nm);
                    element.setAttribute('data-hex', labelList[labelCnt].rgb_hex);
                    element.setAttribute('tabindex', labelCnt + 1);

                    if (labelList[labelCnt].label_id == me.labelSelected[coordinate_kind_cd].labelNo) {
                        element.className = 'selected'
                    }

                    elSpan = document.createElement("span");
                    elSpan.style.backgroundColor = 'rgb(' + me.hexToRgb(labelList[labelCnt].rgb_hex) + ')';
                    element.append(elSpan);

                    element.innerHTML = element.innerHTML + labelList[labelCnt].label_nm + ' (' + labelList[labelCnt].label_desc + ')';

                    if (targetDiv == '#labelDiv') {
                        element.addEventListener("keydown", function (e) {
                            if (e.keyCode == 13) {
                                me.dom.querySelectorAll(`${targetDiv} li`).forEach(
                                    e => e.classList.remove('selected')
                                );

                                me.labelSelected[coordinate_kind_cd] = { labelNo: this.getAttribute('data-label-no'), labelName: this.getAttribute('data-label-nm'), hex: this.getAttribute('data-hex') }
                                $(this).addClass('selected')
                                me.dom.querySelector(`${targetDiv}`).style.visibility = 'hidden';
                            }
                        });

                        element.addEventListener("click", function () {
                            me.dom.querySelectorAll(`${targetDiv} li`).forEach(
                                e => e.classList.remove('selected')
                            );

                            me.labelSelected[coordinate_kind_cd] = { labelNo: this.getAttribute('data-label-no'), labelName: this.getAttribute('data-label-nm'), hex: this.getAttribute('data-hex') }
                            $(this).addClass('selected')
                            me.dom.querySelector(`${targetDiv}`).style.visibility = 'hidden';
                        });
                    }

                    else if (targetDiv == '#changeLabelDiv') {
                        element.addEventListener("keydown", function (e) {
                            if (e.keyCode == 13) {
                                me.region.hex = this.getAttribute('data-hex');
                                me.region.labelNo = Number(this.getAttribute('data-label-no'));
                                me.region.labelName = this.getAttribute('data-label-nm');

                                me.region.path.strokeColor = 'rgba(' + me.hexToRgb(this.getAttribute('data-hex') ? this.getAttribute('data-hex') : 50, 94, 228) + ',' + 1 + ')'
                                // me.region.path.fillColor = 'rgba(' + me.hexToRgb(this.getAttribute('data-hex')? this.getAttribute('data-hex') : 50, 94, 228) + ',' + 0.1+ ')';

                                if (me.region.path.type == 'POINT') {
                                    me.region.path.fillColor = 'rgba(' + me.hexToRgb(this.getAttribute('data-hex') ? this.getAttribute('data-hex') : '0, 0, 80') + ',' + 0 + ')';
                                }

                                else {
                                    me.region.path.fillColor = 'rgba(' + me.hexToRgb(this.getAttribute('data-hex') ? this.getAttribute('data-hex') : '0, 0, 80') + ',' + Microdraw.dom.querySelector('#opacityDiv .slider').slider('value') + ')';
                                }

                                me.dom.querySelector("#popup-object").style.overflow = 'hidden';
                                me.dom.querySelector("#changeLabelDiv").style.visibility = 'hidden';

                                me.updateUndoStack();
                                me.currentRegions(true);
                                paper.view.draw();
                            }
                        });

                        element.addEventListener("click", function () {
                            me.region.hex = this.getAttribute('data-hex');
                            me.region.labelNo = Number(this.getAttribute('data-label-no'));
                            me.region.labelName = this.getAttribute('data-label-nm');

                            me.region.path.strokeColor = 'rgba(' + me.hexToRgb(this.getAttribute('data-hex') ? this.getAttribute('data-hex') : 50, 94, 228) + ',' + 1 + ')'
                            // me.region.path.fillColor = 'rgba(' + me.hexToRgb(this.getAttribute('data-hex')? this.getAttribute('data-hex') : 50, 94, 228) + ',' + 0.1+ ')';

                            if (me.region.path.type == 'POINT') {
                                me.region.path.fillColor = 'rgba(' + me.hexToRgb(this.getAttribute('data-hex') ? this.getAttribute('data-hex') : '0, 0, 80') + ',' + 0 + ')';
                            }

                            else {
                                me.region.path.fillColor = 'rgba(' + me.hexToRgb(this.getAttribute('data-hex') ? this.getAttribute('data-hex') : '0, 0, 80') + ',' + Microdraw.dom.querySelector('#opacityDiv .slider').slider('value') + ')';
                            }

                            me.dom.querySelector("#popup-object").style.overflow = 'hidden';
                            me.dom.querySelector("#changeLabelDiv").style.visibility = 'hidden';

                            me.updateUndoStack();
                            me.currentRegions(true);
                            paper.view.draw();
                        });
                    }

                    me.dom.querySelector(`${targetDiv} ul`).append(element);


                    // element2 = document.createElement("li");
                    // element2.setAttribute('data-label-no', me.labelInfo[labelCnt].label_id);
                    // element2.setAttribute('data-label-nm', me.labelInfo[labelCnt].label_nm);
                    // element2.setAttribute('data-hex', me.labelInfo[labelCnt].rgb_hex);
                    // element2.setAttribute('tabindex', labelCnt+1);

                    // elSpan = document.createElement("span");
                    // elSpan.style.backgroundColor = 'rgb(' + me.hexToRgb(me.labelInfo[labelCnt].rgb_hex) + ')';
                    // element2.append(elSpan);

                    // element2.innerHTML = element2.innerHTML + me.labelInfo[labelCnt].label_nm + ' (' + me.labelInfo[labelCnt].label_desc + ')';                      

                    // element2.addEventListener("keydown", function(e) {
                    //     if (e.keyCode == 13) {
                    //         me.region.hex = this.getAttribute('data-hex');
                    //         me.region.labelNo = Number(this.getAttribute('data-label-no'));
                    //         me.region.labelName = this.getAttribute('data-label-nm');

                    //         me.region.path.strokeColor = 'rgba(' + me.hexToRgb(this.getAttribute('data-hex')? this.getAttribute('data-hex') : 50, 94, 228) + ',' + 1 + ')'
                    //         me.region.path.fillColor = 'rgba(' + me.hexToRgb(this.getAttribute('data-hex')? this.getAttribute('data-hex') : 50, 94, 228) + ',' + 0.1+ ')';

                    //         me.dom.querySelector("#popup-object").style.overflow = 'hidden';
                    //         me.dom.querySelector("#changeLabelDiv").style.visibility = 'hidden';

                    //         me.updateUndoStack();
                    //         me.currentRegions(true);
                    //         paper.view.draw();
                    //     }
                    // });

                    // element2.addEventListener("click", function() {
                    //     me.region.hex = this.getAttribute('data-hex');
                    //     me.region.labelNo = Number(this.getAttribute('data-label-no'));
                    //     me.region.labelName = this.getAttribute('data-label-nm');

                    //     me.region.path.strokeColor = 'rgba(' + me.hexToRgb(this.getAttribute('data-hex')? this.getAttribute('data-hex') : 50, 94, 228) + ',' + 1 + ')'
                    //     me.region.path.fillColor = 'rgba(' + me.hexToRgb(this.getAttribute('data-hex')? this.getAttribute('data-hex') : 50, 94, 228) + ',' + 0.1+ ')';

                    //     me.dom.querySelector("#popup-object").style.overflow = 'hidden';
                    //     me.dom.querySelector("#changeLabelDiv").style.visibility = 'hidden';

                    //     me.updateUndoStack();
                    //     me.currentRegions(true);
                    //     paper.view.draw();
                    // });



                    // me.dom.querySelector("#changeLabelDiv ul").append(element2);
                }
            },


            /**
             * @function initOpenSeadragon
             * @param {Object} obj DZI json configuration object
             * @returns {void}
             */
            initOpenSeadragon: function () {
                // "tileSources": [
                //    "/test_data/cat.dzi",
                //    "/test_data/doge.dzi"
                // ],
                // "pixelsPerMeter": 1000000 / me.umPerImagePixelX,
                // //   "fileID": "cat",
                // "slide_url": me.slide_url
                let pixelsPerMeter = 1000000 / me.umPerImagePixelX;
                let slide_url = me.slide_url


                me.viewer = new OpenSeadragon({
                    // id: "openseadragon1",
                    element: me.dom.querySelector("#openseadragon1"),
                    prefixUrl: "/lib/paperJs/openseadragon-bin-2.4.2/images/",
                    // tileSources: [],
                    tileSources: {
                        // tileSource: deepcis_url + slide_url
                        type: 'image',
                        //  url: Microdraw.jpegFilePath
                        // url: 'http://localhost:3000/images/user.png'
                    },
                    crossOriginPolicy: '*',
                    showReferenceStrip: false,
                    referenceStripSizeRatio: 0.2,
                    showNavigator: true,
                    sequenceMode: false,
                    // navigatorId: "myNavigator",
                    navigatorPosition: "BOTTOM_LEFT",
                    homeButton: "homee",
                    maxZoomPixelRatio: 10,
                    preserveViewport: false,
                    maxZoomLevel: 30,
                    animationTime: 0.5,
                    maxImageCacheCount: 400,
                });

                // me.viewer.addHandler('fully-loaded-change', function() {
                //     var tiledImage = viewer.world.getItemAt(0);
                //     if (tiledImage.getFullyLoaded()) {
                //         Microdraw.loadDBData();
                //     } 
                //     // else {
                //     //   tiledImage.addOnceHandler('fully-loaded-change', hideLoading);
                //     // }
                // });

                // open the currentImage
                // me.viewer.open(me.ImageInfo[me.currentImage].source);
                // me.viewer.open(`https://deepcis.codipai.org` + slide_url);

                // Microdraw.viewer.scalebar({
                //     // location: OpenSeadragon.ScalebarLocation.NONE,
                //     type: OpenSeadragon.ScalebarType.MICROSCOPE,
                //     minWidth:'150px',
                //     pixelsPerMeter: 1000000 / (Microdraw.fileWidth),
                //     color:'black',
                //     fontColor:'black',
                //     backgroundColor:"rgba(255, 255, 255, 0.5)",
                //     barThickness:4,
                //     location: OpenSeadragon.ScalebarLocation.CUSTOM_BOTTOM_RIGHT,
                //     xOffset:24,
                //     yOffset:24,
                //     unit: 'px'
                //   });
                // add the scalebar

                // if (me.umPerImagePixelX != 0) {
                //     me.viewer.scalebar({
                //         type: OpenSeadragon.ScalebarType.MICROSCOPE,
                //         minWidth:'150px',
                //         pixelsPerMeter:obj.pixelsPerMeter,
                //         color:'black',
                //         fontColor:'black',
                //         backgroundColor:"rgba(255, 255, 255, 0.5)",
                //         barThickness:4,
                //         location: OpenSeadragon.ScalebarLocation.CUSTOM_BOTTOM_RIGHT,
                //         xOffset:24,
                //         yOffset:24
                //     });

                //     /* fixes https://github.com/r03ert0/Microdraw/issues/142  */
                //     me.viewer.scalebarInstance.divElt.style.pointerEvents = `none`;
                // }

                // add screenshot
                me.viewer.screenshot({
                    showOptions: false, // Default is false
                    // keyboardShortcut: 'p', // Default is null
                    // showScreenshotControl: true // Default is true
                });

                // add handlers: update section name, animation, page change, mouse actions
                me.viewer.addHandler('open', function () {
                    me.initAnnotationOverlay();
                });
                me.viewer.addHandler('animation', function () {
                    me.transform();
                });
                me.viewer.addHandler("animation-start", function () {
                    me.isAnimating = true;
                });
                me.viewer.addHandler("animation-finish", function () {
                    me.isAnimating = false;
                });
                me.viewer.addHandler("page", function (data) {
                    console.log(data.page, me.params.tileSources[data.page]);
                });
                me.viewer.addViewerInputHook({
                    hooks: [
                        { tracker: 'viewer', handler: 'clickHandler', hookHandler: me.clickHandler },
                        { tracker: 'viewer', handler: 'dblClickHandler', hookHandler: me.dblClickHandler },
                        { tracker: 'viewer', handler: 'pressHandler', hookHandler: me.pressHandler },
                        { tracker: 'viewer', handler: 'releaseHandler', hookHandler: me.releaseHandler },
                        { tracker: 'viewer', handler: 'dragHandler', hookHandler: me.dragHandler },
                        { tracker: 'viewer', handler: 'moveHandler', hookHandler: me.moveHandler },
                        // {tracker: 'viewer', handler: 'dragEndHandler', hookHandler: me.dragEndHandler},
                        { tracker: 'viewer', handler: 'scrollHandler', hookHandler: me.scrollHandler }
                    ]
                });

                me.canvasOrigin = Microdraw.dom.querySelector('#openseadragon1 canvas').getContext('2d', { willReadFrequently: true })
                me.canvasZoom = Microdraw.dom.querySelector('#test1').getContext('2d', { willReadFrequently: true })
                me.canvasTemp = Microdraw.dom.querySelector('#test2').getContext('2d', { willReadFrequently: true })

                if (me.debug) {
                    console.log("< initOpenSeadragon resolve: success");
                }

                // $('#content-loading').fadeOut();
            },

            toggleNavigator: function () {
                if (this.className.includes('reduce')) {
                    this.className = this.className.replace('reduce', 'expand');
                    me.dom.querySelector('.navigator').style.visibility = 'hidden'
                }
                else if (this.className.includes('expand')) {
                    this.className = this.className.replace('expand', 'reduce');
                    me.dom.querySelector('.navigator').style.visibility = 'visible'
                }
            },

            init: function (dom) {
                me.dom = dom;
                me.loadConfiguration()
                    .then(async function () {
                        if (me.config.useDatabase) {
                            Promise.all([]) // [MicrodrawDBIP(), MyLoginWidget.init()]
                                .then(function () {
                                    me.params = me.deparam();
                                    me.section = me.currentImage;
                                    me.source = me.params.source;
                                    if (typeof me.params.project !== 'undefined') {
                                        me.project = me.params.project;
                                    }
                                    // updateUser();
                                })
                                .then(async function () {
                                    await me.initMicrodraw()
                                    //   me.initAnnotationOverlay();
                                    //   await me.dbSlideInfoLoad()  
                                    //   await me.dbStatusLoad()
                                    //   // await me.dbDeepzoomInformationLoad()
                                    me.initOpenSeadragon()
                                    //   me.objectListPopup()
                                    //   me.memoPopup()
                                    //   // let resultCode = await me.dbSlideInfoLoad()
                                    //   // if (resultCode == 200) {    
                                    //   //     await me.dbStatusLoad()
                                    //   //     await me.dbDeepzoomInformationLoad()
                                    //   //     me.objectListPopup()
                                    //   //     me.memoPopup()
                                    //   // }
                                    //   // // deepzoom에서 요청 이미지가 다운로드 중인 경우 423 코드로 리턴됨.
                                    //   // else if (resultCode == 423) {   
                                    //   //     me.dom.querySelector("#openseadragon1").innerText = 'File is already being downloaded. Please refresh (F5) a little later.';
                                    //   // }
                                    //   $('#content-loading').fadeOut();
                                }

                                )
                        } else {
                            me.params = me.deparam();
                            me.initMicrodraw();
                        }
                    })

                // if (!$('#main-lnb, .ham, .link-logo-sub').attr('class').includes('active')) {
                //     $('#main-lnb, .ham, .link-logo-sub').toggleClass('active');
                //     $('.layout-lnb>ul>li>ul.list-menu-sub').slideUp();
                // }

            },

            // 영역 교차여부 판별 (전체)
            validateIntersect: function () {
                for (let reg of me.objInfo.regions) {
                    if (reg['del_yn'] == 'N' && reg.path.type == 'SEG') {
                        var newPath = reg.path.unite(new paper.Path());

                        if (newPath?.children) {
                            newPath.remove();
                            me.selectRegion(reg);

                            Microdraw.viewer.viewport.centerSpringX.target.value = reg.path.position.x / 1000;
                            Microdraw.viewer.viewport.centerSpringY.target.value = reg.path.position.y / 1000;

                            customAlert('Some areas intersect with each other. Please solve the intersection area.')
                            return false;
                        }
                        newPath?.remove();
                    }
                }
                return true;
            }
        };

        return me;
    }

    const ready = async () => {
        Microdraw = function () {
            var popupObjectInit = { top: '192px', left: '24px', width: '320px', height: '496px' };
            var popupMemoInit = { top: '192px', right: '24px', width: '320px', height: '496px' };
            var me = {
                debug: 0,
                objInfo: {
                    regions: [],
                    measurements: [],
                    comments: [],
                },               // regions, and projectID (for the paper.js canvas) for each sections, can be accessed by the section name. (e.g. me.ImageInfo[me.imageOrder[viewer.current_page()]])
                // regions contain a paper.js path, a unique ID and a name
                imageOrder: [],              // names of sections ordered by their openseadragon page numbers
                currentImage: 1,          // name of the current image
                prevImage: null,             // name of the last image
                region: null,                // currently selected region (one element of Regions[])
                regionCircle: null,
                objComment: null,
                prevRegion: null,
                copyRegion: null,            // clone of the currently selected region for copy/paste
                handle: null,                // currently selected control point or handle (if any)
                handleFrom: null,            // currently selected control point or handle (drawComment)
                handleTo: null,              // currently selected control point or handle (drawComment)
                prevTool: null,
                selectedTool: null,          // currently selected tool
                viewer: null,                // open seadragon viewer
                isAnimating: false,          // flag indicating whether there an animation going on (zoom, pan)
                navEnabled: true,            // flag indicating whether the navigator is enabled (if it's not, the annotation tools are)
                magicV: 1000,                // resolution of the annotation canvas - is changed automatically to reflect the size of the tileSource
                params: null,                // URL parameters
                source: null,                // data source
                section: null,               // section index in a multi-section dataset
                UndoStack: [],
                RedoStack: [],
                mouseUndo: null,             // tentative undo information.
                shortCuts: [],               // List of shortcuts
                newRegionFlag: null,         // true when a region is being drawn
                drawingPolygonFlag: false,   // true when drawing a polygon
                drawingPointFlag: false,       // true when drawing a Point
                annotationLoadingFlag: null, // true when an annotation is being loaded
                config: {
                    "useDatabase": true,
                    "hideToolbar": false,
                    "regionOntology": true,
                    "drawingEnabled": true,
                    "removeTools": [],
                    "multiImageSave": true,
                    defaultStrokeColor: 'black',
                    defaultStrokeWidth: 1,
                    defaultFillAlpha: 0.1
                },                  // App configuration object
                tolerance: 10,
                counter: 1,
                tap: false,
                currentColorRegion: null,
                tools: {},
                imageSize: [],
                projectSize: [],
                key: '',
                annoSeq: 1,
                msrSeq: 1,
                commentSeq: 1,
                labelInfo: {
                    point: [], line: [], bbox: [], seg: []
                },
                labelUnknown: '',
                labelSelected: {
                    point: '', line: '', bbox: '', seg: ''
                },
                statusInfo: {},
                isLocked: false,
                isSaved: true,
                latestWork: '',
                latestStatus: '',
                initPopupFlag: true,
                umPerImagePixelX: 0,
                umPerProjectPixelX: 1,
                settingCookie: 'codipai_annotation',
                initSetting: {
                    opacity: 0.1, strokeWidth: 1, handleSize: 10
                    , 'popup-object': popupObjectInit
                    , 'popup-memo': popupMemoInit
                },
                tempCanvas: null,
                canvasOrigin: null,
                canvasZoom: null,
                canvasTemp: null,
                isPressed: false,
                handleSize: null,
                viewportWebPixel: {},
                imageType: 'jpeg',
                jpegFilePath: '',
                color: {
                    commentArea: 'rgba(0,0,0,0.1)',
                    commentBox: 'rgba(230,230,230,1)'
                },

                /*
                  Region handling functions
                */

                /**
                 * @function debugPrint
                 * @param {string} msg Message to print to console.
                 * @param {int} level Minimum debug level to print.
                 * @returns {void}
                 */
                debugPrint: function (msg, level) {
                    if (me.debug >= level) {
                        console.log(msg);
                    }
                },

                /**
                 * @function selectRegion
                 * @desc Make the region selected
                 * @param {object} reg The region to select, or null to deselect allr egions
                 * @returns {void}
                 */
                selectRegion: function (reg) {
                    if (me.debug) { console.log("> selectRegion"); }

                    var i;
                    let fullySelected;

                    // Select path
                    for (i = 0; i < me.objInfo.regions.length; i += 1) {
                        if (me.objInfo.regions[i] === reg) {
                            if (Microdraw.latestWork == "Annotation" && Microdraw.latestStatus == 'progressing') {
                                fullySelected = true;
                            }
                            else if (Microdraw.latestWork == "Review") {
                                if (reg.review_yn == "Y") {
                                    fullySelected = false;
                                }
                                else {
                                    fullySelected = true;
                                }
                            }

                            else if (Microdraw.latestWork == "Termination") {
                                if (reg.termination_yn == "Y") {
                                    fullySelected = false;
                                }
                                else {
                                    fullySelected = true;
                                }
                            }

                            else {
                                fullySelected = false;
                            }

                            reg.path.fullySelected = fullySelected;
                            reg.path.selected = true;

                            me.region = reg;
                        } else {
                            let region = me.objInfo.regions[i];
                            region.path.selected = false;
                            region.path.fullySelected = false;
                        }
                    }
                    paper.view.draw();

                    // Select region name in list
                    [].forEach.call(me.dom.querySelectorAll("#popup-object .object"), function (r) {
                        r.classList.remove("selected");
                    });

                    if (reg) {
                        var tag = me.dom.querySelector(`#popup-object li.${name} .object`);

                        if (tag) {
                            tag.classList.add("selected");
                        }
                    }

                    if (me.debug) { console.log("< selectRegion"); }
                },

                /**
                 * @function selectMeasurement
                 * @desc Make the region selected
                 * @param {object} reg The region to select, or null to deselect allr egions
                 * @returns {void}
                 */
                selectMeasurement: function (reg) {
                    if (me.debug) { console.log("> selectMeasurement"); }

                    var i;

                    // Select path
                    for (i = 0; i < me.objInfo.measurements.length; i += 1) {
                        if (me.objInfo.measurements[i] === reg) {
                            reg.path.fullySelected = true;
                            reg.path.selected = true;
                            me.region = reg;
                        } else {
                            me.objInfo.measurements[i].path.selected = false;
                            me.objInfo.measurements[i].path.fullySelected = false;
                        }
                    }
                    paper.view.draw();

                    if (me.debug) { console.log("< selectMeasurement"); }
                },

                /**
                 * @function selectComment
                 * @desc Make the region selected
                 * @param {object} reg The region to select, or null to deselect allr egions
                 * @returns {void}
                 */
                selectComment: function (reg) {
                    if (me.debug) { console.log("> selectMeasurement"); }

                    var i;

                    let type;
                    switch (reg?.path.type) {
                        case 'COMMENTAREA': type = 'area'; break;
                        case 'COMMENTBOX': type = 'box'; break;
                        case 'COMMENTLINE': type = 'line'; return;
                    }

                    // Select path
                    for (i = 0; i < me.objInfo.comments.length; i += 1) {
                        if (me.objInfo.comments[i][type] === reg) {
                            reg.path.fullySelected = true;
                            reg.path.selected = true;
                            me.region = reg;
                            me.objComment = me.objInfo.comments[i];
                        } else {
                            me.objInfo.comments[i]['area'].path.selected = false;
                            me.objInfo.comments[i]['area'].path.fullySelected = false;
                            me.objInfo.comments[i]['box'].path.selected = false;
                            me.objInfo.comments[i]['box'].path.fullySelected = false;
                            me.objInfo.comments[i]['line'].path.selected = false;
                            me.objInfo.comments[i]['line'].path.fullySelected = false;
                        }
                    }

                    if (type === 'area') {
                        for (let seg of Microdraw.region.path.segments) {
                            seg.handleIn.selected = false;
                            seg.handleOut.selected = false;
                        }

                        Microdraw.regionCircle = Microdraw.region;
                    }

                    paper.view.draw();

                    if (me.debug) { console.log("< selectMeasurement"); }
                },

                /**
                 * @function newRegion
                 * @desc  Create a new region.
                 * @param {object} arg An object containing the name, uid and path of the region
                 * @param {number} imageNumber The number of the image section where the region will be created
                 * @returns {object} A new region
                 */
                newRegion: function (arg, imageNumber, isDrawing) {
                    if (me.debug) {
                        console.log("> newRegion");
                    }
                    var reg = {};

                    if (arg.uid) {
                        reg.annoSeq = arg.annoSeq;
                    }
                    else {
                        reg.annoSeq = me.annoSeq;
                    }

                    if (arg.uid) {
                        reg.uid = arg.uid;
                    } else {
                        reg.uid = 'temp' + me.annoSeq;
                    }

                    if (arg.name) {
                        reg.name = arg.name;
                    } else {
                        reg.name = "Object" + me.annoSeq;
                    }

                    if (arg.path) {
                        reg.path = arg.path;
                        reg.path.strokeWidth = 1;
                        reg.path.strokeColor = 'rgba(' + (arg.hex ? me.hexToRgb(arg.hex) : '0, 0, 80') + ',' + 1 + ')';
                        reg.path.strokeScaling = false;
                        reg.path.selected = false;

                        if (reg.path.type == 'POINT') {
                            reg.path.dashArray = [5, 5];
                            reg.path.fillColor = 'rgba(' + (arg.hex ? me.hexToRgb(arg.hex) : '0, 0, 80') + ',' + 0 + ')';
                        }

                        else {
                            reg.path.fillColor = 'rgba(' + (arg.hex ? me.hexToRgb(arg.hex) : '0, 0, 80') + ',' + 0 + ')';
                        }
                    }

                    if (isDrawing) {
                        me.newText(reg, 0, reg.path.visible)
                    }
                    else {
                        var size = 10 / Microdraw.viewer.viewport.getZoom();
                        if (size > 12) {
                            size = 13;
                        }
                        me.newText(reg, size, reg.path.visible)
                    }

                    reg.labelNo = arg.labelNo ? arg.labelNo : ''
                    reg.labelName = arg.labelName
                    reg.hex = arg.hex ? arg.hex : ''
                    reg.review_yn = arg.review_yn ? arg.review_yn : 'N'
                    reg.termination_yn = arg.termination_yn ? arg.termination_yn : 'N'
                    reg.del_yn = arg.del_yn ? arg.del_yn : 'N'

                    if (reg.del_yn == "Y") {
                        reg.path.visible = false;
                        reg.path.selected = false;
                        reg.text.visible = false;
                    }

                    // push the new region to the Regions array
                    me.objInfo['regions'].push(reg);

                    // Select region name in list
                    // me.selectRegion(reg);

                    if (reg.path.type == 'SEG') {
                        if (reg.path.segments.length < 3) {
                            Microdraw.removeRegion(reg);
                            toast.warning("Polygons with less than 2 points have been deleted.");
                            Microdraw.UndoStack.pop(Microdraw.UndoStack.length - 1)
                            paper.view.draw();
                        }
                    }

                    if (arg.uid != 'regionTemp') {
                        me.annoSeq += 1;
                    }

                    return reg;
                },


                /**
                 * @function newRegion
                 * @desc  Create a new region.
                 * @param {object} arg An object containing the name, uid and path of the region
                 * @param {number} imageNumber The number of the image section where the region will be created
                 * @returns {object} A new region
                 */
                newPoint: function (point, hex) {
                    const path = new paper.Path.Circle({
                        type: 'POINT',
                        center: point,
                        radius: Microdraw.handleSize / 2,
                        fillColor: `rgba(${me.hexToRgb(hex)}, 1)`,
                        strokeColor: `rgba(${me.hexToRgb(hex)}, 1)`
                    });

                    path.sendToBack();

                    // path.selected = true;
                    // path.fullySelected = true;

                    // for (let seg of path.segments) {
                    //     seg.handleIn.selected = false;
                    //     seg.handleOut.selected = false;
                    // }

                    if (!Microdraw.region.arrPath) {
                        Microdraw.region.arrPath = [];
                    }
                    Microdraw.region.arrPath.push(path)
                },


                /**
                 * @function newMeasurement
                 * @desc  Create a new measurement.
                 * @param {object} arg An object containing the name, uid and path of the region
                 * @param {number} imageNumber The number of the image section where the region will be created
                 * @returns {object} A new region
                 */
                newMeasurement: function (arg) {
                    if (me.debug) {
                        console.log("> newRegion");
                    }
                    var reg = {};


                    if (arg.uid) {
                        reg.msrSeq = 'MEASUREMENT' + arg.msrSeq;
                    }
                    else {
                        reg.msrSeq = 'MEASUREMENT' + me.msrSeq;
                    }

                    if (arg.uid) {
                        reg.uid = arg.uid;
                    } else {
                        reg.uid = 'MEASUREMENT' + me.msrSeq;
                    }

                    if (arg.name) {
                        reg.name = arg.name;
                    } else {
                        reg.name = "MEASUREMENT" + me.msrSeq;
                    }

                    if (arg.path) {
                        reg.path = arg.path;
                        reg.path.strokeWidth = Microdraw.dom.querySelector('#strokeDiv .slider').slider('value');
                        reg.path.strokeColor = 'rgba(' + (arg.hex ? me.hexToRgb(arg.hex) : '0, 0, 80') + ',' + 1 + ')';
                        reg.path.strokeScaling = false;
                        reg.path.fillColor = 'rgba(' + (arg.hex ? me.hexToRgb(arg.hex) : '0, 0, 80') + ',' + 0.1 + ')';
                        reg.path.selected = false;
                    }

                    if (typeof imageNumber === "undefined") {
                        imageNumber = me.currentImage;
                    }

                    // if (isDrawing) {
                    //     me.newText(reg, 0, reg.path.visible)
                    // }
                    // else {
                    //     var size = 10 / Microdraw.viewer.viewport.getZoom();
                    //     if (size > 12) {
                    //         size = 13;
                    //     }
                    //     me.newText(reg, size, reg.path.visible, arg.text)
                    // }

                    var size = 10 / Microdraw.viewer.viewport.getZoom();
                    if (size > 12) {
                        size = 13;
                    }
                    me.newText(reg, size, reg.path.visible, arg.text)

                    reg.labelNo = arg.labelNo ? arg.labelNo : ''
                    reg.labelName = arg.labelName
                    reg.hex = arg.hex ? arg.hex : ''
                    // reg.review_yn = arg.review_yn? arg.review_yn : 'N'
                    // reg.termination_yn = arg.termination_yn? arg.termination_yn : 'N'
                    // reg.del_yn = arg.del_yn? arg.del_yn : 'N'

                    me.calcRegArea(reg)

                    if (reg.del_yn == "Y") {
                        reg.path.visible = false;
                        reg.path.selected = false;
                        reg.text.visible = false;
                    }

                    // push the new region to the Regions array
                    me.objInfo.measurements.push(reg);

                    // Select region name in list
                    me.selectRegion(null);
                    // me.selectMeasurement(reg);

                    me.msrSeq += 1;
                    paper.view.draw();
                    return reg;
                },

                /**
                 * @function newRegion
                 * @desc  Create a new region.
                 * @param {object} arg An object containing the name, uid and path of the region
                 * @param {number} imageNumber The number of the image section where the region will be created
                 * @returns {object} A new region
                 */
                newCircle: function (arg, imageNumber, isDrawing) {
                    if (me.debug) {
                        console.log("> newRegion");
                    }
                    var reg = {};

                    if (me.regionCircle !== null) {
                        reg = me.regionCircle;
                    }

                    if (arg.path.uid) {
                        reg.uid = arg.path.uid;
                    }
                    else {
                        reg.uid = 'circle';
                    }


                    if (arg.path) {
                        reg.path?.remove();
                        reg.path = arg.path;
                        reg.path.dashArray = [5, 5];
                        reg.path.strokeWidth = arg.path.strokeWidth ? arg.path.strokeWidth : me.config.defaultStrokeWidth;
                        reg.path.strokeColor = 'rgba(' + (arg.hex ? me.hexToRgb(arg.hex) : '0, 0, 80') + ',' + 1 + ')';
                        reg.path.strokeScaling = false;
                        reg.path.fillColor = arg.path.fillColor ? arg.path.fillColor : 'rgba(' + (arg.hex ? me.hexToRgb(arg.hex) : '0, 0, 0') + ',' + 0 + ')';
                        reg.path.selected = false;
                        reg.path.fullSelected = false;
                    }

                    // push the new region to the Regions array
                    //me.ImageInfo[imageNumber].Regions.push(reg);

                    // Select region name in list
                    //me.selectRegion(reg);

                    paper.view.draw();

                    return reg;
                },

                /**
                 * @function newMeasurement
                 * @desc  Create a new measurement.
                 * @param {object} arg An object containing the name, uid and path of the region
                 * @param {number} imageNumber The number of the image section where the region will be created
                 * @returns {object} A new region
                 */
                newCommentArea: function (arg) {
                    if (me.debug) {
                        console.log("> newRegion");
                    }
                    var reg = {};

                    if (arg.uid) {
                        reg.commentSeq = 'COMMENTAREA' + arg.commentSeq;
                    }
                    else {
                        reg.commentSeq = 'COMMENTAREA' + me.commentSeq;
                    }

                    if (arg.uid) {
                        reg.uid = arg.uid;
                    } else {
                        reg.uid = 'tempCOMMENTAREA' + me.commentSeq;
                    }

                    if (arg.name) {
                        reg.name = arg.name;
                    } else {
                        reg.name = "Comment" + me.commentSeq;
                    }

                    if (arg.path) {
                        reg.path?.remove();
                        reg.path = arg.path;
                        reg.path.strokeWidth = Microdraw.dom.querySelector('#strokeDiv .slider').slider('value');
                        reg.path.strokeColor = 'rgba(' + (arg.hex ? me.hexToRgb(arg.hex) : '0, 0, 80') + ',' + 1 + ')';
                        reg.path.strokeScaling = false;
                        // reg.path.fillColor = 'rgba(' + (arg.hex? me.hexToRgb( arg.hex) : '0, 0, 80') + ',' + 0.1+ ')';
                        reg.path.fillColor = Microdraw.color.commentArea
                        reg.path.selected = false;
                    }

                    if (typeof imageNumber === "undefined") {
                        imageNumber = me.currentImage;
                    }

                    var size = 10 / Microdraw.viewer.viewport.getZoom();
                    if (size > 12) {
                        size = 13;
                    }
                    me.newText(reg, size, reg.path.visible, arg.text)

                    reg.labelNo = arg.labelNo ? arg.labelNo : ''
                    reg.labelName = arg.labelName
                    reg.hex = arg.hex ? arg.hex : ''

                    // me.calcRegArea(reg)

                    if (reg.del_yn == "Y") {
                        reg.path.visible = false;
                        reg.path.selected = false;
                        reg.text.visible = false;
                    }

                    // Select region name in list
                    me.selectRegion(null);
                    me.selectMeasurement(null);

                    paper.view.draw();
                    return reg;
                },

                /**
                 * @function newRegion
                 * @desc  Create a new region.
                 * @param {object} arg An object containing the name, uid and path of the region
                 * @param {number} imageNumber The number of the image section where the region will be created
                 * @returns {object} A new region
                 */
                newCommentBox: function (arg, imageNumber, contents) {
                    if (me.debug) {
                        console.log("> newRegion");
                    }
                    var reg = {};

                    if (arg.uid) {
                        reg.commentSeq = 'COMMENTBOX' + arg.commentSeq;
                    }
                    else {
                        reg.commentSeq = 'COMMENTBOX' + me.commentSeq;
                    }

                    if (arg.uid) {
                        reg.uid = arg.uid;
                    } else {
                        reg.uid = 'tempCOMMENTBOX' + me.commentSeq;
                    }

                    if (arg.name) {
                        reg.name = arg.name;
                    } else {
                        reg.name = "Comment" + me.commentSeq;
                    }

                    if (arg.path) {
                        reg.path = arg.path;
                        reg.path.dashArray = [5, 5];
                        reg.path.strokeWidth = Microdraw.dom.querySelector('#strokeDiv .slider').slider('value');
                        reg.path.strokeColor = 'rgba(' + (arg.hex ? me.hexToRgb(arg.hex) : '0, 0, 80') + ',' + 1 + ')';
                        reg.path.strokeScaling = false;
                        reg.path.fillColor = Microdraw.color.commentBox;
                        reg.path.selected = false;
                        reg.path.type = "COMMENTBOX";
                    }

                    if (typeof imageNumber === "undefined") {
                        imageNumber = me.currentImage;
                    }

                    me.newText(reg, 0, reg.path.visible)

                    contents = contents ? contents : '';

                    // if (isDrawing) {
                    //     me.newText(reg, 0, reg.path.visible)
                    // }
                    // else {
                    //     var size = 10 / Microdraw.viewer.viewport.getZoom();
                    //     if (size > 12) {
                    //         size = 13;
                    //     }
                    //     me.newText(reg, size, reg.path.visible)
                    // }

                    reg.hex = arg.hex ? arg.hex : ''
                    reg.del_yn = arg.del_yn ? arg.del_yn : 'N'

                    if (reg.del_yn == "Y") {
                        reg.path.visible = false;
                        reg.path.selected = false;
                        reg.text.visible = false;
                    }


                    if (!Microdraw.dom.querySelector(`#div${reg.name}`).length) {
                        let leftTopProjectPixel = reg.path.segments[1].point
                        let leftTopWebPixel = paper.view.projectToView(new OpenSeadragon.Point(leftTopProjectPixel.x, leftTopProjectPixel.y));

                        let rightBottomProjectPixel = reg.path.segments[3].point
                        let rightBottomWebPixel = paper.view.projectToView(new OpenSeadragon.Point(rightBottomProjectPixel.x, rightBottomProjectPixel.y));

                        var textarea = $(`<div class='comment-wrapper' id='div${reg.name}' name='${reg.name}'` +
                            `style='position:absolute; background-color: rgba(240,240,240,1); cursor: default; left: ${leftTopWebPixel.x}px; top: ${leftTopWebPixel.y}px; white-space: pre;` +
                            `width: ${rightBottomWebPixel.x - leftTopWebPixel.x}px; height: ${rightBottomWebPixel.y - leftTopWebPixel.y}px; z-index: 3' />` +
                            `<div onblur="Microdraw.dbCommentSave()" contenteditable='true' style='width: 100%; height: 100%; padding: 4px; overflow-y: scroll;'>${contents.replace(/\n/g, '<br>')}` +
                            "</div></div>");

                        // var textarea = $(`<textarea class='comment-wrapper' id='div${reg.name}'` + 
                        // `style='position:absolute; background-color: #e7ffcb; left: ${leftTopWebPixel.x}px; top: ${leftTopWebPixel.y}px;` + 
                        // `width: ${rightBottomWebPixel.x - leftTopWebPixel.x}px; height: ${rightBottomWebPixel.y - leftTopWebPixel.y}px; z-index: 10'>` + 
                        // `${reg.text.content}`+
                        // "</textarea>");

                        Microdraw.dom.querySelector('.openseadragon-container').append(textarea);

                        // $($('#content')[0].shadowRoot.querySelector(`#div${reg.name}`)).draggable({
                        //     disabled: true
                        // });

                        Microdraw.dom.querySelector(`#div${reg.name}`).draggable({
                            // handle: '.drag-btn',
                            // containment: "parent"
                        })
                        // }).resizable({minWidth: 200, minHeight:100, handles: 'all', containment: "parent"  });

                        Microdraw.dom.querySelector(`#div${reg.name}`).on('click', function (e) {
                            // $(this).draggable({disabled: false})
                            // me.tools['select'].mouseDown(paper.view.viewToProject(new paper.Point(e.currentTarget.offsetLeft, e.currentTarget.offsetTop)))

                            for (let div of Microdraw.dom.querySelectorAll('.comment-wrapper')) {
                                $(div).css('z-index', 3);
                            }
                            $(this).css('z-index', '9');
                            me.tools['select'].mouseDown(paper.view.viewToProject(new paper.Point(e.clientX - $('#main-lnb').width(), e.clientY - $('.topMenuArea').height())))
                            Microdraw.objComment?.box.path.bringToFront()
                        })

                        Microdraw.dom.querySelector(`#div${reg.name}`).on('dblclick', function () {
                            $(this).draggable({ disabled: true })
                            $(this).find('div').focus();
                            $(this).css('background-color', '#e7ffcb');
                            $(this).css('cursor', 'text');
                        })

                        var start = null, delta = null
                        Microdraw.dom.querySelector(`#div${reg.name}`).on('dragstart', function (e) {
                            start = { x: e.clientX, y: e.clientY }
                            // me.tools['select'].mouseDown(paper.view.viewToProject(new paper.Point(e.currentTarget.offsetLeft, e.currentTarget.offsetTop)))
                            me.tools['select'].mouseDown(paper.view.viewToProject(new paper.Point(e.clientX - $('#main-lnb').width(), e.clientY - $('.topMenuArea').height())))
                            me.handle = null;
                        })

                        Microdraw.dom.querySelector(`#div${reg.name}`).on('drag', function (e) {
                            delta = { x: e.clientX - start.x, y: e.clientY - start.y }
                            me.mouseDrag(e.originalEvent.offsetX, e.originalEvent.offsetY, delta.x, delta.y);
                            start = { x: start.x + delta.x, y: start.y + delta.y }
                        })

                        Microdraw.dom.querySelector(`#div${reg.name}`).on('dragstop', function (e) {
                            me.tools['drawComment'].mouseUp()
                        })
                    }

                    return reg;
                },

                /**
                 * @function newRegion
                 * @desc  Create a new region.
                 * @param {object} arg An object containing the name, uid and path of the region
                 * @param {number} imageNumber The number of the image section where the region will be created
                 * @returns {object} A new region
                 */
                newCommentLine: function (commentArea, commentBox, arg, imageNumber, isDrawing) {
                    if (me.debug) {
                        console.log("> newRegion");
                    }
                    var reg = {};

                    if (arg.uid) {
                        reg.commentSeq = 'COMMENTLINE' + arg.commentSeq;
                    }
                    else {
                        reg.commentSeq = 'COMMENTLINE' + me.commentSeq;
                    }

                    if (arg.uid) {
                        reg.uid = arg.uid;
                    } else {
                        reg.uid = 'tempCOMMENTLINE' + me.commentSeq;
                    }

                    if (arg.name) {
                        reg.name = arg.name;
                    } else {
                        reg.name = "Comment" + me.commentSeq;
                    }

                    let segmentsArea = commentArea.path.segments;
                    let segmentsBox = commentBox.path.segments;

                    let minPointArea = segmentsArea[0].point;
                    let minPointBox = segmentsBox[0].point;
                    let minValue = Math.abs(minPointArea.x - minPointBox.x) + Math.abs(minPointArea.y - minPointBox.y)

                    let tempPointArea;
                    let tempPointBox;
                    let tempValue;

                    for (let indexArea in segmentsArea) {
                        tempPointArea = segmentsArea[indexArea].point;
                        for (let indexBox in segmentsBox) {
                            tempPointBox = segmentsBox[indexBox].point;
                            tempValue = Math.abs(tempPointArea.x - tempPointBox.x) + Math.abs(tempPointArea.y - tempPointBox.y);

                            if (tempValue < minValue) {
                                minValue = tempValue;
                                minPointArea = tempPointArea;
                                minPointBox = tempPointBox;
                            }
                        }
                    }

                    let newPath = new paper.Path.Line(minPointArea, minPointBox);
                    arg.path.segments = newPath.segments;
                    newPath.remove();

                    if (arg.path) {
                        reg.path = arg.path;
                        reg.path.dashArray = [5, 5];
                        reg.path.strokeWidth = Microdraw.dom.querySelector('#strokeDiv .slider').slider('value');
                        reg.path.strokeColor = 'rgba(' + (arg.hex ? me.hexToRgb(arg.hex) : '0, 0, 80') + ',' + 1 + ')';
                        reg.path.strokeScaling = false;
                        reg.path.fillColor = 'rgba(' + (arg.hex ? me.hexToRgb(arg.hex) : '0, 0, 80') + ',' + Microdraw.dom.querySelector('#opacityDiv .slider').slider('value') + ')';
                        reg.path.selected = false;
                        reg.path.type = "COMMENTLINE";
                        reg.path.fillColor.alpha = 0.1;
                        reg.path.sendToBack();
                    }

                    if (typeof imageNumber === "undefined") {
                        imageNumber = me.currentImage;
                    }

                    reg.hex = arg.hex ? arg.hex : ''
                    reg.del_yn = arg.del_yn ? arg.del_yn : 'N'

                    if (reg.del_yn == "Y") {
                        reg.path.visible = false;
                        reg.path.selected = false;
                        reg.text.visible = false;
                    }

                    return reg;
                },

                hexToRgb: function (hex) {
                    var bigint = parseInt(hex, 16);
                    var r = (bigint >> 16) & 255;
                    var g = (bigint >> 8) & 255;
                    var b = bigint & 255;

                    return r + "," + g + "," + b;
                },

                /**
                 * @function newText
                 * @desc  Create a new text.
                 * @param {object} arg An object containing the name, uid and path of the region
                 * @param {number} imageNumber The number of the image section where the region will be created
                 * @returns {void} A new region
                 */
                newText: function (reg, fontSize, visible, text) {
                    reg.text = new paper.PointText({
                        name: reg.name,
                        content: text ? text : reg.name,
                        justification: 'left'
                    });

                    reg.text.visible = visible;
                    // reg.text.position = reg.path.position;
                    reg.text.setFontSize(fontSize);
                    //   reg.text.rotate(Number(Microdraw.viewer.viewport.degrees) * -1)
                    reg.text.sendToBack();
                },

                /**
                 * @function initText
                 * @desc  Create a new text.
                 * @param {object} arg An object containing the name, uid and path of the region
                 * @param {number} imageNumber The number of the image section where the region will be created
                 * @returns {void} A new region
                 */
                initText: function (reg) {
                    var size = 10 / me.viewer.viewport.getZoom();
                    if (size > 12) {
                        me.region.text.setFontSize(13);
                    }
                    else {
                        me.region.text.setFontSize(size);
                    }

                    // Microdraw.region.text.setFontSize(Microdraw.ImageInfo[1].Regions.length > 0? Microdraw.ImageInfo[1].Regions[0].text.fontSize : 20);
                    // reg.text.position = reg.path.position;
                },


                /**
                 * Remove region from current image. The image not directly removed, but marked for removal,
                 * so that it can be removed from the database.
                 * @param {object} reg The region to be removed
                 * @param {number} imageNumber The number of the image where the region will be removed
                 * @returns {void}
                 */
                removeRegion: function (reg, imageNumber) {
                    if (me.debug) { console.log("> removeRegion"); }

                    // remove from Regions array
                    me.objInfo.regions.splice(me.objInfo.regions.indexOf(reg), 1);
                    // remove from paths
                    reg.path.remove();
                    reg.text.remove();
                },

                removeMeasurement: function (reg, imageNumber) {
                    if (me.debug) { console.log("> removeRegion"); }

                    // remove from Regions array
                    me.objInfo.measurements.splice(me.objInfo.measurements.indexOf(reg), 1);
                    // remove from paths
                    reg.path.remove();
                    reg.text.remove();
                },

                removeComment: function (imageNumber) {
                    if (me.debug) { console.log("> removeRegion"); }

                    // 텍스트 편집중일 경우 삭제되지 않도록 수정
                    if ($(Microdraw.dom.querySelector(`#div${me.objComment.name} div`)).is(':focus')) {
                        return;
                    }

                    axios.delete(web_url + `/api/annotation/comments/${me.objComment.uid}`).then((result) => {
                        // remove from Regions array
                        me.objInfo.comments.splice(me.objInfo.comments.indexOf(me.objComment), 1);
                        // remove from paths
                        me.objComment.area.path.remove();
                        me.objComment.area.text.remove();
                        me.objComment.line.path.remove();
                        me.objComment.box.path.remove();
                        me.objComment.box.text.remove();

                        Microdraw.dom.querySelector(`#div${me.objComment.name}`).remove();
                        Microdraw.objComment = null;

                        paper.view.draw();
                    })
                },

                /**
                 * @function clickHandler
                 * @desc Interaction: mouse and tap: If on a computer, it will send click event; if on tablet, it will send touch event.
                 * @param {object} event Event
                 * @returns {void}
                 */
                clickHandler: function (event) {
                    if (me.debug) { console.log("> clickHandler"); }
                    event.stopHandlers = !me.navEnabled;
                },

                /**
                 * @function dblClickHandler
                 * @desc Interaction: mouse and tap: If on a computer, it will send click event; if on tablet, it will send touch event.
                 * @param {object} event Event
                 * @returns {void}
                 */
                dblClickHandler: function (event) {
                    if (me.debug) { console.log("> dblClickHandler"); }
                    event.stopHandlers = !me.navEnabled;
                },

                /**
                 * @function pressHandler
                 * @param {object} event Event
                 * @returns {void}
                 */
                pressHandler: function (event) {
                    if (me.debug) { console.log("> pressHandler"); }

                    // popup.focus();

                    me.isPressed = true;

                    if (me.dom.querySelector("#labelDiv").style.visibility == 'visible') {
                        me.dom.querySelector("#labelDiv").style.visibility = 'hidden';
                    }

                    if (me.dom.querySelector("#changeLabelDiv").style.visibility == 'visible') {
                        me.dom.querySelector("#changeLabelDiv").style.visibility = 'hidden';
                    }

                    if (me.dom.querySelector("#popup-info").style.visibility == 'visible') {
                        me.dom.querySelector("#popup-info").style.visibility = 'hidden';
                    }

                    if (me.dom.querySelector('.comment-wrapper')) {
                        let arrDiv = me.dom.querySelectorAll('.comment-wrapper');
                        let commentId
                        for (let div of arrDiv) {
                            commentId = me.dom.querySelector('.comment-wrapper').id;

                            $(div).draggable({
                                disabled: false
                            }).css('background-color', 'rgba(240,240,240,1)').css('cursor', 'default');

                            for (let reg of me.objInfo.comments) {
                                if (`div${reg.box.name}` == commentId) {
                                    reg.box.text.setContent(Microdraw.dom.querySelector(`#div${reg.box.name} div`).innerText);
                                    // reg.box.text.setContent(Microdraw.dom.querySelector(`#div${reg.box.name}`).value);
                                    // Microdraw.dom.querySelector('.comment-wrapper').remove();
                                    break;
                                }
                            }
                        }

                        me.dom.querySelector('.openseadragon-canvas').focus()
                    }

                    if (me.key == 'ctrl' || me.selectedTool == "move") {
                        me.navEnabled = true;
                    }
                    else {
                        var point = paper.view.viewToProject(new paper.Point(event.position.x, event.position.y));
                        me.navEnabled = false;
                        // hitResult = paper.project.hitTest(point, {
                        //     tolerance: me.tolerance,
                        //     stroke: true,
                        //     segments: true,
                        //     fill: true,
                        //     handles: true
                        // });

                        // if (me.key == 'r') {
                        //     me.prevTool = me.selectedTool;
                        //     me.selectedTool = 'rotate'
                        //     me.navEnabled = false;
                        // }
                        // else if (me.key == 'space') {
                        //     me.prevTool = me.selectedTool;
                        //     me.selectedTool = 'region'
                        //     me.navEnabled = false;
                        // }
                        // else if (me.key == 's') {
                        //     me.prevTool = me.selectedTool;
                        //     me.selectedTool = 'select'
                        //     me.navEnabled = false;
                        // }

                        // if( hitResult == null && me.drawingPolygonFlag == false && Microdraw.drawingPointFlag == false && Microdraw.selectedTool.indexOf("region") == -1) {
                        //     if (me.region) {
                        //          me.region.path.selected = false;
                        //          me.region = null;

                        //         paper.view.draw();
                        //         Microdraw.objectListPopup();
                        //     }
                        //     if (Microdraw.objComment) {
                        //         Microdraw.selectComment(null);
                        //         Microdraw.objComment = null;

                        //         paper.view.draw();
                        //     }

                        //     if (Microdraw.selectedTool.indexOf("draw") == -1) {
                        //         if (Microdraw.key != '') {
                        //             me.navEnabled = false;
                        //         }
                        //         else {
                        //             me.navEnabled = true;
                        //         }
                        //     }
                        //     else {
                        //         me.navEnabled = false;
                        //     }
                        // }
                        // else {
                        //     me.navEnabled = false;
                        // }
                    }

                    if (!me.navEnabled) {
                        event.stopHandlers = true;
                        me.mouseDown(event.originalEvent.layerX, event.originalEvent.layerY);
                    }
                },

                /**
                 * @function releaseHandler
                 * @param {object} event Event
                 * @returns {void}
                 */
                releaseHandler: function (event) {
                    if (me.debug) { console.log("> releaseHandler"); }

                    me.isPressed = false;

                    if (!me.navEnabled) {
                        event.stopHandlers = true;
                        me.mouseUp(event);
                    }
                },

                /**
                 * @function dragHandler
                 * @param {object} event Event
                 * @returns {void}
                 */
                dragHandler: function (event) {
                    if (me.debug > 1) { console.log("> dragHandler"); }

                    if (me.isLocked && me.selectedTool == 'select') {
                        if (!Microdraw.region?.path.type.includes('COMMENT')) {
                            return;
                        }
                    }

                    if (me.isLocked && (me.selectedTool != 'select' && me.selectedTool != 'drawMeasurement' && me.selectedTool != 'drawComment')) {
                        return;
                    }

                    if (!me.navEnabled) {
                        event.stopHandlers = true;
                        me.mouseDrag(event.originalEvent.layerX, event.originalEvent.layerY, event.delta.x, event.delta.y, event);
                    }
                },

                /**
                 * @function dragHandler
                 * @param {object} event Event
                 * @returns {void}
                 */
                moveHandler: function (event) {
                    if (me.debug > 1) { console.log("> dragHandler"); }

                    let viewportPoint = Microdraw.viewer.viewport.pointFromPixel(event.position);
                    let imagePoint = Microdraw.viewer.viewport.viewportToImageCoordinates(viewportPoint.x, viewportPoint.y);



                    // me.canvasZoom.putImageData(me.canvasOrigin.getImageData(event.position.x-50,event.position.y-50,event.position.x+50,event.position.y+50), 0,0)

                    // 미반영 - 돋보기
                    // if (!me.isPressed) {
                    //     if (imagePoint.x > 0 && imagePoint.y > 0 && (imagePoint.x < me.imageSize.x) && (imagePoint.y < me.imageSize.y) ) {
                    //         me.canvasZoom.save();

                    //         // me.canvasTemp.clearRect(0,0,200,200);
                    //         me.canvasTemp.putImageData(me.canvasOrigin.getImageData(
                    //             event.position.x-50,
                    //             event.position.y-50,
                    //             event.position.x+50,
                    //             event.position.y+50
                    //         ), 0,0)


                    //         // var pt = me.canvasZoom.transformedPoint(event.position.x,event.position.y);
                    //         // me.canvasZoom.translate(event.position.x,event.position.y);
                    //         // var factor = Math.pow(scaleFactor,clicks);
                    //         me.canvasZoom.scale(3,3);

                    //         me.canvasZoom.drawImage($($('#content')[0].shadowRoot.querySelector('#test2'))[0], 0, 0);


                    //         me.canvasZoom.restore();
                    //     }
                    // }



                    me.dom.querySelector("#pointX").innerText = imagePoint.x.toFixed(0);
                    me.dom.querySelector("#pointY").innerText = imagePoint.y.toFixed(0);
                },

                /**
                 * @function dragEndHandler
                 * @param {object} event Event
                 * @returns {void}
                 */
                dragEndHandler: function (event) {
                    if (me.debug > 1) { console.log("> dragEndHandler"); }

                    if (!me.navEnabled) {
                        event.stopHandlers = true;
                        me.mouseUp();
                    }
                },


                /**
                 * @function scrollHandler
                 * @param {object} ev Scroll event
                 * @returns {void}
                 */
                scrollHandler: function (ev) {
                    if (me.debug > 1) { console.log("> scrollHandler") }

                    if (me.tools[me.selectedTool]
                        && me.tools[me.selectedTool].scrollHandler) {
                        me.tools[me.selectedTool].scrollHandler(ev);
                    }
                    paper.view.draw();
                },

                /**
                 * @function mouseDown
                 * @param {number} x X-coordinate for mouse down
                 * @param {number} y Y-coordinate for mouse down
                 * @returns {void}
                 */
                mouseDown: function (x, y) {
                    me.debugPrint("> mouseDown", 1);

                    //   me.mouseUndo = me.getUndo();
                    var point = paper.view.viewToProject(new paper.Point(x, y));

                    me.handle = null;

                    if (me.selectedTool == 'region' && !me.isLocked) {
                        if (!Microdraw.region) return false;
                        if (Microdraw.region.path.type == 'LINE' || Microdraw.region.path.type == 'BBOX' || Microdraw.region.path.type == 'MEASUREMENT') return false;
                        if (Microdraw.region.arrPath) return false;

                        //accept 상태
                        if (!Microdraw.region.path.fullySelected) {
                            toast.warning('Accepted object cannot be deleted.');
                            return false;
                        }
                        let hitResult = Microdraw.region.path.hitTest(point, {
                            tolerance: 0,
                            stroke: false,
                            segments: true,
                            fill: true,
                            handles: true
                        });

                        if (Microdraw.region.path == hitResult?.item) {
                            me.selectedTool = 'regionAdd'
                        }
                        else {
                            me.selectedTool = 'regionSub'
                        }
                    }

                    // console.log(ToolDrawLine)


                    // ToolDrawLine.mouseDown(point)
                    if (me.tools[me.selectedTool]
                        && me.tools[me.selectedTool].mouseDown) {
                        if (Microdraw.key != 'r') {
                            me.tools[me.selectedTool].mouseDown(point);
                        }
                    }
                    // hitResult = paper.project.hitTest(point, {
                    //     tolerance: Microdraw.tolerance,
                    //     stroke: true,
                    //     segments: true,
                    //     fill: true,
                    //     handles: true
                    // });

                    // if (hitResult == null) {
                    //     me.tools[me.selectedTool].mouseDown(point);
                    // }
                    // else {
                    //     if (hitResult.type == 'segment' || hitResult.type == 'fill') {
                    //         me.selectedTool = 'select'
                    //         me.tools[me.selectedTool].mouseDown(point);
                    //     }
                    // }

                    paper.view.draw();
                },

                /**
                 * @function mouseDrag
                 * @param {number} x X-coordinate where drag event started
                 * @param {number} y Y-coordinate where drag event started
                 * @param {number} dx Size of the drag step in the X axis
                 * @param {number} dy Size of the drag step in the Y axis
                 * @returns {void}
                 */
                mouseDrag: function (x, y, dx, dy, event) {
                    //if( me.debug ) console.log("> mouseDrag");

                    // transform screen coordinate into world coordinate
                    var point = paper.view.viewToProject(new paper.Point(x, y));

                    // transform screen delta into world delta
                    var orig = paper.view.viewToProject(new paper.Point(0, 0));
                    var dpoint = paper.view.viewToProject(new paper.Point(dx, dy));
                    dpoint.x -= orig.x;
                    dpoint.y -= orig.y;
                    // 점 클릭시
                    if (me.handle) {
                        if (!Microdraw.region.path.fullySelected && !Microdraw.region.path.type.includes('COMMENT')) {
                            return;
                        }

                        if (Microdraw.region.path.type == "BBOX") {
                            // if (Microdraw.region.path.type != null) {
                            me.tools["drawBbox"].mouseDrag(point, dpoint);
                            me.chkSaved(false);
                            me.commitMouseUndo();
                        }
                        else {
                            if (!Microdraw.region.path.type.includes("COMMENT")) {
                                if (point.x < 0 || point.x > Microdraw.projectSize.x ||
                                    point.y < 0 || point.y > Microdraw.projectSize.y) {
                                    return;
                                }
                            }

                            if (Microdraw.region.path.type == "MEASUREMENT") {
                                me.handle.x += point.x - me.handle.point.x;
                                me.handle.y += point.y - me.handle.point.y;
                                me.handle.point = point;
                                me.tools["drawMeasurement"].mouseDrag(point, dpoint);
                            }
                            else if (Microdraw.region.path.type.includes("COMMENT")) {
                                if (Microdraw.region.path.type != 'COMMENTBOX') {
                                    me.handle.x += point.x - me.handle.point.x;
                                    me.handle.y += point.y - me.handle.point.y;
                                    me.handle.point = point;
                                }

                                me.tools["drawComment"].mouseDrag(point, dpoint);
                            }
                            else {
                                me.handle.x += point.x - me.handle.point.x;
                                me.handle.y += point.y - me.handle.point.y;
                                me.handle.point = point;

                                if (Microdraw.region.path.type == 'POINT' && Microdraw.region.arrPath) {
                                    Microdraw.region.arrPath[me.handle.index].position.x = me.handle.x;
                                    Microdraw.region.arrPath[me.handle.index].position.y = me.handle.y;
                                }

                                me.chkSaved(false);
                                me.commitMouseUndo();
                            }
                        }

                    } else if (me.tools[me.selectedTool]) {
                        if (Microdraw.key == 'r' || me.selectedTool == "rotate") {
                            if (Microdraw.region != null && Microdraw.region.path.type != "BBOX") {
                                dpoint.x *= Microdraw.viewer.viewport.getZoom();
                                dpoint.y *= Microdraw.viewer.viewport.getZoom();
                                me.tools["rotate"].mouseDrag(point, dpoint);
                                me.chkSaved(false);
                            }
                        }

                        else if (me.tools[me.selectedTool].mouseDrag) {
                            me.tools[me.selectedTool].mouseDrag(point, dpoint);
                            if (me.selectedTool != "drawMeasurement" && Microdraw.region?.path.type != 'MEASUREMENT') {
                                me.chkSaved(false);
                            }
                        }


                    }
                    paper.view.draw();
                },

                /**
                 * @function mouseUp
                 * @returns {void}
                 */
                mouseUp: function (event) {
                    if (me.debug) {
                        console.log("> mouseUp");
                    }
                    if (me.tools[me.selectedTool] && me.tools[me.selectedTool].mouseUp) {
                        var point = paper.view.viewToProject(new paper.Point(event.originalEvent.layerX, event.originalEvent.layerY));
                        me.tools[me.selectedTool].mouseUp(point);
                    }
                },

                resizeFontSize: function () {
                    let reg;
                    let size = 10 / Microdraw.viewer.viewport.getZoom();
                    for (var regCnt = 0; regCnt < Microdraw.objInfo.regions.length; regCnt++) {
                        reg = Microdraw.objInfo.regions[regCnt];

                        if (size > 13) {
                            reg.text.setFontSize(13)
                        }
                        else if (size < 0) {
                            reg.text.setFontSize(1)
                        }
                        else {
                            reg.text.setFontSize(10 / Microdraw.viewer.viewport.getZoom())
                        }

                        reg.text.position = reg.path.position;
                    }

                    for (var regCnt = 0; regCnt < Microdraw.objInfo.measurements.length; regCnt++) {
                        reg = Microdraw.objInfo.measurements[regCnt];

                        if (size > 13) {
                            reg.text.setFontSize(13)
                        }
                        else if (size < 0) {
                            reg.text.setFontSize(1)
                        }
                        else {
                            reg.text.setFontSize(10 / Microdraw.viewer.viewport.getZoom())
                        }

                        reg.text.position = reg.path.position;
                    }

                    for (var regCnt = 0; regCnt < Microdraw.objInfo.comments.length; regCnt++) {
                        reg = Microdraw.objInfo.comments[regCnt];

                        var area = reg.area;
                        var box = reg.box;

                        if (size > 13) {
                            area.text.setFontSize(13)
                        }
                        else if (size < 0) {
                            area.text.setFontSize(1)
                        }
                        else {
                            area.text.setFontSize(10 / Microdraw.viewer.viewport.getZoom())
                        }

                        area.text.position = area.path.position;

                        box.text.setFontSize(0)

                        // box.text.position = box.path.segments[1].point;
                        // box.text.position = box.path.position;
                    }
                },

                resizeCommentBox: function () {
                    const rotationTargetPoint = {
                        0: { leftTop: 1, rightBottom: 3 },
                        90: { leftTop: 0, rightBottom: 2 },
                        180: { leftTop: 3, rightBottom: 1 },
                        270: { leftTop: 2, rightBottom: 0 },
                    }

                    let rotation = Math.round(paper.view._matrix.rotation) + 360;
                    rotation = rotation >= 360 ? rotation - 360 : rotation;

                    let arrComments = Microdraw.objInfo.comments;
                    for (let obj of arrComments) {
                        let textBox = obj.box;
                        if (Microdraw.dom.querySelector(`#div${textBox.name}`)) {
                            let leftTopProjectPixel = textBox.path.segments[rotationTargetPoint[rotation]['leftTop']].point
                            let leftTopWebPixel = paper.view.projectToView(new OpenSeadragon.Point(leftTopProjectPixel.x, leftTopProjectPixel.y));

                            let rightBottomProjectPixel = textBox.path.segments[rotationTargetPoint[rotation]['rightBottom']].point
                            let rightBottomWebPixel = paper.view.projectToView(new OpenSeadragon.Point(rightBottomProjectPixel.x, rightBottomProjectPixel.y));

                            Microdraw.dom.querySelector(`#div${textBox.name}`).style.left = `${leftTopWebPixel.x + 1}px`
                            Microdraw.dom.querySelector(`#div${textBox.name}`).style.top = `${leftTopWebPixel.y + 1}px`
                            Microdraw.dom.querySelector(`#div${textBox.name}`).style.width = `${rightBottomWebPixel.x - leftTopWebPixel.x - 2}px`
                            Microdraw.dom.querySelector(`#div${textBox.name}`).style.height = `${rightBottomWebPixel.y - leftTopWebPixel.y - 2}px`
                        }
                    }

                },

                /**
                 * @function cmdUndo
                 * @desc Command to actually perform an undo.
                 * @returns {void}
                 */
                cmdUndo: function () {
                    if (Microdraw.isLocked) {
                        return;
                    }
                    if (me.UndoStack.length > 0) {
                        var redoInfo = me.getUndo();
                        var undoInfo = me.UndoStack.pop();
                        me.applyUndo(undoInfo);
                        me.RedoStack.push(redoInfo);
                        paper.view.draw();
                        Microdraw.currentRegions();
                    }
                },

                /**
                 * @function cmdRedo
                 * @desc Command to actually perform a redo.
                 * @returns {void}
                 */
                cmdRedo: function () {
                    if (Microdraw.isLocked) {
                        return;
                    }
                    if (me.RedoStack.length > 0) {
                        var undoInfo = me.getUndo();
                        var redoInfo = me.RedoStack.pop();
                        me.applyUndo(redoInfo);
                        me.UndoStack.push(undoInfo);
                        paper.view.draw();
                        Microdraw.currentRegions();
                    }
                },

                /**
                 * @function getUndo
                 * @desc Return a complete copy of the current state as an undo object.
                 * @returns {Object} The undo object
                 */
                getUndo: function () {
                    var undo = { regions: [], drawingPolygonFlag: me.drawingPolygonFlag };
                    var info = me.objInfo.regions.filter(item => item.uid != 'regionTemp');
                    var i;

                    for (i = 0; i < info.length; i += 1) {
                        var el = {
                            json: JSON.parse(info[i].path.exportJSON()),
                            name: info[i].name,
                            annoSeq: info[i].annoSeq,
                            uid: info[i].uid,
                            labelNo: info[i].labelNo,
                            labelName: info[i].labelName,
                            hex: info[i].hex,
                            review_yn: info[i].review_yn,
                            termination_yn: info[i].termination_yn,
                            del_yn: info[i].del_yn,
                            type: info[i].path.type,
                            selected: info[i].path.selected,
                            fullySelected: info[i].path.fullySelected
                        };
                        undo.regions.push(el);
                    }

                    return undo;
                },

                /**
                 * @function saveUndo
                 * @desc Save an undo object. This has the side-effect of initializing the redo stack.
                 * @param {object} undoInfo The undo info object
                 * @returns {void}
                 */
                saveUndo: function (undoInfo) {
                    me.UndoStack.push(undoInfo);
                    me.RedoStack = [];
                },

                /**
                 * @function applyUndo
                 * @desc Restore the current state from an undo object.
                 * @param {object} undo The undo object to apply
                 * @returns {void}
                 */
                applyUndo: function (undo) {
                    if (Microdraw.isLocked) {
                        return;
                    }

                    var info = me.objInfo.regions;
                    var i;
                    while (info.length > 0) {
                        me.removeRegion(info[0]);
                    }
                    me.region = null;
                    var reg;

                    me.annoSeq = 1;

                    for (i = 0; i < undo.regions.length; i += 1) {
                        var el = undo.regions[i];
                        var project = paper.projects[0];

                        /* Create the path and add it to a specific project.
                        */

                        var path = new paper.Path();
                        project.addChild(path);

                        /*
                         * @todo This is a workaround for an issue on paper.js. It needs to be removed when the issue will be solved
                         */
                        var { insert } = path.insert;
                        path.importJSON(el.json);
                        path.insert = insert;

                        reg = me.newRegion({
                            name: el.name,
                            annoSeq: el.annoSeq,
                            uid: el.uid,
                            path: path,
                            hex: el.hex,
                            del_yn: el.del_yn,
                        }, undo.imageNumber);
                        // here order matters. if fully selected is set after selected, partially selected paths will be incorrect
                        reg.path.fullySelected = el.fullySelected;
                        reg.path.selected = el.selected;
                        reg.path.type = el.type;
                        reg.path.insert = (new paper.Path()).insert;
                        reg.name = el.name;
                        reg.labelNo = el.labelNo;
                        reg.labelName = el.labelName;
                        reg.hex = el.hex;
                        reg.review_yn = el.review_yn;
                        reg.termination_yn = el.termination_yn;
                        reg.del_yn = el.del_yn;

                        if (me.dom.querySelector('#labelChk' + el.labelNo)) {
                            if (me.dom.querySelector('#labelChk' + el.labelNo).checked && reg.del_yn == 'N') {
                                reg.path.visible = true;
                                reg.text.visible = true;
                            }
                            else {
                                reg.path.visible = false;
                                reg.text.visible = false;
                            }
                        }

                        if (el.selected) {
                            if (me.region === null) {
                                me.region = reg;
                            } else {
                                if (me.debug) {
                                    console.log("Should not happen: two regions selected?");
                                }
                            }
                        }
                    }

                    if (undo.callback && typeof undo.callback === 'function') {
                        undo.callback();
                    }

                    me.chkSaved(false);

                    /**
                     * @todo This line produces an error when the undo object is undefined. However, the code seems to work fine without this line. Check what the line was supposed to do
                     */
                    // me.drawingPolygonFlag = me.undo.drawingPolygonFlag;
                },

                /**
                 * @function commitMouseUndo
                 * @desc If we have actually made a change with a mouse operation, commit the undo information.
                 * @returns {void}
                 */
                commitMouseUndo: function () {
                    if (me.mouseUndo !== null) {
                        me.saveUndo(me.mouseUndo);
                        me.mouseUndo = null;
                    }
                    Microdraw.chkSaved(false);
                },

                /**
                 * @function backToPreviousTool
                 * @param {string} prevTool Name of the previously selected tool
                 * @returns {void}
                 */
                backToPreviousTool: function (prevTool) {
                    // setTimeout(function() {
                    //     if (!me.dom.querySelector("#" + prevTool).classList.contains("noBorder")) {
                    //         me.selectedTool = prevTool;
                    //     }
                    //     // me.selectTool();
                    // }, 500);
                    if (!me.dom.querySelector("#" + prevTool).classList.contains("noBorder")) {
                        me.selectedTool = prevTool;
                        me.initCursor();
                        me.updateCursor();
                    }
                },

                /**
                 * @function backToSelect
                 * @returns {void}
                 */
                backToSelect: function () {
                    setTimeout(function () {
                        me.selectedTool = "select";
                        // me.selectTool();
                    }, 500);
                },

                /**
                 * @function cmdDeleteSelected
                 * @desc This function deletes the currently selected object.
                 * @returns {void}
                 */
                cmdDeleteSelected: function () {
                    var undoInfo = me.getUndo();
                    var i;

                    if (me.objComment) {
                        me.removeComment();
                    }

                    if (Microdraw.isLocked || _auth_level == "UO") {
                        return;
                    }

                    for (i in me.objInfo.measurements) {
                        if (me.objInfo.measurements[i].path.selected) {
                            me.removeMeasurement(me.objInfo.measurements[i])
                            return;
                        }
                    }

                    for (i in me.objInfo.regions) {
                        if (me.objInfo.regions[i].path.selected) {
                            if (!me.objInfo.regions[i].path.fullySelected) {
                                toast.warning('Accepted object cannot be deleted.');
                                return;
                            }
                            if (me.objInfo.regions[i].uid.toString().includes('temp')) {
                                me.removeRegion(me.objInfo.regions[i])
                            }
                            else {
                                me.objInfo.regions[i].del_yn = "Y";
                                me.objInfo.regions[i].path.visible = false;
                                me.objInfo.regions[i].path.selected = false;
                                me.objInfo.regions[i].text.visible = false;
                            }

                            me.saveUndo(undoInfo);

                            Microdraw.currentRegions();

                            me.chkSaved(false);
                            return;
                        }
                    }


                },

                /**
                 * @function cmdPaste
                 * @returns {void}
                 */
                cmdPaste: function () {
                    if (Microdraw.isLocked) {
                        return;
                    }

                    if (me.copyRegion !== null) {
                        if (me.copyRegion.type == 'MEASUREMENT') {
                            return;
                        }

                        var undoInfo = me.getUndo();
                        me.saveUndo(undoInfo);

                        me.copyRegion.name = "Object" + me.annoSeq;

                        var reg = JSON.parse(JSON.stringify(me.copyRegion));
                        reg.path = new paper.Path();

                        /**
                         * @todo Workaround for paperjs. remove when the issue will be solver
                         */
                        var { insert } = reg.path.insert;
                        reg.path.importJSON(me.copyRegion.path);
                        reg.path.insert = insert;
                        reg.path.type = me.copyRegion.type;

                        reg.path.fullySelected = true;

                        me.newRegion({
                            name: me.copyRegion.name,
                            labelNo: me.copyRegion.labelNo,
                            labelName: me.copyRegion.labelName,
                            hex: me.copyRegion.hex,
                            annoSeq: me.annoSeq,
                            uid: 'temp' + me.annoSeq,
                            path: reg.path
                        });
                    }
                    paper.view.draw();
                },

                /**
                 * @function cmdCopy
                 * @returns {void}
                 */
                cmdCopy: function () {
                    if (me.region !== null && !me.region.path.type.includes('COMMENT')) {
                        var json = me.region.path.exportJSON();
                        me.copyRegion = JSON.parse(JSON.stringify(me.region));
                        me.copyRegion.path = json;
                        me.copyRegion.type = me.region.path.type;
                    }
                },

                /**
                  * @function selectTool
                  * @returns {void}
                  */
                selectTool: function () {
                    if (me.debug) { console.log("> selectTool"); }


                    //   me.dom.querySelector("img.button1").classList.remove("selected");
                    //   me.dom.querySelector("img.button1#" + me.selectedTool).classList.add("selected");
                    me.dom.querySelector("#menuBar .selected").classList.remove("selected");
                    me.dom.querySelector("#menuBar #" + me.selectedTool).classList.add("selected");
                    me.initCursor();
                    me.updateCursor();
                },

                clickTool: function (tool) {
                    var prevTool = me.selectedTool;

                    if (me.tools[prevTool] && me.tools[prevTool].onDeselect) {
                        me.tools[prevTool].onDeselect();
                    }

                    if (!me.dom.querySelector("#" + tool).classList.contains("noBorder")) {
                        me.initToolSelection();
                        me.dom.querySelector("#" + tool).classList.add("selected");
                        me.prevTool = tool;
                    }


                    me.selectedTool = tool;
                    me.initCursor();
                    me.updateCursor();

                    if (me.selectedTool != "popupInfo") {
                        Microdraw.dom.querySelector("#popup-info").style.visibility = 'hidden';
                    }

                    Microdraw.dom.querySelector("#changeLabelDiv").style.visibility = 'hidden';

                    if (me.selectedTool == "drawPoint" || me.selectedTool == "drawLine" || me.selectedTool == "drawBbox" || me.selectedTool == "drawSeg") {
                        me.listUpLabelByCoordinateKindCd(me.selectedTool.replace('draw', ''), '#labelDiv')

                        me.dom.querySelector("#labelDiv").style.visibility = 'visible';
                        // if (me.dom.querySelector("#labelDiv").style.visibility == 'visible') {
                        //     me.dom.querySelector("#labelDiv").style.visibility = 'hidden';
                        // }
                        // else {
                        //     me.dom.querySelector("#labelDiv").style.visibility = 'visible';
                        // }
                    }
                    else {
                        if (me.dom.querySelector("#labelDiv").style.visibility == 'visible') {
                            me.dom.querySelector("#labelDiv").style.visibility = 'hidden';
                        }
                    }

                    if (tool != 'region') {
                        ToolDrawLine.click(prevTool)
                        // me.tools[me.selectedTool].click(prevTool);
                    }
                },

                /**
                 * @function toolSelection
                 * @returns {void}
                 */
                toolSelection: function () {
                    if (me.debug) {
                        console.log("> toolSelection");
                    }

                    if (this.parentElement.className.includes('locked') && !this.className.includes('no-lock') && me.isLocked) {
                        return;
                    }

                    const tool = this.id;
                    me.clickTool(tool);
                },

                /**
                 * @function statusSelection
                 * @returns {void}
                 * 헤더에서 start, progressing 클릭시 동작
                 * start -> 로그인 유저 아이디 DB 업데이트
                 * ongoin -> objectListPopup 노출
                 */
                statusSelection: function () {
                    if (me.debug) {
                        console.log("> statusSelection");
                    }

                    if (_auth_level == "UO") {
                        customAlert('You do not have permission to perform this operation.')
                        return;
                    }

                    let work = this.parentElement.getAttribute('work');
                    let status = this.className;

                    if (status == "start") {
                        if (work == "Review") {
                            //annotation 작업자 동일인이 review 불가                    
                            if (me.statusInfo.annotation_ssid == _ssid) {
                                customAlert('You can not review your annotation result.')
                                return;
                            }
                        }
                        if (work == "Termination") {
                            //Clinical Info가 입력되지 않은 경우 termination 불가
                            if (Microdraw.statusInfo.info_yn == "N") {
                                customAlert('Clinical Info has not been entered.')
                                return;
                            }
                            else {
                                //annotation 작업자 동일인이 termination 불가                    
                                if (me.statusInfo.annotation_ssid == _ssid) {
                                    customAlert('You can not termination your annotation result.')
                                    return;
                                }
                            }
                        }

                        me.statusUpdate(work, status);
                        this.className = "progressing";
                        // 진행 상태시 lock 해제
                        me.dom.querySelector("#buttonsBlock .btnArea2").classList.remove('locked');
                        me.dom.querySelector("#buttonsBlock .btnArea2").classList.remove('locked');
                        me.dom.querySelector("#buttonsBlock .btnArea3").classList.remove('locked');

                        me.isLocked = false;

                        if (Microdraw.region !== null) {
                            Microdraw.region.path.fullySelected = true;
                        }
                    }

                    else if (status == "progressing") {
                        if (!me.isLocked || _auth_level == 'SM' || _auth_level == 'GM' || _auth_level == 'OM') {
                            //Clinical Info가 입력되지 않은 경우 termination 불가
                            if (work == "Termination" && Microdraw.statusInfo.info_yn == "N") {
                                customAlert('Clinical Info has not been entered.')
                                return;
                            }

                            me.objectListPopup()
                        }
                    }

                    else if (status == "complete") {
                        if (work == "Annotation") {
                            if (me.statusInfo.review_ssid !== null || me.statusInfo.review_utc_dtm !== null
                                || me.statusInfo.termination_ssid !== null || me.statusInfo.termination_utc_dtm !== null) {
                                return;
                            }
                        }
                        else if (work == "Review") {
                            if (me.statusInfo.termination_ssid !== null || me.statusInfo.termination_utc_dtm !== null) {
                                return;
                            }
                        }

                        me.objectListPopup()
                    }
                },

                /**
                 * @function statusSelection
                 * @returns {void}
                 * 헤더에서 start, objectListPopup에서 complete 클릭시 상태값 업데이트
                 */
                statusUpdate: function (work, status) {
                    if (me.debug) {
                        console.log("> statusSelection");
                    }

                    var param = {
                        slide_id: Microdraw.slide_id,
                        work: work,
                        status: status
                    }

                    if (_auth_level != "UO") {
                        axios.post(web_url + `/api/annotation/status-input`, param)
                            .then((data) => {
                                toast.success(work + " " + status + " change success!");
                                me.chkSaved(true);
                                if (work == "Annotation") {
                                    me.statusInfo.annotation_ssid = _ssid;
                                }
                                else if (work == "Review") {
                                    me.statusInfo.review_ssid = _ssid;
                                }
                                else if (work == "Termination") {
                                    me.statusInfo.termination_ssid = _ssid;
                                }

                                if (_auth_level != "UO" && status == "start") {
                                    me.currentRegions();
                                }
                                me.dbStatusLoad();
                            })
                            .catch(error => {
                                toast.error(work + " " + status + " change failed!");
                            });
                    }
                },

                // 헤더에서 start, progressing 버튼 클릭시 나오는 팝업
                objectListPopup: function () {
                    let element_li = document.createElement('li');
                    let element_div_objectArea;
                    let element_div_labelArea;
                    let element_div_label;
                    let element_div_change;
                    let element_div;
                    let element_div_viewarea2;
                    let element_div_accept;
                    let element_div_save_area;
                    let element_div_save;
                    let element_div_complete;
                    let element_div_reset;
                    let element_div_cancel;
                    let element_div_flex;
                    let element_span;
                    let reg;
                    let ownFlag = false;
                    let adminFlag = false;
                    let status;

                    //관리자 플래그 > reset, role cancel 버튼 구분
                    if (_auth_level == 'SM' || _auth_level == 'GM' || _auth_level == 'OM') {
                        adminFlag = true;
                    }

                    //내 작업 구분 accept, label change, save, complete, reset, role cancel
                    if (Microdraw.latestWork == "Annotation") {
                        if (_ssid == me.statusInfo.annotation_ssid) {
                            ownFlag = true;
                        }
                    }

                    else if (Microdraw.latestWork == "Review") {
                        if (_ssid == me.statusInfo.review_ssid) {
                            ownFlag = true;
                        }
                    }

                    else if (Microdraw.latestWork == "Termination") {
                        if (_ssid == me.statusInfo.termination_ssid) {
                            ownFlag = true;
                        }
                    }

                    // 관리자가 아니며 내 작업이 아니거나 뷰어 권한만 있을때 리스트만 출력
                    if (!adminFlag && (!ownFlag || _auth_level == "UO")) {
                        Microdraw.latestWork = "Object List";
                        Microdraw.latestStatus = "";
                    }

                    // 매번 내용 전부 지우고 다시 그려줌
                    me.dom.querySelector("#popup-object .titleText").innerText = Microdraw.latestWork;

                    me.dom.querySelectorAll("#popup-object .viewArea ul li").forEach(
                        e => e.remove()
                    );

                    me.dom.querySelectorAll("#popup-object .viewArea2 div").forEach(
                        e => e.remove()
                    );

                    if (!me.initSetting['popup-object']) {
                        if (me.initSetting['reviewArea']) {
                            setSettingCookie({ 'popup-object': me.initSetting['reviewArea'] });
                            me.initSetting['popup-object'] = me.initSetting['reviewArea'];
                        }
                        else {
                            setSettingCookie({ 'popup-object': popupObjectInit });
                            me.initSetting['popup-object'] = popupObjectInit;
                        }
                    }

                    me.dom.querySelector("#popup-object").style.visibility = 'visible';
                    me.dom.querySelector("#popup-object").style.left = me.initSetting['popup-object']['left'];
                    me.dom.querySelector("#popup-object").style.top = me.initSetting['popup-object']['top'];
                    me.dom.querySelector("#popup-object").style.width = me.initSetting['popup-object']['width'];
                    me.dom.querySelector("#popup-object").style.height = me.initSetting['popup-object']['height'];

                    // 목록 그리기
                    for (var regCnt = 0; regCnt < me.objInfo.regions.length; regCnt++) {
                        reg = me.objInfo.regions[regCnt];

                        if (reg.del_yn == "N" && reg.path.type != 'MEASUREMENT') {
                            element_li = document.createElement('li');
                            element_li.className = 'clear ' + reg.name;
                            element_li.id = reg.name;

                            element_div = document.createElement('div');
                            element_div.className = 'flex ai-center object';
                            if (reg.path.selected) {
                                element_div.classList.add('selected');
                            }

                            element_span = document.createElement('span');
                            element_span.style.backgroundColor = 'rgb(' + me.hexToRgb(reg.hex) + ')';

                            element_div.append(element_span);
                            element_div.innerHTML = element_div.innerHTML + reg.name;

                            // object명 클릭시 select 하기
                            element_div.addEventListener("click", function () {
                                if (me.tools[Microdraw.selectedTool] && me.tools[Microdraw.selectedTool].onDeselect) {
                                    me.tools[Microdraw.selectedTool].onDeselect();
                                }

                                me.dom.querySelectorAll("#popup-object .viewArea ul li div.object").forEach(
                                    e => e.classList.remove('selected')
                                );

                                this.classList.add('selected');

                                let reg;
                                for (var regCnt = 0; regCnt < me.objInfo.regions.length; regCnt++) {
                                    reg = me.objInfo.regions[regCnt];

                                    if (reg.name == this.innerText) {
                                        Microdraw.selectRegion(reg);
                                        // reg.path.fullySelected = true;

                                        Microdraw.viewer.viewport.centerSpringX.target.value = reg.path.position.x / 1000;
                                        Microdraw.viewer.viewport.centerSpringY.target.value = reg.path.position.y / 1000;
                                    }
                                    else {
                                        reg.path.fullySelected = false;
                                    }
                                }

                                Microdraw.selectMeasurement(null);
                                Microdraw.selectComment(null);

                                paper.view.draw();
                            });

                            element_div_objectArea = document.createElement('li');
                            element_div_objectArea.className = "flex sb"
                            element_div_objectArea.style.height = '24px';
                            element_div_objectArea.style.marginBottom = "4px"
                            element_div_objectArea.append(element_div);

                            // 작업 상태에 따라 accept 버튼 그리기
                            if ((Microdraw.latestWork == "Review" || Microdraw.latestWork == "Termination") && ownFlag && Microdraw.latestStatus != 'complete') {
                                element_div_accept = document.createElement('div');
                                if (Microdraw.latestWork == "Review") {
                                    if (reg.review_yn == 'Y') {
                                        element_div_accept.className = 'acceptOff';
                                    }
                                    else {
                                        element_div_accept.className = 'acceptOn';
                                    }
                                }
                                else if (Microdraw.latestWork == "Termination") {
                                    if (reg.termination_yn == 'Y') {
                                        element_div_accept.className = 'acceptOff';
                                    }
                                    else {
                                        element_div_accept.className = 'acceptOn';
                                    }
                                }
                                element_div_accept.innerText = 'Accept';

                                // accept 버튼 클릭이벤트, 신규 object는 insert 해줌
                                element_div_accept.addEventListener("click", function () {
                                    if (this.className.includes('acceptOff')) {
                                        return;
                                    }

                                    if (!me.validateIntersect()) {
                                        return false;
                                    }

                                    if (me.tools[Microdraw.selectedTool] && me.tools[Microdraw.selectedTool].onDeselect) {
                                        me.tools[Microdraw.selectedTool].onDeselect();
                                    }

                                    let element_btnChange = this.parentElement.parentElement.querySelector(".btnChange");

                                    let reg;
                                    for (var regCnt = 0; regCnt < me.objInfo.regions.length; regCnt++) {
                                        reg = me.objInfo.regions[regCnt];

                                        if (reg.labelName.toUpperCase() == "UNKNOWN") {
                                            customAlert('Change UNKNOWN label name before accept.')
                                            return;
                                        }

                                        if (reg.name == this.previousSibling.innerText) {
                                            var coordinate_info = me.coordinateInfo(reg);
                                            var param = {};
                                            var values = [];
                                            let label_id = reg.labelNo;
                                            if (label_id == "") {
                                                label_id = null;
                                            }
                                            values.push({
                                                annotation_id: reg.uid,
                                                label_id: label_id,
                                                coordinate_kind_cd: reg.path.type,
                                                coordinate_info: coordinate_info,
                                                review_yn: 'N',
                                                termination_yn: 'N',
                                                del_yn: 'N',
                                            })

                                            if (me.dom.querySelector("#popup-object .titleText").innerText == "Review") {
                                                values[0].review_yn = 'Y'
                                                reg.review_yn = 'Y'
                                            }

                                            if (me.dom.querySelector("#popup-object .titleText").innerText == "Termination") {
                                                values[0].termination_yn = 'Y'
                                                reg.termination_yn = 'Y'
                                            }

                                            param = {
                                                slide_id: Microdraw.slide_id,
                                                annotation_list: values,
                                            }

                                            if (ownFlag && Microdraw.latestStatus != 'complete') {
                                                axios.post(web_url + `/api/annotation/input`, param)
                                                    .then((result) => {
                                                        this.className = this.className.replace('acceptOn', 'acceptOff');
                                                        if (element_btnChange !== null) {
                                                            element_btnChange.style.visibility = 'hidden';
                                                        }
                                                        reg.path.fullySelected = false;
                                                        // reg.path.selected = true;
                                                        paper.view.draw();
                                                    })
                                                    .catch(error => {
                                                        toast.error("Annotation accept failed!");
                                                    });
                                            }
                                            break;
                                        }
                                    }

                                });
                                element_div_objectArea.append(element_div_accept);
                            }
                            element_li.append(element_div_objectArea);

                            element_div_labelArea = document.createElement('div');
                            element_div_labelArea.className = "flex sb ai-center";
                            element_div_labelArea.style.height = '24px';
                            element_div_labelArea.style.marginBottom = '4px';

                            // 라벨명 클릭시 나오는 라벨명 팝업
                            element_div_label = document.createElement('div');
                            element_div_label.className = "label-nm";
                            element_div_label.setAttribute('title', reg.labelName);
                            element_div_label.setAttribute('data-label-no', reg.labelNo);
                            element_div_label.setAttribute('data-type', reg.path.type);
                            element_div_label.style.overflow = 'hidden';
                            element_div_label.style.textOverflow = 'ellipsis';
                            element_div_label.style.whiteSpace = 'nowrap';
                            element_div_label.style.marginLeft = '5px';
                            element_div_label.style.fontSize = '12px';
                            if (!Microdraw.isLocked && _auth_level != "UO" && ownFlag && Microdraw.latestStatus != "complete") {
                                if (Microdraw.latestWork == "Review") {
                                    if (reg.review_yn != 'Y') {
                                        element_div_label.style.cursor = 'pointer';
                                    }
                                }
                                else if (Microdraw.latestWork == "Termination") {
                                    if (reg.termination_yn != 'Y') {
                                        element_div_label.style.cursor = 'pointer';
                                    }
                                }
                                else {
                                    element_div_label.style.cursor = 'pointer';
                                }
                            }
                            element_div_label.innerText = reg.labelName;

                            element_div_label.addEventListener("click", async function (event) {
                                if (me.tools[Microdraw.selectedTool] && me.tools[Microdraw.selectedTool].onDeselect) {
                                    await me.tools[Microdraw.selectedTool].onDeselect();
                                }

                                me.dom.querySelectorAll("#popup-object .viewArea ul li div").forEach(
                                    e => e.classList.remove('selected')
                                );

                                me.dom.querySelectorAll("#changeLabelDiv li").forEach(
                                    e => e.classList.remove('selected')
                                );

                                Microdraw.dom.querySelector("#popup-info").style.visibility = 'hidden';
                                Microdraw.dom.querySelector("#labelDiv").style.visibility = 'hidden';

                                let parent_object = Microdraw.dom.getElementById(`${this.parentElement.parentElement.id}`);
                                let element_object = parent_object.querySelector(".object")
                                element_object.classList.add('selected');

                                let selectedLabelNo = parent_object.querySelector(".label-nm").getAttribute('data-label-no');
                                let selectedType = parent_object.querySelector(".label-nm").getAttribute('data-type');

                                me.listUpLabelByCoordinateKindCd(selectedType, '#changeLabelDiv')

                                $(me.dom.querySelector("#changeLabelDiv")).find(`[data-label-no=${selectedLabelNo}]`).addClass('selected')

                                let reg;
                                for (var regCnt = 0; regCnt < me.objInfo.regions.length; regCnt++) {
                                    reg = me.objInfo.regions[regCnt];

                                    if (reg.name == element_object.innerText) {
                                        Microdraw.selectRegion(reg);
                                        reg.path.fullySelected = true;
                                    }
                                    else {
                                        reg.path.fullySelected = false;
                                    }
                                }

                                paper.view.draw();

                                if (Microdraw.isLocked || _auth_level == "UO" || !ownFlag || Microdraw.latestStatus == "complete") {
                                    me.dom.querySelector("#changeLabelDiv").style.visibility = 'hidden';
                                    return;
                                }


                                if (Microdraw.latestWork == "Review") {
                                    if (Microdraw.region.review_yn == 'Y') {
                                        me.dom.querySelector("#changeLabelDiv").style.visibility = 'hidden';
                                        return;
                                    }
                                }
                                else if (Microdraw.latestWork == "Termination") {
                                    if (Microdraw.region.termination_yn == 'Y') {
                                        me.dom.querySelector("#changeLabelDiv").style.visibility = 'hidden';
                                        return;
                                    }
                                }

                                me.dom.querySelector("#popup-object").style.overflow = 'visible';
                                me.dom.querySelector("#changeLabelDiv").style.left = event.layerX + 'px';
                                me.dom.querySelector("#changeLabelDiv").style.top = event.layerY + 'px';
                                // me.dom.querySelector("#changeLabelDiv").style.left = event.offsetX + 20 + 'px';
                                // me.dom.querySelector("#changeLabelDiv").style.top = event.offsetY + 90 + 'px';
                                me.dom.querySelector("#changeLabelDiv").style.visibility = 'visible';

                                var changeLabelDivTop =
                                    Microdraw.dom.querySelectorAll(`#changeLabelDiv`).offsetParent.offsetTop
                                    + Microdraw.dom.querySelectorAll(`#changeLabelDiv`).offsetTop;

                                // var changeLabelDivOriginHeight = Microdraw.dom.querySelectorAll(`#changeLabelDiv`).attr('origin-height');
                                // 좌표 type에 따라 갯수가 다를것 대비하여 직접 계산
                                var changeLabelDivOriginHeight =
                                    parseInt(Microdraw.dom.querySelector(`#changeLabelDiv`).css('border-top'))
                                    + parseInt(Microdraw.dom.querySelector(`#changeLabelDiv`).css('border-bottom'))
                                    + parseInt(Microdraw.dom.querySelector(`#changeLabelDiv`).css('padding-top'))
                                    + parseInt(Microdraw.dom.querySelector(`#changeLabelDiv`).css('padding-bottom'))
                                    + (
                                        Microdraw.dom.querySelectorAll(`#changeLabelDiv li`).length
                                        * parseInt(Microdraw.dom.querySelector(`#changeLabelDiv li`).css('height'))
                                    );
                                var bodyHeight = Microdraw.dom.querySelectorAll(`body`).offsetHeight

                                if (bodyHeight - changeLabelDivTop - changeLabelDivOriginHeight - 5 < 1) {
                                    Microdraw.dom.querySelectorAll(`#changeLabelDiv`).style.height = `${bodyHeight - changeLabelDivTop - 5}px`
                                }
                                else {
                                    Microdraw.dom.querySelectorAll(`#changeLabelDiv`).style.height = `${changeLabelDivOriginHeight}px`;
                                }
                            });

                            element_div_labelArea.append(element_div_label);

                            // 라벨명 change 버튼; 신규object
                            let btnChangeFlag = true;
                            if (!reg.uid.toString().includes('temp') && !Microdraw.isLocked && _auth_level != "UO" && ownFlag && Microdraw.latestStatus != "complete") {
                                if (Microdraw.latestWork == "Review") {
                                    if (reg.review_yn == 'Y') {
                                        btnChangeFlag = false;
                                    }
                                }
                                else if (Microdraw.latestWork == "Termination") {
                                    if (reg.termination_yn == 'Y') {
                                        btnChangeFlag = false;
                                    }
                                }

                                if (btnChangeFlag) {
                                    element_div_change = document.createElement('div');
                                    element_div_change.innerText = 'Change';
                                    element_div_change.className = 'btnChange';

                                    element_div_change.addEventListener("click", function (event) {
                                        if (!me.validateIntersect()) {
                                            return false;
                                        }

                                        if (me.tools[Microdraw.selectedTool] && me.tools[Microdraw.selectedTool].onDeselect) {
                                            me.tools[Microdraw.selectedTool].onDeselect();
                                        }

                                        let reg;
                                        let element_object = this.parentElement.parentElement.querySelector(".object");

                                        for (var regCnt = 0; regCnt < me.objInfo.regions.length; regCnt++) {
                                            reg = me.objInfo.regions[regCnt];

                                            if (reg.name == element_object.innerText) {
                                                Microdraw.selectRegion(reg);
                                            }
                                            else {
                                                reg.path.selected = false;
                                                reg.path.fullySelected = false;
                                            }
                                        }

                                        if (Microdraw.isLocked || !ownFlag || _auth_level == "UO") {
                                            return;
                                        }

                                        paper.view.draw();

                                        if (Microdraw.region !== null) {
                                            if (Microdraw.region.labelNo !== null) {
                                                // 기존 주석을 change 버튼 클릭시 update
                                                var param = {};
                                                var values = [];

                                                values.push({
                                                    annotation_id: Microdraw.region.uid,
                                                    label_id: Microdraw.region.labelNo
                                                })

                                                param = {
                                                    slide_id: Microdraw.slide_id,
                                                    annotation_list: values,
                                                }

                                                axios.post(web_url + `/api/annotation/update-label`, param)
                                                    .then((data) => {
                                                        toast.success("Label change success!");
                                                    })
                                                    .catch(error => {
                                                        toast.error("Label change failed!");
                                                    });
                                            }
                                            else {
                                                toast.error(document.querySelector("#labelName").innerText + " can not change label!");
                                            }
                                        }
                                    });

                                    element_div_labelArea.append(element_div_change);
                                }
                            }

                            element_li.append(element_div_labelArea);
                        }

                        if (reg.del_yn == "N") {
                            me.dom.querySelector(".viewArea ul").append(element_li);
                        }
                    }

                    if (Microdraw.latestWork != "Object List" || adminFlag) {
                        if (!ownFlag && !adminFlag) {
                            if (me.dom.querySelector("#popup-object .viewArea2") !== null) {
                                me.dom.querySelector("#popup-object .viewArea2").remove()
                            }
                        }
                        else if (me.dom.querySelector("#popup-object .viewArea2") === null && (ownFlag || adminFlag) && _auth_level != "UO") {
                            element_div_viewarea2 = document.createElement('div');
                            element_div_viewarea2.className = 'viewArea2';
                            me.dom.querySelector("#popup-object").append(element_div_viewarea2);
                        }

                        // save 버튼
                        if ((ownFlag && Microdraw.latestStatus != 'complete')) {
                            element_div_save_area = document.createElement('div');
                            element_div_save_area.className = 'flex jc-center';

                            element_div_save = document.createElement('div');
                            element_div_save.className = 'btn-anno btnSave';
                            element_div_save.innerText = 'Temporary Save';

                            element_div_save.addEventListener("click", async function () {
                                me.save();
                            });

                            element_div_save_area.append(element_div_save);

                            // complete 버튼
                            element_div_complete = document.createElement('div');
                            element_div_complete.className = 'btn-anno btnComplete';
                            element_div_complete.innerText = 'Complete';

                            element_div_complete.addEventListener("click", function () {
                                if (me.tools[Microdraw.selectedTool] && me.tools[Microdraw.selectedTool].onDeselect) {
                                    me.tools[Microdraw.selectedTool].onDeselect();
                                }

                                let reg;
                                for (var regCnt = 0; regCnt < me.objInfo.regions.length; regCnt++) {
                                    reg = me.objInfo.regions[regCnt];
                                    if (reg.labelName?.toUpperCase() == "UNKNOWN") {
                                        customAlert('Change UNKNOWN label name before complete.')
                                        return;
                                    }
                                }

                                if (!me.validateIntersect()) {
                                    return false;
                                }

                                $.confirm({
                                    title: '',
                                    content: 'Are you sure you want to finish ' + Microdraw.latestWork + ' work?',
                                    type: 'custom',
                                    typeAnimated: true,
                                    animation: 'none',
                                    buttons: {
                                        tryAgain: {
                                            text: 'CONFIRM',
                                            btnClass: 'btn-custom',
                                            action: () => {
                                                me.updateDelBeforeSave();

                                                let flag = false;
                                                let completeFlag = false;
                                                var param = {};
                                                var values = [];

                                                for (var regCnt = 0; regCnt < me.objInfo.regions.length; regCnt++) {
                                                    reg = me.objInfo.regions[regCnt];

                                                    if (reg.uid == 'regionTemp') {
                                                        continue;
                                                    }

                                                    if (me.dom.querySelector("#popup-object .titleText").innerText == "Annotation") {
                                                        flag = true;
                                                    }

                                                    if (me.dom.querySelector("#popup-object .titleText").innerText == "Review") {
                                                        if (reg.review_yn == 'N') {
                                                            flag = true;
                                                        }
                                                        else {
                                                            flag = false;
                                                        }
                                                    }

                                                    if (me.dom.querySelector("#popup-object .titleText").innerText == "Termination") {
                                                        if (reg.termination_yn == 'N') {
                                                            flag = true;
                                                        }
                                                        else {
                                                            flag = false;
                                                        }
                                                    }

                                                    if (reg.del_yn == "N") {
                                                        completeFlag = true;
                                                    }

                                                    // review, termination의 경우 accept N인 값만 update
                                                    if (flag) {
                                                        var coordinate_info = me.coordinateInfo(reg);

                                                        var label_id = reg.labelNo;
                                                        if (label_id == "") {
                                                            label_id = null;
                                                        }

                                                        values.push({
                                                            annotation_id: reg.uid,
                                                            label_id: label_id,
                                                            coordinate_kind_cd: reg.path.type,
                                                            coordinate_info: coordinate_info,
                                                            review_yn: '',
                                                            termination_yn: '',
                                                            del_yn: reg.del_yn,
                                                        })

                                                        if (me.dom.querySelector("#popup-object .titleText").innerText == "Annotation") {
                                                            values[values.length - 1].review_yn = 'N'
                                                            values[values.length - 1].termination_yn = 'N'
                                                            reg.annotation_yn = 'Y'
                                                        }

                                                        if (me.dom.querySelector("#popup-object .titleText").innerText == "Review") {
                                                            values[values.length - 1].review_yn = 'Y'
                                                            values[values.length - 1].termination_yn = 'N'
                                                            reg.review_yn = 'Y'
                                                        }

                                                        if (me.dom.querySelector("#popup-object .titleText").innerText == "Termination") {
                                                            values[values.length - 1].termination_yn = 'Y'
                                                            reg.termination_yn = 'Y'
                                                            values[values.length - 1].review_yn = 'Y'
                                                            reg.review_yn = 'Y'
                                                        }


                                                    }
                                                }

                                                param = {
                                                    slide_id: Microdraw.slide_id,
                                                    annotation_list: values,
                                                }

                                                if (param.annotation_list.length > 0 && _auth_level != "UO") {
                                                    axios.post(web_url + `/api/annotation/input`, param)
                                                        .then((data) => {
                                                            // toast.warning("Complete success!");
                                                            me.chkSaved(true);
                                                        })
                                                        .catch(error => {
                                                            toast.error("Complete failed!");
                                                        });
                                                }


                                                if (completeFlag) {
                                                    me.dom.querySelectorAll("#popup-object .clear div.acceptOn").forEach(
                                                        e => e.className = e.className.replace('acceptOn', 'acceptOff')
                                                    );

                                                    me.statusUpdate(Microdraw.latestWork, 'complete');
                                                    me.loadDBData();
                                                }
                                                else {
                                                    customAlert('Must have at least 1 annotation to complete.')
                                                }
                                            }
                                        },
                                        close: {
                                            text: 'Cancel',
                                        }
                                    }
                                });
                            });

                            element_div_save_area.append(element_div_complete);
                            me.dom.querySelector("#popup-object .viewArea2").append(element_div_save_area);

                            if (me.initPopupFlag) {
                                me.dom.querySelector(".viewArea").style.height = 'calc(100% - 106px)';
                            }

                        }

                        if (ownFlag || adminFlag) {
                            element_div_flex = document.createElement('div');
                            element_div_flex.className = 'flex jc-center';

                            // reset 버튼
                            element_div_reset = document.createElement('div');
                            element_div_reset.className = 'btn-anno btnReset';
                            element_div_reset.innerText = 'Reset';

                            element_div_reset.addEventListener("click", function () {
                                if (me.tools[Microdraw.selectedTool] && me.tools[Microdraw.selectedTool].onDeselect) {
                                    me.tools[Microdraw.selectedTool].onDeselect();
                                }

                                $.confirm({
                                    title: '',
                                    content: 'Are you sure you want to reset ' + Microdraw.latestWork + ' data?',
                                    type: 'custom',
                                    typeAnimated: true,
                                    animation: 'none',
                                    buttons: {
                                        tryAgain: {
                                            text: 'CONFIRM',
                                            btnClass: 'btn-custom',
                                            action: () => {
                                                me.updateDelBeforeSave();

                                                var param = {
                                                    slide_id: Microdraw.slide_id,
                                                    work: Microdraw.latestWork
                                                }

                                                if (_auth_level != "UO") {
                                                    axios.post(web_url + `/api/annotation/status-reset`, param)
                                                        .then((data) => {
                                                            toast.success(Microdraw.latestWork + " reset success!");
                                                            me.chkSaved(true);

                                                            me.dom.querySelectorAll("#popup-object .clear div.acceptOff").forEach(
                                                                e => e.className = e.className.replace('acceptOff', 'acceptOn')
                                                            );

                                                            me.loadDBData();

                                                            if (Microdraw.latestWork == 'Annotation') {
                                                                document.querySelector(".topMenuArea li[work=Annotation" + '] span').className = 'progressing'
                                                            }

                                                            if (Microdraw.latestWork == 'Review') {
                                                                document.querySelector(".topMenuArea li[work=Review" + '] span').className = 'progressing'
                                                            }

                                                            if (Microdraw.latestWork == 'Termination') {
                                                                document.querySelector(".topMenuArea li[work=Termination" + '] span').className = 'progressing'
                                                            }

                                                        })
                                                        .catch(error => {
                                                            toast.error(Microdraw.latestWork + " reset failed!");
                                                        });
                                                }
                                            }
                                        },
                                        close: {
                                            text: 'Cancel',
                                        }
                                    }
                                });
                            });
                            element_div_flex.append(element_div_reset);

                            // cancel 버튼
                            element_div_cancel = document.createElement('div');
                            element_div_cancel.className = 'btn-anno btnCancel';
                            element_div_cancel.innerText = 'Role Cancel';

                            element_div_cancel.addEventListener("click", function () {
                                if (me.tools[Microdraw.selectedTool] && me.tools[Microdraw.selectedTool].onDeselect) {
                                    me.tools[Microdraw.selectedTool].onDeselect();
                                }

                                $.confirm({
                                    title: '',
                                    content: 'Are you sure you want to cancel the ' + Microdraw.latestWork + ' role?',
                                    type: 'custom',
                                    typeAnimated: true,
                                    animation: 'none',
                                    buttons: {
                                        tryAgain: {
                                            text: 'CONFIRM',
                                            btnClass: 'btn-custom',
                                            action: () => {
                                                me.updateDelBeforeSave();

                                                var param = {
                                                    slide_id: Microdraw.slide_id,
                                                    work: Microdraw.latestWork
                                                }

                                                if (_auth_level != "UO") {
                                                    axios.post(web_url + `/api/annotation/status-cancel`, param)
                                                        .then((data) => {
                                                            toast.success(Microdraw.latestWork + " cancel success!");
                                                            me.chkSaved(true);

                                                            me.loadDBData();

                                                            if (Microdraw.latestWork == 'Annotation') {
                                                                document.querySelector(".topMenuArea li[work=Annotation" + '] span').className = 'start'
                                                            }
                                                            else if (Microdraw.latestWork == 'Review') {
                                                                document.querySelector(".topMenuArea li[work=Review" + '] span').className = 'start'
                                                            }
                                                            else if (Microdraw.latestWork == 'Termination') {
                                                                document.querySelector(".topMenuArea li[work=Termination" + '] span').className = 'start'
                                                            }

                                                        })
                                                        .catch(error => {
                                                            toast.error(Microdraw.latestWork + " reset failed!");
                                                        });
                                                }
                                            }
                                        },
                                        close: {
                                            text: 'Cancel',
                                        }
                                    }
                                });
                            });

                            element_div_flex.append(element_div_cancel);

                            if (me.dom.querySelector("#popup-object .viewArea2") === null) {
                                element_div_viewarea2 = document.createElement('div');
                                element_div_viewarea2.className = 'viewArea2';
                                me.dom.querySelector("#popup-object").append(element_div_viewarea2);
                            }


                            if (me.initPopupFlag) {
                                if (me.dom.querySelector(".btnSave") !== null) {
                                    me.dom.querySelector(".viewArea").style.height = 'calc(100% - 220px)'
                                }
                                else {
                                    if (Microdraw.latestWork == 'Object List') {
                                        me.dom.querySelector(".viewArea").style.height = 'calc(100% - 118px)'
                                    }
                                    else {
                                        me.dom.querySelector(".viewArea").style.height = 'calc(100% - 182px)'
                                    }
                                }
                            }

                            me.dom.querySelector("#popup-object .viewArea2").append(element_div_flex);
                        }
                    }

                    if (me.dom.querySelector("#popup-object .viewArea2")) {
                        me.dom.querySelectorAll('#popup-object .viewArea2 .btn-anno').forEach((el) => {
                            el.addEventListener('click',
                                e => {
                                    me.dom.querySelector("#labelDiv").style.visibility = 'hidden';
                                    me.dom.querySelector("#changeLabelDiv").style.visibility = 'hidden';
                                }
                            )
                        });
                    }

                    me.initPopupFlag = false;

                    if (Microdraw.latestWork == "Object List" || (!adminFlag && !ownFlag)) {
                        me.dom.querySelectorAll("#popup-object .viewArea2").forEach(
                            e => e.remove()
                        );

                        me.dom.querySelector(".viewArea").style.height = 'calc(100% - 118px)'
                    }
                },

                memoPopup: function () {
                    if (_auth_level == "UO") {
                        me.dom.querySelector("#popup-memo .add_btn").remove();
                    }

                    me.dbMemoLoad()

                    if (!me.initSetting['popup-memo']) {
                        setSettingCookie({ 'popup-memo': popupMemoInit });
                        me.initSetting['popup-memo'] = popupMemoInit;
                    }

                    if (me.initSetting['popup-memo']['left']) {
                        me.dom.querySelector("#popup-memo").style.left = me.initSetting['popup-memo']['left'];
                    }
                    else {
                        me.dom.querySelector("#popup-memo").style.right = me.initSetting['popup-memo']['right'];
                    }
                    me.dom.querySelector("#popup-memo").style.top = me.initSetting['popup-memo']['top'];
                    me.dom.querySelector("#popup-memo").style.width = me.initSetting['popup-memo']['width'];
                    me.dom.querySelector("#popup-memo").style.height = me.initSetting['popup-memo']['height'];
                },

                closePopupAll: function () {
                    // objectList popup 미포함
                    me.dom.querySelector("#labelDiv").style.visibility = 'hidden';
                    me.dom.querySelector("#changeLabelDiv").style.visibility = 'hidden';
                    me.dom.querySelector("#popup-info").style.visibility = 'hidden';
                },

                loadDBData: async function () {
                    me.objInfo.regions = []
                    paper.projects[0].clear();
                    me.annoSeq = 1;
                    await me.dbStatusLoad();
                    me.dbLabelLoad();
                    me.chkSaved(true);
                    me.dbAnnotationLoad();
                    me.dbCommentLoad();
                },

                dbAnnotationLoad: function () {
                    me.annotationLoad()
                        .then(function (result) {
                            me.annoSeq = 1;
                            var result = result.data
                            let imageSize = me.imageSize;
                            let projectPixel = me.projectSize;

                            let crntInfo = [];
                            let point = [];
                            // let point2 = [[38128.2812,29816.6426], [37366.0781,30016.2676], [36658.3203,30342.9258], [35914.2656,30687.7324], [35170.2109,31086.9805], [34535.0391,31486.2305], [34045.0547,32193.9902], [33790.9844,32992.4883], [33790.9844,33827.2812], [33936.168,34553.1875], [34153.9375,35279.0938], [34571.3359,36041.2969], [35079.4727,36603.875], [35769.082,37075.7148], [36458.6953,37329.7852], [37257.1914,37347.9297], [38055.6914,37112.0117], [38654.5625,36694.6133], [39217.1406,36132.0352], [39779.7227,35605.7539], [40269.707,34988.7344], [40560.0703,34244.6758], [40668.957,33464.3281], [40687.1055,32720.2715], [40687.1055,31976.2168], [40541.9219,31214.0137], [40178.9688,30578.8457], [39507.5039,30215.8926], [38836.043,29925.5293]]
                            // let point2 = [[50581.336, 13290.66796875], [50197.336, 13120.0], [47978.67, 13120.0], [46314.67, 13034.66796875], [43840.0, 12949.3359375], [39744.0, 12778.66796875], [38890.67, 12736.0], [37994.668, 12608.0], [37482.668, 12309.3359375], [37056.0, 12010.66796875], [36885.336, 11840.0], [36800.0, 11754.66796875], [36458.668, 11584.0], [36160.0, 11413.3359375], [35776.0, 11200.0], [35093.336, 10901.3359375], [34368.0, 10602.66796875], [33770.668, 10261.333984375], [33301.336, 9962.66796875], [33088.0, 9664.0], [32874.668, 9408.0], [32618.668, 8768.0], [32490.668, 8640.0], [32320.0, 8128.0], [32277.336, 8000.0], [32064.0, 7232.0], [31808.0, 6165.333984375], [31722.668, 5781.333984375], [31509.336, 5141.333984375], [31466.668, 4672.0], [31424.0, 3989.3359375], [31381.336, 3520.0], [31381.336, 2453.3359375], [31296.0, 1813.3359375], [31296.0, 362.66796875], [31336.297, 0.0], [61984.004, 0.0], [62058.67, 149.3359375], [62229.336, 490.66796875], [62357.336, 746.66796875], [62442.67, 1002.66796875], [62613.336, 1514.66796875], [62656.0, 1685.3359375], [62869.336, 2410.66796875], [63040.0, 3434.66796875], [63125.336, 3946.66796875], [63168.0, 4586.66796875], [63253.336, 5269.333984375], [63338.67, 5994.66796875], [63338.67, 6506.66796875], [63424.0, 7189.333984375], [63509.336, 7488.0], [63552.0, 7829.333984375], [63637.336, 8128.0], [63722.67, 8725.333984375], [63722.67, 11072.0], [63637.336, 11285.3359375], [63552.0, 11456.0], [63424.0, 11754.66796875], [63168.0, 12053.3359375], [62613.336, 12949.3359375], [62229.336, 13674.66796875], [61930.67, 14016.0], [61760.0, 14186.66796875], [61461.336, 14186.66796875], [61290.67, 14229.3359375], [60778.67, 14229.3359375], [50581.336, 13290.66796875]];
                            // let point3 = [[67849.875, 17558.6309], [67810.1016, 17610.1816], [67764.4453, 17649.9512], [67737.9297, 17704.4492], [67718.7812, 17760.4199], [67711.4141, 17819.3359], [67708.4688, 17878.2539], [67707, 17937.1699], [67705.5234, 18006.3965], [67705.5234, 18066.7871], [67707, 18127.1758], [67734.9844, 18184.6191], [67771.8047, 18234.6992], [67814.5234, 18277.4141], [67846.9219, 18328.9648], [67873.4375, 18381.9902], [67917.625, 18421.7598], [67975.0703, 18440.9062], [68035.4609, 18440.9062], [68095.8516, 18440.9062], [68162.1328, 18440.9062], [68226.9375, 18440.9062], [68285.8516, 18439.4336], [68338.8828, 18408.5039], [68391.9062, 18381.9902], [68449.3516, 18368.7344], [68506.7891, 18351.0586], [68561.2891, 18315.709], [68605.4766, 18272.9941], [68640.8281, 18219.9707], [68671.7578, 18168.418], [68713, 18121.2852], [68760.1328, 18084.4609], [68804.3203, 18041.7461], [68849.9844, 18001.9785], [68897.1172, 17965.1562], [68936.8828, 17920.9688], [68966.3438, 17866.4707], [68973.7031, 17807.5527], [68973.7031, 17745.6914], [68944.25, 17691.1934], [68911.8438, 17636.6953], [68882.3828, 17585.1426], [68852.9297, 17532.1172], [68816.1016, 17480.5664], [68771.9141, 17440.7969], [68721.8359, 17408.3926], [68668.8125, 17377.4609], [68620.2031, 17343.584], [68562.7656, 17330.3281], [68500.8984, 17328.8555], [68440.5078, 17343.584], [68381.5938, 17353.8945], [68332.9844, 17389.2461], [68274.0703, 17392.1914], [68215.1562, 17384.8262], [68162.1328, 17412.8125], [68109.1016, 17445.2168], [68054.6094, 17468.7832], [68001.5781, 17496.7676], [67944.1406, 17512.9707], [67891.1094, 17539.4824]];
                            let data = [];
                            let path = [];
                            let segments = [];

                            // DB로드
                            // 필드 추가시 newRegion, getUndo, applyUndo 같이 추가 필요
                            for (var resultCnt = 0; resultCnt < result.length; resultCnt++) {
                                path = [];
                                segments = [];

                                crntInfo = JSON.parse(result[resultCnt].coordinate_info)
                                point = crntInfo.COORDINATE

                                if (result[resultCnt].coordinate_kind_cd == "BBOX") {
                                    // 2 3
                                    // 1 4 순서
                                    segments.push([crntInfo.X * projectPixel.x / imageSize.x, (crntInfo.Y + crntInfo.H) * projectPixel.y / imageSize.y]);
                                    segments.push([crntInfo.X * projectPixel.x / imageSize.x, crntInfo.Y * projectPixel.y / imageSize.y]);
                                    segments.push([(crntInfo.X + crntInfo.W) * projectPixel.x / imageSize.x, crntInfo.Y * projectPixel.y / imageSize.y]);
                                    segments.push([(crntInfo.X + crntInfo.W) * projectPixel.x / imageSize.x, (crntInfo.Y + crntInfo.H) * projectPixel.y / imageSize.y]);
                                }
                                else {
                                    for (let pointCnt = 0; pointCnt < point.length; pointCnt += 1) {
                                        segments.push([point[pointCnt][0] * projectPixel.x / imageSize.x, point[pointCnt][1] * projectPixel.y / imageSize.y]);
                                        // segments.push([point[pointCnt][0] * projectPixel.x / Microdraw.fileWidth, point[pointCnt][1] * projectPixel.y / Microdraw.fileHeight]);
                                    }
                                }

                                path.push('Path');
                                path.push({ segments: segments, closed: true, type: result[resultCnt].coordinate_kind_cd })

                                var reg = {};
                                var json = path;

                                reg.annoSeq = me.annoSeq;
                                reg.uid = result[resultCnt].annotation_id;
                                reg.labelNo = result[resultCnt].label_id ? result[resultCnt].label_id : result[resultCnt].coordinate_kind_cd;
                                reg.labelName = result[resultCnt].label_nm ? result[resultCnt].label_nm : result[resultCnt].coordinate_kind_cd;
                                reg.hex = result[resultCnt].rgb_hex;
                                reg.review_yn = result[resultCnt].review_yn;
                                reg.termination_yn = result[resultCnt].termination_yn;
                                reg.del_yn = 'N';
                                reg.path = new paper.Path();

                                if (result[resultCnt].coordinate_kind_cd == "POINT") {
                                    reg.segments = segments
                                }

                                var { insert } = reg.path;
                                reg.path.importJSON(json);
                                reg.path.insert = insert;

                                reg = me.newRegion({
                                    path: reg.path,
                                    annoSeq: me.annoSeq,
                                    uid: reg.uid,
                                    labelNo: reg.labelNo,
                                    labelName: reg.labelName,
                                    hex: reg.hex,
                                    review_yn: reg.review_yn,
                                    termination_yn: reg.termination_yn
                                });

                                if (Microdraw.dom.querySelector("#labelBar div input") !== null) {
                                    if (!Microdraw.dom.querySelector("#labelBar div[data-label-no='" + reg.labelNo + "'] input").checked) {
                                        reg.path.visible = false;
                                        reg.path.selected = false;
                                        reg.text.visible = false;
                                    }
                                }
                            }

                            paper.view.draw();

                            // on db load, do not select any region by default
                            me.selectRegion(null);

                            paper.view.draw();
                            Microdraw.currentRegions();

                            if (me.debug) { console.log("< MicrodrawDBLoad resolve success. Number of regions:", me.objInfo.regions.length); }
                            // })
                            // .catch(function(error) {
                            //     console.error('< MicrodrawDBLoad resolve error', error);
                            // });
                        });
                },

                dbCommentSave: function () {

                    if (!Microdraw.objComment) {
                        return;
                    }

                    let objComment = Microdraw.objComment;

                    let param = {
                        slideId: Microdraw.slide_id,
                        commentId: objComment.uid,
                        coordinateInfo: JSON.stringify({ "AREA": me.coordinateInfo(objComment.area), "BOX": me.coordinateInfo(objComment.box) }),
                        contents: Microdraw.dom.querySelector(`#div${Microdraw.objComment.name} div`).innerText.replace(/\n\n/g, '\n')
                    }

                    axios.post(web_url + `/api/annotation/comments`, param)
                        .then((result) => {
                            objComment.uid = result.data;
                        })
                },

                dbCommentLoad: function () {
                    Microdraw.dom.querySelectorAll(`.comment-wrapper`).remove()

                    me.commentSeq = 1;
                    axios.get(web_url + `/api/annotation/comments/${Microdraw.slide_id}`)
                        .then((result) => {
                            var result = result.data

                            let imageSize = me.imageSize;
                            let projectPixel = me.projectSize;

                            let crntInfo = [];
                            let point = [];
                            let data = [];
                            let path = [];
                            let segments = [];
                            let objArea = {};
                            let objLine = {};
                            let objBox = {};

                            let regArea = {};
                            let regLine = {};
                            let regBox = {};

                            let pointFrom;
                            let pointTo;

                            // DB로드
                            // 필드 추가시 newRegion, getUndo, applyUndo 같이 추가 필요
                            for (var resultCnt = 0; resultCnt < result.length; resultCnt++) {
                                path = [];
                                segments = [];

                                crntInfo = JSON.parse(result[resultCnt].coordinate_info)
                                point = crntInfo.COORDINATE

                                objArea = crntInfo['AREA'];
                                objBox = crntInfo['BOX']

                                pointFrom = new paper.Point(objArea.FROM[0] * projectPixel.x / imageSize.x, objArea.FROM[1] * projectPixel.y / imageSize.y);
                                pointTo = new paper.Point(objArea.TO[0] * projectPixel.x / imageSize.x, objArea.TO[1] * projectPixel.y / imageSize.y);


                                let x2 = pointTo.x;
                                let x1 = pointFrom.x;
                                let y2 = pointTo.y;
                                let y1 = pointFrom.y;

                                // 원 컨트롤
                                let px = (x1 + x2) * 0.5;
                                let py = (y1 + y2) * 0.5;

                                let rx = px - x1;
                                let ry = py - y1;

                                path = new paper.Path.Circle(new paper.Point(px, py), Math.sqrt(rx * rx + ry * ry));
                                path.type = 'COMMENTAREA';
                                path.fillColor = 'rgba(' + Microdraw.hexToRgb('0, 0, 80') + ',' + 0.1 + ')'
                                path = Microdraw.newCircle({ path: path }, 1, true).path;
                                regArea = Microdraw.newCommentArea({ path: path }, 1, true);
                                regArea.text.position = regArea.path.position;


                                pointFrom = new paper.Point(objBox.X * projectPixel.x / imageSize.x, objBox.Y * projectPixel.y / imageSize.y);
                                pointTo = new paper.Point((objBox.X + objBox.W) * projectPixel.x / imageSize.x, (objBox.Y + objBox.H) * projectPixel.y / imageSize.y);
                                path = new paper.Path.Rectangle(pointFrom, pointTo);

                                regBox = Microdraw.newCommentBox({ path: path }, 1, result[resultCnt].contents);

                                pointTo = new paper.Point(pointFrom.x, pointFrom.y + (pointTo.y - pointFrom.y) / 2);
                                pointFrom = new paper.Point(objArea.TO[0] * projectPixel.x / imageSize.x, objArea.TO[1] * projectPixel.y / imageSize.y);
                                path = new paper.Path.Line(pointFrom, pointTo);

                                regLine = Microdraw.newCommentLine(regArea, regBox, { path: path }, 1, '');

                                Microdraw.objInfo.comments.push({ uid: result[resultCnt].comment_id, name: `Comment${Microdraw.commentSeq}`, area: regArea, box: regBox, line: regLine });
                                Microdraw.commentSeq += 1;


                                // if (Microdraw.dom.querySelector("#labelBar div input") !== null) {
                                //     if (!Microdraw.dom.querySelector("#labelBar div[data-label-no='" + reg.labelNo + "'] input").checked) {
                                //         reg.path.visible = false;
                                //         reg.path.selected = false;
                                //         reg.text.visible = false;
                                //     }
                                // }
                            }

                            paper.view.draw();

                            // on db load, do not select any region by default
                            me.selectRegion(null);

                            paper.view.draw();
                            Microdraw.currentRegions();
                            Microdraw.resizeCommentBox();
                        }
                        )
                },

                dbStatusLoad: async function () {
                    let params = {
                        page: 1,
                        pageLength: 1000,
                        whereOptions: ([] = [{ where_key: 'ts.id', where_value: Microdraw.slide_id, where_type: 'AND' }]),
                        orderOptions: ([] = []),
                    };
                    me.initPopupFlag = true;

                    await axios.post(web_url + `/api/annotation/image-status-list`, params)
                        .then((result) => {
                            result = result.data.mainInfo[0];
                            me.statusInfo = result;

                            if (result.info_yn == "Y") {
                                document.querySelector('[work=Clinical-info]').children[0].className = 'complete'
                            }
                            else {
                                document.querySelector('[work=Clinical-info]').children[0].className = 'standby'
                            }

                            if (result.annotation_yn == "Y") {
                                document.querySelector('[work=Annotation]').children[0].className = 'complete'
                            }
                            else {
                                if (result.p_status == "N") {
                                    if (result.annotation_ssid == null) {
                                        document.querySelector('[work=Annotation]').children[0].className = 'start'
                                        me.isLocked = true;
                                    }
                                    else {
                                        document.querySelector('[work=Annotation]').children[0].className = 'progressing'
                                        if (_ssid == me.statusInfo.annotation_ssid) {
                                            me.isLocked = false;
                                        }
                                        else {
                                            me.isLocked = true;
                                        }
                                    }
                                }
                            }

                            if (result.review_yn == "Y") {
                                document.querySelector('[work=Review]').children[0].className = 'complete'
                            }
                            else {
                                if (result.p_status == "A") {
                                    if (result.review_ssid == null) {
                                        document.querySelector('[work=Review]').children[0].className = 'start'
                                        me.isLocked = true;
                                    }
                                    else {
                                        document.querySelector('[work=Review]').children[0].className = 'progressing'
                                        if (_ssid == me.statusInfo.review_ssid) {
                                            me.isLocked = false;
                                        }
                                        else {
                                            me.isLocked = true;
                                        }
                                    }
                                }
                                else {
                                    document.querySelector('[work=Review]').children[0].className = 'standby'
                                }
                            }

                            if (result.termination_yn == "Y") {
                                document.querySelector('[work=Termination]').children[0].className = 'complete'
                                me.isLocked = true;
                            }
                            else {
                                if (result.p_status == "R") {
                                    if (result.termination_ssid == null) {
                                        document.querySelector('[work=Termination]').children[0].className = 'start'
                                        me.isLocked = true;
                                    }
                                    else {
                                        document.querySelector('[work=Termination]').children[0].className = 'progressing'
                                        if (_ssid == me.statusInfo.termination_ssid) {
                                            me.isLocked = false;
                                        }
                                        else {
                                            me.isLocked = true;
                                        }
                                    }
                                }
                                else {
                                    document.querySelector('[work=Termination]').children[0].className = 'standby'
                                }
                            }

                            me.updateLatestStatus();

                            if (_auth_level == "UO") {
                                me.isLocked = true;
                            }

                            me.dom.querySelector("#fileName").innerText = result.filename;

                            if (me.isLocked) {
                                me.dom.querySelector("#buttonsBlock .btnArea2").classList.add('locked');
                                me.dom.querySelector("#buttonsBlock .btnArea3").classList.add('locked');
                            }
                            else {
                                me.dom.querySelector("#buttonsBlock .btnArea2").classList.remove('locked');
                                me.dom.querySelector("#buttonsBlock .btnArea3").classList.remove('locked');
                                me.isLocked = false;
                            }

                            me.dom.querySelector("#annotation-ssid").innerText = result.annotation_ssid ? result.annotation_ssid : '-';
                            me.dom.querySelector("#annotation-dtc-dtm").innerText = result.annotation_utc_dtm ? result.annotation_utc_dtm : '-';

                            me.dom.querySelector("#review-ssid").innerText = result.review_ssid ? result.review_ssid : '-';
                            me.dom.querySelector("#review-dtc-dtm").innerText = result.review_utc_dtm ? result.review_utc_dtm : '-';

                            me.dom.querySelector("#termination-ssid").innerText = result.termination_ssid ? result.termination_ssid : '-';
                            me.dom.querySelector("#termination-dtc-dtm").innerText = result.termination_utc_dtm ? result.termination_utc_dtm : '-';

                            if (me.dom.querySelector("#popup-object").style.visibility == 'visible') {
                                me.objectListPopup();
                            }

                            if (me.isLocked) {
                                $(Microdraw.dom.querySelector('#tools-side')).find('.selected').removeClass('selected')
                                $(Microdraw.dom.querySelector('#tools-side')).find('#select').addClass('selected')
                                me.selectedTool = 'select';
                                me.prevTool = 'select';
                                me.initCursor();
                            }
                        });
                },

                dbLabelLoad: function () {
                    let params = {
                        page: 1,
                        pageLength: 1000,
                        whereOptions: ([] = [{ where_key: 'tumor_cd', where_value: Microdraw.tumor_code, where_type: 'AND' }]),
                    };

                    axios.post(web_url + `/api/annotation/label-list`, params)
                        .then((result) => {
                            let labelList = result.data.baseInfo
                            me.labelInfo = {
                                point: [], line: [], bbox: [], seg: []
                            }
                            me.labelUnknown = result.data.unknown[0]

                            var element = document.createElement("ul");
                            var element2 = document.createElement("ul");
                            var elSpan;

                            me.dom.querySelectorAll("#labelDiv ul").forEach(
                                e => e.remove()
                            );

                            me.dom.querySelectorAll("#changeLabelDiv ul").forEach(
                                e => e.remove()
                            );

                            labelList.map(item => {
                                if (item.coordinate_kind_cd == 'POINT') {
                                    me.labelInfo.point.push(item)
                                }
                                else if (item.coordinate_kind_cd == 'LINE') {
                                    me.labelInfo.line.push(item)
                                }
                                else if (item.coordinate_kind_cd == 'BBOX') {
                                    me.labelInfo.bbox.push(item)
                                }
                                else if (item.coordinate_kind_cd == 'SEG') {
                                    me.labelInfo.seg.push(item)
                                }
                            })

                            var element_option;
                            me.dom.querySelector("#labelDiv").append(element);
                            me.dom.querySelector("#changeLabelDiv").append(element2);

                            for (var labelCnt = 0; labelCnt < me.labelInfo.length; labelCnt++) {
                                element = document.createElement("li");
                                element.setAttribute('data-label-no', me.labelInfo[labelCnt].label_id);
                                element.setAttribute('data-label-nm', me.labelInfo[labelCnt].label_nm);
                                element.setAttribute('data-hex', me.labelInfo[labelCnt].rgb_hex);
                                element.setAttribute('tabindex', labelCnt + 1);

                                elSpan = document.createElement("span");
                                elSpan.style.backgroundColor = 'rgb(' + me.hexToRgb(me.labelInfo[labelCnt].rgb_hex) + ')';
                                element.append(elSpan);

                                element.innerHTML = element.innerHTML + me.labelInfo[labelCnt].label_nm + ' (' + me.labelInfo[labelCnt].label_desc + ')';

                                element.addEventListener("keydown", function (e) {
                                    if (e.keyCode == 13) {
                                        me.dom.querySelectorAll("#labelDiv li").forEach(
                                            e => e.classList.remove('selected')
                                        );

                                        me.labelSelected = { labelNo: this.getAttribute('data-label-no'), labelName: this.getAttribute('data-label-nm'), hex: this.getAttribute('data-hex') }
                                        $(this).addClass('selected')
                                        me.dom.querySelector("#labelDiv").style.visibility = 'hidden';
                                    }
                                });

                                element.addEventListener("click", function () {
                                    me.dom.querySelectorAll("#labelDiv li").forEach(
                                        e => e.classList.remove('selected')
                                    );

                                    me.labelSelected = { labelNo: this.getAttribute('data-label-no'), labelName: this.getAttribute('data-label-nm'), hex: this.getAttribute('data-hex') }
                                    $(this).addClass('selected')
                                    me.dom.querySelector("#labelDiv").style.visibility = 'hidden';
                                });

                                me.dom.querySelector("#labelDiv ul").append(element);


                                element2 = document.createElement("li");
                                element2.setAttribute('data-label-no', me.labelInfo[labelCnt].label_id);
                                element2.setAttribute('data-label-nm', me.labelInfo[labelCnt].label_nm);
                                element2.setAttribute('data-hex', me.labelInfo[labelCnt].rgb_hex);
                                element2.setAttribute('tabindex', labelCnt + 1);

                                elSpan = document.createElement("span");
                                elSpan.style.backgroundColor = 'rgb(' + me.hexToRgb(me.labelInfo[labelCnt].rgb_hex) + ')';
                                element2.append(elSpan);

                                element2.innerHTML = element2.innerHTML + me.labelInfo[labelCnt].label_nm + ' (' + me.labelInfo[labelCnt].label_desc + ')';

                                // element2.addEventListener("keydown", function(e) {
                                //     if (e.keyCode == 13) {
                                //         me.region.hex = this.getAttribute('data-hex');
                                //         me.region.labelNo = Number(this.getAttribute('data-label-no'));
                                //         me.region.labelName = this.getAttribute('data-label-nm');

                                //         me.region.path.strokeColor = 'rgba(' + me.hexToRgb(this.getAttribute('data-hex')? this.getAttribute('data-hex') : 50, 94, 228) + ',' + 1 + ')'
                                //         me.region.path.fillColor = 'rgba(' + me.hexToRgb(this.getAttribute('data-hex')? this.getAttribute('data-hex') : 50, 94, 228) + ',' + 0.1+ ')';


                                //         reg.path = arg.path;
                                //         reg.path.strokeWidth = $($('#content')[0].shadowRoot.querySelector('#strokeDiv .slider')).slider('value');
                                //         reg.path.strokeColor = 'rgba(' + (arg.hex? me.hexToRgb( arg.hex) : '0, 0, 80') + ',' + 1 + ')';
                                //         reg.path.strokeScaling = false;
                                //         reg.path.selected = false;

                                //         me.dom.querySelector("#popup-object").style.overflow = 'hidden';
                                //         me.dom.querySelector("#changeLabelDiv").style.visibility = 'hidden';

                                //         me.updateUndoStack();
                                //         me.currentRegions(true);
                                //         paper.view.draw();
                                //     }
                                // });

                                // element2.addEventListener("click", function() {
                                //     me.region.hex = this.getAttribute('data-hex');
                                //     me.region.labelNo = Number(this.getAttribute('data-label-no'));
                                //     me.region.labelName = this.getAttribute('data-label-nm');

                                //     me.region.path.strokeColor = 'rgba(' + me.hexToRgb(this.getAttribute('data-hex')? this.getAttribute('data-hex') : 50, 94, 228) + ',' + 1 + ')'
                                //     me.region.path.fillColor = 'rgba(' + me.hexToRgb(this.getAttribute('data-hex')? this.getAttribute('data-hex') : 50, 94, 228) + ',' + 0.1+ ')';

                                //     me.dom.querySelector("#popup-object").style.overflow = 'hidden';
                                //     me.dom.querySelector("#changeLabelDiv").style.visibility = 'hidden';

                                //     me.updateUndoStack();
                                //     me.currentRegions(true);
                                //     paper.view.draw();
                                // });



                                me.dom.querySelector("#changeLabelDiv ul").append(element2);
                            }

                            // $($('#content')[0].shadowRoot.querySelectorAll(`#changeLabelDiv`)).attr('origin-height', $($('#content')[0].shadowRoot.querySelectorAll(`#changeLabelDiv`))[0].offsetHeight)                    
                        });
                },

                dbDeepzoomInformationLoad: async function () {

                    await axios.get(deepcis_url + '/info/' + Microdraw.statusInfo.pre_path + `/` + Microdraw.statusInfo.filename)
                        .then((result) => {
                            if (result.data.Code == 'fail') {
                                me.dom.querySelector("#openseadragon1").innerText = 'Load image failed.';
                                me.dom.querySelector("#openseadragon1").classList.add('flex');
                                me.dom.querySelector("#openseadragon1").classList.add('ai-center');
                                me.dom.querySelector("#openseadragon1").classList.add('jc-center');
                            }
                            else {
                                let data = result.data;

                                for (let key in data) {
                                    switch (key) {
                                        case "Micrometres Per Pixel X": {
                                            me.dom.querySelector(".infor.Txt2.pixelX").innerText = Number(data[key]).toFixed(4);
                                            me.umPerImagePixelX = Number(data[key]);
                                            break;
                                        }
                                        case "Micrometres Per Pixel Y": {
                                            me.dom.querySelector(".infor.Txt2.pixelY").innerText = Number(data[key]).toFixed(4);
                                            break;
                                        }
                                        case "Width(pixels)": {
                                            me.dom.querySelector(".infor.Txt2.width").innerText = data[key];
                                            break;
                                        }
                                        case "Height(pixels)": {
                                            me.dom.querySelector(".infor.Txt2.height").innerText = data[key];
                                            break;
                                        }
                                        case "Vendor": {
                                            me.dom.querySelector(".infor.Txt2.vendor").innerText = data[key];
                                            break;
                                        }
                                        case "property": {
                                            let content = "";
                                            for (let property in data[key]) {
                                                content += property + " : " + data[key][property] + "<br>";
                                            }
                                            me.dom.querySelector(".infor.textarea.property").innerHTML = content;
                                            break;
                                        }
                                    }
                                }

                                me.umPerProjectPixelX = me.imageSize.x * me.umPerImagePixelX / me.projectSize.x;
                            }
                        })
                        .catch(err => { console.log(err) })
                },

                dbSlideInfoLoad: async function () {
                    let deepzoomCode;
                    // await axios.get(web_url + `/api/tumor/detail-slide/` + Microdraw.slide_id)
                    await axios.get(web_url + `/api/tumor/slide-info/` + Microdraw.slide_id)
                        .then((result) => {
                            let deepzoomInfo = result.data.deepzoomInfo;
                            deepzoomCode = deepzoomInfo?.statusCode;

                            Microdraw.tumor_code = result.data.baseInfo.tumorCode;
                            Microdraw.slide_url = deepzoomInfo.slide_url;
                            Microdraw.jpegFilePath = result.data.jpegFilePath;

                            Microdraw.fileWidth = result.data.slideInfo.file_width;
                            Microdraw.fileHeight = result.data.slideInfo.file_height;
                            Microdraw.dom.querySelector(".infor.Txt2.width").innerText = result.data.slideInfo.file_width;
                            Microdraw.dom.querySelector(".infor.Txt2.height").innerText = result.data.slideInfo.file_height;

                            let data = result.data.columnInfos;

                            let element_li;
                            let element_div_txt1;
                            let element_div_txt2;
                            let optionArrays;

                            me.dom.querySelectorAll("#clinical-info li").forEach((el) => {
                                el.remove();
                            });



                            for (let arr of data) {
                                element_li = document.createElement('li');
                                element_li.className = 'listWrap';

                                element_div_txt1 = document.createElement('div');
                                element_div_txt1.className = 'infor ci-txt1';
                                element_div_txt1.innerText = arr.column_name;
                                element_li.append(element_div_txt1);

                                element_div_txt2 = document.createElement('div');
                                element_div_txt2.className = 'infor ci-txt2';
                                element_div_txt2.innerText = arr.column_value == "unSelected" ? '' : arr.column_value;

                                element_li.append(element_div_txt2);
                                me.dom.querySelector("#clinical-info").append(element_li)

                                if (arr.value_type == "S") {
                                    optionArrays = JSON.parse(arr.selectOptions)
                                    for (let optionArr of optionArrays) {
                                        if (optionArr.code_value == arr.column_value) {
                                            if (optionArr.option_exist == 'Y') {
                                                element_li = document.createElement('li');
                                                element_li.className = 'listWrap';

                                                element_div_txt1 = document.createElement('div');
                                                element_div_txt1.className = 'infor ci-txt1';
                                                element_div_txt1.innerText = arr.column_name + " Option";
                                                // element_div_txt1.style.color = 'blue';
                                                element_li.append(element_div_txt1);

                                                element_div_txt2 = document.createElement('div');
                                                element_div_txt2.className = 'infor ci-txt2';

                                                element_div_txt2.innerText = optionArr.option_value;

                                                element_li.append(element_div_txt2);
                                                me.dom.querySelector("#clinical-info").append(element_li)
                                            }
                                        }
                                    }
                                }
                            }

                            element_li = document.createElement('li');
                            element_li.className = 'listWrap';

                            element_div_txt1 = document.createElement('div');
                            element_div_txt1.className = 'infor Txt1';
                            element_div_txt1.innerText = 'Memo';
                            element_li.append(element_div_txt1);

                            element_div_txt2 = document.createElement('div');
                            element_div_txt2.className = 'infor textarea memo';
                            element_div_txt2.innerHTML = result.data.baseInfo.memo;

                            element_li.append(element_div_txt2);
                            me.dom.querySelector("#clinical-info").append(element_li)
                        });

                    return deepzoomCode;
                },

                dbMemoLoad: async function () {
                    me.dom.querySelectorAll("#popup-memo li").forEach((el) => {
                        el.remove();
                    });

                    await axios.get(web_url + `/api/annotation/memos/${Microdraw.slide_id}`)
                        .then((result) => {
                            if (result.data.length) {
                                for (let item of result.data) {
                                    me.createMemoElement(false, item)
                                }

                                Microdraw.dom.querySelector('#popup-memo').style.visibility = 'visible';

                                let memoList = Microdraw.dom.querySelector('#popup-memo .list');
                                $(memoList).scrollTop(result.data.length * 144)
                            }
                        });



                    // return deepzoomCode;
                },

                createMemoElement: function (isNew, item) {
                    let memoId = item.memoId ? item.memoId : 'new-memo';
                    let title = item.title ? item.title : '';
                    let contents = item.contents ? item.contents : '';
                    let create_ssid = item.create_ssid ? item.create_ssid : '';
                    let html =
                        `
                      <li class="memo-wrapper" data-memo-id="${memoId}">
                          <div class="memo-header">
                              <div class="memo-title">${title}</div>
                              <div class="btn-wrapper">
                  `
                    if (_auth_level != "UO") {
                        if (isNew) {
                            html += `<div class="ico save" data-memo-id="new-memo"}></div>`
                            html += `<div class="ico delete" data-memo-id="${memoId}"></div>`
                        }

                        else if (_auth_level == "SM" || _auth_level == "GM" || _auth_level == "OM" || _ssid === create_ssid) {
                            html += `<div class="ico delete" data-memo-id="${memoId}"></div>`
                        }
                        // html += `<div class="ico glyphicon glyphicon-trash" data-memo-id="${memoId}"></div>`
                    }

                    html += `
                              </div>
                          </div>
                          <textarea ${isNew ? '' : 'disabled'} class="diagnosis-textarea ${isNew ? 'new-memo' : ''}">${contents}</textarea>
                      </li>
                  `;

                    $(me.dom.querySelector("#popup-memo .list")).append(html)

                    let divWrapper = Microdraw.dom.querySelector(`.memo-wrapper[data-memo-id="${memoId}"]`)
                    if (isNew) {
                        let divSave = divWrapper?.find('.save')[0];

                        divSave.addEventListener('click', function (event) {
                            me.dbMemoSave(divWrapper.find('.diagnosis-textarea').val());
                        })
                    }

                    if (_auth_level == "SM" || _auth_level == "GM" || _auth_level == "OM" || _ssid === create_ssid) {
                        let divDelete = divWrapper?.find('.delete')[0];
                        divDelete?.addEventListener('click', function (event) {
                            me.dbMemoDelete(this, this.getAttribute('data-memo-id'))
                        })
                    }
                },

                dbMemoSave: async function (contents) {
                    let params = {
                        slideId: Microdraw.slide_id,
                        stickerMemo: contents
                    }
                    await axios.post(web_url + `/api/annotation/memos`, params)
                        .then((result) => {
                            toast.success("Memo save success!");
                        })
                        .catch(error => {
                            toast.error("Memo save failed!");
                        });

                    await me.dbMemoLoad();
                },

                dbMemoDelete: async function (el, memoId) {
                    let parentElement = $(el).parents('.memo-wrapper');

                    parentElement.remove();

                    if (memoId == 'new-memo') {
                        return false;
                    }

                    await axios.delete(web_url + `/api/annotation/memos/${memoId}`)
                        .then((result) => {
                            toast.success("Memo delete success!");
                        })
                        .catch(error => {
                            toast.error("Memo delete failed!");
                        });
                },

                /**
                 * @function save
                 * @returns {void}
                 */
                save: async function () {
                    if (me.debug) { console.log("> save"); }

                    if (me.tools[Microdraw.selectedTool] && me.tools[Microdraw.selectedTool].onDeselect) {
                        me.tools[Microdraw.selectedTool].onDeselect();
                    }

                    let reg;
                    for (var regCnt = 0; regCnt < me.objInfo.regions.length; regCnt++) {
                        reg = me.objInfo.regions[regCnt];
                        if (reg.labelName?.toUpperCase() == "UNKNOWN" && reg.del_yn == "N") {
                            customAlert('Change UNKNOWN label name before save.')
                            return Boolean(false);
                        }
                    }

                    if (!me.validateIntersect()) {
                        return false;
                    }

                    me.updateDelBeforeSave();

                    var param = {};
                    var values = [];
                    var coordinate_info;
                    var label_id;
                    for (var regCnt = 0; regCnt < me.objInfo.regions.length; regCnt++) {
                        reg = me.objInfo.regions[regCnt];

                        if (reg.uid == 'regionTemp') {
                            continue;
                        }

                        if (Microdraw.latestWork == "Review" && reg.review_yn == "Y") {
                            continue;
                        }

                        if (Microdraw.latestWork == "Termination" && reg.termination_yn == "Y") {
                            continue;
                        }

                        coordinate_info = me.coordinateInfo(reg);

                        label_id = reg.labelNo;
                        if (label_id == "") {
                            label_id = null;
                        }

                        values = [];
                        values.push({
                            annotation_id: reg.uid,
                            label_id: label_id,
                            coordinate_kind_cd: reg.path.type,
                            coordinate_info: coordinate_info,
                            review_yn: 'N',
                            termination_yn: 'N',
                            del_yn: reg.del_yn,
                        })

                        param = {
                            slide_id: Microdraw.slide_id,
                            annotation_list: values,
                        }

                        if (param.annotation_list.length > 0 && _auth_level != "UO") {
                            await axios.post(web_url + `/api/annotation/input`, param)
                                .then((result) => {
                                    if (reg.uid.toString().includes('temp')) {
                                        if (me.UndoStack.length > 0) {
                                            let undoArrs = me.UndoStack;
                                            let undoRegArrs;
                                            let undoReg;
                                            for (var undoCnt = 0; undoCnt < undoArrs.length; undoCnt++) {
                                                undoRegArrs = undoArrs[undoCnt].regions;
                                                for (var undoRegCnt = 0; undoRegCnt < undoRegArrs.length; undoRegCnt++) {
                                                    undoReg = undoRegArrs[undoRegCnt];
                                                    if (reg.uid == undoReg.uid) {
                                                        undoReg.uid = result.data[0];
                                                        continue;
                                                    }
                                                }
                                            }
                                        }

                                        if (me.RedoStack.length > 0) {
                                            let redoArrs = me.RedoStack;
                                            let redoRegArrs;
                                            let redoReg;
                                            for (var redoCnt = 0; redoCnt < redoArrs.length; redoCnt++) {
                                                redoRegArrs = redoArrs[redoCnt].regions;
                                                for (var redoRegCnt = 0; redoRegCnt < redoRegArrs.length; redoRegCnt++) {
                                                    redoReg = redoRegArrs[redoRegCnt];
                                                    if (reg.uid == redoReg.uid) {
                                                        redoReg.uid = result.data[0];
                                                        continue;
                                                    }
                                                }
                                            }
                                        }
                                    }

                                })
                                .catch(error => {
                                    toast.error("Save failed!");
                                });
                        }
                    }

                    if (param.annotation_list === undefined) {
                        toast.success("Save success!");
                    }
                    else if (param.annotation_list.length > 0 && _auth_level != "UO") {
                        toast.success("Save success!");
                        me.chkSaved(true);
                        me.loadDBData();
                    }

                    return Boolean(true);
                },

                //undo, redo 스택의 모든 uid 중 현재 도형리스트에 없는 값을 del_yn = 'Y'로 업데이트
                updateDelBeforeSave: function () {
                    // undo, redo 스택의 모든 도형리스트의 uid 값을 stackUidArrs 배열에 넣고
                    // 현재 도형리스트의 uid 값을 currUidArrs 배열에 넣고
                    // stackUidArrs중 currUidArrs 에 없는 uid 값은 del_yn = 'Y'로 업데이트
                    let undoArrs = me.UndoStack;
                    let redoArrs = me.RedoStack;
                    let regArrs;
                    let stackUidArrs = [];
                    let currUidArrs = [];

                    for (var undoCnt = 0; undoCnt < undoArrs.length; undoCnt++) {
                        regArrs = undoArrs[undoCnt].regions;
                        for (var regCnt = 0; regCnt < regArrs.length; regCnt++) {
                            stackUidArrs.push(regArrs[regCnt].uid);
                        }
                    }

                    for (var redoCnt = 0; redoCnt < redoArrs.length; redoCnt++) {
                        regArrs = redoArrs[redoCnt].regions;
                        for (var regCnt = 0; regCnt < regArrs.length; regCnt++) {
                            stackUidArrs.push(regArrs[regCnt].uid);
                        }
                    }

                    regArrs = me.objInfo.regions;
                    for (var regCnt = 0; regCnt < regArrs.length; regCnt++) {
                        currUidArrs.push(regArrs[regCnt].uid);
                    }

                    // 배열중복 제거
                    stackUidArrs = [...new Set(stackUidArrs)];
                    currUidArrs = [...new Set(currUidArrs)];

                    stackUidArrs = stackUidArrs.filter(val => !currUidArrs.includes(val));

                    let reg;
                    var param = {};
                    var values = [];

                    for (var regCnt = 0; regCnt < stackUidArrs.length; regCnt++) {
                        if (!stackUidArrs[regCnt].toString().toLowerCase().includes('temp')) {
                            values = [];
                            values.push({
                                annotation_id: stackUidArrs[regCnt],
                                del_yn: 'Y',
                            })

                            param = {
                                slide_id: Microdraw.slide_id,
                                annotation_list: values,
                            }

                            if (param.annotation_list.length > 0) {
                                axios.post(web_url + `/api/annotation/delete`, param)
                                    .then((data) => {

                                    });
                            }
                        }
                    }
                },

                coordinateInfo: function (reg) {
                    // reg.path.selected = false;
                    var path = JSON.parse(reg.path.exportJSON())
                    var coordinate_info = '';

                    let imagePoint;
                    let imageSize = me.imageSize;
                    let projectPixel = me.projectSize;

                    var segments = path[1].segments;
                    var result = [];
                    for (var segCnt = 0; segCnt < segments.length; segCnt++) {

                        // 도형이 selected 상태일때 segments 값이 달라져 다르게 계산
                        if (reg.path.type === 'COMMENTAREA') {
                            if (segCnt != 0 && segCnt != 2) {
                                continue;
                            }
                            if (reg.path.selected) {
                                // imagePoint = {x: segments[segCnt][0].x * imageSize.x / projectPixel.x, y: segments[segCnt][0].y * imageSize.y / projectPixel.y};
                                imagePoint = { x: segments[segCnt][0].x * imageSize.x / projectPixel.x, y: segments[segCnt][0].y * imageSize.y / projectPixel.y };
                            }
                            else {
                                imagePoint = { x: segments[segCnt][0][0] * imageSize.x / projectPixel.x, y: segments[segCnt][0][1] * imageSize.y / projectPixel.y };
                            }

                        }
                        else {
                            if (reg.path.selected) {
                                imagePoint = { x: segments[segCnt].x * imageSize.x / projectPixel.x, y: segments[segCnt].y * imageSize.y / projectPixel.y };
                            }
                            else {
                                imagePoint = { x: segments[segCnt][0] * imageSize.x / projectPixel.x, y: segments[segCnt][1] * imageSize.y / projectPixel.y };
                            }
                        }

                        if (!reg.path.type.includes('COMMENT')) {
                            if (imagePoint.x > Microdraw.imageSize.x) {
                                imagePoint.x = Microdraw.imageSize.x
                            }

                            if (imagePoint.y > Microdraw.imageSize.y) {
                                imagePoint.y = Microdraw.imageSize.y
                            }

                            if (imagePoint.x < 0) {
                                imagePoint.x = 0
                            }

                            if (imagePoint.y < 0) {
                                imagePoint.y = 0
                            }
                        }


                        result.push([Number(imagePoint.x.toFixed(4)), Number(imagePoint.y.toFixed(4))])
                        // path[1].segments[segCnt][0] = Number(imagePoint.x.toFixed(4));
                        // path[1].segments[segCnt][1] = Number(imagePoint.y.toFixed(4));
                    }

                    if (reg.path.type == "BBOX" || reg.path.type == "COMMENTBOX") {
                        var minX;
                        var minY;
                        var maxX;
                        var maxY;

                        minX = result[0][0];
                        minY = result[0][1];
                        maxX = result[0][0];
                        maxY = result[0][1];


                        for (var segCnt = 0; segCnt < segments.length; segCnt++) {
                            if (minX > result[segCnt][0]) {
                                minX = result[segCnt][0];
                            }

                            if (minY > result[segCnt][1]) {
                                minY = result[segCnt][1];
                            }

                            if (maxX < result[segCnt][0]) {
                                maxX = result[segCnt][0];
                            }

                            if (maxY < result[segCnt][1]) {
                                maxY = result[segCnt][1];
                            }
                        }

                        if (reg.path.type == "COMMENTBOX") {
                            coordinate_info = { "X": minX, "Y": minY, "W": Number((maxX - minX).toFixed(4)), "H": Number((maxY - minY).toFixed(4)) };
                        }
                        else {
                            coordinate_info = JSON.stringify({ "X": minX, "Y": minY, "W": Number((maxX - minX).toFixed(4)), "H": Number((maxY - minY).toFixed(4)) });
                        }

                        // coordinate_info = JSON.stringify({"X":minX,"Y":minY,"W":(maxX-minX),"H":(maxY-minY)});
                    }
                    else if (reg.path.type == "COMMENTAREA") {
                        coordinate_info = { "FROM": result[0], "TO": result[1] };
                    }
                    else {
                        // coordinate_info = JSON.stringify({"COORDINATE" : path[1].segments});
                        coordinate_info = JSON.stringify({ "COORDINATE": result });
                    }
                    return coordinate_info;
                },

                /**
                 * @function load
                 * @returns {void}
                 */
                load: function () {
                    if (me.debug) { console.log("> load"); }

                    var i, obj, reg;
                    if (localStorage.Microdraw) {
                        console.log("Loading data from localStorage");
                        obj = JSON.parse(localStorage.Microdraw);
                        for (i = 0; i < obj.Regions.length; i += 1) {
                            reg = {};
                            var json;
                            reg.name = obj.Regions[i].name;
                            reg.uid = obj.Regions[i].uid;
                            json = obj.Regions[i].path;
                            reg.path = new paper.Path();
                            reg.path.importJSON(json);
                            me.newRegion({
                                name: reg.name,
                                uid: reg.uid,
                                path: reg.path
                            });
                        }
                        paper.view.draw();
                    }
                },

                /**
                 * @function resizeAnnotationOverlay
                 * @returns {void}
                 */
                resizeAnnotationOverlay: function () {
                    if (me.debug > 1) { console.log("> resizeAnnotationOverlay"); }

                    var width = me.dom.querySelector("#paperjs-container").offsetWidth;
                    var height = me.dom.querySelector("#paperjs-container").offsetHeight;
                    me.dom.querySelector("canvas.overlay").offsetWidth = width;
                    me.dom.querySelector("canvas.overlay").offsetHeight = height;
                    paper.view.viewSize = [
                        width,
                        height
                    ];
                    me.transform();
                },

                /**
                 * @function initAnnotationOverlay
                 * @returns {void}
                 */
                initAnnotationOverlay: function () {
                    if (me.debug) { console.log("> initAnnotationOverlay"); }

                    // do not start loading a new annotation if a previous one is still being loaded
                    if (me.annotationLoadingFlag === true) {
                        return;
                    }

                    //console.log("new overlay size" + me.viewer.world.getItemAt(0).getContentSize());

                    /*
                       Activate the paper.js project corresponding to this section. If it does not yet
                       exist, create a new canvas and associate it to the new project. Hide the previous
                       section if it exists.
                   */


                    // change current section index (for loading and saving)
                    me.section = me.currentImage;
                    me.fileID = `${me.source}`;

                    // hide previous section
                    if (me.prevImage && paper.projects[0]) {
                        paper.projects[0].activeLayer.visible = false;
                        paper.projects[0].view.element.style.display = "none";
                    }

                    // if this is the first time a section is accessed, create its canvas, its project,
                    // and load its regions from the database

                    // create canvas
                    var canvas = document.createElement("canvas");
                    canvas.classList.add("overlay");
                    canvas.id = me.currentImage;
                    me.dom.querySelector("#paperjs-container").appendChild(canvas);

                    // create project
                    paper.setup(canvas);
                    paper.install(window);

                    // resize the view to the correct size
                    var width = me.dom.querySelector("#paperjs-container").offsetWidth;
                    var height = me.dom.querySelector("#paperjs-container").offsetHeight;
                    paper.view.viewSize = [
                        width,
                        height
                    ];

                    me.transform();

                    let imageSize = me.viewer.viewport._contentSize;
                    // let imageSize = new OpenSeadragon.Point(Microdraw.fileWidth, Microdraw.fileHeight);
                    let viewportPoint = me.viewer.viewport.imageToViewportCoordinates(imageSize.x, imageSize.y);
                    // let viewportPoint = me.viewer.viewport.imageToViewportCoordinates(imageSize.x * imageSize.x / me.fileWidth, imageSize.y * imageSize.y / me.fileHeight);
                    let webPixel = me.viewer.viewport.pixelFromPoint(viewportPoint);
                    // let webPixel = Microdraw.viewer.viewport.getContainerSize()
                    let projectPixel = paper.view.viewToProject(webPixel)

                    // me.imageSize = imageSize;
                    me.imageSize = new OpenSeadragon.Point(Microdraw.fileWidth, Microdraw.fileHeight);
                    me.projectSize = projectPixel;

                    let viewportWebPixelMin = me.viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(0, 0))
                    me.viewportWebPixel = {
                        xMin: viewportWebPixelMin.x, yMin: viewportWebPixelMin.y,
                        xMax: webPixel.x, yMax: webPixel.y,
                        width: webPixel.x - viewportWebPixelMin.x, height: webPixel.y - viewportWebPixelMin.y
                    }


                    me.umPerProjectPixelX = imageSize.x * me.umPerImagePixelX / projectPixel.x;


                    //메뉴바 resize 감지
                    new ResizeObserver(resizeAnnotationOverlay).observe(me.dom.querySelector('#paperjs-container'))
                    new ResizeObserver(setPopupHeight).observe(me.dom.querySelector('#popup-object'))

                    // load regions from database
                    // me.loadDBData();
                    me.objInfo.regions = []
                    paper.projects[0].clear();
                    me.annoSeq = 1;
                    // me.chkSaved(true);

                    // me.dbLabelLoad();
                    // me.dbAnnotationLoad();
                    // me.dbCommentLoad();

                    if (me.debug) { console.log('Set up new project, currentImage: ' + me.currentImage + ', ID: ' + 0); }


                    // activate the current section and make it visible
                    paper.projects[0].activate();
                    paper.project.activeLayer.visible = true;
                    paper.project.view.element.style.display = "block";

                    // resize the view to the correct size
                    // var width = me.dom.querySelector("#paperjs-container").offsetWidth;
                    // var height = me.dom.querySelector("#paperjs-container").offsetHeight;
                    // paper.view.viewSize = [
                    //     width,
                    //     height
                    // ];
                    //점 크기 조절
                    paper.settings.handleSize = Microdraw.handleSize;
                    // me.updateRegionList();
                    paper.view.draw();

                    /**
                     * @todo Commenting this line out solves the image size issues set size of the current overlay to match the size of the current image
                     */

                    //me.magicV = me.viewer.world.getItemAt(0).getContentSize().x / 100;

                    // me.transform();
                },

                /**
                 * @function transform
                 * @returns {void}
                 */
                transform: function () {
                    //if( me.debug ) console.log("> transform");

                    var z = me.viewer.viewport.viewportToImageZoom(me.viewer.viewport.getZoom(true));
                    var sw = me.viewer.source.width;
                    var bounds = me.viewer.viewport.getBounds(true);
                    //    var bounds = {
                    //       "x": -0.3500388048117966,
                    //       "y": 0,
                    //       "width": 1.7000776096235932,
                    //       "height": 0.8041666666666667,
                    //       "degrees": 0
                    //   }
                    const [x, y, w, h] = [
                        me.magicV * bounds.x,
                        me.magicV * bounds.y,
                        me.magicV * bounds.width,
                        me.magicV * bounds.height
                    ];
                    paper.view.setCenter(x + (w / 2), y + (h / 2));
                    const temp = (sw * z) / me.magicV;
                    if (temp !== NaN)
                        paper.view.zoom = temp
                },

                /**
                 * @function deparam
                 * @returns {Object} Returns an object containing URL parametres
                 */
                deparam: function () {
                    if (me.debug) { console.log("> deparam"); }

                    /** @todo Use URLSearchParams instead */
                    var search = location.search.substring(1);
                    var result = search ?
                        JSON.parse('{"' + search.replace(/[&]/g, '","').replace(/[=]/g, '":"') + '"}',
                            function (key, value) { return key === "" ? value : decodeURIComponent(value); }) :
                        {};
                    if (me.debug) {
                        console.log("url parametres:", result);
                    }

                    return result;
                },

                /**
                 * @function initShortCutHandler
                 * @returns {void}
                 */
                initShortCutHandler: function () {
                    window.addEventListener("keydown", e => {
                        if (e.keyCode !== 32 && (me.selectedTool == 'regionAdd' || me.selectedTool == 'regionSub')) {
                            me.tools[me.selectedTool].finishDrawingRegion(false);
                            me.selectedTool = me.prevTool;
                            me.updateCursor();
                        }

                        if (e.isComposing || e.keyCode === 229) {
                            return;
                        }

                        const key = [];
                        me.initCursor();
                        if (e.ctrlKey) { key.push("^"); }
                        if (e.altKey) { key.push("alt"); }
                        if (e.shiftKey) { key.push("shift"); }
                        if (e.metaKey) { key.push("cmd"); }
                        key.push(String.fromCharCode(e.keyCode));
                        const code = key.join(" ");
                        if (me.shortCuts[code]) {
                            const shortcut = me.shortCuts[code];
                            shortcut();
                            e.stopPropagation();
                        }

                        switch (e.keyCode) {
                            // ctrl
                            case 17: { key.push("^"); me.key = 'ctrl'; me.addCursor("move"); break; }
                            // r
                            case 82: {
                                if (me.isLocked) {
                                    return false;
                                }

                                key.push("r");
                                me.key = 'r';
                                me.addCursor("grab");

                                break;
                            }
                            // shift
                            case 16: { break; }
                            // meta
                            case 91: { key.push("cmd"); break; }
                            // space
                            case 32: {
                                if (me.isLocked) {
                                    return false;
                                }

                                key.push("space");
                                me.key = 'space';
                                me.addCursor("knife");

                                break;
                            }
                            // s
                            case 83: { key.push("s"); me.key = 's'; me.addCursor("default"); break; }
                            // arrow up
                            case 38: { me.labelSelector(true); break; }
                            // arrow down
                            case 40: { me.labelSelector(false); break; }
                            // esc
                            case 27: { me.closePopupAll(); break; }
                            case 187:
                            case 107://=|+
                                me.viewer.viewport.zoomBy(1.5);
                                me.viewer.viewport.applyConstraints();
                                return false;
                            case 189://-|_
                            case 109://-|_
                                me.viewer.viewport.zoomBy(0.5);
                                me.viewer.viewport.applyConstraints();
                                return false;
                            case 48://0|)
                            case 96://0|)
                                me.viewer.viewport.goHome();
                                me.viewer.viewport.applyConstraints();
                                return false;
                        }
                    });

                    window.addEventListener("keyup", e => {
                        me.key = '';
                        me.initCursor();

                        if (e.keyCode === 32 && me.selectedTool.includes('region') && me.region) {
                            if (me.selectedTool == 'regionAdd' || me.selectedTool == 'regionSub') {
                                me.tools[me.selectedTool].finishDrawingRegion(false);
                            }
                        }

                        me.selectedTool = me.prevTool;
                        // me.initCursor();
                        me.updateCursor();
                    });
                },

                labelSelector: function (isUp) {
                    let currFocus;
                    let tabIndex;
                    let targetDiv;

                    if (Microdraw.dom.querySelector(`#labelDiv`).style.visibility == 'visible') {
                        targetDiv = 'labelDiv';
                    }
                    else if (Microdraw.dom.querySelector(`#labelDiv`).style.visibility == 'visible') {
                        targetDiv = 'changeLabelDiv';
                    }

                    currFocus = Microdraw.dom.querySelector(`#${targetDiv} :focus`).length ? Microdraw.dom.querySelector(`#${targetDiv} :focus`) : Microdraw.dom.querySelector(`#${targetDiv} .selected`)
                    tabIndex = currFocus.prop('tabindex') ? currFocus.prop('tabindex') : 0;

                    if (isUp) {
                        if (tabIndex == 0 || tabIndex == 1) {
                            tabIndex = Microdraw.dom.querySelector(`#${targetDiv} li`).length;
                        }
                        else {
                            tabIndex = tabIndex - 1;
                        }
                    }
                    else {
                        if (tabIndex == Microdraw.dom.querySelector(`#${targetDiv} li`).length) {
                            tabIndex = 1;
                        }
                        else {
                            tabIndex = tabIndex + 1;
                        }
                    }
                    Microdraw.dom.querySelector(`#${targetDiv} li[tabindex=${tabIndex}]`).focus();

                },

                chkSaved: function (boolSaved) {
                    //새로고침, 뒤로가기 이벤트
                    // window.history.pushState(null, '', location.href); 

                    if (Microdraw.region?.path.type.includes('COMMENT')) {
                        return;
                    }

                    me.isSaved = boolSaved;

                    if (me.isSaved) {
                        window.onbeforeunload = null;
                    }
                    else {

                        window.onbeforeunload = function (event) {
                            // console.log(event)
                            return '';
                        }
                    }
                },

                /**
                 * @function shortCutHandler
                 * @param {string} theKey Key used for the shortcut
                 * @param {function} callback Function called for the specific key shortcut
                 * @returns {void}
                 */
                shortCutHandler: function (theKey, callback) {
                    var key = me.isMac ? theKey.mac : theKey.pc;
                    var arr = key.split(" ");
                    var i;
                    for (i = 0; i < arr.length; i += 1) {
                        if (arr[i].charAt(0) === "#") {
                            arr[i] = String.fromCharCode(parseInt(arr[i].substring(1), 10));
                        } else
                            if (arr[i].length === 1) {
                                arr[i] = arr[i].toUpperCase();
                            }
                    }
                    key = arr.join(" ");
                    me.shortCuts[key] = callback;
                },

                /**
                 * @function loadConfiguration
                 * @desc Load general Microdraw configuration
                 * @returns {Promise<void[]>} returns a promise that resolves when the configuration is loaded
                 */
                loadConfiguration: function () {
                    return Promise.all([

                        // 1st promise in array: always load the default tools
                        Promise.all([
                            // me.loadScript("/lib/paperJs/jquery-1.11.0.min.js"),
                            me.loadScript("/lib/paperJs/paper-full-0.9.25.min.js"),
                            me.loadScript("/lib/paperJs/openseadragon-bin-2.4.2/openseadragon.js"),
                            // me.loadScript("https://code.jquery.com/ui/1.13.2/jquery-ui.js")
                        ])
                            .then(() => {
                                return me.loadScript("/lib/paperJs/openseadragon-viewerinputhook.min.js");
                            })
                            .then(() => {
                                for (let item of tools) {
                                    Object.assign(Microdraw.tools, item)
                                }
                                window.Microdraw = Microdraw;

                                return Promise.all([
                                    me.loadScript("/lib/paperJs/OpenSeadragonScalebar/openseadragon-scalebar.js"),
                                    me.loadScript("https://cdn.jsdelivr.net/gh/r03ert0/Openseadragon-screenshot@v0.0.1/openseadragonScreenshot.js"),
                                    me.loadScript("https://cdn.jsdelivr.net/gh/r03ert0/muijs@v0.1.1/mui.js"),
                                ]);
                            }),
                    ]);
                },

                /**
                 * @function loadScript
                 * @desc Loads script from path if test is not fulfilled
                 * @param {string} path Path to script, either a local path or a url
                 * @param {function} testScriptPresent Function to test if the script is already present. If undefined, the script will be loaded.
                 * @returns {promise} A promise fulfilled when the script is loaded
                 */
                loadScript: function (path, testScriptPresent) {
                    return new Promise(function (resolve, reject) {
                        if (testScriptPresent && testScriptPresent()) {
                            // console.log("[loadScript] Script", path, "already present, not loading it again");
                            resolve();
                        }
                        var s = document.createElement("script");
                        s.src = path;
                        s.onload = function () {
                            // console.log("Loaded", path);
                            resolve();
                        };
                        s.onerror = function () {
                            // console.log("Error", path);
                            reject(new Error("something bad happened"));
                        };
                        document.body.appendChild(s);
                    });
                },

                calcPointMinMax: function (segments) {
                    var minX;
                    var minY;
                    var maxX;
                    var maxY;

                    if (!segments) {
                        return;
                    }

                    minX = segments[0].point.x;
                    minY = segments[0].point.y;
                    maxX = segments[0].point.x;
                    maxY = segments[0].point.y;

                    for (var seg of segments) {
                        if (minX > seg.point.x) {
                            minX = seg.point.x;
                        }

                        if (minY > seg.point.y) {
                            minY = seg.point.y;
                        }

                        if (maxX < seg.point.x) {
                            maxX = seg.point.x;
                        }

                        if (maxY < seg.point.y) {
                            maxY = seg.point.y;
                        }
                    }

                    return { minX: minX, minY: minY, maxX: maxX, maxY: maxY, width: maxX - minX, height: maxY - minY }
                },

                updateFilters: function () {
                    var filters = [
                        OpenSeadragon.Filters.BRIGHTNESS(Microdraw.dom.querySelector('#brightnessDiv .slider').slider("value")),
                        OpenSeadragon.Filters.CONTRAST(Microdraw.dom.querySelector('#contrastDiv .slider').slider("value"))
                    ]

                    me.dom.querySelector("#chkInvert").checked ? filters.push(OpenSeadragon.Filters.INVERT()) : '';
                    me.dom.querySelector("#chkGray").checked ? filters.push(OpenSeadragon.Filters.GREYSCALE()) : '';


                    me.viewer.setFilterOptions({
                        filters: {
                            processors: filters
                        },
                        loadMode: 'sync'
                    });
                },

                togglePopup: function (id) {
                    if (me.dom.querySelector(`#${id}`).style.visibility != "visible") {
                        me.dom.querySelector(`#${id}`).style.visibility = "visible"
                    }
                    else if (me.dom.querySelector(`#${id}`).style.visibility == "visible") {
                        me.dom.querySelector(`#${id}`).style.visibility = "hidden"
                    }
                },

                unsavedAlert: function (e, isKeepImagePopup) {
                    if (e.currentTarget.href != "javascript:") {
                        if (isKeepImagePopup) {
                            window.onunload = null;
                        }
                        if (me.isSaved && e.target.id != 'prevSlide' && e.target.id != 'nextSlide' && e.currentTarget.getAttribute('name') != 'popup-image-list') {
                            window.popupImageList?.close();
                        }
                        else if (!me.isSaved) {
                            e.preventDefault();
                            $.confirm({
                                title: '',
                                content: 'There are unsaved changes. Do you want to save before leaving this page?',
                                type: 'custom',
                                typeAnimated: true,
                                animation: 'none',
                                buttons: {
                                    tryAgain: {
                                        text: 'SAVE',
                                        btnClass: 'btn-custom',
                                        action: async () => {
                                            if (await Microdraw.save()) {
                                                if (window.popupImageList && !window.popupImageList?.closed) {
                                                    openImagePopup(e.currentTarget.search)
                                                }
                                                window.onbeforeunload = null;
                                                window.location = e.currentTarget.href;
                                                if (!isKeepImagePopup) {
                                                    window.popupImageList?.close();
                                                }
                                            }
                                        }
                                    },
                                    close: {
                                        text: 'IGNORE',
                                        action: async () => {
                                            if (window.popupImageList && !window.popupImageList?.closed) {
                                                openImagePopup(e.currentTarget.search)
                                            }
                                            window.onbeforeunload = null;
                                            window.location = e.currentTarget.href;
                                            if (!isKeepImagePopup) {
                                                window.popupImageList?.close();
                                            }
                                        }
                                    }
                                }
                            });
                        }
                        else {
                            if (window.popupImageList && !window.popupImageList?.closed) {
                                if (e.target.id == 'prevSlide' || e.target.id == 'nextSlide') {
                                    openImagePopup(e.currentTarget.getAttribute('search'))
                                }
                                else {
                                    openImagePopup(e.currentTarget.search)
                                }
                            }

                            window.location = e.currentTarget.href;
                        }
                    }
                },


                /**
                 * @function initMicrodraw
                 * @returns {void}
                 */
                initMicrodraw: async () => {

                    if (me.debug) {
                        console.log("> initMicrodraw promise");
                    }
                    // 브라우저 새로고침, 닫힐 때
                    window.onunload = function (event) {
                        window.popupImageList?.close();
                    }

                    window.name = 'annotation'

                    me.initSetting = getSettingCookie() ? getSettingCookie() : me.initSetting;
                    me.handleSize = me.initSetting.handleSize ?? 10;
                    paper.settings.handleSize = me.handleSize;

                    // Enable click on toolbar buttons
                    Array.prototype.forEach.call(me.dom.querySelectorAll('#buttonsBlock div.mui.push'), (el) => {
                        el.addEventListener('click', me.toolSelection);
                    });

                    Array.prototype.forEach.call(me.dom.querySelectorAll('#buttonsBlock2 div.mui.push'), (el) => {
                        el.addEventListener('click', me.toolSelection);
                    });

                    Array.prototype.forEach.call(document.querySelectorAll('.topMenuArea li span'), (el) => {
                        el.addEventListener('click', me.statusSelection);
                    });

                    Array.prototype.forEach.call(me.dom.querySelectorAll('.close_btn'), (el) => {
                        el.addEventListener('click', function (e) {
                            me.dom.querySelector(`#${e.target.parentElement.id}`).style.visibility = 'hidden'
                            if (e.target.parentElement.id == 'popup-object') {
                                me.dom.querySelector(`#changeLabelDiv`).style.visibility = 'hidden'
                            }
                        });
                    });

                    me.dom.querySelector('#btnNavigator').addEventListener('click', me.toggleNavigator);




                    me.dom.querySelector('#chkInvert, #chkGray').addEventListener('click',
                        e => { me.updateFilters(); }
                    );

                    me.dom.querySelector('#btnResetFilters').addEventListener('click',
                        e => {
                            Microdraw.dom.querySelector('#brightnessDiv .slider').slider("value", 0);
                            Microdraw.dom.querySelector('#contrastDiv .slider').slider("value", 1);
                            me.dom.querySelector('#chkInvert').checked = false;
                            me.dom.querySelector('#chkGray').checked = false;

                            me.updateFilters();
                        }
                    );



                    var observer = new MutationObserver(function (mutations) {
                        mutations.forEach(function (mutationRecord) {
                            Microdraw.dom.querySelector('#brightnessDiv .tooltip').css("left", "" + (Microdraw.dom.querySelector('#brightnessDiv span').offsetLeft - 5) + "px")
                        });

                    });



                    // let urlParams = new URLSearchParams('?trId=908&codeName=BRCA&hospitalCode=SS&filename=4&addCondition=Y&condition=worked&step=annotation&status=completed&page=1&pageLength=15&sortFilename=0&sortIsNasExist=0&sortHospitalCode=0&sortInfoYn=1&sortAnnotationYn=0&sortReviewYn=0&sortTerminationYn=0&sortAnnoCount=0&sortRevCount=0&sortTermCount=0');
                    let urlParams = new URLSearchParams(window.location.search);
                    // for (let p of params) {
                    //     console.log(p);
                    // }

                    Microdraw.slide_id = urlParams.get('trId');

                    let params = {
                        // tid: `${_tid}`,
                        slide_id: urlParams.get('trId'),
                        page: urlParams.get('page'),
                        pageLength: urlParams.get('pageLength'),
                        whereOptions: [],
                        orderOptions: [],
                        ssid: urlParams.get('condition') == 'worker' ? urlParams.get('ssid') : '',
                    };

                    let _sortState = {
                        filename: urlParams.get('sortFilename'),
                        is_nas_exist: urlParams.get('sortIsNasExist'),
                        hospital_code: urlParams.get('sortHospitalCode'),
                        memo_yn: urlParams.get('sortMemoYn'),
                        info_yn: urlParams.get('sortInfoYn'),
                        annotation_yn: urlParams.get('sortAnnotationYn'),
                        review_yn: urlParams.get('sortReviewYn'),
                        termination_yn: urlParams.get('sortTerminationYn'),
                        anno_count: urlParams.get('sortAnnoCount'),
                        rev_count: urlParams.get('sortRevCount'),
                        term_count: urlParams.get('sortTermCount')
                    };

                    let _form_datas = [
                        { where_key: 'tumorCode', where_value: urlParams.get('codeName'), where_type: '=' },
                        { where_key: 'hospital_code', where_value: urlParams.get('hospitalCode'), where_type: '=' },
                        { where_key: 'filename', where_value: urlParams.get('filename'), where_type: 'like' },
                        { where_key: 'condition', where_value: urlParams.get('condition'), where_type: '' },
                        { where_key: 'step', where_value: urlParams.get('step'), where_type: '' },
                        { where_key: 'status', where_value: urlParams.get('status'), where_type: '' }
                    ]

                    //Set OrderFields
                    for (const [field, value] of Object.entries(_sortState)) {
                        if (value !== '0') {
                            let obj = {
                                column_name: field,
                                orderOption: `${value == 1 ? 'desc' : 'asc'}`,
                            };
                            params.orderOptions.push(obj);
                        }
                    }

                    //Set Where Fields Make
                    for (let arr of _form_datas) {
                        if (arr.where_key != 'addCondition' && arr.where_value != '') {
                            params.whereOptions.push({
                                where_key: arr.where_key,
                                where_value: arr.where_value,
                                where_type: arr.where_type,
                            });
                        }
                    }


                    // set annotation loading flag to false
                    me.annotationLoadingFlag = false;

                    // Initialize the control key handler and set shortcuts
                    //단축키
                    me.initShortCutHandler();
                    me.shortCutHandler({ pc: '^ z', mac: 'cmd z' }, me.cmdUndo);
                    // me.shortCutHandler({pc:'shift ^ z', mac:'shift cmd z'}, me.cmdRedo);
                    me.shortCutHandler({ pc: '^ y', mac: 'cmd y' }, me.cmdRedo);
                    me.shortCutHandler({ pc: 'alt r', mac: 'alt r' }, function () {
                        me.clickTool('drawMeasurement');
                    });
                    me.shortCutHandler({ pc: 'alt t', mac: 'alt t' }, function () {
                        me.clickTool('transformImage');
                    });
                    me.shortCutHandler({ pc: 'alt l', mac: 'alt l' }, function () {
                        if (!window.popupImageList || window.popupImageList?.closed) {
                            openImagePopup(window.location.search)
                        }
                        else {
                            window.popupImageList.focus();
                        }
                    });
                    me.shortCutHandler({ pc: 'alt o', mac: 'alt o' }, function () {
                        me.togglePopup('popup-object');
                    });
                    me.shortCutHandler({ pc: 'alt m', mac: 'alt m' }, function () {
                        me.togglePopup('popup-memo');
                    });
                    me.shortCutHandler({ pc: 'alt i', mac: 'alt i' }, function () {
                        me.togglePopup('popup-info');
                        Microdraw.dom.querySelector("#labelDiv").style.visibility = 'hidden';
                        Microdraw.dom.querySelector("#changeLabelDiv").style.visibility = 'hidden';
                    });
                    me.shortCutHandler({ pc: 'alt h', mac: 'alt h' }, function () {
                        me.togglePopup('popup-hint');
                        Microdraw.dom.querySelector("#labelDiv").style.visibility = 'hidden';
                        Microdraw.dom.querySelector("#changeLabelDiv").style.visibility = 'hidden';
                        Microdraw.dom.querySelector("#popup-info").style.visibility = 'hidden';
                    });
                    if (me.config.drawingEnabled) {
                        me.shortCutHandler({ pc: '^ x', mac: 'cmd x' }, function () {

                        });
                        me.shortCutHandler({ pc: '^ v', mac: 'cmd v' }, me.cmdPaste);
                        me.shortCutHandler({ pc: '^ a', mac: 'cmd a' }, function () {

                        });
                        me.shortCutHandler({ pc: '^ c', mac: 'cmd c' }, me.cmdCopy);
                        me.shortCutHandler({ pc: '#46', mac: '#8' }, me.cmdDeleteSelected); // delete key
                    }
                    // me.shortCutHandler({pc:'#37', mac:'#37'}, me.loadPreviousImage); // left-arrow key
                    // me.shortCutHandler({pc:'#39', mac:'#39'}, me.loadNextImage); // right-arrow key

                    // Configure currently selected tool
                    me.prevTool = "select";
                    me.selectedTool = "select";

                    document.body.dataset.toolbardisplay = "left";

                    // Consolita.init(me.dom.querySelector("#logScript"), me.dom);



                    // Load regions label set
                    // 색깔 관련
                    // const res = await fetch("/js/paperJs/10regions.json");
                    // const labels = await res.json();
                    // me.ontology = labels;
                    // me.updateLabelDisplay();
                },

                //tool background 제거
                initToolSelection: function () {
                    Array.prototype.forEach.call(me.dom.querySelectorAll('#buttonsBlock div.mui.push'), (el) => {
                        el.classList.remove("selected")
                    });
                },

                //마우스 포인터 초기화
                initCursor: function () {
                    var classList = me.dom.querySelectorAll('.openseadragon-canvas canvas')[0]?.classList.value.split(' ')
                    classList?.forEach((value, index) => {
                        if (value != "") {
                            me.dom.querySelectorAll('.openseadragon-canvas canvas')[0]?.classList.remove(value)
                        }
                    });
                },

                addCursor: function (classNm) {
                    Microdraw.dom.querySelectorAll('.openseadragon-canvas canvas')[0].classList.add(classNm);
                },

                //선택한 tool에 따라 마우스 포인터 변경
                updateCursor: function () {
                    if (me.isLocked) {
                        return;
                    }

                    var tool = Microdraw.selectedTool;
                    if (tool.indexOf("draw") == 0) {
                        me.addCursor("crosshair");
                    }

                    if (tool == "rotate") {
                        me.addCursor("grab");
                    }

                    if (tool == "move") {
                        me.addCursor("move");
                    }

                    if (tool == 'region') {
                        me.addCursor("knife")
                    }

                    if (tool == 'select') {
                        me.addCursor("default")
                    }
                },

                updateUndoStack: function () {
                    if (me.UndoStack.length > 0) {
                        let undoArrs = me.UndoStack;
                        let regArrs;
                        let reg;
                        for (var undoCnt = 0; undoCnt < undoArrs.length; undoCnt++) {
                            regArrs = undoArrs[undoCnt].regions;
                            for (var regCnt = 0; regCnt < regArrs.length; regCnt++) {
                                reg = regArrs[regCnt];
                                if (me.region.annoSeq == reg.annoSeq) {
                                    reg.hex = me.region.hex;
                                    reg.labelNo = me.region.labelNo;
                                    reg.labelName = me.region.labelName;
                                    continue;
                                }
                            }
                        }
                    }

                    if (me.RedoStack.length > 0) {
                        let redoArrs = me.RedoStack;
                        let regArrs;
                        let reg;
                        for (var redoCnt = 0; redoCnt < redoArrs.length; redoCnt++) {
                            regArrs = redoArrs[redoCnt].regions;
                            for (var regCnt = 0; regCnt < regArrs.length; regCnt++) {
                                reg = regArrs[regCnt];
                                if (me.region.annoSeq == reg.annoSeq) {
                                    reg.hex = me.region.hex;
                                    reg.labelNo = me.region.labelNo;
                                    reg.labelName = me.region.labelName;
                                    continue;
                                }
                            }
                        }
                    }
                },

                //주석 현황 최신화
                currentRegions: function (unscrollFlag) {
                    Microdraw.updateLabelBar();
                    if (me.dom.querySelector("#popup-object").style.visibility == 'visible') {
                        Microdraw.objectListPopup();
                    }

                    //unscrollFlag true로 넘겨주면 scrolltop 동작 안함 
                    Microdraw.selectedRegInfo(unscrollFlag);

                },

                selectedRegInfo: function (unscrollFlag) {
                    let reg;
                    let del_cnt = 0;

                    for (var regCnt = 0; regCnt < me.objInfo.regions.length; regCnt++) {
                        reg = me.objInfo.regions[regCnt];
                        reg.text.position = reg.path.position;

                        if (reg.del_yn == "Y") {
                            del_cnt += 1;
                        }
                        if (reg.path.selected && !unscrollFlag) {
                            Microdraw.dom.querySelector('#popup-object .list').scrollTop((regCnt - del_cnt) * 65)
                        }
                    }

                    paper.view.draw();
                },

                // 도형 면적 구하기 신발끈 공식
                // Math.abs((x1*y2 + x2*y3 + x3*y1) - (x2*y1 + x3*y2 + x1*y3)) * 0.5 * me.umPerProjectPixelX * me.umPerProjectPixelX
                calcRegArea: function (reg) {
                    let point;
                    let pointNext;
                    let segArrs = [...reg.path.segments];
                    segArrs.push(segArrs[0]);

                    let area1 = 0;
                    let area2 = 0;

                    for (var segCnt = 0; segCnt < segArrs.length - 1; segCnt++) {
                        point = segArrs[segCnt].point;
                        pointNext = segArrs[segCnt + 1].point;

                        area1 += point.x * pointNext.y;
                        area2 += point.y * pointNext.x;
                    }

                    reg.area = Math.abs(area1 - area2) * 0.5 * me.umPerProjectPixelX * me.umPerProjectPixelX;
                },

                //우측 라벨명 숨김/보임 목록
                updateLabelBar: function () {
                    let labelArr = [];

                    let labelList = {};
                    let labelNo;
                    // me.dom.querySelectorAll("#labelBar div").forEach(
                    //     e => e.remove()
                    // );



                    // 현재 주석 기준으로 labelNo, labelName, hex 배열화
                    for (var regCnt = 0; regCnt < me.objInfo.regions.length; regCnt++) {
                        if (me.objInfo.regions[regCnt].del_yn == "N") {
                            labelArr.push({ labelNo: me.objInfo.regions[regCnt].labelNo, labelName: me.objInfo.regions[regCnt].labelName, hex: me.objInfo.regions[regCnt].hex });
                        }
                    }

                    // 배열중복 제거
                    labelArr = [...new Set(labelArr.map(JSON.stringify))].map(JSON.parse);

                    // 라벨바에서 현재 주석에 없는 라벨은 remove
                    // else labelList에 목록 넣음
                    me.dom.querySelectorAll("#labelBar div").forEach(
                        function (element) {
                            let cnt = 0;
                            labelArr.forEach(function (e) {
                                if (e.labelNo == element.getAttribute('data-label-no')) {
                                    cnt++;
                                }
                            });

                            if (cnt == 0) {
                                element.remove();
                            }
                            else {
                                labelNo = element.getAttribute('data-label-no');
                                labelList[labelNo] = labelNo;
                            }
                        }
                    );

                    var el = document.createElement("div");
                    var elChkBox;
                    var elLabel;

                    for (var arrCnt = 0; arrCnt < labelArr.length; arrCnt++) {
                        // labelBar에 없는 라벨div를 새로 추가
                        if (labelList[labelArr[arrCnt].labelNo] === undefined) {
                            el = document.createElement("div");
                            el.setAttribute('data-label-no', labelArr[arrCnt].labelNo ? labelArr[arrCnt].labelNo : '');
                            el.setAttribute('data-label-nm', labelArr[arrCnt].labelName);
                            el.setAttribute('data-hex', labelArr[arrCnt].hex);

                            elChkBox = document.createElement("input");
                            elChkBox.setAttribute('type', 'checkbox');
                            elChkBox.setAttribute('name', 'checker');
                            elChkBox.setAttribute('class', 'chk');
                            elChkBox.setAttribute('checked', true);
                            elChkBox.setAttribute('id', 'labelChk' + (labelArr[arrCnt].labelNo ? labelArr[arrCnt].labelNo : labelArr[arrCnt].labelName));
                            el.append(elChkBox);

                            elLabel = document.createElement("label");
                            elLabel.setAttribute('for', 'labelChk' + (labelArr[arrCnt].labelNo ? labelArr[arrCnt].labelNo : labelArr[arrCnt].labelName));
                            elLabel.innerText = labelArr[arrCnt].labelName;
                            elLabel.style.color = 'rgb(' + me.hexToRgb(labelArr[arrCnt].hex) + ')';
                            el.append(elLabel);

                            el.addEventListener("click", function () {
                                if (Microdraw.drawingPolygonFlag === true) {
                                    finishDrawingPolygon(true);
                                }

                                if (Microdraw.drawingPointFlag === true) {
                                    finishDrawingPoint(true);
                                }

                                for (var regCnt = 0; regCnt < me.objInfo.measurements.length; regCnt++) {
                                    if (me.objInfo.measurements[regCnt].labelNo == this.getAttribute('data-label-no')) {
                                        me.objInfo.measurements[regCnt].path.selected = false

                                        if (!this.children[0].checked) {
                                            me.objInfo.measurements[regCnt].path.visible = false;
                                            me.objInfo.measurements[regCnt].text.visible = false;
                                        }
                                        else {
                                            me.objInfo.measurements[regCnt].path.visible = true;
                                            me.objInfo.measurements[regCnt].text.visible = true;
                                        }
                                    }
                                }

                                for (var regCnt = 0; regCnt < me.objInfo.regions.length; regCnt++) {
                                    if (me.objInfo.regions[regCnt].del_yn == "N") {
                                        if (me.objInfo.regions[regCnt].labelNo == this.getAttribute('data-label-no')) {
                                            me.objInfo.regions[regCnt].path.selected = false

                                            if (!this.children[0].checked) {
                                                me.objInfo.regions[regCnt].path.visible = false;
                                                me.objInfo.regions[regCnt].text.visible = false;
                                            }
                                            else {
                                                me.objInfo.regions[regCnt].path.visible = true;
                                                me.objInfo.regions[regCnt].text.visible = true;
                                            }

                                        }
                                    }
                                }
                                me.selectedRegInfo();
                                paper.view.draw();
                            });

                            me.dom.querySelector("#labelBar").append(el);
                        }
                    }
                },

                updateLatestStatus: function () {
                    //status DB값으로 최신 작업, 상태 구분
                    if (Microdraw.statusInfo.termination_yn == "Y") {
                        Microdraw.latestWork = "Termination";
                        Microdraw.latestStatus = "complete";
                    }
                    else if (Microdraw.statusInfo.termination_ssid !== null && Microdraw.statusInfo.termination_utc_dtm === null) {
                        Microdraw.latestWork = "Termination";
                        Microdraw.latestStatus = "progressing";
                    }
                    else if (Microdraw.statusInfo.review_yn == "Y") {
                        Microdraw.latestWork = "Review";
                        Microdraw.latestStatus = "complete";
                    }
                    else if (Microdraw.statusInfo.review_ssid !== null && Microdraw.statusInfo.review_utc_dtm === null) {
                        Microdraw.latestWork = "Review";
                        Microdraw.latestStatus = "progressing";
                    }
                    else if (Microdraw.statusInfo.annotation_yn == "Y") {
                        Microdraw.latestWork = "Annotation";
                        Microdraw.latestStatus = "complete";
                    }
                    else if (Microdraw.statusInfo.annotation_ssid !== null && Microdraw.statusInfo.annotation_utc_dtm === null) {
                        Microdraw.latestWork = "Annotation";
                        Microdraw.latestStatus = "progressing";
                    }
                    else {
                        Microdraw.latestWork = "Object List";
                        Microdraw.latestStatus = "";
                    }
                },

                listUpLabelByCoordinateKindCd: function (coordinate_kind_cd, targetDiv) {
                    me.dom.querySelector(`${targetDiv} ul`).innerHTML = '';

                    coordinate_kind_cd = coordinate_kind_cd.toLowerCase()
                    let labelList = me.labelInfo[coordinate_kind_cd];

                    for (var labelCnt = 0; labelCnt < labelList.length; labelCnt++) {
                        element = document.createElement("li");
                        element.setAttribute('data-label-no', labelList[labelCnt].label_id);
                        element.setAttribute('data-label-nm', labelList[labelCnt].label_nm);
                        element.setAttribute('data-hex', labelList[labelCnt].rgb_hex);
                        element.setAttribute('tabindex', labelCnt + 1);

                        if (labelList[labelCnt].label_id == me.labelSelected[coordinate_kind_cd].labelNo) {
                            element.className = 'selected'
                        }

                        elSpan = document.createElement("span");
                        elSpan.style.backgroundColor = 'rgb(' + me.hexToRgb(labelList[labelCnt].rgb_hex) + ')';
                        element.append(elSpan);

                        element.innerHTML = element.innerHTML + labelList[labelCnt].label_nm + ' (' + labelList[labelCnt].label_desc + ')';

                        if (targetDiv == '#labelDiv') {
                            element.addEventListener("keydown", function (e) {
                                if (e.keyCode == 13) {
                                    me.dom.querySelectorAll(`${targetDiv} li`).forEach(
                                        e => e.classList.remove('selected')
                                    );

                                    me.labelSelected[coordinate_kind_cd] = { labelNo: this.getAttribute('data-label-no'), labelName: this.getAttribute('data-label-nm'), hex: this.getAttribute('data-hex') }
                                    $(this).addClass('selected')
                                    me.dom.querySelector(`${targetDiv}`).style.visibility = 'hidden';
                                }
                            });

                            element.addEventListener("click", function () {
                                me.dom.querySelectorAll(`${targetDiv} li`).forEach(
                                    e => e.classList.remove('selected')
                                );

                                me.labelSelected[coordinate_kind_cd] = { labelNo: this.getAttribute('data-label-no'), labelName: this.getAttribute('data-label-nm'), hex: this.getAttribute('data-hex') }
                                $(this).addClass('selected')
                                me.dom.querySelector(`${targetDiv}`).style.visibility = 'hidden';
                            });
                        }

                        else if (targetDiv == '#changeLabelDiv') {
                            element.addEventListener("keydown", function (e) {
                                if (e.keyCode == 13) {
                                    me.region.hex = this.getAttribute('data-hex');
                                    me.region.labelNo = Number(this.getAttribute('data-label-no'));
                                    me.region.labelName = this.getAttribute('data-label-nm');

                                    me.region.path.strokeColor = 'rgba(' + me.hexToRgb(this.getAttribute('data-hex') ? this.getAttribute('data-hex') : 50, 94, 228) + ',' + 1 + ')'
                                    // me.region.path.fillColor = 'rgba(' + me.hexToRgb(this.getAttribute('data-hex')? this.getAttribute('data-hex') : 50, 94, 228) + ',' + 0.1+ ')';

                                    if (me.region.path.type == 'POINT') {
                                        me.region.path.fillColor = 'rgba(' + me.hexToRgb(this.getAttribute('data-hex') ? this.getAttribute('data-hex') : '0, 0, 80') + ',' + 0 + ')';
                                    }

                                    else {
                                        me.region.path.fillColor = 'rgba(' + me.hexToRgb(this.getAttribute('data-hex') ? this.getAttribute('data-hex') : '0, 0, 80') + ',' + Microdraw.dom.querySelector('#opacityDiv .slider').slider('value') + ')';
                                    }

                                    me.dom.querySelector("#popup-object").style.overflow = 'hidden';
                                    me.dom.querySelector("#changeLabelDiv").style.visibility = 'hidden';

                                    me.updateUndoStack();
                                    me.currentRegions(true);
                                    paper.view.draw();
                                }
                            });

                            element.addEventListener("click", function () {
                                me.region.hex = this.getAttribute('data-hex');
                                me.region.labelNo = Number(this.getAttribute('data-label-no'));
                                me.region.labelName = this.getAttribute('data-label-nm');

                                me.region.path.strokeColor = 'rgba(' + me.hexToRgb(this.getAttribute('data-hex') ? this.getAttribute('data-hex') : 50, 94, 228) + ',' + 1 + ')'
                                // me.region.path.fillColor = 'rgba(' + me.hexToRgb(this.getAttribute('data-hex')? this.getAttribute('data-hex') : 50, 94, 228) + ',' + 0.1+ ')';

                                if (me.region.path.type == 'POINT') {
                                    me.region.path.fillColor = 'rgba(' + me.hexToRgb(this.getAttribute('data-hex') ? this.getAttribute('data-hex') : '0, 0, 80') + ',' + 0 + ')';
                                }

                                else {
                                    me.region.path.fillColor = 'rgba(' + me.hexToRgb(this.getAttribute('data-hex') ? this.getAttribute('data-hex') : '0, 0, 80') + ',' + Microdraw.dom.querySelector('#opacityDiv .slider').slider('value') + ')';
                                }

                                me.dom.querySelector("#popup-object").style.overflow = 'hidden';
                                me.dom.querySelector("#changeLabelDiv").style.visibility = 'hidden';

                                me.updateUndoStack();
                                me.currentRegions(true);
                                paper.view.draw();
                            });
                        }

                        me.dom.querySelector(`${targetDiv} ul`).append(element);


                        // element2 = document.createElement("li");
                        // element2.setAttribute('data-label-no', me.labelInfo[labelCnt].label_id);
                        // element2.setAttribute('data-label-nm', me.labelInfo[labelCnt].label_nm);
                        // element2.setAttribute('data-hex', me.labelInfo[labelCnt].rgb_hex);
                        // element2.setAttribute('tabindex', labelCnt+1);

                        // elSpan = document.createElement("span");
                        // elSpan.style.backgroundColor = 'rgb(' + me.hexToRgb(me.labelInfo[labelCnt].rgb_hex) + ')';
                        // element2.append(elSpan);

                        // element2.innerHTML = element2.innerHTML + me.labelInfo[labelCnt].label_nm + ' (' + me.labelInfo[labelCnt].label_desc + ')';                      

                        // element2.addEventListener("keydown", function(e) {
                        //     if (e.keyCode == 13) {
                        //         me.region.hex = this.getAttribute('data-hex');
                        //         me.region.labelNo = Number(this.getAttribute('data-label-no'));
                        //         me.region.labelName = this.getAttribute('data-label-nm');

                        //         me.region.path.strokeColor = 'rgba(' + me.hexToRgb(this.getAttribute('data-hex')? this.getAttribute('data-hex') : 50, 94, 228) + ',' + 1 + ')'
                        //         me.region.path.fillColor = 'rgba(' + me.hexToRgb(this.getAttribute('data-hex')? this.getAttribute('data-hex') : 50, 94, 228) + ',' + 0.1+ ')';

                        //         me.dom.querySelector("#popup-object").style.overflow = 'hidden';
                        //         me.dom.querySelector("#changeLabelDiv").style.visibility = 'hidden';

                        //         me.updateUndoStack();
                        //         me.currentRegions(true);
                        //         paper.view.draw();
                        //     }
                        // });

                        // element2.addEventListener("click", function() {
                        //     me.region.hex = this.getAttribute('data-hex');
                        //     me.region.labelNo = Number(this.getAttribute('data-label-no'));
                        //     me.region.labelName = this.getAttribute('data-label-nm');

                        //     me.region.path.strokeColor = 'rgba(' + me.hexToRgb(this.getAttribute('data-hex')? this.getAttribute('data-hex') : 50, 94, 228) + ',' + 1 + ')'
                        //     me.region.path.fillColor = 'rgba(' + me.hexToRgb(this.getAttribute('data-hex')? this.getAttribute('data-hex') : 50, 94, 228) + ',' + 0.1+ ')';

                        //     me.dom.querySelector("#popup-object").style.overflow = 'hidden';
                        //     me.dom.querySelector("#changeLabelDiv").style.visibility = 'hidden';

                        //     me.updateUndoStack();
                        //     me.currentRegions(true);
                        //     paper.view.draw();
                        // });



                        // me.dom.querySelector("#changeLabelDiv ul").append(element2);
                    }
                },


                /**
                 * @function initOpenSeadragon
                 * @param {Object} obj DZI json configuration object
                 * @returns {void}
                 */
                initOpenSeadragon: function () {
                    // "tileSources": [
                    //    "/test_data/cat.dzi",
                    //    "/test_data/doge.dzi"
                    // ],
                    // "pixelsPerMeter": 1000000 / me.umPerImagePixelX,
                    // //   "fileID": "cat",
                    // "slide_url": me.slide_url
                    let pixelsPerMeter = 1000000 / me.umPerImagePixelX;
                    let slide_url = me.slide_url


                    me.viewer = new OpenSeadragon({
                        // id: "openseadragon1",
                        element: me.dom.querySelector("#openseadragon1"),
                        prefixUrl: "/lib/paperJs/openseadragon-bin-2.4.2/images/",
                        // tileSources: [],
                        tileSources: {
                            tileSource: 'https://stgdeepcis.codipai.org/slide/CODIPAI-BRCA-AJ-00002/CODIPAI-BRCA-AJ-00002-S-TP-01.tiff.dzi'
                            // tileSource: deepcis_url + slide_url
                            // type: 'image',
                            // url: 'http://localhost:5173/img/test.png'
                        },
                        crossOriginPolicy: '*',
                        showReferenceStrip: false,
                        referenceStripSizeRatio: 0.2,
                        showNavigator: true,
                        sequenceMode: false,
                        // navigatorId: "myNavigator",
                        navigatorPosition: "BOTTOM_LEFT",
                        homeButton: "homee",
                        maxZoomPixelRatio: 10,
                        preserveViewport: false,
                        maxZoomLevel: 30,
                        animationTime: 0.5,
                        maxImageCacheCount: 400,
                    });

                    // me.viewer.addHandler('fully-loaded-change', function() {
                    //     var tiledImage = viewer.world.getItemAt(0);
                    //     if (tiledImage.getFullyLoaded()) {
                    //         Microdraw.loadDBData();
                    //     } 
                    //     // else {
                    //     //   tiledImage.addOnceHandler('fully-loaded-change', hideLoading);
                    //     // }
                    // });

                    // open the currentImage
                    // me.viewer.open(me.ImageInfo[me.currentImage].source);
                    // me.viewer.open(`https://deepcis.codipai.org` + slide_url);

                    // Microdraw.viewer.scalebar({
                    //     // location: OpenSeadragon.ScalebarLocation.NONE,
                    //     type: OpenSeadragon.ScalebarType.MICROSCOPE,
                    //     minWidth:'150px',
                    //     pixelsPerMeter: 1000000 / (Microdraw.fileWidth),
                    //     color:'black',
                    //     fontColor:'black',
                    //     backgroundColor:"rgba(255, 255, 255, 0.5)",
                    //     barThickness:4,
                    //     location: OpenSeadragon.ScalebarLocation.CUSTOM_BOTTOM_RIGHT,
                    //     xOffset:24,
                    //     yOffset:24,
                    //     unit: 'px'
                    //   });
                    // add the scalebar

                    // if (me.umPerImagePixelX != 0) {
                    //     me.viewer.scalebar({
                    //         type: OpenSeadragon.ScalebarType.MICROSCOPE,
                    //         minWidth:'150px',
                    //         pixelsPerMeter:obj.pixelsPerMeter,
                    //         color:'black',
                    //         fontColor:'black',
                    //         backgroundColor:"rgba(255, 255, 255, 0.5)",
                    //         barThickness:4,
                    //         location: OpenSeadragon.ScalebarLocation.CUSTOM_BOTTOM_RIGHT,
                    //         xOffset:24,
                    //         yOffset:24
                    //     });

                    //     /* fixes https://github.com/r03ert0/Microdraw/issues/142  */
                    //     me.viewer.scalebarInstance.divElt.style.pointerEvents = `none`;
                    // }

                    // add screenshot
                    me.viewer.screenshot({
                        showOptions: false, // Default is false
                        // keyboardShortcut: 'p', // Default is null
                        // showScreenshotControl: true // Default is true
                    });

                    // add handlers: update section name, animation, page change, mouse actions
                    me.viewer.addHandler('open', function () {
                        me.initAnnotationOverlay();
                    });
                    me.viewer.addHandler('animation', function () {
                        me.transform();
                    });
                    me.viewer.addHandler("animation-start", function () {
                        me.isAnimating = true;
                    });
                    me.viewer.addHandler("animation-finish", function () {
                        me.isAnimating = false;
                    });
                    me.viewer.addHandler("page", function (data) {
                        console.log(data.page, me.params.tileSources[data.page]);
                    });
                    me.viewer.addViewerInputHook({
                        hooks: [
                            { tracker: 'viewer', handler: 'clickHandler', hookHandler: me.clickHandler },
                            { tracker: 'viewer', handler: 'dblClickHandler', hookHandler: me.dblClickHandler },
                            { tracker: 'viewer', handler: 'pressHandler', hookHandler: me.pressHandler },
                            { tracker: 'viewer', handler: 'releaseHandler', hookHandler: me.releaseHandler },
                            { tracker: 'viewer', handler: 'dragHandler', hookHandler: me.dragHandler },
                            { tracker: 'viewer', handler: 'moveHandler', hookHandler: me.moveHandler },
                            // {tracker: 'viewer', handler: 'dragEndHandler', hookHandler: me.dragEndHandler},
                            { tracker: 'viewer', handler: 'scrollHandler', hookHandler: me.scrollHandler }
                        ]
                    });

                    me.canvasOrigin = Microdraw.dom.querySelector('#openseadragon1 canvas').getContext('2d', { willReadFrequently: true })
                    me.canvasZoom = Microdraw.dom.querySelector('#test1').getContext('2d', { willReadFrequently: true })
                    me.canvasTemp = Microdraw.dom.querySelector('#test2').getContext('2d', { willReadFrequently: true })

                    if (me.debug) {
                        console.log("< initOpenSeadragon resolve: success");
                    }

                    // $('#content-loading').fadeOut();
                },

                toggleNavigator: function () {
                    if (this.className.includes('reduce')) {
                        this.className = this.className.replace('reduce', 'expand');
                        me.dom.querySelector('.navigator').style.visibility = 'hidden'
                    }
                    else if (this.className.includes('expand')) {
                        this.className = this.className.replace('expand', 'reduce');
                        me.dom.querySelector('.navigator').style.visibility = 'visible'
                    }
                },

                init: function (dom) {
                    me.dom = dom;
                    me.loadConfiguration()
                        .then(async function () {
                            if (me.config.useDatabase) {
                                Promise.all([]) // [MicrodrawDBIP(), MyLoginWidget.init()]
                                    .then(function () {
                                        me.params = me.deparam();
                                        me.section = me.currentImage;
                                        me.source = me.params.source;
                                        if (typeof me.params.project !== 'undefined') {
                                            me.project = me.params.project;
                                        }
                                        // updateUser();
                                    })
                                    .then(async function () {
                                        await me.initMicrodraw()
                                        //   me.initAnnotationOverlay();
                                        //   await me.dbSlideInfoLoad()  
                                        //   await me.dbStatusLoad()
                                        //   // await me.dbDeepzoomInformationLoad()
                                        me.initOpenSeadragon()
                                        //   me.objectListPopup()
                                        //   me.memoPopup()
                                        //   // let resultCode = await me.dbSlideInfoLoad()
                                        //   // if (resultCode == 200) {    
                                        //   //     await me.dbStatusLoad()
                                        //   //     await me.dbDeepzoomInformationLoad()
                                        //   //     me.objectListPopup()
                                        //   //     me.memoPopup()
                                        //   // }
                                        //   // // deepzoom에서 요청 이미지가 다운로드 중인 경우 423 코드로 리턴됨.
                                        //   // else if (resultCode == 423) {   
                                        //   //     me.dom.querySelector("#openseadragon1").innerText = 'File is already being downloaded. Please refresh (F5) a little later.';
                                        //   // }
                                        //   $('#content-loading').fadeOut();
                                    }

                                    )
                            } else {
                                me.params = me.deparam();
                                me.initMicrodraw();
                            }
                        })

                    // if (!$('#main-lnb, .ham, .link-logo-sub').attr('class').includes('active')) {
                    //     $('#main-lnb, .ham, .link-logo-sub').toggleClass('active');
                    //     $('.layout-lnb>ul>li>ul.list-menu-sub').slideUp();
                    // }

                },

                // 영역 교차여부 판별 (전체)
                validateIntersect: function () {
                    for (let reg of me.objInfo.regions) {
                        if (reg['del_yn'] == 'N' && reg.path.type == 'SEG') {
                            var newPath = reg.path.unite(new paper.Path());

                            if (newPath?.children) {
                                newPath.remove();
                                me.selectRegion(reg);

                                Microdraw.viewer.viewport.centerSpringX.target.value = reg.path.position.x / 1000;
                                Microdraw.viewer.viewport.centerSpringY.target.value = reg.path.position.y / 1000;

                                customAlert('Some areas intersect with each other. Please solve the intersection area.')
                                return false;
                            }
                            newPath?.remove();
                        }
                    }
                    return true;
                }
            };

            return me;
        }()
        const res = await fetch("/js/paperJs/Microdraw.mustache");
        const txt = await res.text();
        const parser = new DOMParser();
        const elem = parser.parseFromString(txt, 'text/html').documentElement;
        if (!contentRef.current.shadowRoot) {
            const shadow = contentRef.current.attachShadow({ mode: 'open' });
            await shadow.appendChild(elem)
            await Microdraw.init(document.querySelector('#content').shadowRoot)
        }
    }

    function resizeAnnotationOverlay() {
        if (Microdraw.debug > 1) { console.log("> resizeAnnotationOverlay"); }

        var width = Microdraw.dom.querySelector("#paperjs-container").offsetWidth;
        var height = Microdraw.dom.querySelector("#paperjs-container").offsetHeight;
        // Microdraw.dom.querySelector("canvas.overlay").offsetWidth = width;
        // Microdraw.dom.querySelector("canvas.overlay").offsetHeight = height;
        paper.view.viewSize = [
            width,
            height
        ];

        relocatePopup(Microdraw.dom.querySelector("#popup-info"), width, height);
        relocatePopup(Microdraw.dom.querySelector("#popup-object"), width, height);
        relocatePopup(Microdraw.dom.querySelector("#popup-memo"), width, height);
        relocatePopup(Microdraw.dom.querySelector("#popup-hint"), width, height);

        Microdraw.transform();
        Microdraw.resizeCommentBox();
    }

    function relocatePopup(popup, width, height) {
        if (popup.offsetLeft < 0) {
            popup.style.left = '0px'
        }

        if (popup.offsetTop < 0) {
            popup.style.top = '0px'
        }

        if (popup.offsetWidth > width) {
            popup.style.width = width + 'px';
        }

        if (popup.offsetHeight > height) {
            popup.style.height = height + 'px';
        }

        if (popup.offsetLeft + popup.offsetWidth > width) {
            popup.style.left = width - popup.offsetWidth + 'px'
        }

        if (popup.offsetTop + popup.offsetHeight > height) {
            popup.style.top = height - popup.offsetHeight + 'px'
        }

        if (popup.id == 'popup-object') {
            setSettingCookie({
                'popup-object': {
                    left: popup.style.left,
                    top: popup.style.top,
                    width: popup.style.width,
                    height: popup.style.height
                }
            });
        }
        else if (popup.id == 'popup-memo') {
            setSettingCookie({
                'popup-memo': {
                    left: popup.style.left,
                    right: '24px',
                    top: popup.style.top,
                    width: popup.style.width,
                    height: popup.style.height
                }
            });
        }

    }

    function customAlert(content) {
        $.confirm({
            title: '',
            content: content,
            type: 'custom',
            typeAnimated: true,
            animation: 'none',
            buttons: {
                close: {
                    text: 'CONFIRM',
                    action: function () { }
                }
            }
        });
    }

    function setPopupHeight() {
        if (Microdraw.dom.querySelector("#popup-object").style.height != '') {
            Microdraw.dom.querySelector("#popup-object .viewArea .list").style.height = '100%'
        }
    }

    function setSettingCookie(value) {
        const expired = new Date();
        expired.setTime(expired.getTime() + 1 * 365 * 24 * 60 * 60 * 1000);

        let prevValue = getSettingCookie() ? getSettingCookie() : '';
        document.cookie = Microdraw.settingCookie + '=' + JSON.stringify({ ...prevValue, ...value }) + `; expires=${expired.toUTCString()}; path=/`;
        Microdraw.initSetting = getSettingCookie();
    };

    function getSettingCookie() {
        var value = document.cookie.match('(^|;) ?' + Microdraw.settingCookie + '=([^;]*)(;|$)');
        return value ? JSON.parse(decodeURIComponent(value[2])) : Microdraw.initSetting;
    };

    function hrefByImageListPopup(e) {
        Microdraw.unsavedAlert(e, true);
    }

    function openImagePopup(search) {
        // if (window.popupImageList) {
        if (search.substring(0, 1) == '?') {
            search = search.slice(1);
        }
        window.popupImageList = window.open(`/annotation/imageListPopup?${search}`, "popupImageList", "height=740,width=380,top=100,left=1200,location=no");
        // }
    }

    // window.Microdraw = Microdraw;

    return (
        <>
            <div id="content" ref={contentRef} style={{ 'height': '1000px' }}>
            </div>
            <Script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/paper.js/0.12.17/paper-full.min.js"
                onReady={ready}
            >
            </Script>
        </>
    )
}

export default Home;
