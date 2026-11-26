/* Adapted with permission from chenjb1997/chenjb1997.github.io (src/pages/Footprint.tsx). */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createPortal } from "react-dom";
import maplibregl, {
  type CircleLayerSpecification,
  type GeoJSONSource,
  type LngLatLike,
  type Map as MapLibreMap,
  type MapLayerMouseEvent,
  type Popup,
  type StyleSpecification,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { FeatureCollection, Point } from "geojson";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Home,
  MapPin,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import { feature } from "topojson-client";
import landAtlas from "world-atlas/land-110m.json";
import { getPlaceDisplayName } from "./places.mjs";


export type FootprintPhoto = {
  src: string;
  previewSrc?: string;
  caption: string;
  zhCaption: string;
};

const minPhotoZoom = 1;
const maxPhotoZoom = 6;

type PhotoOffset = { x: number; y: number };

export type FootprintPlace = {
  id: string;
  name: string;
  zhName: string;
  country: string;
  zhCountry: string;
  continent: ContinentKey;
  region?: PlaceRegion;
  lat: number;
  lng: number;
  note: string;
  zhNote: string;
  photos?: FootprintPhoto[];
};


type ContinentKey =
  | "Asia"
  | "NorthAmerica"
  | "Europe"
  | "Africa"
  | "Oceania"
  | "SouthAmerica"
  | "Antarctica";

const countryStyles: Record<
  FootprintPlace["country"],
  { color: string; soft: string; label: string; zhLabel: string }
> = {
  China: { color: "#2563eb", soft: "#dbeafe", label: "China", zhLabel: "中国" },
  Japan: { color: "#dc2626", soft: "#fee2e2", label: "Japan", zhLabel: "日本" },
  "South Korea": {
    color: "#0284c7",
    soft: "#e0f2fe",
    label: "South Korea",
    zhLabel: "韩国",
  },
  Canada: { color: "#16a34a", soft: "#dcfce7", label: "Canada", zhLabel: "加拿大" },
  USA: { color: "#7c3aed", soft: "#ede9fe", label: "United States", zhLabel: "美国" },
  Spain: { color: "#ea580c", soft: "#ffedd5", label: "Spain", zhLabel: "西班牙" },
  Egypt: { color: "#0891b2", soft: "#cffafe", label: "Egypt", zhLabel: "埃及" },
  Russia: { color: "#b91c1c", soft: "#fee2e2", label: "Russia", zhLabel: "俄罗斯" },
  Turkey: { color: "#9333ea", soft: "#f3e8ff", label: "Turkey", zhLabel: "土耳其" },
  Germany: { color: "#0f766e", soft: "#ccfbf1", label: "Germany", zhLabel: "德国" },
  Mexico: { color: "#ca8a04", soft: "#fef9c3", label: "Mexico", zhLabel: "墨西哥" },
  Italy: { color: "#059669", soft: "#d1fae5", label: "Italy", zhLabel: "意大利" },
  "Vatican City": {
    color: "#a16207",
    soft: "#fef3c7",
    label: "Vatican City",
    zhLabel: "梵蒂冈",
  },
  France: { color: "#4f46e5", soft: "#e0e7ff", label: "France", zhLabel: "法国" },
  Switzerland: {
    color: "#e11d48",
    soft: "#ffe4e6",
    label: "Switzerland",
    zhLabel: "瑞士",
  },
};

const continentStyles: Record<
  ContinentKey,
  { label: string; zhLabel: string; accent: string; soft: string }
> = {
  Asia: { label: "Asia", zhLabel: "亚洲", accent: "#2563eb", soft: "#eff6ff" },
  NorthAmerica: {
    label: "North America",
    zhLabel: "北美洲",
    accent: "#16a34a",
    soft: "#f0fdf4",
  },
  Europe: { label: "Europe", zhLabel: "欧洲", accent: "#ea580c", soft: "#fff7ed" },
  Africa: { label: "Africa", zhLabel: "非洲", accent: "#0891b2", soft: "#ecfeff" },
  Oceania: { label: "Oceania", zhLabel: "大洋洲", accent: "#7c3aed", soft: "#f5f3ff" },
  SouthAmerica: {
    label: "South America",
    zhLabel: "南美洲",
    accent: "#db2777",
    soft: "#fdf2f8",
  },
  Antarctica: {
    label: "Antarctica",
    zhLabel: "南极洲",
    accent: "#64748b",
    soft: "#f8fafc",
  },
};

const continentOrder: ContinentKey[] = [
  "Asia",
  "NorthAmerica",
  "Europe",
  "Africa",
  "Oceania",
  "SouthAmerica",
  "Antarctica",
];


const getContinent = (place: FootprintPlace) => place.continent;

type PlaceRegion = { label: string; zhLabel: string };
const getPlaceRegion = (place: FootprintPlace) => place.region ?? null;
const getCountryStyle = (place: FootprintPlace) => (Object.hasOwn(countryStyles, place.country) ? countryStyles[place.country] : {
  color: "#64748b", soft: "#f1f5f9", label: place.country, zhLabel: place.zhCountry,
});


const northAmericaCountryOrder: Partial<Record<FootprintPlace["country"], number>> = {
  USA: 0,
  Canada: 1,
  Mexico: 2,
};

const regionUnitLabels: Partial<
  Record<
    FootprintPlace["country"],
    { label: string; zhLabel: string }
  >
> = {
  China: { label: "provinces", zhLabel: "省份" },
  USA: { label: "states", zhLabel: "州" },
  Japan: { label: "prefectures", zhLabel: "都道府县" },
  Canada: { label: "provinces", zhLabel: "省" },
};

const placeCountLabel = (count: number, isChinese: boolean) =>
  isChinese ? `${count} 城市 / 地点` : `${count} ${count === 1 ? "place" : "places"}`;


type MapCenter = [number, number];
type FootprintPlaceFeatureProperties = {
  id: string;
  color: string;
  label: string;
  zhLabel: string;
};

type FootprintPlacesGeoJson = FeatureCollection<
  Point,
  FootprintPlaceFeatureProperties
>;

const initialCenter: MapCenter = [155, 31];
const initialZoom = 0.7;
const compactInitialCenter: MapCenter = [6, 28];
const compactInitialZoom = 0.65;
const footprintPlacesSourceId = "footprint-places";
const footprintPlacesLayerId = "footprint-place-dots";
const footprintFallbackBackgroundLayerId = "footprint-map-fallback";
const firstFootprintOverlayLayerId = "southern-tibet-disputed-boundary-mask";
const openFreeMapNoLabelsStyleUrl =
  "/footprint/map-styles/openfreemap-positron-no-labels.json";

const normalizeMapRotation = (angle: number) => {
  const normalized = ((angle % 360) + 360) % 360;
  return normalized > 180 ? normalized - 360 : normalized;
};

const footprintMapStyle: StyleSpecification = {
  version: 8,
  sources: {
    footprintLand: {
      type: "geojson",
      data: feature(landAtlas, landAtlas.objects.land),
      attribution: "Natural Earth",
    },
    southernTibetBoundaryLine: {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: [
                [91.1134, 27.8461],
                [91.1553, 27.8943],
                [91.1611, 27.9677],
                [91.2164, 27.9893],
                [91.2518, 27.9704],
                [91.3098, 28.0578],
                [91.3364, 28.0611],
                [91.4653, 28.0027],
                [91.4866, 27.9375],
                [91.5552, 27.8887],
                [91.6115, 27.8915],
                [91.6192, 27.8567],
                [91.5558, 27.8511],
                [91.5444, 27.8204],
                [91.6165, 27.817],
                [91.6422, 27.7666],
                [91.6225, 27.6925],
                [91.5622, 27.6274],
                [91.5848, 27.5404],
                [91.7189, 27.4674],
                [91.8393, 27.4897],
                [91.9468, 27.4642],
                [92.0104, 27.4747],
                [92.126, 27.2732],
                [92.0713, 27.2377],
                [92.0282, 27.1218],
                [92.0438, 27.0528],
                [92.0759, 27.0413],
                [92.1248, 26.9601],
                [92.1091, 26.8548],
                [92.5956, 26.9493],
                [92.6656, 26.9524],
                [92.803, 26.8953],
                [92.9093, 26.9144],
                [93.1113, 26.8802],
                [93.5678, 26.938],
                [93.8421, 27.0458],
                [93.8622, 27.1872],
                [94.2775, 27.5812],
                [94.5251, 27.5961],
                [94.8859, 27.7431],
                [95.0154, 27.829],
                [95.2866, 27.94],
                [95.3968, 28.1423],
                [95.7402, 28.2753],
                [95.8742, 28.2976],
                [95.9078, 28.2416],
                [96.0247, 28.1919],
                [96.2742, 28.2287],
                [96.2957, 28.1425],
                [96.4001, 28.1202],
                [96.3964, 28.1489],
                [96.4517, 28.1524],
                [96.4998, 28.0673],
                [96.5684, 28.0612],
                [96.6828, 27.9497],
                [96.7889, 27.9294],
                [96.81, 27.8904],
                [96.9737, 27.8606],
                [97.0085, 27.8078],
                [97.0551, 27.8027],
                [97.0628, 27.7426],
                [97.0935, 27.7378],
                [97.1015, 27.7796],
                [97.2512, 27.8904],
                [97.3092, 27.9131],
                [97.3241, 27.8805],
                [97.3863, 27.886],
                [97.3778, 27.9669],
                [97.413, 28.0136],
                [97.3788, 28.0311],
                [97.3784, 28.0626],
                [97.3206, 28.0543],
                [97.3063, 28.0731],
                [97.3411, 28.1058],
                [97.3508, 28.2369],
                [97.3993, 28.2395],
                [97.4229, 28.2975],
                [97.4606, 28.2681],
                [97.4816, 28.2791],
                [97.4702, 28.3041],
                [97.512, 28.3155],
                [97.4847, 28.386],
                [97.5214, 28.4448],
                [97.5081, 28.4949],
                [97.5696, 28.5415],
                [97.5991, 28.517],
                [97.6859, 28.5199],
                [97.7369, 28.4658],
                [97.7381, 28.3964],
                [97.8009, 28.3267],
                [97.9078, 28.3633],
                [98.0205, 28.2534],
                [98.0083, 28.2138],
                [98.0334, 28.1873],
                [98.0899, 28.1954],
                [98.1395, 28.1424],
              ],
            },
          },
        ],
      },
    },
    southernTibetDisputedBoundaryMask: {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: [
                [96.9352, 27.6539],
                [96.9848, 27.6673],
                [97.0322, 27.7496],
                [97.0881, 27.7355],
                [97.1131, 27.7868],
                [97.2428, 27.897],
                [97.2979, 27.9163],
                [97.3602, 27.8731],
                [97.3791, 27.8921],
                [97.3617, 27.9658],
                [97.3946, 28.0135],
                [97.3549, 28.0666],
                [97.3123, 28.0624],
                [97.361, 28.2041],
                [97.2841, 28.2315],
                [97.238, 28.2937],
                [97.1269, 28.3616],
                [97.078, 28.3712],
                [97.0157, 28.3205],
                [96.9246, 28.3531],
                [96.8897, 28.3858],
                [96.8595, 28.4837],
                [96.7598, 28.5194],
                [96.7624, 28.5527],
                [96.7147, 28.61],
                [96.687, 28.5903],
                [96.6455, 28.6195],
                [96.6307, 28.7347],
                [96.6035, 28.7807],
                [96.574, 28.7832],
                [96.5902, 28.8186],
                [96.5238, 28.8624],
                [96.5238, 28.9358],
                [96.447, 28.9429],
                [96.4333, 29.0101],
                [96.3641, 29.0427],
                [96.3657, 29.0811],
                [96.307, 29.1256],
                [96.3195, 29.1691],
                [96.2605, 29.2176],
                [96.2653, 29.2454],
                [96.1527, 29.2965],
                [96.1426, 29.3396],
                [96.113, 29.3566],
                [95.9669, 29.3746],
                [95.8775, 29.3146],
                [95.8411, 29.3212],
                [95.8389, 29.3531],
                [95.7574, 29.3226],
                [95.7371, 29.298],
                [95.7432, 29.2257],
                [95.7088, 29.204],
                [95.6983, 29.2247],
                [95.648, 29.2104],
                [95.6056, 29.236],
                [95.5957, 29.188],
                [95.505, 29.1936],
                [95.5078, 29.126],
                [95.4597, 29.1372],
                [95.4331, 29.1902],
                [95.4133, 29.1267],
                [95.3054, 29.1406],
                [95.2651, 29.0714],
                [95.2145, 29.1082],
                [95.1039, 29.0974],
                [95.0979, 29.143],
                [94.9974, 29.1748],
                [95.0218, 29.1276],
                [94.8842, 29.1791],
                [94.8073, 29.1649],
                [94.8037, 29.2084],
                [94.7517, 29.2297],
                [94.7349, 29.287],
                [94.6972, 29.3154],
                [94.6286, 29.2955],
                [94.5397, 29.2187],
                [94.4569, 29.2131],
                [94.4481, 29.1834],
                [94.3932, 29.1846],
                [94.3789, 29.1541],
                [94.295, 29.1513],
                [94.2769, 29.0939],
                [94.3664, 29.0259],
                [94.274, 28.9679],
                [94.2577, 28.9302],
                [94.1798, 28.9369],
                [94.1359, 28.8905],
                [94.0595, 28.8738],
                [94.0215, 28.8394],
                [94.0197, 28.7935],
                [93.9701, 28.8171],
                [93.9158, 28.7734],
                [93.9196, 28.7411],
                [93.8972, 28.7561],
                [93.7913, 28.736],
                [93.7147, 28.6647],
                [93.6394, 28.6547],
                [93.6242, 28.6868],
                [93.5219, 28.6734],
                [93.5035, 28.6296],
                [93.3992, 28.5655],
                [93.3896, 28.5311],
                [93.3293, 28.5216],
                [93.2752, 28.5586],
                [93.2505, 28.5493],
                [93.1496, 28.4468],
                [93.1708, 28.4294],
                [93.1486, 28.3666],
                [92.945, 28.2595],
                [92.9329, 28.2054],
                [92.6777, 28.1513],
                [92.6569, 28.077],
                [92.7319, 28.0546],
                [92.7305, 27.98],
                [92.647, 27.9124],
                [92.5993, 27.9146],
                [92.581, 27.8808],
                [92.4776, 27.8365],
                [92.4618, 27.7942],
                [92.4264, 27.803],
                [92.4218, 27.8357],
                [92.3247, 27.7975],
                [92.294, 27.8723],
                [92.2444, 27.8878],
                [92.0573, 27.7799],
                [91.9785, 27.7791],
                [91.9654, 27.739],
                [91.9248, 27.7166],
                [91.8735, 27.7221],
                [91.8297, 27.7905],
                [91.7789, 27.7709],
                [91.7445, 27.8],
                [91.7259, 27.7799],
                [91.6111, 27.8418],
                [91.5656, 27.8187],
                [91.6298, 27.8093],
                [91.6392, 27.7356],
                [91.5701, 27.6502],
              ],
            },
          },
        ],
      },
    },
  },
  layers: [
    {
      id: footprintFallbackBackgroundLayerId,
      type: "background",
      paint: {
        "background-color": "#f2f3f0",
      },
    },
    {
      id: "footprint-land",
      type: "fill",
      source: "footprintLand",
      paint: { "fill-color": "#f1efe9", "fill-outline-color": "#c7c9c0" },
    },
    {
      id: firstFootprintOverlayLayerId,
      type: "line",
      source: "southernTibetDisputedBoundaryMask",
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#f2f3f0",
        "line-opacity": 1,
        "line-blur": 0.4,
        "line-width": [
          "interpolate",
          ["linear"],
          ["zoom"],
          0,
          2.8,
          3,
          3.2,
          5,
          3.8,
          8,
          4.8,
          12,
          6.2,
        ],
      },
    },
    {
      id: "southern-tibet-boundary-line-base",
      type: "line",
      source: "southernTibetBoundaryLine",
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#f2f3f0",
        "line-opacity": 1,
        "line-blur": 0.2,
        "line-width": [
          "interpolate",
          ["linear"],
          ["zoom"],
          3,
          2.2,
          5,
          2.4,
          8,
          3.1,
          12,
          4.4,
        ],
      },
    },
    {
      id: "southern-tibet-boundary-line-solid",
      type: "line",
      source: "southernTibetBoundaryLine",
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#bfc3c0",
        "line-opacity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          0,
          0.24,
          3,
          0.4,
          6,
          0.62,
          9,
          0.76,
          12,
          0.82,
        ],
        "line-blur": 0,
        "line-width": [
          "interpolate",
          ["linear"],
          ["zoom"],
          3,
          0.6,
          6,
          0.8,
          9,
          1.05,
          12,
          1.55,
        ],
      },
    },
  ],
};

