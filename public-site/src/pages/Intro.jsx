import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import DitherWave from '../components/react-bits/DitherWave';
import './Intro.css';

gsap.registerPlugin(ScrollTrigger);

const VIDEO_URL = 'https://res.cloudinary.com/dvg6pbwsp/video/upload/v1772393291/13553916-uhd_3840_2160_24fps_njh7bt.mp4';

function buildFrameClipPath(w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const aw = 380, ah = 465;
  const ax = cx - aw / 2;
  const ay = cy - ah / 2;
  const r = aw / 2;
  const outer = `M0,0 L${w},0 L${w},${h} L0,${h} Z`;
  const archBottom = ay + ah;
  const archTop = ay + r;
  const arch =
    `M${ax},${archBottom} ` +
    `L${ax + aw},${archBottom} ` +
    `L${ax + aw},${archTop} ` +
    `A${r},${r} 0 0,0 ${ax},${archTop} ` +
    `Z`;
  return `${outer} ${arch}`;
}

// ── Dev control panel ──────────────────────────────────────────────────────
const DEFAULTS = {
  primaryColor:   '#5b2427',
  secondaryColor: '#722f37',
  tertiaryColor:  '#61292e',
  speed:          0.47,
  intensity:      0.3,
  scale:          3,
  downScale:      0.95,
};

const Row = ({ label, children }) => (
  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
    <span style={{ fontSize: 11, color: '#ccc', whiteSpace: 'nowrap' }}>{label}</span>
    {children}
  </label>
);

const Slider = ({ value, min, max, step = 0.01, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(Number(e.target.value))}
      style={{ width: 110, accentColor: '#7F3332' }}
    />
    <span style={{ fontSize: 11, color: '#fff', minWidth: 32, textAlign: 'right' }}>{value}</span>
  </div>
);

