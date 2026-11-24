# Face Merge — Implementation Plan

See `face-merge-design.md` for the design.

1. **Page skeleton.** Create `projects/face-merge.html`, matching the existing project pages. It needs the theme bootstrap, a back link to `../#projects`, the title, the privacy line, two upload slots, the result canvas and the controls. All JS goes in an inline `<script type="module">`.
2. **Imports (CDN, pinned).**
   - `@mediapipe/tasks-vision@0.10.14` (FilesetResolver, FaceLandmarker) from jsDelivr
   - `delaunator@5` from esm.sh/jsDelivr
   - `heic2any`, lazy-loaded only for `.heic`/`.heif` files
3. **Model loading.** Start `FaceLandmarker.createFromOptions` on page load (GPU delegate, with a CPU fallback), `numFaces: 4`, `runningMode: IMAGE`. Show its status.
4. **Image intake.** Accept file input, drop and paste for each slot. Decode with `createImageBitmap`, using the HEIC path when needed. Downscale to a 1024 px max edge. Add a debug `?a=&b=` loader for testing.
5. **Detection.** Pick the largest face and convert to pixel points. Draw the thumbnail with landmark dots, and set per-slot status or errors.
6. **Alignment.** Compute eye centers from iris/eye-corner landmarks and a similarity transform to fixed eye positions in a 512×512 frame. Transform all points and keep the transform so the warp samples the original image.
7. **Point set.** 478 landmarks plus 8 frame-border points, giving one-to-one correspondence for A and B.
8. **Render(t, shapeT).**
   - target = lerp(A, B, shapeT)
   - triangulate (cached per target set, recomputed only when it changes; the topology from the 50% geometry is stable enough to reuse)
   - warp A and B into two offscreen canvases with per-triangle affine transforms
   - composite with alpha t
   - feather mask
   - optional mesh overlay
9. **Controls.** Blend slider, shape slider with a link toggle, mesh toggle, swap and download PNG. Rendering is throttled with requestAnimationFrame.
10. **Projects entry.** Add a `project-item` link in `index.html` that matches the existing entries.
11. **Test.** Run a local server, open the page with photos from a git-ignored `.face-test/`, screenshot results at 0 / 50 / 100% and the mesh view, then check the no-face case and the console for errors.

---

# Update plan: up to 10 faces

1. **Markup.**
   - Replace the two fixed slots with a `.face-grid` of cards and a final "add faces" tile (`<input multiple>`), which hides once there are 10 faces.
   - Each card has a thumbnail, a status line, a weight slider and a × button.
2. **Controls.**
   - Remove the blend and shape sliders and the swap button.
   - Add a "shape from" `<select>` (blend / face 1…N) and an "equal weights" button.
   - Keep the mesh, fade background and download controls.
3. **State.**
   - `faces` becomes an array of `{ id, aligned, pts, weight, card }`.
   - Cards that are still detecting show their status but are left out of the merge until they're ready.
   - Removing a card drops it and clears the cached triangulation.
4. **Intake.**
   - `addFiles(files)` takes as many as there's room for (10 minus the current count), creates the cards, and detects faces one by one using the shared landmarker.
   - Cards with no face found stay visible with an error, are excluded from the merge, and can be removed.
5. **Render.**
   - Normalize the weights (all zero falls back to equal), then work out the target points and the triangulation on the mean shape.
   - Warp each face with weight > 0 into a pooled buffer, then do the running-average composite, then feather and mesh.
   - `render(size)` takes 256 while dragging (`input` event) and 512 on `change`.
6. **Download.** Re-render at 512 before exporting.
7. **Debug loader.** `?f=a,b,c` plus the old `?a=&b=`.
8. **Copy.** Update the subtitle and how-it-works text for N faces.
9. **Test.**
   - Load 2, 5 and 10 photos from `.face-test/` and save result images.
   - Check uneven weights, "shape from" a single face, removing a face and the no-face card.
   - Time one 10-face render.
   - Check the mobile layout.

---

# Update plan: baby & aging

1. **Refactor `render`** into three parts:
   - `mergeState()`: ready faces, normalized weights and target points; triangulation is cached
   - `composite(canvas, size, state, target)`: warp every face onto `target` and take the weighted average
   - `render()`: the merged view (feather and mesh), which then calls `renderAge()`
   - `featherFace` takes the context it draws on.
2. **Markup.** A "baby & aging" panel under "merged" with:
   - an age canvas
   - an age slider (0–400) with stage labels and the current stage name
   - a download button and a short honesty note

   The result-canvas CSS gets generalized so both canvases share it.
3. **Age model.**
   - `AGE_KEYS` keyframes and `ageParams(v)` interpolation
   - `faceAnchors(pts)`: eye centers, interocular distance, nose, mouth, chin, brows, face width
   - `ageShape(pts, p)`: local Gaussian scaling plus the global lower-face, jaw, forehead and jowl transforms
4. **Texture passes:**
   - `smoothSkin` (downscale blur, masked away from eyes, nose and mouth)
   - warm soft-light tint
   - skin desaturation
   - `grayHair` (outside-oval mask)
   - `drawWrinkles` (landmark-anchored quadratic strokes)
   - then the feather
5. **Wiring.**
   - The age slider redraws only the age canvas.
   - Weight, shape and fade changes redraw both canvases.
   - Download saves `face-merge-<stage>.png`.
   - Add a `?age=` debug parameter.
6. **Copy.** Add a "5. baby & aging" step to how-it-works.
7. **Test.**
   - With 2 parents and with 10 faces, save strips at all five stages plus two in-between values.
   - Check fade on and off, timing, mobile layout and the console.

---

# Update plan: seamless merging (done)

1. In `alignFace`, add an outer ring of 36 points (the face outline ×1.35 from its center, kept inside the frame) and the soft warnings (head turned, mouth open, small face). Show the warnings on the card.
2. `composite` warps the active faces, then runs either:
   - `blendEven` when "seamless blend" is on: a per-face color gain measured on the central face box, plus a local luma ratio against the group's average low frequencies (1/16-scale blur, clamped to [0.6, 1.7]), or
   - the old alpha running average when it's off.
3. Then `sharpen` (3×3 unsharp mask, amount 0.35) when seamless is on.
4. Add a "seamless blend" checkbox (default on) and a `?seamless=0` debug parameter.
5. Use `willReadFrequently` canvases for pixel readback.

The first version corrected each RGB channel locally. It caused a green tint where a white background met dark hair, so it was replaced with a single color gain per face plus a luma-only local ratio.

Timing is about 40 ms per canvas for 2 faces and about 135 ms per canvas for 10 faces at 512 px. Weight dragging renders at 256 px.

## Testing data

| Set | What | License / terms | Fit |
| --- | --- | --- | --- |
| Face Research Lab London Set (DeBruine & Jones, 2017, figshare 10.6084/m9.figshare.5047666) | 102 adults, front-facing, neutral and smiling, 1350×1350, with age, gender and ethnicity | Reported as CC BY 4.0 (check the figshare license field before use) | Best fit. Consistent, consented photos with a range of ages and ethnicities. |
| Chicago Face Database | ~600 standardized portraits | Research-only. Terms bar file-hosting redistribution and uploading to AI and cloud services. | Avoid. It doesn't fit a public demo page. |
| CelebA / FFHQ | Large web-scraped celebrity / Flickr sets | Non-commercial research terms; photos of people who never opted in | Avoid for a personal site. |

Plan: download the London Set into `.face-test/frll/` (git-ignored) and run a batch script that merges random pairs and tens. It saves contact sheets, so lighting, pose and aging changes can be compared before and after. Nothing from the set gets committed or published.
