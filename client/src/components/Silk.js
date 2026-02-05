import React, { useRef, useEffect } from 'react';

const Silk = ({
  speed = 5,
  scale = 1,
  color = '#7B7481',
  noiseIntensity = 1.5,
  rotation = 0,
}) => {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : { r: 0, g: 0, b: 0 };
    };

    const rgb = hexToRgb(color);

    const noise = (x, y, t) => {
      const X = Math.floor(x) & 255;
      const Y = Math.floor(y) & 255;
      const T = Math.floor(t) & 255;

      x -= Math.floor(x);
      y -= Math.floor(y);
      t -= Math.floor(t);

      const u = fade(x);
      const v = fade(y);
      const w = fade(t);

      const A = (X + Y + T) & 255;
      const B = (X + Y + T + 1) & 255;

      return lerp(
        w,
        lerp(v, lerp(u, grad(A, x, y, t), grad(B, x - 1, y, t)), lerp(u, grad(A + 1, x, y - 1, t), grad(B + 1, x - 1, y - 1, t))),
        lerp(v, lerp(u, grad(A, x, y, t - 1), grad(B, x - 1, y, t - 1)), lerp(u, grad(A + 1, x, y - 1, t - 1), grad(B + 1, x - 1, y - 1, t - 1)))
      );
    };

    const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
    const lerp = (t, a, b) => a + t * (b - a);
    const grad = (hash, x, y, t) => {
      const h = hash & 15;
      const u = h < 8 ? x : y;
      const v = h < 4 ? y : h === 12 || h === 14 ? x : t;
      return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    };

    const animate = () => {
      time += speed * 0.001;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;

      for (let y = 0; y < canvas.height; y += 2) {
        for (let x = 0; x < canvas.width; x += 2) {
          const nx = (x / canvas.width) * scale + Math.cos(rotation);
          const ny = (y / canvas.height) * scale + Math.sin(rotation);

          const n = noise(nx * 5, ny * 5, time) * noiseIntensity;
          const brightness = (n + 1) * 0.5;

          const idx = (y * canvas.width + x) * 4;
          data[idx] = rgb.r * brightness;
          data[idx + 1] = rgb.g * brightness;
          data[idx + 2] = rgb.b * brightness;
          data[idx + 3] = 255;

          // Fill 2x2 block for performance
          if (x + 1 < canvas.width) {
            data[idx + 4] = data[idx];
            data[idx + 5] = data[idx + 1];
            data[idx + 6] = data[idx + 2];
            data[idx + 7] = 255;
          }
          if (y + 1 < canvas.height) {
            const idx2 = ((y + 1) * canvas.width + x) * 4;
            data[idx2] = data[idx];
            data[idx2 + 1] = data[idx + 1];
            data[idx2 + 2] = data[idx + 2];
            data[idx2 + 3] = 255;
            if (x + 1 < canvas.width) {
              data[idx2 + 4] = data[idx];
              data[idx2 + 5] = data[idx + 1];
              data[idx2 + 6] = data[idx + 2];
              data[idx2 + 7] = 255;
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [speed, scale, color, noiseIntensity, rotation]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
};

export default Silk;
