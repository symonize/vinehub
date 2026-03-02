import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';

const SPRITE_URL = '/ink-transition-sprite.png';
const FRAMES = 40;
const FRAME_ASPECT = (8192 / FRAMES) / 115;

function getMaskSize() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let fw, fh;
  if (vw / vh > FRAME_ASPECT) {
    fw = vw; fh = vw / FRAME_ASPECT;
  } else {
    fh = vh; fw = fh * FRAME_ASPECT;
  }
  return { w: fw * FRAMES, h: fh };
}

export default function InkEntrance() {
  const [done, setDone] = useState(false);
  const overlayRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    if (sessionStorage.getItem('ink-entrance-done')) {
      setDone(true);
      return;
    }

    const el = overlayRef.current;
    const logo = logoRef.current;
    const { w, h } = getMaskSize();

    // Apply mask at frame 0 — fully covered
    el.style.webkitMaskImage = `url(${SPRITE_URL})`;
    el.style.maskImage = `url(${SPRITE_URL})`;
    el.style.webkitMaskSize = `${w}px ${h}px`;
    el.style.maskSize = `${w}px ${h}px`;
    el.style.webkitMaskRepeat = 'no-repeat';
    el.style.maskRepeat = 'no-repeat';
    el.style.webkitMaskPosition = '0% 50%';
    el.style.maskPosition = '0% 50%';

    function setFrame(frame) {
      const pct = (frame / (FRAMES - 1)) * 100;
      el.style.webkitMaskPosition = `${pct}% 50%`;
      el.style.maskPosition = `${pct}% 50%`;
    }

    const tl = gsap.timeline();

    // Logo fade in
    tl.to(logo, { opacity: 1, duration: 0.5, ease: 'power2.out' });
    // Hold
    tl.to(logo, { opacity: 1, duration: 0.4 });
    // Logo fade out
    tl.to(logo, { opacity: 0, duration: 0.4, ease: 'power2.in' });
    // Ink recede: frame 0 → 39
    tl.add(() => {
      const proxy = { frame: 0 };
      gsap.to(proxy, {
        frame: FRAMES - 1,
        duration: 1.8,
        ease: `steps(${FRAMES - 1})`,
        onUpdate: () => setFrame(Math.round(proxy.frame)),
        onComplete: () => {
          el.style.visibility = 'hidden';
          sessionStorage.setItem('ink-entrance-done', '1');
          setDone(true);
        },
      });
    });
  }, []);

  if (done) return null;

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        backgroundColor: '#722f37',
      }}
    >
      <div
        ref={logoRef}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0,
          color: 'white',
          fontFamily: "'moret-variable', Georgia, serif",
          fontSize: 'clamp(2.5rem, 6vw, 5rem)',
          letterSpacing: '0.04em',
          whiteSpace: 'nowrap',
          userSelect: 'none',
        }}
      >
        VinoHub
      </div>
    </div>
  );
}
