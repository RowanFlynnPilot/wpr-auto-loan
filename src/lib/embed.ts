// Standard WPR iframe pattern (as in wpr-assessment-equity): post the document
// height to the parent page whenever it changes so the WordPress embed can size
// the iframe — no scrollbar inside a scrollbar. Only the height crosses the
// frame boundary, so "*" as target origin is fine; the parent checks origin.
// The WordPress embed snippet (listener, clipboard permission, and the
// ?host= hand-off that makes shared links point at the article) is in
// CLAUDE.md under "WordPress embed".
export function initEmbedHeight(id = 'wpr-auto-loan'): void {
  if (window.parent === window) return; // not embedded

  let last = 0;
  const post = () => {
    // body.scrollHeight, not documentElement's: the latter is clamped to the
    // viewport (the iframe could never shrink), and ResizeObserver on the html
    // element does not fire when content grows it.
    const height = Math.ceil(document.body.scrollHeight);
    if (height === last) return;
    last = height;
    window.parent.postMessage({ type: 'wpr-embed-height', id, height }, '*');
  };

  new ResizeObserver(post).observe(document.body);
  window.addEventListener('load', post);
  post();
  // ResizeObserver callbacks ride the rendering-frame loop, which background
  // tabs don't run, and React's first commit lands after the load event — so
  // also post on a short timer, same as the other WPR widgets.
  for (const ms of [200, 800, 2000]) setTimeout(post, ms);
}
