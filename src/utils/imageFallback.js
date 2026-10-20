/**
 * onError handler for an <img>: swap to a bundled image once, so a broken or
 * blocked external link never shows a broken-image icon.
 */
export const fallbackTo = (localSrc) => (event) => {
  const img = event.currentTarget;
  if (img.dataset.fallback) return;
  img.dataset.fallback = "1";
  img.src = localSrc;
};
