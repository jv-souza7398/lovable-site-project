import React, { useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import Cropper from 'react-easy-crop';
import { X, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.85)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100000,
};

const modalStyle = {
  backgroundColor: '#18181b',
  borderRadius: '0.75rem',
  width: '90vw',
  maxWidth: '600px',
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '1rem 1.25rem',
  borderBottom: '1px solid #27272a',
};

const btnIcon = {
  background: 'none',
  border: '1px solid #3f3f46',
  borderRadius: '0.5rem',
  color: '#d4d4d8',
  padding: '0.4rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
};

async function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const radians = (rotation * Math.PI) / 180;
  const sin = Math.abs(Math.sin(radians));
  const cos = Math.abs(Math.cos(radians));
  const bW = image.width * cos + image.height * sin;
  const bH = image.width * sin + image.height * cos;

  canvas.width = bW;
  canvas.height = bH;
  ctx.translate(bW / 2, bH / 2);
  ctx.rotate(radians);
  ctx.drawImage(image, -image.width / 2, -image.height / 2);

  const data = ctx.getImageData(pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.putImageData(data, 0, 0);

  // Resize if > 1200
  let finalCanvas = canvas;
  if (canvas.width > 1200 || canvas.height > 1200) {
    const scale = Math.min(1200 / canvas.width, 1200 / canvas.height);
    const resized = document.createElement('canvas');
    resized.width = Math.round(canvas.width * scale);
    resized.height = Math.round(canvas.height * scale);
    const rCtx = resized.getContext('2d');
    rCtx.drawImage(canvas, 0, 0, resized.width, resized.height);
    finalCanvas = resized;
  }

  return new Promise((resolve) => {
    finalCanvas.toBlob(
      (blob) => resolve(blob),
      'image/jpeg',
      0.85
    );
  });
}

function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', (e) => reject(e));
    img.crossOrigin = 'anonymous';
    img.src = url;
  });
}

const ASPECT_OPTIONS = [
  { label: 'Livre', value: null },
  { label: '1:1', value: 1 },
  { label: '16:9', value: 16 / 9 },
  { label: '4:3', value: 4 / 3 },
];

export default function ImageCropModal({ imageSrc, onClose, onCropDone }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [aspect, setAspect] = useState(1);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleApply = async () => {
    if (!croppedAreaPixels) return;
    setProcessing(true);
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      onCropDone(blob);
    } catch (err) {
      console.error('Crop error:', err);
    } finally {
      setProcessing(false);
    }
  };

  return ReactDOM.createPortal(
    <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={modalStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <span style={{ color: 'white', fontWeight: 600, fontSize: '1rem' }}>
            Ajustar Imagem
          </span>
          <button onClick={onClose} style={btnIcon}>
            <X size={18} />
          </button>
        </div>

        {/* Crop Area */}
        <div style={{ position: 'relative', width: '100%', height: '350px', backgroundColor: '#09090b' }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect || undefined}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        {/* Controls */}
        <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Aspect ratio buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {ASPECT_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => setAspect(opt.value)}
                style={{
                  ...btnIcon,
                  fontSize: '0.75rem',
                  padding: '0.3rem 0.6rem',
                  backgroundColor: aspect === opt.value ? '#f59e0b' : 'transparent',
                  color: aspect === opt.value ? 'black' : '#d4d4d8',
                  fontWeight: aspect === opt.value ? 600 : 400,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Zoom + Rotate */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button type="button" onClick={() => setZoom((z) => Math.max(1, z - 0.2))} style={btnIcon}>
              <ZoomOut size={16} />
            </button>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              style={{ flex: 1, accentColor: '#f59e0b' }}
            />
            <button type="button" onClick={() => setZoom((z) => Math.min(3, z + 0.2))} style={btnIcon}>
              <ZoomIn size={16} />
            </button>
            <button
              type="button"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              style={btnIcon}
              title="Rotacionar 90°"
            >
              <RotateCw size={16} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.75rem',
          padding: '1rem 1.25rem',
          borderTop: '1px solid #27272a',
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              backgroundColor: 'transparent',
              border: '1px solid #3f3f46',
              color: '#d4d4d8',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={processing}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              backgroundColor: '#f59e0b',
              border: 'none',
              color: 'black',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600,
              opacity: processing ? 0.7 : 1,
            }}
          >
            {processing ? 'Processando...' : 'Aplicar'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
