const continents = new Set(["Asia", "NorthAmerica", "Europe", "Africa", "Oceania", "SouthAmerica", "Antarctica"]);
const photoRoot = "/footprint/photos/";
const scenicNameSuffix = /(?:旅游风景区|风景旅游区|风景名胜区|旅游景区|风景区|旅游区|景区)(?=\s*(?:（[^（）]+）|\([^()]+\))?\s*$)/u;
const chinesePlaceDisplayNames = new Map([
  ["cn-poi-5a-150", ["湄洲岛妈祖文化旅游区", "湄洲岛"]],
  ["cn-poi-5a-144", ["土楼南靖（土楼（永定·南靖）旅游景区）", "南靖土楼"]],
  ["cn-poi-5a-141", ["土楼永定（土楼（永定·南靖）旅游景区）", "永定土楼"]],
  ["jp-13113", ["澁谷区", "涩谷区"]],
]);

export const getChineseRegionDisplayName = (name) => name.replace(/^(香港|澳门)特别行政区$/u, "$1");

/** @param {{ id: string, country: string, name: string, zhName: string }} place @param {boolean} isChinese */
export function getPlaceDisplayName(place, isChinese) {
  if (!isChinese) return place.name;
  const nameOverride = chinesePlaceDisplayNames.get(place.id);
  if (nameOverride?.[0] === place.zhName) return nameOverride[1];
  const isAdministrativePlace = (place.country === "China" && /^cn-\d{6}$/.test(place.id)) ||
    (place.country === "Japan" && /^jp-(?:city-)?\d{5}$/.test(place.id));
  if (isAdministrativePlace && place.zhName.length > 1 && place.zhName.endsWith("市")) {
    return place.zhName.slice(0, -1);
  }
  return getChineseRegionDisplayName(place.zhName).replace(scenicNameSuffix, (suffix, index) => index > 0 ? "" : suffix);
}

function isLocalPhoto(path) {
  return typeof path === "string" && path.startsWith(photoRoot) &&
    new URL(path, "https://footprint.invalid").pathname.startsWith(photoRoot);
}

export function validatePlaces(entries) {
  if (!Array.isArray(entries)) throw new TypeError("Footprint data must be an array");
  const ids = new Set();
  for (const place of entries) {
    if (!place || !["id", "name", "zhName", "country", "zhCountry"].every((key) => typeof place[key] === "string" && place[key].trim()) ||
        !continents.has(place.continent) || !Number.isFinite(place.lat) || Math.abs(place.lat) > 90 ||
        !Number.isFinite(place.lng) || Math.abs(place.lng) > 180 || ids.has(place.id) ||
        !["note", "zhNote"].every((key) => typeof place[key] === "string") ||
        (place.region != null && !["label", "zhLabel"].every((key) => typeof place.region[key] === "string"))) {
      throw new TypeError("Invalid footprint place");
    }
    ids.add(place.id);
    if (place.photos !== undefined && (!Array.isArray(place.photos) || !place.photos.every((photo) =>
      photo && isLocalPhoto(photo.src) && (photo.previewSrc === undefined || isLocalPhoto(photo.previewSrc)) &&
      typeof photo.caption === "string" && typeof photo.zhCaption === "string"))) {
      throw new TypeError("Invalid footprint photo");
    }
  }
  return entries;
}

export async function readPlaces() {
  const response = await fetch("/footprint/places.json");
  if (!response.ok) throw new Error("Unable to load footprint data");
  return validatePlaces(await response.json());
}
