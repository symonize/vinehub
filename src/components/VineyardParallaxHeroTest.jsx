import React, { useEffect, useRef } from 'react';
import './VineyardParallaxHeroTest.css';

// 6 custom vineyard layers, back → front
// Speeds spread across the Firewatch range (2–100)
const LAYERS = [
  { id: 0, speed: 2  },  // background scene — barely moves
  { id: 1, speed: 10 },  // distant mountains
  { id: 2, speed: 20 },  // aerial vineyard rows
  { id: 3, speed: 35 },  // vineyard path mid
  { id: 4, speed: 55 },  // foreground left vines
  { id: 5, speed: 80 },  // closest flanking vines
];

const VineyardParallaxHeroTest = ({ children }) => {
  const layerRefs = useRef([]);
  const contentRef = useRef(null);
  const rafRef = useRef(null);
  const scrollRef = useRef(0);

  useEffect(() => {
    const isMobile = /iPad|iPhone|iPod|Android/i.test(navigator.userAgent);

    const onScroll = () => {
      scrollRef.current = window.pageYOffset;
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        const top = scrollRef.current;

        if (!isMobile) {
          layerRefs.current.forEach((el, i) => {
            if (!el) return;
            const yPos = -(top * LAYERS[i].speed / 100);
            el.style.transform = `translate3d(0px, ${yPos}px, 0px)`;
          });
        }

        if (contentRef.current) {
          const progress = Math.min(top / 300, 1);
          contentRef.current.style.opacity = 1 - progress;
          contentRef.current.style.filter = `blur(${progress * 12}px)`;
          contentRef.current.style.pointerEvents = progress > 0.8 ? 'none' : 'auto';
        }

        rafRef.current = null;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="pvht-root">
      <div className="pvht-keyart" aria-hidden="true">
        {LAYERS.map((layer, i) => (
          <div
            key={layer.id}
            className="pvht-layer"
            ref={el => (layerRefs.current[i] = el)}
            style={{ backgroundImage: `url('/parallax-vineyard/layer${layer.id}.png')` }}
          />
        ))}
        <div className="pvht-scrim" />
      </div>

      <div className="pvht-content" ref={contentRef}>
        {children}
      </div>
    </div>
  );
};

export default VineyardParallaxHeroTest;
