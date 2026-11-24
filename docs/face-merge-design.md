# Face Merge — Design

A standalone project page (`projects/face-merge.html`) where a visitor drops in two photos of two different people and sees the merged face, with a slider to move between them.

## Decisions

| Question | Decision | Why |
| --- | --- | --- |
| Where processing runs | Fully in the browser | Site is static (Vercel, no build). Photos never leave the device. No cost. |
| Merge method | Classic landmark morph | Runs client-side, fast, and the math is visible, which suits a portfolio piece. GAN or diffusion blends need a GPU backend, cost money, and upload photos. |
| Landmark detector | MediaPipe Tasks Vision `FaceLandmarker` (478 points) | Maintained, accurate, one ~3.7 MB model, loads as an ES module from jsDelivr with no bundler. |
| Placement | `projects/face-merge.html` plus an entry on the Projects view | Same pattern as `pitch-bend-synth.html` and `poker-chip-calculator.html`. |
| Look | Reuses the site's dark minimal style: serif heading, small monospace lowercase labels, the site's theme tokens | Should feel like part of the site. |

## How the merge works

1. **Load.** Each image goes into an offscreen canvas. HEIC files (iPhone photos on desktop Chrome) are converted with `heic2any`, which is loaded lazily from a CDN only when needed.
2. **Detect.** `FaceLandmarker` in `IMAGE` mode returns 478 normalized landmarks for each face, converted to pixel coordinates.
   - No face: that slot shows "no face found — try a clearer, front-facing photo."
   - Multiple faces: the largest face (biggest landmark bounding box) is used, and the slot notes it.
3. **Align.** Each face is mapped into a shared square output frame (512×512) with a similarity transform (scale, rotate, translate) that puts the two eye centers at fixed positions. This removes differences in head size, tilt and position.
4. **Boundary points.** Points are added on the output frame's border (corners and edge midpoints), plus a ring of points around the face oval, so the whole frame gets triangulated, not just the face.
5. **Average geometry.** For blend `t`, target points are `P = (1−t)·A + t·B`.
6. **Triangulate.** Delaunay triangulation of the target points, using `delaunator` (ESM via CDN, ~5 KB). The triangle indices are reused for A and B because the points correspond one-to-one.
7. **Warp.** For each triangle, an affine transform maps the source triangle onto the target triangle. Drawing uses canvas 2D `setTransform`, clipped to the triangle and slightly expanded to hide seams. This is done once for A and once for B.
8. **Blend.** The output is warped A at alpha `1−t` with warped B at `t` on top.
9. **Feather.** An elliptical mask around the face oval fades the background, so mismatched backgrounds and hair don't dominate.

Moving the slider re-runs steps 5–9 only. Detection runs once per image. Canvas 2D with ~1,000 triangles is fast enough for smooth dragging at 512 px.

## UX

- Two upload slots side by side (stacked on mobile). Each accepts click-to-choose, drag-and-drop or paste. Thumbnails show the detected landmarks as dots.
- A large result canvas.
- Controls:
  - **blend** slider, 0–100% (A to B), default 50%
  - **shape** slider, which sets geometry separately from texture. Default: linked to blend. Unlinking it gives "face A's shape with B's skin."
  - **show mesh** toggle that overlays the triangulation
  - **swap** button (A↔B)
  - **download png**
- Status line for model loading ("loading face model… 3.7 MB") and per-slot errors.
- Privacy line under the title: "everything runs in your browser — photos are never uploaded or stored. only merge faces of people who are okay with it."

## Not in the MVP (stretch)

- Webcam capture
- Animated GIF/video export of the A→B morph
- Averaging N faces
- Step-by-step explainer animation (landmarks → triangles → warp → blend)
- Server-side features (e.g. an "average visitor" face). Skipped, since they'd need storage and consent.

## Risks

- **Different head angles.** A strong profile against a frontal face warps badly. Mitigation: the eye alignment handles tilt, and a hint asks for front-facing photos.
- **Lighting and skin-tone differences.** The crossfade shows them honestly. Color matching is not attempted.
- **CDN availability.** Pinned versions on jsDelivr, and the model is loaded from Google's storage bucket. If it fails, the page shows an error message.
- **Hair and glasses.** They ghost at mid blends. That's inherent to a morph, and the feathered mask limits it.

## Testing

- Local preview via `python3 -m http.server`. Load test photos with the debug query `?a=<url>&b=<url>` (same-origin only), then check:
  - result at 0 / 50 / 100%
  - mesh overlay
  - no-face handling
  - HEIC upload
- Test photos stay in a git-ignored folder and are never committed.

---

# Update: blend up to 10 faces

## Decisions

| Question | Decision | Why |
| --- | --- | --- |
| How many faces | 1 to 10. The merge appears once 2 faces are added. | 10 keeps the page fast enough on phones, since every face is warped on every render. |
| Input | A grid of face cards plus an "add faces" tile. The tile accepts several files at once, by click, drop or paste. Each card has a remove button. | Adding 10 photos one at a time would be tedious. |
| Weighting | Each card gets its own weight slider (0–100, default 50). Weights are normalized, so the result is a weighted average. An "equal" button resets them all. | Covers both "average of everyone" and "mostly me with a bit of you". With 2 faces it behaves like the old A↔B slider. |
| Shape vs texture | A "shape from" selector: *blend* (the same weighted average) or *face N* (one face's geometry with everyone's skin). Replaces the shape slider. | A per-face shape weight would double the sliders. One selector keeps the most fun use case. |
| Swap button | Removed | Doesn't mean anything with N faces. |
| Debug loader | `?f=path1,path2,…` (same-origin only). `?a=&b=` still works. | Testing. |

## Algorithm changes

- **Target geometry:** `P = Σ wᵢ·Pᵢ` (normalized weights), or one face's points when "shape from" is set to a face.
- **Triangulation:** done once on the plain mean of all faces, and redone when a face is added or removed. Point correspondence is still one-to-one, since every face has the same 478 landmarks plus 16 frame points.
- **Warp:** every face with weight > 0 is warped into its own buffer.
- **Blend:** a running weighted average built with alpha: draw face 1 at alpha 1, then face k at alpha `wₖ / (w₁+…+wₖ)`. This gives the exact weighted mean with no float buffers.
- **Performance:** 10 faces × ~950 triangles per render. While a slider is being dragged, it renders at 256 px. On release, it renders at 512 px.

## Risks

- **Blur.** Averaging many faces softens features: hair, glasses and backgrounds wash out. That is the classic "average face" look, and the fade-background option hides most of it.
- **Bad photos.** One sharply angled face drags the average shape. Lowering that face's weight is the fix.
