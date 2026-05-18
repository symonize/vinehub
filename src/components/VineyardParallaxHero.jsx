import React, { useEffect, useRef } from 'react';
import './VineyardParallaxHero.css';

// Exact speed values from firewatchgame.com data-speed attributes.
// yPos = -(scrollTop * speed / 100)
// Swap image src values with your own vineyard layer PNGs when ready.
const LAYERS = [
  { id: 0, speed: 2   },
  { id: 1, speed: 5   },
  { id: 2, speed: 11  },
  { id: 3, speed: 16  },
  { id: 4, speed: 26  },
  { id: 5, speed: 36  },
  { id: 6, speed: 49  },
  { id: 7, speed: 69  },
  { id: 8, speed: 100 },
];

const VineyardParallaxHero = ({ children }) => {
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

        // Parallax layers
        if (!isMobile) {
          layerRefs.current.forEach((el, i) => {
            if (!el) return;
            const yPos = -(top * LAYERS[i].speed / 100);
            el.style.transform = `translate3d(0px, ${yPos}px, 0px)`;
          });
        }

        // Fade + blur content over first 300px of scroll
        if (contentRef.current) {
          const fadeRange = 300;
          const progress = Math.min(top / fadeRange, 1);
          const opacity = 1 - progress;
          const blur = progress * 12; // px
          contentRef.current.style.opacity = opacity;
          contentRef.current.style.filter = `blur(${blur}px)`;
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
    <div className="pvh-root">
      {/* Fixed parallax layers — DOM order = z-order (0 = back, 8 = front) */}
      <div className="pvh-keyart" aria-hidden="true">
        {LAYERS.map((layer, i) => (
          <div
            key={layer.id}
            className="pvh-layer"
            ref={el => (layerRefs.current[i] = el)}
            style={{ backgroundImage: `url('/parallax/parallax${layer.id}.png')` }}
          />
        ))}
        <div className="pvh-scrim" />
      </div>

      {/* Content sits above the fixed layer stack */}
      <div className="pvh-content" ref={contentRef}>
        {children}
      </div>
    </div>
  );
};

export default VineyardParallaxHero;