const placeToLngLat = (place: FootprintPlace): LngLatLike => [place.lng, place.lat];

const footprintPlacesLayer: CircleLayerSpecification = {
  id: footprintPlacesLayerId,
  type: "circle",
  source: footprintPlacesSourceId,
  paint: {
    "circle-radius": [
      "interpolate",
      ["linear"],
      ["zoom"],
      1,
      4,
      4,
      5.5,
      8,
      7,
    ],
    "circle-color": ["get", "color"],
    "circle-opacity": 0.96,
    "circle-stroke-color": "#ffffff",
    "circle-stroke-opacity": 1,
    "circle-stroke-width": [
      "interpolate",
      ["linear"],
      ["zoom"],
      1,
      1.3,
      4,
      1.8,
      8,
      2.2,
    ],
  },
};

const createFootprintPlacesGeoJson = (places: FootprintPlace[]): FootprintPlacesGeoJson => ({
  type: "FeatureCollection",
  features: places.map((place) => ({
    type: "Feature",
    id: place.id,
    properties: {
      id: place.id,
      color: getCountryStyle(place).color,
      label: getPlaceDisplayName(place, false),
      zhLabel: getPlaceDisplayName(place, true),
    },
    geometry: {
      type: "Point",
      coordinates: [place.lng, place.lat],
    },
  })),
});

