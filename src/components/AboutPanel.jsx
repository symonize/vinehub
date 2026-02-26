import React, { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import './AboutPanel.css';

export default function AboutPanel({ isOpen, onClose }) {
  const overlayRef  = useRef(null);
  const panelRef    = useRef(null);
  const closeBtnRef = useRef(null);
  const contentRef  = useRef(null);
  const isAnimating = useRef(false);

  // Open
  useEffect(() => {
    if (!isOpen) return;
    if (isAnimating.current) return;
    isAnimating.current = true;

    const overlay  = overlayRef.current;
    const panel    = panelRef.current;
    const closeBtn = closeBtnRef.current;
    const main     = document.querySelector('#root > main');
    const items    = contentRef.current?.querySelectorAll('.ap-item') || [];

    // Reset
    gsap.set(panel,    { x: '100%' });
    gsap.set(overlay,  { autoAlpha: 0 });
    gsap.set(closeBtn, { autoAlpha: 0 });
    gsap.set(items,    { y: 28, autoAlpha: 0 });

    const tl = gsap.timeline({ onComplete: () => { isAnimating.current = false; } });

    tl.to(overlay, { autoAlpha: 1, duration: 0.4, ease: 'none' })
      .to(panel,    { x: '0%', duration: 0.75, ease: 'power3.out' }, '<')
      .to(main,     { x: '-4%', duration: 0.75, ease: 'power3.out' }, '<')
      .to(closeBtn, { autoAlpha: 1, duration: 0.35, ease: 'none' }, '-=0.3')
      .to(items,    { y: 0, autoAlpha: 1, duration: 0.6, ease: 'power2.out', stagger: 0.1 }, '-=0.2');

  }, [isOpen]);

  // Close
  const handleClose = useCallback(() => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    const overlay  = overlayRef.current;
    const panel    = panelRef.current;
    const closeBtn = closeBtnRef.current;
    const main     = document.querySelector('#root > main');
    const items    = contentRef.current?.querySelectorAll('.ap-item') || [];

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimating.current = false;
        onClose();
      }
    });

    tl.to(closeBtn, { autoAlpha: 0, duration: 0.2, ease: 'none' })
      .to(items,     { y: 16, autoAlpha: 0, duration: 0.3, ease: 'power2.in', stagger: 0.04 }, '<')
      .to(panel,     { x: '100%', duration: 0.65, ease: 'power3.in' }, '-=0.1')
      .to(overlay,   { autoAlpha: 0, duration: 0.4, ease: 'none' }, '-=0.3')
      .to(main,      { x: '0%', duration: 0.65, ease: 'power3.inOut' }, '-=0.55');
  }, [onClose]);

  // Escape key
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape' && isOpen) handleClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, handleClose]);

  return (
    <>
      {/* Dim overlay — clicking it closes the panel */}
      <div
        ref={overlayRef}
        className="ap-overlay"
        style={{ opacity: 0, visibility: 'hidden' }}
        onClick={handleClose}
      />

      {/* Close button (X) */}
      <button
        ref={closeBtnRef}
        className="ap-close"
        style={{ opacity: 0, visibility: 'hidden' }}
        onClick={handleClose}
        aria-label="Close about panel"
      >
        <span />
        <span />
      </button>

      {/* Sliding panel */}
      <div ref={panelRef} className="ap-panel" style={{ transform: 'translateX(100%)' }}>
        <div ref={contentRef} className="ap-content">

          <p className="ap-item ap-eyebrow">About VineHub</p>

          <h2 className="ap-item ap-heading">Connecting the world's finest wineries with the trade</h2>

          <p className="ap-item ap-body">
            VineHub is a curated platform for wine professionals — importers, sommeliers,
            and retailers — offering direct access to exceptional producers from across
            Italy, France, Spain, and beyond.
          </p>

          <div className="ap-item ap-divider" />

          <h3 className="ap-item ap-subheading">Our Mission</h3>
          <p className="ap-item ap-body">
            We believe great wine tells a story of place, people, and tradition.
            Our mission is to make those stories accessible to trade buyers and
            build lasting relationships between producers and the market.
          </p>

          <div className="ap-item ap-divider" />

          <h3 className="ap-item ap-subheading">Trade Tools</h3>
          <p className="ap-item ap-body">
            From shelf talkers to sales sheets, VineHub equips your team with
            beautiful, print-ready materials — generated in seconds.
          </p>

          <div className="ap-item ap-divider" />

          <div className="ap-item ap-contact">
            <span className="ap-contact-label">Get in touch</span>
            <a href="mailto:hello@vinehub.com" className="ap-contact-link">hello@vinehub.com</a>
          </div>

        </div>
      </div>
    </>
  );
}
