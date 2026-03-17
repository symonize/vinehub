import imageCompression from 'browser-image-compression';

const COMPRESSIBLE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const COMPRESSION_OPTIONS = {
  maxSizeMB: 2,
  maxWidthOrHeight: 2400,
  useWebWorker: true,
};

export const IMAGE_SIZES = {
  thumbnail: { width: 200 },
  logo: { width: 300 },
  preview: { width: 600 },
  full: { width: 1200 },
};

/**
 * Compress an image file before upload. Skips SVG, GIF, PDF, and other non-raster types.
 * Falls back to the original file if compression fails.
 */
export async function compressImage(file) {
  if (!COMPRESSIBLE_TYPES.includes(file.type)) {
    return file;
  }

  try {
    const compressed = await imageCompression(file, {
      ...COMPRESSION_OPTIONS,
      fileType: file.type,
    });
    return new File([compressed], file.name, { type: compressed.type });
  } catch (error) {
    console.warn('Image compression failed, using original:', error);
    return file;
  }
}

const CLOUDINARY_UPLOAD_RE = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(v\d+\/.+)$/;

/**
 * Insert Cloudinary transformation parameters into a Cloudinary URL.
 * Non-Cloudinary URLs are returned as-is. SVGs skip f_auto to preserve vectors.
 */
export function optimizeCloudinaryUrl(url, { width, quality = 'auto', format = 'auto' } = {}) {
  if (!url || typeof url !== 'string') return url;

  const match = url.match(CLOUDINARY_UPLOAD_RE);
  if (!match) return url;

  const [, base, rest] = match;
  const isSvg = rest.toLowerCase().endsWith('.svg');

  const transforms = [];
  if (!isSvg && format) transforms.push(`f_${format}`);
  if (quality) transforms.push(`q_${quality}`);
  if (width) transforms.push(`w_${width}`);

  if (transforms.length === 0) return url;

  return `${base}${transforms.join(',')}/${rest}`;
}
