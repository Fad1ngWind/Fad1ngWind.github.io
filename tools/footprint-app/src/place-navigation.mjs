const mapRevealDelay = 150;
const mapTravelDuration = 1100;
const galleryOpenDelay = 800;

export function getGalleryTransformOrigin(point, mapBounds, viewport) {
  const x = mapBounds.left + point.x;
  const y = mapBounds.top + point.y;
  if (!Number.isFinite(x) || !Number.isFinite(y) ||
    point.x < 0 || point.x > mapBounds.width || point.y < 0 || point.y > mapBounds.height ||
    x < 0 || x > viewport.width || y < 0 || y > viewport.height) return undefined;

  return `calc(50% + ${Math.round(x - viewport.width / 2)}px) calc(50% + ${Math.round(y - viewport.height / 2)}px)`;
}

export function reverseGalleryMotion(elements) {
  const animations = elements.flatMap((element) => element?.getAnimations?.() ?? []);
  if (!animations.length) return undefined;
  for (const animation of animations) animation.reverse();
  return Promise.allSettled(animations.map((animation) => animation.finished));
}

export function navigateToListedPlace(map, { center, reduceMotion, reveal, openGallery }) {
  let startTimer;
  let galleryTimer;
  const cancel = () => {
    map.off("moveend", arrive);
    map.off("movestart", cancel);
    clearTimeout(startTimer);
    clearTimeout(galleryTimer);
  };
  const arrive = () => {
    map.off("moveend", arrive);
    const { lng, lat } = map.getCenter();
    const lngDistance = Math.abs((((lng - center[0]) % 360 + 540) % 360) - 180);
    if (lngDistance > 0.0001 || Math.abs(lat - center[1]) > 0.0001) return;

    reveal();
    if (openGallery) {
      map.on("movestart", cancel);
      galleryTimer = setTimeout(() => {
        cancel();
        openGallery();
      }, galleryOpenDelay);
    }
  };
  const begin = () => {
    map.off("movestart", cancel);
    map.on("moveend", arrive);
    map.easeTo({ center, zoom: Math.max(6, map.getZoom()), duration: reduceMotion ? 0 : mapTravelDuration });
  };
  map.stop();
  if (reduceMotion) begin();
  else {
    map.on("movestart", cancel);
    startTimer = setTimeout(begin, mapRevealDelay);
  }
  return cancel;
}
