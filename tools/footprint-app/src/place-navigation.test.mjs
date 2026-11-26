import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import test from "node:test";
import { getGalleryTransformOrigin, navigateToListedPlace, reverseGalleryMotion } from "./place-navigation.mjs";

class TestMap extends EventEmitter {
  center = { lng: 0, lat: 0 };
  stop() {}
  getCenter() { return this.center; }
  getZoom() { return 2; }
  easeTo(camera) { this.camera = camera; }
  finish(center = this.camera.center) {
    this.center = { lng: center[0], lat: center[1] };
    this.emit("moveend");
  }
}

test("anchors the gallery to a visible marker and ignores off-screen markers", () => {
  const map = { left: 100, top: 40, width: 620, height: 350 };
  const viewport = { width: 800, height: 600 };
  assert.equal(getGalleryTransformOrigin({ x: 250, y: 312 }, map, viewport), "calc(50% + -50px) calc(50% + 52px)");
  assert.equal(getGalleryTransformOrigin({ x: -1, y: 120 }, map, viewport), undefined);
  assert.equal(getGalleryTransformOrigin({ x: 250, y: 312 }, { ...map, top: 400 }, viewport), undefined);
});

test("reverses the gallery and backdrop, then waits for both to finish", async () => {
  const reversed = [];
  const panel = Promise.withResolvers();
  const backdrop = Promise.withResolvers();
  const element = (name, finished) => ({
    getAnimations: () => [{ finished, reverse: () => reversed.push(name) }],
  });
  let closed = false;
  const finish = reverseGalleryMotion([
    element("panel", panel.promise), element("backdrop", backdrop.promise),
  ]).then(() => { closed = true; });
  assert.deepEqual(reversed, ["panel", "backdrop"]);
  backdrop.resolve();
  await backdrop.promise;
  assert.equal(closed, false);
  panel.resolve();
  await finish;
  assert.equal(closed, true);
  assert.equal(reverseGalleryMotion([null, { getAnimations: () => [] }]), undefined);
});

test("reveals the map location before opening the gallery", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const map = new TestMap();
  const steps = [];
  navigateToListedPlace(map, {
    center: [120, 30], reduceMotion: false,
    reveal: () => steps.push("map"),
    openGallery: () => steps.push("gallery"),
  });
  t.mock.timers.tick(149);
  assert.equal(map.camera, undefined);
  t.mock.timers.tick(1);
  assert.deepEqual(map.camera, { center: [120, 30], zoom: 6, duration: 1100 });
  t.mock.timers.tick(1100);
  assert.deepEqual(steps, []);
  map.finish();
  assert.deepEqual(steps, ["map"]);
  t.mock.timers.tick(799);
  assert.deepEqual(steps, ["map"]);
  t.mock.timers.tick(1);
  assert.deepEqual(steps, ["map", "gallery"]);
});

test("does not open a gallery for a place without photos or an interrupted visit", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const map = new TestMap();
  const steps = [];
  navigateToListedPlace(map, { center: [120, 30], reduceMotion: true, reveal: () => steps.push("map") });
  assert.equal(map.camera.duration, 0);
  map.finish();
  t.mock.timers.tick(800);
  assert.deepEqual(steps, ["map"]);

  const cancel = navigateToListedPlace(map, {
    center: [121, 31], reveal: () => steps.push("arrived"),
    openGallery: () => steps.push("gallery"),
  });
  t.mock.timers.tick(150);
  map.finish([120, 30]);
  t.mock.timers.tick(800);
  assert.deepEqual(steps, ["map"]);
  cancel();

  const cancelAfterArrival = navigateToListedPlace(map, {
    center: [121, 31], reveal: () => steps.push("arrived"),
    openGallery: () => steps.push("gallery"),
  });
  t.mock.timers.tick(150);
  map.finish();
  cancelAfterArrival();
  t.mock.timers.tick(800);
  assert.deepEqual(steps, ["map", "arrived"]);
});

test("cancels a pending camera move when the user moves the map first", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const map = new TestMap();
  navigateToListedPlace(map, { center: [120, 30], reveal: () => assert.fail("location should not be revealed") });
  map.emit("movestart");
  t.mock.timers.tick(150);
  assert.equal(map.camera, undefined);
});
