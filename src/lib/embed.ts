// Standard WPR iframe pattern (as in wpr-assessment-equity): post the document
// height to the parent page whenever it changes so the WordPress embed can size
// the iframe — no scrollbar inside a scrollbar. Only the height crosses the
// frame boundary, so "*" as target origin is fine; the parent checks origin.
// Host listener:
//   window.addEventListener('message', (e) => {
//     if (e.data?.type === 'wpr-embed-height' && e.data.id === 'wpr-auto-loan')
//       iframe.style.height = e.data.height + 'px';
//   });
export function initEmbedHeight(id = 'wpr-auto-loan'): void {
  if (window.parent === window) return; // not embedded

  let last = 0;
  const post = () => {
    const height = Math.ceil(document.documentElement.scrollHeight);
    if (height === last) return;
    last = height;
    window.parent.postMessage({ type: 'wpr-embed-height', id, height }, '*');
  };

  new ResizeObserver(post).observe(document.documentElement);
  window.addEventListener('load', post);
  post();
}
