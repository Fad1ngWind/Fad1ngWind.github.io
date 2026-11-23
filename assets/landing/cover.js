/* Wallpaper order adapted from dmego/home.github.io. See LICENSE. */
// https://github.com/dmego/home.github.io/blob/gh-pages/assets/json/images.js
const bingWallpapers = [
  { path: "/th?id=OHR.Megaptera_EN-US1728719939_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp", theme: "tide" },
  { path: "/th?id=OHR.BarnOwlsUnite_EN-US9661992435_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp", theme: "amber" },
  { path: "/th?id=OHR.FirstFrost_EN-US8881008245_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp", theme: "lilac" },
  { path: "/th?id=OHR.BlueHK_EN-US7870996687_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp", theme: "tide" },
  { path: "/th?id=OHR.TrailCedars_EN-US2240500417_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp", theme: "leaf" },
];

const wallpaper = document.querySelector("#wallpaper");
const wallpaperPathPattern = /^\/th\?id=OHR\.[a-zA-Z0-9_-]+\.jpg(?:&[a-zA-Z0-9=._-]+)*$/;
const indexKey = `bing-image-index:${bingWallpapers.map(({ path }) => path.split("&", 1)[0]).join("|")}`;
let index = 0;

try {
  const previous = Number.parseInt(sessionStorage.getItem(indexKey), 10);
  if (Number.isInteger(previous) && previous >= 0) {
    index = (previous + 1) % bingWallpapers.length;
  }
  sessionStorage.setItem(indexKey, String(index));
} catch {
  // A browser without session storage can still show the first wallpaper.
}

const { path, theme } = bingWallpapers[index];
const panel = document.querySelector("#panel");
const avatar = document.querySelector(".avatar-flip");

if (panel) panel.dataset.theme = theme;

if (avatar) {
  const setFlipped = (flipped) => avatar.setAttribute("aria-pressed", String(flipped));

  avatar.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "mouse") setFlipped(true);
  });
  avatar.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "mouse") setFlipped(false);
  });
  avatar.addEventListener("click", () => setFlipped(avatar.getAttribute("aria-pressed") !== "true"));
}

if (wallpaper && wallpaperPathPattern.test(path)) {
  wallpaper.addEventListener("load", () => {
    wallpaper.classList.add("is-loaded");
  }, { once: true });
  wallpaper.src = new URL(path, "https://cn.bing.com").href;
}
