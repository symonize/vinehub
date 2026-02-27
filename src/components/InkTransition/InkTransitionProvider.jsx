import React, { createContext, useContext, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const InkTransitionContext = createContext(null);

export function InkTransitionProvider({
  children,
  phaseInDuration = 1800,
  holdDuration = 300,
  phaseOutDuration = 1800,
}) {
  const navigate = useNavigate();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const runnerRef = useRef(null);
  // Ref-based guard — synchronous, not subject to stale closure like state
  const activeRef = useRef(false);

  const registerRunner = useCallback((fn) => {
    runnerRef.current = fn;
  }, []);

  const navigateWithInk = useCallback(
    (to) => {
      console.log('[InkTransition] navigateWithInk called', { to, active: activeRef.current, hasRunner: !!runnerRef.current });
      // Synchronous guard — blocks every duplicate call including StrictMode's second invoke
      if (activeRef.current) return;
      activeRef.current = true;

      if (!runnerRef.current) {
        console.warn('[InkTransition] No runner registered — falling back to plain navigate');
        activeRef.current = false;
        navigate(to);
        return;
      }

      console.log('[InkTransition] Starting ink transition animation');
      setIsTransitioning(true);
      runnerRef.current(
        () => { console.log('[InkTransition] Swapping page'); navigate(to); },
        () => {
          console.log('[InkTransition] Transition complete');
          setIsTransitioning(false);
          activeRef.current = false;
        }
      );
    },
    [navigate]
  );

  return (
    <InkTransitionContext.Provider
      value={{
        navigateWithInk,
        isTransitioning,
        phaseInDuration,
        holdDuration,
        phaseOutDuration,
        registerRunner,
      }}
    >
      {children}
    </InkTransitionContext.Provider>
  );
}

export function useInkTransition() {
  const ctx = useContext(InkTransitionContext);
  if (!ctx) {
    return {
      navigateWithInk: () => {},
      isTransitioning: false,
      phaseInDuration: 1800,
      holdDuration: 300,
      phaseOutDuration: 1800,
      registerRunner: () => {},
    };
  }
  return ctx;
}
