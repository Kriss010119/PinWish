export function avatarDataUrl(letter: string): string {
  const l = (letter || '?').charAt(0).toUpperCase();
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80">` +
    `<rect width="80" height="80" fill="#e60023"/>` +
    `<text x="40" y="54" font-size="40" font-family="Arial" font-weight="700" ` +
    `fill="#fff" text-anchor="middle">${l}</text></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}