const ColorPicker = ({ value, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
    <input type="color" value={value} onChange={e => onChange(e.target.value)}
      style={{ width: 32, height: 24, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }} />
    <span style={{ fontSize: 11, color: '#fff', fontFamily: 'monospace' }}>{value}</span>
  </div>
);

const DitherControls = ({ props, setProps }) => {
  const [open, setOpen] = useState(true);

  const set = (key) => (val) => setProps(p => ({ ...p, [key]: val }));

  return (
    <div style={{
      position: 'fixed', bottom: 20, left: 20, zIndex: 9999,
      background: 'rgba(15,10,10,0.88)', backdropFilter: 'blur(8px)',
      border: '1px solid rgba(127,51,50,0.4)', borderRadius: 10,
      padding: open ? '12px 14px' : '8px 14px',
      width: 260, fontFamily: 'system-ui, sans-serif',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: open ? 12 : 0 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#c4736e', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Dither Controls
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setProps(DEFAULTS)}
            style={{ fontSize: 10, color: '#999', background: 'none', border: '1px solid #444', borderRadius: 4, padding: '2px 6px', cursor: 'pointer' }}
          >Reset</button>
          <button
            onClick={() => setOpen(o => !o)}
            style={{ fontSize: 13, color: '#999', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}
          >{open ? '−' : '+'}</button>
        </div>
      </div>

      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {/* Colors */}
          <div style={{ borderBottom: '1px solid #333', paddingBottom: 9, display: 'flex', flexDirection: 'column', gap: 7 }}>
            <Row label="Primary"><ColorPicker value={props.primaryColor} onChange={set('primaryColor')} /></Row>
            <Row label="Secondary"><ColorPicker value={props.secondaryColor} onChange={set('secondaryColor')} /></Row>
            <Row label="Tertiary"><ColorPicker value={props.tertiaryColor} onChange={set('tertiaryColor')} /></Row>
          </div>
          {/* Animation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <Row label="Speed"><Slider value={props.speed} min={0} max={3} onChange={set('speed')} /></Row>
            <Row label="Intensity"><Slider value={props.intensity} min={0} max={3} onChange={set('intensity')} /></Row>
            <Row label="Scale"><Slider value={props.scale} min={1} max={20} step={0.5} onChange={set('scale')} /></Row>
            <Row label="Downscale"><Slider value={props.downScale} min={0.1} max={2} onChange={set('downScale')} /></Row>
          </div>
          {/* Copy button */}
          <button
            onClick={() => {
              const code = `primaryColor="${props.primaryColor}"\nsecondaryColor="${props.secondaryColor}"\ntertiaryColor="${props.tertiaryColor}"\nspeed={${props.speed}}\nintensity={${props.intensity}}\nscale={${props.scale}}\ndownScale={${props.downScale}}`;
              navigator.clipboard.writeText(code);
            }}
            style={{
              marginTop: 2, fontSize: 11, color: '#c4736e', background: 'rgba(127,51,50,0.15)',
              border: '1px solid rgba(127,51,50,0.3)', borderRadius: 5, padding: '5px 0',
              cursor: 'pointer', width: '100%',
            }}
          >Copy Props</button>
        </div>
      )}
    </div>
  );
};
// ───────────────────────────────────────────────────────────────────────────

const Intro = () => {
  const wrapperRef = useRef(null);
  const scalerRef = useRef(null);
  const ditherWrapRef = useRef(null);
  const headingRef = useRef(null);
  const subheadingRef = useRef(null);
  const archSvgRef = useRef(null);

  const [ditherProps, setDitherProps] = useState(DEFAULTS);

  useEffect(() => {
    function applyClip() {
      if (!scalerRef.current || !ditherWrapRef.current) return;
      const { width, height } = scalerRef.current.getBoundingClientRect();
      if (!width || !height) return;
      ditherWrapRef.current.style.clipPath = `path('${buildFrameClipPath(width, height)}')`;

      // Update SVG arch overlay to match scaler dimensions
      if (archSvgRef.current) {
        const cx = width / 2, cy = height / 2;
        const aw = 380, ah = 465, r = aw / 2;
        const ax = cx - aw / 2, ay = cy - ah / 2;
        const archBottom = ay + ah, archTop = ay + r;
        const d =
          `M${ax},${archBottom} ` +
          `L${ax + aw},${archBottom} ` +
          `L${ax + aw},${archTop} ` +
          `A${r},${r} 0 0,0 ${ax},${archTop} ` +
          `Z`;
        archSvgRef.current.setAttribute('viewBox', `0 0 ${width} ${height}`);
        archSvgRef.current.querySelector('path').setAttribute('d', d);
      }
    }

    applyClip();
    window.addEventListener('resize', applyClip);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: 'top top',
          end: '+=200%',
          pin: true,
          scrub: true,
          onUpdate: (self) => {
            window.dispatchEvent(new CustomEvent('intro-progress', { detail: self.progress }));
          },
        },
      });

      // Phase 1 (0–0.3): arch zooms in to fill screen
      tl.fromTo(scalerRef.current,
        { scale: 1 },
        { scale: 4, ease: 'power1.inOut', duration: 0.3 }
      );

      // Phase 2 (0.15–0.3): VinoHub fades in
      tl.fromTo(headingRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, ease: 'power2.out', duration: 0.1 },
        0.15
      );
      // Phase 3 (0.3–0.4): VinoHub fades out
      tl.to(headingRef.current,
        { opacity: 0, y: -16, ease: 'power2.in', duration: 0.08 },
        0.32
      );

      // Phase 4 (0.45–0.6): "Explore a world of wine" fades in
      tl.fromTo(subheadingRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, ease: 'power2.out', duration: 0.1 },
        0.45
      );
      // Phase 5 (0.62–0.72): subheading fades out
      tl.to(subheadingRef.current,
        { opacity: 0, y: -16, ease: 'power2.in', duration: 0.08 },
        0.62
      );

      // Phase 6 (0.72–0.9): dither frame fades out, revealing full video
      tl.to(ditherWrapRef.current,
        { opacity: 0, ease: 'power1.inOut', duration: 0.18 },
        0.72
      );
    }, wrapperRef);

    return () => {
      window.removeEventListener('resize', applyClip);
      ctx.revert();
    };
  }, []);

  return (
    <div className="intro-wrapper" ref={wrapperRef}>
      <video
        className="intro-bg-video"
        src={VIDEO_URL}
        autoPlay
        muted
        loop
        playsInline
      />

      <div className="intro-frame-positioner">
        <div className="intro-frame-scaler" ref={scalerRef}>
          <div className="intro-dither-wrap" ref={ditherWrapRef}>
            <DitherWave
              width="100%"
              height="100%"
              primaryColor={ditherProps.primaryColor}
              secondaryColor={ditherProps.secondaryColor}
              tertiaryColor={ditherProps.tertiaryColor}
              speed={ditherProps.speed}
              intensity={ditherProps.intensity}
              scale={ditherProps.scale}
              downScale={ditherProps.downScale}
              quality="medium"
              className="intro-dither-fill"
            />
          </div>
          {/* Arch stroke overlay */}
          <svg
            ref={archSvgRef}
            className="intro-arch-svg"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path fill="none" stroke="#d4c5a9" strokeWidth="3" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
      </div>

      <h1 className="intro-heading" ref={headingRef}>
        VinoHub
      </h1>

      <h2 className="intro-subheading" ref={subheadingRef}>
        Explore a world of wine
      </h2>

      <div className="intro-scroll-hint" aria-hidden="true">
        {'Scroll'.split('').map((char, i) => (
          <span key={i} className="intro-scroll-letter" style={{ '--i': i }}>{char}</span>
        ))}
      </div>

      {/* <DitherControls props={ditherProps} setProps={setDitherProps} /> */}
    </div>
  );
};

export default Intro;
