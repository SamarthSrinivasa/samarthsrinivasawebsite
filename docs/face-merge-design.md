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

---

# Update: baby & aging

A new panel under the merged result. It turns the current merge (2–10 faces, using the same weights and "shape from" setting) into a "baby" and adds an **age** slider running baby → toddler → teen → adult → grandparent.

## Decisions

| Question | Decision | Why |
| --- | --- | --- |
| How to age a face | Procedural, in the browser. Reshape the landmark geometry, then re-warp the photos and adjust the texture. | AI age models (diffusion or GAN) need a GPU backend, cost money and upload photos, which breaks the page's privacy promise. A procedural version is honest about being a playful guess. |
| Source face | The current merged result | "Baby of these people" is literally their blend, so weights and "shape from" carry over. |
| Adult stage | The unchanged merge | Gives the slider a neutral anchor point. |
| Slider | 0–400, with five evenly spaced stops; values in between interpolate | Smooth growing-up animation while dragging. |

## Age model

Five keyframes (baby, toddler, teen, adult, grandparent). Each holds geometry and texture parameters, and values between keyframes are linearly interpolated.

**Geometry** is applied to the target landmarks. Frame points stay fixed, and the existing triangle warp moves the pixels.

- Lower face: shorter for kids. Points below the eye line move toward it (baby ×0.72).
- Jaw: narrower toward the chin for kids, slightly wider for old age.
- Eyes, nose and mouth: local scaling with a Gaussian falloff, so the surrounding skin bends smoothly.
  - eyes bigger for kids (baby ×1.22) and slightly smaller for old age
  - nose smaller for kids (×0.7) and longer for old age
  - mouth smaller for kids; lips thinner for old age (vertical ×0.72)
- Forehead: taller for kids.
- Old age only: jowls (jaw line sags and widens away from the chin) and lowered brows.

**Texture** works in all browsers. Canvas `filter` isn't available in older Safari, so blur is done by downscaling then upscaling, and tints use blend modes.

- Kids:
  - smoother skin: a blurred layer is blended over the face, leaving eyes, nose and mouth sharp
  - a warm, pinker tone (soft-light)
- Grandparent:
  - procedural wrinkles drawn from landmark positions: forehead lines, crow's feet, under-eye bags, nasolabial folds and marionette lines, each as a multiply stroke plus a light highlight
  - less saturated skin
  - gray hair: everything outside the face oval is desaturated and lightened

## Risks

- It's stylized, not a real prediction, and the copy says so.
- The geometry changes assume a roughly frontal merge, which alignment already pushes toward.
- With "fade background" off, kid proportions can look odd because the hair and head outline don't shrink. Keeping the fade on hides it.

---

# Update: seamless merging

## Kinks seen in testing

1. **Lighting and color mismatch.** A face lit from one side, or shot against a white wall, leaves blotchy patches and color halos in the blend.
2. **Hair and background ghosting.** Outside the face, only 16 fixed frame points line up between photos. Hair, ears and neck from different photos land in different places and show through as faint outlines.
3. **Softness.** Averaging N slightly misaligned photos blurs fine detail. It gets worse as more faces are added.
4. **Pose and expression.** A turned head or an open mouth can't be fixed by a 2D warp, and it ghosts.
5. **Small faces.** A face that is only a few dozen pixels wide in its photo gets upscaled and turns mushy.

## Fixes

| Kink | Fix |
| --- | --- |
| 1 | **Lighting match** (on by default, under "seamless blend"). Each warped face is split into low frequencies (a 1/16-scale blur) and detail. Its low frequencies are replaced with the weighted average of everyone's: `faceᵢ × avgLow / lowᵢ`, with the ratio clamped to [0.4, 2.5]. Every face then shares the same shading and color, so only detail differs and the blend has no blotches. A single face at 100% weight is unchanged. |
| 2 | **Outer ring points.** The 36 face-outline points are copied outward from the face center (×1.35, kept inside the frame). This gives hair, ears and neck rough correspondence, so they warp together instead of sliding. |
| 3 | **Light sharpening.** After blending: `result + 0.35 × (result − blur3×3)`. Also under "seamless blend". |
| 4, 5 | **Per-photo warnings on the card** (soft, not errors): "head turned" (nose offset > 0.22 × eye distance), "mouth open" (lip gap > 0.12 × eye distance) and "small face" (eye distance < 45 px in the source). Users can lower that face's weight or swap the photo. |

## Testing data

MediaPipe's landmark model is pre-trained, so the page doesn't train anything. Public face sets are useful as fixed test inputs, to check lighting, pose and age variety without relying on the user's own photos. Candidates and their licenses are in the testing section of the plan doc. Test photos stay in the git-ignored `.face-test/`, never in the repo.

## Test results: Face Research Lab London Set

Downloaded the CC BY 4.0 London Set (front neutral, front smiling and left 3/4 views) into the git-ignored `.face-test/frll/`. Nothing from it is committed or published.

- **Detection:**
  - front neutral: 102/102, no warnings
  - left 3/4: 102/102, all flagged "head turned"
  - front smiling: 102/102, 33 flagged "mouth open" (teeth)
- **Head turn:** measured as nose offset ÷ eye distance. Front-facing photos measured ≤ 0.05 and 3/4 views ≥ 0.42.
  - **Kink found:** merging a 3/4 view with front views tears the triangles (folded triangles, shards along the nose and jaw).
  - **Fix:** faces turned more than 0.35 start at weight 0, and the card says "left out — raise its weight to include".
- **Aging:**
  - **Kink found:** the grandparent gray-hair mask grayed the top of the forehead. MediaPipe's top outline point (10) sits mid-forehead, not at the hairline. **Fix:** the protected skin ellipse now extends about 15% higher.
  - **Kink found:** babies kept dark adult brows and stubble. **Fix:** brows are no longer protected from the skin smoothing, and the eye and mouth protection is smaller.
- **Seamless blend:** in studio-lit photos the gain is small (slightly sharper). On mixed real-world photos it removes background color halos and patchy lighting.
- **Speed:** 10 faces take about 210 ms to redraw both canvases at 512 px.
