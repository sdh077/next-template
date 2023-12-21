'use client'
import React, { useEffect } from "react";

import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css"; // Add css for snow theme

export default function IndexPage() {
  const { quill, quillRef } = useQuill();
  console.log("!");
  useEffect(() => {
    if (quill) quill.setText("123");
    console.log(quill?.root?.innerHTML)
  });

  return (
    <div style={{ width: "600px", height: "300px" }}>
      <div ref={quillRef} />
    </div>
  );
}
