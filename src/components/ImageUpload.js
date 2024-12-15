// src/components/ImageUpload.js

import React from 'react';

function ImageUpload({ handleImageUpload }) {
  return (
    <div>
      <input
        type="file"
        onChange={handleImageUpload}
        accept="image/png, image/jpeg"
      />
    </div>
  );
}

export default ImageUpload;
