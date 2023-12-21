'use client'
import * as nifti from 'nifti-reader-js';
import { useEffect } from 'react';
export default function Nifti2() {
  useEffect(() => {
    document.getElementById('file').addEventListener('change', handleFileSelect, false);

  })
  function readNIFTI(name, buf) {
    var header = nifti.readHeader(buf);

    var logger = document.getElementById('results');
    logger.innerText = header.toFormattedString();
}

function makeSlice(file, start, length) {
    var fileType = (typeof File);

    if (fileType === 'undefined') {
        return function () {};
    }

    if (File.prototype.slice) {
        return file.slice(start, start + length);
    }

    if (File.prototype.mozSlice) {
        return file.mozSlice(start, length);
    }

    if (File.prototype.webkitSlice) {
        return file.webkitSlice(start, length);
    }

    return null;
}

function readFile(file) {
    var blob = makeSlice(file, 0, file.size);

    var reader = new FileReader();

    reader.onloadend = function (evt) {
        if (evt.target.readyState === FileReader.DONE) {
            readNIFTI(file.name, evt.target.result);
        }
    };

    reader.readAsArrayBuffer(blob);
}

function handleFileSelect(evt) {
    var files = evt.target.files;
    readFile(files[0]);
}

  return (
    <div>
    <div id="select">
        <h3>NIFTI-Reader-JS &mdash; JavaScript NIFTI Reader</h3>
        <h4><a href="https://github.com/rii-mango/NIFTI-Reader-JS">https://github.com/rii-mango/NIFTI-Reader-JS</a></h4>
        <p>Select a file: <input type="file" id="file" name="files" /></p>
        <hr />
    </div>
    </div>
  )
}