const getInitialMapView = (container?: HTMLElement | null) => {
  const width = container?.clientWidth ?? window.innerWidth;
  return width < 640
    ? { center: compactInitialCenter, zoom: compactInitialZoom }
    : { center: initialCenter, zoom: initialZoom };
};

const Footprint = ({ places }: { places: FootprintPlace[] }) => {
  const isChinese = document.documentElement.lang.startsWith("zh");
  const [mapUnavailable, setMapUnavailable] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<FootprintPlace | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoLoadError, setPhotoLoadError] = useState(false);
  const [photoZoom, setPhotoZoom] = useState(minPhotoZoom);
  const [isPhotoDragging, setIsPhotoDragging] = useState(false);
  const [photoNaturalSize, setPhotoNaturalSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [expandedCountries, setExpandedCountries] = useState<Record<string, boolean>>({});
  const [mapRotation, setMapRotation] = useState(0);
  const [mapReadyToken, setMapReadyToken] = useState(0);
  const mapShellRef = useRef<HTMLDivElement | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const initialMapStyleReadyRef = useRef(false);
  const placeTooltipRef = useRef<Popup | null>(null);
  const photoViewportRef = useRef<HTMLDivElement | null>(null);
  const photoImageRef = useRef<HTMLImageElement | null>(null);
  const photoZoomRef = useRef(minPhotoZoom);
  const photoOffsetRef = useRef<PhotoOffset>({ x: 0, y: 0 });
  const photoDragRef = useRef({
    active: false,
    pointerId: -1,
    startClientX: 0,
    startClientY: 0,
    startX: 0,
    startY: 0,
  });

  const clampPhotoOffset = useCallback(
    (zoom: number, offset: PhotoOffset): PhotoOffset => {
      const viewport = photoViewportRef.current;
      const image = photoImageRef.current;
      if (!viewport || !image || zoom <= minPhotoZoom) {
        return { x: 0, y: 0 };
      }

      const maxX = Math.max(
        0,
        (image.clientWidth * zoom - viewport.clientWidth) / 2,
      );
      const maxY = Math.max(
        0,
        (image.clientHeight * zoom - viewport.clientHeight) / 2,
      );
      return {
        x: Math.min(maxX, Math.max(-maxX, offset.x)),
        y: Math.min(maxY, Math.max(-maxY, offset.y)),
      };
    },
    [],
  );

  const updatePhotoTransform = useCallback(
    (zoom: number, offset: PhotoOffset, syncZoomState = true) => {
      const boundedZoom = Math.min(
        maxPhotoZoom,
        Math.max(minPhotoZoom, zoom),
      );
      const boundedOffset = clampPhotoOffset(boundedZoom, offset);

      photoZoomRef.current = boundedZoom;
      photoOffsetRef.current = boundedOffset;
      if (photoImageRef.current) {
        photoImageRef.current.style.transform = `translate3d(${boundedOffset.x}px, ${boundedOffset.y}px, 0) scale(${boundedZoom})`;
      }
      if (syncZoomState) {
        setPhotoZoom(boundedZoom);
      }
    },
    [clampPhotoOffset],
  );

  const resetPhotoView = useCallback(() => {
    photoDragRef.current.active = false;
    setIsPhotoDragging(false);
    updatePhotoTransform(minPhotoZoom, { x: 0, y: 0 });
  }, [updatePhotoTransform]);

  const reclampPhotoView = useCallback(() => {
    updatePhotoTransform(
      photoZoomRef.current,
      photoOffsetRef.current,
      false,
    );
  }, [updatePhotoTransform]);

  const zoomPhotoFromCenter = useCallback(
    (factor: number) => {
      const oldZoom = photoZoomRef.current;
      const nextZoom = Math.min(
        maxPhotoZoom,
        Math.max(minPhotoZoom, oldZoom * factor),
      );
      const ratio = nextZoom / oldZoom;
      setAutoPlay(false);
      updatePhotoTransform(nextZoom, {
        x: photoOffsetRef.current.x * ratio,
        y: photoOffsetRef.current.y * ratio,
      });
    },
    [updatePhotoTransform],
  );

  const handlePhotoPointerDown = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (
      photoZoomRef.current <= minPhotoZoom ||
      photoLoading ||
      photoLoadError ||
      (event.target as HTMLElement).closest("button") ||
      (event.pointerType === "mouse" && event.button !== 0)
    ) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    photoDragRef.current = {
      active: true,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: photoOffsetRef.current.x,
      startY: photoOffsetRef.current.y,
    };
    setAutoPlay(false);
    setIsPhotoDragging(true);
  };

  const handlePhotoPointerMove = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    const drag = photoDragRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    updatePhotoTransform(
      photoZoomRef.current,
      {
        x: drag.startX + event.clientX - drag.startClientX,
        y: drag.startY + event.clientY - drag.startClientY,
      },
      false,
    );
  };

  const finishPhotoDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (
      !photoDragRef.current.active ||
      photoDragRef.current.pointerId !== event.pointerId
    ) {
      return;
    }

    photoDragRef.current.active = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsPhotoDragging(false);
  };

  const displayName = (place: FootprintPlace) =>
    getPlaceDisplayName(place, isChinese);
  const displayCountry = (place: FootprintPlace) =>
    isChinese ? place.zhCountry : countryStyles[place.country].label;
  const displayNote = (place: FootprintPlace) =>
    isChinese ? place.zhNote : place.note;

  const focusPlace = useCallback((place: FootprintPlace) => {
    mapRef.current?.panTo(placeToLngLat(place), { duration: 0 });
    setPhotoIndex(0);
    setAutoPlay(false);
    setPhotoLoading(Boolean(place.photos?.length));
    setPhotoLoadError(false);
    setSelectedPlace(place);
  }, []);

  const closeModal = () => {
    setSelectedPlace(null);
    setPhotoIndex(0);
    setAutoPlay(false);
    setPhotoLoading(false);
    setPhotoLoadError(false);
  };

  const countryCount = useMemo(
    () => new Set(places.map((place) => place.country)).size,
    [places],
  );

  const cityGroups = useMemo(
    () =>
      continentOrder
        .map((continent) => {
          const continentPlaces = places.filter(
            (place) => getContinent(place) === continent,
          );
          const countries = Array.from(
            new Set(continentPlaces.map((place) => place.country)),
          ).map((country) => {
            const countryPlaces = continentPlaces.filter(
              (place) => place.country === country,
            );
            const regionGroups = countryPlaces.reduce<
              Array<{
                key: string;
                region: PlaceRegion | null;
                places: FootprintPlace[];
              }>
            >((groups, place) => {
              const region = getPlaceRegion(place);
              const key = region ? `${region.label}-${region.zhLabel}` : "all";
              const existing = groups.find((group) => group.key === key);
              if (existing) {
                existing.places.push(place);
              } else {
                groups.push({ key, region, places: [place] });
              }
              return groups;
            }, []);

            return { country, places: countryPlaces, regionGroups };
          });
          if (continent === "NorthAmerica") {
            countries.sort(
              (a, b) =>
                (northAmericaCountryOrder[a.country] ?? 99) -
                (northAmericaCountryOrder[b.country] ?? 99),
            );
          }

          return { continent, countries };
        }),
    [places],
  );

  useEffect(() => {
    const mapContainer = mapContainerRef.current;
    if (!mapContainer || mapRef.current) {
      return;
    }

    let map: MapLibreMap | null = null;
    let initialResizeTimer: number | undefined;
    let optionalBaseMapTimer: number | undefined;
    let optionalBaseMapSlowTimer: number | undefined;
    let attributionCollapseTimer: number | undefined;
    let hasScheduledAttributionCollapse = false;
    let handleInitialStyleLoad: (() => void) | undefined;
    let handleOpenFreeMapSourceData: (() => void) | undefined;
    const openFreeMapAbortController = new AbortController();
    const mapStartTimer = window.setTimeout(() => {
      if (!mapContainer.isConnected || mapRef.current) {
        return;
      }

      const initialView = getInitialMapView(mapContainer);
      try {
        map = new maplibregl.Map({
          container: mapContainer,
          style: footprintMapStyle,
          center: initialView.center,
          zoom: initialView.zoom,
          minZoom: 0.7,
          maxZoom: 18,
          attributionControl: false,
          bearing: 0,
          dragRotate: false,
          pitchWithRotate: false,
          renderWorldCopies: true,
        });
      } catch {
        setMapUnavailable(true);
        return;
      }
      map.addControl(new maplibregl.AttributionControl());
      map.touchZoomRotate.disableRotation();

      const activeMap = map;
      mapRef.current = map;
      initialMapStyleReadyRef.current = false;
      mapContainer.setAttribute("data-base-map-status", "fallback");
      placeTooltipRef.current = new maplibregl.Popup({
        anchor: "bottom",
        closeButton: false,
        closeOnClick: false,
        className: "footprint-place-tooltip",
        offset: 12,
      });

      let openFreeMapSourceIds: string[] = [];

      const markOpenFreeMapReady = () => {
        if (
          mapRef.current !== activeMap ||
          openFreeMapSourceIds.length === 0 ||
          !openFreeMapSourceIds.every(
            (sourceId) =>
              activeMap.getSource(sourceId) &&
              activeMap.isSourceLoaded(sourceId),
          )
        ) {
          return;
        }

        mapContainer.setAttribute("data-base-map-status", "ready");
        if (optionalBaseMapSlowTimer !== undefined) {
          window.clearTimeout(optionalBaseMapSlowTimer);
          optionalBaseMapSlowTimer = undefined;
        }
        if (!hasScheduledAttributionCollapse) {
          hasScheduledAttributionCollapse = true;
          attributionCollapseTimer = window.setTimeout(() => {
            mapContainer
              .querySelector<HTMLElement>(
                ".maplibregl-ctrl-attrib.maplibregl-compact.maplibregl-compact-show .maplibregl-ctrl-attrib-button",
              )
              ?.click();
          }, 5000);
        }
      };

      const addOptionalOpenFreeMap = async () => {
        const addedLayerIds: string[] = [];
        const addedSourceIds: string[] = [];

        try {
          const response = await fetch(openFreeMapNoLabelsStyleUrl, {
            signal: openFreeMapAbortController.signal,
          });
          if (!response.ok) {
            throw new Error(`OpenFreeMap style returned ${response.status}`);
          }

          const openFreeMapStyle = (await response.json()) as StyleSpecification;
          if (
            mapRef.current !== activeMap ||
            openFreeMapAbortController.signal.aborted
          ) {
            return;
          }

          mapContainer.setAttribute("data-base-map-status", "loading");
          for (const [sourceId, source] of Object.entries(
            openFreeMapStyle.sources,
          )) {
            if (!activeMap.getSource(sourceId)) {
              activeMap.addSource(sourceId, source);
              addedSourceIds.push(sourceId);
            }
          }

          const firstOverlayLayerId = activeMap.getLayer(
            firstFootprintOverlayLayerId,
          )
            ? firstFootprintOverlayLayerId
            : activeMap.getLayer(footprintPlacesLayerId)
              ? footprintPlacesLayerId
              : undefined;
          for (const layer of openFreeMapStyle.layers) {
            if (layer.type !== "symbol" && layer.type !== "background" && !activeMap.getLayer(layer.id)) {
              activeMap.addLayer(layer, firstOverlayLayerId);
              addedLayerIds.push(layer.id);
            }
          }

          openFreeMapSourceIds = Object.keys(openFreeMapStyle.sources);
          optionalBaseMapSlowTimer = window.setTimeout(() => {
            if (
              mapRef.current === activeMap &&
              !openFreeMapSourceIds.every(
                (sourceId) =>
                  activeMap.getSource(sourceId) &&
                  activeMap.isSourceLoaded(sourceId),
              )
            ) {
              mapContainer.setAttribute("data-base-map-status", "fallback");
            }
          }, 8000);
          markOpenFreeMapReady();
        } catch (error) {
          if (openFreeMapAbortController.signal.aborted) {
            return;
          }

          for (const layerId of addedLayerIds.reverse()) {
            if (activeMap.getLayer(layerId)) {
              activeMap.removeLayer(layerId);
            }
          }
          for (const sourceId of addedSourceIds.reverse()) {
            if (activeMap.getSource(sourceId)) {
              activeMap.removeSource(sourceId);
            }
          }
          openFreeMapSourceIds = [];
          mapContainer.setAttribute("data-base-map-status", "fallback");
          console.warn("Unable to load the optional OpenFreeMap basemap", error);
        }
      };

      handleOpenFreeMapSourceData = markOpenFreeMapReady;
      handleInitialStyleLoad = () => {
        if (mapRef.current !== activeMap) {
          return;
        }

        initialMapStyleReadyRef.current = true;
        setMapReadyToken((value) => value + 1);
        optionalBaseMapTimer = window.setTimeout(() => {
          void addOptionalOpenFreeMap();
        }, 0);
      };
      activeMap.on("load", handleInitialStyleLoad);
      activeMap.on("sourcedata", handleOpenFreeMapSourceData);

      initialResizeTimer = window.setTimeout(() => {
        if (mapRef.current !== map || !map) {
          return;
        }

        map.resize();
        const resizedInitialView = getInitialMapView(mapContainer);
        map.jumpTo({
          bearing: 0,
          center: resizedInitialView.center,
          zoom: resizedInitialView.zoom,
        });
      }, 0);
    }, 120);

    return () => {
      window.clearTimeout(mapStartTimer);
      openFreeMapAbortController.abort();
      if (initialResizeTimer !== undefined) {
        window.clearTimeout(initialResizeTimer);
      }
      if (optionalBaseMapTimer !== undefined) {
        window.clearTimeout(optionalBaseMapTimer);
      }
      if (optionalBaseMapSlowTimer !== undefined) {
        window.clearTimeout(optionalBaseMapSlowTimer);
      }
      if (attributionCollapseTimer !== undefined) {
        window.clearTimeout(attributionCollapseTimer);
      }
      placeTooltipRef.current?.remove();
      placeTooltipRef.current = null;
      if (map) {
        if (handleInitialStyleLoad) {
          map.off("load", handleInitialStyleLoad);
        }
        if (handleOpenFreeMapSourceData) {
          map.off("sourcedata", handleOpenFreeMapSourceData);
        }
        map.remove();
      }
      if (mapRef.current === map) {
        mapRef.current = null;
        initialMapStyleReadyRef.current = false;
      }
      mapContainer.removeAttribute("data-base-map-status");
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const mapContainer = mapContainerRef.current;
    if (!map || !mapContainer) {
      return;
    }

    const placesGeoJson = createFootprintPlacesGeoJson(places);
    let areLayerEventsAttached = false;
    let initialLayerTimer: number | undefined;

    const handlePlaceClick = (event: MapLayerMouseEvent) => {
      const placeId = event.features?.[0]?.properties?.id;
      if (typeof placeId !== "string") {
        return;
      }

      const place = places.find((candidate) => candidate.id === placeId);
      if (place) {
        focusPlace(place);
      }
    };

    const showPlaceTooltip = (event: MapLayerMouseEvent) => {
      const properties = event.features?.[0]?.properties as
        | Partial<FootprintPlaceFeatureProperties>
        | undefined;
      const label = isChinese ? properties?.zhLabel : properties?.label;
      if (!label) {
        return;
      }

      placeTooltipRef.current
        ?.setLngLat(event.lngLat)
        .setText(label)
        .addTo(map);
    };

    const handlePlaceMouseEnter = (event: MapLayerMouseEvent) => {
      map.getCanvas().style.cursor = "pointer";
      showPlaceTooltip(event);
    };

    const handlePlaceMouseMove = (event: MapLayerMouseEvent) => {
      showPlaceTooltip(event);
    };

    const handlePlaceMouseLeave = () => {
      map.getCanvas().style.cursor = "";
      placeTooltipRef.current?.remove();
    };

    const attachLayerEvents = () => {
      if (areLayerEventsAttached || !map.getLayer(footprintPlacesLayerId)) {
        return;
      }

      map.on("click", footprintPlacesLayerId, handlePlaceClick);
      map.on("mouseenter", footprintPlacesLayerId, handlePlaceMouseEnter);
      map.on("mousemove", footprintPlacesLayerId, handlePlaceMouseMove);
      map.on("mouseleave", footprintPlacesLayerId, handlePlaceMouseLeave);
      areLayerEventsAttached = true;
    };

    const upsertPlaceLayer = () => {
      if (mapRef.current !== map || !initialMapStyleReadyRef.current) {
        return;
      }

      const existingSource = map.getSource(footprintPlacesSourceId) as
        | GeoJSONSource
        | undefined;

      if (existingSource) {
        existingSource.setData(placesGeoJson);
      } else {
        map.addSource(footprintPlacesSourceId, {
          type: "geojson",
          data: placesGeoJson,
          promoteId: "id",
        });
      }

      if (!map.getLayer(footprintPlacesLayerId)) {
        map.addLayer(footprintPlacesLayer);
      }

      mapContainer.setAttribute(
        "data-marker-count",
        String(placesGeoJson.features.length),
      );
      attachLayerEvents();
    };

    map.on("load", upsertPlaceLayer);
    if (initialMapStyleReadyRef.current) {
      initialLayerTimer = window.setTimeout(upsertPlaceLayer, 0);
    }

    return () => {
      if (initialLayerTimer !== undefined) {
        window.clearTimeout(initialLayerTimer);
      }

      if (mapRef.current !== map) {
        return;
      }

      map.off("load", upsertPlaceLayer);

      if (areLayerEventsAttached) {
        map.off("click", footprintPlacesLayerId, handlePlaceClick);
        map.off("mouseenter", footprintPlacesLayerId, handlePlaceMouseEnter);
        map.off("mousemove", footprintPlacesLayerId, handlePlaceMouseMove);
        map.off("mouseleave", footprintPlacesLayerId, handlePlaceMouseLeave);
      }

      placeTooltipRef.current?.remove();

      if (map.getLayer(footprintPlacesLayerId)) {
        map.removeLayer(footprintPlacesLayerId);
      }

      if (map.getSource(footprintPlacesSourceId)) {
        map.removeSource(footprintPlacesSourceId);
      }

      mapContainer.removeAttribute("data-marker-count");
    };
  }, [focusPlace, isChinese, mapReadyToken, places]);

  const zoomMap = (delta: number) => {
    const map = mapRef.current;
    if (!map) {
      return;
    }
    const nextZoom = Math.min(map.getMaxZoom(), Math.max(map.getMinZoom(), map.getZoom() + delta));
    map.easeTo({ center: map.getCenter(), duration: 350, zoom: nextZoom });
  };

  const resetMap = () => {
    const initialView = getInitialMapView(mapContainerRef.current);
    setMapRotation(0);
    mapRef.current?.jumpTo({
      bearing: 0,
      center: initialView.center,
      zoom: initialView.zoom,
    });
  };

  const rotateMap = (delta: number) => {
    const nextRotation = normalizeMapRotation(mapRotation + delta);
    setMapRotation(nextRotation);
    mapRef.current?.easeTo({ bearing: nextRotation, duration: 180 });
  };

  const toggleMapFullscreen = () => {
    setIsMapFullscreen((current) => !current);
    window.setTimeout(() => mapRef.current?.resize(), 100);
  };

  const toggleCountryGroup = (countryGroupKey: string) => {
    setExpandedCountries((current) => ({
      ...current,
      [countryGroupKey]: !current[countryGroupKey],
    }));
  };

  const mapShellClass = isMapFullscreen
    ? "footprint-map-shell footprint-map-shell-fullscreen bg-white"
    : "footprint-map-shell relative bg-white";
  const mapShellStyle: CSSProperties = isMapFullscreen
    ? {
        position: "fixed" as const,
        inset: 0,
        zIndex: 1100,
        width: "100vw",
        height: "100dvh",
      }
    : {};
  const mapCanvasStyle = isMapFullscreen ? { height: "100dvh" } : undefined;
  const fullscreenButtonClass = [
    "inline-flex h-9 items-center justify-center border-l border-slate-100 text-slate-700 transition-colors hover:bg-sky-50 hover:text-sky-700",
    isMapFullscreen ? "w-auto gap-1.5 px-3" : "w-9",
  ].join(" ");

  const selectedPhotos = selectedPlace?.photos ?? [];
  const currentPhoto = selectedPhotos[photoIndex];
  const hasMultiplePhotos = selectedPhotos.length > 1;

  useEffect(() => {
    resetPhotoView();
    setPhotoNaturalSize(null);
  }, [photoIndex, resetPhotoView, selectedPlace?.id]);

  useEffect(() => {
    const viewport = photoViewportRef.current;
    if (!viewport || !currentPhoto) {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      if (
        photoLoading ||
        photoLoadError ||
        (event.target as HTMLElement).closest("button")
      ) {
        return;
      }

      event.preventDefault();
      let delta = event.deltaY;
      if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
        delta *= 16;
      } else if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
        delta *= viewport.clientHeight;
      }

      const oldZoom = photoZoomRef.current;
      const nextZoom = Math.min(
        maxPhotoZoom,
        Math.max(minPhotoZoom, oldZoom * Math.exp(-delta * 0.0015)),
      );
      if (Math.abs(nextZoom - oldZoom) < 0.001) {
        return;
      }

      const bounds = viewport.getBoundingClientRect();
      const anchorX = event.clientX - bounds.left - bounds.width / 2;
      const anchorY = event.clientY - bounds.top - bounds.height / 2;
      const ratio = nextZoom / oldZoom;
      setAutoPlay(false);
      updatePhotoTransform(nextZoom, {
        x: anchorX - (anchorX - photoOffsetRef.current.x) * ratio,
        y: anchorY - (anchorY - photoOffsetRef.current.y) * ratio,
      });
    };

    viewport.addEventListener("wheel", handleWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", handleWheel);
  }, [currentPhoto, photoLoadError, photoLoading, updatePhotoTransform]);

  useEffect(() => {
    const viewport = photoViewportRef.current;
    if (!viewport || !selectedPlace) {
      return;
    }

    const observer = new ResizeObserver(() => {
      window.requestAnimationFrame(reclampPhotoView);
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [reclampPhotoView, selectedPlace]);

  const showNextPhoto = useCallback(() => {
    setPhotoLoading(true);
    setPhotoLoadError(false);
    setPhotoIndex((current) =>
      selectedPhotos.length ? (current + 1) % selectedPhotos.length : 0,
    );
  }, [selectedPhotos.length]);

  const showPreviousPhoto = () => {
    setPhotoLoading(true);
    setPhotoLoadError(false);
    setPhotoIndex((current) =>
      selectedPhotos.length
        ? (current - 1 + selectedPhotos.length) % selectedPhotos.length
        : 0,
    );
  };

  useEffect(() => {
    if (!selectedPlace || !autoPlay || selectedPhotos.length <= 1) {
      return;
    }

    const timer = window.setInterval(showNextPhoto, 4500);
    return () => window.clearInterval(timer);
  }, [autoPlay, selectedPhotos.length, selectedPlace, showNextPhoto]);

  useEffect(() => {
    const photos = selectedPlace?.photos;
    if (!photos || photos.length <= 1) {
      return;
    }

    const adjacentIndexes = [
      (photoIndex - 1 + photos.length) % photos.length,
      (photoIndex + 1) % photos.length,
    ];
    const prefetchedImages = [...new Set(adjacentIndexes)]
      .filter((index) => index !== photoIndex)
      .map((index) => {
        const image = new Image();
        image.decoding = "async";
        image.fetchPriority = "low";
        image.src = photos[index].src;
        return image;
      });

    return () => {
      prefetchedImages.forEach((image) => {
        image.src = "";
      });
    };
  }, [photoIndex, selectedPlace]);

  useEffect(() => {
    if (!selectedPlace && !isMapFullscreen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMapFullscreen, selectedPlace]);

  useEffect(() => {
    if (!isMapFullscreen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !selectedPlace) {
        setIsMapFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMapFullscreen, selectedPlace]);

  useEffect(() => {
    document.body.classList.toggle("footprint-map-is-fullscreen", isMapFullscreen);
    window.setTimeout(() => mapRef.current?.resize(), 100);

    return () => {
      document.body.classList.remove("footprint-map-is-fullscreen");
    };
  }, [isMapFullscreen]);

  return (
    <main id="content" className="footprint-readme">
      <p className="footprint-path">FadingWind / <strong>Footprint</strong></p>
      <header className="footprint-heading">
        <h1 aria-label={isChinese ? "足迹" : undefined}>Footprint</h1>
        <p>{isChinese ? "走过的地方，留下的照片" : "Places visited and photos from along the way"}</p>
      </header>

      <section className="footprint-section" aria-labelledby="footprint-map-title">
        <div className="footprint-section-heading">
          <h2 id="footprint-map-title">{isChinese ? "地图" : "Map"}</h2>
          <dl className="footprint-counts">
            <div>
              <dt>{isChinese ? "国家" : "Countries"}</dt>
              <dd>{countryCount}</dd>
            </div>
            <div>
              <dt>{isChinese ? "城市 / 地点" : "Cities / Places"}</dt>
              <dd>{places.length}</dd>
            </div>
          </dl>
        </div>
        <div className="footprint-map-frame">
        <div
          ref={mapShellRef}
          className={mapShellClass}
          style={mapShellStyle}
        >
          <div
            ref={mapContainerRef}
            className="footprint-map-canvas"
            style={mapCanvasStyle}
            aria-label={isChinese ? "足迹地图" : "Footprint map"}
          />

          {mapUnavailable && (
            <p className="absolute inset-0 flex items-center justify-center px-5 text-sm text-slate-600" role="status">
              {isChinese ? "这台设备暂时无法显示互动地图，仍可浏览下方的地点。" : "The interactive map is unavailable on this device. You can still browse the places below."}
            </p>
          )}
          <div hidden={mapUnavailable} className="footprint-map-controls" role="group" aria-label={isChinese ? "地图工具" : "Map tools"}>
            <button
              type="button"
              aria-label={isChinese ? "放大地图" : "Zoom in"}
              title={isChinese ? "放大" : "Zoom in"}
              onClick={() => zoomMap(1)}
              className="inline-flex h-9 w-9 items-center justify-center text-slate-700 transition-colors hover:bg-sky-50 hover:text-sky-700"
            >
              <ZoomIn size={17} />
            </button>
            <button
              type="button"
              aria-label={isChinese ? "缩小地图" : "Zoom out"}
              title={isChinese ? "缩小" : "Zoom out"}
              onClick={() => zoomMap(-1)}
              className="inline-flex h-9 w-9 items-center justify-center border-l border-slate-100 text-slate-700 transition-colors hover:bg-sky-50 hover:text-sky-700"
            >
              <ZoomOut size={17} />
            </button>
            <button
              type="button"
              aria-label={isChinese ? "重置地图" : "Reset map"}
              title={isChinese ? "重置" : "Reset"}
              onClick={resetMap}
              className="inline-flex h-9 w-9 items-center justify-center border-l border-slate-100 text-slate-700 transition-colors hover:bg-sky-50 hover:text-sky-700"
            >
              <Home size={16} />
            </button>
            <button
              type="button"
              aria-label={isChinese ? "向左旋转地图" : "Rotate map left"}
              title={isChinese ? "左旋" : "Rotate left"}
              onClick={() => rotateMap(-15)}
              className="inline-flex h-9 w-9 items-center justify-center border-l border-slate-100 text-slate-700 transition-colors hover:bg-sky-50 hover:text-sky-700"
            >
              <RotateCcw size={16} />
            </button>
            <button
              type="button"
              aria-label={isChinese ? "向右旋转地图" : "Rotate map right"}
              title={isChinese ? "右旋" : "Rotate right"}
              onClick={() => rotateMap(15)}
              className="inline-flex h-9 w-9 items-center justify-center border-l border-slate-100 text-slate-700 transition-colors hover:bg-sky-50 hover:text-sky-700"
            >
              <RotateCw size={16} />
            </button>
            <button
              type="button"
              aria-label={
                isChinese
                  ? isMapFullscreen
                    ? "退出全屏地图"
                    : "全屏查看地图"
                  : isMapFullscreen
                    ? "Exit fullscreen map"
                    : "View map fullscreen"
              }
              title={
                isChinese
                  ? isMapFullscreen
                    ? "退出全屏"
                    : "全屏"
                  : isMapFullscreen
                    ? "Exit fullscreen"
                    : "Fullscreen"
              }
              onClick={toggleMapFullscreen}
              className={fullscreenButtonClass}
            >
              {isMapFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              {isMapFullscreen && (
                <span className="text-[12px] font-semibold leading-none">
                  {isChinese ? "退出全屏" : "Exit"}
                </span>
              )}
            </button>
          </div>
        </div>

        <p className="footprint-map-note">
          <MapPin size={14} aria-hidden="true" />
          <span>
          {places.length
            ? isChinese ? "点击地图标记或下方地点可以查看照片。" : "Click a map marker or a place below to view photos."
            : isChinese ? "还没有标记地点。可以先拖动或缩放地图。" : "No places marked yet. Try dragging or zooming the map."}
          </span>
        </p>
        </div>
      </section>

      {places.length > 0 && (
      <section className="footprint-section space-y-4" aria-labelledby="footprint-places-title">
        <h2 id="footprint-places-title">{isChinese ? "地点列表" : "Places"}</h2>
        {cityGroups.filter(({ countries }) => countries.length > 0).map(({ continent, countries }) => {
          const continentStyle = continentStyles[continent];
          return (
            <div key={continent} className="space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900">
                  {isChinese ? continentStyle.zhLabel : continentStyle.label}
                </h3>
                <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400">
                  {countries.reduce((sum, group) => sum + group.places.length, 0)}
                </span>
              </div>
              <div className="grid items-start gap-3">
                {countries.length ? (
                  countries.map(({ country, places: countryPlaces, regionGroups }) => {
                    const style = getCountryStyle(countryPlaces[0]);
                    const regionUnit = regionUnitLabels[country];
                    const regionCount = regionGroups.filter(({ region }) => region).length;
                    const countryGroupKey = `${continent}:${country}`;
                    const isCountryExpanded = Boolean(expandedCountries[countryGroupKey]);
                    const countryName = isChinese ? style.zhLabel : style.label;
                    const countrySummary =
                      regionUnit && regionCount
                        ? isChinese
                          ? `${regionCount} ${regionUnit.zhLabel}，${placeCountLabel(
                              countryPlaces.length,
                              isChinese,
                            )}`
                          : `${regionCount} ${regionUnit.label}, ${placeCountLabel(
                              countryPlaces.length,
                              isChinese,
                            )}`
                        : placeCountLabel(countryPlaces.length, isChinese);
                    return (
                      <article
                        key={countryGroupKey}
                        className="footprint-place-card"
                      >
                        <button
                          type="button"
                          aria-expanded={isCountryExpanded}
                          aria-label={
                            isChinese
                              ? `${isCountryExpanded ? "收起" : "展开"}${countryName}地点列表`
                              : `${isCountryExpanded ? "Collapse" : "Expand"} ${countryName} place list`
                          }
                          title={
                            isChinese
                              ? isCountryExpanded
                                ? "收起"
                                : "展开"
                              : isCountryExpanded
                                ? "Collapse"
                                : "Expand"
                          }
                          onClick={() => toggleCountryGroup(countryGroupKey)}
                          className="flex w-full items-center justify-between gap-3 text-left"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 shrink-0 rounded-full"
                              style={{ backgroundColor: style.color }}
                            />
                            <h4 className="truncate text-[15px] font-semibold text-slate-900">
                              {countryName}
                            </h4>
                          </div>
                          <span className="flex shrink-0 items-center gap-2 text-right text-[12px] text-slate-500 dark:text-slate-400">
                            <span>{countrySummary}</span>
                            <ChevronRight
                              size={15}
                              className={`transition-transform ${isCountryExpanded ? "rotate-90" : ""}`}
                            />
                          </span>
                        </button>
                        {isCountryExpanded && (
                          <div className="footprint-region-grid mt-3 border-t border-slate-100 pt-3 dark:border-slate-800">
                            {regionGroups.map(({ key, region, places: regionPlaces }) => (
                              <div key={`${country}-${key}`} className="min-w-0 space-y-1.5">
                                {region && (
                                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-1 dark:border-slate-800">
                                    <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">
                                      {isChinese ? region.zhLabel : region.label}
                                    </span>
                                    <span className="shrink-0 text-[11px] text-slate-400 dark:text-slate-500">
                                      {placeCountLabel(regionPlaces.length, isChinese)}
                                    </span>
                                  </div>
                                )}
                                <div className="flex flex-wrap gap-1.5">
                                  {regionPlaces.map((place) => (
                                    <button
                                      type="button"
                                      key={place.id}
                                      onClick={() => focusPlace(place)}
                                      className="group inline-flex max-w-full items-center gap-1.5 rounded-sm border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-left transition-colors hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-950 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                                    >
                                      <span className="min-w-0 break-words text-[13px] font-semibold leading-snug text-slate-800 group-hover:text-slate-950 dark:text-slate-100 dark:group-hover:text-white">
                                        {displayName(place)}
                                      </span>
                                      <MapPin
                                        size={12}
                                        className="shrink-0 text-slate-400 transition-colors group-hover:text-slate-700 dark:group-hover:text-slate-200"
                                      />
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </article>
                    );
                  })
                ) : (
                  <div
                    className="border border-dashed border-slate-200 bg-white px-3 py-4 text-[13px] text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
                    style={{ backgroundColor: continentStyle.soft }}
                  >
                    {isChinese ? "尚未标记地点。" : "No places marked yet."}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </section>
      )}

      {selectedPlace &&
        createPortal(
          <div
            className="fixed inset-0 z-[1200] flex items-center justify-center overflow-hidden bg-slate-950/55 px-3 py-4 backdrop-blur-sm sm:px-5"
            onClick={closeModal}
          >
            <article
              className="footprint-photo-dialog flex w-[min(94vw,1120px)] flex-col overflow-hidden bg-white shadow-2xl"
              style={{
                height: "min(92dvh, 860px)",
                maxHeight: "calc(100dvh - 2rem)",
              }}
              onClick={(event) => event.stopPropagation()}
            >
              <div
                ref={photoViewportRef}
                className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-slate-950"
                style={{
                  touchAction: "none",
                  overscrollBehavior: "contain",
                }}
                onPointerDown={handlePhotoPointerDown}
                onPointerMove={handlePhotoPointerMove}
                onPointerUp={finishPhotoDrag}
                onPointerCancel={finishPhotoDrag}
                onDoubleClick={(event) => {
                  if (!(event.target as HTMLElement).closest("button")) {
                    resetPhotoView();
                  }
                }}
              >
                {currentPhoto ? (
                  <>
                    <img
                      key={currentPhoto.src}
                      ref={(image) => {
                        photoImageRef.current = image;
                        if (image) {
                          const { x, y } = photoOffsetRef.current;
                          image.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${photoZoomRef.current})`;
                        }
                      }}
                      src={currentPhoto.src}
                      alt={isChinese ? currentPhoto.zhCaption : currentPhoto.caption}
                      loading="eager"
                      decoding="async"
                      draggable={false}
                      onContextMenu={(event) => event.preventDefault()}
                      onLoad={(event) => {
                        setPhotoNaturalSize({
                          width: event.currentTarget.naturalWidth,
                          height: event.currentTarget.naturalHeight,
                        });
                        setPhotoLoading(false);
                        setPhotoLoadError(false);
                        window.requestAnimationFrame(reclampPhotoView);
                      }}
                      onError={() => {
                        setPhotoLoading(false);
                        setPhotoLoadError(true);
                      }}
                      className={`h-auto max-h-full w-auto max-w-full select-none object-contain will-change-transform ${
                        photoZoom > minPhotoZoom
                          ? isPhotoDragging
                            ? "cursor-grabbing"
                            : "cursor-grab"
                          : "cursor-default"
                      }`}
                      style={{ transformOrigin: "center center" }}
                    />
                    {!photoLoading && !photoLoadError && (
                      <div className="pointer-events-none absolute left-3 top-3 select-none rounded-md border border-white/15 bg-slate-950/55 px-3 py-2 text-left text-[11px] font-medium leading-tight text-white/90 shadow-sm backdrop-blur-sm">
                        <div>
                          {isChinese ? "高清" : "Full resolution"}
                          {photoNaturalSize && (
                            <span className="ml-1.5 text-white/65">
                              {photoNaturalSize.width} × {photoNaturalSize.height}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-[10px] font-normal text-white/60">
                          {isChinese
                            ? "滚轮缩放 · 拖动查看 · 双击复位"
                            : "Scroll to zoom · drag to move · double-click to reset"}
                        </div>
                      </div>
                    )}
                    {photoLoading && (
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-950/45 text-white">
                        <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                      </div>
                    )}
                    {photoLoadError && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-950 px-6 text-center text-sm text-slate-300">
                        {isChinese ? "照片加载失败，请稍后重试。" : "The photo could not be loaded. Please try again."}
                      </div>
                    )}
                    {!photoLoading && !photoLoadError && (
                      <div
                        className="absolute bottom-14 left-1/2 flex h-9 -translate-x-1/2 items-stretch overflow-hidden rounded-full border border-white/15 bg-slate-950/65 text-white shadow-sm backdrop-blur-sm sm:bottom-3"
                        aria-label={isChinese ? "照片缩放控制" : "Photo zoom controls"}
                      >
                        <button
                          type="button"
                          aria-label={isChinese ? "缩小" : "Zoom out"}
                          title={isChinese ? "缩小" : "Zoom out"}
                          disabled={photoZoom <= minPhotoZoom + 0.001}
                          onClick={() => zoomPhotoFromCenter(1 / 1.3)}
                          className="inline-flex w-9 items-center justify-center transition-colors hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-35"
                        >
                          <ZoomOut size={15} />
                        </button>
                        <button
                          type="button"
                          title={isChinese ? "恢复 100%" : "Reset to 100%"}
                          onClick={resetPhotoView}
                          className="min-w-[3.4rem] border-x border-white/15 px-2 text-[11px] font-semibold tabular-nums transition-colors hover:bg-white/15"
                        >
                          {Math.round(photoZoom * 100)}%
                        </button>
                        <button
                          type="button"
                          aria-label={isChinese ? "放大" : "Zoom in"}
                          title={isChinese ? "放大" : "Zoom in"}
                          disabled={photoZoom >= maxPhotoZoom - 0.001}
                          onClick={() => zoomPhotoFromCenter(1.3)}
                          className="inline-flex w-9 items-center justify-center transition-colors hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-35"
                        >
                          <ZoomIn size={15} />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-slate-700 dark:text-slate-200">
                    <Camera size={38} strokeWidth={1.8} />
                    <div className="text-center">
                      <div className="text-[15px] font-semibold">
                        {isChinese ? "照片待补充" : "Photo to be added"}
                      </div>
                      <div className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">
                        {isChinese
                          ? "之后可以替换成你拍的照片"
                          : "This can be replaced with your own photo later"}
                      </div>
                    </div>
                  </div>
                )}
              {hasMultiplePhotos && (
                <>
                  <button
                    type="button"
                    aria-label={isChinese ? "上一张照片" : "Previous photo"}
                    title={isChinese ? "上一张" : "Previous"}
                    onClick={() => {
                      setAutoPlay(false);
                      showPreviousPhoto();
                    }}
                    className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-slate-900 shadow-sm transition-colors hover:bg-white dark:bg-slate-900/80 dark:text-white dark:hover:bg-slate-900"
                  >
                    <ChevronLeft size={21} />
                  </button>
                  <button
                    type="button"
                    aria-label={isChinese ? "下一张照片" : "Next photo"}
                    title={isChinese ? "下一张" : "Next"}
                    onClick={() => {
                      setAutoPlay(false);
                      showNextPhoto();
                    }}
                    className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-slate-900 shadow-sm transition-colors hover:bg-white dark:bg-slate-900/80 dark:text-white dark:hover:bg-slate-900"
                  >
                    <ChevronRight size={21} />
                  </button>
                  <button
                    type="button"
                    aria-label={autoPlay ? (isChinese ? "暂停轮播" : "Pause slideshow") : (isChinese ? "自动轮播" : "Play slideshow")}
                    title={autoPlay ? (isChinese ? "暂停" : "Pause") : (isChinese ? "自动播放" : "Play")}
                    onClick={() => setAutoPlay((current) => !current)}
                    className="absolute bottom-[6.5rem] right-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-slate-900 shadow-sm transition-all hover:bg-white dark:bg-slate-900/80 dark:text-white dark:hover:bg-slate-900 sm:bottom-14"
                  >
                    {autoPlay ? <Pause size={17} /> : <Play size={17} />}
                  </button>
                </>
              )}
              <button
                type="button"
                aria-label={isChinese ? "关闭" : "Close"}
                onClick={closeModal}
                className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-gray-700 shadow-sm transition-colors hover:bg-white dark:bg-slate-900/85 dark:text-slate-100"
              >
                <X size={17} />
              </button>
            </div>
            <div className="w-full min-w-0 shrink-0 px-4 py-3">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
                  {displayName(selectedPlace)}
                </h2>
                <span
                  className="shrink-0 text-[13px] font-semibold"
                  style={{ color: countryStyles[selectedPlace.country].color }}
                >
                  {displayCountry(selectedPlace)}
                </span>
              </div>
              {currentPhoto && (
                <div className="mt-1 flex items-center justify-between gap-3 text-[13px] text-slate-500 dark:text-slate-400">
                  <span>{isChinese ? currentPhoto.zhCaption : currentPhoto.caption}</span>
                  {hasMultiplePhotos && (
                    <span className="shrink-0 font-medium">
                      {photoIndex + 1} / {selectedPhotos.length}
                    </span>
                  )}
                </div>
              )}
              <p className="mt-2 text-[14px] leading-relaxed text-gray-700 dark:text-gray-300">
                {displayNote(selectedPlace)}
              </p>
            </div>
            </article>
          </div>,
          document.body,
        )}
    </main>
  );
};

export default Footprint;
