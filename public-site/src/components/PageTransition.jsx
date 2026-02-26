import React, { useEffect, useRef } from 'react';
import { useTransition } from '../context/TransitionContext';
import './PageTransition.css';

export default function PageTransition() {
  const { phase, onCovered, onDone } = useTransition();
  const coveredFired = useRef(false);
  const doneFired = useRef(false);

  useEffect(() => {
    if (phase === 'in') {
      coveredFired.current = false;
      doneFired.current = false;
    }
    if (phase === 'idle') {
      coveredFired.current = false;
      doneFired.current = false;
    }
  }, [phase]);

  // Panel 1 (burgundy) animation end — screen is now covered, switch route
  function handlePanel1AnimEnd(e) {
    if (phase === 'in' && e.animationName === 'curtain-in' && !coveredFired.current) {
      coveredFired.current = true;
      onCovered();
    }
  }

  // Panel 2 (cream) animation end on 'out' — transition complete
  function handlePanel2AnimEnd(e) {
    if (phase === 'out' && e.animationName === 'curtain-out' && !doneFired.current) {
      doneFired.current = true;
      onDone();
    }
  }

  if (phase === 'idle') return null;

  return (
    <div className="page-transition-root">
      <div
        className={`pt-panel pt-panel-1 pt-panel-${phase}`}
        onAnimationEnd={handlePanel1AnimEnd}
      />
      <div
        className={`pt-panel pt-panel-2 pt-panel-${phase}`}
        onAnimationEnd={handlePanel2AnimEnd}
      />
    </div>
  );
}
