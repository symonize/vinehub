import React, { useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { useInkTransition } from './InkTransitionProvider';

const SPRITE_URL = '/ink-transition-sprite.png';
const FRAMES = 40;
const FRAME_ASPECT = (8192 / FRAMES) / 115; // ≈ 1.781

function getMaskSize() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let fw, fh;
  if (vw / vh > FRAME_ASPECT) {
    fw = vw;
    fh = vw / FRAME_ASPECT;
  } else {
    fh = vh;
    fw = fh * FRAME_ASPECT;
  }
  return { w: fw * FRAMES, h: fh };
}

export default function InkTransitionCanvas() {
  const { phaseInDuration, holdDuration, phaseOutDuration, registerRunner } =
    useInkTransition();
  const overlayRef = useRef(null);

  const runTransition = useCallback(
    (onSwapPage, onComplete) => {
      const el = overlayRef.current;
      const { w, h } = getMaskSize();
      const phaseInSec = phaseInDuration / 1000;
      const phaseOutSec = phaseOutDuration / 1000;
      const holdSec = holdDuration / 1000;

      // Show overlay and apply mask image/size via direct style (GSAP can't tween string CSS mask props)
      el.style.visibility = 'visible';
      el.style.pointerEvents = 'auto';
      el.style.webkitMaskImage = `url(${SPRITE_URL})`;
      el.style.maskImage = `url(${SPRITE_URL})`;
      el.style.webkitMaskSize = `${w}px ${h}px`;
      el.style.maskSize = `${w}px ${h}px`;
      el.style.webkitMaskRepeat = 'no-repeat';
      el.style.maskRepeat = 'no-repeat';

      function setFrame(frame) {
        const pct = (frame / (FRAMES - 1)) * 100;
        el.style.webkitMaskPosition = `${pct}% 50%`;
        el.style.maskPosition = `${pct}% 50%`;
      }

      // Snap to frame FRAMES-2 synchronously so ink appears immediately on click,
      // then GSAP animates the rest (skipping the already-rendered first step)
      setFrame(FRAMES - 2);

      const proxy = { frame: FRAMES - 2 };

      // Phase 1: ink covers screen (frame FRAMES-2 → 0)
      gsap.to(proxy, {
        frame: 0,
        duration: phaseInSec,
        ease: `steps(${FRAMES - 1})`,
        onUpdate: () => setFrame(Math.round(proxy.frame)),
        onComplete: () => {
          // Fully covered — swap page partway through hold period
          gsap.delayedCall(holdSec / 2, onSwapPage);

          // Phase 2: reveal new page (frame 0 → FRAMES-1) after hold
          gsap.to(proxy, {
            frame: FRAMES - 1,
            duration: phaseOutSec,
            delay: holdSec,
            ease: `steps(${FRAMES - 1})`,
            onUpdate: () => setFrame(Math.round(proxy.frame)),
            onComplete: () => {
              el.style.visibility = 'hidden';
              el.style.pointerEvents = 'none';
              onComplete();
            },
          });
        },
      });
    },
    [phaseInDuration, holdDuration, phaseOutDuration]
  );

  useEffect(() => {
    console.log('[InkTransition] Registering runner');
    registerRunner(runTransition);
  }, [registerRunner, runTransition]);

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        visibility: 'hidden',
        pointerEvents: 'none',
        backgroundColor: '#FAF6ED',
      }}
    />
  );
}
