import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Intro.css';

gsap.registerPlugin(ScrollTrigger);

const VIDEO_URL = 'https://res.cloudinary.com/dvg6pbwsp/video/upload/v1772393291/13553916-uhd_3840_2160_24fps_njh7bt.mp4';

const Intro = () => {
  const wrapperRef = useRef(null);
  const scalerRef = useRef(null);
  const headingRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: 'top top',
          end: '+=150%',
          pin: true,
          scrub: true,
        },
      });

      // Frame scales up — arch window expands until burgundy exits screen
      tl.fromTo(scalerRef.current,
        { scale: 1 },
        { scale: 4, ease: 'power1.inOut', duration: 1 }
      );

      // Heading fades in at 60%, fades out at 85%
      tl.fromTo(headingRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, ease: 'power2.out', duration: 0.15 },
        0.6
      );
      tl.to(headingRef.current,
        { opacity: 0, y: -16, ease: 'power2.in', duration: 0.15 },
        0.85
      );
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="intro-wrapper" ref={wrapperRef}>
      {/* Full-bleed background video */}
      <video
        className="intro-bg-video"
        src={VIDEO_URL}
        autoPlay
        muted
        loop
        playsInline
      />

      {/* Positioning wrapper — centered, fixed to viewport bounds */}
      <div className="intro-frame-positioner">
        {/* GSAP scales this inner div only — translate stays in the positioner */}
        <div className="intro-frame-scaler" ref={scalerRef}>
          <svg
            className="intro-frame-svg"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Arch mask: white = show burgundy, black = cut through to video */}
              {/* Arch is centered in the scaler (150vw × 150vh) at 50% of each dimension */}
              <mask id="arch-mask">
                <rect width="100%" height="100%" fill="white" />
                <svg
                  x="50%"
                  y="50%"
                  width="380"
                  height="465"
                  viewBox="0 0 380 465"
                  overflow="visible"
                >
                  <g transform="translate(-190, -232.5)">
                    <path
                      d="M0 190C0 85.0659 85.0659 0 190 0C294.934 0 380 85.0659 380 190V465H0V190Z"
                      fill="black"
                    />
                  </g>
                </svg>
              </mask>
            </defs>

            {/* Burgundy rect with arch cutout + grain */}
            <rect
              width="100%"
              height="100%"
              fill="#7F3332"
              mask="url(#arch-mask)"
            />
          </svg>
        </div>
      </div>

      {/* Heading — fades in at 60% scroll progress */}
      <h1 className="intro-heading" ref={headingRef}>
        Italy Delivered
      </h1>
    </div>
  );
};

export default Intro;
