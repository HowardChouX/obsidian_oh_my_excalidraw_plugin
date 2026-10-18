/** Exercise the lost-pointer detection and the watchdog's recovery dispatch. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

function transpile(relativePath) {
  const source = readFileSync(
    resolve(import.meta.dirname, "../../src/view/managers", relativePath),
    "utf8",
  );
  return ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      // Map iteration must stay native: the ES5 downlevel helper cannot read a
      // Map created by another realm.
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
}

const detectorExports = {};
vm.runInNewContext(transpile("PointerReleaseDetector.ts"), {
  exports: detectorExports,
});
const { PointerReleaseDetector } = detectorExports;

/** Loads the watchdog against a controllable clock, logger, and DOM stub. */
function loadWatchdog({ now }) {
  const exports = {};
  const logs = [];
  vm.runInNewContext(transpile("PointerGestureWatchdog.ts"), {
    exports,
    require: (name) => {
      if (name === "./PointerReleaseDetector") {
        return { PointerReleaseDetector };
      }
      if (name === "src/utils/debugHelper") {
        return { log: (...args) => logs.push(args.join(" ")) };
      }
      return {};
    },
    Date: { now: () => now.value },
  });
  return { ...exports, logs };
}

/** Minimal document/window/container stub for the watchdog. */
function fakeHost({ cursorButton = "down" } = {}) {
  const listeners = new Map();
  const timers = [];
  const dispatched = [];
  const cleared = { cursorButton: 0 };
  const win = {
    setTimeout: (callback, delay) => {
      timers.push({ callback, delay });
      return timers.length;
    },
    clearTimeout: () => {},
    PointerEvent: class PointerEventStub {
      constructor(type, init) {
        Object.assign(this, init);
        this.type = type;
      }
    },
  };
  const doc = {
    defaultView: win,
    addEventListener: (type, listener) => listeners.set(type, listener),
    removeEventListener: (type) => listeners.delete(type),
  };
  return {
    listeners,
    timers,
    dispatched,
    cleared,
    host: {
      ownerDocument: doc,
      getCursorButton: () => cursorButton,
      getInteractiveCanvas: () => ({
        dispatchEvent: (event) => {
          dispatched.push(event);
          return true;
        },
      }),
      isRecoverable: () => true,
      releaseStuckCursorButton: () => {
        cleared.cursorButton += 1;
      },
    },
  };
}

const runTimers = (timers, delay) => {
  for (const timer of timers.filter((entry) => entry.delay === delay)) {
    timer.callback();
  }
};

test("a second mouse press reports the earlier release as lost", () => {
  const detector = new PointerReleaseDetector();
  detector.notePointerDown(1, "mouse", 1000);
  detector.notePointerDown(2, "mouse", 2000);

  assert.deepEqual([...detector.takeDroppedReleases()], [1]);
  assert.deepEqual([...detector.takeDroppedReleases()], []);
});

test("a delivered release leaves nothing behind", () => {
  const detector = new PointerReleaseDetector();
  detector.notePointerDown(7, "pen", 1000);
  detector.notePointerRelease(7, 1500);

  assert.deepEqual([...detector.takeDroppedReleases()], []);
  assert.equal(detector.hasLivePress(), false);
  assert.deepEqual([...detector.findIdlePresses(999999, 1000)], []);
});

test("a second touch press is a real gesture, not a lost release", () => {
  const detector = new PointerReleaseDetector();
  detector.notePointerDown(1, "touch", 1000);
  detector.notePointerDown(2, "touch", 1100);

  assert.deepEqual([...detector.takeDroppedReleases()], []);
  assert.equal(detector.hasLivePress(), false);
});

test("a silent press is only reported after the idle window", () => {
  const detector = new PointerReleaseDetector();
  detector.notePointerDown(3, "pen", 1000);

  assert.deepEqual([...detector.findIdlePresses(5000, 15000)], []);
  assert.deepEqual([...detector.findIdlePresses(20000, 15000)], [3]);

  detector.noteActivity(19000);
  assert.deepEqual([...detector.findIdlePresses(20000, 15000)], []);
});

test("a dropped release is replayed as pointercancel and clears the button", () => {
  const now = { value: 1000 };
  const { PointerGestureWatchdog, logs, GESTURE_RECOVERY_LOG_PREFIX } =
    loadWatchdog({ now });
  const fake = fakeHost({ cursorButton: "down" });
  const watchdog = new PointerGestureWatchdog(fake.host);
  watchdog.attach({});

  fake.listeners.get("pointerdown")({ pointerId: 11, pointerType: "pen" });
  now.value = 1200;
  fake.listeners.get("pointerdown")({ pointerId: 12, pointerType: "pen" });
  now.value = 1400;
  runTimers(fake.timers, 2000);

  assert.equal(fake.dispatched.length, 1);
  assert.equal(fake.dispatched[0].type, "pointercancel");
  assert.equal(fake.dispatched[0].pointerId, 11);
  assert.equal(fake.dispatched[0].bubbles, true);
  assert.equal(fake.cleared.cursorButton, 0);
  runTimers(fake.timers, 80);
  assert.equal(fake.cleared.cursorButton, 1);
  assert.equal(logs.length, 1);
  assert.match(logs[0], new RegExp(`^\\${GESTURE_RECOVERY_LOG_PREFIX}`));
  assert.match(logs[0], /reason=dropped-release/);

  // Rate limited: a second lost release inside the cooldown is not replayed.
  fake.listeners.get("pointerdown")({ pointerId: 13, pointerType: "pen" });
  now.value = 1600;
  fake.listeners.get("pointerdown")({ pointerId: 14, pointerType: "pen" });
  runTimers(fake.timers, 2000);
  assert.equal(fake.dispatched.length, 1);

  watchdog.detach();
  assert.equal(fake.listeners.size, 0);
});

test("an ordinary press and release never triggers a recovery", () => {
  const now = { value: 1000 };
  const { PointerGestureWatchdog, logs } = loadWatchdog({ now });
  const fake = fakeHost({ cursorButton: "up" });
  const watchdog = new PointerGestureWatchdog(fake.host);
  watchdog.attach({});

  fake.listeners.get("pointerdown")({ pointerId: 21, pointerType: "mouse" });
  now.value = 1300;
  fake.listeners.get("pointermove")({ pointerId: 21, pointerType: "mouse" });
  now.value = 1500;
  fake.listeners.get("pointerup")({ pointerId: 21, pointerType: "mouse" });
  now.value = 1700;
  runTimers(fake.timers, 2000);

  assert.equal(fake.dispatched.length, 0);
  assert.deepEqual([...logs], []);
  watchdog.detach();
});
