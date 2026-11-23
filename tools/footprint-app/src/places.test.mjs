import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { validatePlaces } from "./places.mjs";

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
