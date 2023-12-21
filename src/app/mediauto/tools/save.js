/*global Microdraw*/
/*global $*/

export var ToolSave = { save: (function() {

  const configureValuesToSave = function (sl) {
    var section = Microdraw.ImageInfo[sl];
    var value = {};
    value.Regions = [];
    value.RegionsToRemove = [];

    for(const reg of section.Regions) {
      var coordinate_info = Microdraw.coordinateInfo(reg);

      value.Regions.push({
        annotation_id : reg.uid,
        label_id: reg.labelNo,
        coordinate_kind_cd : reg.path.type,
        coordinate_info: coordinate_info,
        review_yn: 'N',
        termination_yn: 'N',
        del_yn : "N",
      });
    }

    for( const uid of section.RegionsToRemove ) {
      value.RegionsToRemove.push(uid);
    }

    return value;
  };

  const saveAnnotationToDB = function (data) {
    Object.assign(data, { action: "save"});
    const {slice, Hash} = data;

    var pr = new Promise((resolve, reject) => {
      // $.ajax({
      //   url: 'http://172.30.1.124:3003/annotation/input',
      //   type: "POST",
      //   data: data,
      //   success: (result) => {
      //     console.log("< microdrawDBSave. Successfully saved regions:",
      //       Microdraw.ImageInfo[data.slice].Regions.length,
      //       "section: " + slice.toString(),
      //       "response:",
      //       result
      //     );
      //     // update hash
      //     Microdraw.ImageInfo[slice].Hash = Hash;
      //     resolve("section " + slice);
      //   },
      //   error: (jqXHR, textStatus, err) => {
      //     console.log("< microdrawDBSave. ERROR: " + textStatus + " " + err, "section: " + slice.toString());
      //     reject(err);
      //   }
      // });

      axios
        .post(web_url + `/api/annotation/input`, data)
        .then((result) => {
          console.log("< microdrawDBSave. Successfully saved regions:",
            "response:",result
          );
          // update hash
          Microdraw.ImageInfo[1].Hash = Hash;
          resolve("section " + 1);
        })
        .catch(errorHandler)
        .finally(() => {
          // $('#content-loading').fadeOut();
        });
    })
      .catch(console.log);

    return pr;
  };

  /**
     * @function microdrawDBSave
     * @desc Save SVG overlay to microdrawDB
     * @returns {void}
     */
  var microdrawDBSave = function microdrawDBSave() {
    if( Microdraw.debug ) {
      console.log("> save promise");
    }

    var promiseArray = [];
    var savedSections = "Saving sections: ";

    // eslint-disable-next-line max-statements
    Object.keys(Microdraw.ImageInfo).forEach((sl) => {
      if ((Microdraw.config.multiImageSave === false) && (sl !== Microdraw.currentImage)) {
        return;
      }

      if (Microdraw.ImageInfo[sl].Regions.length < 1) {
        return;
      }

      // configure value to be saved
      const value = configureValuesToSave(sl);

      // check if the section annotations have changed since loaded by computing a hash
      const h = Microdraw.hash(JSON.stringify(value)).toString(16);
      const section = Microdraw.ImageInfo[sl];

      if( Microdraw.debug > 1 ) {
        console.log("hash:", h, "original hash:", section.Hash);
      }

      // if the section hash is undefined, this section has not yet been loaded.
      // Do not save anything for this section
      // if( typeof section.Hash === "undefined" || h === section.Hash ) {
      //   if(Microdraw.debug > 1) {
      //     console.log(`sl ${sl}`, "No change, no save");
      //   }

      //   return;
      // }

      value.Hash = h;
      savedSections += sl.toString() + ' ';

      // post data to database
      promiseArray.push(saveAnnotationToDB({
        slide_id : Microdraw.slide_id,
        annotation_list : value.Regions,
      }));
    });

    Promise.all(promiseArray).then((values) => {
      console.log(values);
    })
      .catch(console.log);

    //show dialog box with timeout
    $('#saveDialog')
      .html(savedSections)
      .fadeIn();
    setTimeout(function() {
      $("#saveDialog")
        .fadeOut(500);
    }, 2000);
  };

  var tool = {

    /**
         * @function click
         * @desc save the annotations
         * @param {string} prevTool The previous tool to which the selection goes back
         * @returns {void}
         */
    click : function click(prevTool) {
      Microdraw.selectRegion( null );
      microdrawDBSave();
      Microdraw.backToPreviousTool(prevTool);
    }
  };

  return tool;
}())};

/**
 * @function microdrawDBLoad
 * @desc Load SVG overlay from microdrawDB
 * @returns {Promise} A promise to return an array of paths of the current section.

 */
Microdraw.annotationLoad = function() {
  return new Promise((resolve, reject) => {
    if( Microdraw.debug ) {
      console.log("> save.js microdrawDBLoad promise");
    }
    const query = {
      action : "load_last",
      source : Microdraw.source,
      slice: Microdraw.currentImage
    };
    if(typeof Microdraw.project !== 'undefined') {
      query.project = Microdraw.project;
    }
    
    axios
          .post(web_url + `/api/annotation/list/` + Microdraw.slide_id)
          .then((data) => {
    // $.getJSON('http://172.30.1.124:3003/annotation/list', query)
    //   .success(function (data) {
        Microdraw.annotationLoadingFlag = false;

        // Because of asynchrony, the section that just loaded may not be the one that the user
        // intended to get. If the section that was just loaded does not correspond to the current section,
        // do not display this one and load the current section.

        if( Microdraw.section !== Microdraw.currentImage ) {
          console.log("> save.js microdrawDBLoad: Loaded section does not correspond with the current section.");
          Microdraw.dbAnnotationLoad()
            .then(resolve)
            .catch(reject);

        } else if( $.isEmptyObject(data) ) {
          Microdraw.ImageInfo[Microdraw.currentImage].Hash = Microdraw.hash(JSON.stringify(Microdraw.ImageInfo[Microdraw.currentImage].Regions)).toString(16);
          if( Microdraw.debug ) {
            console.log("< save.js microdrawDBLoad: returned data is an empty object");
          }
          resolve([]);
        } else {
          resolve(data);
        }
      })
      // .error(function(jqXHR, textStatus, err) {
      //   console.log("< microdrawDBLoad resolve ERROR: " + textStatus + " " + err);
      //   Microdraw.annotationLoadingFlag = false;
      //   reject(err);
      // });
  });
};
