# Motion and Interaction

Fluid-motion craft for artifacts the reader touches, drags, or watches move — distilled from Apple's WWDC fluid-interfaces guidance (chiefly *Designing Fluid Interfaces*, WWDC 2018) and translated to the web platform. These rules are style-agnostic physics and feel; they serve any visual identity the page commits to.

The through-line: motion feels alive when it starts from the current on-screen value, inherits the user's velocity, projects momentum forward, and can be grabbed and reversed at any instant. Springs are the default tool because they are inherently interruptible and velocity-aware.

## Response — kill latency

- Respond on pointer-*down*, not on release. Waiting for `click`/touch-up to show feedback feels dead.
- Feedback must be continuous *during* the interaction: a drag, slider, or drawer updates 1:1 with the pointer the whole way, never only when the gesture completes.
- Audit everything on the input path — debounces, artificial timers, transition waits. Non-essential latency is a regression.

```css
.button:active { transform: scale(0.97); transition: transform 100ms ease-out; }
```

## Direct manipulation — 1:1 tracking

- Dragged content stays glued to the pointer and respects the offset from *where it was grabbed* — snapping to the element's center on grab breaks the illusion.
- Use Pointer Events with `setPointerCapture` so tracking survives the pointer leaving the element's bounds.
- Keep a short position + timestamp history during the drag; release velocity comes from it.

## Interruptibility — the most important principle

- Never lock out input during a transition. A closing panel the user grabs again follows the finger — it does not finish closing first.
- Always animate from the *presentation* (live on-screen) value, never the logical target; starting from the target causes a visible jump on interrupt.
- CSS transitions and `@keyframes` cannot be grabbed and reversed mid-flight — do not use them for gesture-driven motion. Springs re-target from the current value by default.
- When a gesture reverses, carry velocity through the re-target instead of hard-cutting it; a velocity discontinuity reads as hitting a wall.
- Decompose 2D motion into independent X and Y springs; a single spring on the 2D distance desyncs when the axes have different velocities.

## Springs — behavior over animation

Think in two designer-friendly parameters, not mass/stiffness/damping:

- **Damping ratio** — overshoot. `1.0` = critically damped, no bounce. Lower = bouncier.
- **Response** — seconds to approach the target. Not a duration; settle time emerges.

Defaults: start UI at damping `1.0`. Add bounce (~`0.8`) only when the gesture itself carried momentum — a flick, a throw, a release. Overshoot on a menu that merely faded in feels wrong; on a card that was flung it feels right.

| Interaction | Damping | Response |
| --- | --- | --- |
| Move / reposition | `1.0` | `0.4` |
| Rotation | `0.8` | `0.4` |
| Drawer / sheet | `0.8` | `0.3` |

Two ways to get springs in a single-file artifact:

```html
<!-- Pinned CDN library: exposes the Motion global -->
<script src="https://cdn.jsdelivr.net/npm/motion@11/dist/motion.js"></script>
<script>
  Motion.animate(el, { y: 0 }, { type: "spring", bounce: 0, duration: 0.4 });      // critically damped
  Motion.animate(el, { y: t }, { type: "spring", bounce: 0.2, duration: 0.4, velocity: v }); // after a flick
</script>
```

```js
// Or hand-rolled in a rAF loop: semi-implicit Euler, parameterized by damping ratio + response
// stiffness k = (2π / response)², damping c = 2 · dampingRatio · √k   (unit mass)
function springStep(s, dt) {
  const a = -s.k * (s.x - s.target) - s.c * s.v;
  s.v += a * dt;
  s.x += s.v * dt;
}
```

## Velocity handoff — the seam between drag and animation

On release, the animation continues at the finger's exact velocity — no visible seam. Pass the pointer's release velocity as the spring's initial velocity (px/s for Motion; if an API wants relative velocity, normalize: `gestureVelocity / (target − current)`).

## Momentum projection — animate to where the gesture is going

Don't snap to the boundary nearest the *release point*; project where momentum would land, then snap to the target nearest that projection. This is what makes a flick feel like a throw.

```js
function project(velocity /* px/s */, decelerationRate = 0.998) {
  return (velocity / 1000) * decelerationRate / (1 - decelerationRate);
}
const target = nearestSnapPoint(current + project(releaseVelocity));
// then spring to target with the release velocity (see handoff above)
```

Decide reverse-vs-commit from the velocity *sign* at release, not from position.

## Spatial consistency

- Enter and exit along the same path: a panel that slid in from the right dismisses to the right.
- Anchor overlays to their source: menus, popovers, and sheets originate from the trigger — set `transform-origin` to it.
- Mirror the easing on reversible transitions so the return path matches the outbound one.
- Intermediate frames should telegraph the destination — grow toward the pointer, not interpolate blindly.

## Rubber-banding — soft boundaries

At an edge, resist progressively instead of stopping hard; a hard stop reads as frozen.

```js
function rubberband(overshoot, dimension, c = 0.55) {
  return (overshoot * dimension * c) / (dimension + c * Math.abs(overshoot));
}
```

## Gesture feel checklist

- Tap: highlight on touch-down, commit on touch-up; ~10px of hit padding; cancel by dragging away (and back).
- Drag/swipe: a small movement threshold (~10px) before committing to a direction, then 1:1.
- Detect plausible gestures in parallel from the first move, then cancel the losers — avoid recognizers that only report a final state.
- Pay disambiguation delays (e.g. double-tap detection) only where the second gesture truly exists.

## Frame-level smoothness

- Animate compositor-friendly properties only — `transform` and `opacity`; hint imminent motion with `will-change`.
- `requestAnimationFrame` is the display-synced clock; never animate on timers.

## Reduced motion

Reduced motion means a gentler equivalent, not no feedback:

- `prefers-reduced-motion: reduce` — replace slides, springs, and parallax with short opacity cross-fades; drop overshoot; keep the opacity/color changes that aid comprehension.
- Avoid full-viewport moving backgrounds and slow loops near one cycle per 5 s; ease dark↔light theme changes instead of hard-cutting brightness.
- If the design uses translucent or low-contrast surfaces, also honor `prefers-reduced-transparency` (solidify, drop blur) and `prefers-contrast: more` (near-solid grounds, defined borders).

```css
@media (prefers-reduced-motion: reduce) {
  .sheet { transition: opacity 200ms ease; transform: none !important; }
}
```

## Process

- Design interaction and visuals together — motion is not a layer added after the pixels.
- An interactive prototype beats static mockups: build it, play with it, and review motion frame-by-frame or in slow motion to catch what full speed hides.
