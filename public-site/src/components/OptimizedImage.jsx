import React from 'react';
import { optimizeImageUrl } from '../utils/imageOptimization';

const OptimizedImage = ({ src, alt, width, className, style, ...props }) => {
  const optimizedSrc = optimizeImageUrl(src, { width });

  return (
    <img
      src={optimizedSrc}
      alt={alt}
      loading="lazy"
      className={className}
      style={style}
      {...props}
    />
  );
};

export default OptimizedImage;
