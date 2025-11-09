// Simple deterministic SVG placeholder generator based on product data
// Returns a data URL string that can be used directly as an <img src>

const hashStringToNumber = (input) => {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const pickColorFromHash = (hash) => {
  const colors = [
    '#60a5fa', // blue-400
    '#f472b6', // pink-400
    '#34d399', // green-400
    '#fbbf24', // amber-400
    '#a78bfa', // violet-400
    '#f87171', // red-400
    '#22d3ee', // cyan-400
  ];
  return colors[hash % colors.length];
};

export const generateProductPlaceholder = (product) => {
  const title = (product?.title || 'Product').toString();
  const category = (product?.category || 'Item').toString();
  const key = `${category}-${title}-${product?.id || ''}`;
  const hash = hashStringToNumber(key);
  const bg = pickColorFromHash(hash);
  const text = title.substring(0, 2).toUpperCase();

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" role="img" aria-label="${title}">
  <rect width="400" height="400" fill="${bg}"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="120" fill="white" opacity="0.9">${text}</text>
  <text x="50%" y="85%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="white" opacity="0.85">${category}</text>
</svg>`;

  const encoded = encodeURIComponent(svg)
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29');
  return `data:image/svg+xml;charset=UTF-8,${encoded}`;
};

export default generateProductPlaceholder;


