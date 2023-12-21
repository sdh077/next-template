/*global Microdraw*/
/*global paper*/

export var ToolTransformImage = { transformImage : (function() {
  var tool = {

    /**
     * @function click
     * @desc home. Openseadragon initialisation parameter binds the function.
     * @param {string} prevTool The previous tool to which the selection goes back
     * @returns {void}
     */
    click : async function click(prevTool) {

      let zoom = Microdraw.viewer.viewport.getZoom();
      let center = Microdraw.viewer.viewport.getCenter();
      // 이미지 open 후 callback
      Microdraw.viewer.addOnceHandler('open', function() {
        $('#content-loading').fadeOut();
        $('#content-loading .message').text('');
        
        Microdraw.viewer.viewport.zoomTo(zoom);
        Microdraw.viewer.viewport.centerSpringX.target.value = center.x;
        Microdraw.viewer.viewport.centerSpringY.target.value = center.y;
        // Microdraw.viewer.viewport.zoomBy(1.000000001); // Calling it this way keeps the arguments consistent (if we passed callback into addOnceHandler it would get an event on this path but not on the setTimeout path above)
      })

      await this.transfromImage()

      Microdraw.backToPreviousTool(prevTool);
    },

    transfromImage: async function transfromImage() {
      $('#content-loading').fadeIn();
      $('#content-loading .message').text(`loading...`);
      if (Microdraw.imageType == 'jpeg') {
        Microdraw.dom.querySelector(".tools.JPG").classList.add('WSI');
        Microdraw.dom.querySelector(".tools.JPG").classList.remove('JPG');
        Microdraw.dom.querySelector("#image-format").innerText = 'WSI';
        
        let deepzoomCode;
        await axios.get(web_url + `/api/tumor/detail-slide/` + Microdraw.slide_id).then((result) => {
          deepzoomCode = result.data.deepzoomInfo?.statusCode;
        })
        Microdraw.imageType = 'origin'

        if (deepzoomCode == 200) {
          Microdraw.viewer.open(deepcis_url + Microdraw.slide_url)
          await Microdraw.dbDeepzoomInformationLoad();
          Microdraw.viewer.scalebar({
            type: OpenSeadragon.ScalebarType.MICROSCOPE,
            minWidth:'150px',
            pixelsPerMeter: 1000000 / Microdraw.umPerImagePixelX,
            color:'black',
            fontColor:'black',
            backgroundColor:"rgba(255, 255, 255, 0.5)",
            barThickness:4,
            location: OpenSeadragon.ScalebarLocation.CUSTOM_BOTTOM_RIGHT,
            xOffset:24,
            yOffset:24,
            unit: 'meter'
          });
          /* fixes https://github.com/r03ert0/microdraw/issues/142  */
          Microdraw.viewer.scalebarInstance.divElt.style.pointerEvents = `none`;
        }
        else if (deepzoomCode == 423) {   
          Microdraw.dom.querySelector("#openseadragon1").innerText = 'File is already being downloaded. Please refresh (F5) a little later.';
        }
      }
      else {
        Microdraw.dom.querySelector(".tools.WSI").classList.add('JPG');
        Microdraw.dom.querySelector(".tools.WSI").classList.remove('WSI');
        Microdraw.dom.querySelector("#image-format").innerText = 'JPG';

        Microdraw.viewer.open({
          type: 'image',
          url: Microdraw.jpegFilePath
        })

        Microdraw.viewer.scalebar({
          location: OpenSeadragon.ScalebarLocation.NONE,
          // type: OpenSeadragon.ScalebarType.MICROSCOPE,
          // minWidth:'150px',
          // pixelsPerMeter: (Microdraw.imageSize.x),
          // color:'black',
          // fontColor:'black',
          // backgroundColor:"rgba(255, 255, 255, 0.5)",
          // barThickness:4,
          // location: OpenSeadragon.ScalebarLocation.CUSTOM_BOTTOM_RIGHT,
          // xOffset:24,
          // yOffset:24,
          // unit: 'px'
        });

        Microdraw.dom.querySelector(".infor.Txt2.pixelX").innerText = 'N/A';
        Microdraw.dom.querySelector(".infor.Txt2.pixelY").innerText = 'N/A';
        Microdraw.dom.querySelector(".infor.Txt2.vendor").innerText = 'JPG';
        Microdraw.dom.querySelector(".infor.textarea.property").innerHTML = '';

        Microdraw.imageType = 'jpeg'
        Microdraw.umPerImagePixelX = 0;
      }
      return true;
    }
  };

  return tool;
}())};
