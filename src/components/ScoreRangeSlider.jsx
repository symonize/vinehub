import { AnimateNumber } from "motion-plus/react";
import { useMotionValue, useSpring, useVelocity } from "motion/react";
import * as Slider from "@radix-ui/react-slider";
import { useState, useEffect, useRef } from "react";
import "./ScoreRangeSlider.css";

function scale(value, scaleBy = -0.1) {
  return value * scaleBy;
}

const ScoreRangeSlider = ({ min = 80, max = 100, value, onChange }) => {
  const [local, setLocal] = useState(value);

  const scaledMin = useMotionValue(scale(local[0]));
  const scaledMax = useMotionValue(scale(local[1]));
  const velocityMin = useVelocity(scaledMin);
  const velocityMax = useVelocity(scaledMax);
  const rotateMin = useSpring(velocityMin);
  const rotateMax = useSpring(velocityMax);

  // Sync from parent only when not dragging
  const dragging = useRef(false);
  useEffect(() => {
    if (!dragging.current) {
      setLocal(value);
    }
  }, [value]);

  useEffect(() => {
    scaledMin.set(scale(local[0]));
  }, [local[0], scaledMin]);

  useEffect(() => {
    scaledMax.set(scale(local[1]));
  }, [local[1], scaledMax]);

  const handleChange = (newValue) => {
    dragging.current = true;
    setLocal(newValue);
    onChange(newValue);
  };

  const handleCommit = () => {
    dragging.current = false;
  };

  return (
    <Slider.Root
      className="score-range-slider"
      value={local}
      onValueChange={handleChange}
      onPointerUp={handleCommit}
      onLostPointerCapture={handleCommit}
      min={min}
      max={max}
      step={1}
      minStepsBetweenThumbs={1}
    >
      <Slider.Track className="score-range-track">
        <Slider.Range className="score-range-range" />
      </Slider.Track>
      <Slider.Thumb className="score-range-thumb" aria-label="Minimum score">
        <div className="score-thumb-label-container">
          <AnimateNumber
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="score-thumb-label"
            style={{ originX: 0.5, originY: 1.5, rotate: rotateMin }}
          >
            {local[0]}
          </AnimateNumber>
        </div>
      </Slider.Thumb>
      <Slider.Thumb className="score-range-thumb" aria-label="Maximum score">
        <div className="score-thumb-label-container">
          <AnimateNumber
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="score-thumb-label"
            style={{ originX: 0.5, originY: 1.5, rotate: rotateMax }}
          >
            {local[1]}
          </AnimateNumber>
        </div>
      </Slider.Thumb>
    </Slider.Root>
  );
};

export default ScoreRangeSlider;
