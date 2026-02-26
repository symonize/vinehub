import React, { createContext, useContext, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TransitionContext = createContext(null);

export function TransitionProvider({ children }) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('idle'); // 'idle' | 'in' | 'out'
  const pendingPath = useRef(null);
  const resolveRef = useRef(null);

  // Called by Header links instead of navigate()
  function transitionTo(path) {
    if (phase !== 'idle') return;
    pendingPath.current = path;
    setPhase('in'); // panels sweep in
  }

  // Called by PageTransition when panels are fully covering the screen
  function onCovered() {
    navigate(pendingPath.current);
    setPhase('out'); // panels sweep out
  }

  // Called by PageTransition when panels have fully left the screen
  function onDone() {
    setPhase('idle');
  }

  return (
    <TransitionContext.Provider value={{ phase, transitionTo, onCovered, onDone }}>
      {children}
    </TransitionContext.Provider>
  );
}

export function useTransition() {
  const ctx = useContext(TransitionContext);
  if (!ctx) {
    // Fallback when used outside provider (e.g. during HMR)
    return { phase: 'idle', transitionTo: () => {}, onCovered: () => {}, onDone: () => {} };
  }
  return ctx;
}
