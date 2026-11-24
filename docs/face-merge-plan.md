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
