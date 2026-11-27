import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getChineseRegionDisplayName, getPlaceDisplayName, validatePlaces } from "./places.mjs";

const place = {
  id: "test", name: "Test", zhName: "测试点", country: "Test Country", zhCountry: "测试国家",
  continent: "Asia", lat: 20, lng: 30, note: "", zhNote: "",
  photos: [{ src: "/footprint/photos/test.webp", caption: "", zhCaption: "" }],
};

test("accepts an empty dataset and validates the site's dataset", async () => {
  assert.deepEqual(validatePlaces([]), []);
  const source = await readFile(new URL("../../../footprint/places.json", import.meta.url), "utf8");
  assert.doesNotThrow(() => validatePlaces(JSON.parse(source)));
});

test("shows shorter city names without changing stored names or English labels", async () => {
  const source = await readFile(new URL("../../../footprint/places.json", import.meta.url), "utf8");
  const places = new Map(JSON.parse(source).map((entry) => [entry.id, entry]));
  for (const [id, short] of [["cn-350100", "福州"], ["cn-330100", "杭州"], ["jp-29201", "奈良"], ["jp-city-27100", "大阪"]]) {
    const city = places.get(id);
    assert.equal(getPlaceDisplayName(city, true), short);
    assert.equal(city.zhName, `${short}市`);
    assert.equal(getPlaceDisplayName(city, false), city.name);
  }
});

test("shows Hong Kong and Macao without the administrative suffix", () => {
  for (const [id, short] of [["cn-810000", "香港"], ["cn-820000", "澳门"]]) {
    const official = `${short}特别行政区`;
    const entry = { ...place, id, country: "China", zhName: official };
    assert.equal(getPlaceDisplayName(entry, true), short);
    assert.equal(getChineseRegionDisplayName(official), short);
    assert.equal(getPlaceDisplayName(entry, false), entry.name);
    assert.equal(entry.zhName, official);
  }
  assert.equal(getChineseRegionDisplayName("广西壮族自治区"), "广西壮族自治区");
  assert.equal(getChineseRegionDisplayName("油尖旺区"), "油尖旺区");
});

test("keeps district, region and scenic names intact", () => {
  const region = { label: "Nagasaki", zhLabel: "长崎县" };
  const japan = { ...place, country: "Japan", region };
  assert.equal(getPlaceDisplayName({ ...japan, id: "jp-13104", zhName: "新宿区" }, true), "新宿区");
  assert.equal(getPlaceDisplayName({ ...japan, id: "jp-tokyo", zhName: "东京" }, true), "东京");
  assert.equal(getPlaceDisplayName({ ...japan, id: "jp-poi-osm-11089385405", zhName: "九十九岛" }, true), "九十九岛");
  assert.equal(getPlaceDisplayName({ ...japan, id: "jp-poi-example", zhName: "古市" }, true), "古市");
  assert.equal(japan.region.zhLabel, "长崎县");
});

test("shortens generic scenic suffixes but keeps proper names and aliases", () => {
  for (const [zhName, display] of [
    ["明十三陵景区", "明十三陵"],
    ["黄山风景区", "黄山"],
    ["庐山风景名胜区", "庐山"],
    ["青城山—都江堰旅游景区", "青城山—都江堰"],
    ["泰宁风景旅游区", "泰宁"],
    ["天津古文化街旅游区（津门故里）", "天津古文化街（津门故里）"],
    ["土楼南靖（土楼（永定·南靖）旅游景区）", "土楼南靖（土楼（永定·南靖）旅游景区）"],
    ["黄山风景区入口", "黄山风景区入口"],
    ["风景区", "风景区"],
  ]) {
    const attraction = { ...place, zhName };
    assert.equal(getPlaceDisplayName(attraction, true), display);
    assert.equal(attraction.zhName, zhName);
    assert.equal(getPlaceDisplayName(attraction, false), attraction.name);
  }
});

test("uses the requested Chinese display names and keeps unapproved shortenings out", () => {
  for (const [id, zhName, display] of [
    ["cn-poi-5a-150", "湄洲岛妈祖文化旅游区", "湄洲岛"],
    ["cn-poi-5a-144", "土楼南靖（土楼（永定·南靖）旅游景区）", "南靖土楼"],
    ["cn-poi-5a-141", "土楼永定（土楼（永定·南靖）旅游景区）", "永定土楼"],
    ["jp-13113", "澁谷区", "涩谷区"],
    ["cn-poi-5a-148", "福鼎太姥山旅游区", "福鼎太姥山"],
    ["cn-poi-5a-314", "香格里拉普达措景区", "香格里拉普达措"],
  ]) {
    const attraction = Object.freeze({ ...place, id, zhName });
    assert.equal(getPlaceDisplayName(attraction, true), display);
    assert.equal(attraction.zhName, zhName);
    assert.equal(getPlaceDisplayName(attraction, false), attraction.name);
  }
});

test("accepts a visit with a local photo, with or without a separate preview", () => {
  assert.equal(validatePlaces([place])[0], place);
  const [photo] = place.photos;
  assert.doesNotThrow(() => validatePlaces([{ ...place, photos: [{ ...photo, previewSrc: "/footprint/photos/previews/test.webp" }] }]));
});

test("rejects invalid coordinates, duplicate IDs and non-local photos", () => {
  assert.throws(() => validatePlaces([{ ...place, lat: 91 }]), /Invalid footprint place/);
  assert.throws(() => validatePlaces([place, place]), /Invalid footprint place/);
  assert.throws(() => validatePlaces([{ ...place, photos: [{ ...place.photos[0], src: "https://example.com/photo.webp" }] }]), /Invalid footprint photo/);
  assert.throws(() => validatePlaces([{ ...place, photos: [{ ...place.photos[0], src: "/footprint/photos/../places.json" }] }]), /Invalid footprint photo/);
});
