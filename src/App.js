// src/App.js

import React, { useState, useRef, useEffect } from 'react';
import CanvasDraw from 'react-canvas-draw';
import ImageUpload from './components/ImageUpload';
import './App.css';

function App() {
  const [image, setImage] = useState(null);
  const [maskImage, setMaskImage] = useState(null);
  const [brushSize, setBrushSize] = useState(5); // Default brush size
  const [gradientStartColor, setGradientStartColor] = useState('#ffffff'); // Default white for brush
  const [gradientEndColor, setGradientEndColor] = useState('#ffffff'); // Default white for brush
  const canvasRef = useRef(null);

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  // Clear the canvas and reset mask
  const clearCanvas = () => {
    if (canvasRef.current) {
      canvasRef.current.clear();
    }
    setMaskImage(null);
  };

  // Save mask image to the backend server
  const saveMaskToBackend = (maskData) => {
    const filename = `mask_${Date.now()}`; // Generate a unique filename
    fetch('http://localhost:5000/save-mask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ maskData, filename }),
    })
      .then((response) => response.json())
      .then((data) => console.log('Mask saved:', data))
      .catch((error) => console.error('Error:', error));
  };

  // Handle mask change and send to backend
  const handleMaskChange = (canvas) => {
    const maskData = canvas.getDataURL();
    setMaskImage(maskData);
    saveMaskToBackend(maskData); // Save mask to backend
  };

  // Function to handle the download of the mask image
  const downloadMaskImage = () => {
    const link = document.createElement('a');
    link.href = maskImage; // Use the base64 string as the link href
    link.download = 'mask_image.png'; // Set the filename
    link.click(); // Trigger the download
  };

  // Create a gradient brush color from selected start and end color
  const createGradientBrushColor = (ctx, width, height) => {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, gradientStartColor); // Start color
    gradient.addColorStop(1, gradientEndColor); // End color
    return gradient;
  };

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current.canvas;
      const ctx = canvas.getContext('2d');
      // Apply gradient when the canvas is initialized or reset
      const gradient = createGradientBrushColor(ctx, canvas.width, canvas.height);
      canvasRef.current.setBrushColor(gradient);
    }
  }, [gradientStartColor, gradientEndColor]);

  // Increase Brush Size
  const increaseBrushSize = () => {
    if (brushSize < 20) {
      setBrushSize(brushSize + 1);
    }
  };

  // Decrease Brush Size
  const decreaseBrushSize = () => {
    if (brushSize > 1) {
      setBrushSize(brushSize - 1);
    }
  };

  return (
    <div className="App">
      <h1>Image Inpainting Widget</h1>

      {/* Image upload */}
      <ImageUpload handleImageUpload={handleImageUpload} />

      {/* Canvas for mask drawing */}
      <div className="canvas-container">
        {image && (
          <CanvasDraw
            ref={canvasRef}
            imgSrc={image}
            brushRadius={brushSize}
            lazyRadius={0}
            hideGrid={true}
            onChange={handleMaskChange} // Updated to handle mask change
            canvasWidth={500} // Set a fixed width
            canvasHeight={500} // Set a fixed height
          />
        )}
      </div>

      {/* Controls for brush size and clear canvas */}
      <div className="controls-container">
        <button onClick={clearCanvas}>Clear Canvas</button>
        <div className="brush-size-controls">
          <button onClick={decreaseBrushSize}>-</button>
          <span>{brushSize}</span>
          <button onClick={increaseBrushSize}>+</button>
        </div>
      </div>

      {/* Display images as a pair and the download button */}
      {image && maskImage && (
        <div className="image-display">
          <h2>Images</h2>
          <div className="image-pair">
            <div className="image-container">
              <h4>Original Image</h4>
              <img src={image} alt="original" className="image" />
            </div>
            <div className="image-container">
              <h4>Mask Image</h4>
              <img src={maskImage} alt="mask" className="image" />
            </div>
          </div>

          {/* The download button comes after the images */}
          <div className="download-button">
            <button onClick={downloadMaskImage}>Download Mask Image</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
