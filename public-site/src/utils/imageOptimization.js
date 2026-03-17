const CLOUDINARY_UPLOAD_RE = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(v\d+\/.+)$/;

export const IMAGE_SIZES = {
  thumbnail: { width: 200 },
  logo: { width: 300 },
  card: { width: 400 },
  preview: { width: 600 },
  hero: { width: 1200 },
};

/**
 * Insert Cloudinary transformation parameters into a Cloudinary URL.
 * Non-Cloudinary URLs returned as-is. SVGs skip f_auto to preserve vectors.
 */
export function optimizeImageUrl(url, { width, quality = 'auto', format = 'auto' } = {}) {
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
