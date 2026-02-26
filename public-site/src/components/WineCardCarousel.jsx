import { useRef, useState, useEffect, useCallback } from 'react';
import './WineCardCarousel.css';

const CARD_WIDTH = 220;
const LERP = 0.10;

export default function WineCardCarousel({ items = [], onCenterChange }) {
  const [rotation, setRotation] = useState(0);
  const targetRotation = useRef(0);
  const currentRotation = useRef(0);
  const rafRef = useRef(null);
  const drag = useRef({ active: false, startX: 0, startRot: 0 });

  const n = items.length;
  const angleStep = n > 0 ? 360 / n : 0;
  const radius = n > 0 ? Math.round(CARD_WIDTH / (2 * Math.tan(Math.PI / n))) : 400;

  // Which item is closest to the front (rotation = 0)
  const centerIndex = n > 0
    ? Math.round(((-currentRotation.current % 360) + 360) / angleStep) % n
    : 0;

  // Notify parent on center change
  const lastCenter = useRef(-1);
  useEffect(() => {
    if (items.length && onCenterChange && centerIndex !== lastCenter.current) {
      lastCenter.current = centerIndex;
      onCenterChange({ text: items[centerIndex]?.text, winery: items[centerIndex]?.winery });
    }
  }, [centerIndex, items, onCenterChange]);

  // Reset on items change
  useEffect(() => {
    targetRotation.current = 0;
    currentRotation.current = 0;
    setRotation(0);
  }, [items]);

  // LERP animation loop
  useEffect(() => {
    const tick = () => {
      const delta = targetRotation.current - currentRotation.current;
      if (Math.abs(delta) > 0.01) {
        currentRotation.current += delta * LERP;
        setRotation(currentRotation.current);
      } else {
        currentRotation.current = targetRotation.current;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Snap to nearest card
  const snapToNearest = useCallback(() => {
    const rounded = Math.round(currentRotation.current / angleStep) * angleStep;
    targetRotation.current = rounded;
  }, [angleStep]);

  // Click a card to rotate it to front
  const rotateTo = useCallback((index) => {
    const current = Math.round(currentRotation.current / angleStep) * angleStep;
    const target = -index * angleStep;
    // Find shortest path
    let diff = ((target - current) % 360 + 540) % 360 - 180;
    targetRotation.current = current + diff;
  }, [angleStep]);

  // Mouse drag
  const onMouseDown = useCallback((e) => {
    drag.current = { active: true, startX: e.clientX, startRot: targetRotation.current };
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    targetRotation.current = drag.current.startRot + dx * 0.3;
  }, []);

  const onMouseUp = useCallback(() => {
    if (!drag.current.active) return;
    drag.current.active = false;
    snapToNearest();
  }, [snapToNearest]);

  // Touch drag
  const onTouchStart = useCallback((e) => {
    drag.current = { active: true, startX: e.touches[0].clientX, startRot: targetRotation.current };
  }, []);

  const onTouchMove = useCallback((e) => {
    if (!drag.current.active) return;
    const dx = e.touches[0].clientX - drag.current.startX;
    targetRotation.current = drag.current.startRot + dx * 0.3;
  }, []);

  const onTouchEnd = useCallback(() => {
    drag.current.active = false;
    snapToNearest();
  }, [snapToNearest]);

  return (
    <div
      className="cg-scene"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="cg-ring"
        style={{
          transform: `translateZ(${-radius}px) rotateY(${rotation}deg)`,
        }}
      >
        {items.map((item, i) => {
          const angle = i * angleStep;
          const isFront = i === centerIndex;
          return (
            <div
              key={i}
              className={`wine-card${isFront ? ' wine-card--center' : ''}`}
              style={{
                transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
              }}
              onClick={() => rotateTo(i)}
            >
              <div className="wine-card__img-wrap">
                <img
                  src={item.image}
                  alt={item.text}
                  className="wine-card__img"
                  draggable={false}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
